// Verrouille la carte d'upgrade in-app. Ce bug a coûté un vrai client : les CTA
// de l'app pointaient vers des plans legacy ('solo' à 400 crédits au lieu de
// 500, 'pro' à 49 € retiré de la vente), et le webhook fige ce plan_id dans le
// profil. L'invariant clé est le dernier test : on ne doit JAMAIS envoyer un
// client vers un plan absent du pricing public.

const { nextPlanId, PLANS, VISIBLE_PLANS } = require('@/lib/plans');

describe('nextPlanId — cible d’upgrade depuis l’app', () => {
  it('propose Prospection à un compte gratuit', () => {
    expect(nextPlanId('free')).toBe('prospection');
  });

  it('propose MAX à un abonné Prospection', () => {
    expect(nextPlanId('prospection')).toBe('max');
  });

  it('ne propose rien au-dessus de MAX', () => {
    expect(nextPlanId('max')).toBeNull();
  });

  it('renvoie les plans legacy vers MAX, jamais vers un autre plan legacy', () => {
    for (const legacy of ['solo', 'pro', 'business']) {
      expect(nextPlanId(legacy)).toBe('max');
    }
  });

  it('renvoie null pour un plan inconnu ou vide', () => {
    expect(nextPlanId('nimportequoi')).toBeNull();
    expect(nextPlanId(undefined)).toBeNull();
    expect(nextPlanId('')).toBeNull();
  });

  it('ne cible JAMAIS un plan absent du pricing public', () => {
    const cibles = ['free', 'prospection', 'max', 'solo', 'pro', 'business']
      .map(nextPlanId)
      .filter(Boolean);
    expect(cibles.length).toBeGreaterThan(0);
    for (const cible of cibles) {
      expect(VISIBLE_PLANS).toContain(cible);
    }
  });

  it('les cibles sont des plans réels et payants', () => {
    for (const cible of ['prospection', 'max']) {
      expect(PLANS[cible]).toBeDefined();
      expect(PLANS[cible].price).toBeGreaterThan(0);
    }
  });
});
