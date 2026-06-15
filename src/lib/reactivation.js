// ─────────────────────────────────────────────────────────────────────
// src/lib/reactivation.js — Séquence reactivation churners
// ─────────────────────────────────────────────────────────────────────
// Sprint Marketing Compound Phase 4.
//
// Pipeline (cron daily 10h CET) :
//   1. Find users user_profiles WHERE churned_at IS NOT NULL
//      AND reactivation_opted_out = false
//   2. Selon delta entre churned_at et aujourd'hui :
//      - >=30j ET step_1 pas envoyé → envoie email J+30 (soft)
//      - >=60j ET step_2 pas envoyé → envoie email J+60 (product update)
//      - >=90j ET step_3 pas envoyé → envoie email J+90 (promo -50%)
//   3. Update step_X_sent_at après envoi réussi
//
// Risk : low (un email par user, espacé de 30j). Pas de queue approval.
// Quotas : maxPerDay 50 (safety net si churn massif).
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';
import { sendEmail } from './email';
import { isAutonomyEnabled, enforceQuotaOrThrow, logAutonomousAction } from './autonomy';

const MAX_PER_RUN = 50;

// Templates statiques pour V1. Personnalisation Claude possible en Phase 4.1.
function buildStep1Email({ firstName, churnedAt }) {
  const name = firstName || 'toi';
  return {
    subject: 'Comment ça se passe sans Volia ?',
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:20px;color:#111827;">Salut ${name},</h1>
  <p style="font-size:14px;line-height:1.6;">
    Ça fait un mois que tu as quitté Volia. Pas de spam, pas de pression : juste curieux.
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Qu'est-ce qui a fait que ça ne te convenait pas ? Trop cher ? Pas la bonne feature ? Quelque chose qui marchait mal ?
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Si tu as 30 secondes pour me répondre — vraiment 30 secondes — ça m'aide énormément à améliorer le produit. Réponds juste à ce mail.
  </p>
  <p style="font-size:14px;line-height:1.6;">Merci,<br>Anthony</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
  <p style="font-size:11px;color:#9ca3af;text-align:center;">
    Tu reçois ça car tu as eu un compte Volia. <a href="https://volia.fr/api/reactivation/unsubscribe?email=${encodeURIComponent(firstName)}" style="color:#9ca3af;">Ne plus recevoir ces emails</a>.
  </p>
</body></html>`,
    text: `Salut ${name},

Ça fait un mois que tu as quitté Volia. Pas de spam, pas de pression : juste curieux.

Qu'est-ce qui a fait que ça ne te convenait pas ? Trop cher ? Pas la bonne feature ? Quelque chose qui marchait mal ?

Si tu as 30 secondes pour me répondre — vraiment 30 secondes — ça m'aide énormément à améliorer le produit. Réponds juste à ce mail.

Merci,
Anthony`,
  };
}

function buildStep2Email({ firstName }) {
  const name = firstName || 'toi';
  return {
    subject: 'Ce qu\'on a ajouté à Volia depuis ton départ',
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:20px;color:#111827;">Salut ${name},</h1>
  <p style="font-size:14px;line-height:1.6;">
    Tu as quitté Volia il y a 2 mois. Voici ce qu'on a livré depuis :
  </p>
  <ul style="font-size:14px;line-height:1.7;color:#374151;">
    <li>Pipeline auto-publish LinkedIn (Claude rédige, tu valides en 1 clic)</li>
    <li>Self-healing Sentry → GitHub issues auto-créées chaque lundi</li>
    <li>Blog SEO auto-rédigé 1×/sem (12 angles B2B en rotation)</li>
    <li>Newsletter mensuelle générée + envoyée auto</li>
    <li>Anomaly detection + weekly audit report par email</li>
  </ul>
  <p style="font-size:14px;line-height:1.6;">
    Voir le détail : <a href="https://volia.fr/changelog" style="color:#6366f1;">volia.fr/changelog</a>
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Si une de ces features manquait quand tu étais sur Volia, ça vaut peut-être un coup d'œil.
  </p>
  <p style="font-size:14px;line-height:1.6;">Anthony — Fondateur Volia</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
  <p style="font-size:11px;color:#9ca3af;text-align:center;">
    <a href="https://volia.fr/api/reactivation/unsubscribe?email=${encodeURIComponent(firstName)}" style="color:#9ca3af;">Ne plus recevoir ces emails</a>
  </p>
</body></html>`,
    text: `Salut ${name},

Tu as quitté Volia il y a 2 mois. Voici ce qu'on a livré depuis :

- Pipeline auto-publish LinkedIn (Claude rédige, tu valides en 1 clic)
- Self-healing Sentry → GitHub issues auto-créées chaque lundi
- Blog SEO auto-rédigé 1×/sem (12 angles B2B en rotation)
- Newsletter mensuelle générée + envoyée auto
- Anomaly detection + weekly audit report par email

Voir le détail : https://volia.fr/changelog

Si une de ces features manquait quand tu étais sur Volia, ça vaut peut-être un coup d'œil.

Anthony — Fondateur Volia`,
  };
}

