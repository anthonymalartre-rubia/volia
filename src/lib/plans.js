import { cleanEnv } from './envClean';

// ─── Plans Volia — pivot freemium (11 juin 2026) ─────────────────────
// Nouveau lineup public : Gratuit / Prospection / MAX.
//
//   Gratuit     → TOUTE la suite (Campagnes, CRM, Formulaires, Project)
//                 avec des limites + 25 crédits Prospection de découverte.
//   Prospection → 19 €/mois : la donnée. 500 crédits d'enrichissement/mois
//                 (réutilise les prices Stripe du plan Solo, 19€/190€).
//   MAX         → 179 €/mois : suite illimitée + Autopilot + 2 000 crédits
//                 (réutilise les prices Stripe du plan Business).
//                 Code MAX99 = 3 premiers mois à 99 €.
//
// Rationale : les modules ont un coût marginal ~nul → gratuits = funnel
// d'acquisition (chaque form public et lien /p/ est brandé Volia).
// Prospection consomme de l'API (Places, Serper, MillionVerifier) → au
// crédit. Autopilot orchestre tout → MAX.
//
// solo / pro / business restent résolvables (grandfathering : on ne
// downgrade JAMAIS un payeur) mais disparaissent du pricing public.
// Les trials en cours (campagne ETE2026) gardent leur parcours Pro 49€
// via /pricing?plan=pro (lien direct).

