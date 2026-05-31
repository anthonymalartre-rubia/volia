// ─────────────────────────────────────────────────────────────────────
// src/lib/press-kit.js — Press kit data centralisé
// ─────────────────────────────────────────────────────────────────────
// Source unique de vérité pour la page /presse et tout futur usage
// (génération PDF du press kit, page média, About, etc.).
//
// Conventions :
//   - Tout en français (cible presse FR : Maddyness, Frenchweb,
//     Les Echos, Forbes FR, Welcome to the Jungle, BFM Tech, ActuIA…)
//   - Les chiffres doivent rester factuels et vérifiables : si une
//     valeur n'est pas certaine, marquer `// TODO: chiffre exact`.
//   - Les boilerplates sont CALIBRÉS pour copier-coller : 1 phrase,
//     ~50 mots, ~120 mots. Modifier prudemment (impact PR).
// ─────────────────────────────────────────────────────────────────────

// ─── BOILERPLATE — 3 longueurs prêtes à copier pour les journalistes ──
export const BOILERPLATE = {
  short:
    "Volia est la suite SaaS B2B française réunissant en un seul outil prospection, cold email, CRM et formulaires — co-construite par un founder solo avec une IA agentique.",

  medium:
    "Volia est la première suite SaaS B2B française réunissant en un seul outil prospection, cold email, CRM et formulaires. Lancée en 2026 par Anthony Malartre — founder solo, sans levée de fonds — la plateforme a été co-construite avec Claude, l'IA agentique d'Anthropic, sur plus de 370 commits publics. À partir de 19 €/mois, elle vise les TPE/PME et indépendants qui cherchent une alternative française à la stack US (Apollo, HubSpot, Lemlist).",

  long:
    "Volia (volia.fr) est la première suite SaaS B2B française pensée comme une alternative complète à la stack US dominante (Apollo, HubSpot, Lemlist, Typeform). En un seul abonnement à partir de 19 €/mois, la plateforme réunit quatre modules connectés : Prospection (287 000+ entreprises françaises accessibles via Google Places, enrichissement waterfall multi-sources), Campagnes (séquences email/SMS automatisées), CRM (pipeline commercial natif) et Formulaires (capture de leads). Volia est éditée par Anthony Malartre, founder solo basé en France, et a été intégralement co-construite en 12 mois avec Claude, l'IA agentique d'Anthropic — plus de 370 commits publics documentent le processus. Hébergée en Union européenne (Supabase Frankfurt) et conforme RGPD par conception, Volia couvre aujourd'hui 8 pays (France, Belgique, Suisse, Luxembourg, Allemagne, Royaume-Uni, Espagne, Italie) et s'adresse aux TPE/PME, indépendants et équipes commerciales qui veulent un outil souverain, lisible et 5× moins cher que les leaders américains.",
};

// ─── KEY_NUMBERS — chiffres clés (cards page presse) ──────────────────
// Chaque card doit avoir : value (string courte), label, sub (contexte),
// gradient (Tailwind) et iconName (mappé côté UI vers Lucide).
export const KEY_NUMBERS = [
  {
    value: '4',
    label: 'modules connectés',
    sub: 'Prospection · Campagnes · CRM · Formulaires',
    gradient: 'from-violet-500 to-indigo-600',
    iconName: 'Layers',
  },
  {
    value: '370+',
    label: 'commits publics',
    sub: 'historique transparent sur GitHub',
    gradient: 'from-indigo-500 to-blue-600',
    iconName: 'GitCommit',
  },
  {
    value: '12',
    label: 'mois de développement',
    sub: 'de la première ligne au lancement',
    gradient: 'from-blue-500 to-cyan-600',
    iconName: 'Calendar',
  },
  {
    value: '0',
    label: 'levée de fonds',
    sub: '100 % bootstrap, 0 dette, 0 dilution',
    gradient: 'from-emerald-500 to-teal-600',
    iconName: 'Wallet',
  },
  {
    value: '1',
    label: 'founder solo',
    sub: 'augmenté par une IA agentique',
    gradient: 'from-rose-500 to-pink-600',
    iconName: 'User',
  },
  {
    value: '8',
    label: 'pays couverts',
    sub: 'FR · BE · CH · LU · DE · UK · ES · IT',
    gradient: 'from-amber-500 to-orange-600',
    iconName: 'Globe',
  },
  {
    value: '150+',
    label: "catégories d'activité",
    sub: 'B2B, copropriété, services, retail…',
    gradient: 'from-fuchsia-500 to-purple-600',
    iconName: 'Tag',
  },
  {
    value: '101',
    label: 'départements français',
    sub: 'métropole + outre-mer',
    gradient: 'from-sky-500 to-blue-600',
    iconName: 'MapPin',
  },
  {
    value: '287 000+',
    label: 'entreprises accessibles',
    sub: 'via Google Places + enrichissement waterfall',
    gradient: 'from-violet-600 to-fuchsia-600',
    iconName: 'Building2',
  },
];

