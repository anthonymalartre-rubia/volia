// ─────────────────────────────────────────────────────────────────────
// Upstash Redis client + rate limiters
// ─────────────────────────────────────────────────────────────────────
//
// Utilisé pour :
// - Rate limiting du HeroSearchWidget public (2 req/IP/jour)
// - Cap global Google Places (5000 req/jour pour éviter facture)
// - Cache 24h des résultats Google Places (réduit le coût ×10)
//
// CONFIGURATION REQUISE (env vars Vercel) :
// - UPSTASH_REDIS_REST_URL
// - UPSTASH_REDIS_REST_TOKEN
//
// Voir doc d'activation dans src/lib/upstash.js (haut du fichier).
//
// Si les env vars ne sont pas définies, getRedis() retourne null →
// la route /api/public/preview répondra avec une erreur 503 explicite
// au lieu de crasher.
// ─────────────────────────────────────────────────────────────────────

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

let redisInstance = null;

/**
 * Renvoie le client Redis Upstash, ou null si pas configuré.
 * Lazy-init pour éviter de crasher au build si env vars manquantes.
 */
export function getRedis() {
  if (redisInstance) return redisInstance;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  redisInstance = new Redis({ url, token });
  return redisInstance;
}

/**
 * Rate limiter : 2 requêtes par IP par jour.
 * Sliding window avec analytics activées pour debug.
 *
 * Historique : démarré à 3/jour le 27 mai 2026, réduit à 2/jour le
 * 28 mai 2026 sur décision founder (qty démo suffisante, anti-abus
 * renforcé). Partagé entre /api/public/preview et /api/public/verify.
 *
 * Usage :
 *   const { success, remaining, reset } = await ipRateLimiter().limit(ip);
 *   if (!success) return 429;
 */
let ipLimiterInstance = null;
export function ipRateLimiter() {
  if (ipLimiterInstance) return ipLimiterInstance;
  const redis = getRedis();
  if (!redis) return null;

  ipLimiterInstance = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, '1 d'),
    prefix: 'rl:preview:ip',
    analytics: true,
  });
  return ipLimiterInstance;
}

/**
 * Rate limiter global : 5000 requêtes Google Places par jour total
 * (cap dur pour éviter facture qui s'envole en cas de scraping bot).
 *
 * Coût max estimé : 5000 × 0.017$/req = ~85$/mois worst case (sans cache).
 * Avec le cache 24h actif, le coût réel est ~10-20$/mois.
 *
 * Usage :
 *   const { success } = await globalRateLimiter().limit('global');
 *   if (!success) return 503; // service quota exceeded
 */
let globalLimiterInstance = null;
export function globalRateLimiter() {
  if (globalLimiterInstance) return globalLimiterInstance;
  const redis = getRedis();
  if (!redis) return null;

  globalLimiterInstance = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5000, '1 d'),
    prefix: 'rl:preview:global',
    analytics: true,
  });
  return globalLimiterInstance;
}

/**
 * Extrait l'IP du request pour le rate limiting.
 * - Vercel injecte x-forwarded-for et x-real-ip
 * - On prend la première IP (proxy chain)
 * - Fallback "unknown" si rien → tous les "unknown" partagent le bucket
 */
export function getClientIP(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const xri = request.headers.get('x-real-ip');
  if (xri) return xri.trim();
  return 'unknown';
}
