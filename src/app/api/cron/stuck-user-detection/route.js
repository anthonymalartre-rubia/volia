// /api/cron/stuck-user-detection — Wave 1.1 Growth Loops
// Schedule : "0 18 * * *" (daily 18h CET)
import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runStuckUserDetector } from '@/lib/stuck-user-detector';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await runStuckUserDetector();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
