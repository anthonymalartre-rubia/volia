// /api/cron/meta-autonomy-rollup — daily 2h CET
// Agrège autonomous_actions de la veille dans autonomy_metrics_daily.

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { rollupAutonomyMetrics } from '@/lib/meta-autonomy';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await rollupAutonomyMetrics();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
