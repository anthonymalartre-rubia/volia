import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight, BarChart3, Calendar, FileText, MapPin,
  TrendingUp, Mail, Sparkles,
} from 'lucide-react';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';
import { breadcrumbSchema } from '@/lib/seo-helpers';

const BASE_URL = 'https://volia.fr';
const HUB_URL = `${BASE_URL}/etude`;

export const metadata = {
  title: 'Études Volia — Baromètres du B2B français',
  description:
    'Tous les benchmarks et études Volia sur le marché B2B français : prospection, cold email, conformité RGPD. Sources publiques officielles + données de couverture Volia. Citables avec attribution.',
  alternates: { canonical: HUB_URL },
  keywords: [
    'étude prospection b2b france',
    'benchmark cold email france',
    'baromètre outbound france 2026',
    'chiffres saas b2b france',
    'étude rgpd cold email',
    'volia études',
  ],
  openGraph: {
    title: 'Études Volia — Baromètres du B2B français',
    description:
      'Benchmarks du marché B2B français. Sources publiques + données de couverture Volia. Citables par les journalistes, étudiants, professionnels.',
    url: HUB_URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Études Volia — Baromètres B2B France 2026',
    description: 'Benchmarks du marché B2B français. Sources publiques + données de couverture Volia.',
  },
  robots: { index: true, follow: true },
};

// ────────────────────────────────────────────────────────────────────────
// Liste des études disponibles (à enrichir au fil des publications)
// ────────────────────────────────────────────────────────────────────────
const STUDIES = [
  {
    slug: 'prospection-b2b-france-2026',
    title: "L'État de la Prospection B2B en France 2026",
    subtitle: 'Le marché, les coûts, le RGPD — et ce que révèlent nos données',
    description:
      "Benchmark du marché français de la prospection B2B en 2026 : taille du marché, coûts réels, performance cold email, conformité RGPD. Sources publiques officielles + données de couverture Volia sur ~40 000 entreprises.",
    publishedAt: '2026-05-20',
    readTime: 18,
    accent: 'violet', // pour gradient hero card
    icon: BarChart3,
    keyStats: [
      { value: '4,8 M', label: "d'entreprises actives en France", source: 'INSEE' },
      { value: '~40 000', label: 'entreprises analysées', source: 'Volia' },
      { value: '1-5 %', label: 'taux de réponse cold email B2B FR', source: 'Belkins' },
      { value: '450 €', label: 'coût moyen d\'un lead B2B qualifié', source: 'Forrester' },
    ],
    href: '/etude/prospection-b2b-france-2026',
    tags: ['Prospection', 'Marché', 'RGPD'],
  },
  {
    slug: 'etat-cold-email-france-2026',
    title: 'État du cold email B2B France 2026',
    subtitle: 'Les chiffres réalistes : réponse, relances, séquences, RGPD',
    description:
      "Benchmark du cold email B2B en France 2026 : taux de réponse réalistes, poids des relances, longueur de séquence, conformité RGPD. Sources publiques (Belkins, Instantly, HubSpot) + données de couverture Volia.",
    publishedAt: '2026-05-15',
    readTime: 12,
    accent: 'blue',
    icon: Mail,
    keyStats: [
      { value: '1-5 %', label: 'taux de réponse moyen', source: 'Belkins' },
      { value: '55-65 %', label: 'des réponses via les relances', source: 'Instantly' },
      { value: '0 %', label: "d'emails devinés (base Volia)", source: 'Volia' },
      { value: '~46 %', label: 'find-rate email (avec site)', source: 'Volia' },
    ],
    href: '/etude/etat-cold-email-france-2026',
    tags: ['Cold email', 'Deliverability', 'Benchmark'],
  },
];

