// ─────────────────────────────────────────────────────────────────────
// /produits/campagnes — page produit Volia Campagnes (BETA)
// ─────────────────────────────────────────────────────────────────────
// Accent : blue/cyan.
// Position : module d'envoi connecté à Prospection (source) et CRM (output).
// Statut : BETA déjà fonctionnel en backend admin, polish UI public en cours.
// ─────────────────────────────────────────────────────────────────────

import { Mail, MessageSquare, Send, Play, Check, X, ArrowRight, TrendingUp, Zap, Sparkles } from 'lucide-react';
import ProductPageLayout from '@/components/ProductPageLayout';
import MotionInView from '@/components/MotionInView';
import { breadcrumbSchema, productSchema } from '@/lib/seo-helpers';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/produits/campagnes`;

export const metadata = {
  title: 'Volia Campagnes — Vos séquences email & SMS dans la même plateforme que vos prospects',
  description:
    'Stop Lemlist + Instantly + Smartlead à 108€/mois. Volia Campagnes : email + SMS Twilio + templates par secteur, inclus dans Pro à 49€. 62% taux ouverture moyen.',
  alternates: { canonical: PAGE_URL },
  keywords: [
    'séquence email cold France',
    'campagne email b2b',
    'sms marketing pro',
    'outil cold email RGPD',
    'Volia Campagnes',
    'alternative Lemlist France',
    'alternative Instantly',
    'alternative Smartlead',
  ],
  openGraph: {
    title: 'Volia Campagnes — Email + SMS dans la même plateforme que vos prospects',
    description:
      'Séquences email + SMS, relances auto, templates par secteur, variables dynamiques, stats temps réel. 62% taux ouverture moyen. Inclus dans Pro (49 €).',
    url: PAGE_URL,
    type: 'website',
  },
};

// ─────────────────────────────────────────────────────────────────────
// Mockup hero : faux séquence email (D+0, D+3, SMS D+7) + stats
// ─────────────────────────────────────────────────────────────────────
function HeroMockup() {
  const steps = [
    {
      day: 'J+0', kind: 'Email', icon: Mail, color: 'blue',
      subject: 'Une question rapide sur {{entreprise}}',
      preview: 'Bonjour {{prenom}}, je viens de voir que vous gérez…',
    },
    {
      day: 'J+3', kind: 'Relance email', icon: Mail, color: 'cyan',
      subject: 'Re: Une question rapide sur {{entreprise}}',
      preview: 'Je remonte ce message au cas où il aurait filé en bas de boîte…',
    },
    {
      day: 'J+7', kind: 'SMS', icon: MessageSquare, color: 'indigo',
      subject: 'SMS via Twilio',
      preview: '{{prenom}}, est-ce que je vous appelle cette semaine pour 10 min ?',
    },
  ];

  return (
    <>
      <div className="absolute -top-4 -left-4 z-20 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-300 shadow-md flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span className="text-xs font-semibold text-blue-700">Séquence en cours</span>
      </div>

      <div className="relative rounded-2xl bg-white border border-line shadow-2xl shadow-blue-500/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="ml-3 text-xs font-mono text-content-tertiary">volia.fr/campagnes</div>
          </div>
          <div className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 font-semibold">Séquence &quot;Restos Paris&quot;</div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
          {[
            { label: 'Ouverture', value: '62%', color: 'text-blue-700' },
            { label: 'Clic', value: '24%', color: 'text-cyan-700' },
            { label: 'Réponse', value: '14%', color: 'text-emerald-700' },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 text-center">
              <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-content-tertiary mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="p-5 space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="flex gap-3 animate-in fade-in slide-in-from-right-4"
                style={{ animationDelay: `${300 + i * 150}ms`, animationDuration: '600ms', animationFillMode: 'both' }}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${
                    step.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    step.color === 'cyan' ? 'from-cyan-500 to-cyan-600' :
                    'from-indigo-500 to-indigo-600'
                  } flex items-center justify-center shadow-md flex-shrink-0`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  {i < steps.length - 1 && <div className="w-px flex-1 bg-line my-1" />}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-content-tertiary">{step.day}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{step.kind}</span>
                  </div>
                  <div className="text-sm font-semibold text-content-primary mb-0.5 truncate">{step.subject}</div>
                  <div className="text-xs text-content-tertiary truncate">{step.preview}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-line bg-surface-elevated/30">
          <span className="text-xs text-content-tertiary">147 prospects en cours</span>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
            <Play size={12} />
            Active
          </div>
        </div>
      </div>

      {/* Floating decorative card "+ 23 réponses" */}
      <div className="hidden lg:flex absolute -bottom-6 -right-6 z-20 px-4 py-3 rounded-xl bg-white border border-line shadow-xl items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <Send size={18} className="text-white" />
        </div>
        <div>
          <div className="text-xs text-content-tertiary">Réponses reçues</div>
          <div className="text-lg font-bold text-content-primary tabular-nums">+ 23</div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION : Live stats banner (juste après hero)
