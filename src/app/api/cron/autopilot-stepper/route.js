// /api/cron/autopilot-stepper — hourly
// Avance les executions actives selon leur timing (J+3 email_2, J+7 email_3, etc.)

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runStepper } from '@/lib/autopilot/stepper';

export const dynamic = 'force-dynamic';
export const maxDuration = 600;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await runStepper();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
