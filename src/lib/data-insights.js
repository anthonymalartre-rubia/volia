// ─────────────────────────────────────────────────────────────────────
// src/lib/data-insights.js — Sprint Data & Insights
// ─────────────────────────────────────────────────────────────────────
// Queries SQL pour le dashboard /admin/insights :
//   - MRR snapshot par plan
//   - Churn rate 30j
//   - Cohort retention par mois d'inscription
//   - Attribution conversion ↔ boucle autonomy (lookback 7j)
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';

// Tarifs mensuels en EUR. Synchroniser avec lib/plans.js si modifié.
const PLAN_MRR = {
  free: 0,
  starter: 0,
  solo: 19,
  pro: 49,
  business: 179,
  enterprise: 149,  // legacy plan
};

/**
 * Snapshot MRR actuel : nombre d'utilisateurs par plan + MRR total.
 */
export async function getMRRSnapshot() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('plan')
    .is('churned_at', null);

  if (error) return { ok: false, error: error.message };

  const byPlan = {};
  let totalMrr = 0;
  let paidUsers = 0;
  for (const row of data || []) {
    const plan = row.plan || 'free';
    if (!byPlan[plan]) byPlan[plan] = { count: 0, mrr: 0 };
    byPlan[plan].count++;
    const mrr = PLAN_MRR[plan] || 0;
    byPlan[plan].mrr += mrr;
    totalMrr += mrr;
    if (mrr > 0) paidUsers++;
  }

  return {
    ok: true,
    total_users: data?.length || 0,
    paid_users: paidUsers,
    total_mrr_eur: totalMrr,
    total_arr_eur: totalMrr * 12,
    by_plan: byPlan,
  };
}

/**
 * Churn rate sur les N derniers jours.
 */
export async function getChurnRate(days = 30) {
  const supabase = getSupabaseAdmin();
  const cutoff = new Date(Date.now() - days * 86400 * 1000).toISOString();
  const periodStart = new Date(Date.now() - 2 * days * 86400 * 1000).toISOString();

  // Users qui étaient payés au début de la période et qui ont churn pendant
  const { count: churnedInPeriod } = await supabase
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })
    .gte('churned_at', cutoff);

  // Base : users payés actuels + ceux qui ont churn
  const { count: currentPaid } = await supabase
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })
    .neq('plan', 'free')
    .is('churned_at', null);

  const baseAtStart = (currentPaid || 0) + (churnedInPeriod || 0);
  const churnRate = baseAtStart > 0 ? ((churnedInPeriod || 0) / baseAtStart) * 100 : 0;

  return {
    ok: true,
    period_days: days,
    base_at_start: baseAtStart,
    churned: churnedInPeriod || 0,
    current_paid: currentPaid || 0,
    churn_rate_pct: Number(churnRate.toFixed(2)),
  };
}

/**
 * Cohort retention : pour chaque mois d'inscription des 6 derniers mois,
 * calcule combien sont encore actifs (plan != free OR last_login récent).
 */
export async function getCohortRetention(monthsBack = 6) {
  const supabase = getSupabaseAdmin();

  const now = new Date();
  const cohorts = [];

  for (let i = 0; i < monthsBack; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const monthLabel = monthStart.toISOString().slice(0, 7);

    // Total signups du mois
    const { count: signups } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString())
      .lt('created_at', monthEnd.toISOString());

    // Still active : non churned
    const { count: stillActive } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString())
      .lt('created_at', monthEnd.toISOString())
      .is('churned_at', null);

    // Paid
    const { count: converted } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString())
      .lt('created_at', monthEnd.toISOString())
      .neq('plan', 'free')
      .is('churned_at', null);

    const retentionPct = signups > 0 ? ((stillActive || 0) / signups) * 100 : 0;
    const conversionPct = signups > 0 ? ((converted || 0) / signups) * 100 : 0;

    cohorts.push({
      month: monthLabel,
      signups: signups || 0,
      still_active: stillActive || 0,
      converted_paid: converted || 0,
      retention_pct: Number(retentionPct.toFixed(1)),
      conversion_pct: Number(conversionPct.toFixed(1)),
    });
  }

  return { ok: true, cohorts };
}

/**
 * Attribution : pour les users convertis (trial → paid) ces N derniers jours,
 * regarde quelles boucles autonomy les ont touchés dans les 7j précédant la conversion.
 */
export async function getAutomationAttribution(days = 30) {
  const supabase = getSupabaseAdmin();
  const cutoff = new Date(Date.now() - days * 86400 * 1000).toISOString();

  // Trouve les conversions récentes
  const { data: conversions } = await supabase
    .from('user_profiles')
    .select('id, trial_converted_at, plan')
    .gte('trial_converted_at', cutoff)
    .neq('plan', 'free');

  if (!conversions || conversions.length === 0) {
    return { ok: true, conversions: 0, by_loop: {} };
  }

  const byLoop = {};

  for (const conv of conversions) {
    const lookbackStart = new Date(new Date(conv.trial_converted_at).getTime() - 7 * 86400 * 1000).toISOString();
    const { data: actions } = await supabase
      .from('autonomous_actions')
      .select('action_type')
      .gte('created_at', lookbackStart)
      .lte('created_at', conv.trial_converted_at)
      .filter('payload->>user_id', 'eq', conv.id);

    const touchedLoops = new Set((actions || []).map((a) => a.action_type));
    for (const loop of touchedLoops) {
      if (!byLoop[loop]) byLoop[loop] = { conversions_touched: 0 };
      byLoop[loop].conversions_touched++;
    }
  }

  // Calcule attribution share
  const total = conversions.length;
  const result = Object.entries(byLoop).map(([loop, data]) => ({
    action_type: loop,
    conversions_touched: data.conversions_touched,
    attribution_pct: Number(((data.conversions_touched / total) * 100).toFixed(1)),
  }));

  return {
    ok: true,
    period_days: days,
    total_conversions: total,
    by_loop: result.sort((a, b) => b.conversions_touched - a.conversions_touched),
  };
}

/**
 * Snapshot complet pour /admin/insights — combine tout en 1 call.
 */
export async function getInsightsOverview() {
  const [mrr, churn, cohorts, attribution] = await Promise.all([
    getMRRSnapshot(),
    getChurnRate(30),
    getCohortRetention(6),
    getAutomationAttribution(30),
  ]);
  return {
    ok: true,
    generated_at: new Date().toISOString(),
    mrr,
    churn,
    cohorts: cohorts.cohorts || [],
    attribution: attribution.by_loop || [],
    attribution_meta: {
      period_days: attribution.period_days,
      total_conversions: attribution.total_conversions,
    },
  };
}
