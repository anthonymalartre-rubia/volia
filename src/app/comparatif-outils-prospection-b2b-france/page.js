import Link from 'next/link';
import { ArrowLeft, Check, X, Minus, Zap, TrendingDown, Globe, Shield } from 'lucide-react';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';

export const metadata = {
  title: 'Comparatif des outils de prospection B2B en France 2026 — Volia',
  description: 'Comparatif détaillé des 11 meilleurs outils de prospection B2B pour le marché français : Volia, Apollo, Hunter, Lusha, Snov, Lemlist, Dropcontact, Kaspr, Cognism, ZoomInfo, Findymail. Prix, fonctionnalités, couverture France, RGPD.',
  alternates: { canonical: 'https://volia.fr/comparatif-outils-prospection-b2b-france' },
  keywords: [
    'comparatif outils prospection b2b',
    'meilleur outil prospection france',
    'alternative apollo france',
    'comparatif email finder 2026',
    'outil sales b2b france',
  ],
  openGraph: {
    title: 'Comparatif des outils de prospection B2B en France 2026',
    description: '11 outils comparés (prix, fonctionnalités, couverture France, RGPD). Verdict détaillé pour TPE, PME, freelances et équipes sales.',
    url: 'https://volia.fr/comparatif-outils-prospection-b2b-france',
    type: 'article',
  },
};

// Comparative dataset — single source of truth for the page + JSON-LD
const TOOLS = [
  {
    name: 'Volia',
    href: 'https://volia.fr',
    isUs: true,
    entryPrice: 19,
    entryPlan: 'Solo',
    proPrice: 49,
    discovery: 'Oui (Google Places)',
    enrichment: 'Cascade waterfall',
    franceCoverage: 'Excellent (101 départements)',
    rgpd: 'Natif',
    crmExport: 'CSV (tous CRM)',
    bestFor: 'TPE/PME/freelances en France, budget serré',
  },
  {
    name: 'Apollo.io',
    href: 'https://www.apollo.io',
    entryPrice: 49,
    entryPlan: 'Basic',
    proPrice: 99,
    discovery: 'Oui (base mondiale 275M)',
    enrichment: 'Oui (cascade)',
    franceCoverage: 'Bon (mais US-first)',
    rgpd: 'Compatible',
    crmExport: 'Natif',
    bestFor: 'Équipes sales multi-pays, budget moyen+',
  },
  {
    name: 'Hunter.io',
    href: 'https://hunter.io',
    entryPrice: 34,
    entryPlan: 'Starter',
    proPrice: 49,
    discovery: 'Non',
    enrichment: 'Oui (par domaine)',
    franceCoverage: 'Correct',
    rgpd: 'Compatible',
    crmExport: 'Natif (Hubspot, Pipedrive…)',
    bestFor: 'Enrichir une liste de sites web déjà connue',
  },
  {
    name: 'Snov.io',
    href: 'https://snov.io',
    entryPrice: 39,
    entryPlan: 'Pro',
    proPrice: 99,
    discovery: 'Limité',
    enrichment: 'Oui + cadenceur intégré',
    franceCoverage: 'Faible',
    rgpd: 'Compatible',
    crmExport: 'Natif',
    bestFor: 'Petites équipes voulant outil tout-en-un',
  },
  {
    name: 'Lusha',
    href: 'https://www.lusha.com',
    entryPrice: 49,
    entryPlan: 'Pro',
    proPrice: 79,
    discovery: 'Non',
    enrichment: 'Oui (mobiles directs)',
    franceCoverage: 'Faible',
    rgpd: 'Compatible',
    crmExport: 'Natif',
    bestFor: 'Sourcing de mobiles directs US',
  },
  {
    name: 'Lemlist',
    href: 'https://www.lemlist.com',
    entryPrice: 59,
    entryPlan: 'Email Pro',
    proPrice: 99,
    discovery: 'Limité (depuis 2023)',
    enrichment: 'Limité',
    franceCoverage: 'Bon (équipe FR)',
    rgpd: 'Compatible',
    crmExport: 'Natif',
    bestFor: 'Cadenceur premium + warmup IP',
  },
  {
    name: 'Dropcontact',
    href: 'https://www.dropcontact.com',
    entryPrice: 31,
    entryPlan: 'Email Hunter',
    proPrice: 79,
    discovery: 'Non',
    enrichment: 'Oui (RGPD-by-design)',
    franceCoverage: 'Excellent',
    rgpd: 'Natif (FR)',
    crmExport: 'Natif (Pipedrive, Salesforce)',
    bestFor: 'Enrichissement RGPD strict, marché FR',
  },
  {
    name: 'Kaspr',
    href: 'https://www.kaspr.io',
    entryPrice: 49,
    entryPlan: 'Starter',
    proPrice: 79,
    discovery: 'Via LinkedIn',
    enrichment: 'Oui (email + tél)',
    franceCoverage: 'Bon (équipe FR)',
    rgpd: 'Compatible',
    crmExport: 'Natif',
    bestFor: 'Extraction de contacts LinkedIn',
  },
  {
    name: 'Cognism',
    href: 'https://www.cognism.com',
    entryPrice: 1500,
    entryPlan: 'Annuel',
    proPrice: 1500,
    discovery: 'Oui (focus EU)',
    enrichment: 'Oui (mobile direct EU)',
    franceCoverage: 'Très bon',
    rgpd: 'Natif (EU)',
    crmExport: 'Natif',
    bestFor: 'Mid-market EU avec budget',
  },
  {
    name: 'ZoomInfo',
    href: 'https://www.zoominfo.com',
    entryPrice: 1200,
    entryPlan: 'Annuel',
    proPrice: 1200,
    discovery: 'Oui (base US massive)',
    enrichment: 'Oui',
    franceCoverage: 'Moyen',
    rgpd: 'Compatible',
    crmExport: 'Natif',
    bestFor: 'Entreprises US/mondiales',
  },
  {
    name: 'Findymail',
    href: 'https://www.findymail.com',
    entryPrice: 49,
    entryPlan: 'Pro',
    proPrice: 99,
    discovery: 'Non',
    enrichment: 'Oui (B2B, vérif SMTP)',
    franceCoverage: 'Correct',
    rgpd: 'Compatible',
    crmExport: 'Natif',
    bestFor: 'Vérification email avant outreach',
  },
];

