// ─────────────────────────────────────────────────────────────────────
// Volia Project — smoke tests publics (sans auth)
// ─────────────────────────────────────────────────────────────────────
// Protège le module des régressions de routing/middleware :
//   - /produits/project : landing produit accessible
//   - /p/[token] invalide : page "lien expiré" PUBLIQUE (pas de redirect
//     /login — régression réelle attrapée au lancement du module)
//   - /app/projets sans session : redirect /login
//   - cron project-due-tasks : 401 sans CRON_SECRET
// ─────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');

test.describe('Volia Project — routes publiques', () => {
  test('/produits/project rend la landing produit', async ({ page }) => {
    await page.goto('/produits/project');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Client livré/i);
    await expect(page.getByText(/sans compte/i).first()).toBeVisible();
  });

  test('/p/[token] invalide affiche "lien expiré" SANS redirect login', async ({ page }) => {
    const resp = await page.goto('/p/0000000000000000000000000000000000000000000000aa');
    // Le middleware ne doit PAS rediriger vers /login (route publique).
    expect(page.url()).not.toContain('/login');
    expect(resp.status()).toBe(200);
    await expect(page.getByText(/Lien expiré ou invalide/i)).toBeVisible();
  });

  test('/app/projets sans session redirige vers /login', async ({ page }) => {
    await page.goto('/app/projets');
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });

  test('cron project-due-tasks refuse sans CRON_SECRET', async ({ request }) => {
    const resp = await request.get('/api/cron/project-due-tasks');
    expect(resp.status()).toBe(401);
  });
});
