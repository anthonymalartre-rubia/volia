'use client';

// ─────────────────────────────────────────────────────────────────────
// track.js — émission des ÉVÉNEMENTS de conversion publicitaire.
// ─────────────────────────────────────────────────────────────────────
// À appeler aux moments business clés : trackSignup() après une inscription
// réussie, trackPurchase() au retour d'un paiement Stripe réussi.
//
// Chaque appel est NO-OP si le pixel correspondant n'est pas chargé (pas de
// consentement marketing, ID env absent) → 100 % safe à appeler partout.
// Les libs (gtag, fbq) sont montées par <MarketingPixels/>, le tag LinkedIn
// par <LinkedInInsight/> — tous deux gated consentement dans le layout.
// ─────────────────────────────────────────────────────────────────────

import { trackLinkedInConversion } from '@/components/LinkedInInsight';

const LI_SIGNUP = process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_SIGNUP;
const LI_PURCHASE = process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_PURCHASE;

/** Inscription réussie (création de compte). */
export function trackSignup() {
  if (typeof window === 'undefined') return;
  try { window.gtag && window.gtag('event', 'sign_up', { method: 'email' }); } catch { /* noop */ }
  try { window.fbq && window.fbq('track', 'CompleteRegistration'); } catch { /* noop */ }
  if (LI_SIGNUP) trackLinkedInConversion(LI_SIGNUP);
}

/**
 * Achat réussi (abonnement payant activé).
 * @param {{value?:number, currency?:string, plan?:string}} opts
 *   value = montant en euros (ex: 99 ou 179). Optionnel mais recommandé (ROAS).
 */
export function trackPurchase({ value, currency = 'EUR', plan } = {}) {
  if (typeof window === 'undefined') return;
  const v = typeof value === 'number' && value > 0 ? value : undefined;
  try {
    window.gtag && window.gtag('event', 'purchase', {
      currency,
      value: v,
      transaction_id: undefined, // dédup éventuelle gérée côté GA si besoin
      items: plan ? [{ item_id: plan, item_name: 'Volia ' + plan }] : undefined,
    });
  } catch { /* noop */ }
  try {
    window.fbq && window.fbq('track', 'Purchase', v ? { value: v, currency } : { currency });
  } catch { /* noop */ }
  if (LI_PURCHASE) trackLinkedInConversion(LI_PURCHASE);
}
