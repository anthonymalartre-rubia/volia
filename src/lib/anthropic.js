// ─────────────────────────────────────────────────────────────────────
// lib/anthropic.js — factory unique pour le client Anthropic (Claude)
// ─────────────────────────────────────────────────────────────────────
// Pourquoi (audit dette technique, finding M8) : le SDK Anthropic a un
// défaut de timeout de 10 MINUTES + 2 retries. Sur une route Vercel à
// maxDuration=60 (ex. /api/one/run), un appel Claude qui traîne = fonction
// tuée par la plateforme → 504 opaque, aucune branche de fallback exécutée.
// Cette factory impose un timeout court + 1 seul retry par défaut, et
// centralise `cleanEnv(ANTHROPIC_API_KEY)` (les 21 `new Anthropic()` du repo
// dupliquaient le plumbing sans cleanEnv). Migration au fil de l'eau.
//
// Usage : import { getAnthropic } from '@/lib/anthropic';
//         const client = getAnthropic();              // 30 s, 1 retry
//         const client = getAnthropic({ timeout: 20_000 });
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { cleanEnv } from '@/lib/envClean';

/**
 * @param {{ timeout?: number, maxRetries?: number }} [opts]
 * @returns {Anthropic|null} client configuré, ou null si la clé est absente
 *   (à l'appelant de gérer le null — pas de throw silencieux ici).
 */
export function getAnthropic(opts = {}) {
  const apiKey = cleanEnv(process.env.ANTHROPIC_API_KEY);
  if (!apiKey) return null;
  const { timeout = 30_000, maxRetries = 1 } = opts;
  return new Anthropic({ apiKey, timeout, maxRetries });
}
