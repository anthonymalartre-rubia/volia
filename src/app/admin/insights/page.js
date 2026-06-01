'use client';

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, TrendingUp, Users, AlertTriangle, Target, BarChart3 } from 'lucide-react';

export default function InsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/insights/overview');
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erreur chargement');
      setData(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <div className="px-6 py-12 text-center">
      <Loader2 className="animate-spin mx-auto text-content-soft" size={32} />
    </div>
  );

  if (error) return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
    </div>
  );

  const mrr = data?.mrr || {};
  const churn = data?.churn || {};
  const cohorts = data?.cohorts || [];
  const attribution = data?.attribution || [];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-strong flex items-center gap-2">
            <BarChart3 className="text-indigo-500" size={24} />
            Insights
          </h1>
          <p className="text-sm text-content-soft mt-1">
            MRR · Churn · Cohorts · Attribution autonomy (généré : {data?.generated_at ? new Date(data.generated_at).toLocaleString('fr-FR') : '—'})
          </p>
        </div>
        <button onClick={loadData} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-sm font-semibold">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* MRR Snapshot */}
      <section className="bg-surface-strong border border-line-soft rounded-xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-emerald-500" /> Revenue
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Stat label="MRR" value={`${(mrr.total_mrr_eur || 0).toLocaleString('fr-FR')}€`} accent="emerald" />
          <Stat label="ARR" value={`${(mrr.total_arr_eur || 0).toLocaleString('fr-FR')}€`} accent="emerald" />
          <Stat label="Users payants" value={mrr.paid_users || 0} accent="indigo" />
          <Stat label="Total users" value={mrr.total_users || 0} accent="slate" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(mrr.by_plan || {}).map(([plan, p]) => (
            <div key={plan} className="px-3 py-2 bg-surface-soft rounded-lg border border-line-soft text-sm">
              <div className="font-semibold capitalize">{plan}</div>
              <div className="text-content-soft text-xs">{p.count} users · {p.mrr.toLocaleString('fr-FR')}€</div>
            </div>
          ))}
        </div>
      </section>

      {/* Churn */}
      <section className="bg-surface-strong border border-line-soft rounded-xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-red-500" /> Churn (30j)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Churn rate" value={`${churn.churn_rate_pct || 0}%`} accent={churn.churn_rate_pct > 5 ? 'red' : 'emerald'} />
          <Stat label="Churned" value={churn.churned || 0} accent="red" />
          <Stat label="Base" value={churn.base_at_start || 0} accent="slate" />
          <Stat label="Current paid" value={churn.current_paid || 0} accent="indigo" />
        </div>
      </section>

      {/* Cohorts */}
      <section className="bg-surface-strong border border-line-soft rounded-xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Users size={18} className="text-violet-500" /> Cohort retention (6 mois)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-soft text-xs uppercase">
              <tr>
                <th className="text-left p-2">Cohorte</th>
                <th className="text-right p-2">Signups</th>
                <th className="text-right p-2">Encore actifs</th>
                <th className="text-right p-2">Convertis payant</th>
                <th className="text-right p-2">Rétention</th>
                <th className="text-right p-2">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c) => (
                <tr key={c.month} className="border-t border-line-soft">
                  <td className="p-2 font-mono">{c.month}</td>
                  <td className="p-2 text-right">{c.signups}</td>
                  <td className="p-2 text-right">{c.still_active}</td>
                  <td className="p-2 text-right">{c.converted_paid}</td>
                  <td className="p-2 text-right">
                    <span className={c.retention_pct >= 70 ? 'text-emerald-600' : c.retention_pct >= 40 ? 'text-amber-600' : 'text-red-600'}>
                      {c.retention_pct}%
                    </span>
                  </td>
                  <td className="p-2 text-right">
                    <span className={c.conversion_pct >= 10 ? 'text-emerald-600' : 'text-content-soft'}>
                      {c.conversion_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Attribution */}
      <section className="bg-surface-strong border border-line-soft rounded-xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Target size={18} className="text-pink-500" /> Attribution autonomy (30j)
        </h2>
        <p className="text-xs text-content-soft mb-4">
          Pour chaque conversion trial → payant, on regarde quelles boucles autonomy ont touché le user dans les 7j précédents.
          {data?.attribution_meta?.total_conversions ? ` ${data.attribution_meta.total_conversions} conversions analysées.` : ''}
        </p>
        {attribution.length === 0 ? (
          <p className="text-sm text-content-soft italic">Aucune conversion sur la période (ou aucune touchée par une boucle autonomy).</p>
        ) : (
          <div className="space-y-2">
            {attribution.map((a) => (
              <div key={a.action_type} className="flex items-center justify-between p-3 bg-surface-soft rounded-lg">
                <span className="text-sm font-mono">{a.action_type}</span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-content-soft">{a.conversions_touched} conversions touchées</span>
                  <span className="font-semibold px-2 py-0.5 bg-pink-100 text-pink-700 rounded">
                    {a.attribution_pct}%
                  </span>
                </div>
              </div>
            ))}
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
