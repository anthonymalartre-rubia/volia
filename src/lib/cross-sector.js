// Mapping de catégories COMPLÉMENTAIRES (chaîne de valeur, écosystème, clientèle commune).
//
// Différent du "même groupe B2B" : ici on suggère des cats qui ont du sens
// dans la même journée de prospection (par ex. un commercial qui cible les
// restaurateurs cible souvent aussi les boulangers, traiteurs, cavistes,
// fournisseurs CHR…).
//
// Effet SEO : maillage interne qui sort de la pure verticale → Google
// comprend mieux la couverture sectorielle, et le lecteur trouve naturellement
// les pages complémentaires.

const CROSS_SECTOR_MAP = {
  // ──── Restauration / CHR ─────────────────────────────
  'restaurant': ['boulangerie-patisserie', 'traiteur', 'caviste', 'pizzeria', 'cafe', 'hotel'],
  'bar': ['restaurant', 'discotheque', 'caviste', 'brasserie', 'cafe'],
  'brasserie': ['restaurant', 'bar', 'caviste', 'boucherie', 'boulangerie-patisserie'],
  'hotel': ['restaurant', 'traiteur', 'salon-de-coiffure', 'spa', 'agence-immobiliere'],
  'pizzeria': ['restaurant', 'boulangerie-patisserie', 'fromagerie', 'caviste'],
  'cafe': ['restaurant', 'brasserie', 'boulangerie-patisserie', 'chocolaterie'],
  'traiteur': ['restaurant', 'fleuriste', 'photographe', 'agence-de-communication', 'salle-de-spectacle'],
  'boulangerie-patisserie': ['restaurant', 'pizzeria', 'cafe', 'epicerie', 'chocolaterie'],
  'chocolaterie': ['boulangerie-patisserie', 'restaurant', 'epicerie', 'caviste'],
  'discotheque': ['bar', 'restaurant', 'salle-de-spectacle', 'societe-de-securite'],
  'camping': ['hotel', 'restaurant', 'epicerie', 'agence-immobiliere'],
  'restauration-rapide': ['restaurant', 'boulangerie-patisserie', 'pizzeria', 'cafe'],

  // ──── Commerce ───────────────────────────────────────
  'opticien': ['ophtalmologue', 'pharmacie', 'centre-dentaire', 'institut-de-beaute'],
  'fleuriste': ['traiteur', 'photographe', 'agence-immobiliere', 'salle-de-spectacle'],
  'bijouterie': ['photographe', 'institut-de-beaute', 'agence-de-communication'],
  'librairie': ['cafe', 'ecole-privee', 'centre-de-formation', 'galerie-d-art'],
  'caviste': ['restaurant', 'bar', 'epicerie', 'fromagerie', 'boucherie'],
  'magasin-bio': ['epicerie', 'fromagerie', 'boucherie', 'fleuriste'],
  'magasin-de-vetements': ['magasin-de-chaussures', 'bijouterie', 'institut-de-beaute', 'pressing'],
  'magasin-de-bricolage': ['plombier', 'electricien', 'menuisier', 'magasin-d-electromenager', 'paysagiste'],
  'magasin-de-sport': ['salle-de-sport', 'centre-de-yoga', 'spa'],
  'epicerie': ['boulangerie-patisserie', 'fromagerie', 'boucherie', 'caviste', 'magasin-bio'],
  'supermarche': ['boulangerie-patisserie', 'fromagerie', 'boucherie', 'poissonnerie'],
  'jardinerie': ['paysagiste', 'magasin-de-bricolage', 'fleuriste'],
  'magasin-de-meubles': ['magasin-de-bricolage', 'ebeniste', 'menuisier', 'architecte'],

  // ──── Automobile / Transport ─────────────────────────
  'garage-automobile': ['concessionnaire-automobile', 'controle-technique', 'carrosserie', 'lavage-automobile', 'pneus'],
  'concessionnaire-automobile': ['garage-automobile', 'carrosserie', 'controle-technique', 'auto-ecole'],
  'controle-technique': ['garage-automobile', 'carrosserie', 'concessionnaire-automobile'],
  'auto-ecole': ['controle-technique', 'garage-automobile'],
  'carrosserie': ['garage-automobile', 'controle-technique', 'concessionnaire-automobile'],
  'transport-routier': ['demenagement', 'location-utilitaire', 'station-service'],
  'demenagement': ['transport-routier', 'location-utilitaire', 'agence-immobiliere'],
  'location-voiture': ['hotel', 'concessionnaire-automobile', 'auto-ecole'],

  // ──── Santé / Bien-être ──────────────────────────────
  'pharmacie': ['centre-dentaire', 'opticien', 'kinesitherapeute', 'osteopathe', 'laboratoire-d-analyses'],
  'centre-dentaire': ['pharmacie', 'kinesitherapeute', 'osteopathe', 'ophtalmologue'],
  'kinesitherapeute': ['osteopathe', 'salle-de-sport', 'centre-de-yoga', 'centre-de-reeducation', 'centre-dentaire'],
  'osteopathe': ['kinesitherapeute', 'salle-de-sport', 'centre-de-yoga'],
  'ophtalmologue': ['opticien', 'centre-dentaire', 'pharmacie'],
  'veterinaire': ['animalerie', 'pharmacie', 'pension-pour-animaux'],
  'salle-de-sport': ['centre-de-yoga', 'kinesitherapeute', 'spa', 'osteopathe', 'magasin-de-sport'],
  'centre-de-yoga': ['salle-de-sport', 'spa', 'kinesitherapeute', 'osteopathe', 'centre-de-meditation'],
  'spa': ['salon-de-coiffure', 'institut-de-beaute', 'salle-de-sport', 'centre-de-yoga', 'hotel'],
  'salon-de-coiffure': ['institut-de-beaute', 'spa', 'opticien'],
  'institut-de-beaute': ['salon-de-coiffure', 'spa', 'bijouterie', 'opticien'],
  'clinique': ['laboratoire-d-analyses', 'centre-dentaire', 'centre-de-radiologie', 'pharmacie'],
  'laboratoire-d-analyses': ['clinique', 'pharmacie', 'centre-de-radiologie'],
  'maison-de-retraite': ['kinesitherapeute', 'centre-de-reeducation', 'pharmacie', 'societe-de-nettoyage'],

  // ──── BTP / Construction ─────────────────────────────
  'plombier': ['electricien', 'chauffagiste', 'macon', 'carreleur'],
  'electricien': ['plombier', 'chauffagiste', 'domotique', 'videosurveillance'],
  'chauffagiste': ['plombier', 'electricien', 'menuisier'],
  'macon': ['plombier', 'electricien', 'couvreur', 'carreleur', 'menuisier'],
  'couvreur': ['macon', 'menuisier', 'charpentier'],
  'menuisier': ['ebeniste', 'macon', 'plombier', 'electricien', 'serrurier'],
  'peintre-en-batiment': ['carreleur', 'menuisier', 'plombier'],
  'paysagiste': ['jardinerie', 'magasin-de-bricolage', 'agence-immobiliere'],
  'architecte': ['bureau-etudes', 'entreprise-de-construction', 'macon', 'paysagiste', 'agence-immobiliere'],
  'entreprise-de-construction': ['architecte', 'macon', 'electricien', 'plombier', 'couvreur'],
  'entreprise-de-renovation': ['plombier', 'electricien', 'menuisier', 'peintre-en-batiment', 'carreleur'],
  'serrurier': ['menuisier', 'plombier', 'electricien'],
  'carreleur': ['plombier', 'macon', 'peintre-en-batiment'],
  'diagnostiqueur-immobilier': ['architecte', 'agence-immobiliere', 'expert-immobilier'],

  // ──── Services pro ───────────────────────────────────
  'avocat': ['notaire', 'expert-comptable', 'huissier-de-justice', 'cabinet-de-conseil'],
  'notaire': ['avocat', 'expert-comptable', 'agence-immobiliere', 'promoteur-immobilier', 'geometre-expert'],
  'expert-comptable': ['avocat', 'cabinet-de-conseil', 'courtier-en-assurance', 'banque'],
  'cabinet-de-conseil': ['agence-de-communication', 'agence-web', 'cabinet-de-recrutement'],
  'agence-de-communication': ['agence-web', 'agence-digitale', 'imprimerie', 'photographe'],
  'agence-web': ['agence-digitale', 'developpeur-web', 'hebergement-web', 'agence-de-communication'],
  'agence-digitale': ['agence-web', 'agence-de-communication', 'developpeur-web'],
  'developpeur-web': ['agence-web', 'agence-digitale', 'hebergement-web'],
  'agence-d-interim': ['cabinet-de-recrutement', 'formation-professionnelle', 'centre-de-formation'],
  'cabinet-de-recrutement': ['agence-d-interim', 'formation-professionnelle', 'cabinet-de-conseil'],
  'societe-de-nettoyage': ['societe-de-securite', 'entreprise-de-nettoyage', 'blanchisserie'],
  'societe-de-securite': ['societe-de-nettoyage', 'videosurveillance', 'domotique'],
  'imprimerie': ['agence-de-communication', 'photographe', 'librairie'],
  'huissier-de-justice': ['avocat', 'notaire'],
  'formation-professionnelle': ['centre-de-formation', 'agence-d-interim', 'cabinet-de-recrutement', 'cours-particuliers'],

  // ──── Immobilier ─────────────────────────────────────
  'agence-immobiliere': ['notaire', 'diagnostiqueur-immobilier', 'expert-immobilier', 'demenagement', 'architecte'],
  'promoteur-immobilier': ['architecte', 'entreprise-de-construction', 'agence-immobiliere', 'notaire'],
  'constructeur-de-maisons': ['architecte', 'plombier', 'electricien', 'paysagiste', 'agence-immobiliere'],
  'marchand-de-biens': ['agence-immobiliere', 'notaire', 'expert-immobilier'],
  'expert-immobilier': ['agence-immobiliere', 'notaire', 'diagnostiqueur-immobilier'],
  'geometre-expert': ['architecte', 'notaire', 'promoteur-immobilier'],

  // ──── Finance ────────────────────────────────────────
  'banque': ['cabinet-de-gestion-de-patrimoine', 'courtier-en-credit', 'expert-comptable'],
  'assurance': ['courtier-en-assurance', 'expert-comptable', 'cabinet-de-gestion-de-patrimoine'],
  'cabinet-de-gestion-de-patrimoine': ['banque', 'courtier-en-credit', 'expert-comptable', 'notaire'],
  'courtier-en-assurance': ['assurance', 'cabinet-de-gestion-de-patrimoine', 'banque'],
  'courtier-en-credit': ['banque', 'agence-immobiliere', 'notaire'],

  // ──── Éducation / Culture ────────────────────────────
  'ecole-privee': ['centre-de-formation', 'cours-particuliers', 'ecole-de-langues', 'creche'],
  'creche': ['ecole-privee', 'cours-particuliers'],
  'cours-particuliers': ['ecole-privee', 'centre-de-formation', 'ecole-de-langues'],
  'ecole-de-musique': ['ecole-de-danse', 'cours-particuliers', 'salle-de-spectacle'],
  'ecole-de-danse': ['ecole-de-musique', 'salle-de-sport', 'centre-de-yoga'],
  'ecole-de-langues': ['ecole-privee', 'cours-particuliers', 'formation-professionnelle'],
  'centre-de-formation': ['formation-professionnelle', 'agence-d-interim', 'cabinet-de-recrutement', 'cours-particuliers'],
  'cinema': ['salle-de-spectacle', 'musee', 'galerie-d-art'],
  'musee': ['galerie-d-art', 'cinema', 'salle-de-spectacle'],

  // ──── Tech ───────────────────────────────────────────
  'entreprise-informatique': ['reparation-informatique', 'magasin-informatique', 'telephonie', 'hebergement-web'],
  'reparation-informatique': ['entreprise-informatique', 'magasin-informatique', 'telephonie'],
  'telephonie': ['entreprise-informatique', 'reparation-informatique'],
  'hebergement-web': ['agence-web', 'developpeur-web', 'agence-digitale'],
  'videosurveillance': ['domotique', 'societe-de-securite', 'electricien'],
  'domotique': ['videosurveillance', 'electricien', 'entreprise-informatique'],

  // ──── Agriculture / Alimentation ─────────────────────
  'exploitation-agricole': ['cooperative-agricole', 'elevage', 'pepiniere', 'magasin-bio'],
  'cooperative-agricole': ['exploitation-agricole', 'elevage'],
  'boucherie': ['fromagerie', 'epicerie', 'restaurant', 'caviste'],
  'fromagerie': ['boucherie', 'epicerie', 'restaurant', 'caviste'],
  'poissonnerie': ['boucherie', 'restaurant', 'epicerie'],
  'elevage': ['exploitation-agricole', 'cooperative-agricole', 'veterinaire'],

  // ──── Industrie / Artisanat ──────────────────────────
  'pressing': ['blanchisserie', 'cordonnerie'],
  'blanchisserie': ['pressing', 'societe-de-nettoyage'],
  'photographe': ['agence-de-communication', 'agence-web', 'imprimerie', 'traiteur', 'fleuriste'],
  'ebeniste': ['menuisier', 'magasin-de-meubles', 'architecte'],
  'cordonnerie': ['pressing', 'magasin-de-chaussures'],
};

/**
 * Retourne les slugs de catégories complémentaires (pour maillage interne).
 * Si pas de mapping spécifique, retourne [] et l'appelant utilisera le
 * fallback same-group.
 */
export function getCrossSectorSlugs(categorySlug) {
  if (!categorySlug) return [];
  return CROSS_SECTOR_MAP[categorySlug] || [];
}

export { CROSS_SECTOR_MAP };
