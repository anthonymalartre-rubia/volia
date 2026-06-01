// /api/cron/newsletter-proposer — Sprint Marketing Compound Phase 3
// Schedule : "0 9 25 * *" (le 25 du mois 9h CET — 5 jours pour que le founder valide avant le 1er)
// Cf. lib/newsletter-generator.js pour la logique complète.

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runNewsletterProposer } from '@/lib/newsletter-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runNewsletterProposer();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    console.error('[cron/newsletter-proposer] unhandled', err);
    return NextResponse.json(
      { ok: false, error: 'unhandled', message: err.message || String(err) },
      { status: 500 }
    );
  }
}
