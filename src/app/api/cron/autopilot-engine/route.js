// /api/cron/autopilot-engine — */15 min
// Scan workflows Autopilot actifs dont next_run_at <= NOW → run.

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runEngine } from '@/lib/autopilot/engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await runEngine();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
