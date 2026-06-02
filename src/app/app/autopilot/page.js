'use client';

// /app/autopilot — page principale Volia Autopilot
// 3 modes : list (default) · new (builder wizard) · view (runtime detail)
// Switch via ?view=list|new|view&id=X

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import { getSupabase } from '@/lib/supabase';
import {
  Loader2, RefreshCw, Plus, Zap, Pause, Play, Trash2, Settings,
  Briefcase, User, Rocket, GraduationCap, Store, Building2, Users,
  Flame, Heart, Video, Calendar, ArrowLeft, CheckCircle2, AlertCircle,
  TrendingUp, Mail, FileText, DollarSign, Lightbulb, X, Sparkles, Lock,
} from 'lucide-react';

// Shell partagé : TopBar + ModuleSwitcher (comme les autres pages /app/*).
// Il n'y a pas de layout /app partagé dans ce repo : chaque page rend sa
// propre TopBar. On réplique ce pattern ici.
function AutopilotShell({ user, children }) {
  return (
    <div className="min-h-screen bg-surface-base text-content-primary flex flex-col">
      <TopBar user={user} showHamburger={false} />
      <main className="flex-1">{children}</main>
    </div>
  );
}

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
  const [user, setUser] = useState(null);

  // User pour la TopBar (affiche le ModuleSwitcher + menu compte)
  useEffect(() => {
    const sb = getSupabase();
    if (sb) sb.auth.getUser().then(({ data }) => setUser(data?.user || null)).catch(() => {});
  }, []);

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

  if (view === 'new') return <AutopilotShell user={user}><BuilderView data={data} loading={loading} error={error} router={router} onCreated={loadList} /></AutopilotShell>;
  if (view === 'view' && id) return <AutopilotShell user={user}><DetailView detail={detail} loading={loading} busy={busy} setBusy={setBusy} reload={() => loadDetail(id)} router={router} /></AutopilotShell>;

  // Default = list
  return (
    <AutopilotShell user={user}>
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
        <EmptyState canCreate={data?.can_create_more} templateCount={data?.available_templates?.length} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.workflows.map((wf) => <WorkflowCard key={wf.id} wf={wf} />)}
        </div>
      )}
    </div>
    </AutopilotShell>
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

