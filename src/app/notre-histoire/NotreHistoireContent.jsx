'use client';

// ─────────────────────────────────────────────────────────────────────
// NotreHistoireContent — corps client de /notre-histoire
// ─────────────────────────────────────────────────────────────────────
// Voir ./page.js pour le contexte stratégique et les garde-fous.
// Light mode forcé + locale FR. Couleurs : violet/indigo, accents.
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import {
  ArrowRight, ArrowLeft, Sparkles, GitCommit, Bot, User, Wallet,
  Rocket, ShieldCheck, Calendar, Check, X, Mail, Terminal,
  Layers, Flame, MessageSquare, Lightbulb, ChevronRight,
  HeartHandshake, Clock, Eye, Target as TargetIcon,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────
// IconGithub — inline SVG (lucide-react n'expose pas Github dans cette version).
// Récupéré du repo lucide-icons (Apache 2.0).
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
// HERO
// ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/40">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-1/4 w-[36rem] h-[36rem] bg-violet-200/30 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-indigo-200/25 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative max-w-5xl mx-auto z-10">
        <MotionInView>
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles size={12} />
              Notre histoire
            </span>
          </div>
        </MotionInView>

        <MotionInView delay={100}>
          <h1 className="text-center text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.05] bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
            1 founder.{' '}
            <span className="bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
              1 IA.
            </span>
            <br />
            12 mois. 4 produits.
          </h1>
        </MotionInView>

        <MotionInView delay={200}>
          <p className="text-center text-lg sm:text-xl text-content-secondary leading-relaxed max-w-3xl mx-auto mb-10">
            Volia est la première suite SaaS B2B française{' '}
            <strong className="text-content-primary font-semibold">co-construite par un founder solo augmenté d&apos;une IA agentique</strong>.
            Pas un produit IA. Un produit B2B utile, dont la méthode de construction est radicalement transparente.
          </p>
        </MotionInView>

        {/* Stats inline */}
        <MotionInView delay={300}>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10">
            {[
              { value: '370+', label: 'commits publics', icon: GitCommit },
              { value: '4', label: 'modules livrés', icon: Layers },
              { value: '12', label: 'mois de build', icon: Calendar },
              { value: '0', label: 'levée de fonds', icon: Wallet },
              { value: '1', label: 'founder aux commandes', icon: User },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-violet-200 shadow-sm"
                >
                  <Icon size={14} className="text-violet-600" />
                  <span className="text-sm font-bold font-mono tabular-nums text-content-primary">{stat.value}</span>
                  <span className="text-sm text-content-tertiary">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </MotionInView>

        {/* Transparency disclaimer */}
        <MotionInView delay={400}>
          <p className="text-center text-xs text-content-tertiary max-w-2xl mx-auto">
            Pour être précis : 1 founder + Claude (Anthropic) comme co-pilote de code. Aucun salarié supplémentaire,
            mais des prestataires ponctuels (compta, design, conseil juridique) — ce qu&apos;on appelle &ldquo;solo&rdquo; dans l&apos;écosystème.
          </p>
        </MotionInView>

        {/* CTAs */}
        <MotionInView delay={500}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="#methode"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/30 hover:shadow-xl transition-all"
            >
              Voir la méthode
              <ArrowRight size={16} />
            </Link>
            <Link
              href="#timeline"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-violet-300 text-violet-700 font-semibold hover:bg-violet-50 transition-all"
            >
              Voir les 12 derniers mois
            </Link>
          </div>
        </MotionInView>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 1 — LE PROBLÈME
// ─────────────────────────────────────────────────────────────────────
function ProblemSection() {
  const stack = [
    { tool: 'HubSpot Starter (CRM)', price: 45 },
    { tool: 'Apollo.io (prospection)', price: 99 },
    { tool: 'Lemlist (outbound)', price: 59 },
    { tool: 'Tally (forms)', price: 29 },
    { tool: 'Notion (docs)', price: 10 },
    { tool: 'Zapier (glue entre tout ça)', price: 29 },
  ];
  const total = stack.reduce((acc, s) => acc + s.price, 0);

  return (
    <section id="probleme" className="py-24 px-4 sm:px-6 border-t border-line bg-white">
      <div className="max-w-5xl mx-auto">
        <MotionInView>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-200 bg-rose-50 text-rose-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Flame size={12} />
              Section 1 — Le problème
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              J&apos;en avais marre de payer {total}€/mois pour 6 outils qui ne se parlent même pas.
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              Mai 2025. Je gérais mon premier SaaS B2B avec une pile US standard. Chaque outil voulait son abonnement, ses
              webhooks, ses Zapier, ses exports CSV manuels. Et personne ne comprenait le marché français.
            </p>
          </div>
        </MotionInView>

        <MotionInView delay={150}>
          <div className="rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 via-white to-rose-50/30 p-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {stack.map((line) => (
                <div
                  key={line.tool}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-rose-100"
                >
                  <span className="text-sm text-content-secondary">{line.tool}</span>
                  <span className="text-sm font-bold font-mono text-rose-700 tabular-nums">{line.price} €</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-5 border-t-2 border-rose-200">
              <span className="text-sm font-bold uppercase tracking-wider text-content-primary">Total mensuel</span>
              <span className="text-3xl font-bold font-mono text-rose-700 tabular-nums">{total} €</span>
            </div>
            <p className="mt-5 text-sm text-content-tertiary leading-relaxed">
              + ~6 heures par semaine perdues à faire des allers-retours entre les outils, debugger des Zaps cassés, et
              ré-importer des fichiers CSV. Au prix horaire d&apos;un founder, ça fait facilement 1 000 €/mois de douleur cachée.
            </p>
          </div>
        </MotionInView>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 2 — LE DÉCLIC
// ─────────────────────────────────────────────────────────────────────
function ClickSection() {
  return (
    <section id="declic" className="py-24 px-4 sm:px-6 border-t border-line bg-gradient-to-b from-white via-violet-50/30 to-white">
      <div className="max-w-4xl mx-auto">
        <MotionInView>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Lightbulb size={12} />
              Section 2 — Le déclic
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Et si je construisais ce qu&apos;il me manquait — avec Claude comme co-pilote ?
            </h2>
          </div>
        </MotionInView>

        <MotionInView delay={150}>
          <div className="rounded-2xl bg-white border border-violet-200 shadow-xl shadow-violet-500/10 p-8 sm:p-10">
            <p className="text-lg text-content-secondary leading-relaxed mb-5">
              En mai 2025, Anthropic sortait Claude Sonnet capable de coder à un niveau qui m&apos;a fait revoir ma copie.
              J&apos;avais un choix simple :
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <X size={18} className="text-rose-500 mt-1 flex-shrink-0" />
                <span className="text-content-secondary">
                  Continuer à payer 271 €/mois pour 6 outils US qui ne se parlent pas, et que mes clients FR trouvaient
                  &ldquo;trop anglais&rdquo;.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <X size={18} className="text-rose-500 mt-1 flex-shrink-0" />
                <span className="text-content-secondary">
                  Lever 1M€, embaucher 6 développeurs, et passer 18 mois en mode startup classique avant de sortir une v1.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={18} className="text-emerald-600 mt-1 flex-shrink-0" strokeWidth={3} />
                <span className="text-content-primary font-medium">
                  Construire moi-même, avec Claude comme co-pilote agentique, et voir jusqu&apos;où on pouvait aller en 12 mois.
                </span>
              </li>
            </ul>
            <p className="text-lg text-content-secondary leading-relaxed">
              J&apos;ai choisi l&apos;option 3. Pas par idéologie. Par pragmatisme : c&apos;était la seule qui me permettait de
              <strong className="text-content-primary"> garder 100 % de l&apos;equity, contrôler le rythme produit, et apprendre au passage</strong>.
            </p>
          </div>
        </MotionInView>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 3 — LA MÉTHODE (transparence radicale)
// ─────────────────────────────────────────────────────────────────────
function MethodSection() {
  return (
    <section id="methode" className="py-24 px-4 sm:px-6 border-t border-line bg-white">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Eye size={12} />
              Section 3 — La méthode (transparence radicale)
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Comment on construit Volia, chaque jour.
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              Pas d&apos;eau de rose. Voici le vrai workflow — qui décide, qui code, qui valide, qui pousse en prod.
            </p>
          </div>
        </MotionInView>

        {/* Diptyque rôles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          <MotionInView delay={100}>
            <div className="h-full p-7 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50/40 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <User size={22} className="text-white" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-violet-600 font-bold">Founder</div>
                  <div className="text-lg font-bold text-content-primary">Anthony</div>
                </div>
              </div>
              <p className="text-sm text-content-secondary mb-4 leading-relaxed">
                Anthony reste aux commandes. Il décide tout ce qui compte vraiment :
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  'Vision produit et roadmap',
                  'Pricing, positionnement, branding',
                  'Toutes les conversations clients & ventes',
                  'Architecture, choix techniques structurants',
                  'Review et merge de chaque commit en prod',
                  'Support & SLA (anthony@volia.fr direct)',
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
            <div className="h-full p-7 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50/40 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-indigo-600 font-bold">Co-pilote</div>
                  <div className="text-lg font-bold text-content-primary">Claude (Anthropic)</div>
                </div>
              </div>
              <p className="text-sm text-content-secondary mb-4 leading-relaxed">
                Claude exécute, propose, accélère. Mais ne valide rien tout seul :
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  'Implémentation des features sur spec',
                  'Refactos, tests, fixes de bugs',
                  'Propositions UI/UX et copy première version',
                  'Génération de pages SEO et contenu marketing',
                  'Documentation technique et ADR',
                  'Tout passe en review humaine avant prod',
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
                ~/volia · session typique avec Claude (15 mai 2026)
              </span>
              <Terminal size={12} className="ml-auto text-zinc-600" />
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed">
              <div className="mb-3">
                <span className="text-violet-400 font-bold">anthony &gt;</span>{' '}
                <span className="text-zinc-300">
                  3 clients m&apos;ont demandé un champ &ldquo;LinkedIn URL&rdquo; sur les prospects. Tu peux l&apos;ajouter ? Schéma Supabase
                  + colonne dans le tableau + export CSV inclus.
                </span>
              </div>
              <div className="mb-3 pl-4 border-l-2 border-indigo-500/40">
                <span className="text-indigo-400 font-bold">claude &gt;</span>{' '}
                <span className="text-zinc-300">
                  OK. Je propose : ALTER TABLE prospects ADD COLUMN linkedin_url TEXT. Migration générée, type
                  TypeScript regen, colonne ajoutée dans ResultsPanel.jsx + mapping CSV. Je touche aussi
                  l&apos;enrichissement waterfall pour récupérer le LinkedIn quand on le trouve sur le site. OK pour
                  ce périmètre ?
                </span>
              </div>
              <div className="mb-3">
                <span className="text-violet-400 font-bold">anthony &gt;</span>{' '}
                <span className="text-zinc-300">Go. Pas de waterfall pour l&apos;instant — trop coûteux en API. Juste la colonne.</span>
              </div>
              <div className="mb-3 pl-4 border-l-2 border-indigo-500/40">
                <span className="text-indigo-400 font-bold">claude &gt;</span>{' '}
                <span className="text-emerald-400">
                  ✓ Migration 20260515_add_linkedin_url.sql · ✓ ResultsPanel.jsx (colonne + tri) · ✓ Export CSV mis à jour ·
                  ✓ Tests passants. Prêt pour review.
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800">
                <span className="text-zinc-500 text-xs">
                  → Anthony review · merge sur main · auto-deploy Vercel · prod en 6 minutes.
                </span>
              </div>
            </div>
          </div>
        </MotionInView>

        {/* Public commits link */}
        <MotionInView delay={400}>
          <div className="mt-10 p-6 rounded-2xl border-2 border-violet-200 bg-violet-50/60 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                <IconGithub size={18} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-content-primary">Tous les commits sont publics.</div>
                <div className="text-sm text-content-tertiary mt-0.5">
                  Vous pouvez voir le code, les pivots, les erreurs, les correctifs. Aucun secret de fabrication.
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
// SECTION 4 — TIMELINE 12 MOIS
// ─────────────────────────────────────────────────────────────────────
function TimelineSection() {
  const milestones = [
    {
      date: 'Mai 2025',
      title: 'Prospectia v1 — Prospection seule',
      desc: "Première version : Google Places + scraping email basique. 1 outil, 1 page, 1 use case. Hébergé sur Vercel le jour de la sortie de Claude Sonnet 4.",
      color: 'from-violet-500 to-indigo-600',
    },
    {
      date: 'Juillet 2025',
      title: 'Stripe + plans multiples',
      desc: "Premiers paiements. Plans Starter / Pro / Enterprise. Mise en place webhooks, portail client, factures TVA. Premier MRR.",
      color: 'from-indigo-500 to-blue-600',
    },
    {
      date: 'Septembre 2025',
      title: 'Migration Prospectia → Volia',
      desc: "Rebrand vers Volia.fr. Repositionnement : pas juste un outil de prospection, mais une suite B2B en construction. Nouveau domaine, nouveau logo.",
      color: 'from-blue-500 to-cyan-600',
    },
    {
      date: 'Novembre 2025',
      title: 'Phase multi-produits (3 modules)',
      desc: "Sortie de Volia Campagnes (email/SMS sequencing) et chantier Volia CRM. La suite prend forme. Module switcher dans le dashboard.",
      color: 'from-cyan-500 to-emerald-600',
    },
    {
      date: 'Janvier 2026',
      title: 'Bridges natifs entre modules',
      desc: "Prospection → Campagnes → CRM se parlent en 1 clic, sans Zapier, sans export CSV. C'est là que la suite devient vraiment supérieure au stack composite.",
      color: 'from-emerald-500 to-teal-600',
    },
    {
      date: 'Mars 2026',
      title: 'Volia Forms (4e module)',
      desc: "Sortie du module Forms : formulaires hébergés, capture leads, auto-création dans le CRM. Stack complète pour un cycle inbound + outbound.",
      color: 'from-teal-500 to-violet-500',
    },
    {
      date: 'Mai 2026',
      title: 'Refonte branding + plan Business 149€',
      desc: "Repositionnement premium : plan Business à 149€/mois qui débloque toute la suite. Rebrand visuel light-first pour matcher les standards SaaS B2B.",
      color: 'from-violet-500 to-fuchsia-600',
    },
    {
      date: 'Juin 2026',
      title: "Aujourd'hui — sprint marketing & growth",
      desc: "La suite est stable, les 4 modules livrent. Place à la distribution : SEO, partenariats, contenu, awareness. Cette page en fait partie.",
      color: 'from-fuchsia-500 to-pink-600',
      current: true,
    },
  ];

  return (
    <section id="timeline" className="py-24 px-4 sm:px-6 border-t border-line bg-gradient-to-b from-white via-violet-50/20 to-white">
      <div className="max-w-5xl mx-auto">
        <MotionInView>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Calendar size={12} />
              Section 4 — 12 mois de build
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              De 1 outil à 4 modules, en 12 mois.
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              Pas de big bang. Chaque mois, un pivot, un module, une release. Le rythme d&apos;un founder solo + IA, c&apos;est ça.
            </p>
          </div>
        </MotionInView>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-200 via-indigo-200 to-pink-200 -translate-x-px hidden sm:block" />
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-200 via-indigo-200 to-pink-200 sm:hidden" />

          <div className="space-y-10">
            {milestones.map((m, i) => {
              const isLeft = i % 2 === 0;
              return (
                <MotionInView key={m.date} delay={i * 80}>
                  <div className={`relative flex sm:items-center gap-4 sm:gap-8 ${isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                    {/* Dot */}
                    <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                      <div
                        className={`w-4 h-4 rounded-full bg-gradient-to-br ${m.color} ring-4 ring-white shadow-md ${m.current ? 'animate-pulse' : ''}`}
                      />
                    </div>

                    {/* Card */}
                    <div className={`ml-12 sm:ml-0 sm:w-1/2 ${isLeft ? 'sm:pr-12 sm:text-right' : 'sm:pl-12 sm:text-left'}`}>
                      <div className="inline-block">
                        <div className={`p-5 rounded-2xl border-2 ${m.current ? 'border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 to-pink-50 shadow-lg shadow-fuchsia-500/10' : 'border-line bg-white shadow-sm hover:shadow-md transition-shadow'}`}>
                          <div className={`text-xs font-bold uppercase tracking-wider mb-2 inline-flex items-center gap-1.5 ${m.current ? 'text-fuchsia-700' : 'text-violet-700'}`}>
                            {m.current && (
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-fuchsia-600"></span>
                              </span>
                            )}
                            {m.date}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-content-primary leading-snug mb-1.5">
                            {m.title}
                          </h3>
                          <p className="text-sm text-content-secondary leading-relaxed">{m.desc}</p>
                        </div>
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="hidden sm:block sm:w-1/2" />
                  </div>
                </MotionInView>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 5 — LES CHIFFRES (transparence)
// ─────────────────────────────────────────────────────────────────────
function NumbersSection() {
  const numbers = [
    {
      value: '370+',
      label: 'commits publics',
      sub: 'sur GitHub, depuis mai 2025',
      icon: GitCommit,
      gradient: 'from-violet-600 to-indigo-600',
    },
    {
      value: '4',
      label: 'modules en production',
      sub: 'Prospection · Campagnes · CRM · Forms',
      icon: Layers,
      gradient: 'from-indigo-600 to-blue-600',
    },
    {
      value: '287k+',
      label: 'entreprises FR couvertes',
      sub: 'Google Places + waterfall',
      icon: TargetIcon,
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      value: 'XXX', // TODO: chiffre à confirmer
      label: 'clients Business actifs',
      sub: 'plan suite complète 149€/mois',
      icon: HeartHandshake,
      gradient: 'from-emerald-600 to-teal-600',
      placeholder: true,
    },
    {
      value: 'X k€', // TODO: chiffre à confirmer
      label: 'MRR cumulé',
      sub: 'transparence à venir',
      icon: Wallet,
      gradient: 'from-teal-600 to-violet-600',
      placeholder: true,
    },
    {
      value: '0',
      label: 'levée de fonds',
      sub: '100 % bootstrap, 100 % equity',
      icon: ShieldCheck,
      gradient: 'from-fuchsia-600 to-pink-600',
    },
  ];

  return (
    <section id="chiffres" className="py-24 px-4 sm:px-6 border-t border-line bg-white">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Eye size={12} />
              Section 5 — Les chiffres (transparence)
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Pas de bullshit. Voici où on en est.
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              Quelques chiffres seront mis à jour ce trimestre une fois validés comptablement. Le reste est public depuis le jour 1.
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
                    className={`text-5xl font-bold font-mono tabular-nums bg-gradient-to-br ${n.gradient} bg-clip-text text-transparent leading-none mb-2`}
                  >
                    {n.value}
                  </div>
                  <div className="text-base font-semibold text-content-primary">{n.label}</div>
                  <div className="text-sm text-content-tertiary mt-1">{n.sub}</div>
                  {/* TODO: chiffre à confirmer — placeholder visible tant qu'Anthony n'a pas validé la valeur exacte */}
                  {n.placeholder && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      <Clock size={10} />
                      À publier sous peu
                    </div>
                  )}
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
// SECTION 6 — POURQUOI JE FAIS ÇA
// ─────────────────────────────────────────────────────────────────────
function MissionSection() {
  return (
    <section id="mission" className="py-24 px-4 sm:px-6 border-t border-line bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/40 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

      <MotionInView className="max-w-4xl mx-auto text-center relative z-10">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-6">
          <Sparkles size={12} />
          Section 6 — Pourquoi je fais ça
        </span>
        <div className="text-6xl sm:text-7xl text-violet-300 leading-none mb-4 font-serif">“</div>
        <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-medium text-content-primary leading-snug mb-8 tracking-tight">
          L&apos;IA ne remplace pas les humains. Elle{' '}
          <strong className="bg-gradient-to-br from-violet-700 to-indigo-700 bg-clip-text text-transparent font-bold">
            augmente les founders
          </strong>
          . Et un founder augmenté peut bâtir une suite B2B qui rivalise{' '}
          <strong className="font-bold">avec une équipe de 8</strong>, à un prix accessible à toutes les PME françaises.
        </blockquote>
        <div className="flex items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 ring-4 ring-white shadow-lg flex items-center justify-center text-white text-base font-bold">
            AM
          </div>
          <div className="text-left">
            <div className="text-base font-bold text-content-primary">Anthony Malartre</div>
            <div className="text-sm text-content-tertiary">Founder, Volia</div>
          </div>
        </div>
      </MotionInView>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SECTION 7 — CE QUE ÇA CHANGE POUR VOUS (client)
// ─────────────────────────────────────────────────────────────────────
function ForYouSection() {
  const benefits = [
    {
      icon: Rocket,
      title: 'Vélocité de delivery',
      desc: "Vous demandez une feature lundi soir, elle peut être en prod mardi midi. Sans roadmap committee, sans sprint planning, sans 'on en discute en Q3'.",
      gradient: 'from-violet-500 to-indigo-600',
    },
    {
      icon: Wallet,
      title: 'Prix accessible',
      desc: "Pas d'équipe à payer, pas d'investisseurs à rémunérer, pas de bureau à Paris. On peut être à 149€/mois pour toute la suite. Pas par charité, par structure de coûts.",
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Eye,
      title: 'Roadmap publique',
      desc: "Commits, changelog, ADR techniques : tout est visible. Vous savez exactement ce qui arrive, ce qui change, et pourquoi. Aucune surprise de pricing ou de feature.",
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      icon: MessageSquare,
      title: 'Founder personnellement accessible',
      desc: "anthony@volia.fr. Pas de SDR, pas de ticket system kafkaïen. Quand vous écrivez, c'est moi qui réponds. Et vite — c'est mon principal avantage compétitif.",
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
              Section 7 — Ce que ça change pour vous
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Concrètement, qu&apos;est-ce que vous y gagnez ?
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              Cette méthode n&apos;est pas qu&apos;une histoire fun à raconter — elle a 4 conséquences directes pour vous, client.
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
// SECTION 8 — FAQ ANTI-FUD
// ─────────────────────────────────────────────────────────────────────
function AntiFudFaqSection() {
  const faqs = [
    {
      q: 'Est-ce que mon SaaS est buggé parce que codé par une IA ?',
      a: "Non. Claude ne pushe jamais directement en production. Chaque commit passe en review humaine. Le code est testé en local, sur un environnement de staging, puis déployé sur Vercel avec rollback en 30 secondes si besoin. On a moins de bugs qu'une équipe de 6 devs juniors qui pushent à 18 h le vendredi — c'est tout l'avantage d'avoir un seul humain responsable de tout ce qui touche la prod.",
    },
    {
      q: "Vais-je avoir du support si vous êtes seul ?",
      a: "Oui. Tickets traités sous 24 h ouvrées (souvent sous 2 h en journée FR). Email direct à anthony@volia.fr ou chat in-app. Pas de niveau 1 qui vous balade. Pour les clients Business 149€, j'offre 30 min de visio onboarding sur demande. Quand le volume nécessitera un humain en plus, ce sera un humain support FR — jamais un chatbot qui vous frustre.",
    },
    {
      q: "Que se passe-t-il si Anthony tombe sous un bus ?",
      a: "Question légitime. Trois protections : (1) Le code est public sur GitHub, n'importe quel dev senior peut reprendre le projet. (2) Vos données sont 100 % portables — export CSV de tous vos prospects, contacts, deals à tout moment depuis Settings. Aucun lock-in. (3) Les paiements Stripe peuvent être annulés en 1 clic. Vous ne perdez rien et vous pouvez migrer ailleurs sans nous demander la permission.",
    },
    {
      q: "Anthropic vous a sponsorisé ?",
      a: "Non. Aucun deal commercial, aucun crédit gratuit, aucun partenariat. Je paie Claude au prix grand public via l'API standard. Si Anthropic veut faire un cas marketing autour de Volia un jour, je serai ravi d'en parler — mais ce n'est pas eux qui financent le produit. C'est vous (les clients) et moi (le founder).",
    },
    {
      q: "Pourquoi pas TypeScript ?",
      a: "Volia est en JavaScript pur (pas TS) parce que j'ai commencé seul, je voulais aller vite, et le couple Next.js + Supabase tient très bien sans TS quand il y a un seul dev sur le code. C'est un choix assumé et documenté dans nos ADR. Si on passe à une équipe à 3+ devs un jour, on migrera. Pas avant.",
    },
    {
      q: "C'est conforme RGPD malgré l'utilisation d'IA ?",
      a: "Oui. Claude est utilisé uniquement côté développement (pour écrire du code) et pour le parsing des requêtes en langage naturel dans Volia Prospection (Anthropic est SOC2, hébergé US mais avec DPA disponible). Aucune donnée client n'est envoyée à Claude pour de l'analyse comportementale ou de l'entraînement. Vos données restent dans Supabase (région EU), point. Voir notre /dpa et /rgpd pour les détails.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 border-t border-line bg-gradient-to-b from-white via-violet-50/20 to-white">
      <div className="max-w-4xl mx-auto">
        <MotionInView>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              <ShieldCheck size={12} />
              Section 8 — FAQ anti-FUD
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Les questions que vous vous posez vraiment.
            </h2>
            <p className="text-content-tertiary text-lg max-w-2xl mx-auto">
              Frequently Doubted Questions : les vraies inquiétudes B2B sur un SaaS construit par 1 founder + IA. Pas de
              langue de bois.
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
// SECTION 9 — CTA FINAL
// ─────────────────────────────────────────────────────────────────────
function FinalCtaSection() {
  return (
    <section className="py-24 px-4 sm:px-6 border-t border-line relative overflow-hidden bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/60">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />

      <MotionInView className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-6">
          <Sparkles size={12} />
          Prêt à essayer ?
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
          Découvrez la suite que 1 founder + 1 IA ont mis 12 mois à bâtir.
        </h2>
        <p className="text-lg text-content-secondary leading-relaxed max-w-2xl mx-auto mb-10">
          Plan Starter gratuit (100 prospects, sans CB). Ou réservez 15 min avec moi pour qu&apos;on regarde votre cas
          ensemble — c&apos;est le founder en personne, pas un BDR.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup?plan=starter"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all text-base"
          >
            <Sparkles size={18} className="text-amber-200" />
            Essayer la suite Volia (gratuit)
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
        <p>&copy; 2026 Volia — Construit en France, avec Claude au clavier.</p>
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
        <ProblemSection />
        <ClickSection />
        <MethodSection />
        <TimelineSection />
        <NumbersSection />
        <MissionSection />
        <ForYouSection />
        <AntiFudFaqSection />
        <FinalCtaSection />
      </main>
      <PageFooter />
    </div>
  );
}
