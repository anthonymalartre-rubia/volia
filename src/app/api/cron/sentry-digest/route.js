// ─────────────────────────────────────────────────────────────────────
// /api/cron/sentry-digest — Sprint 3 Phase 1 : Sentry → GitHub issues
// ─────────────────────────────────────────────────────────────────────
// Schedule : "0 11 * * 1" (lundi 11h CET, après anomaly 8h + audit 9h)
//
// Lit top erreurs Sentry → Claude analyse + propose GitHub issues →
// queue approval → founder valide → publish-actions crée l'issue.
//
// Env vars : SENTRY_API_TOKEN + GITHUB_TOKEN (à ajouter sur Vercel)
// Cf. lib/sentry-api.js + lib/github-api.js pour scopes requis.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { cleanEnv } from '@/lib/envClean';
import { runSentryDigest } from '@/lib/sentry-digest';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min — Claude analysis × 5 issues peut être long

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runSentryDigest();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    console.error('[cron/sentry-digest] unhandled', err);
    return NextResponse.json(
      { ok: false, error: 'unhandled', message: err.message || String(err) },
      { status: 500 }
    );
  }
}
