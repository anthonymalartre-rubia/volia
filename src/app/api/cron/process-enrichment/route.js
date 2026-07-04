// /api/cron/process-enrichment — traite la file d'enrichissement en arrière-plan.
// Schedule : "*/5 * * * *" (cf. vercel.json). Traite les jobs actifs par lots,
// dans un budget temps de 4 min, en respectant le quota mensuel par user.
import { NextResponse } from 'next/server';
import { runEnrichmentBatch } from '@/lib/enrichment-jobs';
import { cleanEnv } from '@/lib/envClean';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (!expected || provided !== `Bearer ${expected}`) { // WS7 : fail-closed — refuse si CRON_SECRET absent
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await runEnrichmentBatch();
    // ok:false = échec du select des jobs actifs → 500 (sinon le cron reste
    // vert alors que la file est morte, cf. incident job bloqué 46h).
    return NextResponse.json(result, { status: result?.ok === false ? 500 : 200 });
  } catch (err) {
    console.error('[cron/process-enrichment] unhandled', err);
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
