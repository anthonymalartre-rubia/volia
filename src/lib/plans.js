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
      '100 prospects/mois',
      '20 enrichissements/mois',
      '5 exports/mois',
      'Scraping email gratuit',
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
      '1 000 prospects/mois (×10)',
      '400 enrichissements/mois (×20)',
      'Exports illimités',
      'Cascade waterfall (scraping + Google)',
      'Support email (48 h)',
    ],
  },

  // ─── Pro : LE plan qui débloque la suite complète ────
  // Argument principal = accès aux 3 modules supplémentaires (CRM + Campagnes
  // + Formulaires). C'est l'UNIQUE formule abordable qui le fait — Solo non,
  // Business l'inclut aussi mais coûte 3-4× plus cher.
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 4900,
    priceYearly: 49000,  // 490 €/an
    tagline: 'Pour PME et agences',
    inheritsFrom: 'solo',
    unlocksModules: true,   // flag affichage : ce plan débloque CRM+Campagnes+Formulaires
    highlight: true,        // affiché comme "Recommandé"
    stripePriceId: cleanEnv(process.env.STRIPE_PRO_PRICE_ID || ''),
    stripePriceIdYearly: cleanEnv(process.env.STRIPE_PRO_YEARLY_PRICE_ID || ''),
    limits: {
      searches_per_month: 5000,
      enrichments_per_month: 1000,
      folders: -1,
      exports_per_month: -1,
      verifications_per_month: 500,
    },
    features: [
      '5 000 prospects/mois (×5)',
      '1 000 enrichissements/mois (×2,5)',
      'Dossiers illimités',
      'Vérification email (MillionVerifier)',
      'Support email (24 h)',
    ],
  },

  // ─── Business : Pro + équipes + volumes premium ─────
  //
  // ⚠️ ANTHONY À FAIRE :
  // 1. Créer 2 nouveaux prix Stripe :
  //    - 179 €/mois (prix normal Business — STRIPE_BUSINESS_PRICE_ID)
  //    - 149 €/mois pendant 12 mois (promo lancement — STRIPE_BUSINESS_PROMO_PRICE_ID)
  //      Type Stripe : coupon "12 months off X €" OU price dédié + auto-switch
  //      Plus simple : créer un coupon Stripe "VOLIA-LAUNCH-12M" qui applique
  //      -30 €/mois pendant 12 mois sur le price normal 179 €
  // 2. Update env vars Vercel + plans.js pour basculer price → 17900 + priceYearly
  // 3. La promo doit avoir une fin (ex: 31 décembre 2026) gérée côté Stripe
  //
  // En attendant : Stripe checkout part toujours sur le prix actuel (99 €).
  // L'affichage publique montre 149 €/mois (promo) avec 179 €/mois barré.
  // Le visiteur paie 99 € jusqu'à ce qu'Anthony bascule — c'est intentionnel.
  business: {
    id: 'business',
    name: 'Business',
    price: 9900,            // ⚠️ Stripe actuel = 99 €/mois (à update → 17900)
    priceYearly: 99000,     // ⚠️ Stripe actuel = 990 €/an (à update → 169000)
    displayPrice: 17900,    // Affichage : prix normal après promo = 179 €/mois
    displayPriceYearly: 169000,  // Annual = 1690 €/an (~ 2 mois offerts sur 179)
    promo: {
      displayPrice: 14900,    // Promo : 149 €/mois pendant 12 mois (monthly only)
      label: 'Promo lancement',
      sublabel: 'Les 12 premiers mois — puis 179 €/mois',
      durationMonths: 12,
    },
    tagline: 'Pour équipes outbound',
    inheritsFrom: 'pro',
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
      '10 000 prospects/mois (×2)',
      '10 000 enrichissements/mois (×10)',
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
