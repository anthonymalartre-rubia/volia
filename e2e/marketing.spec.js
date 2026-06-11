// ─────────────────────────────────────────────────────────────────────
// Marketing pages — flows critiques landing / pricing / produits / comparatif
// ─────────────────────────────────────────────────────────────────────
// Ces tests valident que les pages marketing publiques chargent et
// affichent leurs elements cles. Pas de DB requise → ils tournent en CI
// avec un build Next standard sans secret runtime.
// ─────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');

test.describe('Marketing pages', () => {
  test('Landing : hero h1 + CTA "Demarrer gratuitement" visibles', async ({ page }) => {
    await page.goto('/');
    // h1 hero "Trouvez. Contactez. Convertissez. Tout dans Volia."
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // CTA primaire du hero (Link vers /signup)
    await expect(page.getByRole('link', { name: /D.marrer gratuitement/i }).first()).toBeVisible();
  });

  test('Pricing : 3 plans freemium (Gratuit, Prospection, MAX) listes', async ({ page }) => {
    await page.goto('/pricing');
    // Pivot freemium (11/06/2026) : Gratuit / Prospection / MAX.
    await expect(page.getByRole('heading', { name: 'Gratuit', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prospection', exact: true, level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'MAX', exact: true, level: 3 })).toBeVisible();
    // Le code promo MAX99 est affiche
    await expect(page.getByText('MAX99').first()).toBeVisible();
  });

  test('Pricing : toggle Mensuel/Annuel bascule les prix', async ({ page }) => {
    await page.goto('/pricing');
    // Le toggle Mensuel/Annuel — selector tolerant car le label est compose
    // de 'Annuel' + span '-2 MOIS' (accessible name peut varier selon le
    // rendu : espace normal, nbsp, ou pas d'espace du tout).
    // On cible par regex /Annuel.*MOIS/i qui matche les 3 variantes.
    // .first() requis car une FAQ accordion ("Annuel -2 mois, comment ça…")
    // matche aussi le regex — le toggle apparait en premier dans le DOM.
    const annuelBtn = page.getByRole('button', { name: /Annuel.*MOIS/i }).first();
    await expect(annuelBtn).toBeVisible();
    await annuelBtn.click();
    // Apres click on attend que le DOM react re-render.
    await page.waitForTimeout(300);
    // En annuel : Solo annuel = 190 €/an apparait dans le DOM.
    // On cherche le texte "190" qui est tres specifique (vs 19 €/mois).
    await expect(page.locator('text=/190/').first()).toBeVisible();
  });

  test('Produits : les 3 modules chargent (prospection, campagnes, crm)', async ({ page }) => {
    for (const slug of ['prospection', 'campagnes', 'crm']) {
      const res = await page.goto(`/produits/${slug}`);
      expect(res?.status(), `/produits/${slug} doit renvoyer 200`).toBeLessThan(400);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });

  test('Comparatif : pages 1-vs-Volia chargent', async ({ page }) => {
    for (const slug of ['apollo-vs-volia', 'lemlist-vs-volia', 'hubspot-vs-volia']) {
      const res = await page.goto(`/comparatif/${slug}`);
      expect(res?.status(), `/comparatif/${slug} doit renvoyer 200`).toBeLessThan(400);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });
});
