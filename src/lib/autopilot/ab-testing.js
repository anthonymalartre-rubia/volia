// ─────────────────────────────────────────────────────────────────────
// src/lib/autopilot/ab-testing.js — Phase 3.1 subject variants
// ─────────────────────────────────────────────────────────────────────
// Permet d'A/B tester les subject lines des emails Autopilot.
//
// Schema template (backward compatible) :
//
//   step.subject = "Salut {{first_name}}"                  // V1 : string
//   step.subject = [                                       // V2 : array variants
//     { id: 'A', text: '{{first_name}}, on parle 30 sec ?' },
//     { id: 'B', text: 'Pas pour vous mais bon...' },
//     { id: 'C', text: '{{company}} cherche encore ?' },
//   ]
//
// Algorithme distribution :
//   1. Pendant la phase EXPLORATION (<MIN_SAMPLE_PER_VARIANT par variant),
//      on distribue round-robin déterministe via hash(execution.id) % N.
//   2. Une fois MIN_SAMPLE atteint sur chaque variant, on évalue le
//      winner via computeWinner() (analyse form_submitted_rate par
//      variant), puis on stocke workflow.metrics_cache.ab_winners[stepIdx]
//      = winner_id.
//   3. Après designation winner, 90% du traffic va au winner, 10% reste
//      sur les autres pour explorer (anti-bias).
//
// Métriques utilisées pour winner :
//   - form_submission_rate (proxy d'engagement le plus fiable)
//   - Si pas de form submission après 14j → fallback sur unique opens
//     (Phase 3.2 — webhook Resend opens nécessaire)
// ─────────────────────────────────────────────────────────────────────

const MIN_SAMPLE_PER_VARIANT = 30;     // ~100 emails pour 3 variants
const EXPLOIT_RATIO = 0.9;             // 90% au winner, 10% explore

/**
 * Hash déterministe d'une string en int.
 */
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & 0xffffffff;
  }
  return Math.abs(hash);
}

/**
 * Normalise un step.subject en tableau de variants.
 * - String → [{ id: 'default', text: subject }]
 * - Array → as-is
 */
export function normalizeVariants(subject) {
  if (Array.isArray(subject)) {
    return subject.filter((v) => v && v.text);
  }
  if (typeof subject === 'string' && subject.length > 0) {
    return [{ id: 'default', text: subject }];
  }
  return [];
}

/**
 * Pick le variant à utiliser pour un execution donné.
 *
 * @param {object} args
 * @param {array|string} args.subject - step.subject (array variants ou string)
 * @param {string} args.executionId - UUID de l'execution (déterminisme)
 * @param {string} args.workflowMetricsCache - workflow.metrics_cache (jsonb)
 * @param {number} args.stepIndex - index dans sequence (0/1/2)
 * @returns {{ variant_id: string, variant_text: string, phase: 'explore'|'exploit' }}
 */
export function pickVariant({ subject, executionId, workflowMetricsCache, stepIndex }) {
  const variants = normalizeVariants(subject);
  if (variants.length === 0) {
    return { variant_id: 'default', variant_text: '', phase: 'explore' };
  }
  if (variants.length === 1) {
    return { variant_id: variants[0].id, variant_text: variants[0].text, phase: 'exploit' };
  }

  const cache = workflowMetricsCache || {};
  const winners = cache.ab_winners || {};
  const winnerId = winners[stepIndex];

  // EXPLOIT : winner désigné → 90% traffic, 10% explore
  if (winnerId) {
    const winner = variants.find((v) => v.id === winnerId);
    if (winner) {
      const seed = djb2Hash(executionId + ':' + stepIndex);
      const exploitRoll = (seed % 100) / 100;
      if (exploitRoll < EXPLOIT_RATIO) {
        return { variant_id: winner.id, variant_text: winner.text, phase: 'exploit' };
      }
      // Explore avec un non-winner aléatoire
      const others = variants.filter((v) => v.id !== winnerId);
      if (others.length > 0) {
        const pick = others[seed % others.length];
        return { variant_id: pick.id, variant_text: pick.text, phase: 'explore' };
      }
    }
  }

  // EXPLORE : pas de winner yet, distribution round-robin déterministe
  const seed = djb2Hash(executionId + ':' + stepIndex);
  const chosen = variants[seed % variants.length];
  return { variant_id: chosen.id, variant_text: chosen.text, phase: 'explore' };
}

