// ─────────────────────────────────────────────────────────────────────
// feature-flags.js — Toggles produit centralisés
// ─────────────────────────────────────────────────────────────────────
// Permet d'activer/désactiver des modules sans toucher au code.
// Le code reste en place — seuls les liens UI sont masqués/montrés.
//
// Comment ajouter un flag :
//   1. Ajouter une const exportée ici (ex: FEATURE_X_ENABLED = false)
//   2. Importer dans les fichiers UI concernés
//   3. Wrap les liens / boutons / sections avec { FEATURE_X_ENABLED && (...) }
//   4. Pour réactiver : flip la valeur à true et redeploy
//
// Note : ces flags sont des constantes JS, donc pas d'env var nécessaire.
// Si tu veux un flag par environnement (dev vs prod), utilise plutôt :
//   export const X = process.env.NEXT_PUBLIC_X === 'true';
// ─────────────────────────────────────────────────────────────────────

/**
 * Campagnes SMS via Twilio.
 *
 * Désactivé pour l'instant — on focus sur l'email.
 * Le code Twilio reste en place (lib/twilio-numbers.js, /api/sms-senders,
 * /api/admin/prospection/sms-campaigns, webhooks Twilio, cron SMS).
 *
 * Pour réactiver : flip à `true` ci-dessous et redeploy. Tous les menus
 * UI réapparaîtront automatiquement.
 */
export const SMS_CAMPAIGNS_ENABLED = false;
