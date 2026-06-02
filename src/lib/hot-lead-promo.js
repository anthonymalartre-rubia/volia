// ─────────────────────────────────────────────────────────────────────
// src/lib/hot-lead-promo.js — Wave 1.4 Growth Loops
// ─────────────────────────────────────────────────────────────────────
// Cron daily 14h CET. Pour chaque user en trial actif depuis 8j+ avec
// lead_score >= 70 mais pas encore converti → email "Promo 50% premier mois,
// valable 24h" + code HOTLEAD50 + countdown.
//
// Cible : convertit les hot prospects au pic d'intérêt (J+8 mid-trial).
// Stripe coupon HOTLEAD50 (id: aQ2GPP6T) déjà créé : 50% off once.
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';
import { sendEmail } from './email';
import { isGrowthLoopsEnabled } from './growth-loops-base';
import { enforceQuotaOrThrow, logAutonomousAction } from './autonomy';

const MAX_PER_RUN = 30;
const TRIAL_AGE_DAYS = 8;
const HOT_SCORE_THRESHOLD = 70;
const PROMO_CODE = 'HOTLEAD50';

async function getUserContact(supabase, userId) {
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  const email = authUser?.user?.email || null;
  const firstName = authUser?.user?.user_metadata?.first_name
    || (email ? email.split('@')[0] : null);
  return { email, firstName };
}

function buildEmail({ firstName, leadScore, trialEndsAt }) {
  const name = firstName || 'toi';
  const daysLeftInTrial = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt) - new Date()) / (86400 * 1000)))
    : 6;
  // Countdown : 24h après envoi
  const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);
  const expiresStr = expiresAt.toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    subject: `${name} — -50% premier mois (24h chrono)`,
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:22px;color:#111827;">Salut ${name},</h1>
  <p style="font-size:14px;line-height:1.6;">
    Vu comment tu utilises Volia ces derniers jours, je pense que ça vaut le coup que tu continues après ton trial.
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Pour t'aider à décider, j'ai mis une promo spéciale sur ton compte :
  </p>

  <div style="margin:24px 0;padding:24px;background:linear-gradient(135deg,#ede9fe,#ddd6fe);border-left:4px solid #6366f1;border-radius:8px;text-align:center;">
    <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6366f1;font-weight:bold;">PROMO HOT LEAD</p>
    <p style="margin:8px 0 0;font-size:28px;font-weight:800;color:#5b21b6;">–50% premier mois</p>
    <p style="margin:8px 0 12px;font-size:13px;color:#6b21a8;">
      Code : <code style="background:#fff;padding:4px 10px;border-radius:4px;font-family:monospace;font-size:14px;font-weight:bold;color:#5b21b6;">${PROMO_CODE}</code>
    </p>
    <p style="margin:0;font-size:12px;color:#7c3aed;font-style:italic;">
      ⏰ Valable jusqu'au <strong>${expiresStr}</strong>
    </p>
  </div>

  <p style="font-size:14px;line-height:1.6;text-align:center;margin:24px 0;">
    <a href="https://volia.fr/pricing?promo=${PROMO_CODE}" style="display:inline-block;padding:14px 32px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(99,102,241,0.4);">Activer la promo →</a>
  </p>

  <p style="font-size:14px;line-height:1.6;">
    Ton trial se termine dans ${daysLeftInTrial} jours. Si tu attends la fin du trial, tu repars en plan Starter (100 prospects) — ce qui veut dire qu'il faut reconfigurer tes campagnes etc.
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Avec cette promo, tu sécurises ton accès complet et tu économises ${Math.round((49 * 0.5) * 100) / 100}€ sur Pro (ou plus sur Business).
  </p>

  <p style="font-size:14px;line-height:1.6;">Anthony — Fondateur Volia</p>
  <p style="font-size:11px;color:#9ca3af;margin-top:24px;">
    Promo réservée aux utilisateurs Volia ayant un score d'engagement élevé. Code à usage unique, valable 24h.
  </p>
</body></html>`,
    text: `Salut ${name},

Vu comment tu utilises Volia, je pense que ça vaut le coup que tu continues.

→ -50% premier mois (code ${PROMO_CODE}, valable 24h jusqu'au ${expiresStr})

Activer : https://volia.fr/pricing?promo=${PROMO_CODE}

Trial fini dans ${daysLeftInTrial}j. Sans upgrade tu repars en Starter (100 prospects).

Anthony — Volia`,
  };
}

export async function runHotLeadPromo() {
  const startedAt = new Date().toISOString();

  const state = await isGrowthLoopsEnabled();
  if (!state.enabled) {
    return { ok: true, skipped: true, reason: state.reason, startedAt };
  }

  try {
    await enforceQuotaOrThrow('hot_lead_promo_email', { perDay: 30 });
  } catch (e) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: e.message, startedAt };
  }

  const supabase = getSupabaseAdmin();
  const trialThreshold = new Date(Date.now() - TRIAL_AGE_DAYS * 86400 * 1000).toISOString();

  // Hot trials : trial_started_at >= 8j + actif + score >=70 + pas encore promo
  const { data: candidates } = await supabase
    .from('user_profiles')
    .select('id, lead_score, trial_started_at, trial_ends_at, trial_plan')
    .not('trial_started_at', 'is', null)
    .lt('trial_started_at', trialThreshold)
    .gt('trial_ends_at', new Date().toISOString())
    .gte('lead_score', HOT_SCORE_THRESHOLD)
    .is('trial_converted_at', null)
    .is('churned_at', null)
    .is('hot_lead_promo_sent_at', null)
    .order('lead_score', { ascending: false })
    .limit(MAX_PER_RUN);

  if (!candidates || candidates.length === 0) {
    return { ok: true, processed: 0, startedAt };
  }

  const results = { sent: [], skipped: [], errors: [] };

  for (const user of candidates) {
    const { email, firstName } = await getUserContact(supabase, user.id);
    if (!email) {
      results.skipped.push({ user_id: user.id, reason: 'no_email' });
      continue;
    }

    const tpl = buildEmail({
      firstName,
      leadScore: user.lead_score,
      trialEndsAt: user.trial_ends_at,
    });

    try {
      await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
      await supabase
        .from('user_profiles')
        .update({ hot_lead_promo_sent_at: new Date().toISOString() })
        .eq('id', user.id);
      results.sent.push({ user_id: user.id, email, lead_score: user.lead_score });

      await logAutonomousAction({
        actionType: 'hot_lead_promo_email',
        source: 'cron/hot-lead-promo',
        riskLevel: 'medium',
        payload: { user_id: user.id, email, lead_score: user.lead_score, promo: PROMO_CODE },
        preview: `🔥 HOTLEAD50 → ${email} (score ${user.lead_score})`,
        rationale: `Trial J+${TRIAL_AGE_DAYS}+ score>=${HOT_SCORE_THRESHOLD}, push conversion`,
        autoExecute: true,
      });
    } catch (err) {
      results.errors.push({ user_id: user.id, error: err.message });
    }
  }

  return { ok: true, ...results, startedAt };
}
