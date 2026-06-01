// ─────────────────────────────────────────────────────────────────────
// src/lib/support-bot.js — Bot onboarding/support in-app authentifié
// ─────────────────────────────────────────────────────────────────────
// Différent du demo-bot (pre-sales sur landing) :
//   - User authentifié (user_id obligatoire)
//   - Context user pré-chargé (plan, trial, dernière action, score)
//   - System prompt orienté HELP (pas vente)
//   - Stocké dans demo_bot_conversations avec user_id NOT NULL
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from './supabase-admin';
import { enforceQuotaOrThrow } from './autonomy';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const MAX_MESSAGES_PER_SESSION = 30;
const SESSION_WINDOW_MINUTES = 60;
const MAX_MESSAGE_LENGTH = 1500;

const SYSTEM_PROMPT_TEMPLATE = `Tu es l'assistant support in-app de Volia.fr — pour les utilisateurs DÉJÀ inscrits.

Ton rôle : aider l'utilisateur connecté à utiliser Volia. Pas de vente. Pas de discount. Pas de pitch.

CONTEXTE USER (chargé en live) :
- Plan : {{plan}}
- Trial : {{trial_status}}
- Account créé : {{account_age}}
- Lead score : {{lead_score}}
- Dernière activité : {{last_activity}}

MODULES VOLIA :
- Prospection (Google Places + enrichissement waterfall, 101 départements FR + BE + CH)
- Campagnes (email automation, séquences, A/B testing, warmup)
- CRM (pipeline drag-drop, deals, activités, custom fields)
- Forms (formulaires no-code multi-step → CRM/Campagnes)

LIMITES DES PLANS :
- Starter : 100 prospects, 1 module
- Solo : 1 000 prospects
- Pro : 1 200 enrichissements + 1 module (Prospection OU Campagnes OU CRM OU Forms)
- Business : SEUL plan qui débloque les 4 modules + multi-utilisateurs

NAVIGATION VOLIA :
- /dashboard : home + recherche prospection
- /app/crm : pipeline CRM kanban
- /app/campagnes : créer/lancer campagnes email
- /app/forms : builder formulaires
- /admin/prospection : listes prospects
- /settings : profil, abonnement, billing
- /parrainage : programme parrainage (3 mois gratuit)

GARDE-FOUS :
- Si le user demande un truc qui nécessite upgrade de plan, dis-le clairement (avec la diff de prix)
- Si bug technique : "Décris dans le détail à contact@volia.fr avec capture si possible"
- Si question facturation spécifique : "Détails dans /settings/billing ou contact@volia.fr"
- Si demande de feature qui n'existe pas : "Pas encore disponible. Tu peux suggérer à contact@volia.fr"
- JAMAIS inventer une feature, JAMAIS promettre roadmap
- Toujours pragmatique, court (2-5 phrases max), tutoiement

Si tu ne sais pas répondre : "Je ne sais pas, écris à contact@volia.fr".`;

async function getUserContext(supabase, userId) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan, trial_started_at, trial_ends_at, trial_plan, trial_converted_at, lead_score, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (!profile) return null;

  const now = new Date();
  const trialActive = profile.trial_ends_at && new Date(profile.trial_ends_at) > now;
  const trialStatus = profile.trial_converted_at
    ? 'converti payant'
    : trialActive
      ? `trial actif (fin ${new Date(profile.trial_ends_at).toLocaleDateString('fr-FR')})`
      : 'pas de trial actif';

  const accountAgeDays = profile.created_at
    ? Math.floor((now - new Date(profile.created_at)) / 86400000)
    : null;

  return {
    plan: profile.plan || 'free',
    trial_status: trialStatus,
    account_age: accountAgeDays !== null ? `${accountAgeDays}j` : 'inconnu',
    lead_score: profile.lead_score || 0,
    last_activity: 'données live indisponibles', // V1, on pourrait croiser usage_tracking
  };
}

function fillTemplate(template, context) {
  let out = template;
  for (const [k, v] of Object.entries(context || {})) {
    out = out.replaceAll(`{{${k}}}`, String(v));
  }
  return out;
}

async function getOrCreateConversation({ supabase, sessionId, userId, pageUrl }) {
  const cutoff = new Date(Date.now() - SESSION_WINDOW_MINUTES * 60 * 1000).toISOString();

  const { data: existing } = await supabase
    .from('demo_bot_conversations')
    .select('id, messages, message_count')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .gt('last_message_at', cutoff)
    .maybeSingle();

  if (existing) {
    if (existing.message_count >= MAX_MESSAGES_PER_SESSION) {
      return { ok: false, error: 'rate_limit' };
    }
    return { ok: true, conversation: existing };
  }

  const { data: created, error } = await supabase
    .from('demo_bot_conversations')
    .insert({
      session_id: sessionId,
      user_id: userId,
      page_url: pageUrl,
      messages: [],
      message_count: 0,
    })
    .select('id, messages, message_count')
    .maybeSingle();

  if (error || !created) return { ok: false, error: 'create_failed', detail: error?.message };
  return { ok: true, conversation: created };
}

export async function sendSupportBotMessage({ sessionId, message, pageUrl, userId }) {
  if (!userId) return { ok: false, error: 'unauthenticated', status: 401 };
  if (!sessionId || sessionId.length < 8) return { ok: false, error: 'invalid_session', status: 400 };
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: 'invalid_message', status: 400 };
  }
  if (!process.env.ANTHROPIC_API_KEY) return { ok: false, error: 'anthropic_not_configured', status: 500 };

  try {
    await enforceQuotaOrThrow('support_bot_message', { perDay: 1000 });
  } catch (e) {
    return { ok: false, error: 'global_quota_exceeded', status: 429 };
  }

  const supabase = getSupabaseAdmin();
  const convRes = await getOrCreateConversation({ supabase, sessionId, userId, pageUrl });
  if (!convRes.ok) {
    return { ok: false, error: convRes.error, status: convRes.error === 'rate_limit' ? 429 : 500 };
  }
  const conv = convRes.conversation;
  const history = Array.isArray(conv.messages) ? conv.messages : [];

  // Append user message
  history.push({ role: 'user', content: message.trim(), at: new Date().toISOString() });

  // Build system prompt with user context
  const userContext = await getUserContext(supabase, userId);
  const systemPrompt = fillTemplate(SYSTEM_PROMPT_TEMPLATE, userContext || {
    plan: 'inconnu', trial_status: 'inconnu', account_age: 'inconnu',
    lead_score: 'N/A', last_activity: 'N/A',
  });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let replyText = '';
  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 800,
      system: systemPrompt,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });
    replyText = response.content[0]?.text || '';
  } catch (err) {
    console.error('[support-bot] Claude failed', err);
    return { ok: false, error: 'claude_failed', detail: err.message, status: 500 };
  }

  if (!replyText) {
    replyText = "Je ne sais pas répondre. Écris à contact@volia.fr.";
  }

  history.push({ role: 'assistant', content: replyText, at: new Date().toISOString() });

  await supabase
    .from('demo_bot_conversations')
    .update({
      messages: history,
      message_count: history.length,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conv.id);

  return { ok: true, reply: replyText, message_count: history.length, status: 200 };
}
