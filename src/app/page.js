import Link from 'next/link';
import { ArrowRight, Check, Zap, Search, Mail, MapPin, Shield, Layers, Download, Crown, Star, Tag, Brain, TrendingDown, Database, X, Globe, BarChart3 } from 'lucide-react';
import { NavAuth, HeroCTA, FooterCTA } from '@/components/AuthCTA';
import { PLANS } from '@/lib/plans';
import FAQSection from '@/components/FAQSection';
import InteractiveDemo from '@/components/InteractiveDemo';
import TypewriterText from '@/components/TypewriterText';
import MouseParticles from '@/components/MouseParticles';

export const metadata = {
  title: 'Prospectia.ai — L\'agrégateur de prospection B2B le moins cher de France',
  description: 'Agrégateur all-in-one : Apollo, Serper, Enrichly, Anymail, Findymail réunis en une seule plateforme. 150+ catégories, 101 départements, scoring IA. À partir de 49€/mois — 5x moins cher que la concurrence.',
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
    '101 départements (France entière)',
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
    'Vérification emails SMTP (bulk)',
    'Apollo + Enrichly + Anymail inclus',
    'API access',
    'Utilisateurs illimités',
    'Webhooks & intégrations',
    'SLA & support dédié',
  ],
};

const COMPETITORS = [
  { name: 'Apollo.io', price: '99', enrichments: '1 source', scoring: false, ai: false, depts: false, categories: '~30' },
  { name: 'Hunter.io', price: '49', enrichments: '1 source', scoring: false, ai: false, depts: false, categories: '0' },
  { name: 'Lusha', price: '36', enrichments: '1 source', scoring: false, ai: false, depts: false, categories: '0' },
  { name: 'Snov.io', price: '39', enrichments: '1 source', scoring: false, ai: false, depts: false, categories: '~20' },
  { name: 'Dropcontact', price: '24', enrichments: '1 source', scoring: false, ai: false, depts: false, categories: '0' },
];

