// Data layer enrichissement SEO pour les 150 catégories B2B.
//
// Stratégie :
//   - GROUP_DEFAULTS : 1 entrée par groupe (12 groupes B2B). Couvre toutes
//     les catégories de ce groupe par défaut.
//   - CATEGORY_OVERRIDES : overrides spécifiques pour les catégories
//     stratégiques (gros volume de recherche, ICP fort).
//   - getCategoryData(category) merge defaults + overrides + label dynamique.
//
// Champs :
//   marketSize  — taille marché France (text)
//   persona     — { titles[], decisionMaker, painPoint }
//   kpis        — { label, value, hint }[]  (4 chiffres sectoriels)
//   seasonality — { peak, low, comment }
//   topRegions  — 3 slugs de regions où le secteur est concentré (+ raison)
//   objections  — { objection, reponse }[]  (3 entrées)
//   pitchHook   — exemple cold email d'accroche (1-2 phrases)
//   glossary    — { term, def }[]  (3-5 termes métier)
//   painPoints  — 3 douleurs business du secteur
//   bestApproach — { channel, timing, why }
//
// Toutes les valeurs textuelles supportent les placeholders :
//   {label}, {labelPlural}, {labelCapitalized}

const GROUP_DEFAULTS = {
  'Hôtellerie & Restauration': {
    marketSize: '660 000 entreprises dans l\'hôtellerie-restauration en France, dont 175 000 cafés-restaurants et 18 500 hôtels (source : INSEE 2024).',
    persona: {
      titles: ['Gérant', 'Propriétaire', 'Directeur d\'établissement', 'Chef de cuisine'],
      decisionMaker: 'le gérant ou propriétaire — souvent une seule personne décide',
      painPoint: 'marge alimentaire serrée, rotation du personnel, dépendance aux plateformes (Booking, Uber Eats, TheFork)',
    },
    kpis: [
      { label: 'Ticket moyen', value: '24 €', hint: 'restaurant traditionnel hors boissons' },
      { label: 'Marge nette', value: '4-8 %', hint: 'après matière, masse salariale, loyer' },
      { label: 'Saisonnalité', value: '+38 % été', hint: 'CA juillet-août vs janvier-février' },
      { label: 'Commission plateforme', value: '12-30 %', hint: 'sur les réservations en ligne' },
    ],
    seasonality: {
      peak: 'juin → septembre + décembre (fêtes)',
      low: 'janvier → mars',
      comment: 'Prospectez en basse saison : les gérants ont du temps pour les démos et préparent leur stratégie année.',
    },
    topRegions: [
      { slug: 'paca', reason: 'capacité touristique : 14 % des hôtels français' },
      { slug: 'idf', reason: 'densité Paris + business travel' },
      { slug: 'aura', reason: 'tourisme alpin + Lyon gastronomique' },
    ],
    objections: [
      { objection: 'On n\'a pas le temps de tester un nouvel outil', reponse: 'Démo 8 min à un moment où c\'est calme (entre 15h et 17h). Pas d\'install, juste un export CSV à la fin.' },
      { objection: 'On a déjà notre carnet d\'adresses', reponse: 'Justement, complétez-le sur les zones où vous n\'êtes pas implantés. Notre base couvre les 101 départements.' },
      { objection: 'Le RGPD nous inquiète', reponse: 'Tous les emails sont sourcés sur des sites publics, opt-out 1-clic dans chaque envoi, filtres antispam automatiques.' },
    ],
    pitchHook: 'Bonjour {first_name}, en regardant {company} sur Google j\'ai vu que vous tournez bien sur la saison. Une idée pour booster les couverts en basse saison ?',
    glossary: [
      { term: 'Ticket moyen', def: 'CA divisé par le nombre de couverts servis.' },
      { term: 'Brigade', def: 'L\'équipe en cuisine (chef, sous-chef, commis, plongeur).' },
      { term: 'Food cost', def: 'Coût matière première rapporté au CA, idéalement < 30 %.' },
      { term: 'No-show', def: 'Réservation non honorée — taux moyen 10-15 % en France.' },
    ],
    painPoints: [
      'Rotation du personnel (turnover > 50 % dans la restauration commerciale)',
      'Marge réduite par les commissions Booking, TheFork, Uber Eats',
      'Saisonnalité forte qui complique la trésorerie',
    ],
    bestApproach: {
      channel: 'Email entre 15h et 17h (creux entre service midi et soir)',
      timing: 'Janvier-mars (basse saison)',
      why: 'Les gérants lisent peu le matin et sont en service le soir. Le créneau de l\'après-midi est leur seul moment de "bureau".',
    },
  },

  'Commerce & Distribution': {
    marketSize: '690 000 commerces de détail en France (source : INSEE), dont 150 000 commerces de proximité indépendants.',
    persona: {
      titles: ['Gérant', 'Responsable de magasin', 'Acheteur', 'Directeur commercial'],
      decisionMaker: 'gérant pour les indépendants, responsable d\'enseigne pour les chaînes',
      painPoint: 'concurrence e-commerce, gestion des stocks, baisse du trafic en magasin physique',
    },
    kpis: [
      { label: 'Panier moyen', value: '37 €', hint: 'commerce de proximité non-alimentaire' },
      { label: 'Marge brute', value: '35-45 %', hint: 'avant coûts opérationnels' },
      { label: 'Trafic magasin', value: '-12 %', hint: 'évolution moyenne 2020 → 2024' },
      { label: 'Part e-commerce', value: '14 %', hint: 'du commerce de détail FR' },
    ],
    seasonality: {
      peak: 'novembre-décembre (Black Friday + fêtes) + soldes',
      low: 'fin janvier → mars + août',
      comment: 'Évitez les semaines de soldes (impossibles à joindre). Privilégiez mars-juin et septembre-octobre.',
    },
    topRegions: [
      { slug: 'idf', reason: 'densité commerciale la plus élevée' },
      { slug: 'aura', reason: 'pôles régionaux Lyon, Grenoble, Annecy' },
      { slug: 'paca', reason: 'tourisme + population dense' },
    ],
    objections: [
      { objection: 'On préfère du physique', reponse: 'Vous gardez la main : on vous fournit la liste qualifiée, vous décidez du moyen de contact (email, visite, téléphone).' },
      { objection: 'Trop cher pour mes marges', reponse: 'À 19 €/mois pour 500 emails trouvés, c\'est moins cher qu\'un encart Pages Jaunes.' },
      { objection: 'On a fait Apollo, ça ne sert à rien', reponse: 'Les bases orientées USA sont moins denses sur le tissu PME français. Nous sommes sur ~46 % de find-rate email spécifiquement sur le marché français.' },
    ],
    pitchHook: 'Bonjour {first_name}, je vois que {company} est bien implanté localement. Comment vous faites pour fidéliser face à la concurrence e-commerce ?',
    glossary: [
      { term: 'Panier moyen', def: 'CA divisé par le nombre de tickets de caisse.' },
      { term: 'Taux de transformation', def: 'Pourcentage de visiteurs qui achètent (idéal 25-40 % en magasin).' },
      { term: 'Click & collect', def: 'Commande en ligne, retrait en magasin — 35 % des achats omnicanal.' },
      { term: 'GMS', def: 'Grande et Moyenne Surface (Carrefour, Leclerc, etc.).' },
    ],
    painPoints: [
      'Pression Amazon + marketplaces sur les prix',
      'Coûts de location élevés en centre-ville',
      'Difficulté à recruter et fidéliser des vendeurs',
    ],
    bestApproach: {
      channel: 'Email lundi-jeudi entre 10h et 11h',
      timing: 'Mars-mai et septembre-octobre',
      why: 'Les gérants traitent leur admin en début de matinée, hors période de pic commercial.',
    },
  },

  'Automobile & Transport': {
    marketSize: '70 000 garages indépendants + 4 500 concessionnaires + 12 000 entreprises de transport routier de marchandises en France.',
    persona: {
      titles: ['Chef d\'atelier', 'Gérant', 'Responsable parc', 'Directeur d\'exploitation'],
      decisionMaker: 'gérant pour les indépendants, directeur de site pour les concessions',
      painPoint: 'pénurie de main d\'œuvre qualifiée, transition électrique, marges sur les pièces',
    },
    kpis: [
      { label: 'CA moyen garage', value: '420 k€', hint: 'indépendant 2-4 mécaniciens' },
      { label: 'Marge atelier', value: '55-65 %', hint: 'sur la main d\'œuvre' },
      { label: 'Taux occupation pont', value: '78 %', hint: 'objectif rentabilité' },
      { label: 'Part véhicules électriques', value: '17 %', hint: 'des immatriculations neuves 2024' },
    ],
    seasonality: {
      peak: 'mars-avril (passage été) + octobre-novembre (passage hiver)',
      low: 'juillet-août',
      comment: 'Les périodes de changement de pneus sont les pics. Avant ou après, c\'est plus calme pour démarcher.',
    },
    topRegions: [
      { slug: 'aura', reason: 'industrie automobile + pôle Lyon' },
      { slug: 'idf', reason: 'flotte d\'entreprise + densité véhicules' },
      { slug: 'hdf', reason: 'historique constructeurs nord' },
    ],
    objections: [
      { objection: 'On bosse au bouche-à-oreille', reponse: 'Top pour la fidélisation. Mais pour les flottes d\'entreprise, il faut prospecter — c\'est là qu\'on aide.' },
      { objection: 'On n\'a pas de site internet', reponse: 'Vous n\'en avez pas besoin pour acheter une liste. Vous nous donnez votre zone, on vous sort les flottes locales.' },
      { objection: 'Les flottes sont déjà sous contrat', reponse: 'Les contrats tournent tous les 3-5 ans. Le bon timing c\'est 6 mois avant échéance — on cible cette fenêtre.' },
    ],
    pitchHook: 'Bonjour {first_name}, j\'ai vu que {company} a un atelier {position_title}. Vous gérez des flottes d\'entreprise localement ?',
    glossary: [
      { term: 'Forfait main d\'œuvre', def: 'Tarif fixe par opération (vidange, freins…) — souvent 70-90 €/h facturés.' },
      { term: 'OEM / OES', def: 'Pièces d\'origine constructeur (OEM) vs équipementier (OES).' },
      { term: 'Carrossage', def: 'Adaptation d\'un utilitaire neuf à un usage métier (frigorifique, plateau…).' },
      { term: 'Contrôle technique', def: 'Obligatoire tous les 2 ans après 4 ans, validité 2 mois pour les contre-visites.' },
    ],
    painPoints: [
      'Pénurie de mécaniciens (35 000 postes non pourvus en France)',
      'Investissement transition électrique (formation + outillage)',
      'Marges sur pièces écrasées par les sites en ligne (Oscaro, Mister Auto)',
    ],
    bestApproach: {
      channel: 'Téléphone entre 11h et 12h, ou email tôt (7h-8h)',
      timing: 'Mai-juin ou septembre',
      why: 'Les chefs d\'atelier sont sur le pont (au sens propre) toute la journée. Ils lisent leurs mails très tôt avant l\'ouverture.',
    },
  },

  'Santé & Bien-être': {
    marketSize: '230 000 professionnels de santé libéraux + 22 000 pharmacies + 5 200 cliniques en France.',
    persona: {
      titles: ['Praticien', 'Pharmacien titulaire', 'Directeur d\'établissement', 'Coordinateur'],
      decisionMaker: 'le praticien lui-même en libéral, directeur administratif en clinique',
      painPoint: 'temps administratif > 30 % du temps de travail, demande croissante, démographie médicale',
    },
    kpis: [
      { label: 'CA moyen cabinet médical', value: '180 k€', hint: 'médecin généraliste libéral' },
      { label: 'Heures admin/semaine', value: '12 h', hint: 'sur 50 h travaillées' },
      { label: 'Délais RDV moyen', value: '6 jours', hint: 'généraliste, 23 jours spécialiste' },
      { label: 'Marge pharmacie', value: '8-12 %', hint: 'après coûts opérationnels' },
    ],
    seasonality: {
      peak: 'octobre-mars (épidémies hivernales)',
      low: 'juillet-août',
      comment: 'Évitez l\'hiver (overload) et juillet-août (vacances). Mars-juin et septembre sont idéaux.',
    },
    topRegions: [
      { slug: 'idf', reason: 'densité professionnels de santé' },
      { slug: 'paca', reason: 'population âgée + cliniques privées' },
      { slug: 'aura', reason: 'pôles hospitaliers Lyon + Grenoble' },
    ],
    objections: [
      { objection: 'Pas le temps', reponse: 'On a pensé à un mail très court (3 lignes). 10 secondes max. Si ça vous parle, on en reparle.' },
      { objection: 'Je passe par mon syndicat', reponse: 'Très bien pour les achats groupés. Pour le reste (recrutement, formation, équipement), on est complémentaires.' },
      { objection: 'Pas de budget', reponse: 'Notre offre démarre à 19 €/mois. C\'est moins qu\'une boîte d\'examens.' },
    ],
    pitchHook: 'Bonjour Docteur {last_name}, j\'imagine que la rentrée est chargée. Une idée pour libérer 2-3 heures par semaine sur l\'administratif ?',
    glossary: [
      { term: 'Convention', def: 'Accord avec la Sécurité sociale (secteur 1, 2, 3) qui fixe les tarifs.' },
      { term: 'CPTS', def: 'Communauté Professionnelle Territoriale de Santé — regroupement local de soignants.' },
      { term: 'ROSP', def: 'Rémunération sur Objectifs de Santé Publique — bonus annuel CPAM.' },
      { term: 'Tiers payant', def: 'Le patient n\'avance pas les frais, la Sécu paie directement le praticien.' },
    ],
    painPoints: [
      'Démographie médicale en baisse (déserts médicaux)',
      'Charge administrative en augmentation constante',
      'Difficulté à digitaliser (outils peu adaptés au métier)',
    ],
    bestApproach: {
      channel: 'Email mardi/jeudi entre 13h et 14h',
      timing: 'Mars-juin ou septembre-octobre',
      why: 'Les praticiens prennent leur pause repas pour traiter les mails non-urgents. Évitez les lundis (RDV chargés) et vendredis.',
    },
  },

  'BTP & Construction': {
    marketSize: '670 000 entreprises du bâtiment en France, dont 95 % de TPE de moins de 10 salariés.',
    persona: {
      titles: ['Dirigeant', 'Conducteur de travaux', 'Chef de chantier', 'Responsable bureau d\'études'],
      decisionMaker: 'le dirigeant TPE/PME, ou DAF pour les groupes > 50 salariés',
      painPoint: 'pénurie de main d\'œuvre, hausse coûts matériaux, marchés publics complexes',
    },
    kpis: [
      { label: 'CA moyen TPE BTP', value: '320 k€', hint: 'artisan 1-5 salariés' },
      { label: 'Marge nette', value: '3-6 %', hint: 'après matériaux et masse salariale' },
      { label: 'Délai de paiement', value: '58 jours', hint: 'moyenne France, > au B2B classique' },
      { label: 'Taux de devis signés', value: '28 %', hint: 'sur les devis envoyés' },
    ],
    seasonality: {
      peak: 'avril-octobre (chantiers extérieurs) + appels d\'offres rentrée',
      low: 'décembre-février',
      comment: 'Hiver = phase commerciale et chiffrage. C\'est le bon moment pour prospecter en B2B.',
    },
    topRegions: [
      { slug: 'idf', reason: 'Grand Paris + densité chantiers' },
      { slug: 'paca', reason: 'volume résidentiel + tertiaire Marseille/Nice' },
      { slug: 'aura', reason: 'Lyon métropole + Grenoble pôle tech' },
    ],
    objections: [
      { objection: 'On est plein jusqu\'en 2027', reponse: 'Top, on parle quand vous voulez. Mais on garde le contact pour quand votre carnet sera moins rempli.' },
      { objection: 'Le boss n\'est jamais au bureau', reponse: 'Normal. Mail le soir entre 19h et 21h, c\'est là qu\'ils lisent.' },
      { objection: 'Les commerciaux ça nous gonfle', reponse: 'Justement, c\'est pas du tout l\'idée. On vous file un outil, vous l\'utilisez (ou pas). Pas de relance.' },
    ],
    pitchHook: 'Bonjour {first_name}, je vois que {company} fait du {position_title}. Vous chiffrez beaucoup de devis pour les particuliers ou plutôt sur appels d\'offres publics ?',
    glossary: [
      { term: 'AO', def: 'Appel d\'offres (public ou privé) avec cahier des charges.' },
      { term: 'OPC', def: 'Ordonnancement, Pilotage, Coordination — coordination des corps d\'état.' },
      { term: 'BIM', def: 'Building Information Modeling — maquette numérique 3D du chantier.' },
      { term: 'Pose-fourni', def: 'Devis comprenant matériaux + main d\'œuvre (vs main d\'œuvre seule).' },
    ],
    painPoints: [
      'Recrutement (plombiers, électriciens : 65 000 postes non pourvus)',
      'Hausse matériaux post-2022 (acier, isolants, bois)',
      'Trésorerie tendue à cause des délais de paiement',
    ],
    bestApproach: {
      channel: 'Email tôt (7h-8h) ou tard (19h-21h)',
      timing: 'Décembre-février (intersaison chantiers)',
      why: 'Les patrons BTP sont sur les chantiers en journée. Ils consultent leurs mails avant ou après le travail.',
    },
  },

  'Services aux entreprises': {
    marketSize: '480 000 entreprises de services BtoB en France : conseil, comptabilité, juridique, RH, communication.',
    persona: {
      titles: ['Associé', 'Directeur général', 'Responsable développement', 'Chef de projet'],
      decisionMaker: 'associé fondateur ou directeur commercial pour les cabinets > 5 personnes',
      painPoint: 'différenciation difficile, dépendance au bouche-à-oreille, marges sous pression',
    },
    kpis: [
      { label: 'CA par associé', value: '380 k€', hint: 'cabinet conseil moyen' },
      { label: 'Coût acquisition client', value: '4-8 k€', hint: 'B2B services pro' },
      { label: 'Lifetime value', value: '5-12 ans', hint: 'durée moyenne client expert-comptable' },
      { label: 'Taux churn annuel', value: '8 %', hint: 'avocats et comptables' },
    ],
    seasonality: {
      peak: 'janvier-avril (clôture fiscale) + septembre (rentrée)',
      low: 'juillet-août + décembre',
      comment: 'Évitez la période fiscale (mars-mai chez les experts-comptables). Mai-juin et septembre sont idéaux.',
    },
    topRegions: [
      { slug: 'idf', reason: 'concentration sièges sociaux + cabinets' },
      { slug: 'aura', reason: 'Lyon = 2e place financière française' },
      { slug: 'occitanie', reason: 'Toulouse + écosystème aéronautique' },
    ],
    objections: [
      { objection: 'On bosse uniquement par recommandation', reponse: 'Recommandation = top pour fidéliser. Mais quand vous voulez ouvrir un nouveau segment, recommandation = 0. Là on aide.' },
      { objection: 'Pas le temps de prospecter', reponse: 'Justement, on automatise. Vous passez 1h à choisir votre cible, on vous fournit la liste.' },
      { objection: 'On a un commercial', reponse: 'Parfait, on lui donne 5x plus de leads qualifiés.' },
    ],
    pitchHook: 'Bonjour {first_name}, je vois que {company} accompagne {custom.secteur}. Comment vous trouvez vos nouveaux clients aujourd\'hui ?',
    glossary: [
      { term: 'TJM', def: 'Taux Journalier Moyen — base de facturation conseil (500-1500 €/j).' },
      { term: 'Retainer', def: 'Forfait mensuel récurrent (vs mission ponctuelle).' },
      { term: 'Pitch deck', def: 'Présentation commerciale courte (10-15 slides).' },
      { term: 'ICP', def: 'Ideal Customer Profile — description du client cible idéal.' },
    ],
    painPoints: [
      'Difficulté à se différencier dans un marché saturé',
      'Cycle de vente long (3-9 mois)',
      'Forte dépendance aux 2-3 plus gros clients',
    ],
    bestApproach: {
      channel: 'Email LinkedIn ou pro, mardi-jeudi 10h-11h',
      timing: 'Mai-juin et septembre-octobre',
      why: 'Les associés/dirigeants sont en réunion l\'après-midi. Mardi-jeudi évite lundi de rentrée et vendredi de sortie.',
    },
  },

  'Immobilier': {
    marketSize: '32 000 agences immobilières + 12 000 promoteurs et constructeurs en France (FNAIM 2024).',
    persona: {
      titles: ['Directeur d\'agence', 'Négociateur', 'Promoteur', 'Responsable transactions'],
      decisionMaker: 'directeur d\'agence pour la transaction, dirigeant pour la promotion',
      painPoint: 'baisse 2023-2024 du marché, taux qui remontent, concurrence des mandataires',
    },
    kpis: [
      { label: 'CA moyen agence', value: '450 k€', hint: 'agence indépendante 3-5 négos' },
      { label: 'Commission moyenne', value: '4,8 %', hint: 'sur la valeur du bien' },
      { label: 'Délai de vente', value: '92 jours', hint: 'France 2024, vs 67 j en 2021' },
      { label: 'Baisse volume', value: '-22 %', hint: 'transactions 2023 vs 2022' },
    ],
    seasonality: {
      peak: 'mars-juin (acheteurs actifs avant vacances) + septembre',
      low: 'novembre-février',
      comment: 'Profitez de l\'hiver pour démarcher : les agences ont plus de temps et préparent leur stratégie année.',
    },
    topRegions: [
      { slug: 'idf', reason: 'plus gros marché de France' },
      { slug: 'paca', reason: 'tourisme + résidences secondaires' },
      { slug: 'aura', reason: 'Lyon = 2e métropole + tension prix' },
    ],
    objections: [
      { objection: 'On est dans une crise', reponse: 'Justement, la prospection sera votre arme de différenciation quand le marché redémarrera en 2026.' },
      { objection: 'On a déjà nos mandats', reponse: 'Pour les mandats exclusifs sur les biens premium, il faut prospecter les propriétaires en amont — c\'est notre cas d\'usage.' },
      { objection: 'Les portails coûtent déjà cher', reponse: 'SeLoger / LeBonCoin = lead acheteur. Nous c\'est lead vendeur + bailleur — totalement complémentaire.' },
    ],
    pitchHook: 'Bonjour {first_name}, comment {company} prospecte les vendeurs aujourd\'hui ? Sourcing en porte-à-porte ou plus digital ?',
    glossary: [
      { term: 'Mandat exclusif', def: 'L\'agence est seule à pouvoir vendre le bien — commission supérieure mais plus dur à obtenir.' },
      { term: 'Honoraires', def: 'Commission de l\'agence (3-7 % du prix de vente, à charge vendeur ou acheteur).' },
      { term: 'DPE', def: 'Diagnostic de Performance Énergétique — obligatoire à la vente.' },
      { term: 'Promesse vs compromis', def: 'Promesse : engage que le vendeur. Compromis : engage les deux parties.' },
    ],
    painPoints: [
      'Baisse du volume de transactions (-22 % en 2023)',
      'Concurrence forte des mandataires (IAD, SAFTI) à frais réduits',
      'Dépendance aux portails (SeLoger, LBC) coûteux',
    ],
    bestApproach: {
      channel: 'Téléphone mardi-jeudi 14h-17h, ou LinkedIn',
      timing: 'Novembre-février',
      why: 'Les directeurs d\'agence sont en RDV vendeurs le samedi et matin de semaine. Après-midi en semaine = créneau "bureau".',
    },
  },

  'Industrie & Artisanat': {
    marketSize: '290 000 entreprises industrielles + 1,3 M d\'artisans en France (CMA + INSEE 2024).',
    persona: {
      titles: ['Dirigeant', 'Responsable production', 'Acheteur', 'Responsable qualité'],
      decisionMaker: 'dirigeant en TPE, directeur de site ou achats en PME/ETI',
      painPoint: 'pénurie main d\'œuvre qualifiée, hausse énergie, dépendance Asie',
    },
    kpis: [
      { label: 'CA moyen TPE industrielle', value: '780 k€', hint: '5-9 salariés' },
      { label: 'Cycle de vente', value: '4-9 mois', hint: 'B2B industrie' },
      { label: 'Marge brute', value: '28-42 %', hint: 'transformation' },
      { label: 'Investissement annuel', value: '6,5 % CA', hint: 'machines, outillage' },
    ],
    seasonality: {
      peak: 'septembre-novembre (préparation année N+1) + janvier-mars',
      low: 'juillet-août (congés industriels) + décembre',
      comment: 'Évitez la fermeture estivale (3-4 semaines en août). Janvier et septembre sont parfaits pour démarrer un nouveau cycle.',
    },
    topRegions: [
      { slug: 'aura', reason: 'tissu industriel historique vallée du Rhône' },
      { slug: 'hdf', reason: 'industrie automobile + métallurgie' },
      { slug: 'ge', reason: 'frontière allemande + savoir-faire industriel' },
    ],
    objections: [
      { objection: 'On bosse en B2B sur appel d\'offres', reponse: 'Top, nous on aide à monter votre base de prospects en amont des AO pour avoir un coup d\'avance.' },
      { objection: 'On a pas besoin de marketing', reponse: 'On parle pas de marketing, on parle de constituer une base de donneurs d\'ordre.' },
      { objection: 'C\'est de la prospection à froid, ça marche plus', reponse: 'Si vous ciblez large oui. Si vous ciblez sur 200-500 comptes ultra-qualifiés avec un vrai pitch, ça marche très bien.' },
    ],
    pitchHook: 'Bonjour {first_name}, {company} fabrique du {custom.metier}. Quels sont vos 3 plus gros donneurs d\'ordre aujourd\'hui ?',
    glossary: [
      { term: 'Donneur d\'ordre', def: 'Client final qui passe commande à un sous-traitant.' },
      { term: 'AOC / AOQ', def: 'Atelier Orienté Client (production série) / Atelier Orienté Qualité.' },
      { term: 'ERP', def: 'Logiciel de gestion intégrée (SAP, Sage, etc.) — central en industrie.' },
      { term: 'Lean', def: 'Méthode d\'optimisation continue importée de Toyota.' },
    ],
    painPoints: [
      'Pénurie de soudeurs, opérateurs CNC, techniciens maintenance',
      'Hausse des prix de l\'énergie (-15 % de marge en 2022)',
      'Dépendance aux clients étrangers (souvent Allemagne)',
    ],
    bestApproach: {
      channel: 'Email mardi-jeudi 8h-10h ou téléphone 11h-12h',
      timing: 'Janvier-mars ou septembre-octobre',
      why: 'Les dirigeants industriels sont matinaux (production démarre tôt). Le mail du matin a le meilleur taux d\'ouverture.',
    },
  },

  'Finance & Assurance': {
    marketSize: '52 000 cabinets financiers + 25 000 courtiers en assurance + 360 banques en France (ACPR 2024).',
    persona: {
      titles: ['Conseiller', 'Directeur d\'agence', 'Courtier', 'CGP'],
      decisionMaker: 'directeur d\'agence ou associé en cabinet, fortement régulé',
      painPoint: 'réglementation lourde (MIF2, DDA), digitalisation, concurrence néobanques',
    },
    kpis: [
      { label: 'CA moyen courtier', value: '290 k€', hint: 'cabinet 2-4 personnes' },
      { label: 'Marge nette', value: '18-25 %', hint: 'après charges' },
      { label: 'Cycle de vente', value: '6 semaines', hint: 'assurance pro B2B' },
      { label: 'Taux fidélisation', value: '92 %', hint: 'clients 3+ ans' },
    ],
    seasonality: {
      peak: 'septembre-novembre (renouvellements pro) + janvier (loi Hamon assurance)',
      low: 'juillet-août',
      comment: 'Le pic des renouvellements pro est en novembre-décembre. Démarchez en septembre pour être présent au bon moment.',
    },
    topRegions: [
      { slug: 'idf', reason: 'place financière française' },
      { slug: 'aura', reason: 'Lyon = 2e place financière' },
      { slug: 'paca', reason: 'patrimoine privé important' },
    ],
    objections: [
      { objection: 'On est très régulés sur la prospection', reponse: 'Tout à fait — notre outil respecte DDA / MIF2, opt-out 1-clic systématique, traçabilité complète.' },
      { objection: 'Nos clients viennent par recommandation', reponse: 'Vrai pour 70 % des nouveaux. Mais les 30 % restants viennent du digital — c\'est notre canal.' },
      { objection: 'Le coût client est trop élevé', reponse: 'À 19 €/mois pour 500 emails trouvés, vous êtes à moins de 0,04 €/contact. Imbattable.' },
    ],
    pitchHook: 'Bonjour {first_name}, en B2B assurance pro, le timing renouvellement est clé. Comment {company} identifie les comptes à 6 mois de l\'échéance ?',
    glossary: [
      { term: 'CGP', def: 'Conseiller en Gestion de Patrimoine — accompagne clients fortunés.' },
      { term: 'DDA', def: 'Directive sur la Distribution d\'Assurances — encadre la vente d\'assurances.' },
      { term: 'PER', def: 'Plan Épargne Retraite — produit phare 2020+.' },
      { term: 'Souscription', def: 'Étape de validation médicale/financière avant émission du contrat.' },
    ],
    painPoints: [
      'Conformité réglementaire chronophage (RGPD + DDA)',
      'Pression sur les commissions (transparence client)',
      'Démographie : 35 % des courtiers ont > 55 ans',
    ],
    bestApproach: {
      channel: 'Email mardi-jeudi 9h-10h ou LinkedIn',
      timing: 'Septembre + janvier',
      why: 'Le secteur financier travaille en horaires de bureau classiques. Privilégiez le matin avant les RDV clients.',
    },
  },

  'Éducation & Culture': {
    marketSize: '14 000 écoles privées + 36 000 organismes de formation + 27 000 structures culturelles en France.',
    persona: {
      titles: ['Directeur', 'Responsable pédagogique', 'Coordinateur', 'Programmateur'],
      decisionMaker: 'directeur d\'établissement, parfois conseil d\'administration',
      painPoint: 'budget restreint, recrutement formateurs, digitalisation pédagogique',
    },
    kpis: [
      { label: 'Budget moyen formation pro', value: '1,8 k€', hint: 'par salarié par an en France' },
      { label: 'Taux financement', value: '78 %', hint: 'formations OPCO / CPF' },
      { label: 'CA formation moyen', value: '850 k€', hint: 'OF de 5-15 salariés' },
      { label: 'Heures formation', value: '34 h', hint: 'moyenne par salarié français' },
    ],
    seasonality: {
      peak: 'septembre-octobre (rentrée) + janvier (budgets formation)',
      low: 'juillet-août + décembre',
      comment: 'La rentrée scolaire est le pic. Démarrez les conversations en juin pour septembre.',
    },
    topRegions: [
      { slug: 'idf', reason: 'concentration écoles privées + sièges OF' },
      { slug: 'aura', reason: 'pôle universitaire Lyon-Grenoble' },
      { slug: 'occitanie', reason: 'Toulouse étudiante + culture occitane' },
    ],
    objections: [
      { objection: 'On a un budget serré', reponse: '19 €/mois c\'est moins qu\'un livre scolaire. Et on a une offre association/non-lucratif.' },
      { objection: 'On bosse via les OPCO', reponse: 'Pour le financement oui. Pour aller chercher les clients entreprises directement, c\'est nous.' },
      { objection: 'Nos formateurs viennent à nous', reponse: 'On parle pas de recruter des formateurs, on parle de trouver des entreprises qui ont besoin de vos formations.' },
    ],
    pitchHook: 'Bonjour {first_name}, comment {company} trouve les entreprises clientes pour vos formations {custom.specialite} ?',
    glossary: [
      { term: 'OPCO', def: 'Opérateur de Compétences — finance les formations pro par branche.' },
      { term: 'CPF', def: 'Compte Personnel de Formation — droits formation du salarié.' },
      { term: 'Qualiopi', def: 'Certification obligatoire des OF depuis 2022.' },
      { term: 'FOAD', def: 'Formation Ouverte À Distance — e-learning + visio.' },
    ],
    painPoints: [
      'Baisse des financements CPF après réforme 2024',
      'Qualiopi : charges administratives lourdes',
      'Concurrence des MOOC gratuits (Coursera, OpenClassrooms)',
    ],
    bestApproach: {
      channel: 'Email mardi-jeudi 14h-16h',
      timing: 'Mai-juin pour rentrée septembre',
      why: 'Les responsables formation sont en RDV le matin. L\'après-midi est dédié à l\'admin et la veille marché.',
    },
  },

  'Technologie & Digital': {
    marketSize: '85 000 entreprises tech en France + 28 000 agences digitales (Numeum 2024).',
    persona: {
      titles: ['CEO', 'CTO', 'Directeur commercial', 'Head of Growth'],
      decisionMaker: 'CEO ou COO en startup, DSI ou achats en PME/ETI',
      painPoint: 'cycle de vente long, churn, recrutement développeurs',
    },
    kpis: [
      { label: 'ARR moyen SaaS FR', value: '720 k€', hint: 'séries A startups B2B' },
      { label: 'Coût acquisition', value: '4-15 k€', hint: 'B2B SaaS mid-market' },
      { label: 'Cycle vente', value: '90-180 jours', hint: 'SaaS B2B France' },
      { label: 'Churn annuel', value: '8-15 %', hint: 'mid-market SaaS' },
    ],
    seasonality: {
      peak: 'janvier-mars (budgets annuels) + septembre-octobre (rentrée tech)',
      low: 'juillet-août + décembre',
      comment: 'Les cycles budgétaires sont en début d\'année et à la rentrée. Évitez décembre (signing freeze).',
    },
    topRegions: [
      { slug: 'idf', reason: 'Station F + écosystème startup Paris' },
      { slug: 'aura', reason: 'Lyon Tech, Grenoble (semicond.)' },
      { slug: 'occitanie', reason: 'Toulouse spatial + Montpellier eHealth' },
    ],
    objections: [
      { objection: 'On utilise déjà Apollo', reponse: 'Les bases orientées USA sont moins denses sur le tissu PME français. Testez gratuitement (25 crédits offerts chaque mois), comparez les résultats.' },
      { objection: 'Pas de budget marketing', reponse: '19 €/mois et 0 commitment. Vous coupez quand vous voulez.' },
      { objection: 'On bosse 100 % en inbound', reponse: 'Quand vous voulez accélérer ou cibler des grands comptes, outbound = obligatoire. On vous prépare le terrain.' },
    ],
    pitchHook: 'Bonjour {first_name}, je vois que {company} est sur {custom.stack}. Comment vous générez vos leads B2B aujourd\'hui ?',
    glossary: [
      { term: 'ARR / MRR', def: 'Annual / Monthly Recurring Revenue — métriques SaaS.' },
      { term: 'PMF', def: 'Product-Market Fit — preuve que ton produit a un marché.' },
      { term: 'CAC / LTV', def: 'Customer Acquisition Cost / Lifetime Value — ratio < 1/3 = sain.' },
      { term: 'ICP', def: 'Ideal Customer Profile — description précise du client cible.' },
    ],
    painPoints: [
      'Cycle de vente long avec multi-stakeholders',
      'Churn invisible (clients qui ne se loggent plus)',
      'Recrutement développeurs : 35 % des postes non pourvus',
    ],
    bestApproach: {
      channel: 'Email LinkedIn mardi-jeudi 9h-11h',
      timing: 'Janvier-mars et septembre-octobre',
      why: 'Les fondateurs tech sont en focus produit l\'après-midi. Le matin et le début de semaine sont les moments commerciaux.',
    },
  },

  'Agriculture & Alimentation': {
    marketSize: '390 000 exploitations agricoles + 18 000 IAA (industries agro-alimentaires) en France.',
    persona: {
      titles: ['Exploitant', 'Gérant coopérative', 'Acheteur GMS', 'Responsable production'],
      decisionMaker: 'l\'exploitant pour la ferme, le conseil d\'administration en coopérative',
      painPoint: 'volatilité des prix, transition agro-écologique, dépendance distribution',
    },
    kpis: [
      { label: 'Taille moyenne exploitation', value: '69 ha', hint: 'France métropolitaine 2024' },
      { label: 'Âge moyen exploitant', value: '52 ans', hint: '25 % > 60 ans' },
      { label: 'CA moyen IAA', value: '5,4 M€', hint: '50+ salariés' },
      { label: 'Part agro-bio', value: '10,7 %', hint: 'surfaces françaises' },
    ],
    seasonality: {
      peak: 'novembre-février (planning saison) + août-octobre (récoltes)',
      low: 'mars-juillet (saison active : semis, foin, moisson)',
      comment: 'Les exploitants sont aux champs l\'été. Démarchez en hiver, c\'est leur saison "bureau".',
    },
    topRegions: [
      { slug: 'na', reason: 'plus grande région agricole de France' },
      { slug: 'aura', reason: 'élevage Auvergne + viticulture' },
      { slug: 'bretagne', reason: 'élevage + IAA (porcs, lait, légumes)' },
    ],
    objections: [
      { objection: 'On n\'a pas Internet à la ferme', reponse: 'Pas grave, on vous envoie un export PDF par la poste. On a aussi une version simple mobile.' },
      { objection: 'On vend en circuit court / AMAP', reponse: 'Top, on peut justement vous aider à trouver les restaurants et épiceries fines de votre région.' },
      { objection: 'C\'est la coop qui décide', reponse: 'Comprend. Vous pouvez quand même utiliser l\'outil pour vos ventes directes (restos, AMAP, marchés).' },
    ],
    pitchHook: 'Bonjour {first_name}, je vois que {company} fait du {custom.production}. Vous vendez à la coop ou en direct ?',
    glossary: [
      { term: 'PAC', def: 'Politique Agricole Commune — subventions UE aux agriculteurs.' },
      { term: 'AOP / IGP', def: 'Appellation d\'Origine Protégée / Indication Géographique Protégée.' },
      { term: 'HVE', def: 'Haute Valeur Environnementale — certification agro-écologique.' },
      { term: 'IAA', def: 'Industrie Agro-Alimentaire — transformation des produits agricoles.' },
    ],
    painPoints: [
      'Volatilité des prix (céréales, lait, viande)',
      'Charge administrative (PAC, déclarations) > 15 % du temps',
      'Difficile à transmettre (1 départ sur 3 sans repreneur)',
    ],
    bestApproach: {
      channel: 'Téléphone matin tôt (7h-8h) ou soir (19h-20h)',
      timing: 'Novembre-février',
      why: 'Les exploitants sont aux champs entre 8h et 18h. Le matin tôt et le soir sont les seuls créneaux disponibles.',
    },
  },
};

