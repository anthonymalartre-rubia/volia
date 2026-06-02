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
//   « Volia Autopilot, le pipeline B2B automatisé de bout en bout
//   (cible → email personnalisé par IA → formulaire de qualification →
//   scoring → CRM). L'humain choisit la cible, l'IA exécute la chaîne,
//   sous supervision. » Suite SaaS française supervisée par Anthony
//   Malartre (responsable produit + sales + service client).
// ─────────────────────────────────────────────────────────────────────

// ─── BOILERPLATE — 3 longueurs prêtes à copier pour les journalistes ──
export const BOILERPLATE = {
  short:
    "Volia Autopilot est le pipeline B2B automatisé de bout en bout (cible → email personnalisé par IA → formulaire de qualification → scoring → CRM) : l'humain choisit la cible, l'IA exécute la chaîne, sous supervision.",

  medium:
    "Volia met en avant Volia Autopilot, le pipeline B2B automatisé de bout en bout : l'utilisateur choisit sa cible, et l'IA exécute la chaîne — scrap des entreprises, email personnalisé par IA, formulaire de qualification, scoring, puis push du lead chaud dans le CRM, sous supervision humaine. Autopilot s'appuie sur quatre modules connectés (Prospection, Campagnes, CRM, Formulaires) en un seul abonnement. Gamme : Starter gratuit · Solo 19 €/mois · Pro 49 €/mois (Autopilot 1 workflow) · Business · Enterprise 499 €/mois (Autopilot illimité + A/B testing + optimisation Claude) — le flagship Autopilot démarre à 49 €/mois. Suite SaaS française conforme RGPD et hébergée en Union européenne, supervisée par son founder Anthony Malartre : l'humain valide, l'IA exécute.",

  long:
    "Volia (volia.fr) met en avant son produit phare, Volia Autopilot, le pipeline B2B automatisé de bout en bout (cible → email personnalisé par IA → formulaire de qualification → scoring → push CRM) : l'utilisateur sélectionne sa cible, Volia exécute la chaîne sous supervision humaine — l'humain choisit la cible, l'IA exécute. Autopilot s'appuie sur quatre modules connectés : Prospection (des centaines de milliers d'entreprises françaises accessibles via Google Places sur 101 départements, enrichissement waterfall multi-sources), Campagnes (séquences email/SMS automatisées), CRM (pipeline commercial natif) et Formulaires (capture de leads). La gamme tarifaire couvre tous les besoins : Starter gratuit · Solo 19 €/mois · Pro 49 €/mois (Autopilot 1 workflow) · Business · Enterprise 499 €/mois (Autopilot illimité + A/B testing + optimisation Claude) ; le flagship Autopilot démarre à 49 €/mois. En production, 16 boucles d'agents IA orchestrent les opérations 24/7 : rédaction de posts LinkedIn, articles SEO hebdomadaires, newsletter mensuelle, séquence de réactivation des clients perdus, relance personnalisée des trials, prospection sortante auto-générée (Volia utilise Volia pour vendre Volia), détection d'erreurs prod et création de pull requests de correction par Claude, classification des emails entrants et réponses FAQ automatiques, chat pré-vente et support in-app. Une boucle de méta-autonomie analyse chaque semaine le ROI de toutes les autres et propose de nouvelles automatisations à créer. Plus de 400 commits publics documentent le fonctionnement. Hébergée en Union européenne (Supabase Frankfurt) et conforme RGPD par conception, Volia couvre 8 pays européens (France, Belgique, Suisse, Luxembourg, Allemagne, Royaume-Uni, Espagne, Italie). Anthony Malartre reste responsable produit, sales et service client — l'humain valide, l'IA exécute.",
};

