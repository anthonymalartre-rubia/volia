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
import { checkRateLimit } from '@/lib/rateLimit';

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
 * Volia One — rate limiter par IP : 3 runs/IP/jour.
 *
 * Un run /api/one/run est COÛTEUX (Google Places ×3 + Serper ×~12 + Claude ×5
 * ≈ 0,10-0,15 €). Limiteur séparé du preview (préfixe + quota dédiés) car le
 * coût unitaire est bien plus élevé qu'une recherche Places seule.
 *
 * Usage :
 *   const { success, remaining, reset } = await oneIpRateLimiter().limit(ip);
 */
let oneIpLimiterInstance = null;
export function oneIpRateLimiter() {
  if (oneIpLimiterInstance) return oneIpLimiterInstance;
  const redis = getRedis();
  if (!redis) return null;

  oneIpLimiterInstance = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 d'),
    prefix: 'rl:one:ip',
    analytics: true,
  });
  return oneIpLimiterInstance;
}

/**
 * Volia One — cap global : 150 runs/jour total (plafond dur ≈ 15-22 €/jour).
 * Anti bombe-à-coûts pour l'endpoint public anonyme. Tunable si la demande
 * légitime sature (augmenter = plus cher).
 *
 * Usage :
 *   const { success } = await oneGlobalRateLimiter().limit('global');
 */
let oneGlobalLimiterInstance = null;
export function oneGlobalRateLimiter() {
  if (oneGlobalLimiterInstance) return oneGlobalLimiterInstance;
  const redis = getRedis();
  if (!redis) return null;

  oneGlobalLimiterInstance = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(150, '1 d'),
    prefix: 'rl:one:global',
    analytics: true,
  });
  return oneGlobalLimiterInstance;
}

/**
 * Volia One — rate limiter par UTILISATEUR connecté : 30 runs/user/jour.
 *
 * Garde-fou anti-boucle : les connectés sont gated par les crédits, mais un
 * run à 0 lead vérifié consomme quand même des appels API réels (Places,
 * Serper, Claude, MillionVerifier). 30/jour borne le coût d'un compte qui
 * tournerait en boucle.
 *
 * Usage :
 *   const { success } = await oneUserRateLimiter().limit(userId);
 */
let oneUserLimiterInstance = null;
export function oneUserRateLimiter() {
  if (oneUserLimiterInstance) return oneUserLimiterInstance;
  const redis = getRedis();
  if (!redis) return null;

  oneUserLimiterInstance = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 d'),
    prefix: 'rl:one:user',
    analytics: true,
  });
  return oneUserLimiterInstance;
}

/**
 * WS7-A — Rate limiter DISTRIBUÉ générique (Upstash Redis), partagé entre toutes
 * les instances serverless, avec DÉGRADATION GRACIEUSE.
 *
 * Remplace checkRateLimit() (Map in-memory, propre à chaque instance warm : un
 * attaquant qui répartit ses requêtes sur les cold starts / instances concurrentes
 * multiplie la limite). Ici le compteur vit dans Redis → limite réellement globale.
 *
 * Robustesse : si Upstash n'est pas configuré (getRedis()===null) ou tombe en
 * panne, on RETOMBE sur le limiter in-memory plutôt que de bloquer les vrais
 * utilisateurs (fail-open contrôlé : on garde une protection dégradée, jamais un
 * lock-out total à cause d'une panne Redis).
 *
 * @param {string} identifier - clé (typiquement l'IP client via getClientIP)
 * @param {{max:number, windowSec:number, prefix:string}} opts
 * @returns {Promise<{success:boolean, remaining:number, resetAt:Date, backend:string}>}
 *   Même forme que checkRateLimit() (champ .success) → remplacement drop-in.
 */
const distributedLimiters = new Map();

function getDistributedLimiter({ max, windowSec, prefix }) {
  const redis = getRedis();
  if (!redis) return null;
  const cacheKey = `${prefix}:${max}:${windowSec}`;
  let limiter = distributedLimiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${windowSec} s`),
      prefix,
      analytics: false,
    });
    distributedLimiters.set(cacheKey, limiter);
  }
  return limiter;
}

export async function distributedRateLimit(identifier, { max, windowSec, prefix }) {
  const limiter = getDistributedLimiter({ max, windowSec, prefix });
  if (limiter) {
    try {
      const res = await limiter.limit(identifier);
      return {
        success: res.success,
        remaining: res.remaining,
        resetAt: new Date(res.reset),
        backend: 'upstash',
      };
    } catch (err) {
      console.warn('[rate-limit] Upstash indisponible, fallback in-memory:', err?.message);
    }
  }
  // Fallback dégradé : compteur in-memory (par instance). Moins strict mais > rien.
  const res = checkRateLimit(`${prefix}:${identifier}`, max, windowSec * 1000);
  return { ...res, backend: 'memory' };
}

/**
 * Extrait l'IP du request pour le rate limiting.
 * - Sur Vercel, x-forwarded-for est ÉCRASÉ par la plateforme avec l'IP réelle du
 *   client et les valeurs fournies par le client sont jetées (anti-spoofing, cf.
 *   https://vercel.com/docs/headers/request-headers). Le premier élément est donc
 *   fiable ici — hors "trusted proxy" Enterprise, non activé chez nous.
 * - Fallback x-real-ip puis "unknown" (tous les "unknown" partagent le bucket).
 */
export function getClientIP(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const xri = request.headers.get('x-real-ip');
  if (xri) return xri.trim();
  return 'unknown';
}
