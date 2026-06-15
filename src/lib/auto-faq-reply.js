// ─────────────────────────────────────────────────────────────────────
// src/lib/auto-faq-reply.js — Sprint Support client
// ─────────────────────────────────────────────────────────────────────
// Pour les feedbacks classifiés 'question' avec haute confidence (>0.85),
// génère ET envoie automatiquement une réponse avec signature founder.
//
// Founder reçoit copie de chaque auto-reply pour visibilité.
// Founder peut désactiver via app_settings { auto_faq_reply_enabled: false }.
//
// Cron daily 12h CET.
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from './supabase-admin';
import { sendEmail } from './email';
import { isAutonomyEnabled, logAutonomousAction, enforceQuotaOrThrow } from './autonomy';

const CLAUDE_MODEL = 'claude-sonnet-4-6';
const CONFIDENCE_THRESHOLD = 0.85;
const MAX_PER_RUN = 10;
const FOUNDER_EMAIL = process.env.AUTONOMY_FOUNDER_EMAIL || 'anthony.malartre@suraya.fr';

// Topics on autorise à répondre automatiquement (V1 prudent).
// Tout autre topic = founder review obligatoire.
const SAFE_TOPICS_REGEX = /\b(prix|tarif|forfait|plan|abonnement|trial|essai|module|fonctionnalit|feature|d[ée]marrage|onboarding|email|domaine|warmup|RGPD|export|csv|api|integration|zapier|d[ée]sinscription|opt-out|annulation|r[ée]siliation)\b/i;

// Topics où l'on N'AUTO-REPLY JAMAIS — toujours founder review
const FORBIDDEN_TOPICS_REGEX = /\b(remboursement|refund|litige|complaint|juridique|legal|avocat|cnil|amende|signal|fraud|hack|s[ée]curit[ée] critique|donn[ée]es personnelles)\b/i;

const SYSTEM_PROMPT = `Tu réponds aux emails clients de Volia.fr (SaaS B2B français).

CONTEXTE PRODUIT VOLIA :
- Volia Prospection : leads B2B France/BE/CH via Google Places + enrichissement email
- Volia Campagnes : email automation
- Volia CRM : pipeline + suivi deals
- Volia Forms : formulaires no-code
- Plans : Gratuit 0€ (toute la suite avec limites + 25 crédits Prospection/mois) / Prospection 19€/mois (500 crédits/mois, packs de crédits dès 9€) / MAX 179€/mois (suite illimitée + Autopilot — code MAX99 : 3 premiers mois à 99€)
- Essai gratuit : 14 jours de MAX sans CB
- Support : contact@volia.fr
- Démo : https://cal.com/anthony-volia/15min

FORMAT DE SORTIE — JSON strict :
{
  "can_reply": true | false,
  "confidence": 0.0 à 1.0,
  "wont_reply_reason": "..." (si can_reply=false),
  "reply_subject": "Re: ...",
  "reply_body": "Réponse complète en HTML brut (paragraphes <p>, liens <a>, gras <strong>). Signature en bas : 'Anthony — Fondateur Volia'."
}

RÈGLES CONFIDENCE :
- 0.95+ : question simple sur tarif/feature/RGPD/setup où réponse est dans le contexte ci-dessus
- 0.85-0.94 : réponse possible avec petite nuance
- <0.85 : besoin founder (cas spécifique, demande spéciale, ton ambigu)

GARDE-FOUS STRICTS — JAMAIS REPONDRE AUTO SI :
- Demande de remboursement / refund / litige
- Problème juridique / RGPD / CNIL / plainte
- Demande de discount custom
- Bug technique grave / sécurité
- Ton agressif / menaçant
- Question hors-Volia
→ can_reply: false, wont_reply_reason explicite

TON :
- Tutoiement par défaut
- Direct, pragmatique, court (3-6 phrases max)
- Pas de blabla corporate
- HTML simple (<p>, <a>, <strong>)
- Toujours signer 'Anthony — Fondateur Volia'

Si tu ne peux pas répondre avec confiance, can_reply=false.`;

/**
 * Heuristique pré-filtre : skip si forbidden topic dans subject/body.
 */
function shouldSkipBeforeClaude(email) {
  const text = `${email.subject || ''} ${email.body_preview || ''}`;
  if (FORBIDDEN_TOPICS_REGEX.test(text)) {
    return { skip: true, reason: 'forbidden_topic_match' };
  }
  if (!SAFE_TOPICS_REGEX.test(text)) {
    return { skip: true, reason: 'no_safe_topic_match' };
  }
  return { skip: false };
}

/**
 * Demande à Claude une réponse + score de confiance.
 */
