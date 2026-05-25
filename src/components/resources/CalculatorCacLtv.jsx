'use client';

import { useMemo, useState } from 'react';
import { Calculator, Info, ShieldCheck, RotateCcw, Share2, Check } from 'lucide-react';
import { useCalculatorState } from './useCalculatorState';
import CountUp from './CountUp';
import { PaybackTimeline } from './Charts';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);
const fmtEur = (n) => `${fmt(n)} €`;
const fmtPct = (n) => `${(Math.round(n * 10) / 10)}%`;

/**
 * Calculateur CAC / LTV pour SaaS B2B.
 *
 * Calcule :
 * - LTV (Lifetime Value)
 * - Ratio CAC/LTV
 * - CAC Payback (mois)
 * - Diagnostic vs benchmark
 */
const DEFAULTS = { cac: 800, arpu: 99, grossMargin: 80, churnMensuel: 3, expansionMensuelle: 1 };

const PRESETS = {
  'TPE / Freelance': { cac: 400, arpu: 29, grossMargin: 85, churnMensuel: 5, expansionMensuelle: 0.5 },
  'PME': { cac: 800, arpu: 99, grossMargin: 80, churnMensuel: 3, expansionMensuelle: 1 },
  'Mid-market': { cac: 4000, arpu: 500, grossMargin: 78, churnMensuel: 2, expansionMensuelle: 1.5 },
  'Enterprise': { cac: 25000, arpu: 2500, grossMargin: 75, churnMensuel: 1, expansionMensuelle: 2 },
};

