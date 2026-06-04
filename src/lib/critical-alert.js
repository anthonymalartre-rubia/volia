// ─────────────────────────────────────────────────────────────────────
// src/lib/critical-alert.js — Alerte immédiate sur incident critique
// ─────────────────────────────────────────────────────────────────────
//
// Pourquoi : l'incident signup Denell (06/2026) est resté invisible parce
// qu'on ne l'a appris que par un prospect. Cette helper garantit qu'au
// PROCHAIN échec on est prévenu tout de suite — sans dépendre d'une règle
// d'alerte configurée à la main dans le dashboard Sentry.
//
// Double canal :
//   1. Sentry.captureException — visible dans le dashboard + digest cron
//      (tag `critical=true`, `alert_kind=<kind>`). Permet aussi de créer
//      une vraie alerte Sentry côté dashboard si on veut (cf. README).
//   2. Email immédiat à l'admin (ALERT_EMAIL) via Resend — le canal qui
//      ne dépend d'aucune config externe. C'est lui qui "te prévient".
//
// Anti-spam : throttle en mémoire par `kind` (1 email / 5 min max). Une
// rafale d'échecs (ex: Supabase down) n'envoie pas 200 emails. Le throttle
// est best-effort par instance serverless — suffisant pour le but recherché.
// ─────────────────────────────────────────────────────────────────────

import * as Sentry from '@sentry/nextjs';
import { sendEmail } from '@/lib/email';

const hasSentryDsn = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN);

// Destinataire de l'alerte. Par défaut l'adresse de contact Volia.
const ALERT_TO = process.env.ALERT_EMAIL || 'contact@volia.fr';

// Throttle mémoire { [kind]: lastSentMs }. Best-effort (ephemère serverless).
const _lastAlertAt = new Map();
const THROTTLE_MS = 5 * 60 * 1000;

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Déclenche une alerte critique (Sentry + email immédiat).
 *
 * Conçu pour être appelé sans bloquer le flux : toujours `await alertCritical(...)`
 * dans un try/catch implicite (la fonction n'throw jamais).
 *
 * @param {object} opts
 * @param {string} opts.kind     - identifiant court de l'incident (ex: 'signup_500')
 * @param {string} opts.message  - résumé lisible de ce qui a échoué
 * @param {Error|string} [opts.error] - l'erreur originale (pour Sentry + détail)
 * @param {Record<string, any>} [opts.context] - contexte additionnel (email, route, status…)
 * @returns {Promise<void>}
 */
export async function alertCritical({ kind = 'unknown', message = '', error, context = {} } = {}) {
  // 1. Sentry — toujours (no-op si DSN absent).
  if (hasSentryDsn) {
    try {
      const err = error instanceof Error ? error : new Error(message || String(error || kind));
      Sentry.captureException(err, {
        level: 'error',
        tags: { critical: 'true', alert_kind: kind },
        extra: { message, ...context },
      });
    } catch {
      // Sentry indispo : on a quand même l'email + le console.error ci-dessous.
    }
  }

  // Log serveur (visible Vercel Logs) — utile même sans Sentry/email.
  console.error(`[CRITICAL:${kind}]`, message, context, error?.message || error || '');

  // 2. Email immédiat (throttlé par kind).
  const now = Date.now();
  const last = _lastAlertAt.get(kind) || 0;
  if (now - last < THROTTLE_MS) return; // déjà alerté récemment pour ce kind
  _lastAlertAt.set(kind, now);

  try {
    const when = new Date().toISOString();
    const ctxRows = Object.entries(context)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 10px;color:#71717a;font-size:12px;vertical-align:top;">${escapeHtml(
            k
          )}</td><td style="padding:4px 10px;color:#18181b;font-size:12px;font-family:monospace;">${escapeHtml(
            typeof v === 'object' ? JSON.stringify(v) : v
          )}</td></tr>`
      )
      .join('');

    const detail = error instanceof Error ? `${error.message}\n${error.stack || ''}` : String(error || '');

    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:18px 20px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#b91c1c;">🚨 Incident Volia — ${escapeHtml(
            kind
          )}</p>
          <p style="margin:0;font-size:14px;color:#18181b;line-height:1.5;">${escapeHtml(message)}</p>
        </div>
        <p style="margin:16px 0 6px;font-size:12px;color:#71717a;">Contexte</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border:1px solid #e4e4e7;border-radius:8px;border-collapse:separate;">
          <tr><td style="padding:4px 10px;color:#71717a;font-size:12px;">when</td><td style="padding:4px 10px;color:#18181b;font-size:12px;font-family:monospace;">${escapeHtml(
            when
          )}</td></tr>
          ${ctxRows}
        </table>
        ${
          detail
            ? `<p style="margin:16px 0 6px;font-size:12px;color:#71717a;">Détail</p>
               <pre style="white-space:pre-wrap;word-break:break-word;background:#18181b;color:#e4e4e7;font-size:11px;padding:12px;border-radius:8px;overflow:auto;">${escapeHtml(
                 detail.slice(0, 2000)
               )}</pre>`
            : ''
        }
        <p style="margin:16px 0 0;font-size:11px;color:#a1a1aa;">Alerte automatique Volia · tu reçois ce mail parce qu'un incident critique vient de se produire en prod.</p>
      </div>`;

    await sendEmail({
      to: ALERT_TO,
      subject: `🚨 [Volia] Incident ${kind} — ${String(message).slice(0, 80)}`,
      html,
    });
  } catch (e) {
    // L'alerte elle-même a échoué — on log, on ne casse jamais le flux appelant.
    console.error('[critical-alert] failed to send alert email:', e?.message || e);
  }
}
