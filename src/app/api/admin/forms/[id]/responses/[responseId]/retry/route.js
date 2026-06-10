// ─────────────────────────────────────────────────────────────────
// POST /api/app/formulaires/[id]/responses/[responseId]/retry (Sprint F7)
// ─────────────────────────────────────────────────────────────────
// Re-trigger manuel des bridges pour 1 réponse :
//   - bridge_status         = 'failed'
//   - bridge_retry_count    = 0
//   - bridge_next_retry_at  = NOW()
//
// Le cron F6 (/api/cron/retry-form-bridges) va voir la réponse au
// prochain tick et retenter les bridges. C'est volontairement non-bloquant
// (on ne ré-exécute pas les bridges synchrone dans cette route).
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

export async function POST(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return unauthorized();
  const { id, responseId } = await params;

  // Ownership check
  const { data: form } = await supabase
    .from('forms')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!form) {
    return NextResponse.json({ success: false, error: 'Formulaire introuvable' }, { status: 404 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from('form_responses')
    .update({
      bridge_status: 'failed',
      bridge_retry_count: 0,
      bridge_next_retry_at: new Date().toISOString(),
      bridge_error: null,
    })
    .eq('id', responseId)
    .eq('form_id', id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Les bridges seront retentés au prochain passage du cron (~1 min).',
  });
}
