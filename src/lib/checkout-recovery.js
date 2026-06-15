// ─────────────────────────────────────────────────────────────────────
// src/lib/checkout-recovery.js — Wave 1.2 Growth Loops
// ─────────────────────────────────────────────────────────────────────
// 2 fonctions :
//
//   1. captureExpiredCheckout(session) — appelée depuis webhook Stripe sur
//      l'event "checkout.session.expired" pour persister la session dans
//      checkout_recovery_attempts.
//
//   2. runCheckoutRecovery() — cron daily 11h CET, envoie séquence 3 emails :
//      - Email 1 (J+1h après expiry)  : "Tu as failli passer Pro, on t'aide ?"
//      - Email 2 (J+24h)              : "Pas trop sûr ? Voici la promo HOTLEAD50"
//      - Email 3 (J+72h)              : "Dernière chance, on n'en parle plus"
//
// Idéalement : 10-15 % des checkouts abandonnés récupérés.
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';
import { sendEmail } from './email';
import { isGrowthLoopsEnabled } from './growth-loops-base';
import { enforceQuotaOrThrow, logAutonomousAction } from './autonomy';

const MAX_PER_RUN = 50;

/**
 * Appelée depuis le webhook Stripe sur checkout.session.expired.
 * Idempotent via UNIQUE constraint sur stripe_session_id.
 */
export async function captureExpiredCheckout({ session, supabase }) {
  if (!session?.id) return { ok: false, error: 'no_session_id' };

  const sb = supabase || getSupabaseAdmin();
  const userId = session.metadata?.supabase_user_id || null;
  const email = session.customer_details?.email || session.customer_email || null;
  const plan = session.metadata?.plan || session.metadata?.intended_plan || null;
  const amountEur = session.amount_total ? Math.round(session.amount_total / 100) : null;

  const { error } = await sb
    .from('checkout_recovery_attempts')
    .insert({
      stripe_session_id: session.id,
      user_id: userId,
      email,
      intended_plan: plan,
      intended_amount_eur: amountEur,
      session_expired_at: new Date().toISOString(),
    });

  if (error && !error.message.includes('duplicate')) {
    console.error('[checkout-recovery] capture failed', error);
    return { ok: false, error: error.message };
  }
  return { ok: true, session_id: session.id };
}

// ─── Templates emails ───────────────────────────────────────────────

function planLabel(plan) {
  if (!plan) return 'Volia';
  const map = {
    // Lineup freemium (11/06/2026)
    prospection: 'Prospection (19€/mois)',
    max: 'MAX (179€/mois)',
    // Legacy (checkouts abandonnés avant le pivot / parcours grandfathered)
    solo: 'Solo (19€/mois)',
    pro: 'Pro (49€/mois)',
    business: 'Business (179€/mois)',
  };
  return map[plan] || plan;
}

function buildEmail1({ email, plan }) {
  const planStr = planLabel(plan);
  return {
    subject: `Tu as failli passer ${planLabel(plan).split(' ')[0]} sur Volia`,
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:20px;color:#111827;">Salut,</h1>
  <p style="font-size:14px;line-height:1.6;">
    Tu as commencé à passer en plan <strong>${planStr}</strong> sur Volia il y a moins d'une heure, mais le checkout n'est pas allé jusqu'au bout.
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Si c'était un problème technique, voici le lien direct pour finaliser :
  </p>
  <p style="font-size:14px;line-height:1.6;text-align:center;margin:24px 0;">
    <a href="https://volia.fr/pricing" style="display:inline-block;padding:12px 28px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Reprendre l'achat →</a>
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Si tu hésitais encore, dis-moi pourquoi en répondant à ce mail, j'écoute.
  </p>
  <p style="font-size:14px;line-height:1.6;">Anthony — Fondateur Volia</p>
</body></html>`,
    text: `Salut,

Tu as commencé à passer ${planStr} sur Volia il y a moins d'une heure, mais le checkout n'est pas allé jusqu'au bout.

Reprendre l'achat : https://volia.fr/pricing

Si tu hésitais, réponds à ce mail.

Anthony — Volia`,
  };
}

function buildEmail2({ email, plan }) {
  return {
    subject: `Promo -50% premier mois — ${planLabel(plan).split(' ')[0]} sur Volia`,
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:20px;color:#111827;">Salut,</h1>
  <p style="font-size:14px;line-height:1.6;">
    Hier tu as failli upgrade ton plan Volia mais tu n'as pas finalisé.
    Pour t'aider à décider, j'ai mis une promo sur ton compte :
  </p>
  <div style="margin:24px 0;padding:18px;background:#ede9fe;border-left:4px solid #6366f1;border-radius:6px;">
    <p style="margin:0;font-size:16px;font-weight:700;color:#5b21b6;">–50% sur ton premier mois</p>
    <p style="margin:6px 0 0;font-size:13px;color:#6b21a8;">Code <code style="background:#fff;padding:2px 6px;border-radius:3px;font-family:monospace;">HOTLEAD50</code> à coller au checkout.</p>
  </div>
  <p style="font-size:14px;line-height:1.6;text-align:center;margin:24px 0;">
    <a href="https://volia.fr/pricing?promo=HOTLEAD50" style="display:inline-block;padding:12px 28px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Profiter de la promo →</a>
  </p>
  <p style="font-size:14px;line-height:1.6;">Anthony — Fondateur Volia</p>
</body></html>`,
    text: `Salut,

Hier tu as failli upgrade Volia. J'ai mis une promo sur ton compte :

→ –50% sur ton premier mois (code HOTLEAD50)

Profiter : https://volia.fr/pricing?promo=HOTLEAD50

Anthony — Volia`,
  };
}

