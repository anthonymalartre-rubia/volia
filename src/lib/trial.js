// ─────────────────────────────────────────────────────────────────
// src/lib/trial.js — Trial MAX 14 jours sans CB
// ─────────────────────────────────────────────────────────────────
// Volia offre 14 jours d'accès MAX à chaque nouveau signup, sans
// demande de carte bancaire. Pattern classique des SaaS B2B (Apollo,
// HubSpot, Pipedrive) : le user expérimente la vraie valeur du
// produit → meilleure conversion vers le payant.
//
// Schéma : user_profiles.trial_plan / trial_started_at / trial_ends_at
//          / trial_converted_at (cf. migration add_trial_fields_to_user_profiles).
//
// Comportement :
//   - Au signup, on set trial_plan='max' (pivot freemium 11/06/2026 :
//     14 jours de MAX = Autopilot + suite complète), trial_ends_at=now+14d.
//   - Tant que trial_ends_at > now → getEffectivePlan() retourne trial_plan.
//   - À expiration, le cron /api/cron/expire-trials remet plan='free' et
//     envoie l'email trial_expired.
//   - Si l'user paie avant expiration (Stripe webhook), on set
//     trial_converted_at → le trial est consommé.
//
// IMPORTANT : ce module est PURE (no IO, client-safe). Toutes les fonctions
// prennent un objet profile et retournent une valeur dérivée.
// ─────────────────────────────────────────────────────────────────

const TRIAL_DURATION_DAYS = 14;
const TRIAL_EXPIRING_THRESHOLD_DAYS = 3; // J-3 → message urgence

/**
 * Retourne le plan effectif d'un user en tenant compte du trial.
 *
 * - Si trial actif (trial_ends_at > now ET pas converti) → trial_plan
 * - Sinon → profile.plan (ou 'free' par défaut)
 *
 * À utiliser partout où on veut savoir ce que le user PEUT FAIRE.
 * Ne pas utiliser profile.plan directement pour le gating.
 *
 * @param {object|null} profile - row de user_profiles
 * @returns {string} 'free' | 'prospection' | 'max' | legacy ('solo'|'pro'|'business'|'enterprise')
 */
export function getEffectivePlan(profile) {
  if (!profile) return 'free';
  if (isTrialActive(profile)) {
    return profile.trial_plan || profile.plan || 'free';
  }
  return profile.plan || 'free';
}

/**
 * Trial actif = trial_ends_at dans le futur ET pas encore converti
 * (s'il a converti, son vrai plan a pris le relais via Stripe webhook).
 *
 * @param {object|null} profile
 * @returns {boolean}
 */
export function isTrialActive(profile) {
  if (!profile?.trial_ends_at) return false;
  if (profile.trial_converted_at) return false;
  return new Date(profile.trial_ends_at) > new Date();
}

/**
 * Trial expiré = trial_ends_at passé ET jamais converti.
 * Distinct de "pas de trial" (trial_ends_at NULL).
 *
 * @param {object|null} profile
 * @returns {boolean}
 */
export function isTrialExpired(profile) {
  if (!profile?.trial_ends_at) return false;
  if (profile.trial_converted_at) return false;
  return new Date(profile.trial_ends_at) <= new Date();
}

/**
 * User a un trial (actif ou expiré, peu importe). Pratique pour savoir
 * s'il a déjà bénéficié de l'offre 14j (no double-dip).
 *
 * @param {object|null} profile
 * @returns {boolean}
 */
export function hasHadTrial(profile) {
  return Boolean(profile?.trial_started_at);
}

/**
 * Jours restants avant la fin du trial (entier, arrondi au sup).
 * Retourne 0 si pas de trial actif.
 *
 * @param {object|null} profile
 * @returns {number} 0..14
 */
export function daysRemainingInTrial(profile) {
  if (!isTrialActive(profile)) return 0;
  const ms = new Date(profile.trial_ends_at) - new Date();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Le trial est en zone "urgence" (≤3 jours restants).
 * Utilisé pour basculer le banner sur un style amber.
 *
 * @param {object|null} profile
 * @returns {boolean}
 */
export function isTrialExpiringSoon(profile) {
  if (!isTrialActive(profile)) return false;
  return daysRemainingInTrial(profile) <= TRIAL_EXPIRING_THRESHOLD_DAYS;
}

/**
 * Construit le payload de trial à insérer dans user_profiles au signup.
 * Centralisé ici pour ne pas dupliquer le calcul de date d'expiration.
 *
 * @param {string} [planId='max']
 * @returns {{trial_plan:string, trial_started_at:string, trial_ends_at:string, plan:string}}
 */
export function buildTrialPayload(planId = 'max') {
  const now = new Date();
  const endsAt = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
  return {
    trial_plan: planId,
    trial_started_at: now.toISOString(),
    trial_ends_at: endsAt.toISOString(),
    plan: planId, // on set aussi le plan pour rétro-compat avec le code legacy
  };
}

export { TRIAL_DURATION_DAYS, TRIAL_EXPIRING_THRESHOLD_DAYS };
