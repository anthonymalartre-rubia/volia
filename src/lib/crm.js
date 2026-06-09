// ─────────────────────────────────────────────────────────────────
// Volia CRM — helpers serveur
// Gating Business plan + utilitaires pipeline/stages/deals.
// ─────────────────────────────────────────────────────────────────

import { getEffectivePlan } from './trial';

// Default pipeline stages template (créé au 1er accès /app/crm)
export const DEFAULT_PIPELINE = {
  name: 'Pipeline commercial',
  color: 'violet',
  stages: [
    { name: 'Lead', color: 'zinc', probability: 10, position: 0 },
    { name: 'Qualifié', color: 'blue', probability: 25, position: 1 },
    { name: 'Démo planifiée', color: 'indigo', probability: 50, position: 2 },
    { name: 'Proposition envoyée', color: 'violet', probability: 75, position: 3 },
    { name: 'Closé gagné', color: 'emerald', probability: 100, position: 4, closing_type: 'won' },
    { name: 'Closé perdu', color: 'rose', probability: 0, position: 5, closing_type: 'lost' },
  ],
};

// Templates pré-définis proposés à la création d'un pipeline custom.
// Chaque template inclut nom suggéré, couleur, description et stages.
export const PIPELINE_TEMPLATES = {
  sales: {
    id: 'sales',
    label: 'Sales standard',
    description: 'Pipeline commercial classique : lead → qualif → démo → propal → closing.',
    name: 'Pipeline commercial',
    color: 'violet',
    stages: DEFAULT_PIPELINE.stages,
  },
  recruiting: {
    id: 'recruiting',
    label: 'Recrutement',
    description: 'Suivi candidats : sourcing → entretien → offre → embauche.',
    name: 'Recrutement',
    color: 'blue',
    stages: [
      { name: 'Sourcé', color: 'zinc', probability: 10, position: 0 },
      { name: 'Entretien RH', color: 'blue', probability: 25, position: 1 },
      { name: 'Entretien tech', color: 'indigo', probability: 50, position: 2 },
      { name: 'Offre envoyée', color: 'violet', probability: 75, position: 3 },
      { name: 'Embauché', color: 'emerald', probability: 100, position: 4, closing_type: 'won' },
      { name: 'Refusé', color: 'rose', probability: 0, position: 5, closing_type: 'lost' },
    ],
  },
  partnerships: {
    id: 'partnerships',
    label: 'Partenariats',
    description: 'Suivi partenariats stratégiques : prise de contact → signature.',
    name: 'Partenariats',
    color: 'teal',
    stages: [
      { name: 'Identifié', color: 'zinc', probability: 10, position: 0 },
      { name: 'Premier contact', color: 'blue', probability: 30, position: 1 },
      { name: 'En discussion', color: 'indigo', probability: 50, position: 2 },
      { name: 'Accord verbal', color: 'amber', probability: 75, position: 3 },
      { name: 'Signé', color: 'emerald', probability: 100, position: 4, closing_type: 'won' },
      { name: 'Abandonné', color: 'rose', probability: 0, position: 5, closing_type: 'lost' },
    ],
  },
  custom: {
    id: 'custom',
    label: 'Vierge',
    description: 'Commence avec 3 stages basiques que tu personnalises.',
    name: 'Nouveau pipeline',
    color: 'emerald',
    stages: [
      { name: 'À faire', color: 'zinc', probability: 10, position: 0 },
      { name: 'En cours', color: 'blue', probability: 50, position: 1 },
      { name: 'Terminé', color: 'emerald', probability: 100, position: 2, closing_type: 'won' },
    ],
  },
};

// Couleurs autorisées pour les pipelines et stages (alignées sur KanbanBoard STAGE_COLORS)
export const PIPELINE_COLORS = ['zinc', 'blue', 'indigo', 'violet', 'emerald', 'teal', 'amber', 'rose'];

// Probabilités proposées dans le picker (granularité 25%)
export const STAGE_PROBABILITIES = [0, 10, 25, 50, 75, 90, 100];

// Closing types autorisés
export const CLOSING_TYPES = ['none', 'won', 'lost'];

// Plans autorisés à accéder au module CRM (inclus dès Pro).
export const CRM_ALLOWED_PLANS = ['pro', 'business', 'enterprise', 'enterprise_legacy'];

/**
 * Vérifie que l'utilisateur a accès au module CRM (plan Business).
 * Retourne true / false.
 */
export async function checkCrmAccess(supabase, userId) {
  if (!supabase || !userId) return false;
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('plan, trial_plan, trial_started_at, trial_ends_at, trial_converted_at')
    .eq('id', userId)
    .maybeSingle();
  if (error || !profile) return false;
  // getEffectivePlan : si trial Pro actif, le user est "pro" → mais le CRM
  // est gated Business uniquement. Trial Pro ne donne donc PAS accès au CRM,
  // ce qui est volontaire (le CRM est un upsell Business, pas Pro).
  return CRM_ALLOWED_PLANS.includes(getEffectivePlan(profile));
}

