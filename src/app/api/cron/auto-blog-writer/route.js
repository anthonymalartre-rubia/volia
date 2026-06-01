// /api/cron/auto-blog-writer — Sprint Marketing Compound Phase 2
// Schedule : "0 8 * * 3" (mercredi 8h CET, après auto-changelog mardi 7h)
// Cf. lib/blog-writer.js pour la logique complète.

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runBlogWriter } from '@/lib/blog-writer';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Claude long-form peut prendre 60-90 sec

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBlogWriter();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    console.error('[cron/auto-blog-writer] unhandled', err);
    return NextResponse.json(
      { ok: false, error: 'unhandled', message: err.message || String(err) },
      { status: 500 }
    );
  }
}