const FAQ = [
  {
    question: 'Quel est le meilleur outil de prospection B2B en France en 2026 ?',
    answer: 'Il dépend de votre besoin. Pour la découverte d\'entreprises françaises + enrichissement email à petit prix, Volia (19 €/mois) est le ticket d\'entrée le moins cher du marché français. Pour une équipe sales multi-pays, Apollo.io (49-99 €). Pour enrichir une liste déjà connue, Hunter.io ou Dropcontact. Pour LinkedIn, Kaspr.',
  },
  {
    question: 'Quelle est l\'alternative française à Apollo.io ?',
    answer: 'Volia est l\'alternative française à Apollo : combinaison de découverte (Google Places, 150+ catégories, 101 départements) + enrichissement email, ticket d\'entrée à 19 €/mois (vs 49-99 € Apollo). Conforme RGPD natif (filtre 28 domaines d\'emails personnels + opt-out public).',
  },
  {
    question: 'Quel est l\'outil le moins cher pour faire de la prospection B2B en France ?',
    answer: 'Volia avec son plan Solo à 19 €/mois (1 000 prospects + 400 enrichissements) est le ticket d\'entrée le moins cher du marché français. À titre de comparaison : Dropcontact démarre à 31 €, Snov à 39 €, Hunter à 34 €, Apollo à 49 €, Lemlist à 59 €.',
  },
  {
    question: 'Quels outils sont conformes au RGPD pour la prospection B2B en France ?',
    answer: 'Tous les outils listés sont compatibles RGPD (article 6 - intérêt légitime). Les plus stricts sur le RGPD natif (français/européen) sont : Volia (filtre emails personnels + opt-out public), Dropcontact (RGPD-by-design), Cognism (focus EU). Apollo, Hunter, Lusha, ZoomInfo sont compatibles mais d\'origine US.',
  },
  {
    question: 'Comment combiner ces outils pour un stack complet ?',
    answer: 'Stack solo (< 50 €/mois) : Volia Solo (19 €) + Smartlead Starter (29 €). Stack PME (~200 €/mois) : Volia Pro (49 €) + Smartlead Pro (94 €) + Folk CRM (39 €). Stack scale-up (~500 €/mois) : Volia Business (149 €) + Lemlist (159 €) + Pipedrive 5 users.',
  },
];

