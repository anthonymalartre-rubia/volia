import LandingContent from '@/components/LandingContent';

const SITE_URL = 'https://prospectia.cloud';

export const metadata = {
  title: 'Prospectia.ai — Trouvez l\'email de n\'importe quelle entreprise en France',
  description: 'Prospectia scrape les sites web et cherche sur Google pour trouver l\'email professionnel de chaque entreprise. 150+ catégories B2B, 101 départements, scoring de confiance. À partir de 49€/mois.',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'fr-FR': SITE_URL,
      'x-default': SITE_URL,
    },
  },
  openGraph: {
    title: 'Prospectia.ai — Trouvez l\'email de n\'importe quelle entreprise en France',
    description: 'Scraping intelligent + recherche Google. 150+ catégories B2B, 101 départements, scoring de confiance. À partir de 49€/mois.',
    url: SITE_URL,
    siteName: 'Prospectia.ai',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prospectia.ai — Prospection B2B automatisée',
    description: 'Trouvez l\'email de n\'importe quelle entreprise en France. Scraping + Google, scoring IA, 150+ catégories.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for SaaS product
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Prospectia.ai',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Plateforme de prospection B2B automatisée en France. Scraping intelligent + recherche Google pour trouver les emails professionnels.',
  url: SITE_URL,
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: '0',
    highPrice: '149',
    offerCount: '3',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '50',
  },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingContent />
    </>
  );
}
