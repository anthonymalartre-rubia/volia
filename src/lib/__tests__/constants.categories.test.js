/**
 * Sentry, issue JAVASCRIPT-NEXTJS-1 : « TypeError: s.toLowerCase is not a
 * function », 72 occurrences en 20 jours, non gérée, sur /dashboard, toujours
 * active sur la release en production.
 *
 * Origine : SearchPanel.jsx → handleQuickSearch fait
 *   [...B2B_CATS, ...COPRO_CATS].find(c => c.toLowerCase() === …)
 * Si une seule entrée des groupes de catégories n'est pas une chaîne, le clic
 * sur « Rechercher » de la barre rapide lève une TypeError non rattrapée :
 * le bouton ne fait rien, et l'utilisateur n'a aucun message.
 *
 * Ce test verrouille l'invariant à la source plutôt qu'au point d'usage.
 */

import { B2B_GROUPS, COPRO_GROUPS, B2B_CATS, COPRO_CATS } from '@/lib/constants';

function offenders(list) {
  return list
    .map((v, i) => ({ i, v, type: Array.isArray(v) ? 'array' : typeof v }))
    .filter((e) => e.type !== 'string');
}

describe('catégories de recherche', () => {
  it('B2B_CATS ne contient que des chaînes', () => {
    expect(offenders(B2B_CATS)).toEqual([]);
  });

  it('COPRO_CATS ne contient que des chaînes', () => {
    expect(offenders(COPRO_CATS)).toEqual([]);
  });

  it('aucun groupe ne contient de sous-tableau imbriqué', () => {
    const nested = [];
    for (const [groups, label] of [[B2B_GROUPS, 'B2B_GROUPS'], [COPRO_GROUPS, 'COPRO_GROUPS']]) {
      for (const [group, cats] of Object.entries(groups)) {
        (cats || []).forEach((c, i) => {
          if (typeof c !== 'string') nested.push(`${label} › ${group} [${i}] = ${JSON.stringify(c)}`);
        });
      }
    }
    expect(nested).toEqual([]);
  });

  it('toLowerCase() est appelable sur chaque catégorie (le geste exact du bug)', () => {
    const all = [...B2B_CATS, ...COPRO_CATS];
    expect(() => all.find((c) => c.toLowerCase() === 'introuvable-xyz')).not.toThrow();
  });
});
