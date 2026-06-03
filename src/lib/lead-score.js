// ─────────────────────────────────────────────────────────────────────
// src/lib/lead-score.js — score ICP déterministe d'un prospect (0..100).
// ─────────────────────────────────────────────────────────────────────
// Objectif : faire remonter les MEILLEURS leads en premier. Score basé sur :
//   - contactabilité (email vérifié > deviné, téléphone, site web)
//   - signaux d'établissement réel (note Google + nb d'avis)
// Pas d'IA, pas de réseau : pur calcul, utilisable client + serveur.
// ─────────────────────────────────────────────────────────────────────

// Confiance par méthode d'email (cf. colonne prospects.email_method).
const EMAIL_METHOD_POINTS = {
  scrape: 35, // trouvé sur le site = vérifié
  waterfall: 32,
  apollo: 30,
  deep: 28,
  manual: 30,
  guess: 14, // pattern deviné = incertain
};

export function scoreLead(p = {}) {
  let score = 0;

  // Email (max 35) — pondéré par la méthode (vérifié > deviné)
  if (p.email) {
    score += EMAIL_METHOD_POINTS[p.email_method] ?? 18;
  }

  // Téléphone (20) — canal direct
  if (p.telephone) score += 20;

  // Site web (12) — entreprise établie + base d'enrichissement
  if (p.site_web) score += 12;

  // Note Google (max 18) — 4.0→~12, 4.8+→18
  const note = Number(p.note);
  if (note > 0) score += Math.min(18, Math.round((note / 5) * 18));

  // Volume d'avis (max 15) — log-ish : 10 avis ~6, 100 ~12, 500+ ~15
  const reviews = Number(p.nb_avis) || 0;
  if (reviews > 0) score += Math.min(15, Math.round(Math.log10(reviews + 1) * 6));

  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Tier lisible pour un badge. */
export function scoreTier(score) {
  if (score >= 70) return { label: 'Top', color: 'emerald' };
  if (score >= 45) return { label: 'Bon', color: 'amber' };
  return { label: 'Faible', color: 'zinc' };
}
