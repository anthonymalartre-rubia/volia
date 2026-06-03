'use client';

// Capture le code affilié depuis l'URL (?aff=CODE) et le pose en cookie
// `volia_aff` (90 jours). Ce cookie est relu côté serveur dans
// /api/stripe/checkout pour attribuer le client à l'affilié.
//
// Monté une seule fois dans le layout racine. Ne rend rien.
// Le cookie n'est PAS HttpOnly (posé côté client) mais il est quand même
// envoyé au serveur sur les requêtes same-origin → suffisant pour l'attribution.

import { useEffect } from 'react';

const COOKIE = 'volia_aff';
const MAX_AGE = 90 * 24 * 60 * 60; // 90 jours

export default function AffiliateTracker() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get('aff');
      if (!raw) return;
      // Codes affiliés : A-Z + 2-9, 8 caractères (cf. lib/affiliates).
      const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
      if (code.length < 4) return;
      // first-touch : on n'écrase pas une attribution déjà posée.
      if (document.cookie.split('; ').some((c) => c.startsWith(`${COOKIE}=`))) return;
      document.cookie = `${COOKIE}=${code}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
    } catch {
      /* no-op */
    }
  }, []);

  return null;
}
