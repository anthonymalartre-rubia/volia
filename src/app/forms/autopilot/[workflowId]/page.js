'use client';

// ─────────────────────────────────────────────────────────────────────
// /forms/autopilot/[workflowId]?exec=X — page form public Autopilot
// ─────────────────────────────────────────────────────────────────────
// Rendue depuis les liens des emails Autopilot. Charge la config form
// via GET /api/autopilot/form-submit?workflow_id=X&exec=Y, rend les
// questions (select/multiselect/short_text/long_text/email/number),
// puis POST les réponses vers /api/autopilot/form-submit.
//
// Renderer self-contained (pas de dépendance au FormRenderer Volia Forms)
// pour rester robuste et découplé. Light mode, branding Volia minimal.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, Send } from 'lucide-react';

export default function AutopilotFormPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const workflowId = params.workflowId;
  const exec = searchParams.get('exec');

  const [config, setConfig] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const qs = new URLSearchParams({ workflow_id: workflowId });
        if (exec) qs.set('exec', exec);
        const res = await fetch(`/api/autopilot/form-submit?${qs.toString()}`);
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'Erreur de chargement');
        setConfig(d);
        if (d.already_submitted) setDone(true);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (workflowId) load();
  }, [workflowId, exec]);

  function setAnswer(label, value) {
    setAnswers((a) => ({ ...a, [label]: value }));
  }

  function toggleMulti(label, option) {
    setAnswers((a) => {
      const cur = Array.isArray(a[label]) ? a[label] : [];
      const next = cur.includes(option) ? cur.filter((o) => o !== option) : [...cur, option];
      return { ...a, [label]: next };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/autopilot/form-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_id: workflowId,
          execution_id: exec,
          responses: answers,
          metadata: { referer: typeof document !== 'undefined' ? document.referrer : null },
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erreur lors de l\'envoi');
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ─── States ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <Shell>
        <div className="text-center py-16">
          <Loader2 className="animate-spin mx-auto text-violet-500" size={32} />
        </div>
      </Shell>
    );
  }

  if (error && !config) {
    return (
      <Shell>
        <div className="text-center py-12">
          <p className="text-slate-600">Ce formulaire n'est plus disponible.</p>
          <p className="text-xs text-slate-400 mt-2">{error}</p>
        </div>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <div className="text-center py-12">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={48} />
          <h1 className="text-xl font-bold text-slate-800 mb-2">Merci !</h1>
          <p className="text-slate-600 text-sm">
            Vos réponses ont bien été enregistrées. On revient vers vous très vite.
          </p>
        </div>
      </Shell>
    );
  }

  // ─── Form ────────────────────────────────────────────────────────
  return (
    <Shell>
      <h1 className="text-xl font-bold text-slate-800 mb-1">{config.title}</h1>
      <p className="text-sm text-slate-500 mb-6">Ça prend moins de 2 minutes.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {(config.questions || []).map((q, idx) => (
          <div key={idx}>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {q.label}
            </label>

            {q.type === 'select' && (
              <div className="space-y-2">
                {(q.options || []).map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                      answers[q.label] === opt
                        ? 'border-violet-500 bg-violet-50 text-violet-800'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.label}
                      value={opt}
                      checked={answers[q.label] === opt}
                      onChange={() => setAnswer(q.label, opt)}
                      className="accent-violet-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {q.type === 'multiselect' && (
              <div className="space-y-2">
                {(q.options || []).map((opt) => {
                  const checked = Array.isArray(answers[q.label]) && answers[q.label].includes(opt);
                  return (
                    <label
                      key={opt}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                        checked ? 'border-violet-500 bg-violet-50 text-violet-800' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMulti(q.label, opt)}
                        className="accent-violet-600"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === 'short_text' && (
              <input
                type="text"
                value={answers[q.label] || ''}
                onChange={(e) => setAnswer(q.label, e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-violet-500 focus:outline-none"
              />
            )}

            {q.type === 'email' && (
              <input
                type="email"
                value={answers[q.label] || ''}
                onChange={(e) => setAnswer(q.label, e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-violet-500 focus:outline-none"
              />
            )}

            {q.type === 'number' && (
              <input
                type="number"
                value={answers[q.label] || ''}
                onChange={(e) => setAnswer(q.label, e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-violet-500 focus:outline-none"
              />
            )}

            {q.type === 'long_text' && (
              <textarea
                rows={4}
                value={answers[q.label] || ''}
                onChange={(e) => setAnswer(q.label, e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-violet-500 focus:outline-none resize-none"
              />
            )}
          </div>
        ))}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm disabled:opacity-60"
        >
          {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          Envoyer mes réponses
        </button>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          Vos réponses sont traitées dans le cadre d'une démarche commerciale B2B (intérêt légitime RGPD).
          {' '}
          <a href="/opt-out" className="underline">Se désinscrire</a>.
        </p>
      </form>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">V</span>
          <span className="text-sm font-semibold text-slate-700">Volia</span>
        </div>
        {children}
      </div>
    </div>
  );
}
