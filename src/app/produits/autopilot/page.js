// /produits/autopilot — Landing page dédiée Volia Autopilot
// Pitch B2B end-to-end auto : scrap → email → form → CRM
// CTA primaire : démarrer gratuitement (push Pro) · CTA secondaire : voir démo 90s

import Link from 'next/link';
import {
  Zap, Target, Mail, FileText, KanbanSquare, ArrowRight, CheckCircle2,
  Sparkles, Shield, Clock, TrendingUp, Brain, Settings,
} from 'lucide-react';
import MarketingHeader from '@/components/MarketingHeader';
import ReaderFooter from '@/components/ReaderFooter';
import { AUTOPILOT_TEMPLATES } from '@/lib/autopilot/templates';

export const metadata = {
  title: 'Volia Autopilot — Ton pipeline B2B en autopilot | Volia',
  description: 'Sélectionne ta cible, Volia exécute : scraping ciblé, email personnalisé, qualification, scoring et leads chauds livrés dans ton CRM. 12 templates B2B France, RGPD natif. Exclusivité Volia MAX 179 €/mois (code MAX99 : 3 mois à 99 €). Plan Gratuit à vie pour démarrer, sans carte bancaire.',
  alternates: { canonical: 'https://volia.fr/produits/autopilot' },
  openGraph: {
    title: 'Volia Autopilot — Pipeline B2B en autopilot',
    description: 'Volia exécute ta prospection B2B de bout en bout : scraping ciblé, email personnalisé, qualification, scoring et leads chauds livrés dans ton CRM. Made in France, RGPD natif. Exclusivité MAX 179 €/mois (code MAX99 : 3 mois à 99 €). Plan Gratuit à vie pour démarrer.',
    type: 'website',
  },
};

const PIPELINE_STEPS = [
  { num: 1, label: 'Ciblage', icon: Target, color: 'violet', desc: '101 départements · 150+ catégories · Google Places + enrichissement waterfall (email + téléphone)' },
  { num: 2, label: 'Email auto', icon: Mail, color: 'indigo', desc: 'Séquence 3 emails (J+0, J+3, J+7) avec relances intelligentes, depuis ton domaine pro' },
  { num: 3, label: 'Form qualif', icon: FileText, color: 'amber', desc: '3-5 questions ciblées avec scoring auto. Sépare les hot leads des curieux' },
  { num: 4, label: 'CRM chaud', icon: KanbanSquare, color: 'emerald', desc: 'Push automatique dans ton pipeline avec score + tag. Tu réponds, tu signes' },
];

const CONFIGURATION_TIME_BREAKDOWN = [
  { label: 'Choisir ta cible ICP (catégorie + zone géo)', time: '2 min' },
  { label: 'Choisir un template parmi 12', time: '1 min' },
  { label: 'Personnaliser fréquence + volume', time: '1 min' },
  { label: 'Activer ', time: '1 clic' },
];

const WHAT_HAPPENS_AUTO = [
  { icon: Target, text: 'Scraping Google Places de prospects ICP-fit (jusqu\'à 200/sem)' },
  { icon: Sparkles, text: 'Enrichissement emails + numéros via cascade waterfall' },
  { icon: Mail, text: 'Envoi séquence 3 emails programmée (J+0, J+3, J+7)' },
  { icon: FileText, text: 'Capture des réponses + form submissions' },
  { icon: TrendingUp, text: 'Scoring automatique des leads (0-100)' },
  { icon: KanbanSquare, text: 'Push des leads chauds dans ton CRM avec stage + tag' },
  { icon: Clock, text: 'Relance des non-répondants à J+14' },
  { icon: Brain, text: 'Apprentissage continu (A/B testing inclus)' },
];

const WHY_VOLIA_VS_STACK_US = [
  { feature: 'Scraping leads natif', volia: '✓ Inclus', stack: '+ Apollo 99$/mo' },
  { feature: 'Séquences email', volia: '✓ Inclus', stack: '+ Lemlist 99$/mo' },
  { feature: 'CRM intégré', volia: '✓ Inclus', stack: '+ HubSpot 800$/mo' },
  { feature: 'Form qualif', volia: '✓ Inclus', stack: '+ Typeform 35$/mo' },
  { feature: 'Workflow auto end-to-end', volia: '✓ Volia Autopilot', stack: '+ Zapier setup devops' },
  { feature: 'Hébergement UE / RGPD natif', volia: '✓ Frankfurt', stack: '❌ US' },
  { feature: 'Prix total mensuel', volia: '179 € (MAX, tout inclus — 3 mois à 99 € avec MAX99)', stack: '1 000+ $' },
];

