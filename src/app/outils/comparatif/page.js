import Link from 'next/link';
import { ArrowLeft, ArrowRight, Users, Zap } from 'lucide-react';
import { getAllPairs, getAllCompetitors } from '@/lib/competitors';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';

export const metadata = {
  title: 'Tous les comparatifs 1-vs-1 d\'outils de prospection B2B 2026 — Prospectia',
  description:
    "91 comparatifs côte-à-côte entre les 14 outils de prospection B2B les plus populaires en 2026 : Apollo vs Hunter, Lemlist vs Smartlead, Dropcontact vs Kaspr, et plus.",
  alternates: { canonical: 'https://prospectia.cloud/outils/comparatif' },
  keywords: [
    'comparatif outils prospection b2b',
    'comparatif sales tools 2026',
    'apollo vs hunter',
    'lemlist vs smartlead',
    'comparatif email finder',
  ],
  openGraph: {
    title: '91 comparatifs 1-vs-1 d\'outils de prospection B2B (2026)',
    description: 'Tous les face-à-face entre les 14 outils les plus utilisés : prix, fonctionnalités, RGPD, verdict.',
    url: 'https://prospectia.cloud/outils/comparatif',
  },
};

const breadcrumbs = [
  { label: 'Accueil', href: '/' },
  { label: 'Outils', href: '/outils' },
  { label: 'Comparatifs' },
];

export default function ComparatifsIndex() {
  const pairs = getAllPairs();
  const tools = getAllCompetitors();

  // Groupe les paires par 1er outil pour un affichage matriciel
  const groupedByFirst = tools.reduce((acc, tool) => {
    acc[tool.slug] = pairs.filter((p) => p.a.slug === tool.slug);
    return acc;
  }, {});

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'CollectionPage',
        name: 'Tous les comparatifs 1-vs-1 d\'outils de prospection B2B',
        description: metadata.description,
        url: 'https://prospectia.cloud/outils/comparatif',
        inLanguage: 'fr-FR',
      },
      {
        '@type': 'ItemList',
        name: '91 comparatifs entre 14 outils de prospection',
        numberOfItems: pairs.length,
        itemListElement: pairs.slice(0, 20).map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `https://prospectia.cloud/outils/comparatif/${p.slug}`,
          name: `${p.a.name} vs ${p.b.name}`,
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ReaderHeader />

      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
          <Link href="/outils" className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-violet-400 transition">
            <ArrowLeft size={14} />
            Tous les outils
          </Link>
        </div>

        <article className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 text-xs text-content-tertiary mb-4">
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 inline-flex items-center gap-1">
              <Users size={11} />
              91 comparatifs
            </span>
            <span>14 outils analysés</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
            Tous les <span className="text-violet-400">91 comparatifs</span> d&apos;outils de prospection B2B
          </h1>

          <p className="text-lg text-content-secondary leading-relaxed mb-12 max-w-3xl">
            Face-à-face entre les 14 outils de prospection B2B les plus utilisés en France en 2026.
            Cliquez sur un comparatif pour voir les prix, fonctionnalités, couverture France, RGPD et verdict détaillé.
          </p>

          {/* Matrice : pour chaque outil, ses 13 comparatifs */}
          <div className="space-y-8 mb-12">
            {tools.map((tool) => {
              const toolPairs = groupedByFirst[tool.slug];
              if (toolPairs.length === 0) return null;
              return (
                <section key={tool.slug}>
                  <h2 className="text-xl sm:text-2xl font-bold text-content-primary mb-3 flex items-center gap-2">
                    <Link href={`/outils/${tool.slug}`} className="hover:text-violet-400 transition">
                      {tool.name}
                    </Link>
                    <span className="text-sm font-normal text-content-tertiary">vs…</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {toolPairs.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/outils/comparatif/${p.slug}`}
                        className="group rounded-xl border border-line bg-surface-card hover:bg-surface-elevated hover:border-violet-500/30 transition px-4 py-3 flex items-center justify-between gap-2"
                      >
                        <span className="text-sm font-medium text-content-primary group-hover:text-violet-400 transition truncate">
                          {p.b.name}
                        </span>
                        <ArrowRight size={12} className="text-content-tertiary group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <Zap size={32} className="text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Essayez Prospectia gratuitement</h2>
            <p className="text-content-secondary mb-6 max-w-xl mx-auto">
              L&apos;alternative française la moins chère du marché : 19 €/mois, découverte + enrichissement, 101 départements, 150+ catégories.
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
