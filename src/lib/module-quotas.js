// ─────────────────────────────────────────────────────────────────────
// src/lib/module-quotas.js — quotas de création par module (freemium)
// ─────────────────────────────────────────────────────────────────────
// Pivot freemium (11 juin 2026) : les modules Campagnes / CRM /
// Formulaires / Project sont ouverts à TOUS les plans. Ce qui sépare
// Gratuit/Prospection de MAX, ce ne sont plus des portes fermées mais
// des plafonds de création :
//
//   plans.js → limits.crm_pipelines / projects_active / sequences_active
//   (-1 = illimité, sinon nombre max d'objets)
//
// Les quotas VOLUMÉTRIQUES (emails envoyés/mois, soumissions de forms)
// restent gérés par lib/usage.js. Ici on ne plafonne que la CRÉATION
// d'objets structurants — c'est le levier d'upsell vers MAX.
// ─────────────────────────────────────────────────────────────────────

import { getPlan } from './plans';
import { getEffectivePlan } from './trial';

/**
 * Résout le plan effectif (trial-aware) d'un user.
 * @returns {Promise<{planId: string, plan: object}>}
 */
export async function getUserEffectivePlan(supabase, userId) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan, trial_plan, trial_started_at, trial_ends_at, trial_converted_at')
    .eq('id', userId)
    .maybeSingle();
  const planId = getEffectivePlan(profile || {});
  return { planId, plan: getPlan(planId) };
}

/**
 * Vérifie un quota de création générique.
 * @param {object} supabase  client RLS du user
 * @param {string} userId
 * @param {string} limitKey  clé dans plan.limits (ex: 'crm_pipelines')
 * @param {string} table     table à compter
 * @param {function} [applyFilter] (query) => query — filtres additionnels
 * @returns {Promise<{allowed: boolean, limit: number, current: number, planId: string}>}
 */
async function checkCreationQuota(supabase, userId, limitKey, table, applyFilter, ownerCol = 'user_id') {
  const { planId, plan } = await getUserEffectivePlan(supabase, userId);
  const limit = plan?.limits?.[limitKey];
  if (limit === -1) return { allowed: true, limit: -1, current: 0, planId };

  let query = supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq(ownerCol, userId);
  if (applyFilter) query = applyFilter(query);
  const { count, error } = await query;
  if (error) {
    // Fail-open sur erreur de comptage : ne jamais bloquer un payeur
    // pour un souci technique, le quota volumétrique protège derrière.
    console.error(`[module-quotas] count error ${table}:`, error.message);
    return { allowed: true, limit: limit ?? 0, current: 0, planId };
  }
  const current = count || 0;
  return { allowed: current < (limit ?? 0), limit: limit ?? 0, current, planId };
}

/** CRM : nombre de pipelines (free/prospection = 1, MAX = illimité). */
export function canCreatePipeline(supabase, userId) {
  return checkCreationQuota(supabase, userId, 'crm_pipelines', 'crm_pipelines');
}

/** Project : projets actifs (free/prospection = 1, MAX = illimité). */
export function canCreateProject(supabase, userId) {
  return checkCreationQuota(supabase, userId, 'projects_active', 'projects', (q) =>
    q.eq('status', 'active')
  );
}

/** Campagnes : séquences (free/prospection = 1, MAX = illimité).
 *  ⚠️ email_sequences utilise owner_id (pas user_id). */
export function canCreateSequence(supabase, userId) {
  return checkCreationQuota(supabase, userId, 'sequences_active', 'email_sequences', null, 'owner_id');
}

/**
 * Message d'upsell standard quand un quota de création est atteint.
 */
export function quotaReachedMessage(what, limit) {
  return `Limite atteinte : ${limit} ${what} sur votre plan. Passez à MAX pour de l'illimité (code MAX99 : 3 premiers mois à 99 €).`;
}
