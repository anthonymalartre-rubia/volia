// Verrouille le mapping price Stripe → plan local. C'est le seul point du code
// où une erreur reclasse un abonné payant, et il est fragile par conception :
// le pivot freemium fait partager les prices entre plans actuels et
// grandfatherés (voir l'en-tête de stripe-plan-mapping.js).
//
// plans.js lit les price IDs depuis process.env AU CHARGEMENT du module : on
// pose donc l'environnement AVANT le require, et on isole le registre de modules.

const PRICES = {
  STRIPE_SOLO_PRICE_ID: 'price_solo_mensuel',
  STRIPE_SOLO_YEARLY_PRICE_ID: 'price_solo_annuel',
  STRIPE_BUSINESS_PRICE_ID: 'price_business_mensuel',
  STRIPE_BUSINESS_YEARLY_PRICE_ID: 'price_business_annuel',
  STRIPE_PRO_PRICE_ID: 'price_pro_mensuel',
  STRIPE_PRO_YEARLY_PRICE_ID: 'price_pro_annuel',
  STRIPE_ENTERPRISE_PRICE_ID: 'price_enterprise_legacy',
  STRIPE_ENTERPRISE_MONTHLY_PRICE_ID: 'price_enterprise_mensuel',
  STRIPE_ENTERPRISE_YEARLY_PRICE_ID: 'price_enterprise_annuel',
};

let planIdFromPriceId;

beforeAll(() => {
  Object.assign(process.env, PRICES);
  jest.resetModules();
  planIdFromPriceId = require('@/lib/stripe-plan-mapping').planIdFromPriceId;
});

describe('planIdFromPriceId — sécurité de base', () => {
  it.each([undefined, null, ''])('renvoie free sans price (%p)', (v) => {
    expect(planIdFromPriceId(v)).toBe('free');
  });

  it('renvoie free sur un price inconnu (fail-safe)', () => {
    expect(planIdFromPriceId('price_jamais_vu')).toBe('free');
  });
});

describe('planIdFromPriceId — plans vendus aujourd’hui', () => {
  it('mappe le price mensuel partagé sur prospection par défaut', () => {
    expect(planIdFromPriceId(PRICES.STRIPE_SOLO_PRICE_ID)).toBe('prospection');
  });

  it('mappe le price annuel partagé sur prospection par défaut', () => {
    expect(planIdFromPriceId(PRICES.STRIPE_SOLO_YEARLY_PRICE_ID)).toBe('prospection');
  });

  it('mappe le price business mensuel sur max par défaut', () => {
    expect(planIdFromPriceId(PRICES.STRIPE_BUSINESS_PRICE_ID)).toBe('max');
  });

  it('reconnaît Enterprise par ses propres price IDs', () => {
    expect(planIdFromPriceId(PRICES.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID)).toBe('enterprise');
    expect(planIdFromPriceId(PRICES.STRIPE_ENTERPRISE_YEARLY_PRICE_ID)).toBe('enterprise');
  });
});

describe('planIdFromPriceId — protection des abonnés grandfatherés', () => {
  // C'EST LE CŒUR DU TEST. Sans le garde `currentPlan`, ces abonnés perdent des
  // crédits qu'ils paient. C'est exactement le bug qui existait dans
  // /api/stripe/sync-subscription (corrigé le 30/07/2026).
  it('conserve solo au lieu de le reclasser en prospection', () => {
    expect(planIdFromPriceId(PRICES.STRIPE_SOLO_PRICE_ID, 'solo')).toBe('solo');
  });

  it('conserve business au lieu de le reclasser en max (perte de crédits)', () => {
    expect(planIdFromPriceId(PRICES.STRIPE_BUSINESS_PRICE_ID, 'business')).toBe('business');
  });

  it('conserve business sur le price ANNUEL, partagé par trois plans', () => {
    expect(planIdFromPriceId(PRICES.STRIPE_BUSINESS_YEARLY_PRICE_ID, 'business')).toBe('business');
  });

  it('conserve pro', () => {
    expect(planIdFromPriceId(PRICES.STRIPE_PRO_PRICE_ID, 'pro')).toBe('pro');
  });

  it('ignore un currentPlan que le price ne satisfait PAS', () => {
    // Un abonné marqué 'business' dont le price est en réalité celui de Solo :
    // le garde ne doit pas servir à figer un plan incohérent.
    expect(planIdFromPriceId(PRICES.STRIPE_SOLO_PRICE_ID, 'business')).toBe('prospection');
  });

  it('ignore un currentPlan inexistant', () => {
    expect(planIdFromPriceId(PRICES.STRIPE_SOLO_PRICE_ID, 'plan_bidon')).toBe('prospection');
  });
});

describe('planIdFromPriceId — enterprise_legacy', () => {
  it('route l’ancien price Enterprise legacy vers business', () => {
    expect(planIdFromPriceId(PRICES.STRIPE_ENTERPRISE_PRICE_ID)).toBe('business');
  });

  it('n’est JAMAIS renvoyé par la boucle malgré son price annuel partagé', () => {
    // enterprise_legacy partage STRIPE_BUSINESS_YEARLY_PRICE_ID avec max et
    // business. Il est sauté : sans ça, l'ordre de déclaration déciderait.
    expect(planIdFromPriceId(PRICES.STRIPE_BUSINESS_YEARLY_PRICE_ID)).not.toBe('enterprise_legacy');
  });

  it('conserve enterprise_legacy si c’est déjà le plan de l’abonné', () => {
    expect(planIdFromPriceId(PRICES.STRIPE_ENTERPRISE_PRICE_ID, 'enterprise_legacy')).toBe('enterprise_legacy');
  });
});
