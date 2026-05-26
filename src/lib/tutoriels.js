// Catalogue des tutoriels vidéo Volia.
//
// Chaque tutoriel est une vidéo Loom courte (2-5 min) qui couvre un parcours
// produit clé : signup, première recherche, première campagne, CRM, DNS.
// Objectif : permettre à un nouvel utilisateur de devenir autonome sur
// l'ensemble des modules Volia en moins de 20 minutes cumulées.
//
// ⚠️ Loom embed URLs sont des placeholders.
// Anthony doit enregistrer les 5 vidéos et remplacer les URLs ici.
// Format Loom embed : https://www.loom.com/embed/VIDEO_ID
//
// Chaque entrée porte :
//   - id              : slug unique (utilisé pour l'ancre #id sur /tutoriels)
//   - title           : titre H2 affiché sur la card et dans la modale
//   - description     : phrase courte qui décrit le contenu de la vidéo
//   - duration        : durée mm:ss (utilisé pour le total et le badge)
//   - category        : libellé de catégorie (badge color-coded)
//   - icon            : nom d'icône lucide-react (résolu côté UI)
//   - color           : violet | blue | emerald | amber (cohérent avec la palette)
//   - loomEmbedUrl    : URL d'embed Loom (placeholder à remplacer)
//   - thumbnail       : chemin optionnel — fallback gradient + icon si absent
//   - relatedDocs     : liens vers les docs écrites associées

export const TUTORIELS = [
  {
    id: 'getting-started',
    title: 'Démarrer avec Volia en 3 minutes',
    description: "Tour rapide de l'interface Volia : signup, onboarding, 1ère recherche.",
    duration: '3:12',
    category: 'Premiers pas',
    icon: 'Rocket',
    color: 'violet',
    loomEmbedUrl: 'https://www.loom.com/embed/PLACEHOLDER_GETTING_STARTED',
    thumbnail: '/tutoriels/getting-started.jpg',
    relatedDocs: ['/docs/creer-compte', '/docs/onboarding-wizard'],
  },
  {
    id: 'first-search',
    title: 'Trouver 100 prospects qualifiés en 30 secondes',
    description: "Lancer une recherche Google Places + cascade waterfall d'enrichissement.",
    duration: '2:45',
    category: 'Prospection',
    icon: 'Search',
    color: 'violet',
    loomEmbedUrl: 'https://www.loom.com/embed/PLACEHOLDER_FIRST_SEARCH',
    thumbnail: '/tutoriels/first-search.jpg',
    relatedDocs: ['/docs/lancer-recherche-google-places', '/docs/cascade-waterfall'],
  },
  {
    id: 'first-campaign',
    title: 'Lancer sa première campagne email en 4 minutes',
    description: "Connecter son domaine, importer une liste, créer une campagne avec template, planifier l'envoi.",
    duration: '4:18',
    category: 'Campagnes Email',
    icon: 'Mail',
    color: 'blue',
    loomEmbedUrl: 'https://www.loom.com/embed/PLACEHOLDER_FIRST_CAMPAIGN',
    thumbnail: '/tutoriels/first-campaign.jpg',
    relatedDocs: ['/docs/connecter-domaine-envoi', '/docs/creer-premiere-campagne'],
  },
  {
    id: 'crm-kanban',
    title: 'Utiliser le CRM Volia (Kanban + deals + activities)',
    description: 'Naviguer dans le Kanban, créer un deal, drag-drop pour avancer le pipeline, logger des activities.',
    duration: '3:50',
    category: 'CRM',
    icon: 'KanbanSquare',
    color: 'emerald',
    loomEmbedUrl: 'https://www.loom.com/embed/PLACEHOLDER_CRM_KANBAN',
    thumbnail: '/tutoriels/crm-kanban.jpg',
    relatedDocs: ['/docs/pipeline-kanban-drag-drop', '/docs/creer-deal'],
  },
  {
    id: 'sender-domain-setup',
    title: "Configurer son domaine d'envoi (DKIM, SPF, DMARC)",
    description: 'Ajouter son domaine personnalisé, configurer les DNS records pour une délivrabilité maximale.',
    duration: '5:22',
    category: 'Délivrabilité',
    icon: 'Globe',
    color: 'amber',
    loomEmbedUrl: 'https://www.loom.com/embed/PLACEHOLDER_DNS_SETUP',
    thumbnail: '/tutoriels/sender-domain-setup.jpg',
    relatedDocs: ['/docs/configurer-dns-spf-dkim'],
  },
];

/**
 * Renvoie la durée totale cumulée du parcours sous la forme « 19 min »
 * (arrondi à la minute inférieure — on cible le « moins de 20 min » du hero).
 */
export function getTotalDurationMinutes() {
  const totalSeconds = TUTORIELS.reduce((sum, t) => {
    const [m, s] = String(t.duration).split(':').map(Number);
    return sum + (m || 0) * 60 + (s || 0);
  }, 0);
  return Math.floor(totalSeconds / 60);
}

/**
 * Renvoie un tutoriel par son id, ou null si introuvable.
 */
export function getTutorielById(id) {
  return TUTORIELS.find((t) => t.id === id) || null;
}

/**
 * Renvoie le tutoriel suivant dans l'ordre du catalogue (pour le bouton
 * « Vidéo suivante → » dans la modale). Wrap au premier si on est à la fin.
 */
export function getNextTutoriel(id) {
  const idx = TUTORIELS.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  return TUTORIELS[(idx + 1) % TUTORIELS.length];
}

// Palette des couleurs autorisées pour les badges/cards.
// Mapping vers les classes Tailwind safelistées (gradient thumbnail + badge).
export const COLOR_CLASSES = {
  violet: {
    badge: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
    iconBg: 'bg-violet-500/20 text-violet-300',
    gradient: 'from-violet-500/40 via-violet-500/10 to-indigo-500/30',
  },
  blue: {
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    iconBg: 'bg-blue-500/20 text-blue-300',
    gradient: 'from-blue-500/40 via-blue-500/10 to-cyan-500/30',
  },
  emerald: {
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    iconBg: 'bg-emerald-500/20 text-emerald-300',
    gradient: 'from-emerald-500/40 via-emerald-500/10 to-teal-500/30',
  },
  amber: {
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    iconBg: 'bg-amber-500/20 text-amber-300',
    gradient: 'from-amber-500/40 via-amber-500/10 to-orange-500/30',
  },
};
