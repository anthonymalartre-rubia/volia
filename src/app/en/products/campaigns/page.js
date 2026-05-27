// ─────────────────────────────────────────────────────────────────────
// /en/products/campaigns — Volia Campaigns (English)
// ─────────────────────────────────────────────────────────────────────
// Mirror of /produits/campagnes (FR). Campaigns is now Business-only
// ($169/mo launch promo, then $199/mo).
// ─────────────────────────────────────────────────────────────────────

import ProductPageLayout from '@/components/ProductPageLayout';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/en/products/campaigns`;
const FR_PAGE = `${SITE_URL}/produits/campagnes`;

export const metadata = {
  title: 'Volia Campaigns - Cold email that lands in inbox, not spam',
  description: 'Native cold email with 28-day auto warmup, multi-tenant Resend, and auto-create deals in CRM from replies. Included in the Volia Business plan at $169/mo (launch promo, then $199). One tool instead of Lemlist + Smartlead + HubSpot.',
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
    title: 'Volia Campaigns - Cold email that lands. Not in spam.',
    description: 'Unlimited cold email, auto warmup, auto-deals in CRM. Included in Volia Business ($169/mo, 12-month launch promo).',
    url: PAGE_URL,
    type: 'website',
    locale: 'en_US',
  },
};

const EN_LABELS = {
  products: 'Products', features: 'Features', pricing: 'Pricing', blog: 'Blog', faq: 'FAQ',
  breadcrumbProducts: 'Products', featuresPill: 'Features',
  featuresTitlePrefix: 'Everything to', featuresTitleDefault: 'send like a pro',
  howItWorksPill: 'How it works', howItWorksTitle: 'Just 3 steps',
  suitePill: 'Volia Suite', suiteTitle: 'Connected to the rest of the Volia suite',
  suiteSubtitleDefault: 'Campaigns consumes Prospecting leads and feeds the CRM the moment a prospect replies. Full loop, zero copy-paste.',
  suiteSource: 'Source', suiteDestination: 'Destination', suiteCtaDefault: 'Learn more',
  pricingPill: 'Pricing', pricingCtaDefault: 'See full pricing',
  faqPill: 'FAQ', faqTitle: 'Frequently asked questions',
  bookDemoHero: 'Or book 15 min with the founder', bookDemoFinal: 'See if Volia is right for you',
  breadcrumbAria: 'Breadcrumb',
};

const FEATURES = {
  headline: 'send like a pro',
  subline: 'Multi-tenant Resend. Auto warmup. Auto-create CRM deals. Three things Lemlist + Instantly + Smartlead can\'t do together.',
  items: [
    { icon: 'Globe', featured: true, title: 'Native multi-tenant Resend', desc: 'You send from YOUR domain (DKIM, SPF, DMARC aligned automatically). 5 min to set up. Agencies: 1 Volia account, unlimited client domains.' },
    { icon: 'Flame', title: 'Auto 28-day warmup', desc: 'D1: 10 emails/day. D28: 200/day. Zero config. Lemlist charges extra for this. We include it.' },
    { icon: 'Repeat', title: 'Multi-inbox rotation', desc: 'Sends spread across multiple domains to protect reputation. 3x the volume, same deliverability.' },
    { icon: 'MousePointerClick', title: 'Open & click tracking', desc: 'Pixel + link tracking on a dedicated subdomain. Real-time stats per sequence, step, template. Native A/B subject testing.' },
    { icon: 'Workflow', title: 'Auto-create CRM deals', desc: 'Someone replies = a deal lands in your CRM at Lead stage. No manual entry. No lost lead. Volia exclusive.' },
    { icon: 'BookOpen', wide: true, title: '20+ B2B email templates', desc: 'Battle-tested on real volume: restaurants, construction, web agencies, e-commerce, SaaS, real estate. 3 variants each (intro, follow-up, breakup). Import yours too.' },
  ],
};

const HOW_IT_WORKS = [
  { icon: 'Globe', title: '1. Connect your domain', desc: 'DKIM, SPF, DMARC in 5 min via the guided Resend UI. Auto-verified before you send a thing.' },
  { icon: 'Flame', title: '2. Let warmup cook', desc: '28 days. 10 to 200 emails/day. You do nothing. Monitor it from your dashboard if you really want to.' },
  { icon: 'Send', title: '3. Hit send', desc: 'Pick an English/French template or write your own. Replies auto-create deals in your CRM. You just close.' },
];

const FAQ = [
  { q: 'Which plan includes Campaigns?', a: 'Campaigns is part of the Volia Business plan only ($169/mo for the first 12 months, then $199/mo). Business also unlocks the CRM and Forms modules — they share the same data, so a reply in Campaigns auto-creates a deal in CRM. No add-on, no per-seat charge.' },
  { q: 'How many emails can I send per day?', a: 'During warmup (28 days): from 10 to 200/day, progressive. After warmup: unlimited (up to ~200/day per domain to stay healthy), with multi-domain support. Real limit = deliverability. Bounce rate > 2%? We auto-pause to protect your domain.' },
  { q: 'How do I stay out of spam?', a: 'Four things: (1) mandatory 28-day warmup. (2) DKIM/SPF/DMARC check before you send. (3) auto-pause if bounce rate > 2%. (4) unified opt-out across all sequences. Beta numbers: 62% open rate, 94% inbox rate.' },
  { q: 'What is domain warmup?', a: 'Progressively ramping up sends from a new domain so Gmail and Outlook trust it. Without warmup, a fresh domain sending 100 emails on day 1 goes straight to spam. We simulate exchanges and ramp from 10 to 200/day over 28 days. Most competitors charge extra for this. We include it in Business.' },
  { q: 'Can I use my own sending domain?', a: 'Required. It IS the product. Connect your-saas.com, we verify DKIM/SPF/DMARC in 5 min, every send leaves from your domain. Your brand, your reputation.' },
  { q: 'How does GDPR opt-out work?', a: 'Unsubscribe link auto-added in every footer — you can\'t turn it off. Opt-out feeds a permanent blocklist: once someone unsubscribes, they\'re never contacted again, no matter the sequence or account. CNIL-compliant boilerplate, legitimate-interest basis documented, opposition register kept automatically.' },
];

export default function EnCampaignsPage() {
  return (
    <ProductPageLayout
      module="campagnes"
      status="LIVE"
      locale="en"
      labels={EN_LABELS}
      moduleLabelOverride="Campaigns"
      hero={{
        eyebrow: 'Volia Business bonus. Built in France.',
        h1Before: 'Cold email that lands in',
        h1Highlight: 'inbox.',
        h1After: 'Not spam.',
        subtitle: (
          <>
            Native cold email + 28-day auto warmup + multi-inbox rotation. <strong className="text-content-primary font-semibold">Included in Volia Business at $169/mo</strong> (12-month launch promo, then $199). Plus <strong className="text-emerald-700 font-semibold">auto-deals in CRM</strong> from every reply.
          </>
        ),
        ctaPrimary: { label: 'Get Business $169', href: '/signup?plan=business' },
        ctaSecondary: { label: 'See pricing', href: '/en/pricing' },
        trust: [
          'Auto 28-day warmup',
          'Multi-domain Resend',
          'GDPR 1-click opt-out',
          'Auto-create CRM deals',
        ],
        mockup: (
          <div className="rounded-2xl bg-white border border-line shadow-2xl shadow-blue-500/10 overflow-hidden p-8">
            <div className="text-xs text-content-tertiary mb-4 font-mono">volia.fr/campaigns - &quot;Restaurants Paris&quot; sequence</div>
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div><div className="text-2xl font-bold font-mono text-blue-700">62%</div><div className="text-[10px] text-content-tertiary uppercase tracking-wider">Opens</div></div>
              <div><div className="text-2xl font-bold font-mono text-emerald-700">94%</div><div className="text-[10px] text-content-tertiary uppercase tracking-wider">Inbox</div></div>
              <div><div className="text-2xl font-bold font-mono text-cyan-700">14%</div><div className="text-[10px] text-content-tertiary uppercase tracking-wider">Reply</div></div>
            </div>
            {['D+0 - Intro - "Quick question about {{company}}"', 'D+3 - Follow-up - "Re: Quick question..."', 'D+7 - Bump - "Last try {{firstname}}?"'].map((s) => (
              <div key={s} className="text-xs text-content-secondary py-2 border-b border-line last:border-b-0">{s}</div>
            ))}
          </div>
        ),
      }}
      features={FEATURES}
      howItWorks={HOW_IT_WORKS}
      crossSell={{
        subtitle: 'Campaigns pulls leads from Prospecting. Pushes replies to CRM. All inside Business. Zero copy-paste.',
        otherModules: [
          { module: 'prospection', direction: 'in', desc: 'Where your prospects come from. 287k+ FR companies, 150+ industries, scored emails + phones. Available on every paid plan.', cta: 'See Prospecting' },
          { module: 'crm', direction: 'out', desc: 'Replies become deals at Lead stage. Native Kanban pipeline. Also part of Business.', cta: 'See CRM' },
          { module: 'formulaires', direction: 'in', desc: 'Forms submissions can fire a Campaigns sequence automatically. Inbound on autopilot.', cta: 'See Forms' },
        ],
      }}
      pricing={{
        label: 'Business plan only. $169/mo (launch promo, then $199).',
        subtext: 'All 4 modules together: Prospecting + Campaigns + CRM + Forms. 10,000 enrichments/mo, multi-user, API access, priority support. 1-click cancel.',
        cta: 'See full pricing',
        ctaHref: '/en/pricing',
      }}
      faq={FAQ}
      finalCta={{
        title: 'Cold email that works. Inside your sales suite.',
        subtitle: 'One tool instead of three. Double the deliverability. Templates ready, warmup auto, replies in CRM. You just press send.',
        primary: { label: 'Get Business $169', href: '/signup?plan=business' },
        secondary: { label: 'See pricing', href: '/en/pricing' },
        trust: 'In Business - Launch promo first 12 months - GDPR by default',
      }}
    />
  );
}
