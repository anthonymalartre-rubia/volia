// ─────────────────────────────────────────────────────────────────────
// UX-1 — Unification des URLs modules sous /app/*
// ─────────────────────────────────────────────────────────────────────
// Protège la migration /admin/prospection → /app/campagnes et
// /admin/forms → /app/formulaires :
//   - anciens chemins : redirect permanent (308) vers les nouveaux
//   - nouveaux chemins : gated auth (redirect /login sans session)
//   - sitemap : index + chunks toujours servis (refactor metadata→route)
// ─────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');

test.describe('UX-1 — URLs unifiées sous /app/*', () => {
  for (const [oldPath, newPath] of [
    ['/admin/prospection', '/app/campagnes'],
    ['/admin/prospection/campaigns', '/app/campagnes/campaigns'],
    ['/admin/forms', '/app/formulaires'],
    ['/admin/forms/templates', '/app/formulaires/templates'],
  ]) {
    test(`${oldPath} redirige (permanent) vers ${newPath}`, async ({ request }) => {
      const resp = await request.get(oldPath, { maxRedirects: 0 });
      expect([301, 308]).toContain(resp.status());
      expect(resp.headers()['location']).toContain(newPath);
    });
  }

  test('/app/campagnes sans session redirige vers /login', async ({ page }) => {
    await page.goto('/app/campagnes');
    await page.waitForURL(/\/login/);
  });

  test('/app/formulaires sans session redirige vers /login', async ({ page }) => {
    await page.goto('/app/formulaires');
    await page.waitForURL(/\/login/);
  });

  test('sitemap index + chunk 0 toujours servis', async ({ request }) => {
    const index = await request.get('/sitemap.xml');
    expect(index.status()).toBe(200);
    expect(await index.text()).toContain('<sitemapindex');
    const chunk = await request.get('/sitemap/0.xml');
    expect(chunk.status()).toBe(200);
    expect(await chunk.text()).toContain('<urlset');
  });
});