// ────────────────────────────────────────────────────────────────────────
// JSON-LD : CollectionPage (Schema.org) + BreadcrumbList
// ────────────────────────────────────────────────────────────────────────
const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Études Volia',
  description: 'Baromètres et études du marché B2B français',
  url: HUB_URL,
  publisher: {
    '@type': 'Organization',
    name: 'Volia',
    url: BASE_URL,
  },
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: STUDIES.length,
    itemListElement: STUDIES.map((study, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Article',
        headline: study.title,
        description: study.description,
        url: `${BASE_URL}${study.href}`,
        datePublished: study.publishedAt,
        publisher: {
          '@type': 'Organization',
          name: 'Volia',
          url: BASE_URL,
        },
      },
    })),
  },
};

const breadcrumb = breadcrumbSchema([
  { name: 'Accueil', url: BASE_URL },
  { name: 'Études', url: HUB_URL },
]);

// ────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────
export default function EtudesHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <ReaderHeader />

      <main className="min-h-screen bg-surface-base text-content-primary">
        {/* Hero */}
        <section className="relative pt-16 pb-12 px-4 sm:px-6 overflow-hidden border-b border-line">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto relative">
            <nav className="text-xs text-content-tertiary mb-6 flex items-center gap-2">
              <Link href="/" className="hover:text-violet-700 transition">Accueil</Link>
              <span>·</span>
              <span className="text-content-primary font-medium">Études</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-semibold mb-5">
              <Sparkles size={12} />
              Sources publiques + données de couverture Volia
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-content-primary mb-5 leading-tight">
              Études Volia
            </h1>
            <p className="text-lg sm:text-xl text-content-secondary max-w-2xl leading-relaxed mb-6">
              Tous nos baromètres et études sur le marché B2B français.
              Chiffres sourcés. Méthodologie publique. Citables avec attribution.
            </p>

            {/* Méta-stats : nombre d'études + dernière mise à jour */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-content-tertiary">
              <span className="inline-flex items-center gap-1.5">
                <FileText size={14} className="text-violet-600" />
                <strong className="text-content-primary">{STUDIES.length}</strong> études disponibles
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} className="text-violet-600" />
                Dernière mise à jour :{' '}
                <strong className="text-content-primary">
                  {new Date(
                    Math.max(...STUDIES.map((s) => new Date(s.publishedAt).getTime()))
                  ).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-violet-600" />
                Couverture : <strong className="text-content-primary">France métropolitaine + DROM</strong>
              </span>
            </div>
          </div>
        </section>

        {/* Liste des études */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-8">
              {STUDIES.map((study) => {
                const Icon = study.icon;
                const isViolet = study.accent === 'violet';
                const accentClasses = isViolet
                  ? {
                      iconBg: 'from-violet-500 to-indigo-600',
                      cardHover: 'hover:border-violet-300 hover:shadow-violet-100/40',
                      tagBg: 'bg-violet-50 text-violet-700 border-violet-200',
                      statBg: 'bg-violet-50/60 border-violet-100',
                      ctaBg: 'from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500',
                      ctaShadow: 'shadow-violet-500/25',
                    }
                  : {
                      iconBg: 'from-blue-500 to-cyan-600',
                      cardHover: 'hover:border-blue-300 hover:shadow-blue-100/40',
                      tagBg: 'bg-blue-50 text-blue-700 border-blue-200',
                      statBg: 'bg-blue-50/60 border-blue-100',
                      ctaBg: 'from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500',
                      ctaShadow: 'shadow-blue-500/25',
                    };

                return (
                  <article
                    key={study.slug}
                    className={`group rounded-2xl border border-line bg-surface-card overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl ${accentClasses.cardHover}`}
                  >
                    <div className="p-6 sm:p-8 lg:p-10">
                      {/* Header card */}
                      <div className="flex items-start gap-5 mb-6">
                        <div
                          className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${accentClasses.iconBg} flex items-center justify-center shadow-lg`}
                        >
                          <Icon size={26} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {study.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${accentClasses.tagBg}`}
                              >
                                {tag}
                              </span>
                            ))}
                            <span className="text-[11px] text-content-tertiary inline-flex items-center gap-1">
                              <Calendar size={11} />
                              {new Date(study.publishedAt).toLocaleDateString('fr-FR', {
                                day: '2-digit', month: 'long', year: 'numeric',
                              })}
                            </span>
                            <span className="text-[11px] text-content-tertiary">·</span>
                            <span className="text-[11px] text-content-tertiary">
                              {study.readTime} min de lecture
                            </span>
                          </div>
                          <h2 className="font-display text-2xl sm:text-3xl font-bold text-content-primary mb-2 leading-tight">
                            <Link href={study.href} className="hover:text-violet-700 transition-colors">
                              {study.title}
                            </Link>
                          </h2>
                          <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
                            <strong className="text-content-primary">{study.subtitle}.</strong>{' '}
                            {study.description}
                          </p>
                        </div>
                      </div>

                      {/* Stats clés en grille 2×2 ou 4 colonnes */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {study.keyStats.map((stat) => (
                          <div
                            key={stat.label}
                            className={`p-3 rounded-xl border ${accentClasses.statBg} text-center`}
                          >
                            <div className="text-2xl font-bold text-content-primary font-display tabular-nums">
                              {stat.value}
                            </div>
                            <div className="text-[10px] text-content-tertiary leading-tight mt-0.5">
                              {stat.label}
                            </div>
                            <div className="text-[9px] text-content-muted mt-1 italic">
                              Source : {stat.source}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-line">
                        <p className="text-xs text-content-tertiary">
                          <TrendingUp size={12} className="inline mr-1" />
                          Citable avec attribution :{' '}
                          <code className="font-mono text-content-secondary">
                            Source : Volia, étude {new Date(study.publishedAt).getFullYear()}
                          </code>
                        </p>
                        <Link
                          href={study.href}
                          className={`group/cta inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${accentClasses.ctaBg} text-white text-sm font-semibold shadow-lg ${accentClasses.ctaShadow} hover:shadow-xl transition-all`}
                        >
                          Lire l&apos;étude
                          <ArrowRight size={16} className="group-hover/cta:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Encadré Pour journalistes */}
            <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
              <h3 className="text-xl font-bold text-content-primary mb-3 flex items-center gap-2">
                <FileText size={20} className="text-violet-600" />
                Pour les journalistes et chercheurs
              </h3>
              <p className="text-sm text-content-secondary leading-relaxed mb-4">
                Nos études sont libres de citation avec attribution
                {' '}(<code className="font-mono text-xs">Source : Volia, étude [TITRE]</code>).
                Pour interview, demande de données brutes ou accès aux méthodologies détaillées,
                contacte-nous via notre{' '}
                <Link href="/presse" className="text-violet-700 font-semibold hover:underline">
                  espace presse
                </Link>
                {' '}ou directement à{' '}
                <a href="mailto:contact@volia.fr" className="text-violet-700 font-semibold hover:underline">
                  contact@volia.fr
                </a>.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/presse"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
                >
                  Espace presse
                  <ArrowUpRight size={14} />
                </Link>
                <Link
                  href="/notre-histoire"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-line hover:border-violet-300 text-content-primary text-sm font-medium transition-all"
                >
                  Notre histoire
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* Suggestions futures (signal de continuité éditoriale) */}
            <div className="mt-12 text-center text-sm text-content-tertiary">
              <p className="mb-2">
                <Sparkles size={14} className="inline text-violet-600 mr-1" />
                Prochaines études à paraître :
              </p>
              <p className="text-xs text-content-muted max-w-xl mx-auto">
                « État du CRM dans les PME françaises 2026 » ·
                « Benchmark des outils SaaS B2B europeens » ·
                « Souveraineté numérique des TPE/PME ».
                Inscris-toi à notre{' '}
                <Link href="/newsletter" className="text-violet-700 hover:underline">
                  newsletter
                </Link>
                {' '}pour recevoir les prochaines en avant-première.
              </p>
            </div>
          </div>
        </section>
      </main>

      <ReaderFooter />
    </>
  );
}
