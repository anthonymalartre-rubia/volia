// /api/cron/auto-fix-bugs — Sprint Self-Healing Phase 4 (Volia se code lui-même)
// Schedule : "0 11 * * 5" (vendredi 11h CET — 4 jours après sentry-digest lundi 11h)
// Cf. lib/auto-fix-bugs.js pour la logique complète.

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runAutoFixBugs } from '@/lib/auto-fix-bugs';

export const dynamic = 'force-dynamic';
export const maxDuration = 600; // 10 min — Claude long-form sur code source

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runAutoFixBugs();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    console.error('[cron/auto-fix-bugs] unhandled', err);
    return NextResponse.json(
      { ok: false, error: 'unhandled', message: err.message || String(err) },
      { status: 500 }
    );
  }
}
