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
//     ~70 mots, ~180 mots. Modifier prudemment (impact PR).
//
// POSITIONNEMENT (juin 2026) :
//   « Volia est la première entreprise SaaS autonome d'un nouveau
//   genre. Une entreprise pilotée par IA, augmentée par 1 founder. »
//   Construite en 6 semaines à Marseille, supervisée par Anthony
//   Malartre (responsable produit + sales + service client).
// ─────────────────────────────────────────────────────────────────────

// ─── BOILERPLATE — 3 longueurs prêtes à copier pour les journalistes ──
export const BOILERPLATE = {
  short:
    "Volia est la première entreprise SaaS autonome au monde — pilotée par IA, augmentée par 1 founder, construite en 6 semaines à Marseille.",

  medium:
    "Volia est la première entreprise SaaS autonome d'un nouveau genre, pilotée par IA et augmentée par 1 founder. Construite en 6 semaines à Marseille par Anthony Malartre avec Claude, l'IA agentique d'Anthropic, la suite réunit prospection, cold email, CRM et formulaires en un seul outil à partir de 19 €/mois. Volia incarne une nouvelle catégorie d'entreprise : pas d'équipe, pas de levée, pas d'investisseurs — juste un founder, des agents IA autonomes et un produit qui se vend.",

  long:
    "Volia (volia.fr) est la première entreprise SaaS autonome au monde — une nouvelle catégorie d'entreprise pilotée par IA et augmentée par 1 founder. Construite en 6 semaines à Marseille par Anthony Malartre avec Claude, l'IA agentique d'Anthropic, la plateforme réunit en un seul abonnement à partir de 19 €/mois quatre modules connectés : Prospection (287 000+ entreprises françaises accessibles via Google Places, enrichissement waterfall multi-sources), Campagnes (séquences email/SMS automatisées), CRM (pipeline commercial natif) et Formulaires (capture de leads). Plus de 370 commits publics et 10 cron jobs autonomes documentent un fonctionnement quotidien orchestré par des agents IA. Hébergée en Union européenne (Supabase Frankfurt) et conforme RGPD par conception, Volia couvre 8 pays européens (France, Belgique, Suisse, Luxembourg, Allemagne, Royaume-Uni, Espagne, Italie). Le modèle : 0 salarié supplémentaire, 0 levée de fonds, 0 dette. Anthony Malartre reste responsable produit, sales et service client — l'exécution opérationnelle est assurée par les agents IA. Volia est la preuve qu'une nouvelle forme d'entreprise est née : le founder augmenté.",
};

