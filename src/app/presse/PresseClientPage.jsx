'use client';

// ─────────────────────────────────────────────────────────────────────
// PresseClientPage — composant client de l'espace presse Volia
// ─────────────────────────────────────────────────────────────────────
// Toute la logique interactive (copy-to-clipboard, animations) vit ici
// pour permettre à src/app/presse/page.js de rester un Server Component
// avec un export `metadata` propre côté SEO.
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Mail,
  Phone,
  Clock,
  Newspaper,
  Sparkles,
  Brain,
  Flag,
  Layers,
  GitCommit,
  Calendar,
  Wallet,
  User,
  Globe,
  Tag,
  MapPin,
  Building2,
  FileImage,
  Image as ImageIcon,
  Camera,
  FileText,
  ExternalLink,
  // Note : lucide-react ne fournit plus les icônes de marques (Github,
  // Linkedin, Twitter). On utilise des proxies génériques (Briefcase,
  // AtSign, Code) — quand un design system iconographique social sera
  // ajouté, swap ici en un seul endroit.
  Briefcase,
  AtSign,
  Code,
  Quote,
  ChevronRight,
  Megaphone,
  Award,
} from 'lucide-react';

import MarketingHeader from '@/components/MarketingHeader';
import ReaderFooter from '@/components/ReaderFooter';
import MotionInView from '@/components/MotionInView';
import { useForceLightTheme } from '@/lib/use-force-light-theme';
import {
  BOILERPLATE,
  KEY_NUMBERS,
  FOUNDER_QUOTES,
  PRESS_ANGLES,
  MEDIA_KIT_ASSETS,
  PRESS_RELEASES,
  PRESS_CONTACT,
  FOUNDER_BIO,
  AI_LOOPS_INVENTORY,
} from '@/lib/press-kit';

// Mapping iconName (string sérialisable depuis press-kit.js) → composant
const ICONS = {
  Layers,
  GitCommit,
  Calendar,
  Wallet,
  User,
  Globe,
  Tag,
  MapPin,
  Building2,
  FileImage,
  Image: ImageIcon,
  Camera,
  FileText,
  Sparkles,
  Brain,
  Flag,
};
function resolveIcon(name) {
  return ICONS[name] || FileText;
}

