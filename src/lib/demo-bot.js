// ─────────────────────────────────────────────────────────────────────
// src/lib/demo-bot.js — Sprint Revenue Engine Phase 4
// ─────────────────────────────────────────────────────────────────────
// Chat in-app pre-sales (Claude) déployé sur landing + /pricing + /produits/*
// Répond aux questions tarif / features / RGPD / démo.
// Anti-abuse : rate limit session (20 msg / 30 min).
// Quotas globaux : 500 messages / day (anti-coût Anthropic).
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from './supabase-admin';
import { enforceQuotaOrThrow } from './autonomy';

const CLAUDE_MODEL = 'claude-sonnet-4-6';
const MAX_MESSAGES_PER_SESSION = 20;
const SESSION_WINDOW_MINUTES = 30;
const MAX_MESSAGE_LENGTH = 1000;

const SYSTEM_PROMPT = `Tu es l'assistant chat pré-vente de Volia.fr, une suite SaaS française de growth B2B.

PRODUITS VOLIA :
- Volia Prospection : génération leads B2B (101 dépts France + 6 provinces Belgique + 6 cantons Suisse) via Google Places + cascade waterfall multi-sources pour trouver les emails
- Volia Campagnes : envoi email automatisé sur les prospects (séquences, A/B testing, warmup peer-to-peer)
- Volia CRM : pipeline drag-drop + suivi deals + activités
- Volia Forms : formulaires no-code multi-step → CRM/Campagnes auto

TARIFS LIVE (pivot freemium) :
- Gratuit : 0€ — TOUTE la suite (Prospection, Campagnes, CRM, Forms) avec limites : 25 crédits Prospection/mois, 100 recherches, 200 cold emails/mois, 1 séquence, 1 pipeline CRM, 2 formulaires, 1 projet, 5 exports CSV/mois. Sans CB.
- Prospection : 19€/mois (ou 190€/an) — 500 crédits/mois (emails trouvés), 500 téléphones/mois, 2 000 recherches, cascade waterfall 7 sources, vérification email 100/mois, exports illimités, API publique + Zapier/Make
- Packs de crédits one-time (disponibles sur tous les plans) : 100 crédits = 9€, 500 = 29€, 2 000 = 79€
- MAX : 179€/mois (ou 1 690€/an) — suite ILLIMITÉE + Volia Autopilot (pipeline B2B end-to-end auto), 2 000 crédits/mois, 10 000 téléphones, 10 000 cold emails/mois + warmup auto, vérification 5 000/mois, enrichissement décideur, équipes multi-utilisateurs, serveur MCP, support prioritaire
- Code promo public MAX99 : 99€/mois les 3 premiers mois de MAX
- Yearly disponible avec ~2 mois offerts
- Essai gratuit : 14 jours de MAX sans CB

GARDE-FOUS STRICTS (NE PAS ENFREINDRE) :
1. NE JAMAIS inventer de feature qui n'existe pas
2. NE JAMAIS promettre de timing roadmap ("disponible dans X jours/sem")
3. NE JAMAIS promettre de discount custom ("je te fais -50%")
4. NE JAMAIS attaquer un concurrent ("Apollo est nul" → interdit). Compare factuellement uniquement (prix, features)
5. NE JAMAIS donner de conseil juridique RGPD ("tu es conforme" → interdit). Toujours rediriger vers /confidentialite et /cgu
6. NE JAMAIS engager Anthony sur quoi que ce soit (pas de "je te garantis", "promis", etc.)
7. Si user pose une question hors Volia → décline poliment + redirige

REDIRECTIONS OBLIGATOIRES :
- Demande de démo / call → "Tu peux réserver 15 min ici : https://cal.com/anthony-volia/15min"
- Demande de devis custom / multi-comptes / API illimitée → "Pour un setup sur-mesure, écris à contact@volia.fr"
- Question RGPD / juridique → "Détails sur volia.fr/confidentialite et volia.fr/cgu, sinon contact@volia.fr"
- Question facturation existante → "Connecte-toi sur volia.fr/settings ou écris à contact@volia.fr"
- Demande de bug / problème technique → "Décris le bug à contact@volia.fr avec une capture"

TON :
- Direct, pragmatique, en français
- Tutoiement par défaut
- 2 à 5 phrases max par réponse (chat = court)
- Pas d'emoji systématique (max 1 par message si vraiment utile)
- Pas de markdown lourd (gras OK, pas de tableaux ni listes longues)

Si tu ne sais pas → "Je ne sais pas. Pose la question à Anthony : contact@volia.fr".`;

/**
 * Détecte (heuristique simple) si une conversation contient une demande de démo.
 */
function detectDemoRequest(messages) {
  const text = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content || '')
    .join(' ')
    .toLowerCase();
  return /\b(d[ée]mo|appel|rdv|rendez-?vous|call|cal\.com|visio|t[ée]l[ée]phone|booker?)\b/.test(text);
}

/**
 * Extrait email si présent dans les messages user.
 */
function extractEmail(messages) {
  const text = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content || '')
    .join(' ');
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase() : null;
}

/**
 * Hash IP pour rate limit sans stocker l'IP en clair (RGPD-friendly).
 */
