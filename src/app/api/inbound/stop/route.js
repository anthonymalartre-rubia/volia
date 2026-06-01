// ─────────────────────────────────────────────────────────────────────
// /api/inbound/stop — Kill switch autonomy via email
// ─────────────────────────────────────────────────────────────────────
//
// Webhook Resend Inbound : reçoit les emails envoyés sur stop@volia.fr
// (à configurer côté Resend : Inbound → Add catch-all stop@volia.fr).
//
// Si le subject ou body contient "STOP" (case-insensitive) :
//   - Désactive autonomy via setAutonomyEnabled(false, ...)
//   - Send auto-reply confirmant + lien pour re-enable
//   - Log dans audit trail
//
// CAS D'USAGE : mobile-friendly kill switch. Tu reçois une alerte
// anomaly à 3h du matin, tu réponds "STOP" depuis ton iPhone → autonomy
// désactivée en 30 sec sans toucher Vercel.
//
// SÉCURITÉ : on ne vérifie que le FROM est dans une whitelist. Sinon
// n'importe qui pourrait envoyer un email à stop@volia.fr et désactiver.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { setAutonomyEnabled } from '@/lib/autonomy';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Whitelist d'emails autorisés à kill switch
const AUTHORIZED_SENDERS = [
  'anthony.malartre@suraya.fr',
  'anthony.malartre@gmail.com',
  'contact@volia.fr',
];

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Resend Inbound payload structure :
  //   { from: 'sender@x.com', to: '...', subject: '...', text: '...', html: '...' }
  // On normalise pour être tolérant à d'autres providers
  const from = (body.from?.email || body.from || body.sender || '').toString().toLowerCase().trim();
  const subject = (body.subject || '').toString();
  const text = (body.text || body.plain || body.body || '').toString();

  // 1. Whitelist check
  const senderEmail = from.match(/<(.+?)>/) ? from.match(/<(.+?)>/)[1] : from;
  if (!AUTHORIZED_SENDERS.includes(senderEmail)) {
    console.warn(`[inbound/stop] unauthorized sender: ${senderEmail}`);
    return NextResponse.json(
      { ok: false, reason: 'unauthorized_sender', sender: senderEmail },
      { status: 403 }
    );
  }

  // 2. Détection mot-clé STOP (subject prioritaire)
  const combined = `${subject} ${text}`;
  const hasStop = /\bSTOP\b/i.test(combined);
  const hasResume = /\b(RESUME|START|ON|REACTIVATE)\b/i.test(combined);

  let action = null;
  let reason = null;
  if (hasStop) {
    action = 'stop';
    reason = `STOP email du ${new Date().toLocaleString('fr-FR')} (from: ${senderEmail}, subject: "${subject.slice(0, 80)}")`;
  } else if (hasResume) {
    action = 'resume';
    reason = `RESUME email du ${new Date().toLocaleString('fr-FR')} (from: ${senderEmail})`;
  }

  if (!action) {
    return NextResponse.json({
      ok: true,
      action: 'none',
      reason: 'Aucun mot-clé STOP ni RESUME détecté dans le subject/body',
    });
  }

  // 3. Appliquer le toggle
  try {
    const enabled = action === 'resume';
    await setAutonomyEnabled(enabled, reason, `inbound_email:${senderEmail}`);

    // 4. Auto-reply de confirmation
    const replySubject = action === 'stop'
      ? '✅ Autonomy Volia DÉSACTIVÉE'
      : '✅ Autonomy Volia RÉACTIVÉE';
    const replyHtml = `
<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;">
  <h1 style="font-size:20px;color:${action === 'stop' ? '#dc2626' : '#10b981'};">${replySubject}</h1>
  <p style="color:#374151;font-size:14px;">
    Le kill switch DB a été ${action === 'stop' ? 'activé' : 'désactivé'} suite à ton email.
    Tous les crons autonomy ${action === 'stop' ? 'sont désormais en pause' : 'reprennent immédiatement'}.
  </p>
  <p style="color:#374151;font-size:14px;">
    <strong>Raison enregistrée :</strong><br>
    <code style="background:#f3f4f6;padding:4px 8px;border-radius:4px;font-size:12px;">${reason}</code>
  </p>
  <p style="color:#6b7280;font-size:13px;margin-top:20px;">
    Pour ${action === 'stop' ? 'réactiver' : 'désactiver à nouveau'} :
  </p>
  <ul style="color:#374151;font-size:13px;">
    <li>Réponds à cet email avec "${action === 'stop' ? 'RESUME' : 'STOP'}" dans le subject</li>
    <li>Ou utilise le toggle dans <a href="https://volia.fr/admin/auto-queue" style="color:#6366f1;">/admin/auto-queue</a></li>
  </ul>
  <p style="color:#9ca3af;font-size:11px;margin-top:32px;text-align:center;">
    Volia autonomy kill switch — DB override env var · ${new Date().toLocaleString('fr-FR')}
  </p>
</body></html>`;
    try {
      await sendEmail({
        to: senderEmail,
        subject: replySubject,
        html: replyHtml,
      });
    } catch (e) {
      console.warn('[inbound/stop] auto-reply send failed', e.message);
    }

    return NextResponse.json({
      ok: true,
      action,
      enabled,
      reason,
      sender: senderEmail,
    });
  } catch (err) {
    console.error('[inbound/stop] setAutonomyEnabled failed', err);
    return NextResponse.json(
      { ok: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}

// GET pour test / healthcheck
export async function GET() {
  return NextResponse.json({
    endpoint: 'inbound/stop',
    description: 'POST webhook for STOP/RESUME emails from authorized senders',
    authorized_senders_count: AUTHORIZED_SENDERS.length,
  });
}
