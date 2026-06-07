// ─────────────────────────────────────────────────────────────────────
// src/lib/meta-autonomy.js — Sprint Méta-autonomie
// ─────────────────────────────────────────────────────────────────────
// Volia s'auto-optimise. 3 fonctions :
//   1. rollupAutonomyMetrics() — daily 2h CET : aggregate autonomous_actions
//      par (date, action_type) → table autonomy_metrics_daily
//   2. runWeeklyAutonomyReview() — weekly mardi 10h CET : compile metrics 7j +
//      envoie email digest founder
//   3. generateRecommendations() — appel Claude qui analyse metrics +
//      propose new automations
// ─────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from './supabase-admin';
import { sendEmail } from './email';
import { isAutonomyEnabled, logAutonomousAction, enforceQuotaOrThrow } from './autonomy';

const CLAUDE_MODEL = 'claude-sonnet-4-6';
const FOUNDER_EMAIL = process.env.AUTONOMY_FOUNDER_EMAIL || 'anthony.malartre@suraya.fr';

// Coût estimé par action (en EUR). Hypothèses raisonnables sans API metering.
const COST_PER_ACTION = {
  linkedin_post: 0.02,                  // 1 Claude call court
  github_issue_create: 0.05,            // 1 Claude analyse
  faq_reply_proposal: 0.03,
  changelog_entry: 0.04,
  blog_post_draft: 0.30,                // 1 long-form 1500 mots Claude
  newsletter_send: 0.01,                // 1 email Resend
  bug_triage_from_email: 0.02,
  feature_request_logged: 0.01,
  reactivation_email_send: 0.001,       // 1 email Resend (template statique)
  github_pr_fix: 0.50,                  // 1 Claude long-form sur code
  trial_relance_email_send: 0.001,
  dogfood_outreach_run: 0.10,           // 20 Google Places calls
  demo_bot_message: 0.02,               // 1 Claude court
  autonomous_action: 0,                 // catch-all
};

// Valeur estimée par action (proxy MRR / brand impact). Conservateur.
const VALUE_PER_SUCCEEDED_ACTION = {
  linkedin_post: 0.50,                  // brand awareness, faible direct
  github_issue_create: 1.00,            // dette technique évitée
  faq_reply_proposal: 2.00,             // temps fondateur économisé
  changelog_entry: 0.30,
  blog_post_draft: 10.00,               // SEO long terme
  newsletter_send: 5.00,                // MRR retention
  bug_triage_from_email: 1.50,
  feature_request_logged: 0.50,
  reactivation_email_send: 3.00,        // si 5 % conversion @ 49€ = 2.45€ EV
  github_pr_fix: 15.00,                 // 1h fondateur économisée
  trial_relance_email_send: 8.00,       // hot lead = chance conversion élevée
  dogfood_outreach_run: 20.00,          // liste 50 prospects ICP
  demo_bot_message: 0.50,               // proxy lead nurturing
  autonomous_action: 0,
};

/**
 * Pour un actionType donné, retourne coût + valeur estimés en EUR.
 */
function estimateEcon(actionType, attempted, succeeded) {
  const cost = (COST_PER_ACTION[actionType] || 0) * attempted;
  const value = (VALUE_PER_SUCCEEDED_ACTION[actionType] || 0) * succeeded;
  return { cost, value };
}

/**
 * Agrège autonomous_actions de la veille dans autonomy_metrics_daily.
 * Idempotent : ON CONFLICT (date, action_type) DO UPDATE.
 */
