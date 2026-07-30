// Vérifie que chaque appel MillionVerifier est tracé AVEC son verdict.
// Aucun appel réseau réel : fetch et trackApiCall sont mockés (zéro coût).
//
// Enjeu : le verdict `catch_all` est la principale cause de perte du décideur
// (politique zéro-bounce = seul `ok` est servi). Sans cette trace, le taux de
// catch_all était invisible et l'arbitrage impossible à chiffrer.

const trackApiCall = jest.fn();
jest.mock('@/lib/apiCosts', () => ({ trackApiCall: (...a) => trackApiCall(...a) }));

const { verifyEmailRaw, isEmailDeliverable } = require('@/lib/email-verify');

function mvResponds(result) {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ result }) });
}

beforeEach(() => {
  trackApiCall.mockReset();
  process.env.MILLIONVERIFIER_API_KEY = 'test-key';
});

describe('email-verify — traçage des vérifications', () => {
  it.each(['ok', 'catch_all', 'invalid', 'disposable', 'unknown'])(
    'trace le verdict « %s » dans l’endpoint',
    async (verdict) => {
      mvResponds(verdict);
      await verifyEmailRaw('jean.dupont@acme.fr');
      expect(trackApiCall).toHaveBeenCalledWith('millionverifier', null, `verify/${verdict}`);
    }
  );

  it('ne trace rien quand la clé API est absente (aucun appel consommé)', async () => {
    delete process.env.MILLIONVERIFIER_API_KEY;
    const r = await verifyEmailRaw('jean@acme.fr');
    expect(r.result).toBe('unknown');
    expect(trackApiCall).not.toHaveBeenCalled();
  });

  it('trace les erreurs HTTP (l’appel a bien été consommé)', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 });
    await verifyEmailRaw('jean@acme.fr');
    expect(trackApiCall).toHaveBeenCalledWith('millionverifier', null, 'verify/http_error');
  });

  it('trace les timeouts', async () => {
    const err = new Error('aborted');
    err.name = 'AbortError';
    global.fetch = jest.fn().mockRejectedValue(err);
    await verifyEmailRaw('jean@acme.fr');
    expect(trackApiCall).toHaveBeenCalledWith('millionverifier', null, 'verify/timeout');
  });

  it('un échec de traçage ne casse pas la vérification', async () => {
    trackApiCall.mockImplementation(() => {
      throw new Error('supabase admin indisponible');
    });
    mvResponds('ok');
    await expect(isEmailDeliverable('jean@acme.fr')).resolves.toBe(true);
  });

  it('rappel de la politique zéro-bounce : seul « ok » est livrable', async () => {
    mvResponds('catch_all');
    await expect(isEmailDeliverable('jean@acme.fr')).resolves.toBe(false);
    mvResponds('ok');
    await expect(isEmailDeliverable('jean@acme.fr')).resolves.toBe(true);
  });
});
