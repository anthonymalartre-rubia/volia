'use client';

// ─────────────────────────────────────────────────────────────────────
// /admin/auto-queue — Approval queue UI pour boucles auto-pilote Volia
// ─────────────────────────────────────────────────────────────────────
// Liste les actions yellow-flag (medium risk) qui attendent l'approbation
// du founder avant exécution. Cf. docs/autonomy/00-PLAN.md.
//
// Pattern visuel : table dense avec preview + boutons Approve/Reject
// inline. Pas de modal — décision rapide en 1 clic.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot, CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw,
  Loader2, Send, FileText, Sparkles, Power, PowerOff,
  Copy, Check, Briefcase, Bird, Zap, Upload,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
// Note : pas d'import TopBar — le layout parent /admin/layout.js en rend
// déjà une (cf. bug TopBar dupliquée corrigé 1er juin 2026).

// ─────────────────────────────────────────────────────────────────────
// SocialPostPreview — rendu dédié pour brouillons LinkedIn + X
// ─────────────────────────────────────────────────────────────────────
function SocialPostPreview({ payload }) {
  const [copiedKey, setCopiedKey] = useState(null);

  function copy(text, key) {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  }

  const linkedinLen = (payload.linkedin || '').length;
  const twitterLen = (payload.twitter || '').length;

  return (
    <div className="mb-3 space-y-2">
      {/* Tabs LinkedIn / Bird */}
      <div className="rounded-lg border border-line bg-surface-elevated p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-secondary">
            <Briefcase size={14} className="text-[#0077b5]" />
            LinkedIn
            <span className="text-content-tertiary font-normal">· {linkedinLen} car.</span>
          </div>
          <button
            type="button"
            onClick={() => copy(payload.linkedin, 'linkedin')}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-line bg-white hover:bg-violet-50 hover:border-violet-300 text-[11px] font-semibold text-content-primary transition"
          >
            {copiedKey === 'linkedin' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            {copiedKey === 'linkedin' ? 'Copié' : 'Copier'}
          </button>
        </div>
        <p className="text-sm text-content-primary whitespace-pre-wrap break-words leading-relaxed">
          {payload.linkedin}
        </p>
      </div>

      {payload.twitter && (
        <div className="rounded-lg border border-line bg-surface-elevated p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-secondary">
              <Bird size={14} className="text-[#1da1f2]" />
              X / Bird
              <span className={`font-normal ${twitterLen > 280 ? 'text-rose-600' : 'text-content-tertiary'}`}>
                · {twitterLen}/280
              </span>
            </div>
            <button
              type="button"
              onClick={() => copy(payload.twitter, 'twitter')}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-line bg-white hover:bg-violet-50 hover:border-violet-300 text-[11px] font-semibold text-content-primary transition"
            >
              {copiedKey === 'twitter' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
              {copiedKey === 'twitter' ? 'Copié' : 'Copier'}
            </button>
          </div>
          <p className="text-sm text-content-primary whitespace-pre-wrap break-words leading-relaxed">
            {payload.twitter}
          </p>
        </div>
      )}

      {payload.main_topic && (
        <p className="text-[11px] text-content-tertiary">
          Sujet : <span className="font-mono">{payload.main_topic}</span>
          {payload.model && <span className="ml-2">· Modèle : <span className="font-mono">{payload.model}</span></span>}
        </p>
      )}
    </div>
  );
}

const RISK_BADGES = {
  low: { label: 'Low', cls: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700 border-amber-300' },
  high: { label: 'High', cls: 'bg-rose-100 text-rose-700 border-rose-300' },
};

const ACTION_ICONS = {
  linkedin_post: Send,
  twitter_post: Send,
  cold_email_send: Send,
  blog_publish: FileText,
  auto_changelog_entry: FileText,
  default: Sparkles,
};

export default function AutoQueuePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autonomyEnabled, setAutonomyEnabled] = useState(false);
  const [autonomySource, setAutonomySource] = useState('env'); // 'db' | 'env'
  const [autonomyReason, setAutonomyReason] = useState(null);
  const [togglingAutonomy, setTogglingAutonomy] = useState(false);
  const [actionInFlight, setActionInFlight] = useState(null); // id en cours d'approve/reject
  const [error, setError] = useState('');

  // Trigger cron manuels
  const [triggering, setTriggering] = useState(null); // 'auto-content-proposer' | 'publish-approved-actions' | null
  const [triggerResult, setTriggerResult] = useState(null);

  async function handleTrigger(cron) {
    setTriggering(cron);
    setTriggerResult(null);
    setError('');
    try {
      const res = await fetch('/api/admin/trigger-cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cron }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur');
        return;
      }
      setTriggerResult({ cron, ...data });
      // Refresh la queue automatiquement pour voir le nouveau brouillon
      setTimeout(() => fetchQueue(), 500);
    } catch (e) {
      setError(e.message);
    } finally {
      setTriggering(null);
    }
  }

  // ─── Auth check (admin only) ────────────────────────────────
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setAuthChecked(true);
      return;
    }
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) {
        router.push('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', u.id)
        .maybeSingle();
      if (!profile?.is_admin) {
        router.replace('/dashboard');
        return;
      }
      setUser(u);
      setAuthChecked(true);
    });
  }, [router]);

  // ─── Fetch queue ────────────────────────────────────────────
  async function fetchQueue() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auto-queue');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur de chargement');
        setLoading(false);
        return;
      }
      setQueue(data.queue || []);
      setAutonomyEnabled(data.autonomy_enabled || false);
      setAutonomySource(data.autonomy_source || 'env');
      setAutonomyReason(data.autonomy_reason || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authChecked && user) fetchQueue();
  }, [authChecked, user]);

  // Auto-refresh toutes les 30s pour voir les nouvelles actions
  useEffect(() => {
    if (!authChecked || !user) return;
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [authChecked, user]);

  // ─── Actions approve/reject ─────────────────────────────────
  async function handleDecision(actionId, decision, reason = null) {
    setActionInFlight(actionId);
    setError('');
    try {
      const res = await fetch('/api/admin/auto-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId, decision, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur');
        setActionInFlight(null);
        return;
      }
      // Retire l'action de la queue locale (optimistic)
      setQueue((prev) => prev.filter((a) => a.id !== actionId));
    } catch (e) {
      setError(e.message);
    } finally {
      setActionInFlight(null);
    }
  }

  // ─── Loading state ──────────────────────────────────────────
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center animate-pulse">
          <Bot size={28} className="text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base text-content-primary flex flex-col">
      {/* Pas de TopBar : déjà rendue par /admin/layout.js (sinon doublon) */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* ─── Header ────────────────────────────────────────── */}
        <div className="mb-6">
          <nav className="text-xs text-content-tertiary mb-3 flex items-center gap-2">
            <a href="/admin" className="hover:text-violet-700 transition">Admin</a>
            <span>·</span>
            <span className="text-content-primary font-medium">Auto-queue</span>
            <span className="mx-2">·</span>
            <a href="/admin/publishers" className="hover:text-violet-700 transition">Publishers</a>
          </nav>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-content-primary">Approval queue</h1>
                <p className="text-sm text-content-tertiary mt-1">
                  Actions proposées par les boucles auto-pilote en attente de validation.
                  <a href="/admin" className="ml-1 text-violet-700 hover:underline">Cf. plan</a>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Kill switch toggle (clickable) */}
              <button
                type="button"
                onClick={async () => {
                  const confirmMsg = autonomyEnabled
                    ? 'Désactiver Autonomy maintenant ? Tous les crons auto seront en pause.'
                    : 'Réactiver Autonomy maintenant ?';
                  if (!confirm(confirmMsg)) return;
                  setTogglingAutonomy(true);
                  try {
                    const res = await fetch('/api/admin/autonomy-toggle', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ enabled: !autonomyEnabled }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setAutonomyEnabled(data.enabled);
                      setAutonomySource(data.source);
                      setAutonomyReason(data.reason);
                    } else {
                      setError(data.error || 'Erreur toggle');
                    }
                  } catch (e) {
                    setError(e.message);
                  } finally {
                    setTogglingAutonomy(false);
                  }
                }}
                disabled={togglingAutonomy}
                title={autonomyReason || 'Cliquer pour toggle (override DB)'}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition disabled:opacity-50 cursor-pointer ${
                  autonomyEnabled
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                }`}
              >
                {togglingAutonomy ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : autonomyEnabled ? (
                  <Power size={12} />
                ) : (
                  <PowerOff size={12} />
                )}
                Autonomy {autonomyEnabled ? 'ON' : 'OFF'}
                <span className="text-[9px] opacity-60 uppercase">[{autonomySource}]</span>
              </button>

              <button
                type="button"
                onClick={fetchQueue}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-card border border-line text-sm hover:bg-surface-elevated transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ─── Kill switch warning ─────────────────────────────── */}
        {!autonomyEnabled && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">Autonomy mode désactivé</p>
              <p className="text-xs text-amber-800">
                Les boucles auto-pilote n&apos;exécutent pas d&apos;action tant que l&apos;env var{' '}
                <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">AUTONOMOUS_MODE_ENABLED=true</code>
                {' '}n&apos;est pas définie sur Vercel. Les actions affichées ci-dessous ont été
                proposées mais ne seront pas exécutées même si tu les approuves.
              </p>
            </div>
          </div>
        )}

        {/* ─── Error banner ────────────────────────────────────── */}
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* ─── Triggers manuels (admin shortcuts) ───────────────── */}
        <div className="mb-6 p-4 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-900 mb-2">
            Triggers manuels (test rapide)
          </p>
          <p className="text-xs text-violet-800 mb-3">
            Lance les crons sans attendre leur prochain tick scheduled. Utile pour tester
            ou rattraper un événement urgent.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleTrigger('auto-content-proposer')}
              disabled={triggering !== null || !autonomyEnabled}
              title={!autonomyEnabled ? 'Autonomy OFF — activer AUTONOMOUS_MODE_ENABLED' : ''}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-500 text-xs font-semibold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {triggering === 'auto-content-proposer' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Zap size={12} />
              )}
              Générer un brouillon maintenant
            </button>
            <button
              type="button"
              onClick={() => handleTrigger('publish-approved-actions')}
              disabled={triggering !== null || !autonomyEnabled}
              title={!autonomyEnabled ? 'Autonomy OFF — activer AUTONOMOUS_MODE_ENABLED' : ''}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {triggering === 'publish-approved-actions' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Upload size={12} />
              )}
              Publier les approuvés maintenant
            </button>
          </div>

          {/* Résultat dernier trigger */}
          {triggerResult && (
            <div className="mt-3 p-2.5 rounded-lg bg-white border border-violet-200 text-xs">
              <p className="font-semibold text-violet-900 mb-1">
                Résultat ({triggerResult.cron}) :
              </p>
              <pre className="text-[11px] text-violet-800 overflow-x-auto whitespace-pre-wrap font-mono">
                {JSON.stringify(triggerResult.result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* ─── Queue ───────────────────────────────────────────── */}
        {loading && queue.length === 0 ? (
          <div className="text-center py-20 text-content-tertiary text-sm">
            <Loader2 size={24} className="animate-spin inline-block mb-3 text-violet-600" />
            <p>Chargement de la queue…</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-line p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 mb-4">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-content-primary mb-1">Queue vide</h2>
            <p className="text-sm text-content-tertiary">
              Aucune action en attente d&apos;approbation. Les boucles auto-pilote tournent normalement
              ou rien n&apos;est shippable pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((action) => {
              const RiskBadge = RISK_BADGES[action.risk_level] || RISK_BADGES.medium;
              const Icon = ACTION_ICONS[action.action_type] || ACTION_ICONS.default;
              const expiresIn = action.expires_at
                ? Math.max(0, Math.floor((new Date(action.expires_at) - Date.now()) / (3600 * 1000)))
                : null;

              return (
                <article
                  key={action.id}
                  className="rounded-xl border border-line bg-surface-card hover:shadow-md transition overflow-hidden"
                >
                  <div className="p-4 sm:p-5">
                    {/* Header : type + badges + meta */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center">
                        <Icon size={18} className="text-violet-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-sm font-bold text-content-primary">
                            {action.action_type}
                          </h3>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${RiskBadge.cls}`}
                          >
                            {RiskBadge.label}
                          </span>
                          <span className="text-xs text-content-tertiary">
                            par <span className="font-mono">{action.source}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-content-tertiary">
                          <span>
                            Créée il y a{' '}
                            {Math.floor((Date.now() - new Date(action.created_at)) / 60000)} min
                          </span>
                          {expiresIn !== null && (
                            <span className="inline-flex items-center gap-1">
                              <Clock size={11} />
                              Expire dans {expiresIn}h
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Social post drafts (linkedin_post) : affichage dédié + boutons Copier */}
                    {action.action_type === 'linkedin_post' && action.payload?.linkedin && (
                      <SocialPostPreview payload={action.payload} />
                    )}

                    {/* Preview standard (sauf si déjà couvert par SocialPostPreview ci-dessus) */}
                    {action.preview && action.action_type !== 'linkedin_post' && (
                      <div className="mb-3 p-3 rounded-lg bg-surface-elevated border border-line">
                        <p className="text-xs uppercase tracking-wider text-content-muted font-semibold mb-1">
                          Aperçu
                        </p>
                        <p className="text-sm text-content-primary whitespace-pre-wrap break-words">
                          {action.preview}
                        </p>
                      </div>
                    )}

                    {/* Rationale */}
                    {action.rationale && (
                      <p className="text-xs text-content-tertiary italic mb-3">
                        <strong className="text-content-secondary not-italic">Pourquoi : </strong>
                        {action.rationale}
                      </p>
                    )}

                    {/* Payload (collapsed) */}
                    {action.payload && Object.keys(action.payload).length > 0 && (
                      <details className="mb-3">
                        <summary className="text-xs text-content-tertiary cursor-pointer hover:text-content-primary">
                          Voir le payload complet
                        </summary>
                        <pre className="mt-2 p-2 rounded bg-surface-elevated text-[10px] overflow-x-auto border border-line">
                          {JSON.stringify(action.payload, null, 2)}
                        </pre>
                      </details>
                    )}

                    {/* Boutons décision */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                      <button
                        type="button"
                        onClick={() => handleDecision(action.id, 'reject')}
                        disabled={actionInFlight === action.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold transition disabled:opacity-50"
                      >
                        {actionInFlight === action.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <XCircle size={12} />
                        )}
                        Rejeter
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision(action.id, 'approve')}
                        disabled={actionInFlight === action.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                      >
                        {actionInFlight === action.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        Approuver
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footnote : doc link */}
        <div className="mt-12 text-xs text-content-tertiary text-center">
          Page admin uniquement · Architecture détaillée :{' '}
          <code className="font-mono">docs/autonomy/00-PLAN.md</code> · Cf. <code className="font-mono">src/lib/autonomy.js</code>
        </div>
      </main>
    </div>
  );
}
