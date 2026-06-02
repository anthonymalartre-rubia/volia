// ─────────────────────────────────────────────────────────────────────
// src/lib/autopilot/optimizer.js — Phase 3.2 weekly Claude analysis
// ─────────────────────────────────────────────────────────────────────
// Cron weekly (dimanche 02:00) qui analyse chaque workflow actif :
//
//   1. Calcule les KPIs réels des 7 derniers jours :
//      - email_1_send_rate (delivered / enrolled)
//      - form_submit_rate (form_submitted / emailed)
//      - hot_conversion_rate (crm_pushed hot / form_submitted)
//   2. Compare aux benchmarks template.expected (open/form/hot)
//   3. Si actual < expected × 0.7 → underperformance détectée
//   4. Appelle Claude pour générer 2-4 suggestions d'amélioration
//      concrètes basées sur le contexte (template, target, scores)
//   5. Store les suggestions dans workflow.metrics_cache.suggestions[]
//      avec timestamp + read_at (pour distinguer nouvelles)
//
// Les suggestions sont affichées dans /app/autopilot/?view=view&id=X
// avec un badge "💡 nouvelles suggestions Claude".
//
// Update aussi les A/B winners via ab-testing.updateWinnersForWorkflow
// pour chaque workflow (Phase 3.1 winner computation).
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '../supabase-admin';
import { isAutonomyEnabled, logAutonomousAction } from '../autonomy';
import { getTemplate } from './templates';
import { updateWinnersForWorkflow } from './ab-testing';
import { getPlanAutopilotLimits } from '../plans';

// Aligné sur le reste du repo prod. NE PAS utiliser 'claude-sonnet-4-5'.
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const UNDERPERF_THRESHOLD = 0.7; // actual < expected × 0.7 = underperf
const MAX_SUGGESTIONS_PER_RUN = 4;
const ANALYSIS_WINDOW_DAYS = 7;

/**
 * Compute KPIs réels d'un workflow sur les N derniers jours.
 */
async function computeWorkflowKpis(supabase, workflowId, windowDays = ANALYSIS_WINDOW_DAYS) {
  const since = new Date(Date.now() - windowDays * 86400 * 1000).toISOString();

  const { data: executions } = await supabase
    .from('autopilot_executions')
    .select('current_step, email_1_sent_at, form_submitted_at, crm_pushed_at, computed_score, created_at, step_history')
    .eq('workflow_id', workflowId)
    .gte('created_at', since);

  const total = executions?.length || 0;
  const emailed = executions?.filter((e) => e.email_1_sent_at).length || 0;
  const formed = executions?.filter((e) => e.form_submitted_at).length || 0;
  const hotPushed = executions?.filter((e) =>
    e.crm_pushed_at && (e.computed_score ?? 0) >= 70
  ).length || 0;
  // Opens réels (webhook Resend → step 'email_opened' dans step_history).
  // Signal d'ouverture vrai, à comparer au benchmark template.expected.open.
  const opened = executions?.filter((e) =>
    Array.isArray(e.step_history) && e.step_history.some((h) => h.step === 'email_opened')
  ).length || 0;

  return {
    window_days: windowDays,
    total_enrolled: total,
    emailed,
    opened,
    form_submitted: formed,
    crm_hot: hotPushed,
    // Rates en %
    email_send_rate: total > 0 ? Math.round((emailed / total) * 100) : 0,
    open_rate: emailed > 0 ? Math.round((opened / emailed) * 100) : 0,
    form_submit_rate: emailed > 0 ? Math.round((formed / emailed) * 100) : 0,
    hot_conversion_rate: formed > 0 ? Math.round((hotPushed / formed) * 100) : 0,
  };
}

/**
 * Compare KPIs réels vs benchmarks template.
 * Retourne array de underperformances : [{ metric, actual, expected, gap }].
 */
function detectUnderperformances(kpis, template) {
  if (!template?.expected) return [];

  const checks = [
    // open_rate = vrai taux d'ouverture (webhook), comparé au benchmark.
    // On ne déclenche que si on a au moins quelques opens trackés (sinon
    // webhook peut ne pas être branché → éviter les faux positifs).
    ...(kpis.opened > 0 ? [{ metric: 'open_rate', actual: kpis.open_rate, expected: template.expected.open }] : []),
    { metric: 'form_submit', actual: kpis.form_submit_rate, expected: template.expected.form },
    { metric: 'hot_conversion', actual: kpis.hot_conversion_rate, expected: template.expected.hot },
  ];

  return checks
    .filter((c) => c.expected && c.actual < c.expected * UNDERPERF_THRESHOLD)
    .map((c) => ({
      ...c,
      gap_pct: Math.round(((c.expected - c.actual) / c.expected) * 100),
    }));
}

/**
 * Appelle Claude pour générer des suggestions d'amélioration.
 * Garde-fous : pas de pattern interdit DGCCRF/brand.
 */
