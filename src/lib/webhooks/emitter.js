// ─────────────────────────────────────────────────────────────────────
// Webhooks sortants Volia — emitter helper (Sprint D5).
// ─────────────────────────────────────────────────────────────────────
// Backend helper utilisé par les autres modules Volia (campagnes, CRM,
// prospection, sequences…) pour notifier les subscriptions actives d'un
// user quand un event survient.
//
// Usage typique côté code applicatif :
//
//   import { emitWebhookEvent } from '@/lib/webhooks/emitter';
//   await emitWebhookEvent({
//     userId,
//     event: 'prospect.created',
//     data: { id: prospect.id, name: prospect.nom, ... },
//   });
//
// L'emitter :
//   1. Va chercher en DB toutes les subscriptions active=true du user qui
//      écoutent cet event (matching exact OU wildcard "*").
//   2. Pour chaque sub : signe le payload HMAC-SHA256, POST vers target_url
//      avec timeout (10s), log le résultat dans webhook_deliveries.
//   3. N'arrête JAMAIS le flux principal en cas d'erreur (fire-and-forget
//      avec await sur Promise.allSettled). Les échecs sont visibles dans
//      le tab "Logs" de /settings/webhooks pour replay manuel.
//
// Sécurité :
//   - Validation SSRF via validateUrl() (re-vérification au moment de
//     l'envoi, en plus du POST initial).
//   - Timeout 10s pour éviter de bloquer le worker sur un target down.
//   - Le secret n'est jamais loggé (ni dans response_body ni dans error).
//   - Le payload est stringify une seule fois pour garantir que la
//     signature porte sur exactement les bytes envoyés.

import crypto from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateUrl } from '@/lib/url-validation';
import { WEBHOOK_EVENTS as WEBHOOK_EVENTS_CATALOG } from './events';

// Re-export pour compat des imports server (catalogue centralisé dans events.js).
export const WEBHOOK_EVENTS = WEBHOOK_EVENTS_CATALOG;

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BODY_BYTES = 8_000; // tronque pour ne pas pourrir la DB

// Génère un secret de webhook (auto-generated par défaut côté UI).
// Format : whsec_<32 bytes hex> = 71 chars total — préfixe explicite type Stripe.
export function generateWebhookSecret() {
  return 'whsec_' + crypto.randomBytes(32).toString('hex');
}

