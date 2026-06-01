// ─────────────────────────────────────────────────────────────────────
// /api/cron/auto-content-proposer — 1er cron autonome Sprint 1 Phase B
// ─────────────────────────────────────────────────────────────────────
//
// Schedule : "0 10 * * 1-5" (10h CET, du lundi au vendredi)
// Cf. vercel.json + docs/autonomy/00-PLAN.md
//
// Action : génère 1 brouillon LinkedIn + 1 tweet basé sur les events
// business récents (changelog, blog, signups), puis dépose dans
// /admin/auto-queue pour que le founder valide en 1 clic.
//
// Garde-fous (cf. lib/content-proposer.js) :
//   - Skip si AUTONOMOUS_MODE_ENABLED != true (kill switch global)
//   - Skip si aucun event notable (pas d'hallucination)
//   - Throttle : max 1 brouillon proposé toutes les 48h
//   - Linter regex bloquant claims interdits (DGCCRF + brand)
//   - expires_at = 48h (si pas approuvé, brouillon devient obsolète)
//
// Auth : Vercel cron envoie automatiquement Authorization: Bearer
// CRON_SECRET (cf. https://vercel.com/docs/cron-jobs#securing-cron-jobs).
// Trigger manuel via : curl -H "Authorization: Bearer $CRON_SECRET" \
//                     https://volia.fr/api/cron/auto-content-proposer
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { runContentProposer } from '@/lib/content-proposer';
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
    const result = await runContentProposer();
    const httpStatus = result.ok ? 200 : 500;
    return NextResponse.json(result, { status: httpStatus });
  } catch (err) {
    console.error('[cron/auto-content-proposer] unhandled error', err);
    return NextResponse.json(
      { ok: false, error: 'unhandled', message: err.message || String(err) },
      { status: 500 }
    );
  }
}
