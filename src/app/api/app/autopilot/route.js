// /api/app/autopilot — CRUD workflows + trigger run manuel
//
// GET ?id=X         → 1 workflow + metrics
// GET (no id)       → liste workflows du user + counts global
// POST              → { action: 'create' | 'update' | 'delete' | 'pause' | 'resume' | 'run_now', ...payload }

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getPlanAutopilotLimits } from '@/lib/plans';
import { getTemplate, AUTOPILOT_TEMPLATES, getTemplatesByTier } from '@/lib/autopilot/templates';
import { runWorkflowRun } from '@/lib/autopilot/engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function getUserPlan(supabase, userId) {
  const { data } = await supabase
    .from('user_profiles')
    .select('plan')
    .eq('id', userId)
    .maybeSingle();
  return data?.plan || 'free';
}

async function fetchWorkflowMetrics(supabase, workflowId) {
  // Funnel : count par current_step
  const { data: execs } = await supabase
    .from('autopilot_executions')
    .select('current_step, form_submitted_at, crm_pushed_at, exit_reason, email_1_sent_at, computed_score')
    .eq('workflow_id', workflowId);
  const total = execs?.length || 0;
  const emailed = execs?.filter((e) => e.email_1_sent_at).length || 0;
  const formed = execs?.filter((e) => e.form_submitted_at).length || 0;
  // crm_total = tous les push (hot+warm+cold) ; crm_hot = uniquement score >= 70
  const crmTotal = execs?.filter((e) => e.crm_pushed_at).length || 0;
  const crmHot = execs?.filter((e) => e.crm_pushed_at && (e.computed_score ?? 0) >= 70).length || 0;
  const exited = execs?.filter((e) => e.exit_reason).length || 0;
  return {
    total_enrolled: total,
    emailed,
    form_submitted: formed,
    crm_hot: crmHot,
    crm_total: crmTotal,
    exited,
  };
}

export async function GET(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const { data: workflow, error } = await supabase
      .from('autopilot_workflows')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (error || !workflow) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const metrics = await fetchWorkflowMetrics(supabase, id);
    const { data: recentRuns } = await supabase
      .from('autopilot_runs')
      .select('*')
      .eq('workflow_id', id)
      .order('started_at', { ascending: false })
      .limit(5);

    return NextResponse.json({ ok: true, workflow, metrics, recent_runs: recentRuns || [] });
  }

  // List
  const { data: workflows, error } = await supabase
    .from('autopilot_workflows')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const plan = await getUserPlan(supabase, user.id);
  const limits = getPlanAutopilotLimits(plan);
  const available_templates = getTemplatesByTier(plan).map((t) => ({
    id: t.id,
    name: t.name,
    tagline: t.tagline,
    segment: t.segment,
    icon: t.icon,
    color: t.color,
    tier: t.tier,
    complexity: t.complexity,
    expected: t.expected,
  }));

  return NextResponse.json({
    ok: true,
    workflows: workflows || [],
    user_plan: plan,
    plan_limits: limits,
    available_templates,
    can_create_more: limits.workflows === -1 || (workflows?.length || 0) < limits.workflows,
  });
}

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { action, ...payload } = body;
  const supaAdmin = getSupabaseAdmin();
  const plan = await getUserPlan(supabase, user.id);
  const limits = getPlanAutopilotLimits(plan);

  // ─── CREATE ───────────────────────────────────────────────────
  if (action === 'create') {
    if (limits.workflows === 0) {
      return NextResponse.json({
        error: 'plan_does_not_allow_autopilot',
        message: 'Ton plan actuel n\'inclut pas Volia Autopilot. Passe en Pro 49€ pour 1 workflow.',
        upgrade_url: '/pricing',
      }, { status: 403 });
    }
    // Check quota workflows
    if (limits.workflows !== -1) {
      const { count } = await supaAdmin
        .from('autopilot_workflows')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (count !== null && count >= limits.workflows) {
        return NextResponse.json({
          error: 'workflow_limit_reached',
          message: `Ton plan ${plan} limite à ${limits.workflows} workflow(s). Passe en Business pour 3 workflows ou Enterprise pour illimité.`,
          upgrade_url: '/pricing',
        }, { status: 403 });
      }
    }

    const template = getTemplate(payload.template_id);
    if (!template) return NextResponse.json({ error: 'invalid_template_id' }, { status: 400 });

    const { data: created, error } = await supaAdmin
      .from('autopilot_workflows')
      .insert({
        user_id: user.id,
        template_id: payload.template_id,
        name: payload.name || `${template.name} — ${new Date().toLocaleDateString('fr-FR')}`,
        status: 'draft',
        config: payload.config || {},
        prospects_per_run: payload.prospects_per_run || 50,
        run_frequency: payload.run_frequency || 'weekly',
      })
      .select()
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, workflow: created });
  }

  if (!payload.id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });

  // Vérifie ownership
  const { data: existing } = await supaAdmin
    .from('autopilot_workflows')
    .select('id, user_id, status, template_id')
    .eq('id', payload.id)
    .maybeSingle();
  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: 'forbidden_or_not_found' }, { status: 403 });
  }

  // ─── UPDATE ───────────────────────────────────────────────────
  if (action === 'update') {
    const updates = { updated_at: new Date().toISOString() };
    ['name', 'config', 'prospects_per_run', 'run_frequency'].forEach((k) => {
      if (payload[k] !== undefined) updates[k] = payload[k];
    });
    await supaAdmin.from('autopilot_workflows').update(updates).eq('id', payload.id);
    return NextResponse.json({ ok: true });
  }

  // ─── PAUSE / RESUME ───────────────────────────────────────────
  if (action === 'pause') {
    await supaAdmin
      .from('autopilot_workflows')
      .update({ status: 'paused', updated_at: new Date().toISOString() })
      .eq('id', payload.id);
    return NextResponse.json({ ok: true });
  }
  if (action === 'resume' || action === 'activate') {
    await supaAdmin
      .from('autopilot_workflows')
      .update({
        status: 'active',
        next_run_at: new Date().toISOString(), // run dès le prochain cron tick
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.id);
    return NextResponse.json({ ok: true });
  }

  // ─── DELETE ───────────────────────────────────────────────────
  if (action === 'delete') {
    await supaAdmin.from('autopilot_workflows').delete().eq('id', payload.id);
    return NextResponse.json({ ok: true });
  }

  // ─── RUN NOW ──────────────────────────────────────────────────
  if (action === 'run_now') {
    if (existing.status !== 'active') {
      // Auto-activate puis run
      await supaAdmin
        .from('autopilot_workflows')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', payload.id);
    }
    const result = await runWorkflowRun(payload.id);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
}
