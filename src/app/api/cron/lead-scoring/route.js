// /api/cron/lead-scoring — Sprint Revenue Engine Phase 1
// Schedule : "0 6 * * *" (tous les jours 6h CET, avant trial-relance 9h)

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { rebuildAllLeadScores } from '@/lib/lead-scoring';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min — process plusieurs centaines de users

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await rebuildAllLeadScores();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    console.error('[cron/lead-scoring] unhandled', err);
    return NextResponse.json(
      { ok: false, error: 'unhandled', message: err.message || String(err) },
      { status: 500 }
    );
  }
}
