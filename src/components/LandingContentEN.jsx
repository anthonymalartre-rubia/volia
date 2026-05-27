'use client';

// ─────────────────────────────────────────────────────────────────────
// LandingContentEN — version anglaise compacte de la landing Volia
// ─────────────────────────────────────────────────────────────────────
// Cible US/UK : H1 punchy ("Find. Reach. Convert."), $ + € côte à côte,
// "Built in France" en flex (charme français aux US), GDPR-compliant
// mentionné en bonus (pas en argument principal contrairement à FR).
// Lien switcher FR/EN dans la nav + footer pour visibilité SEO.
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import {
  ArrowRight, Check, Zap, Search, Mail, Layers, Globe, Sparkles, X,
} from 'lucide-react';
import { LogoIcon } from '@/components/ui';
import MotionInView from '@/components/MotionInView';
import { useForceLightTheme } from '@/lib/use-force-light-theme';

const NAV_LINKS = [
  { href: '/en/products/prospection', label: 'Products' },
  { href: '#features', label: 'Features' },
  { href: '/en/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '#faq', label: 'FAQ' },
];

const PLANS_EN = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    tagline: 'Try before you pay. Always free.',
    features: [
      '100 prospects / month',
      '20 enrichments / month',
      '5 CSV exports',
      'All 287k+ FR companies',
      'GDPR-compliant',
    ],
    cta: 'Start free',
    ctaHref: '/signup?plan=free',
    highlighted: false,
  },
  {
    name: 'Solo',
    price: '$21',
    sub: '€19/mo',
    period: '/month',
    tagline: 'Freelancers. Solo founders. Anyone tired of paying $99 for Apollo.',
    features: [
      '1,000 prospects / month',
      '400 enrichments / month',
      'Unlimited CSV exports',
      'Waterfall enrichment',
      'Email support',
    ],
    cta: 'Start with Solo',
    ctaHref: '/signup?plan=solo',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$55',
    sub: '€49/mo',
    period: '/month',
    tagline: 'Agencies, SMBs, anyone shipping cold email.',
    features: [
      '5,000 prospects / month',
      'Cold email campaigns',
      'Auto-warmup (28 days)',
      'Email verification',
      'Priority support',
    ],
    cta: 'Start with Pro',
    ctaHref: '/signup?plan=pro',
    highlighted: true,
    badge: 'Most popular',
  },
  {
    name: 'Business',
    price: '$110',
    sub: '€99/mo',
    period: '/month',
    tagline: 'Sales teams who need everything in one tool.',
    features: [
      '10,000 prospects / month',
      'Campaigns + CRM included',
      '5 user seats',
      'Auto-create deals from replies',
      'API access',
    ],
    cta: 'Start with Business',
    ctaHref: '/signup?plan=business',
    highlighted: false,
  },
];

const FAQS_EN = [
  {
    q: 'Does Volia work outside France?',
    a: 'Our prospecting database is France. 287,000+ verified companies, 101 departments, no other country. If you target French businesses from London, NYC, or Berlin — Volia is the cheapest way to find their emails and phone numbers. Campaigns and CRM work everywhere.',
  },
  {
    q: 'Why is Volia 5× cheaper than Apollo or HubSpot?',
    a: 'Two reasons. (1) We focus on France only for prospecting data — no need to license expensive global B2B databases. (2) Prospecting + Cold Email + CRM are in the same product. No Zapier between three tools. No per-seat HubSpot pricing. You do the math.',
  },
  {
    q: 'Is it GDPR-compliant?',
    a: 'Yes. By default, not as a paid add-on. Legitimate interest basis, clear opt-out on every email, public opt-out page, 28-domain personal-email filter (blocks @gmail, @hotmail, etc.). EU hosting. Built to CNIL guidelines from day one.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. 1 click in your settings. No commitment. No annual lock-in (annual plans are optional — get 2 months free). Your data stays yours. Export everything, anytime.',
  },
  {
    q: 'How is Volia different from Apollo + Lemlist + HubSpot?',
    a: 'Three things. (1) France coverage is 78% vs ~40% for US-first tools. (2) One bill, one login, one product. Not 3 subscriptions at ~$288/mo. (3) Built in France. English-friendly support, no offshore call center.',
  },
];