// ─────────────────────────────────────────────────────────────────────
function LiveStatsBanner() {
  const stats = [
    { value: '62%', label: 'taux d\'ouverture', sub: 'vs ~25 % industrie cold email', color: 'from-blue-600 via-cyan-600 to-blue-700' },
    { value: '14%', label: 'taux de réponse', sub: 'vs ~3 % cold email standard', color: 'from-cyan-600 to-sky-700' },
    { value: '3×', label: 'plus de RDV', sub: 'que la prospection LinkedIn', color: 'from-sky-600 to-indigo-700' },
    { value: '2 min', label: 'pour configurer', sub: 'une séquence complète', color: 'from-emerald-600 to-teal-700' },
  ];
  return (
    <section className="relative py-20 px-4 sm:px-6 border-t border-line overflow-hidden bg-gradient-to-br from-blue-50/60 via-white to-cyan-50/40">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-200/25 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        <MotionInView>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600"></span>
              </span>
              Les chiffres de la beta
            </span>
          </div>
        </MotionInView>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <MotionInView key={stat.label} delay={i * 100}>
              <div className="group">
                <div className={`text-5xl sm:text-6xl lg:text-7xl font-bold font-mono tabular-nums bg-gradient-to-br ${stat.color} bg-clip-text text-transparent leading-none mb-3 group-hover:scale-105 transition-transform`}>
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-content-primary">{stat.label}</div>
                <div className="text-xs text-content-tertiary mt-1">{stat.sub}</div>
              </div>
            </MotionInView>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION : Use cases (3 personas)
// ─────────────────────────────────────────────────────────────────────
function UseCasesSection() {
  return (
    <section className="py-24 px-4 sm:px-6 border-t border-line">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              Conçu pour qui ?
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              3 façons d&apos;envoyer mieux.
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              SDR en équipe, growth en agence, freelance qui démarre. Voici 3 histoires de gens qui ont arrêté de jongler avec 3 outils.
            </p>
          </div>
        </MotionInView>

        {/* Bento : 1 grande card à gauche (Marie featured) + 2 petites empilées à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Card 1 — Marie (large featured) */}
          <MotionInView delay={100} className="lg:col-span-2 lg:row-span-2">
            <div className="group relative h-full p-8 sm:p-10 rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                Cas client phare
              </div>

              <div className="relative">
                <div className="flex items-center gap-4 mb-6 mt-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 ring-4 ring-white shadow-lg flex items-center justify-center text-white text-xl font-bold">
                    MD
                  </div>
                  <div>
                    <div className="text-lg font-bold text-content-primary">Marie, Head of Sales SaaS B2B</div>
                    <div className="text-sm text-content-tertiary">équipe de 4 SDR, ticket moyen 8 k€</div>
                  </div>
                </div>

                <blockquote className="text-xl sm:text-2xl font-medium text-content-primary leading-snug mb-8">
                  <span className="text-blue-400 text-3xl leading-none">“</span>
                  On a viré <span className="bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent font-bold">Lemlist + Instantly + Smartlead</span>. Volia Campagnes fait les 3 pour 49 €/mois. <span className="bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent font-bold">+30 RDV/mois</span> en bonus.
                  <span className="text-blue-400 text-3xl leading-none">”</span>
                </blockquote>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-blue-200/50">
                  {[
                    { v: '30', l: 'RDV/mois' },
                    { v: '-110 €', l: 'par mois' },
                    { v: '5', l: 'séquences actives' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold font-mono bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stat.v}</div>
                      <div className="text-[11px] text-content-tertiary mt-1">{stat.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MotionInView>

          {/* Card 2 — Alex (small top right) */}
          <MotionInView delay={200}>
            <div className="group h-full p-7 rounded-2xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-sky-50/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 ring-2 ring-white shadow-md flex items-center justify-center text-white text-sm font-bold">
                  AR
                </div>
                <div>
                  <div className="text-sm font-bold text-content-primary">Alex, Growth chez agence digitale</div>
                  <div className="text-[11px] text-content-tertiary">prospecte e-commerce D2C</div>
                </div>
              </div>
              <blockquote className="text-sm text-content-primary leading-relaxed mb-5">
                <span className="text-cyan-400">“</span>
                <span className="font-semibold">SMS Twilio intégré</span> = <span className="font-bold text-emerald-700">+40 % de réponses</span> vs email seul. Game changer pour les CEO ultra busy.
                <span className="text-cyan-400">”</span>
              </blockquote>
              <div className="flex items-center gap-2 text-[11px] text-cyan-700 font-semibold">
                <MessageSquare size={12} />
                Email + SMS = combo gagnant
              </div>
            </div>
          </MotionInView>

          {/* Card 3 — Léa (small bottom right) */}
          <MotionInView delay={300}>
            <div className="group h-full p-7 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 ring-2 ring-white shadow-md flex items-center justify-center text-white text-sm font-bold">
                  LM
                </div>
                <div>
                  <div className="text-sm font-bold text-content-primary">Léa, freelance recrutement</div>
                  <div className="text-[11px] text-content-tertiary">sourcing candidats tech</div>
                </div>
              </div>
              <blockquote className="text-sm text-content-primary leading-relaxed mb-5">
                <span className="text-emerald-400">“</span>
                Templates par secteur + variables <span className="font-mono text-xs bg-zinc-100 px-1 rounded">{'{{prenom}} {{ville}}'}</span>. Mes premiers candidats <span className="font-bold text-emerald-700">en 24 h</span>.
                <span className="text-emerald-400">”</span>
              </blockquote>
              <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
                <Sparkles size={12} />
                Onboarding en 2 minutes
              </div>
            </div>
          </MotionInView>
        </div>

        <MotionInView delay={400}>
          <div className="text-center mt-12">
            <p className="text-sm text-content-tertiary">
              Si vous passez votre journée à copier-coller entre Lemlist, Twilio et votre CRM, Volia Campagnes est pour vous.
            </p>
          </div>
        </MotionInView>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION : Before / After comparison (avant FAQ)
// ─────────────────────────────────────────────────────────────────────
function BeforeAfterSection() {
  const before = [
    'Lemlist 39 € + Instantly 30 $ + Smartlead 39 $ = 108 €/mois',
    '3 outils, 3 logins, 3 abonnements à gérer',
    'Pas de SMS, juste l\'email',
    'Export CSV puis import manuel dans chaque outil',
    'Tes prospects répliqués 3 fois (RGPD risqué)',
  ];
  const after = [
    '49 €/mois (Pro) — tout inclus, zéro add-on',
    '1 plateforme, 1 login, 1 facture',
    'Email + SMS Twilio natif dans la même séquence',
    'Tes prospects Volia → Campagnes en 1 clic',
    'Données centralisées, opt-out RGPD unifié',
  ];
  return (
    <section className="py-24 px-4 sm:px-6 border-t border-line bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              La différence Volia Campagnes
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Sans Volia vs. Avec Volia.
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              Si vous reconnaissez la colonne de gauche, on a écrit Volia Campagnes pour vous.
            </p>
          </div>
        </MotionInView>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7">
          {/* Colonne SANS Volia */}
          <MotionInView delay={100}>
            <div className="h-full p-7 sm:p-8 rounded-3xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 via-white to-rose-50/30 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-md">
                  <X size={20} className="text-white" strokeWidth={3} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-content-primary">Le stack &quot;3 outils en parallèle&quot;</h3>
              </div>
              <ul className="space-y-4">
                {before.map((line, i) => (
                  <MotionInView key={i} delay={150 + i * 100}>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center mt-0.5">
                        <X size={12} className="text-rose-600" strokeWidth={3} />
                      </div>
                      <span className="text-sm sm:text-base text-content-secondary leading-relaxed line-through decoration-rose-300/70 decoration-1">
                        {line}
                      </span>
                    </li>
                  </MotionInView>
                ))}
              </ul>
            </div>
          </MotionInView>

          {/* Colonne AVEC Volia */}
          <MotionInView delay={150}>
            <div className="relative h-full p-7 sm:p-8 rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 shadow-xl shadow-emerald-500/10">
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                Recommandé
              </div>
              <div className="flex items-center gap-3 mb-6 mt-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <Check size={20} className="text-white" strokeWidth={3} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-content-primary">Volia Campagnes, tout intégré</h3>
              </div>
              <ul className="space-y-4">
                {after.map((line, i) => (
                  <MotionInView key={i} delay={200 + i * 100}>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mt-0.5">
                        <Check size={12} className="text-emerald-700" strokeWidth={3} />
                      </div>
                      <span className="text-sm sm:text-base text-content-primary font-medium leading-relaxed">
                        {line}
                      </span>
                    </li>
                  </MotionInView>
                ))}
              </ul>
            </div>
          </MotionInView>
        </div>

        {/* Bottom CTA */}
        <MotionInView delay={300}>
          <div className="mt-12 text-center">
            <a
              href="/signup?intent=campaign"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-base"
            >
              <Zap size={18} className="text-amber-200" />
              <span>Économisez 59 €/mois + 3 h/semaine de jonglage outils</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="mt-3 text-xs text-content-tertiary">
              Inclus dans Pro · Beta accessible aux comptes payants · Annulation 1 clic
            </p>
          </div>
        </MotionInView>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Données page
// ─────────────────────────────────────────────────────────────────────
const FEATURES = {
  headline: 'envoyer vos campagnes',
  subline: 'Pas besoin de Lemlist + Twilio + Apollo. Tout est intégré, déjà conforme RGPD, et inclus dans Pro.',
  items: [
    {
      icon: 'Mail', featured: true,
      title: 'Séquences email cold avec relances auto',
      desc: 'Délais 100 % personnalisables (J+3, J+7, J+14…). Pause auto sur réponse. Limite quotidienne pour préserver la délivrabilité (10–200 envois/jour selon votre warm-up).',
    },
    {
      icon: 'MessageSquare',
      title: 'SMS Twilio intégré',
      desc: 'Pas besoin d\'un compte Twilio à part : on a déjà un numéro français connecté. Mixez email + SMS dans la même séquence (J+0 mail, J+7 SMS de relance).',
    },
    {
      icon: 'FileText',
      title: 'Templates pré-écrits par secteur',
      desc: 'Restauration, immobilier, BTP, agences web, e-commerce… Chaque template a été testé sur des milliers d\'envois. Tweakez ou repartez de zéro.',
    },
    {
      icon: 'Tag',
      title: 'Variables dynamiques',
      desc: '{{prenom}}, {{entreprise}}, {{ville}}, {{secteur}}… Insertion automatique depuis vos prospects Volia. Fallback configurable si une variable est vide.',
    },
    {
      icon: 'BarChart3',
      title: 'Stats ouverture/clic/réponse',
      desc: 'Suivi temps réel par séquence, par étape, par template. Identifiez tout de suite ce qui marche et ce qui flop.',
    },
    {
      icon: 'Shield', wide: true,
      title: 'Opt-out unifié RGPD automatique',
      desc: 'Lien de désinscription ajouté en footer de chaque email. L\'opt-out alimente la blocklist Volia (jamais re-contacté). Mention CNIL pré-remplie, déclaration RGPD à jour.',
    },
  ],
};

const HOW_IT_WORKS = [
  { icon: 'Send', title: 'Importez vos prospects', desc: 'Depuis Volia Prospection en 1 clic ou par upload CSV. Les variables (prénom, ville, secteur) sont auto-mappées.' },
  { icon: 'Settings', title: 'Configurez votre séquence', desc: 'Choisissez un template ou partez de zéro. Définissez les délais, l\'ordre email/SMS, les limites quotidiennes.' },
  { icon: 'Zap', title: 'Lancez et suivez', desc: 'Les envois s\'enchaînent automatiquement. Stats live : taux d\'ouverture, clic, réponse. Vous arrêtez ou ajustez quand vous voulez.' },
];

const FAQ = [
  {
    q: 'Pourquoi est-ce inclus dans Pro à 49 € alors que Lemlist seul coûte 39 € ?',
    a: 'Trois choix techniques qui changent l\'équation économique : (1) on utilise Resend pour l\'email (acheminement à moitié prix vs Postmark/Sendgrid), (2) Twilio en pay-as-you-go (vs forfait fixe à 30 $/mois minimum), (3) on cible un volume réaliste pour des TPE/PME françaises (200 envois/jour max) au lieu des "unlimited" trompeurs qui finissent en blacklist. Résultat : on offre l\'équivalent de Lemlist + Instantly + un add-on SMS pour le prix d\'un seul concurrent — et le module Prospection est par-dessus.',
  },
  {
    q: 'Quels sont les quotas d\'envoi ?',
    a: 'Les quotas dépendent de votre plan et de votre warm-up : 10 emails/jour la première semaine (warm-up), 30/jour la 2e semaine, jusqu\'à 200/jour à partir du mois 2 si votre délivrabilité reste propre (taux de bounce <2 %, plaintes <0.1 %). Pour le SMS : pas de quota strict mais facturation à l\'usage (Twilio ~0,08 €/SMS France).',
  },
  {
    q: 'Comment vous gérez la délivrabilité ?',
    a: 'On ne touche pas à votre domaine d\'envoi (vous gardez votre identité). En revanche on : (1) impose un warm-up progressif, (2) bouncrate-monitoring auto avec pause si >2 %, (3) headers SPF/DKIM check à la config, (4) vérification SMTP des emails avant envoi, (5) opt-out unifié pour préserver votre réputation. Concrètement : 8-15 % de taux de réponse moyen sur du cold email B2B FR.',
  },
  {
    q: 'C\'est conforme RGPD ?',
    a: 'Oui. Volia Campagnes implémente : (1) opt-out clair en footer obligatoire, (2) registre des consentements/oppositions, (3) blocklist permanente (un prospect désinscrit ne sera jamais re-contacté, même via une autre séquence), (4) base légale "intérêt légitime" documentée, (5) déclaration RGPD à jour conforme aux recommandations CNIL pour la prospection B2B. Vous restez responsable du contenu de vos messages.',
  },
  {
    q: 'Combien de templates inclus ?',
    a: 'Plus de 40 templates couvrant 12 secteurs B2B : restauration, BTP, agences digitales, immobilier, e-commerce, hôtellerie, santé, juridique, etc. Chaque template a 3 variantes (intro cold, relance, relance finale) et a été testé sur du volume réel. Vous pouvez aussi importer vos propres templates.',
  },
  {
    q: 'Combien de séquences en parallèle ?',
    a: 'Plan Pro : 5 séquences actives. Plan Business : 25 séquences. Au-delà, contactez-nous pour un quota custom. Chaque séquence peut contenir jusqu\'à 10 étapes (email + SMS mixés) et autant de prospects que votre quota d\'envoi le permet.',
  },
];

// ─────────────────────────────────────────────────────────────────────
// JSON-LD
// ─────────────────────────────────────────────────────────────────────
const breadcrumbs = breadcrumbSchema([
  { label: 'Accueil', href: '/' },
  { label: 'Produits', href: '/produits/prospection' },
  { label: 'Campagnes' },
]);

const product = {
  '@context': 'https://schema.org',
  ...productSchema({
    name: 'Volia Campagnes',
    description: 'Séquences email cold + SMS automatisées, templates par secteur, opt-out RGPD unifié. 62 % taux ouverture moyen. Inclus dans Pro (49 €) et Business (99 €).',
    url: PAGE_URL,
    priceFrom: 49,
  }),
};

export default function CampagnesProductPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />

      <ProductPageLayout
        module="campagnes"
        status="BETA"
        hero={{
          h1Before: 'Lemlist 39 €. Instantly 30 $.',
          h1Highlight: 'Volia Campagnes :',
          h1After: 'inclus dans Pro.',
          subtitle: (
            <>
              Stop le bazar à 3 outils. Email cold + SMS Twilio + templates par secteur,{' '}
              <strong className="text-content-primary font-semibold">tout dans la même plateforme que vos prospects Volia</strong>.{' '}
              <strong className="text-emerald-700 font-semibold">62 % de taux d&apos;ouverture moyen</strong> sur la beta.
            </>
          ),
          ctaPrimary: { label: 'Lancer ma première campagne', href: '/signup?intent=campaign' },
          ctaSecondary: { label: 'Voir les tarifs', href: '/#pricing' },
          trust: [
            (<><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Inclus dans Pro &amp; Business</>),
            'Email + SMS natifs',
            'Opt-out RGPD automatique',
          ],
          mockup: <HeroMockup />,
        }}
        afterHero={<LiveStatsBanner />}
        features={FEATURES}
        afterFeatures={<UseCasesSection />}
        howItWorks={HOW_IT_WORKS}
        crossSell={{
          subtitle: 'Campagnes consomme les prospects extraits par Prospection et alimente le CRM dès qu\'un prospect répond.',
          otherModules: [
            { module: 'prospection', direction: 'in', desc: 'La source de vos prospects. 150+ secteurs, 101 départements, emails enrichis et scorés.', cta: 'Découvrir Prospection' },
            { module: 'crm', direction: 'out', desc: 'Dès qu\'un prospect répond, il devient un deal dans votre pipeline Kanban. Bientôt disponible.', cta: 'Rejoindre la beta' },
          ],
        }}
        pricing={{
          label: 'Inclus dans Pro (49 €/mois) et Business (99 €/mois)',
          subtext: 'Pro = 5 séquences en parallèle, jusqu\'à 5 000 prospects en pipeline. Business = 25 séquences, 10 000 prospects, quotas d\'envoi augmentés. Pas d\'add-on caché.',
          cta: 'Voir les tarifs complets',
          ctaHref: '/#pricing',
        }}
        beforeFaq={<BeforeAfterSection />}
        faq={FAQ}
        finalCta={{
          title: 'Lancez votre première séquence cette semaine',
          subtitle: 'Templates prêts à l\'emploi, prospects déjà enrichis, opt-out géré. Vous n\'avez plus qu\'à appuyer sur Play.',
          primary: { label: 'Lancer ma première campagne', href: '/signup?intent=campaign' },
          secondary: { label: 'Voir les tarifs', href: '/#pricing' },
          trust: 'Inclus dans Pro · Beta accessible aux comptes payants · Conformité RGPD by default',
        }}
      />
    </>
  );
}