export default function CalculatorCacLtv() {
  const { state, setField, setMany, reset, getShareUrl } = useCalculatorState('cac-ltv', DEFAULTS);
  const { cac, arpu, grossMargin, churnMensuel, expansionMensuelle } = state;
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {}
  };

  const results = useMemo(() => {
    // Net churn (churn - expansion)
    const netChurn = Math.max(0.01, churnMensuel - expansionMensuelle); // évite div par 0
    // Durée moyenne client : 1 / churn (en mois)
    const dureeMoyenne = 100 / netChurn;
    // LTV brute = ARPU × durée
    const ltvBrute = arpu * dureeMoyenne;
    // LTV nette = LTV × marge brute
    const ltvNette = ltvBrute * (grossMargin / 100);

    // Ratios
    const ratioBrute = cac > 0 ? ltvBrute / cac : 0;
    const ratioNette = cac > 0 ? ltvNette / cac : 0;

    // CAC payback (en mois, avec marge brute)
    const margeMensuelle = arpu * (grossMargin / 100);
    const cacPayback = margeMensuelle > 0 ? cac / margeMensuelle : 0;

    // NRR (Net Revenue Retention) annuel approximatif
    const nrrAnnuel = 100 + (expansionMensuelle - churnMensuel) * 12;

    return {
      dureeMoyenne,
      ltvBrute,
      ltvNette,
      ratioBrute,
      ratioNette,
      cacPayback,
      nrrAnnuel,
    };
  }, [cac, arpu, grossMargin, churnMensuel, expansionMensuelle]);

  const verdict = useMemo(() => {
    if (results.ratioNette >= 5) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', advice: 'Vous pouvez investir agressivement en acquisition.' };
    if (results.ratioNette >= 3) return { label: 'Sain', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', advice: 'Ratio cible atteint. Scalez en parallèle des fondations.' };
    if (results.ratioNette >= 1.5) return { label: 'À optimiser', color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-400', advice: 'Réduire le CAC ou augmenter la LTV (anti-churn, upsell).' };
    return { label: 'Critique', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', advice: 'Votre business saigne. Ne pas scaler avant correction.' };
  }, [results.ratioNette]);

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 inline-flex items-center gap-1">
            <Calculator size={11} />
            Calculateur
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Calculateur CAC / LTV SaaS B2B</h1>
        <p className="text-content-secondary leading-relaxed">
          Calculez votre CAC, LTV, ratio CAC/LTV et CAC payback. Comparez vs benchmarks
          France 2026 et obtenez un verdict actionnable.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <section className="rounded-2xl border border-line bg-surface-card p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck size={18} className="text-violet-400" />
              Vos métriques
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-surface-elevated hover:bg-violet-500/10 text-content-secondary hover:text-violet-300 border border-line hover:border-violet-500/30 transition"
                title="Copier le lien partageable"
              >
                {shareCopied ? <Check size={11} className="text-green-400" /> : <Share2 size={11} />}
                {shareCopied ? 'Copié' : 'Partager'}
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-surface-elevated hover:bg-amber-500/10 text-content-secondary hover:text-amber-600 border border-line hover:border-amber-400 transition"
                title="Réinitialiser"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="mb-4 -mt-1">
            <div className="text-xs text-content-tertiary mb-1.5">Charger un benchmark :</div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(PRESETS).map(([name, preset]) => (
                <button
                  key={name}
                  onClick={() => setMany(preset)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 transition"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Field label="CAC (Coût d'Acquisition Client) €" hint="Marketing + sales + outils ÷ nouveaux clients. France 2026 : 600-1500 € TPE/PME." value={cac} onChange={(v) => setField('cac', v)} min={50} max={50000} step={50} fmt={fmtEur} />
            <Field label="ARPU (Revenu mensuel par user) €" hint="Average Revenue Per User. MRR / nb clients actifs." value={arpu} onChange={(v) => setField('arpu', v)} min={5} max={10000} step={5} fmt={fmtEur} />
            <Field label="Marge brute (%)" hint="Cible SaaS B2B : 75-85% (vs 30-50% e-commerce)." value={grossMargin} onChange={(v) => setField('grossMargin', v)} min={20} max={95} step={1} fmt={fmtPct} />
            <Field label="Churn mensuel (%)" hint="% clients perdus / mois. Excellent : < 2%. Critique : > 10%." value={churnMensuel} onChange={(v) => setField('churnMensuel', v)} min={0.1} max={20} step={0.1} fmt={fmtPct} />
            <Field label="Expansion MRR mensuelle (%)" hint="Upsell + cross-sell. NRR = 100 + (expansion − churn) × 12." value={expansionMensuelle} onChange={(v) => setField('expansionMensuelle', v)} min={0} max={10} step={0.1} fmt={fmtPct} />
          </div>
        </section>

        <section className="space-y-4">
          {/* Verdict */}
          <div className={`rounded-2xl border ${verdict.border} ${verdict.bg} p-5`}>
            <div className="text-xs text-content-tertiary uppercase tracking-wider mb-1">Verdict</div>
            <div className={`text-2xl font-bold ${verdict.color} mb-2`}>{verdict.label}</div>
            <div className="text-sm text-content-secondary leading-relaxed">{verdict.advice}</div>
          </div>

          {/* Ratios principaux */}
          <div className="grid grid-cols-2 gap-3">
            <ResultCard
              label="LTV nette"
              value={fmtEur(results.ltvNette)}
              sub={`LTV brute : ${fmtEur(results.ltvBrute)}`}
            />
            <ResultCard
              label="Ratio CAC/LTV"
              value={`1 : ${results.ratioNette.toFixed(1)}`}
              sub={`Cible : 1:3 minimum`}
            />
            <ResultCard
              label="CAC Payback"
              value={`${results.cacPayback.toFixed(1)} mois`}
              sub={`Cible : < 18 mois`}
            />
            <ResultCard
              label="Durée moyenne client"
              value={`${results.dureeMoyenne.toFixed(0)} mois`}
              sub={`Soit ${(results.dureeMoyenne / 12).toFixed(1)} ans`}
            />
          </div>

          {/* NRR */}
          <div className="rounded-2xl border border-line bg-surface-card p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-content-tertiary uppercase tracking-wider">NRR (Net Revenue Retention)</div>
              <div className={`text-xs px-2 py-0.5 rounded-full ${results.nrrAnnuel >= 100 ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-600'}`}>
                {results.nrrAnnuel >= 100 ? '✓ Croissance organique' : '⚠ Décroissance'}
              </div>
            </div>
            <div className={`text-3xl font-bold mb-1 tabular-nums ${results.nrrAnnuel >= 100 ? 'text-green-400' : 'text-amber-600'}`}>
              <CountUp value={results.nrrAnnuel} formatter={(n) => `${Math.round(n)}%`} />
            </div>
            <div className="text-xs text-content-secondary">
              NRR &gt; 100% = votre base existante grandit même sans nouveaux clients (rêve SaaS).
            </div>
          </div>

          {/* Timeline payback SVG */}
          <div className="rounded-2xl border border-line bg-surface-card p-5">
            <div className="text-xs text-content-tertiary uppercase tracking-wider mb-2">Projection LTV cumulée vs CAC (36 mois)</div>
            <PaybackTimeline
              cac={cac}
              monthlyMargin={arpu * (grossMargin / 100)}
              totalMonths={36}
            />
          </div>
        </section>
      </div>

      {/* Benchmark + méthodo */}
      <section className="rounded-2xl border border-line bg-surface-card p-5 mb-8">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Info size={18} className="text-violet-400" />
          Benchmarks France 2026
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 text-content-tertiary font-medium">Segment</th>
                <th className="text-left py-2 text-content-tertiary font-medium">CAC moyen</th>
                <th className="text-left py-2 text-content-tertiary font-medium">LTV moyenne</th>
                <th className="text-left py-2 text-content-tertiary font-medium">Ratio</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line">
                <td className="py-2 text-content-primary">TPE / Freelance</td>
                <td className="py-2 font-mono text-violet-300">300-800 €</td>
                <td className="py-2 font-mono text-violet-300">1 200-3 500 €</td>
                <td className="py-2 font-mono text-content-secondary">1:3-4</td>
              </tr>
              <tr className="border-b border-line">
                <td className="py-2 text-content-primary">PME</td>
                <td className="py-2 font-mono text-violet-300">600-1 500 €</td>
                <td className="py-2 font-mono text-violet-300">2 500-8 000 €</td>
                <td className="py-2 font-mono text-content-secondary">1:3-5</td>
              </tr>
              <tr className="border-b border-line">
                <td className="py-2 text-content-primary">Mid-market</td>
                <td className="py-2 font-mono text-violet-300">2 000-8 000 €</td>
                <td className="py-2 font-mono text-violet-300">10 000-40 000 €</td>
                <td className="py-2 font-mono text-content-secondary">1:3-6</td>
              </tr>
              <tr>
                <td className="py-2 text-content-primary">Enterprise</td>
                <td className="py-2 font-mono text-violet-300">10 000-50 000 €</td>
                <td className="py-2 font-mono text-violet-300">50 000-300 000 €</td>
                <td className="py-2 font-mono text-content-secondary">1:5-10</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-content-tertiary mt-3">
          Source : <a href="/etude/prospection-b2b-france-2026" className="text-violet-400 hover:underline">étude Volia 2026</a> +
          OpenView SaaS Benchmarks 2025 + Forrester 2025.
        </p>
      </section>
    </div>
  );
}

function Field({ label, hint, value, onChange, min, max, step, fmt }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label className="text-sm font-medium text-content-primary">{label}</label>
        <span className="text-xs font-mono font-semibold text-violet-300 tabular-nums whitespace-nowrap">
          {fmt ? fmt(value) : value.toLocaleString('fr-FR')}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 accent-violet-500 min-w-0"
        />
        <input
          type="number"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 sm:w-24 px-2 py-1 rounded bg-surface-base border border-line text-sm font-mono text-right tabular-nums focus:outline-none focus:border-violet-500 transition"
          aria-label={`${label} (saisie numérique)`}
        />
      </div>
      {hint && <div className="text-xs text-content-tertiary mt-1">{hint}</div>}
    </div>
  );
}

function ResultCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-line bg-surface-card p-4">
      <div className="text-xs text-content-tertiary uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xl font-bold text-content-primary mb-0.5">{value}</div>
      <div className="text-xs text-content-tertiary">{sub}</div>
    </div>
  );
}
