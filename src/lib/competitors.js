// Competitor data for /vs/[competitor] and /alternative/[competitor] pages

export const COMPETITORS = {
  apollo: {
    slug: 'apollo',
    name: 'Apollo.io',
    domain: 'apollo.io',
    tagline: 'La base de données B2B mondiale',
    description: 'Apollo.io est une plateforme de prospection B2B avec une base de 220M+ contacts. Très utilisée aux USA, elle est moins performante sur les PME et marchés locaux français.',
    pricing: 99,
    pricingUnit: '$/mois',
    strengths: [
      'Énorme base de contacts mondiale (220M+)',
      'Intégrations Salesforce, HubSpot natives',
      'Séquences d\'outreach intégrées',
    ],
    weaknesses: [
      'Très cher (99$/mo pour le plan Basic, ~150$ avec emails illimités)',
      'Mauvaise couverture des PME françaises et commerces locaux',
      'Données souvent obsolètes pour la France (>2 ans)',
      'Interface en anglais uniquement',
      'Pas de Google Places intégré (manque les commerces locaux)',
    ],
    bestFor: 'Grandes entreprises B2B SaaS vendant aux USA',
    color: 'orange',
  },
  hunter: {
    slug: 'hunter',
    name: 'Hunter.io',
    domain: 'hunter.io',
    tagline: 'Trouvez les emails par domaine',
    description: 'Hunter.io est un email finder qui devine les emails à partir d\'un nom et d\'un domaine. Bon outil mais limité quand l\'entreprise n\'a pas de site web ou qu\'on cherche sans nom précis.',
    pricing: 49,
    pricingUnit: '$/mois',
    strengths: [
      'Très simple à utiliser',
      'Bonne précision sur les patterns d\'emails',
      'Extension Chrome pratique',
    ],
    weaknesses: [
      'Nécessite obligatoirement un domaine pour fonctionner',
      'Inefficace pour les PME sans site web (~40% des entreprises FR)',
      'Pas de scraping de site, juste pattern matching',
      'Crédits limités (25/mois en gratuit, 500 pour 49$)',
      'Pas de Google Places (pas de recherche par catégorie/zone)',
    ],
    bestFor: 'Recherche ciblée d\'un email précis chez une entreprise connue',
    color: 'amber',
  },
  lusha: {
    slug: 'lusha',
    name: 'Lusha',
    domain: 'lusha.com',
    tagline: 'Données décideurs premium',
    description: 'Lusha est spécialisé dans les données de décideurs B2B (téléphones directs, emails personnels). Cher, focalisé sur le marché US/UK, peu pertinent pour la France.',
    pricing: 36,
    pricingUnit: '$/mois (5 crédits)',
    strengths: [
      'Données de qualité sur les décideurs C-level',
      'Téléphones directs souvent disponibles',
      'Extension LinkedIn pratique',
    ],
    weaknesses: [
      'Très cher au crédit (~7$ par contact en plan Basic)',
      'Pas de recherche en masse (1 contact à la fois)',
      'Couverture France faible (vs USA/UK)',
      'Modèle de prix opaque et imprévisible',
      'Pas d\'export CSV en masse sans plan Enterprise',
    ],
    bestFor: 'Sales enterprise ciblant des décideurs C-level individuels',
    color: 'blue',
  },
  snov: {
    slug: 'snov',
    name: 'Snov.io',
    domain: 'snov.io',
    tagline: 'Email finder + outreach combinés',
    description: 'Snov.io combine email finder et outils d\'outreach (campagnes, drip emails). Solution complète mais avec des crédits limités et une couverture France moyenne.',
    pricing: 39,
    pricingUnit: '$/mois',
    strengths: [
      'Tout-en-un (find + verify + outreach)',
      'Plan gratuit décent (50 crédits/mois)',
      'CRM intégré basique',
    ],
    weaknesses: [
      'Crédits qui s\'épuisent vite (1 email = 1 crédit, 1 vérif = 1 crédit)',
      'Couverture France basée sur LinkedIn uniquement',
      'Pas de Google Places ou recherche locale',
      'Limite de 30 emails/jour en outreach (anti-spam)',
      'Interface complexe pour débuter',
    ],
    bestFor: 'Solo entrepreneur faisant 100-500 emails/mois en outreach',
    color: 'cyan',
  },
};

export function getCompetitor(slug) {
  return COMPETITORS[slug] || null;
}

export function getAllCompetitors() {
  return Object.values(COMPETITORS);
}
