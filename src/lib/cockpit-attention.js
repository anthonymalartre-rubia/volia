// ─────────────────────────────────────────────────────────────────────
// src/lib/cockpit-attention.js — Cockpit founder daily attention
// ─────────────────────────────────────────────────────────────────────
// 2 outputs :
//   - alerts : zone rouge en tête. Cron failed, autonomy off, quotas
//     près d'éclater. Le founder DOIT voir ça en arrivant.
//   - inbox  : compteurs "what's on my plate today". Cliquables vers les
//     pages concernées.
//
// Architecture : 1 seul call API → tout chargé en parallèle (Promise.all)
// → cockpit reste rapide même si 8+ tables interrogées.
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';
import { isAutonomyEnabled } from './autonomy';
import { isGrowthLoopsEnabled } from './growth-loops-base';

// ─── COST MAP (€ par action) ────────────────────────────────────────
// Synchronisé avec lib/meta-autonomy.js — duplicate volontaire pour
// éviter dépendance circulaire.
const COST_PER_ACTION_EUR = {
  linkedin_post: 0.02,
  github_issue_create: 0.05,
  faq_reply_proposal: 0.03,
  changelog_entry: 0.04,
  blog_post_draft: 0.30,
  newsletter_send: 0.01,
  bug_triage_from_email: 0.02,
  feature_request_logged: 0.01,
  reactivation_email_send: 0.001,
  github_pr_fix: 0.50,
  trial_relance_email_send: 0.001,
  dogfood_outreach_run: 0.10,
  demo_bot_message: 0.02,
  support_bot_message: 0.02,
  auto_faq_reply: 0.05,
  stuck_user_help_email: 0.001,
  checkout_recovery_email: 0.001,
  usage_decline_alert_email: 0.001,
  hot_lead_promo_email: 0.001,
  milestone_review_email: 0.001,
  linkedin_dm_outbound: 0.001,
  weekly_value_report_email: 0.001,
  nps_auto_send: 0.001,
  nps_followup_send: 0.001,
  weekly_autonomy_review: 0.10,
};

// Google Places API New : ~0.032€ par Text Search request (Essentials SKU)
const GOOGLE_PLACES_EUR_PER_REQUEST = 0.032;
// Resend : free tier 3000/mois puis $0.0004/email
const RESEND_EUR_PER_EMAIL = 0.0004;
const RESEND_FREE_TIER_MONTH = 3000;

const SEVERITY = {
  CRITICAL: 'critical', // rouge — action requise immédiate
  WARNING: 'warning',   // amber — à surveiller
  INFO: 'info',         // bleu — pour info
};

// ─── ALERTS ──────────────────────────────────────────────────────────

async function checkAutonomyState() {
  const alerts = [];
  const autonomyState = await isAutonomyEnabled();
  if (!autonomyState.enabled) {
    alerts.push({
      severity: SEVERITY.CRITICAL,
      title: 'Master autonomy : OFF',
      message: `Toutes les 25 boucles autonomes sont stoppées. Raison : ${autonomyState.reason || 'master switch off'}`,
      action_url: '/admin/auto-queue',
      action_label: 'Réactiver',
    });
  }
  const growthState = await isGrowthLoopsEnabled();
  if (!growthState.enabled && autonomyState.enabled) {
    alerts.push({
      severity: SEVERITY.WARNING,
      title: 'Growth loops : OFF',
      message: `Les 9 boucles Growth sont stoppées (master autonomy = ON, mais growth_loops_enabled = false)`,
      action_url: '/admin/auto-queue',
      action_label: 'Réactiver',
    });
  }
  return alerts;
}

async function checkRecentFailures(supabase) {
  const alerts = [];
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: failures } = await supabase
    .from('autonomous_actions')
    .select('action_type, source, created_at')
    .eq('status', 'failed')
    .gte('created_at', since);

  if (failures && failures.length > 0) {
    // Groupe par action_type
    const byType = failures.reduce((acc, f) => {
      acc[f.action_type] = (acc[f.action_type] || 0) + 1;
      return acc;
    }, {});
    const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
    alerts.push({
      severity: failures.length >= 5 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
      title: `${failures.length} actions failed dernières 24h`,
      message: `Type le plus impacté : ${topType[0]} (${topType[1]}x). Vérifie les logs.`,
      action_url: '/admin/auto-queue',
      action_label: 'Voir queue',
    });
  }
  return alerts;
}