/**
 * Récupère ou crée le pipeline par défaut pour un user.
 * Retourne le pipeline complet avec ses stages.
 */
export async function getOrCreateDefaultPipeline(supabase, userId) {
  // 1. Cherche un pipeline existant marqué is_default
  const { data: existing } = await supabase
    .from('crm_pipelines')
    .select('id, name, color, position, is_default, created_at, updated_at, stages:crm_stages(*)')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle();
  if (existing) return existing;

  // 2. Crée le pipeline
  const { data: pipeline, error: pipelineErr } = await supabase
    .from('crm_pipelines')
    .insert({
      user_id: userId,
      name: DEFAULT_PIPELINE.name,
      color: DEFAULT_PIPELINE.color,
      is_default: true,
      position: 0,
    })
    .select()
    .single();

  if (pipelineErr || !pipeline) {
    throw new Error(`Failed to create default pipeline: ${pipelineErr?.message || 'unknown'}`);
  }

  // 3. Crée les stages associés
  const stages = DEFAULT_PIPELINE.stages.map((s) => ({
    ...s,
    pipeline_id: pipeline.id,
  }));
  const { error: stagesErr } = await supabase.from('crm_stages').insert(stages);
  if (stagesErr) {
    // best-effort cleanup : on ne supprime pas le pipeline (un retry pourra réutiliser)
    throw new Error(`Failed to create default stages: ${stagesErr.message}`);
  }

  // 4. Re-fetch avec stages embarqués
  const { data: full } = await supabase
    .from('crm_pipelines')
    .select('id, name, color, position, is_default, created_at, updated_at, stages:crm_stages(*)')
    .eq('id', pipeline.id)
    .single();
  return full;
}

/**
 * Format la valeur d'un deal (cents → "1 234 €")
 */
export function formatDealValue(cents, currency = 'EUR') {
  const euros = Math.round((cents || 0) / 100);
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(euros);
}

/**
 * Calcule les stats d'un pipeline à partir d'une liste de deals.
 * Chaque deal peut avoir un `stage` joined avec `probability` pour le pipeline pondéré.
 *
 * Retourne :
 *  - openCount, wonCount, lostCount
 *  - totalOpenValue, totalWonValue
 *  - weightedPipeline : pondéré par probability du stage
 *  - wonCountMonth, wonValueMonth : closés gagnés sur le mois en cours
 *  - closingRate30d : won / (won + lost) sur les 30 derniers jours (0-100, null si N/A)
 */
export function calculatePipelineStats(deals) {
  const list = Array.isArray(deals) ? deals : [];
  const openDeals = list.filter((d) => d.status === 'open');
  const wonDeals = list.filter((d) => d.status === 'won');
  const lostDeals = list.filter((d) => d.status === 'lost');
  const totalOpenValue = openDeals.reduce((sum, d) => sum + (d.value_cents || 0), 0);
  const totalWonValue = wonDeals.reduce((sum, d) => sum + (d.value_cents || 0), 0);
  const weightedPipeline = openDeals.reduce(
    (sum, d) => sum + ((d.value_cents || 0) * (d.stage?.probability || 0)) / 100,
    0
  );

  // Mois en cours
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const wonThisMonth = wonDeals.filter((d) => {
    const t = d.closed_at ? new Date(d.closed_at).getTime() : 0;
    return t >= startOfMonth;
  });
  const wonCountMonth = wonThisMonth.length;
  const wonValueMonth = wonThisMonth.reduce((sum, d) => sum + (d.value_cents || 0), 0);

  // 30 derniers jours : closing rate
  const cutoff30 = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  const closedRecently = [...wonDeals, ...lostDeals].filter((d) => {
    const t = d.closed_at ? new Date(d.closed_at).getTime() : 0;
    return t >= cutoff30;
  });
  const wonRecently = closedRecently.filter((d) => d.status === 'won').length;
  const closingRate30d =
    closedRecently.length > 0
      ? Math.round((wonRecently / closedRecently.length) * 100)
      : null;

  // Panier moyen : valeur moyenne d'une affaire gagnée (ce qu'on closé en moyenne).
  // Fallback sur la moyenne des deals ouverts si aucun gagné (nouveau compte).
  const avgWonValue = wonDeals.length
    ? Math.round(totalWonValue / wonDeals.length)
    : (openDeals.length ? Math.round(totalOpenValue / openDeals.length) : 0);
  const avgBasedOn = wonDeals.length ? 'won' : 'open';

  // Taux de win all-time : gagnés / (gagnés + perdus) sur tout l'historique.
  const closedAll = wonDeals.length + lostDeals.length;
  const winRateAllTime = closedAll > 0
    ? Math.round((wonDeals.length / closedAll) * 100)
    : null;

  return {
    openCount: openDeals.length,
    wonCount: wonDeals.length,
    lostCount: lostDeals.length,
    totalOpenValue,
    totalWonValue,
    weightedPipeline,
    wonCountMonth,
    wonValueMonth,
    closingRate30d,
    avgWonValue,
    avgBasedOn,
    winRateAllTime,
  };
}
