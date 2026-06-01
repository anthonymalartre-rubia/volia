'use client';

// ─────────────────────────────────────────────────────────────────────
// /admin/publishers — Config des publishers sociaux (Sprint 1 Phase B.2)
// ─────────────────────────────────────────────────────────────────────
//
// Permet de coller les credentials LinkedIn (access_token + person_urn)
// + un webhook URL si on veut plug Make/Zapier en parallèle.
//
// UX :
//   - 1 card par platform (LinkedIn, Webhook). Twitter = placeholder
//     ($100/mo API v2 reporté).
//   - Bouton "Tester la connexion" → appelle /v2/me + récupère le
//     person_urn auto pour LinkedIn.
//   - Bouton "Enregistrer" → upsert dans publisher_credentials.
//   - Affiche : status enabled, dernière publication (URL cliquable),
//     dernière erreur, dernier test OK timestamp.
//
// Sécurité : page admin uniquement. /admin/layout.js gère la TopBar
// (ne PAS en importer une seconde — cf. bug du 1er juin 2026).
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Linkedin, Webhook, Twitter, AlertCircle, CheckCircle2, Loader2,
  TestTube, Save, ExternalLink, Power, PowerOff, RefreshCw, Eye, EyeOff,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

const PLATFORM_META = {
  linkedin: {
    label: 'LinkedIn',
    icon: Linkedin,
    color: 'text-[#0077b5]',
    bg: 'bg-[#0077b5]/10',
    border: 'border-[#0077b5]/30',
    fields: [
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'AQVxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'person_urn', label: 'Person URN', type: 'text', placeholder: 'urn:li:person:abc123', required: true, helper: 'Détecté auto via "Tester la connexion"' },
      { key: 'expires_at', label: 'Expire le (optionnel)', type: 'date', required: false, helper: 'LinkedIn tokens valides ~60 jours' },
    ],
    docs: 'https://www.linkedin.com/developers/apps → app "Volia Auto-Publisher" → Auth → Generate Access Token (scopes : w_member_social + r_liteprofile)',
  },
  webhook: {
    label: 'Webhook (n8n / Make / Zapier)',
    icon: Webhook,
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    fields: [
      { key: 'url', label: 'URL du webhook', type: 'url', placeholder: 'https://hook.eu1.make.com/abc123', required: true },
      { key: 'secret', label: 'Secret HMAC (optionnel)', type: 'password', placeholder: 'shared_secret_long_string', required: false, helper: 'Si défini, signe le body en HMAC-SHA256 dans le header X-Volia-Signature' },
      { key: 'platform_hint', label: 'Hint platform (optionnel)', type: 'text', placeholder: 'linkedin', required: false, helper: 'Inclus dans le payload pour aider le receiver' },
    ],
    docs: 'Volia POST le payload { platform, text, source, action_id, metadata } sur cette URL. Réponse 2xx attendue.',
  },
  twitter: {
    label: 'X / Twitter',
    icon: Twitter,
    color: 'text-[#1da1f2]',
    bg: 'bg-[#1da1f2]/10',
    border: 'border-[#1da1f2]/30',
    fields: [],
    disabled: true,
    docs: 'API v2 Twitter = 100$/mo (Basic tier). Reporté. En attendant, le founder copie-colle manuellement le tweet depuis /admin/auto-queue.',
  },
};

const ALL_PLATFORMS = ['linkedin', 'webhook', 'twitter'];

export default function PublishersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ─── Auth ───────────────────────────────────────────────────────
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

  // ─── Fetch publishers ────────────────────────────────────────────
  async function fetchPublishers() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/publishers');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur de chargement');
        return;
      }
      setPublishers(data.publishers || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authChecked && user) fetchPublishers();
  }, [authChecked, user]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base text-content-primary flex flex-col">
      {/* Pas de TopBar : déjà rendue par /admin/layout.js */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <nav className="text-xs text-content-tertiary mb-3 flex items-center gap-2">
            <a href="/admin" className="hover:text-violet-700 transition">Admin</a>
            <span>·</span>
            <a href="/admin/auto-queue" className="hover:text-violet-700 transition">Auto-queue</a>
            <span>·</span>
            <span className="text-content-primary font-medium">Publishers</span>
          </nav>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-content-primary">Publishers sociaux</h1>
              <p className="text-sm text-content-tertiary mt-1 max-w-2xl">
                Credentials utilisés par le cron <code className="font-mono text-[11px] bg-surface-elevated px-1 py-0.5 rounded">publish-approved-actions</code>{' '}
                pour publier automatiquement les brouillons approuvés depuis{' '}
                <a href="/admin/auto-queue" className="text-violet-700 hover:underline">/admin/auto-queue</a>.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchPublishers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-card border border-line text-sm hover:bg-surface-elevated transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Cards */}
        <div className="space-y-4">
          {ALL_PLATFORMS.map((platform) => {
            const meta = PLATFORM_META[platform];
            const existing = publishers.find((p) => p.platform === platform);
            return (
              <PublisherCard
                key={platform}
                platform={platform}
                meta={meta}
                existing={existing}
                onSaved={fetchPublishers}
              />
            );
          })}
        </div>

        <div className="mt-12 text-xs text-content-tertiary text-center">
          Page admin · Cron <code className="font-mono">/api/cron/publish-approved-actions</code> tourne toutes les 15 min ·{' '}
          <a href="/admin/auto-queue" className="text-violet-700 hover:underline">Approval queue</a>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PublisherCard — 1 card par platform avec form inline