const breadcrumbs = [
  { label: 'Accueil', href: '/' },
  { label: 'Comparatifs', href: '/blog' },
  { label: 'Outils de prospection B2B France' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbSchema(breadcrumbs),
    {
      '@type': 'Article',
      headline: 'Comparatif des outils de prospection B2B en France 2026',
      description: 'Comparatif détaillé des 11 meilleurs outils de prospection B2B pour le marché français.',
      datePublished: '2026-05-20',
      dateModified: '2026-05-20',
      author: { '@type': 'Person', name: 'Anthony Malartre' },
      publisher: {
        '@type': 'Organization',
        name: 'Volia',
        url: 'https://volia.fr',
        logo: { '@type': 'ImageObject', url: 'https://volia.fr/icon.svg' },
      },
      url: 'https://volia.fr/comparatif-outils-prospection-b2b-france',
      mainEntityOfPage: 'https://volia.fr/comparatif-outils-prospection-b2b-france',
      inLanguage: 'fr-FR',
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
    {
      '@type': 'ItemList',
      name: 'Top 11 outils de prospection B2B France 2026',
      itemListElement: TOOLS.map((tool, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: tool.name,
          url: tool.href,
          applicationCategory: 'BusinessApplication',
          offers: {
            '@type': 'Offer',
            price: String(tool.entryPrice),
            priceCurrency: 'EUR',
          },
        },
      })),
    },
  ],
};

