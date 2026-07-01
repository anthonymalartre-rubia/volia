// ─────────────────────────────────────────────────────────────────────
// /en — Volia One landing (English) for US/UK markets
// ─────────────────────────────────────────────────────────────────────
// hreflang fr/en bi-directional, EUR prices (billing currency).
// Volia One = the product: enter your domain → Volia finds your
// prospects (email + phone), writes & sends your cold emails, fills
// your pipeline. 5 modules under the hood (Prospection / Campaigns /
// CRM / Forms / Project). 3 plans = 3 intensities of Volia One:
// Free (try it) → Prospection €19/mo (solo) → MAX €179/mo (Volia One
// on 24/7 autopilot + complete suite + 2,000 credits, code MAX99).
// ─────────────────────────────────────────────────────────────────────

import LandingContentEN from '@/components/LandingContentEN';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/en`;

export const metadata = {
  title: 'Volia One - Enter your domain, Volia finds, writes and sends. From €19/mo, free suite included',
  description: 'Volia One: enter your domain → Volia finds your prospects (email + phone), writes and sends your cold emails, and fills your pipeline. B2B prospecting France via Google Places (live scraping) + waterfall enrichment, GDPR by default. Campaigns + CRM + Forms + Project free for everyone. From €19/month, no card. Apollo alternative.',
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
    title: 'Volia One - Enter your domain. Volia finds, writes, sends. From €19/mo, free suite included',
    description: 'Enter your domain → Volia One finds your prospects (email + phone), writes and sends your cold emails, and fills your pipeline. B2B prospecting France via Google Places. CRM, Campaigns, Forms & Project free for everyone. GDPR by default.',
    url: PAGE_URL,
    siteName: 'Volia',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volia One - Enter your domain. Volia finds, writes, sends. From €19/mo, free suite included',
    description: 'Enter your domain → Volia One finds your prospects (email + phone), writes and sends your cold emails, and fills your pipeline. B2B prospecting France via Google Places. CRM, Campaigns, Forms & Project free for everyone. GDPR by default.',
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
  name: 'Volia One',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'SalesIntelligence',
  operatingSystem: 'Web',
  description: 'Volia One: enter your domain → Volia finds your prospects (email + phone), writes and sends your cold emails, and fills your pipeline. Built in France. B2B prospecting France via Google Places (live scraping) + waterfall enrichment, powered by 5 modules under the hood (Prospection, Campaigns, CRM, Forms, Project). Campaigns + CRM + Forms + Project included free for everyone. From €19 per month. A GDPR-native Apollo alternative for France.',
  url: PAGE_URL,
  inLanguage: 'en-US',
  countriesSupported: ['FR', 'US', 'GB'],
  featureList: [
    'Enter your domain — Volia One finds, writes and sends automatically',
    'B2B prospecting across the entire French B2B landscape (France)',
    'Waterfall email + phone enrichment (scraping + Google search + patterns)',
    'Landline + mobile phone numbers scraped',
    'AI natural-language search powered by Claude',
    '24/7 Autopilot mode (MAX plan): Volia One runs your pipeline hands-free',
    '5 modules under the hood: Prospection, Campaigns, CRM, Forms, Project',
    'GDPR-compliant by default (EU hosting) — Apollo alternative for France',
    'No commitment, cancel anytime',
    'Included free for everyone: native cold email (200/mo, your own domain)',
    'Included free for everyone: drag-and-drop CRM with auto-deals from replies',
    'Included free for everyone: form builder with native CRM + Campaigns bridges',
  ],
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: `${SITE_URL}/signup?plan=free`, description: 'The whole suite included with limits + 25 Prospection credits/mo. Free forever, no card.' },
    { '@type': 'Offer', name: 'Prospection', price: '19', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: `${SITE_URL}/signup?plan=prospection`, description: '500 Prospection credits/mo, 500 phone numbers/mo, unlimited exports, waterfall enrichment.' },
    { '@type': 'Offer', name: 'MAX', price: '179', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: `${SITE_URL}/signup?plan=max`, description: 'Volia One on 24/7 autopilot + complete suite + 2,000 credits/mo + teams + MCP server + API. Code MAX99: first 3 months at €99/mo.' },
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
