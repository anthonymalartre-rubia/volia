// ─────────────────────────────────────────────────────────────────────
// /api/admin/trigger-cron — Trigger manuel des crons autonomy
// ─────────────────────────────────────────────────────────────────────
//
// POST body : { cron: 'auto-content-proposer' | 'publish-approved-actions' }
//
// Permet à l'admin de déclencher manuellement les boucles auto-pilote
// depuis l'UI /admin/auto-queue sans avoir à connaître CRON_SECRET ni
// attendre le prochain tick scheduled.
//
// Sécurité : admin uniquement (is_admin = true). Ne bypasse PAS le
// kill switch global (AUTONOMOUS_MODE_ENABLED) — les fonctions lib
// font la vérif elles-mêmes.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { runContentProposer } from '@/lib/content-proposer';
import { runPublishApprovedActions } from '@/lib/publish-actions';
import { runSentryDigest } from '@/lib/sentry-digest';

const CRONS = {
  'auto-content-proposer': runContentProposer,
  'publish-approved-actions': runPublishApprovedActions,
  'sentry-digest': runSentryDigest,
};

async function requireAdmin() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { error: 'Unauthorized', status: 401 };
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) return { error: 'Forbidden — admin only', status: 403 };
  return { user };
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const { cron } = body;
  const handler = CRONS[cron];
  if (!handler) {
    return NextResponse.json(
      { error: `cron inconnu : "${cron}". Valeurs : ${Object.keys(CRONS).join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const result = await handler();
    return NextResponse.json({ success: true, cron, result });
  } catch (err) {
    console.error(`[admin/trigger-cron] ${cron} unhandled`, err);
    return NextResponse.json(
      { success: false, cron, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