async function generateSuggestions({ workflow, template, kpis, underperformances }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  if (underperformances.length === 0) return null;

  const userPrompt = `Tu es un expert growth B2B et tu analyses la performance d'un workflow Volia Autopilot.

WORKFLOW :
- Nom : "${workflow.name}"
- Template : ${template.name} (${template.tagline})
- Segment cible : ${template.segment}
- Catégories scrapées : ${(template.target?.categories || []).slice(0, 5).join(', ')}

KPIs RÉELS (7 derniers jours, ${kpis.total_enrolled} prospects enrôlés) :
- Email envoyé : ${kpis.email_send_rate}% (attendu ${template.expected?.open}%)
- Form rempli : ${kpis.form_submit_rate}% (attendu ${template.expected?.form}%)
- Hot CRM converti : ${kpis.hot_conversion_rate}% (attendu ${template.expected?.hot}%)

PROBLÈMES DÉTECTÉS :
${underperformances.map((u) => `- ${u.metric} : ${u.actual}% vs ${u.expected}% attendu (gap ${u.gap_pct}%)`).join('\n')}

Génère ${MAX_SUGGESTIONS_PER_RUN} suggestions concrètes pour améliorer ce workflow. Chaque suggestion doit :
- Cibler un underperformance précis
- Être actionnable directement par l'user dans Volia
- Ne PAS dire "0 humain" / "100% autonome" / "remplace les humains"
- Ne PAS suggérer Bordeaux/Lyon/Paris comme exemple de localisation

Format de sortie JSON valide (uniquement, pas de texte autour) :
{
  "suggestions": [
    {
      "title": "Titre court (max 60 chars)",
      "description": "1-2 phrases concrètes",
      "target_metric": "form_submit | email_send | hot_conversion",
      "effort": "5 min | 15 min | 1h",
      "expected_impact": "+5% form_submit"
    }
  ]
}`;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content?.[0]?.text || '';
    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed.suggestions)) return null;
    return parsed.suggestions.slice(0, MAX_SUGGESTIONS_PER_RUN);
  } catch (err) {
    console.warn('[autopilot/optimizer] Claude suggestion gen failed', err.message);
    return null;
  }
}

/**
 * Analyse 1 workflow et store suggestions si underperf détectée.
 */
async function analyzeWorkflow(supabase, workflow) {
  const template = getTemplate(workflow.template_id);
  if (!template) return { ok: false, reason: 'template_not_found' };

  // Gating par plan : A/B winner auto-pick + suggestions Claude sont des
  // features Enterprise (cf. pricing). On récupère le plan du user.
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan')
    .eq('id', workflow.user_id)
    .maybeSingle();
  const limits = getPlanAutopilotLimits(profile?.plan || 'free');

  const kpis = await computeWorkflowKpis(supabase, workflow.id);
  if (kpis.total_enrolled < 10) {
    return { ok: true, skipped: true, reason: 'not_enough_volume', kpis };
  }

  // A/B winner auto-pick → gated ab_testing (Enterprise)
  if (limits.ab_testing) {
    await updateWinnersForWorkflow(supabase, workflow.id, template.sequence?.length || 3);
  }

  const underperf = detectUnderperformances(kpis, template);

  // Suggestions Claude → gated claude_opt (Enterprise)
  if (!limits.claude_opt) {
    return { ok: true, kpis, underperformances: underperf, suggestions: [], gated: true };
  }

  if (underperf.length === 0) {
    return { ok: true, kpis, underperformances: [], suggestions: [] };
  }

  const suggestions = await generateSuggestions({ workflow, template, kpis, underperformances: underperf });
  if (!suggestions || suggestions.length === 0) {
    return { ok: true, kpis, underperformances: underperf, suggestions: [] };
  }

  // Store dans workflow.metrics_cache.suggestions
  const cache = workflow.metrics_cache || {};
  const prev = Array.isArray(cache.suggestions) ? cache.suggestions : [];
  const stamped = suggestions.map((s) => ({
    ...s,
    generated_at: new Date().toISOString(),
    read_at: null,
    kpis_snapshot: kpis,
    underperformances: underperf,
  }));

  await supabase
    .from('autopilot_workflows')
    .update({
      metrics_cache: {
        ...cache,
        suggestions: [...stamped, ...prev].slice(0, 20), // garde 20 dernières
        last_optimization_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', workflow.id);

  return { ok: true, kpis, underperformances: underperf, suggestions: stamped };
}

/**
 * Cron entrypoint — dimanche 02:00.
 */
export async function runWeeklyOptimizer() {
  const startedAt = new Date().toISOString();

  const autonomy = await isAutonomyEnabled();
  if (!autonomy.enabled) {
    return { ok: true, skipped: true, reason: autonomy.reason, startedAt };
  }

  const supabase = getSupabaseAdmin();

  const { data: workflows } = await supabase
    .from('autopilot_workflows')
    .select('id, user_id, name, template_id, metrics_cache')
    .in('status', ['active', 'paused'])
    .limit(100);

  if (!workflows || workflows.length === 0) {
    return { ok: true, processed: 0, startedAt };
  }

  const results = { analyzed: 0, with_suggestions: 0, skipped: 0, errors: 0 };
  for (const wf of workflows) {
    try {
      const res = await analyzeWorkflow(supabase, wf);
      if (res.skipped) results.skipped++;
      else {
        results.analyzed++;
        if (res.suggestions?.length > 0) results.with_suggestions++;
      }
    } catch (err) {
      results.errors++;
      console.error('[autopilot/optimizer] workflow analyze error', wf.id, err.message);
    }
  }

  await logAutonomousAction({
    actionType: 'autopilot_weekly_optimization',
    source: 'cron/autopilot-weekly',
    riskLevel: 'low',
    payload: { ...results, total_workflows: workflows.length },
    preview: `🔮 Autopilot weekly : ${results.with_suggestions}/${results.analyzed} workflows ont des suggestions`,
    rationale: 'Analyse hebdo des performances + suggestions Claude',
    autoExecute: true,
  });

  return { ok: true, ...results, total: workflows.length, startedAt };
}