// ─── KEY_NUMBERS — chiffres clés (cards page presse) ──────────────────
// Chaque card doit avoir : value (string courte), label, sub (contexte),
// gradient (Tailwind) et iconName (mappé côté UI vers Lucide).
export const KEY_NUMBERS = [
  {
    value: 'Autopilot',
    label: 'pipeline B2B automatisé de bout en bout',
    sub: 'cible → email IA → qualification → scoring → CRM',
    gradient: 'from-violet-500 to-fuchsia-600',
    iconName: 'Zap',
  },
  {
    value: '23',
    label: 'templates de pipeline Autopilot',
    sub: 'prêts à l\'emploi : cible → email → qualification → CRM',
    gradient: 'from-violet-500 to-fuchsia-600',
    iconName: 'Zap',
  },
  {
    value: '5',
    label: 'plans tarifaires',
    sub: 'Starter gratuit → Enterprise 499 €/mois',
    gradient: 'from-rose-500 to-pink-600',
    iconName: 'Wallet',
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
    sub: 'opérations supervisées par l\'humain, exécutées par l\'IA',
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
    value: '∞',
    label: 'entreprises françaises accessibles',
    sub: 'des centaines de milliers via Google Places + enrichissement waterfall',
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
    text: "Volia Autopilot remplace une stack Apollo + Lemlist + HubSpot par un seul pipeline : l'humain choisit la cible, l'IA exécute toute la chaîne jusqu'au lead chaud livré dans le CRM.",
    context: "Sur le positionnement produit de Volia Autopilot",
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
    slug: 'volia-autopilot-pipeline-b2b-automatise',
    title: "Volia Autopilot : de la cible au lead chaud, en un seul setup",
    audience: 'Presse business & growth B2B (Maddyness, FrenchWeb, BFM Tech, Welcome to the Jungle)',
    pitch:
      "Le 1er pipeline B2B français qui va de la cible au lead chaud livré dans le CRM, en un seul setup. L'utilisateur sélectionne sa cible et un template (23 disponibles), et Volia Autopilot exécute toute la chaîne sous supervision humaine — scrap des entreprises, email personnalisé par IA, formulaire de qualification, scoring, puis push du lead chaud dans le CRM. Produit phare de la suite Volia, il remplace une stack Apollo + Lemlist + HubSpot. Gamme : Starter gratuit · Solo 19 € · Pro 49 € (Autopilot 1 workflow) · Business · Enterprise 499 € (Autopilot illimité + A/B testing + optimisation Claude) — le flagship Autopilot démarre à 49 €/mois.",
    releaseUrl: '/presse/cp/volia-autopilot-pipeline-b2b-automatise',
    iconName: 'Zap',
    gradient: 'from-violet-500 to-fuchsia-600',
  },
  {
    slug: 'entreprise-autonome-nouveau-genre',
    title: "L'entreprise autonome d'un nouveau genre",
    audience: 'Presse vision & futur du travail (Forbes FR, Les Echos, Maddyness)',
    pitch:
      "Et si l'entreprise du XXIe siècle ne ressemblait plus à une équipe, mais à un founder augmenté par des agents IA ? Volia incarne cette nouvelle catégorie : l'humain supervise et valide, les agents IA exécutent. Sans salarié supplémentaire, sans levée de fonds, la suite SaaS B2B fonctionne aujourd'hui en production avec 16 boucles d'agents IA orchestrées 24/7.",
    releaseUrl: '/presse/cp-entreprise-autonome.pdf',
    iconName: 'Sparkles',
    gradient: 'from-violet-500 to-indigo-600',
  },
  {
    slug: 'alternative-francaise-stack-us',
    title: "L'alternative française à la stack US",
    audience: 'Presse business & souveraineté (Les Echos, BFM Tech, La Tribune)',
    pitch:
      "Apollo, HubSpot, Lemlist, Typeform : la stack growth des PME françaises est 100 % américaine, facturée en dollars, hébergée hors UE. Volia propose en 2026 la première alternative souveraine complète : Volia Autopilot au-dessus de 4 modules connectés, hébergement Frankfurt, RGPD natif, support FR. Gamme : Starter gratuit · Solo 19 € · Pro 49 € (Autopilot 1 workflow) · Business · Enterprise 499 € (Autopilot illimité + A/B testing + optimisation Claude).",
    releaseUrl: '/presse/cp-alternative-francaise.pdf',
    iconName: 'Flag',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    slug: 'premiere-mondiale-ia-agentique-production',
    title: "Première mondiale : l'IA agentique en production",
    audience: 'Presse IA spécialisée (ActuIA, Usine Digitale, Siècle Digital)',
    pitch:
      "Volia est le premier SaaS B2B européen documenté entièrement co-construit par IA agentique et opéré en production par 16 boucles d'agents IA : 400+ commits publics, génération de contenu, code source, prospection, support client, le tout orchestré 24/7 — l'humain valide, l'IA exécute. Un cas d'école mondial du paradigme \"AI-native company\" sur une stack moderne (Next.js 14, Supabase, Vercel, Anthropic), supervisé par son founder.",
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
    releaseUrl: '/presse/cp/meta-autonomie-ia-qui-soptimise',
    iconName: 'Brain',
    gradient: 'from-amber-500 to-rose-600',
  },
  {
    slug: 'volia-vend-supporte-code-soi-meme',
    title: "Volia se vend, se code et se support — tout seul",
    audience: 'Presse business & tech (Maddyness, Les Echos Tech, FrenchWeb, BFM Tech)',
    pitch:
      "Trois preuves concrètes de l'entreprise autonome en juin 2026 : (1) Volia utilise son propre module Prospection chaque semaine pour générer 50 prospects ICP-fit puis les contacter via son module Campagnes — un cas unique de SaaS qui vend grâce à lui-même. (2) Quand Sentry détecte une erreur en prod, Claude lit le code source, comprend la cause, et ouvre une pull request de correction sur GitHub que le founder n'a qu'à valider. (3) Pour les emails clients classifiés comme questions FAQ avec confiance >85 %, Claude envoie directement une réponse signée au nom d'Anthony, avec copie au founder. Trois boucles, un seul mot d'ordre : l'humain valide, l'IA exécute.",
    releaseUrl: '/presse/cp/volia-vend-supporte-code-soi-meme',
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
// Note : les CPs avec slug correspondant à PRESS_RELEASES_FULL ont une
// page HTML dédiée /presse/cp/[slug] (print-friendly).
export const PRESS_RELEASES = [
  {
    date: '2026-06-06',
    dateLabel: '6 juin 2026',
    title: "Volia se vend, se code et se support — tout seul : trois boucles d'agents IA réinventent l'opérationnel B2B",
    slug: 'volia-vend-supporte-code-soi-meme',
    summary:
      "Volia livre trois preuves concrètes du modèle \"founder augmenté\" : dogfood-outreach hebdo (Volia utilise Volia pour vendre Volia), auto-fix bugs via PR Claude (Sentry détecte, Claude corrige), et auto-réponse FAQ haute confiance (≥0,85). Trois boucles, un mot d'ordre : l'humain valide, l'IA exécute.",
    pdfUrl: '/presse/cp/volia-vend-supporte-code-soi-meme',
  },
  {
    date: '2026-06-06',
    dateLabel: '6 juin 2026',
    title: "Volia franchit un nouveau cap : la première SaaS française dont les agents IA analysent leur propre ROI",
    slug: 'meta-autonomie-ia-qui-soptimise',
    summary:
      "Mise en production d'une couche de méta-autonomie inédite. Les 16 boucles d'agents IA mesurent désormais leur propre performance, calculent un ROI par action, et soumettent chaque mardi à Anthony Malartre 3 recommandations Claude pour optimiser la suite des opérations.",
    pdfUrl: '/presse/cp/meta-autonomie-ia-qui-soptimise',
  },
  {
    date: '2026-06-02',
    dateLabel: '2 juin 2026',
    title:
      "Volia lance Autopilot : le pipeline B2B qui va de la cible au lead chaud, en un seul setup",
    slug: 'volia-autopilot-pipeline-b2b-automatise',
    summary:
      "Volia lance son produit phare, Volia Autopilot : un pipeline B2B automatisé de bout en bout (scrap → email IA → formulaire de qualification → scoring → CRM). L'humain choisit la cible, l'IA exécute la chaîne. 23 templates, RGPD et hébergement européen, gamme de Starter gratuit à Enterprise 499 €/mois. Autopilot remplace une stack Apollo + Lemlist + HubSpot.",
    pdfUrl: '/presse/cp/volia-autopilot-pipeline-b2b-automatise',
  },
  {
    date: '2026-06-01',
    dateLabel: '1er juin 2026',
    title:
      "Volia lance une nouvelle catégorie d'entreprise SaaS B2B pilotée par IA",
    slug: 'lancement-entreprise-autonome',
    summary:
      "Volia officialise le lancement d'une nouvelle catégorie d'entreprise : une suite SaaS B2B complète (Prospection, Campagnes, CRM, Formulaires) supervisée par son founder à Marseille — l'humain valide, les agents IA exécutent. Pas d'équipe, pas de levée, pas d'investisseurs.",
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
  phone: null, // numéro presse non communiqué publiquement (ne pas afficher)
  responseTime: '< 24h',
  founderEmail: 'anthony.malartre@suraya.fr',
  city: 'Marseille',
  linkedin: null, // TODO: vérifier URL avant exposition publique
  twitter: null, // TODO: vérifier handle avant exposition publique
  github: 'https://github.com/anthonymalartre-rubia/volia',
};

// ─── FOUNDER_BIO — 3 versions ─────────────────────────────────────────
export const FOUNDER_BIO = {
  short:
    "Anthony Malartre, founder de Volia, suite SaaS B2B française dont le produit phare Volia Autopilot automatise le pipeline B2B de bout en bout, sous supervision humaine.",

  medium:
    "Anthony Malartre est le founder de Volia (volia.fr), suite SaaS B2B française dont le produit phare est Volia Autopilot, le pipeline B2B automatisé de bout en bout (cible → email personnalisé par IA → qualification → scoring → CRM). Basé à Marseille, ex-fondateur de plusieurs projets B2B, il a bâti Volia avec Claude, l'IA agentique d'Anthropic : 4 modules connectés, 400+ commits publics, 16 boucles d'agents IA en production qui orchestrent marketing, code, vente et support 24/7. Une couche de méta-autonomie analyse chaque semaine le ROI de toutes les boucles et propose les prochaines automatisations à créer. Sa philosophie : l'humain valide, l'IA exécute.",

  long:
    "Anthony Malartre est le founder de Volia (volia.fr), basé à Marseille. Après plusieurs années à fonder des projets B2B SaaS dans des structures plus traditionnelles, il décide en 2026 de tester une hypothèse : et si l'entreprise du XXIe siècle n'était plus une équipe, mais un founder augmenté par des agents IA, sous supervision permanente ? Volia est la réponse. Sans co-fondateur, sans levée de fonds, sans salarié supplémentaire, il livre Volia Autopilot — le pipeline B2B automatisé de bout en bout (cible → email personnalisé par IA → qualification → scoring → CRM) — au-dessus de 4 modules connectés (Prospection, Campagnes, CRM, Formulaires), conformes RGPD, hébergés en Union européenne. La gamme va de Starter gratuit à Enterprise 499 €/mois (Autopilot illimité + A/B testing + optimisation Claude), le flagship Autopilot démarrant à 49 €/mois. Le développement entier est documenté publiquement : 400+ commits Git, ADR, CONTEXT.md évolutif. En production, 16 boucles d'agents IA orchestrent 24/7 : rédaction LinkedIn, articles SEO hebdomadaires, newsletter mensuelle générée puis envoyée, séquences de réactivation client (J+30/60/90), relance personnalisée des trials selon un score de lead recalculé chaque nuit, prospection sortante auto-générée (Volia utilise Volia pour vendre Volia), détection d'erreurs prod et création de pull requests de correction par Claude, classification des emails entrants et auto-réponse FAQ pour les questions à confiance élevée, deux chatbots IA (pré-vente sur landing, support sur dashboard). Une couche de méta-autonomie agrège chaque nuit les métriques de toutes les boucles, calcule le ROI estimé par action, et envoie chaque mardi un email avec un dashboard détaillé et 3 recommandations Claude pour la semaine suivante. Anthony reste personnellement responsable du produit, du sales et du service client : l'humain valide, l'IA exécute. Sa vision : la souveraineté SaaS européenne passera par des entreprises bootstrap, lisibles, exigeantes — et par une nouvelle catégorie d'entrepreneurs : les founders augmentés.",
};

// ─── PRESS_RELEASE_FULL — contenu complet des communiqués de presse ──
// Source unique pour la route /presse/cp/[slug] (HTML print-friendly).
// Chaque CP est rendu en HTML structuré (style sobre, optimisé pour
// impression / sauvegarde PDF via navigateur). Pas de génération
// binaire — l'HTML est canonique, indexable, simple à maintenir.
export const PRESS_RELEASES_FULL = {
  'volia-autopilot-pipeline-b2b-automatise': {
    slug: 'volia-autopilot-pipeline-b2b-automatise',
    date: '2026-06-02',
    dateLabel: '2 juin 2026',
    location: 'Marseille',
    eyebrow: 'COMMUNIQUÉ DE PRESSE',
    title: "Volia lance Autopilot : le pipeline B2B qui va de la cible au lead chaud, en un seul setup",
    lead: "Volia (volia.fr), suite SaaS française pour la croissance B2B, lance Volia Autopilot, son produit phare : un pipeline B2B automatisé de bout en bout qui mène de la cible au lead chaud livré dans le CRM. L'utilisateur choisit sa cible et un template, et l'IA exécute toute la chaîne — sous supervision humaine. Autopilot remplace une stack fragmentée Apollo + Lemlist + HubSpot par un seul abonnement.",
    sections: [
      {
        heading: "Le problème : une stack growth fragmentée",
        paragraphs: [
          "Pour décrocher des rendez-vous B2B, les PME françaises empilent aujourd'hui des outils américains qui ne se parlent pas : un outil de scraping et d'enrichissement (type Apollo), un outil de cold email (type Lemlist), un outil de formulaires (type Typeform) et un CRM (type HubSpot). Quatre abonnements, quatre interfaces, quatre exports CSV à recoller à la main — et autant de points de rupture entre la cible identifiée et le lead réellement exploitable.",
          "Cette fragmentation coûte du temps, de l'argent et des leads perdus en route. Elle suppose aussi de maîtriser quatre outils distincts, là où l'enjeu réel est simple : transformer une cible en rendez-vous qualifié.",
        ],
      },
      {
        heading: "La solution : un pipeline automatisé de bout en bout",
        paragraphs: [
          "Volia Autopilot unifie toute cette chaîne en un seul pipeline. L'utilisateur sélectionne sa cible (secteur, zone géographique sur 101 départements) et un template parmi 23 disponibles. Volia exécute ensuite l'enchaînement complet : scrap des entreprises via Google Places, enrichissement waterfall multi-sources, rédaction d'un email personnalisé par IA, formulaire de qualification, scoring du lead, puis push automatique du lead chaud dans le CRM natif.",
          "Le principe est constant : l'humain choisit la cible et valide, l'IA exécute la chaîne. Les actions à risque restent soumises à supervision et à des garde-fous explicites. Autopilot s'appuie sur les quatre modules connectés de la suite Volia — Prospection, Campagnes, CRM et Formulaires — réunis en un seul abonnement.",
        ],
      },
      {
        heading: "RGPD et hébergement européen par conception",
        paragraphs: [
          "Volia est une suite SaaS française, conforme RGPD par conception et hébergée en Union européenne (Supabase, Frankfurt). Les données des prospects et des clients restent traitées dans l'espace européen, avec un filtrage natif des emails personnels et une page d'opt-out publique.",
          "Volia couvre 8 pays européens (France, Belgique, Suisse, Luxembourg, Allemagne, Royaume-Uni, Espagne, Italie) et 101 départements français, donnant accès à des centaines de milliers d'entreprises.",
        ],
      },
      {
        heading: "Une gamme tarifaire complète",
        paragraphs: [
          "Volia se décline en cinq plans : Starter gratuit, Solo à 19 €/mois, Pro à 49 €/mois (incluant Autopilot avec 1 workflow), Business, et Enterprise à 499 €/mois (Autopilot illimité, A/B testing et optimisation par Claude). Le flagship Autopilot démarre donc à 49 €/mois.",
          "Là où une stack équivalente cumule plusieurs abonnements facturés en dollars et hébergés hors UE, Volia propose une alternative souveraine unifiée, facturée en euros, avec un support en français.",
        ],
      },
    ],
    quote: {
      text: "Volia Autopilot remplace une stack Apollo + Lemlist + HubSpot par un seul pipeline. L'humain choisit la cible, l'IA exécute toute la chaîne jusqu'au lead chaud livré dans le CRM. C'est le premier pipeline B2B français qui va de la cible au lead chaud, en un seul setup.",
      author: 'Anthony Malartre',
      authorRole: 'Fondateur de Volia',
    },
    boilerplate: BOILERPLATE.medium,
  },

  'meta-autonomie-ia-qui-soptimise': {
    slug: 'meta-autonomie-ia-qui-soptimise',
    date: '2026-06-06',
    dateLabel: '6 juin 2026',
    location: 'Marseille',
    eyebrow: 'COMMUNIQUÉ DE PRESSE',
    title: "Volia franchit un nouveau cap : la première SaaS française dont les agents IA analysent leur propre ROI et proposent les prochaines automatisations",
    lead: "Volia (volia.fr), suite SaaS française B2B (prospection, cold email, CRM, formulaires), annonce la mise en production d'une couche de méta-autonomie inédite : ses 16 boucles d'agents IA mesurent désormais leur propre performance, calculent un retour sur investissement par action, et soumettent chaque semaine à leur founder Anthony Malartre des recommandations concrètes d'optimisation.",
    sections: [
      {
        heading: "Au-delà de l'autonomie d'exécution",
        paragraphs: [
          "Depuis son lancement en mai 2026, Volia faisait déjà tourner 16 boucles d'agents IA en production 24 heures sur 24 : rédaction de posts LinkedIn, articles SEO hebdomadaires, newsletter mensuelle, séquences de réactivation client, prospection sortante auto-générée, détection d'erreurs en production avec création de pull requests de correction, classification des emails entrants avec réponses FAQ automatiques, deux chatbots IA (pré-vente et support). Une exécution déjà sans précédent pour une entreprise française.",
          "Ce qui change le 6 juin 2026 : ces agents ne se contentent plus d'exécuter — ils mesurent. Chaque action autonome est journalisée avec un coût estimé (en euros) et une valeur estimée (proxy MRR). Chaque nuit à 2 heures du matin, une boucle d'agrégation calcule pour chaque type d'action le taux de succès, le coût cumulé, la valeur générée et le retour sur investissement. Le tout est consultable en temps réel dans un dashboard interne dédié.",
        ],
      },
      {
        heading: "Trois recommandations Claude chaque mardi",
        paragraphs: [
          "Chaque mardi à 10 heures, une seconde boucle, dite de méta-autonomie, compile les métriques des sept derniers jours et les soumet à Claude, l'IA agentique d'Anthropic. Le modèle analyse les patterns (boucles à ROI négatif, boucles redondantes, boucles à fort potentiel inexploité) et propose à Anthony Malartre trois recommandations actionnables, classées en quatre catégories : NOUVELLE BOUCLE à créer, OPTIMISATION à apporter, SUPPRESSION d'une automatisation peu rentable, ou FUSION de deux boucles redondantes.",
          "Le tout arrive sous la forme d'un email structuré, avec pour chaque recommandation : un rationnel basé sur les chiffres, une estimation d'effort en heures de développement, et une valeur attendue mensuelle. Anthony peut ensuite accepter, rejeter ou marquer comme livrée chaque recommandation dans une interface dédiée, créant une boucle d'amélioration continue mesurable.",
        ],
      },
      {
        heading: "Un cas d'école pour la presse IA",
        paragraphs: [
          "À notre connaissance, aucun SaaS B2B européen ne documente publiquement une telle architecture en production. La couche méta-autonomie de Volia est un cas d'usage avancé du paradigme \"AI-native company\" : les IA ne sont plus seulement des exécutants supervisés, elles deviennent force de proposition stratégique — le founder reste seul décideur.",
          "L'ensemble du code source est public sur GitHub (anthonymalartre-rubia/volia), plus de 400 commits documentent le développement.",
        ],
      },
    ],
    quote: {
      text: "Le truc le plus dingue ce n'est pas que les agents IA bossent pour moi. C'est qu'ils me proposent eux-mêmes quoi automatiser ensuite. Chaque mardi je reçois un email avec le ROI précis de mes 16 boucles et trois recommandations. Aucune équipe humaine ne pourrait produire ça aussi vite, à ce niveau de détail, sans biais cognitif.",
      author: 'Anthony Malartre',
      authorRole: 'Fondateur de Volia',
    },
    boilerplate: BOILERPLATE.medium,
  },

  'volia-vend-supporte-code-soi-meme': {
    slug: 'volia-vend-supporte-code-soi-meme',
    date: '2026-06-06',
    dateLabel: '6 juin 2026',
    location: 'Marseille',
    eyebrow: 'COMMUNIQUÉ DE PRESSE',
    title: "Volia se vend, se code et se support — tout seul : trois boucles d'agents IA qui réinventent l'opérationnel B2B",
    lead: "Volia (volia.fr), suite SaaS française pour la croissance B2B, livre trois preuves concrètes du modèle de \"founder augmenté\" en juin 2026. Pour la vente, le code et le support client, trois boucles d'agents IA distinctes assurent l'exécution opérationnelle — chacune sous garde-fou explicite et validation humaine pour les actions à risque.",
    sections: [
      {
        heading: "1. Volia utilise Volia pour vendre Volia",
        paragraphs: [
          "Chaque lundi à 14 heures, une boucle baptisée dogfood-outreach pioche une combinaison ICP × département parmi 12 rotations déterministes (agences marketing à Marseille, agences web à Nantes, cabinets conseil à Lille, etc.). Elle interroge l'API Google Places via le propre module Prospection de Volia, déduplique contre l'historique de campagnes passées, et constitue une liste de 50 prospects qualifiés.",
          "La liste est livrée directement dans le module Campagnes de Volia, prête à être enrichie et activée par Anthony Malartre. \"C'est mon meilleur démo,\" explique le fondateur. \"Volia utilise Volia pour vendre Volia. Aucun autre outil de prospection français ne peut se permettre cette démonstration.\"",
        ],
      },
      {
        heading: "2. Volia se code — Sentry détecte, Claude corrige",
        paragraphs: [
          "Chaque lundi à 11 heures, une première boucle interroge Sentry pour récupérer les erreurs survenues en production au cours de la semaine. Claude analyse chaque erreur, identifie les fichiers impactés via le stack trace, et crée une issue GitHub structurée avec rationale et suggestion de fix.",
          "Quatre jours plus tard, le vendredi à 11 heures, une seconde boucle reprend ces issues. Pour chacune, Claude lit le code source du fichier mentionné (avec garde-fous : maximum 500 lignes, fichier non critique, pas de modification sur les fichiers d'autonomie ou de paiement), propose un patch d'au plus 30 lignes, crée une branche, commit le correctif et ouvre une Pull Request en mode draft sur GitHub.",
          "Anthony n'a plus qu'à relire le diff et merger. \"Quand Sentry détecte un bug en prod, Claude lit le stack trace, comprend le code, et m'ouvre la pull request. Je n'ai qu'à valider. C'est la fin du backlog,\" résume le fondateur. La PR reste en mode draft jusqu'à validation humaine — aucun code n'est mergé automatiquement.",
        ],
      },
      {
        heading: "3. Volia se support — auto-FAQ haute confiance",
        paragraphs: [
          "Chaque jour à 12 heures, une boucle examine les emails reçus sur contact@volia.fr déjà classés comme \"question\" par un classifieur Claude. Pour chaque email, une seconde invocation de Claude évalue si une réponse automatique est possible et calcule un score de confiance de 0 à 1.",
          "Si la confiance dépasse 0,85 et que le sujet est sûr (pas de demande de remboursement, pas de question juridique, pas de bug technique grave), Claude rédige et envoie directement la réponse au client signée \"Anthony — Fondateur Volia\", avec copie systématique au founder pour visibilité. Tous les autres cas restent traités manuellement par Anthony.",
          "Le disclaimer en bas de chaque email auto-répondu est explicite : \"Cette réponse a été pré-rédigée par l'assistant IA Volia, relue par l'équipe. Si elle ne répond pas à ta question, réponds simplement à ce mail.\"",
        ],
      },
      {
        heading: "Trois boucles, un seul principe",
        paragraphs: [
          "Le mot d'ordre est constant : l'humain valide, l'IA exécute. Toutes les actions à risque (publication de code, envoi d'email client, post public) passent par une validation manuelle ou un garde-fou strict (quotas, threshold de confiance, mode draft GitHub). Le founder reste responsable du produit, des ventes et du service client.",
          "L'ensemble du code source et des boucles est documenté publiquement. Plus de 400 commits Git tracent le développement de la suite.",
        ],
      },
    ],
    quote: {
      text: "Volia utilise Volia pour vendre Volia. Sentry détecte un bug en prod, Claude m'ouvre la pull request. Un client pose une question simple, l'IA y répond avec mon nom. Trois boucles, un même principe : l'humain valide, l'IA exécute. C'est ça, le founder augmenté.",
      author: 'Anthony Malartre',
      authorRole: 'Fondateur de Volia',
    },
    boilerplate: BOILERPLATE.medium,
  },
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
