'use client';

// /app/autopilot — page principale Volia Autopilot
// 3 modes : list (default) · new (builder wizard) · view (runtime detail)
// Switch via ?view=list|new|view&id=X

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, RefreshCw, Plus, Zap, Pause, Play, Trash2, Settings,
  Briefcase, User, Rocket, GraduationCap, Store, Building2, Users,
  Flame, Heart, Video, Calendar, ArrowLeft, CheckCircle2, AlertCircle,
  TrendingUp, Mail, FileText, DollarSign,
} from 'lucide-react';

const ICONS = {
  Zap, Briefcase, User, Rocket, GraduationCap, Store, Building2, Users,
  Flame, Heart, Video, RefreshCw, Calendar,
};

const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  archived: 'bg-zinc-100 text-zinc-500',
};

export default function AutopilotPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view') || 'list';
  const id = searchParams.get('id');

  const [data, setData] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function loadList() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/app/autopilot');
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erreur chargement');
      setData(d);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function loadDetail(workflowId) {
    setLoading(true);
    try {
      const res = await fetch(`/api/app/autopilot?id=${workflowId}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erreur');
      setDetail(d);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (view === 'list' || view === 'new') loadList();
    else if (view === 'view' && id) loadDetail(id);
  }, [view, id]);

  if (view === 'new') return <BuilderView data={data} loading={loading} error={error} router={router} onCreated={loadList} />;
  if (view === 'view' && id) return <DetailView detail={detail} loading={loading} busy={busy} setBusy={setBusy} reload={() => loadDetail(id)} router={router} />;

  // Default = list
  return (
    <div className="px-6 py-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-content-strong flex items-center gap-2">
            <Zap className="text-violet-500" size={28} />
            Volia Autopilot
          </h1>
          <p className="text-sm text-content-soft mt-1">
            Ton pipeline B2B en autopilot — scrap, qualifie, livre les leads chauds dans ton CRM.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadList} className="px-3 py-1.5 rounded-lg bg-surface-soft text-content-soft text-sm">
            <RefreshCw size={14} className="inline mr-1" /> Refresh
          </button>
          {data?.can_create_more && (
            <Link
              href="/app/autopilot?view=new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500 text-sm font-semibold"
            >
              <Plus size={14} /> Nouveau workflow
            </Link>
          )}
        </div>
      </div>

      {data && (
        <div className="rounded-xl border border-line bg-surface-card p-4 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold text-content-strong">Plan {data.user_plan}</span>
            <span className="text-content-soft ml-2">
              {data.plan_limits.workflows === -1 ? 'Workflows illimités' : `${data.workflows?.length || 0} / ${data.plan_limits.workflows} workflows`}
            </span>
            {data.plan_limits.branching && <span className="ml-2 text-xs px-2 py-0.5 rounded bg-violet-100 text-violet-700">+ branching IF/ELSE</span>}
            {data.plan_limits.ab_testing && <span className="ml-2 text-xs px-2 py-0.5 rounded bg-fuchsia-100 text-fuchsia-700">+ A/B testing</span>}
            {data.plan_limits.claude_opt && <span className="ml-2 text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">+ Claude opt</span>}
          </div>
          {!data.can_create_more && (
            <Link href="/pricing" className="text-xs text-violet-600 hover:underline font-semibold">
              Passer Business → 3 workflows · Enterprise → illimité
            </Link>
          )}
        </div>
      )}

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-content-soft" size={32} /></div>
      ) : !data?.workflows?.length ? (
        <EmptyState canCreate={data?.can_create_more} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.workflows.map((wf) => <WorkflowCard key={wf.id} wf={wf} />)}
        </div>
      )}
    </div>
  );
}

function WorkflowCard({ wf }) {
  return (
    <Link href={`/app/autopilot?view=view&id=${wf.id}`} className="block bg-surface-card border border-line rounded-xl p-4 hover:border-violet-400 transition">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-content-strong">{wf.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[wf.status]}`}>{wf.status}</span>
      </div>
      <p className="text-xs text-content-soft mb-2">Template : {wf.template_id}</p>
      <div className="flex items-center gap-3 text-xs text-content-soft">
        <span>📦 {wf.prospects_per_run}/run</span>
        <span>📅 {wf.run_frequency}</span>
        {wf.last_run_at && <span>Dernier : {new Date(wf.last_run_at).toLocaleDateString('fr-FR')}</span>}
      </div>
    </Link>
  );
}

