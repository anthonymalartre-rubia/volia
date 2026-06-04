'use client';

// ─────────────────────────────────────────────────────────────────────
// ComparatifPage — composant partagé pour /comparatif/[slug]
// ─────────────────────────────────────────────────────────────────────
// Comparatifs détaillés 1-vs-Volia long-form (~2000-3000 mots) :
//   /comparatif/apollo-vs-volia
//   /comparatif/lemlist-vs-volia
//   /comparatif/hubspot-vs-volia
//
// Pages SEO long-tail conversion-first. Force light theme (cohérence
// marketing). Réutilise ReaderHeader, ReaderFooter, MotionInView,
// LogoIcon. Mobile responsive (tables scrollables).
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import {
  Check, X, ArrowRight, ChevronRight, Sparkles, Wallet, Award,
  ShieldCheck, TrendingDown, Star, Clock, FileText, Zap,
} from 'lucide-react';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';
import MotionInView from '@/components/MotionInView';
import { LogoIcon } from '@/components/ui';
import { useForceLightTheme } from '@/lib/use-force-light-theme';

// ─── Helper : rend une cellule de table feature (yes / no / partial / N/A) ──
function FeatureCell({ value }) {
  if (value === 'yes') {
    return <Check size={18} className="text-emerald-600 mx-auto" strokeWidth={3} aria-label="oui" />;
  }
  if (value === 'no') {
    return <X size={18} className="text-rose-400 mx-auto" strokeWidth={2.5} aria-label="non" />;
  }
  if (value === 'partial') {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 mx-auto rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold" aria-label="partiel">
        ½
      </span>
    );
  }
  // Custom string ("$99/mo", "✓ Free CRM (limité)", etc.)
  return <span className="text-xs sm:text-sm text-content-secondary">{value}</span>;
}

function ComparatifBadge({ data }) {
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${data.colorClasses.badgeBorder} ${data.colorClasses.badgeBg} ${data.colorClasses.badgeText} text-[11px] font-bold uppercase tracking-wider`}>
      <span className="relative flex h-1.5 w-1.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${data.colorClasses.accentDot} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${data.colorClasses.accentDot}`}></span>
      </span>
      {data.hero.eyebrow}
    </span>
  );
}

