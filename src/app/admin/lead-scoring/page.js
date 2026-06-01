'use client';

// /admin/lead-scoring — UI : top 50 hot leads avec breakdown du score.
// Permet de contacter manuellement les leads les plus chauds avant qu'ils churnent.

import { useEffect, useState } from 'react';
import { Flame, Loader2, RefreshCw, Mail, ExternalLink } from 'lucide-react';

export default function LeadScoringPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);
  const [error, setError] = useState(null);

  async function loadLeads() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/lead-scoring/top');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur chargement');
      setLeads(data.leads || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function triggerRebuild() {
    setRebuilding(true);
    try {
      const res = await fetch('/api/admin/trigger-cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cron: 'lead-scoring' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur rebuild');
      await loadLeads();
    } catch (err) {
      setError(err.message);
    } finally {
      setRebuilding(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-content-strong flex items-center gap-2">
            <Flame className="text-orange-500" size={24} />
            Hot Leads
          </h1>
          <p className="text-sm text-content-soft mt-1">
            Top 50 leads classés par score. Rebuild automatique chaque jour à 6h CET.
          </p>
        </div>
        <button
          onClick={triggerRebuild}
          disabled={rebuilding}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-sm font-semibold shadow-sm disabled:opacity-50"
        >
          {rebuilding ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Rebuild scores
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="animate-spin mx-auto text-content-soft" size={32} />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-content-soft">
          <Flame className="mx-auto mb-3 opacity-30" size={32} />
          <p>Aucun lead avec un score &gt; 0.</p>
          <p className="text-xs mt-2">Lance un rebuild pour calculer les scores.</p>
        </div>
      ) : (
        <div className="bg-surface-strong border border-line-soft rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-soft border-b border-line-soft text-xs uppercase tracking-wider text-content-soft">
              <tr>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">User ID</th>
                <th className="text-left px-4 py-3">Plan / Trial</th>
                <th className="text-left px-4 py-3">Signup</th>
                <th className="text-left px-4 py-3">Breakdown</th>
                <th className="text-left px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const score = lead.lead_score || 0;
                const scoreColor =
                  score >= 70 ? 'text-red-600 bg-red-50 dark:bg-red-900/20' :
                  score >= 40 ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' :
                  'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
                const trialActive = lead.trial_ends_at && new Date(lead.trial_ends_at) > new Date();
                return (
                  <tr key={lead.id} className="border-b border-line-soft hover:bg-surface-soft/50 transition">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-12 h-8 rounded font-bold text-sm ${scoreColor}`}>
                        {score}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-content-soft">
                      {lead.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold capitalize">{lead.plan}</span>
                      {trialActive && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded">
                          Trial {lead.trial_plan}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-content-soft">
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <details>
                        <summary className="cursor-pointer text-content-soft hover:text-content">
                          {Object.keys(lead.score_breakdown || {}).filter(k => k !== '_total').length} signaux
                        </summary>
                        <ul className="mt-2 space-y-0.5 font-mono">
                          {Object.entries(lead.score_breakdown || {})
                            .filter(([k]) => k !== '_total')
                            .map(([k, v]) => (
                              <li key={k}>
                                <span className="text-content-soft">{k}:</span>{' '}
                                <span className={v > 0 ? 'text-emerald-600' : 'text-red-600'}>{v > 0 ? '+' : ''}{v}</span>
                              </li>
                            ))}
                        </ul>
                      </details>
                    </td>
                    <td className="px-4 py-3 text-xs text-content-soft">
                      {lead.last_score_at ? new Date(lead.last_score_at).toLocaleString('fr-FR') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
