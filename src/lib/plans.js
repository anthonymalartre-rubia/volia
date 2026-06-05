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
      phones_per_month: 20,
      folders: 3,
      exports_per_month: 5,
      // Free n'a pas accès aux modules Campagnes/Forms (Business-only)
      // donc quota à 0 — utilisé uniquement par le hard-cap côté API si
      // jamais un user free arrivait à appeler ces endpoints.
      emails_sent_per_month: 0,
      form_submissions_per_month: 0,
    },
    // Features = LE CONTENU DE BASE (référence pour les "Tout inclus" plus haut)
    // Garder court (max 5 items) — l'idée c'est de tester sans s'engager
    features: [
      '20 enrichissements email/mois',
      '20 numéros de téléphone/mois (fixes & mobiles)',
      '5 exports/mois',
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
      phones_per_month: 400,
      folders: 10,
      exports_per_month: -1,
      verifications_per_month: 100,
      emails_sent_per_month: 0,            // Campagnes = Business-only
      form_submissions_per_month: 0,  // Forms = Business-only
    },
    features: [
      '400 enrichissements email/mois (×20)',
      '400 numéros de téléphone/mois (fixes & mobiles)',
      'Exports illimités',
      'Cascade waterfall (scraping + Google)',
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
    unlocksModules: true,   // CRM + Campagnes + Formulaires inclus dès Pro (PME/agences)
    limits: {
      searches_per_month: 5000,
      enrichments_per_month: 1200,
      phones_per_month: 1200,
      folders: -1,
      exports_per_month: -1,
      verifications_per_month: 500,
      emails_sent_per_month: 2000,         // Campagnes incluses dès Pro
      form_submissions_per_month: 1000,    // Formulaires inclus dès Pro
      autopilot_workflows: 1,        // ⚡ Volia Autopilot Phase 1 : 1 workflow linéaire
      autopilot_branching: false,
    },
    features: [
      '✅ CRM, Campagnes email & Formulaires inclus',
      '2 000 cold emails/mois (Campagnes)',
      '1 000 soumissions de formulaires/mois',
      '1 200 enrichissements email/mois (×3)',
      '1 200 numéros de téléphone/mois (mobiles prioritaires)',
      '⚡ 1 workflow Autopilot (linéaire)',
      'Dossiers illimités',
      'Vérification email (MillionVerifier)',
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
    unlocksModules: true,   // CRM + Campagnes + Formulaires (aussi inclus sur Pro)
    unlocksMcp: true,       // Serveur MCP : Business / Enterprise uniquement
    unlocksDecisionMaker: true, // Enrichissement décideur (CEO/CMO/Sales…) : Business+
    stripePriceId: cleanEnv(process.env.STRIPE_BUSINESS_PRICE_ID || ''),
    stripePriceIdYearly: cleanEnv(process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || ''),
    limits: {
      searches_per_month: 10000,
      // 6 000 (au lieu de 10 000) : intègre l'enrichissement décideur (Serper
      // LinkedIn + vérifs SMTP, plus coûteux). Même compteur générique+décideur.
      enrichments_per_month: 6000,
      phones_per_month: 10000,
      folders: -1,
      exports_per_month: -1,
      verifications_per_month: 5000,
      // Anti-bombe à coûts Resend + Supabase. Limites larges mais cappées :
      // 10 000 cold emails/mois = ~333/jour = volume warmup-safe d'1 boîte
      // 5 000 form_submissions/mois = ~166/jour, suffisant pour 99% des PME
      emails_sent_per_month: 10000,
      form_submissions_per_month: 5000,
      autopilot_workflows: 3,           // ⚡ Volia Autopilot : 3 workflows + branching
      autopilot_branching: true,         // IF/ELSE conditional branches
    },
    features: [
      '6 000 enrichissements/mois (emails + décideurs)',
      '🎯 Enrichissement décideur (CEO, CMO, Sales, RH, RSE)',
      '10 000 numéros de téléphone/mois',
      '10 000 cold emails/mois (warmup auto inclus)',
      '5 000 soumissions de formulaires/mois',
      '⚡ 3 workflows Autopilot + branching conditional',
      'Multi-utilisateurs (équipes, RBAC)',
      '🤖 Serveur MCP — pilote Volia depuis Claude, Cursor & agents IA',
      'Accès API REST (Zapier, Make, n8n)',
      'Onboarding personnalisé',
      'Support prioritaire',
    ],
  },

  // ─── Conservé pour compatibilité — l'ancien plan "enterprise legacy" ───
  // Avant le pivot Autopilot (juin 2026), 'enterprise' était un alias de
  // Business pour les anciens clients Stripe. On garde la clé sous le nom
  // 'enterprise_legacy' pour pouvoir router les anciens stripe_subscription_id
  // vers le bon plan UI sans rien casser. Les NOUVEAUX checkouts Enterprise
  // pointent vers la nouvelle clé 'enterprise' (Autopilot illimité, 499€).
  enterprise_legacy: {
    id: 'enterprise_legacy',
    name: 'Business',
    price: 9900,
    priceYearly: 99000,
    tagline: 'Pour équipes outbound',
    stripePriceId: cleanEnv(process.env.STRIPE_ENTERPRISE_PRICE_ID || ''),
    stripePriceIdYearly: cleanEnv(process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || ''),
    inheritsFrom: 'business',
    unlocksModules: true,
    unlocksMcp: true,
    unlocksDecisionMaker: true, // alias Business : même feature décideur
    limits: {
      searches_per_month: 10000,
      enrichments_per_month: 10000,
      phones_per_month: 10000,
      folders: -1,
      exports_per_month: -1,
      verifications_per_month: 5000,
      emails_sent_per_month: 10000,
      form_submissions_per_month: 5000,
      autopilot_workflows: 3,
      autopilot_branching: true,
    },
    features: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // NEW Enterprise plan — Volia Autopilot illimité (juin 2026 pivot)
  // ═══════════════════════════════════════════════════════════════════
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49900,           // 499 €/mois
    priceYearly: 499000,    // 4 990 €/an (= -2 mois offerts)
    tagline: 'Pour équipes qui scalent',
    inheritsFrom: 'business',
    unlocksModules: true,
    unlocksMcp: true,
    unlocksDecisionMaker: true, // décideur inclus (enrichissements illimités)
    stripePriceId: cleanEnv(process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || ''),
    stripePriceIdYearly: cleanEnv(process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || ''),
    limits: {
      searches_per_month: -1,         // illimité
      enrichments_per_month: -1,
      phones_per_month: -1,
      folders: -1,
      exports_per_month: -1,
      verifications_per_month: -1,
      emails_sent_per_month: 50000,
      form_submissions_per_month: 25000,
      autopilot_workflows: -1,        // illimité
      autopilot_branching: true,
      autopilot_ab_testing: true,
      autopilot_claude_optimization: true,
    },
    features: [
      '🚀 Workflows Autopilot ILLIMITÉS',
      '⚡ Branching IF/ELSE + A/B testing subject lines',
      '🧠 Claude weekly optimization de tes workflows',
      'Tout illimité (prospects, enrichissements, téléphones)',
      '50 000 cold emails/mois',
      'Multi-utilisateurs illimités',
      'API accès complet (10 000 req/h)',
      'Custom domain CRM + white-label emails',
      'SLA 99.9% uptime',
      'Support Cal.com dédié + Slack channel privé',
      'Onboarding white-glove 5 calls',
    ],
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
 * Liste ordonnée des plans visibles sur la landing (pas enterprise_legacy).
 * Enterprise (499€, Autopilot illimité) ajouté juin 2026 avec le pivot.
 */
export const VISIBLE_PLANS = ['free', 'solo', 'pro', 'business', 'enterprise'];

// ═════════════════════════════════════════════════════════════════════
// Volia Autopilot — limites par plan (juin 2026 pivot)
// ═════════════════════════════════════════════════════════════════════
//
// Free   / Solo     : 0 workflow (feature gating)
// Pro              : 1 workflow linéaire
// Business         : 3 workflows + branching conditional
// Enterprise       : illimité + A/B testing + Claude optimization
//
// Helper : getPlanAutopilotLimits(planId)
//   → { workflows: number, branching: bool, ab_testing: bool, claude_opt: bool }
//
export function getPlanAutopilotLimits(planId) {
  const plan = PLANS[planId];
  if (!plan?.limits) {
    return { workflows: 0, branching: false, ab_testing: false, claude_opt: false };
  }
  return {
    workflows: plan.limits.autopilot_workflows ?? 0,
    branching: plan.limits.autopilot_branching ?? false,
    ab_testing: plan.limits.autopilot_ab_testing ?? false,
    claude_opt: plan.limits.autopilot_claude_optimization ?? false,
  };
}
