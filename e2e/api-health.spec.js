// ─────────────────────────────────────────────────────────────────────
// API health — verifie les statuts HTTP des routes critiques
// ─────────────────────────────────────────────────────────────────────
// - Endpoints publics → 200
// - Endpoints proteges (qui exigent un user authentifie) → 401/403
//
// On utilise `request` (pas `page`) car pas besoin de browser.
//
// Note CI : on tolere 500 sur les routes auth-gated. En CI, certains
// secrets (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) ne
// sont pas toujours configures, ce qui fait crasher le client Supabase
// dans getAuthenticatedUser() AVANT meme le check `if (!user) → 401`.
// Le but de ces tests est de verifier que la route existe + qu'elle ne
// renvoie pas 200 sans auth (qui serait une faille de securite), pas
// que l'infra CI ait toutes les env vars.
// ─────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');

test.describe('API publiques', () => {
  test('GET /api/status → 200 + JSON valide', async ({ request }) => {
    const res = await request.get('/api/status');
    expect(res.status()).toBe(200);
    const body = await res.json();
    // Le status renvoie un summary avec checks (Supabase, Stripe, etc.)
    expect(body).toBeTruthy();
  });

  test('GET /robots.txt → 200', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text.toLowerCase()).toContain('user-agent');
  });

  test('GET /sitemap.xml → 200 (XML)', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBeLessThan(400);
  });
});

test.describe('API protegees (pas de 200 sans auth)', () => {
  test('POST /api/places sans token → 401 (ou 500 si env CI incomplete)', async ({ request }) => {
    const res = await request.post('/api/places', {
      data: { query: 'test', dept: '75' },
    });
    // Le critere de securite : la route NE DOIT PAS renvoyer 200 sans auth.
    // 401 = comportement attendu en prod (env vars OK).
    // 500 = env vars Supabase manquantes en CI → Supabase client crash dans
    //       getAuthenticatedUser. Acceptable car ce n'est pas un leak.
    expect([401, 500]).toContain(res.status());
  });

  test('GET /api/crm/deals sans token → 401/403 (ou 500 si env CI incomplete)', async ({ request }) => {
    const res = await request.get('/api/crm/deals');
    // 401 (pas auth) | 403 (accès CRM refusé / limite de plan) | 500 (env CI)
    expect([401, 403, 500]).toContain(res.status());
  });

  test('GET /api/email-senders sans token → 401/403 (ou 500 si env CI incomplete)', async ({ request }) => {
    // La route reelle est /api/email-senders (PAS /api/admin/email-senders).
    const res = await request.get('/api/email-senders');
    expect([401, 403, 500]).toContain(res.status());
  });
});
