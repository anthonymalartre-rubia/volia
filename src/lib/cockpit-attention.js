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

// ─── PUBLIC API ──────────────────────────────────────────────────────

export async function getCockpitAttention() {
  const supabase = getSupabaseAdmin();

  const [
    autonomyAlerts,
    failureAlerts,
    quotaAlerts,
    sentryAlerts,
    inbox,
  ] = await Promise.all([
    checkAutonomyState(),
    checkRecentFailures(supabase),
    checkQuotaUsage(supabase),
    checkSentryUnresolved(supabase),
    buildInbox(supabase),
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
    has_anything: alerts.length > 0 || totalInboxCount > 0,
  };
}