export default function LandingContentEN() {
  useForceLightTheme();

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
              <Link href="/" className="text-xs text-content-tertiary hover:text-content-primary transition">FR</Link>
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
        <section className="relative pt-24 sm:pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-gradient-to-br from-violet-200/40 via-indigo-100/30 to-pink-100/20 rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute top-40 right-[5%] w-96 h-96 bg-violet-300/20 rounded-full blur-3xl pointer-events-none -z-0 animate-pulse" style={{ animationDuration: '6s' }} />

          <div className="max-w-6xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-100 via-blue-100 to-emerald-100 border-2 border-violet-300 text-xs mb-6 font-medium shadow-sm shadow-violet-500/10">
              <Layers size={12} className="text-violet-600" />
              <span className="text-violet-700 font-bold">B2B SaaS SUITE - 3 MODULES IN ONE</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-bold tracking-tight leading-[1.02] mb-6">
              <span className="bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">Find.</span>{' '}
              <span className="bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">Reach.</span>{' '}
              <span className="bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">Convert.</span>
              <br />
              <span className="text-content-primary">All in Volia.</span>
            </h1>

            <p className="text-lg sm:text-xl text-content-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
              One tool instead of{' '}
              <strong className="text-content-primary font-semibold">Apollo + Lemlist + HubSpot</strong>.{' '}
              <strong className="text-violet-700">Prospecting</strong>,{' '}
              <strong className="text-blue-700">Campaigns</strong>, and{' '}
              <strong className="text-emerald-700">CRM</strong>. From{' '}
              <strong className="text-content-primary font-semibold">$21/mo</strong>. You do the math.
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

            <div className="flex items-center justify-center gap-4 text-xs text-content-tertiary flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Save ~$275/mo vs the 3-tool stack
              </span>
              <span aria-hidden="true">·</span>
              <span>No credit card</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium">GDPR by default</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium">Built in France</span>
            </div>
          </div>
        </section>

        {/* ── 3 MODULES ── */}
        <section className="py-24 px-4 sm:px-6 border-t border-line bg-gradient-to-b from-white via-zinc-50/50 to-white">
          <div className="max-w-6xl mx-auto">
            <MotionInView>
              <div className="text-center mb-14">
                <p className="text-sm font-semibold text-violet-600 mb-3 uppercase tracking-wider">The Volia suite</p>
                <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  3 modules. 1 product. 1 bill.
                </h2>
                <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
                  Find prospects. Reach them. Close deals.
                  Without the SaaS shopping spree.
                </p>
              </div>
            </MotionInView>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {[
                {
                  name: 'Prospecting',
                  tagline: 'Find emails for any French B2B company. Yes, any.',
                  status: 'LIVE',
                  statusColor: 'bg-emerald-100 text-emerald-700 border-emerald-300',
                  icon: Search,
                  color: 'violet',
                  bg: 'from-violet-50 via-white to-violet-50/50',
                  border: 'border-violet-300',
                  iconBg: 'from-violet-500 to-indigo-600',
                  bullets: ['150+ industries, 101 French departments', 'Web scraping + Google search', 'Confidence score per lead'],
                  href: '/en/products/prospection',
                  cta: 'Learn more',
                },
                {
                  name: 'Campaigns',
                  tagline: 'Cold email sequences that actually land in the inbox.',
                  status: 'BETA',
                  statusColor: 'bg-blue-100 text-blue-700 border-blue-300',
                  icon: Mail,
                  color: 'blue',
                  bg: 'from-blue-50 via-white to-cyan-50/50',
                  border: 'border-blue-300',
                  iconBg: 'from-blue-500 to-cyan-600',
                  bullets: ['Cold email + auto follow-ups', 'Automatic domain warmup', 'Pre-written templates'],
                  href: '/en/products/campaigns',
                  cta: 'Learn more',
                },
                {
                  name: 'CRM',
                  tagline: 'Sales pipeline. Native. No HubSpot tax.',
                  status: 'COMING SOON',
                  statusColor: 'bg-amber-100 text-amber-700 border-amber-300',
                  icon: Layers,
                  color: 'emerald',
                  bg: 'from-emerald-50 via-white to-teal-50/50',
                  border: 'border-emerald-300',
                  iconBg: 'from-emerald-500 to-teal-600',
                  bullets: ['Auto contacts from Campaigns', 'Kanban deal pipeline', 'Closing rate reporting'],
                  href: '/en/products/crm',
                  cta: 'Join the beta',
                },
              ].map((mod, i) => {
                const Icon = mod.icon;
                return (
                  <MotionInView key={mod.name} delay={i * 120}>
                    <Link
                      href={mod.href}
                      className={`group block h-full p-7 rounded-2xl border-2 ${mod.border} bg-gradient-to-br ${mod.bg} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon size={22} className="text-white" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${mod.statusColor}`}>
                          {mod.status}
                        </span>
                      </div>
                      <div className="text-xs text-content-tertiary uppercase tracking-wider mb-1">Volia</div>
                      <h3 className="text-2xl font-bold text-content-primary mb-2">{mod.name}</h3>
                      <p className="text-sm text-content-secondary mb-5 leading-relaxed">{mod.tagline}</p>
                      <ul className="space-y-2 mb-6">
                        {mod.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm text-content-secondary">
                            <Check size={14} className={`flex-shrink-0 mt-0.5 text-${mod.color}-600`} />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                      <div className={`inline-flex items-center gap-1.5 text-sm font-semibold text-${mod.color}-700 group-hover:gap-2 transition-all`}>
                        {mod.cta}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </MotionInView>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── STACK COMPARISON ── */}
        <section className="relative py-24 px-4 sm:px-6 border-t border-line overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-rose-100/30 to-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="max-w-6xl mx-auto relative z-10">
            <MotionInView>
              <div className="text-center mb-14">
                <p className="text-sm font-semibold text-emerald-600 mb-3 uppercase tracking-wider">Stack comparison</p>
                <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  One tool. One price. Done.
                </h2>
                <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
                  For the price of Apollo alone (~$99/mo), you get all 3 Volia modules.
                  Math says: <strong className="text-emerald-700">~$275/mo back in your pocket</strong>.
                </p>
              </div>
            </MotionInView>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <MotionInView delay={100}>
                <div className="h-full p-7 rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50/50 via-white to-white shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-rose-600 mb-1">Before Volia</div>
                      <h3 className="text-xl font-bold text-content-primary">Equivalent stack</h3>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">3 subs</div>
                  </div>
                  <div className="space-y-3 mb-6">
                    {[
                      { tool: 'Apollo', desc: 'Prospecting', price: '$99' },
                      { tool: 'Lemlist', desc: 'Email campaigns', price: '$99' },
                      { tool: 'HubSpot Starter', desc: 'CRM', price: '$90' },
                    ].map((row) => (
                      <div key={row.tool} className="flex items-center justify-between p-3 rounded-xl border border-line bg-white">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                            <X size={14} className="text-rose-500" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-content-primary">{row.tool}</div>
                            <div className="text-xs text-content-tertiary">{row.desc}</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-content-secondary tabular-nums">{row.price}/mo</div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-rose-200">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-semibold text-content-secondary">Total</span>
                      <div className="text-right">
                        <span className="text-4xl font-bold font-mono text-rose-600 tabular-nums">~$288</span>
                        <span className="text-content-tertiary text-sm">/mo</span>
                      </div>
                    </div>
                    <p className="text-xs text-content-tertiary mt-2">Plus CSV export/import between tools. Every. Single. Day.</p>
                  </div>
                </div>
              </MotionInView>

              <MotionInView delay={250}>
                <div className="relative h-full p-7 rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-violet-50/50 shadow-xl shadow-emerald-500/10">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                    Recommended - Volia Business
                  </div>
                  <div className="flex items-center justify-between mb-6 mt-2">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">With Volia</div>
                      <h3 className="text-xl font-bold text-content-primary">Unified suite</h3>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">1 subscription</div>
                  </div>
                  <div className="space-y-3 mb-6">
                    {[
                      { tool: 'Volia Prospecting', desc: '287,000+ FR companies', color: 'violet' },
                      { tool: 'Volia Campaigns', desc: 'Email sequences + warmup', color: 'blue' },
                      { tool: 'Volia CRM', desc: 'Kanban pipeline + deals', color: 'emerald' },
                    ].map((row) => (
                      <div key={row.tool} className="flex items-center justify-between p-3 rounded-xl border border-line bg-white">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full bg-${row.color}-100 flex items-center justify-center flex-shrink-0`}>
                            <Check size={14} className={`text-${row.color}-600`} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-content-primary">{row.tool}</div>
                            <div className="text-xs text-content-tertiary">{row.desc}</div>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Included</div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-emerald-200">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-semibold text-content-secondary">Total</span>
                      <div className="text-right">
                        <span className="text-4xl font-bold font-mono bg-gradient-to-br from-emerald-600 to-teal-700 bg-clip-text text-transparent tabular-nums">$110</span>
                        <span className="text-content-tertiary text-sm">/mo</span>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-700 font-semibold mt-2">
                      Save ~$178/mo. ~$2,140/year. No CSV gymnastics.
                    </p>
                  </div>
                </div>
              </MotionInView>
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
                  Everything outbound needs. Nothing it doesn't.
                </h2>
              </div>
            </MotionInView>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Layers, title: 'Waterfall enrichment', desc: 'Scrape the site. Search Google. Guess the pattern. Stop the second we find a real email.' },
                { icon: Sparkles, title: 'AI search (Claude)', desc: 'Type "50 SaaS founders in Paris" — get a Google Places query in 2 seconds. No filters to learn.' },
                { icon: Globe, title: 'Best France coverage', desc: '287,000+ verified French companies. 78% email hit rate. Apollo and Hunter sit around 40%.' },
                { icon: Mail, title: 'Native cold email', desc: '28-day auto warmup. Multi-inbox rotation. 94% inbox rate. No Smartlead subscription needed.' },
                { icon: Zap, title: 'Auto-create deals', desc: 'Someone replies? A deal shows up in your CRM. No copy-paste. No Zapier. No tabs.' },
                { icon: Check, title: 'GDPR by default', desc: 'Personal-email filter, public opt-out, EU hosting, CNIL guidelines. Built-in, not bolted on.' },
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
          <div className="max-w-6xl mx-auto">
            <MotionInView>
              <div className="text-center mb-14">
                <p className="text-sm font-semibold text-violet-600 mb-3 uppercase tracking-wider">Pricing</p>
                <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  Honest pricing. No "contact sales".
                </h2>
                <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
                  USD shown, EUR billed (your bank converts at market rate). No commitment. Cancel in 1 click.
                </p>
              </div>
            </MotionInView>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PLANS_EN.map((plan) => (
                <div key={plan.name} className={`relative p-7 rounded-2xl backdrop-blur-sm ${
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
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-content-tertiary text-sm">{plan.period}</span>
                  </div>
                  {plan.sub && <p className="text-[11px] text-content-tertiary mb-5">{plan.sub} billed in EUR</p>}
                  {!plan.sub && <p className="mb-5">&nbsp;</p>}
                  <Link
                    href={plan.ctaHref}
                    className={`block w-full py-3 text-center text-sm font-semibold rounded-xl transition mb-6 ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20'
                        : 'border border-line-hover hover:bg-surface-elevated text-content-secondary'
                    }`}
                  >
                    {plan.cta}{plan.highlighted ? ' →' : ''}
                  </Link>
                  <div className="space-y-2.5">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <Check size={15} className="text-violet-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-content-secondary leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
            <p className="text-xs text-content-tertiary mt-6">No credit card - Cancel in 1 click - GDPR by default</p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-line py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10 pb-10 border-b border-line">
            <div>
              <h3 className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-3">Products</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/en/products/prospection" className="text-content-tertiary hover:text-violet-400 transition">Prospecting</Link></li>
                <li><Link href="/en/products/campaigns" className="text-content-tertiary hover:text-blue-500 transition">Campaigns</Link></li>
                <li><Link href="/en/products/crm" className="text-content-tertiary hover:text-emerald-500 transition">CRM</Link></li>
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
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <LogoIcon size="xs" />
              <span className="text-sm font-bold tracking-tight ml-1">Volia</span>
              <span className="text-violet-400 text-[10px] font-semibold">.fr</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-content-tertiary">
              <Link href="/cgu" className="hover:text-content-secondary transition">Terms</Link>
              <Link href="/confidentialite" className="hover:text-content-secondary transition">Privacy</Link>
              <Link href="/rgpd" className="hover:text-content-secondary transition">GDPR</Link>
              <Link href="/opt-out" className="hover:text-content-secondary transition">Opt-out</Link>
            </div>
            <p className="text-[11px] text-content-muted">&copy; 2026 Volia.fr - Built in France</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
