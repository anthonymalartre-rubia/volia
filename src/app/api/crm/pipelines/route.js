// GET  /api/crm/pipelines        → liste des pipelines du user (avec stages joined).
//                                  Si aucun, crée le pipeline par défaut.
// POST /api/crm/pipelines        → crée un pipeline custom + ses stages (transaction
//                                  best-effort : si l'insert des stages échoue, on
//                                  rollback le pipeline).
//
// Toutes les routes : gating Business plan + auth + RLS.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkCrmAccess, getOrCreateDefaultPipeline, PIPELINE_COLORS, CLOSING_TYPES } from '@/lib/crm';

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'CRM réservé au plan Business 149€/mois' },
    { status: 403 }
  );
}

function sanitizeColor(c) {
  if (typeof c !== 'string') return 'violet';
  const v = c.trim().toLowerCase();
  return PIPELINE_COLORS.includes(v) ? v : 'violet';
}

function sanitizeClosingType(c) {
  if (typeof c !== 'string') return null;
  const v = c.trim().toLowerCase();
  if (v === 'none' || v === '') return null;
  return CLOSING_TYPES.includes(v) ? v : null;
}

export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return forbidden();

  // Récup tous les pipelines + stages embarqués (exclut les archivés)
  const { data: pipelines, error } = await supabase
    .from('crm_pipelines')
    .select(
      'id, name, description, color, position, is_default, archived_at, created_at, updated_at, stages:crm_stages(*)'
    )
    .is('archived_at', null)
    .order('position', { ascending: true });

  if (error) {
    console.error('[api/crm/pipelines] GET error', error);
    return NextResponse.json({ success: false, error: 'Erreur lecture' }, { status: 500 });
  }

  // Si aucun pipeline, on crée le default
  if (!pipelines || pipelines.length === 0) {
    try {
      const created = await getOrCreateDefaultPipeline(supabase, user.id);
      return NextResponse.json({ success: true, data: [created] });
    } catch (err) {
      console.error('[api/crm/pipelines] default pipeline error', err);
      return NextResponse.json(
        { success: false, error: err.message || 'Erreur création pipeline' },
        { status: 500 }
      );
    }
  }

  // Tri des stages par position au sein de chaque pipeline (Supabase ne le fait pas en embed)
  pipelines.forEach((p) => {
    if (Array.isArray(p.stages)) {
      p.stages.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }
  });

  return NextResponse.json({ success: true, data: pipelines });
}

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return forbidden();

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return NextResponse.json(
      { success: false, error: 'Le nom du pipeline est requis' },
      { status: 400 }
    );
  }
  const color = sanitizeColor(body.color);
  const description = typeof body.description === 'string' ? body.description.trim().slice(0, 500) : null;

  // Compte les pipelines existants pour calculer la position
  const { count } = await supabase
    .from('crm_pipelines')
    .select('id', { count: 'exact', head: true })
    .is('archived_at', null);
  const position = Number.isInteger(body.position) ? body.position : (count || 0);

  // Sanitize stages array (optionnel — si fourni, on insère)
  const stagesInput = Array.isArray(body.stages) ? body.stages : [];

  const { data: pipeline, error: pipelineErr } = await supabase
    .from('crm_pipelines')
    .insert({
      user_id: user.id,
      name: name.slice(0, 120),
      description,
      color,
      position,
      is_default: false,
    })
    .select()
    .single();

  if (pipelineErr) {
    console.error('[api/crm/pipelines] POST error', pipelineErr);
    return NextResponse.json({ success: false, error: pipelineErr.message }, { status: 500 });
  }

  // Insert stages si fournis (sinon 1 stage placeholder)
  const stagesToInsert =
    stagesInput.length > 0
      ? stagesInput.map((s, i) => ({
          pipeline_id: pipeline.id,
          name: typeof s.name === 'string' ? s.name.trim().slice(0, 80) || `Stage ${i + 1}` : `Stage ${i + 1}`,
          color: sanitizeColor(s.color),
          probability: Number.isInteger(s.probability) ? Math.max(0, Math.min(100, s.probability)) : 0,
          position: Number.isInteger(s.position) ? s.position : i,
          closing_type: sanitizeClosingType(s.closing_type),
        }))
      : [
          { pipeline_id: pipeline.id, name: 'À faire', color: 'zinc', probability: 10, position: 0, closing_type: null },
          { pipeline_id: pipeline.id, name: 'En cours', color: 'blue', probability: 50, position: 1, closing_type: null },
          { pipeline_id: pipeline.id, name: 'Terminé', color: 'emerald', probability: 100, position: 2, closing_type: 'won' },
        ];

  const { error: stagesErr } = await supabase.from('crm_stages').insert(stagesToInsert);
  if (stagesErr) {
    // Rollback : delete the pipeline si stages insert failed
    await supabase.from('crm_pipelines').delete().eq('id', pipeline.id);
    console.error('[api/crm/pipelines] stages insert error', stagesErr);
    return NextResponse.json(
      { success: false, error: `Erreur création stages : ${stagesErr.message}` },
      { status: 500 }
    );
  }

  // Re-fetch avec stages embarqués
  const { data: full } = await supabase
    .from('crm_pipelines')
    .select(
      'id, name, description, color, position, is_default, archived_at, created_at, updated_at, stages:crm_stages(*)'
    )
    .eq('id', pipeline.id)
    .single();

  if (full && Array.isArray(full.stages)) {
    full.stages.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  return NextResponse.json({ success: true, data: full || pipeline }, { status: 201 });
}
