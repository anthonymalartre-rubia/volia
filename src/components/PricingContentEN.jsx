'use client';

// ─────────────────────────────────────────────────────────────────────
// PricingContentEN — version anglaise standalone de /pricing
// ─────────────────────────────────────────────────────────────────────
// Affiche $ + EUR côte à côte (USD pour l'œil US/UK, EUR pour la facture
// réelle). Pas de surcouche complexe : 4 plans + tableau comparatif
// simplifié + FAQ + CTA. Cible : décideur US qui veut comparer en 30 s.
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { LogoIcon } from '@/components/ui';
import MotionInView from '@/components/MotionInView';
import { useForceLightTheme } from '@/lib/use-force-light-theme';

const PLANS = [
  {
    name: 'Starter',
    usd: '$0',
    eur: 'EUR 0',
    period: 'forever',
    audience: 'Try Pro free for 14 days. No card.',
    prospects: '100',
    enrichments: '20',
    exports: '5',
    seats: '1',
    cta: 'Start free',
    href: '/signup?plan=free',
    highlight: false,
  },
  {
    name: 'Solo',
    usd: '$21',
    eur: 'EUR 19',
    period: '/mo',
    audience: 'Solo founders, freelancers, consultants.',
    prospects: '1,000',
    enrichments: '400',
    exports: 'Unlimited',
    seats: '1',
    cta: 'Choose Solo',
    href: '/signup?plan=solo',
    highlight: false,
  },
  {
    name: 'Pro',
    usd: '$55',
    eur: 'EUR 49',
    period: '/mo',
    audience: 'Agencies and SMBs shipping cold email.',
    prospects: '5,000',
    enrichments: '1,000',
    exports: 'Unlimited',
    seats: '3',
    cta: 'Choose Pro',
    href: '/signup?plan=pro',
    highlight: true,
    badge: 'Most popular',
  },
  {
    name: 'Business',
    usd: '$110',
    eur: 'EUR 99',
    period: '/mo',
    audience: 'Sales teams. CRM and Campaigns included.',
    prospects: '10,000',
    enrichments: '10,000',
    exports: 'Unlimited',
    seats: '5',
    cta: 'Choose Business',
    href: '/signup?plan=business',
    highlight: false,
    extra: 'Campaigns + CRM included',
  },
];

const COMPARE_ROWS = [
  { feature: '287,000+ French B2B companies', free: true, solo: true, pro: true, business: true },
  { feature: '150+ industries, 101 departments', free: true, solo: true, pro: true, business: true },
  { feature: 'Waterfall email enrichment', free: true, solo: true, pro: true, business: true },
  { feature: 'AI natural-language search', free: true, solo: true, pro: true, business: true },
  { feature: 'CSV exports', free: '5/mo', solo: 'Unlimited', pro: 'Unlimited', business: 'Unlimited' },
  { feature: 'Cold email (Campaigns module)', free: false, solo: false, pro: true, business: true },
  { feature: 'Auto-warmup (28 days)', free: false, solo: false, pro: true, business: true },
  { feature: 'Email verification', free: false, solo: false, pro: '500/mo', business: '5,000/mo' },
  { feature: 'CRM module (Kanban + auto-deals)', free: false, solo: false, pro: false, business: true },
  { feature: 'User seats', free: '1', solo: '1', pro: '3', business: '5' },
  { feature: 'API access', free: false, solo: false, pro: false, business: true },
  { feature: 'Priority support', free: false, solo: false, pro: true, business: true },
];

const FAQ = [
  {
    q: 'Why USD and EUR?',
    a: 'USD on display so you can compare to Apollo at a glance. EUR on your invoice (Stripe handles conversion at market rate). The EUR number is what your bank charges. No FX markup from us.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes. Sign up = 14 days of full Pro access. No card. 5,000 prospects, cold email, waterfall — the whole thing. After 14 days you drop to free Starter (100 prospects/mo, forever). We will never charge you without asking.',
  },
  {
    q: 'Can I change plans anytime?',
    a: 'Yes. 1 click in your settings. Pro-rata is calculated automatically. Upgrade today, downgrade tomorrow — your choice.',
  },
  {
    q: 'What about annual billing?',
    a: 'Pay 10 months, get 12. Pro = EUR 490/year instead of EUR 588. Same for every paid plan.',
  },
  {
    q: 'Is CRM really included in Business?',
    a: 'Yes. Fully. Drag-and-drop Kanban, auto-created deals from email replies, 360 timeline per contact, notes, calls, meetings. No per-user upcharge. No "contact sales" tier.',
  },
  {
    q: 'How do I cancel?',
    a: 'Settings > Plan > Cancel. 1 click via the Stripe portal. You keep access until the end of your billing period.',
  },
  {
    q: 'Any hidden fees?',
    a: 'No. The price is the price. No setup fees. No export overage. No "premium" tier hiding the good stuff.',
  },
];

