// ─────────────────────────────────────────────────────────────────────
// Garde responsive : aucune page publique ne doit scroller
// horizontalement à 390px (iPhone). Un scrollWidth > viewport = un
// élément déborde (audit mobile 2026-06 : TopBar, tooltips, grid items
// sans min-w-0…). Les pages app sont couvertes par l'audit manuel.
// ─────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');

const PAGES = ['/', '/pricing', '/docs', '/vs/odoo', '/alternative/odoo', '/blog', '/prospection', '/login'];

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test.describe('Mobile 390px — pas de scroll horizontal', () => {
  for (const path of PAGES) {
    test(`${path} tient dans le viewport`, async ({ page }) => {
      await page.addInitScript(() => {
        try {
          localStorage.setItem(
            'volia_cookie_consent_v2',
            JSON.stringify({
              version: 2,
              consented_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 86400000).toISOString(),
              categories: { strict: true },
            })
          );
        } catch {}
      });
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(600);
      const m = await page.evaluate(() => ({
        sw: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0),
        vw: document.documentElement.clientWidth,
      }));
      expect(m.sw, `scrollWidth ${m.sw}px > viewport ${m.vw}px`).toBeLessThanOrEqual(m.vw + 2);
    });
  }
});
