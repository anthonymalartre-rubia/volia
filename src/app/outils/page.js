import Link from 'next/link';
import { ArrowLeft, ArrowRight, Wrench, Zap } from 'lucide-react';
import { getAllCompetitors } from '@/lib/competitors';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';
import { TestimonialsBlock, ResourceTeaserBlock, CompetitorMiniBlock } from '@/components/MarketingBlocks';

export const metadata = {
  title: 'Tous les outils de prospection B2B en 2026 — Volia',
  description:
    'Annuaire complet des 14 outils de prospection B2B en 2026 : prix, avis, alternatives. Apollo, Hunter, Lusha, Snov, Lemlist, Dropcontact, Kaspr, Cognism, ZoomInfo, Findymail, Smartlead, Instantly, Waalaxy, La Growth Machine.',
  alternates: { canonical: 'https://volia.fr/outils' },
  keywords: [
    'outils prospection b2b',
    'comparatif outils sales 2026',
    'meilleur outil cold email',
    'meilleur email finder france',
  ],
  openGraph: {
    title: 'Tous les outils de prospection B2B en 2026',
    description: 'Annuaire complet : prix, avis, alternatives des 14 outils sales les plus populaires.',
    url: 'https://volia.fr/outils',
  },
};

const breadcrumbs = [
  { label: 'Accueil', href: '/' },
  { label: 'Outils de prospection' },
];

export default function OutilsIndex() {
  const tools = getAllCompetitors().sort((a, b) => a.pricing - b.pricing);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'CollectionPage',
        name: 'Tous les outils de prospection B2B en 2026',
        description: metadata.description,
        url: 'https://volia.fr/outils',
        inLanguage: 'fr-FR',
      },
      {
        '@type': 'ItemList',
        name: '14 outils de prospection B2B',
        itemListElement: tools.map((c, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'SoftwareApplication',
            name: c.name,
            url: `https://volia.fr/outils/${c.slug}`,
            applicationCategory: 'BusinessApplication',
            offers: {
              '@type': 'Offer',
              price: String(c.pricing),
              priceCurrency: c.pricingUnit.includes('€') ? 'EUR' : 'USD',
            },
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ReaderHeader />

      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-violet-400 transition">
            <ArrowLeft size={14} />
            Accueil
          </Link>
        </div>

        <article className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 text-xs text-content-tertiary mb-4">
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 inline-flex items-center gap-1">
              <Wrench size={11} />
              Annuaire
            </span>
            <span>14 outils analysés</span>
            <span>·</span>
            <span>Mis à jour : 20 mai 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
            Les <span className="text-violet-400">14 outils</span> de prospection B2B en 2026
          </h1>

          <p className="text-lg text-content-secondary leading-relaxed mb-12 max-w-3xl">
            Annuaire complet des outils de prospection B2B utilisés en France en 2026 :
            email finders, cadenceurs, bases de données B2B, automatisation LinkedIn.
            Triés du moins cher au plus cher, avec prix, avis et alternatives.
          </p>

          {/* Outil gratuit Volia — mis en avant avant l'annuaire */}
          <Link
            href="/outils/trouver-emails"
            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-5 mb-12 hover:border-violet-500/60 transition"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-200 text-[10px] font-semibold uppercase tracking-wider mb-2">
                <Zap size={11} /> Gratuit · sans carte bancaire
              </div>
              <div className="font-bold text-lg text-white">Trouvez des emails d'entreprises gratuitement</div>
              <p className="text-sm text-content-secondary mt-0.5">Par secteur + ville, données réelles, conforme RGPD — directement sur Volia.</p>
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 group-hover:bg-violet-500 text-white text-sm font-semibold transition whitespace-nowrap">
              Essayer l'outil <ArrowRight size={14} />
            </span>
          </Link>

          {/* Tools grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {tools.map((c) => (
              <article
                key={c.slug}
                className="group rounded-2xl border border-line bg-surface-card hover:bg-surface-elevated hover:border-violet-500/30 transition p-5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="text-lg font-bold text-content-primary">
                    <Link href={`/outils/${c.slug}`} className="group-hover:text-violet-400 transition">
                      {c.name}
                    </Link>
                  </h2>
                  <span className="text-xs font-mono font-semibold text-violet-300 whitespace-nowrap">
                    {c.pricing} {c.pricingUnit.replace('/mois', '').replace('(annuel)', '/an')}
                  </span>
                </div>
                <p className="text-sm text-content-secondary leading-relaxed mb-3 flex-1">
                  {c.tagline}
                </p>
                <div className="text-xs text-content-tertiary mb-3">
                  <strong className="text-content-secondary">Idéal pour :</strong> {c.bestFor.split(',')[0]}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <Link
                    href={`/outils/${c.slug}`}
                    className="text-violet-300 font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    Voir l&apos;analyse <ArrowRight size={12} />
                  </Link>
                  <a
                    href={`https://${c.domain}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-content-tertiary hover:text-content-secondary"
                  >
                    {c.domain}
                  </a>
                </div>
              </article>
            ))}
          </div>

          {/* Comparatif featured */}
          <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.05] p-6 mb-12">
            <h2 className="text-xl font-bold mb-3">Vous hésitez entre plusieurs outils ?</h2>
            <p className="text-content-secondary mb-4">
              Notre comparatif détaillé compare les 14 outils côte à côte : prix d&apos;entrée, fonctionnalités,
              couverture France, conformité RGPD, et verdict par profil utilisateur.
            </p>
            <Link
              href="/comparatif-outils-prospection-b2b-france"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-violet-200 transition"
            >
              Voir le comparatif complet →
            </Link>
          </div>

          {/* Comparatif inline rapide */}
          <div className="mb-12">
            <CompetitorMiniBlock />
          </div>

          {/* Témoignages */}
          <TestimonialsBlock
            limit={3}
            title="Pourquoi ils ont choisi Volia"
            subtitle="Vu de l'intérieur — feedbacks de commerciaux et fondateurs B2B."
          />

          {/* Lead magnet */}
          <ResourceTeaserBlock
            title="Hésitez entre 3 outils ? Démarrez par ce PDF gratuit"
            subtitle="20 templates cold email + checklist warmup domaine. Utile que vous choisissiez Volia, Apollo, Hunter ou un autre."
            cta="Récupérer le PDF gratuit"
          />

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <Zap size={32} className="text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Essayez Volia gratuitement</h2>
            <p className="text-content-secondary mb-6 max-w-xl mx-auto">
              L&apos;alternative française la moins chère du marché : 19 €/mois, découverte + enrichissement,
              101 départements, 150+ catégories, RGPD natif.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
            >
              <Zap size={16} />
              Démarrer gratuitement
            </Link>
          </div>
        </article>
      </main>

      <ReaderFooter />
    </div>
  );
}
