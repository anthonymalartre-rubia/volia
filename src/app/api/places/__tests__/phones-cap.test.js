// Vérifie que le plafond de numéros est SIGNALÉ au lieu d'être silencieux.
// Toutes les dépendances sont mockées : aucun appel Google Places, aucun coût.
//
// Régression visée : quand le quota était épuisé, la route renvoyait des places
// avec `telephone: ''` sans rien indiquer. L'utilisateur en concluait que la
// donnée manquait. Constaté sur le premier client payant (29/07/2026).

// jsdom n'expose pas Response.json() (API Web côté runtime Next). Stub minimal
// suffisant pour lire le corps renvoyé par la route.
global.Response = {
  json: (body, init) => ({ status: init?.status || 200, json: async () => body }),
};

const mockCheckLimit = jest.fn();
const mockIncrementUsage = jest.fn().mockResolvedValue(undefined);

jest.mock('@/lib/auth', () => ({
  getAuthenticatedUser: jest.fn().mockResolvedValue({
    user: { id: 'user-test' },
    supabase: {},
  }),
}));
jest.mock('@/lib/usage', () => ({
  checkLimit: (...a) => mockCheckLimit(...a),
  incrementUsage: (...a) => mockIncrementUsage(...a),
}));
jest.mock('@/lib/apiCosts', () => ({ trackApiCall: jest.fn() }));
jest.mock('@/lib/onboarding', () => ({ trackOnboardingStep: jest.fn() }));
jest.mock('@/lib/achievements', () => ({ unlockAchievement: jest.fn().mockResolvedValue(null) }));

const { POST } = require('@/app/api/places/route');

// 3 entreprises, toutes avec un numéro connu chez Google.
const PLACES = [
  { id: 'p1', displayName: { text: 'Resto 1' }, nationalPhoneNumber: '01 11 11 11 11' },
  { id: 'p2', displayName: { text: 'Resto 2' }, nationalPhoneNumber: '02 22 22 22 22' },
  { id: 'p3', displayName: { text: 'Resto 3' }, nationalPhoneNumber: '03 33 33 33 33' },
];

function makeRequest() {
  return { json: async () => ({ query: 'restaurant', dept: '13' }) };
}

beforeEach(() => {
  mockCheckLimit.mockReset();
  mockIncrementUsage.mockClear();
  process.env.GOOGLE_PLACES_API_KEY = 'test-key';
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ places: PLACES }),
  });
});

// searches OK ; phones selon le scénario
function limits({ phonesRemaining, phonesLimit }) {
  mockCheckLimit.mockImplementation(async (_sb, _uid, kind) => {
    if (kind === 'phones') return { allowed: true, limit: phonesLimit, remaining: phonesRemaining };
    return { allowed: true, limit: 2000, remaining: 1000 };
  });
}

describe('/api/places — plafond de numéros', () => {
  it('signale les numéros masqués quand le quota est partiellement épuisé', async () => {
    limits({ phonesRemaining: 1, phonesLimit: 500 });
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(body.phones_capped).toBe(true);
    expect(body.phones_withheld).toBe(2); // 3 numéros existent, 1 seul attribué
    expect(body.phones_limit).toBe(500);
    expect(body.places.filter((p) => p.telephone).length).toBe(1);
  });

  it('signale le plafond quand il ne reste plus rien', async () => {
    limits({ phonesRemaining: 0, phonesLimit: 400 });
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(body.phones_capped).toBe(true);
    expect(body.phones_withheld).toBe(3);
    expect(body.places.every((p) => p.telephone === '')).toBe(true);
  });

  it('ne signale RIEN quand le quota est suffisant', async () => {
    limits({ phonesRemaining: 50, phonesLimit: 500 });
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(body.phones_capped).toBe(false);
    expect(body.phones_withheld).toBe(0);
    expect(body.places.every((p) => p.telephone !== '')).toBe(true);
  });

  it('ne compte pas comme « masqué » une entreprise sans numéro connu', async () => {
    limits({ phonesRemaining: 0, phonesLimit: 400 });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ places: [{ id: 'p9', displayName: { text: 'Sans tél' } }] }),
    });
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(body.phones_withheld).toBe(0);
    expect(body.phones_capped).toBe(false);
  });

  it('n’incrémente le compteur que des numéros réellement attribués', async () => {
    limits({ phonesRemaining: 1, phonesLimit: 500 });
    await POST(makeRequest());
    const phoneCalls = mockIncrementUsage.mock.calls.filter((c) => c[2] === 'phones');
    expect(phoneCalls).toHaveLength(1);
    expect(phoneCalls[0][3]).toBe(1);
  });
});
