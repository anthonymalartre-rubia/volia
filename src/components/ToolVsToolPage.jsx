import Link from 'next/link';
import {
  ArrowLeft, Check, X, Sparkles, TrendingDown, Euro, Globe,
  ShieldCheck, Users, Zap, ExternalLink,
} from 'lucide-react';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';
import { LogoIcon } from '@/components/ui';
import BookDemoButton from '@/components/BookDemoButton';

/**
 * Composant rendu pour /outils/comparatif/[X]-vs-[Y].
 *
 * Affiche un comparatif côte-à-côte entre deux outils du dataset
 * competitors.js, sans Volia (Volia apparaît en bottom
 * comme alternative française recommandée).
 *
 * Le calcul de l'écart de prix est fait côté serveur dans la page.
 */
export default function ToolVsToolPage({ a, b }) {
  const cheaper = a.pricing <= b.pricing ? a : b;
  const expensive = cheaper === a ? b : a;
  const savingsPct = Math.round(((expensive.pricing - cheaper.pricing) / expensive.pricing) * 100);

  // Détection rapide du "winner" sur 4 critères pour le résumé
  const aIsFrench = a.bestFor.toLowerCase().includes('français') || a.bestFor.toLowerCase().includes('france');
  const bIsFrench = b.bestFor.toLowerCase().includes('français') || b.bestFor.toLowerCase().includes('france');

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <ReaderHeader />

      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
          <Link href="/outils/comparatif" className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-violet-400 transition">
            <ArrowLeft size={14} />
            Tous les comparatifs
          </Link>
        </div>

        <article className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="mb-12">
            <div className="flex items-center gap-3 text-xs text-content-tertiary mb-4">
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 inline-flex items-center gap-1">
                <Users size={11} />
                Comparatif 2026
              </span>
              <span>Mis à jour : 21 mai 2026</span>
              <span>·</span>
              <span>Anthony Malartre</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.05] mb-6">
              {a.name} <span className="text-violet-400">vs</span> {b.name} <span className="text-content-tertiary text-2xl sm:text-3xl">(2026)</span>
            </h1>

            <p className="text-lg sm:text-xl text-content-secondary leading-relaxed mb-6">
              Comparatif côte-à-côte : prix, fonctionnalités, couverture France, RGPD, et verdict par profil utilisateur.
            </p>
          </div>

          {/* Side-by-side cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12">
            {[a, b].map((tool) => (
              <div
                key={tool.slug}
                className="rounded-2xl border border-line bg-surface-card p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-content-primary mb-1">{tool.name}</h2>
                    <p className="text-xs text-content-tertiary">{tool.tagline}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-violet-300 font-mono">{tool.pricing}</div>
                    <div className="text-xs text-content-tertiary">{tool.pricingUnit}</div>
                  </div>
                </div>

                <p className="text-sm text-content-secondary leading-relaxed mb-4">
                  {tool.description}
                </p>

                <div className="text-xs text-content-tertiary uppercase tracking-wider mb-2">Idéal pour</div>
                <p className="text-sm text-content-primary font-medium mb-4">{tool.bestFor}</p>

                <a
                  href={`https://${tool.domain}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1.5 text-xs text-violet-300 hover:text-violet-200"
                >
                  {tool.domain} <ExternalLink size={11} />
                </a>
              </div>
            ))}
          </div>

          {/* En résumé */}
          <div className="mb-12 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.05] p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-violet-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">En résumé</span>
            </div>
            <ul className="space-y-2 text-sm sm:text-base text-content-secondary leading-relaxed">
              <li className="flex gap-2">
                <span className="text-violet-400 flex-shrink-0">→</span>
                <span>
                  <strong className="text-content-primary">Prix le moins cher</strong> : {cheaper.name} à {cheaper.pricing} {cheaper.pricingUnit}
                  {savingsPct > 0 && ` (${savingsPct}% moins cher que ${expensive.name})`}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-400 flex-shrink-0">→</span>
                <span>
                  <strong className="text-content-primary">Meilleur pour la France</strong> :{' '}
                  {aIsFrench && !bIsFrench ? `${a.name} (équipe française)` :
                   bIsFrench && !aIsFrench ? `${b.name} (équipe française)` :
                   aIsFrench && bIsFrench ? `Les deux sont français` :
                   `Aucun n'est positionné spécifiquement France (préférer Volia)`}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-400 flex-shrink-0">→</span>
                <span>
                  <strong className="text-content-primary">{a.name}</strong> : {a.strengths[0]}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-400 flex-shrink-0">→</span>
                <span>
                  <strong className="text-content-primary">{b.name}</strong> : {b.strengths[0]}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-400 flex-shrink-0">→</span>
                <span>
                  <strong className="text-content-primary">Alternative française</strong> : Volia à 49 €/mois (dès 19 € avec ETE2026), combine sourcing (Google Places) + enrichissement email + RGPD natif
                </span>
              </li>
            </ul>
          </div>

          {/* Avantages */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Avantages comparés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {[a, b].map((tool) => (
              <div key={tool.slug} className="rounded-2xl border border-line bg-surface-card p-5">
                <h3 className="font-bold text-content-primary mb-3 flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  {tool.name}
                </h3>
                <ul className="space-y-2">
                  {tool.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-content-secondary">
                      <Check size={14} className="text-green-400 flex-shrink-0 mt-1" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Limites */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Limites comparées</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {[a, b].map((tool) => (
              <div key={tool.slug} className="rounded-2xl border border-line bg-surface-card p-5">
                <h3 className="font-bold text-content-primary mb-3 flex items-center gap-2">
                  <X size={16} className="text-red-400" />
                  {tool.name}
                </h3>
                <ul className="space-y-2">
                  {tool.weaknesses.map((w, i) => (
                    <li key={i} className="flex gap-2 text-sm text-content-secondary">
                      <X size={14} className="text-red-400 flex-shrink-0 mt-1" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Verdict par profil */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Quel choisir selon votre profil ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <div className="rounded-2xl border border-line bg-surface-card p-5">
              <h3 className="font-semibold text-violet-300 mb-2 flex items-center gap-2">
                <Euro size={16} />
                Budget serré
              </h3>
              <p className="text-sm text-content-secondary leading-relaxed">
                Choisissez <strong className="text-content-primary">{cheaper.name}</strong> à {cheaper.pricing} {cheaper.pricingUnit} {savingsPct > 0 && `(${savingsPct}% moins cher)`}.
                Encore moins cher : Volia à 19 €/mois avec sourcing inclus.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface-card p-5">
              <h3 className="font-semibold text-violet-300 mb-2 flex items-center gap-2">
                <Globe size={16} />
                Marché France
              </h3>
              <p className="text-sm text-content-secondary leading-relaxed">
                {aIsFrench && !bIsFrench ? `${a.name} est plus adapté (équipe française).` :
                 bIsFrench && !aIsFrench ? `${b.name} est plus adapté (équipe française).` :
                 `Aucun des deux n'est positionné France-first. Préférer Volia (équipe + base FR natives).`}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface-card p-5">
              <h3 className="font-semibold text-violet-300 mb-2 flex items-center gap-2">
                <ShieldCheck size={16} />
                Conformité RGPD stricte
              </h3>
              <p className="text-sm text-content-secondary leading-relaxed">
                {aIsFrench && !bIsFrench ? `${a.name}` :
                 bIsFrench && !aIsFrench ? `${b.name}` :
                 `Préférer Dropcontact ou Volia (RGPD-by-design natifs).`}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface-card p-5">
              <h3 className="font-semibold text-violet-300 mb-2 flex items-center gap-2">
                <TrendingDown size={16} />
                Scale international
              </h3>
              <p className="text-sm text-content-secondary leading-relaxed">
                {a.bestFor.toLowerCase().includes('inter') || a.bestFor.toLowerCase().includes('mondial') ? a.name :
                 b.bestFor.toLowerCase().includes('inter') || b.bestFor.toLowerCase().includes('mondial') ? b.name :
                 `Aucun des deux n'est leader international. Pour scale mondial : Apollo, ZoomInfo, Cognism.`}
              </p>
            </div>
          </div>

          {/* Volia alternative card */}
          <div className="rounded-2xl border-2 border-violet-500/40 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.04] p-6 mb-12">
            <div className="flex items-start gap-4">
              <LogoIcon size="md" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                  <h3 className="text-lg font-bold text-content-primary">Volia, l&apos;alternative française aux deux</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">🇫🇷 Recommandée</span>
                </div>
                <p className="text-sm text-content-secondary leading-relaxed mb-3">
                  À partir de <strong className="text-content-primary">19 €/mois</strong>, Volia combine ce que {a.name} ET {b.name} ne font pas
                  individuellement : découverte d&apos;entreprises (Google Places, 150+ catégories, 101 départements) + enrichissement email
                  + conformité RGPD-by-design.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/signup" className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-300 hover:text-violet-200">
                    Essayer gratuitement →
                  </Link>
                  <Link href="/comparatif-outils-prospection-b2b-france" className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-300 hover:text-violet-200">
                    Voir le comparatif des 14 outils →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <Zap size={32} className="text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Essayez Volia gratuitement</h2>
            <p className="text-content-secondary mb-6 max-w-xl mx-auto">
              100 prospects offerts pour découvrir l&apos;alternative française à {a.name} et {b.name}.
              À partir de 19 €/mois — le ticket d&apos;entrée le moins cher du marché français.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
              >
                <Zap size={16} />
                Démarrer gratuitement
              </Link>
              <BookDemoButton
                label="Pas sûr ? Comparons en direct"
                variant="secondary"
                size="md"
                source={`vs_${a.slug || 'a'}_${b.slug || 'b'}`}
              />
            </div>
            <p className="mt-4 text-xs text-content-tertiary">
              15 min avec le founder pour comparer Volia, {a.name} et {b.name} sur votre cas réel.
            </p>
          </div>
        </article>
      </main>

      <ReaderFooter />
    </div>
  );
}