/**
 * Calcule le winner d'un step à partir des executions du workflow.
 *
 * @param {array} executions - liste d'executions du workflow
 * @param {number} stepIndex - index du step à analyser
 * @returns {{ winner_id: string|null, stats: object, has_enough_data: boolean }}
 */
export function computeWinner(executions, stepIndex) {
  if (!Array.isArray(executions) || executions.length === 0) {
    return { winner_id: null, stats: {}, has_enough_data: false };
  }

  // Group par variant_id depuis step_history
  const byVariant = {};
  for (const exec of executions) {
    const history = Array.isArray(exec.step_history) ? exec.step_history : [];
    const emailLog = history.find(
      (h) => h.step === `email_${stepIndex + 1}_sent` && h.subject_variant_id
    );
    if (!emailLog) continue;
    const vid = emailLog.subject_variant_id;
    if (!byVariant[vid]) {
      byVariant[vid] = { sent: 0, opened: 0, form_submitted: 0, crm_hot: 0 };
    }
    byVariant[vid].sent++;
    // Opens (Phase 3 : signal Resend webhook) — log step 'email_opened'
    // avec email_step = numéro du step. Signal plus rapide que le form.
    const opened = history.some(
      (h) => h.step === 'email_opened' && String(h.email_step) === String(stepIndex + 1)
    );
    if (opened) byVariant[vid].opened++;
    if (exec.form_submitted_at) byVariant[vid].form_submitted++;
    if (exec.crm_pushed_at && (exec.computed_score ?? 0) >= 70) byVariant[vid].crm_hot++;
  }

  // Check min sample size
  const variantIds = Object.keys(byVariant);
  if (variantIds.length < 2) {
    return { winner_id: null, stats: byVariant, has_enough_data: false };
  }
  const minSent = Math.min(...variantIds.map((id) => byVariant[id].sent));
  if (minSent < MIN_SAMPLE_PER_VARIANT) {
    return { winner_id: null, stats: byVariant, has_enough_data: false };
  }

  // Métrique de décision : form_submission_rate en priorité (plus fiable),
  // fallback sur open_rate si aucune soumission form (signal plus rapide).
  const totalForms = variantIds.reduce((s, id) => s + byVariant[id].form_submitted, 0);
  const metric = totalForms > 0 ? 'form' : 'open';

  let winnerId = null;
  let bestRate = -1;
  for (const id of variantIds) {
    const v = byVariant[id];
    const rate = metric === 'form'
      ? (v.sent > 0 ? v.form_submitted / v.sent : 0)
      : (v.sent > 0 ? v.opened / v.sent : 0);
    if (rate > bestRate) {
      bestRate = rate;
      winnerId = id;
    }
  }

  return { winner_id: winnerId, stats: byVariant, has_enough_data: true, metric };
}

/**
 * Helper pour cron weekly : update workflow.metrics_cache.ab_winners
 * pour TOUS les steps du workflow.
 */
export async function updateWinnersForWorkflow(supabase, workflowId, sequenceLength = 3) {
  const { data: workflow } = await supabase
    .from('autopilot_workflows')
    .select('id, metrics_cache')
    .eq('id', workflowId)
    .maybeSingle();
  if (!workflow) return null;

  // Pagination obligatoire (plafond PostgREST 1000) : sur un workflow > 1000
  // exécutions, le winner A/B serait calculé sur un échantillon tronqué.
  const PAGE = 1000;
  const executions = [];
  for (let off = 0; ; off += PAGE) {
    const { data, error } = await supabase
      .from('autopilot_executions')
      .select('id, step_history, form_submitted_at, crm_pushed_at, computed_score')
      .eq('workflow_id', workflowId)
      .order('id', { ascending: true })
      .range(off, off + PAGE - 1);
    if (error) break;
    const batch = data || [];
    executions.push(...batch);
    if (batch.length < PAGE) break;
  }

  const cache = workflow.metrics_cache || {};
  const winners = cache.ab_winners || {};
  const winnerHistory = cache.ab_winner_history || [];
  let changed = false;

  for (let i = 0; i < sequenceLength; i++) {
    const result = computeWinner(executions || [], i);
    if (result.winner_id && winners[i] !== result.winner_id) {
      winners[i] = result.winner_id;
      winnerHistory.push({
        step_index: i,
        winner_id: result.winner_id,
        stats: result.stats,
        designated_at: new Date().toISOString(),
      });
      changed = true;
    }
  }

  if (changed) {
    await supabase
      .from('autopilot_workflows')
      .update({
        metrics_cache: { ...cache, ab_winners: winners, ab_winner_history: winnerHistory },
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflowId);
  }

  return { winners, changed };
}
