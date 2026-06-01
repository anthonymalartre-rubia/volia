// ─────────────────────────────────────────────────────────────────────
// src/lib/autonomy.js — Module central pour les boucles auto-pilote
// ─────────────────────────────────────────────────────────────────────
//
// Cf. docs/autonomy/00-PLAN.md pour la stratégie globale.
//
// Tous les crons "intelligents" (auto-content, auto-outreach, sentry-digest,
// blog-auto-write, etc.) DOIVENT passer par ce module pour :
//   - Vérifier que l'autonomy mode est activé (kill switch global)
//   - Logger leurs actions dans `autonomous_actions` (audit trail)
//   - Demander une approbation si action yellow-flag (medium risk)
//
// Pattern d'usage côté cron :
//
//   import { isAutonomyEnabled, logAutonomousAction } from '@/lib/autonomy';
//
//   if (!isAutonomyEnabled()) {
//     return NextResponse.json({ skipped: 'autonomy_disabled' });
//   }
//
//   // Action low-risk : log + execute direct
//   await logAutonomousAction({
//     actionType: 'auto_changelog_entry',
//     source: 'cron/auto-changelog',
//     riskLevel: 'low',
//     payload: { commit_sha: '...', changelog_text: '...' },
//     autoExecute: true,
//   });
//
//   // Action medium-risk : log en pending, sera exécutée après approval UI
//   await logAutonomousAction({
//     actionType: 'linkedin_post',
//     source: 'cron/auto-content',
//     riskLevel: 'medium',
//     payload: { text: '...', media_url: '...' },
//     preview: 'Post LinkedIn : "Comment on a bâti..."',
//     rationale: 'Pas posté depuis 4 jours, événement récent : étude publiée',
//     autoExecute: false,
//     expiresInHours: 48, // auto-cancel après 48h si pas approuvé
//   });
//
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';

// Kill switch global — défini comme env var Vercel.
// Defaulte à 'false' (autonomy OFF) en l'absence du flag, pour sécurité.
// Pour activer en prod : ajouter AUTONOMOUS_MODE_ENABLED=true sur Vercel.
export function isAutonomyEnabled() {
  const flag = process.env.AUTONOMOUS_MODE_ENABLED;
  return flag === 'true' || flag === '1';
}

// Helper UX : message standardisé quand autonomy désactivée
export function autonomyDisabledResponse(actionDescription) {
  return {
    skipped: true,
    reason: 'autonomy_disabled',
    message: `Action "${actionDescription}" non exécutée car AUTONOMOUS_MODE_ENABLED != true. Cf. docs/autonomy/00-PLAN.md.`,
  };
}

/**
 * Log une action autonome dans la table autonomous_actions.
 * Si autoExecute=true ET riskLevel='low' → status='executed' direct.
 * Sinon → status='pending' (attente d'approval via /admin/auto-queue).
 *
 * @param {object} options
 * @param {string} options.actionType - ex: 'linkedin_post', 'cold_email_send'
 * @param {string} options.source - ex: 'cron/auto-content-proposer'
 * @param {'low'|'medium'|'high'} options.riskLevel
 * @param {object} options.payload - data brute de l'action
 * @param {string} [options.preview] - texte court affiché dans approval queue
 * @param {string} [options.rationale] - pourquoi l'IA propose cette action
 * @param {boolean} [options.autoExecute=false] - exécution directe (low-risk only)
 * @param {number} [options.expiresInHours=72] - auto-cancel si pas approuvé
 * @param {string} [options.userId] - user concerné (NULL si global Volia)
 * @returns {Promise<{id: string, status: string}>}
 */
export async function logAutonomousAction({
  actionType,
  source,
  riskLevel = 'medium',
  payload = {},
  preview = null,
  rationale = null,
  autoExecute = false,
  expiresInHours = 72,
  userId = null,
}) {
  const supabase = getSupabaseAdmin();

  // Vérification cohérence : autoExecute seulement valide si low-risk
  if (autoExecute && riskLevel !== 'low') {
    throw new Error(
      `[autonomy] autoExecute=true requires riskLevel='low', got '${riskLevel}'. ` +
      `Use riskLevel='low' for repetitive low-risk actions only.`
    );
  }

  // Calcul expires_at (auto-cancel si pas approuvé à temps)
  const expiresAt = expiresInHours
    ? new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString()
    : null;

  // Status initial : 'executed' si autoExecute + low, sinon 'pending'
  const initialStatus = autoExecute && riskLevel === 'low' ? 'executed' : 'pending';
  const executedAt = initialStatus === 'executed' ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from('autonomous_actions')
    .insert({
      action_type: actionType,
      source,
      risk_level: riskLevel,
      status: initialStatus,
      payload,
      preview,
      rationale,
      expires_at: expiresAt,
      executed_at: executedAt,
      user_id: userId,
    })
    .select('id, status')
    .single();

  if (error) {
    console.error('[autonomy] logAction error', error);
    throw error;
  }

  return data;
}

/**
 * Récupère la liste des actions en attente d'approbation.
 * Utilisée par la page /admin/auto-queue.
 *
 * @param {object} [options]
 * @param {number} [options.limit=50]
 * @returns {Promise<Array>}
 */