async function checkStripeWebhookHealth(supabase) {
  const alerts = [];
  // Dernier webhook Stripe reçu (via autonomous_actions ou table dédiée si existe)
  // On utilise une heuristique : dernier checkout_recovery ou subscription event capté
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
  const { count: recentSubChanges } = await supabase
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })
    .gte('updated_at', sevenDaysAgo)
    .not('stripe_subscription_id', 'is', null);

  // Pas fiable comme check Stripe directement. Skip pour V1.
  // Future : ajouter une table stripe_webhook_events_log avec last_seen_at
  return alerts;
}

async function checkQuotaUsage(supabase) {
  const alerts = [];
  // Compte actions par type dernière 24h vs quotas connus
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: recent } = await supabase
    .from('autonomous_actions')
    .select('action_type')
    .gte('created_at', since);

  if (!recent || recent.length === 0) return alerts;

  const byType = recent.reduce((acc, r) => {
    acc[r.action_type] = (acc[r.action_type] || 0) + 1;
    return acc;
  }, {});

  // Quotas hardcoded (synchronisé avec les libs)
  const QUOTAS = {
    demo_bot_message: 500,
    hot_lead_promo_email: 30,
    auto_faq_reply: 30,
    stuck_user_help_email: 100,
    checkout_recovery_email: 50,
    trial_relance_email_send: 200,
    reactivation_email_send: 100,
    weekly_value_report_email: 300,
    nps_auto_send: 50,
    linkedin_dm_outbound: 20, // perWeek
  };

  for (const [type, count] of Object.entries(byType)) {
    const quota = QUOTAS[type];
    if (!quota) continue;
    const pct = (count / quota) * 100;
    if (pct >= 90) {
      alerts.push({
        severity: SEVERITY.CRITICAL,
        title: `Quota ${type} à ${Math.round(pct)}%`,
        message: `${count}/${quota} actions aujourd'hui. Le cron va bloquer si on dépasse.`,
        action_url: '/admin/auto-queue',
        action_label: 'Voir détail',
      });
    } else if (pct >= 75) {
      alerts.push({
        severity: SEVERITY.WARNING,
        title: `Quota ${type} à ${Math.round(pct)}%`,
        message: `${count}/${quota} actions aujourd'hui.`,
        action_url: '/admin/auto-queue',
        action_label: 'Voir',
      });
    }
  }
  return alerts;
}

async function checkSentryUnresolved(supabase) {
  const alerts = [];
  // Issues GitHub volia-autonomy open >= 5
  // On utilise autonomous_actions action_type='github_issue_create' status='executed'
  // moins les recommandations 'shipped'
  const since = new Date(Date.now() - 30 * 86400 * 1000).toISOString();
  const { count: openIssues } = await supabase
    .from('autonomous_actions')
    .select('id', { count: 'exact', head: true })
    .eq('action_type', 'github_issue_create')
    .gte('created_at', since);

  if (openIssues && openIssues >= 10) {
    alerts.push({
      severity: SEVERITY.WARNING,
      title: `${openIssues} issues GitHub volia-autonomy ces 30j`,
      message: 'Vérifie sur GitHub si certaines sont à reviewer/résoudre manuellement.',
      action_url: 'https://github.com/anthonymalartre-rubia/volia/issues?q=is%3Aopen+label%3Avolia-autonomy',
      action_label: 'Voir GitHub',
    });
  }
  return alerts;
}

// ─── INBOX ───────────────────────────────────────────────────────────