export default function ComparatifPage() {
  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ReaderHeader />

      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-violet-400 transition">
            <ArrowLeft size={14} />
            Tous les articles
          </Link>
        </div>

        <article className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 text-xs text-content-tertiary mb-4">
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300">Comparatif</span>
            <span>Mis à jour : 20 mai 2026</span>
            <span>·</span>
            <span>Anthony Malartre</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 text-content-primary">
            Comparatif des outils de prospection B2B en France (2026)
          </h1>

          <p className="text-lg text-content-secondary leading-relaxed mb-8">
            11 outils analysés : Volia, Apollo, Hunter, Lusha, Snov, Lemlist, Dropcontact, Kaspr, Cognism, ZoomInfo, Findymail.
            Prix, fonctionnalités, couverture France, conformité RGPD, et verdict pour chaque profil utilisateur.
          </p>

          {/* En résumé */}
          <div className="mb-10 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.05] p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-violet-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">En résumé</span>
            </div>
            <ul className="space-y-2 text-sm sm:text-base text-content-secondary leading-relaxed">
              <li className="flex gap-2"><span className="text-violet-400 flex-shrink-0">→</span><span><strong className="text-content-primary">Volia (19 €/mois)</strong> : ticket d&apos;entrée le moins cher du marché français, combine découverte (Google Places) + enrichissement email.</span></li>
              <li className="flex gap-2"><span className="text-violet-400 flex-shrink-0">→</span><span><strong className="text-content-primary">Apollo.io (49-99 €/mois)</strong> : référence multi-pays avec base de 275M contacts, mais surdimensionné pour la France seule.</span></li>
              <li className="flex gap-2"><span className="text-violet-400 flex-shrink-0">→</span><span><strong className="text-content-primary">Dropcontact (31 €/mois)</strong> : meilleur enrichissement RGPD-by-design pour le marché FR, sans découverte.</span></li>
              <li className="flex gap-2"><span className="text-violet-400 flex-shrink-0">→</span><span><strong className="text-content-primary">Hunter.io (34-49 €/mois)</strong> : roi de l&apos;email finder par domaine, idéal pour enrichir une liste existante.</span></li>
              <li className="flex gap-2"><span className="text-violet-400 flex-shrink-0">→</span><span><strong className="text-content-primary">Kaspr (49 €/mois)</strong> : pour extraire les contacts depuis LinkedIn (email + mobile).</span></li>
              <li className="flex gap-2"><span className="text-violet-400 flex-shrink-0">→</span><span><strong className="text-content-primary">Cognism / ZoomInfo (1200-1500 €/mois)</strong> : à réserver aux scale-up et grands comptes.</span></li>
            </ul>
          </div>

          {/* Pricing comparison */}
          <h2 className="text-2xl sm:text-3xl font-bold mt-12 mb-4 text-content-primary">Prix d&apos;entrée 2026</h2>
          <p className="text-content-secondary leading-relaxed mb-6">
            Triés du moins cher au plus cher (plan d&apos;entrée mensuel sans engagement).
          </p>

          <div className="overflow-x-auto mb-8 rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-elevated">
                  <th className="text-left p-3 text-violet-400 font-semibold">Outil</th>
                  <th className="text-left p-3 text-violet-400 font-semibold">Plan d&apos;entrée</th>
                  <th className="text-left p-3 text-violet-400 font-semibold">Prix</th>
                  <th className="text-left p-3 text-violet-400 font-semibold">Plan Pro</th>
                  <th className="text-left p-3 text-violet-400 font-semibold">Meilleur pour</th>
                </tr>
              </thead>
              <tbody>
                {[...TOOLS].sort((a, b) => a.entryPrice - b.entryPrice).map((tool) => (
                  <tr key={tool.name} className={`border-t border-line ${tool.isUs ? 'bg-violet-500/[0.04]' : ''}`}>
                    <td className="p-3 font-semibold">
                      {tool.isUs ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="text-violet-300">{tool.name}</span>
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30">Nous</span>
                        </span>
                      ) : (
                        <a href={tool.href} className="hover:text-violet-400 transition" target="_blank" rel="noopener noreferrer nofollow">{tool.name}</a>
                      )}
                    </td>
                    <td className="p-3 text-content-secondary">{tool.entryPlan}</td>
                    <td className="p-3 text-content-primary font-mono">{tool.entryPrice} €/mo</td>
                    <td className="p-3 text-content-secondary font-mono">{tool.proPrice >= 1000 ? `${tool.proPrice} €/an` : `${tool.proPrice} €/mo`}</td>
                    <td className="p-3 text-content-tertiary text-xs">{tool.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Feature comparison */}
          <h2 className="text-2xl sm:text-3xl font-bold mt-12 mb-4 text-content-primary">Fonctionnalités clés</h2>
          <p className="text-content-secondary leading-relaxed mb-6">
            Découverte de prospects (sourcing) + enrichissement email + couverture France + conformité RGPD.
          </p>

          <div className="overflow-x-auto mb-8 rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-elevated">
                  <th className="text-left p-3 text-violet-400 font-semibold">Outil</th>
                  <th className="text-left p-3 text-violet-400 font-semibold">Découverte</th>
                  <th className="text-left p-3 text-violet-400 font-semibold">Enrichissement email</th>
                  <th className="text-left p-3 text-violet-400 font-semibold">Couverture France</th>
                  <th className="text-left p-3 text-violet-400 font-semibold">RGPD</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS.map((tool) => (
                  <tr key={tool.name} className={`border-t border-line ${tool.isUs ? 'bg-violet-500/[0.04]' : ''}`}>
                    <td className="p-3 font-semibold">
                      {tool.isUs ? <span className="text-violet-300">{tool.name}</span> : tool.name}
                    </td>
                    <td className="p-3 text-content-secondary">{tool.discovery}</td>
                    <td className="p-3 text-content-secondary">{tool.enrichment}</td>
                    <td className="p-3 text-content-secondary">{tool.franceCoverage}</td>
                    <td className="p-3 text-content-secondary">{tool.rgpd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Verdict by use case */}
          <h2 className="text-2xl sm:text-3xl font-bold mt-12 mb-4 text-content-primary">Quel outil choisir selon votre profil ?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <div className="rounded-2xl border border-line bg-surface-card p-5">
              <h3 className="font-semibold text-violet-300 mb-2 flex items-center gap-2"><Zap size={16} />Freelance / solopreneur</h3>
              <p className="text-sm text-content-secondary leading-relaxed">Volia Solo (19 €/mois) + outil d&apos;outreach gratuit (Apollo free, Lemlist trial). Setup complet à moins de 25 €/mois.</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface-card p-5">
              <h3 className="font-semibold text-violet-300 mb-2 flex items-center gap-2"><Globe size={16} />PME française (2-10 salariés)</h3>
              <p className="text-sm text-content-secondary leading-relaxed">Volia Pro (49 €) + Smartlead Starter (29 €) + Folk CRM gratuit. Stack complet à ~80 €/mois.</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface-card p-5">
              <h3 className="font-semibold text-violet-300 mb-2 flex items-center gap-2"><TrendingDown size={16} />Équipe sales multi-pays</h3>
              <p className="text-sm text-content-secondary leading-relaxed">Apollo Basic (49 €) + Hunter Pro (49 €) pour cross-check + Pipedrive (49 €). ~150 €/user/mois.</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface-card p-5">
              <h3 className="font-semibold text-violet-300 mb-2 flex items-center gap-2"><Shield size={16} />Marché FR RGPD-strict</h3>
              <p className="text-sm text-content-secondary leading-relaxed">Dropcontact (31 €) ou Volia (19 €) + Lemlist (59 €). Tous les deux RGPD-by-design.</p>
            </div>
          </div>

          {/* FAQ */}
          <h2 className="text-2xl sm:text-3xl font-bold mt-12 mb-6 text-content-primary">FAQ</h2>
          <div className="space-y-4 mb-12">
            {FAQ.map((item) => (
              <div key={item.question} className="rounded-2xl border border-line bg-surface-card p-5">
                <h3 className="font-semibold text-content-primary mb-2">{item.question}</h3>
                <p className="text-sm text-content-secondary leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <Zap size={32} className="text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Essayez Volia gratuitement</h2>
            <p className="text-content-secondary mb-6 max-w-xl mx-auto">
              100 prospects offerts pour découvrir la plateforme. À partir de 19 €/mois pour passer à 1 000 prospects + 400 enrichissements — le ticket d&apos;entrée le moins cher du marché français.
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