function buildEmail3({ email, plan }) {
  return {
    subject: 'Dernier mail (promis) — fin de promo Volia',
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:20px;color:#111827;">Salut,</h1>
  <p style="font-size:14px;line-height:1.6;">
    Dernier mail, promis. La promo HOTLEAD50 expire dans 24h.
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Si Volia ne te convient pas, no offense — réponds juste « stop » et je n'envoie plus rien.
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Si tu hésites pour autre chose, écris-moi, je trouve une solution :
  </p>
  <p style="font-size:14px;line-height:1.6;text-align:center;margin:24px 0;">
    <a href="mailto:anthony@volia.fr" style="display:inline-block;padding:12px 28px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Me répondre</a>
  </p>
  <p style="font-size:14px;line-height:1.6;">Anthony — Fondateur Volia</p>
</body></html>`,
    text: `Salut,

Dernier mail. La promo HOTLEAD50 expire dans 24h.

Si pas intéressé, réponds "stop". Si tu hésites pour autre chose, écris-moi : anthony@volia.fr

Anthony — Volia`,
  };
}

const STEPS = [
  { step: 1, hoursAfterExpiry: 1, columnSentAt: 'email_1_sent_at', builder: buildEmail1 },
  { step: 2, hoursAfterExpiry: 24, columnSentAt: 'email_2_sent_at', builder: buildEmail2 },
  { step: 3, hoursAfterExpiry: 72, columnSentAt: 'email_3_sent_at', builder: buildEmail3 },
];

export async function runCheckoutRecovery() {
  const startedAt = new Date().toISOString();

  const state = await isGrowthLoopsEnabled();
  if (!state.enabled) {
    return { ok: true, skipped: true, reason: state.reason, startedAt };
  }

  try {
    await enforceQuotaOrThrow('checkout_recovery_email', { perDay: 50 });
  } catch (e) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: e.message, startedAt };
  }

  const supabase = getSupabaseAdmin();
  const results = { sent: [], skipped: [], errors: [] };
  let totalSent = 0;

  for (const step of STEPS) {
    if (totalSent >= MAX_PER_RUN) break;

    const thresholdDate = new Date(Date.now() - step.hoursAfterExpiry * 3600 * 1000).toISOString();
    const { data: candidates } = await supabase
      .from('checkout_recovery_attempts')
      .select('*')
      .lt('session_expired_at', thresholdDate)
      .is(step.columnSentAt, null)
      .is('recovered_at', null)
      .eq('unsubscribed', false)
      .not('email', 'is', null)
      .order('session_expired_at', { ascending: true })
      .limit(MAX_PER_RUN - totalSent);

    if (!candidates || candidates.length === 0) continue;

    for (const attempt of candidates) {
      const tpl = step.builder({ email: attempt.email, plan: attempt.intended_plan });
      try {
        await sendEmail({ to: attempt.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
        await supabase
          .from('checkout_recovery_attempts')
          .update({ [step.columnSentAt]: new Date().toISOString() })
          .eq('id', attempt.id);
        results.sent.push({ id: attempt.id, email: attempt.email, step: step.step });
        totalSent++;

        await logAutonomousAction({
          actionType: 'checkout_recovery_email',
          source: 'cron/checkout-recovery',
          riskLevel: 'low',
          payload: { id: attempt.id, email: attempt.email, step: step.step, plan: attempt.intended_plan },
          preview: `🛒 Checkout recovery J+${step.hoursAfterExpiry}h → ${attempt.email}`,
          rationale: `Stripe session ${attempt.stripe_session_id} expirée`,
          autoExecute: true,
        });
      } catch (err) {
        results.errors.push({ id: attempt.id, error: err.message });
      }
    }
  }

  return { ok: true, ...results, startedAt };
}

/**
 * Marque un attempt comme recovered (appelé depuis webhook checkout.session.completed
 * en cross-check : si l'email a déjà été dans recovery_attempts, on flag).
 */
export async function markAttemptRecovered(email) {
  if (!email) return;
  const supabase = getSupabaseAdmin();
  await supabase
    .from('checkout_recovery_attempts')
    .update({ recovered_at: new Date().toISOString() })
    .eq('email', email.toLowerCase())
    .is('recovered_at', null);
}
