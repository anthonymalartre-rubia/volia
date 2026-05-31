import LandingContent from '@/components/LandingContent';
import { FAQ_ITEMS } from '@/lib/faq-data';
import { getTrustpilotData, TRUSTPILOT_PROFILE_URL } from '@/lib/trustpilot-data';

const SITE_URL = 'https://volia.fr';

// aggregateRating Trustpilot — injecté uniquement si configuré + au moins
// 1 avis. Sinon vaut undefined et est omis du schema (Object.assign skip).
const trustpilotData = getTrustpilotData();
const trustpilotAggregateRating = trustpilotData
  ? {
      '@type': 'AggregateRating',
      ratingValue: String(trustpilotData.rating),
      reviewCount: String(trustpilotData.reviewCount),
      bestRating: '5',
      worstRating: '1',
    }
  : null;

export const metadata = {
  title: 'Volia — Suite B2B française : Prospection, Campagnes, CRM, Formulaires',
  description: 'La suite SaaS B2B française : 4 modules connectés (Prospection, Campagnes email, CRM, Formulaires). 287 000+ entreprises avec emails + téléphones, séquences automatisées, pipeline commercial. Made in France, RGPD.',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'fr-FR': SITE_URL,
      'en-US': `${SITE_URL}/en`,
      'en-GB': `${SITE_URL}/en`,
      'x-default': SITE_URL,
    },
  },
  openGraph: {
    title: 'Volia — Suite B2B française : Prospection, Campagnes, CRM, Formulaires',
    description: 'La suite SaaS B2B française qui connecte 4 modules : trouve tes leads, lance tes séquences email, suis tes deals dans le CRM, capte les nouveaux prospects via formulaires. Made in France.',
    url: SITE_URL,
    siteName: 'Volia',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volia — Suite B2B FR : Prospection, Campagnes, CRM, Forms',
    description: '4 modules connectés pour ton outbound : trouve, contacte, suis tes deals, capte. Made in France, RGPD.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for SaaS product (SoftwareApplication + offers + ratings)
const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Volia',
  alternateName: ['Volia.fr', 'Volia.fr'],
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'SalesIntelligence',
  operatingSystem: 'Web',
  description: 'Plateforme française de prospection B2B automatisée. Recherche d\'entreprises via Google Places (150+ catégories, 101 départements) + enrichissement email en cascade (scraping intelligent, recherche Google, fallback patterns) avec scoring de confiance. À partir de 19 €/mois.',
  url: SITE_URL,
  inLanguage: 'fr-FR',
  countriesSupported: 'FR',
  featureList: [
    'Recherche d\'entreprises B2B via Google Places',
    'Couverture des 101 départements français (métropole + DROM)',
    '150+ catégories d\'activité',
    'Enrichissement email en cascade (waterfall)',
    'Scraping intelligent des sites web',
    'Scoring de confiance par email',
    'Export CSV compatible tous CRM',
    'Recherche en langage naturel (IA Claude)',
    'Conformité RGPD (filtre emails personnels, opt-out public)',
    'Pas d\'engagement, annulation à tout moment',
  ],
  // AggregateOffer (résumé) sur la homepage — le détail complet des 4 plans
  // vit sur /pricing (page dédiée), avec son propre JSON-LD Offer détaillé.
  //
  // [31 mai 2026] Migration `Offer[]` → `AggregateOffer` pour éliminer la
  // duplication massive de contenu pricing entre `/` et `/pricing`. Google
  // Search Console signalait "Page en double : Google n'a pas choisi la même
  // URL canonique que l'utilisateur" sur la homepage — 56% du vocabulaire de
  // /pricing était également présent sur /. Cette simplification rend la
  // homepage clairement différente du sujet "pricing".
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: '0',
    highPrice: '179',
    offerCount: '4',
    availability: 'https://schema.org/InStock',
    url: `${SITE_URL}/pricing`,
  },
  // aggregateRating Trustpilot — injecté conditionnellement via le spread
  // ci-dessous. Sans collecteur tiers vérifié, aucune note publiée
  // (DGCCRF art L.121-2 + Google "Manipulative review snippets").
  ...(trustpilotAggregateRating ? { aggregateRating: trustpilotAggregateRating } : {}),
  publisher: {
    '@type': 'Organization',
    name: 'Volia',
    url: SITE_URL,
    // Lien vers Trustpilot pour permettre à Google de vérifier la source
    ...(trustpilotData ? { sameAs: [TRUSTPILOT_PROFILE_URL] } : {}),
  },
};

// FAQPage schema — Google renders Q/R rich snippet in SERP
const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <LandingContent />
    </>
  );
}
