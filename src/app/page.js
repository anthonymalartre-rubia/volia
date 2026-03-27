import Link from 'next/link';
import { ArrowRight, Check, Zap, Search, Mail, MapPin, Shield, Layers, Download, Crown, Star, Tag } from 'lucide-react';
import { NavAuth, HeroCTA, FooterCTA } from '@/components/AuthCTA';
import { PLANS } from '@/lib/plans';

export const metadata = {
  title: 'Prospectia.ai — Vos prospects DOM-TOM, trouvés par l\'IA',
  description: 'La plateforme de prospection B2B la plus abordable pour les DOM-TOM. Recherche Google Places + enrichissement email en cascade. 92% moins cher que la concurrence.',
};

function formatPrice(cents) {
  if (cents === 0) return '0';
  return Math.round(cents / 100).toString();
}

function formatLimit(value) {
  if (value === -1) return 'Illimité';
  return value.toLocaleString('fr-FR');
}

const PLAN_FEATURES = {
  free: [
    `${formatLimit(PLANS.free.limits.searches_per_month)} recherches/mois`,
    `${formatLimit(PLANS.free.limits.enrichments_per_month)} enrichissements/mois`,
    `${formatLimit(PLANS.free.limits.exports_per_month)} exports/mois`,
    `${formatLimit(PLANS.free.limits.folders)} dossiers`,
    'Scraping email gratuit',
    'Export CSV standard',
    '4 départements DOM-TOM',
  ],
  pro: [
    'Recherches illimitées',
    `${formatLimit(PLANS.pro.limits.enrichments_per_month)} enrichissements/mois`,
    'Exports illimités',
    'Dossiers illimités',
    'Waterfall complet (7 sources)',
    'Export CSV + Zoho CRM',
    'Support prioritaire',
  ],
  enterprise: [
    'Tout dans Pro',
    'Enrichissements illimités',
    'Apollo + Enrichly + Anymail inclus',
    'API access',
    'Utilisateurs illimités',
    'Webhooks & intégrations',
    'SLA & support dédié',
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#08080c] text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#08080c]/70 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mr-1.5">
              <span className="text-[11px] font-bold text-white">P</span>
            </div>
            <span className="text-lg font-bold tracking-tight">Prospectia</span>
            <span className="text-violet-400 text-xs font-semibold">.ai</span>
          </Link>
          <div className="hidden sm:flex items-center gap-8">
            <Link href="#features" className="text-sm text-zinc-500 hover:text-white transition">Fonctionnalités</Link>
            <Link href="#how-it-works" className="text-sm text-zinc-500 hover:text-white transition">Comment ça marche</Link>
            <Link href="#pricing" className="text-sm text-zinc-500 hover:text-white transition">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <NavAuth />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-28 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-[5%] w-64 h-64 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-zinc-400 mb-8 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Spécialisé DOM-TOM &mdash; 971 &middot; 972 &middot; 973 &middot; 974
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-8">
            <span className="bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent">Générez des leads qualifiés</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">dans les DOM-TOM.</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Prospection B2B automatisée en Guadeloupe, Martinique, Guyane et La Réunion.
            Recherche Google Places, enrichissement email en cascade, export en 1 clic.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <HeroCTA />
            <Link
              href="#features"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1"
            >
              Voir comment ça marche
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Chat mockup */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden shadow-2xl shadow-violet-500/5">
            {/* Mock top bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">P</span>
              </div>
              <span className="text-xs font-semibold text-zinc-400">Prospectia<span className="text-violet-400">.ai</span></span>
              <span className="text-[10px] text-zinc-600 ml-auto">Nouvelle recherche</span>
            </div>
            {/* Chat messages */}
            <div className="p-5 space-y-4">
              {/* Bot */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap size={11} className="text-white" />
                </div>
                <p className="text-sm text-zinc-300">Quel type de prospects recherchez-vous ?</p>
              </div>
              {/* Options */}
              <div className="flex gap-2 pl-9">
                <span className="px-3 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-medium">B2B &mdash; Entreprises</span>
                <span className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-zinc-500 text-xs font-medium">Copropriété</span>
                <span className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-zinc-500 text-xs font-medium">Les deux</span>
              </div>
              {/* User answer */}
              <div className="flex justify-end">
                <span className="px-3.5 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/20 text-violet-300 text-xs">B2B &mdash; Entreprises</span>
              </div>
              {/* Bot */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={11} className="text-white" />
                </div>
                <p className="text-sm text-zinc-300">Dans quels départements ?</p>
              </div>
              <div className="flex gap-2 pl-9 flex-wrap">
                {['971 Guadeloupe', '972 Martinique', '973 Guyane', '974 La Réunion'].map((d) => (
                  <span key={d} className="px-3 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-medium">{d}</span>
                ))}
              </div>
              {/* Typing indicator */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Zap size={11} className="text-white" />
                </div>
                <div className="flex gap-1 py-2">
                  <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0ms]" />
                  <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-violet-400 mb-3">Fonctionnalités</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tout ce qu&apos;il faut pour prospecter
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Une plateforme complète pour trouver, enrichir et exporter vos leads DOM-TOM.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Search,
                title: 'Recherche Google Places',
                desc: 'Interrogez l\'API Google Places par département et catégorie. 19 catégories B2B et copropriété prédéfinies.',
                gradient: 'from-violet-500/20 to-indigo-500/20',
                iconBg: 'from-violet-500 to-indigo-600',
              },
              {
                icon: Mail,
                title: 'Enrichissement email',
                desc: 'Waterfall multi-sources : scraping, Serper, Apollo, Enrichly, Anymail, Findymail. S\'arrête au premier email trouvé.',
                gradient: 'from-indigo-500/20 to-blue-500/20',
                iconBg: 'from-indigo-500 to-blue-600',
              },
              {
                icon: Tag,
                title: 'Lead scoring & tags',
                desc: 'Scoring automatique des emails (domain match, contact@, pro, générique). Organisez vos leads par dossiers.',
                gradient: 'from-blue-500/20 to-cyan-500/20',
                iconBg: 'from-blue-500 to-cyan-600',
              },
              {
                icon: Download,
                title: 'Export CSV & Zoho CRM',
                desc: 'Exportez en CSV standard ou au format Zoho CRM (Last Name, Company, Email, Phone). Prêt pour l\'outreach.',
                gradient: 'from-cyan-500/20 to-teal-500/20',
                iconBg: 'from-cyan-500 to-teal-600',
              },
            ].map((feature) => (
              <div key={feature.title} className="group relative p-6 rounded-2xl border border-white/[0.06] bg-[#111114]/80 backdrop-blur-sm hover:bg-white/[0.04] transition-colors">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon size={18} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-violet-400 mb-3">Comment ça marche</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              3 étapes, des centaines de leads
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Pas de formulaires complexes. Répondez à quelques questions, Prospectia fait le travail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: MapPin,
                title: 'Choisissez départements & catégories',
                desc: 'Sélectionnez vos départements (971-974) et les catégories B2B ou copropriété qui vous intéressent. Ou lancez une requête personnalisée.',
                gradient: 'from-violet-500 to-indigo-600',
              },
              {
                step: '02',
                icon: Zap,
                title: 'Recherche & enrichissement automatiques',
                desc: 'Prospectia interroge Google Places, déduplique les résultats et enrichit chaque prospect avec jusqu\'à 7 sources email différentes.',
                gradient: 'from-indigo-500 to-blue-600',
              },
              {
                step: '03',
                icon: Download,
                title: 'Exportez vos leads qualifiés',
                desc: 'Filtrez par département, type ou recherche texte. Exportez en CSV standard ou format Zoho CRM, prêts pour votre campagne.',
                gradient: 'from-blue-500 to-cyan-600',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <item.icon size={20} className="text-white" />
                  </div>
                  <span className="text-4xl font-bold font-mono text-white/10">{item.step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waterfall visual */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-sm font-semibold text-violet-400 mb-3">Enrichissement en cascade</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 max-w-lg">
              7 sources. 1 clic. Le meilleur email.
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl">
              92% moins cher qu&apos;Apollo seul. Notre waterfall teste chaque source
              et s&apos;arrête dès qu&apos;un email est trouvé.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {[
              { name: 'Scraping', tag: 'Gratuit', color: 'from-green-500/20 to-emerald-500/20 border-green-500/20', dot: 'bg-green-400' },
              { name: 'Serper', tag: '$0.002', color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/20', dot: 'bg-yellow-400' },
              { name: 'Apollo', tag: '$79/mo', color: 'from-orange-500/20 to-red-500/20 border-orange-500/20', dot: 'bg-orange-400' },
              { name: 'Enrichly', tag: '$59/mo', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/20', dot: 'bg-cyan-400' },
              { name: 'Anymail', tag: 'API', color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/20', dot: 'bg-teal-400' },
              { name: 'Findymail', tag: 'API', color: 'from-sky-500/20 to-indigo-500/20 border-sky-500/20', dot: 'bg-sky-400' },
              { name: 'Fallback', tag: 'Deviné', color: 'from-zinc-500/20 to-zinc-600/20 border-zinc-500/20', dot: 'bg-zinc-400' },
            ].map((s, i) => (
              <div key={s.name} className={`relative p-4 rounded-xl bg-gradient-to-br ${s.color} border border-white/[0.06]`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className="text-[10px] font-mono text-zinc-500">0{i + 1}</span>
                </div>
                <h4 className="text-sm font-semibold mb-1">{s.name}</h4>
                <span className="text-[10px] text-zinc-500">{s.tag}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-zinc-600 mt-6">
            S&apos;arrête au premier email trouvé &mdash; vous ne payez que ce qui est nécessaire.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '19', label: 'Catégories', sub: 'B2B & Copro' },
              { value: '4', label: 'Départements', sub: 'DOM-TOM' },
              { value: '7', label: 'Sources', sub: 'Enrichissement' },
              { value: '-92%', label: 'vs Apollo', sub: 'Coût/lead' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl sm:text-5xl font-bold font-mono bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-sm text-zinc-400 mt-2">{stat.label}</div>
                <div className="text-[10px] text-zinc-600 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-violet-400 mb-3">Pricing transparent</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Le plus compétitif du marché
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Pas de crédits cachés. Pas de markup sur les API. Vous payez le coût réel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="p-8 rounded-2xl border border-white/[0.06] bg-[#111114]/80 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-1">{PLANS.free.name}</h3>
              <p className="text-sm text-zinc-500 mb-6">Pour tester la plateforme</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">{formatPrice(PLANS.free.price)}&euro;</span>
                <span className="text-zinc-600 text-sm">/mois</span>
              </div>
              <Link
                href="/signup"
                className="block w-full py-3 text-center text-sm font-semibold rounded-xl border border-white/[0.1] hover:bg-white/[0.05] transition mb-8 text-zinc-300"
              >
                Commencer gratuitement
              </Link>
              <div className="space-y-3">
                {PLAN_FEATURES.free.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check size={16} className="text-violet-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-zinc-400">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro — Recommended */}
            <div className="relative p-8 rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-500/[0.08] to-[#111114]/80 backdrop-blur-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold rounded-full shadow-lg shadow-violet-500/20 flex items-center gap-1.5">
                <Crown size={12} />
                Recommandé
              </div>
              <h3 className="text-lg font-semibold mb-1">{PLANS.pro.name}</h3>
              <p className="text-sm text-zinc-500 mb-6">Pour les équipes commerciales</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">{formatPrice(PLANS.pro.price)}&euro;</span>
                <span className="text-zinc-600 text-sm">/mois</span>
              </div>
              <Link
                href="/signup"
                className="block w-full py-3 text-center text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-500/20 mb-8"
              >
                Choisir Pro &rarr;
              </Link>
              <div className="space-y-3">
                {PLAN_FEATURES.pro.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check size={16} className="text-violet-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-zinc-400">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-2xl border border-white/[0.06] bg-[#111114]/80 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-1">{PLANS.enterprise.name}</h3>
              <p className="text-sm text-zinc-500 mb-6">Volume et sur-mesure</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">{formatPrice(PLANS.enterprise.price)}&euro;</span>
                <span className="text-zinc-600 text-sm">/mois</span>
              </div>
              <Link
                href="/signup"
                className="block w-full py-3 text-center text-sm font-semibold rounded-xl border border-white/[0.1] hover:bg-white/[0.05] transition mb-8 text-zinc-300"
              >
                Contacter l&apos;équipe
              </Link>
              <div className="space-y-3">
                {PLAN_FEATURES.enterprise.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check size={16} className="text-violet-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-zinc-400">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="mt-16 p-8 rounded-2xl bg-[#111114]/80 backdrop-blur-sm border border-white/[0.06]">
            <h3 className="font-semibold mb-6 text-center text-zinc-300">Comparez avec la concurrence</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-3 px-4 font-medium text-zinc-600"></th>
                    <th className="text-center py-3 px-4 font-bold text-violet-400">Prospectia</th>
                    <th className="text-center py-3 px-4 font-medium text-zinc-600">Apollo.io</th>
                    <th className="text-center py-3 px-4 font-medium text-zinc-600">LeadQuest</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Prix/mois', `${formatPrice(PLANS.pro.price)}\u20AC`, '79\u20AC', '~99\u20AC'],
                    ['Sources enrichissement', '7', '1', '?'],
                    ['Focus DOM-TOM', '\u2713', '\u2717', '\u2717'],
                    ['Google Places intégré', '\u2713', '\u2717', '\u2717'],
                    ['Export Zoho CRM', '\u2713', '\u2717', '\u2717'],
                    ['Interface conversationnelle', '\u2713', '\u2717', '\u2717'],
                  ].map(([label, ...values], i) => (
                    <tr key={i} className="border-b border-white/[0.04]">
                      <td className="py-3 px-4 text-zinc-400">{label}</td>
                      {values.map((v, j) => (
                        <td key={j} className={`py-3 px-4 text-center ${j === 0 ? 'font-semibold text-white' : 'text-zinc-600'}`}>
                          {v === '\u2713' ? <span className="text-violet-400 font-bold">&#10003;</span> :
                           v === '\u2717' ? <span className="text-zinc-700">&#10005;</span> : v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-28 px-6 border-t border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/[0.08] via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à trouver vos prochains clients ?
          </h2>
          <p className="text-zinc-500 text-lg mb-8 max-w-xl mx-auto">
            Créez votre compte en 30 secondes. Aucune carte bancaire requise.
          </p>
          <FooterCTA />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">P</span>
            </div>
            <span className="text-sm font-bold tracking-tight">Prospectia</span>
            <span className="text-violet-400 text-[10px] font-semibold">.ai</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <span>Guadeloupe</span>
            <span>Martinique</span>
            <span>Guyane</span>
            <span>La Réunion</span>
          </div>
          <p className="text-[11px] text-zinc-700">
            &copy; 2026 Prospectia.ai
          </p>
        </div>
      </footer>
    </div>
  );
}