async function buildInbox(supabase) {
  const inbox = [];
  const since30d = new Date(Date.now() - 30 * 86400 * 1000).toISOString();

  // 1. LinkedIn brouillons pending (auto-content-proposer)
  const { count: linkedinPending } = await supabase
    .from('autonomous_actions')
    .select('id', { count: 'exact', head: true })
    .eq('action_type', 'linkedin_post')
    .eq('status', 'pending');
  inbox.push({
    key: 'linkedin_drafts',
    label: 'Brouillons LinkedIn à approuver',
    count: linkedinPending || 0,
    href: '/admin/auto-queue',
    icon: 'Briefcase',
    color: 'blue',
    priority: linkedinPending > 0 ? 1 : 99,
  });

  // 2. Recos Claude pending
  const { count: recosPending } = await supabase
    .from('autonomy_recommendations')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');
  inbox.push({
    key: 'recommendations',
    label: 'Recos Claude à valider',
    count: recosPending || 0,
    href: '/admin/recommendations',
    icon: 'Lightbulb',
    color: 'amber',
    priority: recosPending > 0 ? 2 : 99,
  });

  // 3. LinkedIn DMs pending
  let liDmPending = 0;
  try {
    const { count } = await supabase
      .from('linkedin_dm_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    liDmPending = count || 0;
  } catch {}
  inbox.push({
    key: 'linkedin_dms',
    label: 'DMs LinkedIn à envoyer',
    count: liDmPending,
    href: '/admin/linkedin-dm-queue',
    icon: 'MessageSquare',
    color: 'indigo',
    priority: liDmPending > 0 ? 3 : 99,
  });

  // 4. Feedback emails non classifiés
  let feedbackPending = 0;
  try {
    const { count } = await supabase
      .from('inbound_feedback_emails')
      .select('id', { count: 'exact', head: true })
      .is('classified_at', null)
      .gte('received_at', since30d);
    feedbackPending = count || 0;
  } catch {}
  inbox.push({
    key: 'feedback_emails',
    label: 'Emails contact@ à traiter',
    count: feedbackPending,
    href: '/admin',
    icon: 'Mail',
    color: 'rose',
    priority: feedbackPending > 0 ? 1 : 99,
  });

  // 5. Hot leads non contactés (score >= 80)
  let hotLeadsCount = 0;
  try {
    const { count } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .gte('lead_score', 80)
      .is('churned_at', null)
      .is('trial_converted_at', null);
    hotLeadsCount = count || 0;
  } catch {}
  inbox.push({
    key: 'hot_leads',
    label: 'Hot leads à contacter (score ≥80)',
    count: hotLeadsCount,
    href: '/admin/lead-scoring',
    icon: 'Flame',
    color: 'orange',
    priority: hotLeadsCount > 0 ? 2 : 99,
  });

  // 6. Listes dogfood prêtes (créées dans la sem, non encore exploitées)
  let dogfoodReady = 0;
  try {
    const weekAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
    const { count } = await supabase
      .from('prospect_lists')
      .select('id', { count: 'exact', head: true })
      .eq('source', 'cron:dogfood-outreach')
      .gte('created_at', weekAgo);
    dogfoodReady = count || 0;
  } catch {}
  inbox.push({
    key: 'dogfood_lists',
    label: 'Listes dogfood prêtes à enrichir',
    count: dogfoodReady,
    href: '/admin/prospection',
    icon: 'ListChecks',
    color: 'teal',
    priority: dogfoodReady > 0 ? 4 : 99,
  });

  // 7. Achievements unlocked sans review (entrées approvées hors LinkedIn)
  const { count: approvedNotExecuted } = await supabase
    .from('autonomous_actions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved');
  inbox.push({
    key: 'approved_pending',
    label: 'Actions approuvées en attente exec',
    count: approvedNotExecuted || 0,
    href: '/admin/auto-queue',
    icon: 'Bot',
    color: 'violet',
    priority: approvedNotExecuted > 0 ? 5 : 99,
  });

  // Tri : priorité ASC, count DESC
  inbox.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.count - a.count;
  });

  return inbox;
}

// ─── COST TRACKING ───────────────────────────────────────────────────

