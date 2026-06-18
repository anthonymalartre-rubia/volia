// ─────────────────────────────────────────────────────────────────────
// GET /api/admin/metrics
// ─────────────────────────────────────────────────────────────────────
// Endpoint admin-only qui calcule les metrics business critiques pour
// Anthony : MRR, churn, activation, cohort, funnel signup → paid,
// usage par feature, distribution plan.
//
// Tout est calculé côté serveur à partir des tables Supabase :
//   - user_profiles (plan, stripe_subscription_id, updated_at, created_at)
//   - search_sessions (activité prospection)
//   - email_campaigns (activité campagnes)
//   - crm_deals (activité CRM)
//   - usage_tracking (consommation mensuelle)
//
// Query param : ?period=30 | 90 | 365 | all (default 30)
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PLANS } from '@/lib/plans';

// Helpers
function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
function isoDay(date) {
  return date.toISOString().slice(0, 10);
}
function planMrrCents(planId) {
  const p = PLANS[planId];
  if (!p || !p.price) return 0;
  // p.price est en centimes mensuel
  return p.price;
}

export async function GET(request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const url = new URL(request.url);
    const periodParam = url.searchParams.get('period') || '30';
    const periodDays = periodParam === 'all' ? 9999 : Math.max(7, parseInt(periodParam, 10) || 30);

    const admin = getSupabaseAdmin();
    const now = new Date();
    const periodStart = new Date(now.getTime() - periodDays * 86400000);
    const periodPrevStart = new Date(periodStart.getTime() - periodDays * 86400000);

    // ─ Profiles (tous) ─
    const { data: profiles = [] } = await admin
      .from('user_profiles')
      .select('id, plan, stripe_subscription_id, stripe_customer_id, created_at, updated_at');

    const profilesById = new Map((profiles || []).map((p) => [p.id, p]));

    // ─ MRR actuel ─
    // Compte tous les profils avec un plan payant ET stripe_subscription_id non null
    // (un user "free" récemment downgrade n'aura plus de sub).
    // Dérivé de PLANS (tout plan avec price>0) → inclut automatiquement
    // prospection/max et les legacy, sans liste figée à re-maintenir à chaque
    // évolution tarifaire (cause de la régression MRR post-pivot du 11/06).
    const paidPlans = Object.keys(PLANS).filter((k) => (PLANS[k]?.price || 0) > 0);
    let mrrCents = 0;
    const planCounts = Object.fromEntries(Object.keys(PLANS).map((k) => [k, 0]));
    if (planCounts.free === undefined) planCounts.free = 0;
    let paidCustomers = 0;

    for (const p of profiles || []) {
      const plan = p.plan || 'free';
      if (planCounts[plan] !== undefined) planCounts[plan] += 1;
      else planCounts.free += 1;

      if (paidPlans.includes(plan) && p.stripe_subscription_id) {
        mrrCents += planMrrCents(plan);
        paidCustomers += 1;
      }
    }
    const mrrEur = Math.round(mrrCents / 100);

    // ─ MRR mois précédent (approx) : on simule en ignorant les users
    // qui ont upgrade dans la dernière période. Approximation honnête :
    // on prend les profils créés avant periodStart qui sont aujourd'hui payants
    // et on assume qu'ils étaient déjà payants. C'est imparfait sans table
    // d'événements stripe historiques, mais donne une tendance.
    let mrrPrevCents = 0;
    for (const p of profiles || []) {
      const plan = p.plan || 'free';
      if (!paidPlans.includes(plan)) continue;
      if (!p.stripe_subscription_id) continue;
      const createdAt = new Date(p.created_at);
      // Approximation : si user créé avant periodStart, on l'inclut dans MRR n-1
      if (createdAt < periodStart) {
        mrrPrevCents += planMrrCents(plan);
      }
    }
    const mrrPrevEur = Math.round(mrrPrevCents / 100);
    const mrrDelta = mrrEur - mrrPrevEur;
    const mrrDeltaPercent = mrrPrevEur > 0 ? Math.round((mrrDelta / mrrPrevEur) * 100) : null;

    // ─ Signups sur la période ─
    const signupsPeriod = (profiles || []).filter((p) => new Date(p.created_at) >= periodStart);
    const signupsPrev = (profiles || []).filter((p) => {
      const d = new Date(p.created_at);
      return d >= periodPrevStart && d < periodStart;
    });

    // ─ Churn 30j : users qui sont free + ont eu un stripe_customer_id
    //   (donc ont déjà payé un jour) + updated_at dans les 30 derniers jours.
    //   Heuristique : c'est l'indicateur le plus fiable sans table d'events.
    const since30 = new Date(now.getTime() - 30 * 86400000);
    const churned = (profiles || []).filter((p) => {
      return (
        (p.plan === 'free' || !p.plan) &&
        p.stripe_customer_id &&
        !p.stripe_subscription_id &&
        p.updated_at &&
        new Date(p.updated_at) >= since30
      );
    });
    // Dénominateur : users payants + churned (approx base "à risque")
    const churnDenom = paidCustomers + churned.length;
    const churnRate = churnDenom > 0 ? churned.length / churnDenom : 0;

    // ─ Activité par user sur la période :
    //   - search_sessions (Prospection)
    //   - email_campaigns (Campagnes — owner_id)
    //   - crm_deals (CRM — owner_id ou user_id)
    const sinceISO = periodStart.toISOString();
    const [searchSessionsRes, campaignsRes, dealsRes] = await Promise.all([
      admin
        .from('search_sessions')
        .select('id, user_id, created_at')
        .gte('created_at', sinceISO),
      admin
        .from('email_campaigns')
        .select('id, owner_id, status, sent_count, created_at')
        .gte('created_at', sinceISO),
      admin
        .from('crm_deals')
        .select('id, owner_id, created_at')
        .gte('created_at', sinceISO),
    ]);

    const searchSessions = searchSessionsRes.data || [];
    const campaigns = campaignsRes.data || [];
    const deals = dealsRes.data || [];

    // ─ Activation rate sur période : % de users avec ≥1 action
    const activeUserIds = new Set();
    searchSessions.forEach((s) => s.user_id && activeUserIds.add(s.user_id));
    campaigns.forEach((c) => c.owner_id && activeUserIds.add(c.owner_id));
    deals.forEach((d) => d.owner_id && activeUserIds.add(d.owner_id));

    // % activation = users actifs / total users (qu'ils soient nouveaux ou existants)
    const totalUsers = profiles.length;
    const activationRate = totalUsers > 0 ? activeUserIds.size / totalUsers : 0;

    // ─ Funnel sur les signups de la période ─
    //   Signups → Activé (≥1 action) → Sub Stripe créée → Plan payant aujourd'hui
    const signupIds = new Set(signupsPeriod.map((s) => s.id));
    const signupsActive = signupsPeriod.filter((s) => activeUserIds.has(s.id));
    const signupsWithSub = signupsPeriod.filter((s) => s.stripe_customer_id);
    const signupsPaid = signupsPeriod.filter(
      (s) => paidPlans.includes(s.plan) && s.stripe_subscription_id,
    );

    const funnel = {
      signups: signupsPeriod.length,
      active: signupsActive.length,
      trial: signupsWithSub.length, // "checkout démarré"
      paid: signupsPaid.length,
    };

    // ─ Cohort table : 6 derniers mois ─
    const cohortMonths = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      cohortMonths.push({
        key: monthKey(d),
        label: d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        start: d,
        end: new Date(now.getFullYear(), now.getMonth() - i + 1, 1),
      });
    }

    // Index activité par user_id (avec date) pour calcul rapide
    const userFirstAction = new Map();
    function recordAction(uid, ts) {
      if (!uid) return;
      const d = new Date(ts);
      const cur = userFirstAction.get(uid);
      if (!cur || d < cur) userFirstAction.set(uid, d);
    }
    // Pour cohorts on a besoin d'activité sur les 6 derniers mois — refetch large
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString();
    const [ssAll, ecAll, cdAll] = await Promise.all([
      admin.from('search_sessions').select('user_id, created_at').gte('created_at', sixMonthsAgo),
      admin.from('email_campaigns').select('owner_id, created_at').gte('created_at', sixMonthsAgo),
      admin.from('crm_deals').select('owner_id, created_at').gte('created_at', sixMonthsAgo),
    ]);
    (ssAll.data || []).forEach((r) => recordAction(r.user_id, r.created_at));
    (ecAll.data || []).forEach((r) => recordAction(r.owner_id, r.created_at));
    (cdAll.data || []).forEach((r) => recordAction(r.owner_id, r.created_at));

    const cohorts = cohortMonths.map(({ key, label, start, end }) => {
      const signups = (profiles || []).filter((p) => {
        const d = new Date(p.created_at);
        return d >= start && d < end;
      });
      const total = signups.length;
      let d1 = 0;
      let d7 = 0;
      let d30 = 0;
      let paid = 0;
      for (const s of signups) {
        const created = new Date(s.created_at);
        const firstAction = userFirstAction.get(s.id);
        if (firstAction) {
          const lagDays = (firstAction - created) / 86400000;
          if (lagDays <= 1) d1 += 1;
          if (lagDays <= 7) d7 += 1;
          if (lagDays <= 30) d30 += 1;
        }
        if (paidPlans.includes(s.plan) && s.stripe_subscription_id) paid += 1;
      }
      const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);
      return {
        month: key,
        label,
        signups: total,
        d1: pct(d1),
        d7: pct(d7),
        d30: pct(d30),
        paid: pct(paid),
      };
    });

    // ─ MRR history (par mois sur 6 mois — approx) ─
    // On rebuild MRR pour chaque mois en regardant qui était "payant" à la fin
    // du mois (approximation : créé avant fin de mois + plan payant aujourd'hui
    // + stripe_subscription_id présent).
    const mrrHistory = cohortMonths.map(({ key, label, end }) => {
      let cents = 0;
      for (const p of profiles || []) {
        if (!paidPlans.includes(p.plan)) continue;
        if (!p.stripe_subscription_id) continue;
        if (new Date(p.created_at) < end) {
          cents += planMrrCents(p.plan);
        }
      }
      return { month: key, label, mrr: Math.round(cents / 100) };
    });

    // ─ Features usage sur période ─
    const featuresUsage = {
      prospection_searches: searchSessions.length,
      campaigns_created: campaigns.length,
      campaigns_sent: campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0),
      crm_deals_created: deals.length,
    };

    // ─ Plan distribution (somme = totalUsers) ─
    const planDistribution = planCounts;

    return NextResponse.json({
      period_days: periodDays === 9999 ? 'all' : periodDays,
      generated_at: now.toISOString(),
      kpis: {
        mrr_eur: mrrEur,
        mrr_delta_eur: mrrDelta,
        mrr_delta_percent: mrrDeltaPercent,
        customers_paid: paidCustomers,
        signups_period: signupsPeriod.length,
        signups_prev_period: signupsPrev.length,
        activation_rate: activationRate,
        churn_30d: churnRate,
        churned_count_30d: churned.length,
        total_users: totalUsers,
      },
      mrr_history: mrrHistory,
      funnel,
      cohorts,
      features_usage: featuresUsage,
      plan_distribution: planDistribution,
    });
  } catch (err) {
    console.error('[admin/metrics] error:', err);
    return NextResponse.json({ error: 'Erreur calcul metrics', detail: String(err.message || err) }, { status: 500 });
  }
}
