// ─────────────────────────────────────────────────────────────────
// src/lib/forms-gating.js — Gating plan pour Volia Formulaires
// ─────────────────────────────────────────────────────────────────
// [1er juin 2026] Décision founder : positionnement Premium Business-only.
// Volia Formulaires est désormais réservé aux plans Business / Enterprise
// (149 €/mois promo, 179 €/mois normal). Aligne avec :
//   - plans.js  → business.unlocksModules = true (CRM + Campagnes + Forms)
//   - ModuleSwitcher.jsx → businessOnly: true sur Formulaires
//   - PricingContent.jsx → Business = SEUL plan qui débloque la suite
//   - /produits/formulaires → CTA pointe sur ?plan=business
//
// Quota par plan :
//   - free / solo / pro → 0 form (upsell vers Business)
//   - business / enterprise → illimité
//
// On respecte getEffectivePlan() pour que le trial Business 14j ait accès
// au même quota qu'un Business payant (illimité), permettant aux trialeurs
// de tester pleinement la feature.
// ─────────────────────────────────────────────────────────────────

import { getEffectivePlan } from './trial';

export const FORMS_LIMITS = {
  free: 0,
  solo: 0,
  pro: 0,
  business: -1,    // -1 = illimité
  enterprise: -1,  // alias legacy
};

/**
 * Vérifie si l'utilisateur peut créer un form supplémentaire.
 * Compte les forms non-archivés et compare au quota du plan.
 *
 * @param {object} supabase - client Supabase RLS (user) ou admin
 * @param {string} userId
 * @returns {Promise<{ allowed: boolean, reason: string, limit: number, current: number, plan: string }>}
 */
export async function canCreateForm(supabase, userId) {
  if (!supabase || !userId) {
    return {
      allowed: false,
      reason: 'Invalid arguments',
      limit: 0,
      current: 0,
      plan: 'free',
    };
  }

  // 1. Récupère le profil + plan effectif (trial-aware)
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('plan, trial_plan, trial_started_at, trial_ends_at, trial_converted_at')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    console.error('[forms-gating] profile error', profileError);
    return {
      allowed: false,
      reason: 'Impossible de vérifier votre plan',
      limit: 0,
      current: 0,
      plan: 'free',
    };
  }

  const plan = getEffectivePlan(profile);
  const limit = FORMS_LIMITS[plan] ?? 0;

  // Plan free/solo/pro → bloqué d'office (upsell vers Business)
  if (limit === 0) {
    return {
      allowed: false,
      reason: 'Volia Formulaires est réservé au plan Business (149 €/mois). Upgrade pour créer ton premier formulaire.',
      limit: 0,
      current: 0,
      plan,
    };
  }

  // 2. Compte les forms actifs (status != archived)
  const { count, error: countError } = await supabase
    .from('forms')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('status', 'archived');

  if (countError) {
    console.error('[forms-gating] count error', countError);
    return {
      allowed: false,
      reason: 'Impossible de vérifier votre quota actuel',
      limit,
      current: 0,
      plan,
    };
  }

  const current = count || 0;

  // Plan business / enterprise → illimité
  if (limit === -1) {
    return { allowed: true, reason: '', limit: -1, current, plan };
  }

  if (current >= limit) {
    return {
      allowed: false,
      reason: `Quota atteint : ${current}/${limit} formulaires sur le plan ${plan}. Passez à un plan supérieur pour en créer davantage.`,
      limit,
      current,
      plan,
    };
  }

  return { allowed: true, reason: '', limit, current, plan };
}
