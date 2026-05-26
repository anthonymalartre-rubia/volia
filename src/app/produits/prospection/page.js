// ─────────────────────────────────────────────────────────────────────
// /produits/prospection — page produit Volia Prospection (LIVE)
// ─────────────────────────────────────────────────────────────────────
// Accent : violet/indigo (couleur signature Volia).
// Position : module mère, le seul actuellement payant à part entière.
// ─────────────────────────────────────────────────────────────────────

import { Search, Mail, Download, Phone, Check, X, ArrowRight, TrendingUp, Zap, Building2 } from 'lucide-react';
import ProductPageLayout from '@/components/ProductPageLayout';
import MotionInView from '@/components/MotionInView';
import { breadcrumbSchema, productSchema } from '@/lib/seo-helpers';

const SITE_URL = 'https://volia.fr';
const PAGE_URL = `${SITE_URL}/produits/prospection`;

export const metadata = {
  title: 'Volia Prospection — 1 000 prospects qualifiés en France, en 30 secondes',
  description:
    "L'annuaire B2B France le plus complet : email pro + téléphone, 287k+ entreprises, 150+ secteurs, 101 départements. Stop Apollo à 99$/mois, démarre Volia à 19€. RGPD by default.",
  alternates: { canonical: PAGE_URL },
  keywords: [
    'prospection b2b France',
    'trouver email entreprise',
    'trouver téléphone entreprise',
    'enrichissement email b2b',
    'scraping email France',
    'annuaire b2b France',
    'Volia Prospection',
    'leads B2B France',
    'alternative Apollo France',
    'alternative Hunter',
  ],
  openGraph: {
    title: 'Volia Prospection — 1 000 prospects France en 30 secondes, à 19 €/mois',
    description:
      "Email pro + téléphone de 287k+ entreprises françaises. 150+ secteurs, 101 départements, scraping waterfall. L'alternative française à Apollo, Hunter, Lemlist. RGPD inclus.",
    url: PAGE_URL,
    type: 'website',
  },
};

