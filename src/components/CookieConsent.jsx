'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X, Cookie, ShieldCheck } from 'lucide-react';
import {
  CATEGORIES,
  ALL_OFF,
  CONSENT_OPEN_EVENT,
  useCookieConsent,
} from '@/lib/cookieConsent';

/**
 * Bandeau + modal de consentement aux cookies — conformité CNIL stricte.
 * - Bilingue : FR par défaut, EN sur les routes /en (visiteurs anglophones).
 * - Bouton "Refuser tout" même taille / même visibilité que "Accepter tout"
 * - Modal accessible (focus trap, ESC, ARIA)
 * - Re-consentement automatique après 6 mois (géré par le hook)
 */

// ─── i18n local (composant global monté hors des pages localisées) ───
const STR = {
  fr: {
    regionAria: 'Consentement aux cookies',
    bannerTitle: 'Cookies : on vous demande.',
    bannerBodyA: "On utilise des cookies pour faire tourner le site et améliorer l'expérience. Acceptez tout, refusez tout, ou personnalisez. Vous changez d'avis quand vous voulez via le footer ou la page ",
    manageLink: 'Gérer mes cookies',
    rejectAll: 'Refuser tout',
    customize: 'Personnaliser',
    acceptAll: 'Accepter tout',
    modalTitle: 'Gérer mes préférences cookies',
    modalSubtitle: 'Conforme aux recommandations CNIL · Modifiable à tout moment',
    close: 'Fermer',
    modalIntro: "Volia ne vend aucune donnée à des tiers. Vous pouvez activer ou désactiver chaque catégorie de cookies ci-dessous. Les cookies strictement nécessaires sont indispensables au fonctionnement du site et ne peuvent pas être désactivés.",
    listIntroA: 'Pour la liste exhaustive de tous les cookies déposés (nom, finalité, émetteur, durée), consultez notre page ',
    listLink: 'Gestion des cookies',
    modalReject: 'Tout refuser',
    modalSave: 'Sauvegarder mes choix',
    modalAccept: 'Tout accepter',
    alwaysOn: 'Toujours actif',
    show: 'Voir',
    hide: 'Masquer',
    listOf: 'la liste des cookies',
    thName: 'Nom',
    thIssuer: 'Émetteur',
    thPurpose: 'Finalité',
    thDuration: 'Durée',
  },
  en: {
    regionAria: 'Cookie consent',
    bannerTitle: 'Cookies: your call.',
    bannerBodyA: 'We use cookies to run the site and improve your experience. Accept all, reject all, or customize. Change your mind anytime via the footer or the ',
    manageLink: 'Manage cookies',
    rejectAll: 'Reject all',
    customize: 'Customize',
    acceptAll: 'Accept all',
    modalTitle: 'Manage cookie preferences',
    modalSubtitle: 'Compliant with CNIL guidelines · Editable anytime',
    close: 'Close',
    modalIntro: "Volia never sells your data to third parties. You can enable or disable each cookie category below. Strictly necessary cookies are essential for the site to work and cannot be disabled.",
    listIntroA: 'For the full list of cookies set (name, purpose, issuer, duration), see our ',
    listLink: 'Cookie management',
    modalReject: 'Reject all',
    modalSave: 'Save my choices',
    modalAccept: 'Accept all',
    alwaysOn: 'Always on',
    show: 'Show',
    hide: 'Hide',
    listOf: 'cookie list',
    thName: 'Name',
    thIssuer: 'Issuer',
    thPurpose: 'Purpose',
    thDuration: 'Duration',
  },
};

// Traductions EN des catégories (les libellés source en lib/cookieConsent.js sont en FR)
const CAT_EN = {
  strict: {
    label: 'Strictly necessary cookies',
    description: 'Essential for the site to work (security, session, preferences). Always on — they cannot be disabled.',
  },
  functional: {
    label: 'Functional cookies',
    description: 'Remember your choices (theme, language) to improve your experience.',
  },
  analytics: {
    label: 'Analytics cookies',
    description: 'Help us understand how the site is used so we can improve it. Aggregated and anonymized.',
  },
  marketing: {
    label: 'Marketing cookies',
    description: 'Used to measure and improve our campaigns. Volia never sells your data.',
  },
};

