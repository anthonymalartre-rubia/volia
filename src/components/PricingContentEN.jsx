'use client';

// ─────────────────────────────────────────────────────────────────────
// PricingContentEN — English standalone /pricing version (Volia)
// ─────────────────────────────────────────────────────────────────────
// Mirror of PricingContent.jsx (FR source of truth, June 2026 freemium
// pivot). Public lineup: Free / Prospection / MAX.
//
//   Free        → the WHOLE suite (Campaigns, CRM, Forms, Project)
//                 with limits + 25 discovery Prospection credits.
//   Prospection → €19/mo: the data. 500 enrichment credits/month.
//   MAX         → €179/mo: unlimited suite + Autopilot + 2,000 credits.
//                 Code MAX99 = first 3 months at €99.
//
// Solo / Pro / Business / Enterprise are legacy (grandfathered, no
// longer shown). Prices displayed in EUR (billing currency).
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import Link from 'next/link';
import {
  Check, X, ArrowRight, Sparkles, Crown, Star, Shield, Globe,
  RefreshCw, Calendar, TrendingUp, Headphones, Lock, FileText,
  ChevronDown, Zap, Rocket, Building2,
} from 'lucide-react';
import { LogoIcon } from '@/components/ui';
import MotionInView from '@/components/MotionInView';
import { useForceLightTheme } from '@/lib/use-force-light-theme';

// ─── Plan model (EUR, mirrors src/lib/plans.js) ───────────────────
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'The whole suite, to get started',
    monthlyEur: 0,
    yearlyEur: 0,
    cta: 'Start for free',
    href: '/signup?plan=free',
    inheritsFrom: null,
    features: [
      'Campaigns, CRM, Forms & Project included',
      '200 cold emails / month (your own domain)',
      '1 CRM pipeline · 2 forms · 1 client project',
      '25 free Prospection credits / month',
      '101 French departments (all of France)',
    ],
  },
  {
    id: 'prospection',
    name: 'Prospection',
    tagline: 'Find B2B emails',
    monthlyEur: 19,
    yearlyEur: 190,
    cta: 'Choose Prospection',
    href: '/signup?plan=prospection',
    inheritsFrom: 'Free',
    features: [
      '500 Prospection credits / month (1 credit = 1 email found)',
      '500 phone numbers / month (landline & mobile)',
      'Waterfall enrichment (scraping + Google)',
      'Unlimited exports · unlimited folders',
      'Email verification (MillionVerifier)',
      'Email support (48 h)',
    ],
  },
  {
    id: 'max',
    name: 'MAX',
    tagline: 'Your B2B pipeline, end-to-end auto',
    monthlyEur: 179,
    yearlyEur: 1690,
    cta: 'Go MAX',
    href: '/signup?plan=max',
    inheritsFrom: 'Prospection',
    highlight: true,
    badge: '⚡ AUTOPILOT',
    unlocksModules: true,
    promo: {
      priceEur: 99,
      label: 'Code MAX99',
      sublabel: 'First 3 months at €99 — then €179/mo',
      code: 'MAX99',
    },
    features: [
      '⚡ Volia Autopilot — end-to-end B2B pipeline (3 workflows, IF/ELSE, A/B)',
      'UNLIMITED Campaigns, CRM, Forms & Project',
      '2,000 Prospection credits / month',
      'Decision-maker enrichment (CEO, CMO, Sales, HR)',
      '10,000 cold emails / month (auto warmup included)',
      '10,000 phone numbers / month',
      'Multi-user (teams, RBAC)',
      'MCP server + REST API (Zapier, Make, n8n)',
      'Priority support',
    ],
  },
];

// Modules per plan — freemium pivot: all 4 modules are included
// EVERYWHERE (with limits outside MAX). Autopilot = MAX only.
const PLAN_MODULES = {
  free:        { prospection: 'limited', campaigns: true, crm: true, forms: true },
  prospection: { prospection: true,      campaigns: true, crm: true, forms: true },
  max:         { prospection: true,      campaigns: true, crm: true, forms: true },
};

