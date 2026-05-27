// POST /api/crm/pipelines/[id]/set-default
// Définit ce pipeline comme default (et retire le flag des autres).

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkCrmAccess } from '@/lib/crm';

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'CRM réservé au plan Business 149€/mois' },
    { status: 403 }
  );
}

export async function POST(_request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return forbidden();

  const { id } = params;

  // Vérifie que le pipeline existe et appartient à l'user
  const { data: pipeline, error: fetchErr } = await supabase
    .from('crm_pipelines')
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle();
  if (fetchErr || !pipeline) {
    return NextResponse.json({ success: false, error: 'Pipeline introuvable' }, { status: 404 });
  }

  // 1. Retire le default de tous les pipelines de cet user
  const { error: clearErr } = await supabase
    .from('crm_pipelines')
    .update({ is_default: false, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_default', true);
  if (clearErr) {
    console.error('[set-default] clear error', clearErr);
    return NextResponse.json({ success: false, error: clearErr.message }, { status: 500 });
  }

  // 2. Set le default sur le pipeline cible
  const { data, error: setErr } = await supabase
    .from('crm_pipelines')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(
      'id, name, description, color, position, is_default, archived_at, created_at, updated_at'
    )
    .single();
  if (setErr) {
    console.error('[set-default] set error', setErr);
    return NextResponse.json({ success: false, error: setErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
