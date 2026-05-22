// Data enrichissement par région française — 14 régions (13 métropolitaines + Outre-mer).
//
// Champs :
//   population    — habitants formatés
//   gdp           — PIB régional (Md€)
//   gdpRank       — rang PIB sur 13 régions métropolitaines
//   topMetros     — 3 métropoles principales
//   flagshipSectors — 3-5 filières d'excellence avec un mini-commentaire
//   businessClimate — { tag, comment } caractérisation 1 phrase
//   bestForProspecting — conseil prospection régional
//
// Source : INSEE, CCI France, observatoires régionaux 2024.

const REGION_DATA = {
  'idf': {
    population: '12,4 M',
    gdp: '810 Md€',
    gdpRank: 1,
    topMetros: ['Paris', 'Versailles', 'Saint-Denis'],
    flagshipSectors: [
      { name: 'Finance & assurance', note: '1ère place financière, La Défense, sièges CAC 40' },
      { name: 'Tech & numérique', note: 'Station F, French Tech Paris, 30 % des startups françaises' },
      { name: 'Tourisme & culture', note: '50 M de touristes/an, Louvre, Tour Eiffel, JO 2024' },
      { name: 'Conseil & services pro', note: '60 % des cabinets conseil français' },
    ],
    businessClimate: { tag: 'Hyper-concentré', comment: 'L\'Île-de-France produit 31 % du PIB français sur 2 % du territoire. Marché ultra-compétitif mais profondeur unique.' },
    bestForProspecting: 'Cycle de décision rapide, ICP très éduqués sur les outils. Différenciation = verticalisation (par secteur) et timing exact.',
    flagshipCompanies: ['LVMH', 'BNP Paribas', 'L\'Oréal', 'Sanofi', 'TotalEnergies', 'AXA', 'Société Générale', 'Renault'],
    economicHighlight: '13 sièges du CAC 40 + Station F (1 000 startups) + La Défense (1er quartier d\'affaires européen).',
  },
  'aura': {
    population: '8,1 M',
    gdp: '290 Md€',
    gdpRank: 2,
    topMetros: ['Lyon', 'Grenoble', 'Saint-Étienne'],
    flagshipSectors: [
      { name: 'Sciences de la vie', note: 'Lyonbiopôle = 1er biocluster français' },
      { name: 'Semi-conducteurs & nano', note: 'STMicro + CEA Grenoble' },
      { name: 'Tourisme alpin', note: '60 % du domaine skiable français' },
      { name: 'Banque & finance', note: 'Lyon = 2e place financière' },
    ],
    businessClimate: { tag: 'Industriel + tertiaire', comment: 'Région la plus diversifiée économiquement de France, équilibre industrie/services/agriculture.' },
    bestForProspecting: 'Préférer Lyon pour les services, Grenoble pour la deep tech, vallée du Rhône pour l\'industrie.',
    flagshipCompanies: ['Sanofi Pasteur', 'STMicroelectronics', 'Michelin', 'BioMérieux', 'Schneider Electric', 'Crédit Agricole CIB', 'Renault Trucks'],
    economicHighlight: '2e PIB régional + 60 % du domaine skiable français + 12 000 emplois Michelin à Clermont-Ferrand.',
  },
  'paca': {
    population: '5,1 M',
    gdp: '180 Md€',
    gdpRank: 3,
    topMetros: ['Marseille', 'Nice', 'Toulon'],
    flagshipSectors: [
      { name: 'Tourisme', note: '32 M de touristes/an, 14 % des hôtels français' },
      { name: 'Logistique portuaire', note: 'Marseille = 1er port français' },
      { name: 'Microélectronique', note: 'Pôle Rousset (STMicro), Sophia Antipolis' },
      { name: 'Aéronautique', note: 'Marignane (Airbus Helicopters)' },
    ],
    businessClimate: { tag: 'Méditerranéen contrasté', comment: 'Très forte saisonnalité côté tourisme, mais filières techno solides hors saison.' },
    bestForProspecting: 'Démarcher hors haute saison touristique (oct-avril). Sophia Antipolis et Marseille = vrais bassins B2B.',
    flagshipCompanies: ['CMA CGM', 'Airbus Helicopters', 'Amadeus', 'IBM Sophia', 'Naval Group', 'Pernod Ricard', 'STMicro Rousset'],
    economicHighlight: 'Sophia Antipolis = plus grande technopole d\'Europe (36 000 emplois tech) + Marseille = 1er port français.',
  },
  'occitanie': {
    population: '6,1 M',
    gdp: '180 Md€',
    gdpRank: 4,
    topMetros: ['Toulouse', 'Montpellier', 'Nîmes'],
    flagshipSectors: [
      { name: 'Aéronautique & spatial', note: 'Airbus Toulouse + Cnes + cluster spatial' },
      { name: 'Numérique', note: 'French Tech Toulouse et Montpellier' },
      { name: 'Viticulture', note: '1er vignoble français en volume' },
      { name: 'Santé', note: 'Cancérologie Toulouse, eHealth Montpellier' },
    ],
    businessClimate: { tag: 'Dynamique tech', comment: 'Croissance démographique la plus forte de France métropolitaine, écosystème universitaire massif.' },
    bestForProspecting: 'Toulouse pour l\'aérospatial et la deep tech, Montpellier pour le SaaS et le eHealth.',
    flagshipCompanies: ['Airbus', 'CNES', 'Dell Technologies', 'Pierre Fabre', 'Continental Automotive', 'Sopra Steria', 'Sanofi Pasteur Mérieux'],
    economicHighlight: 'Capitale européenne aéronautique (Toulouse) + 1ère région française pour la croissance démographique.',
  },
  'na': {
    population: '6,1 M',
    gdp: '180 Md€',
    gdpRank: 5,
    topMetros: ['Bordeaux', 'Limoges', 'Poitiers'],
    flagshipSectors: [
      { name: 'Viticulture (Bordeaux)', note: '1er vignoble français en valeur' },
      { name: 'Aéronautique', note: 'Airbus, Dassault, ATR sur Bordeaux' },
      { name: 'Mutuelles d\'assurance', note: 'Niort = capitale française du mutualisme' },
      { name: 'Photonique', note: 'Pôle Route des Lasers' },
    ],
    businessClimate: { tag: 'Diversifié rural-urbain', comment: 'Plus grande région métropolitaine en surface, équilibre Bordeaux urbain / Niort financier / Limousin rural.' },
    bestForProspecting: 'Bordeaux pour la tech et le vin, Niort pour les services financiers et assurance.',
    flagshipCompanies: ['MAIF', 'MAAF', 'Hennessy', 'Martell', 'Dassault Aviation', 'CDiscount', 'Léa Nature', 'TotalEnergies Pau'],
    economicHighlight: 'Niort = capitale française du mutualisme + Cognac = 70 % des exports de spiritueux français.',
  },
  'hdf': {
    population: '6,0 M',
    gdp: '170 Md€',
    gdpRank: 6,
    topMetros: ['Lille', 'Calais', 'Amiens'],
    flagshipSectors: [
      { name: 'Distribution', note: 'Sièges Auchan, Decathlon, Boulanger, Bonduelle' },
      { name: 'Logistique transmanche', note: 'Calais = 1er port passagers d\'Europe' },
      { name: 'Industrie agro-alimentaire', note: 'Plaines céréalières + Béghin-Say' },
      { name: 'Textile', note: 'Tradition Roubaix-Tourcoing' },
    ],
    businessClimate: { tag: 'Reconversion réussie', comment: 'Région post-industrielle qui s\'est repositionnée sur la distribution, le numérique et la logistique.' },
    bestForProspecting: 'Lille pour la distribution et le digital, façade maritime pour la logistique import-export.',
    flagshipCompanies: ['Auchan', 'Decathlon', 'Bonduelle', 'Boulanger', 'Kiabi', 'Roquette', 'Chanel (Compiègne)'],
    economicHighlight: 'Capitale française de la distribution (Auchan, Decathlon, Bonduelle, Kiabi) + Eurométropole avec la Belgique.',
  },
  'ge': {
    population: '5,5 M',
    gdp: '170 Md€',
    gdpRank: 7,
    topMetros: ['Strasbourg', 'Reims', 'Metz'],
    flagshipSectors: [
      { name: 'Institutions européennes', note: 'Parlement Européen à Strasbourg' },
      { name: 'Champagne', note: 'AOC Champagne = 5,7 Mds€ de CA' },
      { name: 'Industrie automobile', note: 'PSA, Mercedes Hambach' },
      { name: 'Frontalier Luxembourg', note: '110 000 travailleurs frontaliers' },
    ],
    businessClimate: { tag: 'Transfrontalier', comment: 'Triple frontière (Allemagne, Belgique, Luxembourg) qui structure l\'économie régionale.' },
    bestForProspecting: 'Strasbourg pour pharma et institutions UE, Champagne-Ardenne pour le luxe, Moselle pour services aux frontaliers.',
    flagshipCompanies: ['Moët & Chandon', 'Veuve Clicquot', 'PSA Mulhouse', 'Lilly France', 'Smart (Hambach)', 'ArcelorMittal', 'Mumm'],
    economicHighlight: 'Champagne AOC = 5,7 Md€ + 110 000 frontaliers au Luxembourg + 2e siège institutionnel UE après Bruxelles.',
  },
  'pdl': {
    population: '3,9 M',
    gdp: '120 Md€',
    gdpRank: 8,
    topMetros: ['Nantes', 'Angers', 'Le Mans'],
    flagshipSectors: [
      { name: 'Construction navale', note: 'Chantiers de l\'Atlantique (Saint-Nazaire)' },
      { name: 'Aéronautique', note: 'Airbus Saint-Nazaire et Nantes' },
      { name: 'Agroalimentaire', note: 'Lactalis (53), Beauvais Père & Fils, Brioche Pasquier' },
      { name: 'Numérique', note: 'French Tech Atlantique (Nantes, Angers)' },
    ],
    businessClimate: { tag: 'Industriel innovant', comment: 'Tissu d\'ETI familiales très dynamique, faible taux de chômage.' },
    bestForProspecting: 'Nantes pour la tech et le naval, Vendée pour le tourisme événementiel.',
    flagshipCompanies: ['Chantiers de l\'Atlantique', 'Lactalis', 'Bénéteau', 'MMA', 'Puy du Fou', 'Brioche Pasquier', 'Yves Rocher (Cholet)'],
    economicHighlight: 'Chantiers de l\'Atlantique = constructeur naval n°1 mondial + Puy du Fou = n°1 français parcs à thème en CA.',
  },
  'bretagne': {
    population: '3,4 M',
    gdp: '100 Md€',
    gdpRank: 9,
    topMetros: ['Rennes', 'Brest', 'Quimper'],
    flagshipSectors: [
      { name: 'Cybersécurité', note: 'Cluster Rennes + École Saint-Cyr' },
      { name: 'Agroalimentaire', note: '1ère région française IAA (porc, lait, légumes)' },
      { name: 'Pêche & mer', note: 'Boulogne et Lorient = 1ers ports français' },
      { name: 'Télécoms', note: 'Lannion historique télécoms' },
    ],
    businessClimate: { tag: 'Identité forte', comment: 'Tissu d\'entreprises ancrées localement, forte fierté régionale, écosystème agroalimentaire mondial.' },
    bestForProspecting: 'Rennes pour la cybersécurité, Brest pour le maritime, l\'IAA partout (Triskalia, Cooperl, etc.).',
    flagshipCompanies: ['Crédit Mutuel Arkéa', 'Cooperl Arc Atlantique', 'Bigard', 'Yves Rocher', 'Bridor', 'Naval Group Brest'],
    economicHighlight: '1ère région française IAA + Cyber Campus Rennes (cluster cybersécurité national).',
  },
  'normandie': {
    population: '3,3 M',
    gdp: '95 Md€',
    gdpRank: 10,
    topMetros: ['Rouen', 'Caen', 'Le Havre'],
    flagshipSectors: [
      { name: 'Logistique portuaire', note: 'Le Havre = 1er port FR conteneurs' },
      { name: 'Pétrochimie', note: 'Total, ExxonMobil, Sanofi' },
      { name: 'Cosmétique', note: 'Cosmetic Valley + L\'Oréal Caudebec' },
      { name: 'Tourisme mémoriel', note: 'Plages débarquement (5 M visiteurs/an)' },
    ],
    businessClimate: { tag: 'Industriel lourd', comment: 'Industrie chimique et raffinage en mutation vers la transition énergétique.' },
    bestForProspecting: 'Le Havre pour la logistique, Rouen pour l\'industrie lourde, Cosmetic Valley pour la beauté.',
    flagshipCompanies: ['TotalEnergies (Gonfreville)', 'Sanofi (Le Trait)', 'Renault Cléon', 'NXP Semiconductors', 'Bosch'],
    economicHighlight: 'Le Havre = 1er port FR conteneurs (2,9 M EVP/an) + 2e pôle pétrochimique français.',
  },
  'cvl': {
    population: '2,6 M',
    gdp: '75 Md€',
    gdpRank: 11,
    topMetros: ['Tours', 'Orléans', 'Bourges'],
    flagshipSectors: [
      { name: 'Cosmétique', note: 'Cosmetic Valley HQ' },
      { name: 'Pharma', note: 'Sanofi, Servier, Ipsen' },
      { name: 'Tourisme châteaux', note: 'Vallée de la Loire UNESCO' },
      { name: 'Défense', note: 'MBDA, Nexter (Bourges)' },
    ],
    businessClimate: { tag: 'Discret performant', comment: 'Région souvent oubliée, mais 1ère pour la cosmétique et 2e pour la pharma françaises.' },
    bestForProspecting: 'Pharma-cosmétique = ICP n°1 sur Tours-Orléans-Chartres.',
    flagshipCompanies: ['Cosmetic Valley HQ', 'Sanofi', 'Servier', 'Ipsen', 'MBDA', 'Nexter', 'Hutchinson'],
    economicHighlight: '1ère région française cosmétique (Cosmetic Valley) + 2e pharma + 1ère défense terrestre.',
  },
  'bfc': {
    population: '2,8 M',
    gdp: '80 Md€',
    gdpRank: 12,
    topMetros: ['Dijon', 'Besançon', 'Belfort'],
    flagshipSectors: [
      { name: 'Microtechnique', note: 'Horlogerie Besançon, mécanique de précision' },
      { name: 'Vin (Bourgogne)', note: 'Climats UNESCO, AOC premium' },
      { name: 'Énergie', note: 'Alstom, GE à Belfort' },
      { name: 'Industrie automobile', note: 'PSA Sochaux historique' },
    ],
    businessClimate: { tag: 'Industriel exportateur', comment: 'Forte tradition industrielle et savoir-faire spécialisés, économie tournée vers l\'export (Allemagne, Suisse).' },
    bestForProspecting: 'Dijon pour la gastronomie premium, Besançon pour la microtechnique, Belfort pour l\'énergie.',
    flagshipCompanies: ['PSA Sochaux', 'Alstom (Belfort)', 'Amora', 'Maille', 'GE Energy', 'Édulis'],
    economicHighlight: 'PSA Sochaux = berceau historique Peugeot + Alstom Belfort = hub énergétique.',
  },
  'corse': {
    population: '345 k',
    gdp: '10 Md€',
    gdpRank: 13,
    topMetros: ['Ajaccio', 'Bastia', 'Porto-Vecchio'],
    flagshipSectors: [
      { name: 'Tourisme', note: '4,5 M de touristes/an, 80 % de l\'économie' },
      { name: 'Hôtellerie', note: '2 200 hôtels et campings' },
      { name: 'Agriculture AOP', note: 'Charcuterie, fromages, clémentines, vin' },
      { name: 'Maritime', note: 'Ports d\'Ajaccio et Bastia' },
    ],
    businessClimate: { tag: 'Insulaire saisonnier', comment: 'Économie ultra-saisonnière : 90 % du CA touristique entre mai et octobre.' },
    bestForProspecting: 'Démarchage uniquement entre novembre et avril, hors saison. Ciblage hôtellerie et IAA artisanale.',
    flagshipCompanies: ['Corsica Ferries', 'Air Corsica', 'Domaine Pieretti', 'Casanova', 'Charcuterie Stagnetto'],
    economicHighlight: '4,5 M de touristes/an + filière AOP forte (charcuterie, fromage, vin, clémentine).',
  },
  'om': {
    population: '2,2 M',
    gdp: '50 Md€',
    gdpRank: null,
    topMetros: ['Saint-Denis (974)', 'Fort-de-France', 'Pointe-à-Pitre'],
    flagshipSectors: [
      { name: 'Tourisme', note: 'Antilles + Réunion = 3,5 M de touristes/an' },
      { name: 'Spatial (Guyane)', note: 'Centre Spatial Guyanais à Kourou' },
      { name: 'Agriculture tropicale', note: 'Banane, canne-sucre, ananas, vanille' },
      { name: 'BTP', note: 'Forte croissance liée à la démographie' },
    ],
    businessClimate: { tag: 'Insulaire diversifié', comment: 'Économies très contrastées : Réunion la plus avancée, Mayotte en construction, Guyane axée spatial.' },
    bestForProspecting: 'Saisonnalité inversée (haute saison déc-avril aux Antilles). Marché de niche, mais peu de concurrence.',
    flagshipCompanies: ['Centre Spatial Guyanais', 'Bourbon Tourisme', 'CMA CGM Réunion', 'Cilam', 'Distillerie Reimonenq', 'Royal Bourbon'],
    economicHighlight: 'Centre Spatial Guyanais (Kourou) = base de lancement Ariane + La Réunion = bassin économique DROM le plus dynamique.',
  },
};