const PLAN_VISUALS = {
  free:        { ring: 'border-line', bg: 'bg-surface-card', accent: 'text-content-tertiary' },
  prospection: { ring: 'border-violet-300', bg: 'bg-violet-50/40', accent: 'text-violet-700' },
  max:         { ring: 'border-amber-400 ring-2 ring-amber-400/30', bg: 'bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-50', accent: 'text-amber-700' },
};

// ─── Comparison table ──────────────────────────────────────────────
// Columns: Free / Prospection / MAX (3 values per row) — mirrors the
// 7 FR sections.
const COMPARE_SECTIONS = [
  {
    title: '⚡ Volia Autopilot (auto pipeline)',
    rows: [
      ['Autopilot workflows', false, false, '3'],
      ['Full pipeline: scrape → email → qualify → CRM', false, false, true],
      ['AI-personalized emails (Claude)', false, false, true],
      ['Auto scoring + Hot / Warm / Cold routing', false, false, true],
      ['23 ready-to-use pipeline templates', false, false, true],
      ['Custom branching (IF / ELSE per tier)', false, false, true],
      ['A/B subject testing + auto winner', false, false, true],
      ['Weekly Claude optimization', false, false, true],
    ],
  },
  {
    title: 'Prospection module (credit-based)',
    rows: [
      ['Prospection credits / month (emails found)', '25', '500', '2,000'],
      ['Phone numbers / month', '25', '500', '10,000'],
      ['Searches / month', '100', '2,000', '10,000'],
      ['Email verification (MillionVerifier)', false, '100/mo', '5,000/mo'],
      ['Decision-maker enrichment (CEO, CMO, Sales…)', false, false, true],
      ['Waterfall enrichment (7 sources)', true, true, true],
      ['AI natural-language search', true, true, true],
      ['CSV exports', '5/mo', 'Unlimited', 'Unlimited'],
      ['Google Places access (entire French B2B landscape)', true, true, true],
      ['101 departments (overseas included) · 150+ industries', true, true, true],
    ],
  },
  {
    title: 'Campaigns module (cold email) — included everywhere',
    rows: [
      ['Cold emails / month', '200', '200', '10,000'],
      ['Multi-step sequences', '1', '1', 'Unlimited'],
      ['Multi-tenant sending domains (your domain)', true, true, true],
      ['Auto 28-day warmup', false, false, true],
      ['B2B email templates (20+)', true, true, true],
      ['Open / click tracking + auto-replies to CRM', true, true, true],
    ],
  },
  {
    title: 'CRM module — included everywhere',
    rows: [
      ['Pipelines', '1', '1', 'Unlimited'],
      ['Drag-and-drop Kanban', true, true, true],
      ['Auto-create deals from replies', true, true, true],
      ['360° timeline + activities', true, true, true],
      ['Automations (won → onboarding, follow-ups)', false, false, true],
    ],
  },
  {
    title: 'Forms module — included everywhere',
    rows: [
      ['Published forms', '2', '2', 'Unlimited'],
      ['Submissions / month', '100', '100', '5,000'],
      ['Drag-drop builder + multi-step + AND/OR logic', true, true, true],
      ['Native CRM + Campaigns bridges', true, true, true],
      ['QR code + iframe embed + webhooks', true, true, true],
    ],
  },
  {
    title: 'Project module — included everywhere',
    rows: [
      ['Active projects', '1', '1', 'Unlimited'],
      ['Won deal → project in 1 click', true, true, true],
      ['Public client tracking link', true, true, true],
      ['Deliverables + attachments', true, true, true],
    ],
  },
  {
    title: 'Support & guarantees',
    rows: [
      ['Email support', 'Standard', '48 h', 'Priority'],
      ['Personalized onboarding', false, false, true],
      ['MCP server (Claude, Cursor, AI agents)', false, false, true],
      ['Public REST API + Zapier / Make', false, true, true],
      ['Multi-user (teams / RBAC)', false, false, true],
      ['GDPR-compliant (France) · EU data hosting', true, true, true],
    ],
  },
];

