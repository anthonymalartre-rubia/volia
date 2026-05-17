// Shared SEO helpers — JSON-LD generators

const BASE_URL = 'https://prospectia.cloud';

/**
 * Generate BreadcrumbList schema for a sequence of breadcrumbs.
 * Input: [{ label, href }, ...] — last item is the current page (no href needed)
 */
export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      item: item.href ? `${BASE_URL}${item.href}` : undefined,
    })),
  };
}

/**
 * Estimate stats for a category/department combo.
 * Used to display "real-looking" numbers without API calls.
 * Based on department population and category density.
 */
export function estimateStats(department, category) {
  // Population-based density (rough estimate)
  const deptSize = department ? estimateDepartmentSize(department.code) : 'medium';
  const catDensity = category ? estimateCategoryDensity(category.slug) : 'medium';

  const baseMultipliers = {
    small: 0.5,   // < 200k habitants
    medium: 1,    // 200k-800k
    large: 2.5,   // 800k-2M
    xlarge: 5,    // > 2M (Paris, Bouches-du-Rhône, Rhône, Nord)
  };

  const catMultipliers = {
    high: 3,      // restaurant, garage, salon coiffure
    medium: 1,    // avocat, médecin
    low: 0.3,     // notaire, huissier
  };

  const base = 800;
  const total = Math.round(base * baseMultipliers[deptSize] * catMultipliers[catDensity]);

  return {
    total: total.toLocaleString('fr-FR'),
    avgRating: (4.0 + Math.random() * 0.6).toFixed(1),
    withEmail: `${Math.round(70 + Math.random() * 15)}%`,
    withPhone: `${Math.round(88 + Math.random() * 8)}%`,
  };
}

function estimateDepartmentSize(code) {
  // Largest French departments
  if (['75', '13', '69', '59', '92', '93', '94', '95', '77', '78', '91'].includes(code)) return 'xlarge';
  if (['33', '67', '06', '31', '44', '34', '83', '38', '76', '57', '54'].includes(code)) return 'large';
  if (['973'].includes(code)) return 'large';
  if (['971', '972', '974', '976', '2A', '2B'].includes(code)) return 'small';
  // Default mid-sized
  return 'medium';
}

function estimateCategoryDensity(slug) {
  const highDensity = [
    'restaurant', 'bar', 'cafe', 'boulangerie-patisserie', 'pizzeria',
    'salon-de-coiffure', 'institut-de-beaute', 'garage-automobile', 'taxi',
    'pharmacie', 'magasin-de-vetements', 'epicerie', 'magasin-de-meubles',
    'agence-immobiliere', 'plombier', 'electricien',
  ];
  const lowDensity = [
    'notaire', 'huissier-de-justice', 'centre-de-radiologie', 'usine',
    'promoteur-immobilier', 'banque', 'centre-de-yoga', 'cinema',
    'galerie-d-art', 'musee',
  ];
  if (highDensity.includes(slug)) return 'high';
  if (lowDensity.includes(slug)) return 'low';
  return 'medium';
}
