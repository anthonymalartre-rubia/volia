// ─────────────────────────────────────────────────────────────────────
// /en — Volia landing (English) for US/UK markets
// ─────────────────────────────────────────────────────────────────────
// hreflang fr/en bi-directional, EUR prices (billing currency).
// June 2026 freemium pivot: the suite (Campaigns / CRM / Forms /
// Project) is free for everyone. Prospection (€19/mo) sells the data,
// MAX (€179/mo, code MAX99) sells the unlimited suite + Autopilot.
// ─────────────────────────────────────────────────────────────────────

import LandingContentEN from '@/components/LandingContentEN';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/en`;

export const metadata = {
  title: 'Volia - Find B2B emails and phone numbers in 30 seconds. From €19/mo, free suite included',
  description: 'The French B2B lead generator. Access to the entire French B2B landscape via Google Places (live scraping), email + phone (landline & mobile), waterfall enrichment, GDPR by default. Campaigns + CRM + Forms + Project free for everyone. Prospection from €19/month, no card.',
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
    title: 'Volia - B2B email + phone generator from €19/mo, free suite included',
    description: 'Find verified B2B emails + phone numbers in 30 seconds. the entire French B2B landscape accessible via Google Places. CRM, Campaigns, Forms & Project free for everyone. GDPR by default.',
    url: PAGE_URL,
    siteName: 'Volia',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volia - B2B email + phone generator from €19/mo, free suite included',
    description: 'Find verified B2B emails + phone numbers in 30 seconds. the entire French B2B landscape accessible via Google Places. CRM, Campaigns, Forms & Project free for everyone. GDPR by default.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD : SoftwareApplication schema in EN with EUR offers.
// Freemium lineup: Free / Prospection / MAX (€179/mo, MAX99 promo).
const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Volia',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'SalesIntelligence',
  operatingSystem: 'Web',
  description: 'B2B lead generator built in France. Find verified emails and phone numbers (landline + mobile) for the entire French B2B landscape accessible via Google Places (live scraping) + waterfall enrichment. Campaigns + CRM + Forms + Project included free for everyone. Prospection from €19 per month.',
  url: PAGE_URL,
  inLanguage: 'en-US',
  countriesSupported: ['FR', 'US', 'GB'],
  featureList: [
    'B2B prospecting across the entire French B2B landscape',
    'Waterfall email + phone enrichment (scraping + Google search + patterns)',
    'Landline + mobile phone numbers scraped',
    'AI natural-language search powered by Claude',
    'GDPR-compliant by default (EU hosting)',
    'No commitment, cancel anytime',
    'Included free for everyone: native cold email (200/mo, your own domain)',
    'Included free for everyone: drag-and-drop CRM with auto-deals from replies',
    'Included free for everyone: form builder with native CRM + Campaigns bridges',
  ],
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: `${SITE_URL}/signup?plan=free`, description: 'The whole suite included with limits + 25 Prospection credits/mo. Free forever, no card.' },
    { '@type': 'Offer', name: 'Prospection', price: '19', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: `${SITE_URL}/signup?plan=prospection`, description: '500 Prospection credits/mo, 500 phone numbers/mo, unlimited exports, waterfall enrichment.' },
    { '@type': 'Offer', name: 'MAX', price: '179', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: `${SITE_URL}/signup?plan=max`, description: 'Unlimited suite + Volia Autopilot + 2,000 credits/mo + teams + MCP server + API. Code MAX99: first 3 months at €99/mo.' },
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