export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    priceYearly: 0,
    tagline: 'Toute la suite, pour démarrer',
    limits: {
      searches_per_month: 100,
      enrichments_per_month: 25,    // = crédits Prospection de découverte
      phones_per_month: 25,
      folders: 3,
      exports_per_month: 5,
      // Freemium : modules ouverts à tous, plafonnés.
      emails_sent_per_month: 200,
      form_submissions_per_month: 100,
      forms_published: 2,
      sequences_active: 1,
      crm_pipelines: 1,
      projects_active: 1,
      autopilot_workflows: 0,        // Autopilot = MAX only
      autopilot_branching: false,
    },
    features: [
      '✅ Campagnes, CRM, Formulaires & Project inclus',
      '200 cold emails/mois (votre propre domaine)',
      '1 pipeline CRM · 2 formulaires · 1 projet client',
      '25 crédits Prospection offerts/mois',
      '101 départements (France entière)',
    ],
  },

  // ─── Prospection : la donnée, au crédit ─────────────────────────────
  // 19 €/mois = 500 crédits d'enrichissement (1 crédit = 1 contact trouvé).
  // Réutilise les prices Stripe du plan Solo (19 €/mois, 190 €/an) : zéro
  // migration. Les modules restent aux limites du plan Gratuit — ce plan
  // vend la DONNÉE, pas la suite.
  prospection: {
    id: 'prospection',
    name: 'Prospection',
    price: 1900,
    priceYearly: 19000,
    tagline: 'Trouvez les emails B2B',
    inheritsFrom: 'free',
    stripePriceId: cleanEnv(process.env.STRIPE_SOLO_PRICE_ID || ''),
    stripePriceIdYearly: cleanEnv(process.env.STRIPE_SOLO_YEARLY_PRICE_ID || ''),
    limits: {
      searches_per_month: 2000,
      enrichments_per_month: 500,   // crédits/mois inclus
      phones_per_month: 500,
      folders: -1,
      exports_per_month: -1,
      verifications_per_month: 100,
      // Modules : mêmes limites que Gratuit (la suite se débloque en MAX)
      emails_sent_per_month: 200,
      form_submissions_per_month: 100,
      forms_published: 2,
      sequences_active: 1,
      crm_pipelines: 1,
      projects_active: 1,
      autopilot_workflows: 0,
      autopilot_branching: false,
    },
    features: [
      '500 crédits Prospection/mois (emails trouvés)',
      '500 numéros de téléphone/mois (fixes & mobiles)',
      'Cascade waterfall (scraping + Google)',
      'Packs de crédits à la demande (dès 9 €)',
      'Exports illimités · dossiers illimités',
      'Vérification email (MillionVerifier)',
      'Support email (48 h)',
    ],
  },

  // ─── MAX : suite illimitée + Autopilot ───────────────────────────────
  // Réutilise les prices Stripe Business (179 €/mois, 1 690 €/an).
  // Code MAX99 (Stripe, restreint au produit MAX) : 3 premiers mois à 99 €.
  max: {
    id: 'max',
    name: 'MAX',
    price: 17900,
    priceYearly: 169000,
    tagline: 'Pipeline B2B end-to-end auto',
    inheritsFrom: 'prospection',
    highlight: true,
    displayPrice: 17900,
    displayPriceYearly: 169000,
    promo: {
      displayPrice: 9900,     // 99 €/mois les 3 premiers mois avec MAX99
      label: 'Code MAX99',
      sublabel: 'Les 3 premiers mois à 99 € — puis 179 €/mois',
      durationMonths: 3,
      code: 'MAX99',
    },
    unlocksModules: true,
    unlocksMcp: true,
    unlocksDecisionMaker: true,
    stripePriceId: cleanEnv(process.env.STRIPE_BUSINESS_PRICE_ID || ''),
    stripePriceIdYearly: cleanEnv(process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || ''),
    limits: {
      searches_per_month: 10000,
      enrichments_per_month: 2000,  // crédits/mois — PAS illimité (coût API réel)
      phones_per_month: 10000,
      folders: -1,
      exports_per_month: -1,
      verifications_per_month: 5000,
      // Suite illimitée* (caps anti-abus larges, voir Business pour le détail)
      emails_sent_per_month: 10000,
      form_submissions_per_month: 5000,
      forms_published: -1,
      sequences_active: -1,
      crm_pipelines: -1,
      projects_active: -1,
      autopilot_workflows: 3,
      autopilot_branching: true,
      autopilot_ab_testing: true,
      autopilot_claude_optimization: true,
    },
    features: [
      '⚡ Volia Autopilot — pipeline B2B end-to-end auto (3 workflows, IF/ELSE, A/B)',
      'Campagnes, CRM, Formulaires & Project ILLIMITÉS',
      '2 000 crédits Prospection/mois',
      '🎯 Enrichissement décideur (CEO, CMO, Sales, RH)',
      '10 000 cold emails/mois (warmup auto inclus)',
      '10 000 numéros de téléphone/mois',
      'Multi-utilisateurs (équipes, RBAC)',
      '🤖 Serveur MCP + API REST (Zapier, Make, n8n)',
      'Support prioritaire',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Plans LEGACY (grandfathering) — invisibles sur le pricing public,
  // résolvables pour les abonnés existants et les trials ETE2026 en
  // cours (parcours /pricing?plan=pro conservé).
  // ═══════════════════════════════════════════════════════════════════
  solo: {
    id: 'solo',
    name: 'Solo',
    legacy: true,
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
      // Pivot freemium : un Solo payant ne peut pas avoir MOINS que le
      // plan Gratuit — alignement sur les limites modules du tier free.
      emails_sent_per_month: 200,
      form_submissions_per_month: 100,
      forms_published: 2,
      sequences_active: 1,
      crm_pipelines: 1,
      projects_active: 1,
    },
    features: [
      '400 enrichissements email/mois (×20)',
      '400 numéros de téléphone/mois (fixes & mobiles)',
      'Exports illimités',
      'Cascade waterfall (scraping + Google)',
      'Support email (48 h)',
    ],
  },

  // ─── Pro : Solo gonflé + la suite (PME/agences) ────
  // Pro = Solo gonflé (5× le volume, dossiers illimités, vérif email)
  // ET débloque CRM + Campagnes + Formulaires (unlocksModules).
  // Business se différencie par les quotas supérieurs, les équipes et le MCP.
  pro: {
    id: 'pro',
    name: 'Pro',
    legacy: true,
    price: 4900,
    priceYearly: 49000,  // 490 €/an
    tagline: 'Pour PME et agences',
    inheritsFrom: 'solo',
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
      forms_published: -1,
      sequences_active: -1,
      crm_pipelines: -1,
      projects_active: 1,            // Project était Business-only avant le pivot
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
    legacy: true,
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
      forms_published: -1,
      sequences_active: -1,
      crm_pipelines: -1,
      projects_active: -1,
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
      '📁 Volia Project — livraison client + suivi par lien public',
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
      forms_published: -1,
      sequences_active: -1,
      crm_pipelines: -1,
      projects_active: -1,
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
      forms_published: -1,
      sequences_active: -1,
      crm_pipelines: -1,
      projects_active: -1,
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
 * Liste ordonnée des plans visibles sur le pricing public.
 * Pivot freemium (11 juin 2026) : Gratuit / Prospection / MAX.
 * solo, pro, business, enterprise = legacy/sales-led, résolvables mais
 * plus affichés (grandfathering + parcours trials ETE2026 via lien direct).
 */
export const VISIBLE_PLANS = ['free', 'prospection', 'max'];

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
