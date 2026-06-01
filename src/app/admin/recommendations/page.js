'use client';

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Lightbulb, Check, X, Rocket, Clock } from 'lucide-react';

const STATUS_LABELS = {
  pending: { label: 'En attente', color: 'amber', icon: Clock },
  accepted: { label: 'Acceptée', color: 'emerald', icon: Check },
  rejected: { label: 'Rejetée', color: 'red', icon: X },
  shipped: { label: 'Livrée', color: 'indigo', icon: Rocket },
};

export default function RecommendationsPage() {
  const [recos, setRecos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [updating, setUpdating] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const q = filter === 'all' ? '' : `?status=${filter}`;
      const res = await fetch(`/api/admin/recommendations/list${q}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erreur');
      setRecos(d.recommendations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus) {
    setUpdating(id);
    try {
      const res = await fetch('/api/admin/recommendations/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erreur');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  }

  useEffect(() => { load(); }, [filter]);

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-strong flex items-center gap-2">
            <Lightbulb className="text-amber-500" size={24} />
            Recommendations Claude
          </h1>
          <p className="text-sm text-content-soft mt-1">
            Nouvelles boucles / optimizations / kills proposées par Claude.
          </p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-500 text-sm font-semibold">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="flex items-center gap-2">
        {['pending', 'accepted', 'rejected', 'shipped', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === s
                ? 'bg-amber-600 text-white'
                : 'bg-surface-soft text-content-soft hover:bg-surface-strong'
            }`}
          >
            {s === 'all' ? 'Tous' : STATUS_LABELS[s]?.label || s}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="animate-spin mx-auto text-content-soft" size={32} />
        </div>
      ) : recos.length === 0 ? (
        <div className="text-center py-12 text-content-soft">
          <Lightbulb className="mx-auto mb-3 opacity-30" size={32} />
          <p>Aucune reco {filter !== 'all' ? `avec status "${filter}"` : ''}.</p>
          <p className="text-xs mt-2">
            Les recos sont générées par <a href="/admin/meta-autonomy" className="underline text-amber-600">Méta-autonomie</a> ou par le cron weekly review (mardi 10h CET).
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recos.map((r) => {
            const statusInfo = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
            const Icon = statusInfo.icon;
            return (
              <div key={r.id} className="bg-surface-strong border border-line-soft rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
                        <Icon size={11} /> {statusInfo.label}
                      </span>
                      <span className="text-xs text-content-soft">
                        {new Date(r.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-content-strong">{r.title}</h3>
                    {r.rationale && (
                      <p className="text-sm text-content-soft mt-2 leading-relaxed">{r.rationale}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-content-soft">
                      {r.estimated_effort_hours && (
                        <span>⏱ {r.estimated_effort_hours}h effort</span>
                      )}
                      {r.estimated_value_eur_month && (
                        <span>💶 ~{r.estimated_value_eur_month}€/mois</span>
                      )}
                      {r.pattern_detected && (
                        <span className="italic">📊 {r.pattern_detected}</span>
                      )}
                    </div>
                    {r.notes && (
                      <p className="text-xs text-content-soft mt-2 italic">Note : {r.notes}</p>
                    )}
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => updateStatus(r.id, 'accepted')}
                        disabled={updating === r.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold disabled:opacity-50"
                      >
                        <Check size={12} /> Accept
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, 'rejected')}
                        disabled={updating === r.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 text-xs font-semibold disabled:opacity-50"
                      >
                        <X size={12} /> Reject
                      </button>
                    </div>
                  )}
                  {r.status === 'accepted' && (
                    <button
                      onClick={() => updateStatus(r.id, 'shipped')}
                      disabled={updating === r.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold disabled:opacity-50 shrink-0"
                    >
                      <Rocket size={12} /> Mark shipped
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
