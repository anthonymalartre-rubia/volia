'use client';

// ─────────────────────────────────────────────────────────────────────
// PricingContentEN — English standalone /pricing version (Volia)
// ─────────────────────────────────────────────────────────────────────
// Mirror of PricingContent.jsx (FR source of truth, May 2026 pivot).
// 4 plans (Starter / Solo / Pro / Business). Business = ONLY tier that
// unlocks the 3 secondary modules (Campaigns + CRM + Forms).
//
// Pricing:
//   - Starter $0 (forever)
//   - Solo    $21/mo  (EUR 19)
//   - Pro     $55/mo  (EUR 49)
//   - Business $169/mo first 12 months (launch promo), then $199/mo
//                ≈ EUR 149 promo / EUR 179 normal
//     Yearly:   $1,799/year (≈ EUR 1,690, ~2 months free)
//
// Tone follows the FR "Brand C" pivot: customer-value first, no more
// "5x cheaper than Apollo + Lemlist + HubSpot" head-on attack.
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import Link from 'next/link';
import {
  Check, X, ArrowRight, Sparkles, Crown, Star, Shield, Globe,
  RefreshCw, Calendar, TrendingUp, Headphones, Lock, FileText,
  ChevronDown,
} from 'lucide-react';
import { LogoIcon } from '@/components/ui';
import MotionInView from '@/components/MotionInView';
import { useForceLightTheme } from '@/lib/use-force-light-theme';

