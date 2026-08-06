/**
 * Sentry JAVASCRIPT-NEXTJS-1 — « TypeError: s.toLowerCase is not a function »,
 * 72 occurrences en 20 jours, non gérée, sur /dashboard, active sur la release
 * en production. Trouvée en ouvrant Sentry pour la première fois.
 *
 * SearchPanel.handleQuickSearch faisait :
 *   const allDepts = Object.entries(DEPTS); // [['75', 'Paris'], ...]   ← faux
 *   allDepts.find(([code, name]) => … name.toLowerCase() … )
 *
 * DEPTS contient des OBJETS ({ name, lat, lng, r }), pas des chaînes : le
 * commentaire décrivait une forme qui n'existait plus. Le `||` court-circuite,
 * donc taper « 75 » fonctionnait (premier élément de DEPTS) et absolument tout
 * le reste levait une TypeError — bouton mort, sans message.
 */

import { findDeptByQuery } from '@/lib/dept-match';
import { DEPTS } from '@/lib/constants';

describe('findDeptByQuery', () => {
  it('trouve par code exact', () => {
    expect(findDeptByQuery('75')?.[0]).toBe('75');
    expect(findDeptByQuery('78')?.[0]).toBe('78');
  });

  it('trouve par nom exact, insensible à la casse', () => {
    expect(findDeptByQuery('Paris')?.[0]).toBe('75');
    expect(findDeptByQuery('paris')?.[0]).toBe('75');
    expect(findDeptByQuery('  PARIS  ')?.[0]).toBe('75');
  });

  it('trouve par forme composée « code - nom »', () => {
    expect(findDeptByQuery('75 - paris')?.[0]).toBe('75');
  });

  it('trouve par correspondance partielle sur le nom', () => {
    expect(findDeptByQuery('yvelin')?.[0]).toBe('78');
  });

  it('ne lève JAMAIS sur un département autre que le premier (le bug)', () => {
    // C'est l'assertion centrale : avant le correctif, toute requête qui ne
    // matchait pas '75' du premier coup levait une TypeError.
    for (const q of ['78', 'yvelines', 'seine-et-marne', 'introuvable-xyz', '2A']) {
      expect(() => findDeptByQuery(q)).not.toThrow();
    }
  });

  it('renvoie la paire [code, données] utilisable par l’appelant', () => {
    const hit = findDeptByQuery('paris');
    expect(hit[0]).toBe('75');
    expect(hit[1].name).toBe('Paris');
  });

  it('renvoie null pour une saisie inconnue', () => {
    expect(findDeptByQuery('zzzz')).toBeNull();
  });

  it('renvoie null pour une saisie vide plutôt que de matcher au hasard', () => {
    // Avant : name.includes('') était vrai → « Paris » était choisi en silence
    // alors que l'utilisateur n'avait rien tapé.
    expect(findDeptByQuery('')).toBeNull();
    expect(findDeptByQuery('   ')).toBeNull();
    expect(findDeptByQuery(null)).toBeNull();
  });

  it('tolère un jeu de départements malformé sans lever', () => {
    const bancal = { '01': { name: 'Ain' }, '02': null, '03': { pas_de_nom: true }, '04': 'Alpes' };
    expect(() => findDeptByQuery('ain', bancal)).not.toThrow();
    expect(findDeptByQuery('ain', bancal)?.[0]).toBe('01');
  });
});
