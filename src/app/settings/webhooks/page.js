'use client';

// ─────────────────────────────────────────────────────────────────────
// /settings/webhooks — gestion des webhooks sortants Volia (Sprint D5)
// ─────────────────────────────────────────────────────────────────────
// Tabs :
//   - "Mes webhooks" : liste des subscriptions (cards) + bouton créer
//   - "Logs"         : table paginée des deliveries + drawer détail + replay
//
// Modales :
//   - Création / édition : event picker, URL, secret HMAC (auto-gen + custom)
//   - Détail delivery    : Request / Response + bouton Replay
//   - Confirm suppression
//
// Gating : Pro+ via /api/* (campagnes-access). Côté UI on tente toujours
// les fetch et on affiche l'erreur 403 si besoin → fallback redirect upgrade.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plug,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  Webhook,
  Pause,
  Play,
  PencilLine,
  Send,
  Copy,
  Check,
  Filter,
  ChevronRight,
  Code2,
  Zap,
  BookOpen,
  Clock,
  Activity,
  Shuffle,
  ExternalLink,
} from 'lucide-react';
import { ConfirmModal } from '@/components/ui';
import { WEBHOOK_EVENTS, groupEventsByModule, moduleColor } from '@/lib/webhooks/events';

// ─────────────────────────────────────────────────────────────────────
// Helpers UI

