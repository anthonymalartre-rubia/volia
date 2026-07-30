// ─────────────────────────────────────────────────────────────────────
// stripe-plan-mapping.js — price Stripe → plan local. SOURCE UNIQUE.
// ─────────────────────────────────────────────────────────────────────
// Extrait de src/app/api/stripe/webhook/route.js le 30/07/2026, à l'identique
// (signature et comportement inchangés). Motif : cette logique existait en DEUX
// versions divergentes. Celle du webhook portait les gardes, celle de
// /api/stripe/sync-subscription était une boucle nue — et écrivait `plan` en
// service_role. Un abonné Business legacy passant par la seconde était reclassé
// en MAX, donc avec moins de crédits que ce qu'il paie.
//
// POURQUOI C'EST PIÉGEUX — le pivot freemium (11/06/2026) fait partager les
// prices Stripe entre plans actuels et plans grandfatherés :
//
//   STRIPE_SOLO_PRICE_ID            → prospection  ET  solo
//   STRIPE_SOLO_YEARLY_PRICE_ID     → prospection  ET  solo
//   STRIPE_BUSINESS_PRICE_ID        → max          ET  business
//   STRIPE_BUSINESS_YEARLY_PRICE_ID → max, business ET enterprise_legacy  (triple)
//
// Un price ne suffit donc PAS à déterminer un plan. D'où les deux gardes :
//   1. `currentPlan` — si l'abonné est déjà sur un plan que ce price satisfait,
//      on le CONSERVE. C'est ce qui protège les grandfatherés d'un reclassement
//      (Business 6000 crédits → MAX 2000).
//   2. `enterprise_legacy` est SAUTÉ dans la boucle : il partage son price annuel
//      avec business et max, et n'est plus vendu. Il est traité par le fallback.
//
// FAIL-SAFE : un price inconnu renvoie 'free'. Les appelants ne doivent JAMAIS
// rétrograder sur cette base sans vérifier que l'abonnement est bien résilié —
// cf. la garde anti-rétrogradation dans webhook/route.js.
// ─────────────────────────────────────────────────────────────────────

import { PLANS } from '@/lib/plans';

/**
 * Match un price.id Stripe avec un plan local.
 * Vérifie monthly ET yearly. Renvoie 'free' si aucun match (sécurité).
 *
 * @param {string|null|undefined} priceId  price.id Stripe
 * @param {string|null} [currentPlan]      plan actuel du profil, pour préserver
 *                                         un abonné grandfatheré (voir en-tête)
 * @returns {string} id de plan local
 */
export function planIdFromPriceId(priceId, currentPlan = null) {
  if (!priceId) return 'free';
  if (currentPlan && PLANS[currentPlan]) {
    const cp = PLANS[currentPlan];
    if (cp.stripePriceId === priceId || cp.stripePriceIdYearly === priceId) {
      return currentPlan;
    }
  }
  for (const [id, plan] of Object.entries(PLANS)) {
    // 'enterprise_legacy' est l'ALIAS historique (ancien Business 99€). Il partage
    // STRIPE_BUSINESS_YEARLY_PRICE_ID avec business ET max → on le SKIP de la
    // boucle pour éviter une collision, et on le route via le fallback ci-dessous.
    // ⚠️ Ne PAS skip 'enterprise' : c'est un vrai plan vendu, avec ses propres
    // price IDs — le skipper rétrograderait tout abonné Enterprise.
    if (id === 'enterprise_legacy') continue;
    if (plan.stripePriceId && plan.stripePriceId === priceId) return id;
    if (plan.stripePriceIdYearly && plan.stripePriceIdYearly === priceId) return id;
  }
  // Fallback compat : ancien price_id Enterprise legacy → mappé sur business.
  if (PLANS.enterprise_legacy?.stripePriceId === priceId) return 'business';
  return 'free';
}