// Traductions EN du détail par cookie (finalité + durée). issuer = noms propres, inchangés.
const COOKIE_EN = {
  'sb-*-auth-token': { purpose: 'Authentication session', duration: 'Session / 1 year' },
  volia_session: { purpose: 'Keeps the user session', duration: 'Session' },
  'cookie-consent': { purpose: 'Stores your consent', duration: '6 months' },
  volia_cookie_consent_v2: { purpose: 'Consent details', duration: '6 months' },
  volia_theme: { purpose: 'Light / dark theme', duration: '1 year' },
  volia_locale: { purpose: 'Interface language', duration: '1 year' },
  'columns_*': { purpose: 'Columns shown in the table', duration: '1 year' },
  '__vercel_analytics_*': { purpose: 'Anonymous audience measurement', duration: 'Session' },
  '_vercel_speed_*': { purpose: 'Performance measurement', duration: 'Session' },
  _stripe_mid: { purpose: 'Payment fraud detection', duration: '1 year' },
  _stripe_sid: { purpose: 'Payment session', duration: '30 minutes' },
  'cal_*': { purpose: 'Demo booking widget', duration: 'Session' },
  li_fat_id: { purpose: 'LinkedIn ad conversion measurement', duration: '30 days' },
  bcookie: { purpose: 'LinkedIn browser ID & retargeting', duration: '1 year' },
};

