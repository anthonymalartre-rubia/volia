'use client';

// ─────────────────────────────────────────────────────────────────────
// /one — Volia One (Phase 1, banc de test admin)
// Tape un domaine → ICP déduit → leads FR (email+tél) → emails rédigés.
// La route /api/one/build est admin-only.
// ─────────────────────────────────────────────────────────────────────

import { useState, Fragment } from 'react';

const methodBadge = {
  scrape: { label: 'vérifié (site)', cls: 'bg-emerald-500/15 text-emerald-600' },
  serper: { label: 'trouvé (Google)', cls: 'bg-blue-500/15 text-blue-600' },
  guess: { label: 'deviné', cls: 'bg-amber-500/15 text-amber-600' },
  none: { label: '—', cls: 'bg-surface-elevated text-content-tertiary' },
};

export default function VoliaOnePage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [openIdx, setOpenIdx] = useState(null);

  async function run(e) {
    e?.preventDefault();
    const d = domain.trim();
    if (!d || loading) return;
    setLoading(true);
    setError('');
    setData(null);
    setOpenIdx(null);
    try {
      const res = await fetch('/api/one/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: d }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      setData(json);
    } catch (err) {
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-base px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 text-xs font-medium mb-4">
            Volia One · banc de test
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-content-primary mb-2">
            Entre ton domaine
          </h1>
          <p className="text-content-secondary">Je recherche ta boîte et je trouve à qui vendre.</p>
        </div>

        <form onSubmit={run} className="flex gap-2 max-w-xl mx-auto mb-2">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="agence-web-bordeaux.fr"
            className="flex-1 rounded-xl border border-line bg-surface-card px-4 py-3 text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-6 py-3 transition-colors"
          >
            {loading ? 'Analyse…' : 'Lancer'}
          </button>
        </form>
        <p className="text-center text-xs text-content-tertiary mb-8">
          ~20-40s : scrape du site, déduction ICP, recherche Places, enrichissement, rédaction.
        </p>

        {error && (
          <div className="max-w-xl mx-auto rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="rounded-xl border border-line bg-surface-card p-5">
              <div className="text-xs uppercase tracking-wide text-content-tertiary mb-2">ICP déduit</div>
              <p className="text-content-primary font-medium">{data.icp?.activite}</p>
              <p className="text-content-secondary text-sm mt-1">{data.icp?.value_prop}</p>
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <span className="px-2 py-1 rounded-md bg-surface-elevated text-content-secondary">📍 {data.icp?.ville}</span>
                {(data.icp?.places_terms || []).map((t, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-violet-500/10 text-violet-600">{t}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-content-secondary">
              <span><strong className="text-content-primary">{data.counts?.total}</strong> leads</span>
              <span><strong className="text-content-primary">{data.counts?.email_verified}</strong> emails fiables</span>
              <span><strong className="text-content-primary">{data.counts?.email_guessed}</strong> devinés</span>
              <span><strong className="text-content-primary">{data.counts?.with_phone}</strong> avec tél</span>
            </div>

            <div className="rounded-xl border border-line bg-surface-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-content-tertiary border-b border-line">
                    <th className="font-medium px-4 py-3">Fit</th>
                    <th className="font-medium px-4 py-3">Entreprise</th>
                    <th className="font-medium px-4 py-3">Téléphone</th>
                    <th className="font-medium px-4 py-3">Email</th>
                    <th className="font-medium px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {(data.leads || []).map((l, i) => {
                    const b = methodBadge[l.method] || methodBadge.none;
                    return (
                      <Fragment key={i}>
                        <tr className="border-b border-line/60">
                          <td className="px-4 py-3 text-content-secondary tabular-nums">{l.fit}</td>
                          <td className="px-4 py-3 text-content-primary">{l.nom}</td>
                          <td className="px-4 py-3 text-content-secondary">{l.telephone || '—'}</td>
                          <td className="px-4 py-3">
                            <span className="text-content-primary">{l.email || '—'}</span>
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[11px] ${b.cls}`}>{b.label}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {l.draft && (
                              <button
                                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                                className="text-violet-600 hover:underline text-xs"
                              >
                                {openIdx === i ? 'Masquer' : 'Voir l\'email'}
                              </button>
                            )}
                          </td>
                        </tr>
                        {openIdx === i && l.draft && (
                          <tr>
                            <td colSpan={5} className="px-4 py-3 bg-surface-elevated">
                              <pre className="whitespace-pre-wrap font-sans text-sm text-content-secondary leading-relaxed">{l.draft}</pre>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
