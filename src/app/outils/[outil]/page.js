import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Check, X, ExternalLink, Euro, Star, Zap, Sparkles,
  TrendingUp, ShieldCheck, Users, Globe,
} from 'lucide-react';
import { getCompetitor, getAllCompetitors, getPairsFor } from '@/lib/competitors';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';

// 14 outils → 14 pages /outils/[outil]
export async function generateStaticParams() {
  return getAllCompetitors().map((c) => ({ outil: c.slug }));
}

export async function generateMetadata({ params }) {
  const { outil: slug } = await params;
  const c = getCompetitor(slug);
  if (!c) return {};

  return {
    title: `${c.name} en 2026 : prix, avis, alternatives — Prospectia`,
    description: `${c.name} : ${c.tagline}. Prix ${c.pricing} ${c.pricingUnit}. Avantages, limites, alternatives françaises et verdict pour la prospection B2B en 2026.`,
    keywords: [
      `${c.name.toLowerCase()}`,
      `${c.name.toLowerCase()} avis`,
      `${c.name.toLowerCase()} prix`,
      `${c.name.toLowerCase()} alternative`,
      `${c.name.toLowerCase()} france`,
    ],
    alternates: { canonical: `https://prospectia.cloud/outils/${slug}` },
    openGraph: {
      title: `${c.name} : prix, avis, alternatives (2026)`,
      description: `${c.tagline}. Prix ${c.pricing} ${c.pricingUnit}. Analyse complète et alternatives.`,
      url: `https://prospectia.cloud/outils/${slug}`,
      type: 'article',
    },
  };
}

