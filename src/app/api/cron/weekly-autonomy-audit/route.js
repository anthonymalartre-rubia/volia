// ─────────────────────────────────────────────────────────────────────
// /api/cron/weekly-autonomy-audit — Rapport hebdo founder (lundi 9h)
// ─────────────────────────────────────────────────────────────────────
// Schedule : "0 9 * * 1" (lundi 9h CET, après anomaly-detection 8h)
//
// Envoie un email récap au founder avec :
//   - Posts publiés cette semaine (avec URL cliquables)
//   - Stats : approuvé / rejeté / failed / pending / cancelled
//   - Cron heartbeat (qui a tourné cette semaine)
//   - Coût Claude API estimé
//   - Utilisation quotas
//   - Comparaison sem-1
//   - Top 3 commentaires recommandations
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { cleanEnv } from '@/lib/envClean';
import { getQuotaUsageReport } from '@/lib/autonomy';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const FOUNDER_EMAIL = 'anthony.malartre@suraya.fr';
const COST_PER_CALL_USD = 0.013;
const USD_TO_EUR = 0.92;

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const weekAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400 * 1000).toISOString();

  // 1. Actions de la semaine par statut
  const { data: allActionsWeek } = await supabase
    .from('autonomous_actions')
    .select('id, action_type, status, source, preview, result, error, created_at, executed_at')
    .gte('created_at', weekAgo)
    .order('created_at', { ascending: false });

  const actions = allActionsWeek || [];
  const byStatus = {
    pending: actions.filter((a) => a.status === 'pending').length,
    approved: actions.filter((a) => a.status === 'approved').length,
    executed: actions.filter((a) => a.status === 'executed').length,
    rejected: actions.filter((a) => a.status === 'rejected').length,
    failed: actions.filter((a) => a.status === 'failed').length,
    cancelled: actions.filter((a) => a.status === 'cancelled').length,
  };

  // 2. Posts publiés avec URL
  const publishedPosts = actions
    .filter((a) => a.status === 'executed' && a.action_type === 'linkedin_post')
    .map((a) => ({
      url: a.result?.linkedin?.url || null,
      preview: (a.preview || '').slice(0, 140),
      executed_at: a.executed_at,
    }))
    .filter((p) => p.url);

  // 3. Comparaison sem-1
  const { count: lastWeekExecuted } = await supabase
    .from('autonomous_actions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'executed')
    .gte('created_at', twoWeeksAgo)
    .lt('created_at', weekAgo);

  // 4. Cron heartbeat (sources distinctes ayant tourné cette semaine)
  const { data: sourcesData } = await supabase
    .from('autonomous_actions')
    .select('source')
    .gte('created_at', weekAgo);
  const cronsRun = [...new Set((sourcesData || []).map((s) => s.source))];

  // 5. Coût estimé
  const estimatedCostEur = (actions.length * COST_PER_CALL_USD * USD_TO_EUR).toFixed(2);

  // 6. Quotas
  const quotaReport = await getQuotaUsageReport();

  // 7. Recommandations basées sur patterns
  const recommendations = generateRecommendations(actions, byStatus, publishedPosts);

  const html = buildAuditEmailHtml({
    weekStart: new Date(weekAgo).toLocaleDateString('fr-FR'),
    weekEnd: new Date().toLocaleDateString('fr-FR'),
    byStatus,
    publishedPosts,
    lastWeekExecuted: lastWeekExecuted || 0,
    cronsRun,
    estimatedCostEur,
    quotaReport,
    recommendations,
    totalActions: actions.length,
  });

  try {
    await sendEmail({
      to: FOUNDER_EMAIL,
      subject: `📊 Rapport autonomy Volia — semaine du ${new Date(weekAgo).toLocaleDateString('fr-FR')}`,
      html,
    });
  } catch (e) {
    console.error('[weekly-audit] email send failed', e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    sent_to: FOUNDER_EMAIL,
    stats: byStatus,
    published_count: publishedPosts.length,
    estimated_cost_eur: estimatedCostEur,
    crons_run: cronsRun.length,
    recommendations_count: recommendations.length,
  });
}

function generateRecommendations(actions, byStatus, publishedPosts) {
  const recs = [];
  const total = actions.length;
  if (total === 0) return [{ msg: 'Aucune action cette semaine — vérifier si les crons tournent.' }];

  if (byStatus.rejected / total > 0.5) {
    recs.push({ msg: `${((byStatus.rejected / total) * 100).toFixed(0)}% des brouillons rejetés. Ajuster le prompt content-proposer (ton trop X ou trop Y ?).` });
  }
  if (byStatus.failed > 0) {
    recs.push({ msg: `${byStatus.failed} action(s) failed. Vérifier les tokens publishers (peut-être LinkedIn expiré ?).` });
  }
  if (publishedPosts.length === 0 && byStatus.approved > 0) {
    recs.push({ msg: 'Actions approuvées non publiées — vérifier que le cron publish-approved-actions tourne.' });
  }
  if (publishedPosts.length === 0) {
    recs.push({ msg: 'Aucun post publié cette semaine. Considérer générer un brouillon manuellement depuis /admin/auto-queue.' });
  }
  if (publishedPosts.length >= 5) {
    recs.push({ msg: 'Bonne cadence. Penser à varier les frameworks (pricing call-out, mythe démoli, fact-bomb, etc.) — Claude tend à se répéter.' });
  }
  return recs;
}

