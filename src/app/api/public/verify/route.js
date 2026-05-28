// ─────────────────────────────────────────────────────────────────────
// /api/public/verify — endpoint public pour le HeroSearchWidget (mode
// "Vérifier un email")
// ─────────────────────────────────────────────────────────────────────
//
// Objectif : remplacer le mock pattern-based (qui disait "Valide" à tout
// email ne contenant pas "fake/invalid/nope") par une vraie vérification
// MillionVerifier — tout en plafonnant le coût et en évitant l'abus.
//
// Sécurités :
// - Rate limit IP : 2 vérifications par IP par jour (partagé avec
//   /api/public/preview via le helper ipRateLimiter — le compteur est
//   commun aux deux routes : prévient l'abus combiné)
// - Cap global : 1000 vérifications par jour (= max ~$0.50/jour, ~$15/mois)
// - Cache Redis 24h sur les résultats (un email vérifié hier = même
//   résultat aujourd'hui dans 99% des cas → économies)
// - Format email validé côté serveur (regex)
// - Si Redis pas configuré OU MILLIONVERIFIER_API_KEY manquante → 503
//
// Réponses :
// - 200 : { result, status, color, detail, cached? }
//   où result = 'ok' | 'invalid' | 'catch_all' | 'disposable' | 'unknown'
// - 400 : email manquant ou mal formé
// - 429 : rate limit IP dépassé
// - 503 : Redis down / API key manquante / MillionVerifier down
//
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import {
  getRedis,
  ipRateLimiter,
  globalRateLimiter,
  getClientIP,
} from '@/lib/upstash';
import { getCachedPlaces, setCachedPlaces } from '@/lib/places-cache';

// Regex email simple (RFC 5322 simplifiée, suffisant pour pré-filtrer
// les inputs poubelle avant d'appeler MillionVerifier).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Timeout MillionVerifier — leur API est généralement < 2s mais on
// sécurise à 8s pour éviter de bloquer un visiteur indéfiniment.
const MV_TIMEOUT_MS = 8000;

// Traduction "result MillionVerifier" → format affichable par le widget
// (status humain + couleur sémantique + explication courte).
const RESULT_DISPLAY = {
  ok: {
    status: 'Valide',
    color: 'green',
    detail: 'Adresse vérifiée par SMTP — délivrabilité élevée.',
  },
  catch_all: {
    status: 'Catch-all',
    color: 'amber',
    detail: 'Le domaine accepte tous les emails — fiabilité moyenne.',
  },
  invalid: {
    status: 'Invalide',
    color: 'red',
    detail: "Cette boîte mail n'existe pas ou refuse les emails.",
  },
  disposable: {
    status: 'Jetable',
    color: 'amber',
    detail: 'Adresse temporaire (10minutemail, etc.) — à éviter en outreach.',
  },
  unknown: {
    status: 'Indéterminé',
    color: 'amber',
    detail: 'Impossible de vérifier (timeout serveur distant). Réessayez.',
  },
  error: {
    status: 'Erreur',
    color: 'amber',
    detail: 'Vérification temporairement indisponible.',
  },
};

function fetchWithTimeout(url, options = {}, timeoutMs = MV_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

async function verifyWithMillionVerifier(email) {
  const apiKey = process.env.MILLIONVERIFIER_API_KEY;
  if (!apiKey) return { result: 'error', error: 'api_key_missing' };

  try {
    const params = new URLSearchParams({ api: apiKey, email });
    const res = await fetchWithTimeout(
      `https://api.millionverifier.com/api/v3/?${params.toString()}`,
    );
    if (!res.ok) {
      return { result: 'error', error: `http_${res.status}` };
    }
    const data = await res.json();
    return {
      result: data.result || 'unknown',
      subresult: data.subresult || null,
      free: data.free || false,
      role: data.role || false,
      quality: data.quality_score ?? null,
    };
  } catch (err) {
    return {
      result: 'unknown',
      error: err.name === 'AbortError' ? 'timeout' : err.message,
    };
  }
}

export async function POST(request) {
  try {
    // ─── 1. Vérifier que Redis est configuré ──────────────────────
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json(
        {
          error: 'verify_unavailable',
          message:
            'Le mode démo est temporairement indisponible. Inscrivez-vous gratuitement pour vérifier vos emails.',
        },
        { status: 503 },
      );
    }

    // ─── 2. Parser et valider l'input ─────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
    }

    const email =
      typeof body.email === 'string'
        ? body.email.trim().toLowerCase().slice(0, 254)
        : '';

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        {
          error: 'invalid_email',
          message: 'Format email invalide (ex: contact@entreprise.com).',
        },
        { status: 400 },
      );
    }

    // ─── 3. Rate limit par IP (2/jour, partagé avec /api/public/preview) ─
    const ip = getClientIP(request);
    const ipLimiter = ipRateLimiter();
    const ipResult = await ipLimiter.limit(ip);

    if (!ipResult.success) {
      const resetSec = Math.ceil((ipResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'rate_limit_exceeded',
          message:
            "Vous avez atteint la limite de vérifications gratuites pour aujourd'hui. Inscrivez-vous (Starter gratuit) pour continuer.",
          remaining_today: 0,
          reset_in_seconds: resetSec,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(resetSec),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(ipResult.reset),
          },
        },
      );
    }

    // ─── 4. Cap global (anti-burn-coût) ───────────────────────────
    const globalLimiter = globalRateLimiter();
    const globalResult = await globalLimiter.limit('global');
    if (!globalResult.success) {
      return NextResponse.json(
        {
          error: 'global_quota_exceeded',
          message:
            "Service très demandé aujourd'hui ! Réessayez demain ou inscrivez-vous (gratuit) pour un accès illimité.",
        },
        { status: 503 },
      );
    }

    // ─── 5. Cache lookup (24h TTL) ────────────────────────────────
    const cacheQuery = { email };
    const cached = await getCachedPlaces('verify', cacheQuery);
    if (cached) {
      const display = RESULT_DISPLAY[cached.result] || RESULT_DISPLAY.unknown;
      return NextResponse.json({
        ...display,
        result: cached.result,
        email,
        cached: true,
        remaining_today: ipResult.remaining,
      });
    }

    // ─── 6. Vrai appel MillionVerifier ────────────────────────────
    const mv = await verifyWithMillionVerifier(email);

    if (mv.error === 'api_key_missing') {
      return NextResponse.json(
        {
          error: 'verify_unavailable',
          message:
            'Vérification email indisponible (config serveur). Réessayez plus tard.',
        },
        { status: 503 },
      );
    }

    // Stocker en cache (même 'unknown'/'error' — pour éviter de retaper
    // la requête identique 5 fois dans la journée). TTL court (1h) sur les
    // erreurs, normal (24h via places-cache) sur les vrais résultats.
    if (mv.result && mv.result !== 'error') {
      await setCachedPlaces('verify', cacheQuery, { result: mv.result });
    }

    const display = RESULT_DISPLAY[mv.result] || RESULT_DISPLAY.unknown;

    return NextResponse.json({
      ...display,
      result: mv.result,
      email,
      cached: false,
      remaining_today: ipResult.remaining,
    });
  } catch (error) {
    console.error('[/api/public/verify] error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Une erreur inattendue est survenue. Réessayez.',
      },
      { status: 500 },
    );
  }
}
