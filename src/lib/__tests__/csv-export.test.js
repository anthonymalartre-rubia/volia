/**
 * Régression prod du 19/05/2026 → 05/08/2026 (commit 15d13d6, "Audit P2") :
 * `downloadCSV` construisait son nom de fichier avec `prospects_${format}_...`
 * alors que le param `format` venait d'être renommé `_unusedFormat`. En strict
 * mode (tout module ES l'est), lire un identifiant non déclaré lève une
 * ReferenceError — levée AVANT `link.click()`, donc zéro téléchargement et
 * zéro message d'erreur visible. Trois entrées UI passaient par là (bannière
 * "Tes leads sont prêts", icône de la barre d'outils, panneau Exporter).
 *
 * La logique pure est sortie du composant pour être testable : c'est ce qui
 * empêche la même panne silencieuse de revenir.
 */

import {
  escapeCSV,
  PROSPECTS_CSV_HEADERS,
  buildProspectsCsv,
  prospectsCsvFilename,
} from '@/lib/csv-export';

describe('prospectsCsvFilename', () => {
  it('produit prospects_<date ISO>.csv', () => {
    expect(prospectsCsvFilename(new Date('2026-08-05T17:30:00Z')))
      .toBe('prospects_2026-08-05.csv');
  });

  it('ne lève pas et ne contient aucun segment fantôme (garde anti-régression)', () => {
    // Le bug de prod : `prospects_${format}_...` avec `format` non déclaré.
    // Toute réapparition d'un segment interpolé non résolu casse ces asserts
    // au lieu de casser l'export en silence chez le client.
    const name = prospectsCsvFilename();
    expect(name).toMatch(/^prospects_\d{4}-\d{2}-\d{2}\.csv$/);
    expect(name).not.toContain('undefined');
    expect(name).not.toContain('NaN');
  });

  it('utilise la date du jour par défaut', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(prospectsCsvFilename()).toBe(`prospects_${today}.csv`);
  });
});

describe('escapeCSV', () => {
  it('rend une chaîne vide pour null et undefined', () => {
    expect(escapeCSV(null)).toBe('');
    expect(escapeCSV(undefined)).toBe('');
  });

  it('entoure toujours la valeur de guillemets', () => {
    expect(escapeCSV('Boulangerie Martin')).toBe('"Boulangerie Martin"');
  });

  it('double les guillemets internes', () => {
    expect(escapeCSV('Café "Le Bar"')).toBe('"Café ""Le Bar"""');
  });

  it('neutralise les formules (injection CSV)', () => {
    expect(escapeCSV('=SUM(A1)')).toBe('"\'=SUM(A1)"');
    expect(escapeCSV('+33612345678')).toBe('"\'+33612345678"');
    expect(escapeCSV('-2')).toBe('"\'-2"');
    expect(escapeCSV('@import')).toBe('"\'@import"');
  });

  it('conserve les valeurs numériques', () => {
    expect(escapeCSV(0)).toBe('"0"');
    expect(escapeCSV(4.9)).toBe('"4.9"');
  });
});

describe('buildProspectsCsv', () => {
  const prospect = {
    nom: 'Agence immobilière Massy',
    email: 'joindre@nicolas-benoit-immo.fr',
    contact_name: 'Nicolas Benoit',
    contact_role: 'Gérant',
    telephone: '06 63 05 08 22',
    site_web: 'nicolas-benoit-immobilier.fr',
    adresse: '1 Bis Rue Maurice Thorez, 91300 Massy',
    departement: '91',
    category: 'agence immo',
  };

  it('commence par le BOM UTF-8 (compatibilité Excel)', () => {
    expect(buildProspectsCsv([prospect]).startsWith('﻿')).toBe(true);
  });

  it('écrit la ligne d’en-têtes attendue', () => {
    const [header] = buildProspectsCsv([prospect]).replace('﻿', '').split('\n');
    expect(header).toBe(PROSPECTS_CSV_HEADERS.join(','));
  });

  it('écrit une ligne par prospect, colonnes dans l’ordre des en-têtes', () => {
    const lines = buildProspectsCsv([prospect]).replace('﻿', '').trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe(
      '"Agence immobilière Massy","joindre@nicolas-benoit-immo.fr","Nicolas Benoit",' +
      '"Gérant","06 63 05 08 22","nicolas-benoit-immobilier.fr",' +
      '"1 Bis Rue Maurice Thorez, 91300 Massy","91","agence immo"'
    );
  });

  it('gère les champs manquants sans trou de colonne', () => {
    const lines = buildProspectsCsv([{ nom: 'Sans email' }]).replace('﻿', '').trim().split('\n');
    expect(lines[1].split(',')).toHaveLength(PROSPECTS_CSV_HEADERS.length);
    expect(lines[1]).toBe('"Sans email",,,,,,,,');
  });

  it('sérialise plusieurs prospects', () => {
    const csv = buildProspectsCsv([prospect, { nom: 'Deuxième' }]);
    expect(csv.replace('﻿', '').trim().split('\n')).toHaveLength(3);
  });

  it('rend un CSV en-têtes seuls pour une liste vide', () => {
    expect(buildProspectsCsv([])).toBe('﻿' + PROSPECTS_CSV_HEADERS.join(',') + '\n');
  });
});
