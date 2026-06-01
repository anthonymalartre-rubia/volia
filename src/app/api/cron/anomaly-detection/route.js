// ─────────────────────────────────────────────────────────────────────
// /api/cron/anomaly-detection — Détecte les dérives autonomy + alerte
// ─────────────────────────────────────────────────────────────────────
// Schedule : "0 8 * * 1" (lundi 8h CET, avant le weekly audit de 9h)
//
// Surveille :
//   - Spike posts publiés cette semaine vs sem-1 (>+200% = anomalie)
//   - Taux rejected % global (>80% = anomalie ton ou prompt mauvais)
//   - Taux failed % (>30% = problème API/token)
//   - Cron heartbeat manqué (auto-content-proposer doit tourner lu-ve 10h)
//   - Coût Claude estimé cette semaine (>$10/sem = alerte cost)
//
// Action si anomalie :
//   - Email founder via Resend avec détail + bouton "Désactiver autonomy"
//   - Log dans audit_log
//   - Ne désactive PAS automatiquement (founder décide)
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { cleanEnv } from '@/lib/envClean';
import { getQuotaUsageReport } from '@/lib/autonomy';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const FOUNDER_EMAIL = 'anthony.malartre@suraya.fr';

// Seuils d'anomalie
const THRESHOLDS = {
  spike_publish_pct: 200, // +200% = spike anormal
  rejected_pct_max: 80,   // >80% rejected = ton mauvais
  failed_pct_max: 30,     // >30% failed = problème technique
  estimated_cost_max_eur: 10, // >10€/sem = coût anormal
};

