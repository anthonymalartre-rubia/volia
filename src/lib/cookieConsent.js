'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Conformité CNIL stricte (post-jurisprudence 2024) :
 * - Bouton "Refuser tout" aussi accessible que "Accepter tout"
 * - 4 catégories distinctes avec toggles individuels
 * - Re-consentement obligatoire au bout de 6 mois
 * - Lien permanent pour modifier le consentement (page /cookies + footer)
 * - Transparence totale sur les cookies déposés
 */

export const CONSENT_STORAGE_KEY = 'volia_cookie_consent_v2';
export const CONSENT_COOKIE_NAME = 'cookie-consent';
export const CONSENT_VERSION = 2;
// 6 mois en millisecondes (CNIL : 13 mois max, on choisit 6 mois pour être strict)
export const CONSENT_DURATION_MS = 6 * 30 * 24 * 60 * 60 * 1000;

// Événement custom pour notifier les autres composants d'un changement
export const CONSENT_CHANGE_EVENT = 'volia:cookie-consent-change';
// Événement pour demander l'ouverture de la modal (depuis le footer, /cookies, etc.)
export const CONSENT_OPEN_EVENT = 'volia:cookie-consent-open';

export const CATEGORIES = {
  strict: {
    id: 'strict',
    label: 'Cookies strictement nécessaires',
    description:
      "Indispensables au fonctionnement du site (authentification, session, sécurité CSRF). Sans eux, le service ne peut pas fonctionner. Conformément à la directive ePrivacy, ces cookies ne nécessitent pas de consentement.",
    required: true,
    cookies: [
      { name: 'sb-*-auth-token', issuer: 'Volia (Supabase)', purpose: 'Session d\'authentification', duration: 'Session / 1 an' },
      { name: 'volia_session', issuer: 'Volia', purpose: 'Maintien de la session utilisateur', duration: 'Session' },
      { name: 'cookie-consent', issuer: 'Volia', purpose: 'Mémorisation de votre consentement', duration: '6 mois' },
      { name: 'volia_cookie_consent_v2', issuer: 'Volia (localStorage)', purpose: 'Détail du consentement', duration: '6 mois' },
    ],
  },
  functional: {
    id: 'functional',
    label: 'Cookies fonctionnels',
    description:
      "Mémorisent vos préférences (langue, thème clair/sombre, colonnes affichées) pour personnaliser votre expérience. Ne servent à aucun pistage.",
    required: false,
    defaultValue: false,
    cookies: [
      { name: 'volia_theme', issuer: 'Volia', purpose: 'Thème clair / sombre', duration: '1 an' },
      { name: 'volia_locale', issuer: 'Volia', purpose: 'Langue de l\'interface', duration: '1 an' },
      { name: 'columns_*', issuer: 'Volia (localStorage)', purpose: 'Colonnes affichées dans le tableau', duration: '1 an' },
    ],
  },
  analytics: {
    id: 'analytics',
    label: 'Cookies analytiques',
    description:
      "Mesurent l'audience de manière anonyme (pages vues, performances) via Vercel Analytics. Aucun cookie tiers, aucune donnée vendue, IP anonymisée.",
    required: false,
    defaultValue: false,
    cookies: [
      { name: '__vercel_analytics_*', issuer: 'Vercel', purpose: 'Mesure d\'audience anonyme', duration: 'Session' },
      { name: '_vercel_speed_*', issuer: 'Vercel Speed Insights', purpose: 'Mesure de performance', duration: 'Session' },
    ],
  },
  marketing: {
    id: 'marketing',
    label: 'Cookies marketing',
    description:
      "Tracking des conversions (essai gratuit → paiement), widget de réservation de démo (Cal.com), retargeting. Tiers concernés : Stripe, Cal.com.",
    required: false,
    defaultValue: false,
    cookies: [
      { name: '_stripe_mid', issuer: 'Stripe', purpose: 'Détection de fraude paiement', duration: '1 an' },
      { name: '_stripe_sid', issuer: 'Stripe', purpose: 'Session paiement', duration: '30 minutes' },
      { name: 'cal_*', issuer: 'Cal.com', purpose: 'Widget de réservation de démo', duration: 'Session' },
    ],
  },
};

