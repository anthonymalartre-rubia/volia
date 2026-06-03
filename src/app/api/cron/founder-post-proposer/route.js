// ─────────────────────────────────────────────────────────────────────
// /api/cron/founder-post-proposer — proposer de posts "founder/builder"
// ─────────────────────────────────────────────────────────────────────
//
// Schedule : "0 9 * * 4" (jeudi 9h CET, 1×/semaine) — cf. vercel.json
//
// Action : génère 1 brouillon LinkedIn dans le registre PERSO du founder
// (story / builder agents IA / contrarian / anti-flex / outil / outbound),
// 100% basé sur des données VRAIES, et le dépose dans /admin/auto-queue
// sous action_type 'linkedin_founder_post' (file/validation séparée du
// proposer valeur-pricing).
//
// Garde-fous : cf. lib/founder-post-proposer.js (linter brand/DGCCRF +
// throttle 6j + quota perWeek:2 + kill switch autonomy). Pas d'auto-publi :
// le founder valide en 1 clic et copie-colle.
//
// Auth : Vercel cron envoie Authorization: Bearer CRON_SECRET.
// Trigger manuel : curl -H "Authorization: Bearer $CRON_SECRET" \
//                  https://volia.fr/api/cron/founder-post-proposer
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { runFounderPostProposer } from '@/lib/founder-post-proposer';
import { cleanEnv } from '@/lib/envClean';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runFounderPostProposer();
    const httpStatus = result.ok ? 200 : 500;
    return NextResponse.json(result, { status: httpStatus });
  } catch (err) {
    console.error('[cron/founder-post-proposer] unhandled error', err);
    return NextResponse.json(
      { ok: false, error: 'unhandled', message: err.message || String(err) },
      { status: 500 }
    );
  }
}