// Coût approximatif Claude Sonnet 4 : $3/M input + $15/M output
// Par appel : ~500 tokens input + ~800 tokens output = $0.013/appel
const COST_PER_CALL_USD = 0.013;
const USD_TO_EUR = 0.92;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const anomalies = [];

  // ─── 1. Comparaison posts publiés cette sem vs sem-1 ─────────
  const weekAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400 * 1000).toISOString();

  const { count: thisWeekPublished } = await supabase
    .from('autonomous_actions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'executed')
    .eq('action_type', 'linkedin_post')
    .gte('executed_at', weekAgo);

  const { count: lastWeekPublished } = await supabase
    .from('autonomous_actions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'executed')
    .eq('action_type', 'linkedin_post')
    .gte('executed_at', twoWeeksAgo)
    .lt('executed_at', weekAgo);

  if (lastWeekPublished > 0) {
    const pctChange = ((thisWeekPublished - lastWeekPublished) / lastWeekPublished) * 100;
    if (Math.abs(pctChange) > THRESHOLDS.spike_publish_pct) {
      anomalies.push({
        type: 'publish_spike',
        severity: 'medium',
        message: `Posts publiés cette semaine : ${thisWeekPublished} (vs ${lastWeekPublished} sem-1, ${pctChange.toFixed(0)}%)`,
      });
    }
  }

  // ─── 2. Taux rejected % global (proxy : ton/prompt qualité) ───
  const { count: rejectedWeek } = await supabase
    .from('autonomous_actions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'rejected')
    .gte('created_at', weekAgo);

  const { count: totalWeek } = await supabase
    .from('autonomous_actions')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', weekAgo);

  if (totalWeek >= 3) {
    const rejectedPct = (rejectedWeek / totalWeek) * 100;
    if (rejectedPct > THRESHOLDS.rejected_pct_max) {
      anomalies.push({
        type: 'high_rejection_rate',
        severity: 'high',
        message: `${rejectedPct.toFixed(0)}% des actions rejetées cette semaine (${rejectedWeek}/${totalWeek}) — qualité du prompt à revoir`,
      });
    }
  }

  // ─── 3. Taux failed % (proxy : problème API/token) ───────────
  const { count: failedWeek } = await supabase
    .from('autonomous_actions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('created_at', weekAgo);

  if (totalWeek >= 3) {
    const failedPct = (failedWeek / totalWeek) * 100;
    if (failedPct > THRESHOLDS.failed_pct_max) {
      anomalies.push({
        type: 'high_failure_rate',
        severity: 'high',
        message: `${failedPct.toFixed(0)}% des actions failed cette semaine (${failedWeek}/${totalWeek}) — token LinkedIn expiré ? API down ?`,
      });
    }
  }

  // ─── 4. Coût Claude estimé ───────────────────────────────────
  // Approximation : nb actions générées (pending + approved + executed + rejected) × COST_PER_CALL
  const generatedWeek = totalWeek; // une action = un appel Claude pour la générer
  const estimatedCostUsd = generatedWeek * COST_PER_CALL_USD;
  const estimatedCostEur = estimatedCostUsd * USD_TO_EUR;

  if (estimatedCostEur > THRESHOLDS.estimated_cost_max_eur) {
    anomalies.push({
      type: 'cost_overrun',
      severity: 'medium',
      message: `Coût Claude estimé cette semaine : ${estimatedCostEur.toFixed(2)}€ (${generatedWeek} appels × $${COST_PER_CALL_USD}) — au-dessus du seuil ${THRESHOLDS.estimated_cost_max_eur}€`,
    });
  }

  // ─── 5. Heartbeat cron auto-content-proposer ─────────────────
  // Devrait avoir tourné au moins 1× ces 7 derniers jours en semaine
  // (lu-ve 10h CET). Si rien depuis 8 jours → cron silencieusement broken.
  const { data: lastProposerRun } = await supabase
    .from('autonomous_actions')
    .select('created_at')
    .eq('source', 'cron/auto-content-proposer')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastProposerRun || new Date(lastProposerRun.created_at).getTime() < Date.now() - 8 * 86400 * 1000) {
    anomalies.push({
      type: 'cron_heartbeat_missing',
      severity: 'high',
      message: `Cron auto-content-proposer n'a pas tourné depuis 8+ jours. Vérifier Vercel cron logs.`,
    });
  }

  // ─── 6. Quotas utilisation ──────────────────────────────────
  const quotaReport = await getQuotaUsageReport();
  const quotaWarnings = [];
  for (const [actionType, usage] of Object.entries(quotaReport)) {
    for (const window of ['day', 'week', 'month']) {
      if (usage[window] && usage[window].current >= usage[window].limit * 0.8) {
        quotaWarnings.push({
          actionType,
          window,
          current: usage[window].current,
          limit: usage[window].limit,
          pct: ((usage[window].current / usage[window].limit) * 100).toFixed(0),
        });
      }
    }
  }
  if (quotaWarnings.length > 0) {
    anomalies.push({
      type: 'quota_near_limit',
      severity: 'low',
      message: `${quotaWarnings.length} quota(s) à >80% : ${quotaWarnings.map((w) => `${w.actionType} ${w.window} ${w.pct}%`).join(', ')}`,
    });
  }

  // ─── Envoi email si anomalies ──────────────────────────────────
  if (anomalies.length === 0) {
    return NextResponse.json({
      ok: true,
      anomalies_detected: 0,
      summary: 'Tout va bien, pas d\'anomalie.',
      metrics: { thisWeekPublished, lastWeekPublished, rejectedWeek, failedWeek, totalWeek, estimatedCostEur: estimatedCostEur.toFixed(2) },
    });
  }

  const html = buildAnomalyEmailHtml(anomalies, { thisWeekPublished, lastWeekPublished, rejectedWeek, failedWeek, totalWeek, estimatedCostEur });
  try {
    await sendEmail({
      to: FOUNDER_EMAIL,
      subject: `🚨 ${anomalies.length} anomalie(s) Volia autonomy — semaine du ${new Date().toLocaleDateString('fr-FR')}`,
      html,
    });
  } catch (e) {
    console.error('[anomaly-detection] email send failed', e);
  }

  return NextResponse.json({
    ok: true,
    anomalies_detected: anomalies.length,
    anomalies,
    metrics: { thisWeekPublished, lastWeekPublished, rejectedWeek, failedWeek, totalWeek, estimatedCostEur: estimatedCostEur.toFixed(2) },
  });
}

function buildAnomalyEmailHtml(anomalies, metrics) {
  const rows = anomalies.map((a) => {
    const color = a.severity === 'high' ? '#dc2626' : a.severity === 'medium' ? '#d97706' : '#65a30d';
    return `
      <tr>
        <td style="padding:10px;border:1px solid #e5e7eb;color:${color};font-weight:600;text-transform:uppercase;font-size:11px;">${a.severity}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;font-family:monospace;font-size:12px;">${a.type}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;font-size:13px;">${a.message}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:680px;margin:0 auto;padding:24px;background:#f9fafb;">
  <h1 style="color:#dc2626;font-size:22px;margin:0 0 12px;">🚨 Anomalies autonomy détectées</h1>
  <p style="color:#374151;font-size:14px;">${anomalies.length} anomalie(s) sur les boucles auto-pilote Volia cette semaine. Détail ci-dessous.</p>

  <table style="width:100%;border-collapse:collapse;margin:16px 0;background:white;">
    <thead><tr style="background:#f3f4f6;">
      <th style="padding:10px;text-align:left;border:1px solid #e5e7eb;font-size:11px;">Sévérité</th>
      <th style="padding:10px;text-align:left;border:1px solid #e5e7eb;font-size:11px;">Type</th>
      <th style="padding:10px;text-align:left;border:1px solid #e5e7eb;font-size:11px;">Message</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <h2 style="color:#111827;font-size:16px;margin:24px 0 8px;">Métriques semaine</h2>
  <ul style="color:#374151;font-size:13px;line-height:1.7;">
    <li>Posts LinkedIn publiés : <b>${metrics.thisWeekPublished}</b> (vs ${metrics.lastWeekPublished} sem-1)</li>
    <li>Actions totales générées : <b>${metrics.totalWeek}</b></li>
    <li>Rejetées : ${metrics.rejectedWeek}</li>
    <li>Failed : ${metrics.failedWeek}</li>
    <li>Coût Claude API estimé : <b>${metrics.estimatedCostEur.toFixed(2)}€</b></li>
  </ul>

  <div style="margin-top:24px;padding:16px;background:#fef3c7;border-left:4px solid #d97706;border-radius:6px;">
    <p style="color:#92400e;font-size:13px;margin:0;">
      <strong>Action immédiate possible :</strong> désactiver autonomy en 1 clic depuis
      <a href="https://volia.fr/admin/auto-queue" style="color:#92400e;">/admin/auto-queue</a>
      (bouton Kill switch).
    </p>
  </div>

  <p style="color:#6b7280;font-size:11px;margin-top:24px;text-align:center;">
    Cron weekly anomaly detection · Volia autonomy v1 · <a href="https://volia.fr/admin/auto-queue" style="color:#6b7280;">Approval queue</a>
  </p>
</body></html>`;
}
