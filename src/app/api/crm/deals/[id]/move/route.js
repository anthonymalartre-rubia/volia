// PATCH /api/crm/deals/[id]/move
// Body : { stage_id, position }
// Update stage_id + position. Si le nouveau stage a closing_type='won'|'lost',
// met status + closed_at en cohérence. Sinon repasse en 'open'.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkCrmAccess } from '@/lib/crm';
import { emitWebhookEvent } from '@/lib/webhooks/emitter';
import { createOnboardingTaskOnWon, createProjectOnWon } from '@/lib/crm-automations';

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'Limite de votre plan atteinte — passez à MAX pour l\'illimité' },
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

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const stageId = typeof body.stage_id === 'string' ? body.stage_id : '';
  if (!stageId) {
    return NextResponse.json(
      { success: false, error: 'stage_id est requis' },
      { status: 400 }
    );
  }
  const position = Number.isInteger(body.position) ? body.position : 0;

  // 1. Récup le deal pour vérifier pipeline cohérent + RLS
  const { data: deal, error: dealErr } = await supabase
    .from('crm_deals')
    .select('id, pipeline_id, status, stage_id, title, value_cents, currency, stage:crm_stages(id, name)')
    .eq('id', id)
    .maybeSingle();
  if (dealErr || !deal) {
    return NextResponse.json({ success: false, error: 'Deal introuvable' }, { status: 404 });
  }

  // 2. Récup le stage cible
  const { data: stage, error: stageErr } = await supabase
    .from('crm_stages')
    .select('id, pipeline_id, closing_type')
    .eq('id', stageId)
    .maybeSingle();
  if (stageErr || !stage) {
    return NextResponse.json({ success: false, error: 'Stage introuvable' }, { status: 404 });
  }
  if (stage.pipeline_id !== deal.pipeline_id) {
    return NextResponse.json(
      { success: false, error: 'Le stage doit appartenir au même pipeline que le deal' },
      { status: 400 }
    );
  }

  // 3. Détermine status + closed_at
  const updates = { stage_id: stageId, position };
  if (stage.closing_type === 'won') {
    updates.status = 'won';
    updates.closed_at = new Date().toISOString();
  } else if (stage.closing_type === 'lost') {
    updates.status = 'lost';
    updates.closed_at = new Date().toISOString();
  } else {
    updates.status = 'open';
    updates.closed_at = null;
  }

  const { data, error } = await supabase
    .from('crm_deals')
    .update(updates)
    .eq('id', id)
    .select(
      `id, title, value_cents, currency, status, closed_at, position,
       pipeline_id, stage_id, contact_id, metadata, updated_at,
       stage:crm_stages(id, name, color, probability, closing_type, position)`
    )
    .single();

  if (error) {
    console.error('[api/crm/deals/[id]/move] error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Renumérote le stage cible (positions 0..N propres, sans collision ni trou
  // après de nombreux déplacements). Best-effort : si ça échoue, le move reste
  // valide (l'ordre est départagé par id côté lecture). On relit ensuite la
  // position réelle de la carte déplacée pour que le client reste cohérent.
  try {
    await supabase.rpc('crm_reindex_stage', {
      p_pipeline_id: deal.pipeline_id,
      p_stage_id: stageId,
    });
    const { data: fresh } = await supabase
      .from('crm_deals')
      .select('position')
      .eq('id', id)
      .maybeSingle();
    if (fresh && Number.isInteger(fresh.position)) data.position = fresh.position;
  } catch (e) {
    console.warn('[api/crm/deals/[id]/move] reindex failed', e?.message);
  }

  // Automatisation P3-2 : deal qui devient "gagné" → tâche d'onboarding auto
  // (best-effort, idempotent, respecte les prefs user). N'échoue jamais le move.
  if (data.status === 'won' && deal.status !== 'won') {
    createOnboardingTaskOnWon(supabase, {
      id: data.id,
      user_id: user.id,
      title: data.title,
      contact_id: data.contact_id,
    }).catch(() => {});
    // Volia Project (opt-in won_project) : projet de livraison auto.
    createProjectOnWon(supabase, {
      id: data.id,
      user_id: user.id,
      title: data.title,
      contact_id: data.contact_id,
    }).catch(() => {});
  }

  // Fire-and-forget : emit stage_changed à chaque move + won/lost si transition
  // vers un closing stage (différent de l'état précédent du deal).
  if (deal.stage_id !== stageId) {
    emitWebhookEvent({
      userId: user.id,
      event: 'crm.deal.stage_changed',
      data: {
        deal_id: data.id,
        title: data.title,
        from_stage: deal.stage || { id: deal.stage_id, name: null },
        to_stage: data.stage || { id: data.stage_id, name: null },
      },
    }).catch(() => {});
  }
  if (data.status !== deal.status && (data.status === 'won' || data.status === 'lost')) {
    emitWebhookEvent({
      userId: user.id,
      event: data.status === 'won' ? 'crm.deal.won' : 'crm.deal.lost',
      data: {
        deal_id: data.id,
        title: data.title,
        value_cents: data.value_cents,
        currency: data.currency,
        closed_at: data.closed_at,
      },
    }).catch(() => {});
  }

  return NextResponse.json({ success: true, data });
}
