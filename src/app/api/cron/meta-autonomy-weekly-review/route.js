// /api/cron/meta-autonomy-weekly-review — mardi 10h CET
// Email digest hebdomadaire founder + Claude recommendations.

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runWeeklyAutonomyReview } from '@/lib/meta-autonomy';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await runWeeklyAutonomyReview();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
