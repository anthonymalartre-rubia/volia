// PATCH  /api/crm/stages/[id] → update name/color/probability/closing_type
// DELETE /api/crm/stages/[id] → delete (avec re-assign des deals vers premier stage du pipeline)

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkCrmAccess, PIPELINE_COLORS, CLOSING_TYPES } from '@/lib/crm';

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

function sanitizeClosingType(c) {
  if (typeof c !== 'string') return undefined; // undefined = pas de changement
  const v = c.trim().toLowerCase();
  if (v === 'none' || v === '') return null;
  if (CLOSING_TYPES.includes(v)) return v;
  return undefined;
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
    patch.name = v.slice(0, 80);
  }
  if ('color' in body) {
    const c = sanitizeColor(body.color);
    if (c) patch.color = c;
  }
  if (Number.isInteger(body.probability)) {
    patch.probability = Math.max(0, Math.min(100, body.probability));
  }
  if ('closing_type' in body) {
    const ct = sanitizeClosingType(body.closing_type);
    if (ct !== undefined) patch.closing_type = ct;
  }
  if (Number.isInteger(body.position)) patch.position = body.position;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ success: false, error: 'Aucune modification' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('crm_stages')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[api/crm/stages/[id]] PATCH error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Si on a changé le closing_type, on synchronise le status des deals associés
  if ('closing_type' in patch && data) {
    let newStatus = 'open';
    let closedAt = null;
    if (patch.closing_type === 'won') {
      newStatus = 'won';
      closedAt = new Date().toISOString();
    } else if (patch.closing_type === 'lost') {
      newStatus = 'lost';
      closedAt = new Date().toISOString();
    }
    await supabase
      .from('crm_deals')
      .update({ status: newStatus, closed_at: closedAt })
      .eq('stage_id', id);
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

  // Recup le stage pour connaître son pipeline_id
  const { data: stage, error: fetchErr } = await supabase
    .from('crm_stages')
    .select('id, pipeline_id, position')
    .eq('id', id)
    .maybeSingle();
  if (fetchErr || !stage) {
    return NextResponse.json({ success: false, error: 'Stage introuvable' }, { status: 404 });
  }

  // Compte les stages du pipeline : on refuse la suppression si c'est le dernier
  const { data: siblings, error: sibErr } = await supabase
    .from('crm_stages')
    .select('id, position, closing_type')
    .eq('pipeline_id', stage.pipeline_id)
    .order('position', { ascending: true });
  if (sibErr) {
    console.error('[api/crm/stages/[id]] DELETE siblings error', sibErr);
    return NextResponse.json({ success: false, error: sibErr.message }, { status: 500 });
  }
  if (!siblings || siblings.length <= 1) {
    return NextResponse.json(
      { success: false, error: 'Impossible de supprimer le dernier stage du pipeline.' },
      { status: 400 }
    );
  }

  // Trouve le premier stage restant (à utiliser pour réassigner les deals)
  const fallbackStage = siblings.find((s) => s.id !== id);
  if (!fallbackStage) {
    return NextResponse.json(
      { success: false, error: 'Aucun stage de remplacement disponible' },
      { status: 500 }
    );
  }

  // Reassign les deals du stage supprimé vers le fallback
  // Status : si fallback a un closing_type on aligne, sinon open
  let newStatus = 'open';
  let closedAt = null;
  if (fallbackStage.closing_type === 'won') {
    newStatus = 'won';
    closedAt = new Date().toISOString();
  } else if (fallbackStage.closing_type === 'lost') {
    newStatus = 'lost';
    closedAt = new Date().toISOString();
  }

  const { error: reassignErr } = await supabase
    .from('crm_deals')
    .update({
      stage_id: fallbackStage.id,
      status: newStatus,
      closed_at: closedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('stage_id', id);
  if (reassignErr) {
    console.error('[api/crm/stages/[id]] DELETE reassign error', reassignErr);
    return NextResponse.json(
      { success: false, error: `Erreur réassignation deals : ${reassignErr.message}` },
      { status: 500 }
    );
  }

  // Delete le stage
  const { error: delErr } = await supabase.from('crm_stages').delete().eq('id', id);
  if (delErr) {
    console.error('[api/crm/stages/[id]] DELETE error', delErr);
    return NextResponse.json({ success: false, error: delErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { id, fallback_stage_id: fallbackStage.id } });
}
