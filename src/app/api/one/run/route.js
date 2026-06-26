// ─────────────────────────────────────────────────────────────────────
// POST /api/one/run — Volia One : domaine → leads + emails
// (dossier "run" et non "build" : "build" est ignoré par .gitignore)
// ─────────────────────────────────────────────────────────────────────
// Body: { domain }
// Deux régimes :
//   • ANONYME  → PUBLIC, borné par rate-limit IP (3/j) + cap global (150/j)
//     via Upstash. Pas de crédits, pas de persistance, pas de décideur.
//   • CONNECTÉ → gated par les CRÉDITS Prospection (enrichments), pas par l'IP.
//     1 crédit / lead avec email réel (= 1 contact ramené). Découverte décideur
//     activée. Run persisté (volia_one_runs) → rouvrable au rechargement.
// L'ENVOI réel reste sur /api/one/launch.
// Renvoie { success, icp, leads, counts, ... }.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getRedis, getClientIP, oneIpRateLimiter, oneGlobalRateLimiter } from '@/lib/upstash';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkLimit, incrementUsage } from '@/lib/usage';
import { buildFromDomain } from '@/lib/one/build';

// Le pipeline (Places + enrich + Claude) dépasse les 10s par défaut.
export const maxDuration = 60;

const VERIFIED_METHODS = ['scrape', 'serper', 'decision_maker'];

export async function POST(request) {
  // ① Valider l'input AVANT de consommer crédit ou rate-limit
  const { domain } = await request.json().catch(() => ({}));
  if (!domain || typeof domain !== 'string' || domain.length > 120) {
    return NextResponse.json({ error: 'Domaine requis (string, < 120 car.)' }, { status: 400 });
  }

  // ② Qui appelle ?
  let user = null;
  let supabase = null;
  try {
    ({ user, supabase } = await getAuthenticatedUser());
  } catch {
    /* anonyme */
  }

  // ③ Régime CONNECTÉ : gating par crédits (enrichments). Pas de rate-limit IP.
  if (user) {
    let credit;
    try {
      credit = await checkLimit(supabase, user.id, 'enrichments');
    } catch {
      credit = { allowed: true }; // ne pas bloquer sur une erreur de lecture quota
    }
    if (!credit.allowed) {
      return NextResponse.json(
        {
          error: 'credits_exhausted',
          message:
            'Crédits épuisés pour ce mois. Recharge des crédits ou passe à un plan supérieur pour continuer.',
        },
        { status: 402 }
      );
    }
  } else {
    // ③bis Régime ANONYME : Redis + rate-limit IP/global (borne le coût)
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
          message: 'Tu as atteint la limite gratuite du jour. Crée un compte (gratuit, sans carte) pour continuer.',
          remaining_today: 0,
          reset_in_seconds: resetSec,
        },
        { status: 429, headers: { 'Retry-After': String(resetSec), 'X-RateLimit-Remaining': '0' } }
      );
    }
    const globalResult = await globalLimiter.limit('global');
    if (!globalResult.success) {
      return NextResponse.json(
        {
          error: 'global_quota_exceeded',
          message: "Volia One est très demandé aujourd'hui. Réessaie demain, ou crée un compte gratuit.",
        },
        { status: 503 }
      );
    }
  }

  // ④ Build (découverte décideur réservée aux connectés)
  try {
    const result = await buildFromDomain(domain, { findDecisionMakers: !!user });

    // ⑤ Connecté : facturation en crédits + persistance du run (best-effort,
    //    ne jamais faire échouer la réponse là-dessus).
    if (user && supabase) {
      const creditsCharged = (result.leads || []).filter(
        (l) => l.email && VERIFIED_METHODS.includes(l.method)
      ).length;
      if (creditsCharged > 0) {
        try {
          await incrementUsage(supabase, user.id, 'enrichments', creditsCharged);
        } catch (e) {
          console.warn('[one/run] incrementUsage failed:', e?.message);
        }
      }
      try {
        const { data: row } = await supabase
          .from('volia_one_runs')
          .insert({
            owner_id: user.id,
            domain,
            icp: result.icp,
            leads: result.leads,
            counts: result.counts,
          })
          .select('id')
          .single();
        if (row?.id) result.run_id = row.id;
      } catch (e) {
        console.warn('[one/run] persist run failed:', e?.message);
      }
      result.credits_charged = creditsCharged;
    }

    return NextResponse.json({ success: true, ...result, decision_makers_enabled: !!user });
  } catch (e) {
    console.error('[one/run] échec:', e?.message || e);
    return NextResponse.json({ error: e?.message || 'Erreur Volia One' }, { status: 500 });
  }
}