// ─── Personas — which plan is for you? ─────────────────────────────
const PERSONAS = [
  {
    icon: Rocket,
    color: 'from-violet-600 to-indigo-600',
    title: 'I want to structure my sales',
    plan: 'free',
    planLabel: 'Free · €0',
    description: 'CRM + Campaigns + Forms + Project included, for free. Manage your deals, send 200 cold emails/month from your own domain, and give every client a tracking link.',
  },
  {
    icon: Building2,
    color: 'from-indigo-600 to-blue-600',
    title: 'I need B2B emails',
    plan: 'prospection',
    planLabel: 'Prospection · €19/mo',
    description: '500 credits/month: target by industry and department, the waterfall cascade finds emails + phone numbers across the French SMB landscape. Cheapest on the market.',
  },
  {
    icon: Sparkles,
    color: 'from-amber-500 to-orange-600',
    title: 'I want everything on autopilot',
    plan: 'max',
    planLabel: 'MAX · €99/mo for 3 months (code MAX99), then €179',
    description: 'Volia Autopilot scrapes, enriches, writes (AI), sends, qualifies and pushes hot leads into your CRM. Unlimited suite + 2,000 credits + teams + MCP.',
    highlight: true,
  },
];

// ─── Trust strip ───────────────────────────────────────────────────
const TRUST_SIGNALS = [
  { icon: Shield, label: 'GDPR-compliant (France)' },
  { icon: Globe, label: 'Data hosted in the EU' },
  { icon: RefreshCw, label: '1-click cancellation' },
  { icon: Calendar, label: 'No commitment of duration' },
  { icon: TrendingUp, label: 'Change plan anytime' },
  { icon: Headphones, label: 'English & French support' },
  { icon: FileText, label: 'Clear ToS + DPA available', href: '/dpa' },
  { icon: Lock, label: 'Secure Stripe (PCI DSS)' },
];

