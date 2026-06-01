'use client';

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Brain, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

export default function MetaAutonomyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysBack, setDaysBack] = useState(14);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/meta-autonomy/metrics?days=${daysBack}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erreur');
      setData(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function triggerGenerateRecos() {
    setGenerating(true);
    setGenerated(null);
    try {
      const res = await fetch('/api/admin/trigger-cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cron: 'meta-autonomy-recommendations' }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erreur');
      setGenerated(d.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => { loadData(); }, [daysBack]);

  if (loading && !data) return (
    <div className="px-6 py-12 text-center">
      <Loader2 className="animate-spin mx-auto text-content-soft" size={32} />
    </div>
  );

  const summary = data?.by_action_type || [];
  const overallRoi = data?.overall_roi_pct;

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-strong flex items-center gap-2">
            <Brain className="text-violet-500" size={24} />
            Méta-autonomie
          </h1>
          <p className="text-sm text-content-soft mt-1">
            ROI par boucle. Daily rollup à 2h CET.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={daysBack}
            onChange={(e) => setDaysBack(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 rounded-lg bg-surface-soft border border-line-soft text-sm"
          >
            <option value={7}>7j</option>
            <option value={14}>14j</option>
            <option value={30}>30j</option>
            <option value={90}>90j</option>
          </select>
          <button onClick={loadData} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-500 text-sm font-semibold">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Vue d'ensemble */}
      <section className="bg-surface-strong border border-line-soft rounded-xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-emerald-500" /> Vue d'ensemble ({daysBack}j)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Stat label="Actions tentées" value={data?.total_attempted || 0} />
          <Stat label="Succès" value={`${data?.overall_success_rate_pct || 0}%`} accent="emerald" />
          <Stat label="Coût estimé" value={`${data?.total_cost_eur || 0}€`} accent="red" />
          <Stat label="Valeur estimée" value={`${data?.total_value_eur || 0}€`} accent="emerald" />
          <Stat
            label="ROI"
            value={overallRoi !== null ? `${overallRoi}%` : 'N/A'}
            accent={overallRoi > 0 ? 'emerald' : 'red'}
          />
        </div>
      </section>

      {/* Détail par boucle */}
      <section className="bg-surface-strong border border-line-soft rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Détail par boucle ({summary.length})</h2>
        {summary.length === 0 ? (
          <p className="text-sm text-content-soft italic">
            Aucune metric. Lance le cron meta-autonomy-rollup pour agréger les données.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-soft text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left p-2">Boucle</th>
                  <th className="text-right p-2">Tentées</th>
                  <th className="text-right p-2">OK</th>
                  <th className="text-right p-2">Fail</th>
                  <th className="text-right p-2">Skip</th>
                  <th className="text-right p-2">Success%</th>
                  <th className="text-right p-2">Coût</th>
                  <th className="text-right p-2">Valeur</th>
                  <th className="text-right p-2">ROI</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((r) => (
                  <tr key={r.action_type} className="border-t border-line-soft hover:bg-surface-soft/30 transition">
                    <td className="p-2 font-mono text-xs">{r.action_type}</td>
                    <td className="p-2 text-right">{r.attempted}</td>
                    <td className="p-2 text-right text-emerald-600">{r.succeeded}</td>
                    <td className="p-2 text-right text-red-600">{r.failed}</td>
                    <td className="p-2 text-right text-content-soft">{r.skipped}</td>
                    <td className="p-2 text-right">{r.success_rate_pct}%</td>
                    <td className="p-2 text-right text-red-600">{r.cost}€</td>
                    <td className="p-2 text-right text-emerald-600">{r.value}€</td>
                    <td className="p-2 text-right font-semibold">
                      {r.roi_pct !== null ? (
                        <span className={r.roi_pct > 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {r.roi_pct}%
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Generate recos */}
      <section className="bg-surface-strong border border-line-soft rounded-xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-amber-500" /> Recommendations Claude
        </h2>
        <p className="text-sm text-content-soft mb-4">
          Claude analyse les 14 derniers jours et propose new boucles / optimizations / kill / combine.
          Auto-généré chaque mardi 10h CET avec l'email weekly review. Trigger manuel ici :
        </p>
        <button
          onClick={triggerGenerateRecos}
          disabled={generating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-500 text-sm font-semibold disabled:opacity-50"
        >
          {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Générer recommandations
        </button>
        {generated && (
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm">
            ✅ {generated.recommendations?.length || 0} recos insérées dans <a href="/admin/recommendations" className="underline font-semibold">/admin/recommendations</a>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, accent = 'slate' }) {
  const colors = {
    emerald: 'text-emerald-600',
    indigo: 'text-indigo-600',
    red: 'text-red-600',
    slate: 'text-slate-700',
  };
  return (
    <div className="p-4 bg-surface-soft rounded-lg border border-line-soft">
      <div className="text-xs text-content-soft uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${colors[accent] || colors.slate}`}>{value}</div>
    </div>
  );
}
