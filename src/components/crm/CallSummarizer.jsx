'use client';

// ─────────────────────────────────────────────────────────────────────
// CallSummarizer — "Résumer l'appel" sur une fiche deal.
// ─────────────────────────────────────────────────────────────────────
// Flux simple (pas de webhook, pas de file d'approbation) :
//   1. L'utilisateur colle le compte-rendu / transcript d'un appel.
//   2. POST /api/crm/summarize-call → Claude PROPOSE résumé + étape + tâches.
//   3. L'utilisateur ajuste (résumé, étape, coche les tâches) puis « Appliquer ».
//   4. Application via les endpoints EXISTANTS :
//        - /api/crm/deals/[id]/move   (changement d'étape, si choisi)
//        - /api/crm/activities         (note d'appel + 1 activité 'task' par tâche cochée)
//   5. onApplied({ newStageId, createdActivities }) → le drawer met à jour son state.
//
// Props : { dealId, stages, currentStageId, onApplied }
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Sparkles, Loader2, X, Check, AlertCircle, Wand2, Calendar } from 'lucide-react';

function dueIsoFromDays(days) {
  const d = new Date(Date.now() + (Number(days) || 3) * 86400000);
  return d.toISOString();
}

export default function CallSummarizer({ dealId, stages = [], currentStageId, onApplied }) {
  const [open, setOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  // Proposition éditable
  const [proposal, setProposal] = useState(null); // { summary, suggested_stage_name, stage_reason, objections }
  const [summary, setSummary] = useState('');
  const [stageId, setStageId] = useState('');
  const [tasks, setTasks] = useState([]); // [{ content, due_in_days, checked }]

  // Import Fireflies (transcripts auto, au lieu du collage manuel)
  const [ff, setFf] = useState({ open: false, loading: false, connected: null, meetings: [], keyInput: '', error: '' });

  async function openFireflies() {
    setFf((s) => ({ ...s, open: true, loading: true, error: '' }));
    try {
      const res = await fetch('/api/integrations/fireflies');
      const d = await res.json();
      setFf((s) => ({ ...s, loading: false, connected: !!d.connected, meetings: d.meetings || [], error: d.error || '' }));
    } catch { setFf((s) => ({ ...s, loading: false, error: 'Réseau indisponible' })); }
  }
  async function connectFireflies() {
    const key = ff.keyInput.trim();
    if (!key) return;
    setFf((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await fetch('/api/integrations/fireflies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: key }),
      });
      const d = await res.json();
      if (!res.ok || !d.success) { setFf((s) => ({ ...s, loading: false, error: d.error || 'Clé invalide' })); return; }
      const r2 = await fetch('/api/integrations/fireflies');
      const d2 = await r2.json();
      setFf((s) => ({ ...s, loading: false, connected: true, meetings: d2.meetings || [], keyInput: '' }));
    } catch { setFf((s) => ({ ...s, loading: false, error: 'Réseau indisponible' })); }
  }
  async function pickMeeting(id) {
    setFf((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await fetch(`/api/integrations/fireflies?id=${encodeURIComponent(id)}`);
      const d = await res.json();
      if (!res.ok || !d.success) { setFf((s) => ({ ...s, loading: false, error: d.error || 'Transcript indisponible' })); return; }
      setTranscript(d.text || '');
      setFf((s) => ({ ...s, open: false, loading: false }));
    } catch { setFf((s) => ({ ...s, loading: false, error: 'Réseau indisponible' })); }
  }

  function reset() {
    setOpen(false);
    setTranscript('');
    setProposal(null);
    setSummary('');
    setStageId('');
    setTasks([]);
    setError('');
  }

  async function analyze() {
    if (transcript.trim().length < 20) {
      setError('Colle le compte-rendu de l\'appel (quelques phrases minimum).');
      return;
    }
    setAnalyzing(true);
    setError('');
    try {
      const res = await fetch('/api/crm/summarize-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: dealId, transcript: transcript.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Analyse impossible.');
        return;
      }
      const p = data.proposal;
      setProposal(p);
      // Résumé + objections concaténés dans la note d'appel
      setSummary(
        p.objections ? `${p.summary}\n\n⚠️ Objections / vigilance : ${p.objections}` : p.summary
      );
      setStageId(p.suggested_stage_id || currentStageId || '');
      setTasks((p.tasks || []).map((t) => ({ ...t, checked: true })));
    } catch {
      setError('Erreur réseau.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function apply() {
    setApplying(true);
    setError('');
    const createdActivities = [];
    try {
      // 1) Changement d'étape (si choisi et différent)
      let newStageId = null;
      if (stageId && stageId !== currentStageId) {
        const res = await fetch(`/api/crm/deals/${dealId}/move`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage_id: stageId, position: 0 }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Changement d\'étape échoué');
        newStageId = stageId;
      }

      // 2) Note d'appel (résumé)
      if (summary.trim()) {
        const res = await fetch('/api/crm/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deal_id: dealId, type: 'call', content: summary.trim() }),
        });
        const data = await res.json();
        if (res.ok && data.success) createdActivities.push(data.data);
      }

      // 3) Tâches cochées
      for (const t of tasks.filter((x) => x.checked && x.content.trim())) {
        const res = await fetch('/api/crm/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deal_id: dealId,
            type: 'task',
            content: t.content.trim(),
            due_at: dueIsoFromDays(t.due_in_days),
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) createdActivities.push(data.data);
      }

      onApplied?.({ newStageId, createdActivities });
      reset();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'application.');
    } finally {
      setApplying(false);
    }
  }

  // Bouton fermé
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-sm shadow-violet-500/20 transition-all w-full justify-center"
      >
        <Sparkles size={13} />
        Résumer l&apos;appel (IA)
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-700">
          <Sparkles size={12} /> Résumé d&apos;appel
        </span>
        <button type="button" onClick={reset} className="p-1 rounded text-content-tertiary hover:text-content-primary" aria-label="Fermer">
          <X size={15} />
        </button>
      </div>

      {!proposal ? (
        <>
          {/* Import auto Fireflies (au lieu du collage manuel) */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-content-tertiary">Colle le transcript, ou…</span>
            <button type="button" onClick={openFireflies} className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-500">
              <Calendar size={12} /> Importer depuis Fireflies
            </button>
          </div>
          {ff.open && (
            <div className="rounded-lg border border-line bg-surface-base p-2.5 space-y-2">
              {ff.loading && (
                <p className="text-xs text-content-tertiary flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Chargement…</p>
              )}
              {!ff.loading && ff.connected === false && (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-content-tertiary">Connecte ta clé API Fireflies (Fireflies → Settings → Developer Settings → API).</p>
                  <div className="flex gap-1.5">
                    <input
                      type="password"
                      value={ff.keyInput}
                      onChange={(e) => setFf((s) => ({ ...s, keyInput: e.target.value }))}
                      placeholder="Clé API Fireflies"
                      className="flex-1 px-2 py-1.5 rounded border border-line bg-surface-card text-xs text-content-primary focus:outline-none focus:border-violet-500"
                    />
                    <button type="button" onClick={connectFireflies} className="px-2.5 py-1.5 rounded bg-violet-600 text-white text-xs font-semibold">Connecter</button>
                  </div>
                </div>
              )}
              {!ff.loading && ff.connected && ff.meetings.length > 0 && (
                <ul className="max-h-40 overflow-y-auto space-y-1">
                  {ff.meetings.map((m) => (
                    <li key={m.id}>
                      <button type="button" onClick={() => pickMeeting(m.id)} className="w-full text-left px-2 py-1.5 rounded hover:bg-violet-500/10 text-xs">
                        <span className="font-medium text-content-primary">{m.title}</span>
                        {m.date ? <span className="text-content-tertiary ml-2">{new Date(m.date).toLocaleDateString('fr-FR')}</span> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!ff.loading && ff.connected && ff.meetings.length === 0 && (
                <p className="text-xs text-content-tertiary">Aucune réunion récente trouvée dans Fireflies.</p>
              )}
              {ff.error && <p className="text-[11px] text-rose-600">{ff.error}</p>}
            </div>
          )}

          <textarea
            rows={6}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Colle ici le compte-rendu ou le transcript de l'appel (Fireflies, Meet, tes notes…). Claude propose un résumé, la nouvelle étape et les tâches de relance."
            className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none"
          />
          <button
            type="button"
            onClick={analyze}
            disabled={analyzing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 w-full justify-center"
          >
            {analyzing ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
            {analyzing ? 'Analyse…' : 'Analyser l\'appel'}
          </button>
        </>
      ) : (
        <>
          {/* Résumé éditable */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-content-tertiary mb-1">Résumé (note d&apos;appel)</label>
            <textarea
              rows={5}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none"
            />
          </div>

          {/* Étape suggérée */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-content-tertiary mb-1">
              Étape {proposal.suggested_stage_name ? `· suggérée : ${proposal.suggested_stage_name}` : ''}
            </label>
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="">— Ne pas changer l&apos;étape —</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.probability}%)</option>
              ))}
            </select>
            {proposal.stage_reason && (
              <p className="mt-1 text-[11px] text-content-tertiary italic">{proposal.stage_reason}</p>
            )}
          </div>

          {/* Tâches */}
          {tasks.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-content-tertiary mb-1">Tâches de relance</label>
              <ul className="space-y-1.5">
                {tasks.map((t, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={t.checked}
                      onChange={(e) => setTasks((prev) => prev.map((x, j) => (j === i ? { ...x, checked: e.target.checked } : x)))}
                      className="accent-violet-600 flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={t.content}
                      onChange={(e) => setTasks((prev) => prev.map((x, j) => (j === i ? { ...x, content: e.target.value } : x)))}
                      className="flex-1 px-2 py-1 rounded border border-line bg-surface-card text-xs text-content-primary focus:outline-none focus:border-violet-500"
                    />
                    <span className="text-[10px] text-content-tertiary whitespace-nowrap">J+{t.due_in_days}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={apply}
              disabled={applying}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 flex-1 justify-center"
            >
              {applying ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              Appliquer au CRM
            </button>
            <button
              type="button"
              onClick={() => { setProposal(null); setError(''); }}
              disabled={applying}
              className="px-3 py-2 rounded-lg text-xs font-medium text-content-secondary hover:bg-surface-elevated"
            >
              Refaire
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
