// ─────────────────────────────────────────────────────────────────────
// /produits/project — landing produit Volia Project (LIVE — Business)
// ─────────────────────────────────────────────────────────────────────
// Accent : orange/amber.
// Positionnement : le chaînon manquant après la vente. Deal gagné →
// projet de livraison en 1 clic, kanban simple, suivi client par lien
// public sans compte. "Trello sans le bazar, branché sur votre CRM."
// ─────────────────────────────────────────────────────────────────────

import ProductPageLayout from '@/components/ProductPageLayout';
import { breadcrumbSchema } from '@/lib/seo-helpers';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/produits/project`;

export const metadata = {
  title: 'Volia Project — Gestion de projets de livraison, gratuite pour tous',
  description:
    'Deal gagné → projet de livraison en 1 clic. Kanban simple, jalons, livrables, et un lien de suivi client sans compte. Trello sans le bazar, branché sur votre CRM. Gratuit pour tous, illimité avec Volia MAX.',
  alternates: { canonical: PAGE_URL },
  keywords: [
    'gestion de projet simple',
    'alternative trello français',
    'suivi de projet client',
    'logiciel livraison client',
    'gestion projet tpe pme',
    'onboarding client outil',
    'portail client projet',
    'Volia Project',
  ],
  openGraph: {
    title: 'Volia Project — vos deals gagnés deviennent des projets livrés',
    description:
      'Kanban simple, jalons, livrables, lien de suivi client sans compte. Intégré nativement au CRM Volia. Gratuit pour tous, illimité avec MAX.',
    url: PAGE_URL,
    type: 'website',
    // /opengraph-image racine non héritée par /produits/* → référence explicite.
    images: [{ url: 'https://volia.fr/opengraph-image', width: 1200, height: 630, alt: 'Volia Project — gestion de projets de livraison' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://volia.fr/opengraph-image'],
  },
};

// ─── Mockup hero : kanban 3 colonnes + lien client ───────────────────
function HeroMockup() {
  const cols = [
    { title: 'À faire', tasks: [{ t: 'Formation équipe client', d: '21 juin' }, { t: 'Point satisfaction 30j', d: '8 juil' }] },
    { title: 'En cours', tasks: [{ t: '⭐ Premier résultat livré', d: '14 juin', hot: true }] },
    { title: 'Fait', tasks: [{ t: 'Appel de bienvenue', done: true }, { t: '⭐ Kickoff validé', done: true }, { t: 'Configuration compte', done: true }] },
  ];
  return (
    <div className="relative rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-orange-500/10 p-4 select-none">
      {/* Header projet */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[13px] font-bold text-zinc-900">Livraison — Boulangerie Martin</p>
          <p className="text-[10px] text-zinc-500">Créé depuis le deal gagné · 6 tâches</p>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-orange-100 text-orange-700 border border-orange-200">
          🔗 Lien client actif
        </span>
      </div>
      {/* Progress */}
      <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden mb-4">
        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500" />
      </div>
      {/* Kanban */}
      <div className="grid grid-cols-3 gap-2">
        {cols.map((c) => (
          <div key={c.title} className="rounded-xl bg-zinc-50 border border-zinc-100 p-2">
            <p className="text-[10px] font-semibold text-zinc-500 mb-1.5 px-1">{c.title}</p>
            <div className="space-y-1.5">
              {c.tasks.map((task) => (
                <div
                  key={task.t}
                  className={`rounded-lg border px-2 py-1.5 text-[10px] leading-tight bg-white ${
                    task.hot ? 'border-amber-300 ring-1 ring-amber-200' : 'border-zinc-150 border-zinc-200'
                  } ${task.done ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}
                >
                  {task.t}
                  {task.d && <span className="block text-[9px] text-zinc-400 mt-0.5 no-underline">{task.d}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURES = {
  headline: 'livrer, montrer, encaisser',
  subline:
    'La vente n\'est gagnée que quand le client est livré et content. Volia Project rend la livraison aussi carrée que votre prospection — sans ajouter un 3e outil à votre stack.',
  items: [
    {
      icon: 'Zap', featured: true,
      title: 'Deal gagné → projet en 1 clic',
      desc: 'Sur chaque deal gagné du CRM, un bouton crée le projet de livraison pré-rempli (client, tâches d\'onboarding). Activez l\'automatisation et ça se fait tout seul. Fini le « et maintenant ? » après la signature.',
    },
    {
      icon: 'FolderKanban',
      title: 'Kanban volontairement simple',
      desc: '3 colonnes : À faire / En cours / Fait. Ajout de tâche en tapant Entrée, drag-drop, vue liste. Pas de sous-sous-tâches, pas de Gantt, pas de réunion pour apprendre l\'outil.',
    },
    {
      icon: 'Link2',
      title: 'Suivi client par lien — sans compte',
      desc: 'Un lien à envoyer au client : il voit la progression, les étapes clés et télécharge ses livrables. Pas de login, pas d\'invitation. Révocable à tout moment. Effet pro garanti.',
    },
    {
      icon: 'Sparkles',
      title: 'Jalons = tâches étoilées',
      desc: 'Marquez une tâche d\'une ⭐ : elle devient une étape clé visible par le client. Kickoff validé, installation faite, PV signé — votre client voit l\'essentiel, pas votre cuisine interne.',
    },
    {
      icon: 'PackageCheck',
      title: 'Livrables avec preuves',
      desc: 'Listez ce que le client doit recevoir, uploadez les fichiers (rapports, PV, photos), marquez « livré ». Le client télécharge depuis son lien. Traçabilité complète en fin de projet.',
    },
    {
      icon: 'ClipboardList',
      title: 'Modèles prêts à l\'emploi',
      desc: 'Onboarding client, installation/chantier, mission de conseil, lancement produit : des modèles avec tâches et échéances pré-remplies. Votre process devient répétable.',
    },
  ],
};

const HOW_IT_WORKS = [
  { icon: 'Zap', title: 'Gagnez le deal', desc: 'Dans le CRM Volia, glissez le deal en « Gagné ». Le bouton « Ouvrir le projet de livraison » apparaît — ou laissez l\'automatisation créer le projet toute seule.' },
  { icon: 'FolderKanban', title: 'Pilotez la livraison', desc: 'Les tâches du modèle sont déjà là avec leurs échéances. Cochez, déplacez, commentez. Les retards remontent en rouge et en notification chaque matin.' },
  { icon: 'Link2', title: 'Montrez au client', desc: 'Envoyez le lien de suivi : progression, étapes clés, livrables téléchargeables. Le client est rassuré, vous êtes pro, le prochain deal est plus facile.' },
];

const FAQ = [
  {
    q: 'En quoi Volia Project est différent de Trello ou Asana ?',
    a: 'Deux choses. 1) Il est branché sur votre CRM : un deal gagné devient un projet en 1 clic, avec le contact client déjà lié. 2) Il est volontairement minimal : 3 colonnes, des jalons, des livrables, un lien client — pas de Gantt, pas de dépendances, pas de formation nécessaire.',
  },
  {
    q: 'Mon client doit-il créer un compte pour suivre le projet ?',
    a: 'Non, jamais. Vous lui envoyez un lien de suivi en lecture seule : progression, étapes clés, livrables à télécharger. Le lien est révocable à tout moment depuis le projet.',
  },
  {
    q: 'Puis-je utiliser Volia Project sans le CRM ?',
    a: 'Oui. Le pont CRM est optionnel : vous pouvez créer des projets librement (depuis un modèle ou de zéro) pour n\'importe quel usage — mission interne, lancement, chantier.',
  },
  {
    q: 'Combien de projets puis-je créer ?',
    a: 'Volia Project est gratuit pour tous : 1 projet actif sur le plan Gratuit. Avec MAX (179 €/mois), projets, tâches et liens de partage illimités. Les fichiers de livrables sont limités à 25 Mo par fichier.',
  },
];

const breadcrumbs = breadcrumbSchema([
  { name: 'Accueil', url: SITE_URL },
  { name: 'Produits', url: `${SITE_URL}/produits/project` },
  { name: 'Volia Project', url: PAGE_URL },
]);

export default function ProductProjectPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <ProductPageLayout
        module="project"
        status="LIVE"
        hero={{
          eyebrow: 'Le chaînon manquant après la vente',
          h1Before: 'Deal gagné.',
          h1Highlight: 'Client livré.',
          h1After: '',
          subtitle: (
            <>
              Vos deals gagnés deviennent des projets de livraison en 1 clic. Kanban simple,
              jalons, livrables — et un <strong className="text-content-primary font-semibold">lien de suivi client sans compte</strong>.
              Trello sans le bazar, branché sur votre CRM. Gratuit pour tous — illimité avec{' '}
              <strong className="text-orange-700 font-semibold">Volia MAX</strong>.
            </>
          ),
          ctaPrimary: { label: 'Démarrer gratuitement', href: '/signup?plan=max' },
          ctaSecondary: { label: 'Voir les fonctionnalités', href: '#features' },
          trust: [
            (<><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Module LIVE</>),
            'Gratuit pour tous',
            'Suivi client sans login',
            'Modèles prêts à l\'emploi',
          ],
          mockup: <HeroMockup />,
        }}
        features={FEATURES}
        howItWorks={HOW_IT_WORKS}
        crossSell={{
          subtitle: 'Volia Project ferme la boucle : prospecter → signer → livrer → être recommandé.',
          otherModules: [
            { module: 'crm', direction: 'in', desc: 'Chaque deal gagné peut devenir un projet de livraison pré-rempli, automatiquement ou en 1 clic.', cta: 'Voir le CRM' },
            { module: 'prospection', direction: 'in', desc: 'Tout commence ici : trouvez les emails de vos futurs clients dans 150+ secteurs.', cta: 'Découvrir Prospection' },
            { module: 'campagnes', direction: 'in', desc: 'Les séquences email transforment vos prospects en deals — que Project livrera ensuite.', cta: 'Découvrir Campagnes' },
          ],
        }}
        pricing={{
          label: 'Gratuit pour tous — 1 projet actif · illimité avec MAX',
          subtext: 'Volia Project est inclus gratuitement dans tous les comptes Volia, aux côtés de la Prospection, des Campagnes, du CRM et des Formulaires. Passez à MAX (179 €/mois — code MAX99 : 3 mois à 99 €) pour des projets et partages illimités. Pas d\'add-on, annulation en 1 clic.',
          cta: 'Passer à MAX',
          ctaHref: '/signup?plan=max',
        }}
        beforeFaq={null}
        faq={FAQ}
        finalCta={{
          title: 'La signature n\'est que la moitié du travail.',
          subtitle: 'Livrez aussi proprement que vous prospectez. Premier projet en 10 secondes, client impressionné dès le premier lien.',
          primary: { label: 'Commencer gratuitement', href: '/signup?plan=max' },
          secondary: { label: 'Voir les tarifs', href: '/pricing' },
          trust: 'Gratuit pour tous · Suivi client sans compte · Modèles prêts à l\'emploi',
        }}
      />
    </>
  );
}