// ─── FOUNDER_QUOTES — phrases citables prêtes à l'emploi ──────────────
export const FOUNDER_QUOTES = [
  {
    text: "L'IA ne remplace pas les founders, elle les augmente.",
    context: 'Sur le rôle de Claude dans la construction de Volia',
  },
  {
    text: "On a construit en 12 mois ce qui aurait pris 3 ans à une équipe de 8.",
    context: 'Sur la productivité du founder solo augmenté par IA',
  },
  {
    text: "0 levée, 0 dette, 4 modules. C'est le futur des SaaS bootstrap.",
    context: 'Sur le modèle économique de Volia',
  },
  {
    text: "La souveraineté SaaS française ne se décrète pas, elle se code.",
    context: 'Sur le positionnement français de Volia',
  },
  {
    text: "Chaque commit est public. Chaque décision est traçable. C'est le SaaS du XXIe siècle.",
    context: 'Sur la transparence du processus de développement',
  },
];

// ─── PRESS_ANGLES — 3 angles pitch pour cibler la presse ──────────────
export const PRESS_ANGLES = [
  {
    slug: 'founder-augmente-par-ia',
    title: 'Le founder augmenté par IA',
    audience: 'Presse tech & startup (Maddyness, Frenchweb, Forbes FR)',
    pitch:
      "Comment un entrepreneur solo a-t-il pu livrer en 12 mois une suite SaaS B2B complète (4 modules, 370+ commits, RGPD natif) là où une équipe de 8 aurait mis 3 ans ? La réponse tient en un mot : Claude. Volia est le premier cas documenté de SaaS B2B européen co-construit en pair-programming avec une IA agentique.",
    releaseUrl: '/presse/cp-founder-augmente-par-ia.pdf',
    iconName: 'Sparkles',
    gradient: 'from-violet-500 to-indigo-600',
  },
  {
    slug: 'alternative-francaise-stack-us',
    title: "L'alternative française à la stack US",
    audience: 'Presse business & souveraineté (Les Echos, BFM Tech, La Tribune)',
    pitch:
      "Apollo, HubSpot, Lemlist, Typeform : la stack growth des PME françaises est 100 % américaine, facturée en dollars, hébergée hors UE. Volia propose en 2026 la première alternative souveraine complète : 4 modules connectés, hébergement Frankfurt, RGPD natif, support FR, à partir de 19 €/mois (5× moins cher).",
    releaseUrl: '/presse/cp-alternative-francaise.pdf',
    iconName: 'Flag',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    slug: 'cas-ecole-cloud-ia-agentique',
    title: "Le cas d'école Cloud + IA agentique",
    audience: 'Presse IA spécialisée (ActuIA, Usine Digitale, Siècle Digital)',
    pitch:
      "Volia documente publiquement son processus de construction assisté par IA : 370+ commits Git, ADR (Architecture Decision Records), CONTEXT.md évolutif. Un cas d'usage concret du paradigme \"AI-native development\" sur une stack moderne (Next.js 14, Supabase, Vercel) au service d'un SaaS B2B européen.",
    releaseUrl: '/presse/cp-cas-ecole-ia-agentique.pdf',
    iconName: 'Brain',
    gradient: 'from-fuchsia-500 to-purple-600',
  },
];

// ─── MEDIA_KIT_ASSETS — assets téléchargeables ────────────────────────
// Pour chaque asset : title, description, url (placeholder OK pour
// SVG/PNG/PDF non encore générés), format, size (approximatif), iconName.
export const MEDIA_KIT_ASSETS = [
  {
    category: 'Logos',
    items: [
      {
        title: 'Logo Volia — SVG',
        description: 'Vectoriel, fond transparent',
        url: '/icon.svg',
        format: 'SVG',
        size: '~4 KB',
        iconName: 'FileImage',
      },
      {
        title: 'Logo Volia — PNG light',
        description: 'Pour fonds clairs, 2048px',
        url: '/presse/logo-volia-light.png',
        format: 'PNG',
        size: '~80 KB',
        iconName: 'FileImage',
      },
      {
        title: 'Logo Volia — PNG dark',
        description: 'Pour fonds sombres, 2048px',
        url: '/presse/logo-volia-dark.png',
        format: 'PNG',
        size: '~80 KB',
        iconName: 'FileImage',
      },
      {
        title: 'Wordmark — SVG',
        description: 'Logo + nom, vectoriel',
        url: '/presse/wordmark-volia.svg',
        format: 'SVG',
        size: '~6 KB',
        iconName: 'FileImage',
      },
    ],
  },
  {
    category: 'Screenshots produit',
    items: [
      {
        title: 'Volia Prospection — dashboard',
        description: 'Recherche par catégorie, 287k+ entreprises',
        url: '/presse/screenshot-prospection.png',
        format: 'PNG',
        size: '~600 KB',
        iconName: 'Image',
      },
      {
        title: 'Volia Campagnes — séquence',
        description: 'Éditeur de séquence email/SMS',
        url: '/presse/screenshot-campagnes.png',
        format: 'PNG',
        size: '~600 KB',
        iconName: 'Image',
      },
      {
        title: 'Volia CRM — pipeline kanban',
        description: 'Pipeline commercial avec drag & drop',
        url: '/presse/screenshot-crm.png',
        format: 'PNG',
        size: '~600 KB',
        iconName: 'Image',
      },
      {
        title: 'Volia Formulaires — éditeur',
        description: 'Création de formulaires sans code',
        url: '/presse/screenshot-formulaires.png',
        format: 'PNG',
        size: '~600 KB',
        iconName: 'Image',
      },
    ],
  },
  {
    category: 'Photos founder',
    items: [
      {
        title: 'Anthony Malartre — portrait',
        description: 'Format portrait, 2000×3000px',
        url: '/img/founder-anthony-portrait.jpg',
        format: 'JPG',
        size: '~1.2 MB',
        iconName: 'Camera',
      },
      {
        title: 'Anthony Malartre — paysage',
        description: 'Format paysage, 3000×2000px',
        url: '/img/founder-anthony-landscape.jpg',
        format: 'JPG',
        size: '~1.4 MB',
        iconName: 'Camera',
      },
      {
        title: 'Anthony Malartre — carré',
        description: 'Format carré, 2000×2000px',
        url: '/img/founder-anthony-square.jpg',
        format: 'JPG',
        size: '~1.0 MB',
        iconName: 'Camera',
      },
    ],
  },
  {
    category: 'Dossier complet',
    items: [
      {
        title: 'Press kit Volia — PDF complet',
        description: 'Boilerplate, chiffres, bio, quotes, contact (8 pages)',
        url: '/presse/volia-press-kit.pdf',
        format: 'PDF',
        size: '~3 MB',
        iconName: 'FileText',
      },
    ],
  },
];