export default async function OutilPage({ params }) {
  const { outil: slug } = await params;
  const c = getCompetitor(slug);
  if (!c) notFound();

  // 3 alternatives suggérées (3 autres outils du dataset)
  const alternatives = getAllCompetitors()
    .filter((other) => other.slug !== slug)
    .slice(0, 3);

  // Les 13 comparatifs 1-vs-1 où cet outil apparaît
  const pairsForThis = getPairsFor(slug);

  const savingsPct = Math.max(0, Math.round(((c.pricing - 19) / c.pricing) * 100));
  const isExpensive = c.pricing >= 100;

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Outils de prospection', href: '/outils' },
    { label: c.name },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'SoftwareApplication',
        name: c.name,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'SalesIntelligence',
        operatingSystem: 'Web',
        url: `https://${c.domain}`,
        description: c.description,
        offers: {
          '@type': 'Offer',
          price: String(c.pricing),
          priceCurrency: c.pricingUnit.includes('€') ? 'EUR' : 'USD',
        },
      },
      {
        '@type': 'Review',
        itemReviewed: {
          '@type': 'SoftwareApplication',
          name: c.name,
          applicationCategory: 'BusinessApplication',
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '4.0',
          bestRating: '5',
          worstRating: '1',
        },
        author: { '@type': 'Person', name: 'Anthony Malartre' },
        publisher: { '@type': 'Organization', name: 'Prospectia', url: 'https://prospectia.cloud' },
        datePublished: '2026-05-20',
        reviewBody: c.description,
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Combien coûte ${c.name} en 2026 ?`,
            acceptedAnswer: { '@type': 'Answer', text: `${c.name} démarre à ${c.pricing} ${c.pricingUnit}. C'est ${isExpensive ? 'positionné sur le segment premium / entreprise' : 'plus accessible pour les TPE/PME'}.` },
          },
          {
            '@type': 'Question',
            name: `Quelle est la meilleure alternative française à ${c.name} ?`,
            acceptedAnswer: { '@type': 'Answer', text: `Prospectia est l'alternative française à ${c.name} : 19 €/mois (${savingsPct}% moins cher), combine découverte (Google Places) + enrichissement email, conforme RGPD natif.` },
          },
          {
            '@type': 'Question',
            name: `${c.name} est-il adapté au marché français ?`,
            acceptedAnswer: { '@type': 'Answer', text: c.weaknesses.find((w) => w.toLowerCase().includes('france') || w.toLowerCase().includes('français')) || `${c.name} est adapté au marché français.` },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ReaderHeader />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
          <Link href="/outils" className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-violet-400 transition">
            <ArrowLeft size={14} />
            Tous les outils de prospection
          </Link>
        </div>

        <article className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4 text-xs text-content-tertiary">
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 inline-flex items-center gap-1">
                <Star size={11} />
                Review 2026
              </span>
              <span>Mis à jour : 20 mai 2026</span>
              <span>·</span>
              <span>Anthony Malartre</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
              {c.name} : prix, avis, alternatives <span className="text-violet-400">(2026)</span>
            </h1>

            <p className="text-lg sm:text-xl text-content-secondary leading-relaxed mb-6">
              {c.tagline}. Analyse complète : prix, fonctionnalités, limites, et meilleures alternatives françaises.
            </p>

            {/* Hero stats card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-line bg-surface-card p-4">
                <div className="text-xs text-content-tertiary uppercase tracking-wider mb-1">Prix</div>
                <div className="text-xl font-bold text-violet-300">{c.pricing} {c.pricingUnit.replace('/mois', '')}</div>
                <div className="text-xs text-content-tertiary">/{c.pricingUnit.includes('mois') ? 'mois' : 'an'}</div>
              </div>
              <div className="rounded-2xl border border-line bg-surface-card p-4">
                <div className="text-xs text-content-tertiary uppercase tracking-wider mb-1">Catégorie</div>
                <div className="text-sm font-semibold text-content-primary">Sales intelligence</div>
              </div>
              <div className="rounded-2xl border border-line bg-surface-card p-4">
                <div className="text-xs text-content-tertiary uppercase tracking-wider mb-1">Marché</div>
                <div className="text-sm font-semibold text-content-primary">{c.bestFor.includes('France') || c.bestFor.includes('français') ? '🇫🇷 France' : '🌍 International'}</div>
              </div>
              <div className="rounded-2xl border border-line bg-surface-card p-4">
                <div className="text-xs text-content-tertiary uppercase tracking-wider mb-1">Idéal pour</div>
                <div className="text-sm font-semibold text-content-primary">{c.bestFor.split(' ').slice(0, 3).join(' ')}…</div>
              </div>
            </div>
          </div>

          {/* En résumé */}
          <div className="mb-12 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.05] p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-violet-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">En résumé</span>
            </div>
            <ul className="space-y-2 text-sm sm:text-base text-content-secondary leading-relaxed">
              <li className="flex gap-2"><span className="text-violet-400 flex-shrink-0">→</span><span><strong className="text-content-primary">Prix</strong> : {c.pricing} {c.pricingUnit}</span></li>
              <li className="flex gap-2"><span className="text-violet-400 flex-shrink-0">→</span><span><strong className="text-content-primary">Idéal pour</strong> : {c.bestFor}</span></li>
              <li className="flex gap-2"><span className="text-violet-400 flex-shrink-0">→</span><span><strong className="text-content-primary">Principal atout</strong> : {c.strengths[0]}</span></li>
              <li className="flex gap-2"><span className="text-violet-400 flex-shrink-0">→</span><span><strong className="text-content-primary">Principale limite</strong> : {c.weaknesses[0]}</span></li>
              {savingsPct > 0 && (
                <li className="flex gap-2"><span className="text-violet-400 flex-shrink-0">→</span><span><strong className="text-content-primary">Alternative française</strong> : Prospectia à 19 €/mois ({savingsPct}% moins cher)</span></li>
              )}
            </ul>
          </div>

          {/* Description */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Qu&apos;est-ce que {c.name} ?</h2>
            <p className="text-content-secondary leading-relaxed">{c.description}</p>
            <p className="text-content-secondary leading-relaxed mt-3">
              Site officiel :{' '}
              <a href={`https://${c.domain}`} target="_blank" rel="noopener noreferrer nofollow" className="text-violet-400 hover:underline inline-flex items-center gap-1">
                {c.domain} <ExternalLink size={12} />
              </a>
            </p>
          </section>

          {/* Avantages */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={22} className="text-green-400" />
              Avantages de {c.name}
            </h2>
            <ul className="space-y-2">
              {c.strengths.map((s, i) => (
                <li key={i} className="flex gap-3 text-content-secondary">
                  <Check size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Limites */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <X size={22} className="text-red-400" />
              Limites de {c.name}
            </h2>
            <ul className="space-y-2">
              {c.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-3 text-content-secondary">
                  <X size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Prix */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Euro size={22} className="text-violet-400" />
              Combien coûte {c.name} en 2026 ?
            </h2>
            <p className="text-content-secondary leading-relaxed mb-4">
              {c.name} démarre à <strong className="text-content-primary">{c.pricing} {c.pricingUnit}</strong>.
              {isExpensive
                ? ' C\'est positionné sur le segment premium / entreprise.'
                : ' C\'est accessible pour les TPE/PME et solopreneurs.'}
            </p>
            {savingsPct > 0 && (
              <div className="rounded-2xl border border-green-500/30 bg-green-500/[0.06] p-5">
                <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
                  💡 <strong className="text-content-primary">Bon à savoir</strong> : à titre de comparaison, Prospectia (alternative française avec découverte Google Places + enrichissement email)
                  démarre à <strong>19 €/mois</strong>, soit <strong className="text-green-400">{savingsPct}% moins cher</strong> que {c.name},
                  tout en couvrant les 101 départements français et 150+ catégories d&apos;activité.
                </p>
              </div>
            )}
          </section>

          {/* Pour qui ? */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Users size={22} className="text-violet-400" />
              {c.name} est-il fait pour vous ?
            </h2>
            <div className="rounded-2xl border border-line bg-surface-card p-5">
              <div className="text-xs text-content-tertiary uppercase tracking-wider mb-2">Idéal pour</div>
              <p className="text-content-primary font-semibold">{c.bestFor}</p>
            </div>
          </section>

          {/* Alternatives */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
              <Globe size={22} className="text-violet-400" />
              Alternatives à {c.name}
            </h2>

            {/* Prospectia featured */}
            <div className="rounded-2xl border-2 border-violet-500/40 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.04] p-5 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white flex-shrink-0">P</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <h3 className="text-lg font-bold text-content-primary">Prospectia</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">🇫🇷 Alternative française recommandée</span>
                  </div>
                  <p className="text-sm text-content-secondary leading-relaxed mb-2">
                    À partir de <strong className="text-content-primary">19 €/mois</strong>, Prospectia combine découverte d&apos;entreprises (Google Places, 150+ catégories, 101 départements)
                    + enrichissement email automatique. RGPD-by-design. {savingsPct > 0 ? `${savingsPct}% moins cher que ${c.name}.` : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/vs/${c.slug.includes('-') ? c.slug.split('-')[0] : c.slug}`} className="text-xs font-medium text-violet-300 hover:text-violet-200">
                      Voir le comparatif Prospectia vs {c.name} →
                    </Link>
                    <span className="text-content-tertiary text-xs">·</span>
                    <Link href="/signup" className="text-xs font-medium text-violet-300 hover:text-violet-200">
                      Essayer Prospectia gratuitement →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Other alternatives */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {alternatives.map((alt) => (
                <Link
                  key={alt.slug}
                  href={`/outils/${alt.slug}`}
                  className="block rounded-xl border border-line bg-surface-card hover:bg-surface-elevated hover:border-violet-500/30 transition p-4 group"
                >
                  <div className="text-xs text-content-tertiary mb-1">Voir alternative</div>
                  <h3 className="font-semibold text-content-primary group-hover:text-violet-400 transition mb-1">{alt.name}</h3>
                  <p className="text-xs text-content-secondary leading-relaxed">{alt.tagline}</p>
                  <div className="text-xs text-violet-300 mt-2 font-mono">{alt.pricing} {alt.pricingUnit}</div>
                </Link>
              ))}
            </div>

            <Link
              href="/comparatif-outils-prospection-b2b-france"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-300 hover:text-violet-200 transition group"
            >
              Voir le comparatif complet des 14 outils →
            </Link>
          </section>

          {/* Comparatifs 1-vs-1 où cet outil apparaît */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              {c.name} vs… <span className="text-base font-normal text-content-tertiary">{pairsForThis.length} comparatifs</span>
            </h2>
            <p className="text-content-secondary leading-relaxed mb-4">
              Comparaison côte-à-côte avec chacun des autres outils analysés sur Prospectia :
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {pairsForThis.map((p) => {
                const other = p.a.slug === c.slug ? p.b : p.a;
                return (
                  <Link
                    key={p.slug}
                    href={`/outils/comparatif/${p.slug}`}
                    className="group rounded-xl border border-line bg-surface-card hover:bg-surface-elevated hover:border-violet-500/30 transition px-3 py-2 flex items-center gap-2"
                  >
                    <span className="text-content-tertiary text-xs">vs</span>
                    <span className="text-sm font-medium text-content-primary group-hover:text-violet-400 transition truncate">
                      {other.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <Zap size={32} className="text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Essayez Prospectia gratuitement</h2>
            <p className="text-content-secondary mb-6 max-w-xl mx-auto">
              100 prospects offerts pour découvrir l&apos;alternative française à {c.name}.
              À partir de 19 €/mois pour passer à 1 000 prospects + 400 enrichissements — le ticket d&apos;entrée le moins cher du marché français.
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
