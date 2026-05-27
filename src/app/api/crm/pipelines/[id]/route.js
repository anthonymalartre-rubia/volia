// GET    /api/crm/pipelines/[id]  → détail pipeline + stages
// PATCH  /api/crm/pipelines/[id]  → update name/description/color/position
// DELETE /api/crm/pipelines/[id]  → delete (reassign deals vers le pipeline default)
//
// Toutes les routes : gating Business plan + RLS sur user_id.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkCrmAccess, getOrCreateDefaultPipeline, PIPELINE_COLORS } from '@/lib/crm';

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'CRM réservé au plan Business 149€/mois' },
    { status: 403 }
  );
}

function sanitizeColor(c) {
  if (typeof c !== 'string') return null;
  const v = c.trim().toLowerCase();
  return PIPELINE_COLORS.includes(v) ? v : null;
}

export async function GET(_request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return forbidden();

  const { id } = params;
  const { data, error } = await supabase
    .from('crm_pipelines')
    .select(
      'id, name, description, color, position, is_default, archived_at, created_at, updated_at, stages:crm_stages(*)'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[api/crm/pipelines/[id]] GET error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ success: false, error: 'Pipeline introuvable' }, { status: 404 });
  }

  if (Array.isArray(data.stages)) {
    data.stages.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  return NextResponse.json({ success: true, data });
}

export async function PATCH(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return forbidden();

  const { id } = params;
  const body = await request.json().catch(() => ({}));

  const patch = {};
  if (typeof body.name === 'string') {
    const v = body.name.trim();
    if (!v) {
      return NextResponse.json({ success: false, error: 'Le nom est requis' }, { status: 400 });
    }
    patch.name = v.slice(0, 120);
  }
  if ('description' in body) {
    patch.description = body.description ? String(body.description).trim().slice(0, 500) : null;
  }
  if ('color' in body) {
    const c = sanitizeColor(body.color);
    if (c) patch.color = c;
  }
  if (Number.isInteger(body.position)) patch.position = body.position;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ success: false, error: 'Aucune modification' }, { status: 400 });
  }

  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('crm_pipelines')
    .update(patch)
    .eq('id', id)
    .select(
      'id, name, description, color, position, is_default, archived_at, created_at, updated_at, stages:crm_stages(*)'
    )
    .single();

  if (error) {
    console.error('[api/crm/pipelines/[id]] PATCH error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  if (data && Array.isArray(data.stages)) {
    data.stages.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(_request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return forbidden();

  const { id } = params;

  // Verifier que le pipeline existe et qu'il n'est pas default
  const { data: pipeline, error: fetchErr } = await supabase
    .from('crm_pipelines')
    .select('id, is_default, user_id')
    .eq('id', id)
    .maybeSingle();
  if (fetchErr || !pipeline) {
    return NextResponse.json({ success: false, error: 'Pipeline introuvable' }, { status: 404 });
  }
  if (pipeline.is_default) {
    return NextResponse.json(
      { success: false, error: 'Impossible de supprimer le pipeline par défaut. Définissez d\'abord un autre pipeline par défaut.' },
      { status: 400 }
    );
  }

  // Compter les deals à réassigner
  const { count: dealsCount } = await supabase
    .from('crm_deals')
    .select('id', { count: 'exact', head: true })
    .eq('pipeline_id', id);

  if (dealsCount && dealsCount > 0) {
    // Récup ou crée le pipeline default + son premier stage
    let defaultPipeline;
    try {
      defaultPipeline = await getOrCreateDefaultPipeline(supabase, user.id);
    } catch (err) {
      console.error('[api/crm/pipelines/[id]] DELETE default pipeline error', err);
      return NextResponse.json(
        { success: false, error: 'Erreur récupération pipeline par défaut' },
        { status: 500 }
      );
    }
    const firstStage = (defaultPipeline.stages || []).sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    )[0];
    if (!firstStage) {
      return NextResponse.json(
        { success: false, error: 'Pipeline par défaut sans stage : impossible de réassigner les deals.' },
        { status: 500 }
      );
    }

    // Reassign tous les deals vers le pipeline default + son premier stage
    // Status = 'open' par défaut (on retire les éventuels closing du pipeline supprimé)
    const { error: reassignErr } = await supabase
      .from('crm_deals')
      .update({
        pipeline_id: defaultPipeline.id,
        stage_id: firstStage.id,
        status: 'open',
        closed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('pipeline_id', id);
    if (reassignErr) {
      console.error('[api/crm/pipelines/[id]] DELETE reassign error', reassignErr);
      return NextResponse.json(
        { success: false, error: `Erreur réassignation deals : ${reassignErr.message}` },
        { status: 500 }
      );
    }
  }

  // Delete stages d'abord (cascade ON DELETE absent → on supprime explicitement)
  await supabase.from('crm_stages').delete().eq('pipeline_id', id);

  // Delete pipeline
  const { error: delErr } = await supabase.from('crm_pipelines').delete().eq('id', id);
  if (delErr) {
    console.error('[api/crm/pipelines/[id]] DELETE error', delErr);
    return NextResponse.json({ success: false, error: delErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { id, reassigned_deals: dealsCount || 0 } });
}
