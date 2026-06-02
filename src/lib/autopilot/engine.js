// ─────────────────────────────────────────────────────────────────────
// src/lib/autopilot/engine.js — Volia Autopilot orchestrator
// ─────────────────────────────────────────────────────────────────────
// 2 fonctions principales :
//
//   runEngine()         — cron */15 min. Scan workflows actifs dont
//                          next_run_at <= NOW. Pour chacun, crée 1 run
//                          + scrap prospects + enroll dans executions.
//
//   runWorkflowRun(id)  — pour 1 workflow, fait :
//                          1. Crée autopilot_runs row
//                          2. Scrap N prospects via Google Places API
//                          3. Filtre dédup vs autopilot_executions existantes
//                          4. Insert prospects dans table prospects
//                          5. Enroll dans autopilot_executions current_step=enrolled
//                          6. Update workflow.last_run_at + next_run_at
//
// Garde-fous :
//   - Quota perDay 5 runs par workflow (anti-loop bug)
//   - Skip si autopilot_workflows_enabled = false dans app_settings
//   - Skip si user_profile.plan ne autorise pas (check getPlanAutopilotLimits)
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from '../supabase-admin';
import { PLACES_API_URL, FIELD_MASK, getDeptData, DEPTS } from '../constants';
import { isAutonomyEnabled, enforceQuotaOrThrow, logAutonomousAction } from '../autonomy';
import { getPlanAutopilotLimits } from '../plans';
import { getTemplate } from './templates';

const MAX_RUNS_PER_DAY_PER_WORKFLOW = 5; // anti loop bug

// Pseudo-catégories qui NE sont PAS des recherches Google Places mais
// des sources CRM internes (templates reactivation, annonce produit,
// upsell, renewal). Pour ces templates, on ne scrape PAS Places — on
// pioche dans les prospects existants du user.
const CRM_SOURCE_MARKERS = [
  'existing_crm_cold',
  'existing_crm_warm',
  'existing_crm_active_clients',
  'existing_crm_growth_signals',
  'existing_crm_at_risk',
];

function isCrmSourceTarget(target) {
  const cats = target?.categories || [];
  return cats.length > 0 && cats.every((c) => CRM_SOURCE_MARKERS.includes(c));
}

/**
 * Pour les templates CRM-source : pioche des prospects existants du user
 * (avec email, pas encore enrôlés dans CE workflow). Pas de Google Places.
 * Retourne des prospect IDs prêts à enrôler.
 */
async function pullCrmSourceProspects(supabase, workflow, count) {
  // Prospects du user déjà enrôlés dans ce workflow → à exclure
  const { data: enrolled } = await supabase
    .from('autopilot_executions')
    .select('prospect_id')
    .eq('workflow_id', workflow.id);
  const enrolledIds = new Set((enrolled || []).map((e) => e.prospect_id).filter(Boolean));

  // Pioche des prospects du user avec email, pas déjà enrôlés.
  // On surcharge la limite pour compenser le filtrage côté JS.
  const { data: candidates } = await supabase
    .from('prospects')
    .select('id, email')
    .eq('user_id', workflow.user_id)
    .not('email', 'is', null)
    .order('created_at', { ascending: false })
    .limit(count * 3 + 50);

  const fresh = (candidates || [])
    .filter((p) => p.email && !enrolledIds.has(p.id))
    .slice(0, count);
  return fresh.map((p) => ({ id: p.id }));
}

/**
 * Vérifie le master switch global autopilot.
 */
async function isAutopilotEnabled() {
  const autonomy = await isAutonomyEnabled();
  if (!autonomy.enabled) return { enabled: false, reason: autonomy.reason };
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'autopilot_enabled')
    .maybeSingle();
  // Default = true (si pas de row, considère activé)
  if (data?.value === 'false' || data?.value === false) {
    return { enabled: false, reason: 'autopilot_explicitly_disabled' };
  }
  return { enabled: true };
}

/**
 * Compute next_run_at en fonction de run_frequency.
 */
function computeNextRunAt(frequency) {
  const now = Date.now();
  if (frequency === 'once') return null; // workflow → archived après 1 run
  const map = {
    daily: now + 24 * 3600 * 1000,
    weekly: now + 7 * 86400 * 1000,
    biweekly: now + 14 * 86400 * 1000,
  };
  // Fréquence inconnue → défaut weekly (évite la boucle next_run_at=now)
  const ts = map[frequency] ?? map.weekly;
  return new Date(ts).toISOString();
}

/**
 * Compte les runs des dernières 24h pour ce workflow.
 */
