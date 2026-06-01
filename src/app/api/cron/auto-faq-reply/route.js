// /api/cron/auto-faq-reply — daily 12h CET
// Pour chaque inbound_feedback 'question' high-confidence, envoie une réponse auto.

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runAutoFaqReply } from '@/lib/auto-faq-reply';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await runAutoFaqReply();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
