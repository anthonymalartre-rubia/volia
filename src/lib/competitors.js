// Competitor data for /vs/[competitor] and /alternative/[competitor] pages

export const COMPETITORS = {
  apollo: {
    slug: 'apollo',
    name: 'Apollo.io',
    domain: 'apollo.io',
    tagline: 'La base B2B mondiale. Très américaine.',
    description: 'Apollo.io a 220M+ contacts. Très utilisé aux USA. En France, c\'est l\'autre histoire : couverture PME à 30-40%, données souvent périmées, interface en anglais. 99$/mois, ça pique quand t\'es français.',
    pricing: 99,
    pricingUnit: '$/mois',
    strengths: [
      'Base de contacts mondiale énorme (220M+)',
      'Intégrations Salesforce et HubSpot natives',
      'Séquences d\'outreach intégrées',
    ],
    weaknesses: [
      'Cher (99$/mois en Basic, ~150$ avec emails illimités)',
      'Couverture PME françaises à 30-40% — t\'as l\'impression de payer pour du vide',
      'Données souvent obsolètes en France (parfois > 2 ans)',
      'Interface en anglais uniquement, pas de support FR',
      'Pas de Google Places intégré — les commerces locaux passent à la trappe',
    ],
    bestFor: 'Grandes boîtes B2B SaaS qui vendent aux USA, avec budget en proportion',
    color: 'orange',
  },
  hunter: {
    slug: 'hunter',
    name: 'Hunter.io',
    domain: 'hunter.io',
    tagline: 'Devine les emails à partir d\'un domaine. C\'est tout.',
    description: 'Hunter.io devine les emails à partir d\'un nom + un domaine. Simple et propre. Problème : si l\'entreprise n\'a pas de site (40% des PME FR), ça marche pas. Et si tu cherches sans nom précis non plus.',
    pricing: 49,
    pricingUnit: '$/mois',
    strengths: [
      'Très simple à utiliser, démarrage en 30 secondes',
      'Bonne précision sur les patterns d\'emails (~85%)',
      'Extension Chrome pratique',
    ],
    weaknesses: [
      'Faut absolument un domaine pour démarrer — sans, ça fait rien',
      'Inefficace sur les PME sans site web (~40% des entreprises FR)',
      'Pas de scraping de site, juste du pattern matching',
      'Crédits limités (25/mois en gratuit, 500 pour 49$) — tu les brûles vite',
      'Pas de Google Places, donc pas de recherche par catégorie/zone',
    ],
    bestFor: 'Recherche ciblée d\'un email précis chez une entreprise dont t\'as déjà le nom',
    color: 'amber',
  },
  lusha: {
    slug: 'lusha',
    name: 'Lusha',
    domain: 'lusha.com',
    tagline: 'Données décideurs premium. Très premium.',
    description: 'Lusha est spécialisé dans les données décideurs B2B (téléphones directs, emails). C\'est de la qualité, mais c\'est cher au crédit (~7$/contact), focalisé US/UK, peu pertinent pour la France. Et le pricing est opaque.',
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
  lemlist: {
    slug: 'lemlist',
    name: 'Lemlist',
    domain: 'lemlist.com',
    tagline: 'Cadenceur multicanal avec warmup. Premium et français.',
    description: 'Lemlist est un cadenceur multicanal français (email + LinkedIn), populaire pour la perso à l\'échelle et le warmup IP intégré. Belle UI. Mais : ça fait que de l\'envoi. Pas de découverte de prospects, pas d\'enrichissement. Et le prix grimpe vite.',
    pricing: 59,
    pricingUnit: '€/mois',
    strengths: [
      'Warmup IP natif (Lemwarm) — pas besoin d\'un outil en plus',
      'Personnalisation avancée (images dynamiques, variables IA)',
      'Multi-canal email + LinkedIn natif',
      'Équipe française, support FR qui répond vraiment',
    ],
    weaknesses: [
      'Pas de découverte de prospects — faut déjà avoir sa liste',
      'Pas d\'enrichissement email — faut payer Hunter ou Dropcontact en plus',
      'Prix qui grimpe vite (59€ → 99€ → 159€) — la facture finale ressemble à HubSpot',
      'Courbe d\'apprentissage modérée — t\'as besoin d\'une matinée pour démarrer',
    ],
    bestFor: 'Équipes sales 2-10 personnes qui ont déjà leur base et veulent juste cadencer',
    color: 'pink',
  },
  dropcontact: {
    slug: 'dropcontact',
    name: 'Dropcontact',
    domain: 'dropcontact.com',
    tagline: 'Enrichissement email RGPD-by-design français',
    description: 'Dropcontact est un service d\'enrichissement email français, conçu RGPD-by-design (filtre des emails personnels, retraitement légal). Excellente couverture France mais ne fait pas de découverte.',
    pricing: 31,
    pricingUnit: '€/mois',
    strengths: [
      'RGPD-by-design natif (le plus strict du marché)',
      'Excellente couverture France',
      'Intégrations Pipedrive, HubSpot, Salesforce natives',
      'Vérification email incluse (pas de bounce)',
    ],
    weaknesses: [
      'Pas de découverte de prospects',
      'Pas de cadenceur intégré',
      'Crédits limités (200 emails/mois en plan starter)',
      'Pas d\'app web : exclusivement via API ou intégrations CRM',
    ],
    bestFor: 'PME françaises voulant enrichir une liste existante avec conformité RGPD stricte',
    color: 'green',
  },
  kaspr: {
    slug: 'kaspr',
    name: 'Kaspr',
    domain: 'kaspr.io',
    tagline: 'Extraction de contacts LinkedIn (email + téléphone)',
    description: 'Kaspr est une extension Chrome qui extrait les contacts (email + téléphone direct) directement depuis LinkedIn et Sales Navigator. Équipe française, focus PME/mid-market européen.',
    pricing: 49,
    pricingUnit: '€/mois',
    strengths: [
      'Téléphones directs souvent disponibles',
      'Extension Chrome très intuitive',
      'Bonne couverture France et Europe',
      'Plan gratuit (5 crédits/jour)',
    ],
    weaknesses: [
      'Dépendant de LinkedIn (quotas + risque de blocage de compte)',
      'Pas de découverte par catégorie ou département',
      'Pas de cadenceur intégré (à compléter avec Lemlist/Smartlead)',
      'Crédits téléphone consommés vite',
    ],
    bestFor: 'BDR/SDR sourçant via LinkedIn Sales Navigator',
    color: 'indigo',
  },
  cognism: {
    slug: 'cognism',
    name: 'Cognism',
    domain: 'cognism.com',
    tagline: 'Sales intelligence enterprise focus EU',
    description: 'Cognism est une plateforme de sales intelligence enterprise focalisée sur le marché européen. Base de données massive avec téléphones directs vérifiés, conformité RGPD native. Très chère.',
    pricing: 1500,
    pricingUnit: '€/mois (annuel)',
    strengths: [
      'Base mid-market et enterprise EU très complète',
      'Téléphones directs vérifiés ("Diamond Verified")',
      'Conformité RGPD native (Don\'t Not Call lists EU)',
      'Intent data inclus',
    ],
    weaknesses: [
      'Cher (1500 €/mois minimum, contrat annuel)',
      'Pas adapté aux TPE/PME (overkill)',
      'Couverture France correcte mais centrée mid/enterprise',
      'Onboarding long, peu de self-service',
    ],
    bestFor: 'Scale-ups et grands comptes ciblant le mid-market et l\'enterprise EU',
    color: 'purple',
  },
  zoominfo: {
    slug: 'zoominfo',
    name: 'ZoomInfo',
    domain: 'zoominfo.com',
    tagline: 'Leader US de la sales intelligence',
    description: 'ZoomInfo est le leader américain de la sales intelligence avec une base de 150M+ professionnels. Couverture France correcte mais ressources sous-utilisées pour le marché français.',
    pricing: 1200,
    pricingUnit: '€/mois (annuel)',
    strengths: [
      'Base US massive (150M+ contacts)',
      'Intent data + technographic data',
      'Intégrations natives Salesforce, HubSpot, Outreach',
      'Workflows et automation puissants',
    ],
    weaknesses: [
      'Très cher (1200 €/mois minimum, engagement annuel)',
      'Couverture France moyenne (centré US)',
      'Données souvent obsolètes en Europe',
      'Pas de self-service, onboarding obligatoire',
    ],
    bestFor: 'Entreprises B2B SaaS US/internationales avec budget',
    color: 'sky',
  },
  findymail: {
    slug: 'findymail',
    name: 'Findymail',
    domain: 'findymail.com',
    tagline: 'Email finder avec vérification SMTP intégrée',
    description: 'Findymail est un email finder spécialisé dans la vérification SMTP avancée, avec un fort taux de précision (95%+ valid emails). Bon complément à un outil de découverte.',
    pricing: 49,
    pricingUnit: '$/mois',
    strengths: [
      'Vérification SMTP très fiable (~95% valid emails)',
      'Intégrations Salesforce, HubSpot, Pipedrive',
      'API simple et bien documentée',
      'Pricing transparent au crédit',
    ],
    weaknesses: [
      'Pas de découverte de prospects',
      'Pas de cadenceur intégré',
      'Crédits qui s\'épuisent vite (1000 emails = 49 $)',
      'Centré sur les emails US/internationaux',
    ],
    bestFor: 'Vérification d\'emails avant outreach pour éviter les bounces',
    color: 'emerald',
  },
  smartlead: {
    slug: 'smartlead',
    name: 'Smartlead',
    domain: 'smartlead.ai',
    tagline: 'Cadenceur cold email avec délivrabilité optimisée',
    description: 'Smartlead est un cadenceur cold email orienté délivrabilité maximale : warmup IP avancé, multi-inbox rotation, AI-powered. Très populaire dans la communauté outbound 2025-2026.',
    pricing: 29,
    pricingUnit: '$/mois',
    strengths: [
      'Délivrabilité parmi les meilleures du marché',
      'Multi-inbox rotation (envoie depuis plusieurs adresses pour éviter spam)',
      'Warmup IP inclus illimité',
      'Prix d\'entrée très accessible (29 $)',
    ],
    weaknesses: [
      'Pas de découverte de prospects',
      'Pas d\'enrichissement email',
      'Interface en anglais uniquement',
      'Support communautaire (pas FR)',
    ],
    bestFor: 'Solo entrepreneurs et agences voulant un cadenceur efficace à bas coût',
    color: 'rose',
  },
  instantly: {
    slug: 'instantly',
    name: 'Instantly',
    domain: 'instantly.ai',
    tagline: 'Cadenceur scale avec warmup IP unlimited',
    description: 'Instantly est un cadenceur cold email US orienté volume, avec warmup IP illimité et rotation d\'inboxes. Populaire chez les agences outbound américaines.',
    pricing: 37,
    pricingUnit: '$/mois',
    strengths: [
      'Warmup IP illimité',
      'Rotation d\'inboxes natif',
      'Scale jusqu\'à plusieurs millions d\'emails/mois',
      'Marketplace de leads intégré',
    ],
    weaknesses: [
      'Pas de découverte ciblée par secteur/département',
      'Centré sur le marché US',
      'Interface dense, courbe d\'apprentissage',
      'Pas de support français',
    ],
    bestFor: 'Agences outbound et entreprises B2B faisant du volume international',
    color: 'amber',
  },
  waalaxy: {
    slug: 'waalaxy',
    name: 'Waalaxy',
    domain: 'waalaxy.com',
    tagline: 'Automatisation LinkedIn + email français',
    description: 'Waalaxy est une extension Chrome française pour automatiser la prospection LinkedIn (visites, invitations, messages) avec relais email. Très populaire chez les freelances et TPE FR.',
    pricing: 56,
    pricingUnit: '€/mois',
    strengths: [
      'Très simple à prendre en main',
      'Équipe française, support FR',
      'Templates de séquences pré-faits',
      'Intégration Hubspot, Salesforce, Pipedrive',
    ],
    weaknesses: [
      'Centré LinkedIn (peu de prospection email pure)',
      'Risque de blocage de compte LinkedIn si quotas non respectés',
      'Pas de découverte d\'entreprises hors LinkedIn',
      'Pas adapté aux marchés B2B sans présence LinkedIn (artisans, restaurants)',
    ],
    bestFor: 'Freelances et TPE faisant de la prospection LinkedIn-first',
    color: 'violet',
  },
  'la-growth-machine': {
    slug: 'la-growth-machine',
    name: 'La Growth Machine',
    domain: 'lagrowthmachine.com',
    tagline: 'Plateforme multicanal email + LinkedIn + Twitter',
    description: 'La Growth Machine (LGM) est une plateforme française de prospection multicanale (email + LinkedIn + Twitter) avec un focus sur la personnalisation à l\'échelle. Populaire en France et Europe.',
    pricing: 90,
    pricingUnit: '€/mois',
    strengths: [
      'Multicanal natif (email + LinkedIn + Twitter)',
      'Personnalisation IA avancée',
      'Équipe française, support FR',
      'Intégrations CRM natives',
    ],
    weaknesses: [
      'Pas de découverte de prospects',
      'Pas d\'enrichissement email natif',
      'Prix élevé pour démarrer (90 € minimum)',
      'Courbe d\'apprentissage modérée',
    ],
    bestFor: 'Équipes sales 3-15 personnes voulant une plateforme multicanale française',
    color: 'fuchsia',
  },
  pappers: {
    slug: 'pappers',
    name: 'Pappers',
    domain: 'pappers.fr',
    tagline: 'Base SIRET officielle française (alternative à Société.com)',
    description: 'Pappers est une base de données légales françaises (SIRET, bilans, dirigeants) issue de l\'open data INSEE et BODACC. Très utile pour qualifier juridiquement une entreprise mais ne fournit pas d\'emails ni de téléphones de prospection.',
    pricing: 30,
    pricingUnit: '€/mois',
    strengths: [
      'Données juridiques officielles (SIRET, bilans, dirigeants)',
      'Couverture exhaustive du registre français',
      'Plan gratuit avec données de base',
      'API complète pour enrichissement légal',
    ],
    weaknesses: [
      'Pas d\'emails ni de téléphones de prospection',
      'Pas de scoring commercial ni d\'intent data',
      'Pas de cadenceur ni de CRM intégré',
      'Données limitées à la France',
    ],
    bestFor: 'Équipes finance/compliance qui veulent vérifier la solvabilité d\'un prospect FR',
    color: 'teal',
  },
  'societe-com': {
    slug: 'societe-com',
    name: 'Société.com',
    domain: 'societe.com',
    tagline: 'Annuaire historique des entreprises françaises',
    description: 'Société.com est l\'annuaire historique français des sociétés (créé en 1998), avec données légales, dirigeants et bilans. Modèle freemium accroché à la publicité, données moins fraîches qu\'un Pappers moderne.',
    pricing: 9,
    pricingUnit: '€/mois',
    strengths: [
      'Très bonne notoriété SEO (souvent en top 3 Google FR)',
      'Plan gratuit pour consulter les fiches de base',
      'Couverture complète des entreprises françaises',
      'Données légales et dirigeants gratuits',
    ],
    weaknesses: [
      'Pas d\'emails ni de téléphones de prospection',
      'Interface vieillissante et publicité intrusive',
      'Pas d\'API moderne ni d\'export en masse',
      'Pas de cadenceur ni de CRM',
    ],
    bestFor: 'Consultation ponctuelle d\'une fiche entreprise FR (gratuit)',
    color: 'slate',
  },
  'reply-io': {
    slug: 'reply-io',
    name: 'Reply.io',
    domain: 'reply.io',
    tagline: 'Cadenceur multicanal IA (email + LinkedIn + appels)',
    description: 'Reply.io est une plateforme américaine de sales engagement multicanal (email, LinkedIn, appels) avec IA générative pour rédiger les séquences. Concurrent direct de Outreach et SalesLoft pour les équipes sales.',
    pricing: 60,
    pricingUnit: '$/mois',
    strengths: [
      'Multicanal natif (email + LinkedIn + appels + SMS)',
      'IA générative pour les séquences',
      'Bonne base de données B2B incluse (Jason AI)',
      'Intégrations CRM riches (Salesforce, HubSpot, Pipedrive)',
    ],
    weaknesses: [
      'Centré sur le marché US',
      'Pas de Google Places ni de couverture des PME FR sans LinkedIn',
      'Prix qui grimpe vite avec les contacts (60 $ → 120 $ → 200 $)',
      'Interface en anglais, support limité en FR',
    ],
    bestFor: 'Équipes sales B2B SaaS US/international voulant un sales engagement multicanal',
    color: 'sky',
  },
  mailshake: {
    slug: 'mailshake',
    name: 'Mailshake',
    domain: 'mailshake.com',
    tagline: 'Cold email simple et abordable pour solo/PME',
    description: 'Mailshake est un cadenceur cold email américain orienté simplicité, populaire chez les solo entrepreneurs et petites équipes sales. Bon rapport qualité/prix mais pas de découverte de prospects.',
    pricing: 44,
    pricingUnit: '$/mois',
    strengths: [
      'Interface très simple à prendre en main',
      'Bon support et tutoriels',
      'Intégration LinkedIn (limitée) sur plans supérieurs',
      'Templates de séquences prêts à l\'emploi',
    ],
    weaknesses: [
      'Pas de découverte de prospects',
      'Pas d\'enrichissement email natif',
      'Délivrabilité correcte mais moins avancée que Smartlead/Instantly',
      'Centré marché US, pas de support FR',
    ],
    bestFor: 'Solo entrepreneurs US/UK voulant un cadenceur simple à 44 $/mo',
    color: 'orange',
  },
  woodpecker: {
    slug: 'woodpecker',
    name: 'Woodpecker',
    domain: 'woodpecker.co',
    tagline: 'Cadenceur cold email B2B européen (Pologne)',
    description: 'Woodpecker est un cadenceur cold email polonais axé sur la délivrabilité et la conformité RGPD. Très utilisé en Europe par les agences et solo sales. Bon rapport qualité/prix mais pas de découverte.',
    pricing: 29,
    pricingUnit: '€/mois',
    strengths: [
      'Délivrabilité solide (warmup IP intégré)',
      'Conformité RGPD native (équipe EU)',
      'Détection auto des réponses (humain vs auto-reply)',
      'Pricing transparent au contact actif',
    ],
    weaknesses: [
      'Pas de découverte de prospects',
      'Pas d\'enrichissement email natif',
      'Interface en anglais (pas de FR)',
      'Pas de LinkedIn ni multicanal',
    ],
    bestFor: 'Solo et petites agences EU voulant un cold email RGPD à prix accessible',
    color: 'lime',
  },
  'monday-crm': {
    slug: 'monday-crm',
    name: 'Monday CRM',
    domain: 'monday.com',
    tagline: 'CRM visuel hybride project-management',
    description: 'Monday CRM est l\'extension CRM de la plateforme de project management Monday.com. Très visuel (tableaux Kanban, boards personnalisables) mais reste un CRM généraliste sans découverte de prospects ni cadenceur.',
    pricing: 24,
    pricingUnit: '€/utilisateur/mois',
    strengths: [
      'Interface très visuelle et personnalisable',
      'Intégration native avec Monday Projects',
      'Automatisations no-code puissantes',
      'Pricing par utilisateur transparent',
    ],
    weaknesses: [
      'Pas de découverte de prospects',
      'Pas d\'enrichissement email ni de cadenceur natif',
      'Pricing par siège qui grimpe vite (24 €/user × 5 = 120 €)',
      'Pas optimisé pour le sales pur (plutôt PM hybride)',
    ],
    bestFor: 'PME utilisant déjà Monday Projects et voulant un CRM visuel intégré',
    color: 'red',
  },
  'zoho-crm': {
    slug: 'zoho-crm',
    name: 'Zoho CRM',
    domain: 'zoho.com',
    tagline: 'CRM all-in-one économique de la suite Zoho',
    description: 'Zoho CRM est le CRM de la suite Zoho One (60+ apps business). Très complet et abordable mais ergonomie datée et nécessite souvent de la configuration pour atteindre les standards modernes.',
    pricing: 14,
    pricingUnit: '€/utilisateur/mois',
    strengths: [
      'Pricing très accessible (14 €/user)',
      'Suite complète Zoho One (email, support, marketing, etc.)',
      'Personnalisation très poussée',
      'Présent à l\'international',
    ],
    weaknesses: [
      'Pas de découverte de prospects',
      'Pas d\'enrichissement email natif',
      'Ergonomie datée (UX moins moderne que HubSpot/Pipedrive)',
      'Setup et personnalisation chronophages',
    ],
    bestFor: 'PME cherchant un CRM all-in-one économique et personnalisable',
    color: 'yellow',
  },
};

export function getCompetitor(slug) {
  return COMPETITORS[slug] || null;
}

export function getAllCompetitors() {
  return Object.values(COMPETITORS);
}

// ─── Helpers pour les comparatifs 1-vs-1 entre outils ────────────────────
//
// Pour 14 outils on a C(14,2) = 91 combinaisons uniques.
// On normalise l'ordre alphabétique pour éviter le contenu dupliqué :
// "apollo-vs-hunter" existe, "hunter-vs-apollo" redirige (côté page).

/**
 * Génère un slug de paire normalisé (ordre alphabétique).
 * Ex: pairSlug('hunter', 'apollo') → 'apollo-vs-hunter'
 */
export function pairSlug(a, b) {
  if (!a || !b || a === b) return null;
  const [first, second] = [a, b].sort();
  return `${first}-vs-${second}`;
}

/**
 * Parse un slug de paire et retourne les 2 competitors.
 * Ex: parsePairSlug('apollo-vs-hunter') → { a: {...}, b: {...} }
 *
 * Retourne aussi `canonical` = le slug normalisé pour permettre une
 * redirection 301 si le slug n'est pas dans l'ordre alphabétique.
 */
export function parsePairSlug(slug) {
  if (!slug || !slug.includes('-vs-')) return null;
  // On split sur le 1er '-vs-' uniquement (sinon 'la-growth-machine-vs-X' casse)
  const idx = slug.indexOf('-vs-');
  const aSlug = slug.slice(0, idx);
  const bSlug = slug.slice(idx + '-vs-'.length);
  const a = COMPETITORS[aSlug];
  const b = COMPETITORS[bSlug];
  if (!a || !b || a === b) return null;
  return {
    a,
    b,
    canonical: pairSlug(a.slug, b.slug),
  };
}

/**
 * Liste toutes les paires uniques (ordre alphabétique). C(N, 2).
 * Pour N = 14 → 91 paires.
 */
export function getAllPairs() {
  const all = getAllCompetitors();
  const pairs = [];
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i];
      const b = all[j];
      pairs.push({
        slug: pairSlug(a.slug, b.slug),
        a,
        b,
      });
    }
  }
  return pairs;
}

/**
 * Retourne toutes les paires impliquant un competitor donné.
 * Utilisé pour le maillage interne depuis /outils/[X].
 * Ex: getPairsFor('apollo') → 13 paires (apollo vs chacun des 13 autres).
 */
export function getPairsFor(competitorSlug) {
  return getAllPairs().filter(
    (p) => p.a.slug === competitorSlug || p.b.slug === competitorSlug
  );
}