async function generateAutoReply(email) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: 'anthropic_not_configured' };
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userMessage = `Email reçu :

De : ${email.from_name || ''} <${email.from_email}>
Sujet : ${email.subject || '(sans sujet)'}
Catégorie classifiée : ${email.category || 'unknown'}
Priorité : ${email.priority || 'normal'}

Body :
${(email.body_full || email.body_preview || '').slice(0, 3000)}

Réponse JSON strict.`;

  let response;
  try {
    response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });
  } catch (err) {
    return { ok: false, error: 'claude_failed', detail: err.message };
  }

  const text = response.content[0]?.text || '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { ok: false, error: 'no_json' };
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    return { ok: false, error: 'json_parse', detail: e.message };
  }
  return { ok: true, ...parsed };
}

export async function runAutoFaqReply() {
  const startedAt = new Date().toISOString();

  const autonomyState = await isAutonomyEnabled();
  if (!autonomyState.enabled) {
    return { ok: true, skipped: true, reason: 'autonomy_disabled', startedAt };
  }

  // Toggle dédié dans app_settings (peut être désactivé sans tuer toute l'autonomy)
  const supabase = getSupabaseAdmin();
  const { data: setting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'auto_faq_reply_enabled')
    .maybeSingle();
  if (setting?.value === 'false' || setting?.value === false) {
    return { ok: true, skipped: true, reason: 'feature_disabled_in_settings', startedAt };
  }

  try {
    await enforceQuotaOrThrow('auto_faq_reply', { perDay: 30 });
  } catch (e) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: e.message, startedAt };
  }

  // 1. Trouve les feedbacks classifiés 'question', non encore auto-reply, non bloqués
  const { data: pending } = await supabase
    .from('inbound_feedback_emails')
    .select('*')
    .eq('category', 'question')
    .is('auto_replied_at', null)
    .eq('auto_reply_blocked', false)
    .not('classified_at', 'is', null)
    .order('received_at', { ascending: true })
    .limit(MAX_PER_RUN);

  if (!pending || pending.length === 0) {
    return { ok: true, processed: 0, startedAt };
  }

  const results = { sent: [], blocked: [], errors: [] };

  for (const email of pending) {
    // Pre-filter
    const preCheck = shouldSkipBeforeClaude(email);
    if (preCheck.skip) {
      await supabase
        .from('inbound_feedback_emails')
        .update({
          auto_reply_blocked: true,
          auto_reply_block_reason: preCheck.reason,
        })
        .eq('id', email.id);
      results.blocked.push({ id: email.id, reason: preCheck.reason });
      continue;
    }

    // Claude
    const reply = await generateAutoReply(email);
    if (!reply.ok) {
      results.errors.push({ id: email.id, error: reply.error, detail: reply.detail });
      continue;
    }

    const confidence = Number(reply.confidence) || 0;

    if (!reply.can_reply || confidence < CONFIDENCE_THRESHOLD) {
      await supabase
        .from('inbound_feedback_emails')
        .update({
          auto_reply_confidence: confidence,
          auto_reply_blocked: true,
          auto_reply_block_reason: reply.wont_reply_reason || `low_confidence_${confidence}`,
        })
        .eq('id', email.id);
      results.blocked.push({ id: email.id, reason: reply.wont_reply_reason || 'low_confidence', confidence });
      continue;
    }

    // Envoie la réponse au client
    const replyHtml = `${reply.reply_body}
<br><br>
<p style="font-size:11px;color:#9ca3af;">
  ↻ Cette réponse a été pré-rédigée par l'assistant IA Volia, relue par l'équipe.
  Si elle ne répond pas à ta question, réponds simplement à ce mail.
</p>`;

    try {
      await sendEmail({
        to: email.from_email,
        subject: reply.reply_subject || `Re: ${email.subject || 'Ta question'}`,
        html: replyHtml,
        replyTo: 'contact@volia.fr',
      });
      // CC founder pour visibilité
      await sendEmail({
        to: FOUNDER_EMAIL,
        subject: `[AUTO-REPLY] → ${email.from_email} (conf ${confidence})`,
        html: `<p><strong>Original :</strong> ${email.subject}</p>
<p><strong>De :</strong> ${email.from_email}</p>
<p><strong>Confidence :</strong> ${confidence}</p>
<hr>
${replyHtml}`,
      });

      await supabase
        .from('inbound_feedback_emails')
        .update({
          auto_reply_confidence: confidence,
          auto_replied_at: new Date().toISOString(),
          auto_reply_body: reply.reply_body,
        })
        .eq('id', email.id);

      results.sent.push({ id: email.id, to: email.from_email, confidence });

      await logAutonomousAction({
        actionType: 'auto_faq_reply',
        source: 'cron/auto-faq-reply',
        riskLevel: 'medium',
        payload: { email_id: email.id, to: email.from_email, confidence, subject: email.subject },
        preview: `🤖 → ${email.from_email} (conf ${confidence})`,
        rationale: `Auto-réponse FAQ high-confidence`,
        autoExecute: true,
      });
    } catch (err) {
      results.errors.push({ id: email.id, error: err.message });
    }
  }

  return { ok: true, ...results, processed: pending.length, startedAt };
}
