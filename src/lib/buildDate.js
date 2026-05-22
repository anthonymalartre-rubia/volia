// Date de mise à jour des pages programmatiques.
//
// La date est figée au moment du `next build` via une variable d'env optionnelle
// (BUILD_TIMESTAMP), sinon fallback sur le moment où ce module est chargé pour
// la 1ère fois (process boot). En pratique sur Vercel : moment du build prod.
//
// Pourquoi pas Date.now() à chaque request ? Parce que pour les pages
// statiques (SSG), c'est figé au build de toute façon. Et pour ISR, on veut
// que toutes les pages affichent la même date (cohérence).
//
// Format affiché : "22 mai 2026" — court, lisible, FR.

const FALLBACK_DATE = new Date();
const BUILD_TIMESTAMP = process.env.BUILD_TIMESTAMP
  ? new Date(parseInt(process.env.BUILD_TIMESTAMP, 10))
  : FALLBACK_DATE;

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

export function getBuildDate() {
  return BUILD_TIMESTAMP;
}

export function getBuildDateFr() {
  const d = BUILD_TIMESTAMP;
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

export function getBuildMonthFr() {
  const d = BUILD_TIMESTAMP;
  return `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

// Pour JSON-LD : ISO 8601
export function getBuildDateIso() {
  return BUILD_TIMESTAMP.toISOString();
}