async function countRecentRuns(supabase, workflowId) {
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await supabase
    .from('autopilot_runs')
    .select('id', { count: 'exact', head: true })
    .eq('workflow_id', workflowId)
    .gte('started_at', since);
  return count || 0;
}

/**
 * Scrap prospects via Google Places.
 * Retourne { ok, prospects, error }.
 */
async function scrapProspectsForTarget(target, prospectsCount) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return { ok: false, error: 'GOOGLE_PLACES_API_KEY missing', prospects: [] };
  if (!target?.categories?.length) return { ok: false, error: 'no_categories', prospects: [] };

  // Stratégie simple : pour chaque catégorie, tirer 1 département au hasard
  // dans la stratégie cible. Phase 2 : rotation déterministe par week.
  const fallbackDepts = ['75', '69', '13', '33', '31']; // top 5 métropoles par défaut
  const candidateDepts = target.departments_explicit?.length
    ? target.departments_explicit
    : fallbackDepts;

  const allProspects = [];
  for (const category of target.categories.slice(0, 5)) {
    if (allProspects.length >= prospectsCount) break;
    const dept = candidateDepts[Math.floor(allProspects.length / 20) % candidateDepts.length];
    const deptData = getDeptData(dept);
    if (!deptData) continue;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(PLACES_API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': FIELD_MASK,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textQuery: `${category} ${deptData.name}`,
          maxResultCount: 20,
          locationBias: {
            circle: {
              center: { latitude: deptData.lat, longitude: deptData.lng },
              radius: deptData.r || 25000,
            },
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        for (const place of data.places || []) {
          allProspects.push({
            place,
            category,
            dept,
          });
        }
      }
    } catch (err) {
      console.warn('[autopilot/engine] places fetch failed', err.message);
    } finally {
      clearTimeout(timeout);
    }
  }

  return { ok: true, prospects: allProspects.slice(0, prospectsCount) };
}

/**
 * Exécute 1 run pour un workflow donné.
 */