export default function CookieConsent() {
  const { hydrated, needsConsent, consent, acceptAll, rejectAll, accept } = useCookieConsent();
  const pathname = usePathname();
  const lang = pathname && pathname.startsWith('/en') ? 'en' : 'fr';
  const t = STR[lang];

  const [bannerVisible, setBannerVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selection, setSelection] = useState(ALL_OFF);

  // Affichage différé du bandeau pour ne pas gêner le LCP / pas de flash SSR
  useEffect(() => {
    if (!hydrated) return;
    if (needsConsent) {
      const timer = setTimeout(() => setBannerVisible(true), 600);
      return () => clearTimeout(timer);
    }
    setBannerVisible(false);
  }, [hydrated, needsConsent]);

  useEffect(() => {
    if (modalOpen) {
      const initial = consent?.categories ? { ...consent.categories } : { ...ALL_OFF };
      setSelection({ ...initial, strict: true });
    }
  }, [modalOpen, consent]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setModalOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, handler);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, handler);
  }, []);

  const handleAcceptAll = useCallback(() => {
    acceptAll();
    setBannerVisible(false);
    setModalOpen(false);
  }, [acceptAll]);

  const handleRejectAll = useCallback(() => {
    rejectAll();
    setBannerVisible(false);
    setModalOpen(false);
  }, [rejectAll]);

  const handleSaveSelection = useCallback(() => {
    accept(selection);
    setBannerVisible(false);
    setModalOpen(false);
  }, [accept, selection]);

  const toggleCategory = (id) => {
    if (CATEGORIES[id]?.required) return;
    setSelection((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!hydrated) return null;

  return (
    <>
      {bannerVisible && !modalOpen && (
        <CookieBanner
          t={t}
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          onCustomize={() => setModalOpen(true)}
        />
      )}
      {modalOpen && (
        <CookieModal
          t={t}
          lang={lang}
          selection={selection}
          onToggle={toggleCategory}
          onClose={() => setModalOpen(false)}
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          onSave={handleSaveSelection}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Bandeau initial                                                      */
/* ------------------------------------------------------------------ */

function CookieBanner({ t, onAcceptAll, onRejectAll, onCustomize }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] pointer-events-none"
      role="region"
      aria-label={t.regionAria}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-3 sm:pb-6 pointer-events-auto animate-[slideUp_0.4s_ease-out]">
        <div className="p-4 sm:p-5 rounded-2xl border border-line bg-surface-card shadow-2xl shadow-black/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
              <Cookie size={18} className="text-violet-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-content-primary mb-1">
                {t.bannerTitle}
              </p>
              <p className="text-xs sm:text-[13px] text-content-secondary leading-relaxed">
                {t.bannerBodyA}
                <Link href="/cookies" className="text-violet-400 hover:text-violet-300 underline-offset-2 hover:underline">
                  {t.manageLink}
                </Link>
                .
              </p>
            </div>
          </div>

          {/* 3 boutons même poids visuel — conformité CNIL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onRejectAll}
              className="px-4 py-2.5 text-sm font-semibold text-content-primary bg-surface-elevated border border-line rounded-lg hover:bg-surface-hover transition focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              {t.rejectAll}
            </button>
            <button
              type="button"
              onClick={onCustomize}
              className="px-4 py-2.5 text-sm font-semibold text-content-primary bg-surface-elevated border border-line rounded-lg hover:bg-surface-hover transition focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              {t.customize}
            </button>
            <button
              type="button"
              onClick={onAcceptAll}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              {t.acceptAll}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal de personnalisation                                            */
/* ------------------------------------------------------------------ */

function CookieModal({ t, lang, selection, onToggle, onClose, onAcceptAll, onRejectAll, onSave }) {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    previousFocus.current = document.activeElement;
    closeBtnRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'a, button, input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      try {
        previousFocus.current?.focus?.();
      } catch (e) {
        /* noop */
      }
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-stretch sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        className="relative w-full sm:max-w-2xl sm:my-6 sm:mx-4 bg-surface-card border border-line sm:rounded-2xl shadow-2xl flex flex-col max-h-screen sm:max-h-[90vh] animate-[modalIn_0.25s_ease-out]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-line">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} className="text-violet-400" aria-hidden="true" />
            </div>
            <div>
              <h2 id="cookie-modal-title" className="text-lg font-semibold text-content-primary">
                {t.modalTitle}
              </h2>
              <p className="text-xs text-content-secondary mt-1">
                {t.modalSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            ref={closeBtnRef}
            onClick={onClose}
            aria-label={t.close}
            className="p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-elevated transition focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <p className="text-sm text-content-secondary">
            {t.modalIntro}
          </p>

          {Object.values(CATEGORIES).map((cat) => (
            <CategoryCard
              key={cat.id}
              t={t}
              lang={lang}
              category={cat}
              enabled={!!selection[cat.id]}
              onToggle={() => onToggle(cat.id)}
            />
          ))}

          <p className="text-xs text-content-tertiary pt-2">
            {t.listIntroA}
            <Link href="/cookies" className="text-violet-400 hover:text-violet-300 underline-offset-2 hover:underline">
              {t.listLink}
            </Link>
            .
          </p>
        </div>

        {/* Footer actions — 3 boutons même poids */}
        <div className="p-5 sm:p-6 border-t border-line">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onRejectAll}
              className="px-4 py-2.5 text-sm font-semibold text-content-primary bg-surface-elevated border border-line rounded-lg hover:bg-surface-hover transition focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              {t.modalReject}
            </button>
            <button
              type="button"
              onClick={onSave}
              className="px-4 py-2.5 text-sm font-semibold text-content-primary bg-surface-elevated border border-line rounded-lg hover:bg-surface-hover transition focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              {t.modalSave}
            </button>
            <button
              type="button"
              onClick={onAcceptAll}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              {t.modalAccept}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sous-composant catégorie                                             */
/* ------------------------------------------------------------------ */

function CategoryCard({ t, lang, category, enabled, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const switchId = `cookie-toggle-${category.id}`;
  const label = lang === 'en' ? (CAT_EN[category.id]?.label || category.label) : category.label;
  const description = lang === 'en' ? (CAT_EN[category.id]?.description || category.description) : category.description;

  return (
    <div className="rounded-xl border border-line bg-surface-elevated p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-content-primary">{label}</h3>
            {category.required && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20">
                {t.alwaysOn}
              </span>
            )}
          </div>
          <p className="text-xs text-content-secondary mt-1.5 leading-relaxed">{description}</p>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition focus:outline-none focus:ring-2 focus:ring-violet-500/40 rounded"
            aria-expanded={expanded}
            aria-controls={`cookies-list-${category.id}`}
          >
            {expanded ? t.hide : t.show} {t.listOf} ({category.cookies.length})
          </button>
        </div>

        <Toggle
          id={switchId}
          checked={enabled}
          disabled={category.required}
          onChange={onToggle}
          label={label}
        />
      </div>

      {expanded && (
        <div id={`cookies-list-${category.id}`} className="mt-3 pt-3 border-t border-line">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-content-tertiary text-left">
                  <th className="py-1.5 pr-3 font-medium">{t.thName}</th>
                  <th className="py-1.5 pr-3 font-medium">{t.thIssuer}</th>
                  <th className="py-1.5 pr-3 font-medium">{t.thPurpose}</th>
                  <th className="py-1.5 font-medium">{t.thDuration}</th>
                </tr>
              </thead>
              <tbody>
                {category.cookies.map((c) => {
                  const en = lang === 'en' ? COOKIE_EN[c.name] : null;
                  return (
                  <tr key={c.name} className="border-t border-line/50">
                    <td className="py-1.5 pr-3 font-mono text-content-primary">{c.name}</td>
                    <td className="py-1.5 pr-3 text-content-secondary">{c.issuer}</td>
                    <td className="py-1.5 pr-3 text-content-secondary">{en?.purpose || c.purpose}</td>
                    <td className="py-1.5 text-content-secondary">{en?.duration || c.duration}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({ id, checked, disabled, onChange, label }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-violet-500/40 ${
        checked
          ? 'bg-gradient-to-r from-violet-600 to-indigo-600'
          : 'bg-surface-base border border-line'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
