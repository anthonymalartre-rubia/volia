// ─────────────────────────────────────────────────────────────────────
// src/lib/campagnes-access.js (CLIENT-SAFE)
// ─────────────────────────────────────────────────────────────────────
// Constantes + helpers d'accès au module Campagnes.
//
// Avant : toutes les pages et API routes /admin/prospection/* vérifiaient
//         user_profiles.is_admin → seul Anthony y avait accès, ce qui rendait
//         le module Campagnes INACCESSIBLE aux clients payants (Solo 19€,
//         Pro 49€, Business 149€).
//
// Maintenant : on vérifie le PLAN. Un user 'solo', 'pro', 'business' ou
//              'enterprise' (legacy alias) a accès. Les 'starter' (free) sont
//              redirigés vers le pricing avec ?upgrade=campagnes.
//
// IMPORTANT — ne pas utiliser pour :
//   - /admin/leads        → reste is_admin only
//   - /admin/stats        → reste is_admin only
//   - /admin/users        → reste is_admin only
//   - /admin/design-system → reste is_admin only
//   - /admin (page racine) → reste is_admin only
//
// ⚠️ Ce module est CLIENT-SAFE (pas d'import next/headers).
// Pour le helper server-side requireCampagnesAccess(), utiliser
// '@/lib/campagnes-access-server'.
// ─────────────────────────────────────────────────────────────────────

// Plans qui ont accès au module Campagnes
export const CAMPAGNES_ALLOWED_PLANS = ['solo', 'pro', 'business', 'enterprise'];

/**
 * Vérifie qu'un plan a accès au module Campagnes (pure function, no IO).
 * Utilisable côté client comme serveur.
 * @param {string | null | undefined} plan
 * @returns {boolean}
 */
export function isCampagnesAllowedPlan(plan) {
  if (!plan) return false;
  return CAMPAGNES_ALLOWED_PLANS.includes(plan.toLowerCase());
}
