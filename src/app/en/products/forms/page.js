// ─────────────────────────────────────────────────────────────────────
// /en/products/forms — Volia Forms (English)
// ─────────────────────────────────────────────────────────────────────

import ProductPageLayout from '@/components/ProductPageLayout';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/en/products/forms`;
const FR_PAGE = `${SITE_URL}/produits/formulaires`;

export const metadata = {
  title: 'Volia Forms - Forms that feed your CRM, not a spreadsheet',
  description:
    'Typeform is $25. Tally is $29 for Pro. Volia Forms is included in Solo at $19. Drag-drop builder, multi-step, conditional logic, native bridges to CRM and cold email. No more Tally + Zapier + HubSpot. GDPR by default.',
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
    title: 'Volia Forms - A form builder that talks natively to your CRM',
    description: 'One tool instead of Typeform + Tally + Zapier. Multi-step, conditional logic, native CRM bridges. $19/mo.',
    url: PAGE_URL,
    type: 'website',
    locale: 'en_US',
  },
};

const EN_LABELS = {
  products: 'Products', features: 'Features', pricing: 'Pricing', blog: 'Blog', faq: 'FAQ',
  breadcrumbProducts: 'Products', featuresPill: 'Features',
  featuresTitlePrefix: 'Everything to', featuresTitleDefault: 'capture leads better than Typeform',
  howItWorksPill: 'How it works', howItWorksTitle: 'Just 3 steps',
  suitePill: 'Volia Suite', suiteTitle: 'Connected to the rest of the Volia suite',
  suiteSubtitleDefault: 'Forms feed the CRM and trigger Campaigns sequences. The inbound loop, fully automated.',
  suiteSource: 'Source', suiteDestination: 'Destination', suiteCtaDefault: 'Learn more',
  pricingPill: 'Pricing', pricingCtaDefault: 'See full pricing',
  faqPill: 'FAQ', faqTitle: 'Frequently asked questions',
  bookDemoHero: 'Or book 15 min with the founder', bookDemoFinal: 'See if Volia is right for you',
  breadcrumbAria: 'Breadcrumb',
};

const FEATURES = {
  headline: 'capture leads better than Typeform',
  subline: 'Drag-drop builder. Multi-step with conditional logic. Native bridges to CRM and cold email. Three things Typeform + Tally + JotForm can\'t do together.',
  items: [
    { icon: 'FormInput', featured: true, title: 'Drag-drop builder', desc: '12 field types. Multi-step pages. Real-time auto-save. As fast as Tally, as polished as Typeform. With bridges neither of them has.' },
    { icon: 'Workflow', title: 'Conditional logic AND/OR', desc: 'Show/hide fields. Skip-to-page jumps. 13 operators (equals, contains, greater_than...). Build complex flows without code.' },
    { icon: 'Layers', title: 'Native CRM + Campaigns bridges', desc: 'Every submission auto-creates a CRM contact and lands in a Campaigns list. No Zapier. No webhooks. That\'s the whole point.' },
    { icon: 'Shield', title: 'GDPR by default', desc: 'IP hashed (SHA-256). Explicit opt-in. 1-click erasure. Retention policies. CNIL-compliant boilerplate included.' },
    { icon: 'QrCode', title: 'QR code + embed iframe', desc: 'Each form has a QR (size + color customizable, PNG + SVG) and an embed iframe for WordPress, Webflow, Notion. Phygital-ready.' },
    { icon: 'Webhook', wide: true, title: 'Outbound webhooks + 6 templates ready to ship', desc: '4 events (form.submitted, form.bridge_succeeded, form.bridge_failed, form.published) signed HMAC-SHA256. Zapier + Make docs. 6 ready-to-use templates: Contact, Lead magnet, B2B quote, Event registration, CV application, NPS feedback.' },
  ],
};

const HOW_IT_WORKS = [
  { icon: 'FormInput', title: '1. Build it', desc: 'Drag fields onto the canvas. Add pages, logic, validation. Auto-saves every second.' },
  { icon: 'Send', title: '2. Publish & share', desc: 'One click to publish at volia.fr/f/your-slug. Grab the embed code, the QR code, or the direct URL.' },
  { icon: 'Workflow', title: '3. Watch leads land', desc: 'Every submission = a CRM contact + (optionally) a Campaigns list entry + your sequences fire. Zero manual work.' },
];

const FAQ = [
  { q: 'How is this different from Typeform or Tally?', a: 'Three things. (1) Native bridges to Volia CRM + Cold Email. Typeform and Tally need Zapier. (2) Included in Solo at $19/mo. Typeform is $25 standalone. (3) French-built, GDPR by default — IP hashed, EU-hosted, CNIL boilerplate included. If you already run Volia, Forms closes the inbound loop without adding a tool.' },
  { q: 'How many forms and submissions per plan?', a: 'Solo: 1 form, 100 submissions/mo. Pro: 5 forms, 1,000 submissions/mo. Business: unlimited. Soft limit — we email you at 80% before anything breaks. Free plan does not include Forms (yes, we want to push you to Solo).' },
  { q: 'Can I embed a Volia form on my website?', a: 'Yes. Every published form has an iframe embed that works anywhere (WordPress, Webflow, Notion, Squarespace, hand-coded). Add ?embed=true and the Volia wordmark + footer disappear. frame-ancestors header allows cross-origin.' },
  { q: 'What happens if the CRM bridge fails?', a: 'Best-effort + auto-retry. Network blip, CRM full, etc.: the submission still saves with bridge_status=failed. Cron retries every 10 min with exponential backoff (20min → 40min → 80min, max 3 tries). 3 failures = email with a link to re-trigger manually from the admin UI.' },
  { q: 'Is there a free plan for Forms?', a: 'No. Forms ships starting at Solo ($19/mo). We considered free, said no — the value is in the bridges, and we won\'t dilute it. If you just want a free form builder, Tally is genuinely good for that.' },
  { q: 'Can I migrate from Typeform / Tally?', a: 'No automated import yet — we\'re honest about it. You\'ll need to rebuild in our builder. Drag-drop UX is fast (Tally-like). Once rebuilt, bridges kill the Zapier middleman forever. Complex form (10+ fields, conditional logic)? Email founder@volia.fr and we rebuild it for you in under an hour.' },
];

export default function EnFormsPage() {
  return (
    <ProductPageLayout
      module="formulaires"
      status="LIVE"
      locale="en"
      labels={EN_LABELS}
      moduleLabelOverride="Forms"
      hero={{
        eyebrow: 'The Typeform + Tally alternative. Without the Zapier tax.',
        h1Before: 'Forms that feed your',
        h1Highlight: 'CRM.',
        h1After: 'Not a spreadsheet.',
        subtitle: (
          <>
            Typeform $25. Tally $29 for Pro. <strong className="text-content-primary font-semibold">Volia Forms: included in Solo at $19</strong>. Drag-drop builder, multi-step, conditional logic, <strong className="text-pink-700 font-semibold">native bridges to CRM + Campaigns</strong>. You do the math.
          </>
        ),
        ctaPrimary: { label: 'Start free trial', href: '/signup?plan=solo' },
        ctaSecondary: { label: 'See pricing', href: '/en/pricing' },
        trust: [
          '12 field types',
          'Multi-step + conditional logic',
          'Native CRM bridges',
          'GDPR by default',
        ],
        mockup: (
          <div className="rounded-2xl bg-white border border-line shadow-2xl shadow-pink-500/10 overflow-hidden p-8">
            <div className="text-xs text-content-tertiary mb-2 font-mono">volia.fr/f/b2b-quote-request</div>
            <div className="flex items-center gap-2 mb-5">
              <div className="flex-1 h-1 bg-pink-200 rounded-full overflow-hidden">
                <div className="h-full bg-pink-600 rounded-full" style={{ width: '66%' }} />
              </div>
              <span className="text-[10px] text-content-tertiary font-mono">Step 2 / 3</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-content-tertiary uppercase tracking-wider mb-1">Company size</div>
                <div className="px-3 py-2 rounded-lg border border-pink-300 bg-pink-50 text-sm text-content-primary font-medium">50–200 employees ▾</div>
              </div>
              <div>
                <div className="text-[10px] text-content-tertiary uppercase tracking-wider mb-1">Budget range</div>
                <div className="px-3 py-2 rounded-lg border border-line bg-surface-base text-sm text-content-tertiary">$10k–50k</div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-2">
              <button className="text-xs text-content-tertiary px-3 py-2 rounded-lg hover:bg-surface-card">← Previous</button>
              <button className="text-xs font-semibold bg-pink-600 text-white px-4 py-2 rounded-lg">Next →</button>
            </div>
            <div className="mt-4 pt-3 border-t border-line text-[10px] text-content-tertiary text-center font-mono">
              → on submit: auto-create CRM contact + add to Campaigns list
            </div>
          </div>
        ),
      }}
      features={FEATURES}
      howItWorks={HOW_IT_WORKS}
      crossSell={{
        subtitle: 'Forms feeds the CRM. Triggers Campaigns sequences. Inbound loop, on autopilot.',
        otherModules: [
          { module: 'crm', direction: 'out', desc: 'Every submission = a contact at Lead stage. Native Kanban pipeline.', cta: 'See CRM' },
          { module: 'campagnes', direction: 'out', desc: 'Optionally add submissions to a Campaigns list and fire sequences automatically.', cta: 'See Campaigns' },
        ],
      }}
      pricing={{
        label: 'In Solo ($19), Pro ($55), and Business ($110).',
        subtext: 'Solo = 1 form, 100 subs/mo. Pro = 5 forms, 1,000 subs. Business = unlimited. No add-ons. 1-click cancel.',
        cta: 'See full pricing',
        ctaHref: '/en/pricing',
      }}
      faq={FAQ}
      finalCta={{
        title: 'Capture leads. Straight into your CRM.',
        subtitle: 'End the Tally + Zapier + HubSpot circus. Build, publish, embed. Leads land in your pipeline. You close.',
        primary: { label: 'Start free trial', href: '/signup?plan=solo' },
        secondary: { label: 'See pricing', href: '/en/pricing' },
        trust: 'In Solo - 14-day trial - Native CRM bridges - GDPR by default',
      }}
    />
  );
}
