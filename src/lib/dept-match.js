/**
 * Résolution d'un département à partir d'une saisie libre.
 *
 * Extrait de SearchPanel.handleQuickSearch après la TypeError repérée dans
 * Sentry (JAVASCRIPT-NEXTJS-1, 72 occurrences en 20 jours) : le code
 * destructurait `Object.entries(DEPTS)` en `[code, name]` en croyant que la
 * valeur était une chaîne — un commentaire l'affirmait — alors que DEPTS
 * contient des objets `{ name, lat, lng, r }`. `name.toLowerCase()` levait
 * donc une TypeError sur le premier département non correspondant.
 *
 * Voir `lib/__tests__/dept-match.test.js`.
 */

import { DEPTS } from './constants';

/**
 * @param {string} query saisie utilisateur : « 75 », « Paris », « 75 - Paris », « yvelin »…
 * @param {Record<string, {name?: string}>} [depts] jeu de départements (DEPTS par défaut)
 * @returns {[string, object] | null} la paire [code, données], ou null
 */
export function findDeptByQuery(query, depts = DEPTS) {
  const q = typeof query === 'string' ? query.trim().toLowerCase() : '';
  // Saisie vide : on refuse. Avant, `name.includes('')` renvoyait vrai et le
  // premier département de la liste était sélectionné en silence.
  if (!q) return null;

  const entries = Object.entries(depts || {});

  const nameOf = (data) => {
    // Tolère un jeu malformé : une valeur nulle, sans `name`, ou déjà chaîne.
    if (typeof data === 'string') return data.toLowerCase();
    const n = data && typeof data.name === 'string' ? data.name : '';
    return n.toLowerCase();
  };

  // Priorité aux correspondances exactes, sinon repli sur le partiel — sinon
  // « ain » choisirait « Ain » ou « Saint-Ain » selon l'ordre de l'objet.
  const exact = entries.find(([code, data]) => {
    const name = nameOf(data);
    return code.toLowerCase() === q || name === q || `${code} - ${name}` === q;
  });
  if (exact) return exact;

  const partial = entries.find(([, data]) => {
    const name = nameOf(data);
    return name !== '' && name.includes(q);
  });
  return partial || null;
}
