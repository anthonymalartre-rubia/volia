// WS6 — Politique fail-closed pour les webhooks inbound.
//
// Plusieurs endpoints inbound (Resend replies, contact@, stop@/kill-switch,
// Twilio inbound, captcha formulaires) vérifiaient la signature « best-effort » :
// si le secret d'environnement était absent, ils LOGGAIENT puis TRAITAIENT quand
// même le payload. En production, ça revient à accepter des webhooks forgés :
//   - un reply forgé crée un faux contact CRM ;
//   - un email « RESUME » spoofé réactive l'autopilot (le From est spoofable, la
//     whitelist d'expéditeurs ne suffit donc pas) ;
//   - un feedback forgé pollue la file de traitement.
//
// Cette fonction décide si l'absence de secret doit être FATALE (rejet HTTP).
//
// Politique :
//   - Tout déploiement Vercel (production ET preview) → FATAL (fail-closed).
//     Les secrets DOIVENT être configurés ; un manquant = misconfiguration à
//     rendre bruyante (401), jamais un accès silencieux.
//   - Build de production local (`npm run build && npm start`, NODE_ENV=production)
//     → FATAL également (comportement prod-like).
//   - Dev local (`npm run dev` : NODE_ENV=development, VERCEL absent) → NON fatal :
//     on conserve le best-effort pour tester les webhooks sans configurer chaque
//     secret.
//
// Sur Vercel, `process.env.VERCEL` vaut '1' sur tous les déploiements (prod +
// preview + build). En local dev il est absent.
export function webhookSecretRequired() {
  return process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
}
