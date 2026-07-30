// ─────────────────────────────────────────────────────────────────────
// POST /api/one/run — Volia One : domaine → leads + emails
// (dossier "run" et non "build" : "build" est ignoré par .gitignore)
// ─────────────────────────────────────────────────────────────────────
// Body: { domain }
// Deux régimes :
//   • ANONYME  → PUBLIC, borné par rate-limit IP (3/j) + cap global (150/j)
//     via Upstash. Pas de crédits, pas de persistance, pas de décideur.
//   • CONNECTÉ → gated par les CRÉDITS Prospection (enrichments), pas par l'IP,
//     + garde-fou 30 runs/user/jour (anti-boucle). 1 crédit / lead avec email
//     réel (= 1 contact ramené), minimum 1 crédit / run (un run à vide consomme
//     quand même des appels API réels). Découverte décideur activée. Run
//     persisté (volia_one_runs) → rouvrable au rechargement.
// L'ENVOI réel reste sur /api/one/launch.
// Renvoie { success, icp, leads, counts, ... }.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import {
  getRedis,
  getClientIP,
  oneIpRateLimiter,
  oneGlobalRateLimiter,
  oneUserRateLimiter,
} from '@/lib/upstash';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkLimit, incrementUsage } from '@/lib/usage';
import { buildFromDomain } from '@/lib/one/build';
import { anonymizeEmail, anonymizePhone, anonymizeName } from '@/lib/anonymize';

// Le pipeline (Places + enrich + Claude) dépasse les 10s par défaut.
// 60 s était structurellement insuffisant : la somme des garde-temps INTERNES du
// pipeline appelé plus bas atteint ~112 s en pire cas —
//   ICP        : fetchSiteText 10 s + Claude 25 s   (one/icp.js:14, :63)
//   Places     : 10 s                               (one/build.js:133)
//   Enrichir   : 42 s plafonnés                     (one/build.js:60)
//   Rédaction  : Claude 25 s                        (one/draft.js:32)
// Un run lent payait donc Places + Serper + Claude puis rendait un 504 à
// l'utilisateur, sur le parcours d'acquisition : coût engagé, prospect perdu.
// 180 s laisse le pire cas aboutir. Le compte supporte déjà 600 s ailleurs
// (cron/autopilot-stepper/route.js:9), donc aucune limite plateforme atteinte.
export const maxDuration = 180;

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

  // ③ Régime CONNECTÉ : garde-fou 30 runs/jour + gating par crédits
  //    (enrichments). Pas de rate-limit IP.
  if (user) {
    // Garde-fou anti-boucle par utilisateur. FAIL-OPEN volontaire (Redis absent
    // ou en erreur → on laisse passer) : les connectés restent gated par les
    // crédits, pas de raison de couper le service sur un incident Upstash.
    try {
      const userLimiter = oneUserRateLimiter();
      if (userLimiter) {
        const userResult = await userLimiter.limit(user.id);
        if (!userResult.success) {
          return NextResponse.json(
            {
              error: 'rate_limited_user',
              message:
                "Tu as atteint la limite de runs Volia One pour aujourd'hui. Réessaie demain, ou passe sur un plan supérieur.",
            },
            { status: 429 }
          );
        }
      }
    } catch {
      /* fail-open : voir commentaire ci-dessus */
    }

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
    // FAIL-CLOSED pour les anonymes : une erreur Upstash (token invalide,
    // réseau) → même 503 que Redis absent, pas un 500 générique.
    let ipResult;
    try {
      ipResult = await ipLimiter.limit(ip);
    } catch {
      return NextResponse.json(
        { error: 'one_unavailable', message: 'Volia One est temporairement indisponible. Réessaie plus tard.' },
        { status: 503 }
      );
    }
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
    let globalResult;
    try {
      globalResult = await globalLimiter.limit('global');
    } catch {
      return NextResponse.json(
        { error: 'one_unavailable', message: 'Volia One est temporairement indisponible. Réessaie plus tard.' },
        { status: 503 }
      );
    }
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
      // 1 crédit / lead vérifié, avec un MINIMUM de 1 crédit par run : un run
      // qui ne ramène rien a quand même consommé des appels API réels (Places,
      // Serper, Claude). Sans plancher, les runs à vide seraient gratuits en
      // boucle infinie.
      const verifiedLeads = (result.leads || []).filter(
        (l) => l.email && VERIFIED_METHODS.includes(l.method)
      ).length;
      const creditsCharged = Math.max(1, verifiedLeads);
      try {
        await incrementUsage(supabase, user.id, 'enrichments', creditsCharged);
      } catch (e) {
        console.warn('[one/run] incrementUsage failed:', e?.message);
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

    // ⑥ ANONYME (WS3) : ne JAMAIS renvoyer les données actionnables en clair à
    //    un visiteur non connecté — sinon on offre gratuitement une base de
    //    prospects B2B (emails + tél) + les cold emails déjà rédigés. On masque
    //    email/tél/décideur et on retire les brouillons (teaser). Le contenu
    //    complet reste réservé aux comptes (gratuits) qui paient le crédit.
    if (!user) {
      result.leads = (result.leads || []).map((l) => ({
        ...l,
        email: l.email ? anonymizeEmail(l.email) : null,
        telephone: l.telephone ? anonymizePhone(l.telephone) : null,
        contact_name: l.contact_name ? anonymizeName(l.contact_name) : null,
        draft: undefined,          // pas de cold email rédigé offert
        draft_locked: !!l.draft,   // la UI affiche "Inscris-toi pour voir l'email"
        anonymized: true,
      }));
    }

    return NextResponse.json({ success: true, ...result, decision_makers_enabled: !!user });
  } catch (e) {
    const msg = e?.message || 'Erreur Volia One';
    // Erreurs "input utilisateur" levées par icp.js (domaine vide/invalide,
    // site injoignable) → 422, pas 500 : le message est affiché tel quel par /one.
    const isInputError =
      msg.startsWith('Site injoignable') || msg.startsWith('Domaine vide') || msg.startsWith('Domaine invalide');
    if (isInputError) {
      return NextResponse.json({ error: msg }, { status: 422 });
    }
    console.error('[one/run] échec:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