function Cell({ value }) {
  if (value === true) return <Check size={18} className="text-emerald-600 mx-auto" strokeWidth={2.5} />;
  if (value === false) return <X size={16} className="text-rose-400 mx-auto" strokeWidth={2.5} />;
  return <span className="text-xs text-content-secondary">{value}</span>;
}

export default function PricingContentEN() {
  useForceLightTheme();

  return (
    <div className="min-h-screen bg-surface-base text-content-primary overflow-hidden">
      {/* Nav */}
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

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-16 px-4 sm:px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-br from-violet-200/40 via-indigo-100/30 to-pink-100/20 rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-xs text-violet-700 font-semibold mb-5">
              <Sparkles size={12} />
              Pricing
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5">
              <span className="bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">5x cheaper</span>{' '}
              than Apollo + Lemlist + HubSpot.
            </h1>
            <p className="text-lg text-content-secondary leading-relaxed max-w-2xl mx-auto">
              One subscription. Three modules. USD on display, EUR on the invoice.
              No commitment. Cancel in 1 click. No "contact sales".
            </p>
          </div>
        </section>

        {/* Plans */}
        <section className="py-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PLANS.map((plan, i) => (
                <MotionInView key={plan.name} delay={i * 80}>
                  <div className={`relative h-full p-7 rounded-2xl border-2 transition-all hover:-translate-y-1 ${
                    plan.highlight
                      ? 'border-violet-400 bg-gradient-to-b from-violet-50 via-violet-50/50 to-white shadow-xl shadow-violet-500/15'
                      : 'border-line bg-white shadow-sm hover:shadow-md hover:border-violet-200'
                  }`}>
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md whitespace-nowrap">
                        {plan.badge}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-content-primary mb-1 mt-1">{plan.name}</h3>
                    <p className="text-xs text-content-tertiary mb-5 min-h-[32px]">{plan.audience}</p>

                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-bold font-mono tabular-nums ${plan.highlight ? 'bg-gradient-to-br from-violet-700 to-indigo-700 bg-clip-text text-transparent' : 'text-content-primary'}`}>
                        {plan.usd}
                      </span>
                      <span className="text-sm text-content-tertiary">{plan.period}</span>
                    </div>
                    <p className="text-xs text-content-tertiary mb-6">{plan.eur} billed in EUR</p>

                    <Link href={plan.href} className={`block w-full text-center px-4 py-3 rounded-xl font-semibold text-sm transition mb-6 ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/30'
                        : 'border border-line-hover hover:bg-violet-50 text-content-primary'
                    }`}>
                      {plan.cta}
                    </Link>

                    <ul className="space-y-2.5 text-xs">
                      <li className="flex items-start gap-2"><Check size={14} className="text-violet-500 mt-0.5 flex-shrink-0" /><span className="text-content-secondary"><strong>{plan.prospects}</strong> prospects / mo</span></li>
                      <li className="flex items-start gap-2"><Check size={14} className="text-violet-500 mt-0.5 flex-shrink-0" /><span className="text-content-secondary"><strong>{plan.enrichments}</strong> enrichments / mo</span></li>
                      <li className="flex items-start gap-2"><Check size={14} className="text-violet-500 mt-0.5 flex-shrink-0" /><span className="text-content-secondary"><strong>{plan.exports}</strong> CSV exports</span></li>
                      <li className="flex items-start gap-2"><Check size={14} className="text-violet-500 mt-0.5 flex-shrink-0" /><span className="text-content-secondary"><strong>{plan.seats}</strong> user seat{plan.seats !== '1' ? 's' : ''}</span></li>
                      {plan.extra && <li className="flex items-start gap-2"><Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" /><span className="text-emerald-700 font-semibold">{plan.extra}</span></li>}
                    </ul>
                  </div>
                </MotionInView>
              ))}
            </div>
          </div>
        </section>

        {/* Compare table */}
        <section className="py-20 px-4 sm:px-6 border-t border-line bg-gradient-to-b from-white via-violet-50/20 to-white">
          <div className="max-w-6xl mx-auto">
            <MotionInView>
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  Side-by-side. No hidden fine print.
                </h2>
                <p className="text-content-tertiary text-base max-w-xl mx-auto">Every plan includes 287,000+ French B2B companies and unlimited AI searches.</p>
              </div>
            </MotionInView>

            <div className="overflow-x-auto rounded-2xl border-2 border-violet-200 bg-white shadow-xl shadow-violet-500/5">
              <table className="w-full text-left min-w-[640px]">
                <thead>
                  <tr className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b-2 border-violet-200">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-content-primary">Feature</th>
                    <th className="px-3 py-4 text-center">
                      <div className="text-xs font-bold">Starter</div>
                      <div className="text-[10px] font-mono text-content-tertiary mt-0.5">$0</div>
                    </th>
                    <th className="px-3 py-4 text-center">
                      <div className="text-xs font-bold">Solo</div>
                      <div className="text-[10px] font-mono text-content-tertiary mt-0.5">$21/mo</div>
                    </th>
                    <th className="px-3 py-4 text-center bg-gradient-to-b from-violet-100 to-indigo-100 border-l-2 border-violet-300">
                      <div className="text-xs font-bold bg-gradient-to-br from-violet-700 to-indigo-700 bg-clip-text text-transparent">Pro</div>
                      <div className="text-[10px] font-mono text-violet-700 font-bold mt-0.5">$55/mo</div>
                    </th>
                    <th className="px-3 py-4 text-center">
                      <div className="text-xs font-bold">Business</div>
                      <div className="text-[10px] font-mono text-content-tertiary mt-0.5">$110/mo</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) => (
                    <tr key={i} className={`border-b border-violet-100 last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-violet-50/30'}`}>
                      <td className="px-5 py-3 text-sm font-medium text-content-primary">{row.feature}</td>
                      <td className="px-3 py-3 text-center"><Cell value={row.free} /></td>
                      <td className="px-3 py-3 text-center"><Cell value={row.solo} /></td>
                      <td className="px-3 py-3 text-center bg-gradient-to-b from-violet-50/60 to-indigo-50/60 border-l-2 border-violet-300"><Cell value={row.pro} /></td>
                      <td className="px-3 py-3 text-center"><Cell value={row.business} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Stack comparison */}
        <section className="py-20 px-4 sm:px-6 border-t border-line">
          <div className="max-w-4xl mx-auto text-center">
            <MotionInView>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                Your stack vs Volia. The math.
              </h2>
              <p className="text-content-tertiary mb-10">Apollo $99 + Lemlist $99 + HubSpot Starter $90 = <strong className="text-rose-700">$288/mo</strong>. Volia Business = <strong className="text-emerald-700">$110/mo all-in</strong>. You save ~$178/mo. ~$2,140/year. You do the math.</p>
              <Link href="/signup?plan=business" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm">
                Choose Volia Business
                <ArrowRight size={16} />
              </Link>
            </MotionInView>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 sm:px-6 border-t border-line">
          <div className="max-w-3xl mx-auto">
            <MotionInView>
              <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                Questions, answered. No fluff.
              </h2>
            </MotionInView>
            <div className="space-y-3">
              {FAQ.map((item) => (
                <details key={item.q} className="group rounded-2xl border border-line bg-surface-card overflow-hidden">
                  <summary className="cursor-pointer px-6 py-5 text-sm sm:text-base font-medium text-content-primary list-none flex items-center justify-between">
                    {item.q}
                    <span className="text-content-tertiary group-open:rotate-180 transition-transform">⌄</span>
                  </summary>
                  <div className="px-6 pb-5 pt-0 text-sm text-content-secondary leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-24 px-4 sm:px-6 border-t border-line overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-200/40 via-indigo-100/30 to-pink-100/20 pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-bold mb-5 leading-tight tracking-tight">
              Try it. No card. No tricks.
            </h2>
            <p className="text-content-secondary text-base sm:text-lg mb-8 max-w-xl mx-auto">
              100 prospects free, forever. We will never ask for your card to sign up.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:-translate-y-0.5 transition-all">
              Get started free
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
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
