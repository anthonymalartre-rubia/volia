// src/lib/email.js
// Lightweight email utility using Resend REST API (no SDK dependency)
import { cleanEnv } from './envClean';

// From address par défaut. Configurable via env var pour les déploiements
// preview / staging qui utilisent un autre sender domain Resend.
const DEFAULT_FROM = 'Prospectia <hello@prospectia.cloud>';
const FALLBACK_FROM = 'Prospectia <onboarding@resend.dev>';

/**
 * Send a transactional email via Resend API.
 *
 * Comportement avec fallback automatique :
 *   1. Tentative depuis le domaine custom (hello@prospectia.cloud)
 *   2. Si Resend refuse avec "domain not verified" ou "validation_error" ou 403,
 *      retentative depuis onboarding@resend.dev (sandbox Resend qui marche
 *      toujours, mais limité à l'email du compte Resend en mode dev).
 *
 * @param {{ to, subject, html, replyTo? }} options
 * @returns {Promise<{ success, id?, error?, fromUsed?, fallbackUsed?, status? }>}
 */
export async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = cleanEnv(process.env.RESEND_API_KEY);
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not configured — skipping email');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const isTestKey = apiKey.startsWith('re_test_');
  const customFrom = cleanEnv(process.env.RESEND_FROM_ADDRESS);
  const primaryFrom = isTestKey ? FALLBACK_FROM : (customFrom || DEFAULT_FROM);

  // Try 1 : sender custom
  const firstAttempt = await callResend({ apiKey, from: primaryFrom, to, subject, html, replyTo });
  if (firstAttempt.success) {
    return { ...firstAttempt, fromUsed: primaryFrom, fallbackUsed: false };
  }

  // Si on était déjà sur le sandbox, pas de fallback possible
  if (primaryFrom === FALLBACK_FROM) {
    return { ...firstAttempt, fromUsed: primaryFrom, fallbackUsed: false };
  }

  // Cas qui méritent un fallback : domain non vérifié, validation, 403
  const errMsg = (firstAttempt.error || '').toLowerCase();
  const shouldFallback =
    errMsg.includes('domain') ||
    errMsg.includes('verify') ||
    errMsg.includes('not allowed') ||
    errMsg.includes('validation') ||
    firstAttempt.status === 403;

  if (!shouldFallback) {
    return { ...firstAttempt, fromUsed: primaryFrom, fallbackUsed: false };
  }

  console.warn(`[email] Primary sender ${primaryFrom} refused (${firstAttempt.error}). Retrying with ${FALLBACK_FROM}...`);
  const fallbackAttempt = await callResend({ apiKey, from: FALLBACK_FROM, to, subject, html, replyTo });

  if (fallbackAttempt.success) {
    return { ...fallbackAttempt, fromUsed: FALLBACK_FROM, fallbackUsed: true };
  }
  return { ...fallbackAttempt, fromUsed: FALLBACK_FROM, fallbackUsed: true };
}

async function callResend({ apiKey, from, to, subject, html, replyTo }) {
  try {
    const body = { from, to: [to], subject, html };
    if (replyTo) body.reply_to = replyTo;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || data.name || `HTTP ${res.status}`;
      console.error(`[email] Resend error (status ${res.status}, from ${from}):`, data);
      return { success: false, error: errorMsg, status: res.status };
    }

    console.log(`[email] Sent "${subject}" to ${to} via ${from} (id: ${data.id})`);
    return { success: true, id: data.id };
  } catch (err) {
    console.error('[email] Network/fetch error:', err);
    return { success: false, error: err.message || 'Network error' };
  }
}
