// /api/cron/reactivation-churners — Sprint Marketing Compound Phase 4
// Schedule : "0 10 * * *" (tous les jours 10h CET)
// Cf. lib/reactivation.js pour la logique complète.

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runReactivationChurners } from '@/lib/reactivation';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runReactivationChurners();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    console.error('[cron/reactivation-churners] unhandled', err);
    return NextResponse.json(
      { ok: false, error: 'unhandled', message: err.message || String(err) },
      { status: 500 }
    );
  }
}
