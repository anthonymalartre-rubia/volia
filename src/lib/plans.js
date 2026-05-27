import { cleanEnv } from './envClean';

// ─── Plans Volia ─────────────────────────────────────────────
// Tarification orientée "le moins cher du marché par tier".
// Solo = ticket d'entrée payant à 19€ (vs Snov.io Starter 39€, Hunter 49€).
// Yearly = -2 mois offerts (paiement annuel).
//
// Hierarchy :
//   Free   → Découverte
//   Solo   → Freelance / consultant
//   Pro    → PME / agence
//   Business → Outbound machine (+ API + multi-users)

export const PLANS = {
  free: {
    id: 'free',
    name: 'Starter',
    price: 0,
    priceYearly: 0,
    tagline: 'Pour goûter',
    limits: {
      searches_per_month: 100,
      enrichments_per_month: 20,
      folders: 3,
      exports_per_month: 5,
    },
    // Features = LE CONTENU DE BASE (référence pour les "Tout inclus" plus haut)
    // Garder court (max 5 items) — l'idée c'est de tester sans s'engager
    features: [
      '20 enrichissements/mois',
      '5 exports/mois',
      'Scraping email + téléphone (fixe & mobile)',
      '101 départements (France entière)',
    ],
  },

  // ─── Ticket d'entrée payant : Solo ─────────────────
  // Pattern "delta features" : on liste UNIQUEMENT ce qui est en plus vs Starter.
  // Le composant pricing affiche "Tout inclus dans Starter +" en intro.
  solo: {
    id: 'solo',
    name: 'Solo',
    price: 1900,   // 19 €/mois en centimes
    priceYearly: 19000,  // 190 €/an (~ 2 mois offerts)
    tagline: 'Pour freelances et consultants',
    inheritsFrom: 'free',
    stripePriceId: cleanEnv(process.env.STRIPE_SOLO_PRICE_ID || ''),
    stripePriceIdYearly: cleanEnv(process.env.STRIPE_SOLO_YEARLY_PRICE_ID || ''),
    limits: {
      searches_per_month: 1000,
      enrichments_per_month: 400,
      folders: 10,
      exports_per_month: -1,
      verifications_per_month: 100,
    },
    features: [
      '400 enrichissements/mois (×20)',
      'Exports illimités',
      'Cascade waterfall (scraping + Google) — emails ET téléphones',
      'Support email (48 h)',
    ],
  },

  // ─── Pro : plus de volume Prospection vs Solo ────
  // Pro = Solo gonflé (5× le volume, dossiers illimités, vérif email).
  // Ne débloque PAS CRM/Campagnes/Formulaires — ces 3 modules sont
  // réservés à Business (positionnement upmarket).
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 4900,
    priceYearly: 49000,  // 490 €/an
    tagline: 'Pour PME et agences',
    inheritsFrom: 'solo',
    highlight: true,        // affiché comme "Recommandé" / "POPULAIRE"
    stripePriceId: cleanEnv(process.env.STRIPE_PRO_PRICE_ID || ''),
    stripePriceIdYearly: cleanEnv(process.env.STRIPE_PRO_YEARLY_PRICE_ID || ''),
    limits: {
      searches_per_month: 5000,
      enrichments_per_month: 1200,
      folders: -1,
      exports_per_month: -1,
      verifications_per_month: 500,
    },
    features: [
      '1 200 enrichissements/mois (×3)',
      'Dossiers illimités',
      'Vérification email (MillionVerifier)',
      'Téléphones mobiles enrichis (vs fixes en Solo)',
      'Support email (24 h)',
    ],
  },

  // ─── Business : Pro + équipes + volumes premium ─────
  //
  // Pricing V3 (mai 2026) :
  //   - 179 €/mois (prix normal — Stripe price_1TbcndCQpsWswW9VhX7o3gv2)
  //   - 1690 €/an (Stripe price_1TbcneCQpsWswW9VCF5zLvIT, ~169 €/mois équivalent)
  //   - Coupon promo "VOLIA-LAUNCH-12M" (Stripe id: Ltbx4XbR)
  //     -30 €/mois pendant 12 mois sur le price monthly
  //     → premiers 12 mois facturés 149 €/mois, puis bascule auto à 179 €/mois
  //     → appliqué automatiquement au checkout par /api/stripe/checkout
  //       quand planId=business + period=monthly + env STRIPE_BUSINESS_PROMO_COUPON_ID
  //
  // Env vars Vercel à configurer pour que le pricing live s'applique :
  //   STRIPE_BUSINESS_PRICE_ID = price_1TbcndCQpsWswW9VhX7o3gv2
  //   STRIPE_BUSINESS_YEARLY_PRICE_ID = price_1TbcneCQpsWswW9VCF5zLvIT
  //   STRIPE_BUSINESS_PROMO_COUPON_ID = Ltbx4XbR
  business: {
    id: 'business',
    name: 'Business',
    price: 17900,           // 179 €/mois en centimes
    priceYearly: 169000,    // 1690 €/an (~ 2 mois offerts sur 179)
    displayPrice: 17900,    // Affichage : prix normal après promo = 179 €/mois
    displayPriceYearly: 169000,
    promo: {
      displayPrice: 14900,    // Promo : 149 €/mois pendant 12 mois (monthly only)
      label: 'Promo lancement',
      sublabel: 'Les 12 premiers mois — puis 179 €/mois',
      durationMonths: 12,
    },
    tagline: 'Pour équipes outbound',
    inheritsFrom: 'pro',
    unlocksModules: true,   // SEUL plan qui débloque CRM + Campagnes + Formulaires
    stripePriceId: cleanEnv(process.env.STRIPE_BUSINESS_PRICE_ID || ''),
    stripePriceIdYearly: cleanEnv(process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || ''),
    limits: {
      searches_per_month: 10000,
      enrichments_per_month: 10000,
      folders: -1,
      exports_per_month: -1,
      verifications_per_month: 5000,
    },
    features: [
      '10 000 enrichissements/mois (×8)',
      'Multi-utilisateurs (équipes, RBAC)',
      'Accès API (à venir)',
      'Onboarding personnalisé',
      'Support prioritaire',
    ],
  },

  // ─── Conservé pour compatibilité — l'ancien plan "enterprise" ───
  // Stripe gardait un mapping price_id → enterprise pour les anciens clients.
  // On le garde en alias de business pour ne casser aucun ancien abonnement.
  enterprise: {
    id: 'enterprise',
    name: 'Business',
    price: 9900,
    priceYearly: 99000,
    tagline: 'Pour équipes outbound',
    stripePriceId: cleanEnv(process.env.STRIPE_ENTERPRISE_PRICE_ID || ''),
    stripePriceIdYearly: cleanEnv(process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || ''),
    limits: {
      searches_per_month: 10000,
      enrichments_per_month: 10000,
      folders: -1,
      exports_per_month: -1,
      verifications_per_month: 5000,
    },
    features: [],
  },
};

export function getPlan(planId) {
  return PLANS[planId] || PLANS.free;
}

export function isLimitReached(limit, currentUsage) {
  if (limit === -1) return false;
  if (limit === undefined || limit === null) return true;
  return currentUsage >= limit;
}

/**
 * Retourne le price ID Stripe à utiliser pour un plan donné et une période.
 * @param {string} planId
 * @param {'monthly'|'yearly'} [period='monthly']
 */
export function getStripePriceId(planId, period = 'monthly') {
  const plan = PLANS[planId];
  if (!plan) return null;
  return period === 'yearly' ? plan.stripePriceIdYearly : plan.stripePriceId;
}

/**
 * Liste ordonnée des plans visibles sur la landing (pas enterprise alias).
 */
export const VISIBLE_PLANS = ['free', 'solo', 'pro', 'business'];
