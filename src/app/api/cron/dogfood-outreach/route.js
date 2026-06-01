// /api/cron/dogfood-outreach — Sprint Revenue Engine Phase 3
// Schedule : "0 14 * * 1" (lundi 14h CET — après sentry-digest 11h)
// "Volia utilise Volia pour vendre Volia"

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runDogfoodOutreach } from '@/lib/dogfood-outreach';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runDogfoodOutreach();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    console.error('[cron/dogfood-outreach] unhandled', err);
    return NextResponse.json(
      { ok: false, error: 'unhandled', message: err.message || String(err) },
      { status: 500 }
    );
  }
}