function EmptyState({ canCreate }) {
  return (
    <div className="text-center py-20 border border-dashed border-line rounded-xl">
      <Zap className="mx-auto opacity-30 mb-3 text-violet-500" size={48} />
      <h3 className="text-lg font-semibold text-content-strong mb-2">Aucun workflow Autopilot</h3>
      <p className="text-sm text-content-soft mb-6 max-w-md mx-auto">
        Crée ton premier pipeline B2B autopilot en 5 minutes. 12 templates pré-faits adaptés à ton segment.
      </p>
      {canCreate ? (
        <Link href="/app/autopilot?view=new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 text-white hover:bg-violet-500 font-semibold text-sm">
          <Plus size={16} /> Créer mon premier workflow
        </Link>
      ) : (
        <Link href="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 text-white hover:bg-amber-500 font-semibold text-sm">
          🚀 Passer en Pro (49€/mois) pour débloquer Autopilot
        </Link>
      )}
    </div>
  );
}

function BuilderView({ data, loading, error, router, onCreated }) {
  const [step, setStep] = useState(1);
  const [selectedTplId, setSelectedTplId] = useState(null);
  const [name, setName] = useState('');
  const [prospectsPerRun, setProspectsPerRun] = useState(50);
  const [runFrequency, setRunFrequency] = useState('weekly');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const selectedTpl = data?.available_templates?.find((t) => t.id === selectedTplId);

  async function handleCreate(activate = false) {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/app/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          template_id: selectedTplId,
          name: name || selectedTpl.name,
          prospects_per_run: prospectsPerRun,
          run_frequency: runFrequency,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || d.error || 'Erreur création');
      // Si activate true → POST resume
      if (activate && d.workflow?.id) {
        await fetch('/api/app/autopilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'resume', id: d.workflow.id }),
        });
      }
      onCreated?.();
      router.push(`/app/autopilot?view=view&id=${d.workflow.id}`);
    } catch (err) {
      setCreateError(err.message);
    } finally { setCreating(false); }
  }

  if (loading) return <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-content-soft" size={32} /></div>;

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/app/autopilot')} className="inline-flex items-center gap-1 text-sm text-content-soft hover:text-content-strong">
          <ArrowLeft size={14} /> Retour
        </button>
        <div className="text-xs text-content-soft">Étape {step}/3</div>
      </div>

      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Zap className="text-violet-500" size={24} />
        Nouveau workflow Autopilot
      </h1>

      {createError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{createError}</div>}

      {/* STEP 1 : pick template */}
      {step === 1 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Choisis un template ({data?.available_templates?.length || 0} disponibles)</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {data?.available_templates?.map((tpl) => {
              const Icon = ICONS[tpl.icon] || Zap;
              const selected = selectedTplId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTplId(tpl.id)}
                  className={`text-left p-4 rounded-xl border transition ${selected ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200' : 'border-line bg-surface-card hover:border-violet-300'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={18} className={`text-${tpl.color}-500`} />
                    <span className="font-semibold text-content-strong">{tpl.name}</span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{tpl.tier}</span>
                  </div>
                  <p className="text-xs text-content-soft mb-2">{tpl.tagline}</p>
                  <p className="text-[10px] text-content-soft italic">{tpl.segment}</p>
                  {tpl.expected && (
                    <p className="text-[10px] text-content-tertiary mt-2">
                      Estim : {tpl.expected.open}% open · {tpl.expected.form}% form · {tpl.expected.hot}% hot
                    </p>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedTplId}
              className="px-5 py-2 rounded-lg bg-violet-600 text-white font-semibold text-sm disabled:opacity-50"
            >
              Suivant →
            </button>
          </div>
        </section>
      )}

      {/* STEP 2 : config */}
      {step === 2 && selectedTpl && (
        <section className="space-y-5">
          <h2 className="text-lg font-semibold">Configure ton workflow</h2>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-content-soft">Nom du workflow</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={selectedTpl.name}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-surface-soft text-sm"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-content-soft">Prospects par vague</label>
              <select value={prospectsPerRun} onChange={(e) => setProspectsPerRun(parseInt(e.target.value, 10))} className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-surface-soft text-sm">
                <option value="25">25 prospects (test)</option>
                <option value="50">50 prospects (recommandé)</option>
                <option value="100">100 prospects</option>
                <option value="200">200 prospects (gros volume)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-content-soft">Fréquence</label>
              <select value={runFrequency} onChange={(e) => setRunFrequency(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-surface-soft text-sm">
                <option value="once">Une seule fois</option>
                <option value="weekly">Chaque semaine</option>
                <option value="biweekly">Toutes les 2 semaines</option>
                <option value="daily">Quotidien (intensif)</option>
              </select>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-900">
            ⚡ Phase 1 : la cible (catégories + géo) est héritée du template. Customisation avancée arrive en Phase 2 (builder visuel + branching).
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="text-sm text-content-soft">← Précédent</button>
            <button onClick={() => setStep(3)} className="px-5 py-2 rounded-lg bg-violet-600 text-white font-semibold text-sm">Suivant →</button>
          </div>
        </section>
      )}

      {/* STEP 3 : récap + activate */}
      {step === 3 && selectedTpl && (
        <section className="space-y-5">
          <h2 className="text-lg font-semibold">Récapitulatif</h2>
          <div className="p-5 rounded-xl bg-surface-card border border-line space-y-2 text-sm">
            <div><strong>Template :</strong> {selectedTpl.name}</div>
            <div><strong>Nom :</strong> {name || selectedTpl.name}</div>
            <div><strong>Prospects/run :</strong> {prospectsPerRun}</div>
            <div><strong>Fréquence :</strong> {runFrequency}</div>
            <div className="pt-2 border-t border-line"><strong>Séquence :</strong> 3 emails (J+0, J+3, J+7) + form qualif + push CRM auto</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleCreate(false)}
              disabled={creating}
              className="flex-1 px-5 py-2.5 rounded-lg border border-line bg-surface-soft text-content-strong font-semibold text-sm disabled:opacity-50"
            >
              {creating ? <Loader2 size={14} className="inline animate-spin" /> : 'Sauver en brouillon'}
            </button>
            <button
              onClick={() => handleCreate(true)}
              disabled={creating}
              className="flex-1 px-5 py-2.5 rounded-lg bg-violet-600 text-white font-semibold text-sm disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <><Play size={14} /> Activer maintenant</>}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function DetailView({ detail, loading, busy, setBusy, reload, router }) {
  async function action(actionName) {
    setBusy(true);
    try {
      await fetch('/api/app/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionName, id: detail.workflow.id }),
      });
      reload();
    } catch {} finally { setBusy(false); }
  }

  if (loading || !detail) return <div className="text-center py-20"><Loader2 className="animate-spin mx-auto" size={32} /></div>;

  const wf = detail.workflow;
  const m = detail.metrics;
  const funnelData = [
    { label: 'Prospects enrôlés', value: m.total_enrolled, icon: TrendingUp, color: 'violet' },
    { label: 'Emails envoyés', value: m.emailed, icon: Mail, color: 'indigo' },
    { label: 'Formulaires remplis', value: m.form_submitted, icon: FileText, color: 'amber' },
    { label: 'Deals chauds CRM', value: m.crm_hot, icon: DollarSign, color: 'emerald' },
  ];

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto space-y-6">
      <button onClick={() => router.push('/app/autopilot')} className="inline-flex items-center gap-1 text-sm text-content-soft hover:text-content-strong">
        <ArrowLeft size={14} /> Liste workflows
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="text-violet-500" size={24} /> {wf.name}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className={`px-2 py-0.5 rounded ${STATUS_COLORS[wf.status]}`}>{wf.status}</span>
            <span className="text-content-soft">Template : {wf.template_id}</span>
            <span className="text-content-soft">· {wf.prospects_per_run}/{wf.run_frequency}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {wf.status === 'active' && (
            <button onClick={() => action('pause')} disabled={busy} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-semibold">
              <Pause size={12} /> Pause
            </button>
          )}
          {wf.status !== 'active' && wf.status !== 'archived' && (
            <button onClick={() => action('resume')} disabled={busy} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold">
              <Play size={12} /> Activer
            </button>
          )}
          <button onClick={() => action('run_now')} disabled={busy} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-semibold">
            <Zap size={12} /> Run now
          </button>
        </div>
      </div>

      {/* Funnel */}
      <section className="bg-surface-card border border-line rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-violet-500" /> Funnel
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {funnelData.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="p-4 rounded-lg bg-surface-soft border border-line">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className={`text-${f.color}-500`} />
                  <span className="text-xs text-content-soft">{f.label}</span>
                </div>
                <div className={`text-2xl font-bold text-${f.color}-600`}>{f.value}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent runs */}
      <section className="bg-surface-card border border-line rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-3">Runs récents (5 derniers)</h2>
        {!detail.recent_runs?.length ? (
          <p className="text-sm text-content-soft italic">Aucun run encore. Clique <strong>Run now</strong> pour démarrer manuellement, ou attends le prochain cron (toutes les 15 min si workflow actif).</p>
        ) : (
          <ul className="divide-y divide-line">
            {detail.recent_runs.map((r) => (
              <li key={r.id} className="py-2 flex items-center justify-between text-sm">
                <div>
                  <span className="font-mono text-xs text-content-soft">{new Date(r.started_at).toLocaleString('fr-FR')}</span>
                  <span className="ml-3">{r.status === 'completed' ? '✅' : r.status === 'failed' ? '❌' : '⏳'} {r.status}</span>
                </div>
                <div className="text-xs text-content-soft">
                  {r.prospects_scraped} scrapés · {r.prospects_added} enrôlés
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex justify-end">
        <button
          onClick={() => { if (confirm('Supprimer ce workflow ? Les prospects scrapés restent dans la base.')) action('delete').then(() => router.push('/app/autopilot')); }}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50"
        >
          <Trash2 size={12} /> Supprimer le workflow
        </button>
      </div>
    </div>
  );
}