// ─────────────────────────────────────────────────────────────────────
function PublisherCard({ platform, meta, existing, onSaved }) {
  const Icon = meta.icon;
  const isConfigured = !!existing;
  const isEnabled = existing?.enabled;

  // State du formulaire — démarre vide (jamais pré-rempli avec les
  // credentials existants pour éviter de les fuiter accidentellement dans
  // le DOM. Founder doit re-coller s'il veut modifier).
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [label, setLabel] = useState(existing?.label || '');
  const [enabledFlag, setEnabledFlag] = useState(existing?.enabled ?? true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showSensitive, setShowSensitive] = useState({});
  const [error, setError] = useState('');

  const handleField = (k, v) => setFormData((prev) => ({ ...prev, [k]: v }));

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    setError('');
    try {
      const res = await fetch('/api/admin/publishers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, credentials: formData }),
      });
      const data = await res.json();
      setTestResult(data);
      // Pour LinkedIn : si test OK, auto-fill person_urn
      if (data.ok && platform === 'linkedin' && data.person_urn) {
        setFormData((prev) => ({ ...prev, person_urn: data.person_urn }));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/publishers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          enabled: enabledFlag,
          credentials: formData,
          label: label || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur');
        return;
      }
      setEditing(false);
      setFormData({});
      onSaved?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleEnabled() {
    if (!isConfigured) return;
    const newState = !isEnabled;
    setSaving(true);
    try {
      // Toggle on : on a besoin de re-poster les credentials, donc on demande
      // au founder de re-coller. Toggle off : DELETE (qui fait enabled=false).
      if (newState) {
        setEditing(true);
        return;
      }
      const res = await fetch('/api/admin/publishers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur');
        return;
      }
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  if (meta.disabled) {
    return (
      <div className={`rounded-xl border ${meta.border} ${meta.bg} p-5 opacity-60`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.bg} border ${meta.border}`}>
            <Icon size={20} className={meta.color} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-content-primary mb-1">
              {meta.label}{' '}
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 font-bold ml-2">
                À venir
              </span>
            </h2>
            <p className="text-xs text-content-tertiary">{meta.docs}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${isEnabled ? meta.border : 'border-line'} bg-surface-card overflow-hidden`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.bg} border ${meta.border} flex-shrink-0`}>
              <Icon size={20} className={meta.color} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-content-primary flex items-center gap-2 flex-wrap">
                {meta.label}
                {isConfigured ? (
                  isEnabled ? (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold border border-emerald-300">
                      <Power size={9} /> Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-bold border border-zinc-300">
                      <PowerOff size={9} /> Désactivé
                    </span>
                  )
                ) : (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold border border-amber-300">
                    Non configuré
                  </span>
                )}
              </h2>
              {existing?.label && (
                <p className="text-xs text-content-tertiary mt-0.5">{existing.label}</p>
              )}
            </div>
          </div>

          {isConfigured && !editing && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleEnabled}
                disabled={saving}
                className="text-xs px-2.5 py-1 rounded border border-line bg-white hover:bg-surface-elevated transition disabled:opacity-50"
              >
                {isEnabled ? 'Désactiver' : 'Réactiver'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs px-2.5 py-1 rounded bg-violet-600 text-white hover:bg-violet-500 transition font-semibold"
              >
                Modifier
              </button>
            </div>
          )}

          {!isConfigured && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs px-3 py-1.5 rounded bg-violet-600 text-white hover:bg-violet-500 transition font-semibold"
            >
              Configurer
            </button>
          )}
        </div>

        {/* Existing status (read-only quand pas en édition) */}
        {isConfigured && !editing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {existing.last_published_url && (
              <div className="p-2.5 rounded border border-line bg-surface-elevated">
                <p className="text-content-muted uppercase tracking-wider font-semibold mb-1">Dernière publication</p>
                <a
                  href={existing.last_published_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-700 hover:underline inline-flex items-center gap-1 break-all"
                >
                  Voir le post <ExternalLink size={10} />
                </a>
                {existing.last_used_at && (
                  <p className="text-content-tertiary text-[10px] mt-0.5">
                    {new Date(existing.last_used_at).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>
            )}

            {existing.test_passed_at && (
              <div className="p-2.5 rounded border border-emerald-200 bg-emerald-50">
                <p className="text-emerald-800 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Test OK
                </p>
                <p className="text-emerald-700 text-[10px]">
                  {new Date(existing.test_passed_at).toLocaleString('fr-FR')}
                </p>
              </div>
            )}

            {existing.last_error && (
              <div className="p-2.5 rounded border border-rose-200 bg-rose-50 sm:col-span-2">
                <p className="text-rose-800 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                  <AlertCircle size={11} /> Dernière erreur
                </p>
                <p className="text-rose-700 text-[11px] break-words font-mono">{existing.last_error}</p>
              </div>
            )}

            {existing.credentials && Object.keys(existing.credentials).length > 0 && (
              <details className="sm:col-span-2 mt-1">
                <summary className="cursor-pointer text-content-tertiary hover:text-content-primary text-[11px]">
                  Voir les credentials enregistrés (masqués)
                </summary>
                <pre className="mt-2 p-2 rounded bg-surface-elevated border border-line text-[10px] overflow-x-auto">
                  {JSON.stringify(existing.credentials, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Form d'édition */}
        {editing && (
          <div className="space-y-3 mt-2 pt-3 border-t border-line">
            {meta.docs && (
              <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 text-[11px] text-violet-900">
                <p className="font-semibold mb-0.5">Comment obtenir ces credentials :</p>
                <p>{meta.docs}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1">
                Label (optionnel)
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="ex: Anthony perso · Volia company page"
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {meta.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  {field.label}
                  {field.required && <span className="text-rose-600 ml-0.5">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={
                      field.type === 'password' && !showSensitive[field.key]
                        ? 'password'
                        : field.type === 'password'
                        ? 'text'
                        : field.type
                    }
                    value={formData[field.key] || ''}
                    onChange={(e) => handleField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-line bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  {field.type === 'password' && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowSensitive((prev) => ({ ...prev, [field.key]: !prev[field.key] }))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-content-tertiary hover:text-content-primary"
                      aria-label={showSensitive[field.key] ? 'Masquer' : 'Afficher'}
                    >
                      {showSensitive[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
                {field.helper && (
                  <p className="text-[10px] text-content-tertiary mt-1">{field.helper}</p>
                )}
              </div>
            ))}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`enabled-${platform}`}
                checked={enabledFlag}
                onChange={(e) => setEnabledFlag(e.target.checked)}
                className="w-4 h-4 rounded border-line text-violet-600 focus:ring-violet-500"
              />
              <label htmlFor={`enabled-${platform}`} className="text-xs text-content-secondary cursor-pointer">
                Publisher actif (le cron utilisera ces credentials)
              </label>
            </div>

            {/* Test result */}
            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs ${
                  testResult.ok
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-rose-200 bg-rose-50 text-rose-900'
                }`}
              >
                {testResult.ok ? (
                  <div>
                    <p className="font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Connexion OK
                    </p>
                    {testResult.person_urn && (
                      <p className="text-[11px] mt-1">
                        Person URN détecté : <code className="font-mono">{testResult.person_urn}</code>
                        {' '}(auto-rempli dans le formulaire)
                      </p>
                    )}
                    {testResult.raw?.localizedFirstName && (
                      <p className="text-[11px] mt-1">
                        Compte : {testResult.raw.localizedFirstName} {testResult.raw.localizedLastName}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold flex items-center gap-1">
                      <AlertCircle size={12} /> Test échoué
                    </p>
                    <p className="text-[11px] mt-1 font-mono break-words">{testResult.error}</p>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-xs text-rose-700">{error}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({});
                  setTestResult(null);
                  setError('');
                }}
                className="text-xs px-3 py-1.5 rounded border border-line bg-white hover:bg-surface-elevated transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition font-semibold disabled:opacity-50"
              >
                {testing ? <Loader2 size={11} className="animate-spin" /> : <TestTube size={11} />}
                Tester la connexion
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-violet-600 text-white hover:bg-violet-500 transition font-semibold disabled:opacity-50"
              >
                {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
