// ─────────────────────────────────────────────────────────────────────
// /outils/trouver-emails — Outil gratuit standalone (cheval de Troie SEO).
// ─────────────────────────────────────────────────────────────────────
// Page publique, indexable et partageable. Réutilise le HeroSearchWidget
// (qui tape /api/public/preview : rate-limité 2/IP/jour, cap global,
// cache 24h, résultats anonymisés). Objectif : démontrer la valeur AVANT
// l'inscription + capter la longue traîne « trouver email <secteur> <ville> ».
// Garde-fous DGCCRF respectés : aperçu anonymisé, RGPD natif, l'humain
// garde la main. Aucun chiffre inventé.
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { ArrowRight, Search, ShieldCheck, Zap, Download } from 'lucide-react';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';
import HeroSearchWidget from '@/components/HeroSearchWidget';

const BASE_URL = 'https://volia.fr';
const PAGE_URL = `${BASE_URL}/outils/trouver-emails`;

export const metadata = {
  title: 'Trouver les emails des entreprises — outil gratuit',
  description:
    "Trouvez gratuitement les emails professionnels d'entreprises par secteur et par ville en France. Données Google Places, aperçu anonymisé, conforme RGPD. Sans carte bancaire.",
  alternates: { canonical: PAGE_URL },
  keywords: [
    'trouver email entreprise',
    'email finder gratuit',
    'trouver email professionnel',
    'trouver email par secteur ville',
    'rechercher email entreprise france',
    'outil prospection gratuit',
  ],
  openGraph: {
    title: 'Trouver les emails des entreprises — gratuit',
    description:
      "Recherchez les emails pro par secteur + ville en France. Aperçu gratuit, données réelles, conforme RGPD. Sans carte bancaire.",
    url: PAGE_URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trouver les emails des entreprises — gratuit',
    description: 'Recherchez les emails pro par secteur + ville en France. Aperçu gratuit, conforme RGPD.',
  },
};

const breadcrumbs = [
  { label: 'Accueil', href: '/' },
  { label: 'Outils de prospection', href: '/outils' },
  { label: 'Trouver des emails' },
];

const FAQ = [
  {
    q: 'Cet outil est-il vraiment gratuit ?',
    a: "Oui. La recherche par secteur + ville et la vérification d'email sont gratuites, sans carte bancaire. L'aperçu affiche un échantillon de résultats anonymisés ; pour voir tous les emails et les exporter en CSV, il suffit de créer un compte (plan Gratuit : 25 crédits offerts chaque mois).",
  },
  {
    q: "D'où viennent les données ?",
    a: "Les résultats proviennent de sources publiques (Google Places et le web). Volia ne revend pas de bases : à chaque recherche, on interroge en direct puis on enrichit l'email professionnel quand il est trouvable sur le site de l'entreprise.",
  },
  {
    q: 'Est-ce conforme au RGPD ?',
    a: "Les emails professionnels génériques (contact@, info@…) relèvent de la prospection B2B encadrée. Volia est conçu pour rester conforme : aperçu anonymisé, filtrage des emails personnels activable, et page d'opt-out publique. Vous restez responsable de l'usage que vous en faites — l'outil ne lance aucun envoi à votre place.",
  },
  {
    q: 'Combien de recherches puis-je faire ?',
    a: "Quelques essais gratuits par jour depuis cette page. Avec un compte Volia, vous lancez des recherches sur 101 départements et 150+ secteurs, avec scoring de confiance sur chaque email.",
  },
];

export default function TrouverEmailsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema(breadcrumbs),
      {
        '@type': 'WebApplication',
        name: 'Volia — Trouver les emails des entreprises',
        url: PAGE_URL,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        inLanguage: 'fr-FR',
        description: metadata.description,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ReaderHeader />

      <main className="pt-24 pb-16">
        {/* Hero + widget */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav className="text-xs text-content-tertiary mb-4 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-content-secondary">Accueil</Link>
            <span>/</span>
            <Link href="/outils" className="hover:text-content-secondary">Outils</Link>
            <span>/</span>
            <span className="text-content-secondary">Trouver des emails</span>
          </nav>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-4">
            <Zap size={12} /> Gratuit · sans carte bancaire
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Trouver les emails des entreprises
          </h1>
          <p className="text-base sm:text-lg text-content-secondary leading-relaxed mb-6 max-w-2xl">
            Tapez un secteur et une ville. Volia interroge les données publiques et trouve les
            emails professionnels — comme « restaurants à Marseille » ou « avocats à Lyon ».
            Aperçu gratuit, données réelles, conforme RGPD.
          </p>

          <HeroSearchWidget />

          <p className="text-xs text-content-tertiary mt-3">
            Aperçu anonymisé par éthique RGPD. Créez un compte gratuit pour voir tous les emails et exporter en CSV.
          </p>
        </section>

        {/* Comment ça marche */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-14">
          <h2 className="text-xl font-bold mb-6">Comment ça marche</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Search, title: '1. Décrivez votre cible', text: 'Un secteur (restaurants, avocats, garages…) et une ville ou un département.' },
              { icon: Zap, title: '2. Volia cherche en direct', text: 'On interroge les sources publiques et on enrichit l’email pro trouvable sur le site.' },
              { icon: Download, title: '3. Exportez vos prospects', text: 'Avec un compte gratuit : tous les emails, le scoring de confiance et l’export CSV / Zoho.' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="rounded-xl border border-line bg-surface-elevated/40 p-4">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-300 mb-3">
                    <Icon size={16} />
                  </div>
                  <div className="font-semibold text-sm mb-1">{s.title}</div>
                  <p className="text-xs text-content-secondary leading-relaxed">{s.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bloc confiance RGPD */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
          <div className="rounded-xl border border-line bg-surface-elevated/40 p-5 flex items-start gap-3">
            <ShieldCheck size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm mb-1">Prospection B2B, faite proprement</div>
              <p className="text-xs text-content-secondary leading-relaxed">
                Volia se concentre sur les emails professionnels et propose un filtrage des emails
                personnels, une page d’opt-out publique et un scoring de confiance sur chaque adresse.
                L’outil ne lance aucun envoi tout seul : vous gardez la main sur ce que vous contactez.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-12">
          <h2 className="text-xl font-bold mb-6">Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <details key={i} className="group rounded-xl border border-line bg-surface-elevated/40 p-4">
                <summary className="font-semibold text-sm cursor-pointer list-none flex items-center justify-between gap-2">
                  {f.q}
                  <span className="text-content-tertiary group-open:rotate-180 transition">▾</span>
                </summary>
                <p className="text-sm text-content-secondary leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-12">
          <div className="rounded-2xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-6 sm:p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Allez plus loin gratuitement</h2>
            <p className="text-sm text-content-secondary mb-5 max-w-xl mx-auto">
              101 départements, 150+ secteurs, scoring de confiance et export CSV.
              Plan Gratuit : 25 crédits offerts chaque mois — sans carte bancaire.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
            >
              Créer mon compte gratuit
              <ArrowRight size={16} />
            </Link>
            <div className="mt-5 text-xs text-content-tertiary flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <Link href="/outils" className="hover:text-content-secondary">Tous les outils de prospection</Link>
              <Link href="/etude" className="hover:text-content-secondary">Études & baromètres B2B</Link>
              <Link href="/produits/prospection" className="hover:text-content-secondary">Volia Prospection</Link>
            </div>
          </div>
        </section>
      </main>

      <ReaderFooter />
    </div>
  );
}