function EmptyState({ canCreate, templateCount }) {
  return (
    <div className="text-center py-20 border border-dashed border-line rounded-xl">
      <Zap className="mx-auto opacity-30 mb-3 text-violet-500" size={48} />
      <h3 className="text-lg font-semibold text-content-strong mb-2">Aucun workflow Autopilot</h3>
      <p className="text-sm text-content-soft mb-6 max-w-md mx-auto">
        Crée ton premier pipeline B2B autopilot en 5 minutes.{' '}
        {templateCount ? `${templateCount} templates` : 'Des templates'} pré-faits adaptés à ton segment.
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
  const [emailSenderId, setEmailSenderId] = useState('');
  const [senders, setSenders] = useState([]);
  const [crmDestination, setCrmDestination] = useState('volia'); // 'volia' | 'webhook'
  const [crmWebhookUrl, setCrmWebhookUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const selectedTpl = data?.available_templates?.find((t) => t.id === selectedTplId);

  // Charge les senders email vérifiés du user (pour le dropdown sender).
  useEffect(() => {
    async function loadSenders() {
      try {
        const res = await fetch('/api/email-senders');
        const d = await res.json();
        const verified = (d.senders || []).filter((s) => s.status === 'verified');
        setSenders(verified);
      } catch { /* silencieux : fallback sur sender Volia par défaut */ }
    }
    loadSenders();
  }, []);

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
          config: {
            ...(emailSenderId ? { email_sender_id: emailSenderId } : {}),
            crm_destination: crmDestination === 'webhook'
              ? { type: 'webhook', webhook_url: crmWebhookUrl.trim() }
              : { type: 'volia' },
          },
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
          {/* Sender email — OBLIGATOIRE : on n'envoie JAMAIS depuis hello@volia.fr.
              Cold outreach depuis le domaine partagé Volia = réputation cramée. */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-content-soft">
              Domaine d'envoi <span className="text-red-500">*</span>
            </label>
            <select
              value={emailSenderId}
              onChange={(e) => setEmailSenderId(e.target.value)}
              className={`w-full mt-1 px-3 py-2 rounded-lg border bg-surface-soft text-sm ${emailSenderId ? 'border-line' : 'border-amber-300'}`}
            >
              <option value="">— Choisis ton domaine vérifié —</option>
              {senders.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.from_name || 'Volia'} — noreply@{s.domain}
                </option>
              ))}
            </select>
            {senders.length === 0 ? (
              <div className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-[12px] text-amber-900 leading-relaxed">
                <strong>Aucun domaine vérifié.</strong> Volia n'envoie pas tes emails de prospection
                depuis <code>hello@volia.fr</code> (réputation partagée entre tous les clients).
                {' '}<a href="/settings/email-senders" className="text-violet-700 underline font-semibold">Branche ton domaine</a> (2 min) pour activer ce workflow.
              </div>
            ) : (
              <p className="text-[11px] text-content-soft mt-1">
                Les emails partent de TON domaine vérifié — meilleure délivrabilité, branding, et ta réputation reste la tienne.
              </p>
            )}
          </div>
          {/* Destination des leads — CRM Volia natif OU le CRM du client (webhook) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-content-soft">Destination des leads</label>
            <select
              value={crmDestination}
              onChange={(e) => setCrmDestination(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-surface-soft text-sm"
            >
              <option value="volia">CRM Volia natif (par défaut)</option>
              <option value="webhook">Mon propre CRM (webhook : HubSpot, Pipedrive, Salesforce…)</option>
            </select>
            {crmDestination === 'webhook' ? (
              <div className="mt-2">
                <input
                  type="url"
                  value={crmWebhookUrl}
                  onChange={(e) => setCrmWebhookUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/... ou ton endpoint CRM"
                  className="w-full px-3 py-2 rounded-lg border border-line bg-surface-soft text-sm font-mono text-xs"
                />
                <p className="text-[11px] text-content-soft mt-1">
                  Chaque lead qualifié est envoyé en POST JSON à cette URL (nom, société, email, tél, score, tier).
                  Branche-la sur ton CRM directement ou via Zapier/Make. <strong>Aucun deal n&apos;est créé dans Volia.</strong>
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-content-soft mt-1">
                Les leads chauds atterrissent dans ton pipeline CRM Volia (créé automatiquement).
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-900">
            ⚡ La cible (catégories + géo) est héritée du template. Le routing par tier (Hot/Warm/Cold) se configure après création.
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
            <div><strong>Expéditeur :</strong> {emailSenderId ? (senders.find((s) => s.id === emailSenderId)?.domain ? `noreply@${senders.find((s) => s.id === emailSenderId).domain}` : 'domaine vérifié') : 'Volia par défaut'}</div>
            <div><strong>Destination leads :</strong> {crmDestination === 'webhook' ? `Ton CRM (webhook${crmWebhookUrl.trim() ? '' : ' — URL manquante'})` : 'CRM Volia natif'}</div>
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
              disabled={creating || !emailSenderId || (crmDestination === 'webhook' && !/^https:\/\//i.test(crmWebhookUrl.trim()))}
              title={!emailSenderId ? "Choisis un domaine d'envoi vérifié à l'étape précédente" : (crmDestination === 'webhook' && !/^https:\/\//i.test(crmWebhookUrl.trim()) ? "Renseigne l'URL webhook (https://) de ton CRM" : undefined)}
              className="flex-1 px-5 py-2.5 rounded-lg bg-violet-600 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <><Play size={14} /> Activer maintenant</>}
            </button>
          </div>
          {!emailSenderId && (
            <p className="text-[12px] text-amber-700 text-center">
              ⚠️ L'activation nécessite un domaine d'envoi vérifié.{' '}
              <button onClick={() => setStep(2)} className="underline font-semibold">Choisir à l'étape 2</button>
              {' '}ou <a href="/settings/email-senders" className="underline font-semibold">brancher un domaine</a>. Tu peux quand même sauver en brouillon.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function DetailView({ detail, loading, busy, setBusy, reload, router }) {
  const [branchingOpen, setBranchingOpen] = useState(false);
  const [actionError, setActionError] = useState(null);

  async function action(actionName, extra = {}) {
    setBusy(true);
    setActionError(null);
    try {
      const res = await fetch('/api/app/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionName, id: detail.workflow.id, ...extra }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(d.message || d.error || 'Erreur');
        return;
      }
      reload();
    } catch (e) {
      setActionError(e.message);
    } finally { setBusy(false); }
  }

  async function saveBranching(branchingConfig) {
    await action('update', { config: { ...(detail.workflow.config || {}), branching: branchingConfig } });
    setBranchingOpen(false);
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

      {actionError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 flex items-start gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            {actionError}
            {' '}
            <a href="/settings/email-senders" className="underline font-semibold">Brancher mon domaine →</a>
          </div>
        </div>
      )}

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

      {/* Suggestions Claude (Phase 3.2 — weekly optimization) */}
      {Array.isArray(wf.metrics_cache?.suggestions) && wf.metrics_cache.suggestions.length > 0 && (
        <section className="bg-gradient-to-br from-violet-50 via-amber-50/30 to-violet-50 border border-violet-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-500" /> Suggestions Claude (hebdo)
            {wf.metrics_cache.suggestions.filter((s) => !s.read_at).length > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white">
                {wf.metrics_cache.suggestions.filter((s) => !s.read_at).length} nouvelles
              </span>
            )}
          </h2>
          <p className="text-xs text-content-soft mb-4">
            Analyse hebdomadaire dimanche 02:00 · compare actuals vs benchmarks template · suggestions pour combler les gaps
          </p>
          <ul className="space-y-2">
            {wf.metrics_cache.suggestions.slice(0, 5).map((s, idx) => (
              <li key={idx} className="bg-surface-card border border-line rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={12} className="text-amber-500 flex-shrink-0" />
                      <h3 className="text-sm font-semibold text-content-strong">{s.title}</h3>
                    </div>
                    <p className="text-xs text-content-soft leading-relaxed">{s.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px]">
                      {s.target_metric && (
                        <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-medium">
                          {s.target_metric}
                        </span>
                      )}
                      {s.effort && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                          ⏱ {s.effort}
                        </span>
                      )}
                      {s.expected_impact && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">
                          📈 {s.expected_impact}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {wf.metrics_cache.last_optimization_at && (
            <p className="text-[10px] text-content-muted mt-3 italic">
              Dernière analyse : {new Date(wf.metrics_cache.last_optimization_at).toLocaleString('fr-FR')}
            </p>
          )}
        </section>
      )}

      {/* A/B Testing Subject Lines status (Phase 3.1) */}
      {wf.metrics_cache?.ab_winners && Object.keys(wf.metrics_cache.ab_winners).length > 0 && (
        <section className="bg-surface-card border border-line rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <TrendingUp size={18} className="text-violet-500" /> A/B testing subject lines
          </h2>
          <p className="text-xs text-content-soft mb-3">
            Winners désignés automatiquement après 30+ envois par variant. 90% du traffic va au winner, 10% explore.
          </p>
          <ul className="text-sm space-y-1">
            {Object.entries(wf.metrics_cache.ab_winners).map(([stepIdx, variantId]) => (
              <li key={stepIdx} className="flex items-center justify-between p-2 rounded bg-surface-soft">
                <span className="text-content-strong">Email #{parseInt(stepIdx) + 1}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono">
                  Winner : {variantId}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Routing par tier — Phase 2 + Builder Phase 2.5 */}
      <section className="bg-surface-card border border-line rounded-xl p-5">
        <div className="flex items-center justify-between mb-1 gap-3 flex-wrap">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings size={18} className="text-amber-500" /> Routing &amp; branching
          </h2>
          <button
            onClick={() => setBranchingOpen(true)}
            disabled={busy}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold disabled:opacity-60"
          >
            <Settings size={12} /> Configurer
          </button>
        </div>
        <p className="text-xs text-content-soft mb-4">
          Quand un prospect soumet le formulaire, son score qualif (0-100) le classe en{' '}
          <strong>Hot</strong>, <strong>Warm</strong> ou <strong>Cold</strong>. Chaque tier
          est routé dans ton CRM avec la stage correspondante (overridable Business+).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { tier: 'hot', label: 'Hot — score ≥ 70', color: 'red', desc: 'Push CRM immédiat · contact + deal créés en temps réel' },
            { tier: 'warm', label: 'Warm — score 40-69', color: 'amber', desc: 'Push CRM différé (stepper hourly) · drip suggéré' },
            { tier: 'cold', label: 'Cold — score < 40', color: 'slate', desc: 'Push CRM différé · archive 6m suggéré' },
          ].map((t) => {
            const customRule = wf.config?.branching?.[t.tier];
            return (
              <div key={t.tier} className={`p-3 rounded-lg border bg-${t.color}-50/40 border-${t.color}-200`}>
                <div className={`text-xs font-bold uppercase tracking-wider text-${t.color}-700 mb-1`}>{t.label}</div>
                <p className="text-xs text-content-strong leading-relaxed">{t.desc}</p>
                {customRule && Object.keys(customRule).length > 0 ? (
                  <div className="mt-2 pt-2 border-t border-line text-[10px] text-content-strong space-y-0.5">
                    <div className="font-semibold text-violet-700">Custom :</div>
                    {customRule.crm_stage && <div>· stage = <code className="font-mono">{customRule.crm_stage}</code></div>}
                    {customRule.slack_notif_url && <div>· Slack notif activée</div>}
                    {customRule.coupon_code && <div>· coupon <code className="font-mono">{customRule.coupon_code}</code></div>}
                    {customRule.notify_emails && <div>· notif emails : {customRule.notify_emails.split(',').length}</div>}
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t border-line text-[10px] text-content-muted italic">Default routing</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {branchingOpen && (
        <BranchingModal
          workflow={wf}
          onClose={() => setBranchingOpen(false)}
          onSave={saveBranching}
          busy={busy}
        />
      )}

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

// ─────────────────────────────────────────────────────────────────────
// BranchingModal — Phase 2.5
// ─────────────────────────────────────────────────────────────────────
// Modal pour configurer le branching custom du workflow.
// Routing override par tier hot/warm/cold :
//   - crm_stage : override le nom de stage CRM (par défaut = "Hot · Autopilot")
//   - slack_notif_url : webhook Slack pour notif tier hot
//   - coupon_code : coupon attaché au deal CRM (visible dans notes)
//   - notify_emails : emails internes à notifier en CC (CSV)
//
// Gating Business+ (Pro = lecture seule, redirige vers /pricing)
// ─────────────────────────────────────────────────────────────────────
function BranchingModal({ workflow, onClose, onSave, busy }) {
  const initial = workflow.config?.branching || {};
  const [state, setState] = useState({
    hot: {
      crm_stage: initial.hot?.crm_stage || '',
      slack_notif_url: initial.hot?.slack_notif_url || '',
      coupon_code: initial.hot?.coupon_code || '',
      notify_emails: initial.hot?.notify_emails || '',
    },
    warm: {
      crm_stage: initial.warm?.crm_stage || '',
      drip_template_id: initial.warm?.drip_template_id || '',
      notify_emails: initial.warm?.notify_emails || '',
    },
    cold: {
      crm_stage: initial.cold?.crm_stage || '',
      archive_after_days: initial.cold?.archive_after_days || '',
    },
  });

  function update(tier, key, value) {
    setState((s) => ({ ...s, [tier]: { ...s[tier], [key]: value } }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Strip empty strings
    const clean = {};
    for (const [tier, cfg] of Object.entries(state)) {
      const tierClean = {};
      for (const [k, v] of Object.entries(cfg)) {
        if (v !== '' && v !== null && v !== undefined) tierClean[k] = v;
      }
      if (Object.keys(tierClean).length > 0) clean[tier] = tierClean;
    }
    onSave(clean);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-base rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface-base border-b border-line p-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Settings size={18} className="text-amber-500" /> Configurer le branching custom
            </h2>
            <p className="text-xs text-content-soft mt-1">
              Override le routing par défaut pour chaque tier · feature <strong>Business+</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-soft">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* HOT */}
          <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 space-y-3">
            <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider">🔥 Hot — score ≥ 70</h3>
            <Field label="CRM stage override" hint="Nom exact de la stage dans ton pipeline (sinon utilise 'Hot · Autopilot')">
              <input
                type="text"
                value={state.hot.crm_stage}
                onChange={(e) => update('hot', 'crm_stage', e.target.value)}
                placeholder="Ex: Opportunity, Démo bookée…"
                className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm"
              />
            </Field>
            <Field label="Slack webhook URL" hint="Notif Slack en temps réel sur leads hot">
              <input
                type="url"
                value={state.hot.slack_notif_url}
                onChange={(e) => update('hot', 'slack_notif_url', e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm font-mono text-xs"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Coupon code" hint="Attaché au deal CRM (visible dans notes)">
                <input
                  type="text"
                  value={state.hot.coupon_code}
                  onChange={(e) => update('hot', 'coupon_code', e.target.value)}
                  placeholder="HOTLEAD50"
                  className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm"
                />
              </Field>
              <Field label="Emails CC notif" hint="CSV — équipe sales à notifier">
                <input
                  type="text"
                  value={state.hot.notify_emails}
                  onChange={(e) => update('hot', 'notify_emails', e.target.value)}
                  placeholder="sales@volia.fr, anthony@volia.fr"
                  className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm"
                />
              </Field>
            </div>
          </div>

          {/* WARM */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 space-y-3">
            <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider">🌡️ Warm — score 40-69</h3>
            <Field label="CRM stage override">
              <input
                type="text"
                value={state.warm.crm_stage}
                onChange={(e) => update('warm', 'crm_stage', e.target.value)}
                placeholder="Ex: Nurture, À recontacter…"
                className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm"
              />
            </Field>
            <Field label="Drip template ID" hint="Template Campagnes à déclencher (nurture mensuel)">
              <input
                type="text"
                value={state.warm.drip_template_id}
                onChange={(e) => update('warm', 'drip_template_id', e.target.value)}
                placeholder="nurture_monthly_b2b"
                className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm font-mono text-xs"
              />
            </Field>
          </div>

          {/* COLD */}
          <div className="rounded-xl border border-slate-300 bg-slate-50/40 p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">❄️ Cold — score &lt; 40</h3>
            <Field label="CRM stage override">
              <input
                type="text"
                value={state.cold.crm_stage}
                onChange={(e) => update('cold', 'crm_stage', e.target.value)}
                placeholder="Ex: Archive, Pas pour nous…"
                className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm"
              />
            </Field>
            <Field label="Archive après N jours" hint="Auto-archive du deal si pas de réponse">
              <input
                type="number"
                value={state.cold.archive_after_days}
                onChange={(e) => update('cold', 'archive_after_days', e.target.value)}
                placeholder="180"
                className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm w-32"
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-content-soft hover:bg-surface-soft"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold disabled:opacity-60 inline-flex items-center gap-1"
            >
              {busy ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
              Enregistrer
            </button>
          </div>

          <div className="rounded-lg bg-violet-50 border border-violet-200 p-3 flex items-start gap-2">
            <Lock size={14} className="text-violet-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-violet-800 leading-relaxed">
              <strong>Note :</strong> Le branching custom est appliqué automatiquement quand un prospect soumet le formulaire de qualification.
              Plan Pro = lecture seule (les valeurs default s'appliquent). Plan Business / Enterprise = override actif.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-content-strong mb-1">{label}</label>
      {hint && <p className="text-[10px] text-content-soft mb-1">{hint}</p>}
      {children}
    </div>
  );
}
