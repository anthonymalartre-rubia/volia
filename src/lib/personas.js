// Personas marketing : 6 landings ciblées par profil utilisateur.
// Format : { slug, title, h1, intro, badge, painPoints, useCases, idealPlan,
//            testimonialSector, ctaLabel, keyMetric }
//
// L'objectif : capter les recherches "outil de prospection pour [persona]"
// et convertir avec un message taillé sur les besoins du profil.

const PERSONAS = {
  'sdr': {
    slug: 'sdr',
    title: 'Outil de prospection pour SDR & commerciaux B2B — Volia',
    metaDescription: 'Toi, SDR, tu passes 60% de ton temps à chercher des contacts au lieu de prospecter. Volia te file 50 à 500 prospects qualifiés par jour, à exporter direct dans ton CRM. 19-99€/mois. Tu te poses encore la question ?',
    badge: 'Pour les SDR & commerciaux B2B',
    h1: 'L\'outil de prospection que tes SDR vont adorer',
    intro: 'Toi, SDR, tu fais 50 cold emails par jour à la main. Tu jongles entre Apollo, LinkedIn Sales Nav, et un CRM. Tu passes 60% de ton temps à chercher des contacts au lieu de prospecter. Volia te file 50 à 500 prospects qualifiés par jour, à exporter direct dans ton CRM. À partir de 19€/mois.',
    keyMetric: { value: '3×', label: 'plus de RDV qualifiés', sub: 'vs sourcing manuel' },
    painPoints: [
      'Apollo plafonne à 40% de couverture en France — tu reçois des emails périmés et tes meetings tombent',
      'LinkedIn Sales Navigator te coûte 99€/mois et te force au sourcing manuel à la souris',
      'Tu passes 60% de ton temps à chercher au lieu de pitcher. C\'est pas pour ça que tu signes un CDI',
    ],
    useCases: [
      { title: 'Sourcing par ICP', desc: 'Filtre par secteur (150 cats) + zone géo (101 dépts FR + 6 provinces BE). 1 clic. Pas 8.' },
      { title: 'Export CRM-ready', desc: 'CSV format HubSpot / Salesforce / Zoho / Pipedrive. Aucune transformation. Branche, envoie, c\'est fini.' },
      { title: 'Cadence multicanal intégrée', desc: 'Email Resend + SMS Twilio depuis Volia. Pas besoin d\'un Lemlist en plus à 99€/mois.' },
      { title: 'Compliance RGPD native', desc: 'Filtre auto des emails personnels, opt-out 1 clic. Ta DPO va arrêter de te courir après.' },
    ],
    idealPlan: { name: 'Pro', price: '49', why: '5 000 prospects/mois + 2 000 enrichissements. Largement pour 2-3 SDR à temps plein.' },
    testimonialSector: 'Technologie & Digital',
    ctaLabel: 'Je démarre comme SDR',
  },

  'fondateurs': {
    slug: 'fondateurs',
    title: 'Outil de prospection pour fondateurs & solopreneurs — Volia',
    metaDescription: 'Toi, fondateur sans SDR, tu galères entre Apollo à 99$/mois et le sourcing à la main. Volia : 1 000 prospects qualifiés à 19€/mois, sans engagement, lancement en 5 min. Tu te poses encore la question ?',
    badge: 'Pour les fondateurs early-stage',
    h1: 'La prospection pour les fondateurs qui n\'ont pas (encore) de SDR',
    intro: 'Toi, fondateur, tu dois prospecter MAIS aussi développer le produit, gérer la finance, recruter. Avant d\'embaucher un SDR à 50K€/an, prouve ton PMF avec de la vraie prospection. Volia te donne 1 000 prospects qualifiés pour 19€/mois. Tu exportes ou tu contactes direct depuis l\'app.',
    keyMetric: { value: '5 min', label: 'pour ta 1ère campagne', sub: 'sans onboarding interminable' },
    painPoints: [
      'Tu dois prospecter ET coder ET gérer le cash ET recruter. Le sourcing manuel n\'a pas sa place',
      'Apollo à 99$/mois pour toi tout seul, ça pique. Tu te demandes si tu vas pas faire ça à la main',
      'Tu sais pas par où commencer ni quels secteurs cibler. Tu testes 3 ICPs, t\'as 0 réponse en 2 semaines',
    ],
    useCases: [
      { title: 'Test rapide d\'ICP', desc: 'Lance 5 segments en parallèle (par secteur, par dept). Identifie ton PMF en 2 semaines, pas en 6 mois.' },
      { title: 'Recherche en langage naturel', desc: 'Tape "restaurants gastronomiques à Lyon avec > 4,5/5". Claude convertit en filtres. Pas de tuto à lire.' },
      { title: 'Campagne cold email intégrée', desc: 'Pas besoin de Lemlist en plus. Envoi via le module Campagnes, templating, footer RGPD auto. Une facture en moins.' },
      { title: 'API publique pour tout automatiser', desc: 'Branche via Zapier ou Make sur HubSpot, Notion, Airtable. Tu code rien, ça marche.' },
    ],
    idealPlan: { name: 'Solo', price: '19', why: '1 000 prospects + 400 enrichissements/mois. Parfait pour valider ton marché avant de scaler.' },
    testimonialSector: 'Technologie & Digital',
    ctaLabel: 'Je lance ma boîte',
  },

  'agences-web': {
    slug: 'agences-web',
    title: 'Outil de prospection pour agences web & digitales — Volia',
    metaDescription: 'Toi, agence web, ton bouche-à-oreille s\'essouffle. Volia te file des listes ciblées d\'entreprises locales avec email + téléphone, prêtes à entendre ton pitch refonte ou SEO. 19€/mois, export CSV.',
    badge: 'Pour les agences web & digitales',
    h1: 'Ta prochaine cliente est ici — trouve-la avant tes concurrents',
    intro: 'Toi, agence web, tu vis du bouche-à-oreille. Le jour où ça s\'essouffle, t\'as un trou de 3 mois dans le pipe. Les agences qui durent prospectent EN CONTINU. Volia te file des listes ciblées d\'entreprises locales avec leur email et téléphone, prêtes pour ta proposition de refonte ou de SEO.',
    keyMetric: { value: '85%', label: 'taux de couverture email', sub: 'sur les TPE/PME avec site web' },
    painPoints: [
      'Tu cibles les PME du tertiaire mais Apollo trouve pas leurs emails — il est fait pour les SaaS US',
      'Le bouche-à-oreille a ses limites. Le jour où tu perds 2 clients d\'un coup, ton pipe est à sec',
      'LinkedIn Sales Navigator à 99€/SDR, pour une agence de 3 freelances c\'est intenable',
    ],
    useCases: [
      { title: 'Sourcing par secteur + ville', desc: 'Avocats à Lyon, restaurants à Marseille, kinés à Bordeaux. Ta cible existe, on te la livre.' },
      { title: 'Détection sites obsolètes', desc: 'On identifie les boîtes avec un site mais sans HTTPS, sans mobile. Opportunités refonte sur un plateau.' },
      { title: 'Pitch contextualisé qui marche', desc: 'Templating {{first_name}} + {{company}} + {{custom.secteur}}. Email perso, pas un cold générique qui finit en spam.' },
      { title: 'Multi-canal pitch + relance', desc: 'Email J+0, SMS J+3, email J+7. Séquence dans Volia. Pas de Lemlist à payer en plus.' },
    ],
    idealPlan: { name: 'Pro', price: '49', why: '5 000 prospects/mois. Tu peux taper 3-4 secteurs/villes en parallèle sans réfléchir au quota.' },
    testimonialSector: 'Technologie & Digital',
    ctaLabel: 'Je trouve mes clients agence',
  },

  'cabinets-rh': {
    slug: 'cabinets-rh',
    title: 'Outil de prospection pour cabinets de recrutement & RH — Volia',
    metaDescription: 'Toi, cabinet RH, tu veux signer les mandats avant tes concurrents. Volia te livre les DRH et fondateurs des boîtes qui recrutent dans ton secteur. 150 cats, 101 dépts. À partir de 19€/mois.',
    badge: 'Pour les cabinets de recrutement',
    h1: 'Identifie les boîtes qui recrutent — avant tes concurrents',
    instructionFn: null,
    intro: 'Toi, cabinet RH, tu signes les mandats en prospectant les boîtes en croissance AVANT qu\'elles lancent leur appel d\'offres. Le problème : les DRH se cachent sur LinkedIn et tes commerciaux perdent 70% de leur temps à chercher. Volia te livre les bons contacts : DRH, fondateurs, responsables ops par secteur et zone.',
    keyMetric: { value: '+40%', label: 'de mandats signés', sub: 'vs sourcing LinkedIn seul' },
    painPoints: [
      'Tu prospectes les DRH mais leurs emails ne sont pas publics sur LinkedIn. Tu peux pas envoyer un message à 100 personnes',
      'Les boîtes qui recrutent activement ne lèvent pas la main. Si tu attends l\'appel d\'offres, t\'as perdu',
      'Tes commerciaux passent 70% de leur temps à chercher des contacts au lieu de pitcher. C\'est pas du sourcing, c\'est de la fouille',
    ],
    useCases: [
      { title: 'Cibler les boîtes en hyper-croissance', desc: 'Filtre par taille (PME, ETI) et secteur. Celles qui recrutent le plus. Pas les zombies du registre du commerce.' },
      { title: 'Contacts DRH + dirigeants', desc: 'Pas juste les standards. On chope les emails directs des décideurs paie/RH. Ceux qui signent les mandats.' },
      { title: 'Pitch contextualisé qui passe', desc: '"Bonjour {{first_name}}, je vois que {{company}} grandit dans {{secteur}}. J\'ai 3 candidats pile pour ton profil [X]." Ça, ça ouvre.' },
      { title: 'Multi-canal email + LinkedIn', desc: 'Coordonne cold email + LinkedIn depuis le même tableau. Pas 3 outils à synchroniser.' },
    ],
    idealPlan: { name: 'Pro', price: '49', why: '5 000 prospects/mois. Tu couvres 2-3 secteurs verticaux complets sans toucher au quota.' },
    testimonialSector: 'Services aux entreprises',
    ctaLabel: 'Je trouve les boîtes qui recrutent',
  },

  'freelances': {
    slug: 'freelances',
    title: 'Outil de prospection pour freelances B2B — Volia',
    metaDescription: 'Toi, freelance, Malt te prend 15% de commission et te met en concurrence sur le prix. Volia : 19€/mois, sans engagement, 1 000 prospects/mois avec email + téléphone. Adieu Malt, bonjour le client direct.',
    badge: 'Pour les freelances B2B',
    h1: 'Trouve tes clients freelance en direct — sans payer 15% à Malt',
    intro: 'Toi, freelance, Malt te prend 15% sur chaque mission au-delà de 100K€ cumulés. Comet, Upwork, c\'est pareil. Et en bonus, ils te mettent en concurrence sur le prix. Avec Volia à 19€/mois, tu prospectes en direct les boîtes qui ont besoin de toi. Tu gardes 100% de ta marge. Et tu choisis tes clients.',
    keyMetric: { value: '0%', label: 'de commission', sub: 'vs 10-20% sur les plateformes' },
    painPoints: [
      'Malt te prend 15% sur chaque mission > 100K€ HT cumulé. À 80K€ d\'activité, ça fait 12K€ de moins',
      'Les plateformes te mettent en concurrence sur le prix avec 15 autres devs / designers / consultants',
      'Tu veux CHOISIR tes clients, pas attendre que les briefs tombent et te battre pour avoir le mandat',
    ],
    useCases: [
      { title: 'Sourcing ciblé', desc: 'Cherche les boîtes qui matchent ton expertise : agences (designers), e-commerce (devs), industries (consultants).' },
      { title: 'Cold email perso qui marche', desc: 'Templating + 20 modèles testés sur 50 000 envois. Inclus dans le PDF gratuit. Pas un truc générique.' },
      { title: 'Zéro engagement', desc: 'Annule en 1 clic le mois où ton carnet est plein. Reprends 6 mois plus tard. Personne te rappelle.' },
      { title: 'Compatible CRM léger', desc: 'Export CSV pour Notion, Airtable, Trello. Ou direct dans Volia. Pas besoin de payer HubSpot.' },
    ],
    idealPlan: { name: 'Solo', price: '19', why: '1 000 prospects + 400 enrichissements/mois. Largement pour un freelance qui veut juste son carnet plein.' },
    testimonialSector: 'Technologie & Digital',
    ctaLabel: 'Je démarre en freelance',
  },

  'sales-managers': {
    slug: 'sales-managers',
    title: 'Outil de prospection pour Sales Managers & VP Sales — Volia',
    metaDescription: 'Toi, Sales Manager, t\'as 10 SDR à équiper sans exploser le budget. Apollo + Outreach + ZoomInfo = 1 200€/SDR/mois. Volia = 99€/mois pour toute l\'équipe. 90% d\'économie. Tu te poses encore la question ?',
    badge: 'Pour les Sales Managers',
    h1: 'Équipe ton équipe sales avec le meilleur ratio coût/résultats',
    intro: 'Toi, Sales Manager, tu diriges 5 à 50 SDR. Tu veux les équiper d\'un outil de prospection puissant SANS exploser le budget de ton CFO. Apollo + Outreach + ZoomInfo = 800-1 500€ par SDR par mois. Volia coûte 19-99€/mois pour TOUTE l\'équipe. Tu te poses encore la question ?',
    keyMetric: { value: '90%', label: 'd\'économie', sub: 'vs Apollo Pro Suite pour 10 SDR' },
    painPoints: [
      'Apollo + Outreach + ZoomInfo = 800-1 500€ par SDR par mois. Pour 10 SDR, c\'est 150K€/an',
      'Tes SDR jonglent entre 4 outils non synchronisés. La moitié des leads se perdent entre 2 onglets',
      'Le ROI sur les outils sales tier-1 est devenu impossible à justifier. Ton CFO te le rappelle chaque trimestre',
    ],
    useCases: [
      { title: 'Multi-utilisateurs en 1 abo', desc: 'Tous tes SDR sur la même base, les mêmes campagnes. Pas de licence par siège qui te coûte 100€/user.' },
      { title: 'API publique pour ton CRM', desc: 'Auto-push dans HubSpot / Salesforce / Pipedrive via Zapier ou notre API REST. Ton tech valide en 1 heure.' },
      { title: 'Reporting consolidé', desc: 'Vue d\'équipe : campagnes envoyées, taux d\'ouverture, RDV générés. Sans bidouiller Looker pendant 3 jours.' },
      { title: 'Conformité légale auditée', desc: 'Filtre RGPD, opt-out tracé, registre des traitements. Ton DPO arrête de te courir après.' },
    ],
    idealPlan: { name: 'Business', price: '99', why: '10 000 prospects + 4 000 enrichissements/mois. Équipe sales complète couverte. Pour le prix d\'un déjeuner.' },
    testimonialSector: 'Services aux entreprises',
    ctaLabel: 'J\'équipe mon équipe sales',
  },
};

export function getPersona(slug) {
  return PERSONAS[slug] || null;
}

export function getAllPersonas() {
  return Object.values(PERSONAS);
}

export { PERSONAS };
