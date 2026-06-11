// ─────────────────────────────────────────────────────────────────────
// src/lib/credit-packs.js — packs de crédits Prospection (one-time)
// ─────────────────────────────────────────────────────────────────────
// Pivot freemium (11/06/2026), volet « puis au crédit » : au-delà du
// quota mensuel inclus dans le plan (free 25 / prospection 500 /
// max 2000), l'utilisateur peut acheter des packs ponctuels.
//
// Les crédits achetés (user_profiles.credit_balance) n'expirent pas et
// ne sont consommés QUE quand le quota mensuel est épuisé
// (lib/usage.js). Ledger : credit_transactions (idempotent sur la
// session Stripe). Produit Stripe : « Crédits Volia Prospection ».
//
// Prix volontairement au-dessus du tarif abonnement (Prospection =
// 19 €/500 crédits ≈ 0,038 €/crédit) pour garder l'abonnement comme
// meilleure affaire. Ajustables dans Stripe + ici.

import { cleanEnv } from './envClean';

export const CREDIT_PACKS = {
  s: {
    id: 's',
    credits: 100,
    price: 900, // 9 € en centimes
    label: 'Pack 100 crédits',
    stripePriceId: cleanEnv(process.env.STRIPE_CREDITS_S_PRICE_ID || ''),
  },
  m: {
    id: 'm',
    credits: 500,
    price: 2900, // 29 €
    label: 'Pack 500 crédits',
    popular: true,
    stripePriceId: cleanEnv(process.env.STRIPE_CREDITS_M_PRICE_ID || ''),
  },
  l: {
    id: 'l',
    credits: 2000,
    price: 7900, // 79 €
    label: 'Pack 2 000 crédits',
    stripePriceId: cleanEnv(process.env.STRIPE_CREDITS_L_PRICE_ID || ''),
  },
};

export function getCreditPack(packId) {
  return CREDIT_PACKS[packId] || null;
}

/** Liste ordonnée pour l'UI (S → L). */
export const CREDIT_PACK_LIST = ['s', 'm', 'l'];
