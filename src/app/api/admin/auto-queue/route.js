// ─────────────────────────────────────────────────────────────────────
// /api/admin/auto-queue — Admin actions sur la queue d'approbation
// ─────────────────────────────────────────────────────────────────────
// GET   → liste les actions pending (limit 50)
// POST  body: { actionId, decision: 'approve'|'reject', reason? }
//
// Authz : admin uniquement (is_admin = true sur user_profiles).
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  getApprovalQueue,
  approveAction,
  rejectAction,
  isAutonomyEnabled,
} from '@/lib/autonomy';

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

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const queue = await getApprovalQueue({ limit: 50 });
  return NextResponse.json({
    success: true,
    autonomy_enabled: isAutonomyEnabled(),
    queue,
    count: queue.length,
  });
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const { actionId, decision, reason } = body;

  if (!actionId || typeof actionId !== 'string') {
    return NextResponse.json({ error: 'actionId requis' }, { status: 400 });
  }
  if (!['approve', 'reject'].includes(decision)) {
    return NextResponse.json({ error: 'decision doit être "approve" ou "reject"' }, { status: 400 });
  }

  let result;
  if (decision === 'approve') {
    result = await approveAction(actionId, auth.user.id);
  } else {
    result = await rejectAction(actionId, auth.user.id, reason || null);
  }

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || 'Action introuvable ou déjà traitée' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, action: result.action });
}
