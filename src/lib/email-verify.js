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

import { trackApiCall } from './apiCosts';

const MV_BASE = 'https://api.millionverifier.com/api/v3/';

function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// Trace un appel MillionVerifier avec son verdict. Ne doit JAMAIS faire échouer
// une vérification : trackApiCall est déjà fire-and-forget, le try/catch couvre
// le cas où le client admin n'est pas initialisable (tests, scripts hors app).
function trackVerification(result) {
  try {
    trackApiCall('millionverifier', null, `verify/${result}`);
  } catch {
    /* observabilité best-effort */
  }
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
      // L'appel a bien été consommé même en erreur HTTP → on le compte.
      trackVerification('http_error');
      return { email, result: 'unknown', error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    const result = data.result || 'unknown';
    // Le VERDICT est encodé dans l'endpoint (verify/ok, verify/catch_all…).
    // trackApiCall ne calcule le coût que d'après `service`, jamais d'après
    // l'endpoint : faire varier ce dernier n'altère donc aucun montant, et ça
    // rend enfin mesurable la part de catch_all — la principale cause de perte
    // du décideur, jusqu'ici invisible faute de trace.
    trackVerification(result);
    return {
      email,
      result,
      subresult: data.subresult || null,
      free: data.free || false,
      role: data.role || false,
      quality: data.quality_score ?? null,
    };
  } catch (err) {
    trackVerification(err.name === 'AbortError' ? 'timeout' : 'network_error');
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
