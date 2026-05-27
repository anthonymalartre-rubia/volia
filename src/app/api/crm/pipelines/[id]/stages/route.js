// POST /api/crm/pipelines/[id]/stages → ajoute un stage au pipeline
//
// Body : { name, color?, probability?, closing_type?, position? }

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
  if (typeof c !== 'string') return 'zinc';
  const v = c.trim().toLowerCase();
  return PIPELINE_COLORS.includes(v) ? v : 'zinc';
}

function sanitizeClosingType(c) {
  if (typeof c !== 'string') return null;
  const v = c.trim().toLowerCase();
  if (v === 'none' || v === '') return null;
  return CLOSING_TYPES.includes(v) ? v : null;
}

export async function POST(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return forbidden();

  const { id: pipelineId } = params;

  // Vérifie que le pipeline appartient à l'user (RLS le fait aussi mais on veut un 404 explicite)
  const { data: pipeline, error: pipelineErr } = await supabase
    .from('crm_pipelines')
    .select('id, user_id')
    .eq('id', pipelineId)
    .maybeSingle();
  if (pipelineErr || !pipeline) {
    return NextResponse.json({ success: false, error: 'Pipeline introuvable' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return NextResponse.json({ success: false, error: 'Le nom est requis' }, { status: 400 });
  }

  // Calcul position : si non fourni, on prend le max + 1
  let position;
  if (Number.isInteger(body.position)) {
    position = body.position;
  } else {
    const { data: maxRow } = await supabase
      .from('crm_stages')
      .select('position')
      .eq('pipeline_id', pipelineId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();
    position = (maxRow?.position ?? -1) + 1;
  }

  const probability = Number.isInteger(body.probability)
    ? Math.max(0, Math.min(100, body.probability))
    : 0;

  const { data, error } = await supabase
    .from('crm_stages')
    .insert({
      pipeline_id: pipelineId,
      name: name.slice(0, 80),
      color: sanitizeColor(body.color),
      probability,
      position,
      closing_type: sanitizeClosingType(body.closing_type),
    })
    .select()
    .single();

  if (error) {
    console.error('[api/crm/pipelines/[id]/stages] POST error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
