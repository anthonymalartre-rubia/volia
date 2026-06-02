// /api/cron/checkout-recovery — Wave 1.2 Growth Loops
// Schedule : "0 11 * * *" (daily 11h CET, après lead-scoring 6h)
import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runCheckoutRecovery } from '@/lib/checkout-recovery';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await runCheckoutRecovery();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
