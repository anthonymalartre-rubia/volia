// ─────────────────────────────────────────────────────────────────────
// /docs — Hub du Help Center Volia
// ─────────────────────────────────────────────────────────────────────
// Server component (SEO). 6 cards de catégorie + barre de recherche
// statique (la recherche fonctionnelle vit dans la DocsSidebar côté
// /docs/[slug]).
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import {
  Rocket,
  Search,
  Mail,
  KanbanSquare,
  Plug,
  CreditCard,
  ArrowRight,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import {
  DOCS_CATEGORIES,
  getCategoriesWithCounts,
  getArticlesByCategory,
} from '@/lib/docs';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';
import DocsContactFooter from '@/components/DocsContactFooter';

export const metadata = {
  title: "Doc Volia — Tout ce qu'il faut savoir, sans le blabla",
  description:
    "Prospection, campagnes, CRM, API. Guides courts, exemples concrets, démarrage en 5 min. Si tu cherches comment faire X, c'est ici.",
  alternates: { canonical: 'https://volia.fr/docs' },
  openGraph: {
    title: "Doc Volia — Tout ce qu'il faut savoir, sans le blabla",
    description:
      "Prospection, campagnes, CRM, API. Guides courts, exemples concrets.",
    url: 'https://volia.fr/docs',
  },
};

const ICON_MAP = {
  Rocket,
  Search,
  Mail,
  KanbanSquare,
  Plug,
  CreditCard,
};

const COLOR_STYLES = {
  violet: {
    iconBg: 'bg-violet-500/10 text-violet-500 dark:text-violet-400',
    border: 'hover:border-violet-500/40',
  },
  blue: {
    iconBg: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',
    border: 'hover:border-blue-500/40',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
    border: 'hover:border-emerald-500/40',
  },
  amber: {
    iconBg: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
    border: 'hover:border-amber-500/40',
  },
  zinc: {
    iconBg: 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400',
    border: 'hover:border-zinc-500/40',
  },
};

export default function DocsHub() {
  const categories = getCategoriesWithCounts();

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Doc' },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'WebSite',
        name: 'Volia — Doc',
        url: 'https://volia.fr/docs',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://volia.fr/docs?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ReaderHeader />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-600 dark:text-violet-300 mb-6">
            <BookOpen size={12} />
            Doc
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-5 text-content-primary">
            Tu cherches comment faire quoi&nbsp;?
          </h1>
          <p className="text-lg text-content-secondary leading-relaxed max-w-2xl mx-auto mb-8">
            Guides courts, exemples concrets, démarrage en 5 min. Pas de blabla,
            pas de "Bienvenue dans notre documentation complète".
          </p>

          {/* Search bar (statique pour MVP — pointe vers /docs/[slug] où la recherche live) */}
          <form action="/docs" method="GET" className="max-w-xl mx-auto" role="search">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none"
              />
              <input
                type="search"
                name="q"
                placeholder="warmup, RGPD, webhook, import CSV…"
                className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl border border-line bg-surface-card text-content-primary placeholder:text-content-muted focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>
          </form>
        </section>

        {/* Categories grid */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const Icon = ICON_MAP[cat.icon] || Rocket;
              const colors = COLOR_STYLES[cat.color] || COLOR_STYLES.violet;
              const articles = getArticlesByCategory(cat.id).slice(0, 3);

              return (
                <div
                  key={cat.id}
                  className={`rounded-2xl border border-line bg-surface-card p-5 transition ${colors.border}`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-bold text-content-primary leading-tight">
                        {cat.label}
                      </h2>
                      <p className="text-xs text-content-muted mt-0.5">
                        {cat.count} article{cat.count > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-content-secondary leading-relaxed mb-4">
                    {cat.description}
                  </p>

                  {/* Top 3 articles preview */}
                  <ul className="space-y-1.5 mb-4">
                    {articles.map((a) => (
                      <li key={a.slug}>
                        <Link
                          href={`/docs/${a.slug}`}
                          className="flex items-center gap-2 text-xs text-content-tertiary hover:text-violet-500 dark:hover:text-violet-300 transition group"
                        >
                          <ArrowRight
                            size={11}
                            className="text-content-muted group-hover:text-violet-500 dark:group-hover:text-violet-400 transition group-hover:translate-x-0.5"
                          />
                          <span className="truncate">{a.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {cat.count > 3 && (
                    <Link
                      href={`/docs/${articles[0]?.slug || ''}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Voir les {cat.count} guides
                      <ArrowRight size={11} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick access — popular articles */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-16">
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle size={18} className="text-violet-500 dark:text-violet-400" />
            <h2 className="text-xl font-bold text-content-primary">
              Les guides les plus consultés
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'creer-compte',
              'cascade-waterfall-enrichissement',
              'configurer-dns-spf-dkim',
              'warmup-domaine-28j',
              'pipeline-kanban-drag-drop',
              'api-publique-v1',
            ].map((slug) => {
              const cat = DOCS_CATEGORIES.find((c) => {
                const arts = getArticlesByCategory(c.id);
                return arts.some((a) => a.slug === slug);
              });
              const articles = cat ? getArticlesByCategory(cat.id) : [];
              const a = articles.find((art) => art.slug === slug);
              if (!a) return null;
              return (
                <Link
                  key={slug}
                  href={`/docs/${slug}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-line bg-surface-card hover:border-violet-500/40 hover:bg-surface-elevated transition group"
                >
                  <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-500 dark:text-violet-400 flex-shrink-0">
                    <BookOpen size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-content-primary group-hover:text-violet-500 dark:group-hover:text-violet-300 transition truncate">
                      {a.title}
                    </p>
                    <p className="text-[11px] text-content-muted truncate">{cat.label}</p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-content-muted group-hover:text-violet-500 dark:group-hover:text-violet-400 group-hover:translate-x-0.5 transition flex-shrink-0"
                  />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Contact footer */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6">
          <DocsContactFooter />
        </section>
      </main>

      <ReaderFooter />
    </div>
  );
}
