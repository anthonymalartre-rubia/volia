// ─────────────────────────────────────────────────────────────────────
// /en/products/prospection — Volia Prospecting (English)
// ─────────────────────────────────────────────────────────────────────

import ProductPageLayout from '@/components/ProductPageLayout';
import { ShieldCheck } from 'lucide-react';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/en/products/prospection`;
const FR_PAGE = `${SITE_URL}/produits/prospection`;

export const metadata = {
  title: 'Volia Prospecting - French B2B emails + phones, from $21/mo',
  description: "Find emails AND phone numbers (landline + mobile) for any French B2B company. 287,000+ verified companies, 150+ industries, 101 departments. Waterfall enrichment, GDPR by default. From $21/mo, no card.",
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
    description: '287,000+ verified French companies. Email + landline + mobile. From $21/mo. GDPR by default.',
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
  suiteSubtitleDefault: 'On Business plan, your data flows between Prospecting, Campaigns, CRM, and Forms. No copy-paste, no export/import.',
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
  { q: 'How many emails do I actually get?', a: 'On average, 47% of prospects come back with a real professional email. Digital industries (SaaS, agencies, e-commerce): 70-85%. Less online industries (local trades, construction): 30-45%. You always see the confidence score before reaching out.' },
  { q: 'Where does the data come from?', a: 'Three sources, no purchased lists. (1) Google Places for company identification — name, address, phone, rating. (2) Live website scraping for emails AND phone numbers (Verified). (3) Serper.dev Google search when the site is empty (Google). Fallback: pattern guess like contact@domain.fr (Probable). That\'s it.' },
  { q: 'Do you get mobile phones too, or just landlines?', a: 'Both. Starter and Solo get landline numbers (when published on the company site). Pro and Business add mobile phone enrichment — same waterfall logic, just more sources tried. You always see the type (landline/mobile) per row.' },
  { q: 'Is it GDPR-compliant?', a: 'Yes. Built that way from day one, not bolted on later. Legitimate interest basis, opt-out on every email, public removal page, permanent blocklist. 28 personal-email domains blocked by default. EU hosting. CNIL guidelines. Your DPO will sleep at night.' },
  { q: 'Does it work outside metropolitan France?', a: 'Yes — all 5 overseas departments (Guadeloupe 971, Martinique 972, Guyane 973, Réunion 974, Mayotte 976). Same APIs, same categories, same price. Apollo and Hunter have near-zero coverage there. We don\'t.' },
  { q: 'How is Volia different from a generic prospecting tool?', a: 'Three things. (1) France-specialized — 287k verified FR companies, 78% email coverage. Generalist tools sit around 40% on France. (2) Phone numbers on every row, landline + mobile (Pro+). (3) Waterfall that stops the second we find an email — your monthly quota is never wasted on useless external API calls.' },
  { q: 'Is there a daily enrichment limit?', a: 'No daily cap. You get a monthly quota based on your plan (20 / 400 / 1,200 / 10,000 enrichments). Use it all on Monday, spread it across the month — your call.' },
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
            <strong className="text-content-primary font-semibold">287,000+ verified French companies</strong>. Emails, landlines, and mobile numbers — all scraped in cascade.{' '}
            <strong className="text-emerald-700 font-semibold">From $21/mo</strong>. GDPR by default.
          </>
        ),
        ctaPrimary: { label: 'Start free', href: '/signup?plan=free' },
        ctaSecondary: { label: 'See pricing', href: '/en/pricing' },
        trust: [
          (<><strong className="font-mono text-content-secondary">287,000+</strong> companies</>),
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
        subtitle: 'On Business plan, your prospects flow straight into Campaigns to send, then into CRM to close. Forms capture inbound. No copy-paste in between.',
        otherModules: [
          { module: 'campagnes', direction: 'out', desc: 'Send cold email sequences on your extracted prospects. Templates, auto follow-ups, live stats. Business plan only.', cta: 'Learn more' },
          { module: 'crm', direction: 'out', desc: 'Drag-drop Kanban pipeline to close deals. Auto-created from email replies. Business plan only.', cta: 'Learn more' },
          { module: 'formulaires', direction: 'out', desc: 'Form builder with native CRM + Campaigns bridges. Capture inbound leads. Business plan only.', cta: 'Learn more' },
        ],
      }}
      pricing={{
        label: 'In every plan. Starter is free, forever.',
        subtext: 'Starter $0 (20 enrichments/mo) - Solo $21 (400) - Pro $55 (1,200) - Business $169 (10,000 + Campaigns + CRM + Forms). 1-click cancel.',
        cta: 'See full pricing',
        ctaHref: '/en/pricing',
      }}
      faq={FAQ}
      finalCta={{
        title: 'Stop overpaying for prospecting.',
        subtitle: '100 prospects free. No card. You keep everything you export. Forever.',
        primary: { label: 'Start free', href: '/signup?plan=free' },
        secondary: { label: 'See pricing', href: '/en/pricing' },
        trust: 'No card - 1-click cancel - Built in France',
      }}
    />
  );
}
