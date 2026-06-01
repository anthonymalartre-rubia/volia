// /api/cron/trial-relance — Sprint Revenue Engine Phase 2
// Schedule : "0 9 * * *" (tous les jours 9h CET, après lead-scoring 6h)

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runTrialRelance } from '@/lib/trial-relance';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runTrialRelance();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    console.error('[cron/trial-relance] unhandled', err);
    return NextResponse.json(
      { ok: false, error: 'unhandled', message: err.message || String(err) },
      { status: 500 }
    );
  }
}
