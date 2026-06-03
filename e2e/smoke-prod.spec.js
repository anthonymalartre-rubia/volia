// ─────────────────────────────────────────────────────────────────────
// Smoke tests prod — hits https://volia.fr post-deploy
// ─────────────────────────────────────────────────────────────────────
// Exclu de la suite par defaut (testIgnore dans playwright.config.js).
// Pour l'inclure :
//   E2E_INCLUDE_SMOKE=1 E2E_BASE_URL=https://volia.fr npm run test:e2e
//
// Ideal pour un job GitHub Actions post-deploy Vercel.
// ─────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');

const URLS = [
  '/',
  '/pricing',
  '/produits/prospection',
  '/produits/campagnes',
  '/produits/crm',
  '/comparatif/apollo-vs-volia',
  '/login',
  '/signup',
  '/cgu',
  '/confidentialite',
];

test.describe('Smoke prod', () => {
  for (const path of URLS) {
    test(`GET ${path} → 2xx`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), `${path} doit renvoyer 2xx`).toBeLessThan(400);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────
// Navigation client (catch les crashes React #300 type "hook après return")
// ─────────────────────────────────────────────────────────────────────
// Un GET HTTP renvoie 200 même quand l'app crashe côté client (le 500 vient
// du JS, pas du serveur — cf. incident login juin 2026). Ce test fait la
// VRAIE navigation client marketing → /login et vérifie qu'aucun crash React
// ne survient (sinon page noire "Internal Server Error", URL figée).
test.describe('Client navigation (no React crash)', () => {
  test('marketing → "Se connecter" → /login rend le formulaire (pas de 500)', async ({ page }) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.goto('/produits/autopilot', { waitUntil: 'domcontentloaded' });

    // Clic sur le lien "Se connecter" du header = navigation client (RSC),
    // exactement le geste qui crashait.
    await page.getByRole('link', { name: /se connecter/i }).first().click();

    await page.waitForURL('**/login', { timeout: 15000 });
    await expect(page.locator('#email')).toBeVisible({ timeout: 10000 });

    const body = await page.locator('body').innerText();
    expect(body, 'pas de page 500').not.toContain('Internal Server Error');

    const reactCrash = errors.filter((e) =>
      /Minified React error #3\d\d|Rendered (fewer|more) hooks/i.test(e)
    );
    expect(reactCrash, `crash React au clic Se connecter: ${reactCrash.join(' | ')}`).toEqual([]);
  });
});