export async function runWorkflowRun(workflowId) {
  const supabase = getSupabaseAdmin();
  const startedAt = new Date().toISOString();

  // 1. Charge le workflow
  const { data: workflow } = await supabase
    .from('autopilot_workflows')
    .select('*')
    .eq('id', workflowId)
    .maybeSingle();
  if (!workflow) return { ok: false, error: 'workflow_not_found' };
  if (workflow.status !== 'active') return { ok: false, error: 'workflow_not_active' };

  // 2. Check user a le plan qui autorise + workflow_quota
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan')
    .eq('id', workflow.user_id)
    .maybeSingle();
  if (!profile) return { ok: false, error: 'user_not_found' };
  const planLimits = getPlanAutopilotLimits(profile.plan);
  if (planLimits.workflows === 0) {
    return { ok: false, error: 'plan_does_not_allow_autopilot', plan: profile.plan };
  }

  // 3. Anti-loop : max 5 runs/24h par workflow
  const recentRuns = await countRecentRuns(supabase, workflowId);
  if (recentRuns >= MAX_RUNS_PER_DAY_PER_WORKFLOW) {
    return { ok: false, error: 'too_many_recent_runs', count: recentRuns };
  }

  // 4. Crée le row run
  const { data: run } = await supabase
    .from('autopilot_runs')
    .insert({
      workflow_id: workflowId,
      status: 'scraping',
    })
    .select()
    .maybeSingle();
  if (!run) return { ok: false, error: 'run_create_failed' };

  // 5. Récupère le template + config
  const template = getTemplate(workflow.template_id);
  if (!template) {
    await supabase.from('autopilot_runs').update({ status: 'failed', error_message: 'template_not_found', completed_at: new Date().toISOString() }).eq('id', run.id);
    return { ok: false, error: 'template_not_found' };
  }
  const config = { ...template, ...(workflow.config || {}) };
  const target = config.target_override || template.target;

  // ─── CRM-SOURCE PATH (reactivation, annonce, upsell, renewal) ──────
  // Ces templates ne scrapent pas Google Places : ils piochent dans les
  // prospects existants du user. On court-circuite tout le flow Places.
  if (isCrmSourceTarget(target)) {
    const crmProspects = await pullCrmSourceProspects(supabase, workflow, workflow.prospects_per_run);
    if (crmProspects.length === 0) {
      await supabase.from('autopilot_runs').update({
        status: 'completed',
        prospects_scraped: 0,
        prospects_added: 0,
        error_message: 'no_crm_prospects_available',
        completed_at: new Date().toISOString(),
        metadata: { source: 'crm', note: 'Aucun prospect existant éligible (avec email, non enrôlé)' },
      }).eq('id', run.id);
      // Reschedule quand même
      const nextRunAt = computeNextRunAt(workflow.run_frequency);
      await supabase.from('autopilot_workflows').update({
        last_run_at: new Date().toISOString(),
        next_run_at: nextRunAt,
        status: nextRunAt ? workflow.status : 'archived',
        updated_at: new Date().toISOString(),
      }).eq('id', workflow.id);
      return { ok: true, run_id: run.id, prospects_enrolled: 0, source: 'crm', reason: 'no_crm_prospects' };
    }

    const executionRows = crmProspects.map(({ id }) => ({
      workflow_id: workflow.id,
      run_id: run.id,
      prospect_id: id,
      current_step: 'enrolled',
      step_history: [{ step: 'enrolled', at: new Date().toISOString(), source: 'crm' }],
    }));
    const { error: execErr } = await supabase.from('autopilot_executions').insert(executionRows);
    if (execErr) {
      await supabase.from('autopilot_runs').update({
        status: 'failed', error_message: execErr.message, completed_at: new Date().toISOString(),
      }).eq('id', run.id);
      return { ok: false, error: 'enrollment_failed', detail: execErr.message };
    }

    const nextRunAt = computeNextRunAt(workflow.run_frequency);
    await supabase.from('autopilot_workflows').update({
      last_run_at: new Date().toISOString(),
      next_run_at: nextRunAt,
      status: nextRunAt ? workflow.status : 'archived',
      updated_at: new Date().toISOString(),
    }).eq('id', workflow.id);
    await supabase.from('autopilot_runs').update({
      status: 'completed',
      prospects_scraped: 0,
      prospects_added: crmProspects.length,
      completed_at: new Date().toISOString(),
      metadata: { source: 'crm' },
    }).eq('id', run.id);

    await logAutonomousAction({
      actionType: 'autopilot_run',
      source: 'cron/autopilot-engine',
      riskLevel: 'low',
      payload: { workflow_id: workflow.id, run_id: run.id, prospects_enrolled: crmProspects.length, source: 'crm' },
      preview: `⚡ Autopilot (CRM source) → ${crmProspects.length} prospects enrôlés`,
      rationale: `Workflow ${workflow.name} : vague depuis base CRM existante`,
      autoExecute: true,
    });
    return { ok: true, run_id: run.id, prospects_enrolled: crmProspects.length, source: 'crm', next_run_at: nextRunAt };
  }

  // 6. Scrap prospects (Google Places — templates cold classiques)
  const scrapRes = await scrapProspectsForTarget(target, workflow.prospects_per_run);
  if (!scrapRes.ok || !scrapRes.prospects.length) {
    await supabase.from('autopilot_runs').update({
      status: 'failed',
      error_message: scrapRes.error || 'no_prospects_found',
      completed_at: new Date().toISOString(),
    }).eq('id', run.id);
    return { ok: false, error: scrapRes.error || 'no_prospects' };
  }

  await supabase.from('autopilot_runs').update({
    prospects_scraped: scrapRes.prospects.length,
    status: 'enriching',
  }).eq('id', run.id);

  // 7. Filtre dédup vs executions existantes (mêmes place_id déjà dans le workflow)
  const placeIds = scrapRes.prospects.map((p) => p.place.id).filter(Boolean);
  const { data: existingProspects } = await supabase
    .from('prospects')
    .select('id, place_id')
    .in('place_id', placeIds);
  const existingMap = new Map((existingProspects || []).map((p) => [p.place_id, p.id]));

  // Skip ceux déjà enrôlés dans CE workflow
  const existingProspectIds = (existingProspects || []).map((p) => p.id);
  let alreadyEnrolledIds = new Set();
  if (existingProspectIds.length > 0) {
    const { data: existingExec } = await supabase
      .from('autopilot_executions')
      .select('prospect_id')
      .eq('workflow_id', workflowId)
      .in('prospect_id', existingProspectIds);
    alreadyEnrolledIds = new Set((existingExec || []).map((e) => e.prospect_id));
  }

  // 8. Insert nouveaux prospects + récupère existants pour enrollment
  const prospectsToEnroll = [];
  const newProspectsToInsert = [];
  for (const { place, category, dept } of scrapRes.prospects) {
    const existingId = existingMap.get(place.id);
    if (existingId) {
      if (!alreadyEnrolledIds.has(existingId)) {
        prospectsToEnroll.push({ id: existingId });
      }
    } else {
      newProspectsToInsert.push({
        place_id: place.id,
        nom: place.displayName?.text || place.name || 'Sans nom',
        adresse: place.formattedAddress || null,
        telephone: place.internationalPhoneNumber || null,
        site_web: place.websiteUri || null,
        type: 'b2b',
        departement: dept,
        user_id: workflow.user_id,
      });
    }
  }

  let insertedRows = [];
  if (newProspectsToInsert.length > 0) {
    const { data: inserted } = await supabase
      .from('prospects')
      .insert(newProspectsToInsert)
      .select('id');
    insertedRows = inserted || [];
  }
  for (const r of insertedRows) prospectsToEnroll.push({ id: r.id });

  // 9. Enroll dans autopilot_executions
  if (prospectsToEnroll.length === 0) {
    await supabase.from('autopilot_runs').update({
      status: 'completed',
      prospects_added: 0,
      completed_at: new Date().toISOString(),
    }).eq('id', run.id);
    return { ok: true, run_id: run.id, prospects_added: 0, reason: 'all_already_enrolled' };
  }

  const executionRows = prospectsToEnroll.map(({ id }) => ({
    workflow_id: workflowId,
    run_id: run.id,
    prospect_id: id,
    current_step: 'enrolled',
    step_history: [{ step: 'enrolled', at: new Date().toISOString() }],
  }));
  const { error: execErr } = await supabase
    .from('autopilot_executions')
    .insert(executionRows);
  if (execErr) {
    await supabase.from('autopilot_runs').update({
      status: 'failed',
      error_message: execErr.message,
      completed_at: new Date().toISOString(),
    }).eq('id', run.id);
    return { ok: false, error: 'enrollment_failed', detail: execErr.message };
  }

  // 10. Update workflow last_run_at + next_run_at
  const nextRunAt = computeNextRunAt(workflow.run_frequency);
  const updates = {
    last_run_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (nextRunAt) {
    updates.next_run_at = nextRunAt;
  } else {
    // 'once' workflow → complete
    updates.status = 'archived';
  }
  await supabase.from('autopilot_workflows').update(updates).eq('id', workflowId);

  // 11. Marker run completed
  await supabase.from('autopilot_runs').update({
    status: 'completed',
    prospects_added: prospectsToEnroll.length,
    completed_at: new Date().toISOString(),
  }).eq('id', run.id);

  await logAutonomousAction({
    actionType: 'autopilot_run',
    source: 'cron/autopilot-engine',
    riskLevel: 'low',
    payload: {
      workflow_id: workflowId,
      run_id: run.id,
      prospects_scraped: scrapRes.prospects.length,
      prospects_enrolled: prospectsToEnroll.length,
    },
    preview: `⚡ Autopilot run → ${prospectsToEnroll.length} prospects enrolled`,
    rationale: `Workflow ${workflow.name} : nouvelle vague`,
    autoExecute: true,
  });

  return {
    ok: true,
    run_id: run.id,
    workflow_id: workflowId,
    prospects_scraped: scrapRes.prospects.length,
    prospects_enrolled: prospectsToEnroll.length,
    next_run_at: nextRunAt,
    startedAt,
  };
}

/**
 * Cron entrypoint — toutes les 15 minutes.
 */
export async function runEngine() {
  const startedAt = new Date().toISOString();

  const state = await isAutopilotEnabled();
  if (!state.enabled) {
    return { ok: true, skipped: true, reason: state.reason, startedAt };
  }

  try {
    await enforceQuotaOrThrow('autopilot_run', { perDay: 100 });
  } catch (e) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: e.message, startedAt };
  }

  const supabase = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  // Workflows actifs dont next_run_at <= NOW (ou null = jamais run)
  const { data: dueWorkflows } = await supabase
    .from('autopilot_workflows')
    .select('id, user_id, name')
    .eq('status', 'active')
    .or(`next_run_at.is.null,next_run_at.lte.${nowIso}`)
    .limit(20);

  if (!dueWorkflows || dueWorkflows.length === 0) {
    return { ok: true, processed: 0, startedAt };
  }

  const results = { runs: [], errors: [] };
  for (const wf of dueWorkflows) {
    try {
      const res = await runWorkflowRun(wf.id);
      if (res.ok) results.runs.push({ workflow_id: wf.id, ...res });
      else results.errors.push({ workflow_id: wf.id, error: res.error });
    } catch (err) {
      results.errors.push({ workflow_id: wf.id, error: err.message });
    }
  }

  return { ok: true, ...results, processed: dueWorkflows.length, startedAt };
}
