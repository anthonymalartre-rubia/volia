'use client';

// ─────────────────────────────────────────────────────────────────────
// SettingsDrawer — Drawer right-side pour réglages rapides du form (P1-5)
// ─────────────────────────────────────────────────────────────────────
// Réutilise le pattern visuel de JumpLogicDrawer. Auto-save debounced 1s
// vers PUT /api/app/formulaires/[id]. Pour la config complète (notifications,
// bridges, sharing, QR…), un lien renvoie vers la page settings.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  X,
  Settings,
  Loader2,
  Check,
  ExternalLink,
  Shield,
  Link2,
} from 'lucide-react';

const AUTO_SAVE_DEBOUNCE = 1000;

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-surface-card border border-line text-sm text-content-primary placeholder:text-content-faint focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-colors';

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? 'bg-pink-600' : 'bg-zinc-300'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function SettingsDrawer({ open, formId, initialForm, onClose, onChange }) {
  const [name, setName] = useState(initialForm?.name || '');
  const [slug, setSlug] = useState(initialForm?.slug || '');
  const [redirectUrl, setRedirectUrl] = useState(initialForm?.settings?.redirect_url || '');
  const [submitLabel, setSubmitLabel] = useState(initialForm?.settings?.submit_label || '');
  const [captchaEnabled, setCaptchaEnabled] = useState(!!initialForm?.settings?.captcha_enabled);
  const [privacyUrl, setPrivacyUrl] = useState(initialForm?.settings?.privacy_url || '');
  const [savingState, setSavingState] = useState('idle'); // idle | saving | saved | error
  const [saveError, setSaveError] = useState(null);

  const saveTimerRef = useRef(null);
  const lastSavedRef = useRef(null);
  const initRef = useRef(false);

  // Sync les valeurs quand on ouvre le drawer (reload depuis prop)
  useEffect(() => {
    if (open && initialForm) {
      setName(initialForm.name || '');
      setSlug(initialForm.slug || '');
      setRedirectUrl(initialForm.settings?.redirect_url || '');
      setSubmitLabel(initialForm.settings?.submit_label || '');
      setCaptchaEnabled(!!initialForm.settings?.captcha_enabled);
      setPrivacyUrl(initialForm.settings?.privacy_url || '');
      lastSavedRef.current = JSON.stringify({
        name: initialForm.name || '',
        slug: initialForm.slug || '',
        redirect_url: initialForm.settings?.redirect_url || '',
        submit_label: initialForm.settings?.submit_label || '',
        captcha_enabled: !!initialForm.settings?.captcha_enabled,
        privacy_url: initialForm.settings?.privacy_url || '',
      });
      initRef.current = true;
      setSavingState('idle');
      setSaveError(null);
    }
  }, [open, initialForm]);

  // Esc pour fermer
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Auto-save debounced
  useEffect(() => {
    if (!open || !initRef.current) return;
    const current = JSON.stringify({
      name,
      slug,
      redirect_url: redirectUrl,
      submit_label: submitLabel,
      captcha_enabled: captchaEnabled,
      privacy_url: privacyUrl,
    });
    if (current === lastSavedRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSavingState('saving');
      setSaveError(null);
      try {
        const payload = {
          name: name || undefined,
          slug: slug || undefined,
          settings: {
            ...(initialForm?.settings || {}),
            redirect_url: redirectUrl.trim() || null,
            submit_label: submitLabel.trim() || null,
            captcha_enabled: !!captchaEnabled,
            privacy_url: privacyUrl.trim() || null,
          },
        };
        const res = await fetch(`/api/app/formulaires/${formId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSavingState('error');
          setSaveError(json.error || `Erreur ${res.status}`);
          return;
        }
        lastSavedRef.current = current;
        setSavingState('saved');
        onChange?.(json.data || null);
        setTimeout(() => setSavingState((s) => (s === 'saved' ? 'idle' : s)), 1500);
      } catch (e) {
        setSavingState('error');
        setSaveError(e.message);
      }
    }, AUTO_SAVE_DEBOUNCE);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, slug, redirectUrl, submitLabel, captchaEnabled, privacyUrl, open, formId]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-drawer-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
        aria-label="Fermer"
      />

      {/* Drawer */}
      <div className="ml-auto relative w-full max-w-md bg-surface-base shadow-2xl border-l border-line flex flex-col h-full">
        <header className="shrink-0 px-5 py-4 border-b border-line flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-content-muted font-semibold flex items-center gap-1">
              <Settings size={11} /> Réglages
            </p>
            <h2
              id="settings-drawer-title"
              className="mt-0.5 text-sm font-semibold text-content-primary"
            >
              Réglages du formulaire
            </h2>
            <p className="mt-1 text-[11px] text-content-tertiary">
              Les modifications sont sauvegardées automatiquement.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-content-faint hover:bg-surface-card hover:text-content-primary transition-colors"
            aria-label="Fermer"
          >
            <X size={14} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Identité */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-wider text-content-muted font-semibold">
              Identité
            </p>
            <div>
              <label className="block text-[11px] font-medium text-content-tertiary mb-1">
                Nom du formulaire
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mon formulaire de contact"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-content-tertiary mb-1">
                Slug (URL publique)
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-content-faint font-mono whitespace-nowrap">
                  /f/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="mon-formulaire"
                  className={`${inputCls} font-mono`}
                />
              </div>
              <p className="mt-1 text-[10px] text-content-faint">
                Les caractères spéciaux seront automatiquement convertis.
              </p>
            </div>
          </div>

          {/* Comportement */}
          <div className="space-y-3 pt-2 border-t border-line">
            <p className="text-[10px] uppercase tracking-wider text-content-muted font-semibold pt-3">
              Comportement
            </p>
            <div>
              <label className="block text-[11px] font-medium text-content-tertiary mb-1">
                Libellé du bouton d&apos;envoi
              </label>
              <input
                type="text"
                value={submitLabel}
                onChange={(e) => setSubmitLabel(e.target.value)}
                placeholder="Envoyer"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-content-tertiary mb-1">
                URL de redirection après envoi
              </label>
              <input
                type="url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://votre-site.fr/merci"
                className={inputCls}
              />
              <p className="mt-1 text-[10px] text-content-faint">
                Laisse vide pour afficher le message de succès par défaut.
              </p>
            </div>
          </div>

          {/* Sécurité & RGPD */}
          <div className="space-y-3 pt-2 border-t border-line">
            <p className="text-[10px] uppercase tracking-wider text-content-muted font-semibold pt-3 flex items-center gap-1">
              <Shield size={11} /> Sécurité & RGPD
            </p>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-content-primary">reCAPTCHA</p>
                <p className="text-[10px] text-content-faint">
                  Protection anti-bot pour les formulaires publics.
                </p>
              </div>
              <Toggle checked={captchaEnabled} onChange={setCaptchaEnabled} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-content-tertiary mb-1 flex items-center gap-1">
                <Link2 size={11} /> URL politique de confidentialité
              </label>
              <input
                type="url"
                value={privacyUrl}
                onChange={(e) => setPrivacyUrl(e.target.value)}
                placeholder="https://votre-site.fr/confidentialite"
                className={inputCls}
              />
            </div>
          </div>

          {/* Lien vers settings complets */}
          <div className="pt-2 border-t border-line">
            <Link
              href={`/app/formulaires/${formId}/settings`}
              className="inline-flex items-center gap-1.5 text-xs text-pink-700 hover:text-pink-800"
            >
              <ExternalLink size={11} /> Tous les réglages (notifications, bridges, QR…)
            </Link>
          </div>
        </div>

        <footer className="shrink-0 px-5 py-3 border-t border-line flex items-center justify-between gap-2">
          <div className="text-[11px] text-content-faint min-w-0 flex items-center gap-1.5">
            {savingState === 'saving' && (
              <>
                <Loader2 size={11} className="animate-spin" /> Sauvegarde…
              </>
            )}
            {savingState === 'saved' && (
              <>
                <Check size={11} className="text-emerald-600" /> Sauvegardé
              </>
            )}
            {savingState === 'error' && (
              <span className="text-rose-600 truncate">Erreur : {saveError}</span>
            )}
            {savingState === 'idle' && <span>Modifications auto-sauvegardées</span>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-colors"
          >
            Terminé
          </button>
        </footer>
      </div>
    </div>
  );
}
