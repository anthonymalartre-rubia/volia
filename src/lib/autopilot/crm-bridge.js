// ─────────────────────────────────────────────────────────────────────
// src/lib/autopilot/crm-bridge.js — Phase 2 CRM push
// ─────────────────────────────────────────────────────────────────────
// Helper qui transforme un prospect Autopilot en deal CRM Volia.
//
// Pour respecter le schema CRM Volia (relationnel : Deal → Contact →
// Pipeline+Stage), ce helper :
//   1. Trouve ou crée le crm_contact (matching par user_id + email)
//   2. Trouve la pipeline par défaut du user (ou la 1ère existante)
//   3. Si pas de pipeline, en crée une "Autopilot" + 3 stages (Hot/Warm/Cold)
//   4. Trouve la stage matching tier dans la pipeline
//   5. Crée le deal avec tous les FKs
//
// Idempotent : si le contact existe avec engagement_score plus bas
// que le nouveau score, on update. Sinon on garde le max.
// ─────────────────────────────────────────────────────────────────────

const DEFAULT_PIPELINE_NAME = 'Autopilot';
const TIER_STAGE_MAP = {
  hot: { name: 'Hot · Autopilot', color: '#ef4444', position: 0, probability: 75 },
  warm: { name: 'Warm · Autopilot', color: '#f59e0b', position: 1, probability: 35 },
  cold: { name: 'Cold · Autopilot', color: '#94a3b8', position: 2, probability: 10 },
};

/**
 * Find or create a crm_contact pour un user + prospect.
 */
