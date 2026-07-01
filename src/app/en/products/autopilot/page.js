// ─────────────────────────────────────────────────────────────────────
// /en/products/autopilot — Volia One on autopilot (English)
// ─────────────────────────────────────────────────────────────────────
// Mirror of /produits/autopilot (FR): the 24/7 Autopilot mode of Volia One,
// unlocked on the MAX plan. Target → AI email → qualify → CRM, hands-off.
// Custom standalone page (not the shared ProductPageLayout — the FR
// original is fully bespoke too).
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import {
  Zap, Target, Mail, FileText, KanbanSquare, ArrowRight,
  Sparkles, Shield, Clock, TrendingUp, Brain, Settings,
} from 'lucide-react';
import MarketingHeader from '@/components/MarketingHeader';
import ReaderFooter from '@/components/ReaderFooter';
import { AUTOPILOT_TEMPLATES } from '@/lib/autopilot/templates';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/en/products/autopilot`;
const FR_PAGE = `${SITE_URL}/produits/autopilot`;

export const metadata = {
  title: 'Volia One on autopilot - the 24/7 Autopilot mode (MAX plan)',
  description: 'Turn Volia One to autopilot: it scrapes, enriches, emails, qualifies, and drops hot leads into your CRM around the clock. 30+ ready-to-run B2B templates. Autopilot mode unlocks on the MAX plan — €179/mo, code MAX99: first 3 months at €99. EU-hosted, GDPR by default.',
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
    title: 'Volia One on autopilot - your B2B pipeline, hands-off (MAX)',
    description: 'The 24/7 Autopilot mode of Volia One: scrape → email → form → CRM in one setup. Unlocks on the MAX plan (code MAX99: first 3 months at €99). EU-hosted, GDPR by default.',
    url: PAGE_URL,
    type: 'website',
    locale: 'en_US',
  },
};

const PIPELINE_STEPS = [
  { num: 1, label: 'Target & scrape', icon: Target, color: 'violet', desc: '101 departments · 150+ industries · Google Places + waterfall enrichment (email + phone)' },
  { num: 2, label: 'AI email', icon: Mail, color: 'indigo', desc: '3-email sequence (D+0, D+3, D+7) with smart follow-ups, sent from your own domain' },
  { num: 3, label: 'Qualify', icon: FileText, color: 'amber', desc: '3-5 targeted questions with auto-scoring. Separates the hot leads from the curious' },
  { num: 4, label: 'Hot in CRM', icon: KanbanSquare, color: 'emerald', desc: 'Auto-pushed into your pipeline with score + tag. You reply, you close' },
];

const CONFIGURATION_TIME_BREAKDOWN = [
  { label: 'Pick your ICP target (industry + area)', time: '2 min' },
  { label: 'Choose a template from 30+', time: '1 min' },
  { label: 'Tune frequency + volume', time: '1 min' },
  { label: 'Turn it on', time: '1 click' },
];

const WHAT_HAPPENS_AUTO = [
  { icon: Target, text: 'Google Places scraping of ICP-fit prospects (up to 200/week)' },
  { icon: Sparkles, text: 'Email + phone enrichment via the waterfall cascade' },
  { icon: Mail, text: 'Scheduled 3-email sequence (D+0, D+3, D+7)' },
  { icon: FileText, text: 'Capture of replies + form submissions' },
  { icon: TrendingUp, text: 'Automatic lead scoring (0-100)' },
  { icon: KanbanSquare, text: 'Hot leads pushed to your CRM with stage + tag' },
  { icon: Clock, text: 'Non-responders re-engaged at D+14' },
  { icon: Brain, text: 'Continuous learning (A/B testing on the MAX plan)' },
];

const WHY_VOLIA_VS_STACK_US = [
  { feature: 'Native lead scraping', volia: '✓ Included', stack: '+ Apollo $99/mo' },
  { feature: 'Email sequences', volia: '✓ Included', stack: '+ Lemlist $99/mo' },
  { feature: 'Built-in CRM', volia: '✓ Included', stack: '+ HubSpot $800/mo' },
  { feature: 'Qualification forms', volia: '✓ Included', stack: '+ Typeform $35/mo' },
  { feature: 'End-to-end auto workflow', volia: '✓ Volia One on autopilot', stack: '+ Zapier devops setup' },
  { feature: 'EU hosting / GDPR native', volia: '✓ Frankfurt', stack: '❌ US' },
  { feature: 'Total monthly cost', volia: '€99-179 (MAX)', stack: '$1,000+' },
];

export default function EnAutopilotProductPage() {
  return (
    <>
      <MarketingHeader />
      <main className="bg-surface-base">
        {/* HERO */}
        <section className="relative pt-12 pb-20 px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-amber-200/20 via-orange-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 border-2 border-amber-300 text-xs mb-6 font-medium shadow-sm">
              <Zap size={12} className="text-amber-700" />
              <span className="text-amber-800 font-bold">VOLIA ONE · 24/7 AUTOPILOT MODE · MAX PLAN</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] font-bold tracking-tight leading-[1.05] mb-6">
              <span className="block text-content-primary">Volia One,</span>
              <span className="block bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
                on autopilot.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-content-secondary mb-4 leading-relaxed max-w-3xl mx-auto">
              Flip Volia One to autopilot. It scrapes, enriches, reaches out, qualifies, and drops the
              hot leads into your CRM — 24/7. <strong className="text-content-primary">You don&apos;t lift a finger.</strong>
            </p>
            <p className="text-base text-content-tertiary mb-10 italic">
              Two weeks later, your pipeline is full.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Link
                href="/signup?plan=max"
                className="group inline-flex items-center justify-center gap-2 px-8 py-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/50 hover:-translate-y-0.5 transition-all text-base"
              >
                Go MAX — €99/mo with MAX99
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://cal.com/anthony-volia/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-5 rounded-xl border-2 border-line-hover hover:border-amber-400 hover:bg-amber-50 text-content-primary font-semibold transition-all text-base"
              >
                Book a 15-min demo
              </a>
            </div>

            {/* Pipeline visualization */}
            <div className="bg-surface-card border border-line rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-lg">
              <p className="text-xs uppercase tracking-widest font-semibold text-amber-600 mb-6">
                The full pipeline — automated end-to-end
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-2">
                {PIPELINE_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.num} className="relative">
                      <div className={`text-center p-4 rounded-xl bg-${step.color}-50 dark:bg-${step.color}-900/20 border border-${step.color}-200`}>
                        <div className={`inline-flex w-12 h-12 rounded-full bg-${step.color}-500 text-white items-center justify-center mb-2`}>
                          <Icon size={20} />
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-content-tertiary mb-1">Step {step.num}</div>
                        <div className={`text-sm font-bold text-${step.color}-700 mb-2`}>{step.label}</div>
                        <div className="text-[10px] text-content-soft leading-tight">{step.desc}</div>
                      </div>
                      {idx < PIPELINE_STEPS.length - 1 && (
                        <ArrowRight size={20} className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-amber-400 z-10" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* WHAT YOU CONFIGURE */}
        <section className="py-20 px-4 sm:px-6 bg-surface-card border-y border-line">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-4">
                <Settings size={12} /> What you configure
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">10 minutes flat</h2>
              <p className="text-content-secondary mb-6">
                Express setup. Pick one of 30+ templates, set your ICP, and turn it on.
              </p>
              <ul className="space-y-3">
                {CONFIGURATION_TIME_BREAKDOWN.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-sm font-bold flex items-center justify-center">{i + 1}</span>
                    <div className="flex-1 flex items-baseline justify-between gap-3">
                      <span className="text-sm text-content-primary">{item.label}</span>
                      <span className="text-xs font-mono text-violet-600 whitespace-nowrap">{item.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold mb-4">
                <Zap size={12} /> What runs on autopilot
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">24/7, without you</h2>
              <p className="text-content-secondary mb-6">
                You close the laptop. Volia keeps going.
              </p>
              <ul className="space-y-2.5">
                {WHAT_HAPPENS_AUTO.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-content-primary">
                      <Icon size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <span>{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* WHY VOLIA VS STACK US */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                Volia One on autopilot vs the US stack
              </h2>
              <p className="text-base text-content-secondary max-w-2xl mx-auto">
                Apollo + Lemlist + HubSpot + Typeform + Zapier devops, or Volia all-in-one.
              </p>
            </div>
            <div className="bg-surface-card border border-line rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-soft">
                  <tr>
                    <th className="text-left p-4 font-semibold text-content-primary">Feature</th>
                    <th className="text-left p-4 font-semibold text-amber-700">
                      <div className="flex items-center gap-2">
                        <Zap size={14} /> Volia One (autopilot)
                      </div>
                    </th>
                    <th className="text-left p-4 font-semibold text-content-soft">Typical US stack</th>
                  </tr>
                </thead>
                <tbody>
                  {WHY_VOLIA_VS_STACK_US.map((row, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="p-4 text-content-secondary">{row.feature}</td>
                      <td className="p-4 font-semibold text-emerald-700">{row.volia}</td>
                      <td className="p-4 text-content-soft">{row.stack}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* TEMPLATES MARKETPLACE */}
        <section className="py-20 px-4 sm:px-6 bg-surface-card border-y border-line">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold mb-4">
                <Sparkles size={12} /> Marketplace
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                {AUTOPILOT_TEMPLATES.length} ready-to-run templates
              </h2>
              <p className="text-content-secondary max-w-2xl mx-auto">
                Pick the template that fits your segment. Live in 5 minutes. Zero technical setup.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AUTOPILOT_TEMPLATES.map((tpl) => (
                <div key={tpl.id} className={`p-4 rounded-xl bg-surface-base border border-line hover:border-${tpl.color}-400 transition`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-content-primary text-sm">{tpl.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-soft text-content-soft">{tpl.tier}</span>
                  </div>
                  <p className="text-xs text-content-soft leading-relaxed">{tpl.tagline}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GDPR + Trust */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-blue-50 border border-blue-200 text-sm font-medium text-blue-900 mb-6">
              <Shield size={16} /> Frankfurt hosting · GDPR native · Automatic opt-out
            </div>
            <h3 className="text-xl font-bold mb-2 text-content-primary">
              You own your data. Always.
            </h3>
            <p className="text-sm text-content-secondary max-w-2xl mx-auto">
              No transfer outside the EU. No reselling. No hidden tracking.
              GDPR-compliant by design, on a B2B legitimate-interest legal basis.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-amber-600 to-orange-700 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Done overpaying for Apollo?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              MAX plan only — €99/mo for your first 3 months with code MAX99, then €179. You set it up in 10 minutes, and see your first leads within 48 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup?plan=max"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-amber-700 font-bold hover:bg-amber-50 transition shadow-xl text-base"
              >
                Go MAX
                <ArrowRight size={18} />
              </Link>
              <a
                href="https://cal.com/anthony-volia/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur border-2 border-white/30 text-white font-bold hover:bg-white/20 transition text-base"
              >
                Book a live demo
              </a>
            </div>
          </div>
        </section>
      </main>
      <ReaderFooter />
    </>
  );
}