// ─────────────────────────────────────────────────────────────────────
// CopyButton — petit composant clipboard avec feedback toast inline
// ─────────────────────────────────────────────────────────────────────
function CopyButton({ text, label = 'Copier' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback rare (Safari < 13.1 / contextes non-HTTPS)
      console.error('Clipboard error:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        copied
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
          : 'bg-white text-violet-700 border border-violet-200 hover:border-violet-400 hover:bg-violet-50'
      }`}
      aria-label={copied ? 'Copié dans le presse-papier' : label}
    >
      {copied ? (
        <>
          <Check size={12} />
          Copié !
        </>
      ) : (
        <>
          <Copy size={12} />
          {label}
        </>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// HeroSection
// ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative pt-32 pb-16 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/30 pointer-events-none" />
      <div className="absolute top-20 -left-20 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 -right-20 w-96 h-96 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto relative">
        <MotionInView>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200 mb-6">
            <Newspaper size={14} />
            Espace presse · Press kit · Marseille
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-content-primary mb-6 leading-[1.05]">
            Volia presse — la première{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
              entreprise SaaS autonome
            </span>{' '}
            au monde
          </h1>

          <p className="text-lg sm:text-xl text-content-secondary leading-relaxed max-w-3xl mb-8">
            Une nouvelle catégorie d&apos;entreprise est née : pilotée par IA, augmentée
            par 1 founder, construite en 6 semaines à Marseille. Tout le matériel presse
            pour la raconter : visuels HD, chiffres clés, bio founder, communiqués, quotes
            prêtes à citer.
          </p>

          <div className="flex flex-wrap gap-3">
            {/* [1er juin 2026] Pivot : on n'a pas de PDF pré-généré côté
                serveur (Puppeteer trop lourd pour Vercel free tier — cf.
                /api/ressources/[slug]/pdf désactivé). À la place, la page
                /presse/kit est rendue en HTML print-optimized + bouton
                window.print() qui génère le PDF nativement via le browser.
                Le journaliste peut sauvegarder en PDF OU imprimer sur papier. */}
            <a
              href="/presse/kit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 transition-all"
            >
              <Download size={16} />
              Télécharger le press kit complet (PDF)
            </a>
            <a
              href={`mailto:${PRESS_CONTACT.email}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-content-primary font-semibold border border-line hover:border-violet-400 hover:bg-violet-50 transition-all"
            >
              <Mail size={16} />
              Contacter la presse
            </a>
          </div>

          <p className="text-xs text-content-muted mt-6">
            Mise à jour : juin 2026 · Marseille · Toutes les ressources libres de droits pour usage éditorial
          </p>
        </MotionInView>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// BoilerplateSection — 3 versions copiables
// ─────────────────────────────────────────────────────────────────────
function BoilerplateSection() {
  const versions = [
    {
      key: 'short',
      label: 'Version courte',
      sub: '1 phrase · ~30 mots',
      text: BOILERPLATE.short,
    },
    {
      key: 'medium',
      label: 'Version moyenne',
      sub: '3 phrases · ~70 mots',
      text: BOILERPLATE.medium,
    },
    {
      key: 'long',
      label: 'Version longue',
      sub: 'Paragraphe complet · ~180 mots',
      text: BOILERPLATE.long,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 border-t border-line">
      <div className="max-w-5xl mx-auto">
        <MotionInView>
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 mb-4">
              <Copy size={12} />
              Boilerplate · 3 longueurs
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-content-primary mb-3">
              Présentation officielle de Volia
            </h2>
            <p className="text-base sm:text-lg text-content-secondary max-w-2xl">
              Trois versions calibrées pour copier-coller directement dans vos articles
              ou newsletters. Cliquez sur « Copier » pour gagner du temps.
            </p>
          </div>
        </MotionInView>

        <div className="space-y-4">
          {versions.map((v, i) => (
            <MotionInView key={v.key} delay={i * 100}>
              <div className="group p-6 sm:p-7 rounded-2xl border border-line bg-white hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/5 transition-all">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-sm font-semibold text-content-primary">{v.label}</div>
                    <div className="text-xs text-content-muted mt-0.5">{v.sub}</div>
                  </div>
                  <CopyButton text={v.text} />
                </div>
                <p className="text-content-secondary leading-relaxed text-[15px]">
                  {v.text}
                </p>
              </div>
            </MotionInView>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// KeyNumbersSection
// ─────────────────────────────────────────────────────────────────────
function KeyNumbersSection() {
  return (
    <section className="py-20 px-4 sm:px-6 border-t border-line bg-gradient-to-br from-slate-50/80 via-white to-violet-50/30">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200 mb-4">
              <Award size={12} />
              Chiffres clés
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-content-primary mb-3">
              Volia en chiffres
            </h2>
            <p className="text-base sm:text-lg text-content-secondary max-w-2xl mx-auto">
              Les données factuelles à connaître pour comprendre l&apos;ampleur du projet
              et son positionnement marché.
            </p>
          </div>
        </MotionInView>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {KEY_NUMBERS.map((n, i) => {
            const Icon = resolveIcon(n.iconName);
            return (
              <MotionInView key={n.label} delay={i * 60}>
                <div className="h-full p-5 sm:p-6 rounded-2xl border border-line bg-white hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/5 transition-all group">
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${n.gradient} text-white shadow-md mb-4`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-content-primary tabular-nums tracking-tight mb-1">
                    {n.value}
                  </div>
                  <div className="text-sm font-semibold text-content-primary mb-1">
                    {n.label}
                  </div>
                  <div className="text-xs text-content-muted leading-relaxed">{n.sub}</div>
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
// FounderBioSection
// ─────────────────────────────────────────────────────────────────────
function FounderBioSection() {
  const bios = [
    { key: 'short', label: 'Bio 1 phrase', text: FOUNDER_BIO.short },
    { key: 'medium', label: 'Bio 1 paragraphe', text: FOUNDER_BIO.medium },
    { key: 'long', label: 'Bio 1 page', text: FOUNDER_BIO.long },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 border-t border-line">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 mb-4">
              <User size={12} />
              Founder bio
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-content-primary mb-3">
              Anthony Malartre, founder augmenté
            </h2>
            <p className="text-base sm:text-lg text-content-secondary max-w-2xl">
              1 humain qui décide, 1000 agents IA qui exécutent. Le nouveau modèle de
              l&apos;entreprise SaaS, supervisé depuis Marseille.
            </p>
          </div>
        </MotionInView>

        <div className="grid lg:grid-cols-[320px_1fr] gap-8 lg:gap-12 items-start">
          {/* Colonne photo + contact */}
          <MotionInView>
            <div className="sticky top-24">
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-violet-100 via-indigo-100 to-violet-200 border border-line overflow-hidden mb-4 relative">
                {/* Placeholder photo — remplacer par <Image src=...> quand l'asset existe */}
                {/* TODO: ajouter /public/img/founder-anthony-portrait.svg */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/founder-anthony-portrait.svg"
                  alt="Anthony Malartre, fondateur de Volia"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-violet-400 pointer-events-none">
                  <User size={64} strokeWidth={1} />
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href={PRESS_CONTACT.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-content-secondary hover:text-violet-700 hover:bg-violet-50 transition border border-line hover:border-violet-300"
                >
                  <Briefcase size={14} />
                  LinkedIn
                  <ExternalLink size={11} className="ml-auto opacity-60" />
                </a>
                <a
                  href={PRESS_CONTACT.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-content-secondary hover:text-violet-700 hover:bg-violet-50 transition border border-line hover:border-violet-300"
                >
                  <AtSign size={14} />
                  Twitter / X
                  <ExternalLink size={11} className="ml-auto opacity-60" />
                </a>
                <a
                  href={PRESS_CONTACT.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-content-secondary hover:text-violet-700 hover:bg-violet-50 transition border border-line hover:border-violet-300"
                >
                  <Code size={14} />
                  GitHub
                  <ExternalLink size={11} className="ml-auto opacity-60" />
                </a>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
                  <Check size={14} />
                  Disponible pour interview
                </div>
                <p className="text-xs text-emerald-700/90 leading-relaxed">
                  Français ou anglais, en visio ou sur Marseille. Délai de réponse {PRESS_CONTACT.responseTime}.
                </p>
              </div>

              <p className="mt-3 text-[11px] text-content-muted leading-relaxed italic px-1">
                Anthony reste responsable produit, sales et service client — l&apos;exécution
                opérationnelle est supervisée par 1 founder et orchestrée par les agents IA.
              </p>
            </div>
          </MotionInView>

          {/* Colonne bios + quote */}
          <div className="space-y-4">
            {bios.map((b, i) => (
              <MotionInView key={b.key} delay={i * 80}>
                <div className="group p-6 rounded-2xl border border-line bg-white hover:border-violet-300 transition-all">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="text-sm font-semibold text-content-primary">{b.label}</div>
                    <CopyButton text={b.text} />
                  </div>
                  <p className="text-content-secondary leading-relaxed text-[15px]">{b.text}</p>
                </div>
              </MotionInView>
            ))}

            {/* Quote founder */}
            <MotionInView delay={240}>
              <div className="relative p-7 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 overflow-hidden">
                <Quote
                  size={56}
                  className="absolute -top-2 -left-2 text-violet-200/60"
                  strokeWidth={1}
                />
                <blockquote className="relative text-lg sm:text-xl font-medium text-content-primary leading-relaxed italic">
                  « {FOUNDER_QUOTES[0].text} »
                </blockquote>
                <div className="relative mt-4 text-sm text-content-muted">
                  — Anthony Malartre, fondateur de Volia
                </div>
              </div>
            </MotionInView>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PressAnglesSection — 3 angles pitch
// ─────────────────────────────────────────────────────────────────────
function PressAnglesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 border-t border-line bg-gradient-to-br from-slate-50/80 via-white to-violet-50/30">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200 mb-4">
              <Sparkles size={12} />
              3 angles de pitch
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-content-primary mb-3">
              Trois histoires à raconter
            </h2>
            <p className="text-base sm:text-lg text-content-secondary max-w-2xl mx-auto">
              Selon votre angle éditorial, voici trois axes prêts à explorer. Chaque
              angle dispose d&apos;un communiqué dédié à télécharger.
            </p>
          </div>
        </MotionInView>

        <div className="grid md:grid-cols-3 gap-6">
          {PRESS_ANGLES.map((angle, i) => {
            const Icon = resolveIcon(angle.iconName);
            return (
              <MotionInView key={angle.slug} delay={i * 100}>
                <div className="h-full flex flex-col p-6 rounded-2xl border border-line bg-white hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/5 transition-all group">
                  <div
                    className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${angle.gradient} text-white shadow-md mb-4`}
                  >
                    <Icon size={20} />
                  </div>

                  <h3 className="text-lg font-bold text-content-primary mb-2">
                    {angle.title}
                  </h3>

                  <div className="text-xs font-semibold text-violet-700 mb-3 uppercase tracking-wide">
                    {angle.audience}
                  </div>

                  <p className="text-sm text-content-secondary leading-relaxed mb-5 flex-1">
                    {angle.pitch}
                  </p>

                  <a
                    href={angle.releaseUrl}
                    download
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:text-violet-600 transition group-hover:gap-2.5"
                  >
                    <Download size={14} />
                    Télécharger le CP
                    <ArrowRight size={14} className="transition" />
                  </a>
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
// AILoopsInventorySection — détail technique des 16 boucles autonomes
// ─────────────────────────────────────────────────────────────────────
// Ajouté juin 2026 après livraison du Sprint Méta-autonomie. Cible
// principale : journalistes IA/tech qui veulent du concret vérifiable
// au-delà du pitch "16 boucles". Chaque boucle expose : nom + cadence
// + résumé d'1 ligne. Groupé par catégorie pour la lisibilité.
//
// Données : AI_LOOPS_INVENTORY dans lib/press-kit.js (source unique).
// ─────────────────────────────────────────────────────────────────────
function AILoopsInventorySection() {
  // Groupe by category en gardant l'ordre d'apparition
  const grouped = AI_LOOPS_INVENTORY.reduce((acc, loop) => {
    if (!acc[loop.category]) acc[loop.category] = [];
    acc[loop.category].push(loop);
    return acc;
  }, {});
  const categoryOrder = Object.keys(grouped);

  // Mapping catégorie → couleur d'accent (cohérence visuelle landing)
  const categoryColors = {
    Marketing: 'from-violet-500 to-purple-600',
    Vente: 'from-emerald-500 to-teal-600',
    Support: 'from-blue-500 to-cyan-600',
    Code: 'from-rose-500 to-orange-600',
    'Méta': 'from-amber-500 to-rose-600',
  };

  return (
    <section className="py-20 px-4 sm:px-6 border-t border-line bg-gradient-to-b from-transparent via-violet-50/30 to-transparent">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200 mb-4">
              <Brain size={12} />
              Inventaire technique
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-content-primary mb-3">
              Les 16 boucles d'agents IA en production
            </h2>
            <p className="text-base sm:text-lg text-content-secondary max-w-3xl">
              Détail complet de chaque automatisation autonome qui orchestre Volia 24/7,
              regroupé par catégorie. Pour les journalistes qui veulent du concret.
            </p>
            <p className="text-xs text-content-tertiary mt-3 italic max-w-3xl">
              ⓘ Le founder reste responsable produit, sales et service client.
              Toutes les actions à risque (PR code, posts publiés, emails clients)
              passent par une validation manuelle ou un garde-fou explicite avant exécution.
            </p>
          </div>
        </MotionInView>

        <div className="space-y-10">
          {categoryOrder.map((category, ci) => {
            const loops = grouped[category];
            const gradient = categoryColors[category] || 'from-slate-500 to-slate-700';
            return (
              <div key={category}>
                <MotionInView delay={ci * 60}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-px flex-1 bg-gradient-to-r ${gradient} opacity-30`} />
                    <h3 className={`text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                      {category} · {loops.length} boucle{loops.length > 1 ? 's' : ''}
                    </h3>
                    <div className={`h-px flex-1 bg-gradient-to-r ${gradient} opacity-30`} />
                  </div>
                </MotionInView>
                <div className="grid sm:grid-cols-2 gap-3">
                  {loops.map((loop, i) => (
                    <MotionInView key={`${category}-${i}`} delay={ci * 60 + i * 40}>
                      <div className="h-full p-4 rounded-xl bg-surface-elevated border border-line hover:border-violet-300 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="text-sm font-semibold text-content-primary leading-tight">
                            {loop.name}
                          </h4>
                          <span className="shrink-0 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-semibold tracking-tight">
                            {loop.cadence}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-content-secondary">
                          {loop.detail}
                        </p>
                      </div>
                    </MotionInView>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <MotionInView delay={300}>
          <div className="mt-10 p-5 rounded-xl bg-violet-50 border border-violet-200">
            <div className="flex items-start gap-3">
              <div className="shrink-0 p-2 rounded-lg bg-white border border-violet-200">
                <Brain size={18} className="text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-violet-900 mb-1">
                  Couche méta-autonomie : Volia s'auto-optimise
                </p>
                <p className="text-xs leading-relaxed text-violet-800">
                  Chaque nuit à 2h, une boucle agrège les métriques de toutes les autres
                  (tentatives, succès, coût estimé, valeur estimée, ROI).
                  Chaque mardi à 10h, le founder reçoit un email auto-généré avec un
                  dashboard détaillé et <strong>3 recommandations Claude</strong> pour
                  optimiser, créer ou supprimer des boucles la semaine suivante.
                </p>
                <p className="text-[11px] text-violet-700 mt-2 italic">
                  Le système ne se contente pas d'exécuter — il décide ce qu'il faudrait
                  faire ensuite. Le founder décide quoi accepter, rejeter, livrer.
                </p>
              </div>
            </div>
          </div>
        </MotionInView>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// AssetsSection — grid de cards téléchargeables
// ─────────────────────────────────────────────────────────────────────
function AssetsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 border-t border-line">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 mb-4">
              <Download size={12} />
              Assets téléchargeables
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-content-primary mb-3">
              Logos, screenshots & photos
            </h2>
            <p className="text-base sm:text-lg text-content-secondary max-w-2xl">
              Tous les visuels haute définition disponibles en téléchargement direct.
              Libres de droits pour usage éditorial.
            </p>
          </div>
        </MotionInView>

        <div className="space-y-12">
          {MEDIA_KIT_ASSETS.map((group, gi) => (
            <div key={group.category}>
              <MotionInView delay={gi * 80}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-content-tertiary mb-4 pl-1">
                  {group.category}
                </h3>
              </MotionInView>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.items.map((asset, i) => {
                  const Icon = resolveIcon(asset.iconName);
                  return (
                    <MotionInView key={asset.title} delay={gi * 80 + i * 50}>
                      <a
                        href={asset.url}
                        download
                        className="block h-full p-5 rounded-2xl border border-line bg-white hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/5 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 group-hover:from-violet-500 group-hover:to-indigo-500 group-hover:text-white transition-all">
                            <Icon size={18} />
                          </div>
                          <Download
                            size={16}
                            className="text-content-muted group-hover:text-violet-600 transition"
                          />
                        </div>
                        <div className="text-sm font-semibold text-content-primary mb-1">
                          {asset.title}
                        </div>
                        <div className="text-xs text-content-muted leading-relaxed mb-3">
                          {asset.description}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono font-semibold text-content-tertiary">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100">{asset.format}</span>
                          <span>·</span>
                          <span>{asset.size}</span>
                        </div>
                      </a>
                    </MotionInView>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// QuotesSection
// ─────────────────────────────────────────────────────────────────────
function QuotesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 border-t border-line bg-gradient-to-br from-violet-50/40 via-white to-indigo-50/30">
      <div className="max-w-6xl mx-auto">
        <MotionInView>
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200 mb-4">
              <Quote size={12} />
              Quotes prêtes à citer
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-content-primary mb-3">
              Phrases signées Anthony Malartre
            </h2>
            <p className="text-base sm:text-lg text-content-secondary max-w-2xl mx-auto">
              Citations validées, prêtes pour vos articles, podcasts ou newsletters.
            </p>
          </div>
        </MotionInView>

        <div className="grid md:grid-cols-2 gap-5">
          {FOUNDER_QUOTES.map((q, i) => (
            <MotionInView key={i} delay={i * 80}>
              <figure className="relative h-full p-7 rounded-2xl border border-line bg-white hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/5 transition-all">
                <Quote
                  size={40}
                  className="absolute top-5 right-5 text-violet-200"
                  strokeWidth={1}
                />
                <blockquote className="text-lg font-medium text-content-primary leading-relaxed pr-10 mb-4">
                  « {q.text} »
                </blockquote>
                <figcaption className="flex items-center justify-between gap-3 pt-4 border-t border-line">
                  <div className="text-xs text-content-muted italic flex-1">{q.context}</div>
                  <CopyButton text={`« ${q.text} » — Anthony Malartre, fondateur de Volia`} />
                </figcaption>
              </figure>
            </MotionInView>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PressReleasesSection
// ─────────────────────────────────────────────────────────────────────
function PressReleasesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 border-t border-line">
      <div className="max-w-5xl mx-auto">
        <MotionInView>
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 mb-4">
              <Megaphone size={12} />
              Communiqués de presse
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-content-primary mb-3">
              Annonces officielles récentes
            </h2>
            <p className="text-base sm:text-lg text-content-secondary max-w-2xl">
              L&apos;historique complet des annonces presse Volia, du plus récent au plus ancien.
            </p>
          </div>
        </MotionInView>

        <div className="space-y-4">
          {PRESS_RELEASES.map((release, i) => (
            <MotionInView key={release.slug} delay={i * 100}>
              <article className="group p-6 rounded-2xl border border-line bg-white hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/5 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <time className="inline-flex items-center gap-2 text-xs font-semibold text-violet-700 uppercase tracking-wider">
                    <Calendar size={12} />
                    {release.dateLabel}
                  </time>
                  <a
                    href={release.pdfUrl}
                    download
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-600 transition"
                  >
                    <Download size={12} />
                    Télécharger le PDF
                  </a>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-content-primary mb-2 group-hover:text-violet-700 transition">
                  {release.title}
                </h3>
                <p className="text-sm text-content-secondary leading-relaxed">
                  {release.summary}
                </p>
              </article>
            </MotionInView>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PressContactSection
// ─────────────────────────────────────────────────────────────────────
function PressContactSection() {
  return (
    <section className="py-20 px-4 sm:px-6 border-t border-line bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 text-white">
      <div className="max-w-5xl mx-auto">
        <MotionInView>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/20 mb-5 backdrop-blur">
                <Mail size={12} />
                Contact presse
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 leading-tight">
                Une question, une interview ?
              </h2>
              <p className="text-base sm:text-lg text-violet-100/90 leading-relaxed mb-6">
                Anthony répond personnellement aux demandes presse en moins de 24h.
                Disponible en français et en anglais, en visio ou sur Marseille.
              </p>

              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-violet-900 hover:bg-violet-50 font-semibold transition shadow-lg"
              >
                <Sparkles size={16} />
                Demander un accès produit pour interview
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              <a
                href={`mailto:${PRESS_CONTACT.email}`}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur transition group"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <Mail size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-violet-200/80 uppercase tracking-wider font-semibold">
                    Email presse
                  </div>
                  <div className="text-base font-semibold text-white truncate">
                    {PRESS_CONTACT.email}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-violet-200/60 group-hover:text-white group-hover:translate-x-0.5 transition flex-shrink-0"
                />
              </a>

              <a
                href={`tel:${PRESS_CONTACT.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur transition group"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <Phone size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-violet-200/80 uppercase tracking-wider font-semibold">
                    Téléphone
                  </div>
                  <div className="text-base font-semibold text-white">
                    {PRESS_CONTACT.phone}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-violet-200/60 group-hover:text-white group-hover:translate-x-0.5 transition flex-shrink-0"
                />
              </a>

              <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <Clock size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-violet-200/80 uppercase tracking-wider font-semibold">
                    Délai de réponse
                  </div>
                  <div className="text-base font-semibold text-white">
                    {PRESS_CONTACT.responseTime}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionInView>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// MediaAppearancesSection — placeholder
// ─────────────────────────────────────────────────────────────────────
function MediaAppearancesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 border-t border-line">
      <div className="max-w-5xl mx-auto">
        <MotionInView>
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 mb-4">
              <Newspaper size={12} />
              Ils ont parlé de Volia
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-content-primary mb-3">
              Apparitions médias
            </h2>
            <p className="text-base sm:text-lg text-content-secondary max-w-2xl mx-auto">
              Cette section sera mise à jour au fur et à mesure de nos apparitions presse,
              podcasts et conférences.
            </p>
          </div>
        </MotionInView>

        <MotionInView delay={100}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* TODO: remplacer par les vrais logos médias dès la première apparition */}
            {['Maddyness', 'Frenchweb', 'BFM Tech', 'ActuIA'].map((mediaName) => (
              <div
                key={mediaName}
                className="aspect-[3/2] rounded-2xl border border-line bg-gradient-to-br from-slate-50 to-white flex items-center justify-center text-content-muted text-sm font-semibold opacity-50 grayscale"
                aria-label={`Placeholder logo ${mediaName}`}
              >
                {mediaName}
              </div>
            ))}
          </div>
        </MotionInView>

        <MotionInView delay={200}>
          <div className="mt-8 text-center">
            <p className="text-sm text-content-muted italic">
              Vous publiez un article ? Envoyez-nous le lien à{' '}
              <a
                href={`mailto:${PRESS_CONTACT.email}`}
                className="text-violet-700 hover:text-violet-600 font-semibold underline underline-offset-2"
              >
                {PRESS_CONTACT.email}
              </a>{' '}
              — nous le référencerons ici.
            </p>
          </div>
        </MotionInView>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Page racine — assemble toutes les sections
// ─────────────────────────────────────────────────────────────────────
export default function PresseClientPage() {
  useForceLightTheme();

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <MarketingHeader locale="fr" />

      <main>
        <HeroSection />
        <BoilerplateSection />
        <KeyNumbersSection />
        <FounderBioSection />
        <PressAnglesSection />
        <AILoopsInventorySection />
        <AssetsSection />
        <QuotesSection />
        <PressReleasesSection />
        <PressContactSection />
        <MediaAppearancesSection />
      </main>

      <ReaderFooter />
    </div>
  );
}
