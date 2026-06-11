// ─────────────────────────────────────────────────────────────────────
// src/lib/campagnes-access.js (CLIENT-SAFE)
// ─────────────────────────────────────────────────────────────────────
// Constantes + helpers d'accès au module Campagnes.
//
// [1er juin 2026] Décision founder : positionnement Premium Business-only.
// Volia Campagnes est désormais réservé aux plans Business / Enterprise
// (149 €/mois promo, 179 €/mois normal). Solo et Pro restent dédiés à
// la Prospection. Aligne avec :
//   - plans.js  → business.unlocksModules = true (CRM + Campagnes + Forms)
//   - ModuleSwitcher.jsx → businessOnly: true sur Campagnes
//   - PricingContent.jsx → Business = SEUL plan qui débloque la suite
//   - /produits/campagnes  → CTA pointe sur ?plan=business
//
// Historique : on avait ouvert Solo+ pour les premiers utilisateurs (audit
// avait révélé que /app/campagnes était bloqué admin-only par erreur).
// On a corrigé en ouvrant trop large. Aujourd'hui on positionne clairement.
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

// Pivot freemium (11 juin 2026) : Campagnes est ouvert à TOUS les plans.
// Le différenciateur n'est plus l'accès mais les quotas (plans.js limits) :
//   - free / prospection : 200 emails/mois, 1 séquence
//   - max (et legacy pro/business) : volumes élevés ou illimités
// La liste reste exportée pour compat avec le code existant.
export const CAMPAGNES_ALLOWED_PLANS = [
  'free', 'prospection', 'max',
  'solo', 'pro', 'business', 'enterprise', 'enterprise_legacy',
];

/**
 * Vérifie qu'un plan a accès au module Campagnes (pure function, no IO).
 * Freemium : tout plan résolu a accès — seuls les quotas diffèrent.
 * @param {string | null | undefined} plan
 * @returns {boolean}
 */
export function isCampagnesAllowedPlan(plan) {
  return !!plan;
}
