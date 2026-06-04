'use client';

// ─────────────────────────────────────────────────────────────────────
// BackgroundEnrichPanel — enrichissement en arrière-plan (serveur).
// L'utilisateur lance, ferme l'onglet si besoin : le cron continue, sauvegarde
// au fil de l'eau, et envoie un email à la fin. Ce panneau pilote /api/enrich/
// background/{start,status,cancel} et affiche la progression en temps réel.
//
// Styling : tokens sémantiques du thème (surface-*/content-*/line) → contraste
// correct en clair ET sombre (pas de couleurs brutes + dark: qui se désync).
// ─────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Rocket, X, CheckCircle2, Mail, ServerCog } from 'lucide-react';

export default function BackgroundEnrichPanel() {
  const [state, setState] = useState(null); // { active, latest, pending }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const timer = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/enrich/background/status');
      if (!res.ok) return;
      const data = await res.json();
      setState(data);
    } catch { /* silencieux */ }
  }, []);

  useEffect(() => {
    fetchStatus();
    timer.current = setInterval(fetchStatus, 8000);
    return () => clearInterval(timer.current);
  }, [fetchStatus]);

  const start = async () => {
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/enrich/background/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const data = await res.json();
      if (!res.ok || data.ok === false) setError(data.error || 'Échec du lancement.');
      else if (data.nothing) setError('Aucun prospect à enrichir (il faut un site web et pas encore d\'email).');
      await fetchStatus();
    } catch { setError('Connexion impossible.'); }
    setBusy(false);
  };

  const cancel = async () => {
    setBusy(true); setError(null);
    try {
      await fetch('/api/enrich/background/cancel', { method: 'POST' });
      await fetchStatus();
    } catch { /* no-op */ }
    setBusy(false);
  };

  if (!state) return null;

  const active = state.active;
  const isActive = active && ['queued', 'running', 'paused'].includes(active.status);
  const pending = state.pending || 0;
  const latest = state.latest;

  // Cas 1 : un job tourne (ou en file / en pause)
  if (isActive) {
    const total = active.total || 0;
    const processed = active.processed || 0;
    const pct = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;
    const paused = active.status === 'paused';
    const queued = active.status === 'queued';
    return (
      <div className="rounded-xl border border-indigo-500/40 bg-surface-card p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <ServerCog size={16} className="text-indigo-500 shrink-0" />
          <span className="text-sm font-semibold text-content-primary">
            {paused ? 'Enrichissement en pause' : queued ? 'Enrichissement en file…' : 'Enrichissement en arrière-plan'}
          </span>
          {!paused && <Loader2 size={14} className="animate-spin text-indigo-500" />}
        </div>

        {/* Barre : indéterminée tant qu'en file (0%), sinon progression réelle */}
        <div className="h-2 rounded-full bg-content-muted/20 overflow-hidden mb-1.5">
          {queued && pct === 0 ? (
            <div className="h-full w-1/3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-pulse" />
          ) : (
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${pct}%` }} />
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-content-secondary mb-3">
          <span>
            {processed.toLocaleString('fr-FR')} / {total.toLocaleString('fr-FR')} traités
            {' · '}
            <strong className="text-indigo-500">{(active.found || 0).toLocaleString('fr-FR')}</strong> emails trouvés
          </span>
          <span className="tabular-nums font-medium text-content-primary">{pct}%</span>
        </div>

        {paused ? (
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            {active.paused_reason === 'quota'
              ? 'Quota mensuel d\'enrichissements atteint. Ça reprendra automatiquement le mois prochain — ou passe à un plan supérieur pour continuer maintenant.'
              : 'En pause.'}
          </p>
        ) : (
          <p className="text-xs text-content-muted mb-3 flex items-center gap-1.5">
            <Mail size={12} className="shrink-0" /> Tu peux fermer l'onglet — ça continue côté serveur, et tu recevras un email à la fin.
          </p>
        )}

        <button
          onClick={cancel}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-content-secondary border border-line hover:bg-surface-hover disabled:opacity-50"
        >
          <X size={13} /> Arrêter
        </button>
      </div>
    );
  }

  // Cas 2 : rien en cours
  return (
    <div className="rounded-xl border border-line bg-surface-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <Rocket size={16} className="text-indigo-500 shrink-0" />
        <span className="text-sm font-semibold text-content-primary">Enrichissement en arrière-plan</span>
      </div>

      {latest && latest.status === 'done' && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
          <CheckCircle2 size={12} className="shrink-0" /> Dernier run : {(latest.processed || 0).toLocaleString('fr-FR')} traités, {(latest.found || 0).toLocaleString('fr-FR')} emails trouvés.
        </p>
      )}

      {pending > 0 ? (
        <>
          <p className="text-xs text-content-secondary mb-3">
            {pending.toLocaleString('fr-FR')} prospect{pending > 1 ? 's' : ''} à enrichir (site web, pas encore d'email).
            Lance, ferme l'onglet si tu veux : ça tourne tout seul et tu reçois un email à la fin.
          </p>
          <button
            onClick={start}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Rocket size={15} />}
            Enrichir {pending.toLocaleString('fr-FR')} prospects en arrière-plan
          </button>
        </>
      ) : (
        <p className="text-xs text-content-muted">Tout est enrichi ✅ (rien en attente).</p>
      )}

      {error && <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">{error}</p>}
    </div>
  );
}