export default function ComparatifPage({ data }) {
  useForceLightTheme();
  const c = data;

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <ReaderHeader />

      <main className="pt-24 pb-16">
        {/* ─── 1. HERO ────────────────────────────────────────────── */}
        <section className={`relative px-4 sm:px-6 py-12 sm:py-16 bg-gradient-to-br ${c.colorClasses.bgGradient} border-b border-line overflow-hidden`}>
          <div className={`absolute top-0 left-1/4 w-96 h-96 ${c.colorClasses.bg} rounded-full blur-3xl pointer-events-none opacity-50 -z-0`} />
          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <MotionInView>
              <ComparatifBadge data={c} />
            </MotionInView>

            {/* Logos VS */}
            <MotionInView delay={80}>
              <div className="flex items-center justify-center gap-6 sm:gap-10 my-6 sm:my-8">
                {/* Competitor logo */}
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${c.competitor.logoBg} text-white flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-lg`}>
                    {c.competitor.logo}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-content-secondary">{c.competitor.name}</div>
                  <div className="text-[10px] text-content-tertiary">{c.competitor.countryFlag} {c.competitor.tagline}</div>
                </div>

                <div className="text-xl sm:text-2xl font-bold text-content-tertiary font-mono">VS</div>

                {/* Volia logo */}
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${c.colorClasses.buttonGradient} text-white flex items-center justify-center shadow-lg ring-4 ${c.colorClasses.ring}/30`}>
                    <LogoIcon size="lg" className="text-white" />
                  </div>
                  <div className={`text-xs sm:text-sm font-semibold ${c.colorClasses.textStrong}`}>Volia</div>
                  <div className="text-[10px] text-content-tertiary">🇫🇷 Suite SaaS française</div>
                </div>
              </div>
            </MotionInView>

            <MotionInView delay={160}>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                {c.hero.h1}
              </h1>
            </MotionInView>

            <MotionInView delay={240}>
              <p className="text-lg sm:text-xl text-content-secondary leading-relaxed max-w-3xl mx-auto mb-8">
                {c.hero.subtitle}
              </p>
            </MotionInView>

            <MotionInView delay={320}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link
                  href={c.hero.ctaPrimary.href}
                  className={`group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r ${c.colorClasses.buttonGradient} ${c.colorClasses.buttonHover} text-white font-bold shadow-xl hover:-translate-y-0.5 transition-all`}
                >
                  <Sparkles size={16} className="text-amber-200" />
                  {c.hero.ctaPrimary.label}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href={c.hero.ctaSecondary.href}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-line hover:border-content-tertiary bg-white text-content-primary font-semibold transition-all"
                >
                  {c.hero.ctaSecondary.label}
                  <ChevronRight size={16} />
                </Link>
              </div>
              <p className="mt-3 text-xs text-content-tertiary">
                100 prospects gratuits · Sans carte bancaire · Annulation 1 clic
              </p>
            </MotionInView>
          </div>
        </section>

        {/* ─── 2. TL;DR ───────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 py-12 sm:py-16 border-b border-line">
          <div className="max-w-4xl mx-auto">
            <MotionInView>
              <div className={`rounded-3xl border-2 ${c.colorClasses.borderStrong} ${c.colorClasses.bg} p-6 sm:p-8 shadow-sm`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.colorClasses.buttonGradient} flex items-center justify-center shadow-md`}>
                    <Zap size={18} className="text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-content-primary">TL;DR — en résumé</h2>
                </div>
                <ul className="space-y-3">
                  {c.tldr.map((line, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${c.colorClasses.bg} border ${c.colorClasses.border} flex items-center justify-center mt-0.5`}>
                        <Check size={12} className={c.colorClasses.text} strokeWidth={3} />
                      </div>
                      <span className="text-sm sm:text-base text-content-secondary leading-relaxed">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </MotionInView>
          </div>
        </section>

        {/* ─── 3. CHIFFRES CLÉS ───────────────────────────────────── */}
        <section className="px-4 sm:px-6 py-16 sm:py-20 border-b border-line">
          <div className="max-w-5xl mx-auto">
            <MotionInView>
              <div className="text-center mb-10">
                <ComparatifBadge data={{ ...c, hero: { eyebrow: 'Chiffres clés' } }} />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-3 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  {c.competitor.name} vs Volia en chiffres
                </h2>
                <p className="text-content-tertiary text-base sm:text-lg max-w-2xl mx-auto">
                  Les données qui comptent vraiment pour décider — prix, couverture, support, conformité.
                </p>
              </div>
            </MotionInView>

            <MotionInView delay={100}>
              <div className={`overflow-x-auto rounded-2xl border-2 ${c.colorClasses.border} bg-white shadow-lg`}>
                <table className="w-full text-left">
                  <thead>
                    <tr className={`${c.colorClasses.bg} border-b-2 ${c.colorClasses.border}`}>
                      <th className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-bold text-content-primary uppercase tracking-wider">Critère</th>
                      <th className="px-4 sm:px-6 py-4 text-center text-xs sm:text-sm font-bold text-content-secondary">{c.competitor.name}</th>
                      <th className={`px-4 sm:px-6 py-4 text-center text-xs sm:text-sm font-bold ${c.colorClasses.textStrong} ${c.colorClasses.bg}`}>Volia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.chiffresCles.map((row, i) => (
                      <tr key={i} className={`border-b ${c.colorClasses.border} last:border-b-0 ${i % 2 === 0 ? 'bg-white' : c.colorClasses.tableBg}`}>
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium text-content-primary">{row.label}</td>
                        <td className="px-4 sm:px-6 py-4 text-center text-sm text-content-secondary">{row.apollo}</td>
                        <td className={`px-4 sm:px-6 py-4 text-center text-sm font-semibold ${row.voliaWins === true ? c.colorClasses.textStrong : 'text-content-primary'} ${c.colorClasses.bg}/40`}>
                          {row.volia}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </MotionInView>
          </div>
        </section>

        {/* ─── 4. COMPARATIF FEATURES (gros tableau segmenté) ────── */}
        <section id="comparatif-features" className="px-4 sm:px-6 py-16 sm:py-20 border-b border-line bg-gradient-to-b from-white via-zinc-50/40 to-white">
          <div className="max-w-6xl mx-auto">
            <MotionInView>
              <div className="text-center mb-10">
                <ComparatifBadge data={{ ...c, hero: { eyebrow: 'Comparatif détaillé' } }} />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-3 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  Toutes les fonctionnalités, ligne par ligne
                </h2>
                <p className="text-content-tertiary text-base sm:text-lg max-w-2xl mx-auto">
                  {c.features.filter((f) => !f.section).length}+ critères analysés, regroupés par catégorie. Faites Ctrl+F pour chercher ce qui compte pour vous.
                </p>
              </div>
            </MotionInView>

            <MotionInView delay={100}>
              <div className={`overflow-x-auto rounded-2xl border-2 ${c.colorClasses.border} bg-white shadow-lg`}>
                <table className="w-full text-left min-w-[640px]">
                  <thead>
                    <tr className={`${c.colorClasses.bg} border-b-2 ${c.colorClasses.border} sticky top-0`}>
                      <th className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-bold text-content-primary uppercase tracking-wider">
                        Fonctionnalité
                      </th>
                      <th className="px-4 py-4 text-center w-32">
                        <div className="text-xs sm:text-sm font-bold text-content-secondary">{c.competitor.name}</div>
                      </th>
                      <th className={`px-4 py-4 text-center w-32 ${c.colorClasses.bg} border-l-2 ${c.colorClasses.borderStrong}`}>
                        <div className={`text-xs sm:text-sm font-bold ${c.colorClasses.textStrong}`}>Volia</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.features.map((row, i) => {
                      if (row.section) {
                        return (
                          <tr key={i} className="bg-zinc-100">
                            <td colSpan={3} className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold text-zinc-700 uppercase tracking-wider">
                              {row.section}
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={i} className={`border-b ${c.colorClasses.border}/60 last:border-b-0 hover:bg-zinc-50/60`}>
                          <td className="px-4 sm:px-6 py-3.5 text-sm text-content-primary">
                            <div className="font-medium">{row.label}</div>
                            {row.note && (
                              <div className="mt-1 text-xs text-content-tertiary leading-snug">{row.note}</div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <FeatureCell value={row.apollo} />
                          </td>
                          <td className={`px-4 py-3.5 text-center ${c.colorClasses.bg}/30 border-l-2 ${c.colorClasses.borderStrong}/40`}>
                            <FeatureCell value={row.volia} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </MotionInView>

            {/* Légende */}
            <MotionInView delay={200}>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-content-tertiary">
                <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-600" strokeWidth={3} /> Inclus</span>
                <span className="inline-flex items-center gap-1.5"><X size={14} className="text-rose-400" strokeWidth={2.5} /> Absent</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold">½</span>
                  Partiel / limité
                </span>
              </div>
            </MotionInView>
          </div>
        </section>

        {/* ─── 5. ANALYSE APPROFONDIE ─────────────────────────────── */}
        <section className="px-4 sm:px-6 py-16 sm:py-20 border-b border-line">
          <div className="max-w-4xl mx-auto">
            <MotionInView>
              <div className="text-center mb-12">
                <ComparatifBadge data={{ ...c, hero: { eyebrow: 'Analyse approfondie' } }} />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-3 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  Au-delà des cases cochées
                </h2>
                <p className="text-content-tertiary text-base sm:text-lg max-w-2xl mx-auto">
                  Les vraies différences se jouent sur 5 dimensions concrètes. Voici notre analyse, sans complaisance.
                </p>
              </div>
            </MotionInView>

            <div className="space-y-10">
              {c.analyses.map((a, i) => (
                <MotionInView key={i} delay={i * 80}>
                  <article className="prose-content">
                    <h3 className="text-xl sm:text-2xl font-bold text-content-primary mb-3 flex items-start gap-3">
                      <span className={`flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${c.colorClasses.buttonGradient} text-white text-sm font-bold shadow-sm`}>
                        {i + 1}
                      </span>
                      {a.title}
                    </h3>
                    <p className="text-base text-content-secondary leading-relaxed pl-11">
                      {a.body}
                    </p>
                  </article>
                </MotionInView>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 6. PERSONAS (3 cas concrets) ───────────────────────── */}
        <section className={`px-4 sm:px-6 py-16 sm:py-20 border-b border-line ${c.colorClasses.softGradient}`}>
          <div className="max-w-6xl mx-auto">
            <MotionInView>
              <div className="text-center mb-12">
                <ComparatifBadge data={{ ...c, hero: { eyebrow: '3 cas concrets' } }} />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-3 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  Quel outil pour quel profil ?
                </h2>
                <p className="text-content-tertiary text-base sm:text-lg max-w-2xl mx-auto">
                  3 personas typiques, l&apos;économie chiffrée et notre recommandation explicite.
                </p>
              </div>
            </MotionInView>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {c.personas.map((p, i) => (
                <MotionInView key={i} delay={i * 120}>
                  <div className={`h-full p-6 rounded-2xl border-2 ${c.colorClasses.border} bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col`}>
                    <div className={`inline-flex items-center gap-2 mb-4 px-2.5 py-1 rounded-md ${c.colorClasses.bg} ${c.colorClasses.text} text-[10px] font-bold uppercase tracking-wider w-fit`}>
                      Persona {i + 1}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-content-primary mb-4 leading-tight">{p.title}</h3>

                    <div className="space-y-2.5 mb-4 text-xs sm:text-sm">
                      <div className="flex items-start gap-2">
                        <X size={14} className="flex-shrink-0 text-rose-500 mt-0.5" strokeWidth={2.5} />
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-content-tertiary font-bold mb-0.5">Avant</div>
                          <div className="text-content-secondary leading-snug">{p.before}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check size={14} className={`flex-shrink-0 ${c.colorClasses.text} mt-0.5`} strokeWidth={3} />
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-content-tertiary font-bold mb-0.5">Avec Volia</div>
                          <div className="text-content-primary font-medium leading-snug">{p.after}</div>
                        </div>
                      </div>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br ${c.colorClasses.buttonGradient} text-white text-xs font-bold shadow-md mb-3`}>
                      <Wallet size={13} />
                      <span>Économie : {p.savings}</span>
                    </div>

                    <p className="text-xs text-content-secondary italic leading-snug mt-auto">
                      <strong className="not-italic font-semibold text-content-primary">Verdict :</strong> {p.verdict}
                    </p>
                  </div>
                </MotionInView>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 7. MIGRATION STEP-BY-STEP ──────────────────────────── */}
        <section className="px-4 sm:px-6 py-16 sm:py-20 border-b border-line">
          <div className="max-w-4xl mx-auto">
            <MotionInView>
              <div className="text-center mb-10">
                <ComparatifBadge data={{ ...c, hero: { eyebrow: 'Guide de migration' } }} />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-3 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  Comment passer de {c.competitor.name} à Volia
                </h2>
                <p className="text-content-tertiary text-base sm:text-lg max-w-2xl mx-auto">
                  {c.migration.intro}
                </p>
                <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full ${c.colorClasses.bg} ${c.colorClasses.text} text-sm font-semibold`}>
                  <Clock size={14} />
                  Temps total estimé : {c.migration.totalTime}
                </div>
              </div>
            </MotionInView>

            <div className="space-y-4">
              {c.migration.steps.map((step, i) => (
                <MotionInView key={i} delay={i * 60}>
                  <div className={`flex items-start gap-4 p-5 sm:p-6 rounded-xl border ${c.colorClasses.border} bg-white hover:shadow-md transition-all`}>
                    <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${c.colorClasses.buttonGradient} text-white flex items-center justify-center font-bold shadow-md text-sm sm:text-base`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-3 mb-1.5 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-content-primary">{step.title}</h3>
                        <span className="text-xs text-content-tertiary font-mono whitespace-nowrap">{step.time}</span>
                      </div>
                      <p className="text-sm text-content-secondary leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </MotionInView>
              ))}
            </div>

            {/* FAQ migration */}
            <MotionInView delay={200}>
              <div className="mt-10 p-6 rounded-2xl border border-line bg-zinc-50/60">
                <h3 className="text-base sm:text-lg font-bold text-content-primary mb-4 flex items-center gap-2">
                  <FileText size={16} className={c.colorClasses.text} />
                  Questions courantes sur la migration
                </h3>
                <div className="space-y-4">
                  {c.migration.faqMigration.map((qa, i) => (
                    <div key={i}>
                      <div className="text-sm font-semibold text-content-primary mb-1">{qa.q}</div>
                      <div className="text-sm text-content-secondary leading-relaxed">{qa.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </MotionInView>
          </div>
        </section>

        {/* ─── 8. TÉMOIGNAGE MIGRATION ────────────────────────────── */}
        <section className={`px-4 sm:px-6 py-16 sm:py-20 border-b border-line bg-gradient-to-br ${c.colorClasses.bgGradient} relative overflow-hidden`}>
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${c.colorClasses.bg} rounded-full blur-3xl pointer-events-none opacity-30`} />

          <MotionInView className="max-w-4xl mx-auto text-center relative z-10">
            <div className={`text-6xl sm:text-7xl ${c.colorClasses.text} opacity-30 leading-none mb-4 font-serif`}>“</div>
            <blockquote className="text-xl sm:text-2xl lg:text-3xl font-medium text-content-primary leading-snug mb-8 tracking-tight">
              {c.temoignage.quote}
            </blockquote>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${c.temoignage.avatarGradient} ring-4 ring-white shadow-lg flex items-center justify-center text-white text-base font-bold`}>
                  {c.temoignage.avatar}
                </div>
                <div className="text-left">
                  <div className="text-base font-bold text-content-primary">{c.temoignage.author}</div>
                  <div className="text-sm text-content-tertiary">{c.temoignage.role}</div>
                </div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-line" />
              <div className="text-center sm:text-left">
                <div className={`text-2xl font-bold font-mono bg-gradient-to-br ${c.colorClasses.buttonGradient} bg-clip-text text-transparent`}>
                  {c.temoignage.metric}
                </div>
                <div className="text-xs text-content-tertiary">{c.temoignage.metricLabel}</div>
              </div>
            </div>
          </MotionInView>
        </section>

        {/* ─── 9. FAQ ─────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 py-16 sm:py-20 border-b border-line">
          <div className="max-w-3xl mx-auto">
            <MotionInView>
              <div className="text-center mb-10">
                <ComparatifBadge data={{ ...c, hero: { eyebrow: 'FAQ comparatif' } }} />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-3 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  Vos questions, nos réponses
                </h2>
                <p className="text-content-tertiary text-base sm:text-lg">
                  10 questions courantes posées par les utilisateurs hésitant entre {c.competitor.name} et Volia.
                </p>
              </div>
            </MotionInView>

            <div className="space-y-3">
              {c.faq.map((qa, i) => (
                <MotionInView key={i} delay={i * 40}>
                  <details className={`group rounded-xl border ${c.colorClasses.border} bg-white hover:shadow-md transition-all overflow-hidden`}>
                    <summary className="px-5 py-4 cursor-pointer list-none flex items-start gap-3 hover:bg-zinc-50/60">
                      <span className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full ${c.colorClasses.bg} ${c.colorClasses.text} flex items-center justify-center text-xs font-bold`}>
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm sm:text-base font-semibold text-content-primary">{qa.q}</span>
                      <ChevronRight size={18} className="flex-shrink-0 text-content-tertiary mt-1 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="px-5 pb-5 pl-14 text-sm text-content-secondary leading-relaxed">
                      {qa.a}
                    </div>
                  </details>
                </MotionInView>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 10. VERDICT FINAL + CTA ────────────────────────────── */}
        <section className={`px-4 sm:px-6 py-16 sm:py-20 bg-gradient-to-br ${c.colorClasses.bgGradient} relative overflow-hidden`}>
          <div className={`absolute top-0 right-1/4 w-96 h-96 ${c.colorClasses.bg} rounded-full blur-3xl pointer-events-none opacity-40`} />

          <div className="max-w-5xl mx-auto relative z-10">
            <MotionInView>
              <div className="text-center mb-10">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${c.colorClasses.badgeBorder} ${c.colorClasses.badgeBg} ${c.colorClasses.badgeText} text-[11px] font-bold uppercase tracking-wider`}>
                  <Award size={12} />
                  Verdict 2026
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-3 tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  Notre verdict final
                </h2>
              </div>
            </MotionInView>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              {/* Volia wins */}
              <MotionInView delay={100}>
                <div className={`h-full p-6 sm:p-7 rounded-2xl border-2 ${c.colorClasses.borderStrong} bg-white shadow-md`}>
                  <h3 className={`text-lg font-bold ${c.colorClasses.textStrong} mb-4 flex items-center gap-2`}>
                    <Check size={18} className={c.colorClasses.text} strokeWidth={3} />
                    Volia gagne sur
                  </h3>
                  <ul className="space-y-2.5">
                    {c.verdict.voliaWins.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-content-secondary">
                        <Check size={14} className={`flex-shrink-0 mt-0.5 ${c.colorClasses.text}`} strokeWidth={3} />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </MotionInView>

              {/* Competitor wins (honest) */}
              <MotionInView delay={180}>
                <div className="h-full p-6 sm:p-7 rounded-2xl border-2 border-zinc-200 bg-white shadow-md">
                  <h3 className="text-lg font-bold text-zinc-700 mb-4 flex items-center gap-2">
                    <Award size={18} className="text-zinc-500" />
                    {c.competitor.name} gagne sur
                  </h3>
                  <ul className="space-y-2.5">
                    {c.verdict.competitorWins.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-content-secondary">
                        <Check size={14} className="flex-shrink-0 mt-0.5 text-zinc-500" strokeWidth={3} />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-content-tertiary italic">
                    On préfère reconnaître honnêtement les forces du concurrent — c&apos;est la meilleure façon de vous aider à décider.
                  </p>
                </div>
              </MotionInView>
            </div>

            <MotionInView delay={260}>
              <div className={`p-6 sm:p-8 rounded-3xl border-2 ${c.colorClasses.borderStrong} bg-gradient-to-br from-white ${c.colorClasses.bg}/30 shadow-xl text-center`}>
                <TrendingDown size={32} className={`mx-auto mb-4 ${c.colorClasses.text}`} />
                <p className="text-base sm:text-lg text-content-primary leading-relaxed mb-6 max-w-3xl mx-auto">
                  {c.verdict.conclusion}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/signup?plan=pro"
                    className={`group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r ${c.colorClasses.buttonGradient} ${c.colorClasses.buttonHover} text-white font-bold shadow-xl hover:-translate-y-0.5 transition-all`}
                  >
                    <Sparkles size={16} className="text-amber-200" />
                    Démarrer avec Volia gratuitement
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-line hover:border-content-tertiary bg-white text-content-primary font-semibold transition-all"
                  >
                    Voir tous nos tarifs
                    <ChevronRight size={16} />
                  </Link>
                </div>
                <p className="mt-3 text-xs text-content-tertiary">
                  <ShieldCheck size={12} className="inline mr-1 text-emerald-600" />
                  100 prospects gratuits · Sans CB · Annulation 1 clic · Made in France
                </p>
              </div>
            </MotionInView>

            {/* Maillage interne — autres comparatifs */}
            <MotionInView delay={340}>
              <div className="mt-12 pt-8 border-t border-line">
                <div className="text-center mb-6">
                  <p className="text-xs uppercase tracking-wider text-content-tertiary font-bold mb-2">Continuer la comparaison</p>
                  <h3 className="text-lg font-semibold text-content-primary">Autres comparatifs détaillés</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InternalLink href="/comparatif/apollo-vs-volia" label="Apollo vs Volia" desc="Prospection — économie 80 €/mo" active={c.slug === 'apollo-vs-volia'} colorClasses={c.colorClasses} />
                  <InternalLink href="/comparatif/lemlist-vs-volia" label="Lemlist vs Volia" desc="Campagnes — économie 150 €/mo" active={c.slug === 'lemlist-vs-volia'} colorClasses={c.colorClasses} />
                  <InternalLink href="/comparatif/hubspot-vs-volia" label="HubSpot vs Volia" desc="CRM — économie 400 €/mo" active={c.slug === 'hubspot-vs-volia'} colorClasses={c.colorClasses} />
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs">
                  <Link href={`/vs/${c.competitor.slug}`} className="px-3 py-1.5 rounded-full border border-line bg-white hover:border-content-tertiary text-content-tertiary hover:text-content-secondary transition">
                    Voir aussi : page courte /vs/{c.competitor.slug}
                  </Link>
                  <Link href={`/produits/${c.module}`} className="px-3 py-1.5 rounded-full border border-line bg-white hover:border-content-tertiary text-content-tertiary hover:text-content-secondary transition">
                    Découvrir Volia {c.module.charAt(0).toUpperCase() + c.module.slice(1)}
                  </Link>
                  <Link href="/pricing" className="px-3 py-1.5 rounded-full border border-line bg-white hover:border-content-tertiary text-content-tertiary hover:text-content-secondary transition">
                    Comparer tous les tarifs Volia
                  </Link>
                </div>
              </div>
            </MotionInView>
          </div>
        </section>
      </main>

      <ReaderFooter />
    </div>
  );
}

function InternalLink({ href, label, desc, active, colorClasses }) {
  if (active) {
    return (
      <div className={`p-4 rounded-xl border-2 ${colorClasses.borderStrong} ${colorClasses.bg} text-center opacity-60 cursor-default`}>
        <div className={`text-sm font-bold ${colorClasses.textStrong} flex items-center justify-center gap-1.5`}>
          <Star size={12} className="fill-current" />
          {label}
        </div>
        <div className="text-xs text-content-tertiary mt-1">Vous êtes ici</div>
      </div>
    );
  }
  return (
    <Link
      href={href}
      className={`group p-4 rounded-xl border ${colorClasses.border} bg-white hover:shadow-md hover:-translate-y-0.5 transition-all text-center`}
    >
      <div className="text-sm font-bold text-content-primary group-hover:text-content-primary flex items-center justify-center gap-1.5">
        {label}
        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
      <div className="text-xs text-content-tertiary mt-1">{desc}</div>
    </Link>
  );
}
