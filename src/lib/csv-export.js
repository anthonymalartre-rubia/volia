/**
 * Sérialisation CSV des prospects.
 *
 * Extrait de `app/dashboard/page.js` (composant client de ~1700 lignes, donc
 * intestable) après la régression du 19/05/2026 : le nom de fichier était bâti
 * avec un identifiant `format` qui n'existait plus, ce qui levait une
 * ReferenceError avant le `click()` et tuait l'export en silence pendant deux
 * mois et demi. Logique pure ici = couverte par des tests unitaires.
 *
 * Voir `lib/__tests__/csv-export.test.js`.
 */

// Colonnes du CSV standard, dans l'ordre. Seul format d'export depuis le
// retrait de l'export Zoho — d'où l'absence de variante dans le nom de fichier.
export const PROSPECTS_CSV_HEADERS = [
  'nom',
  'email',
  'contact_decideur',
  'role_decideur',
  'telephone',
  'site_web',
  'adresse',
  'departement',
  'category',
];

// Champ du prospect derrière chaque en-tête.
const CSV_FIELDS = [
  'nom',
  'email',
  'contact_name',
  'contact_role',
  'telephone',
  'site_web',
  'adresse',
  'departement',
  'category',
];

/**
 * Échappe une valeur pour le CSV et neutralise l'injection de formules.
 * Une cellule commençant par = + - @ (ou une tabulation / un retour chariot)
 * est exécutée par Excel et LibreOffice à l'ouverture : on la préfixe d'une
 * apostrophe pour la forcer en texte.
 */
export function escapeCSV(value) {
  if (value == null) return '';
  let str = String(value);
  str = str.replace(/^[=+\-@\t\r]/, "'$&");
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Construit le CSV complet (BOM UTF-8 en tête pour qu'Excel lise les accents).
 */
export function buildProspectsCsv(prospects) {
  const list = Array.isArray(prospects) ? prospects : [];
  const rows = list.map((prospect) =>
    CSV_FIELDS.map((field) => escapeCSV(prospect?.[field])).join(',')
  );
  return '﻿' + [PROSPECTS_CSV_HEADERS.join(','), ...rows].join('\n') + '\n';
}

/**
 * Nom du fichier téléchargé : `prospects_2026-08-05.csv`.
 */
export function prospectsCsvFilename(date = new Date()) {
  return `prospects_${date.toISOString().split('T')[0]}.csv`;
}