function buildStep3Email({ firstName }) {
  const name = firstName || 'toi';
  return {
    subject: '–50% sur 3 mois si tu veux retester Volia',
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:20px;color:#111827;">Salut ${name},</h1>
  <p style="font-size:14px;line-height:1.6;">
    Dernier email reactivation, promis.
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Si tu veux retester Volia avec tout ce qu'on a ajouté depuis 3 mois, j'ai mis une promo permanente sur ton compte :
  </p>
  <div style="margin:20px 0;padding:18px;background:#ede9fe;border-left:4px solid #6366f1;border-radius:6px;">
    <p style="margin:0;font-size:16px;font-weight:700;color:#5b21b6;">–50% pendant 3 mois</p>
    <p style="margin:6px 0 0;font-size:13px;color:#6b21a8;">Soit 89,50€/mois au lieu de 179€ sur le plan MAX (suite illimitée + Autopilot)</p>
  </div>
  <p style="font-size:14px;line-height:1.6;">
    Code promo : <code style="background:#f3f4f6;padding:4px 8px;border-radius:4px;font-family:monospace;">COMEBACK50</code> (à entrer au checkout).
  </p>
  <p style="font-size:14px;line-height:1.6;text-align:center;margin:24px 0;">
    <a href="https://volia.fr/pricing?promo=COMEBACK50" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Re-essayer Volia →</a>
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Sinon, pas de stress, tu n'auras plus de mails de ma part.
  </p>
  <p style="font-size:14px;line-height:1.6;">Anthony — Fondateur Volia</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
  <p style="font-size:11px;color:#9ca3af;text-align:center;">
    <a href="https://volia.fr/api/reactivation/unsubscribe?email=${encodeURIComponent(firstName)}" style="color:#9ca3af;">Ne plus recevoir ces emails</a>
  </p>
</body></html>`,
    text: `Salut ${name},

Dernier email reactivation, promis.

Si tu veux retester Volia avec tout ce qu'on a ajouté depuis 3 mois, j'ai mis une promo permanente sur ton compte :

→ –50% pendant 3 mois (89,50€/mois au lieu de 179€)
   Plan MAX : suite illimitée + Autopilot

Code promo : COMEBACK50 (à entrer au checkout)

Re-essayer Volia : https://volia.fr/pricing?promo=COMEBACK50

Sinon, pas de stress, tu n'auras plus de mails de ma part.

Anthony — Fondateur Volia`,
  };
}

const STEPS = [
  { step: 1, daysAfterChurn: 30, columnSentAt: 'reactivation_step_1_sent_at', builder: buildStep1Email },
  { step: 2, daysAfterChurn: 60, columnSentAt: 'reactivation_step_2_sent_at', builder: buildStep2Email },
  { step: 3, daysAfterChurn: 90, columnSentAt: 'reactivation_step_3_sent_at', builder: buildStep3Email },
];

/**
 * Récupère email + first name d'un user via auth.users (lazy).
 */
async function getUserContact(supabase, userId) {
  // user_profiles ne contient pas l'email — il est dans auth.users
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  const email = authUser?.user?.email || null;
  const firstName = authUser?.user?.user_metadata?.first_name ||
    authUser?.user?.user_metadata?.full_name?.split(' ')[0] ||
    (email ? email.split('@')[0] : null);
  return { email, firstName };
}

/**
 * Main : appelée par cron daily.
 * Retourne summary.
 */
export async function runReactivationChurners() {
  const startedAt = new Date().toISOString();

  const autonomyState = await isAutonomyEnabled();
  if (!autonomyState.enabled) {
    return { ok: true, skipped: true, reason: 'autonomy_disabled', startedAt };
  }

  // Quota safety
  try {
    await enforceQuotaOrThrow('reactivation_email_send', { perDay: 100 });
  } catch (quotaErr) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: quotaErr.message, startedAt };
  }

  const supabase = getSupabaseAdmin();
  const results = { sent: [], skipped: [], errors: [] };
  let totalSent = 0;

  for (const step of STEPS) {
    if (totalSent >= MAX_PER_RUN) break;

    // Trouve users churned depuis >=daysAfterChurn et pas encore notifés pour cette step
    const thresholdDate = new Date(Date.now() - step.daysAfterChurn * 86400 * 1000).toISOString();
    const { data: candidates } = await supabase
      .from('user_profiles')
      .select('id, churned_at')
      .lt('churned_at', thresholdDate)
      .is(step.columnSentAt, null)
      .eq('reactivation_opted_out', false)
      .order('churned_at', { ascending: true })
      .limit(MAX_PER_RUN - totalSent);

    if (!candidates || candidates.length === 0) continue;

    for (const user of candidates) {
      const { email, firstName } = await getUserContact(supabase, user.id);
      if (!email) {
        results.skipped.push({ user_id: user.id, step: step.step, reason: 'no_email' });
        continue;
      }

      const tpl = step.builder({ firstName, churnedAt: user.churned_at });
      try {
        await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
        await supabase
          .from('user_profiles')
          .update({ [step.columnSentAt]: new Date().toISOString() })
          .eq('id', user.id);
        results.sent.push({ user_id: user.id, email, step: step.step });
        totalSent++;

        // Log autonomy pour audit trail
        await logAutonomousAction({
          actionType: 'reactivation_email_send',
          source: 'cron/reactivation-churners',
          riskLevel: 'low',
          payload: { user_id: user.id, email, step: step.step, days_after_churn: step.daysAfterChurn },
          preview: `📧 Reactivation J+${step.daysAfterChurn} → ${email}`,
          rationale: `Auto-séquence churn, step ${step.step}/3`,
          autoExecute: true,
        });
      } catch (err) {
        console.error(`[reactivation] step ${step.step} send failed for ${email}`, err);
        results.errors.push({ user_id: user.id, email, step: step.step, error: err.message });
      }
    }
  }

  return {
    ok: true,
    sent_count: results.sent.length,
    skipped_count: results.skipped.length,
    errors_count: results.errors.length,
    results,
    startedAt,
  };
}
