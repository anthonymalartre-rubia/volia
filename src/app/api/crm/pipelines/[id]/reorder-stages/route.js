// PATCH /api/crm/pipelines/[id]/reorder-stages
// Body : { stage_ids: ["uuid1", "uuid2", ...] }
//
// Réordonne les stages du pipeline en assignant position = index.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkCrmAccess } from '@/lib/crm';

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'CRM réservé au plan Business 149€/mois' },
    { status: 403 }
  );
}

export async function PATCH(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return forbidden();

  const { id: pipelineId } = params;
  const body = await request.json().catch(() => ({}));
  const stageIds = Array.isArray(body.stage_ids) ? body.stage_ids : null;
  if (!stageIds || stageIds.length === 0) {
    return NextResponse.json(
      { success: false, error: 'stage_ids requis (array non vide)' },
      { status: 400 }
    );
  }

  // Vérifie que tous les stages appartiennent au pipeline
  const { data: existing, error: fetchErr } = await supabase
    .from('crm_stages')
    .select('id')
    .eq('pipeline_id', pipelineId);
  if (fetchErr) {
    console.error('[reorder-stages] fetch error', fetchErr);
    return NextResponse.json({ success: false, error: fetchErr.message }, { status: 500 });
  }
  const existingIds = new Set((existing || []).map((s) => s.id));
  for (const sid of stageIds) {
    if (!existingIds.has(sid)) {
      return NextResponse.json(
        { success: false, error: `Stage ${sid} n'appartient pas au pipeline` },
        { status: 400 }
      );
    }
  }

  // Update position pour chaque stage (en série pour éviter une transaction explicite)
  const now = new Date().toISOString();
  for (let i = 0; i < stageIds.length; i++) {
    const { error: upErr } = await supabase
      .from('crm_stages')
      .update({ position: i })
      .eq('id', stageIds[i])
      .eq('pipeline_id', pipelineId);
    if (upErr) {
      console.error('[reorder-stages] update error', upErr);
      return NextResponse.json({ success: false, error: upErr.message }, { status: 500 });
    }
  }

  // Touch pipeline updated_at
  await supabase
    .from('crm_pipelines')
    .update({ updated_at: now })
    .eq('id', pipelineId);

  return NextResponse.json({ success: true, data: { reordered: stageIds.length } });
}
