// Changelog public — chaque entrée = 1 release notable.
// Format conventions :
//   type : 'feature' | 'improvement' | 'fix' | 'security'
//   tag (optional) : badge couleur (ex 'SEO', 'Conversion', 'Tech')

const CHANGELOG = [
  {
    date: '2026-06-10',
    version: '5.0',
    title: 'Volia Project — vos deals gagnés deviennent des projets livrés',
    items: [
      { type: 'feature', tag: 'Nouveau module', text: 'Volia Project (Business) : gestion de projets de livraison. Kanban 3 colonnes, ajout de tâche en tapant Entrée, jalons ⭐, vue liste.' },
      { type: 'feature', tag: 'CRM', text: 'Pont CRM : un deal gagné devient un projet de livraison en 1 clic (ou automatiquement, en option). Contact client et tâches d\'onboarding pré-remplis.' },
      { type: 'feature', tag: 'Client', text: 'Suivi client par lien public — sans compte : progression, étapes clés, livrables téléchargeables. Révocable à tout moment.' },
      { type: 'feature', tag: 'Templates', text: '5 modèles prêts à l\'emploi : onboarding client, installation/chantier, mission de conseil, lancement, projet libre.' },
      { type: 'improvement', tag: 'Notifications', text: 'Digest quotidien des tâches de projet en retard ou dues aujourd\'hui.' },
      { type: 'fix', tag: 'SEO', text: 'Images de partage social (OpenGraph) des pages /prospection et /vs : elles étaient vides depuis leur création. Corrigé.' },
    ],
  },
  {
    date: '2026-05-22',
    version: '4.2',
    title: 'Programme de parrainage + Newsletter mensuelle',
    items: [
      { type: 'feature', tag: 'Acquisition', text: 'Programme de parrainage : 1 mois gratuit par filleul payant (+1 mois bonus de bienvenue pour le filleul).' },
      { type: 'feature', tag: 'Acquisition', text: 'Newsletter mensuelle automatique : article du mois + chiffre marché + ressource gratuite (envoi le 1er du mois).' },
      { type: 'feature', tag: 'SEO', text: 'Suisse romande : 1 060 nouvelles pages (6 cantons francophones × 150 catégories).' },
      { type: 'feature', tag: 'SEO', text: '6 pages personas /pour/[X] (SDR, fondateurs, agences web, cabinets RH, freelances, sales managers).' },
      { type: 'improvement', tag: 'UX', text: 'Onboarding multi-step persistant cross-device + auto-tracking des actions (search, import, campagne, export).' },
      { type: 'improvement', tag: 'SEO', text: 'hreflang FR-FR / FR-BE / FR-CH sur toutes les pages cat — signal multi-marché à Google.' },
      { type: 'fix', tag: 'SEO', text: 'Pages /pour, /parrainage, /newsletter étaient redirigées vers /login → SEO cassé. Fixé dans middleware.' },
    ],
  },
  {
    date: '2026-05-21',
    version: '4.1',
    title: 'Belgique francophone + Conversion Pack',
    items: [
      { type: 'feature', tag: 'SEO', text: 'Belgique francophone : 1 060 pages (6 provinces wallonnes + Bruxelles).' },
      { type: 'feature', tag: 'Conversion', text: 'Sticky CTA bar + lead magnet capture mid-page + social proof localisé + comparatif inline Apollo/Hunter.' },
      { type: 'feature', tag: 'Trust', text: 'Trust badges (RGPD/Stripe/FR) + bouton démo 8 min Cal.com + footer pro 4 colonnes + 17 liens internes.' },
      { type: 'feature', tag: 'UX', text: 'Sticky TOC scroll-spy + sample preview 5 entreprises floutées + density chart par dept/canton.' },
    ],
  },
  {
    date: '2026-05-20',
    version: '4.0',
    title: 'Enrichissement SEO massif',
    items: [
      { type: 'feature', tag: 'SEO', text: '100 catégories avec data hyper-spécifique (persona, KPIs, saisonnalité, pitch, objections).' },
      { type: 'feature', tag: 'SEO', text: '46 départements enrichis avec champions locaux (LVMH, Michelin, BioMérieux...).' },
      { type: 'feature', tag: 'SEO', text: 'Cross-secteur smart : maillage interne intelligent (resto → boulangerie, traiteur, caviste).' },
      { type: 'improvement', tag: 'SEO', text: 'JSON-LD Offer + AggregateRating sur les 15K pages prog → étoiles dans Google SERP.' },
    ],
  },
  {
    date: '2026-05-15',
    version: '3.5',
    title: 'Prospection email + SMS multi-canal',
    items: [
      { type: 'feature', tag: 'Produit', text: 'Module campagnes email (Resend) : import CSV, templating {{first_name}}, cron envoi batch.' },
      { type: 'feature', tag: 'Produit', text: 'Module campagnes SMS (Twilio) : compteur segments + coût live, footer STOP automatique.' },
      { type: 'feature', tag: 'RGPD', text: 'Opt-out unifié 1-clic (email + SMS) + webhook STOP entrant.' },
    ],
  },
  {
    date: '2026-05-10',
    version: '3.0',
    title: 'Lead magnets + Ressources + API publique',
    items: [
      { type: 'feature', tag: 'Acquisition', text: '8 lead magnets téléchargeables : 20 templates cold email, scripts call, checklists RGPD/warmup, calculateurs ROI/CAC.' },
      { type: 'feature', tag: 'Produit', text: 'API publique Volia (REST + clés API) + docs.' },
      { type: 'feature', tag: 'SEO', text: '91 pages comparatifs /outils/comparatif/[X-vs-Y].' },
    ],
  },
  {
    date: '2026-05-01',
    version: '2.5',
    title: 'Glossaire 62 termes + 14 outils review',
    items: [
      { type: 'feature', tag: 'SEO', text: 'Glossaire passé de 12 à 62 termes sales/marketing.' },
      { type: 'feature', tag: 'SEO', text: '14 pages /outils/[X] (reviews indépendantes des concurrents).' },
    ],
  },
  {
    date: '2026-04-25',
    version: '2.0',
    title: 'Pages régions + sitemap optimisé',
    items: [
      { type: 'feature', tag: 'SEO', text: 'Pages /prospection/[cat]/region/[region] : 2 100 nouvelles URLs.' },
      { type: 'improvement', tag: 'Tech', text: 'Sitemap chunked (5K URLs/chunk) pour éviter limites Bing 10MB.' },
    ],
  },
  {
    date: '2026-04-15',
    version: '1.8',
    title: 'Étude marché 2026 + comparatif outils',
    items: [
      { type: 'feature', tag: 'GEO', text: 'Étude "L\'État de la Prospection B2B France 2026" — page longue + Press kit + Dataset schema.' },
      { type: 'feature', tag: 'SEO', text: 'Page /comparatif-outils-prospection-b2b-france.' },
    ],
  },
  {
    date: '2026-04-01',
    version: '1.5',
    title: 'Stripe 4 plans + Yearly billing',
    items: [
      { type: 'feature', tag: 'Produit', text: 'Refonte tarifs : 4 plans (Starter / Solo 19€ / Pro 49€ / Business 149€) + Yearly -2 mois.' },
      { type: 'feature', tag: 'Tech', text: 'Webhooks Stripe complets : checkout / subscription updated / cancelled / payment failed.' },
    ],
  },
];

export function getAllChangelogEntries() {
  return CHANGELOG;
}

/**
 * Merge static CHANGELOG + DB-published auto entries (Sprint Marketing Phase 1).
 * Async — utilisé par la page /changelog (server component).
 * Tri par date desc + dédup par version (static a priorité si conflit).
 */
export async function getAllChangelogEntriesWithAuto() {
  let dbEntries = [];
  try {
    const { getSupabaseAdmin } = await import('./supabase-admin');
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('auto_changelog_proposals')
      .select('entry_date, version, title, items')
      .eq('status', 'published')
      .order('entry_date', { ascending: false });
    if (Array.isArray(data)) {
      dbEntries = data.map((row) => ({
        date: row.entry_date,
        version: row.version,
        title: row.title,
        items: row.items || [],
      }));
    }
  } catch (err) {
    console.warn('[changelog] DB fetch failed, fallback static only', err.message);
  }

  const seenVersions = new Set(CHANGELOG.map((e) => e.version));
  const filteredDb = dbEntries.filter((e) => !seenVersions.has(e.version));
  const merged = [...CHANGELOG, ...filteredDb];
  merged.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return merged;
}

export { CHANGELOG };
