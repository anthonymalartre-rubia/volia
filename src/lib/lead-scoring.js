// ─────────────────────────────────────────────────────────────────────
// src/lib/lead-scoring.js — Sprint Revenue Engine Phase 1
// ─────────────────────────────────────────────────────────────────────
// Calcule un score 0-100 pour chaque user actif (trial OU free récent).
// Le score reflète la probabilité que ce lead convertisse vers un plan
// payant. Utilisé par :
//   - /admin/lead-scoring (top 50 hot leads à contacter manuellement)
//   - lib/trial-relance.js (priorise les emails personnalisés sur les hot leads)
//
// Scoring rules (V1, basé sur signaux observables) :
//
//   BASE (trial / nouveau signup) :
//     - Trial actif (trial_ends_at > NOW) : +20
//     - Account < 7j : +10
//
//   ENGAGEMENT (current month usage_tracking) :
//     - searches > 0 : +10 / > 5 : +20 (cumul +30)
//     - enrichments > 0 : +15 / > 10 : +20 (cumul +35)
//     - exports > 0 : +10
//
//   USAGE QUALITY (CRM + campagnes + prospect_lists) :
//     - Has CRM deal : +25
//     - Has email campaign sent : +30
//     - Has prospect list ≥ 50 contacts : +15
//
//   RECENCY :
//     - last_score_at within 24h : pas de bonus particulier
//     - Account très récent (< 48h) : +10 (hot prospect frais)
//
//   NEGATIVE :
//     - plan='free' AND created_at > 30j AND searches < 5 : -20 (cold)
//     - churned_at NOT NULL : skip entièrement
//
// CAP : [0, 100]
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';

const SCORE_CAP = 100;
const SCORE_FLOOR = 0;
const BATCH_SIZE = 200; // users par batch lors du rebuild global

/**
 * Calcule le score pour un user donné.
 * Retourne { score, breakdown }.
 */
export async function computeLeadScore(userId) {
  const supabase = getSupabaseAdmin();

  // Charge le profil + trial info
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, plan, trial_started_at, trial_ends_at, trial_plan, trial_converted_at, churned_at, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) return { score: 0, breakdown: { error: 'no_profile' } };

  // Skip si churned
  if (profile.churned_at) {
    return { score: 0, breakdown: { skipped: 'churned' } };
  }
  // Skip si déjà converti (lead chaud devenu client → plus un lead)
  if (profile.trial_converted_at) {
    return { score: 0, breakdown: { skipped: 'converted' } };
  }

  const breakdown = {};
  let score = 0;
  const now = new Date();

  // ── BASE ───────────────────────────────────────────────
  const createdAt = profile.created_at ? new Date(profile.created_at) : null;
  const accountAgeDays = createdAt
    ? Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))
    : 999;

  const trialActive = profile.trial_ends_at && new Date(profile.trial_ends_at) > now;
  if (trialActive) {
    score += 20;
    breakdown.trial_active = 20;
  }
  if (accountAgeDays < 7) {
    score += 10;
    breakdown.account_fresh = 10;
  }
  if (accountAgeDays < 2) {
    score += 10;
    breakdown.account_very_fresh = 10;
  }

  // ── ENGAGEMENT (usage_tracking, mois courant) ──────────
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('searches, enrichments, exports')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .maybeSingle();

  const searches = usage?.searches || 0;
  const enrichments = usage?.enrichments || 0;
  const exportsCount = usage?.exports || 0;

  if (searches > 0) {
    const s = searches > 5 ? 30 : 10;
    score += s;
    breakdown.searches = s;
  }
  if (enrichments > 0) {
    const e = enrichments > 10 ? 35 : 15;
    score += e;
    breakdown.enrichments = e;
  }
  if (exportsCount > 0) {
    score += 10;
    breakdown.exports = 10;
  }

  // ── USAGE QUALITY (CRM + campagnes + listes) ───────────
  // CRM deals — table crm_deals si existe
  try {
    const { count: dealsCount } = await supabase
      .from('crm_deals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (dealsCount && dealsCount > 0) {
      score += 25;
      breakdown.has_crm_deal = 25;
    }
  } catch (_) {}

  // Email campagnes sent
  try {
    const { count: campaignsCount } = await supabase
      .from('email_campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['sent', 'sending', 'completed']);
    if (campaignsCount && campaignsCount > 0) {
      score += 30;
      breakdown.has_campaign_sent = 30;
    }
  } catch (_) {}

  // Prospect lists ≥ 50 contacts
  try {
    const { data: lists } = await supabase
      .from('prospect_lists')
      .select('id, contacts_count')
      .eq('user_id', userId);
    if (lists?.some((l) => (l.contacts_count || 0) >= 50)) {
      score += 15;
      breakdown.has_large_list = 15;
    }
  } catch (_) {}

  // ── NEGATIVE : free cold ────────────────────────────────
  if (profile.plan === 'free' && accountAgeDays > 30 && searches < 5) {
    score -= 20;
    breakdown.cold_free_user = -20;
  }

  // CAP
  score = Math.max(SCORE_FLOOR, Math.min(SCORE_CAP, score));
  breakdown._total = score;

  return { score, breakdown };
}

/**
 * Rebuild le score pour TOUS les users non-churned, non-converted.
 * Appelé par cron daily.
 */
export async function rebuildAllLeadScores() {
  const supabase = getSupabaseAdmin();
  const startedAt = new Date().toISOString();

  // Liste tous les users candidates au scoring
  const { data: candidates, error } = await supabase
    .from('user_profiles')
    .select('id')
    .is('churned_at', null)
    .is('trial_converted_at', null)
    .limit(5000); // safety cap

  if (error) return { ok: false, error: error.message, startedAt };
  if (!candidates || candidates.length === 0) {
    return { ok: true, processed: 0, startedAt };
  }

  let processed = 0;
  let errors = 0;

  // Process par batches pour éviter timeouts
  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE);
    const updates = [];

    for (const { id } of batch) {
      try {
        const { score, breakdown } = await computeLeadScore(id);
        updates.push({ id, score, breakdown });
      } catch (err) {
        console.error(`[lead-scoring] computeLeadScore failed for ${id}`, err);
        errors++;
      }
    }

    // Bulk update (un par un car Supabase n'a pas de UPSERT bulk easy)
    for (const u of updates) {
      const { error: updErr } = await supabase
        .from('user_profiles')
        .update({
          lead_score: u.score,
          score_breakdown: u.breakdown,
          last_score_at: new Date().toISOString(),
        })
        .eq('id', u.id);
      if (updErr) errors++;
      else processed++;
    }
  }

  return { ok: true, processed, errors, total_candidates: candidates.length, startedAt };
}

/**
 * Retourne les top N hot leads (pour /admin/lead-scoring UI).
 */
export async function getTopHotLeads(limit = 50) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, plan, trial_plan, trial_started_at, trial_ends_at, lead_score, score_breakdown, last_score_at, created_at')
    .gt('lead_score', 0)
    .is('churned_at', null)
    .is('trial_converted_at', null)
    .order('lead_score', { ascending: false })
    .limit(limit);
  if (error) return { ok: false, error: error.message };
  return { ok: true, leads: data || [] };
}