async function findOrCreateContact(supabase, { userId, prospect, score }) {
  if (!userId || !prospect) return null;

  // Match par email si disponible
  if (prospect.email) {
    const { data: existing } = await supabase
      .from('crm_contacts')
      .select('id, engagement_score')
      .eq('user_id', userId)
      .eq('email', prospect.email)
      .maybeSingle();
    if (existing) {
      // Update engagement_score si plus haut
      if (score && (!existing.engagement_score || score > existing.engagement_score)) {
        await supabase
          .from('crm_contacts')
          .update({
            engagement_score: score,
            last_engagement_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      }
      return existing.id;
    }
  }

  // Sinon créer
  const { data: created, error } = await supabase
    .from('crm_contacts')
    .insert({
      user_id: userId,
      name: prospect.first_name || prospect.nom || 'Prospect Autopilot',
      email: prospect.email || null,
      phone: prospect.telephone || null,
      company: prospect.nom || null,
      source: 'autopilot',
      source_ref_id: prospect.id || null,
      engagement_score: score || null,
      last_engagement_at: score ? new Date().toISOString() : null,
      tags: { source: 'autopilot' },
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.warn('[autopilot/crm-bridge] contact create failed', error.message);
    return null;
  }
  return created?.id || null;
}

/**
 * Get default pipeline ou crée la pipeline "Autopilot" + 3 stages.
 */
async function ensureAutopilotPipeline(supabase, userId) {
  // 1. Cherche pipeline default
  const { data: pipelines } = await supabase
    .from('crm_pipelines')
    .select('id, name, is_default')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('is_default', { ascending: false })
    .limit(5);

  // Si user a déjà une pipeline avec stages Hot/Warm/Cold (créées par autopilot précédemment), use it
  for (const p of pipelines || []) {
    if (p.name === DEFAULT_PIPELINE_NAME) {
      return p.id;
    }
  }

  // 2. Sinon, use pipeline default existante du user
  const defaultPipe = pipelines?.find((p) => p.is_default) || pipelines?.[0];
  if (defaultPipe) {
    return defaultPipe.id;
  }

  // 3. Pas de pipeline du tout → crée la pipeline Autopilot + stages
  const { data: newPipe } = await supabase
    .from('crm_pipelines')
    .insert({
      user_id: userId,
      name: DEFAULT_PIPELINE_NAME,
      color: '#f59e0b',
      position: 0,
      is_default: true,
      description: 'Pipeline auto-créée par Volia Autopilot',
    })
    .select('id')
    .maybeSingle();
  if (!newPipe) return null;

  // Crée les 3 stages
  const stagesToCreate = Object.values(TIER_STAGE_MAP).map((s) => ({
    pipeline_id: newPipe.id,
    name: s.name,
    color: s.color,
    position: s.position,
    probability: s.probability,
    closing_type: null,
  }));
  await supabase.from('crm_stages').insert(stagesToCreate);
  return newPipe.id;
}

/**
 * Find ou create la stage matching un tier dans la pipeline donnée.
 * Si la pipeline n'a pas les stages Autopilot, on les ajoute.
 */
async function ensureStageForTier(supabase, pipelineId, tier) {
  const stageConfig = TIER_STAGE_MAP[tier] || TIER_STAGE_MAP.warm;

  // Cherche stage existante (matching nom ou approximatif)
  const { data: stages } = await supabase
    .from('crm_stages')
    .select('id, name, position')
    .eq('pipeline_id', pipelineId)
    .order('position', { ascending: true });

  // Match exact ou approximatif (par mot-clé tier)
  const tierKeyword = tier.toLowerCase();
  const matching = (stages || []).find((s) =>
    s.name === stageConfig.name ||
    s.name.toLowerCase().includes(tierKeyword)
  );
  if (matching) return matching.id;

  // Sinon, fallback : 1ère stage (Hot = leftmost) ou dernière (Cold)
  if (stages && stages.length > 0) {
    if (tier === 'hot') return stages[0].id;
    if (tier === 'cold') return stages[stages.length - 1].id;
    return stages[Math.min(1, stages.length - 1)].id;
  }

  // Pipeline sans stages → on crée la stage manquante
  const { data: created } = await supabase
    .from('crm_stages')
    .insert({
      pipeline_id: pipelineId,
      name: stageConfig.name,
      color: stageConfig.color,
      position: stageConfig.position,
      probability: stageConfig.probability,
      closing_type: null,
    })
    .select('id')
    .maybeSingle();
  return created?.id || null;
}

/**
 * Crée un deal CRM depuis une execution Autopilot complétée.
 *
 * @param {object} supabase - Client Supabase admin
 * @param {object} args
 * @param {string} args.userId
 * @param {object} args.prospect - { id, nom, email, telephone, first_name, departement }
 * @param {object} args.workflow - { id, name, template_id, config }
 * @param {object} args.execution - { id }
 * @param {number} args.score - 0-100
 * @param {'hot'|'warm'|'cold'} args.tier
 * @param {object} args.routing - { source, crm_stage?, ... }
 * @param {object} args.formResponse - réponses + breakdown (jsonb)
 * @returns {Promise<{ deal_id: string|null, contact_id: string|null, stage_id: string|null }>}
 */
export async function createDealFromAutopilot(supabase, args) {
  const { userId, prospect, workflow, execution, score, tier, routing, formResponse } = args;

  if (!userId || !prospect || !workflow) {
    return { deal_id: null, contact_id: null, stage_id: null, error: 'missing_args' };
  }

  // 1. Contact
  const contactId = await findOrCreateContact(supabase, { userId, prospect, score });

  // 2. Pipeline
  const pipelineId = await ensureAutopilotPipeline(supabase, userId);
  if (!pipelineId) {
    return { deal_id: null, contact_id: contactId, stage_id: null, error: 'pipeline_unavailable' };
  }

  // 3. Stage selon tier (ou override depuis routing.crm_stage)
  // Si routing custom indique un nom de stage, on essaie de le matcher en priorité
  let stageId = null;
  if (routing?.crm_stage) {
    const { data: customStage } = await supabase
      .from('crm_stages')
      .select('id')
      .eq('pipeline_id', pipelineId)
      .ilike('name', `%${routing.crm_stage}%`)
      .maybeSingle();
    stageId = customStage?.id || null;
  }
  if (!stageId) {
    stageId = await ensureStageForTier(supabase, pipelineId, tier);
  }
  if (!stageId) {
    return { deal_id: null, contact_id: contactId, stage_id: null, error: 'stage_unavailable' };
  }

  // 4. Deal
  const dealTitle = `${prospect.nom || 'Prospect'} · Autopilot ${workflow.name}`;
  const { data: deal, error } = await supabase
    .from('crm_deals')
    .insert({
      user_id: userId,
      contact_id: contactId,
      pipeline_id: pipelineId,
      stage_id: stageId,
      title: dealTitle.slice(0, 200),
      value_cents: 0,
      currency: 'EUR',
      notes: `Volia Autopilot — workflow "${workflow.name}"\nScore qualif : ${score}/100 (tier ${tier})\nRouting : ${routing?.source || 'default'}`,
      metadata: {
        source: 'autopilot',
        autopilot_workflow_id: workflow.id,
        autopilot_execution_id: execution?.id,
        autopilot_template_id: workflow.template_id,
        autopilot_score: score,
        autopilot_tier: tier,
        autopilot_routing: routing,
        form_response: formResponse,
      },
    })
    .select('id')
    .maybeSingle();

  if (error) {
    return { deal_id: null, contact_id: contactId, stage_id: stageId, error: error.message };
  }

  return { deal_id: deal?.id, contact_id: contactId, stage_id: stageId, destination: 'volia' };
}

// ─────────────────────────────────────────────────────────────────────
// Destination CRM externe — "connecte TON CRM, pas le nôtre"
// ─────────────────────────────────────────────────────────────────────
// Beaucoup de clients ont déjà leur CRM (HubSpot, Pipedrive, Salesforce…)
// et ne migreront pas. Le workflow peut donc router les leads vers une
// destination configurée dans workflow.config.crm_destination :
//   { type: 'volia' }                              → CRM Volia natif (défaut)
//   { type: 'webhook', webhook_url: 'https://…' }  → POST JSON vers leur endpoint
//                                                     (HubSpot/Pipedrive/Salesforce
//                                                      via webhook natif ou Zapier/Make)
// Le payload webhook est stable et documenté (voir buildLeadPayload).

function buildLeadPayload({ prospect, workflow, score, tier, routing, formResponse }) {
  return {
    source: 'volia_autopilot',
    workflow: { id: workflow?.id, name: workflow?.name, template_id: workflow?.template_id },
    lead: {
      name: prospect?.first_name || prospect?.nom || null,
      company: prospect?.nom || null,
      email: prospect?.email || null,
      phone: prospect?.telephone || null,
      department: prospect?.departement || null,
    },
    qualification: { score: score ?? null, tier: tier || null },
    routing: routing || null,
    form_response: formResponse || null,
    delivered_at: new Date().toISOString(),
  };
}

/**
 * Livre un lead vers un webhook externe (CRM du client).
 * POST JSON, timeout 10s. Ne crée AUCUN deal Volia (le client veut SON CRM).
 */
async function deliverViaWebhook({ webhookUrl, payload }) {
  if (!webhookUrl || !/^https:\/\//i.test(webhookUrl)) {
    return { deal_id: null, destination: 'webhook', error: 'invalid_webhook_url' };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Volia-Autopilot/1.0' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { deal_id: null, destination: 'webhook', error: `webhook_http_${res.status}` };
    }
    return { deal_id: null, destination: 'webhook', delivered: true };
  } catch (err) {
    return { deal_id: null, destination: 'webhook', error: err.name === 'AbortError' ? 'webhook_timeout' : err.message };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Point d'entrée unique : route le lead vers la destination configurée.
 * Utilisé par form-submit (hot path) ET stepper (warm/cold path).
 */
export async function routeLeadToCrm(supabase, args) {
  const dest = args.workflow?.config?.crm_destination;
  const type = dest?.type || 'volia';

  if (type === 'webhook') {
    const payload = buildLeadPayload(args);
    return deliverViaWebhook({ webhookUrl: dest.webhook_url, payload });
  }

  // Défaut : CRM Volia natif
  return createDealFromAutopilot(supabase, args);
}