export async function rollupAutonomyMetrics({ daysBack = 1 } = {}) {
  const startedAt = new Date().toISOString();
  const supabase = getSupabaseAdmin();

  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() - daysBack);
  const dateStr = targetDate.toISOString().slice(0, 10);

  const dayStart = `${dateStr}T00:00:00Z`;
  const dayEnd = `${dateStr}T23:59:59Z`;

  const { data: actions, error } = await supabase
    .from('autonomous_actions')
    .select('action_type, status')
    .gte('created_at', dayStart)
    .lte('created_at', dayEnd);

  if (error) return { ok: false, error: error.message, startedAt };

  if (!actions || actions.length === 0) {
    return { ok: true, date: dateStr, total: 0, action_types: 0, startedAt };
  }

  // Aggregate
  const byType = {};
  for (const a of actions) {
    if (!byType[a.action_type]) {
      byType[a.action_type] = { attempted: 0, succeeded: 0, failed: 0, skipped: 0 };
    }
    byType[a.action_type].attempted++;
    const s = (a.status || 'pending').toLowerCase();
    if (s === 'executed' || s === 'approved') byType[a.action_type].succeeded++;
    else if (s === 'failed' || s === 'error') byType[a.action_type].failed++;
    else if (s === 'skipped' || s === 'rejected') byType[a.action_type].skipped++;
  }

  // Upsert rows
  const rows = Object.entries(byType).map(([actionType, counts]) => {
    const econ = estimateEcon(actionType, counts.attempted, counts.succeeded);
    return {
      date: dateStr,
      action_type: actionType,
      attempted: counts.attempted,
      succeeded: counts.succeeded,
      failed: counts.failed,
      skipped: counts.skipped,
      est_cost_eur: Number(econ.cost.toFixed(4)),
      est_value_eur: Number(econ.value.toFixed(4)),
      computed_at: new Date().toISOString(),
    };
  });

  // Delete existing rows for that date+type then insert (Supabase v2 upsert)
  for (const row of rows) {
    await supabase
      .from('autonomy_metrics_daily')
      .delete()
      .eq('date', row.date)
      .eq('action_type', row.action_type);
  }
  const { error: insertErr } = await supabase.from('autonomy_metrics_daily').insert(rows);
  if (insertErr) return { ok: false, error: insertErr.message, startedAt };

  return {
    ok: true,
    date: dateStr,
    total: actions.length,
    action_types: rows.length,
    rows,
    startedAt,
  };
}

/**
 * Demande à Claude des recommendations basées sur les metrics 14 derniers jours.
 * Insert dans autonomy_recommendations.
 */
export async function generateRecommendations() {
  const supabase = getSupabaseAdmin();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400 * 1000).toISOString().slice(0, 10);

  const { data: metrics } = await supabase
    .from('autonomy_metrics_daily')
    .select('*')
    .gte('date', fourteenDaysAgo)
    .order('date', { ascending: false });

  if (!metrics || metrics.length === 0) {
    return { ok: false, error: 'no_metrics_data' };
  }

  // Aggregate par action_type sur 14j
  const summary = {};
  for (const m of metrics) {
    if (!summary[m.action_type]) {
      summary[m.action_type] = {
        attempted: 0, succeeded: 0, failed: 0, skipped: 0,
        cost: 0, value: 0,
      };
    }
    summary[m.action_type].attempted += m.attempted;
    summary[m.action_type].succeeded += m.succeeded;
    summary[m.action_type].failed += m.failed;
    summary[m.action_type].skipped += m.skipped;
    summary[m.action_type].cost += Number(m.est_cost_eur);
    summary[m.action_type].value += Number(m.est_value_eur);
  }

  // Prompt Claude
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: 'anthropic_not_configured' };
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const SYSTEM_PROMPT = `Tu es l'analyste autonomy de Volia.fr (SaaS B2B français).
Ton job : analyser les métriques des 14 derniers jours et proposer 2-4 recommandations actionnables.

Type de reco :
- NEW BOUCLE : nouvelle automatisation à créer
- OPTIMIZE : améliorer une boucle existante (low ROI, trop d'échecs, etc.)
- KILL : supprimer une boucle qui consomme sans apporter
- COMBINE : fusionner 2 boucles redondantes

FORMAT JSON strict :
{
  "recommendations": [
    {
      "title": "...",
      "rationale": "Pourquoi (1-2 phrases factuelles basées sur les chiffres)",
      "estimated_effort_hours": 2,
      "estimated_value_eur_month": 50,
      "pattern_detected": "Mention quel pattern dans les data",
      "type": "NEW" | "OPTIMIZE" | "KILL" | "COMBINE"
    }
  ]
}`;

  const userMessage = `Métriques 14 derniers jours :

${Object.entries(summary)
  .map(([type, s]) => {
    const roi = s.cost > 0 ? ((s.value - s.cost) / s.cost * 100).toFixed(0) : 'N/A';
    const successRate = s.attempted > 0 ? ((s.succeeded / s.attempted) * 100).toFixed(0) : '0';
    return `${type}: ${s.attempted} attempts (${successRate}% success, ${s.failed} fail, ${s.skipped} skip) | cost=${s.cost.toFixed(2)}€ value=${s.value.toFixed(2)}€ ROI=${roi}%`;
  })
  .join('\n')}

Analyse + propose 2-4 recommandations. JSON strict.`;

  let response;
  try {
    response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });
  } catch (err) {
    return { ok: false, error: 'claude_failed', detail: err.message };
  }

  const text = response.content[0]?.text || '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { ok: false, error: 'no_json_in_response' };
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    return { ok: false, error: 'json_parse_failed' };
  }

  const recos = parsed.recommendations || [];
  if (recos.length === 0) {
    return { ok: true, recommendations: [], summary };
  }

  // Insert recos
  const rows = recos.map((r) => ({
    title: (r.title || 'Sans titre').slice(0, 200),
    rationale: r.rationale || null,
    estimated_effort_hours: r.estimated_effort_hours || null,
    estimated_value_eur_month: r.estimated_value_eur_month || null,
    pattern_detected: r.pattern_detected || null,
    status: 'pending',
  }));
  await supabase.from('autonomy_recommendations').insert(rows);

  return { ok: true, recommendations: rows, summary };
}

