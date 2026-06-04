'use client';

// ─────────────────────────────────────────────────────────────────────
// LinkedInInsight — LinkedIn Insight Tag (suivi conversions + retargeting)
// ─────────────────────────────────────────────────────────────────────
// - Chargé en `lazyOnload` (non bloquant pour le TTI)
// - Gated par le consentement cookies (catégorie "marketing") — RGPD/CNIL
// - No-op si NEXT_PUBLIC_LINKEDIN_PARTNER_ID est absent → safe à déployer
//   avant même d'avoir le Partner ID (le tag ne se charge pas).
//
// Partner ID : Campaign Manager → Analyser → Insight Tag (un nombre, ex "1234567").
// À mettre dans Vercel : NEXT_PUBLIC_LINKEDIN_PARTNER_ID
//
// Suivi de conversion : deux options côté LinkedIn (voir doc) —
//   (a) basé URL (aucun code de plus), OU
//   (b) event JS : appeler trackLinkedInConversion(<conversion_id>) au signup.
// ─────────────────────────────────────────────────────────────────────

import Script from 'next/script';
import { useCookieConsent } from '@/lib/cookieConsent';

const PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID;

/**
 * Déclenche une conversion LinkedIn "event-specific" (option b).
 * No-op tant que le tag n'est pas chargé (pas de consentement, pas d'env…).
 * @param {string|number} conversionId — l'ID de conversion créé dans Campaign Manager.
 */
export function trackLinkedInConversion(conversionId) {
  if (typeof window === 'undefined' || !conversionId) return;
  if (typeof window.lintrk !== 'function') return;
  window.lintrk('track', { conversion_id: conversionId });
}

export default function LinkedInInsight() {
  const { hasConsent, hydrated } = useCookieConsent();
  const active = Boolean(PARTNER_ID) && hydrated && hasConsent('marketing');

  if (!active) return null;

  return (
    <Script
      id="linkedin-insight"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          _linkedin_partner_id = "${PARTNER_ID}";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          (function(l) {
            if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
            window.lintrk.q=[]}
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);
          })(window.lintrk);
        `,
      }}
    />
  );
}