// Calcule la signature HMAC-SHA256(timestamp.body) base64.
// Format envoyé dans le header X-Volia-Signature : "t=<unix>,v1=<sig>"
// Inspiré de Stripe (https://stripe.com/docs/webhooks/signatures).
export function signWebhookPayload({ secret, body, timestamp }) {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${body}`;
  const sig = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return { timestamp: ts, header: `t=${ts},v1=${sig}`, signature: sig };
}

/**
 * Envoie UN payload à UN target_url et log la delivery.
 * Helper bas niveau utilisé à la fois par l'emitter normal et par les
 * routes test/replay.
 *
 * @param {object} args
 * @param {string|null} args.subscriptionId - null si test "ad-hoc" sans sub
 * @param {string} args.userId
 * @param {string} args.eventType
 * @param {string} args.targetUrl
 * @param {string} args.secret
 * @param {object} args.payload - sera stringify une seule fois
 * @param {number} [args.attempt=1] - >1 = replay
 * @param {number} [args.timeoutMs=10000]
 * @returns {Promise<{success, status, durationMs, deliveryId, error}>}
 */
export async function sendWebhookOnce({
  subscriptionId,
  userId,
  eventType,
  targetUrl,
  secret,
  payload,
  attempt = 1,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  const admin = getSupabaseAdmin();

  // SSRF guard — n'envoyer qu'à des URLs publiques https.
  const urlCheck = validateUrl(targetUrl);
  if (!urlCheck.valid) {
    const errMsg = `URL invalide : ${urlCheck.error}`;
    const { data: row } = await admin
      .from('webhook_deliveries')
      .insert({
        subscription_id: subscriptionId,
        user_id: userId,
        event_type: eventType,
        target_url: targetUrl,
        payload,
        success: false,
        attempt,
        error_message: errMsg,
        duration_ms: 0,
      })
      .select('id')
      .single();
    return { success: false, status: null, durationMs: 0, deliveryId: row?.id, error: errMsg };
  }

  const body = JSON.stringify(payload);
  const { header: signatureHeader, timestamp } = signWebhookPayload({ secret, body });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();

  let responseStatus = null;
  let responseBody = '';
  let success = false;
  let errorMessage = null;

  try {
    const res = await fetch(urlCheck.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Volia-Webhooks/1.0',
        'X-Volia-Event': eventType,
        'X-Volia-Signature': signatureHeader,
        'X-Volia-Timestamp': String(timestamp),
        'X-Volia-Delivery': crypto.randomUUID(),
      },
      body,
      signal: controller.signal,
      redirect: 'manual', // pas de suivi de redirect (anti-SSRF supplémentaire)
    });
    responseStatus = res.status;

    // Lecture stream tronquée pour ne pas exploser la mémoire si l'endpoint
    // retourne 50MB. On lit tout puis on slice.
    const raw = await res.text().catch(() => '');
    responseBody = raw.slice(0, MAX_RESPONSE_BODY_BYTES);
    success = res.ok; // 2xx = succès
  } catch (err) {
    if (err.name === 'AbortError') {
      errorMessage = `Timeout (${timeoutMs}ms dépassé)`;
    } else {
      errorMessage = err.message || 'Erreur réseau';
    }
  } finally {
    clearTimeout(timeoutId);
  }

  const durationMs = Date.now() - start;

  // Log delivery + update subscription stats (best-effort).
  const { data: delivery } = await admin
    .from('webhook_deliveries')
    .insert({
      subscription_id: subscriptionId,
      user_id: userId,
      event_type: eventType,
      target_url: targetUrl,
      payload,
      response_status: responseStatus,
      response_body: responseBody || null,
      duration_ms: durationMs,
      attempt,
      success,
      error_message: errorMessage,
    })
    .select('id')
    .single();

  // Update last_triggered_at + success_rate (calcul sur 50 dernières).
  if (subscriptionId) {
    refreshSubscriptionStats({ subscriptionId }).catch((e) =>
      console.warn('[webhooks] refresh stats failed', e?.message)
    );
  }

  return {
    success,
    status: responseStatus,
    durationMs,
    deliveryId: delivery?.id,
    error: errorMessage,
  };
}

/**
 * Met à jour last_triggered_at + success_rate (% sur 50 dernières) d'une sub.
 * Appelé en arrière-plan après chaque delivery — non bloquant.
 */
export async function refreshSubscriptionStats({ subscriptionId }) {
  if (!subscriptionId) return;
  const admin = getSupabaseAdmin();
  const { data: rows } = await admin
    .from('webhook_deliveries')
    .select('success, attempted_at')
    .eq('subscription_id', subscriptionId)
    .order('attempted_at', { ascending: false })
    .limit(50);

  const list = rows || [];
  if (list.length === 0) return;

  const successes = list.filter((r) => r.success).length;
  const rate = Math.round((successes / list.length) * 1000) / 10; // 1 décimale
  const lastAt = list[0].attempted_at;

  await admin
    .from('webhook_subscriptions')
    .update({ last_triggered_at: lastAt, success_rate: rate, updated_at: new Date().toISOString() })
    .eq('id', subscriptionId);
}

/**
 * Vérifie qu'une subscription écoute un event donné.
 * Supporte le wildcard "*" (= tous les events) et le wildcard préfixe
 * type "prospect.*" (= tous les events du domaine prospect).
 */
export function subscriptionMatchesEvent(events, eventType) {
  if (!Array.isArray(events) || events.length === 0) return false;
  for (const e of events) {
    if (e === '*' || e === eventType) return true;
    if (e.endsWith('.*')) {
      const prefix = e.slice(0, -2);
      if (eventType.startsWith(prefix + '.')) return true;
    }
  }
  return false;
}

/**
 * Émetteur principal : déclenche un event pour un user.
 * Cherche toutes les subs actives matchant l'event et envoie en parallèle.
 *
 * @param {object} args
 * @param {string} args.userId
 * @param {string} args.event - ex 'prospect.created', 'campaign.sent'
 * @param {object} args.data  - payload arbitraire, sera embedé dans le wrapper
 * @returns {Promise<{matched: number, results: Array}>}
 */
export async function emitWebhookEvent({ userId, event, data }) {
  if (!userId || !event) return { matched: 0, results: [] };

  const admin = getSupabaseAdmin();
  const { data: subs, error } = await admin
    .from('webhook_subscriptions')
    .select('id, target_url, events, secret')
    .eq('user_id', userId)
    .eq('active', true);

  if (error) {
    console.error('[webhooks] emit fetch subs error', error.message);
    return { matched: 0, results: [] };
  }

  const matching = (subs || []).filter((s) => subscriptionMatchesEvent(s.events, event));
  if (matching.length === 0) return { matched: 0, results: [] };

  const payload = {
    event_type: event,
    timestamp: new Date().toISOString(),
    data,
  };

  const results = await Promise.allSettled(
    matching.map((sub) =>
      sendWebhookOnce({
        subscriptionId: sub.id,
        userId,
        eventType: event,
        targetUrl: sub.target_url,
        secret: sub.secret,
        payload,
      })
    )
  );

  return { matched: matching.length, results };
}

// Catalogue d'events disponible via './events' (client-safe) — réexporté en
// tête de fichier pour les usages server.