// ─── FAQ ───────────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'How does the MAX99 code work?',
    a: 'Enter code MAX99 at checkout and the MAX plan drops to €99/mo for your first 3 months (instead of €179), then reverts to the standard price. No hidden fees, 1-click cancellation anytime.',
  },
  {
    q: 'Is there really a free plan?',
    a: 'Yes — free forever, no credit card. The Free plan includes the whole suite: Campaigns (200 cold emails/mo), CRM (1 pipeline), Forms (2 forms), Project (1 active project), plus 25 Prospection credits every month. No surprise charge — ever.',
  },
  {
    q: 'Can I change plans anytime?',
    a: 'Yes, 1 click from settings. Upgrade or downgrade, pro-rata is calculated automatically — you only pay the difference for the current month.',
  },
  {
    q: 'What happens if I hit a monthly limit?',
    a: 'Email alert at 80% and 100%. Beyond that, the feature pauses until renewal or upgrade. No surprise invoice — ever.',
  },
  {
    q: 'How does yearly billing work?',
    a: 'Pay 10 months, get 12. Prospection: €190/year instead of €228 — €38 back in your pocket. MAX: €1,690/year instead of €2,148, €458 saved. Billed once (card or wire).',
  },
  {
    q: 'How do I cancel?',
    a: 'Settings > Plan > "Manage subscription". 1 click, no questions, no passive-aggressive email. Access stays active until the end of the paid period.',
  },
  {
    q: 'Wire transfer accepted?',
    a: 'Yes on the annual MAX plan. Send your VAT/company info to contact@volia.fr and we issue a pro-forma invoice within 24 h.',
  },
  {
    q: 'Is everything really included in the price?',
    a: 'Yes. Access to the entire French B2B landscape (101 departments x 150+ sectors), waterfall enrichment, CSV exports, transactional emails. No hidden feature behind a paywall.',
  },
  {
    q: 'Is the CRM really free?',
    a: 'Yes, in full and for everyone. Drag-and-drop Kanban, deals auto-created from email replies, 360° timeline per contact, activities (notes, calls, meetings). 1 pipeline on Free, unlimited on MAX. You can uninstall HubSpot.',
  },
  {
    q: 'Payment methods?',
    a: 'Card (Visa, Mastercard, Amex) via Stripe on every plan. SEPA and wire transfer on annual MAX. PayPal on request.',
  },
  {
    q: 'Refunds?',
    a: '14-day money-back on the first payment, no questions asked — one email to contact@volia.fr is enough. After that, 1-click cancellation lets you keep access until the end of the paid period.',
  },
  {
    q: 'Discount for nonprofits / students?',
    a: '-50% on Prospection for registered nonprofits and students (proof required). Email contact@volia.fr from your institutional address.',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────
function formatEur(amount) {
  if (amount === 0) return '€0';
  return `€${amount.toLocaleString('en-US')}`;
}

function Cell({ value }) {
  if (value === true) return <Check size={16} className="text-emerald-500 mx-auto" aria-label="Included" />;
  if (value === false) return <X size={16} className="text-content-muted mx-auto" aria-label="Not included" />;
  return <span className="text-xs text-content-secondary">{value}</span>;
}

export default function PricingContentEN() {
  useForceLightTheme();
  const [period, setPeriod] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);
  const isYearly = period === 'yearly';

  // Yearly savings vs paying 12 monthly invoices.
  const yearlySavingsByPlan = {
    prospection: 19 * 12 - 190,   // €38
    max: 179 * 12 - 1690,         // €458
  };
  const maxSavings = Math.max(...Object.values(yearlySavingsByPlan));

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
              <Link href="/en/products/prospection" className="text-sm text-content-tertiary hover:text-content-primary transition">Products</Link>
              <Link href="/en/pricing" className="text-sm font-semibold text-content-primary transition">Pricing</Link>
              <Link href="/blog" className="text-sm text-content-tertiary hover:text-content-primary transition">Blog</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/pricing" className="text-xs text-content-tertiary hover:text-content-primary transition">FR</Link>
              <Link href="/login" className="text-sm text-content-tertiary hover:text-content-primary transition">Log in</Link>
              <Link href="/signup" className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold shadow shadow-violet-500/20 hover:shadow-violet-500/40 transition">Sign up</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-24 pb-12">

        {/* ── 1. HERO ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center mb-12">
          <MotionInView>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-xs font-medium text-violet-700 mb-6">
              <Sparkles size={12} />
              Pricing. No bullshit.
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
              The price of a coffee a day<br />for a B2B pipeline<br />on autopilot.
            </h1>
            <p className="text-lg sm:text-xl text-content-secondary leading-relaxed max-w-2xl mx-auto mb-8">
              <strong className="text-content-primary">The suite is free</strong> — Campaigns, CRM, Forms &amp; Project included for everyone.
              You pay to fill it (<strong className="text-content-primary">Prospection, €19/month</strong>) or to run it on autopilot (<strong className="text-content-primary">MAX</strong>).
              <strong className="text-amber-600"> Code MAX99: €99/month for your first 3 months.</strong>
            </p>

            {/* Monthly / Yearly toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full border border-line bg-surface-card shadow-sm mb-6">
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={`px-5 py-2 text-sm font-medium rounded-full transition ${
                  !isYearly ? 'bg-violet-600 text-white shadow-sm' : 'text-content-tertiary hover:text-content-primary'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setPeriod('yearly')}
                className={`px-5 py-2 text-sm font-medium rounded-full transition flex items-center gap-2 ${
                  isYearly ? 'bg-violet-600 text-white shadow-sm' : 'text-content-tertiary hover:text-content-primary'
                }`}
              >
                Yearly
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isYearly ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  -2 MONTHS
                </span>
              </button>
            </div>

            <p className="text-sm font-semibold text-emerald-700 mb-2" aria-live="polite">
              {isYearly
                ? `You save up to ${formatEur(maxSavings)}/year`
                : `Switch to yearly and save up to ${formatEur(maxSavings)}/year`}
            </p>
            <p className="text-xs text-content-tertiary mb-6">
              Prospection: -€38/yr · MAX: -€458/yr
            </p>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-content-tertiary">
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> Free plan forever, no card</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> 1-click cancel</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> GDPR France</span>
            </div>
          </MotionInView>
        </section>

        {/* ── 1b. MAX99 PROMO BANNER ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-10">
          <MotionInView>
            <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 p-5 sm:p-6 text-center">
              <p className="text-sm sm:text-base font-semibold text-amber-900">
                ⚡ MAX launch offer — <span className="font-bold">€99/month</span> for your first 3 months (then €179).
              </p>
              <p className="text-xs text-amber-800 mt-1.5">
                Code <code className="px-1.5 py-0.5 rounded bg-amber-200/70 font-bold tracking-wide">MAX99</code> at checkout · Autopilot + unlimited suite + 2,000 credits/month.
              </p>
            </div>
          </MotionInView>
        </section>

        {/* ── 2. PLAN CARDS ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {PLANS.map((plan, idx) => {
              const visuals = PLAN_VISUALS[plan.id];
              const modules = PLAN_MODULES[plan.id];
              const isFree = plan.monthlyEur === 0;

              return (
                <MotionInView key={plan.id} delay={idx * 80}>
                  <div className={`relative h-full p-6 rounded-2xl border ${visuals.ring} ${visuals.bg} flex flex-col`}>
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[11px] font-semibold rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                        <Crown size={11} />
                        {plan.badge}
                      </div>
                    )}

                    <h3 className={`text-lg font-semibold mb-1 ${visuals.accent}`}>{plan.name}</h3>
                    <p className="text-xs text-content-tertiary mb-5 min-h-[32px]">{plan.tagline}</p>

                    {/* PRICE — special handling for MAX with the MAX99 promo.
                        Monthly: promo price big + standard price struck.
                        Yearly: standard yearly price (no promo on annual). */}
                    {plan.id === 'max' && !isYearly && plan.promo ? (
                      <>
                        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                          <span className="text-4xl font-bold text-content-primary">
                            {formatEur(plan.promo.priceEur)}
                          </span>
                          <span className="text-content-tertiary text-sm">/mo</span>
                          <span className="text-lg text-content-muted line-through font-medium">
                            {formatEur(plan.monthlyEur)}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-emerald-700 mb-1">
                          🎉 {plan.promo.label}
                        </p>
                        <p className="text-[11px] text-content-tertiary mb-5">
                          {plan.promo.sublabel}
                        </p>
                      </>
                    ) : plan.id === 'max' && isYearly ? (
                      <>
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-4xl font-bold text-content-primary">
                            {formatEur(plan.yearlyEur)}
                          </span>
                          <span className="text-content-tertiary text-sm">/yr</span>
                        </div>
                        <p className="text-[11px] text-emerald-600 font-medium mb-5">
                          ~€{Math.round(plan.yearlyEur / 12)}/mo · 2 months free
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-4xl font-bold text-content-primary">
                            {formatEur(isYearly ? plan.yearlyEur : plan.monthlyEur)}
                          </span>
                          <span className="text-content-tertiary text-sm">
                            {isYearly && !isFree ? '/yr' : '/mo'}
                          </span>
                        </div>

                        {isFree ? (
                          <p className="text-[11px] text-content-tertiary mb-5">Forever free, no card</p>
                        ) : isYearly ? (
                          <p className="text-[11px] text-emerald-600 font-medium mb-5">
                            ~€{Math.round(plan.yearlyEur / 12)}/mo · save {formatEur(yearlySavingsByPlan[plan.id])}
                          </p>
                        ) : (
                          <p className="text-[11px] text-content-tertiary mb-5">
                            or {formatEur(plan.yearlyEur)}/yr (save {formatEur(yearlySavingsByPlan[plan.id])})
                          </p>
                        )}
                      </>
                    )}

                    <Link
                      href={`${plan.href}${!isFree ? `&period=${period}` : ''}`}
                      className={`block w-full py-3 text-center text-sm font-semibold rounded-xl transition mb-5 ${
                        plan.id === 'max'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/20'
                          : plan.id === 'prospection'
                            ? 'bg-content-primary text-surface-base hover:bg-content-secondary'
                            : 'border border-line-hover hover:bg-surface-elevated text-content-secondary'
                      }`}
                    >
                      {plan.cta}
                    </Link>

                    {/* MAX killer feature: unlimited suite + Autopilot */}
                    {plan.unlocksModules && (
                      <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 border border-violet-300">
                        <p className="text-[11px] font-bold text-violet-900 mb-1 flex items-center gap-1">
                          <Star size={11} fill="currentColor" /> UNLIMITED suite + Autopilot
                        </p>
                        <p className="text-[11px] text-violet-700 leading-snug">
                          CRM · Campaigns · Forms · Project, no caps
                        </p>
                      </div>
                    )}

                    {/* Module badges (simplified) */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        modules.prospection === true
                          ? 'bg-violet-100 text-violet-700'
                          : modules.prospection === 'limited'
                            ? 'bg-zinc-100 text-zinc-600'
                            : 'bg-zinc-50 text-content-muted'
                      }`}>
                        ✓ Prospection{modules.prospection === 'limited' ? ' (limited)' : ''}
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

                    {/* "Everything in X +" intro before delta features */}
                    {plan.inheritsFrom && (
                      <p className="text-[11px] font-semibold text-content-secondary mb-3 pb-3 border-b border-line">
                        ✓ Everything in {plan.inheritsFrom} +
                      </p>
                    )}

                    {/* Delta features — Autopilot lines (⚡) get the amber
                        flagship treatment, mirroring the FR pricing page. */}
                    <div className="space-y-2.5 flex-1">
                      {plan.features.map((f) => {
                        const isAutopilot = f.startsWith('⚡');
                        if (isAutopilot) {
                          return (
                            <div
                              key={f}
                              className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-2"
                            >
                              <Zap size={14} className="text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" />
                              <span className="text-xs font-semibold text-amber-900 leading-relaxed">
                                {f.replace(/^⚡\s*/, '')}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <div key={f} className="flex items-start gap-2">
                            <Check size={14} className="text-violet-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-content-secondary leading-relaxed">{f}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </MotionInView>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <p className="text-sm text-content-secondary">
              Not sure which plan fits your needs?
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900 transition"
            >
              Book a 15-min demo
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ── 3. SAVINGS BANNER ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
          <div className={`rounded-2xl border p-5 sm:p-6 text-center transition ${
            isYearly
              ? 'border-emerald-200 bg-emerald-50/60'
              : 'border-violet-200 bg-violet-50/60'
          }`}>
            {isYearly ? (
              <p className="text-sm sm:text-base text-content-secondary">
                <Check size={16} className="inline -mt-0.5 mr-1.5 text-emerald-600" />
                You save up to{' '}
                <strong className="text-emerald-700">{formatEur(maxSavings)}/year</strong>{' '}
                vs monthly billing — that&apos;s 2 months free.
              </p>
            ) : (
              <p className="text-sm sm:text-base text-content-secondary">
                <Sparkles size={16} className="inline -mt-0.5 mr-1.5 text-violet-600" />
                Switch to yearly and save up to{' '}
                <strong className="text-violet-700">{formatEur(maxSavings)}/year</strong>{' '}
                (2 months free on the MAX plan).
              </p>
            )}
          </div>
        </section>

        {/* ── 4. DETAILED COMPARISON TABLE ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
          <MotionInView>
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-violet-600 mb-3">DETAILED COMPARISON</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                Everything, plan by plan.
              </h2>
              <p className="text-content-tertiary text-base max-w-xl mx-auto">
                Zero feature hidden behind a paywall. If it&apos;s in the table, it&apos;s in the plan.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-line bg-surface-card shadow-sm">
              <table className="w-full min-w-[720px]">
                <thead className="sticky top-0 bg-surface-card z-10 border-b border-line">
                  <tr>
                    <th className="text-left text-xs font-semibold text-content-tertiary uppercase tracking-wider px-5 py-4 w-[40%]">
                      Features
                    </th>
                    {PLANS.map((plan) => (
                      <th key={plan.id} className="text-center px-3 py-4 w-[15%]">
                        <div className="text-sm font-bold text-content-primary">{plan.name}</div>
                        <div className="text-[11px] text-content-tertiary mt-0.5">
                          {plan.monthlyEur === 0 ? 'Free' : `€${plan.monthlyEur}/mo`}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_SECTIONS.map((section) => (
                    <ComparisonSection key={section.title} section={section} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* MAX99 footnote under the table */}
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
              <Zap size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
              <p>
                <strong>MAX launch offer</strong> — €99/mo for your first 3 months with code{' '}
                <strong>MAX99</strong> at checkout, then €179/mo.{' '}
                <Link href="/en/products/autopilot" className="underline font-semibold">See Autopilot →</Link>
              </p>
            </div>
          </MotionInView>
        </section>

        {/* ── 5. PERSONAS — which plan is for you? ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
          <MotionInView>
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-violet-600 mb-3">WHICH PLAN?</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                Which one is for you?
              </h2>
              <p className="text-content-tertiary text-base max-w-xl mx-auto">
                Go with your gut. Change your mind tomorrow? 1 click and it&apos;s done.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PERSONAS.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <MotionInView key={p.plan} delay={idx * 80}>
                    <div className={`h-full p-6 rounded-2xl border transition hover:shadow-lg ${
                      p.highlight
                        ? 'border-amber-300 bg-gradient-to-b from-amber-50/60 to-white shadow-md'
                        : 'border-line bg-surface-card'
                    }`}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 shadow-md`}>
                        <Icon size={22} className="text-white" />
                      </div>
                      <h3 className="text-base font-semibold text-content-primary mb-1">{p.title}</h3>
                      <p className={`text-xs font-medium mb-3 ${p.highlight ? 'text-amber-700' : 'text-content-tertiary'}`}>
                        {p.planLabel}
                        {p.highlight && <span className="ml-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700"><Star size={9} fill="currentColor" /> POPULAR</span>}
                      </p>
                      <p className="text-xs text-content-secondary leading-relaxed mb-5">
                        {p.description}
                      </p>
                      <Link
                        href={`/signup?plan=${p.plan}&period=${period}`}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold transition ${
                          p.highlight ? 'text-amber-700 hover:text-amber-800' : 'text-content-secondary hover:text-content-primary'
                        }`}
                      >
                        Pick this plan <ArrowRight size={12} />
                      </Link>
                    </div>
                  </MotionInView>
                );
              })}
            </div>
          </MotionInView>
        </section>

        {/* ── 6. TRUST STRIP ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
          <MotionInView>
            <div className="rounded-2xl border border-line bg-surface-card p-6 sm:p-8">
              <h2 className="text-center text-base font-semibold text-content-primary mb-6">
                Included in every plan
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {TRUST_SIGNALS.map((sig) => {
                  const Icon = sig.icon;
                  const inner = (
                    <>
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                        <Icon size={16} className="text-violet-600" />
                      </div>
                      <span className="text-xs text-content-secondary leading-tight">{sig.label}</span>
                    </>
                  );
                  return sig.href ? (
                    <Link
                      key={sig.label}
                      href={sig.href}
                      className="flex flex-col items-center text-center gap-2 hover:text-content-primary transition"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={sig.label} className="flex flex-col items-center text-center gap-2">
                      {inner}
                    </div>
                  );
                })}
              </div>
            </div>
          </MotionInView>
        </section>

        {/* ── 7. FAQ ── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20" id="faq">
          <MotionInView>
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-violet-600 mb-3">PRICING FAQ</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                Your questions, our answers
              </h2>
              <p className="text-content-tertiary text-base">
                Everything you need to know before signing up.
              </p>
            </div>

            <div className="space-y-3">
              {FAQ.map((item, idx) => {
                const isOpen = openFaq === idx;
                const panelId = `pricing-faq-panel-${idx}`;
                const buttonId = `pricing-faq-button-${idx}`;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-line bg-surface-card overflow-hidden transition-colors hover:border-line-hover"
                  >
                    <button
                      type="button"
                      id={buttonId}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-inset"
                    >
                      <span className="text-sm font-medium text-content-primary">{item.q}</span>
                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className={`text-content-tertiary flex-shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      hidden={!isOpen}
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-5 pb-4 pt-0">
                        <p className="text-sm text-content-secondary leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </MotionInView>
        </section>

        {/* ── 8. FINAL CTA ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6">
          <MotionInView>
            <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 p-10 sm:p-14 text-center text-white shadow-2xl shadow-violet-500/20">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
                Start free.<br />The whole suite, no credit card.
              </h2>
              <p className="text-violet-100 text-base sm:text-lg mb-8 max-w-xl mx-auto">
                Campaigns, CRM, Forms &amp; Project included for everyone. Code <strong className="text-white">MAX99</strong>: MAX at €99/mo for your first 3 months.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                <Link
                  href="/signup?plan=free"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-violet-700 text-sm font-semibold hover:bg-violet-50 transition shadow-lg w-full sm:w-auto"
                >
                  Create my free account <ArrowRight size={14} />
                </Link>
                <Link
                  href="/en#try-live"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition w-full sm:w-auto"
                >
                  Watch a live demo
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-violet-100">
                <span className="flex items-center gap-1.5"><Check size={11} /> No card</span>
                <span className="flex items-center gap-1.5"><Check size={11} /> 1-click cancel</span>
                <span className="flex items-center gap-1.5"><Check size={11} /> GDPR France</span>
              </div>
            </div>
          </MotionInView>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-line py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-content-tertiary">
          <div className="flex items-center gap-1.5">
            <LogoIcon size="xs" />
            <span className="text-sm font-bold ml-1">Volia</span>
            <span className="text-violet-400 text-[10px] font-semibold">.fr</span>
            <span className="ml-3">&copy; 2026 - Built in France</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-content-secondary">FR Francais</Link>
            <Link href="/en" className="hover:text-content-secondary font-semibold">EN English</Link>
            <Link href="/cgu" className="hover:text-content-secondary">Terms</Link>
            <Link href="/confidentialite" className="hover:text-content-secondary">Privacy</Link>
            <Link href="/rgpd" className="hover:text-content-secondary">GDPR</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-component : comparison table section (header + rows) ───────
function ComparisonSection({ section }) {
  return (
    <>
      <tr className="bg-violet-50/40">
        <td colSpan={4} className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-violet-700">
          {section.title}
        </td>
      </tr>
      {section.rows.map((row, idx) => (
        <tr
          key={row[0]}
          className={`border-b border-line/60 ${idx % 2 === 1 ? 'bg-surface-elevated/30' : ''}`}
        >
          <td className="px-5 py-3 text-sm text-content-secondary">{row[0]}</td>
          {row.slice(1).map((cell, i) => (
            <td key={i} className="px-3 py-3 text-center"><Cell value={cell} /></td>
          ))}
        </tr>
      ))}
    </>
  );
}
