// ─────────────────────────────────────────────────────────────────────
// src/lib/auth-errors.js — Mappe les erreurs d'auth (Supabase / API) vers
// des clés i18n, pour que les messages soient TOUJOURS dans la langue de
// l'utilisateur.
// ─────────────────────────────────────────────────────────────────────
//
// Problème résolu : supabase.auth.signInWithPassword() renvoie des messages
// EN bruts ("Invalid login credentials", "Email not confirmed"…) quelle que
// soit la locale. Résultat : un utilisateur FR voyait de l'anglais, et un
// utilisateur EN voyait parfois du français (messages d'API maison).
// Incident signup Denell 06/2026 → on ne renvoie plus jamais de message brut.
//
// Usage côté React :
//   import { mapSupabaseAuthError } from '@/lib/auth-errors';
//   setError(t(mapSupabaseAuthError(error)));
//
// La fonction ne dépend PAS de React/i18n — elle renvoie une CLÉ ('auth.xxx')
// que l'appelant passe à t(). Garde la logique testable et réutilisable.
// ─────────────────────────────────────────────────────────────────────

/**
 * @param {{message?: string, status?: number, code?: string}|null} error
 * @returns {string} clé i18n (ex: 'auth.invalidCredentials')
 */
export function mapSupabaseAuthError(error) {
  if (!error) return 'auth.genericError';

  const msg = (error.message || '').toLowerCase();
  const status = error.status || error.statusCode;
  const code = (error.code || '').toLowerCase();

  // Rate-limit (Supabase throttle anti-abus) — prioritaire sur le reste.
  if (
    status === 429 ||
    code.includes('rate') ||
    msg.includes('rate limit') ||
    msg.includes('too many') ||
    msg.includes('over_')
  ) {
    return 'auth.rateLimited';
  }

  // Identifiants invalides — le cas le plus fréquent à la connexion.
  if (
    msg.includes('invalid login credentials') ||
    msg.includes('invalid credentials') ||
    code === 'invalid_credentials' ||
    msg.includes('incorrect')
  ) {
    return 'auth.invalidCredentials';
  }

  // Email pas encore confirmé → on guide vers la boîte mail.
  if (
    msg.includes('email not confirmed') ||
    msg.includes('not confirmed') ||
    code === 'email_not_confirmed'
  ) {
    return 'auth.emailNotConfirmed';
  }

  // Compte déjà existant (cas signup, mais on couvre).
  if (
    msg.includes('already registered') ||
    msg.includes('already exists') ||
    msg.includes('user already') ||
    code === 'user_already_exists'
  ) {
    return 'auth.accountExists';
  }

  // Email invalide / mal formé.
  if (msg.includes('invalid email') || msg.includes('email address') || code === 'validation_failed') {
    return 'auth.invalidEmail';
  }

  return 'auth.genericError';
}

/**
 * Mappe un statut HTTP d'une réponse de notre API auth maison vers une clé i18n.
 * Utilisé là où le front reçoit un { status } sans error structurée Supabase
 * (forgot-password, etc.). On n'affiche JAMAIS le message brut de l'API.
 *
 * @param {number} status
 * @returns {string} clé i18n
 */
export function mapApiAuthStatus(status) {
  if (status === 429) return 'auth.rateLimited';
  if (status === 400) return 'auth.invalidEmail';
  if (status === 409) return 'auth.accountExists';
  if (status >= 500) return 'auth.serverError';
  return 'auth.genericError';
}
