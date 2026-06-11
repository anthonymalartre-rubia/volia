// ─────────────────────────────────────────────────────────────────────
// Volia Project — helpers partagés (gating, stats, activité)
// ─────────────────────────────────────────────────────────────────────
// Module de gestion de projets de la suite Volia. Inspiré du modèle
// fonctionnel d'EZProject mais volontairement minimal : projets +
// tâches (jalon = tâche étoilée), livrables, partage client par token.
// ─────────────────────────────────────────────────────────────────────

// Pivot freemium (11 juin 2026) : Volia Project est ouvert à TOUS les
// plans. Différenciateur = quota de projets actifs (plans.js
// limits.projects_active : free/prospection = 1, MAX = illimité —
// enforcement dans lib/module-quotas.js).
export const PROJECT_ALLOWED_PLANS = [
  'free', 'prospection', 'max',
  'solo', 'pro', 'business', 'enterprise', 'enterprise_legacy',
];

export const PROJECT_COLORS = ['violet', 'blue', 'emerald', 'amber', 'rose', 'cyan'];

export const PROJECT_STATUSES = ['active', 'done', 'archived'];
export const TASK_STATUSES = ['todo', 'doing', 'done'];

/**
 * Vérifie que l'utilisateur a accès à Volia Project.
 * Freemium : tout user authentifié avec un profil a accès.
 */
export async function checkProjectAccess(supabase, userId) {
  if (!supabase || !userId) return false;
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('plan, trial_plan, trial_started_at, trial_ends_at, trial_converted_at')
    .eq('id', userId)
    .maybeSingle();
  return !error && !!profile;
}

/**
 * Stats d'un projet à partir de ses tâches.
 * Retourne { total, done, progress (0-100), overdue, nextDue, milestones: {total, done} }.
 */
export function computeProjectStats(tasks = []) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const now = Date.now();
  const open = tasks.filter((t) => t.status !== 'done');
  const overdue = open.filter((t) => t.due_at && new Date(t.due_at).getTime() < now).length;
  const upcoming = open
    .filter((t) => t.due_at && new Date(t.due_at).getTime() >= now)
    .sort((a, b) => new Date(a.due_at) - new Date(b.due_at));
  const milestones = tasks.filter((t) => t.is_milestone);
  return {
    total,
    done,
    progress: total === 0 ? 0 : Math.round((done / total) * 100),
    overdue,
    nextDue: upcoming[0]?.due_at || null,
    milestones: { total: milestones.length, done: milestones.filter((t) => t.status === 'done').length },
  };
}

/**
 * Journal d'activité — best-effort, ne casse jamais la route appelante.
 * actions : project_created, task_created, task_done, task_moved,
 * comment_added, share_created, deliverable_delivered, ...
 */
export async function logProjectActivity(supabase, { projectId, userId, action, metadata = {} }) {
  if (!supabase || !projectId || !action) return;
  try {
    await supabase.from('project_activity').insert({
      project_id: projectId,
      user_id: userId || null,
      action,
      metadata,
    });
  } catch (err) {
    console.error('[projects] activity log error', action, err?.message);
  }
}

/**
 * Construit les tâches d'un projet depuis un template
 * (tasks jsonb : [{title, is_milestone, offset_days}]).
 * offset_days → due_at relatif à la création.
 */
export function buildTasksFromTemplate(template, projectId) {
  const list = Array.isArray(template?.tasks) ? template.tasks : [];
  const base = Date.now();
  return list
    .filter((t) => t && typeof t.title === 'string' && t.title.trim())
    .slice(0, 100)
    .map((t, i) => ({
      project_id: projectId,
      title: t.title.trim().slice(0, 300),
      is_milestone: Boolean(t.is_milestone),
      status: 'todo',
      position: i,
      due_at: Number.isFinite(t.offset_days)
        ? new Date(base + t.offset_days * 86400000).toISOString()
        : null,
    }));
}
