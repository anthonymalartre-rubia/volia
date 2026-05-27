// ─────────────────────────────────────────────────────────────────────
// /en — Volia landing (English) for US/UK markets
// ─────────────────────────────────────────────────────────────────────
// hreflang fr/en bi-directional, USD prices shown alongside EUR billing.
// May 2026 pivot: customer-value first (no more "5x cheaper than Apollo
// + Lemlist + HubSpot"). Volia = a B2B email + phone generator, with
// 3 secondary modules (Campaigns / CRM / Forms) as a Business bonus.
// ─────────────────────────────────────────────────────────────────────

import LandingContentEN from '@/components/LandingContentEN';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/en`;

export const metadata = {
  title: 'Volia - Find B2B emails and phone numbers in 30 seconds. From $21/mo',
  description: 'The French B2B lead generator. 287,000+ verified companies, email + phone (landline & mobile), waterfall enrichment, GDPR by default. From $21 (EUR 19) / month, no card. Business plan ($169/mo) adds Campaigns + CRM + Forms.',
  alternates: {
    canonical: PAGE_URL,
    languages: {
      'fr-FR': SITE_URL,
      'en-US': PAGE_URL,
      'en-GB': PAGE_URL,
      'x-default': SITE_URL,
    },
  },
  openGraph: {
    title: 'Volia - B2B email + phone generator from $21/mo',
    description: 'Find verified B2B emails + phone numbers in 30 seconds. 287,000+ French companies. GDPR by default.',
    url: PAGE_URL,
    siteName: 'Volia',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volia - B2B email + phone generator from $21/mo',
    description: 'Find verified B2B emails + phone numbers in 30 seconds. 287,000+ French companies. GDPR by default.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD : SoftwareApplication schema in EN with USD offers.
// highPrice = $1,799/yr (Business annual ≈ EUR 1,690).
const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Volia',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'SalesIntelligence',
  operatingSystem: 'Web',
  description: 'B2B lead generator built in France. Find verified emails and phone numbers (landline + mobile) for 287,000+ French companies via waterfall enrichment. Plus optional Campaigns + CRM + Forms on Business plan. Starts at $21 (EUR 19) per month.',
  url: PAGE_URL,
  inLanguage: 'en-US',
  countriesSupported: ['FR', 'US', 'GB'],
  featureList: [
    'B2B prospecting across 287,000+ French companies',
    'Waterfall email + phone enrichment (scraping + Google search + patterns)',
    'Landline + mobile phone numbers scraped',
    'AI natural-language search powered by Claude',
    'GDPR-compliant by default (EU hosting)',
    'No commitment, cancel anytime',
    'Optional: native cold email + 28-day warmup (Business)',
    'Optional: drag-and-drop CRM with auto-deals from replies (Business)',
    'Optional: form builder with native CRM + Campaigns bridges (Business)',
  ],
  offers: [
    { '@type': 'Offer', name: 'Starter', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: `${SITE_URL}/signup?plan=free` },
    { '@type': 'Offer', name: 'Solo', price: '21', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: `${SITE_URL}/signup?plan=solo` },
    { '@type': 'Offer', name: 'Pro', price: '55', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: `${SITE_URL}/signup?plan=pro` },
    { '@type': 'Offer', name: 'Business', price: '169', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: `${SITE_URL}/signup?plan=business`, description: 'Launch promo: first 12 months at $169/mo, then $199/mo. Includes Campaigns + CRM + Forms.' },
  ],
  publisher: {
    '@type': 'Organization',
    name: 'Volia',
    url: SITE_URL,
  },
};

export default function LandingPageEN() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <LandingContentEN />
    </>
  );
}