// Mapping inverse pour convertir un key court (idf, aura, paca...)
// → slug long URL-friendly (ile-de-france, auvergne-rhone-alpes, paca).
// Utile pour les liens internes générés depuis category-data.js qui
// référencent les régions par leur key court.
const KEY_TO_URL_SLUG = {
  'idf': 'ile-de-france',
  'aura': 'auvergne-rhone-alpes',
  'bfc': 'bourgogne-franche-comte',
  'bretagne': 'bretagne',
  'cvl': 'centre-val-de-loire',
  'ge': 'grand-est',
  'hdf': 'hauts-de-france',
  'normandie': 'normandie',
  'na': 'nouvelle-aquitaine',
  'occitanie': 'occitanie',
  'pdl': 'pays-de-la-loire',
  'paca': 'provence-alpes-cote-d-azur',
  'corse': 'corse',
  'om': 'outre-mer',
};

// Mapping inverse : slug long → key court
const URL_SLUG_TO_KEY = Object.fromEntries(
  Object.entries(KEY_TO_URL_SLUG).map(([k, v]) => [v, k])
);

/**
 * Convertit un identifiant de région (key court OU slug long) en slug URL.
 * Toujours retourne le slug long (utilisable dans une URL).
 */
export function toRegionUrlSlug(keyOrSlug) {
  if (!keyOrSlug) return null;
  return KEY_TO_URL_SLUG[keyOrSlug] || keyOrSlug;
}

/**
 * Convertit un identifiant de région (key court OU slug long) en key courte.
 * Utile pour aller chercher dans REGION_DATA (qui est keyé court).
 */
export function toRegionShortKey(keyOrSlug) {
  if (!keyOrSlug) return null;
  return URL_SLUG_TO_KEY[keyOrSlug] || keyOrSlug;
}

/**
 * Récupère la data enrichie pour une région.
 * Accepte indifféremment la key courte ('idf') ou le slug long ('ile-de-france').
 */
export function getRegionData(regionKeyOrSlug) {
  if (!regionKeyOrSlug) return null;
  const key = toRegionShortKey(regionKeyOrSlug);
  return REGION_DATA[key] || null;
}

export { REGION_DATA };