// ─── PRESS_RELEASES — communiqués de presse récents ───────────────────
export const PRESS_RELEASES = [
  {
    date: '2026-06-01',
    dateLabel: '1er juin 2026',
    title: 'Volia lance sa suite SaaS B2B française à partir de 19 €/mois',
    slug: 'lancement-suite-saas-b2b',
    summary:
      "Volia ouvre officiellement l'accès à sa suite SaaS B2B complète (Prospection, Campagnes, CRM, Formulaires) et se positionne comme l'alternative française à la stack US (Apollo, HubSpot, Lemlist).",
    pdfUrl: '/presse/cp-lancement-juin-2026.pdf',
  },
  {
    date: '2026-03-15',
    dateLabel: '15 mars 2026',
    title: 'Volia ajoute le module Formulaires — 4 modules connectés',
    slug: 'module-formulaires',
    summary:
      "Le quatrième module de la suite Volia, Formulaires, sort en bêta. Il permet de capturer des leads directement dans le CRM Volia, sans Typeform ni outil tiers.",
    pdfUrl: '/presse/cp-module-formulaires-mars-2026.pdf',
  },
];

// ─── PRESS_CONTACT — informations contact presse ──────────────────────
export const PRESS_CONTACT = {
  email: 'presse@volia.fr',
  phone: '+33 (0)X XX XX XX XX', // TODO: numéro presse dédié
  responseTime: '< 24h',
  founderEmail: 'anthony@volia.fr',
  linkedin: 'https://www.linkedin.com/in/anthonymalartre/', // TODO: vérifier URL
  twitter: 'https://twitter.com/anthonymalartre', // TODO: vérifier handle
  github: 'https://github.com/anthonymalartre-rubia/volia',
};

// ─── FOUNDER_BIO — 3 versions ─────────────────────────────────────────
export const FOUNDER_BIO = {
  short:
    "Anthony Malartre, entrepreneur français, est le fondateur solo de Volia (volia.fr).",

  medium:
    "Anthony Malartre est un entrepreneur SaaS français, fondateur solo de Volia (volia.fr). En 12 mois, il a co-construit avec Claude, l'IA agentique d'Anthropic, la première suite SaaS B2B française réunissant prospection, cold email, CRM et formulaires — sans levée de fonds, sans co-fondateur, et avec 370+ commits publics qui documentent intégralement le processus.",

  long:
    "Anthony Malartre est un entrepreneur SaaS français basé en France. Après plusieurs années à construire des projets B2B SaaS dans des structures plus traditionnelles, il décide en 2025 de tester une hypothèse : un founder solo équipé d'une IA agentique de dernière génération peut-il livrer une suite SaaS B2B complète au niveau des leaders du marché ? Volia est la réponse. En 12 mois, sans co-fondateur, sans levée de fonds, sans dette technique cachée, il livre 4 modules connectés (Prospection, Campagnes, CRM, Formulaires), conformes RGPD, hébergés en Union européenne, accessibles à partir de 19 €/mois. Le développement entier est documenté publiquement : 370+ commits Git, ADR, CONTEXT.md évolutif. Anthony défend une vision : l'IA ne remplace pas les founders, elle les augmente — et la souveraineté SaaS européenne passera par des projets bootstrap, lisibles et exigeants.",
};
