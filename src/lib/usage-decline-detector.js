// ─────────────────────────────────────────────────────────────────────
// src/lib/usage-decline-detector.js — Wave 1.3 Growth Loops
// ─────────────────────────────────────────────────────────────────────
// Cron weekly lundi 9h CET. Détecte les paid users qui décrochent AVANT
// qu'ils churnent. Compare usage 7d courants vs 7d précédents.
//
// Si user payant avait >5 searches/sem et passe à 0 cette semaine → email
// proactif "On dirait que tu utilises moins Volia, tout va bien ?" + Cal.com.
//
// Cible : sauve 10-20 % des churns évitables (détection 2-3 sem avant).
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';
import { sendEmail } from './email';
import { isGrowthLoopsEnabled } from './growth-loops-base';
import { enforceQuotaOrThrow, logAutonomousAction } from './autonomy';

const MAX_PER_RUN = 50;
const COOLDOWN_DAYS = 21; // ne re-relance pas le même user avant 3 sem

async function getUserContact(supabase, userId) {
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  const email = authUser?.user?.email || null;
  const firstName = authUser?.user?.user_metadata?.first_name
    || (email ? email.split('@')[0] : null);
  return { email, firstName };
}

function buildEmail({ firstName, plan, prevSearches }) {
  const name = firstName || 'toi';
  const planLabel = { solo: 'Solo', pro: 'Pro', business: 'Business' }[plan] || plan;
  return {
    subject: `${name}, j'ai vu que tu utilises moins Volia`,
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:20px;color:#111827;">Salut ${name},</h1>
  <p style="font-size:14px;line-height:1.6;">
    Sur ton plan ${planLabel}, tu faisais en moyenne ${prevSearches} recherches par semaine. Cette semaine, 0.
  </p>
  <p style="font-size:14px;line-height:1.6;">
    Pas de pression — juste curieux de savoir si tout va bien. Plusieurs raisons possibles :
  </p>
  <ul style="font-size:14px;line-height:1.7;color:#374151;">
    <li>Tu as ce qu'il te faut et tu reviendras le mois prochain</li>
    <li>Tu galères sur une feature précise (config domaine, import liste...)</li>
    <li>Volia ne correspond plus à ce que tu cherches</li>
    <li>Tu manques de temps en ce moment</li>
  </ul>
  <p style="font-size:14px;line-height:1.6;">
    Réponds-moi en 1 ligne, ça m'aide à améliorer le produit. Et si t'as besoin
    qu'on regarde ensemble :
  </p>
  <p style="font-size:14px;line-height:1.6;text-align:center;margin:24px 0;">
    <a href="https://cal.com/anthony-volia/15min" style="display:inline-block;padding:12px 28px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;font-weight:600;">15 min ensemble</a>
  </p>
  <p style="font-size:14px;line-height:1.6;">Anthony — Fondateur Volia</p>
</body></html>`,
    text: `Salut ${name},

Sur ton plan ${planLabel}, tu faisais ~${prevSearches} recherches/sem. Cette semaine, 0.

Pas de pression, juste curieux. Si tu galères sur une feature ou si tu veux qu'on regarde ensemble : https://cal.com/anthony-volia/15min

Sinon réponds-moi en 1 ligne, ça m'aide à améliorer Volia.

Anthony — Volia`,
  };
}

export async function runUsageDeclineDetector() {
  const startedAt = new Date().toISOString();

  const state = await isGrowthLoopsEnabled();
  if (!state.enabled) {
    return { ok: true, skipped: true, reason: state.reason, startedAt };
  }

  try {
    await enforceQuotaOrThrow('usage_decline_alert_email', { perWeek: 50 });
  } catch (e) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: e.message, startedAt };
  }

  const supabase = getSupabaseAdmin();

  // Paid users non churned + non récemment relancés
  const cooldownCutoff = new Date(Date.now() - COOLDOWN_DAYS * 86400 * 1000).toISOString();
  const { data: paidUsers } = await supabase
    .from('user_profiles')
    .select('id, plan, usage_decline_alert_sent_at')
    .neq('plan', 'free')
    .is('churned_at', null)
    .or(`usage_decline_alert_sent_at.is.null,usage_decline_alert_sent_at.lt.${cooldownCutoff}`)
    .limit(500);

  if (!paidUsers || paidUsers.length === 0) {
    return { ok: true, processed: 0, startedAt };
  }

  // Calcule current week vs prev week (sur usage_tracking)
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

  const results = { sent: [], skipped: [], errors: [] };

  for (const user of paidUsers) {
    if (results.sent.length >= MAX_PER_RUN) break;

    // Récupère les 2 derniers mois usage
    const { data: usageRows } = await supabase
      .from('usage_tracking')
      .select('month, searches, enrichments')
      .eq('user_id', user.id)
      .in('month', [currentMonth, prevMonth]);

    const current = usageRows?.find((r) => r.month === currentMonth) || { searches: 0, enrichments: 0 };
    const prev = usageRows?.find((r) => r.month === prevMonth) || { searches: 0, enrichments: 0 };

    // Approximation : prev/4 = avg week ; current = current month so far
    // Décline si prev avg >= 5/sem ET current ≈ 0 (et on est au moins en milieu de mois)
    const prevPerWeek = prev.searches / 4;
    const currentTotal = current.searches;
    const dayOfMonth = now.getDate();

    if (prevPerWeek < 5) {
      results.skipped.push({ user_id: user.id, reason: 'baseline_too_low' });
      continue;
    }
    // attendons mid-month avant d'alerter sur current = 0
    if (dayOfMonth < 8 && currentTotal === 0) {
      results.skipped.push({ user_id: user.id, reason: 'too_early_in_month' });
      continue;
    }
    if (currentTotal > 0) {
      results.skipped.push({ user_id: user.id, reason: 'still_active' });
      continue;
    }

    const { email, firstName } = await getUserContact(supabase, user.id);
    if (!email) {
      results.skipped.push({ user_id: user.id, reason: 'no_email' });
      continue;
    }

    const tpl = buildEmail({
      firstName,
      plan: user.plan,
      prevSearches: Math.round(prevPerWeek),
    });

    try {
      await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
      await supabase
        .from('user_profiles')
        .update({ usage_decline_alert_sent_at: new Date().toISOString() })
        .eq('id', user.id);
      results.sent.push({ user_id: user.id, email, prevPerWeek: Math.round(prevPerWeek) });

      await logAutonomousAction({
        actionType: 'usage_decline_alert_email',
        source: 'cron/usage-decline-detector',
        riskLevel: 'low',
        payload: {
          user_id: user.id,
          email,
          plan: user.plan,
          prev_searches_per_week: Math.round(prevPerWeek),
          current_searches: currentTotal,
        },
        preview: `📉 Décline ${user.plan} → ${email} (était ${Math.round(prevPerWeek)}/sem)`,
        rationale: 'Paid user qui décroche, intervention proactive',
        autoExecute: true,
      });
    } catch (err) {
      results.errors.push({ user_id: user.id, error: err.message });
    }
  }

  return { ok: true, ...results, startedAt };
}