export default function AutopilotProductPage() {
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
              <span className="text-amber-800 font-bold">NOUVEAU · VOLIA AUTOPILOT</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] font-bold tracking-tight leading-[1.05] mb-6">
              <span className="block text-content-primary">Ton pipeline B2B.</span>
              <span className="block bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
                En autopilot.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-content-secondary mb-4 leading-relaxed max-w-3xl mx-auto">
              Sélectionne ta cible. Volia trouve tes prospects, les enrichit, les contacte
              et livre les leads chauds dans ton CRM. <strong className="text-content-primary">Tu gardes la main, Volia fait le reste.</strong>
            </p>
            <p className="text-base text-content-tertiary mb-10 italic">
              Toi, tu te concentres sur le closing.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
              <Link
                href="/signup?plan=pro"
                className="group inline-flex items-center justify-center gap-2 px-8 py-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/50 hover:-translate-y-0.5 transition-all text-base"
              >
                Démarrer gratuitement
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://cal.com/anthony-volia/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-5 rounded-xl border-2 border-line-hover hover:border-amber-400 hover:bg-amber-50 text-content-primary font-semibold transition-all text-base"
              >
                Voir une démo 15 min
              </a>
            </div>

            {/* Réassurance + signaux de confiance (aucune métrique inventée) */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-content-tertiary mb-12">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-600" /> Sans carte bancaire</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-600" /> Annulable en 1 clic</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-600" /> Made in France · RGPD</span>
            </div>

            {/* Pipeline visualization */}
            <div className="bg-surface-card border border-line rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-lg">
              <p className="text-xs uppercase tracking-widest font-semibold text-amber-600 mb-6">
                Le pipeline complet — automatisé end-to-end
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
                        <div className="text-xs font-bold uppercase tracking-wider text-content-tertiary mb-1">Étape {step.num}</div>
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
                <Settings size={12} /> Ce que tu configures
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">10 minutes chrono</h2>
              <p className="text-content-secondary mb-6">
                Setup express. Choisis ton template parmi 12, configure ton ICP, et active.
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
                <Zap size={12} /> Ce qui se passe en autopilot
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">24/7, en pilote auto</h2>
              <p className="text-content-secondary mb-6">
                Tu fermes l'ordi. Volia continue.
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
                Volia Autopilot vs la stack US
              </h2>
              <p className="text-base text-content-secondary max-w-2xl mx-auto">
                Apollo + Lemlist + HubSpot + Typeform + Zapier devops, ou Volia tout-en-un.
              </p>
            </div>
            <div className="bg-surface-card border border-line rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-soft">
                  <tr>
                    <th className="text-left p-4 font-semibold text-content-primary">Feature</th>
                    <th className="text-left p-4 font-semibold text-amber-700">
                      <div className="flex items-center gap-2">
                        <Zap size={14} /> Volia Autopilot
                      </div>
                    </th>
                    <th className="text-left p-4 font-semibold text-content-soft">Stack US classique</th>
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
                {AUTOPILOT_TEMPLATES.length} templates prêts à activer
              </h2>
              <p className="text-content-secondary max-w-2xl mx-auto">
                Sélectionne le template adapté à ton segment. Activation en 5 minutes. Aucun setup technique.
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

        {/* RGPD + Trust */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-blue-50 border border-blue-200 text-sm font-medium text-blue-900 mb-6">
              <Shield size={16} /> Hébergement Frankfurt · RGPD natif · Opt-out automatique
            </div>
            <h3 className="text-xl font-bold mb-2 text-content-primary">
              Tu restes propriétaire de ta data. Toujours.
            </h3>
            <p className="text-sm text-content-secondary max-w-2xl mx-auto">
              Pas de transfert hors UE. Pas de revente. Pas de tracking caché.
              Conformité RGPD by design avec base légale intérêt légitime B2B.
            </p>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-amber-600 to-orange-700 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Prêt à remplir ton pipeline sans y passer tes journées ?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Plan Gratuit à vie, sans carte bancaire. Tu configures en 10 minutes — Volia s'occupe du reste.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup?plan=pro"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-amber-700 font-bold hover:bg-amber-50 transition shadow-xl text-base"
              >
                Démarrer gratuit
                <ArrowRight size={18} />
              </Link>
              <a
                href="https://cal.com/anthony-volia/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur border-2 border-white/30 text-white font-bold hover:bg-white/20 transition text-base"
              >
                Voir une démo en live
              </a>
            </div>
          </div>
        </section>
      </main>
      <ReaderFooter />
    </>
  );
}