async function hashIp(ip) {
  if (!ip) return null;
  const encoder = new TextEncoder();
  const data = encoder.encode(`${ip}:volia-demo-bot`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

/**
 * Récupère ou crée la conversation pour un session_id donné.
 * Vérifie aussi le rate limit (20 msg / 30 min).
 */
async function getOrCreateConversation({ sessionId, pageUrl, userAgent, ipHash, userId }) {
  const supabase = getSupabaseAdmin();
  const cutoffDate = new Date(Date.now() - SESSION_WINDOW_MINUTES * 60 * 1000).toISOString();

  // Récupère la conv existante si dans la fenêtre temporelle
  const { data: existing } = await supabase
    .from('demo_bot_conversations')
    .select('id, messages, message_count, last_message_at')
    .eq('session_id', sessionId)
    .gt('last_message_at', cutoffDate)
    .maybeSingle();

  if (existing) {
    if (existing.message_count >= MAX_MESSAGES_PER_SESSION) {
      return { ok: false, error: 'rate_limit', detail: `Max ${MAX_MESSAGES_PER_SESSION} messages / 30 min` };
    }
    return { ok: true, conversation: existing };
  }

  // Nouvelle conv
  const { data: created, error } = await supabase
    .from('demo_bot_conversations')
    .insert({
      session_id: sessionId,
      page_url: pageUrl,
      user_agent: userAgent ? userAgent.slice(0, 200) : null,
      ip_hash: ipHash,
      user_id: userId || null,
      messages: [],
      message_count: 0,
    })
    .select('id, messages, message_count')
    .maybeSingle();

  if (error || !created) {
    return { ok: false, error: 'conversation_create_failed', detail: error?.message };
  }
  return { ok: true, conversation: created };
}

/**
 * Main : appel par /api/demo-bot/chat
 */
export async function sendDemoBotMessage({
  sessionId,
  message,
  pageUrl,
  userAgent,
  ip,
  userId,
}) {
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 8) {
    return { ok: false, error: 'invalid_session_id', status: 400 };
  }
  if (!message || typeof message !== 'string') {
    return { ok: false, error: 'invalid_message', status: 400 };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: 'message_too_long', detail: `Max ${MAX_MESSAGE_LENGTH} chars`, status: 400 };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: 'anthropic_not_configured', status: 500 };
  }

  // Quota global (anti-coût Anthropic)
  try {
    await enforceQuotaOrThrow('demo_bot_message', { perDay: 500 });
  } catch (e) {
    return { ok: false, error: 'global_quota_exceeded', detail: e.message, status: 429 };
  }

  const ipHash = await hashIp(ip);
  const convRes = await getOrCreateConversation({
    sessionId,
    pageUrl,
    userAgent,
    ipHash,
    userId,
  });

  if (!convRes.ok) {
    return { ...convRes, status: convRes.error === 'rate_limit' ? 429 : 500 };
  }

  const conv = convRes.conversation;
  const history = Array.isArray(conv.messages) ? conv.messages : [];

  // Append user message
  const userMsg = { role: 'user', content: message.trim(), at: new Date().toISOString() };
  history.push(userMsg);

  // Call Claude
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let assistantContent = '';
  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });
    assistantContent = response.content[0]?.text || '';
  } catch (err) {
    console.error('[demo-bot] Claude API failed', err);
    return {
      ok: false,
      error: 'claude_api_failed',
      detail: err.message,
      status: 500,
    };
  }

  if (!assistantContent) {
    assistantContent = 'Je ne sais pas répondre à ça. Pose la question à Anthony : contact@volia.fr';
  }

  const assistantMsg = {
    role: 'assistant',
    content: assistantContent,
    at: new Date().toISOString(),
  };
  history.push(assistantMsg);

  // Detect signals
  const hasDemoRequest = detectDemoRequest(history);
  const capturedEmail = extractEmail(history);

  // Update conv
  const supabase = getSupabaseAdmin();
  await supabase
    .from('demo_bot_conversations')
    .update({
      messages: history,
      message_count: history.length,
      last_message_at: new Date().toISOString(),
      has_demo_request: hasDemoRequest,
      has_email_capture: Boolean(capturedEmail),
      captured_email: capturedEmail,
    })
    .eq('id', conv.id);

  return {
    ok: true,
    reply: assistantContent,
    conversation_id: conv.id,
    message_count: history.length,
    status: 200,
  };
}

/**
 * Stats simples pour /admin/demo-bot dashboard.
 */
export async function getDemoBotStats() {
  const supabase = getSupabaseAdmin();
  const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const [{ count: total24h }, { count: total7d }, { count: demoReq7d }, { count: emailsCap7d }] =
    await Promise.all([
      supabase.from('demo_bot_conversations').select('id', { count: 'exact', head: true }).gt('started_at', dayAgo),
      supabase.from('demo_bot_conversations').select('id', { count: 'exact', head: true }).gt('started_at', weekAgo),
      supabase.from('demo_bot_conversations').select('id', { count: 'exact', head: true }).gt('started_at', weekAgo).eq('has_demo_request', true),
      supabase.from('demo_bot_conversations').select('id', { count: 'exact', head: true }).gt('started_at', weekAgo).eq('has_email_capture', true),
    ]);

  return {
    ok: true,
    conversations_24h: total24h || 0,
    conversations_7d: total7d || 0,
    demo_requests_7d: demoReq7d || 0,
    emails_captured_7d: emailsCap7d || 0,
  };
}
