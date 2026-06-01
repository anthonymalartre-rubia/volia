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
    "Volia est la première entreprise SaaS autonome d'un nouveau genre, pilotée par IA et augmentée par 1 founder. Construite en 6 semaines à Marseille par Anthony Malartre avec Claude, l'IA agentique d'Anthropic, la suite réunit prospection, cold email, CRM et formulaires en un seul outil à partir de 19 €/mois. Au cœur du système : 16 boucles d'agents IA tournent 24/7 — marketing, support, code, vente, méta-optimisation — et un dashboard mesure en temps réel le ROI de chaque boucle. Volia incarne une nouvelle catégorie d'entreprise : pas d'équipe, pas de levée, pas d'investisseurs — juste un founder, des agents IA autonomes et un produit qui se vend.",

  long:
    "Volia (volia.fr) est la première entreprise SaaS autonome au monde — une nouvelle catégorie d'entreprise pilotée par IA et augmentée par 1 founder. Construite en 6 semaines à Marseille par Anthony Malartre avec Claude, l'IA agentique d'Anthropic, la plateforme réunit en un seul abonnement à partir de 19 €/mois quatre modules connectés : Prospection (287 000+ entreprises françaises accessibles via Google Places, enrichissement waterfall multi-sources), Campagnes (séquences email/SMS automatisées), CRM (pipeline commercial natif) et Formulaires (capture de leads). En production, 16 boucles d'agents IA orchestrent les opérations 24/7 : rédaction de posts LinkedIn, articles SEO hebdomadaires, newsletter mensuelle, séquence de réactivation des clients perdus, relance personnalisée des trials, prospection sortante auto-générée (Volia utilise Volia pour vendre Volia), détection d'erreurs prod et création de pull requests de correction par Claude, classification des emails entrants et réponses FAQ automatiques, chat pré-vente et support in-app. Une boucle de méta-autonomie analyse chaque semaine le ROI de toutes les autres et propose à Anthony de nouvelles automatisations à créer. Plus de 400 commits publics documentent le fonctionnement. Hébergée en Union européenne (Supabase Frankfurt) et conforme RGPD par conception, Volia couvre 8 pays européens (France, Belgique, Suisse, Luxembourg, Allemagne, Royaume-Uni, Espagne, Italie). Le modèle : 0 salarié supplémentaire, 0 levée de fonds, 0 dette. Anthony Malartre reste responsable produit, sales et service client — l'exécution opérationnelle est assurée par les agents IA, et leur orchestration elle-même est devenue auto-optimisée. Volia est la preuve qu'une nouvelle forme d'entreprise est née : le founder augmenté.",
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
    value: '400+',
    label: 'commits autonomes',
    sub: 'historique transparent sur GitHub',
    gradient: 'from-indigo-500 to-blue-600',
    iconName: 'GitCommit',
  },
  {
    value: '16',
    label: "boucles d'agents IA en production",
    sub: 'marketing · code · vente · support · méta-optim — 24/7',
    gradient: 'from-fuchsia-500 to-purple-600',
    iconName: 'Brain',
  },
  {
    value: '9',
    label: "types d'actions autonomes",
    sub: 'posts, articles, emails, PR code, leads, recos…',
    gradient: 'from-purple-500 to-pink-600',
    iconName: 'Sparkles',
  },
  {
    value: '2',
    label: "chats IA in-app",
    sub: 'pré-vente (landing) + support (dashboard)',
    gradient: 'from-emerald-500 to-teal-600',
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
  {
    text: "Le truc le plus dingue ce n'est pas que les agents IA bossent pour moi. C'est qu'ils me proposent eux-mêmes quoi automatiser ensuite.",
    context: "Sur la couche de méta-autonomie qui analyse le ROI de chaque boucle et propose les prochaines",
  },
  {
    text: "Volia utilise Volia pour vendre Volia. Chaque lundi, le module Prospection génère 50 prospects ICP, et le module Campagnes les contacte. C'est mon meilleur démo.",
    context: 'Sur le dogfood-outreach autonome',
  },
  {
    text: "Quand Sentry détecte un bug en prod, Claude lit le stack trace, comprend le code, et m'ouvre la pull request. Je n'ai qu'à valider. C'est la fin du backlog.",
    context: 'Sur le pipeline self-healing : Sentry → GitHub issue → PR draft Claude',
  },
  {
    text: "Chaque mardi à 10h, je reçois un email automatique avec le ROI précis de chacune de mes 16 boucles autonomes, et 3 recommandations Claude pour la semaine suivante. Aucune équipe humaine ne pourrait produire ça aussi vite.",
    context: 'Sur la weekly review et l\'auto-optimisation continue',
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
      "Volia est le premier SaaS B2B européen documenté entièrement co-construit par IA agentique et opéré en production par 16 boucles d'agents autonomes : 400+ commits publics, génération de contenu, code source, prospection, support client, le tout orchestré 24/7 sans intervention humaine en cascade. Un cas d'école mondial du paradigme \"AI-native company\" sur une stack moderne (Next.js 14, Supabase, Vercel, Anthropic) supervisée par 1 founder.",
    releaseUrl: '/presse/cp-cas-ecole-ia-agentique.pdf',
    iconName: 'Brain',
    gradient: 'from-fuchsia-500 to-purple-600',
  },
  {
    slug: 'meta-autonomie-ia-qui-soptimise',
    title: "Méta-autonomie : l'IA qui s'auto-optimise",
    audience: 'Presse IA, recherche & innovation (ActuIA, Usbek & Rica, Siècle Digital, MIT Tech Review FR)',
    pitch:
      "Au-delà de l'autonomie classique (les IA exécutent), Volia franchit un cap : ses agents IA analysent eux-mêmes leur ROI, identifient les boucles inefficaces, et proposent au founder de nouvelles automatisations à créer. Chaque mardi, Anthony Malartre reçoit un email auto-généré avec les métriques précises de ses 16 boucles + 3 recommandations Claude pour la semaine. C'est la première implémentation documentée d'une couche de méta-autonomie en production sur un SaaS B2B. Le système ne fait plus seulement ce qu'on lui dit — il décide ce qu'il faudrait faire ensuite.",
    releaseUrl: '/presse/cp-meta-autonomie.pdf',
    iconName: 'Brain',
    gradient: 'from-amber-500 to-rose-600',
  },
  {
    slug: 'volia-vend-supporte-code-soi-meme',
    title: "Volia se vend, se code et se support — tout seul",
    audience: 'Presse business & tech (Maddyness, Les Echos Tech, FrenchWeb, BFM Tech)',
    pitch:
      "Trois preuves concrètes de l'entreprise autonome en juin 2026 : (1) Volia utilise son propre module Prospection chaque semaine pour générer 50 prospects ICP-fit puis les contacter via son module Campagnes — un cas unique de SaaS qui vend grâce à lui-même. (2) Quand Sentry détecte une erreur en prod, Claude lit le code source, comprend la cause, et ouvre une pull request de correction sur GitHub que le founder n'a qu'à valider. (3) Pour les emails clients classifiés comme questions FAQ avec confiance >85 %, Claude envoie directement une réponse signée au nom d'Anthony, avec copie au founder. Trois boucles, un seul mot d'ordre : l'humain valide, l'IA exécute.",
    releaseUrl: '/presse/cp-volia-tout-seul.pdf',
    iconName: 'Sparkles',
    gradient: 'from-emerald-500 to-teal-600',
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
  email: 'contact@volia.fr',
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
    "Anthony Malartre est le founder de Volia (volia.fr), première entreprise SaaS autonome d'un nouveau genre — pilotée par IA, augmentée par 1 founder. Basé à Marseille, ex-fondateur de plusieurs projets B2B, il a construit Volia en 6 semaines avec Claude, l'IA agentique d'Anthropic : 4 modules connectés, 400+ commits publics, 16 boucles d'agents IA en production qui orchestrent marketing, code, vente et support 24/7. Une couche de méta-autonomie analyse chaque semaine le ROI de toutes les boucles et propose à Anthony les prochaines automatisations à créer. Anthony défend la philosophie du founder augmenté : 1 humain qui décide, 1000 agents IA qui exécutent.",

  long:
    "Anthony Malartre est le founder de Volia (volia.fr), basé à Marseille. Après plusieurs années à fonder des projets B2B SaaS dans des structures plus traditionnelles, il décide en 2026 de tester une hypothèse : et si l'entreprise du XXIe siècle n'était plus une équipe, mais un founder augmenté par des agents IA autonomes ? Volia est la réponse. En 6 semaines de sprint intensif, sans co-fondateur, sans levée de fonds, sans salarié supplémentaire, il livre 4 modules connectés (Prospection, Campagnes, CRM, Formulaires), conformes RGPD, hébergés en Union européenne, accessibles à partir de 19 €/mois. Le développement entier est documenté publiquement : 400+ commits Git, ADR, CONTEXT.md évolutif. En production, 16 boucles d'agents IA orchestrent 24/7 : rédaction LinkedIn provocatrice, articles SEO hebdomadaires, newsletter mensuelle générée puis envoyée, séquences de réactivation client (J+30/60/90), relance personnalisée des trials selon un score de lead recalculé chaque nuit, prospection sortante auto-générée (Volia utilise Volia pour vendre Volia), détection d'erreurs prod et création de pull requests de correction par Claude, classification des emails entrants et auto-réponse FAQ pour les questions à confiance élevée, deux chatbots IA (pré-vente sur landing, support sur dashboard). Une couche de méta-autonomie agrège chaque nuit les métriques de toutes les boucles, calcule le ROI estimé par action, et envoie chaque mardi un email à Anthony avec un dashboard détaillé et 3 recommandations Claude pour la semaine suivante. Anthony reste personnellement responsable du produit, du sales et du service client — l'exécution opérationnelle est assurée par les agents IA, et leur orchestration elle-même est devenue auto-optimisée. Sa vision : la souveraineté SaaS européenne passera par des entreprises bootstrap, lisibles, exigeantes — et par une nouvelle catégorie d'entrepreneurs : les founders augmentés.",
};

// ─── AI_LOOPS_INVENTORY — détail technique des 16 boucles autonomes ──
// Liste exhaustive pour journalistes qui veulent du concret.
// Ajoutée juin 2026 après livraison Sprint Méta-autonomie + Support + Insights.
export const AI_LOOPS_INVENTORY = [
  { category: 'Marketing', name: 'Brouillons LinkedIn provocateurs', cadence: 'Lu-Ve 10h', detail: 'Claude rédige selon 8 frameworks (démolition mythe, fact-bomb, contrarian…) sur les pain points B2B. Founder approuve en 1 clic.' },
  { category: 'Marketing', name: 'Auto-like des posts publiés', cadence: '15 min', detail: 'Boost engagement initial sur chaque post LinkedIn publié.' },
  { category: 'Marketing', name: 'Auto-changelog hebdomadaire', cadence: 'Mardi 7h', detail: 'Lit les commits Git → propose une entrée changelog publique.' },
  { category: 'Marketing', name: 'Articles blog SEO long-form', cadence: 'Mercredi 8h', detail: '1 article de 1500 mots/sem, 12 angles evergreen en rotation.' },
  { category: 'Marketing', name: 'Newsletter mensuelle', cadence: '25 du mois 9h', detail: 'Compile derniers articles + changelog + stats → envoie batch à tous les subscribers.' },
  { category: 'Vente', name: 'Lead scoring quotidien', cadence: 'Daily 6h', detail: 'Score 0-100 calculé sur 8 signaux comportementaux par utilisateur.' },
  { category: 'Vente', name: 'Relance trials personnalisée', cadence: 'Daily 9h', detail: 'Séquence J+3 / J+7 / J+12 dont le ton change selon le score de lead.' },
  { category: 'Vente', name: 'Réactivation clients churnés', cadence: 'Daily 10h', detail: 'Séquence J+30 / J+60 / J+90 dont le dernier email propose une promo -50 %.' },
  { category: 'Vente', name: 'Dogfood-outreach hebdomadaire', cadence: 'Lundi 14h', detail: 'Volia génère 50 prospects ICP-fit via son propre module Prospection (12 ICPs en rotation sur la France).' },
  { category: 'Vente', name: 'Chat pré-vente sur landing', cadence: 'Real-time', detail: 'Claude répond aux questions tarif/features/RGPD avec garde-fous stricts (pas de promesses roadmap, pas de discount inventé).' },
  { category: 'Support', name: 'Classification feedback contact@', cadence: 'Webhook', detail: 'Claude classe chaque email (bug, feature, question, sales, spam) avec priorité + résumé.' },
  { category: 'Support', name: 'Auto-réponse FAQ haute confiance', cadence: 'Daily 12h', detail: 'Pour les questions classifiées avec confiance ≥85 % sur un topic safe, Claude envoie la réponse au client (copie founder).' },
  { category: 'Support', name: 'Chat support in-app authentifié', cadence: 'Real-time', detail: 'Aide à l\'usage des modules avec context utilisateur pré-chargé (plan, trial, lead_score).' },
  { category: 'Code', name: 'Détection bugs Sentry → GitHub', cadence: 'Lundi 11h', detail: 'Récupère les top erreurs prod, Claude les analyse et crée une issue GitHub avec stack trace + suggestion de fix.' },
  { category: 'Code', name: 'Auto-fix bugs via PR Claude', cadence: 'Vendredi 11h', detail: 'Pour chaque issue volia-autonomy, Claude lit le code source, propose un patch ≤30 lignes, crée une branche + commit + Pull Request en mode draft. Founder review et merge.' },
  { category: 'Méta', name: 'Méta-autonomie + recommandations', cadence: 'Daily 2h + Mardi 10h', detail: 'Agrège chaque nuit les métriques de toutes les boucles. Chaque mardi, envoie un email avec ROI détaillé + 3 recommandations Claude pour optimiser/créer/supprimer des boucles.' },
];
