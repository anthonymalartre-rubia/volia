// /api/cron/usage-decline-detector — Wave 1.3 Growth Loops
// Schedule : "0 9 * * 1" (lundi 9h CET, weekly)
import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runUsageDeclineDetector } from '@/lib/usage-decline-detector';

export const dynamic = 'force-dynamic';
export const maxDuration = 180;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await runUsageDeclineDetector();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