// ─── KEY_NUMBERS — chiffres clés (cards page presse) ──────────────────
// Chaque card doit avoir : value (string courte), label, sub (contexte),
// gradient (Tailwind) et iconName (mappé côté UI vers Lucide).
export const KEY_NUMBERS = [
  {
    value: '6',
    label: 'semaines de construction',
    sub: 'sprint intensif founder + IA agentique',
    gradient: 'from-blue-500 to-cyan-600',
    iconName: 'Calendar',
  },
  {
    value: '1',
    label: 'founder',
    sub: 'augmenté par des agents IA autonomes',
    gradient: 'from-rose-500 to-pink-600',
    iconName: 'User',
  },
  {
    value: '4',
    label: 'modules connectés',
    sub: 'Prospection · Campagnes · CRM · Formulaires',
    gradient: 'from-violet-500 to-indigo-600',
    iconName: 'Layers',
  },
  {
    value: '370+',
    label: 'commits autonomes',
    sub: 'historique transparent sur GitHub',
    gradient: 'from-indigo-500 to-blue-600',
    iconName: 'GitCommit',
  },
  {
    value: '10',
    label: 'cron jobs autonomes',
    sub: 'exécution quotidienne sans intervention',
    gradient: 'from-fuchsia-500 to-purple-600',
    iconName: 'Brain',
  },
  {
    value: '0',
    label: 'salarié supplémentaire',
    sub: '1 founder + agents IA, point.',
    gradient: 'from-rose-500 to-orange-600',
    iconName: 'Sparkles',
  },
  {
    value: '0',
    label: 'levée de fonds',
    sub: '100 % bootstrap, 0 dette, 0 dilution',
    gradient: 'from-emerald-500 to-teal-600',
    iconName: 'Wallet',
  },
  {
    value: '287 000+',
    label: 'entreprises accessibles',
    sub: 'via Google Places + enrichissement waterfall',
    gradient: 'from-violet-600 to-fuchsia-600',
    iconName: 'Building2',
  },
  {
    value: '8',
    label: 'pays européens couverts',
    sub: 'FR · BE · CH · LU · DE · UK · ES · IT',
    gradient: 'from-amber-500 to-orange-600',
    iconName: 'Globe',
  },
  {
    value: '100%',
    label: 'hébergement UE',
    sub: 'Supabase Frankfurt · RGPD natif',
    gradient: 'from-sky-500 to-blue-600',
    iconName: 'Flag',
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
];

// ─── FOUNDER_QUOTES — phrases citables prêtes à l'emploi ──────────────
export const FOUNDER_QUOTES = [
  {
    text: "Volia n'est pas un SaaS. C'est la preuve qu'une nouvelle catégorie d'entreprise est née.",
    context: 'Sur le positionnement de Volia comme entreprise autonome',
  },
  {
    text: "1 humain décide. 1000 agents IA exécutent. C'est ça le nouveau modèle.",
    context: "Sur l'organisation interne d'une entreprise autonome",
  },
  {
    text: "Construire l'équivalent de HubSpot + Apollo + Lemlist + Tally en 6 semaines, seul, n'était pas possible il y a 18 mois. Maintenant si.",
    context: "Sur la vélocité permise par l'IA agentique de dernière génération",
  },
  {
    text: "Le futur des entreprises B2B ne ressemble plus à des équipes. Il ressemble à des founders augmentés.",
    context: "Sur la vision de l'entreprise du nouveau genre",
  },
  {
    text: "Pas de levée. Pas d'équipe. Pas d'investisseurs. Juste un founder, Claude, et un produit qui se vend tout seul.",
    context: 'Sur le modèle économique de Volia',
  },
  {
    text: "La souveraineté SaaS française ne se décrète pas, elle se code.",
    context: 'Sur le positionnement français de Volia',
  },
];

// ─── PRESS_ANGLES — 3 angles pitch pour cibler la presse ──────────────
export const PRESS_ANGLES = [
  {
    slug: 'entreprise-autonome-nouveau-genre',
    title: "L'entreprise autonome d'un nouveau genre",
    audience: 'Presse vision & futur du travail (Forbes FR, Les Echos, Maddyness)',
    pitch:
      "Et si l'entreprise du XXIe siècle ne ressemblait plus à une équipe, mais à un founder augmenté par des agents IA autonomes ? Volia incarne cette nouvelle catégorie : 1 founder supervise, 1000 agents IA exécutent. Construite en 6 semaines à Marseille, sans salarié supplémentaire, sans levée de fonds, la suite SaaS B2B fonctionne aujourd'hui en production avec 10 cron jobs orchestrés par IA.",
    releaseUrl: '/presse/cp-entreprise-autonome.pdf',
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
    slug: 'premiere-mondiale-ia-agentique-production',
    title: "Première mondiale : l'IA agentique en production",
    audience: 'Presse IA spécialisée (ActuIA, Usine Digitale, Siècle Digital)',
    pitch:
      "Volia est le premier SaaS B2B européen documenté entièrement co-construit par IA agentique et opéré en production par des agents autonomes : 370+ commits publics, 10 cron jobs IA, ADR, CONTEXT.md évolutif. Un cas d'école mondial du paradigme \"AI-native company\" sur une stack moderne (Next.js 14, Supabase, Vercel) supervisée par 1 founder.",
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
        url: '/img/founder-anthony-portrait.svg',
        format: 'JPG',
        size: '~1.2 MB',
        iconName: 'Camera',
      },
      {
        title: 'Anthony Malartre — paysage',
        description: 'Format paysage, 3000×2000px',
        url: '/img/founder-anthony-landscape.svg',
        format: 'JPG',
        size: '~1.4 MB',
        iconName: 'Camera',
      },
      {
        title: 'Anthony Malartre — carré',
        description: 'Format carré, 2000×2000px',
        url: '/img/founder-anthony-square.svg',
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
    title:
      "Volia lance la première entreprise SaaS autonome au monde — construite en 6 semaines",
    slug: 'lancement-entreprise-autonome',
    summary:
      "Volia officialise le lancement d'une nouvelle catégorie d'entreprise : une suite SaaS B2B complète (Prospection, Campagnes, CRM, Formulaires) construite en 6 semaines à Marseille par 1 founder augmenté par des agents IA autonomes. Pas d'équipe, pas de levée, pas d'investisseurs.",
    pdfUrl: '/presse/cp-lancement-entreprise-autonome-juin-2026.pdf',
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
  city: 'Marseille',
  linkedin: 'https://www.linkedin.com/in/anthonymalartre/', // TODO: vérifier URL
  twitter: 'https://twitter.com/anthonymalartre', // TODO: vérifier handle
  github: 'https://github.com/anthonymalartre-rubia/volia',
};

// ─── FOUNDER_BIO — 3 versions ─────────────────────────────────────────
export const FOUNDER_BIO = {
  short:
    "Anthony Malartre, founder de Volia, la première entreprise SaaS autonome au monde, construite en 6 semaines à Marseille.",

  medium:
    "Anthony Malartre est le founder de Volia (volia.fr), première entreprise SaaS autonome d'un nouveau genre — pilotée par IA, augmentée par 1 founder. Basé à Marseille, ex-fondateur de plusieurs projets B2B, il a construit Volia en 6 semaines avec Claude, l'IA agentique d'Anthropic : 4 modules connectés, 370+ commits publics, 10 cron jobs autonomes. Anthony défend la philosophie du founder augmenté : 1 humain qui décide, 1000 agents IA qui exécutent.",

  long:
    "Anthony Malartre est le founder de Volia (volia.fr), basé à Marseille. Après plusieurs années à fonder des projets B2B SaaS dans des structures plus traditionnelles, il décide en 2026 de tester une hypothèse : et si l'entreprise du XXIe siècle n'était plus une équipe, mais un founder augmenté par des agents IA autonomes ? Volia est la réponse. En 6 semaines de sprint intensif, sans co-fondateur, sans levée de fonds, sans salarié supplémentaire, il livre 4 modules connectés (Prospection, Campagnes, CRM, Formulaires), conformes RGPD, hébergés en Union européenne, accessibles à partir de 19 €/mois. Le développement entier est documenté publiquement : 370+ commits Git, ADR, CONTEXT.md évolutif. En production, 10 cron jobs autonomes orchestrent les opérations quotidiennes. Anthony reste personnellement responsable du produit, du sales et du service client — l'exécution opérationnelle est assurée par les agents IA. Sa vision : la souveraineté SaaS européenne passera par des entreprises bootstrap, lisibles, exigeantes — et par une nouvelle catégorie d'entrepreneurs : les founders augmentés.",
};
