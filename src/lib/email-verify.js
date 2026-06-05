// ─────────────────────────────────────────────────────────────────────
// src/lib/email-verify.js — Vérification d'email (MillionVerifier)
// ─────────────────────────────────────────────────────────────────────
// Extrait de l'API /api/verify-emails pour être RÉUTILISABLE côté serveur :
//   - /api/verify-emails  (vérif batch déclenchée par l'utilisateur)
//   - enrichissement décideur (politique zéro-bounce : on n'écrit qu'un
//     email dont MillionVerifier répond `ok`).
//
// Best-effort : si la clé API manque ou si l'appel échoue, on renvoie
// `unknown` (jamais throw) pour ne pas casser la cascade appelante.
// ─────────────────────────────────────────────────────────────────────

const MV_BASE = 'https://api.millionverifier.com/api/v3/';

function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

/**
 * Vérifie un email via MillionVerifier et renvoie le résultat brut.
 * @param {string} email
 * @returns {Promise<{email,result,subresult,free,role,quality,error?}>}
 *   result ∈ ok | catch_all | unknown | invalid | disposable | error
 */
export async function verifyEmailRaw(email) {
  const apiKey = process.env.MILLIONVERIFIER_API_KEY;
  if (!apiKey) return { email, result: 'unknown', error: 'API key missing' };

  try {
    const params = new URLSearchParams({ api: apiKey, email });
    const res = await fetchWithTimeout(`${MV_BASE}?${params.toString()}`);
    if (!res.ok) {
      return { email, result: 'unknown', error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return {
      email,
      result: data.result || 'unknown',
      subresult: data.subresult || null,
      free: data.free || false,
      role: data.role || false,
      quality: data.quality_score ?? null,
    };
  } catch (err) {
    return { email, result: 'unknown', error: err.name === 'AbortError' ? 'timeout' : err.message };
  }
}

/**
 * Politique zéro-bounce : un email n'est "livrable" que si MillionVerifier
 * répond explicitement `ok`. (catch_all/unknown/invalid → non servis.)
 * À injecter comme `verifyEmail` dans enrichDecisionMaker().
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function isEmailDeliverable(email) {
  if (!email) return false;
  const r = await verifyEmailRaw(email);
  return r.result === 'ok';
}
