// ─────────────────────────────────────────────────────────────────────
// /api/autopilot/form-submit — Phase 2 webhook public
// ─────────────────────────────────────────────────────────────────────
// Le form public Autopilot (rendu à /forms/autopilot/[workflowId]?exec=X)
// POST ici quand un prospect le soumet.
//
// Body attendu :
//   {
//     workflow_id: uuid,
//     execution_id: uuid,
//     responses: { "Question label": "Answer", ... },
//     metadata: { user_agent?, referer? }
//   }
//
// Steps :
//   1. Validate workflow_id + execution_id (match en DB)
//   2. Calcule score via lib/autopilot/scoring.calculateScore()
//   3. Détermine tier (hot/warm/cold)
//   4. Update execution : form_submitted_at, form_response, computed_score,
//      current_step = 'form_pending' (stepper push le CRM dans son cycle)
//   5. (Hot only) : push CRM immédiatement + crée le crm_deal
//   6. Log autonomous_action pour audit
//
// Pas d'auth required (POST public depuis form public).
// Rate limit : 30 req/min/IP (anti-bot).
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { calculateScore, resolveRouting } from '@/lib/autopilot/scoring';
import { getTemplate } from '@/lib/autopilot/templates';
import { routeLeadToCrm } from '@/lib/autopilot/crm-bridge';
import { logAutonomousAction } from '@/lib/autonomy';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────────
// GET — config publique du formulaire (consommée par la page publique
// /forms/autopilot/[workflowId]?exec=X). Pas d'auth (public), mais on
// valide que l'execution appartient bien au workflow.
// ─────────────────────────────────────────────────────────────────────
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get('workflow_id');
  const executionId = searchParams.get('exec');
  if (!workflowId) {
    return NextResponse.json({ error: 'missing_workflow_id' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: workflow } = await supabase
    .from('autopilot_workflows')
    .select('id, template_id, name, config')
    .eq('id', workflowId)
    .maybeSingle();
  if (!workflow) {
    return NextResponse.json({ error: 'workflow_not_found' }, { status: 404 });
  }
  const template = getTemplate(workflow.template_id);
  if (!template?.form) {
    return NextResponse.json({ error: 'no_form_for_template' }, { status: 404 });
  }

  // Override form depuis config si l'user a customisé
  const form = workflow.config?.form_override || template.form;

  // Si exec fourni, indique si déjà soumis (pour afficher merci)
  let alreadySubmitted = false;
  if (executionId) {
    const { data: exec } = await supabase
      .from('autopilot_executions')
      .select('id, form_submitted_at')
      .eq('id', executionId)
      .eq('workflow_id', workflowId)
      .maybeSingle();
    if (!exec) {
      return NextResponse.json({ error: 'execution_not_found' }, { status: 404 });
    }
    alreadySubmitted = !!exec.form_submitted_at;
  }

  return NextResponse.json({
    ok: true,
    title: form.title || 'Quelques questions rapides',
    questions: form.questions || [],
    already_submitted: alreadySubmitted,
  });
}

// Rate limit in-memory (production : Upstash si scaling)
const rateLimitStore = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const maxReq = 30;
  const arr = (rateLimitStore.get(ip) || []).filter((t) => now - t < windowMs);
  if (arr.length >= maxReq) return false;
  arr.push(now);
  rateLimitStore.set(ip, arr);
  return true;
}