/**
 * Email digest hebdomadaire à founder (mardi 10h CET).
 */
export async function runWeeklyAutonomyReview() {
  const startedAt = new Date().toISOString();

  const autonomyState = await isAutonomyEnabled();
  if (!autonomyState.enabled) {
    return { ok: true, skipped: true, reason: 'autonomy_disabled', startedAt };
  }

  try {
    await enforceQuotaOrThrow('weekly_autonomy_review', { perWeek: 2 });
  } catch (e) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: e.message, startedAt };
  }

  const supabase = getSupabaseAdmin();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString().slice(0, 10);

  // 1. Récupère metrics 7j
  const { data: metrics } = await supabase
    .from('autonomy_metrics_daily')
    .select('*')
    .gte('date', sevenDaysAgo);

  // Aggregate
  const summary = {};
  let totalCost = 0;
  let totalValue = 0;
  let totalAttempted = 0;
  let totalSucceeded = 0;
  for (const m of metrics || []) {
    if (!summary[m.action_type]) {
      summary[m.action_type] = {
        attempted: 0, succeeded: 0, failed: 0, skipped: 0,
        cost: 0, value: 0,
      };
    }
    const s = summary[m.action_type];
    s.attempted += m.attempted;
    s.succeeded += m.succeeded;
    s.failed += m.failed;
    s.skipped += m.skipped;
    s.cost += Number(m.est_cost_eur);
    s.value += Number(m.est_value_eur);
    totalCost += Number(m.est_cost_eur);
    totalValue += Number(m.est_value_eur);
    totalAttempted += m.attempted;
    totalSucceeded += m.succeeded;
  }

  // 2. Génère recommendations Claude
  const recosRes = await generateRecommendations();
  const recos = recosRes.ok ? recosRes.recommendations : [];

  // 3. Build email HTML
  const successRate = totalAttempted > 0 ? Math.round((totalSucceeded / totalAttempted) * 100) : 0;
  const roi = totalCost > 0 ? Math.round(((totalValue - totalCost) / totalCost) * 100) : 0;

  const html = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:680px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:22px;color:#111827;">📊 Volia — Weekly autonomy review</h1>
  <p style="font-size:14px;line-height:1.6;">Récap des boucles autonomes — 7 derniers jours.</p>

  <div style="margin:24px 0;padding:18px;background:#ede9fe;border-left:4px solid #6366f1;border-radius:6px;">
    <p style="margin:0;font-size:13px;color:#5b21b6;text-transform:uppercase;letter-spacing:0.05em;">Vue d'ensemble</p>
    <p style="margin:8px 0 0;font-size:14px;color:#374151;">
      <strong>${totalAttempted}</strong> actions tentées<br>
      <strong>${successRate}%</strong> success rate<br>
      Coût estimé : <strong>${totalCost.toFixed(2)}€</strong><br>
      Valeur estimée : <strong>${totalValue.toFixed(2)}€</strong><br>
      ROI : <strong style="color:${roi > 0 ? '#10b981' : '#ef4444'};">${roi}%</strong>
    </p>
  </div>

  <h2 style="font-size:16px;color:#111827;margin-top:24px;">Détail par boucle</h2>
  <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:12px;">
    <thead>
      <tr style="background:#f3f4f6;text-transform:uppercase;font-size:11px;letter-spacing:0.05em;">
        <th style="padding:6px;text-align:left;border:1px solid #e5e7eb;">Boucle</th>
        <th style="padding:6px;text-align:right;border:1px solid #e5e7eb;">Tent.</th>
        <th style="padding:6px;text-align:right;border:1px solid #e5e7eb;">OK%</th>
        <th style="padding:6px;text-align:right;border:1px solid #e5e7eb;">Coût</th>
        <th style="padding:6px;text-align:right;border:1px solid #e5e7eb;">Val.</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(summary)
        .sort((a, b) => b[1].value - a[1].value)
        .map(([type, s]) => {
          const sr = s.attempted > 0 ? Math.round((s.succeeded / s.attempted) * 100) : 0;
          return `<tr>
            <td style="padding:6px;border:1px solid #e5e7eb;font-family:monospace;">${type}</td>
            <td style="padding:6px;border:1px solid #e5e7eb;text-align:right;">${s.attempted}</td>
            <td style="padding:6px;border:1px solid #e5e7eb;text-align:right;">${sr}%</td>
            <td style="padding:6px;border:1px solid #e5e7eb;text-align:right;">${s.cost.toFixed(2)}€</td>
            <td style="padding:6px;border:1px solid #e5e7eb;text-align:right;">${s.value.toFixed(2)}€</td>
          </tr>`;
        })
        .join('')}
    </tbody>
  </table>

  ${recos.length > 0 ? `
  <h2 style="font-size:16px;color:#111827;margin-top:32px;">💡 Recommandations Claude (${recos.length})</h2>
  ${recos.map((r) => `
    <div style="margin:12px 0;padding:14px;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:4px;">
      <p style="margin:0;font-size:14px;font-weight:600;color:#92400e;">${r.title}</p>
      <p style="margin:6px 0 0;font-size:13px;color:#78350f;">${r.rationale || ''}</p>
      <p style="margin:8px 0 0;font-size:11px;color:#a16207;">
        Effort : ${r.estimated_effort_hours || '?'}h ·
        Valeur estimée : ${r.estimated_value_eur_month || '?'}€/mois ·
        Pattern : ${r.pattern_detected || 'n/a'}
      </p>
    </div>
  `).join('')}
  ` : ''}

  <p style="margin-top:32px;font-size:12px;color:#9ca3af;">
    Décide des recommandations sur <a href="https://volia.fr/admin/meta-autonomy" style="color:#6366f1;">volia.fr/admin/meta-autonomy</a><br>
    Auto-généré par cron meta-autonomy-weekly-review.
  </p>
</body></html>`;

  try {
    await sendEmail({
      to: FOUNDER_EMAIL,
      subject: `📊 Volia weekly autonomy — ROI ${roi}% (${totalAttempted} actions)`,
      html,
    });
  } catch (err) {
    console.error('[meta-autonomy] email send failed', err);
    return { ok: false, error: 'email_failed', detail: err.message, startedAt };
  }

  await logAutonomousAction({
    actionType: 'weekly_autonomy_review',
    source: 'cron/meta-autonomy-weekly-review',
    riskLevel: 'low',
    payload: {
      total_attempted: totalAttempted,
      success_rate: successRate,
      total_cost_eur: totalCost,
      total_value_eur: totalValue,
      roi_pct: roi,
      recommendations_count: recos.length,
    },
    preview: `📊 Weekly review envoyé : ${totalAttempted} actions / ROI ${roi}%`,
    rationale: 'Email digest hebdomadaire founder',
    autoExecute: true,
  });

  return {
    ok: true,
    total_attempted: totalAttempted,
    success_rate: successRate,
    total_cost_eur: totalCost,
    total_value_eur: totalValue,
    roi_pct: roi,
    recommendations_count: recos.length,
    startedAt,
  };
}