export const ALL_OFF = { strict: true, functional: false, analytics: false, marketing: false };
export const ALL_ON = { strict: true, functional: true, analytics: true, marketing: true };

/* ------------------------------------------------------------------ */
/* Storage helpers (SSR-safe)                                          */
/* ------------------------------------------------------------------ */

function isBrowser() {
  return typeof window !== 'undefined';
}

function readConsentRaw() {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== CONSENT_VERSION) return null;
    if (parsed.expires_at && new Date(parsed.expires_at).getTime() < Date.now()) {
      return null; // Expiré → reconsentement
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

function writeConsent(categories) {
  if (!isBrowser()) return null;
  const now = new Date();
  const expires = new Date(now.getTime() + CONSENT_DURATION_MS);
  const payload = {
    version: CONSENT_VERSION,
    consented_at: now.toISOString(),
    expires_at: expires.toISOString(),
    categories: { ...ALL_OFF, ...categories, strict: true },
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
    // Cookie miroir pour le backend (max-age en secondes)
    const maxAge = Math.floor(CONSENT_DURATION_MS / 1000);
    const cookieValue = encodeURIComponent(JSON.stringify(payload.categories));
    document.cookie = `${CONSENT_COOKIE_NAME}=${cookieValue}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch (e) {
    /* noop */
  }
  // Notifier les autres composants
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: payload }));
  } catch (e) {
    /* noop */
  }
  return payload;
}

function clearConsent() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    document.cookie = `${CONSENT_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch (e) {
    /* noop */
  }
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: null }));
  } catch (e) {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/* Hook public                                                          */
/* ------------------------------------------------------------------ */

export function useCookieConsent() {
  const [consent, setConsent] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConsent(readConsentRaw());
    setHydrated(true);
    const handler = (e) => setConsent(e?.detail ?? readConsentRaw());
    window.addEventListener(CONSENT_CHANGE_EVENT, handler);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handler);
  }, []);

  const hasConsent = useCallback(
    (category) => {
      if (!consent || !consent.categories) return false;
      if (category === 'strict') return true;
      return !!consent.categories[category];
    },
    [consent]
  );

  const accept = useCallback((categories) => {
    const payload = writeConsent(categories);
    setConsent(payload);
    return payload;
  }, []);

  const acceptAll = useCallback(() => accept(ALL_ON), [accept]);
  const rejectAll = useCallback(() => accept(ALL_OFF), [accept]);

  const revoke = useCallback(() => {
    clearConsent();
    setConsent(null);
  }, []);

  const openModal = useCallback(() => {
    if (!isBrowser()) return;
    try {
      window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
    } catch (e) {
      /* noop */
    }
  }, []);

  return {
    hydrated,
    consent,
    needsConsent: hydrated && !consent,
    hasConsent,
    accept,
    acceptAll,
    rejectAll,
    revoke,
    openModal,
    consentDate: consent ? new Date(consent.consented_at) : null,
    expiresDate: consent ? new Date(consent.expires_at) : null,
  };
}

/* ------------------------------------------------------------------ */
/* Helpers exposés                                                      */
/* ------------------------------------------------------------------ */

export function getStoredConsent() {
  return readConsentRaw();
}

export function downloadConsentHistory() {
  if (!isBrowser()) return;
  const current = readConsentRaw();
  const payload = {
    exported_at: new Date().toISOString(),
    site: 'volia.fr',
    current_consent: current,
    note: "Volia ne conserve l'historique du consentement que localement (RGPD - minimisation). Pour un historique serveur, contactez contact@volia.fr.",
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `volia-consentement-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function openCookieModal() {
  if (!isBrowser()) return;
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
  } catch (e) {
    /* noop */
  }
}
