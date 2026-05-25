// src/lib/scoring.js

// Compute a 0-100 lead score based on data completeness and quality
export function computeLeadScore(prospect) {
  let score = 0;

  // Has verified email (not guessed) — 30 pts
  if (prospect.email && prospect.email_method !== 'guess') {
    score += 30;
  } else if (prospect.email) {
    score += 10; // guessed email
  }

  // Has phone — 20 pts
  if (prospect.telephone) score += 20;

  // Has website — 15 pts
  if (prospect.site_web) score += 15;

  // Google rating >= 4.0 — 15 pts, >= 3.0 — 8 pts
  if (prospect.note >= 4.0) score += 15;
  else if (prospect.note >= 3.0) score += 8;

  // Has reviews (signals active business) — 10 pts if > 10 reviews, 5 pts if > 0
  if (prospect.nb_avis > 10) score += 10;
  else if (prospect.nb_avis > 0) score += 5;

  // Has address — 10 pts
  if (prospect.adresse) score += 10;

  return Math.min(100, score);
}

export function getScoreLabel(score) {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
  if (score >= 60) return { label: 'Bon', color: 'text-blue-400', bg: 'bg-blue-500/20' };
  if (score >= 40) return { label: 'Moyen', color: 'text-amber-600', bg: 'bg-amber-500/20' };
  return { label: 'Faible', color: 'text-red-400', bg: 'bg-red-500/20' };
}
