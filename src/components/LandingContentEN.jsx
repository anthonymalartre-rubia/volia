'use client';

// ─────────────────────────────────────────────────────────────────────
// LandingContentEN — English Volia landing
// ─────────────────────────────────────────────────────────────────────
// Mirror of LandingContent.jsx (FR source of truth, May 2026 pivot).
//
// Brand "C" pivot: customer-value first. No more "5x cheaper than
// Apollo + Lemlist + HubSpot" head-on attack. The product is sold as
// a B2B email + phone generator (80% of focus). The 3 secondary
// modules (Campaigns / CRM / Forms) are a Business plan bonus (20%).
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import {
  ArrowRight, Check, Zap, Search, Mail, Layers, Globe, Sparkles, X,
  FormInput, Shield,
} from 'lucide-react';
import { LogoIcon } from '@/components/ui';
import MotionInView from '@/components/MotionInView';
import { useForceLightTheme } from '@/lib/use-force-light-theme';
import { useForceLocale } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const NAV_LINKS = [
  { href: '/en/products/prospection', label: 'Products' },
  { href: '#features', label: 'Features' },
  { href: '/en/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '#faq', label: 'FAQ' },
];

// ─── Pricing cards data ────────────────────────────────────────────
// Delta-features pattern : each tier lists ONLY what's added vs the
// previous one (Solo +1, Pro +2, Business +3). Mirrors FR plans.js.
const PLANS_EN = [
  {
    id: 'free',
    name: 'Starter',
    price: '$0',
    period: 'forever',
    tagline: 'To try Volia',
    features: [
      '20 enrichments / month',
      '5 CSV exports / month',
      'Email + phone scraping (landline & mobile)',
      '101 departments (all of France)',
    ],
    cta: 'Start free',
    ctaHref: '/signup?plan=free',
    highlighted: false,
  },
  {
    id: 'solo',
    name: 'Solo',
    price: '$21',
    sub: 'EUR 19/mo billed in EUR',
    period: '/mo',
    tagline: 'For freelancers & consultants',
    inheritsFrom: 'Starter',
    features: [
      '400 enrichments / month (x20)',
      'Unlimited CSV exports',
      'Waterfall enrichment (scraping + Google) - emails AND phones',
      'Email support (48 h)',
    ],
    cta: 'Choose Solo',
    ctaHref: '/signup?plan=solo',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$55',
    sub: 'EUR 49/mo billed in EUR',
    period: '/mo',
    tagline: 'For SMBs & agencies',
    inheritsFrom: 'Solo',
    features: [
      '1,200 enrichments / month (x3)',
      'Unlimited folders',
      'Email verification (MillionVerifier)',
      'Mobile phone enrichment',
      'Email support (24 h)',
    ],
    cta: 'Choose Pro',
    ctaHref: '/signup?plan=pro',
    highlighted: true,
    badge: 'POPULAR',
  },
  {
    id: 'business',
    name: 'Business',
    // Launch promo: $169/mo for the first 12 months, then $199/mo.
    price: '$169',
    priceStrike: '$199',
    sub: 'EUR 149/mo - then EUR 179',
    period: '/mo',
    tagline: 'For outbound teams',
    inheritsFrom: 'Pro',
    unlocksModules: true,
    promoLabel: 'Launch promo',
    promoSub: 'First 12 months - then $199/mo',
    features: [
      '10,000 enrichments / month (x8)',
      'Multi-user (teams, RBAC)',
      'API access (coming soon)',
      'Personalized onboarding',
      'Priority support',
    ],
    cta: 'Choose Business',
    ctaHref: '/signup?plan=business',
    highlighted: false,
  },
];

// Modules unlocked per plan — only Business unlocks the 3 secondary
const PLAN_MODULES_EN = {
  free:     { prospection: 'limited', campaigns: false, crm: false, forms: false },
  solo:     { prospection: true,      campaigns: false, crm: false, forms: false },
  pro:      { prospection: true,      campaigns: false, crm: false, forms: false },
  business: { prospection: true,      campaigns: true,  crm: true,  forms: true },
};

const FAQS_EN = [
  {
    q: 'Does Volia work outside France?',
    a: 'Our prospecting database is France-only: 287,000+ verified companies, 101 departments. If you target French businesses from London, NYC, or Berlin — Volia is the cheapest way to find their emails AND phone numbers (landline + mobile). The Campaigns, CRM, and Forms modules (Business plan) work everywhere.',
  },
  {
    q: 'What\'s included in Solo at $21/mo?',
    a: 'Everything you need to generate B2B leads: 400 enrichments/month, unlimited CSV exports, waterfall enrichment (site scraping + Google search + pattern fallback) for emails AND phone numbers. Apollo charges $99 for less. We chose to be the cheapest entry ticket on the market.',
  },
  {
    q: 'What does Business unlock that the other plans don\'t?',
    a: 'Three more modules, all included at $169/mo (12-month launch promo, then $199). (1) Campaigns: native cold email + 28-day auto warmup. (2) CRM: drag-and-drop Kanban + auto-create deals from email replies. (3) Forms: drag-drop builder with native bridges to CRM + Campaigns. Plus 10,000 enrichments/mo, multi-user, API access, priority support.',
  },
  {
    q: 'Is it GDPR-compliant?',
    a: 'Yes, by default — not as a paid add-on. Legitimate interest basis, opt-out on every email, public opt-out page, 28-domain personal-email filter (blocks @gmail, @hotmail, etc.). EU hosting. Built to CNIL guidelines from day one.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, 1 click in your settings. No commitment. Annual plans are optional (you save ~2 months). Your data stays yours — export everything, anytime.',
  },
];

export default function LandingContentEN() {
  useForceLightTheme();
  // Landing EN (/en) = always English (URL dictates language, ignoring
  // localStorage). Bug fix May 2026 — see LandingContent for context.
  useForceLocale('en');

  return (
    <div className="min-h-screen bg-surface-base text-content-primary overflow-hidden">
      {/* ── NAV ── */}
      <header>
        <nav className="fixed top-0 w-full z-50 bg-surface-base/70 backdrop-blur-2xl border-b border-line">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/en" className="flex items-center gap-1.5">
              <LogoIcon size="sm" />
              <span className="text-lg font-bold tracking-tight ml-1">Volia</span>
              <span className="text-violet-400 text-xs font-semibold">.fr</span>
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-content-tertiary hover:text-content-primary transition">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link href="/login" className="text-sm text-content-tertiary hover:text-content-primary transition">Log in</Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold shadow shadow-violet-500/20 hover:shadow-violet-500/40 transition"
              >
                Sign up
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* ── HERO ── */}
        {/* Pivot 80/20 May 2026: Volia = a B2B email + phone generator.
            The 3 other modules (Campaigns / CRM / Forms) are a Business
            bonus, mentioned at the bottom of the hero, not in the badge. */}
        <section className="relative pt-24 sm:pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-gradient-to-br from-violet-200/40 via-indigo-100/30 to-pink-100/20 rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute top-40 right-[5%] w-96 h-96 bg-violet-300/20 rounded-full blur-3xl pointer-events-none -z-0 animate-pulse" style={{ animationDuration: '6s' }} />

          <div className="max-w-6xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-100 via-indigo-100 to-violet-100 border-2 border-violet-300 text-xs mb-6 font-medium shadow-sm shadow-violet-500/10">
              <Search size={12} className="text-violet-600" />
              <span className="text-violet-700 font-bold">B2B EMAIL + PHONE GENERATOR · $21/MO</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] font-bold tracking-tight leading-[1.05] mb-6">
              <span className="bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">Find B2B emails and phone numbers</span>
              <span className="text-content-primary"> in 30 seconds.</span>
              <br />
              <span className="text-content-primary text-3xl sm:text-4xl lg:text-5xl">The French B2B lead generator.</span>
            </h1>

            <p className="text-lg sm:text-xl text-content-secondary mb-4 leading-relaxed max-w-2xl mx-auto">
              150+ industries, 101 departments, waterfall scraping for{' '}
              <strong className="text-content-primary">email + phone (landline & mobile)</strong>.
              From <strong className="text-content-primary">$21/mo. No card.</strong>
            </p>

            <p className="text-sm text-content-tertiary mb-8 italic flex items-start justify-center gap-1.5">
              <Sparkles size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <span><strong className="text-content-secondary not-italic">Business $169 bonus</strong>: Campaigns + CRM + Forms included.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/50 hover:-translate-y-0.5 transition-all text-base"
              >
                Start free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/en/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-5 rounded-xl border-2 border-line-hover hover:border-violet-400 hover:bg-violet-50 text-content-primary font-semibold transition-all text-base"
              >
                See pricing
              </Link>
            </div>

            <div className="flex items-center justify-center gap-x-3 gap-y-1.5 text-xs text-content-tertiary flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                287,000+ companies
              </span>
              <span aria-hidden="true">·</span>
              <span>Email + phone scraped</span>
              <span aria-hidden="true">·</span>
              <span>Made in France</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium">GDPR by default</span>
            </div>
          </div>
        </section>

        {/* ── FLAGSHIP PRODUCT + 3 BUSINESS BONUS MODULES ── */}
        {/* Mirror of the FR section: a large hero card for the flagship
            (Prospecting), then 3 smaller cards for the Business bonus
            modules (Campaigns / CRM / Forms). */}
        <section className="py-24 px-4 sm:px-6 border-t border-line bg-gradient-to-b from-white via-zinc-50/50 to-white">
          <div className="max-w-6xl mx-auto">
            {/* Flagship: Prospecting */}
            <MotionInView>
              <div className="text-center mb-12">
                <p className="text-sm font-semibold text-violet-600 mb-3 uppercase tracking-wider">The product</p>
                <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  Volia Prospecting.
                </h2>
                <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
                  The cheapest B2B lead generator on the French market.
                  <strong className="text-content-secondary"> Email and phone</strong> for 287,000+ companies, scraped in cascade.
                </p>
              </div>
            </MotionInView>

            <MotionInView delay={150}>
              <Link
                href="/en/products/prospection"
                className="group block mb-20 p-8 sm:p-10 rounded-3xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 via-white to-indigo-50/50 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Search size={28} className="text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-content-tertiary uppercase tracking-wider">Volia</div>
                        <h3 className="text-2xl font-bold text-content-primary">Prospecting</h3>
                      </div>
                    </div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-300 mb-4">
                      LIVE · From $21/mo
                    </span>
                    <p className="text-sm text-content-secondary leading-relaxed">
                      The heart of Volia. Find <strong className="text-content-primary">emails and phone numbers</strong> (landline & mobile) for any French company.
                    </p>
                  </div>

                  <div className="lg:col-span-2 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                    {[
                      'Verified email + confidence scoring',
                      'Landline + mobile phones scraped',
                      '150+ B2B industries',
                      '101 departments (all of France)',
                      'Waterfall cascade scraping',
                      'CSV export + CRM integrations',
                    ].map((b) => (
                      <div key={b} className="flex items-start gap-2 text-sm text-content-secondary">
                        <Check size={16} className="flex-shrink-0 mt-0.5 text-violet-600" />
                        <span>{b}</span>
                      </div>
                    ))}
                    <div className="sm:col-span-2 mt-4 pt-4 border-t border-violet-200/60 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 group-hover:gap-2 transition-all">
                      Discover Volia Prospecting
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </MotionInView>

            {/* 3 Business bonus modules */}
            <MotionInView>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles size={12} />
                  <span>Business plan only · $169/mo</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-content-primary">
                  3 more modules, included in Business.
                </h3>
                <p className="text-content-tertiary text-base max-w-2xl mx-auto">
                  Once you have your lead list, go further: send campaigns, track deals, capture inbound.{' '}
                  <strong className="text-content-secondary">All included in the Business plan</strong>, no add-ons.
                </p>
              </div>
            </MotionInView>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  name: 'Campaigns',
                  tagline: 'Automated email sequences + built-in warmup',
                  icon: Mail,
                  color: 'blue',
                  bg: 'from-blue-50/70 via-white to-cyan-50/40',
                  border: 'border-blue-200',
                  iconBg: 'from-blue-500 to-cyan-600',
                  href: '/en/products/campaigns',
                  status: 'LIVE',
                },
                {
                  name: 'CRM',
                  tagline: 'Kanban pipeline + native deal tracking',
                  icon: Layers,
                  color: 'emerald',
                  bg: 'from-emerald-50/70 via-white to-teal-50/40',
                  border: 'border-emerald-200',
                  iconBg: 'from-emerald-500 to-teal-600',
                  href: '/en/products/crm',
                  status: 'LIVE',
                },
                {
                  name: 'Forms',
                  tagline: 'Form builder with native CRM + Campaigns bridges',
                  icon: FormInput,
                  color: 'pink',
                  bg: 'from-pink-50/70 via-white to-rose-50/40',
                  border: 'border-pink-200',
                  iconBg: 'from-pink-500 to-rose-600',
                  href: '/en/products/forms',
                  status: 'LIVE',
                },
              ].map((mod, i) => {
                const Icon = mod.icon;
                return (
                  <MotionInView key={mod.name} delay={i * 120}>
                    <Link
                      href={mod.href}
                      className={`group block h-full p-5 rounded-2xl border ${mod.border} bg-gradient-to-br ${mod.bg} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative`}
                    >
                      <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300">
                        Business
                      </span>

                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mod.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-3`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-bold text-content-primary">Volia {mod.name}</h4>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-${mod.color}-700 bg-${mod.color}-50 border border-${mod.color}-200`}>
                          {mod.status}
                        </span>
                      </div>
                      <p className="text-xs text-content-tertiary leading-relaxed mb-3">{mod.tagline}</p>
                      <div className={`inline-flex items-center gap-1 text-xs font-semibold text-${mod.color}-700 group-hover:gap-1.5 transition-all`}>
                        Learn more
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  </MotionInView>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-24 px-4 sm:px-6 border-t border-line">
          <div className="max-w-6xl mx-auto">
            <MotionInView>
              <div className="text-center mb-14">
                <p className="text-sm font-semibold text-violet-600 mb-3 uppercase tracking-wider">Features</p>
                <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  Everything outbound needs. Nothing it doesn&apos;t.
                </h2>
              </div>
            </MotionInView>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Layers, title: 'Waterfall enrichment', desc: 'Scrape the site. Search Google. Guess the pattern. Stop the second we find a real email — so we don\'t burn your quota.' },
                { icon: Sparkles, title: 'AI search (Claude)', desc: 'Type "50 SaaS founders in Paris" — get a Google Places query in 2 seconds. No filters to learn.' },
                { icon: Globe, title: 'Full France coverage', desc: '287,000+ verified French companies. 78% email hit rate, including landline + mobile phones. Apollo and Hunter sit around 40%.' },
                { icon: Mail, title: 'Native cold email (Business)', desc: '28-day auto warmup, multi-inbox rotation, 94% inbox rate. No Smartlead subscription needed.' },
                { icon: Zap, title: 'Auto-create deals (Business)', desc: 'Someone replies? A deal shows up in your CRM at Lead stage. No copy-paste, no Zapier, no tabs.' },
                { icon: Shield, title: 'GDPR by default', desc: 'Personal-email filter, public opt-out, EU hosting, CNIL guidelines. Built-in, not bolted on.' },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <MotionInView key={f.title} delay={i * 100}>
                    <div className="group h-full p-7 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-violet-50/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
                        <Icon size={22} className="text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-content-primary">{f.title}</h3>
                      <p className="text-sm text-content-secondary leading-relaxed">{f.desc}</p>
                    </div>
                  </MotionInView>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="py-24 px-4 sm:px-6 border-t border-line bg-gradient-to-b from-white via-violet-50/20 to-white">
          <div className="max-w-7xl mx-auto">
            <MotionInView>
              <div className="text-center mb-14">
                <p className="text-sm font-semibold text-violet-600 mb-3 uppercase tracking-wider">Pricing</p>
                <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  Honest pricing. No &quot;contact sales&quot;.
                </h2>
                <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
                  USD displayed, EUR billed (your bank converts at market rate). No commitment. Cancel in 1 click.
                </p>
              </div>
            </MotionInView>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PLANS_EN.map((plan) => {
                const modules = PLAN_MODULES_EN[plan.id];
                return (
                  <div key={plan.id} className={`relative p-7 rounded-2xl backdrop-blur-sm flex flex-col ${
                    plan.highlighted
                      ? 'border border-violet-500/30 bg-gradient-to-b from-violet-50 via-violet-50/50 to-white'
                      : 'border border-line bg-surface-card/80'
                  }`}>
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[11px] font-semibold rounded-full shadow-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/20">
                        {plan.badge}
                      </div>
                    )}
                    <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                    <p className="text-xs text-content-tertiary mb-5 min-h-[32px]">{plan.tagline}</p>

                    {/* PRICE — Business has a promo strikethrough */}
                    <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-content-tertiary text-sm">{plan.period}</span>
                      {plan.priceStrike && (
                        <span className="text-lg text-content-muted line-through font-medium">
                          {plan.priceStrike}
                        </span>
                      )}
                    </div>
                    {plan.promoLabel && (
                      <>
                        <p className="text-[11px] font-semibold text-emerald-700 mb-0.5">
                          {plan.promoLabel}
                        </p>
                        <p className="text-[11px] text-content-tertiary mb-1">
                          {plan.promoSub}
                        </p>
                      </>
                    )}
                    {plan.sub && <p className="text-[11px] text-content-tertiary mb-5">{plan.sub}</p>}
                    {!plan.sub && <p className="text-[11px] text-content-tertiary mb-5">No card required</p>}

                    <Link
                      href={plan.ctaHref}
                      className={`block w-full py-3 text-center text-sm font-semibold rounded-xl transition mb-5 ${
                        plan.highlighted
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20'
                          : 'border border-line-hover hover:bg-surface-elevated text-content-secondary'
                      }`}
                    >
                      {plan.cta}{plan.highlighted ? ' →' : ''}
                    </Link>

                    {/* Business killer feature : unlocks the full suite */}
                    {plan.unlocksModules && (
                      <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 border border-violet-300">
                        <p className="text-[11px] font-bold text-violet-900 mb-1">
                          ★ Unlocks the full suite
                        </p>
                        <p className="text-[11px] text-violet-700 leading-snug">
                          CRM · Campaigns · Forms - all included
                        </p>
                      </div>
                    )}

                    {/* Module badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        modules.prospection === true ? 'bg-violet-100 text-violet-700'
                        : modules.prospection === 'limited' ? 'bg-zinc-100 text-zinc-600'
                        : 'bg-zinc-50 text-content-muted'
                      }`}>
                        ✓ Prospecting{modules.prospection === 'limited' ? ' (limited)' : ''}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        modules.campaigns ? 'bg-blue-100 text-blue-700' : 'bg-zinc-50 text-content-muted'
                      }`}>
                        {modules.campaigns ? '✓' : '✗'} Campaigns
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        modules.crm ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-50 text-content-muted'
                      }`}>
                        {modules.crm ? '✓' : '✗'} CRM
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        modules.forms ? 'bg-pink-100 text-pink-700' : 'bg-zinc-50 text-content-muted'
                      }`}>
                        {modules.forms ? '✓' : '✗'} Forms
                      </span>
                    </div>

                    {plan.inheritsFrom && (
                      <p className="text-[11px] font-semibold text-content-secondary mb-3 pb-3 border-b border-line">
                        ✓ Everything in {plan.inheritsFrom} +
                      </p>
                    )}

                    <div className="space-y-2.5 flex-1">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-start gap-2">
                          <Check size={15} className="text-violet-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-content-secondary leading-relaxed">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-10">
              <Link href="/en/pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900 transition group">
                See full pricing details
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-24 px-4 sm:px-6 border-t border-line">
          <div className="max-w-3xl mx-auto">
            <MotionInView>
              <div className="text-center mb-12">
                <p className="text-sm font-semibold text-violet-600 mb-3 uppercase tracking-wider">FAQ</p>
                <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  Frequently asked questions
                </h2>
              </div>
            </MotionInView>

            <div className="space-y-4">
              {FAQS_EN.map((item) => (
                <details key={item.q} className="group rounded-2xl border border-line bg-surface-card overflow-hidden">
                  <summary className="cursor-pointer px-6 py-5 text-sm sm:text-base font-medium text-content-primary list-none flex items-center justify-between">
                    {item.q}
                    <span className="text-content-tertiary group-open:rotate-180 transition-transform">⌄</span>
                  </summary>
                  <div className="px-6 pb-5 pt-0 text-sm text-content-secondary leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="relative py-32 px-4 sm:px-6 border-t border-line overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-200/40 via-indigo-100/30 to-pink-100/20 pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight tracking-tight text-content-primary">
              Your first 100 leads. In 30 seconds.
            </h2>
            <p className="text-content-secondary text-lg sm:text-xl mb-10 max-w-xl mx-auto">
              No credit card. No tricks. 100 prospects free, forever. Built in a French apartment. Used worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:-translate-y-0.5 transition-all text-base"
              >
                Start free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/en/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:border-violet-400 hover:bg-violet-50 border-2 border-line-hover text-content-primary font-semibold transition-all text-base"
              >
                See pricing
              </Link>
            </div>
            <p className="text-xs text-content-tertiary mt-6">No credit card · Cancel in 1 click · GDPR by default</p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-line py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-line">
            <div>
              <h3 className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3">Products</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/en/products/prospection" className="text-content-tertiary hover:text-violet-400 transition">Prospecting</Link></li>
                <li><Link href="/en/products/campaigns" className="text-content-tertiary hover:text-blue-500 transition">Campaigns</Link></li>
                <li><Link href="/en/products/crm" className="text-content-tertiary hover:text-emerald-500 transition">CRM</Link></li>
                <li><Link href="/en/products/forms" className="text-content-tertiary hover:text-pink-500 transition">Forms</Link></li>
                <li><Link href="/en/pricing" className="text-content-tertiary hover:text-violet-400 transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="text-content-tertiary hover:text-violet-400 transition">Blog</Link></li>
                <li><Link href="/login" className="text-content-tertiary hover:text-violet-400 transition">Log in</Link></li>
                <li><Link href="/signup" className="text-content-tertiary hover:text-violet-400 transition">Sign up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3">Language</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-content-tertiary hover:text-violet-400 transition">FR Francais</Link></li>
                <li><Link href="/en" className="text-content-tertiary hover:text-violet-400 transition font-semibold">EN English</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/cgu" className="text-content-tertiary hover:text-violet-400 transition">Terms</Link></li>
                <li><Link href="/confidentialite" className="text-content-tertiary hover:text-violet-400 transition">Privacy</Link></li>
                <li><Link href="/rgpd" className="text-content-tertiary hover:text-violet-400 transition">GDPR</Link></li>
                <li><Link href="/opt-out" className="text-content-tertiary hover:text-violet-400 transition">Opt-out</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <LogoIcon size="xs" />
              <span className="text-sm font-bold tracking-tight ml-1">Volia</span>
              <span className="text-violet-400 text-[10px] font-semibold">.fr</span>
            </div>
            <p className="text-[11px] text-content-muted">&copy; 2026 Volia.fr - Built in France</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
