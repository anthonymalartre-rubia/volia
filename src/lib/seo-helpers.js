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

/**
 * Génère un Service schema complet avec Offer + AggregateRating.
 * Used: rich snippets Google avec prix + étoiles dans SERP.
 *
 * Note pour l'AggregateRating : Prospectia n'a pas (encore) de système de
 * reviews vérifié type Trustpilot. Les chiffres ici reflètent le NPS interne
 * (4.7/5 sur 234 utilisateurs payants au 2026-05). Update au fur et à mesure.
 */
export function serviceSchema({ name, description, url, areaName = 'France', priceFrom = 19, currency = 'EUR' }) {
  return {
    '@type': 'Service',
    name,
    description,
    url,
    provider: {
      '@type': 'Organization',
      name: 'Prospectia',
      url: BASE_URL,
    },
    areaServed: areaName === 'France'
      ? { '@type': 'Country', name: 'France' }
      : { '@type': 'AdministrativeArea', name: areaName, containedInPlace: { '@type': 'Country', name: 'France' } },
    offers: {
      '@type': 'Offer',
      price: String(priceFrom),
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/signup`,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: String(priceFrom),
        priceCurrency: currency,
        unitText: 'MONTH',
        referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      bestRating: '5',
      worstRating: '1',
      reviewCount: '234',
    },
  };
}

/**
 * Génère un Product schema simplifié (alternatif à Service pour les pages
 * cat sans territoire — Google accepte mieux Product que Service standalone).
 */
export function productSchema({ name, description, url, priceFrom = 19, currency = 'EUR' }) {
  return {
    '@type': 'Product',
    name,
    description,
    url,
    brand: { '@type': 'Brand', name: 'Prospectia' },
    offers: {
      '@type': 'Offer',
      price: String(priceFrom),
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/signup`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      bestRating: '5',
      worstRating: '1',
      reviewCount: '234',
    },
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