async function computeCosts(supabase) {
  const now = new Date();
  const dayStart = new Date(now); dayStart.setUTCHours(0, 0, 0, 0);
  const monthStart = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const currentMonthStr = now.toISOString().slice(0, 7);

  // ─── ANTHROPIC : depuis autonomous_actions (proxy) ───────────────
  const [{ data: dayActions }, { data: monthActions }] = await Promise.all([
    supabase
      .from('autonomous_actions')
      .select('action_type')
      .gte('created_at', dayStart.toISOString()),
    supabase
      .from('autonomous_actions')
      .select('action_type')
      .gte('created_at', monthStart.toISOString()),
  ]);

  function sumActionsCost(rows) {
    let total = 0;
    for (const r of rows || []) {
      total += COST_PER_ACTION_EUR[r.action_type] || 0;
    }
    return total;
  }
  const anthropicDay = sumActionsCost(dayActions);
  const anthropicMonth = sumActionsCost(monthActions);

  // ─── GOOGLE PLACES : depuis usage_tracking searches ──────────────
  const { data: usageRows } = await supabase
    .from('usage_tracking')
    .select('searches')
    .eq('month', currentMonthStr);
  const searchesMonth = (usageRows || []).reduce((sum, r) => sum + (r.searches || 0), 0);
  const googlePlacesMonth = searchesMonth * GOOGLE_PLACES_EUR_PER_REQUEST;
  // approximation jour (uniforme sur mois écoulé)
  const dayOfMonth = now.getUTCDate();
  const googlePlacesDay = dayOfMonth > 0 ? googlePlacesMonth / dayOfMonth : 0;

  // ─── RESEND : email_sends + autonomous emails ────────────────────
  let resendEmailsMonth = 0;
  try {
    const { count } = await supabase
      .from('email_sends')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString());
    resendEmailsMonth = count || 0;
  } catch {}

  // Estime emails autonomy aussi (chaque email_send autonomy)
  const autonomyEmailTypes = [
    'newsletter_send', 'reactivation_email_send', 'trial_relance_email_send',
    'stuck_user_help_email', 'checkout_recovery_email', 'usage_decline_alert_email',
    'hot_lead_promo_email', 'milestone_review_email', 'weekly_value_report_email',
    'nps_auto_send', 'nps_followup_send', 'auto_faq_reply',
  ];
  const autonomyEmailsMonth = (monthActions || []).filter((r) =>
    autonomyEmailTypes.includes(r.action_type)
  ).length;

  const totalEmailsMonth = resendEmailsMonth + autonomyEmailsMonth;
  const billableEmailsMonth = Math.max(0, totalEmailsMonth - RESEND_FREE_TIER_MONTH);
  const resendMonth = billableEmailsMonth * RESEND_EUR_PER_EMAIL;
  const resendDay = dayOfMonth > 0 ? resendMonth / dayOfMonth : 0;

  // ─── TOTAUX ───────────────────────────────────────────────────────
  const totalDay = anthropicDay + googlePlacesDay + resendDay;
  const totalMonth = anthropicMonth + googlePlacesMonth + resendMonth;

  return {
    day: {
      total_eur: Number(totalDay.toFixed(2)),
      anthropic_eur: Number(anthropicDay.toFixed(2)),
      google_places_eur: Number(googlePlacesDay.toFixed(2)),
      resend_eur: Number(resendDay.toFixed(2)),
      actions_count: (dayActions || []).length,
    },
    month: {
      total_eur: Number(totalMonth.toFixed(2)),
      anthropic_eur: Number(anthropicMonth.toFixed(2)),
      google_places_eur: Number(googlePlacesMonth.toFixed(2)),
      resend_eur: Number(resendMonth.toFixed(2)),
      actions_count: (monthActions || []).length,
      searches_count: searchesMonth,
      emails_count: totalEmailsMonth,
      emails_billable: billableEmailsMonth,
    },
  };
}

// ─── LIVE ACTIVITY FEED ──────────────────────────────────────────────

