'use client';

// ─────────────────────────────────────────────────────────────────────
// NotreHistoireContent — manifeste Volia "entreprise d'un nouveau genre"
// ─────────────────────────────────────────────────────────────────────
// Voir ./page.js pour le contexte stratégique et les garde-fous.
// Light mode forcé + locale FR. Couleurs : violet/indigo, accents.
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import {
  ArrowRight, ArrowLeft, Sparkles, GitCommit, Bot, User, Wallet,
  Rocket, ShieldCheck, Calendar, Check, X, Mail, Terminal,
  Layers, Flame, MessageSquare, Lightbulb, ChevronRight,
  HeartHandshake, Clock, Eye, Target as TargetIcon, Cpu,
  Zap, Globe, TrendingUp, Network, Compass, MapPin, Infinity as InfinityIcon,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────
// IconGithub — inline SVG (lucide-react n'expose pas Github dans cette version).
// ─────────────────────────────────────────────────────────────────────
function IconGithub({ size = 16, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
import MarketingHeader from '@/components/MarketingHeader';
import MotionInView from '@/components/MotionInView';
import { useForceLightTheme } from '@/lib/use-force-light-theme';
import { useForceLocale } from '@/lib/i18n';

// ─────────────────────────────────────────────────────────────────────
// HERO — Vision-driven, manifeste
// ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden bg-gradient-to-br from-violet-50/70 via-white to-indigo-50/50">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-1/4 w-[40rem] h-[40rem] bg-violet-200/40 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-[32rem] h-[32rem] bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/3 left-1/2 w-[24rem] h-[24rem] bg-fuchsia-200/20 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative max-w-5xl mx-auto z-10">
        <MotionInView>
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-300 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles size={12} />
              Manifeste · Juin 2026
            </span>
          </div>
        </MotionInView>

        <MotionInView delay={100}>
          <h1 className="text-center text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.02] bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
            Volia.
            <br />
            Une entreprise{' '}
            <span className="bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
              d&apos;un nouveau genre.
            </span>
          </h1>
        </MotionInView>

        <MotionInView delay={200}>
          <p className="text-center text-xl sm:text-2xl text-content-secondary leading-relaxed max-w-3xl mx-auto mb-10 font-light">
            Une entreprise pensée autrement : <strong className="text-content-primary font-semibold">l&apos;IA exécute</strong>{' '}
            le travail répétitif, <strong className="text-content-primary font-semibold">l&apos;humain décide</strong>.
          </p>
        </MotionInView>

        {/* Stats inline */}
        <MotionInView delay={300}>
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-10">
            {[
              { value: '101', label: 'départements FR', icon: Zap },
              { value: '4', label: 'modules connectés', icon: Layers },
              { value: '0', label: 'levée', icon: Wallet },
              { value: '1', label: 'humain aux commandes', icon: User },
              { value: 'Marseille', label: '', icon: MapPin, mono: false },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={`${stat.value}-${stat.label}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-violet-200 shadow-sm"
                >
                  <Icon size={14} className="text-violet-600" />
                  <span className={`text-sm font-bold ${stat.mono === false ? '' : 'font-mono tabular-nums'} text-content-primary`}>
                    {stat.value}
                  </span>
                  {stat.label && <span className="text-sm text-content-tertiary">{stat.label}</span>}
                </div>
              );
            })}
          </div>
        </MotionInView>

        {/* Punchline */}
        <MotionInView delay={400}>
          <div className="max-w-3xl mx-auto mb-10">
            <div className="text-center px-6 py-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-violet-200 shadow-sm">
              <p className="text-base sm:text-lg text-content-primary font-medium leading-relaxed">
                <span className="bg-gradient-to-br from-violet-700 to-indigo-700 bg-clip-text text-transparent font-bold">
                  L&apos;IA exécute la corvée. L&apos;humain décide.
                </span>
                <br />
                <span className="text-content-secondary text-sm sm:text-base">
                  Le rôle de l&apos;humain n&apos;est pas de faire la corvée. C&apos;est de décider, créer, et garder le contrôle.
                </span>
              </p>
            </div>
          </div>
        </MotionInView>

        {/* CTAs */}
        <MotionInView delay={500}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup?plan=pro"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/30 hover:shadow-xl transition-all"
            >
              Essayer Volia
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-violet-300 text-violet-700 font-semibold hover:bg-violet-50 transition-all"
            >
              <MessageSquare size={16} />
              Discuter avec le founder
            </Link>
          </div>
        </MotionInView>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 1 — LE CONSTAT (Pourquoi les entreprises traditionnelles sont obsolètes)
// ─────────────────────────────────────────────────────────────────────
function ConstatSection() {
  const compare = [
    {
      icon: User,
      title: 'Entreprise traditionnelle',
      tone: 'bad',
      items: [
        'Des semaines de réunions avant le moindre livrable',
        'La corvée (saisie, recherche, reporting) mange le temps utile',
        'Chaque feature = 4 réunions + 2 sprints',
        'Les meilleurs profils passent leur temps sur des tâches sans valeur',
        'Vélocité limitée par le travail manuel',
      ],
    },
    {
      icon: Cpu,
      title: 'Entreprise pilotée par IA',
      tone: 'good',
      items: [
        'Des agents IA gèrent la corvée, l\'humain pilote',
        'Une suite produit livrée vite, itérée en continu',
        '< 500€/mois de coûts opérationnels',
        'Chaque feature = 1 prompt + 1 review humaine',
        'L\'humain se concentre sur la vision et la décision',
      ],
    },
  ];

  return (
    <section id="constat" className="py-24 px-4 sm:px-6 border-t border-line bg-white">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-200 bg-rose-50 text-rose-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Flame size={12} />
              Le constat
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              En 2026, on peut construire une entreprise autrement.
            </h2>
            <p className="text-content-tertiary text-lg max-w-3xl mx-auto leading-relaxed">
              Nous sommes entrés dans l&apos;ère des <strong className="text-content-secondary">agents IA</strong>. Coder, designer,
              écrire, opérer — une grande partie de la corvée peut désormais être confiée à des agents
              spécialisés, sous supervision humaine. L&apos;humain garde la vision, les décisions et la relation client ;
              l&apos;IA exécute le reste, plus vite.
            </p>
          </div>
        </MotionInView>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {compare.map((col, i) => {
            const Icon = col.icon;
            const isBad = col.tone === 'bad';
            return (
              <MotionInView key={col.title} delay={i * 120}>
                <div
                  className={`h-full p-7 rounded-2xl border-2 ${isBad ? 'border-rose-200 bg-gradient-to-br from-rose-50/70 via-white to-rose-50/30' : 'border-violet-300 bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/50 shadow-lg shadow-violet-500/10'}`}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${isBad ? 'bg-gradient-to-br from-rose-500 to-rose-600' : 'bg-gradient-to-br from-violet-500 to-indigo-600'}`}
                    >
                      <Icon size={22} className="text-white" />
                    </div>
                    <div>
                      <div className={`text-xs uppercase tracking-wider font-bold ${isBad ? 'text-rose-700' : 'text-violet-700'}`}>
                        {isBad ? 'Hier' : 'Aujourd\'hui'}
                      </div>
                      <div className="text-lg font-bold text-content-primary">{col.title}</div>
                    </div>
                  </div>
                  <ul className="space-y-2.5">
                    {col.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        {isBad ? (
                          <X size={16} className="text-rose-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                        ) : (
                          <Check size={16} className="text-violet-600 mt-0.5 flex-shrink-0" strokeWidth={3} />
                        )}
                        <span className="text-sm text-content-secondary">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </MotionInView>
            );
          })}
        </div>

        <MotionInView delay={300}>
          <div className="max-w-3xl mx-auto text-center px-6 py-6 rounded-2xl bg-gradient-to-br from-violet-50 via-white to-indigo-50 border border-violet-200">
            <p className="text-base sm:text-lg text-content-primary font-medium leading-relaxed">
              <TrendingUp size={20} className="inline -mt-1 mr-2 text-violet-600" />
              La <strong className="bg-gradient-to-br from-violet-700 to-indigo-700 bg-clip-text text-transparent">vélocité</strong>{' '}
              est devenue le nouvel avantage compétitif. Pas la taille d&apos;équipe, pas le capital levé. La capacité à itérer
              plus vite que tout le monde.
            </p>
          </div>
        </MotionInView>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 2 — L'EXPÉRIENCE RADICALE
// ─────────────────────────────────────────────────────────────────────
function ExperienceSection() {
  return (
    <section id="experience" className="py-24 px-4 sm:px-6 border-t border-line bg-gradient-to-b from-white via-violet-50/30 to-white">
      <div className="max-w-5xl mx-auto">
        <MotionInView>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Lightbulb size={12} />
              L&apos;expérience radicale
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Volia est construit autrement.
              <br />
              <span className="bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent">L&apos;IA exécute, je décide.</span>
            </h2>
          </div>
        </MotionInView>

        <MotionInView delay={150}>
          <div className="rounded-2xl bg-white border border-violet-200 shadow-xl shadow-violet-500/10 p-8 sm:p-10 mb-10">
            <p className="text-lg text-content-secondary leading-relaxed mb-6">
              Pas un POC. Pas une démo. <strong className="text-content-primary">Un produit en production</strong>, utilisé par
              des entreprises payantes, déployé sur Vercel avec monitoring temps réel, base de données managée, paiements Stripe,
              emails transactionnels, cron jobs automatisés.
            </p>
            <p className="text-lg text-content-secondary leading-relaxed mb-6">
              4 modules connectés (Prospection, Campagnes, CRM, Forms), tout le tissu B2B français accessible, couverture sur 8 pays.
              Une vraie suite produit, livrée vite et itérée en continu — sans armée de développeurs.
            </p>
            <div className="my-8 px-6 py-5 rounded-xl bg-gradient-to-br from-violet-50 via-white to-indigo-50 border-l-4 border-violet-500">
              <p className="text-lg sm:text-xl text-content-primary font-medium italic leading-relaxed">
                «&nbsp;L&apos;IA ne remplace pas l&apos;humain. Elle lui rend son temps pour{' '}
                <strong className="bg-gradient-to-br from-violet-700 to-indigo-700 bg-clip-text text-transparent font-bold">
                  ce qui compte vraiment
                </strong>
                .&nbsp;»
              </p>
            </div>
            <p className="text-base text-content-tertiary leading-relaxed">
              Cette distinction n&apos;est pas cosmétique. Elle change tout : la structure de coûts, la vélocité, la profondeur
              de la vision produit, le rapport au client. Volia n&apos;est pas un SaaS bootstrap classique. C&apos;est un nouveau
              type d&apos;organisation.
            </p>
          </div>
        </MotionInView>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: '0', sub: 'email deviné (100% vérifiés)', icon: Zap, gradient: 'from-violet-600 to-indigo-600' },
            { value: '4', sub: 'modules connectés', icon: Layers, gradient: 'from-indigo-600 to-blue-600' },
            { value: '150+', sub: 'secteurs B2B FR', icon: TargetIcon, gradient: 'from-blue-600 to-cyan-600' },
            { value: '8', sub: 'pays couverts', icon: Globe, gradient: 'from-emerald-600 to-teal-600' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <MotionInView key={s.sub} delay={i * 80}>
                <div className="p-5 rounded-2xl border border-violet-200 bg-white shadow-sm hover:shadow-md transition-shadow text-center">
                  <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3 shadow-md`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className={`text-3xl font-bold font-mono tabular-nums bg-gradient-to-br ${s.gradient} bg-clip-text text-transparent`}>
                    {s.value}
                  </div>
                  <div className="text-xs text-content-tertiary mt-1">{s.sub}</div>
                </div>
              </MotionInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 3 — LA MÉTHODE AGENT-FIRST
// ─────────────────────────────────────────────────────────────────────
function MethodSection() {
  return (
    <section id="methode" className="py-24 px-4 sm:px-6 border-t border-line bg-white">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Network size={12} />
              La méthode agent-first
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Comment ça fonctionne au quotidien.
            </h2>
            <p className="text-content-tertiary text-lg max-w-3xl mx-auto leading-relaxed">
              L&apos;humain n&apos;écrit pas la corvée. Il pitche les besoins, il décide, il valide. Les agents proposent
              l&apos;architecture, le code, les tests, la documentation, le déploiement. La boucle est{' '}
              <strong className="text-content-secondary">de l&apos;ordre de la minute</strong>, pas du sprint.
            </p>
          </div>
        </MotionInView>

        {/* Diptyque rôles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          <MotionInView delay={100}>
            <div className="h-full p-7 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50/40 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Compass size={22} className="text-white" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-violet-600 font-bold">Le chef d&apos;orchestre</div>
                  <div className="text-lg font-bold text-content-primary">Anthony · fondateur</div>
                </div>
              </div>
              <p className="text-sm text-content-secondary mb-4 leading-relaxed">
                Vision, direction, arbitrages. Tout ce qui ne peut pas être délégué :
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  'Vision produit et roadmap stratégique',
                  'Pricing, positionnement, branding',
                  'Architecture des décisions structurantes',
                  'Relation client directe (sales + service)',
                  'Review finale de tout ce qui touche la prod',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={14} className="text-violet-600 mt-0.5 flex-shrink-0" strokeWidth={3} />
                    <span className="text-content-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </MotionInView>

          <MotionInView delay={200}>
            <div className="h-full p-7 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50/40 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center shadow-md">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-indigo-600 font-bold">L&apos;orchestre</div>
                  <div className="text-lg font-bold text-content-primary inline-flex items-center gap-1">
                    <InfinityIcon size={16} className="text-indigo-600" /> agents IA spécialisés
                  </div>
                </div>
              </div>
              <p className="text-sm text-content-secondary mb-4 leading-relaxed">
                Chaque agent excelle sur sa verticale. Tous travaillent en parallèle :
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  'Architecture, code, tests, refactos',
                  'UI/UX, copy marketing, SEO, blog',
                  'Monitoring, alerting, gestion d\'incident',
                  'Onboarding client, séquences emails',
                  'Documentation technique et ADR',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={14} className="text-indigo-600 mt-0.5 flex-shrink-0" strokeWidth={3} />
                    <span className="text-content-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </MotionInView>
        </div>

        {/* Workflow terminal mockup */}
        <MotionInView delay={300}>
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-violet-500/10 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800 bg-zinc-950/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="ml-3 text-xs font-mono text-zinc-500">
                ~/volia · une journée type · 1 juin 2026
              </span>
              <Terminal size={12} className="ml-auto text-zinc-600" />
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed">
              <div className="mb-3">
                <span className="text-violet-400 font-bold">09:14 · anthony &gt;</span>{' '}
                <span className="text-zinc-300">
                  Les clients Business veulent un champ LinkedIn sur les prospects. Schéma + tableau + export CSV. Go.
                </span>
              </div>
              <div className="mb-3 pl-4 border-l-2 border-indigo-500/40">
                <span className="text-indigo-400 font-bold">09:14 · agent-architect &gt;</span>{' '}
                <span className="text-zinc-300">
                  Migration générée, types regen, ResultsPanel mis à jour, mapping CSV inclus. Tests passants.
                </span>
              </div>
              <div className="mb-3 pl-4 border-l-2 border-indigo-500/40">
                <span className="text-indigo-400 font-bold">09:17 · agent-deploy &gt;</span>{' '}
                <span className="text-emerald-400">
                  ✓ Migration appliquée · ✓ Build Vercel ok · ✓ Prod en 6 min · ✓ Alerte Slack envoyée.
                </span>
              </div>
              <div className="mb-3 pl-4 border-l-2 border-indigo-500/40">
                <span className="text-indigo-400 font-bold">09:23 · agent-marketing &gt;</span>{' '}
                <span className="text-zinc-300">
                  Changelog rédigé. Post LinkedIn drafté. Email aux 12 clients Business en file. Validation ?
                </span>
              </div>
              <div className="mb-3">
                <span className="text-violet-400 font-bold">09:24 · anthony &gt;</span>{' '}
                <span className="text-zinc-300">Go email. Reformule LinkedIn — trop technique.</span>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800">
                <span className="text-zinc-500 text-xs">
                  → 10 minutes du brief à la prod. Une feature livrée. Le founder passe à la suivante.
                </span>
              </div>
            </div>
          </div>
        </MotionInView>

        {/* Disclaimer DISCRET */}
        <MotionInView delay={400}>
          <p className="mt-10 text-xs text-content-tertiary text-center max-w-3xl mx-auto leading-relaxed">
            Le founder reste aux commandes pour les décisions produit, le sales et le customer success.
            L&apos;automatisation couvre tout le reste — sous supervision humaine et avec rollback en 30 secondes en cas
            d&apos;anomalie.
          </p>
        </MotionInView>

        {/* Public commits link */}
        <MotionInView delay={500}>
          <div className="mt-8 p-6 rounded-2xl border-2 border-violet-200 bg-violet-50/60 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                <IconGithub size={18} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-content-primary">Tout est public, en temps réel.</div>
                <div className="text-sm text-content-tertiary mt-0.5">
                  Code, commits, roadmap. Aucun secret de fabrication. Auditez vous-même.
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/changelog"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-violet-300 text-violet-700 font-semibold text-sm hover:bg-violet-50 transition"
              >
                Voir le changelog
                <ArrowRight size={14} />
              </Link>
              <a
                href="https://github.com/Anthonyezdrive/scraping-dom-ezdrive"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm transition"
              >
                <IconGithub size={14} />
                Repo GitHub
              </a>
            </div>
          </div>
        </MotionInView>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 4 — LES CHIFFRES DE LA NOUVELLE ÈRE
// ─────────────────────────────────────────────────────────────────────
function NumbersSection() {
  const numbers = [
    {
      value: '6',
      label: 'semaines de sprint',
      sub: 'V1 complète, 4 modules en prod',
      icon: Zap,
      gradient: 'from-violet-600 to-indigo-600',
    },
    {
      value: '370+',
      label: 'commits publics',
      sub: 'visibles sur GitHub depuis le jour 1',
      icon: GitCommit,
      gradient: 'from-indigo-600 to-blue-600',
    },
    {
      value: '10',
      label: 'cron jobs automatisés',
      sub: 'tournent 24/7, supervisés',
      icon: Network,
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      value: '< 500 €',
      label: 'coût opérationnel mensuel',
      sub: 'infra + API + monitoring inclus',
      icon: Wallet,
      gradient: 'from-emerald-600 to-teal-600',
    },
    {
      value: '1 / semaine',
      label: 'feature majeure livrée',
      sub: 'cadence soutenue depuis le lancement',
      icon: Rocket,
      gradient: 'from-teal-600 to-violet-600',
    },
    {
      value: '0',
      label: 'salarié supplémentaire',
      sub: '100 % bootstrap, 100 % equity',
      icon: ShieldCheck,
      gradient: 'from-fuchsia-600 to-pink-600',
    },
  ];

  return (
    <section id="chiffres" className="py-24 px-4 sm:px-6 border-t border-line bg-gradient-to-b from-white via-violet-50/20 to-white">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Eye size={12} />
              Les chiffres de la nouvelle ère
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Ce qu&apos;une entreprise pilotée par IA permet.
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              Les chiffres ci-dessous ne sont pas une projection. C&apos;est l&apos;état actuel de Volia, en juin 2026.
            </p>
          </div>
        </MotionInView>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {numbers.map((n, i) => {
            const Icon = n.icon;
            return (
              <MotionInView key={n.label} delay={i * 80}>
                <div className="group h-full p-7 rounded-2xl border-2 border-violet-200/60 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${n.gradient} flex items-center justify-center mb-4 shadow-md`}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  <div
                    className={`text-4xl sm:text-5xl font-bold font-mono tabular-nums bg-gradient-to-br ${n.gradient} bg-clip-text text-transparent leading-none mb-2`}
                  >
                    {n.value}
                  </div>
                  <div className="text-base font-semibold text-content-primary">{n.label}</div>
                  <div className="text-sm text-content-tertiary mt-1">{n.sub}</div>
                </div>
              </MotionInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 5 — POURQUOI C'EST IMPORTANT (manifeste)
// ─────────────────────────────────────────────────────────────────────
function ManifestoSection() {
  return (
    <section id="manifeste" className="py-24 px-4 sm:px-6 border-t border-line bg-gradient-to-br from-violet-50/70 via-white to-indigo-50/50 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-fuchsia-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <MotionInView>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Sparkles size={12} />
              Pourquoi c&apos;est important
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Volia n&apos;est pas un cas isolé.
              <br />
              <span className="bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                C&apos;est la prochaine vague.
              </span>
            </h2>
          </div>
        </MotionInView>

        <MotionInView delay={150}>
          <div className="text-6xl text-violet-300 leading-none mb-4 font-serif text-center">“</div>
          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-medium text-content-primary leading-snug mb-10 text-center tracking-tight max-w-4xl mx-auto">
            Le founder du futur n&apos;est pas un manager.
            <br />
            C&apos;est un{' '}
            <strong className="bg-gradient-to-br from-violet-700 to-indigo-700 bg-clip-text text-transparent font-bold">
              orchestrateur d&apos;agents
            </strong>.
          </blockquote>
        </MotionInView>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            {
              icon: Cpu,
              title: 'Les barrières s\'effondrent',
              desc: 'Construire un SaaS B2B complet ne nécessite plus 2M€ et une équipe de 12. Quelques semaines et 1 vision suffisent.',
            },
            {
              icon: TrendingUp,
              title: 'La vélocité gagne tout',
              desc: 'L\'entreprise qui itère 10x plus vite que ses concurrents finit toujours par les dépasser. C\'est mécanique.',
            },
            {
              icon: Globe,
              title: 'La géographie disparaît',
              desc: 'Marseille, Tokyo ou New York : peu importe. L\'orchestre d\'agents tourne dans le cloud, 24/7, partout.',
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <MotionInView key={card.title} delay={200 + i * 100}>
                <div className="h-full p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-violet-200 shadow-sm hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-3 shadow-md">
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="text-base font-bold text-content-primary mb-2">{card.title}</h3>
                  <p className="text-sm text-content-secondary leading-relaxed">{card.desc}</p>
                </div>
              </MotionInView>
            );
          })}
        </div>

        <MotionInView delay={500}>
          <div className="flex items-center justify-center gap-4 mt-12">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 ring-4 ring-white shadow-lg flex items-center justify-center text-white text-base font-bold">
              AM
            </div>
            <div className="text-left">
              <div className="text-base font-bold text-content-primary">Anthony Malartre</div>
              <div className="text-sm text-content-tertiary">Founder &amp; Orchestrator · Marseille</div>
            </div>
          </div>
        </MotionInView>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 6 — CE QUE ÇA CHANGE POUR TOI (client)
// ─────────────────────────────────────────────────────────────────────
function ForYouSection() {
  const benefits = [
    {
      icon: Rocket,
      title: 'Vélocité absolue',
      desc: "Ce que tu demandes lundi peut être en prod mardi. Pas de roadmap committee, pas de sprint planning, pas de \"on en discute en Q3\".",
      gradient: 'from-violet-500 to-indigo-600',
    },
    {
      icon: Wallet,
      title: 'Prix structurellement bas',
      desc: "149€/mois pour toute la suite. HubSpot + Apollo + Lemlist + Tally = 270€/mois. Pas de charité — juste une structure de coûts différente.",
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Eye,
      title: 'Roadmap publique en temps réel',
      desc: "Changelog visible, commits ouverts, ADR techniques publiés. Tu sais exactement ce qui arrive, ce qui change, et pourquoi.",
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      icon: MessageSquare,
      title: 'Founder joignable directement',
      desc: "anthony@volia.fr. Pas de SDR, pas de ticket system. Quand tu écris, c'est moi qui réponds. Et vite — c'est mon avantage compétitif.",
      gradient: 'from-fuchsia-500 to-pink-600',
    },
  ];

  return (
    <section id="pour-vous" className="py-24 px-4 sm:px-6 border-t border-line bg-white">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              <HeartHandshake size={12} />
              Ce que ça change pour toi
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Concrètement, qu&apos;est-ce que tu y gagnes ?
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              Une entreprise pilotée par IA n&apos;est pas un gadget marketing. Elle change 4 choses pour toi, client.
            </p>
          </div>
        </MotionInView>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <MotionInView key={b.title} delay={i * 100}>
                <div className="group h-full p-7 rounded-2xl border-2 border-violet-200/60 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-content-primary mb-2">{b.title}</h3>
                  <p className="text-sm text-content-secondary leading-relaxed">{b.desc}</p>
                </div>
              </MotionInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 7 — FAQ ANTI-FUD
// ─────────────────────────────────────────────────────────────────────
function AntiFudFaqSection() {
  const faqs = [
    {
      q: 'Si c\'est IA, c\'est buggé, non ?',
      a: "Non. Les agents ne pushent jamais directement en production. Chaque commit passe en review, tourne en staging, puis se déploie sur Vercel avec rollback en 30 secondes si besoin. Monitoring temps réel sur l'infra, les API, les paiements. Résultat : moins d'incidents qu'une équipe de 6 devs juniors qui pushent à 18 h le vendredi.",
    },
    {
      q: "Que se passe-t-il si Anthony disparaît ?",
      a: "Trois protections. (1) Le code est public sur GitHub — n'importe quel dev senior peut reprendre le projet en une journée. (2) Tes données sont 100 % portables : export CSV de tous tes prospects, contacts, deals à tout moment depuis Settings. Aucun lock-in. (3) Stripe peut annuler tes paiements en 1 clic. Tu ne perds rien et tu peux migrer ailleurs sans demander la permission.",
    },
    {
      q: 'Anthropic vous a sponsorisé ?',
      a: "Non. Aucun deal commercial, aucun crédit gratuit, aucun partenariat. Je paie Claude au prix grand public via l'API standard. Si Anthropic veut faire un cas marketing autour de Volia un jour, je serai ravi d'en parler — mais ce n'est pas eux qui financent le produit. C'est les clients, et le founder.",
    },
    {
      q: "C'est une démo ou un vrai produit ?",
      a: "Vrai produit. Clients payants. 4 modules connectés en production. 10 cron jobs qui tournent en autonomie 24/7. Monitoring temps réel. Stripe live. Tu peux t'inscrire au plan Starter gratuit en 30 secondes et tester par toi-même — pas besoin de carte bancaire.",
    },
    {
      q: 'Pourquoi Marseille ?',
      a: "Parce que les bonnes idées peuvent venir d'ailleurs que Paris. Parce qu'une entreprise pilotée par IA n'a pas besoin d'être à 5 min des bureaux d'investisseurs ou des incubateurs hype. Parce qu'il y a la mer, la lumière, et zéro réunion réseautage qui mange le calendrier. La géographie n'est plus un avantage compétitif — la vision et la vélocité, oui.",
    },
    {
      q: "Auras-je du support si vous êtes seul ?",
      a: "Oui. Tickets traités sous 24 h ouvrées (souvent sous 2 h en journée FR). Email direct à anthony@volia.fr ou chat in-app. Pas de niveau 1 qui te balade. Pour les clients Business 149€, 30 min de visio onboarding offert sur demande. Quand le volume nécessitera un humain en plus, ce sera un humain support FR — jamais un chatbot frustrant.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 border-t border-line bg-gradient-to-b from-white via-violet-50/20 to-white">
      <div className="max-w-4xl mx-auto">
        <MotionInView>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              <ShieldCheck size={12} />
              FAQ anti-FUD
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Les questions qu&apos;on se pose vraiment.
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              Frequently Doubted Questions. Les vraies inquiétudes sur une entreprise pilotée par IA. Pas de langue de bois.
            </p>
          </div>
        </MotionInView>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <MotionInView key={i} delay={i * 80}>
              <details className="group rounded-2xl border-2 border-violet-200/60 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
                <summary className="cursor-pointer list-none flex items-start gap-3 p-6 hover:bg-violet-50/40 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md mt-0.5">
                    <span className="text-white text-xs font-bold font-mono">Q</span>
                  </div>
                  <h3 className="flex-1 text-base sm:text-lg font-bold text-content-primary leading-snug pt-0.5">
                    {faq.q}
                  </h3>
                  <ChevronRight
                    size={18}
                    className="text-violet-500 flex-shrink-0 mt-1 transition-transform group-open:rotate-90"
                  />
                </summary>
                <div className="px-6 pb-6 pl-[3.75rem]">
                  <p className="text-sm sm:text-base text-content-secondary leading-relaxed">{faq.a}</p>
                </div>
              </details>
            </MotionInView>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 8 — CTA FINAL
// ─────────────────────────────────────────────────────────────────────
function FinalCtaSection() {
  return (
    <section className="py-24 px-4 sm:px-6 border-t border-line relative overflow-hidden bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/60">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[28rem] h-[28rem] bg-fuchsia-200/20 rounded-full blur-3xl pointer-events-none" />

      <MotionInView className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-6">
          <Sparkles size={12} />
          Rejoins la nouvelle ère
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
          La prochaine vague de SaaS sera bâtie comme Volia.
          <br />
          <span className="bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Autant être client tôt.
          </span>
        </h2>
        <p className="text-lg text-content-secondary leading-relaxed max-w-2xl mx-auto mb-10">
          Plan Starter gratuit (100 prospects, sans CB). Ou réserve 15 min avec le founder en personne — pas un BDR,
          pas un chatbot.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup?plan=pro"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all text-base"
          >
            <Sparkles size={18} className="text-amber-200" />
            Essayer Volia gratuit
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-violet-300 text-violet-700 font-semibold hover:bg-violet-50 hover:border-violet-400 transition-all text-base"
          >
            <Calendar size={16} />
            Réserver 15 min avec Anthony
          </Link>
        </div>
        <p className="mt-5 text-xs text-content-tertiary">
          Sans CB · Annulation 1 clic · Founder à anthony@volia.fr
        </p>
      </MotionInView>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// FOOTER (cohérent reste du site marketing)
// ─────────────────────────────────────────────────────────────────────
function PageFooter() {
  return (
    <footer className="border-t border-line py-12 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-content-tertiary">
        <Link href="/" className="inline-flex items-center gap-2 text-content-secondary hover:text-content-primary transition">
          <ArrowLeft size={14} />
          Retour à Volia.fr
        </Link>
        <p>&copy; 2026 Volia — Marseille · L&apos;IA exécute, l&apos;humain décide.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link href="/changelog" className="hover:text-content-secondary transition">Changelog</Link>
          <Link href="/cgu" className="hover:text-content-secondary transition">CGU</Link>
          <Link href="/rgpd" className="hover:text-content-secondary transition">RGPD</Link>
          <a href="mailto:anthony@volia.fr" className="hover:text-content-secondary transition inline-flex items-center gap-1">
            <Mail size={11} />
            anthony@volia.fr
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────
// EXPORT — composition de la page
// ─────────────────────────────────────────────────────────────────────
export default function NotreHistoireContent() {
  useForceLightTheme();
  useForceLocale('fr');

  return (
    <div className="min-h-screen bg-white text-content-primary">
      <MarketingHeader locale="fr" />
      <main>
        <HeroSection />
        <ConstatSection />
        <ExperienceSection />
        <MethodSection />
        <NumbersSection />
        <ManifestoSection />
        <ForYouSection />
        <AntiFudFaqSection />
        <FinalCtaSection />
      </main>
      <PageFooter />
    </div>
  );
}