// ─── Plan model ───────────────────────────────────────────────────
// USD as the display currency; EUR shown as the billing currency
// underneath each price. Prices follow plans.js (FR source of truth).
//   1 EUR ≈ 1.13 USD (rounded to clean numbers)
//   19 → 21 · 49 → 55 · 149 → 169 (promo) · 179 → 199 · 1690 → 1799
const PLANS = [
  {
    id: 'free',
    name: 'Starter',
    tagline: 'To try Volia',
    monthlyUsd: 0,
    yearlyUsd: 0,
    monthlyEur: 0,
    yearlyEur: 0,
    cta: 'Start free',
    href: '/signup?plan=free',
    inheritsFrom: null,
    features: [
      '20 enrichments / month',
      '5 CSV exports / month',
      'Email + phone scraping (landline & mobile)',
      '101 departments (all of France)',
    ],
  },
  {
    id: 'solo',
    name: 'Solo',
    tagline: 'For freelancers & consultants',
    monthlyUsd: 21,
    yearlyUsd: 215,    // ≈ 190 EUR
    monthlyEur: 19,
    yearlyEur: 190,
    cta: 'Choose Solo',
    href: '/signup?plan=solo',
    inheritsFrom: 'Starter',
    features: [
      '400 enrichments / month (x20)',
      'Unlimited CSV exports',
      'Waterfall enrichment (scraping + Google) - emails AND phones',
      'Email support (48 h)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For SMBs & agencies',
    monthlyUsd: 55,
    yearlyUsd: 555,    // ≈ 490 EUR
    monthlyEur: 49,
    yearlyEur: 490,
    cta: 'Choose Pro',
    href: '/signup?plan=pro',
    inheritsFrom: 'Solo',
    highlight: true,
    badge: 'POPULAR',
    features: [
      '1,200 enrichments / month (x3)',
      'Unlimited folders',
      'Email verification (MillionVerifier)',
      'Mobile phone enrichment (landlines only on Solo)',
      'Email support (24 h)',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'For outbound teams',
    monthlyUsd: 199,        // standard price after promo
    monthlyPromoUsd: 169,   // launch promo: first 12 months
    yearlyUsd: 1799,        // ≈ 1690 EUR, ~2 months free
    monthlyEur: 179,
    monthlyPromoEur: 149,
    yearlyEur: 1690,
    cta: 'Choose Business',
    href: '/signup?plan=business',
    inheritsFrom: 'Pro',
    unlocksModules: true,
    promo: {
      label: 'Launch promo',
      sublabel: 'First 12 months - then $199/mo',
      durationMonths: 12,
    },
    features: [
      '10,000 enrichments / month (x8)',
      'Multi-user (teams, RBAC)',
      'API access (coming soon)',
      'Personalized onboarding',
      'Priority support',
    ],
  },
];

// Modules unlocked per plan. ONLY Business unlocks the 3 secondary
// modules (Campaigns + CRM + Forms). Starter/Solo/Pro stay on
// Prospecting only (Pro = more volume than Solo).
const PLAN_MODULES = {
  free:     { prospection: 'limited', campaigns: false, crm: false, forms: false },
  solo:     { prospection: true,      campaigns: false, crm: false, forms: false },
  pro:      { prospection: true,      campaigns: false, crm: false, forms: false },
  business: { prospection: true,      campaigns: true,  crm: true,  forms: true },
};

const PLAN_VISUALS = {
  free:    { ring: 'border-line', bg: 'bg-surface-card', accent: 'text-content-tertiary' },
  solo:    { ring: 'border-violet-200', bg: 'bg-violet-50/40', accent: 'text-violet-600' },
  pro:     { ring: 'border-violet-500 ring-2 ring-violet-500/20', bg: 'bg-gradient-to-b from-violet-50 via-violet-50/60 to-white', accent: 'text-violet-700' },
  business:{ ring: 'border-indigo-300', bg: 'bg-gradient-to-br from-violet-100/60 via-white to-indigo-100/60', accent: 'text-indigo-700' },
};

// ─── Comparison table ──────────────────────────────────────────────
const COMPARE_SECTIONS = [
  {
    title: 'Prospecting module',
    rows: [
      ['Prospects per month', '100', '1,000', '5,000', '10,000'],
      ['Enrichments / month', '20', '400', '1,200', '10,000'],
      ['Email verification (MillionVerifier)', false, false, '500/mo', '5,000/mo'],
      ['Waterfall enrichment (7 sources)', true, true, true, true],
      ['AI natural-language search', true, true, true, true],
      ['CSV exports', '5/mo', 'Unlimited', 'Unlimited', 'Unlimited'],
      ['Folders / lists', '3', '10', 'Unlimited', 'Unlimited'],
      ['287,000+ French companies', true, true, true, true],
      ['101 departments (overseas included)', true, true, true, true],
      ['150+ B2B industries', true, true, true, true],
    ],
  },
  {
    title: 'Campaigns module (cold email)',
    rows: [
      ['Unlimited cold email', false, false, false, true],
      ['Multi-tenant sending domains', false, false, false, true],
      ['Auto 28-day warmup', false, false, false, true],
      ['B2B email templates', false, false, false, '20+'],
      ['Open / click tracking', false, false, false, true],
      ['Auto-replies to CRM', false, false, false, true],
      ['SMS (coming Q3 2026)', '-', '-', '-', '-'],
    ],
  },
  {
    title: 'CRM module',
    rows: [
      ['Drag-and-drop Kanban', false, false, false, true],
      ['Auto-create deals from replies', false, false, false, true],
      ['360 timeline per contact', false, false, false, true],
      ['Activities (notes, calls, meetings)', false, false, false, true],
      ['Multi-pipelines (Q4 2026)', '-', '-', '-', '-'],
    ],
  },
  {
    title: 'Forms module',
    rows: [
      ['Number of forms', false, false, false, 'Unlimited'],
      ['Submissions / month', false, false, false, 'Unlimited'],
      ['Drag-drop builder + multi-step', false, false, false, true],
      ['AND/OR conditional logic', false, false, false, true],
      ['Native CRM + Campaigns bridges', false, false, false, true],
      ['QR code + iframe embed', false, false, false, true],
      ['Outbound webhooks', false, false, false, true],
      ['Ready-to-use B2B templates', false, false, false, true],
    ],
  },
  {
    title: 'Support & guarantees',
    rows: [
      ['Email support', 'Community', '48 h', '24 h', 'Priority'],
      ['Personalized onboarding', false, false, false, true],
      ['Public REST API', false, false, false, true],
      ['Webhooks + Zapier / Make', false, false, false, true],
      ['Multi-user (coming soon)', false, false, false, true],
      ['GDPR-compliant (France)', true, true, true, true],
      ['EU data hosting', true, true, true, true],
    ],
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
    q: 'Is it really $21/mo? What\'s the catch?',
    a: 'None. Solo is $21/mo (billed EUR 19), period. No setup fee, no export overage. The only limit is the monthly prospect quota — search pauses until renewal once you hit it. We never charge extra without your explicit say-so.',
  },
  {
    q: 'Free trial?',
    a: '14 days of full Pro access, no credit card (5,000 prospects, waterfall enrichment, campaigns). On day 15 your account drops to the free Starter plan (100 prospects/month, forever). No surprise charge — ever.',
  },
  {
    q: 'Can I change plans anytime?',
    a: 'Yes, 1 click from settings. Upgrade or downgrade, pro-rata is calculated automatically — you only pay the difference for the current month.',
  },
  {
    q: 'What happens if I hit the monthly limit?',
    a: 'Email alert at 80% and 100%. Beyond that, search pauses until renewal or upgrade. No surprise invoice — ever.',
  },
  {
    q: 'How does yearly billing work?',
    a: 'Pay 10 months, get 12. Example Pro: $555/year instead of $660, ~$100 back in your pocket. Billed once (card or wire).',
  },
  {
    q: 'How do I cancel?',
    a: 'Settings > Plan > "Manage subscription". 1 click, no questions, no passive-aggressive email. Access stays active until the end of the paid period.',
  },
  {
    q: 'Wire transfer accepted?',
    a: 'Yes on annual Business+ plans. Send your VAT/company info to contact@volia.fr and we issue a pro-forma invoice within 24 h.',
  },
  {
    q: 'Is everything really included in the price?',
    a: 'Yes. Access to 287,000+ French companies (101 departments x 150+ sectors), waterfall enrichment, CSV exports, transactional emails. No hidden feature behind a paywall.',
  },
  {
    q: 'Is the CRM really in Business?',
    a: 'Yes, in full. Drag-and-drop Kanban, deals auto-created from email replies, 360 timeline per contact, activities (notes, calls, meetings). You can uninstall HubSpot.',
  },
  {
    q: 'Payment methods?',
    a: 'Card (Visa, Mastercard, Amex) via Stripe on every plan. SEPA and wire transfer on annual Business+. PayPal on request.',
  },
  {
    q: 'Refunds?',
    a: '14-day money-back on the first payment, no questions asked — one email to contact@volia.fr is enough. After that, 1-click cancellation lets you keep access until the end of the paid period.',
  },
  {
    q: 'Discount for nonprofits / students?',
    a: '-50% on Solo or Pro for registered nonprofits and students (proof required). Email contact@volia.fr from your institutional address.',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────
function formatUsd(amount) {
  if (amount === 0) return '0';
  return amount.toLocaleString('en-US');
}
function formatEur(amount) {
  if (amount === 0) return 'EUR 0';
  return `EUR ${amount.toLocaleString('en-US')}`;
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
    solo: 21 * 12 - 215,             // $37
    pro: 55 * 12 - 555,              // $105
    business: 199 * 12 - 1799,       // $589 (vs standard $199/mo)
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
              The price of a coffee a day<br />for your main prospecting tool.
            </h1>
            <p className="text-lg sm:text-xl text-content-secondary leading-relaxed max-w-2xl mx-auto mb-8">
              <strong className="text-content-primary">$0</strong> to try (100 prospects free, no card).
              <strong className="text-content-primary"> $21/mo</strong> to scale.
              <strong className="text-content-primary"> $169/mo</strong> for teams (Prospecting + Campaigns + CRM + Forms).
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
                ? `You save up to $${formatUsd(maxSavings)}/year`
                : `Switch to yearly and save up to $${formatUsd(maxSavings)}/year`}
            </p>
            <p className="text-xs text-content-tertiary mb-6">
              Solo: -$37/yr · Pro: -$105/yr · Business: -$589/yr
            </p>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-content-tertiary">
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> No card on Starter</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> 1-click cancel</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> GDPR France</span>
            </div>
          </MotionInView>
        </section>

        {/* ── 2. PLAN CARDS ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((plan, idx) => {
              const visuals = PLAN_VISUALS[plan.id];
              const modules = PLAN_MODULES[plan.id];
              const isFree = plan.monthlyUsd === 0;

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

                    {/* PRICE - special handling for Business with launch promo. */}
                    {plan.id === 'business' && !isYearly && plan.promo ? (
                      <>
                        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                          <span className="text-4xl font-bold text-content-primary">
                            ${formatUsd(plan.monthlyPromoUsd)}
                          </span>
                          <span className="text-content-tertiary text-sm">/mo</span>
                          <span className="text-lg text-content-muted line-through font-medium">
                            ${formatUsd(plan.monthlyUsd)}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-emerald-700 mb-0.5">
                          {plan.promo.label}
                        </p>
                        <p className="text-[11px] text-content-tertiary mb-1">
                          {plan.promo.sublabel}
                        </p>
                        <p className="text-[11px] text-content-tertiary mb-5">
                          {formatEur(plan.monthlyPromoEur)}/mo billed in EUR
                        </p>
                      </>
                    ) : plan.id === 'business' && isYearly ? (
                      <>
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-4xl font-bold text-content-primary">
                            ${formatUsd(plan.yearlyUsd)}
                          </span>
                          <span className="text-content-tertiary text-sm">/yr</span>
                        </div>
                        <p className="text-[11px] text-emerald-600 font-medium mb-1">
                          ~${Math.round(plan.yearlyUsd / 12)}/mo · ~2 months free
                        </p>
                        <p className="text-[11px] text-content-tertiary mb-5">
                          {formatEur(plan.yearlyEur)}/yr billed in EUR
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-4xl font-bold text-content-primary">
                            ${formatUsd(isYearly ? plan.yearlyUsd : plan.monthlyUsd)}
                          </span>
                          <span className="text-content-tertiary text-sm">
                            {isYearly && !isFree ? '/yr' : '/mo'}
                          </span>
                        </div>

                        {isFree ? (
                          <p className="text-[11px] text-content-tertiary mb-5">Forever free, no card</p>
                        ) : isYearly ? (
                          <>
                            <p className="text-[11px] text-emerald-600 font-medium mb-1">
                              ~${Math.round(plan.yearlyUsd / 12)}/mo · save ${formatUsd(yearlySavingsByPlan[plan.id])}
                            </p>
                            <p className="text-[11px] text-content-tertiary mb-5">
                              {formatEur(plan.yearlyEur)}/yr billed in EUR
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-[11px] text-content-tertiary mb-1">
                              or ${formatUsd(plan.yearlyUsd)}/yr (save ${formatUsd(yearlySavingsByPlan[plan.id])})
                            </p>
                            <p className="text-[11px] text-content-tertiary mb-5">
                              {formatEur(plan.monthlyEur)}/mo billed in EUR
                            </p>
                          </>
                        )}
                      </>
                    )}

                    <Link
                      href={plan.href}
                      className={`block w-full py-3 text-center text-sm font-semibold rounded-xl transition mb-5 ${
                        plan.id === 'pro'
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20'
                          : plan.id === 'business'
                            ? 'bg-content-primary text-surface-base hover:bg-content-secondary'
                            : 'border border-line-hover hover:bg-surface-elevated text-content-secondary'
                      }`}
                    >
                      {plan.cta}
                    </Link>

                    {/* BUSINESS killer feature : unlocks the full suite. */}
                    {plan.unlocksModules && (
                      <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 border border-violet-300">
                        <p className="text-[11px] font-bold text-violet-900 mb-1 flex items-center gap-1">
                          <Star size={11} fill="currentColor" /> Unlocks the full suite
                        </p>
                        <p className="text-[11px] text-violet-700 leading-snug">
                          CRM · Campaigns · Forms - all included
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

                    {/* "Everything in X +" intro before delta features */}
                    {plan.inheritsFrom && (
                      <p className="text-[11px] font-semibold text-content-secondary mb-3 pb-3 border-b border-line">
                        ✓ Everything in {plan.inheritsFrom} +
                      </p>
                    )}

                    <div className="space-y-2.5 flex-1">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-start gap-2">
                          <Check size={14} className="text-violet-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-content-secondary leading-relaxed">{f}</span>
                        </div>
                      ))}
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
                <strong className="text-emerald-700">${formatUsd(maxSavings)}/year</strong>{' '}
                vs monthly billing - that&apos;s ~2 months free.
              </p>
            ) : (
              <p className="text-sm sm:text-base text-content-secondary">
                <Sparkles size={16} className="inline -mt-0.5 mr-1.5 text-violet-600" />
                Switch to yearly and save up to{' '}
                <strong className="text-violet-700">${formatUsd(maxSavings)}/year</strong>{' '}
                (~2 months free on the Business plan).
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
                          {plan.monthlyUsd === 0
                            ? 'Free'
                            : plan.id === 'business'
                              ? `$${formatUsd(plan.monthlyPromoUsd)}/mo*`
                              : `$${formatUsd(plan.monthlyUsd)}/mo`}
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
            <p className="text-[11px] text-content-tertiary mt-2 text-center">
              * Business launch promo: $169/mo first 12 months, then $199/mo.
            </p>
          </MotionInView>
        </section>

        {/* ── 5. TRUST STRIP ── */}
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

        {/* ── 6. FAQ ── */}
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

        {/* ── 7. FINAL CTA ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6">
          <MotionInView>
            <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 p-10 sm:p-14 text-center text-white shadow-2xl shadow-violet-500/20">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
                Start free.<br />Upgrade whenever.
              </h2>
              <p className="text-violet-100 text-base sm:text-lg mb-8 max-w-xl mx-auto">
                Try Volia with 100 prospects free. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                <Link
                  href="/signup?plan=free"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-violet-700 text-sm font-semibold hover:bg-violet-50 transition shadow-lg w-full sm:w-auto"
                >
                  Start with Starter ($0) <ArrowRight size={14} />
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
        <td colSpan={5} className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-violet-700">
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
