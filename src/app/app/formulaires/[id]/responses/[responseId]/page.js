'use client';

// ─────────────────────────────────────────────────────────────────────
// /app/formulaires/[id]/responses/[responseId] — Détail réponse (Sprint F7)
// ─────────────────────────────────────────────────────────────────────
// Vue détaillée d'une submission :
//   - Toutes les answers labellisées (via schema fields)
//   - Files avec download signed URL
//   - Metadata : date, source, locale, temps de complétion, device
//   - Bridge status + liens vers CRM contact / Campagnes list
//   - Actions : Supprimer (RGPD), Re-trigger bridges
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  MinusCircle,
  Trash2,
  RefreshCcw,
  Download,
  ExternalLink,
  Mail,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  AlertCircle,
} from 'lucide-react';

const BRIDGE_META = {
  succeeded: { label: 'Bridges OK', icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  failed:    { label: 'Échec',       icon: XCircle,       cls: 'bg-rose-100 text-rose-700 border-rose-200' },
  pending:   { label: 'En attente',  icon: Clock,         cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  skipped:   { label: 'Aucun bridge', icon: MinusCircle, cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
};

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatBytes(b) {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDuration(ms) {
  if (ms == null || ms <= 0) return '—';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest === 0 ? `${m} min` : `${m} min ${rest} s`;
}

function DeviceIcon({ device }) {
  const Icon =
    device === 'mobile' ? Smartphone :
    device === 'tablet' ? Tablet :
    device === 'desktop' ? Monitor : Globe;
  return <Icon size={13} />;
}

// Affiche une answer (value) selon le field_type
function AnswerValue({ field, value, files }) {
  if (value == null || value === '') {
    return <span className="text-xs text-content-faint italic">— vide —</span>;
  }
  // Fichier
  if (value && typeof value === 'object' && (value._file || value._pending_file)) {
    const file = files.find((f) => f.field_key === field?.field_key);
    return (
      <div className="space-y-1.5">
        <div className="text-sm text-content-primary">{value.name || file?.file_name || 'Fichier'}</div>
        {file && (
          <div className="flex items-center gap-3 text-[11px] text-content-tertiary">
            <span>{formatBytes(file.file_size)}</span>
            <span>·</span>
            <span>{file.mime_type}</span>
            {file.signed_url && (
              <a
                href={file.signed_url}
                target="_blank"
                rel="noopener noreferrer"
                download={file.file_name}
                className="inline-flex items-center gap-1 text-pink-700 hover:text-pink-600 transition-colors"
              >
                <Download size={11} /> Télécharger
              </a>
            )}
          </div>
        )}
      </div>
    );
  }
  if (Array.isArray(value)) {
    return <span className="text-sm text-content-primary">{value.join(', ')}</span>;
  }
  if (typeof value === 'boolean') {
    return <span className="text-sm text-content-primary">{value ? 'Oui' : 'Non'}</span>;
  }
  // String multiline → préserver les sauts
  const str = String(value);
  if (str.length > 80 || str.includes('\n')) {
    return <span className="text-sm text-content-primary whitespace-pre-wrap break-words">{str}</span>;
  }
  if (field?.field_type === 'email') {
    return (
      <a href={`mailto:${str}`} className="text-sm text-pink-700 hover:underline">
        {str}
      </a>
    );
  }
  return <span className="text-sm text-content-primary break-words">{str}</span>;
}

export default function ResponseDetailPage() {
  const { id, responseId } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acting, setActing] = useState(null); // 'delete' | 'retry'
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/forms/${id}/responses/${responseId}`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || 'Erreur de chargement');
        } else {
          setData(json);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, responseId]);

  async function handleDelete() {
    if (!confirm('Supprimer définitivement cette réponse ? Les fichiers liés seront aussi effacés. Action irréversible.')) {
      return;
    }
    setActing('delete');
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/forms/${id}/responses/${responseId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) {
        setActionMessage({ type: 'error', text: json.error || 'Suppression échouée' });
        setActing(null);
        return;
      }
      router.push(`/app/formulaires/${id}/responses`);
    } catch (e) {
      setActionMessage({ type: 'error', text: e.message });
      setActing(null);
    }
  }

  async function handleRetry() {
    setActing('retry');
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/forms/${id}/responses/${responseId}/retry`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) {
        setActionMessage({ type: 'error', text: json.error || 'Retry échoué' });
        setActing(null);
        return;
      }
      setActionMessage({ type: 'success', text: json.message || 'Les bridges seront retentés sous peu.' });
      setActing(null);
      // Refetch après 1s pour voir le nouveau bridge_status
      setTimeout(() => {
        fetch(`/api/admin/forms/${id}/responses/${responseId}`)
          .then((r) => r.json())
          .then((j) => { if (j.success) setData(j); })
          .catch(() => {});
      }, 1500);
    } catch (e) {
      setActionMessage({ type: 'error', text: e.message });
      setActing(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link
        href={`/app/formulaires/${id}/responses`}
        className="inline-flex items-center gap-1.5 text-xs text-content-tertiary hover:text-pink-700 transition-colors mb-4"
      >
        <ArrowLeft size={14} /> Retour aux réponses
      </Link>

      {loading && (
        <div className="rounded-2xl border border-line bg-surface-card p-10 text-center">
          <Loader2 size={20} className="mx-auto text-pink-600 animate-spin mb-2" />
          <p className="text-sm text-content-tertiary">Chargement…</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 p-4">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Header */}
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-pink-700 mb-2">
              {data.form?.name || 'Formulaire'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Réponse #{data.response.id.slice(0, 8)}
            </h1>
            <p className="mt-1 text-sm text-content-tertiary">
              Reçue le {formatDate(data.response.submitted_at)}
            </p>
          </div>

          {actionMessage && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}>
              {actionMessage.text}
            </div>
          )}

          {/* Bridge banner */}
          {data.response.bridge_status && (
            <div className="mb-4">
              <BridgeBanner
                status={data.response.bridge_status}
                error={data.response.bridge_error}
                retryCount={data.response.bridge_retry_count}
                nextRetryAt={data.response.bridge_next_retry_at}
                crmContactId={data.response.crm_contact_id}
                campagnesContactId={data.response.campagnes_contact_id}
              />
            </div>
          )}

          {/* Réponses */}
          <div className="rounded-2xl border border-line bg-surface-card overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-line">
              <h2 className="text-sm font-semibold text-content-primary">Réponses</h2>
            </div>
            <div className="divide-y divide-line">
              {data.schema_fields.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-content-tertiary">
                    Le schéma du formulaire est vide. Les answers brutes :
                  </p>
                  <pre className="mt-3 text-left text-[11px] bg-surface-elevated p-3 rounded-lg overflow-auto max-h-[300px]">
                    {JSON.stringify(data.response.answers, null, 2)}
                  </pre>
                </div>
              ) : (
                data.schema_fields.map((f) => (
                  <div key={f.field_key} className="px-4 py-3">
                    <div className="text-[11px] font-semibold text-content-tertiary uppercase tracking-wider mb-1">
                      {f.label}
                      {f.required && <span className="text-rose-600 ml-1">*</span>}
                    </div>
                    <AnswerValue
                      field={f}
                      value={data.response.answers?.[f.field_key]}
                      files={data.files}
                    />
                  </div>
                ))
              )}

              {/* Fields envoyés mais hors schema (extras) — utile en debug */}
              {(() => {
                const known = new Set(data.schema_fields.map((f) => f.field_key));
                const extras = Object.entries(data.response.answers || {})
                  .filter(([k]) => !known.has(k) && !k.startsWith('_') && k !== 'website');
                if (extras.length === 0) return null;
                return (
                  <div className="px-4 py-3 bg-amber-50/40">
                    <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-2">
                      Champs hors schéma (legacy / orphelins)
                    </p>
                    {extras.map(([k, v]) => (
                      <div key={k} className="text-xs text-content-tertiary mb-1">
                        <span className="font-mono text-amber-700">{k}</span> :{' '}
                        <span className="text-content-primary">
                          {Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-2xl border border-line bg-surface-card overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-line">
              <h2 className="text-sm font-semibold text-content-primary">Metadata</h2>
            </div>
            <dl className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
              <MetadataRow label="Date" value={formatDate(data.response.submitted_at)} />
              <MetadataRow
                label="Source (referer)"
                value={data.response.metadata?.referer || '(direct)'}
                isUrl
              />
              <MetadataRow
                label="Device"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <DeviceIcon device={data.response.metadata?.device_type} />
                    {data.response.metadata?.device_type || 'inconnu'}
                  </span>
                }
              />
              <MetadataRow
                label="Temps de complétion"
                value={formatDuration(data.response.metadata?.completion_time_ms)}
              />
              <MetadataRow
                label="IP (hashée)"
                value={
                  <code className="text-[10px] font-mono text-content-tertiary">
                    {data.response.metadata?.ip_hash?.slice(0, 16) || '—'}…
                  </code>
                }
              />
              <MetadataRow label="Locale" value={data.response.metadata?.locale || 'fr-FR'} />
            </dl>
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-line bg-surface-card p-4">
            <h2 className="text-sm font-semibold text-content-primary mb-3">Actions</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRetry}
                disabled={acting !== null}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-surface-base hover:bg-surface-elevated text-xs font-medium text-content-primary disabled:opacity-50 transition-colors"
              >
                {acting === 'retry' ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                Re-trigger les bridges
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={acting !== null}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-medium text-rose-700 disabled:opacity-50 transition-colors"
              >
                {acting === 'delete' ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Supprimer (RGPD)
              </button>
            </div>
            <p className="mt-2 text-[11px] text-content-faint">
              La suppression est irréversible et conforme RGPD : answers, metadata
              et fichiers Storage seront effacés.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function MetadataRow({ label, value, isUrl }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold text-content-tertiary uppercase tracking-wider mb-0.5">
        {label}
      </dt>
      <dd className="text-xs text-content-primary break-words">
        {isUrl && typeof value === 'string' && value.startsWith('http') ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-700 hover:underline inline-flex items-center gap-1"
          >
            <span className="truncate max-w-[280px]">{value}</span>
            <ExternalLink size={10} />
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function BridgeBanner({ status, error, retryCount, nextRetryAt, crmContactId, campagnesContactId }) {
  const meta = BRIDGE_META[status] || BRIDGE_META.pending;
  const Icon = meta.icon;
  return (
    <div className={`rounded-2xl border p-4 ${meta.cls}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{meta.label}</p>

          {status === 'failed' && error && (
            <p className="mt-1 text-xs opacity-90 break-words">
              <AlertCircle size={11} className="inline -mt-0.5 mr-1" />
              {error.slice(0, 200)}
            </p>
          )}

          {(retryCount > 0 || nextRetryAt) && (
            <p className="mt-1 text-[11px] opacity-80">
              {retryCount > 0 && <>Tentatives : {retryCount} · </>}
              {nextRetryAt && <>Prochaine tentative : {formatDate(nextRetryAt)}</>}
            </p>
          )}

          {(crmContactId || campagnesContactId) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {crmContactId && (
                <Link
                  href={`/admin/crm/contacts/${crmContactId}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/70 hover:bg-white text-[11px] font-medium transition-colors"
                >
                  <Mail size={11} /> Voir le contact CRM
                  <ExternalLink size={10} />
                </Link>
              )}
              {campagnesContactId && (
                <Link
                  href={`/app/campagnes/lists`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/70 hover:bg-white text-[11px] font-medium transition-colors"
                >
                  <Mail size={11} /> Liste Campagnes
                  <ExternalLink size={10} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
