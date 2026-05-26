// ─────────────────────────────────────────────────────────────────────
// /produits/crm — page produit Volia CRM (COMING SOON)
// ─────────────────────────────────────────────────────────────────────
// Accent : emerald/teal/green.
// Position : aval de Campagnes (un prospect qui répond = un deal CRM).
// Statut : Beta privée prévue Q4 2026 / Q1 2027. CTA = waitlist form.
// ─────────────────────────────────────────────────────────────────────

import { Layers, TrendingUp, Rocket, Check, X, ArrowRight, Zap, Sparkles, Smartphone, Users } from 'lucide-react';
import ProductPageLayout from '@/components/ProductPageLayout';
import MotionInView from '@/components/MotionInView';
import WaitlistForm from './WaitlistForm';
import { breadcrumbSchema } from '@/lib/seo-helpers';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/produits/crm`;

export const metadata = {
  title: 'Volia CRM — Le pipeline commercial gratuit dans Volia Pro (beta Q4 2026)',
  description:
    'Stop HubSpot à 90 €/mois. Volia CRM : inclus dans Pro et Business, pipeline Kanban natif, mobile-first, RGPD by default. Beta privée Q4 2026. Rejoignez la liste.',
  alternates: { canonical: PAGE_URL },
  keywords: [
    'CRM français léger',
    'pipeline kanban deals',
    'alternative HubSpot français',
    'alternative Pipedrive',
    'alternative Salesforce',
    'CRM RGPD natif',
    'Volia CRM',
    'CRM pour TPE PME',
    'CRM SDR freelance',
  ],
  openGraph: {
    title: 'Volia CRM — Le pipeline commercial gratuit dans Volia Pro (beta Q4 2026)',
    description:
      'Pipeline Kanban natif, mobile-first, inclus dans Pro (49 €). Beta privée Q4 2026, 47 founders déjà sur la liste d\'attente. RGPD by default.',
    url: PAGE_URL,
    type: 'website',
  },
};

// ─────────────────────────────────────────────────────────────────────
// Mockup hero : pipeline Kanban 4 colonnes avec deals stylisés
// ─────────────────────────────────────────────────────────────────────
function HeroMockup() {
  const columns = [
    {
      title: 'Lead', count: 12, color: 'zinc',
      deals: [
        { name: 'La Bonne Table', value: '2 400 €', avatar: '🍽️' },
        { name: 'Pasta Roma', value: '1 800 €', avatar: '🍝' },
      ],
    },
    {
      title: 'Qualifié', count: 7, color: 'blue',
      deals: [
        { name: 'Hôtel Riviera', value: '4 200 €', avatar: '🏨' },
        { name: 'Boulangerie M.', value: '900 €', avatar: '🥖' },
      ],
    },
    {
      title: 'Démo', count: 4, color: 'amber',
      deals: [
        { name: 'Sushi Lounge', value: '3 600 €', avatar: '🍱' },
      ],
    },
    {
      title: 'Closé', count: 3, color: 'emerald',
      deals: [
        { name: 'Le Petit Bistrot', value: '5 100 €', avatar: '🍷' },
      ],
    },
  ];

  return (
    <>
      <div className="absolute -top-4 -left-4 z-20 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 shadow-md flex items-center gap-2">
        <Rocket size={12} className="text-amber-700" />
        <span className="text-xs font-semibold text-amber-700">Beta privée Q4 2026</span>
      </div>

      <div className="relative rounded-2xl bg-white border border-line shadow-2xl shadow-emerald-500/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="ml-3 text-xs font-mono text-content-tertiary">volia.fr/crm</div>
          </div>
          <div className="text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 font-semibold">Pipeline Q1</div>
        </div>

        {/* Pipeline stats */}
        <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
          {[
            { label: 'Pipeline', value: '47 k€', color: 'text-emerald-700' },
            { label: 'Closing rate', value: '21%', color: 'text-teal-700' },
            { label: 'Cycle moyen', value: '18 j', color: 'text-green-700' },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 text-center">
              <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-content-tertiary mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Kanban 4 colonnes */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-surface-elevated/30">
          {columns.map((col, ci) => (
            <div
              key={col.title}
              className="bg-white rounded-lg border border-line p-2 animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${300 + ci * 100}ms`, animationDuration: '600ms', animationFillMode: 'both' }}
            >
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-content-tertiary">{col.title}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  col.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                  col.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  col.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                  'bg-zinc-100 text-zinc-700'
                }`}>{col.count}</span>
              </div>
              <div className="space-y-1.5">
                {col.deals.map((deal, di) => (
                  <div
                    key={di}
                    className="rounded-md border border-line bg-white p-2 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{deal.avatar}</span>
                      <span className="text-[10px] font-semibold text-content-primary truncate flex-1">{deal.name}</span>
                    </div>
                    <div className="text-[10px] font-mono font-bold text-emerald-700">{deal.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-line bg-white">
          <span className="text-xs text-content-tertiary">26 deals actifs</span>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <TrendingUp size={12} />
            +18% ce mois
          </div>
        </div>
      </div>

      {/* Floating decorative card "+ 5 deals" */}
      <div className="hidden lg:flex absolute -bottom-6 -right-6 z-20 px-4 py-3 rounded-xl bg-white border border-line shadow-xl items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <Layers size={18} className="text-white" />
        </div>
        <div>
          <div className="text-xs text-content-tertiary">Nouveaux deals</div>
          <div className="text-lg font-bold text-content-primary tabular-nums">+ 5</div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Banner "Beta privée Q4 2026" — avec compteur waitlist
// ─────────────────────────────────────────────────────────────────────
function PricingBanner() {
  return (
    <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
        <Rocket size={18} className="text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h4 className="font-bold text-amber-900">Beta privée prévue Q4 2026</h4>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-amber-300 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-600"></span>
            </span>
            47 founders inscrits
          </span>
        </div>
        <p className="text-sm text-amber-800 mb-3">
          Volia CRM sera inclus dans les plans Pro (49 €/mois) et Business (99 €/mois) à la sortie.
          Aucun add-on, aucun surcoût. <strong>Pro et Business prioritaires</strong> sur la beta.
        </p>
        <WaitlistForm variant="hero" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION : Live stats banner (juste après hero)
// ─────────────────────────────────────────────────────────────────────
function LiveStatsBanner() {
  const stats = [
    { value: '87%', label: 'des SDR perdent des deals', sub: 'faute de CRM organisé (source HubSpot 2024)', color: 'from-emerald-600 via-teal-600 to-emerald-700' },
    { value: '89 €', label: '/mois', sub: 'coût moyen d\'un CRM en France (HubSpot Starter)', color: 'from-teal-600 to-green-700' },
    { value: '40%', label: 'de temps en plus', sub: 'passé à updater le CRM vs faire des deals', color: 'from-green-600 to-emerald-700' },
    { value: 'Q4 2026', label: 'lancement beta', sub: 'inscriptions prioritaires Pro & Business', color: 'from-amber-600 to-orange-700' },
  ];
  return (
    <section className="relative py-20 px-4 sm:px-6 border-t border-line overflow-hidden bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-200/25 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        <MotionInView>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
              </span>
              Pourquoi un CRM dans Volia ?
            </span>
          </div>
        </MotionInView>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <MotionInView key={stat.label} delay={i * 100}>
              <div className="group">
                <div className={`text-4xl sm:text-5xl lg:text-6xl font-bold font-mono tabular-nums bg-gradient-to-br ${stat.color} bg-clip-text text-transparent leading-none mb-3 group-hover:scale-105 transition-transform`}>
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
// SECTION : Use cases (3 personas qui ATTENDENT le CRM)
// ─────────────────────────────────────────────────────────────────────
function UseCasesSection() {
  return (
    <section className="py-24 px-4 sm:px-6 border-t border-line">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              Pour qui on le construit
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              3 founders qui l&apos;attendent.
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              On a interrogé des dizaines de prospects Volia avant de poser une ligne de code CRM. Voici les profils types qui ont vendu le projet.
            </p>
          </div>
        </MotionInView>

        {/* Bento : 1 grande card à gauche (Anthony featured) + 2 petites empilées à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Card 1 — Anthony founder (large featured) */}
          <MotionInView delay={100} className="lg:col-span-2 lg:row-span-2">
            <div className="group relative h-full p-8 sm:p-10 rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                Conçu par le fondateur
              </div>

              <div className="relative">
                <div className="flex items-center gap-4 mb-6 mt-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 ring-4 ring-white shadow-lg flex items-center justify-center text-white text-xl font-bold">
                    AM
                  </div>
                  <div>
                    <div className="text-lg font-bold text-content-primary">Anthony, founder Volia</div>
                    <div className="text-sm text-content-tertiary">construit Volia CRM pour ses propres besoins</div>
                  </div>
                </div>

                <blockquote className="text-xl sm:text-2xl font-medium text-content-primary leading-snug mb-8">
                  <span className="text-emerald-400 text-3xl leading-none">“</span>
                  J&apos;ai construit ce CRM <span className="bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent font-bold">pour moi-même</span> : léger, mobile, <span className="bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent font-bold">gratuit pour mes clients Pro</span>. Pas de licence à 100 € par user.
                  <span className="text-emerald-400 text-3xl leading-none">”</span>
                </blockquote>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-200/50">
                  {[
                    { v: '0 €', l: 'd\'abonnement' },
                    { v: '5 min', l: 'd\'onboarding' },
                    { v: 'Mobile', l: 'first by design' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold font-mono bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">{stat.v}</div>
                      <div className="text-[11px] text-content-tertiary mt-1">{stat.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MotionInView>

          {/* Card 2 — Julie (small top right) */}
          <MotionInView delay={200}>
            <div className="group h-full p-7 rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 via-white to-green-50/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-green-600 ring-2 ring-white shadow-md flex items-center justify-center text-white text-sm font-bold">
                  JL
                </div>
                <div>
                  <div className="text-sm font-bold text-content-primary">Julie, agence comm 5 personnes</div>
                  <div className="text-[11px] text-content-tertiary">200 leads/mois à gérer</div>
                </div>
              </div>
              <blockquote className="text-sm text-content-primary leading-relaxed mb-5">
                <span className="text-teal-400">“</span>
                HubSpot c&apos;est <span className="font-semibold">450 €/mois pour 5 users</span>. Volia CRM nous fera <span className="font-bold text-emerald-700">économiser ça</span> dès la beta.
                <span className="text-teal-400">”</span>
              </blockquote>
              <div className="flex items-center gap-2 text-[11px] text-teal-700 font-semibold">
                <Users size={12} />
                Équipe 2-10 personnes
              </div>
            </div>
          </MotionInView>

          {/* Card 3 — Karim (small bottom right) */}
          <MotionInView delay={300}>
            <div className="group h-full p-7 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 via-white to-emerald-50/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 ring-2 ring-white shadow-md flex items-center justify-center text-white text-sm font-bold">
                  KB
                </div>
                <div>
                  <div className="text-sm font-bold text-content-primary">Karim, consultant indépendant</div>
                  <div className="text-[11px] text-content-tertiary">B2B services</div>
                </div>
              </div>
              <blockquote className="text-sm text-content-primary leading-relaxed mb-5">
                <span className="text-green-400">“</span>
                J&apos;utilise <span className="font-semibold">Notion bricolé</span> depuis 2 ans. Vivement un <span className="font-bold text-emerald-700">vrai pipeline visuel</span> dans Volia.
                <span className="text-green-400">”</span>
              </blockquote>
              <div className="flex items-center gap-2 text-[11px] text-green-700 font-semibold">
                <Smartphone size={12} />
                Solo, mobile-first
              </div>
            </div>
          </MotionInView>
        </div>

        <MotionInView delay={400}>
          <div className="text-center mt-12">
            <p className="text-sm text-content-tertiary mb-4">
              Si vous vous reconnaissez dans l&apos;un de ces 3 profils, votre place est dans la beta.
            </p>
            <div className="max-w-md mx-auto">
              <WaitlistForm variant="hero" />
            </div>
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
    'HubSpot Starter 90 €/mois + 50 € par user supplémentaire',
    'Pipedrive 49 €/user (300 €/mois pour 6 personnes)',
    'Salesforce 125 €/user/mois (= 750 €/mois en équipe)',
    'Notion ou Excel = pas de vrai pipeline visuel',
    'Import manuel des prospects depuis ton outil de prospection',
  ];
  const after = [
    'Inclus dans Pro 49 €/mois (multi-users)',
    'Inclus dans Business 99 €/mois (équipes 10+)',
    'Pipeline Kanban natif visuel et drag & drop',
    'Mobile-first (vs HubSpot desktop-oriented)',
    'Tes contacts Volia → CRM automatique',
  ];
  return (
    <section className="py-24 px-4 sm:px-6 border-t border-line bg-gradient-to-b from-white via-emerald-50/30 to-white">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              La différence Volia CRM
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Sans Volia vs. Avec Volia.
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              Si la colonne de gauche c&apos;est votre quotidien (et votre note CB), la beta est faite pour vous.
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
                <h3 className="text-xl sm:text-2xl font-bold text-content-primary">Les CRM &quot;qui coûtent un bras&quot;</h3>
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
                <h3 className="text-xl sm:text-2xl font-bold text-content-primary">Volia CRM, inclus dans Pro</h3>
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
            <div className="inline-flex flex-col items-center gap-3">
              <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-xl shadow-emerald-500/30">
                <Zap size={18} className="text-amber-200" />
                <span>Économisez 90 € à 750 €/mois selon votre équipe</span>
                <ArrowRight size={18} />
              </div>
              <div className="max-w-md w-full mt-2">
                <WaitlistForm variant="hero" />
              </div>
              <p className="text-xs text-content-tertiary">
                Beta privée — Pro et Business prioritaires · 47 founders déjà inscrits
              </p>
            </div>
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
  headline: 'gérer vos deals',
  subline: 'Pas un mini-Salesforce. Un CRM léger, mobile-first, déjà connecté à Prospection et Campagnes.',
  items: [
    {
      icon: 'Users', featured: true,
      title: 'Contacts auto-créés depuis Campagnes',
      desc: 'Dès qu\'un prospect répond à votre séquence, il devient un contact CRM avec tout son historique (séquence, ouvertures, clics, réponse complète). Plus de copier-coller.',
    },
    {
      icon: 'KanbanSquare',
      title: 'Pipeline Kanban personnalisable',
      desc: 'Lead → Qualifié → Démo → Proposition → Closé. Personnalisez les étapes, drag & drop des deals, valeur estimée par carte.',
    },
    {
      icon: 'BarChart3',
      title: 'Reporting closing rate & cycle',
      desc: 'Closing rate par segment/source, cycle de vente moyen, valeur pipeline pondérée, prévisions M+1/M+3. Pas besoin d\'un consultant pour comprendre.',
    },
    {
      icon: 'FileText',
      title: 'Notes & activités par deal',
      desc: 'Historique horodaté : appels, emails, démos, propositions. Recherche full-text. Tags personnalisables.',
    },
    {
      icon: 'Smartphone',
      title: 'Mobile-first',
      desc: 'Pensé pour le terrain : interface tactile, actions en 1 tap, notifications push. Vs les CRM old-school qui rament sur mobile.',
    },
    {
      icon: 'Shield', wide: true,
      title: 'RGPD compliant by default',
      desc: 'Hébergement français (Supabase Paris), consentements tracés, droit à l\'effacement en 1 clic, registre des traitements pré-rempli. Conforme aux exigences DPO/CNIL.',
    },
  ],
};

const HOW_IT_WORKS = [
  { icon: 'Settings', title: 'Configurez votre pipeline', desc: 'Choisissez vos étapes (Lead/Qualifié/Démo/Proposition/Closé ou custom). Définissez la valeur moyenne par étape et vos prévisions cible.' },
  { icon: 'MessageSquare', title: 'Les contacts arrivent tout seuls', desc: 'Chaque réponse à une séquence Volia Campagnes crée automatiquement un deal en colonne "Lead" avec l\'historique complet.' },
  { icon: 'TrendingUp', title: 'Suivez jusqu\'au closing', desc: 'Drag & drop des deals d\'étape en étape. Notes, activités, fichiers. Reporting auto sur votre closing rate et cycle moyen.' },
];

const FAQ = [
  {
    q: 'Quand exactement sera-t-il disponible ?',
    a: 'Beta privée prévue Q4 2026 (octobre-décembre). La date exacte dépend du nombre d\'inscrits sur la waitlist — si on dépasse 200 inscriptions on accélère le calendrier. Sortie publique Q1 2027. Le backend est déjà en construction parallèlement à Campagnes.',
  },
  {
    q: 'Comment se passe la beta ?',
    a: 'Invitations progressives par vagues de 25 personnes pour ne pas faire exploser le support. Vous aurez : (1) un Slack/Discord direct avec l\'équipe produit pour remonter le feedback, (2) 3 mois d\'utilisation gratuite à la sortie publique, (3) un statut "Founding User" affiché dans votre compte. Aucun engagement, vous testez et restez ou partez.',
  },
  {
    q: 'Migration depuis HubSpot/Pipedrive/Salesforce ?',
    a: 'Import CSV standard prévu dès la beta (contacts, deals, étapes) avec mapping automatique des colonnes. Migration assistée HubSpot et Pipedrive (sans CSV, via API) prévue pour la sortie publique Q1 2027. Pour Salesforce, l\'export CSV manuel reste possible dès le début. Si vous avez plus de 5 000 contacts à migrer, on vous aide en visio.',
  },
  {
    q: 'Comment rejoindre la beta ?',
    a: 'Inscrivez-vous à la waitlist sur cette page. On contactera 100 comptes maximum lors du lancement, prioritairement les utilisateurs Pro et Business actifs de Volia Prospection + Campagnes. Aucun engagement, vous recevez juste un email avec un accès anticipé.',
  },
  {
    q: 'Combien de pipelines en parallèle ?',
    a: 'Plan Pro : 1 pipeline avec étapes custom (suffisant pour 95 % des cas). Plan Business : jusqu\'à 5 pipelines (utile si vous vendez plusieurs produits avec des cycles différents, ou si vous gérez plusieurs équipes commerciales). Pas de quota sur le nombre de deals.',
  },
];

// ─────────────────────────────────────────────────────────────────────
// JSON-LD : Product avec availability PreOrder
// ─────────────────────────────────────────────────────────────────────
const breadcrumbs = breadcrumbSchema([
  { label: 'Accueil', href: '/' },
  { label: 'Produits', href: '/produits/prospection' },
  { label: 'CRM' },
]);

const product = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Volia CRM',
  description: "Pipeline et suivi commercial natif Volia. Pipeline Kanban, contacts auto depuis Campagnes, reporting, mobile-first, RGPD by default. Beta privée Q4 2026.",
  url: PAGE_URL,
  brand: { '@type': 'Brand', name: 'Volia' },
  offers: {
    '@type': 'Offer',
    price: '49',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/PreOrder',
    availabilityStarts: '2026-10-01',
    url: PAGE_URL,
  },
};

export default function CrmProductPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />

      <ProductPageLayout
        module="crm"
        status="COMING_SOON"
        hero={{
          h1Before: 'HubSpot 90 €. Pipedrive 49 €. Salesforce 125 €.',
          h1Highlight: 'Volia CRM :',
          h1After: 'inclus.',
          subtitle: (
            <>
              Stop le bazar Notion + Excel + Trello — et stop les CRM à 100 € par user.{' '}
              <strong className="text-content-primary font-semibold">Un CRM natif Volia, conçu pour les TPE françaises</strong>,
              mobile-first, RGPD by default. <strong className="text-amber-700 font-semibold">Beta privée Q4 2026</strong> — 47 founders déjà inscrits.
            </>
          ),
          ctaPrimary: { label: 'Voir Prospection', href: '/produits/prospection' },
          ctaSecondary: { custom: <WaitlistForm variant="hero" /> },
          trust: [
            (<><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Beta privée Q4 2026</>),
            'Inclus dans Pro & Business',
            'Pro & Business prioritaires',
          ],
          mockup: <HeroMockup />,
        }}
        afterHero={<LiveStatsBanner />}
        features={FEATURES}
        afterFeatures={<UseCasesSection />}
        howItWorks={HOW_IT_WORKS}
        crossSell={{
          subtitle: 'Le CRM consomme les contacts qui répondent dans Campagnes, qui eux-mêmes viennent des prospects extraits par Prospection. La boucle est fermée.',
          otherModules: [
            { module: 'prospection', direction: 'in', desc: 'Le tout début du tunnel. 150+ secteurs, 101 départements, emails enrichis et scorés.', cta: 'Découvrir Prospection' },
            { module: 'campagnes', direction: 'in', desc: 'L\'outil qui transforme les prospects en réponses positives — qui deviennent vos deals CRM.', cta: 'Découvrir Campagnes' },
          ],
        }}
        pricingBanner={<PricingBanner />}
        pricing={{
          label: 'Inclus dans Pro et Business à la sortie',
          subtext: 'Aucun add-on, aucun surcoût. Si vous êtes déjà sur Pro (49 €) ou Business (99 €), le CRM s\'ajoutera automatiquement à votre compte à l\'ouverture publique.',
          cta: 'Voir les tarifs actuels',
          ctaHref: '/#pricing',
        }}
        beforeFaq={<BeforeAfterSection />}
        faq={FAQ}
        finalCta={{
          title: 'Rejoignez la beta privée',
          subtitle: '100 premiers comptes seulement. 3 mois d\'utilisation gratuite, accès Discord direct à l\'équipe produit. Aucun engagement. Pro et Business prioritaires.',
          customForm: <WaitlistForm variant="cta" />,
          trust: 'Beta privée — Pro et Business prioritaires · 47 founders déjà sur la liste d\'attente · Désinscription 1 clic',
        }}
      />
    </>
  );
}
