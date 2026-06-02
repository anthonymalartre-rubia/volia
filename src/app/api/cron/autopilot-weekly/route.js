// /api/cron/autopilot-weekly — Phase 3 cron entrypoint
// Dimanche 02:00 — runWeeklyOptimizer() analyse les workflows + A/B winners

import { NextResponse } from 'next/server';
import { runWeeklyOptimizer } from '@/lib/autopilot/optimizer';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request) {
  // Auth simple via CRON_SECRET (Vercel cron)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await runWeeklyOptimizer();
    return NextResponse.json(result);
  } catch (err) {
    console.error('[cron/autopilot-weekly] error', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
