// ─────────────────────────────────────────────────────────────────────
// /en/products/prospection — Volia Prospecting (English)
// ─────────────────────────────────────────────────────────────────────

import ProductPageLayout from '@/components/ProductPageLayout';
import { ShieldCheck } from 'lucide-react';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/en/products/prospection`;
const FR_PAGE = `${SITE_URL}/produits/prospection`;

export const metadata = {
  title: 'Volia Prospecting - French B2B emails + phones, from €19/mo',
  description: "Find emails AND phone numbers (landline + mobile) for any French B2B company. Access to the entire French B2B landscape via Google Places (live scraping), 150+ industries, 101 departments. Waterfall enrichment, GDPR by default. From €19/mo — 25 free credits every month, no card.",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      'fr-FR': FR_PAGE,
      'en-US': PAGE_URL,
      'en-GB': PAGE_URL,
      'x-default': FR_PAGE,
    },
  },
  openGraph: {
    title: 'Volia Prospecting - Find B2B emails + phone numbers in 30 seconds',
    description: 'the entire French B2B landscape via Google Places. Email + landline + mobile. From €19/mo. GDPR by default.',
    url: PAGE_URL,
    type: 'website',
    locale: 'en_US',
  },
};

const EN_LABELS = {
  products: 'Products',
  features: 'Features',
  pricing: 'Pricing',
  blog: 'Blog',
  faq: 'FAQ',
  breadcrumbProducts: 'Products',
  featuresPill: 'Features',
  featuresTitlePrefix: 'Everything to',
  featuresTitleDefault: 'succeed with Volia',
  howItWorksPill: 'How it works',
  howItWorksTitle: 'Just 3 steps',
  suitePill: 'Volia Suite',
  suiteTitle: 'Connected to the rest of the Volia suite',
  suiteSubtitleDefault: 'Your data flows between Prospecting, Campaigns, CRM, and Forms — all included free. No copy-paste, no export/import.',
  suiteSource: 'Source',
  suiteDestination: 'Destination',
  suiteCtaDefault: 'Learn more',
  pricingPill: 'Pricing',
  pricingCtaDefault: 'See full pricing',
  faqPill: 'FAQ',
  faqTitle: 'Frequently asked questions',
  bookDemoHero: 'Or book 15 min with the founder',
  bookDemoFinal: 'See if Volia is right for you',
  breadcrumbAria: 'Breadcrumb',
};

const FEATURES = {
  headline: 'find French B2B prospects, fast',
  subline: 'Full France coverage. Multi-source enrichment. A confidence score that tells you what to trust and what to skip.',
  items: [
    {
      icon: 'Search', featured: true,
      title: 'Search by industry + department',
      desc: '150+ B2B industries crossed with 101 French departments via Google Places. Multi-select regions, departments, cities. No blind spots.',
    },
    { icon: 'Layers', title: 'Waterfall enrichment', desc: 'Scrape the site. Then Google. Then patterns. We stop the second we find a real email. You don\'t burn credits.' },
    { icon: 'BarChart3', title: 'Confidence score per lead', desc: 'Verified (~85% deliverable). Google (~70%). Probable (~50%). You decide who to email first.' },
    { icon: 'Brain', title: 'AI search (powered by Claude)', desc: 'Type "find 50 B2B SaaS in Paris". 2 seconds later: a real Google Places query. No filters to learn.' },
    { icon: 'Download', title: 'Export to CSV / HubSpot / Salesforce', desc: 'Pre-mapped for every CRM. Name, address, phone, email, score, website, Google rating. Drop it in and go.' },
    { icon: 'Shield', title: 'GDPR personal-email filter', desc: '28 personal domains blocked by default (@gmail, @hotmail, @yahoo...). Toggle it off if you must. CNIL says yes.' },
  ],
};

const HOW_IT_WORKS = [
  { icon: 'Search', title: '1. Pick industry and area', desc: 'Select industries (150+) and area (regions, departments, cities). Or type it in plain English. Claude does the rest.' },
  { icon: 'Sparkles', title: '2. Volia does the work', desc: 'Google Places, website scraping, Google search, pattern fallback — all automatic. 234 scored results in 30 seconds.' },
  { icon: 'Download', title: '3. Export. Reach out. Close.', desc: 'Clean CSV. Drop it in your CRM or push it to Volia Campaigns in 1 click. No ETL, no broken columns, no headaches.' },
];

const FAQ = [
  { q: 'How many emails do I actually get?', a: 'On average, ~46% of companies that have a website come back with a verified professional email (site scraping, then Google search). The rate is higher for digital industries (SaaS, agencies, e-commerce) and lower for less-online trades (local trades, construction). You always see the confidence score before reaching out — and we never guess an email.' },
  { q: 'Where does the data come from?', a: 'Three sources, no purchased lists. (1) Google Places for company identification — name, address, phone, rating. (2) Live website scraping for emails AND phone numbers (Verified). (3) Serper.dev Google search when the site is empty (Google). Fallback: pattern guess like contact@domain.fr (Probable). That\'s it.' },
  { q: 'Do you get mobile phones too, or just landlines?', a: 'Both. The waterfall scrapes landline numbers from the company site and adds mobile enrichment on top — same logic, more sources tried. Free gets 25 phone numbers/month, Prospection 500, MAX 10,000. You always see the type (landline/mobile) per row.' },
  { q: 'Is it GDPR-compliant?', a: 'Yes. Built that way from day one, not bolted on later. Legitimate interest basis, opt-out on every email, public removal page, permanent blocklist. 28 personal-email domains blocked by default. EU hosting. CNIL guidelines. Your DPO will sleep at night.' },
  { q: 'Does it work outside metropolitan France?', a: 'Yes — all 5 overseas departments (Guadeloupe 971, Martinique 972, Guyane 973, Réunion 974, Mayotte 976). Same APIs, same categories, same price. Apollo and Hunter have near-zero coverage there. We don\'t.' },
  { q: 'How is Volia different from a generic prospecting tool?', a: 'Three things. (1) France-specialized — all French B2B companies accessible via Google Places; we find a verified pro email for ~46% of those with a website. Generalist tools cover France poorly. (2) Phone numbers on every row, landline + mobile. (3) Waterfall that stops the second we find an email — your monthly credits are never wasted on useless external API calls.' },
  { q: 'Is there a daily enrichment limit?', a: 'No daily cap. You get monthly credits based on your plan (25 free / 500 on Prospection / 2,000 on MAX). Use them all on Monday, spread them across the month — your call.' },
];

export default function EnProspectionPage() {
  return (
    <ProductPageLayout
      module="prospection"
      status="LIVE"
      locale="en"
      labels={EN_LABELS}
      moduleLabelOverride="Prospecting"
      hero={{
        eyebrow: 'Find B2B emails AND phone numbers. In 30 seconds.',
        h1Before: 'Find emails and phones for',
        h1Highlight: 'any French company.',
        h1After: '30 seconds. Go.',
        subtitle: (
          <>
            <strong className="text-content-primary font-semibold">the entire French B2B landscape</strong> accessible via Google Places — emails, landlines, and mobile numbers all scraped in cascade.{' '}
            <strong className="text-emerald-700 font-semibold">From €19/mo — 25 free credits every month</strong>. GDPR by default.
          </>
        ),
        ctaPrimary: { label: 'Choose Prospection — €19/mo', href: '/signup?plan=prospection' },
        ctaSecondary: { label: 'See pricing', href: '/en/pricing' },
        trust: [
          (<><strong className="font-mono text-content-secondary">All</strong> French B2B</>),
          (<><strong className="font-mono text-content-secondary">101</strong> departments</>),
          (<><strong className="font-mono text-content-secondary">150+</strong> industries</>),
          (<><ShieldCheck size={12} className="text-emerald-600" /> GDPR by default</>),
        ],
        mockup: (
          <div className="rounded-2xl bg-white border border-line shadow-2xl shadow-violet-500/10 overflow-hidden p-8">
            <div className="text-xs text-content-tertiary mb-4 font-mono">volia.fr/dashboard - 234 results</div>
            {[
              { name: 'La Bonne Table', email: 'contact@labonnetable.fr' },
              { name: 'Pasta Roma', email: 'info@pastaroma.fr' },
              { name: 'Le Petit Bistrot', email: 'reservation@petitbistrot.fr' },
              { name: 'Sushi Lounge Paris', email: 'contact@sushilounge.fr' },
            ].map((row) => (
              <div key={row.name} className="flex justify-between items-center py-3 border-b border-line last:border-b-0">
                <span className="text-sm font-semibold text-content-primary">{row.name}</span>
                <span className="text-xs text-content-tertiary font-mono">{row.email}</span>
              </div>
            ))}
          </div>
        ),
      }}
      features={FEATURES}
      howItWorks={HOW_IT_WORKS}
      crossSell={{
        subtitle: 'Your prospects flow straight into Campaigns to send, then into CRM to close. Forms capture inbound. All free for everyone. No copy-paste in between.',
        otherModules: [
          { module: 'campagnes', direction: 'out', desc: 'Send cold email sequences on your extracted prospects. Templates, auto follow-ups, live stats. Included free for everyone.', cta: 'Learn more' },
          { module: 'crm', direction: 'out', desc: 'Drag-drop Kanban pipeline to close deals. Auto-created from email replies. Included free for everyone.', cta: 'Learn more' },
          { module: 'formulaires', direction: 'out', desc: 'Form builder with native CRM + Campaigns bridges. Capture inbound leads. Included free for everyone.', cta: 'Learn more' },
        ],
      }}
      pricing={{
        label: 'In every plan. 25 free credits every month, forever.',
        subtext: 'Free: 25 credits/month + the whole suite included - Prospection €19/mo: 500 credits + 500 phone numbers + unlimited exports - MAX €179/mo (code MAX99: first 3 months at €99): 2,000 credits + Autopilot. 1-click cancel.',
        cta: 'See full pricing',
        ctaHref: '/en/pricing',
      }}
      faq={FAQ}
      finalCta={{
        title: 'Stop overpaying for prospecting.',
        subtitle: '25 free credits every month. No card. You keep everything you export. Forever.',
        primary: { label: 'Start for free', href: '/signup?plan=free' },
        secondary: { label: 'See pricing', href: '/en/pricing' },
        trust: 'No card - 1-click cancel - Built in France',
      }}
    />
  );
}
