// Sentry — instrumentation côté navigateur (browser).
//
// Pattern recommandé Next.js (remplace sentry.client.config.js qui
// devient deprecated avec Turbopack).
//
// Capturé : erreurs React non rattrapées, rejets de promesses non gérés,
// erreurs throw côté client, et performance (10 % des transactions).
//
// Graceful degradation : si NEXT_PUBLIC_SENTRY_DSN absent → Sentry.init
// court-circuité, pas de crash.
//
// Doc : docs/MONITORING.md

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Instrumentation des navigations App Router (Next 14+).
// Exporté toujours — no-op si Sentry pas init.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

if (dsn) {
  Sentry.init({
    dsn,

    // Performance Monitoring — 10 % des transactions
    // (free tier Sentry = 5k events/mois, on reste large).
    tracesSampleRate: 0.1,

    // Replay sessions : désactivé par défaut (lourd en quota).
    // On capture quand même les sessions où une erreur se produit
    // pour pouvoir rejouer le contexte du crash.
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,

    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

    // Filtre les erreurs bruyantes/bénignes du navigateur.
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Network request failed',
      /^canceled$/,
      /AbortError/,
      // Bruit d'extensions navigateur (wallets crypto, etc.) : leur script
      // injecté throw « ...reading 'sendMessage' » quand son contexte
      // d'extension est invalidé. Volia n'appelle nulle part
      // chrome.runtime.sendMessage → ce n'est jamais notre code.
      /reading 'sendMessage'/,
    ],

    // Rejette les événements dont la frame fautive provient d'un script
    // injecté par une extension (le fichier n'appartient pas à Volia). Nos
    // fichiers vivent sous _next/static/… et ne matchent aucun de ces motifs.
    denyUrls: [
      /injectedScript/i,
      /contentScript/i,
      /inpage\.js/i,
      /extension:\/\//i, // chrome-extension://, moz-extension://, safari-web-extension://
    ],

    beforeSend(event) {
      // Skip en dev local pour éviter de polluer Sentry avec des
      // erreurs HMR/fast-refresh.
      if (process.env.NODE_ENV === 'development') return null;
      return event;
    },
  });
}