export async function POST(request) {
  // Rate limit
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'rate_limit_exceeded' }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { workflow_id, execution_id, responses } = body;
  if (!workflow_id || !execution_id || !responses || typeof responses !== 'object') {
    return NextResponse.json({ error: 'missing_required_fields' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // 1. Load execution
  const { data: execution, error: execErr } = await supabase
    .from('autopilot_executions')
    .select('*')
    .eq('id', execution_id)
    .eq('workflow_id', workflow_id)
    .maybeSingle();
  if (execErr || !execution) {
    return NextResponse.json({ error: 'execution_not_found' }, { status: 404 });
  }

  // Idempotency : si déjà submitted, retourne current state
  if (execution.form_submitted_at) {
    return NextResponse.json({
      ok: true,
      already_submitted: true,
      score: execution.computed_score,
      tier: execution.computed_score >= 70 ? 'hot' : execution.computed_score >= 40 ? 'warm' : 'cold',
    });
  }

  // 2. Load workflow + template
  const { data: workflow } = await supabase
    .from('autopilot_workflows')
    .select('*')
    .eq('id', workflow_id)
    .maybeSingle();
  if (!workflow) {
    return NextResponse.json({ error: 'workflow_not_found' }, { status: 404 });
  }
  const template = getTemplate(workflow.template_id);
  if (!template) {
    return NextResponse.json({ error: 'template_not_found' }, { status: 500 });
  }

  // 3. Compute score
  const { score, tier, breakdown } = calculateScore(responses, template);

  // 4. Resolve routing (branching custom Business+ ou default)
  const routing = resolveRouting(tier, workflow.config, template);

  const nowIso = new Date().toISOString();
  const updates = {
    form_submitted_at: nowIso,
    form_response: { responses, breakdown, metadata: body.metadata || {} },
    computed_score: score,
    current_step: 'form_pending',
    step_history: [
      ...(Array.isArray(execution.step_history) ? execution.step_history : []),
      {
        step: 'form_submitted',
        at: nowIso,
        score,
        tier,
        routing_source: routing.source,
      },
    ],
    updated_at: nowIso,
  };

  // 5. Hot tier → push CRM immédiatement via bridge helper
  // Warm/Cold → différé au stepper (qui pousse en batch hourly)
  let crmDealId = null;
  if (tier === 'hot') {
    const { data: prospect } = await supabase
      .from('prospects')
      .select('id, nom, email, telephone, departement, first_name')
      .eq('id', execution.prospect_id)
      .maybeSingle();

    if (prospect) {
      const bridgeResult = await routeLeadToCrm(supabase, {
        userId: workflow.user_id,
        prospect,
        workflow,
        execution,
        score,
        tier,
        routing,
        formResponse: { responses, breakdown },
      });
      // Succès = deal Volia créé OU lead livré au CRM externe (webhook)
      if (bridgeResult.deal_id || bridgeResult.delivered) {
        crmDealId = bridgeResult.deal_id || null;
        updates.crm_deal_id = bridgeResult.deal_id || null;
        updates.crm_pushed_at = nowIso;
        updates.current_step = 'crm_pushed';
        updates.step_history.push({
          step: 'crm_pushed',
          at: nowIso,
          destination: bridgeResult.destination || 'volia',
          deal_id: bridgeResult.deal_id || null,
          contact_id: bridgeResult.contact_id || null,
          stage_id: bridgeResult.stage_id || null,
          source: 'webhook_hot_path',
        });
      } else if (bridgeResult.error) {
        // Log error mais on continue (l'execution est form_pending,
        // le stepper retentera plus tard)
        console.warn('[autopilot/form-submit] CRM push failed', bridgeResult.error);
        updates.step_history.push({
          step: 'crm_push_deferred',
          at: nowIso,
          error: bridgeResult.error,
        });
      }
    }
  }

  // 6. Save
  const { error: updateErr } = await supabase
    .from('autopilot_executions')
    .update(updates)
    .eq('id', execution_id);

  if (updateErr) {
    return NextResponse.json({ error: 'update_failed', detail: updateErr.message }, { status: 500 });
  }

  // 7. Audit log
  await logAutonomousAction({
    actionType: 'autopilot_form_submitted',
    source: 'api/autopilot/form-submit',
    riskLevel: tier === 'hot' ? 'medium' : 'low',
    payload: {
      workflow_id,
      execution_id,
      score,
      tier,
      crm_deal_id: crmDealId,
    },
    preview: `📋 Form Autopilot soumis · score ${score} · tier ${tier}${crmDealId ? ` · CRM deal créé` : ''}`,
    rationale: `Form qualif rempli — routing ${routing.source}`,
    autoExecute: true,
  });

  return NextResponse.json({
    ok: true,
    score,
    tier,
    routing: { source: routing.source, crm_stage: routing.crm_stage },
    crm_deal_id: crmDealId,
    next_step: updates.current_step,
  });
}
