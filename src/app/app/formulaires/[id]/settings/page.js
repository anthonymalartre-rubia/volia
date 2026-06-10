'use client';

// ─────────────────────────────────────────────────────────────────────
// /app/formulaires/[id]/settings — Réglages du form (Sprint F2)
// ─────────────────────────────────────────────────────────────────────
// Page settings minimaliste (le builder UI viendra F3) :
//   - Toggle publish (draft ↔ published)
//   - Email notification
//   - Redirect URL
//   - Message de succès
//   - reCAPTCHA toggle
//   - Bridges : CRM auto-create + Liste Campagnes
//   - Sharing : URL publique, embed code, QR code download
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Loader2,
  Save,
  Copy,
  Check,
  ExternalLink,
  Download,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import QrCustomizer from '@/components/forms/QrCustomizer';

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-pink-600' : 'bg-zinc-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function FormSettingsPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [copied, setCopied] = useState(null);
  const [showEmbed, setShowEmbed] = useState(false);
  const [campagnesUnavailable, setCampagnesUnavailable] = useState(false);

  // Form state
  const [customSlug, setCustomSlug] = useState('');
  const [slugError, setSlugError] = useState(null);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const [crmAutoCreate, setCrmAutoCreate] = useState(false);
  const [campagnesListId, setCampagnesListId] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [formRes, listsRes] = await Promise.all([
          fetch(`/api/app/formulaires/${id}`),
          fetch('/api/app/campagnes/lists'),
        ]);
        const formJson = await formRes.json();
        if (cancelled) return;
        if (!formRes.ok) {
          setError(formJson.error || 'Erreur');
          return;
        }
        const f = formJson.data;
        setForm(f);
        setCustomSlug(f.slug || '');
        setNotifyEmail(f.settings?.notify_email || '');
        setRedirectUrl(f.settings?.redirect_url || '');
        setSuccessMessage(f.settings?.success_message || '');
        setCaptchaEnabled(!!f.settings?.captcha_enabled);
        setCrmAutoCreate(!!f.crm_auto_create_contact);
        setCampagnesListId(f.campagnes_list_id || '');

        if (listsRes.ok) {
          const listsJson = await listsRes.json();
          setLists(listsJson.lists || []);
        } else if (listsRes.status === 403) {
          setCampagnesUnavailable(true);
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
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSlugError(null);
    try {
      const settings = {
        ...(form.settings || {}),
        notify_email: notifyEmail.trim() || null,
        redirect_url: redirectUrl.trim() || null,
        success_message: successMessage.trim() || null,
        captcha_enabled: !!captchaEnabled,
      };
      const payload = {
        settings,
        crm_auto_create_contact: !!crmAutoCreate,
        campagnes_list_id: campagnesListId || null,
      };
      // N'envoie le slug que s'il a changé (l'API le slugifie + vérifie l'unicité
      // côté serveur et peut suffixer un -2 si collision avec un autre form).
      const trimmedSlug = customSlug.trim();
      if (trimmedSlug && trimmedSlug !== form.slug) {
        payload.slug = trimmedSlug;
      }
      const res = await fetch(`/api/app/formulaires/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        // Erreur dédiée au slug (collision, format invalide) → on l'affiche
        // sous le champ plutôt que dans la bannière globale.
        const msg = json.error || 'Erreur enregistrement';
        if (payload.slug && /slug|url/i.test(msg)) {
          setSlugError(msg);
        } else {
          setError(msg);
        }
        return;
      }
      setForm(json.data);
      // Re-sync l'input avec le slug retourné (l'API peut avoir slugifié ou
      // suffixé : "Mon Form !" → "mon-form", ou ajouté "-2" si collision).
      setCustomSlug(json.data.slug || '');
      setSavedAt(new Date());
      setTimeout(() => setSavedAt(null), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish() {
    if (!form) return;
    setPublishing(true);
    setError(null);
    const endpoint = form.status === 'published' ? 'unpublish' : 'publish';
    try {
      const res = await fetch(`/api/app/formulaires/${id}/${endpoint}`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Erreur publication');
        return;
      }
      setForm({ ...form, ...json.data });
    } catch (e) {
      setError(e.message);
    } finally {
      setPublishing(false);
    }
  }

  function copyToClipboard(text, key) {
    try {
      navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError('Copie impossible — copiez manuellement');
    }
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const publicUrl = form ? `${baseUrl}/f/${form.slug}` : '';
  const embedCode = form
    ? `<iframe src="${publicUrl}?embed=true" width="100%" height="600" style="border:0;" loading="lazy"></iframe>`
    : '';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href={`/app/formulaires/${id}`}
        className="inline-flex items-center gap-1.5 text-xs text-content-tertiary hover:text-pink-700 transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Retour au formulaire
      </Link>

      {loading && (
        <div className="flex items-center gap-2 text-content-tertiary text-sm">
          <Loader2 size={16} className="animate-spin" /> Chargement…
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 flex items-start gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {form && (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <SettingsIcon size={14} className="text-pink-600" />
              <p className="text-[11px] uppercase tracking-wider font-semibold text-content-muted">
                Réglages
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              {form.name}
            </h1>
          </div>

          {/* Publish */}
          <div className="rounded-2xl border border-line bg-surface-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                  {form.status === 'published' ? (
                    <>
                      <Eye size={14} className="text-emerald-600" /> Publié
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} className="text-zinc-400" /> Brouillon
                    </>
                  )}
                </h3>
                <p className="mt-1 text-xs text-content-tertiary max-w-md">
                  {form.status === 'published'
                    ? 'Votre formulaire est accessible publiquement à l\'URL ci-dessous.'
                    : 'Publiez pour partager votre formulaire. Le builder vérifie qu\'au moins un champ existe.'}
                </p>
              </div>
              <button
                onClick={handleTogglePublish}
                disabled={publishing}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50 ${
                  form.status === 'published'
                    ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                    : 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                }`}
              >
                {publishing ? <Loader2 size={16} className="animate-spin" /> : null}
                {form.status === 'published' ? 'Dépublier' : 'Publier'}
              </button>
            </div>
          </div>

          {/* Sharing — toujours visible (le client doit pouvoir
              personnaliser son URL AVANT publication aussi). Les boutons
              Copier / Ouvrir sont désactivés tant que le form n'est pas
              publié pour éviter de partager une URL qui renvoie 404. */}
          <div className="rounded-2xl border border-line bg-surface-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2">
              <Sparkles size={14} className="text-pink-600" /> Partager
            </h3>

            {/* Slug personnalisé — l'API slugifie automatiquement (espaces
                → tirets, accents retirés) et suffixe -2 si collision avec
                un autre form du même owner. */}
            <div>
              <label
                htmlFor="form-slug"
                className="block text-xs font-medium text-content-tertiary mb-1.5"
              >
                URL personnalisée
              </label>
              <div className="flex items-stretch rounded-lg border border-line bg-surface-elevated overflow-hidden focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-500/15 transition-all">
                <span className="px-3 flex items-center text-xs text-content-tertiary font-mono border-r border-line bg-surface-base/50 whitespace-nowrap">
                  {baseUrl.replace(/^https?:\/\//, '')}/f/
                </span>
                <input
                  id="form-slug"
                  type="text"
                  value={customSlug}
                  onChange={(e) => {
                    setCustomSlug(e.target.value);
                    setSlugError(null);
                  }}
                  placeholder="mon-formulaire"
                  className="flex-1 min-w-0 px-3 py-2 bg-transparent text-sm text-content-primary font-mono focus:outline-none"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-content-tertiary">
                Choisissez une URL parlante (ex : <code className="text-pink-700">contact-2026</code>,{' '}
                <code className="text-pink-700">newsletter</code>). Les accents et espaces seront convertis automatiquement.
              </p>
              {slugError && (
                <p className="mt-1.5 text-xs text-rose-600">{slugError}</p>
              )}
            </div>

            {/* Public URL preview (read-only) */}
            <div>
              <label className="block text-xs font-medium text-content-tertiary mb-1.5">
                URL publique {form.status !== 'published' && <span className="text-amber-600">· dispo après publication</span>}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 px-3 py-2 rounded-lg bg-surface-elevated border border-line text-sm text-content-primary font-mono"
                />
                <button
                  onClick={() => copyToClipboard(publicUrl, 'url')}
                  disabled={form.status !== 'published'}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {copied === 'url' ? <Check size={14} /> : <Copy size={14} />}
                  {copied === 'url' ? 'Copié' : 'Copier'}
                </button>
                <a
                  href={form.status === 'published' ? publicUrl : undefined}
                  target="_blank"
                  rel="noopener"
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-line text-sm ${
                    form.status === 'published'
                      ? 'bg-surface-elevated hover:bg-surface-base text-content-primary'
                      : 'bg-surface-elevated text-content-tertiary cursor-not-allowed pointer-events-none opacity-40'
                  }`}
                  aria-disabled={form.status !== 'published'}
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

              {/* Embed */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowEmbed(!showEmbed)}
                  className="text-xs text-pink-600 hover:text-pink-700"
                >
                  {showEmbed ? 'Masquer' : 'Voir'} le code embed iframe
                </button>
                {showEmbed && (
                  <div className="mt-2 flex items-start gap-2">
                    <textarea
                      readOnly
                      rows={3}
                      value={embedCode}
                      className="flex-1 px-3 py-2 rounded-lg bg-surface-elevated border border-line text-xs text-content-primary font-mono resize-none"
                    />
                    <button
                      onClick={() => copyToClipboard(embedCode, 'embed')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-sm transition-colors"
                    >
                      {copied === 'embed' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
              </div>

              {/* QR live customizer (Sprint F7) — visible uniquement si publié
                  (un QR vers un form non publié = 404 chez le scanneur). */}
              {form.status === 'published' && (
                <div className="pt-2 border-t border-line">
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode size={14} className="text-pink-600" />
                    <h4 className="text-sm font-semibold text-content-primary">QR Code</h4>
                  </div>
                  <QrCustomizer url={publicUrl} slug={form.slug} />
                </div>
              )}
            </div>

          {/* Notifications & UX */}
          <div className="rounded-2xl border border-line bg-surface-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-content-primary">
              Notifications & comportement
            </h3>

            <div>
              <label className="block text-xs font-medium text-content-tertiary mb-1.5">
                Email de notification
              </label>
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="vous@entreprise.fr"
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-line text-sm text-content-primary placeholder:text-content-faint focus:outline-none focus:border-pink-500"
              />
              <p className="mt-1 text-[11px] text-content-faint">
                Reçoit un email à chaque nouvelle soumission.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-content-tertiary mb-1.5">
                URL de redirection après envoi
              </label>
              <input
                type="url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://votre-site.fr/merci"
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-line text-sm text-content-primary placeholder:text-content-faint focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-content-tertiary mb-1.5">
                Message de succès
              </label>
              <textarea
                rows={2}
                value={successMessage}
                onChange={(e) => setSuccessMessage(e.target.value)}
                placeholder="Merci pour votre soumission !"
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-line text-sm text-content-primary placeholder:text-content-faint focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-content-primary">reCAPTCHA</p>
                <p className="text-[11px] text-content-faint">
                  Protection anti-bot supplémentaire (nécessite la configuration côté serveur).
                </p>
              </div>
              <Toggle checked={captchaEnabled} onChange={setCaptchaEnabled} />
            </div>
          </div>

          {/* Bridges */}
          <div className="rounded-2xl border border-line bg-gradient-to-br from-pink-500/[0.03] to-rose-500/[0.03] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-content-primary">
              Intégrations natives Volia
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-content-primary">
                  Créer un contact CRM automatiquement
                </p>
                <p className="text-[11px] text-content-faint max-w-md">
                  À chaque soumission, un contact CRM est créé (ou retrouvé) avec
                  les champs email, nom, téléphone et société.
                </p>
              </div>
              <Toggle checked={crmAutoCreate} onChange={setCrmAutoCreate} />
            </div>

            <div>
              <label className="block text-sm font-medium text-content-primary mb-1.5">
                Ajouter à la liste Campagnes
              </label>
              {campagnesUnavailable ? (
                <p className="text-[11px] text-content-faint italic">
                  Module Campagnes non accessible sur votre plan. Passez en Pro pour activer ce bridge.
                </p>
              ) : (
                <>
                  <select
                    value={campagnesListId}
                    onChange={(e) => setCampagnesListId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-line text-sm text-content-primary focus:outline-none focus:border-pink-500"
                  >
                    <option value="">— Aucune liste —</option>
                    {lists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.contacts_count} contacts)
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-content-faint">
                    Chaque soumission ajoute le contact à la liste sélectionnée (dédup par email).
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Save */}
          <div className="sticky bottom-4 flex items-center justify-end gap-3">
            {savedAt && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <Check size={12} /> Enregistré
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold shadow-lg shadow-pink-500/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Enregistrer les réglages
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
