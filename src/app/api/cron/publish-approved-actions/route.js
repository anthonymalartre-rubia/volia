// ─────────────────────────────────────────────────────────────────────
// /api/cron/publish-approved-actions — Publication auto (Sprint 1 B.2)
// ─────────────────────────────────────────────────────────────────────
// Schedule : */15 * * * * (cf. vercel.json)
// Logique extraite dans src/lib/publish-actions.js pour pouvoir être
// re-appelée depuis /api/admin/trigger-cron (admin-only, sans CRON_SECRET).
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runPublishApprovedActions } from '@/lib/publish-actions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runPublishApprovedActions();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    console.error('[cron/publish-approved-actions] unhandled', err);
    return NextResponse.json(
      { ok: false, error: 'unhandled', message: err.message || String(err) },
      { status: 500 }
    );
  }
}
