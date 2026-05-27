// ─────────────────────────────────────────────────────────────────────
// /en/products/prospection — Volia Prospecting (English)
// ─────────────────────────────────────────────────────────────────────

import ProductPageLayout from '@/components/ProductPageLayout';
import { ShieldCheck } from 'lucide-react';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/en/products/prospection`;
const FR_PAGE = `${SITE_URL}/produits/prospection`;

export const metadata = {
  title: 'Volia Prospecting - French B2B leads. 287k+ companies, from $21/mo',
  description: "1,000 qualified French B2B prospects in 30 seconds. 287k+ verified companies, emails + phones. 5x cheaper than Apollo. GDPR by default. Built in France. Try it free, no card.",
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
    title: 'Volia Prospecting - The Apollo alternative for France. 5x cheaper.',
    description: '287k+ verified French companies, emails + phones. From $21/mo. GDPR by default.',
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
  suiteSubtitleDefault: 'Your data flows between Prospecting, Campaigns and CRM. No copy-paste, no export/import.',
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
  { q: 'Where does the data come from?', a: 'Three sources, no purchased lists. (1) Google Places for company identification — name, address, phone, rating. (2) Live website scraping for emails (Verified). (3) Serper.dev Google search when the site is empty (Google). Fallback: pattern guess like contact@domain.fr (Probable). That\'s it.' },
  { q: 'Is it GDPR-compliant?', a: 'Yes. Built that way from day one, not bolted on later. Legitimate interest basis, opt-out on every email, public removal page, permanent blocklist. 28 personal-email domains blocked by default. EU hosting. CNIL guidelines. Your DPO will sleep at night.' },
  { q: 'Does it work outside metropolitan France?', a: 'Yes — all 5 overseas departments (Guadeloupe 971, Martinique 972, Guyane 973, Réunion 974, Mayotte 976). Same APIs, same categories, same price. Apollo and Hunter have near-zero coverage there. We don\'t.' },
  { q: 'How is this different from Apollo / Hunter?', a: 'Three things. (1) Volia is 5x cheaper — $21 vs ~$92-99/mo. (2) Volia is France-specialized — 287k FR companies, 78% coverage. Apollo/Hunter sit at ~40%. (3) Phone numbers on every row, waterfall that doesn\'t burn credits, English-friendly support, GDPR-native, EU hosting. You do the math.' },
  { q: 'Is there a daily enrichment limit?', a: 'No daily cap. You get a monthly quota based on your plan (100, 1k, 5k, 10k prospects). Use it all on Monday, spread it across the month — your call. The waterfall stops the second we find an email, so we don\'t waste your credits on useless external API calls.' },
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
        eyebrow: 'The Apollo alternative for France. 5x cheaper.',
        h1Before: '1,000 qualified prospects',
        h1Highlight: 'in France.',
        h1After: '30 seconds. Go.',
        subtitle: (
          <>
            <strong className="text-content-primary font-semibold">287,000+ verified French companies</strong>. Emails. Phone numbers.{' '}
            <strong className="text-emerald-700 font-semibold">5x cheaper than Apollo</strong>. GDPR by default.
          </>
        ),
        ctaPrimary: { label: 'Start free', href: '/signup?plan=starter' },
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
        subtitle: 'Your prospects flow straight into Campaigns to send. Then into CRM to close. No copy-paste in between.',
        otherModules: [
          { module: 'campagnes', direction: 'out', desc: 'Send cold email + SMS sequences on your extracted prospects. Templates, auto follow-ups, live stats.', cta: 'Learn more' },
          { module: 'crm', direction: 'out', desc: 'Kanban pipeline to close. Native, included. Coming soon.', cta: 'Join the beta' },
        ],
      }}
      pricing={{
        label: 'In every plan. Starter is free, forever.',
        subtext: 'Starter $0 (100/mo) - Solo $21 (1k) - Pro $55 (5k) - Business $110 (10k + Campaigns + CRM). 1-click cancel.',
        cta: 'See full pricing',
        ctaHref: '/en/pricing',
      }}
      faq={FAQ}
      finalCta={{
        title: 'Stop paying Apollo 5x too much.',
        subtitle: '100 prospects free. No card. You keep everything you export. Forever.',
        primary: { label: 'Start free', href: '/signup?plan=starter' },
        secondary: { label: 'See pricing', href: '/en/pricing' },
        trust: 'No card - 1-click cancel - Built in France',
      }}
    />
  );
}
