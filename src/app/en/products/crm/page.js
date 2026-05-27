// ─────────────────────────────────────────────────────────────────────
// /en/products/crm — Volia CRM (English)
// ─────────────────────────────────────────────────────────────────────

import ProductPageLayout from '@/components/ProductPageLayout';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/en/products/crm`;
const FR_PAGE = `${SITE_URL}/produits/crm`;

export const metadata = {
  title: 'Volia CRM - The HubSpot alternative. Included in Business at $110/mo',
  description: 'HubSpot $90. Pipedrive $49. Salesforce $125. Volia CRM: $0 extra if you\'re on Business. Drag-drop Kanban, auto-deals from replies, 360 timeline. Native to Prospecting + Campaigns. Not an integration.',
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
    title: 'Volia CRM - A CRM built into your sales tools. Not an integration.',
    description: 'A CRM built into Prospecting + Campaigns. $110/mo all-in vs $270+ for HubSpot + Apollo + Lemlist. You do the math.',
    url: PAGE_URL,
    type: 'website',
    locale: 'en_US',
  },
};

const EN_LABELS = {
  products: 'Products', features: 'Features', pricing: 'Pricing', blog: 'Blog', faq: 'FAQ',
  breadcrumbProducts: 'Products', featuresPill: 'Features',
  featuresTitlePrefix: 'Everything to', featuresTitleDefault: 'run your sales pipeline',
  howItWorksPill: 'How it works', howItWorksTitle: 'Just 3 steps',
  suitePill: 'Volia Suite', suiteTitle: 'Connected to the rest of the Volia suite',
  suiteSubtitleDefault: 'Volia CRM consumes contacts who reply in Campaigns, which come from prospects extracted in Prospecting. The loop closes natively.',
  suiteSource: 'Source', suiteDestination: 'Destination', suiteCtaDefault: 'Learn more',
  pricingPill: 'Pricing', pricingCtaDefault: 'See full pricing',
  faqPill: 'FAQ', faqTitle: 'Frequently asked questions',
  bookDemoHero: 'Or book 15 min with the founder', bookDemoFinal: 'See if Volia is right for you',
  breadcrumbAria: 'Breadcrumb',
};

const FEATURES = {
  headline: 'run your pipeline',
  subline: 'Not a mini-Salesforce. A lightweight CRM wired to Prospecting and Campaigns from day one. 6 things built for founders and small sales teams.',
  items: [
    { icon: 'KanbanSquare', featured: true, title: 'Drag-drop Kanban', desc: '5 default columns (Lead → Qualified → Demo → Proposal → Closed). Drag to move a deal. Custom stages coming Q3 2026. Live total pipeline value.' },
    { icon: 'MessageSquare', title: 'Auto-deals from replies', desc: 'Someone replies to a Campaigns sequence? A deal lands at Lead stage with the full email history. No copy-paste.' },
    { icon: 'Users', title: '360 timeline per contact', desc: 'Every email sent, opened, clicked, replied. Notes, calls, meetings. Full-text search. Pick up a conversation 3 months later without re-reading 50 emails.' },
    { icon: 'BarChart3', title: 'Auto weighting', desc: 'Each stage has a closing probability (10% Lead, 25% Qualified, 50% Demo, 75% Proposal, 100% Won). Weighted pipeline + M+1 forecast, live.' },
    { icon: 'FileText', title: 'Activities log', desc: 'Notes, calls, meetings, tasks with due dates, files per deal. @mention a teammate. Immutable, timestamped history.' },
    { icon: 'Send', wide: true, title: 'Native Prospecting integration', desc: 'Volia Prospecting result → "Send to CRM" button → deal created. Name, city, industry, phone auto-mapped. Zero CSV.' },
  ],
};

const HOW_IT_WORKS = [
  { icon: 'Settings', title: '1. Setup in 5 minutes', desc: 'Default pipeline out of the box: 5 stages, probabilities preset. No consultant, no onboarding call, no template to pick.' },
  { icon: 'MessageSquare', title: '2. Deals show up by themselves', desc: 'Every positive reply to Campaigns creates a deal at Lead stage with full history. You never miss an opportunity.' },
  { icon: 'TrendingUp', title: '3. Drag to close', desc: 'Drag deals stage to stage. Add notes, calls, files. Weighted forecast, close rate, cycle time — all computed live.' },
];

const FAQ = [
  { q: 'What are the default pipeline stages?', a: '5 stages: Lead (10%), Qualified (25%), Demo (50%), Proposal (75%), Closed (100%). Plus a Lost stage to archive with a reason (no budget, competitor, timing). Weighted pipeline + M+1 forecast recompute every time you move a deal.' },
  { q: 'Can I create custom stages?', a: 'Not yet. Q3 2026 on the roadmap. We chose to ship one standard pipeline first so beta users could set up in 5 min. Custom pipelines come with a visual editor (drag to reorder, slider for probability, color per column).' },
  { q: 'How does auto-create from replies work?', a: 'Volia Campaigns classifies replies (positive vs auto-reply vs not interested) via Claude. Positive reply = deal in CRM at Lead stage, with full contact, email history (sent/opened/clicked), reply content, and auto-tag with the sequence name. You do nothing.' },
  { q: 'How is it different from free HubSpot CRM?', a: 'HubSpot CRM free has Kanban + timeline. Sure. But: (1) for outbound you need Marketing Hub ($45/mo+). (2) No native HubSpot ↔ Apollo/Lemlist integration — Zapier costs $30/mo more. (3) Free tier caps at 5 deal pipelines. Volia CRM lives in the same product as prospecting and sending. No integration to babysit.' },
  { q: 'Can I migrate from Pipedrive or HubSpot?', a: 'Yes. CSV import today (auto column mapping) for contacts and deals. Direct HubSpot/Pipedrive API migration coming Q2 2026 (no CSV). For Salesforce: manual CSV export works now. More than 5,000 contacts? We jump on a call.' },
  { q: 'How many seats does Business include?', a: '5 seats included on Business ($110/mo). Perfect for 1-5 people — founder + 2-3 SDRs + 1 closer. Need more? +$15/user/mo. Everyone gets their own dashboard and deals. Founder sees all. No $50-100/user license like HubSpot Pro or Salesforce.' },
];

export default function EnCrmPage() {
  return (
    <ProductPageLayout
      module="crm"
      status="LIVE"
      locale="en"
      labels={EN_LABELS}
      moduleLabelOverride="CRM"
      hero={{
        eyebrow: 'The HubSpot alternative. Built into your sales suite.',
        h1Before: 'A CRM built into Prospecting + Campaigns.',
        h1Highlight: 'Not an integration.',
        subtitle: (
          <>
            HubSpot $90. Pipedrive $49. Salesforce $125.{' '}
            <strong className="text-content-primary font-semibold">Volia CRM: $0 extra if you&apos;re on Business</strong>.
            Drag-drop Kanban, auto-deals from replies, <strong className="text-emerald-700 font-semibold">360 timeline per contact</strong>. You do the math.
          </>
        ),
        ctaPrimary: { label: 'Get Business $110', href: '/signup?plan=business' },
        ctaSecondary: { label: 'See pricing', href: '/en/pricing' },
        trust: [
          'Native Kanban',
          'Auto-create from replies',
          '360 timeline',
          'Included in Business $110',
        ],
        mockup: (
          <div className="rounded-2xl bg-white border border-line shadow-2xl shadow-emerald-500/10 overflow-hidden p-8">
            <div className="text-xs text-content-tertiary mb-4 font-mono">volia.fr/crm - Pipeline Q2</div>
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div><div className="text-2xl font-bold font-mono text-emerald-700">$47k</div><div className="text-[10px] text-content-tertiary uppercase tracking-wider">Weighted</div></div>
              <div><div className="text-2xl font-bold font-mono text-teal-700">21%</div><div className="text-[10px] text-content-tertiary uppercase tracking-wider">Close rate</div></div>
              <div><div className="text-2xl font-bold font-mono text-green-700">18 d</div><div className="text-[10px] text-content-tertiary uppercase tracking-wider">Avg cycle</div></div>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-[10px]">
              {['Lead', 'Qualified', 'Demo', 'Proposal', 'Closed'].map((col) => (
                <div key={col} className="bg-emerald-50 border border-emerald-200 rounded p-2 text-center">
                  <div className="font-bold text-emerald-700 uppercase tracking-wider">{col}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      }}
      features={FEATURES}
      howItWorks={HOW_IT_WORKS}
      crossSell={{
        subtitle: 'CRM pulls contacts from Campaigns. Campaigns pulls prospects from Prospecting. The loop closes itself. No Zapier.',
        otherModules: [
          { module: 'prospection', direction: 'in', desc: 'Top of funnel. 150+ industries, 101 departments, scored emails. "Send to CRM" button = 1 click.', cta: 'See Prospecting' },
          { module: 'campagnes', direction: 'in', desc: 'Email sequences with follow-ups. Every positive reply auto-creates a deal at Lead stage.', cta: 'See Campaigns' },
        ],
      }}
      pricing={{
        label: 'CRM lives in Business. $110/mo all-in.',
        subtext: 'All 3 modules together (Prospecting + Campaigns + CRM). Up to 5 seats, 10,000 prospects in pipeline, unlimited deals. No $50-100/user license like HubSpot or Salesforce.',
        cta: 'Get Business',
        ctaHref: '/signup?plan=business',
      }}
      faq={FAQ}
      finalCta={{
        title: 'A CRM that fills itself. For $90/mo less.',
        subtitle: 'End the HubSpot + Apollo + Lemlist + Zapier circus. One product. One login. One bill. Cancel anytime.',
        primary: { label: 'Get Business $110', href: '/signup?plan=business' },
        secondary: { label: 'See pricing', href: '/en/pricing' },
        trust: '$110/mo all-in - 5 seats - 10,000 prospects in pipeline - 1-click cancel - GDPR by default',
      }}
    />
  );
}
