import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Mail, Phone, Calculator, TrendingUp,
  ShieldCheck, Flame, BookOpen, Target, Download, Zap,
} from 'lucide-react';
import { getAllResources, getResourcesByCategory } from '@/lib/resources';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';

const ICON_MAP = {
  Mail, Phone, Calculator, TrendingUp, ShieldCheck, Flame, BookOpen, Target,
};

export const metadata = {
  title: 'Ressources gratuites prospection B2B 2026 — Templates, calculateurs, checklists',
  description:
    'Templates de cold email, scripts cold call, calculateurs CAC/LTV, checklists RGPD, playbooks sales : ressources gratuites pour booster votre prospection B2B en 2026.',
  alternates: { canonical: 'https://prospectia.cloud/ressources' },
  keywords: [
    'templates cold email gratuit',
    'calculateur cac ltv saas',
    'checklist rgpd cold email',
    'sales playbook template',
    'ressources prospection b2b',
  ],
  openGraph: {
    title: 'Ressources gratuites prospection B2B 2026',
    description: 'Templates, calculateurs, checklists et playbooks gratuits pour les équipes sales B2B françaises.',
    url: 'https://prospectia.cloud/ressources',
  },
};

const breadcrumbs = [
  { label: 'Accueil', href: '/' },
  { label: 'Ressources' },
];

export default function RessourcesIndex() {
  const resources = getAllResources();
  const grouped = getResourcesByCategory();
  const categories = Object.keys(grouped);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'CollectionPage',
        name: 'Ressources gratuites prospection B2B 2026',
        description: metadata.description,
        url: 'https://prospectia.cloud/ressources',
        inLanguage: 'fr-FR',
      },
      {
        '@type': 'ItemList',
        name: `${resources.length} ressources gratuites prospection B2B`,
        numberOfItems: resources.length,
        itemListElement: resources.map((r, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'CreativeWork',
            name: r.title,
            description: r.shortDesc,
            url: `https://prospectia.cloud/ressources/${r.slug}`,
            keywords: r.keywords.join(', '),
            isAccessibleForFree: true,
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-violet-400 transition">
            <ArrowLeft size={14} />
            Accueil
          </Link>
        </div>

        <article className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 text-xs text-content-tertiary mb-4">
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 inline-flex items-center gap-1">
              <Download size={11} />
              Gratuit
            </span>
            <span>{resources.length} ressources</span>
            <span>·</span>
            <span>Mises à jour régulièrement</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
            <span className="text-violet-400">Ressources gratuites</span> pour votre prospection B2B
          </h1>

          <p className="text-lg text-content-secondary leading-relaxed mb-12 max-w-3xl">
            Templates de cold email, scripts d&apos;appel, calculateurs CAC/LTV, checklists RGPD, playbooks sales.
            Téléchargeables gratuitement (le plus souvent en échange de votre email).
          </p>

          {/* Tools grid groupé par catégorie */}
          {categories.map((cat) => (
            <section key={cat} className="mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-content-primary mb-4">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[cat].map((r) => {
                  const Icon = ICON_MAP[r.icon] || Download;
                  return (
                    <Link
                      key={r.slug}
                      href={`/ressources/${r.slug}`}
                      className="group rounded-2xl border border-line bg-surface-card hover:bg-surface-elevated hover:border-violet-500/30 transition p-5 flex flex-col"
                    >
                      <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mb-3">
                        <Icon size={18} className="text-violet-300" />
                      </div>
                      <h3 className="text-base font-bold text-content-primary group-hover:text-violet-400 transition mb-2 leading-snug">
                        {r.title}
                      </h3>
                      <p className="text-sm text-content-secondary leading-relaxed mb-4 flex-1">
                        {r.shortDesc}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-content-tertiary">
                          {r.format}
                          {r.pages ? ` · ${r.pages} pages` : ''}
                        </span>
                        <span className="text-violet-300 font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          Télécharger <ArrowRight size={12} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <Zap size={32} className="text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Essayez Prospectia gratuitement</h2>
            <p className="text-content-secondary mb-6 max-w-xl mx-auto">
              Au-delà des ressources statiques, Prospectia trouve les entreprises et leurs emails partout en France.
              Gratuit pour commencer · à partir de 19 €/mois.
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
