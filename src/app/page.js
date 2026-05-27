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
  title: 'Volia — Générateur email + téléphone B2B France (à partir de 19 €/mois)',
  description: 'Le générateur de leads B2B français : trouvez les emails et téléphones (fixe & mobile) de 287 000+ entreprises. 150+ catégories, 101 départements, scraping cascade. À partir de 19 €/mois, sans CB.',
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
    title: 'Volia — Générateur email + téléphone B2B à partir de 19 €/mois',
    description: 'Trouvez les emails et téléphones (fixe & mobile) de 287 000+ entreprises françaises. 150+ catégories B2B, 101 départements. Scraping cascade avec scoring de confiance.',
    url: SITE_URL,
    siteName: 'Volia',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volia — Générateur email + téléphone B2B',
    description: 'Email + téléphone (fixe & mobile) de 287 000+ entreprises FR. 150+ catégories, 101 départements. À partir de 19 €/mois.',
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
  offers: [
    {
      '@type': 'Offer',
      name: 'Starter',
      description: '100 prospects · 20 enrichissements · 5 exports par mois',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/signup`,
    },
    {
      '@type': 'Offer',
      name: 'Solo',
      description: '1 000 prospects · 400 enrichissements par mois',
      price: '19',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/signup`,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '19',
        priceCurrency: 'EUR',
        unitText: 'MONTH',
        referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'MON' },
      },
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      description: '5 000 prospects · 2 000 enrichissements par mois',
      price: '49',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/signup`,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '49',
        priceCurrency: 'EUR',
        unitText: 'MONTH',
        referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'MON' },
      },
    },
    {
      '@type': 'Offer',
      name: 'Business',
      description: '10 000 prospects · 4 000 enrichissements par mois',
      price: '99',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/signup`,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '99',
        priceCurrency: 'EUR',
        unitText: 'MONTH',
        referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'MON' },
      },
    },
  ],
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