// ─────────────────────────────────────────────────────────────────────
// Mockup hero : faux résultats de recherche (statique, pas interactif)
// ─────────────────────────────────────────────────────────────────────
function HeroMockup() {
  const rows = [
    { name: 'La Bonne Table', email: 'contact@labonnetable.fr', phone: '01 42 33 45 67', score: 'Vérifié', color: 'emerald', avatar: '🍽️' },
    { name: 'Pasta Roma', email: 'info@pastaroma.fr', phone: '01 48 06 12 89', score: 'Vérifié', color: 'emerald', avatar: '🍝' },
    { name: 'Boulangerie Maison', email: 'bonjour@boulangerie-m.fr', phone: '01 45 22 78 03', score: 'Google', color: 'amber', avatar: '🥖' },
    { name: 'Le Petit Bistrot', email: 'reservation@petitbistrot.fr', phone: '01 43 87 19 56', score: 'Vérifié', color: 'emerald', avatar: '🍷' },
    { name: 'Sushi Lounge Paris', email: 'contact@sushilounge.fr', phone: '01 56 34 21 78', score: 'Vérifié', color: 'emerald', avatar: '🍱' },
  ];
  return (
    <>
      <div className="absolute -top-4 -left-4 z-20 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 shadow-md flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold text-emerald-700">Recherche en direct</span>
      </div>

      <div className="relative rounded-2xl bg-white border border-line shadow-2xl shadow-violet-500/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="ml-3 text-xs font-mono text-content-tertiary">volia.fr/dashboard</div>
          </div>
          <div className="text-xs px-2 py-1 rounded-md bg-violet-100 text-violet-700 font-semibold">234 résultats</div>
        </div>

        <div className="px-5 py-3 border-b border-line flex items-center gap-3">
          <Search size={14} className="text-violet-500" />
          <span className="text-sm text-content-secondary font-medium">Restaurants · Paris (75)</span>
        </div>

        <div className="divide-y divide-line">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 hover:bg-violet-50/50 transition-colors animate-in fade-in slide-in-from-right-4"
              style={{ animationDelay: `${300 + i * 100}ms`, animationDuration: '600ms', animationFillMode: 'both' }}
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-lg flex-shrink-0">
                {row.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-content-primary truncate">{row.name}</div>
                <div className="flex items-center gap-3 mt-0.5">
                  <div className="flex items-center gap-1 text-xs text-content-tertiary font-mono truncate min-w-0">
                    <Mail size={10} className="flex-shrink-0 text-violet-500" />
                    <span className="truncate">{row.email}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-xs text-content-tertiary font-mono flex-shrink-0">
                    <Phone size={10} className="flex-shrink-0 text-violet-500" />
                    <span>{row.phone}</span>
                  </div>
                </div>
              </div>
              <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex-shrink-0 ${
                row.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {row.score}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-line bg-surface-elevated/30">
          <span className="text-xs text-content-tertiary">+ 229 autres résultats</span>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-700">
            <Download size={12} />
            Export CSV
          </div>
        </div>
      </div>

      <div className="hidden lg:flex absolute -bottom-6 -right-6 z-20 px-4 py-3 rounded-xl bg-white border border-line shadow-xl items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <Mail size={18} className="text-white" />
        </div>
        <div>
          <div className="text-xs text-content-tertiary">Emails + tels trouvés</div>
          <div className="text-lg font-bold text-content-primary tabular-nums">+ 192</div>
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
    { value: '287 459', label: 'entreprises', sub: 'dans la base Volia', color: 'from-violet-600 via-indigo-600 to-violet-700' },
    { value: '101', label: 'départements', sub: 'France métropole + DOM-TOM', color: 'from-indigo-600 to-blue-700' },
    { value: '150+', label: 'secteurs', sub: '12 grandes verticales B2B', color: 'from-blue-600 to-cyan-700' },
    { value: '78%', label: 'taux email', sub: 'trouvé en moyenne', color: 'from-emerald-600 to-teal-700' },
  ];
  return (
    <section className="relative py-20 px-4 sm:px-6 border-t border-line overflow-hidden bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/40">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        <MotionInView>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-600"></span>
              </span>
              La base, en temps réel
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
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              Conçu pour qui ?
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              3 profils, 1 outil, des résultats.
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              Volia s&apos;adapte à votre rythme : freelance solo, SDR en équipe, ou fondateur d&apos;agence. Voici 3 histoires vraies.
            </p>
          </div>
        </MotionInView>

        {/* Bento : 1 grande card à gauche (Sarah featured) + 2 petites empilées à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Card 1 — Sarah (large featured) */}
          <MotionInView delay={100} className="lg:col-span-2 lg:row-span-2">
            <div className="group relative h-full p-8 sm:p-10 rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-violet-200/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                Cas client phare
              </div>

              <div className="relative">
                <div className="flex items-center gap-4 mb-6 mt-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 ring-4 ring-white shadow-lg flex items-center justify-center text-white text-xl font-bold">
                    SM
                  </div>
                  <div>
                    <div className="text-lg font-bold text-content-primary">Sarah, freelance design</div>
                    <div className="text-sm text-content-tertiary">prospecte des agences créatives</div>
                  </div>
                </div>

                <blockquote className="text-xl sm:text-2xl font-medium text-content-primary leading-snug mb-8">
                  <span className="text-violet-400 text-3xl leading-none">“</span>
                  Avec Volia, je trouve <span className="bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent font-bold">50 agences à pitcher par semaine</span>. Mon TJM a augmenté de <span className="bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent font-bold">40 % en 3 mois</span>.
                  <span className="text-violet-400 text-3xl leading-none">”</span>
                </blockquote>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-violet-200/50">
                  {[
                    { v: '50', l: 'prospects/semaine' },
                    { v: '0 €', l: 'd’engagement' },
                    { v: '5 min', l: 'par jour' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold font-mono bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent">{stat.v}</div>
                      <div className="text-[11px] text-content-tertiary mt-1">{stat.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MotionInView>

          {/* Card 2 — Marc (small top right) */}
          <MotionInView delay={200}>
            <div className="group h-full p-7 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 ring-2 ring-white shadow-md flex items-center justify-center text-white text-sm font-bold">
                  ML
                </div>
                <div>
                  <div className="text-sm font-bold text-content-primary">Marc, SDR chez agence web</div>
                  <div className="text-[11px] text-content-tertiary">prospecte TPE/PME locales</div>
                </div>
              </div>
              <blockquote className="text-sm text-content-primary leading-relaxed mb-5">
                <span className="text-blue-400">“</span>
                Apollo coûtait <span className="font-semibold">99 $/mois pour 40 %</span> de couverture France. Volia c&apos;est <span className="font-bold text-emerald-700">19 € avec 78 %</span>.
                <span className="text-blue-400">”</span>
              </blockquote>
              <div className="flex items-center gap-2 text-[11px] text-blue-700 font-semibold">
                <TrendingUp size={12} />
                +95 % de couverture, -80 % de coût
              </div>
            </div>
          </MotionInView>

          {/* Card 3 — Tom (small bottom right) */}
          <MotionInView delay={300}>
            <div className="group h-full p-7 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 ring-2 ring-white shadow-md flex items-center justify-center text-white text-sm font-bold">
                  TF
                </div>
                <div>
                  <div className="text-sm font-bold text-content-primary">Tom, fondateur agence immo</div>
                  <div className="text-[11px] text-content-tertiary">prospecte des syndics</div>
                </div>
              </div>
              <blockquote className="text-sm text-content-primary leading-relaxed mb-5">
                <span className="text-emerald-400">“</span>
                <span className="font-bold text-emerald-700">1 000 emails de syndics</span> qualifiés par mois pour 19 €. Mes commerciaux closent <span className="font-semibold">3× plus</span>.
                <span className="text-emerald-400">”</span>
              </blockquote>
              <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
                <Building2 size={12} />
                Pipeline x3 en 8 semaines
              </div>
            </div>
          </MotionInView>
        </div>

        <MotionInView delay={400}>
          <div className="text-center mt-12">
            <p className="text-sm text-content-tertiary">
              Quel que soit votre métier, si vous vendez en B2B France, Volia vous fait gagner du temps.
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
    '8 h/jour sur LinkedIn à chercher des contacts',
    'Apollo + Hunter + Lemlist = 187 $/mois',
    '40 % de couverture France (concurrents US-first)',
    'Pas de téléphone, juste l’email',
    'Export CSV bricolé, format Excel maison',
  ];
  const after = [
    '30 secondes pour trouver 1 000 prospects',
    '19 €/mois tout inclus',
    '78 % de couverture France (#1 du marché)',
    'Email + téléphone à chaque ligne',
    'Export 1-clic CSV / HubSpot / Zoho / Salesforce',
  ];
  return (
    <section className="py-24 px-4 sm:px-6 border-t border-line bg-gradient-to-b from-white via-violet-50/30 to-white">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              La différence Volia
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Sans Volia vs. Avec Volia.
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              Si vous reconnaissez la colonne de gauche, on a écrit Volia pour vous.
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
                <h3 className="text-xl sm:text-2xl font-bold text-content-primary">La prospection à l&apos;ancienne</h3>
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
                <h3 className="text-xl sm:text-2xl font-bold text-content-primary">La prospection à la Volia</h3>
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
              href="/signup"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all text-base"
            >
              <Zap size={18} className="text-amber-200" />
              <span>Économisez 168 €/mois + 30 h/semaine</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="mt-3 text-xs text-content-tertiary">
              Sans carte bancaire · 100 prospects gratuits · Annulation 1 clic
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
  headline: 'trouver vos prospects B2B',
  subline: 'Une couverture France totale, un enrichissement multi-sources, et un scoring qui vous dit exactement quoi croire et quoi prioriser.',
  items: [
    {
      icon: 'Layers', featured: true,
      title: 'Enrichissement waterfall multi-sources',
      desc: 'Scraping intelligent du site web → recherche Google via Serper → fallback patterns (contact@, info@…). On s\'arrête dès qu\'un email est trouvé. Aucun crédit gaspillé, aucun appel API inutile. C\'est pour ça qu\'on tient 19 €/mois quand la concurrence est à 49 €+.',
    },
    {
      icon: 'Brain',
      title: 'Recherche en langage naturel',
      desc: 'Décrivez votre cible en français ("restaurants gastronomiques Bordeaux", "syndics de copropriété PACA"), Claude la traduit en requête Google Places en 2 secondes.',
    },
    {
      icon: 'BarChart3',
      title: 'Scoring de confiance par lead',
      desc: 'Chaque email reçoit un score : Vérifié (trouvé sur le site, ~85 % deliverability), Google (extrait d\'une recherche, ~70 %), Probable (pattern deviné, ~50 %). Vous savez quoi prioriser pour vos campagnes premium.',
    },
    {
      icon: 'Database',
      title: '150+ secteurs B2B couverts',
      desc: '12 grands groupes (restauration, BTP, immobilier, santé, juridique, hôtellerie, transport, finance, éducation…) + 3 groupes copropriété. Si votre cible vend en B2B France, on l\'a déjà mappée.',
    },
    {
      icon: 'Globe',
      title: '101 départements français',
      desc: 'Métropole (96) + outre-mer (5), organisés en 14 régions. Filtrage par région, département ou multi-départements. Couverture France totale, pas de zone blanche.',
    },
    {
      icon: 'Download', wide: true,
      title: 'Export CSV, HubSpot, Zoho, Salesforce — en 1 clic',
      desc: 'Format standard ou pré-mappé pour vos CRM préférés. Champs : nom, adresse, téléphone, email, score, site web, note Google, nombre d\'avis. Pas d\'ETL, pas de copier-coller, pas de format Excel maison.',
    },
  ],
};

const HOW_IT_WORKS = [
  {
    icon: 'Search',
    title: '1. Choisissez secteur et zone',
    desc: 'Sélectionnez un ou plusieurs secteurs (150+ catégories) et la zone (régions, départements ou ville). Ou tapez en langage naturel, Claude se charge du reste.',
  },
  {
    icon: 'Sparkles',
    title: '2. Volia cherche pour vous',
    desc: 'L\'enrichissement waterfall s\'enchaîne automatiquement : Google Places → site web → Google → patterns. 234 résultats en 30 secondes, avec emails et téléphones scorés.',
  },
  {
    icon: 'Download',
    title: '3. Exportez et contactez',
    desc: 'CSV propre, prêt pour votre CRM ou pour Volia Campagnes en 1 clic. Pas de copier-coller, pas d\'ETL, pas d\'erreur de mapping. Vous gardez vos données pour toujours.',
  },
];

const FAQ = [
  {
    q: 'Combien de prospects puis-je extraire par mois ?',
    a: 'Cela dépend de votre plan : Starter (gratuit) 100 prospects, Solo 19 €/mois pour 1 000, Pro 49 €/mois pour 5 000, Business 99 €/mois pour 10 000. Pas d\'engagement, vous changez de plan quand vous voulez en 1 clic.',
  },
  {
    q: 'Comment Volia peut-il être 5× moins cher qu\'Apollo ou Hunter ?',
    a: 'Trois raisons : (1) on est une équipe française lean, pas une licorne US avec 800 commerciaux à financer ; (2) notre waterfall s\'arrête dès qu\'un email est trouvé, zéro crédit gaspillé sur des sources premium inutiles ; (3) on couvre les TPE/PME françaises, pas les Fortune 500 — c\'est techniquement plus simple, donc moins cher pour vous.',
  },
  {
    q: 'C\'est conforme RGPD ?',
    a: 'Oui, by default. Volia respecte les recommandations CNIL pour la prospection B2B : intérêt légitime, opt-out clair sur chaque email, suppression sur demande via /opt-out, blocklist permanente. Un filtre RGPD bloque par défaut 28 domaines d\'emails personnels (@gmail, @hotmail…) pour ne contacter que des emails professionnels. Hébergement EU, code Made in France.',
  },
  {
    q: 'Je peux exporter vers HubSpot, Salesforce, Pipedrive ?',
    a: 'Oui. Export CSV standard (compatible HubSpot, Salesforce, Pipedrive, Brevo, Mailjet…) et export pré-mappé Zoho CRM. Le mapping des champs est automatique : nom, adresse, téléphone, email, site web, score, note Google. Bientôt : intégration native via API + webhook Zapier.',
  },
  {
    q: 'Quelle est la précision des emails trouvés ?',
    a: 'Variable selon la source — c\'est pour ça qu\'on affiche le score. "Vérifié" (~85 % de délivrabilité) : email trouvé directement sur le site officiel. "Google" (~70 %) : extrait d\'une recherche Google avec contexte entreprise. "Probable" (~50 %) : pattern deviné (contact@nom-domaine.fr). À combiner avec une vérification SMTP avant envoi pour les volumes importants.',
  },
  {
    q: 'Quelles catégories sont couvertes ?',
    a: 'Plus de 150 catégories réparties en 12 groupes B2B : restauration (15+ sous-catégories), commerce (épicerie, vêtements, sport…), services (coiffure, beauté, garage…), BTP (plombier, électricien, peintre…), santé, juridique, hôtellerie, immobilier, transport, finance, éducation, copropriété. Vous ne trouvez pas la vôtre ? On l\'ajoute sur demande sous 48 h.',
  },
];

// ─────────────────────────────────────────────────────────────────────
// JSON-LD
// ─────────────────────────────────────────────────────────────────────
const breadcrumbs = breadcrumbSchema([
  { label: 'Accueil', href: '/' },
  { label: 'Produits', href: '/produits/prospection' },
  { label: 'Prospection' },
]);

const product = {
  '@context': 'https://schema.org',
  ...productSchema({
    name: 'Volia Prospection',
    description: "1 000 prospects qualifiés en France en 30 secondes. Email pro + téléphone, 287k+ entreprises, 150+ secteurs, 101 départements. À partir de 19 €/mois, RGPD inclus.",
    url: PAGE_URL,
    priceFrom: 19,
  }),
};

export default function ProspectionProductPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />

      <ProductPageLayout
        module="prospection"
        status="LIVE"
        hero={{
          h1Before: 'Trouvez 1 000 prospects qualifiés',
          h1Highlight: 'en France.',
          h1After: 'En 30 secondes.',
          subtitle: (
            <>
              Stop la prospection à 8 h/jour sur LinkedIn. Volia extrait{' '}
              <strong className="text-content-primary font-semibold">emails pros + téléphones</strong> de{' '}
              <strong className="text-content-primary font-semibold">287 k+ entreprises françaises</strong>, sur 150 secteurs et 101 départements. À partir de{' '}
              <strong className="text-content-primary font-semibold">19 €/mois</strong> — soit{' '}
              <strong className="text-emerald-700 font-semibold">5× moins cher qu&apos;Apollo</strong>.
            </>
          ),
          ctaPrimary: { label: 'Démarrer gratuitement', href: '/signup' },
          ctaSecondary: { label: 'Voir les tarifs', href: '/#pricing' },
          trust: [
            (<><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sans carte bancaire</>),
            'Starter gratuit à vie',
            <span key="rgpd" className="font-medium">Conforme RGPD</span>,
          ],
          mockup: <HeroMockup />,
        }}
        afterHero={<LiveStatsBanner />}
        features={FEATURES}
        afterFeatures={<UseCasesSection />}
        howItWorks={HOW_IT_WORKS}
        crossSell={{
          subtitle: 'Vos prospects extraits filent directement dans Campagnes pour l\'envoi, puis dans le CRM (à la sortie) pour le suivi commercial. Zéro friction.',
          otherModules: [
            { module: 'campagnes', direction: 'out', desc: 'Lancez des séquences email + SMS sur vos prospects extraits. Templates inclus, relances auto, stats temps réel.', cta: 'Découvrir Campagnes' },
            { module: 'crm', direction: 'out', desc: 'Pipeline Kanban natif Volia pour suivre vos deals jusqu\'au closing. Disponible bientôt.', cta: 'Rejoindre la beta' },
          ],
        }}
        pricing={{
          label: 'Inclus dans tous les plans, dès le Starter gratuit',
          subtext: 'Starter 0 € (100 prospects/mois) · Solo 19 € (1k) · Pro 49 € (5k) · Business 99 € (10k). Pas d\'engagement, annulation 1 clic.',
          cta: 'Voir les tarifs complets',
          ctaHref: '/#pricing',
        }}
        beforeFaq={<BeforeAfterSection />}
        faq={FAQ}
        finalCta={{
          title: 'Prêt à trouver vos premiers prospects ?',
          subtitle: '100 prospects gratuits pour tester, sans carte bancaire. Vous gardez tout ce que vous exportez, pour toujours.',
          primary: { label: 'Démarrer gratuitement', href: '/signup' },
          secondary: { label: 'Voir les tarifs', href: '/#pricing' },
          trust: 'Sans carte bancaire · 100 prospects gratuits · Annulation en 1 clic',
        }}
      />
    </>
  );
}
