import PricingContentEN from '@/components/PricingContentEN';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/en/pricing`;
const FR_PRICING = `${SITE_URL}/pricing`;

export const metadata = {
  title: 'Volia Pricing - Free B2B sales suite, Prospection from €19/mo',
  description: 'The suite is free — Campaigns, CRM, Forms & Project included for everyone. Prospection €19/mo (500 credits). MAX €179/mo: unlimited suite + Autopilot — €99/mo for 3 months with code MAX99. GDPR-native, no card.',
  alternates: {
    canonical: PAGE_URL,
    languages: {
      'fr-FR': FR_PRICING,
      'en-US': PAGE_URL,
      'en-GB': PAGE_URL,
      'x-default': FR_PRICING,
    },
  },
  openGraph: {
    title: 'Volia Pricing - Free suite included, Prospection from €19/mo',
    description: 'Campaigns, CRM, Forms & Project free for everyone. Prospection €19/mo. MAX €179/mo (code MAX99: first 3 months at €99). GDPR-native, no card.',
    url: PAGE_URL,
    siteName: 'Volia',
    locale: 'en_US',
    type: 'website',
  },
};

// JSON-LD pricing structured data. Freemium lineup: Free / Prospection
// / MAX. Yearly MAX price is the highPrice anchor (€1,690/yr).
const PRODUCT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Volia - B2B email + phone generator',
  description: 'B2B sales suite built in France. Campaigns + CRM + Forms + Project free for everyone. Prospecting (full French B2B landscape, waterfall email + phone enrichment) from €19/mo. MAX: unlimited suite + Autopilot.',
  url: PAGE_URL,
  brand: { '@type': 'Brand', name: 'Volia' },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: '0',
    highPrice: '179',
    offerCount: 3,
    offers: [
      { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'EUR', url: `${SITE_URL}/signup?plan=free`, description: 'The whole suite included: Campaigns (200 cold emails/mo), CRM (1 pipeline), Forms (2 forms), Project (1 project) + 25 Prospection credits/mo. Free forever, no card.' },
      { '@type': 'Offer', name: 'Prospection', price: '19', priceCurrency: 'EUR', url: `${SITE_URL}/signup?plan=prospection`, description: '500 Prospection credits/mo (1 credit = 1 email found), 500 phone numbers/mo, unlimited exports, waterfall enrichment.' },
      { '@type': 'Offer', name: 'MAX', price: '179', priceCurrency: 'EUR', url: `${SITE_URL}/signup?plan=max`, description: 'Unlimited suite + Volia Autopilot (3 workflows, IF/ELSE, A/B testing) + 2,000 credits/mo + teams/RBAC + MCP server + API. Code MAX99: first 3 months at €99/mo.' },
    ],
  },
};

export default function PricingPageEN() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_SCHEMA) }} />
      <PricingContentEN />
    </>
  );
}
