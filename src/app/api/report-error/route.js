import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { cleanEnv } from '@/lib/envClean';

// Cap payload size pour éviter qu'un attaquant balance des MB de "stack trace"
// pour exploser les logs Vercel (= facture).
const MAX_FIELD_LEN = 2000;

// Alerte e-mail throttlée : on prévient l'ops dès qu'une erreur client prod
// remonte, MAIS au plus 1 mail par signature (message+boundary) toutes les
// 30 min, pour ne pas se faire spammer (et faire flamber Resend). In-memory
// = par instance serverless ; suffisant pour casser un flood.
const ALERT_WINDOW_MS = 30 * 60 * 1000;
const lastAlertBySig = new Map();

async function maybeAlertOps(report) {
  if (process.env.NODE_ENV !== 'production') return;
  const to = cleanEnv(process.env.OPS_ALERT_EMAIL) || 'anthony.malartre@suraya.fr';
  const sig = `${report.boundary || 'app'}::${(report.message || '').slice(0, 120)}`;
  const now = Date.now();
  const last = lastAlertBySig.get(sig) || 0;
  if (now - last < ALERT_WINDOW_MS) return; // throttle
  lastAlertBySig.set(sig, now);
  try {
    await sendEmail({
      to,
      subject: `🔴 Erreur client Volia — ${(report.message || 'inconnue').slice(0, 80)}`,
      html: `<h2>Erreur client en production</h2>
<p><strong>Message :</strong> ${escapeHtml(report.message)}</p>
<p><strong>Boundary :</strong> ${escapeHtml(report.boundary) || '—'} · <strong>Composant :</strong> ${escapeHtml(report.component) || '—'}</p>
<p><strong>URL :</strong> ${escapeHtml(report.url) || '—'}</p>
<p><strong>Quand :</strong> ${escapeHtml(report.timestamp)}</p>
<pre style="background:#f4f4f5;padding:12px;border-radius:8px;font-size:12px;overflow:auto;white-space:pre-wrap">${escapeHtml(report.stack) || '(pas de stack)'}</pre>
<p style="color:#71717a;font-size:12px">Throttle : max 1 alerte / 30 min / signature. UA : ${escapeHtml(report.userAgent) || '—'}</p>`,
      tags: [{ name: 'type', value: 'ops_alert' }],
    });
  } catch {
    // Best-effort : ne jamais casser le endpoint d'erreur sur l'envoi d'alerte.
  }
}

function escapeHtml(v) {
  if (v == null) return '';
  return String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function trunc(v) {
  if (v == null) return null;
  const s = String(v);
  return s.length > MAX_FIELD_LEN ? s.slice(0, MAX_FIELD_LEN) + '…[trunc]' : s;
}

export async function POST(request) {
  try {
    // Rate-limit anti-spam logs (P2 audit) : 20 reports max / IP / 10 min.
    // Avant : endpoint anonyme sans limite → vector pour spammer console.error
    // et faire grimper la facture log Vercel.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const rate = checkRateLimit(`report-error:${ip}`, 20, 10 * 60 * 1000);
    if (!rate.success) {
      return NextResponse.json({ received: false, rateLimited: true }, { status: 429 });
    }

    const body = await request.json();

    const errorReport = {
      level: 'error',
      timestamp: body.timestamp || new Date().toISOString(),
      message: trunc(body.message || 'Unknown error'),
      stack: trunc(body.stack),
      url: trunc(body.url),
      userAgent: trunc(body.userAgent),
      boundary: trunc(body.boundary),
      component: trunc(body.component),
      action: trunc(body.action),
      ip,
    };

    // Structured log — in production this could be extended to:
    // - Send to Slack/Discord webhook
    // - Write to a database
    // - Forward to an external logging service
    console.error('[ErrorReport]', JSON.stringify(errorReport));

    // Alerte ops (prod, throttlée) — pour ne plus découvrir une panne par
    // l'utilisateur (cf. incident login). Best-effort, non bloquant si échec.
    await maybeAlertOps(errorReport);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
