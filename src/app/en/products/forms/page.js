// ─────────────────────────────────────────────────────────────────────
// /en/products/forms — Volia Forms (English)
// ─────────────────────────────────────────────────────────────────────

import ProductPageLayout from '@/components/ProductPageLayout';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/en/products/forms`;
const FR_PAGE = `${SITE_URL}/produits/formulaires`;

export const metadata = {
  title: 'Volia Forms — B2B form builder with native CRM & cold email bridges',
  description:
    'Alternative to Typeform + Tally + JotForm. Drag-drop form builder, multi-step, conditional logic, native bridges to CRM and cold email. Included in Solo $19/mo. No more Tally → Zapier → HubSpot. GDPR by default.',
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
    title: 'Volia Forms — Form builder that talks natively to your CRM',
    description: 'Replaces Typeform + Tally. Multi-step + conditional logic + native CRM bridges. $19/mo.',
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
  subline: 'Drag-drop builder, multi-step with conditional logic, native bridges to CRM and cold email. Three things Typeform + Tally + JotForm can\'t do together.',
  items: [
    { icon: 'FormInput', featured: true, title: 'Drag-drop builder', desc: '12 field types, multi-step pages, real-time auto-save. As fast as Tally, as polished as Typeform. With native bridges that neither of them have.' },
    { icon: 'Workflow', title: 'Conditional logic AND/OR', desc: 'Show/hide fields, skip-to-page jumps, 13 operators (equals, contains, greater_than...). Build complex flows without writing a line of code.' },
    { icon: 'Layers', title: 'Native CRM + Campaigns bridges', desc: 'Each submission auto-creates a contact in Volia CRM and adds it to a Campaigns list. No Zapier, no webhook setup. The moat.' },
    { icon: 'Shield', title: 'GDPR-ready out of the box', desc: 'IP hashed (SHA-256), explicit opt-in, 1-click delete (right to erasure), retention policies. CNIL-compliant boilerplate included.' },
    { icon: 'QrCode', title: 'QR code + embed iframe', desc: 'Each form has its own QR (size + color customizable, PNG + SVG) and an embed iframe to paste into WordPress, Webflow, Notion. Phygital-ready.' },
    { icon: 'Webhook', wide: true, title: 'Outbound webhooks + 6 ready-to-use templates', desc: '4 native events (form.submitted, form.bridge_succeeded, form.bridge_failed, form.published) signed HMAC-SHA256. Documented in Zapier + Make. 6 templates included: Contact, Lead magnet, B2B quote request, Event registration, CV application, NPS feedback.' },
  ],
};

const HOW_IT_WORKS = [
  { icon: 'FormInput', title: 'Build your form', desc: 'Drag fields from the left panel onto the canvas. Add pages, conditional logic, validation rules. Auto-save every second.' },
  { icon: 'Send', title: 'Publish & share', desc: 'One click to publish at volia.fr/f/your-slug. Get the embed iframe code, download the QR code, or share the direct URL.' },
  { icon: 'Workflow', title: 'Watch the leads flow', desc: 'Each submission auto-creates a CRM contact + optionally adds to a Campaigns list + triggers your sequences. Zero manual work.' },
];

const FAQ = [
  { q: 'How is this different from Typeform or Tally?', a: 'Three major differences: (1) native bridges to Volia CRM + Cold Email (Typeform/Tally need Zapier), (2) included in Solo $19/mo (Typeform $25 standalone), (3) French-built with GDPR by default (CNIL-compliant boilerplate, IP hashed, EU-hosted). If you already use Volia for prospection or campaigns, Forms closes the inbound loop without adding a tool to your stack.' },
  { q: 'How many forms and submissions per plan?', a: 'Solo: 1 form, 100 submissions/month. Pro: 5 forms, 1,000 submissions/month. Business: unlimited forms and submissions. Soft limit — we email you at 80% before any hard cap. Free plan does not include Forms (it\'s our way to push you to Solo).' },
  { q: 'Can I embed a Volia form on my website?', a: 'Yes. Each published form has an iframe embed code that works on any website (WordPress, Webflow, Notion, Squarespace, hand-coded). Add ?embed=true to the URL and the form removes the Volia wordmark + footer for a clean integration. Set frame-ancestors header allows cross-origin embedding.' },
  { q: 'What happens if the CRM bridge fails?', a: 'Best-effort with auto-retry: if the bridge fails on the first try (network blip, CRM full, etc.), the submission is still recorded with bridge_status=failed. A cron job retries every 10 minutes with exponential backoff (20min → 40min → 80min, max 3 attempts). After 3 failures, you receive an email with a link to the failed submissions and can manually re-trigger from the admin UI.' },
  { q: 'Is there a free plan for Forms?', a: 'No — Forms is included starting at the Solo plan ($19/mo) to keep the moat. We considered a free tier but decided against it: the value of Volia Forms is the native bridges, which we don\'t want to dilute. If you only want a free form builder, Tally is genuinely good for that use case.' },
  { q: 'Can I migrate from Typeform / Tally?', a: 'No automated import yet (we\'re honest). You\'ll need to rebuild your forms in our builder. That said: the drag-drop builder is fast (similar UX to Tally), and once rebuilt, the bridges save you the Zapier middleman forever. If you have a complex existing form (10+ fields, conditional logic), email founder@volia.fr and we\'ll rebuild it for you in under an hour.' },
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
        eyebrow: 'Alternative to Typeform + Tally',
        h1Before: 'Forms that feed your',
        h1Highlight: 'CRM,',
        h1After: 'not a spreadsheet.',
        subtitle: (
          <>
            Typeform $25. Tally $29 for Pro features. <strong className="text-content-primary font-semibold">Volia Forms: included in Solo at $19</strong>. Drag-drop builder, multi-step, conditional logic, <strong className="text-pink-700 font-semibold">native bridges to CRM + Campaigns</strong>.
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
        subtitle: 'Forms feed the CRM and trigger Campaigns sequences. The inbound loop, fully automated.',
        otherModules: [
          { module: 'crm', direction: 'out', desc: 'Every submission auto-creates a contact at Lead stage. Native Kanban pipeline.', cta: 'Discover CRM' },
          { module: 'campagnes', direction: 'out', desc: 'Optionally add new submissions to a Campaigns list and trigger sequences automatically.', cta: 'Discover Campaigns' },
        ],
      }}
      pricing={{
        label: 'Included in Solo ($19), Pro ($55) and Business ($110)',
        subtext: 'Solo = 1 form / 100 subs per month. Pro = 5 forms / 1,000 subs. Business = unlimited. No hidden add-ons, 1-click cancel.',
        cta: 'See full pricing',
        ctaHref: '/en/pricing',
      }}
      faq={FAQ}
      finalCta={{
        title: 'Capture leads that flow straight into your CRM.',
        subtitle: 'No more Tally → Zapier → HubSpot. Build, publish, embed — and watch the leads land in your pipeline automatically.',
        primary: { label: 'Start free trial', href: '/signup?plan=solo' },
        secondary: { label: 'See pricing', href: '/en/pricing' },
        trust: 'Included in Solo — 14-day trial — Native CRM bridges — GDPR by default',
      }}
    />
  );
}