function relativeTime(iso) {
  if (!iso) return 'Jamais';
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 0) return 'à l\'instant';
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `il y a ${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `il y a ${d}j`;
  return new Date(iso).toLocaleDateString('fr-FR');
}

function truncateUrl(url, max = 48) {
  if (!url) return '';
  return url.length > max ? url.slice(0, max - 1) + '…' : url;
}

function statusBadgeForResponse(status, success) {
  if (status == null) {
    return { label: success ? 'OK' : 'Erreur', cls: 'bg-red-500/15 text-red-600 border-red-500/30' };
  }
  if (status >= 200 && status < 300)
    return { label: String(status), cls: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' };
  if (status >= 300 && status < 400)
    return { label: String(status), cls: 'bg-blue-500/15 text-blue-600 border-blue-500/30' };
  if (status >= 400 && status < 500)
    return { label: String(status), cls: 'bg-amber-500/15 text-amber-600 border-amber-500/30' };
  return { label: String(status), cls: 'bg-red-500/15 text-red-600 border-red-500/30' };
}

function CopyButton({ value, small = false }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(String(value || ''));
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* noop */
        }
      }}
      className={`inline-flex items-center gap-1 rounded-md border border-line bg-surface-card hover:bg-surface-elevated text-content-secondary transition ${
        small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]'
      }`}
    >
      {copied ? <Check className={small ? 'h-2.5 w-2.5 text-emerald-500' : 'h-3 w-3 text-emerald-500'} /> : <Copy className={small ? 'h-2.5 w-2.5' : 'h-3 w-3'} />}
      {copied ? 'Copié' : 'Copier'}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Toast

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div
      className={`fixed top-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium shadow-lg animate-in fade-in slide-in-from-top-2 ${
        toast.type === 'success'
          ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
          : 'bg-red-500/15 text-red-600 border border-red-500/30'
      }`}
    >
      {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      {toast.message}
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Subscription card

function SubscriptionCard({ sub, onTest, onToggle, onEdit, onDelete, testingId, togglingId }) {
  const ratePct = sub.success_rate == null ? null : Number(sub.success_rate);
  const rateColor =
    ratePct == null
      ? 'text-content-tertiary'
      : ratePct >= 95
      ? 'text-emerald-600'
      : ratePct >= 70
      ? 'text-amber-600'
      : 'text-red-600';

  return (
    <div className="rounded-2xl border border-line bg-surface-card p-5 hover:border-violet-500/30 transition">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {sub.label && (
              <span className="text-sm font-semibold text-content-primary">{sub.label}</span>
            )}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                sub.active
                  ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                  : 'bg-surface-elevated text-content-tertiary border-line'
              }`}
            >
              {sub.active ? <CheckCircle className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              {sub.active ? 'Actif' : 'En pause'}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <code className="font-mono text-xs text-content-secondary break-all">
              {truncateUrl(sub.target_url, 64)}
            </code>
            <CopyButton value={sub.target_url} small />
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {(sub.events || []).slice(0, 6).map((ev) => {
              const meta = WEBHOOK_EVENTS.find((e) => e.id === ev);
              const mod = meta?.module || 'Global';
              return (
                <span
                  key={ev}
                  title={meta?.description || ev}
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border ${moduleColor(mod)}`}
                >
                  {ev}
                </span>
              );
            })}
            {sub.events && sub.events.length > 6 && (
              <span className="text-[10px] text-content-tertiary px-1.5 py-0.5">
                +{sub.events.length - 6} autres
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-content-tertiary">
            <span>
              Dernier déclenchement&nbsp;:{' '}
              <strong className="text-content-secondary">{relativeTime(sub.last_triggered_at)}</strong>
            </span>
            <span>
              Taux de succès (50 dernières)&nbsp;:{' '}
              <strong className={rateColor}>
                {ratePct == null ? '—' : `${ratePct}%`}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onTest(sub.id)}
            disabled={testingId === sub.id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 border border-violet-500/30 transition disabled:opacity-40"
            title="Envoyer un payload de test à cette URL"
          >
            {testingId === sub.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Tester
          </button>
          <button
            onClick={() => onToggle(sub)}
            disabled={togglingId === sub.id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-line bg-surface-card hover:bg-surface-elevated text-content-secondary transition disabled:opacity-40"
          >
            {sub.active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {sub.active ? 'Pause' : 'Activer'}
          </button>
          <button
            onClick={() => onEdit(sub)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-line bg-surface-card hover:bg-surface-elevated text-content-secondary transition"
          >
            <PencilLine className="h-3.5 w-3.5" />
            Éditer
          </button>
          <button
            onClick={() => onDelete(sub)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Modal création / édition

function WebhookFormModal({ open, onClose, onSaved, editingSub, showToast }) {
  const [targetUrl, setTargetUrl] = useState('');
  const [events, setEvents] = useState([]);
  const [secret, setSecret] = useState('');
  const [label, setLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [secretRevealed, setSecretRevealed] = useState(false);

  const isEdit = !!editingSub;

  // Init state quand on ouvre la modal
  useEffect(() => {
    if (!open) return;
    if (editingSub) {
      setTargetUrl(editingSub.target_url || '');
      setEvents(editingSub.events || []);
      setSecret(''); // jamais récupéré côté GET — vide = pas de changement
      setLabel(editingSub.label || '');
    } else {
      setTargetUrl('');
      setEvents([]);
      setSecret('');
      setLabel('');
    }
    setTestResult(null);
    setSecretRevealed(false);
  }, [open, editingSub]);

  // Escape pour fermer
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, submitting, onClose]);

  const grouped = useMemo(() => groupEventsByModule(), []);

  function toggleEvent(eventId) {
    setEvents((prev) => {
      if (prev.includes(eventId)) return prev.filter((e) => e !== eventId);
      // Si on coche '*', décocher tout le reste (puisque c'est wildcard).
      if (eventId === '*') return ['*'];
      // Si on coche autre chose alors que '*' est actif, retirer '*'.
      return [...prev.filter((e) => e !== '*'), eventId];
    });
  }

  async function handleTest() {
    if (!targetUrl.trim()) {
      showToast('Saisissez une URL avant de tester.', 'error');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_url: targetUrl.trim(),
          secret: secret.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erreur test', 'error');
        return;
      }
      setTestResult(data.delivery);
    } catch {
      showToast('Erreur réseau', 'error');
    } finally {
      setTesting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!targetUrl.trim()) {
      showToast('URL requise.', 'error');
      return;
    }
    if (events.length === 0) {
      showToast('Sélectionnez au moins un event.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const url = isEdit
        ? `/api/webhooks/subscriptions/${editingSub.id}`
        : '/api/webhooks/subscriptions';
      const method = isEdit ? 'PATCH' : 'POST';
      const body = {
        target_url: targetUrl.trim(),
        events,
        label: label.trim() || null,
      };
      if (secret.trim()) body.secret = secret.trim();

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erreur', 'error');
        return;
      }
      // À la création, le serveur peut renvoyer secret_revealed:true (avec
      // subscription.secret en clair) — on l'affiche pour copie ultime.
      if (!isEdit && data.secret_revealed && data.subscription?.secret) {
        setSecret(data.subscription.secret);
        setSecretRevealed(true);
        showToast('Webhook créé. Copiez bien le secret avant de fermer !', 'success');
      } else {
        showToast(isEdit ? 'Webhook mis à jour.' : 'Webhook créé.', 'success');
        onClose();
      }
      onSaved?.();
    } catch {
      showToast('Erreur réseau', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => !submitting && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-card border border-line shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-surface-card/95 backdrop-blur border-b border-line px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/15">
              <Webhook className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-content-primary">
                {isEdit ? 'Éditer le webhook' : 'Nouveau webhook'}
              </h2>
              <p className="text-xs text-content-tertiary mt-0.5">
                Connectez Volia à vos outils via HTTPS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-elevated"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* URL */}
          <div>
            <label className="text-xs text-content-tertiary mb-1.5 block font-medium">
              URL cible (HTTPS uniquement) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://votre-app.com/webhooks/volia"
              required
              className="w-full px-3 py-2.5 rounded-lg bg-surface-base border border-line text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-violet-500 transition-colors font-mono"
            />
            <p className="text-[11px] text-content-tertiary mt-1.5">
              Volia POST'era le payload à cette URL. Signé HMAC-SHA256 dans l'header{' '}
              <code className="font-mono text-content-secondary">X-Volia-Signature</code>.
            </p>
          </div>

          {/* Label */}
          <div>
            <label className="text-xs text-content-tertiary mb-1.5 block font-medium">
              Label (optionnel)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex: Sync CRM Hubspot"
              maxLength={80}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-base border border-line text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Events */}
          <div>
            <label className="text-xs text-content-tertiary mb-1.5 block font-medium">
              Events à écouter <span className="text-red-500">*</span>
              {events.length > 0 && (
                <span className="ml-2 text-content-secondary">
                  ({events.length} sélectionné{events.length > 1 ? 's' : ''})
                </span>
              )}
            </label>
            <div className="border border-line rounded-lg bg-surface-base divide-y divide-line max-h-64 overflow-y-auto">
              {grouped.map(([module, list]) => (
                <div key={module} className="p-3">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-content-muted mb-2">
                    {module}
                  </p>
                  <div className="space-y-1.5">
                    {list.map((ev) => {
                      const checked = events.includes(ev.id);
                      return (
                        <label
                          key={ev.id}
                          className="flex items-start gap-2.5 p-2 rounded hover:bg-surface-elevated cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleEvent(ev.id)}
                            className="mt-0.5 h-4 w-4 rounded border-line text-violet-600 focus:ring-violet-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-xs font-medium text-content-primary">
                                {ev.id}
                              </code>
                              <span className="text-xs text-content-tertiary">{ev.label}</span>
                            </div>
                            <p className="text-[11px] text-content-muted mt-0.5">{ev.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secret */}
          <div>
            <label className="text-xs text-content-tertiary mb-1.5 block font-medium">
              Secret HMAC{' '}
              <span className="text-content-muted">
                ({isEdit ? 'laissez vide pour ne pas changer' : 'auto-généré si vide'})
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={isEdit ? 'Inchangé' : 'whsec_... (auto-généré au submit)'}
                minLength={16}
                className="flex-1 px-3 py-2.5 rounded-lg bg-surface-base border border-line text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-violet-500 transition-colors font-mono"
              />
              {secret && <CopyButton value={secret} />}
            </div>
            {secretRevealed && (
              <p className="mt-2 text-[11px] text-amber-600 flex items-start gap-1.5">
                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                Ce secret n'apparaîtra plus après fermeture. Copiez-le maintenant.
              </p>
            )}
            <p className="text-[11px] text-content-tertiary mt-1.5">
              Min 16 caractères. Utilisé pour vérifier l'authenticité côté votre endpoint :
              recalculez <code>HMAC-SHA256(timestamp + "." + body)</code> et comparez à{' '}
              <code className="font-mono">X-Volia-Signature</code>.
            </p>
          </div>

          {/* Test */}
          <div className="rounded-lg border border-dashed border-line bg-surface-base p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-violet-500" />
                <span className="text-sm font-medium text-content-primary">
                  Tester l'URL avant d'enregistrer
                </span>
              </div>
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !targetUrl.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 border border-violet-500/30 transition disabled:opacity-40"
              >
                {testing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Envoyer un test
              </button>
            </div>
            {testResult && (
              <div
                className={`rounded p-3 text-xs ${
                  testResult.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700'
                    : 'bg-red-500/10 border border-red-500/30 text-red-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {testResult.success ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {testResult.success ? 'Succès' : 'Échec'} —{' '}
                  {testResult.status ? `HTTP ${testResult.status}` : 'pas de réponse'}{' '}
                  · {testResult.durationMs}ms
                </div>
                {testResult.error && (
                  <p className="mt-1 font-mono">{testResult.error}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-lg text-sm border border-line bg-surface-card hover:bg-surface-elevated text-content-secondary transition disabled:opacity-50"
            >
              {secretRevealed ? 'Fermer' : 'Annuler'}
            </button>
            {!secretRevealed && (
              <button
                type="submit"
                disabled={submitting || !targetUrl.trim() || events.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition disabled:opacity-40"
              >
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                {isEdit ? 'Enregistrer' : 'Créer le webhook'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Delivery detail drawer

function DeliveryDrawer({ deliveryId, onClose, onReplay, onPause, showToast }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('request');
  const [replaying, setReplaying] = useState(false);

  useEffect(() => {
    if (!deliveryId) return;
    let cancelled = false;
    setLoading(true);
    setData(null);
    fetch(`/api/webhooks/deliveries/${deliveryId}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.delivery) setData(d.delivery);
        else showToast(d.error || 'Erreur', 'error');
      })
      .catch(() => showToast('Erreur réseau', 'error'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [deliveryId, showToast]);

  useEffect(() => {
    if (!deliveryId) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deliveryId, onClose]);

  if (!deliveryId) return null;

  const badge = data ? statusBadgeForResponse(data.response_status, data.success) : null;

  async function handleReplay() {
    setReplaying(true);
    try {
      const res = await fetch(`/api/webhooks/deliveries/${deliveryId}/replay`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || 'Replay impossible', 'error');
        return;
      }
      showToast(
        json.delivery?.success ? `Replay OK (HTTP ${json.delivery.status})` : `Replay échoué (HTTP ${json.delivery?.status || '—'})`,
        json.delivery?.success ? 'success' : 'error'
      );
      onReplay?.();
    } catch {
      showToast('Erreur réseau', 'error');
    } finally {
      setReplaying(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-surface-card border-l border-line shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-surface-card/95 backdrop-blur border-b border-line px-6 py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {data?.event_type && (
                <code className="font-mono text-sm font-semibold text-content-primary">{data.event_type}</code>
              )}
              {badge && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${badge.cls}`}>
                  {badge.label}
                </span>
              )}
            </div>
            {data?.target_url && (
              <p className="text-[11px] text-content-tertiary font-mono mt-1 truncate">
                {data.target_url}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-elevated" aria-label="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-violet-500 animate-spin" />
          </div>
        ) : data ? (
          <div className="p-6 space-y-5">
            {/* Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <p className="text-content-muted uppercase tracking-wide font-semibold mb-0.5">Statut</p>
                <p className="text-content-primary">{data.success ? 'Succès' : 'Échec'}</p>
              </div>
              <div>
                <p className="text-content-muted uppercase tracking-wide font-semibold mb-0.5">HTTP</p>
                <p className="text-content-primary">{data.response_status ?? '—'}</p>
              </div>
              <div>
                <p className="text-content-muted uppercase tracking-wide font-semibold mb-0.5">Durée</p>
                <p className="text-content-primary">{data.duration_ms}ms</p>
              </div>
              <div>
                <p className="text-content-muted uppercase tracking-wide font-semibold mb-0.5">Tentative</p>
                <p className="text-content-primary">#{data.attempt}</p>
              </div>
            </div>

            <p className="text-[11px] text-content-tertiary">
              <Clock className="h-3 w-3 inline mr-1" />
              {new Date(data.attempted_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'medium' })}
              {' — '}
              {relativeTime(data.attempted_at)}
            </p>

            {data.error_message && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700">
                <strong>Erreur :</strong> {data.error_message}
              </div>
            )}

            {/* Tabs Request / Response */}
            <div className="border-b border-line flex gap-1">
              <button
                onClick={() => setTab('request')}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
                  tab === 'request'
                    ? 'text-violet-600 border-violet-600'
                    : 'text-content-tertiary border-transparent hover:text-content-primary'
                }`}
              >
                Request
              </button>
              <button
                onClick={() => setTab('response')}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
                  tab === 'response'
                    ? 'text-violet-600 border-violet-600'
                    : 'text-content-tertiary border-transparent hover:text-content-primary'
                }`}
              >
                Response
              </button>
            </div>

            {tab === 'request' && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-content-muted">
                      Payload JSON
                    </p>
                    <CopyButton value={JSON.stringify(data.payload, null, 2)} small />
                  </div>
                  <pre className="rounded-lg border border-line bg-surface-base p-3 text-[11px] font-mono text-content-secondary overflow-x-auto max-h-96 whitespace-pre-wrap break-all">
                    {JSON.stringify(data.payload, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide font-semibold text-content-muted mb-1">
                    Headers envoyés
                  </p>
                  <pre className="rounded-lg border border-line bg-surface-base p-3 text-[11px] font-mono text-content-tertiary">
{`Content-Type: application/json
User-Agent: Volia-Webhooks/1.0
X-Volia-Event: ${data.event_type}
X-Volia-Signature: t=<unix>,v1=<HMAC-SHA256>
X-Volia-Timestamp: <unix>
X-Volia-Delivery: <uuid>`}
                  </pre>
                </div>
              </div>
            )}

            {tab === 'response' && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-content-muted">
                      Response body
                    </p>
                    {data.response_body && <CopyButton value={data.response_body} small />}
                  </div>
                  <pre className="rounded-lg border border-line bg-surface-base p-3 text-[11px] font-mono text-content-secondary overflow-x-auto max-h-96 whitespace-pre-wrap break-all">
                    {data.response_body || '(vide)'}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-3 border-t border-line">
              <button
                onClick={handleReplay}
                disabled={replaying || !data.subscription_id}
                title={!data.subscription_id ? 'Replay indisponible (test ad-hoc)' : 'Re-envoyer le même payload'}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-500 transition disabled:opacity-40"
              >
                {replaying ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Shuffle className="h-3.5 w-3.5" />}
                Replay this webhook
              </button>
              {data.subscription_id && (
                <button
                  onClick={() => onPause?.(data.subscription_id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-line bg-surface-card hover:bg-surface-elevated text-content-secondary transition"
                >
                  <Pause className="h-3.5 w-3.5" />
                  Désactiver cette subscription
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-content-tertiary">Aucune donnée</div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Logs tab

function LogsTab({ subscriptions, onOpenDelivery, toast, showToast }) {
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ subscription_id: '', event_type: '', status: '' });
  const [page, setPage] = useState(0);
  const limit = 50;

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (filters.subscription_id) qs.set('subscription_id', filters.subscription_id);
      if (filters.event_type) qs.set('event_type', filters.event_type);
      if (filters.status) qs.set('status', filters.status);
      qs.set('limit', String(limit));
      qs.set('offset', String(page * limit));
      const res = await fetch(`/api/webhooks/deliveries?${qs}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erreur logs', 'error');
        setDeliveries([]);
        setTotal(0);
        return;
      }
      setDeliveries(data.deliveries || []);
      setTotal(data.total || 0);
    } catch {
      showToast('Erreur réseau', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, page, showToast]);

  useEffect(() => {
    loadDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, toast]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap rounded-xl border border-line bg-surface-card p-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-content-tertiary px-2">
          <Filter className="h-3.5 w-3.5" />
          Filtres&nbsp;:
        </div>
        <select
          value={filters.subscription_id}
          onChange={(e) => {
            setFilters((f) => ({ ...f, subscription_id: e.target.value }));
            setPage(0);
          }}
          className="px-2 py-1.5 rounded-lg bg-surface-base border border-line text-xs text-content-primary"
        >
          <option value="">Toutes les subscriptions</option>
          {subscriptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label || truncateUrl(s.target_url, 40)}
            </option>
          ))}
        </select>
        <select
          value={filters.event_type}
          onChange={(e) => {
            setFilters((f) => ({ ...f, event_type: e.target.value }));
            setPage(0);
          }}
          className="px-2 py-1.5 rounded-lg bg-surface-base border border-line text-xs text-content-primary"
        >
          <option value="">Tous les events</option>
          <option value="test">test</option>
          {WEBHOOK_EVENTS.filter((e) => e.id !== '*').map((e) => (
            <option key={e.id} value={e.id}>
              {e.id}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters((f) => ({ ...f, status: e.target.value }));
            setPage(0);
          }}
          className="px-2 py-1.5 rounded-lg bg-surface-base border border-line text-xs text-content-primary"
        >
          <option value="">Tous statuts</option>
          <option value="success">Succès</option>
          <option value="failed">Échec</option>
          <option value="2xx">2xx</option>
          <option value="4xx">4xx</option>
          <option value="5xx">5xx</option>
        </select>
        <button
          onClick={loadDeliveries}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-line bg-surface-card hover:bg-surface-elevated text-content-secondary transition disabled:opacity-40"
        >
          {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Rafraîchir
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-line bg-surface-card overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-violet-500 animate-spin" />
          </div>
        ) : deliveries.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="h-8 w-8 text-content-muted mx-auto mb-2" />
            <p className="text-sm text-content-primary font-medium">Aucune livraison</p>
            <p className="text-xs text-content-tertiary mt-1">
              Les deliveries apparaîtront ici dès que vos webhooks seront déclenchés.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-surface-elevated">
                <tr className="text-left text-content-tertiary">
                  <th className="px-3 py-2 font-semibold">Date</th>
                  <th className="px-3 py-2 font-semibold">Event</th>
                  <th className="px-3 py-2 font-semibold">URL</th>
                  <th className="px-3 py-2 font-semibold text-right">Statut</th>
                  <th className="px-3 py-2 font-semibold text-right">Durée</th>
                  <th className="px-3 py-2 font-semibold text-right">Try</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => {
                  const badge = statusBadgeForResponse(d.response_status, d.success);
                  return (
                    <tr
                      key={d.id}
                      onClick={() => onOpenDelivery(d.id)}
                      className="border-t border-line hover:bg-surface-elevated cursor-pointer transition"
                    >
                      <td className="px-3 py-2 align-top whitespace-nowrap text-content-tertiary">
                        {new Date(d.attempted_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <code className="font-mono text-content-primary">{d.event_type}</code>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <code className="font-mono text-content-secondary">{truncateUrl(d.target_url, 36)}</code>
                      </td>
                      <td className="px-3 py-2 align-top text-right">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top text-right text-content-tertiary">
                        {d.duration_ms}ms
                      </td>
                      <td className="px-3 py-2 align-top text-right text-content-tertiary">
                        #{d.attempt}
                      </td>
                      <td className="px-3 py-2 align-top text-right">
                        <ChevronRight className="h-3.5 w-3.5 text-content-muted inline" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="px-3 py-2 border-t border-line flex items-center justify-between text-xs text-content-tertiary">
            <span>
              {page * limit + 1}–{Math.min((page + 1) * limit, total)} sur {total}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-2 py-1 rounded border border-line bg-surface-card hover:bg-surface-elevated disabled:opacity-40"
              >
                Précédent
              </button>
              <span className="px-2 py-1">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-2 py-1 rounded border border-line bg-surface-card hover:bg-surface-elevated disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Main page

export default function WebhooksPage() {
  const router = useRouter();
  const [tab, setTab] = useState('subs'); // 'subs' | 'logs'
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState([]);
  const [toast, setToast] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const [testingId, setTestingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [subToDelete, setSubToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [drawerDeliveryId, setDrawerDeliveryId] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const loadSubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webhooks/subscriptions', { cache: 'no-store' });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.status === 403) {
        setAccessDenied(true);
        setSubs([]);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erreur de chargement', 'error');
        setSubs([]);
      } else {
        setSubs(data.subscriptions || []);
      }
    } catch {
      showToast('Erreur réseau', 'error');
    } finally {
      setLoading(false);
    }
  }, [router, showToast]);

  useEffect(() => {
    loadSubs();
  }, [loadSubs]);

  async function handleTest(id) {
    setTestingId(id);
    try {
      const res = await fetch(`/api/webhooks/subscriptions/${id}/test`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Test impossible', 'error');
        return;
      }
      const ok = data.delivery?.success;
      showToast(
        ok
          ? `Test OK (HTTP ${data.delivery.status} · ${data.delivery.durationMs}ms)`
          : `Test échoué : ${data.delivery?.error || `HTTP ${data.delivery?.status || '—'}`}`,
        ok ? 'success' : 'error'
      );
      loadSubs();
    } catch {
      showToast('Erreur réseau', 'error');
    } finally {
      setTestingId(null);
    }
  }

  async function handleToggle(sub) {
    setTogglingId(sub.id);
    try {
      const res = await fetch(`/api/webhooks/subscriptions/${sub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !sub.active }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erreur', 'error');
        return;
      }
      setSubs((prev) => prev.map((s) => (s.id === sub.id ? data.subscription : s)));
      showToast(data.subscription.active ? 'Webhook réactivé.' : 'Webhook en pause.', 'success');
    } catch {
      showToast('Erreur réseau', 'error');
    } finally {
      setTogglingId(null);
    }
  }

  async function performDelete() {
    if (!subToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/webhooks/subscriptions/${subToDelete.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || 'Suppression impossible', 'error');
        return;
      }
      setSubs((prev) => prev.filter((s) => s.id !== subToDelete.id));
      showToast('Webhook supprimé.', 'success');
    } catch {
      showToast('Erreur réseau', 'error');
    } finally {
      setDeleting(false);
      setSubToDelete(null);
    }
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-surface-base text-content-primary flex items-center justify-center p-6">
        <div className="max-w-md text-center rounded-2xl border border-line bg-surface-card p-8">
          <Webhook className="h-10 w-10 text-violet-500 mx-auto mb-3" />
          <h1 className="text-lg font-semibold mb-2">Webhooks disponibles dès le plan Prospection</h1>
          <p className="text-sm text-content-secondary mb-4">
            Les webhooks sortants nécessitent un plan Prospection (19 €/mois) ou MAX.
            Connectez Volia à vos outils via Zapier, Make, n8n ou votre app custom.
          </p>
          <Link
            href="/settings#plan"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500"
          >
            Voir les plans
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header sticky */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface-base/85 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/settings')}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-elevated transition-colors text-content-tertiary hover:text-content-primary text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Paramètres</span>
          </button>
          <div className="h-6 w-px bg-line mx-1" />
          <Webhook className="h-4 w-4 text-violet-500" />
          <h1 className="text-base font-semibold text-content-primary">Webhooks</h1>
          <div className="ml-auto">
            <button
              onClick={() => {
                setEditingSub(null);
                setFormOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold shadow-md shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouveau webhook
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
        {/* Intro */}
        <section className="rounded-2xl border border-line bg-gradient-to-br from-violet-500/[0.06] via-indigo-500/[0.04] to-surface-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 rounded-lg bg-violet-500/15">
              <Plug className="h-5 w-5 text-violet-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-content-primary">
                Connectez Volia à vos outils
              </h2>
              <p className="text-sm text-content-secondary mt-1 leading-relaxed">
                Recevez en temps réel les events Volia (prospect créé, email cliqué, deal CRM
                gagné…) sur l'URL de votre choix. Compatible Zapier, Make, n8n, ou votre app
                custom. Chaque payload est signé HMAC-SHA256 pour garantir l'authenticité.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Link
                  href="/integrations/zapier"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card border border-line hover:bg-surface-elevated text-xs font-medium text-content-secondary transition"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Utiliser Zapier
                </Link>
                <Link
                  href="/api"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card border border-line hover:bg-surface-elevated text-xs font-medium text-content-secondary transition"
                >
                  <Code2 className="h-3.5 w-3.5 text-violet-500" />
                  API publique
                </Link>
                <Link
                  href="/api"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card border border-line hover:bg-surface-elevated text-xs font-medium text-content-secondary transition"
                >
                  <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                  Documentation webhooks
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="border-b border-line flex gap-1">
          <button
            onClick={() => setTab('subs')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              tab === 'subs'
                ? 'text-violet-600 border-violet-600'
                : 'text-content-tertiary border-transparent hover:text-content-primary'
            }`}
          >
            Mes webhooks ({subs.length})
          </button>
          <button
            onClick={() => setTab('logs')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              tab === 'logs'
                ? 'text-violet-600 border-violet-600'
                : 'text-content-tertiary border-transparent hover:text-content-primary'
            }`}
          >
            Logs
          </button>
        </div>

        {tab === 'subs' && (
          <section className="space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-line bg-surface-card p-8 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-violet-500 animate-spin" />
              </div>
            ) : subs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-surface-card p-10 text-center">
                <div className="inline-flex p-3 rounded-2xl bg-violet-500/10 mb-3">
                  <Webhook className="h-8 w-8 text-violet-500" />
                </div>
                <h3 className="text-base font-semibold text-content-primary">
                  Connectez Volia à vos outils via webhooks
                </h3>
                <p className="text-sm text-content-tertiary mt-2 max-w-md mx-auto leading-relaxed">
                  Recevez en temps réel chaque event Volia (prospect, campagne, deal CRM…)
                  sur l'endpoint de votre choix. Setup en 2 minutes.
                </p>
                <button
                  onClick={() => {
                    setEditingSub(null);
                    setFormOpen(true);
                  }}
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 hover:from-violet-500 hover:to-indigo-500 transition active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Créer mon premier webhook
                </button>
              </div>
            ) : (
              subs.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  sub={sub}
                  onTest={handleTest}
                  onToggle={handleToggle}
                  onEdit={(s) => {
                    setEditingSub(s);
                    setFormOpen(true);
                  }}
                  onDelete={(s) => setSubToDelete(s)}
                  testingId={testingId}
                  togglingId={togglingId}
                />
              ))
            )}
          </section>
        )}

        {tab === 'logs' && (
          <LogsTab
            subscriptions={subs}
            onOpenDelivery={setDrawerDeliveryId}
            toast={toast}
            showToast={showToast}
          />
        )}
      </div>

      <WebhookFormModal
        open={formOpen}
        editingSub={editingSub}
        onClose={() => {
          setFormOpen(false);
          setEditingSub(null);
        }}
        onSaved={loadSubs}
        showToast={showToast}
      />

      <DeliveryDrawer
        deliveryId={drawerDeliveryId}
        onClose={() => setDrawerDeliveryId(null)}
        onReplay={() => loadSubs()}
        onPause={async (subId) => {
          const sub = subs.find((s) => s.id === subId);
          if (sub && sub.active) {
            await handleToggle(sub);
          }
        }}
        showToast={showToast}
      />

      <ConfirmModal
        open={!!subToDelete}
        onClose={() => !deleting && setSubToDelete(null)}
        onConfirm={performDelete}
        title={`Supprimer ce webhook ?`}
        message={
          <span>
            L'URL <code className="font-mono">{truncateUrl(subToDelete?.target_url || '', 50)}</code>{' '}
            ne recevra plus aucun event Volia. L'historique des livraisons sera également supprimé.
          </span>
        }
        confirmLabel="Supprimer le webhook"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
