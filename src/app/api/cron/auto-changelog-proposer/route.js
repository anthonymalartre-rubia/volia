// ─────────────────────────────────────────────────────────────────────
// /api/cron/auto-changelog-proposer — Sprint Marketing Compound Phase 1
// ─────────────────────────────────────────────────────────────────────
// Schedule : "0 7 * * 2" (mardi 7h CET, avant tous les autres crons safety)
// Wrap lib/changelog-proposer.js — cf. doc dans la lib.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runChangelogProposer } from '@/lib/changelog-proposer';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runChangelogProposer();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    console.error('[cron/auto-changelog-proposer] unhandled', err);
    return NextResponse.json(
      { ok: false, error: 'unhandled', message: err.message || String(err) },
      { status: 500 }
    );
  }
}
