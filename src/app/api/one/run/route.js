// ─────────────────────────────────────────────────────────────────────
// POST /api/one/run — Volia One : domaine → leads + emails
// (dossier "run" et non "build" : "build" est ignoré par .gitignore)
// ─────────────────────────────────────────────────────────────────────
// Body: { domain }
// PUBLIC (anonyme autorisé) — c'est le "wow" Volia One sans mur d'inscription.
// Borné en coût : rate-limit par IP (3/jour) + cap global (150/jour) via Upstash.
// L'ENVOI réel reste sur /api/one/launch (login + domaine vérifié, jamais ici).
// Renvoie { success, icp, leads, counts, remaining_today }.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getRedis, getClientIP, oneIpRateLimiter, oneGlobalRateLimiter } from '@/lib/upstash';
import { getAuthenticatedUser } from '@/lib/auth';
import { buildFromDomain } from '@/lib/one/build';

// Le pipeline (Places + enrich + Claude) dépasse les 10s par défaut.
export const maxDuration = 60;

export async function POST(request) {
  // ① Redis configuré ? (sinon dégradation propre — pas de run non borné)
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      {
        error: 'one_unavailable',
        message:
          'Volia One est temporairement indisponible. Inscris-toi (gratuit, sans CB) pour accéder à toutes les fonctionnalités.',
      },
      { status: 503 }
    );
  }

  // ② Valider l'input AVANT de consommer un crédit IP (body coûteux)
  const { domain } = await request.json().catch(() => ({}));
  if (!domain || typeof domain !== 'string' || domain.length > 120) {
    return NextResponse.json({ error: 'Domaine requis (string, < 120 car.)' }, { status: 400 });
  }

  // ③ Rate-limit par IP (3 runs/jour) + cap global (150/jour)
  //    Défense : si un limiter ne s'initialise pas (Redis indispo entre-temps),
  //    on dégrade en 503 plutôt que de crasher sur null.limit().
  const ipLimiter = oneIpRateLimiter();
  const globalLimiter = oneGlobalRateLimiter();
  if (!ipLimiter || !globalLimiter) {
    return NextResponse.json(
      { error: 'one_unavailable', message: 'Volia One est temporairement indisponible. Réessaie plus tard.' },
      { status: 503 }
    );
  }
  const ip = getClientIP(request);
  const ipResult = await ipLimiter.limit(ip);
  if (!ipResult.success) {
    const resetSec = Math.ceil((ipResult.reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: 'rate_limit_exceeded',
        message:
          "Tu as atteint la limite gratuite du jour. Crée un compte (gratuit, sans carte) pour continuer.",
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
      }
    );
  }

  // ④ Cap global (150 runs/jour — plafond dur anti bombe-à-coûts)
  const globalResult = await globalLimiter.limit('global');
  if (!globalResult.success) {
    return NextResponse.json(
      {
        error: 'global_quota_exceeded',
        message:
          "Volia One est très demandé aujourd'hui. Réessaie demain, ou crée un compte gratuit.",
      },
      { status: 503 }
    );
  }

  // ⑤ Build. La découverte décideur (Serper + vérif zéro-bounce, coûteuse) n'est
  //    activée que pour les utilisateurs CONNECTÉS — l'anonyme garde la version
  //    gratuite (scrape/serper/guess). Best-effort : si l'auth échoue, anonyme.
  let isLoggedIn = false;
  try {
    const { user } = await getAuthenticatedUser();
    isLoggedIn = !!user;
  } catch {
    /* anonyme */
  }

  try {
    const result = await buildFromDomain(domain, { findDecisionMakers: isLoggedIn });
    return NextResponse.json({
      success: true,
      ...result,
      remaining_today: ipResult.remaining,
      decision_makers_enabled: isLoggedIn,
    });
  } catch (e) {
    console.error('[one/run] échec:', e?.message || e);
    return NextResponse.json({ error: e?.message || 'Erreur Volia One' }, { status: 500 });
  }
}