export default function LandingPage() {
  return (
    <div className="dark min-h-screen bg-[#08080c] text-white overflow-hidden" style={{'--c-bg-base':'9 9 11','--c-bg-card':'17 17 20','--c-bg-elevated':'30 30 36','--c-bg-alt':'13 13 16','--c-border':'30 30 36','--c-border-hover':'39 39 42','--c-text-primary':'250 250 250','--c-text-secondary':'161 161 170','--c-text-tertiary':'113 113 122','--c-text-muted':'82 82 91','--c-text-faint':'63 63 70'}}>
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
            <Link href="#vs-concurrence" className="text-sm text-zinc-500 hover:text-white transition">vs Concurrence</Link>
            <Link href="#pricing" className="text-sm text-zinc-500 hover:text-white transition">Pricing</Link>
            <Link href="#faq" className="text-sm text-zinc-500 hover:text-white transition">FAQ</Link>
          </div>
          <div className="flex items-center gap-3">
            <NavAuth />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-28 px-6 overflow-hidden">
        {/* Interactive particle background */}
        <MouseParticles />
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-[5%] w-64 h-64 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-zinc-400 mb-8 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            5x moins cher qu&apos;Apollo &mdash; 7 sources intégrées en 1 clic
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-8">
            <span className="bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent">Prospectez avec</span>
            <br />
            <TypewriterText />
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-6 leading-relaxed">
            L&apos;agrégateur de prospection B2B qui combine <strong className="text-zinc-200">7 sources d&apos;enrichissement</strong> (Apollo, Serper, Enrichly, Anymail, Findymail) en une seule recherche.
            Scoring de confiance IA, 150+ catégories, 101 départements.
          </p>
          <p className="text-sm text-violet-400 font-semibold mb-10">
            À partir de 49&euro;/mois &mdash; là où Apollo facture 99&euro; pour une seule source.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <HeroCTA />
            <Link
              href="#vs-concurrence"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1"
            >
              Comparer avec la concurrence
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Source logos ribbon */}
          <div className="mt-14 flex items-center justify-center gap-6 flex-wrap">
            <span className="text-[11px] text-zinc-600 uppercase tracking-wider">Sources intégrées :</span>
            {['Google Places', 'Apollo.io', 'Serper', 'Enrichly', 'Anymail Finder', 'Findymail', 'Scraping'].map((s) => (
              <span key={s} className="text-xs text-zinc-500 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02]">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <InteractiveDemo />

      {/* Why an aggregator */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-violet-400 mb-3">Pourquoi un agrégateur ?</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Un outil ne suffit pas. Nous les combinons tous.
            </h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              Apollo trouve 40% des emails. Hunter en trouve 30% d&apos;autres. Snov.io complète le reste.
              En utilisant <strong className="text-zinc-300">une seule source, vous passez à côté de 60% de vos leads</strong>.
              Prospectia interroge 7 sources en cascade pour maximiser votre taux de couverture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.06] bg-[#111114]/80 text-center">
              <div className="text-5xl font-bold font-mono bg-gradient-to-b from-red-400 to-red-600 bg-clip-text text-transparent mb-2">~40%</div>
              <p className="text-sm text-zinc-500">Taux de couverture moyen avec <strong className="text-zinc-400">1 seule source</strong> (Apollo, Hunter, etc.)</p>
            </div>
            <div className="p-6 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-transparent text-center">
              <div className="text-5xl font-bold font-mono bg-gradient-to-b from-violet-400 to-violet-600 bg-clip-text text-transparent mb-2">~85%</div>
              <p className="text-sm text-zinc-500">Taux de couverture avec le <strong className="text-violet-400">waterfall 7 sources</strong> de Prospectia</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/[0.06] bg-[#111114]/80 text-center">
              <div className="text-5xl font-bold font-mono bg-gradient-to-b from-green-400 to-green-600 bg-clip-text text-transparent mb-2">-80%</div>
              <p className="text-sm text-zinc-500">Coût par lead vs. <strong className="text-zinc-400">abonnements séparés</strong> à chaque outil</p>
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
              Ce que vous obtenez pour 49&euro;/mois
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Tout ce que font Apollo, Hunter, Lusha et Snov.io — combiné en une seule plateforme, pour une fraction du prix.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                title: 'Waterfall 7 sources',
                desc: 'Apollo, Serper, Enrichly, Anymail, Findymail, Scraping, Fallback — interrogés en cascade. On s\'arrête au premier email trouvé. Vous ne payez que ce qui est nécessaire.',
                gradient: 'from-violet-500/20 to-indigo-500/20',
                iconBg: 'from-violet-500 to-indigo-600',
              },
              {
                icon: Brain,
                title: 'IA & recherche naturelle',
                desc: 'Décrivez ce que vous cherchez en français : "restaurants italiens à Lyon". Notre IA convertit votre requête en recherche structurée automatiquement.',
                gradient: 'from-indigo-500/20 to-blue-500/20',
                iconBg: 'from-indigo-500 to-blue-600',
              },
              {
                icon: BarChart3,
                title: 'Scoring de confiance',
                desc: 'Chaque email reçoit un score de fiabilité : Vérifié (domaine exact), Apollo (base de données), Probable (pattern deviné). Sachez exactement à quoi vous fier.',
                gradient: 'from-blue-500/20 to-cyan-500/20',
                iconBg: 'from-blue-500 to-cyan-600',
              },
              {
                icon: Database,
                title: '150+ catégories B2B',
                desc: '12 secteurs B2B et 3 groupes copropriété. La base de données la plus complète pour la prospection en France — hôtellerie, santé, BTP, auto, tech, juridique...',
                gradient: 'from-cyan-500/20 to-teal-500/20',
                iconBg: 'from-cyan-500 to-teal-600',
              },
              {
                icon: Globe,
                title: '101 départements couverts',
                desc: 'France entière : 96 départements métropolitains + 5 outre-mer. Sélection par région, par département, ou en un clic.',
                gradient: 'from-teal-500/20 to-green-500/20',
                iconBg: 'from-teal-500 to-green-600',
              },
              {
                icon: Download,
                title: 'Export CSV & Zoho CRM',
                desc: 'Exportez en CSV standard ou au format Zoho CRM (Last Name, Company, Email, Phone). Prêt pour votre campagne d\'outreach en 1 clic.',
                gradient: 'from-green-500/20 to-emerald-500/20',
                iconBg: 'from-green-500 to-emerald-600',
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
              3 étapes, des centaines de leads qualifiés
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Pas de formulaires complexes. Décrivez ce que vous cherchez ou sélectionnez vos critères. Prospectia fait le reste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Search,
                title: 'Recherchez en langage naturel',
                desc: 'Tapez "garages auto dans le Var" ou sélectionnez départements et catégories. L\'IA comprend votre intention et lance la recherche Google Places.',
                gradient: 'from-violet-500 to-indigo-600',
              },
              {
                step: '02',
                icon: Zap,
                title: 'Enrichissement waterfall automatique',
                desc: 'Prospectia interroge 7 sources en cascade : Scraping, Serper, Apollo, Enrichly, Anymail, Findymail. S\'arrête au premier email trouvé, avec un score de confiance.',
                gradient: 'from-indigo-500 to-blue-600',
              },
              {
                step: '03',
                icon: Download,
                title: 'Exportez et prospectez',
                desc: 'Filtrez par score, département ou catégorie. Exportez en CSV ou format Zoho CRM. Vos leads sont prêts pour l\'outreach en quelques secondes.',
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
              7 sources. 1 clic. Le meilleur email avec score de confiance.
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl">
              Avec Apollo seul, vous payez 99&euro;/mois pour une seule source.
              Avec Prospectia, vous accédez à <strong className="text-zinc-300">7 sources pour 49&euro;/mois</strong> — et chaque email reçoit un niveau de confiance.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {[
              { name: 'Scraping', tag: 'Gratuit', score: '100%', color: 'from-green-500/20 to-emerald-500/20 border-green-500/20', dot: 'bg-green-400' },
              { name: 'Serper', tag: '$0.002/req', score: '90%', color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/20', dot: 'bg-yellow-400' },
              { name: 'Apollo', tag: 'Inclus', score: '85%', color: 'from-orange-500/20 to-red-500/20 border-orange-500/20', dot: 'bg-orange-400' },
              { name: 'Enrichly', tag: 'Inclus', score: '80%', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/20', dot: 'bg-cyan-400' },
              { name: 'Anymail', tag: 'Inclus', score: '75%', color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/20', dot: 'bg-teal-400' },
              { name: 'Findymail', tag: 'Inclus', score: '70%', color: 'from-sky-500/20 to-indigo-500/20 border-sky-500/20', dot: 'bg-sky-400' },
              { name: 'Fallback', tag: 'Pattern', score: '30%', color: 'from-zinc-500/20 to-zinc-600/20 border-zinc-500/20', dot: 'bg-zinc-400' },
            ].map((s, i) => (
              <div key={s.name} className={`relative p-4 rounded-xl bg-gradient-to-br ${s.color} border border-white/[0.06]`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className="text-[10px] font-mono text-zinc-500">0{i + 1}</span>
                </div>
                <h4 className="text-sm font-semibold mb-1">{s.name}</h4>
                <span className="text-[10px] text-zinc-500 block">{s.tag}</span>
                <span className="text-[10px] text-zinc-600 block mt-1">Confiance : {s.score}</span>
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
              { value: '150+', label: 'Catégories', sub: 'B2B & Copropriété' },
              { value: '101', label: 'Départements', sub: 'France entière + DOM-TOM' },
              { value: '7', label: 'Sources', sub: 'Enrichissement waterfall' },
              { value: '49€', label: 'vs 99€', sub: 'Apollo.io seul' },
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

      {/* Email Verification Feature */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 mb-6">
                <Shield size={12} />
                Enterprise
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Vérifiez vos emails en masse avant d&apos;envoyer
              </h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                Importez votre base de données emails et vérifiez instantanément lesquels sont valides.
                Plus besoin d&apos;envoyer pour savoir — notre vérification SMTP détecte les faux emails <strong className="text-zinc-200">sans envoyer un seul message</strong>.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: Mail,
                    title: 'Vérification SMTP silencieuse',
                    desc: 'On vérifie si la boîte mail existe via le protocole SMTP, sans envoyer d\'email. Aucun risque de bounce ou de blacklisting.',
                  },
                  {
                    icon: Download,
                    title: 'Import CSV en masse',
                    desc: 'Importez des milliers d\'emails d\'un coup. Résultats en quelques minutes avec statut : valide, invalide, catch-all ou inconnu.',
                  },
                  {
                    icon: Shield,
                    title: 'Protégez votre réputation',
                    desc: 'Un taux de bounce >5% peut blacklister votre domaine. Nettoyez votre base avant chaque campagne.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon size={16} className="text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">{item.title}</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Visual mock */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/10 via-transparent to-violet-500/10 rounded-3xl blur-2xl pointer-events-none" />
              <div className="relative rounded-2xl border border-white/[0.08] bg-[#0c0c12] p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Mail size={14} className="text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Vérification emails</div>
                      <div className="text-[10px] text-zinc-600">2 847 emails importés</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-600 px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06]">CSV importé</div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">Progression</span>
                    <span className="text-emerald-400 font-mono">100%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400" style={{width: '100%'}} />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Valides', value: '2 103', pct: '73.8%', color: 'text-green-400', bg: 'bg-green-500/10' },
                    { label: 'Invalides', value: '412', pct: '14.5%', color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: 'Catch-all', value: '281', pct: '9.9%', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'Inconnus', value: '51', pct: '1.8%', color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
                  ].map((stat) => (
                    <div key={stat.label} className={`p-3 rounded-xl ${stat.bg} border border-white/[0.04] text-center`}>
                      <div className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</div>
                      <div className="text-[10px] text-zinc-600 mt-0.5">{stat.label}</div>
                      <div className={`text-[9px] font-mono mt-0.5 ${stat.color}/60`}>{stat.pct}</div>
                    </div>
                  ))}
                </div>

                {/* Sample rows */}
                <div className="space-y-1.5">
                  {[
                    { email: 'contact@dupont-btp.fr', status: 'Valide', color: 'text-green-400', dot: 'bg-green-400' },
                    { email: 'info@garage-martin.com', status: 'Valide', color: 'text-green-400', dot: 'bg-green-400' },
                    { email: 'direction@inexistant.fr', status: 'Invalide', color: 'text-red-400', dot: 'bg-red-400' },
                    { email: 'contact@hotel-riviera.fr', status: 'Catch-all', color: 'text-amber-400', dot: 'bg-amber-400' },
                  ].map((row) => (
                    <div key={row.email} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-xs text-zinc-400 font-mono">{row.email}</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${row.dot}`} />
                        <span className={`text-[10px] font-medium ${row.color}`}>{row.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] text-zinc-600">Coût : ~0,0005€/email via MillionVerifier</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Exporter les valides →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Competitor Comparison */}
      <section id="vs-concurrence" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-violet-400 mb-3">Comparatif détaillé</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Prospectia vs. la concurrence
            </h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              Pourquoi payer 99&euro;/mois pour Apollo, 49&euro; pour Hunter, ET 39&euro; pour Snov.io
              quand Prospectia réunit tout en une seule plateforme ?
            </p>
          </div>

          <div className="p-1 rounded-2xl bg-gradient-to-b from-violet-500/20 to-transparent">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0c0c12] border border-white/[0.04]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left py-4 px-4 font-medium text-zinc-600 min-w-[140px]"></th>
                      <th className="text-center py-4 px-4 min-w-[120px]">
                        <div className="font-bold text-violet-400 text-base">Prospectia</div>
                        <div className="text-violet-400/60 text-xs mt-0.5">49&euro;/mois</div>
                      </th>
                      {COMPETITORS.map((c) => (
                        <th key={c.name} className="text-center py-4 px-4 font-medium text-zinc-600 min-w-[100px]">
                          <div>{c.name}</div>
                          <div className="text-zinc-700 text-xs mt-0.5">{c.price}&euro;/mois</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Sources d\'enrichissement', prospectia: '7 sources', key: 'enrichments' },
                      { label: 'Scoring de confiance', prospectia: true, key: 'scoring' },
                      { label: 'Recherche IA (langage naturel)', prospectia: true, key: 'ai' },
                      { label: '101 départements FR', prospectia: true, key: 'depts' },
                      { label: 'Catégories B2B', prospectia: '150+', key: 'categories' },
                      { label: 'Google Places intégré', prospectia: true, key: 'google', competitors: [false, false, false, false, false] },
                      { label: 'Export Zoho CRM', prospectia: true, key: 'zoho', competitors: [false, false, false, false, false] },
                    ].map((row) => (
                      <tr key={row.label} className="border-b border-white/[0.04]">
                        <td className="py-3.5 px-4 text-zinc-400">{row.label}</td>
                        <td className="py-3.5 px-4 text-center">
                          {typeof row.prospectia === 'boolean' ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-500/20">
                              <Check size={14} className="text-violet-400" />
                            </span>
                          ) : (
                            <span className="font-semibold text-white">{row.prospectia}</span>
                          )}
                        </td>
                        {COMPETITORS.map((c) => {
                          const val = row.competitors ? row.competitors[COMPETITORS.indexOf(c)] : c[row.key];
                          return (
                            <td key={c.name} className="py-3.5 px-4 text-center">
                              {typeof val === 'boolean' ? (
                                val ? <Check size={14} className="text-zinc-500 mx-auto" /> : <X size={14} className="text-zinc-800 mx-auto" />
                              ) : (
                                <span className="text-zinc-600">{val}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {/* Price row highlighted */}
                    <tr className="border-t-2 border-white/[0.08]">
                      <td className="py-4 px-4 text-zinc-300 font-semibold">Prix mensuel</td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-2xl font-bold text-violet-400">49&euro;</span>
                      </td>
                      {COMPETITORS.map((c) => (
                        <td key={c.name} className="py-4 px-4 text-center">
                          <span className="text-lg text-zinc-600">{c.price}&euro;</span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Economic argument */}
          <div className="mt-10 p-6 rounded-2xl border border-green-500/20 bg-green-500/[0.04]">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <TrendingDown size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Le calcul est simple</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Apollo (99&euro;) + Hunter (49&euro;) + Snov.io (39&euro;) = <strong className="text-zinc-200">187&euro;/mois</strong> pour 3 sources séparées, sans déduplication, sans scoring.
                  <br />
                  Prospectia Pro = <strong className="text-violet-400">49&euro;/mois</strong> pour 7 sources intégrées, waterfall automatique, scoring de confiance IA, et 150+ catégories.
                  <br />
                  <span className="text-green-400 font-semibold">Économie : 138&euro;/mois, soit 1&thinsp;656&euro;/an.</span>
                </p>
              </div>
            </div>
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
              Pas de crédits cachés. Pas de markup sur les API. 7 sources pour le prix d&apos;une seule chez la concurrence.
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
                Le plus populaire
              </div>
              <h3 className="text-lg font-semibold mb-1">{PLANS.pro.name}</h3>
              <p className="text-sm text-zinc-500 mb-2">Pour les équipes commerciales</p>
              <p className="text-xs text-green-400 font-medium mb-4">5x moins cher qu&apos;Apollo</p>
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
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* Final CTA */}
      <section className="relative py-28 px-6 border-t border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/[0.08] via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Arrêtez de payer 3 outils. Passez à l&apos;agrégateur.
          </h2>
          <p className="text-zinc-500 text-lg mb-3 max-w-xl mx-auto">
            7 sources, scoring IA, 150+ catégories, 101 départements.
          </p>
          <p className="text-sm text-violet-400 font-semibold mb-8">
            Créez votre compte en 30 secondes &mdash; aucune carte bancaire requise.
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
            <Link href="/cgu" className="hover:text-zinc-400 transition">CGU</Link>
            <Link href="/confidentialite" className="hover:text-zinc-400 transition">Confidentialité</Link>
            <Link href="/rgpd" className="hover:text-zinc-400 transition">RGPD</Link>
            <Link href="/opt-out" className="hover:text-zinc-400 transition">Opt-out / Suppression</Link>
          </div>
          <p className="text-[11px] text-zinc-700">
            &copy; 2026 Prospectia.ai
          </p>
        </div>
      </footer>
    </div>
  );
}