function buildAuditEmailHtml({ weekStart, weekEnd, byStatus, publishedPosts, lastWeekExecuted, cronsRun, estimatedCostEur, quotaReport, recommendations, totalActions }) {
  const publishedRows = publishedPosts.length === 0
    ? `<tr><td colspan="2" style="padding:12px;color:#9ca3af;font-style:italic;border:1px solid #e5e7eb;">Aucun post publié cette semaine</td></tr>`
    : publishedPosts.map((p) => `
      <tr>
        <td style="padding:10px;border:1px solid #e5e7eb;font-size:12px;color:#6b7280;white-space:nowrap;">${new Date(p.executed_at).toLocaleDateString('fr-FR')}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;font-size:13px;">
          <a href="${p.url}" style="color:#6366f1;">${p.preview}…</a>
        </td>
      </tr>`).join('');

  const cronsRows = cronsRun.length === 0
    ? `<li style="color:#dc2626;">⚠️ Aucun cron n'a tourné cette semaine — vérifier Vercel</li>`
    : cronsRun.map((c) => `<li><code style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-size:11px;">${c}</code></li>`).join('');

  const recsRows = recommendations.map((r) => `<li style="margin:6px 0;">${r.msg}</li>`).join('');

  const quotaRows = Object.entries(quotaReport)
    .filter(([_, usage]) => Object.keys(usage).length > 0)
    .map(([actionType, usage]) => {
      const cells = [];
      for (const window of ['day', 'week', 'month']) {
        if (usage[window]) {
          const pct = (usage[window].current / usage[window].limit) * 100;
          const color = pct >= 80 ? '#dc2626' : pct >= 50 ? '#d97706' : '#65a30d';
          cells.push(`<td style="padding:8px;border:1px solid #e5e7eb;text-align:center;font-size:11px;color:${color};font-weight:600;">${usage[window].current}/${usage[window].limit}</td>`);
        } else {
          cells.push(`<td style="padding:8px;border:1px solid #e5e7eb;text-align:center;font-size:11px;color:#d1d5db;">—</td>`);
        }
      }
      return `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:12px;font-family:monospace;">${actionType}</td>${cells.join('')}</tr>`;
    }).join('');

  return `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:720px;margin:0 auto;padding:24px;background:#f9fafb;color:#111827;">
  <h1 style="font-size:22px;margin:0 0 4px;">📊 Rapport autonomy Volia</h1>
  <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">Semaine du ${weekStart} au ${weekEnd}</p>

  <!-- KPIs ligne -->
  <div style="display:flex;gap:8px;margin:16px 0;flex-wrap:wrap;">
    <div style="flex:1;min-width:140px;padding:12px;background:white;border:1px solid #e5e7eb;border-radius:6px;">
      <div style="font-size:11px;color:#6b7280;text-transform:uppercase;">Posts publiés</div>
      <div style="font-size:24px;font-weight:700;color:#10b981;">${publishedPosts.length}</div>
      <div style="font-size:11px;color:#6b7280;">vs ${lastWeekExecuted} sem-1</div>
    </div>
    <div style="flex:1;min-width:140px;padding:12px;background:white;border:1px solid #e5e7eb;border-radius:6px;">
      <div style="font-size:11px;color:#6b7280;text-transform:uppercase;">Actions totales</div>
      <div style="font-size:24px;font-weight:700;">${totalActions}</div>
      <div style="font-size:11px;color:#6b7280;">${byStatus.rejected} rejetées · ${byStatus.failed} failed</div>
    </div>
    <div style="flex:1;min-width:140px;padding:12px;background:white;border:1px solid #e5e7eb;border-radius:6px;">
      <div style="font-size:11px;color:#6b7280;text-transform:uppercase;">Coût IA</div>
      <div style="font-size:24px;font-weight:700;color:#6366f1;">${estimatedCostEur}€</div>
      <div style="font-size:11px;color:#6b7280;">~${totalActions} appels Claude</div>
    </div>
  </div>

  <!-- Posts publiés -->
  <h2 style="font-size:16px;margin:24px 0 8px;">🚀 Posts publiés</h2>
  <table style="width:100%;border-collapse:collapse;background:white;">${publishedRows}</table>

  <!-- Recommandations -->
  ${recommendations.length > 0 ? `
  <h2 style="font-size:16px;margin:24px 0 8px;">💡 Recommandations</h2>
  <ul style="color:#374151;font-size:13px;line-height:1.6;background:white;border:1px solid #e5e7eb;border-radius:6px;padding:12px 28px;">${recsRows}</ul>
  ` : ''}

  <!-- Quotas -->
  <h2 style="font-size:16px;margin:24px 0 8px;">📏 Utilisation quotas</h2>
  <table style="width:100%;border-collapse:collapse;background:white;">
    <thead><tr style="background:#f3f4f6;">
      <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;font-size:11px;">Action type</th>
      <th style="padding:8px;border:1px solid #e5e7eb;font-size:11px;">Jour</th>
      <th style="padding:8px;border:1px solid #e5e7eb;font-size:11px;">Semaine</th>
      <th style="padding:8px;border:1px solid #e5e7eb;font-size:11px;">Mois</th>
    </tr></thead>
    <tbody>${quotaRows}</tbody>
  </table>

  <!-- Crons heartbeat -->
  <h2 style="font-size:16px;margin:24px 0 8px;">❤️ Cron heartbeat</h2>
  <ul style="color:#374151;font-size:13px;line-height:1.6;">${cronsRows}</ul>

  <!-- CTA -->
  <div style="margin-top:32px;text-align:center;">
    <a href="https://volia.fr/admin/auto-queue" style="display:inline-block;padding:10px 20px;background:#6366f1;color:white;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Voir la queue d'approbation →</a>
  </div>

  <p style="color:#9ca3af;font-size:11px;margin-top:32px;text-align:center;">
    Cron weekly audit · Volia autonomy v1 · Désactiver depuis <a href="https://volia.fr/admin/auto-queue" style="color:#9ca3af;">/admin/auto-queue</a>
  </p>
</body></html>`;
}