// Overrides spécifiques pour catégories à fort volume de recherche
// (basé sur volumes Google : restaurant > 90 000/mois "restaurant XXX", etc.)
const CATEGORY_OVERRIDES = {
  'restaurant': {
    marketSize: '175 000 restaurants et cafés-restaurants en France (INSEE), dont 80 % sont des indépendants de moins de 10 couverts.',
    pitchHook: 'Bonjour {first_name}, j\'ai regardé {company} sur Google : 4,2/5 sur 180 avis, jolie carte. Vous tournez bien le service du soir ?',
    painPoints: [
      'Coût matière première en hausse (+18 % depuis 2022)',
      'Personnel difficile à recruter et fidéliser (turnover 75 %)',
      'Commissions plateformes (Uber Eats 30 %, TheFork 4-7 % par couvert)',
    ],
  },
  'hôtel': {
    marketSize: '18 500 hôtels en France représentant 1,3 million de chambres, dont 67 % d\'indépendants (Atout France 2024).',
    kpis: [
      { label: 'RevPAR moyen', value: '78 €', hint: 'France 2024, +14 % vs 2019' },
      { label: 'Taux occupation', value: '64 %', hint: 'moyenne annuelle France' },
      { label: 'Commission Booking', value: '15-25 %', hint: 'par nuitée' },
      { label: 'Coût recrutement', value: '4 500 €', hint: 'pour 1 réceptionniste' },
    ],
    pitchHook: 'Bonjour {first_name}, j\'imagine que la dépendance à Booking pèse sur {company}. Comment vous diversifiez vos canaux de réservation ?',
  },
  'avocat': {
    marketSize: '76 500 avocats en France inscrits dans 164 barreaux. 56 % exercent en individuel, 44 % en cabinet (CNB 2024).',
    persona: {
      titles: ['Avocat associé', 'Avocat collaborateur', 'Bâtonnier', 'Responsable développement'],
      decisionMaker: 'avocat fondateur ou associé senior — décision rapide en petite structure',
      painPoint: 'différenciation difficile, RPA encadre la prospection, baisse aide juridictionnelle',
    },
    pitchHook: 'Bonjour Maître {last_name}, en B2B juridique le cycle est long. Comment vous identifiez les entreprises qui ont besoin de vos services ?',
    glossary: [
      { term: 'RPA', def: 'Règlement Intérieur National de la profession d\'Avocat.' },
      { term: 'Toque', def: 'Numéro d\'identification d\'un avocat dans son barreau.' },
      { term: 'Provision', def: 'Avance sur honoraires versée par le client.' },
      { term: 'Convention d\'honoraires', def: 'Document obligatoire fixant le mode de calcul des honoraires.' },
    ],
  },
  'plombier': {
    marketSize: '36 000 entreprises de plomberie en France, dont 91 % sont des TPE de moins de 5 salariés (CAPEB 2024).',
    pitchHook: 'Bonjour {first_name}, vous bossez plus pour les particuliers ou les syndics ? Je peux vous aider à élargir d\'un côté ou l\'autre.',
    bestApproach: {
      channel: 'Téléphone très tôt (7h-8h) ou SMS le soir',
      timing: 'Décembre-février',
      why: 'Les plombiers sont en intervention toute la journée. Le matin avant le départ chantier est leur seul créneau "calme".',
    },
  },
  'agence immobilière': {
    pitchHook: 'Bonjour {first_name}, vu la baisse du marché en 2024, comment {company} sécurise ses mandats vendeurs ?',
    kpis: [
      { label: 'CA moyen agence', value: '450 k€', hint: '3-5 négociateurs' },
      { label: 'Commission moyenne', value: '4,8 %', hint: 'transaction' },
      { label: 'Mandats exclusifs', value: '23 %', hint: 'des mandats signés' },
      { label: 'Délai de vente', value: '92 jours', hint: 'France 2024' },
    ],
  },
  'expert-comptable': {
    marketSize: '21 500 experts-comptables en France et 12 500 cabinets, dont 65 % de moins de 10 collaborateurs (CSOEC 2024).',
    pitchHook: 'Bonjour {first_name}, l\'automatisation et l\'IA changent le métier. Comment {company} sécurise sa croissance en 2026 ?',
    painPoints: [
      'Automatisation des écritures menace les missions traditionnelles',
      'Recrutement collaborateurs comptables (15 000 postes ouverts)',
      'Concurrence des néo-cabinets full digital (Pennylane, Indy)',
    ],
  },
  'garage automobile': {
    pitchHook: 'Bonjour {first_name}, avec la montée de l\'électrique, comment {company} prépare sa transition outillage ?',
    bestApproach: {
      channel: 'Téléphone 11h-12h ou email 7h-8h',
      timing: 'Mai-juin ou septembre-octobre',
      why: 'Le chef d\'atelier est sur le pont en journée. Sa pause déjeuner et le tout début de journée sont les seuls moments de bureau.',
    },
  },
  'pharmacie': {
    marketSize: '21 250 officines en France (Ordre des Pharmaciens 2024), dont 95 % indépendantes. CA moyen 2,1 M€.',
    pitchHook: 'Bonjour {first_name}, comment {company} fait face à la baisse de marge sur les médicaments remboursés ?',
    kpis: [
      { label: 'CA moyen officine', value: '2,1 M€', hint: 'France 2024' },
      { label: 'Marge nette', value: '8-12 %', hint: 'après remises génériques' },
      { label: 'Part parapharmacie', value: '18 %', hint: 'du CA officine' },
      { label: 'Visites quotidiennes', value: '210', hint: 'patients/jour moyenne' },
    ],
  },
  'architecte': {
    marketSize: '31 000 architectes inscrits à l\'Ordre en France, dont 86 % exercent en libéral (CNOA 2024).',
    pitchHook: 'Bonjour {first_name}, vu la conjoncture BTP, comment {company} sécurise son carnet de commandes en 2026 ?',
    persona: {
      titles: ['Architecte associé', 'Architecte HMONP', 'Chef de projet', 'Maître d\'œuvre'],
      decisionMaker: 'architecte fondateur ou associé senior',
      painPoint: 'baisse permis de construire, complexité réglementaire, concurrence MOE non-architectes',
    },
  },
  'agence web': {
    pitchHook: 'Bonjour {first_name}, je vois que {company} fait du dev sur-mesure. Comment vous trouvez vos nouveaux clients aujourd\'hui ?',
    kpis: [
      { label: 'TJM moyen FR', value: '550 €', hint: 'développeur senior agence' },
      { label: 'Marge brute', value: '35-45 %', hint: 'sur projet régie' },
      { label: 'Cycle vente', value: '6-10 semaines', hint: 'projet 30-100 k€' },
      { label: 'Taux conversion devis', value: '22 %', hint: 'agences digitales' },
    ],
  },
  'salon de coiffure': {
    marketSize: '85 000 salons de coiffure en France (Union Nationale des Entreprises de Coiffure).',
    pitchHook: 'Bonjour {first_name}, vous fournissez quels produits aujourd\'hui à {company} ? L\'Oréal Pro, Schwarzkopf ou en direct fabricant ?',
  },
  'institut de beauté': {
    marketSize: '49 000 instituts de beauté en France (CNAIB 2024).',
    pitchHook: 'Bonjour {first_name}, comment vous trouvez les marques pro à proposer à votre clientèle de {company} ?',
  },
  'vétérinaire': {
    marketSize: '20 500 vétérinaires en France, dont 11 800 en exercice canin (Ordre des Vétérinaires 2024).',
    pitchHook: 'Bonjour Docteur {last_name}, comment {company} équilibre soins canins et fidélisation de clientèle ?',
  },
  'centre dentaire': {
    pitchHook: 'Bonjour {first_name}, comment {company} attire les nouveaux patients après la réforme du 100 % santé dentaire ?',
  },
  'salle de sport': {
    pitchHook: 'Bonjour {first_name}, post-COVID le marché du fitness a explosé. Comment {company} se différencie face aux low-cost (Basic Fit, Fitness Park) ?',
    seasonality: {
      peak: 'janvier (résolutions) + septembre (rentrée)',
      low: 'juillet-août + décembre',
      comment: 'La fenêtre janvier-février représente 30 % des inscriptions annuelles. Démarchez en novembre.',
    },
  },
  'imprimerie': {
    pitchHook: 'Bonjour {first_name}, en imprimerie numérique vs offset, comment {company} positionne ses offres pro ?',
    painPoints: [
      'Baisse structurelle du papier (-3 % par an)',
      'Concurrence des imprimeurs en ligne (Vistaprint, Onlineprinters)',
      'Coût matières premières (papier, encres) +25 % depuis 2020',
    ],
  },
  'banque': {
    pitchHook: 'Bonjour {first_name}, en B2B bancaire le timing décisionnaire compte. Comment {company} identifie les entreprises qui changent de banque ?',
  },
  'école privée': {
    pitchHook: 'Bonjour {first_name}, comment {company} prospecte les nouveaux élèves pour la rentrée 2026 ?',
  },
  'entreprise informatique': {
    pitchHook: 'Bonjour {first_name}, je vois que {company} fait de l\'infogérance. Comment vous trouvez vos PME clientes aujourd\'hui ?',
  },
  'exploitation agricole': {
    pitchHook: 'Bonjour {first_name}, {company} produit du {custom.production}. Vous vendez à la coop ou en circuit court ?',
  },

  // ───── Hôtellerie & Restauration (+5) ─────────────────
  'brasserie': {
    marketSize: '42 000 brasseries en France (cafés-brasseries servant des repas légers + bière à pression), modèle particulièrement résilient post-COVID.',
    pitchHook: 'Bonjour {first_name}, en brasserie le volume midi pèse souvent 60 % du CA. Comment {company} gère le flux pause-déj des bureaux du quartier ?',
    painPoints: [
      'Forte concurrence (1 brasserie tous les 200 m en zone urbaine)',
      'Pression sur la marge bière (Heineken, Kronenbourg)',
      'Saisonnalité terrasse → -25 % de CA en hiver',
    ],
  },
  'traiteur': {
    marketSize: '11 000 entreprises de traiteur en France (CHR + événementiel + livraison), CA moyen 480 k€.',
    pitchHook: 'Bonjour {first_name}, en traiteur événementiel, septembre = pic mariage et CE. Vous démarchez quand pour les entreprises clientes ?',
    seasonality: {
      peak: 'mai-septembre (mariages) + novembre-décembre (CE fin d\'année)',
      low: 'janvier-mars',
      comment: 'Réservations à 6-9 mois d\'avance : prospectez en janvier-mars pour la saison estivale.',
    },
  },
  'boulangerie pâtisserie': {
    marketSize: '32 000 boulangeries-pâtisseries artisanales en France (Confédération de la Boulangerie 2024).',
    pitchHook: 'Bonjour {first_name}, en boulangerie le coût matière (farine, beurre) a explosé. Comment {company} maintient ses marges ?',
    painPoints: [
      'Coûts énergie (+40 % depuis 2022) → 8 000 fermetures en 2 ans',
      'Concurrence des chaînes (Marie Blachère, Paul, Brioche Dorée)',
      'Difficulté à recruter des boulangers (15 000 postes ouverts)',
    ],
    bestApproach: {
      channel: 'Téléphone ou visite après-midi (14h-16h)',
      timing: 'Tout au long de l\'année',
      why: 'Les boulangers sont en production de nuit/matin. L\'après-midi est leur seul créneau de "bureau".',
    },
  },
  'pizzeria': {
    marketSize: '21 000 pizzerias en France, marché ultra-concurrentiel avec montée du livraison (Uber Eats, Just Eat).',
    pitchHook: 'Bonjour {first_name}, en pizzeria les commissions Uber/Just Eat pèsent 25-30 %. Comment {company} équilibre sur place vs livraison ?',
  },
  'café': {
    marketSize: '32 000 cafés en France (cafés purs sans restauration), modèle économique tendu — 30 % de fermetures depuis 2010.',
    pitchHook: 'Bonjour {first_name}, en café indépendant la diversification est clé. {company} a déjà ajouté restauration, événementiel ou speciality coffee ?',
  },

  // ───── Commerce & Distribution (+6) ───────────────────
  'opticien': {
    marketSize: '13 500 magasins d\'optique en France, dont 60 % indépendants. CA moyen 850 k€, marge brute 65-75 %.',
    pitchHook: 'Bonjour {first_name}, en optique le 100 % santé a changé les marges. Comment {company} compense sur l\'optique premium ?',
    kpis: [
      { label: 'CA moyen magasin', value: '850 k€', hint: 'opticien indépendant' },
      { label: 'Panier moyen', value: '420 €', hint: 'lunettes + verres' },
      { label: 'Part 100 % santé', value: '45 %', hint: 'des ventes 2024' },
      { label: 'Marge brute', value: '65-75 %', hint: 'avant charges' },
    ],
  },
  'fleuriste': {
    marketSize: '14 000 fleuristes indépendants en France, marché de 1,3 Md€ tiré par les événements et l\'abonnement.',
    pitchHook: 'Bonjour {first_name}, en fleuriste les pics (Saint-Valentin, fête des mères) font 40 % du CA. Comment {company} démarche les CE et entreprises ?',
  },
  'bijouterie': {
    pitchHook: 'Bonjour {first_name}, en bijouterie le marché des fiançailles tient la baraque. Comment {company} attire la cible jeune (alliances, occasions) ?',
  },
  'librairie': {
    marketSize: '3 200 librairies indépendantes en France (Syndicat de la Librairie Française) + 5 000 points de vente livre.',
    pitchHook: 'Bonjour {first_name}, en librairie indépendante l\'événementiel (signatures, rencontres) fait la différence. Comment vous trouvez les auteurs ?',
  },
  'supermarché': {
    pitchHook: 'Bonjour {first_name}, je vois que {company} est sur le bassin {custom.zone}. Vous bossez avec des producteurs locaux ou tout via la centrale ?',
  },
  'jardinerie': {
    pitchHook: 'Bonjour {first_name}, en jardinerie le pic mars-juin fait 60 % du CA. Comment {company} maintient l\'animation hors saison ?',
  },

  // ───── Automobile & Transport (+4) ────────────────────
  'concessionnaire automobile': {
    marketSize: '4 500 concessions automobiles en France (CNPA 2024), CA moyen 18 M€, en pleine transition vers l\'électrique.',
    pitchHook: 'Bonjour {first_name}, en concession la VN baisse mais le VO et l\'après-vente compensent. Comment {company} équilibre les 3 piliers ?',
  },
  'contrôle technique': {
    marketSize: '6 800 centres de contrôle technique en France (UTAC OTC), réglementé et stable.',
    pitchHook: 'Bonjour {first_name}, en CT le marché est saturé. Comment {company} se différencie sur la fidélisation (rappels SMS, etc.) ?',
  },
  'auto-école': {
    marketSize: '11 700 auto-écoles en France, marché en mutation (concurrence en ligne : Ornikar, En Voiture Simone).',
    pitchHook: 'Bonjour {first_name}, en auto-école la pression Ornikar / En Voiture Simone est réelle. Comment {company} attire les jeunes 18-25 ?',
  },
  'carrosserie': {
    pitchHook: 'Bonjour {first_name}, en carrosserie les contrats assureurs représentent souvent 70 % du CA. Comment {company} négocie les bordereaux ?',
  },

  // ───── Santé & Bien-être (+4) ─────────────────────────
  'kinésithérapeute': {
    marketSize: '93 000 kinésithérapeutes en France, 75 % en libéral (Ordre des MK 2024).',
    pitchHook: 'Bonjour {first_name}, en kiné libéral les délais RDV explosent. Comment {company} gère la prise de rendez-vous et la diversification (sport, rééducation) ?',
    persona: {
      titles: ['Kinésithérapeute libéral', 'Associé cabinet', 'Coordinateur'],
      decisionMaker: 'le praticien lui-même en libéral',
      painPoint: 'agenda saturé, difficulté à dégager du temps admin',
    },
  },
  'ostéopathe': {
    marketSize: '36 000 ostéopathes en France (Registre des Ostéopathes 2024), profession en très forte croissance (+8 % par an).',
    pitchHook: 'Bonjour {first_name}, en ostéo le marché est saturé en ville. Comment {company} se différencie (sport, pédiatrie, animaux) ?',
  },
  'ophtalmologue': {
    pitchHook: 'Bonjour Docteur {last_name}, les délais RDV ophtalmo sont de 50+ jours en moyenne. Comment {company} gère les flux et la délégation orthoptiste ?',
  },
  'maison de retraite': {
    marketSize: '7 500 EHPAD en France (DREES 2024), secteur en tension avec rapport Castex 2026.',
    pitchHook: 'Bonjour {first_name}, en EHPAD le taux d\'occupation et le recrutement soignant sont vitaux. Comment {company} se positionne sur ces 2 fronts ?',
  },

  // ───── BTP & Construction (+6) ────────────────────────
  'électricien': {
    marketSize: '78 000 entreprises d\'électricité du bâtiment en France, dont 92 % de TPE (CAPEB).',
    pitchHook: 'Bonjour {first_name}, avec MaPrimeRénov\' et la transition IRVE (bornes), {company} a des gros chantiers en vue ?',
    painPoints: [
      'Pénurie main d\'œuvre qualifiée (35 000 postes ouverts)',
      'Hausse coûts cuivre et composants',
      'Concurrence des chaînes (Sogemat, Rexel direct chantier)',
    ],
  },
  'menuisier': {
    marketSize: '45 000 entreprises de menuiserie en France (charpente + menuiserie intérieure).',
    pitchHook: 'Bonjour {first_name}, en menuiserie pose vs fabrication, comment {company} équilibre les 2 activités ?',
  },
  'peintre en bâtiment': {
    pitchHook: 'Bonjour {first_name}, en peinture bâtiment le pic est mars-octobre. Comment {company} optimise les chantiers hivernaux (intérieur) ?',
  },
  'paysagiste': {
    pitchHook: 'Bonjour {first_name}, en paysagiste l\'entretien récurrent (B2B copros) est plus rentable que le création (B2C). Comment {company} équilibre ?',
    seasonality: {
      peak: 'mars-octobre (création + entretien)',
      low: 'novembre-février',
      comment: 'Hiver = chiffrage et signature de contrats annuels copros. Prospectez en décembre.',
    },
  },
  'couvreur': {
    pitchHook: 'Bonjour {first_name}, en couverture les tempêtes ouvrent un pic immédiat de demandes. Comment {company} prépare ses équipes intervention ?',
  },
  'serrurier': {
    pitchHook: 'Bonjour {first_name}, en serrurerie B2B (copros, syndics) le contrat de maintenance est l\'or. Comment {company} démarche les syndics ?',
  },

  // ───── Services aux entreprises (+5) ──────────────────
  'notaire': {
    marketSize: '17 000 notaires en France répartis dans 6 800 offices (CSN 2024).',
    pitchHook: 'Bonjour Maître {last_name}, en notariat la digitalisation des actes change le métier. Comment {company} attire les nouveaux clients (jeunes acquéreurs) ?',
    persona: {
      titles: ['Notaire associé', 'Notaire individuel', 'Clerc principal'],
      decisionMaker: 'notaire titulaire ou associé senior',
      painPoint: 'transmission/installation difficile, digitalisation des actes, baisse volume transactions',
    },
  },
  'cabinet de conseil': {
    pitchHook: 'Bonjour {first_name}, en conseil le sourcing client = sang du business. Comment {company} équilibre référencements grands comptes et new business ?',
  },
  'agence de communication': {
    pitchHook: 'Bonjour {first_name}, en agence com le cycle commercial est long. Comment {company} génère des leads qualifiés au-delà du bouche-à-oreille ?',
  },
  'agence d\'intérim': {
    pitchHook: 'Bonjour {first_name}, en intérim la concurrence Adecco/Manpower est rude. Comment {company} se différencie sur les profils pénuriques (BTP, industrie) ?',
  },
  'formation professionnelle': {
    pitchHook: 'Bonjour {first_name}, post-réforme CPF 2024 le marché s\'est durci. Comment {company} compense la baisse des inscriptions CPF ?',
  },

  // ───── Immobilier (+2) ────────────────────────────────
  'promoteur immobilier': {
    marketSize: '12 000 promoteurs immobiliers en France (FPI 2024), marché en correction -32 % depuis 2022.',
    pitchHook: 'Bonjour {first_name}, en promotion la crise 2023-2024 a redistribué les cartes. Comment {company} sécurise son foncier pour 2026-2027 ?',
  },
  'constructeur de maisons': {
    pitchHook: 'Bonjour {first_name}, en CMI le marché est en chute libre (-40 % de mises en chantier 2024). Comment {company} adapte son catalogue ?',
  },

  // ───── Industrie & Artisanat (+2) ─────────────────────
  'photographe': {
    pitchHook: 'Bonjour {first_name}, en photo pro (mariage, corporate, produit), comment {company} équilibre le volume saisonnier et les missions corporate plus rentables ?',
  },
  'ébéniste': {
    pitchHook: 'Bonjour {first_name}, en ébénisterie sur-mesure le bouche-à-oreille fonctionne. Mais pour les architectes d\'intérieur prescripteurs, comment {company} les démarche ?',
  },

  // ───── Finance & Assurance (+1) ───────────────────────
  'assurance': {
    pitchHook: 'Bonjour {first_name}, en assurance B2B les renouvellements pro = moments clés. Comment {company} identifie les entreprises à 6 mois de l\'échéance ?',
  },

  // ───── Éducation & Culture (+3) ───────────────────────
  'crèche': {
    marketSize: '14 000 crèches en France (CAF 2024) — micro-crèches privées en forte croissance (+7 % par an).',
    pitchHook: 'Bonjour {first_name}, en micro-crèche la course aux familles + au personnel sont les 2 défis. Comment {company} se positionne ?',
  },
  'école de musique': {
    pitchHook: 'Bonjour {first_name}, en école de musique la fidélisation des élèves (cours hebdo) est tout. Comment {company} démarche les écoles publiques pour les interventions ?',
  },
  'école de langues': {
    pitchHook: 'Bonjour {first_name}, en école de langues B2B le marché entreprise vaut 10x le B2C. Comment {company} démarche les DRH des PME ?',
  },

  // ───── Technologie & Digital (+2) ─────────────────────
  'agence digitale': {
    pitchHook: 'Bonjour {first_name}, en agence digital le coût acquisition par référencement payant flambe. Comment {company} génère des leads outbound ?',
  },
  'développeur web': {
    pitchHook: 'Bonjour {first_name}, en freelance dev les missions longues TJM 600+ sont plus rares en 2024. Comment {company} sécurise son carnet ?',
  },

  // ───── Agriculture & Alimentation (+3) ────────────────
  'boucherie': {
    marketSize: '17 000 boucheries artisanales en France, marché en érosion (-2 % par an) face aux GMS.',
    pitchHook: 'Bonjour {first_name}, en boucherie le circuit court éleveur (Label Rouge, bio) est l\'arme contre les GMS. Comment {company} sourcing ?',
  },
  'fromagerie': {
    pitchHook: 'Bonjour {first_name}, en fromagerie spécialisée AOP / AOC = différenciation reine. Comment {company} démarche les restaurants gastronomiques ?',
  },
  'chocolaterie': {
    pitchHook: 'Bonjour {first_name}, en chocolaterie artisanale Noël + Pâques font 60 % du CA. Comment {company} étoffe les cadeaux corporate hors saison ?',
  },

  // ───── Vague v3 : longue traîne stratégique (+37) ────

  // Hôtellerie & Restauration (+3)
  'restauration rapide': {
    marketSize: '28 000 restaurants de restauration rapide en France (hors fast-food multinational), marché en croissance +6 % par an.',
    pitchHook: 'Bonjour {first_name}, en restauration rapide la livraison (Uber Eats, Deliveroo) coûte 25-30 %. Comment {company} équilibre VAE et sur place ?',
  },
  'discothèque': {
    marketSize: '1 300 discothèques en France (baisse continue : -50 % en 15 ans), recentrage sur l\'événementiel privé.',
    pitchHook: 'Bonjour {first_name}, le marché discothèque baisse mais l\'événementiel privé (CE, mariages) explose. Comment {company} se positionne ?',
  },
  'camping': {
    marketSize: '8 000 campings en France (1ère destination camping d\'Europe), 11 millions d\'emplacements vendus/an.',
    pitchHook: 'Bonjour {first_name}, en camping le mobile-home pèse 60 % du CA. Comment {company} attire les fournisseurs et services aux campeurs ?',
    seasonality: {
      peak: 'juin-août (saison touristique)',
      low: 'novembre-mars (fermeture pour beaucoup)',
      comment: 'Prospectez novembre-mars pour la saison N+1. Décisions d\'achat équipement = janvier-février.',
    },
  },

  // Commerce & Distribution (+5)
  'magasin de vêtements': {
    pitchHook: 'Bonjour {first_name}, en boutique de prêt-à-porter la concurrence Shein/Zara est rude. Comment {company} se positionne sur la qualité ou la niche ?',
  },
  'magasin de bricolage': {
    pitchHook: 'Bonjour {first_name}, en bricolage le pro représente 40 % du CA. Comment {company} démarche les artisans BTP locaux ?',
  },
  'magasin de sport': {
    pitchHook: 'Bonjour {first_name}, en sport indé la pression Decathlon/Intersport est constante. Comment {company} se différencie sur la spécialisation ?',
  },
  'caviste': {
    marketSize: '5 800 cavistes indépendants en France (Syndicat des Cavistes Pros), marché de 1,4 Md€ tiré par le vin nature.',
    pitchHook: 'Bonjour {first_name}, chez caviste le vin nature et la dégustation événementielle font la diff. Comment {company} attire les CHR pros ?',
  },
  'magasin bio': {
    pitchHook: 'Bonjour {first_name}, post-2022 le marché bio a baissé (-5 % en 2023). Comment {company} regagne du terrain face aux GMS bio (Carrefour, Biocoop) ?',
  },

  // Automobile & Transport (+3)
  'location voiture': {
    marketSize: '4 200 agences de location automobile en France, marché dominé par Europcar, Hertz, Avis.',
    pitchHook: 'Bonjour {first_name}, en location auto le B2B (flotte entreprise) est plus rentable que le B2C. Comment {company} démarche les PME ?',
  },
  'transport routier': {
    marketSize: '32 000 entreprises de transport routier de marchandises en France, en tension sur le recrutement chauffeurs.',
    pitchHook: 'Bonjour {first_name}, en TRM la pénurie de chauffeurs + hausse gazole pèsent fort. Comment {company} sécurise les contrats long terme ?',
  },
  'déménagement': {
    pitchHook: 'Bonjour {first_name}, en déménagement le pic juin-août fait 50 % du CA. Comment {company} maintient l\'activité B2B (entreprises) hors saison ?',
  },

  // Santé & Bien-être (+4)
  'clinique': {
    marketSize: '5 200 cliniques privées en France (FHP 2024), 65 % de la chirurgie ambulatoire française.',
    pitchHook: 'Bonjour {first_name}, en clinique privée la course aux praticiens libéraux est vitale. Comment {company} attire les nouveaux médecins ?',
    persona: {
      titles: ['Directeur d\'établissement', 'Directeur médical', 'DAF', 'Responsable RH'],
      decisionMaker: 'directeur d\'établissement + comité médical',
      painPoint: 'recrutement médecins, conventions CPAM, modernisation équipements',
    },
  },
  'laboratoire d\'analyses': {
    marketSize: '1 200 laboratoires d\'analyses médicales en France (regroupés en grands groupes : Cerba, Synlab, Eurofins, Inovie).',
    pitchHook: 'Bonjour {first_name}, en LBM la concentration s\'accélère. Comment {company} se positionne face aux grands groupes (Cerba, Synlab) ?',
  },
  'spa': {
    pitchHook: 'Bonjour {first_name}, en spa l\'abonnement et le bon cadeau B2B (entreprises CE) sont les leviers de fidélisation. Comment {company} les active ?',
  },
  'centre de yoga': {
    pitchHook: 'Bonjour {first_name}, en yoga la fidélisation par abonnement + retraites = clé. Comment {company} démarche les entreprises pour le yoga corporate ?',
  },

  // BTP & Construction (+6)
  'maçon': {
    marketSize: '95 000 entreprises de maçonnerie en France, profession en tension avec 25 000 postes ouverts.',
    pitchHook: 'Bonjour {first_name}, en maçonnerie le carnet est plein mais les chantiers s\'allongent. Comment {company} priorise les nouveaux clients ?',
  },
  'chauffagiste': {
    pitchHook: 'Bonjour {first_name}, avec MaPrimeRénov\' et la transition PAC, la demande explose. Comment {company} gère la formation de ses équipes ?',
  },
  'entreprise de construction': {
    pitchHook: 'Bonjour {first_name}, en entreprise générale BTP le carnet long est essentiel. Comment {company} se positionne sur les AO publics 2026 ?',
  },
  'entreprise de rénovation': {
    pitchHook: 'Bonjour {first_name}, en rénovation MaPrimeRénov\' a boosté la demande mais complique les devis. Comment {company} gère le sourcing artisans ?',
  },
  'entreprise de nettoyage': {
    marketSize: '36 000 entreprises de nettoyage industriel en France, secteur en croissance porté par tertiaire et collectivités.',
    pitchHook: 'Bonjour {first_name}, en nettoyage B2B le contrat tertiaire long terme est l\'or. Comment {company} démarche les directions des services généraux ?',
  },
  'diagnostiqueur immobilier': {
    pitchHook: 'Bonjour {first_name}, en diagnostic immo le DPE et la mise aux normes 2025-2034 = volume. Comment {company} se positionne face à la concurrence ?',
  },

  // Services aux entreprises (+4)
  'société de nettoyage': {
    pitchHook: 'Bonjour {first_name}, en nettoyage tertiaire B2B le tendering est essentiel. Comment {company} génère les invitations à concourir ?',
  },
  'société de sécurité': {
    marketSize: '12 000 entreprises de sécurité privée en France (CNAPS 2024), 170 000 agents.',
    pitchHook: 'Bonjour {first_name}, en sécurité privée la tension recrutement et la qualité agents font la diff. Comment {company} se différencie sur les AO ?',
  },
  'cabinet de recrutement': {
    pitchHook: 'Bonjour {first_name}, en cabinet recrutement la pénurie de talents fait baisser le taux de placement. Comment {company} sécurise ses mandats ?',
  },
  'courtier en crédit': {
    pitchHook: 'Bonjour {first_name}, en courtage crédit la baisse du marché immo 2023-24 a divisé les transactions. Comment {company} compense sur le rachat / pro ?',
  },

  // Immobilier (+3)
  'marchand de biens': {
    pitchHook: 'Bonjour {first_name}, en marchand de biens le sourcing off-market est tout. Comment {company} identifie les biens avant qu\'ils n\'arrivent en agence ?',
  },
  'expert immobilier': {
    pitchHook: 'Bonjour {first_name}, en expertise immo les missions banque + assurance sont les plus stables. Comment {company} se référence chez ces clients ?',
  },
  'géomètre-expert': {
    pitchHook: 'Bonjour {first_name}, en géomètre la transition BIM et les missions PLU/AO publics sont en hausse. Comment {company} se positionne ?',
  },

  // Industrie & Artisanat (+2)
  'pressing': {
    pitchHook: 'Bonjour {first_name}, en pressing la baisse du tertiaire (télétravail) a réduit le volume. Comment {company} se positionne sur le linge de maison ?',
  },
  'blanchisserie': {
    pitchHook: 'Bonjour {first_name}, en blanchisserie B2B (hôtels, restos, hôpitaux) le contrat long est vital. Comment {company} démarche les CHR locaux ?',
  },

  // Finance & Assurance (+2)
  'cabinet de gestion de patrimoine': {
    pitchHook: 'Bonjour {first_name}, en CGP la prospection famille fortunée passe par le réseau. Comment {company} digitalise sans dénaturer l\'approche ?',
  },
  'courtier': {
    pitchHook: 'Bonjour {first_name}, en courtage la baisse 2024 a redistribué les cartes. Comment {company} sécurise ses portefeuilles 2026 ?',
  },

  // Éducation & Culture (+4)
  'centre de formation': {
    pitchHook: 'Bonjour {first_name}, en CFA la réforme apprentissage a tout changé. Comment {company} démarche les OPCO et les entreprises directement ?',
  },
  'cours particuliers': {
    pitchHook: 'Bonjour {first_name}, en cours particuliers Acadomia/Complétude dominent. Comment {company} se positionne sur la spécialisation (prépa, maths) ?',
  },
  'école de danse': {
    pitchHook: 'Bonjour {first_name}, en école de danse la fidélisation enfants + adultes corporate (CE) est complémentaire. Comment {company} attire les CE ?',
  },
  'cinéma': {
    pitchHook: 'Bonjour {first_name}, en cinéma indé la programmation art et essai vs blockbusters = positionnement clé. Comment {company} se différencie du multiplex ?',
  },

  // Technologie & Digital (+2)
  'réparation informatique': {
    pitchHook: 'Bonjour {first_name}, en réparation info B2C vs infogérance B2B = 2 mondes. Comment {company} équilibre les deux ?',
  },
  'téléphonie': {
    pitchHook: 'Bonjour {first_name}, en téléphonie pro Orange/Bouygues/SFR dominent. Comment {company} démarche les PME pour des forfaits sur-mesure ?',
  },

  // Agriculture & Alimentation (+2)
  'coopérative agricole': {
    pitchHook: 'Bonjour {first_name}, en coop agricole le marché et l\'export sont en mutation. Comment {company} démarche les industriels acheteurs ?',
  },
  'pépinière': {
    pitchHook: 'Bonjour {first_name}, en pépinière B2B (paysagistes, collectivités) le contrat de fourniture annuel = rente. Comment {company} les sécurise ?',
  },
};

/**
 * Inverse l'index B2B_GROUPS pour retrouver le groupe d'un slug.
 * On a déjà l'info dans category.group, donc on l'utilise.
 */
export function getCategoryData(category) {
  if (!category) return null;
  const group = category.group || 'Services aux entreprises';
  const defaults = GROUP_DEFAULTS[group] || GROUP_DEFAULTS['Services aux entreprises'];
  const overrides = CATEGORY_OVERRIDES[category.label] || CATEGORY_OVERRIDES[category.slug] || {};

  // Merge des champs (overrides ont la priorité)
  const merged = { ...defaults, ...overrides };

  // Persona / bestApproach sont des objets, merge en profondeur
  if (overrides.persona) merged.persona = { ...defaults.persona, ...overrides.persona };
  if (overrides.bestApproach) merged.bestApproach = { ...defaults.bestApproach, ...overrides.bestApproach };
  if (overrides.seasonality) merged.seasonality = { ...defaults.seasonality, ...overrides.seasonality };

  return merged;
}

export { GROUP_DEFAULTS, CATEGORY_OVERRIDES };
