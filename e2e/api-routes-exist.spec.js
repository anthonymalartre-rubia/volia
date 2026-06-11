// ─────────────────────────────────────────────────────────────────────
// Garde anti-régression : les routes API consommées par les modules
// Campagnes / Formulaires existent (401 sans session, jamais 404).
// ─────────────────────────────────────────────────────────────────────
// Contexte : la migration UX-1 (sed global /admin/prospection →
// /app/campagnes) avait aussi réécrit les URLs DANS les fetch() clients
// (/api/admin/... → /api/app/...) alors que les routes API n'avaient
// pas bougé → 140 appels cassés en prod. Un 404 ici = même classe de bug.
// ─────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');

const API_ROUTES = [
  '/api/admin/forms',
  '/api/admin/forms/stats',
  '/api/admin/forms/templates',
  '/api/admin/prospection/lists',
  '/api/admin/prospection/email-campaigns',
  '/api/admin/prospection/sequences',
  '/api/app/autopilot',
  '/api/stripe/credits-checkout',
  '/api/crm/contacts',
  '/api/projects',
];

test.describe('Routes API modules — existent (401 attendu sans session)', () => {
  for (const route of API_ROUTES) {
    test(`${route} ne renvoie pas 404`, async ({ request }) => {
      const resp = await request.get(route);
      expect(resp.status(), `${route} devrait exister (401/403), pas 404`).not.toBe(404);
    });
  }
});