async function getRecentActivity(supabase, limit = 10) {
  // Mix de signaux : signups + paiements + churn + actions autonomy + feedback
  const since = new Date(Date.now() - 7 * 86400 * 1000).toISOString();

  const events = [];

  // 1. Signups récents (auth.users via user_profiles created_at proxy)
  try {
    const { data: signups } = await supabase
      .from('user_profiles')
      .select('id, created_at, plan')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(limit);
    for (const s of signups || []) {
      events.push({
        type: 'signup',
        icon: 'UserPlus',
        color: 'emerald',
        at: s.created_at,
        message: `Nouveau signup (${s.plan || 'free'})`,
        meta: { user_id: s.id, plan: s.plan },
      });
    }
  } catch {}

  // 2. Conversions trial → paid
  try {
    const { data: conversions } = await supabase
      .from('user_profiles')
      .select('id, trial_converted_at, plan')
      .gte('trial_converted_at', since)
      .order('trial_converted_at', { ascending: false })
      .limit(limit);
    for (const c of conversions || []) {
      events.push({
        type: 'conversion',
        icon: 'DollarSign',
        color: 'amber',
        at: c.trial_converted_at,
        message: `Conversion trial → ${c.plan}`,
        meta: { user_id: c.id, plan: c.plan },
      });
    }
  } catch {}

  // 3. Churns
  try {
    const { data: churns } = await supabase
      .from('user_profiles')
      .select('id, churned_at, plan')
      .gte('churned_at', since)
      .order('churned_at', { ascending: false })
      .limit(limit);
    for (const c of churns || []) {
      events.push({
        type: 'churn',
        icon: 'TrendingDown',
        color: 'red',
        at: c.churned_at,
        message: `Churn (${c.plan})`,
        meta: { user_id: c.id, plan: c.plan },
      });
    }
  } catch {}

  // 4. Actions autonomy executées
  try {
    const { data: actions } = await supabase
      .from('autonomous_actions')
      .select('id, action_type, status, preview, created_at, executed_at')
      .in('status', ['executed', 'approved'])
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(limit * 2);
    for (const a of actions || []) {
      events.push({
        type: 'autonomy',
        icon: 'Bot',
        color: 'violet',
        at: a.executed_at || a.created_at,
        message: a.preview || a.action_type,
        meta: { action_type: a.action_type, status: a.status },
      });
    }
  } catch {}

  // 5. Feedback emails reçus
  try {
    const { data: feedbacks } = await supabase
      .from('inbound_feedback_emails')
      .select('id, from_email, subject, received_at, category')
      .gte('received_at', since)
      .order('received_at', { ascending: false })
      .limit(limit);
    for (const f of feedbacks || []) {
      events.push({
        type: 'feedback',
        icon: 'Mail',
        color: 'rose',
        at: f.received_at,
        message: `${f.from_email} → ${f.subject || '(sans sujet)'} ${f.category ? `[${f.category}]` : ''}`,
        meta: { from: f.from_email, category: f.category },
      });
    }
  } catch {}

  // Tri global par date DESC, limit
  events.sort((a, b) => new Date(b.at) - new Date(a.at));
  return events.slice(0, limit);
}

// ─── PUBLIC API ──────────────────────────────────────────────────────

export async function getCockpitAttention() {
  const supabase = getSupabaseAdmin();

  const [
    autonomyAlerts,
    failureAlerts,
    quotaAlerts,
    sentryAlerts,
    inbox,
    costs,
    activity,
  ] = await Promise.all([
    checkAutonomyState(),
    checkRecentFailures(supabase),
    checkQuotaUsage(supabase),
    checkSentryUnresolved(supabase),
    buildInbox(supabase),
    computeCosts(supabase),
    getRecentActivity(supabase, 10),
  ]);

  const alerts = [
    ...autonomyAlerts,
    ...failureAlerts,
    ...quotaAlerts,
    ...sentryAlerts,
  ];

  // Tri par sévérité
  const sevOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);

  const totalInboxCount = inbox.reduce((sum, i) => sum + i.count, 0);
  const activeInbox = inbox.filter((i) => i.count > 0);

  return {
    ok: true,
    generated_at: new Date().toISOString(),
    alerts,
    alerts_count: alerts.length,
    alerts_critical_count: alerts.filter((a) => a.severity === 'critical').length,
    inbox,
    inbox_active: activeInbox,
    inbox_total_count: totalInboxCount,
    costs,
    activity,
    has_anything: alerts.length > 0 || totalInboxCount > 0,
  };
}
