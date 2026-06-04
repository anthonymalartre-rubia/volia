import PricingContentEN from '@/components/PricingContentEN';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/en/pricing`;
const FR_PRICING = `${SITE_URL}/pricing`;

export const metadata = {
  title: 'Volia Pricing - B2B email + phone generator from $21/mo (EUR 19)',
  description: 'Find verified B2B emails + phone numbers in 30 seconds. the entire French B2B landscape. GDPR-native. From $21/mo, no card. Business $169/mo (12-month launch promo, then $199/mo) unlocks Campaigns + CRM + Forms.',
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
    title: 'Volia Pricing - B2B email + phone generator from $21/mo',
    description: 'Find verified B2B emails + phone numbers in 30 seconds. the entire French B2B landscape. GDPR-native. From $21/mo, no card.',
    url: PAGE_URL,
    siteName: 'Volia',
    locale: 'en_US',
    type: 'website',
  },
};

// JSON-LD pricing structured data. Yearly Business price is the
// highPrice anchor ($1,799/yr ≈ EUR 1,690).
const PRODUCT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Volia - B2B email + phone generator',
  description: 'B2B sales suite built in France. Prospecting (the full French B2B landscape (verified), waterfall email + phone enrichment) + optional Campaigns + CRM + Forms on Business plan.',
  url: PAGE_URL,
  brand: { '@type': 'Brand', name: 'Volia' },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '55',
    highPrice: '559',
    offerCount: 3,
    offers: [
      { '@type': 'Offer', name: 'Pro', price: '55', priceCurrency: 'USD', url: `${SITE_URL}/signup?plan=pro`, description: 'Full suite: Prospecting + Campaigns + CRM + Forms. 14-day free trial, no card. Code ETE2026: €19/mo for 3 months.' },
      { '@type': 'Offer', name: 'Business', price: '169', priceCurrency: 'USD', url: `${SITE_URL}/signup?plan=business`, description: 'Launch promo: first 12 months at $169/mo, then $199/mo. Adds volume, multi-user, MCP server + API.' },
      { '@type': 'Offer', name: 'Enterprise', price: '559', priceCurrency: 'USD', url: `${SITE_URL}/signup?plan=enterprise`, description: 'Unlimited Autopilot (A/B testing, weekly Claude optimization), everything unlimited, white-label, 99.9% SLA.' },
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
