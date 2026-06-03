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

// ─────────────────────────────────────────────────────────────────────
// Kill switch global (2 niveaux : DB > ENV)
// ─────────────────────────────────────────────────────────────────────
// La DB (table app_settings, row key='autonomy_enabled') a priorité sur
// l'ENV var AUTONOMOUS_MODE_ENABLED. Permet désactivation INSTANTANÉE
// depuis mobile via :
//   - bouton dans /admin/auto-queue (toggle UI)
//   - email STOP envoyé à stop@volia.fr (parsing webhook Resend)
// Sans avoir à toucher Vercel env vars + attendre un redeploy (~2min).
//
// Logique :
//   - DB value true  → autonomy ON
//   - DB value false → autonomy OFF
//   - DB value null  → fallback sur ENV var
//   - ENV "true"/"1" → autonomy ON
//   - sinon          → autonomy OFF (safety default)
// ─────────────────────────────────────────────────────────────────────

function _envAutonomyEnabled() {
  const flag = process.env.AUTONOMOUS_MODE_ENABLED;
  return flag === 'true' || flag === '1';
}

/**
 * Vérifie si l'autonomy mode est actif (check DB + fallback ENV).
 * ASYNC. Toujours préférer cette fonction à la version sync legacy.
 *
 * @returns {Promise<{enabled: boolean, source: 'db'|'env', reason?: string}>}
 */
export async function isAutonomyEnabled() {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('app_settings')
      .select('value, notes')
      .eq('key', 'autonomy_enabled')
      .maybeSingle();
    const dbValue = data?.value;
    if (dbValue === true || dbValue === false) {
      return {
        enabled: dbValue,
        source: 'db',
        reason: data?.notes || null,
      };
    }
  } catch (err) {
    // Si la DB est down, on fallback sur ENV pour pas bloquer
    console.error('[autonomy] isAutonomyEnabled DB check failed, falling back to ENV', err.message);
  }
  return {
    enabled: _envAutonomyEnabled(),
    source: 'env',
  };
}

/**
 * Modifier le kill switch côté DB.
 * Override le ENV var (DB a priorité).
 *
 * @param {boolean|null} value - true=ON, false=OFF, null=fallback ENV
 * @param {string} [reason] - texte humain ("STOP email du 2026-06-15", "founder via UI", ...)
 * @param {string} [updatedBy] - user_id, 'system_cron', 'inbound_email', etc.
 */
export async function setAutonomyEnabled(value, reason = null, updatedBy = 'system') {
  const supabase = getSupabaseAdmin();
  const dbValue = value === null ? null : !!value;
  const { error } = await supabase
    .from('app_settings')
    .upsert(
      {
        key: 'autonomy_enabled',
        value: dbValue,
        notes: reason,
        updated_by: updatedBy,
      },
      { onConflict: 'key' }
    );
  if (error) {
    console.error('[autonomy] setAutonomyEnabled failed', error);
    throw error;
  }
  return { ok: true, value: dbValue, reason, updatedBy };
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

// ─────────────────────────────────────────────────────────────────────
// QUOTAS — caps systématiques par actionType (anti-spam, DGCCRF safety)
// ─────────────────────────────────────────────────────────────────────
// Centralisé ici pour ne pas dupliquer dans chaque cron. Si on veut
// override en runtime sans redeploy, ajouter une row dans app_settings
// key='quota_overrides' value={...} qui mergerait dessus.
//
// Ces caps comptent TOUTES les actions (pending + approved + executed)
// pour éviter qu'on génère 10 brouillons d'un coup même non publiés.
// ─────────────────────────────────────────────────────────────────────

export const DEFAULT_QUOTAS = {
  linkedin_post: { perDay: 3, perWeek: 7, perMonth: 25 },
  linkedin_founder_post: { perWeek: 2, perMonth: 6 },
  twitter_post: { perDay: 5, perWeek: 15, perMonth: 50 },
  comment_reply: { perDay: 20, perWeek: 100, perMonth: 300 },
  cold_email_send: { perDay: 100, perWeek: 500, perMonth: 2000 },
  blog_publish: { perWeek: 2, perMonth: 6 },
  newsletter_send: { perMonth: 2 },
  auto_changelog_entry: { perDay: 10 },
  comment_volia_mention_reply: { perDay: 10, perWeek: 50 },
};

/**
 * Vérifie le quota pour un actionType. Throw si dépassé.
 * À appeler AVANT logAutonomousAction dans chaque cron.
 *
 * @param {string} actionType
 * @param {object} [overrides] - override limits inline si besoin
 * @throws {Error} si quota dépassé (avec détails)
 */
export async function enforceQuotaOrThrow(actionType, overrides = {}) {
  const limits = { ...(DEFAULT_QUOTAS[actionType] || {}), ...overrides };
  if (Object.keys(limits).length === 0) return; // pas de quota défini = unlimited
  const check = await checkActionQuota(actionType, limits);
  if (!check.allowed) {
    const err = new Error(`quota_exceeded: ${check.reason}`);
    err.code = 'QUOTA_EXCEEDED';
    err.detail = check;
    throw err;
  }
}

/**
 * Stats d'utilisation des quotas par actionType (pour weekly audit + UI).
 */
export async function getQuotaUsageReport() {
  const report = {};
  for (const [actionType, limits] of Object.entries(DEFAULT_QUOTAS)) {
    const usage = {};
    if (limits.perDay) {
      usage.day = {
        current: await countRecentActions(actionType, 24, ['pending', 'approved', 'executed']),
        limit: limits.perDay,
      };
    }
    if (limits.perWeek) {
      usage.week = {
        current: await countRecentActions(actionType, 168, ['pending', 'approved', 'executed']),
        limit: limits.perWeek,
      };
    }
    if (limits.perMonth) {
      usage.month = {
        current: await countRecentActions(actionType, 720, ['pending', 'approved', 'executed']),
        limit: limits.perMonth,
      };
    }
    report[actionType] = usage;
  }
  return report;
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
