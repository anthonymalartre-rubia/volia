// ─────────────────────────────────────────────────────────────────────
// /api/admin/autonomy-toggle — Toggle kill switch DB (admin UI)
// ─────────────────────────────────────────────────────────────────────
//
// POST body : { enabled: boolean | null, reason?: string }
//   - enabled: true  → autonomy ON via DB
//   - enabled: false → autonomy OFF via DB (override ENV)
//   - enabled: null  → fallback sur ENV var
//
// Source : UI bouton dans /admin/auto-queue. Effet IMMÉDIAT (les crons
// suivants verront la nouvelle valeur). Pas besoin de redeploy Vercel.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { setAutonomyEnabled, isAutonomyEnabled } from '@/lib/autonomy';

async function requireAdmin() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { error: 'Unauthorized', status: 401 };
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin, full_name')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) return { error: 'Forbidden — admin only', status: 403 };
  return { user, profile };
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const { enabled, reason } = body;

  if (enabled !== true && enabled !== false && enabled !== null) {
    return NextResponse.json(
      { error: 'enabled doit être true | false | null' },
      { status: 400 }
    );
  }

  const updatedBy = auth.profile?.full_name
    ? `${auth.profile.full_name} (admin UI)`
    : `${auth.user.email} (admin UI)`;

  const defaultReason =
    enabled === false
      ? 'Désactivé manuellement depuis /admin/auto-queue'
      : enabled === true
      ? 'Réactivé manuellement depuis /admin/auto-queue'
      : 'Reset vers fallback ENV var';

  try {
    await setAutonomyEnabled(enabled, reason || defaultReason, updatedBy);
    const newState = await isAutonomyEnabled();
    return NextResponse.json({
      success: true,
      ...newState,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