export async function getApprovalQueue({ limit = 50 } = {}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('autonomous_actions')
    .select('*')
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[autonomy] getApprovalQueue error', error);
    return [];
  }
  return data || [];
}

/**
 * Approuver une action pending. Update status='approved' + executed_at=now.
 * NOTE : l'exécution réelle de l'action (ex: appel API LinkedIn) est faite
 * par le cron qui consomme la queue OU par un handler dédié.
 * Ici on marque juste comme "go".
 *
 * @param {string} actionId
 * @param {string} approverUserId
 * @returns {Promise<{success: boolean, action?: object}>}
 */
export async function approveAction(actionId, approverUserId) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('autonomous_actions')
    .update({
      status: 'approved',
      approved_by: approverUserId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', actionId)
    .eq('status', 'pending') // ne pas re-approuver une action déjà traitée
    .select()
    .single();

  if (error) {
    console.error('[autonomy] approveAction error', error);
    return { success: false, error: error.message };
  }
  return { success: true, action: data };
}

/**
 * Rejeter une action pending.
 * @param {string} actionId
 * @param {string} approverUserId
 * @param {string} [reason]
 */
export async function rejectAction(actionId, approverUserId, reason = null) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('autonomous_actions')
    .update({
      status: 'rejected',
      approved_by: approverUserId, // même champ = qui a tranché
      approved_at: new Date().toISOString(),
      rejected_reason: reason,
    })
    .eq('id', actionId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    console.error('[autonomy] rejectAction error', error);
    return { success: false, error: error.message };
  }
  return { success: true, action: data };
}

/**
 * Marquer une action approved comme effectivement exécutée (post-API call).
 * @param {string} actionId
 * @param {object} [result] - response de l'API externe (LinkedIn post ID, etc.)
 */
export async function markActionExecuted(actionId, result = {}) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('autonomous_actions')
    .update({
      status: 'executed',
      executed_at: new Date().toISOString(),
      result,
    })
    .eq('id', actionId);
  if (error) console.error('[autonomy] markActionExecuted error', error);
}

/**
 * Marquer une action approved comme failed (post-erreur API).
 * @param {string} actionId
 * @param {string} errorMessage
 */
export async function markActionFailed(actionId, errorMessage) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('autonomous_actions')
    .update({
      status: 'failed',
      executed_at: new Date().toISOString(),
      error: errorMessage,
    })
    .eq('id', actionId);
  if (error) console.error('[autonomy] markActionFailed error', error);
}

/**
 * Compter les actions d'un type donné dans la dernière fenêtre temporelle.
 * Utilisé pour throttling : "max 5 LinkedIn posts par semaine".
 *
 * @param {string} actionType
 * @param {number} windowHours - fenêtre en heures (ex: 168 pour 7 jours)
 * @param {string[]} [statuses=['executed']] - quels statuts compter
 * @returns {Promise<number>}
 */
export async function countRecentActions(actionType, windowHours, statuses = ['executed']) {
  const supabase = getSupabaseAdmin();
  const since = new Date(Date.now() - windowHours * 3600 * 1000).toISOString();

  const { count } = await supabase
    .from('autonomous_actions')
    .select('id', { count: 'exact', head: true })
    .eq('action_type', actionType)
    .in('status', statuses)
    .gte('created_at', since);

  return count || 0;
}

/**
 * Helper de throttling : check si on a dépassé le quota pour un type d'action.
 *
 * @param {string} actionType
 * @param {object} limits - { perDay?: number, perWeek?: number, perMonth?: number }
 * @returns {Promise<{allowed: boolean, reason?: string, current?: object}>}
 */
export async function checkActionQuota(actionType, limits = {}) {
  const checks = [];

  if (limits.perDay) {
    const count = await countRecentActions(actionType, 24);
    checks.push({ window: 'day', limit: limits.perDay, current: count });
  }
  if (limits.perWeek) {
    const count = await countRecentActions(actionType, 24 * 7);
    checks.push({ window: 'week', limit: limits.perWeek, current: count });
  }
  if (limits.perMonth) {
    const count = await countRecentActions(actionType, 24 * 30);
    checks.push({ window: 'month', limit: limits.perMonth, current: count });
  }

  const breached = checks.find((c) => c.current >= c.limit);
  if (breached) {
    return {
      allowed: false,
      reason: `Quota dépassé : ${breached.current}/${breached.limit} actions "${actionType}" cette ${breached.window === 'day' ? 'journée' : breached.window === 'week' ? 'semaine' : 'mois'}.`,
      current: checks,
    };
  }
  return { allowed: true, current: checks };
}

/**
 * Cron helper : cancel toutes les actions pending qui ont dépassé leur expires_at.
 * À appeler dans un cron quotidien (ex: cron/cleanup-autonomous-actions).
 */
export async function cancelExpiredActions() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('autonomous_actions')
    .update({ status: 'cancelled' })
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString())
    .select('id');

  if (error) {
    console.error('[autonomy] cancelExpiredActions error', error);
    return { cancelled: 0 };
  }
  return { cancelled: (data || []).length };
}
