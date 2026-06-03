// ─────────────────────────────────────────────────────────────────────
// src/lib/weekly-value-report.js — Wave 2.3 Growth Loops
// ─────────────────────────────────────────────────────────────────────
// Cron dimanche 19h CET. Chaque user payant non-churned reçoit un email
// "Voici ce que Volia t'a fait gagner cette semaine".
//
// Contenu :
//   - Searches cette sem vs sem précédente
//   - Enrichments
//   - Deals créés CRM
//   - Campagnes envoyées
//   - Comparaison mois dernier
//
// Cible : retention +8% via sentiment de valeur perçue continue.
// Idempotent : 1 email max /user /semaine.
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';
import { sendEmail } from './email';
import { isGrowthLoopsEnabled } from './growth-loops-base';
import { enforceQuotaOrThrow, logAutonomousAction } from './autonomy';

const MAX_PER_RUN = 200;
const COOLDOWN_DAYS = 6;

async function getUserContact(supabase, userId) {
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  const email = authUser?.user?.email || null;
  const firstName = authUser?.user?.user_metadata?.first_name
    || (email ? email.split('@')[0] : null);
  return { email, firstName };
}

async function computeUserStats(supabase, userId) {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toISOString().slice(0, 7);
  const weekAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();

  // Usage tracking
  const { data: usageRows } = await supabase
    .from('usage_tracking')
    .select('month, searches, enrichments, exports')
    .eq('user_id', userId)
    .in('month', [currentMonth, prevMonth]);
  const current = usageRows?.find((r) => r.month === currentMonth) || {};
  const prev = usageRows?.find((r) => r.month === prevMonth) || {};

  // Deals CRM cette sem
  let dealsThisWeek = 0;
  try {
    const { count } = await supabase
      .from('crm_deals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', weekAgo);
    dealsThisWeek = count || 0;
  } catch {}

  // Campagnes lancées cette sem (FIX: la table utilise owner_id, pas user_id —
  // l'ancienne requête renvoyait toujours 0). On récupère aussi les ids pour
  // compter les emails (email_sends n'a pas de user_id → via campaign_id).
  let campaignsThisWeek = 0;
  let campaignIds = [];
  try {
    const { data: camps } = await supabase
      .from('email_campaigns')
      .select('id, created_at')
      .eq('owner_id', userId);
    campaignIds = (camps || []).map((c) => c.id);
    campaignsThisWeek = (camps || []).filter((c) => c.created_at && c.created_at >= weekAgo).length;
  } catch {}

  // Emails envoyés cette sem (FIX: via campaign_id, pas user_id)
  let emailsSentThisWeek = 0;
  if (campaignIds.length) {
    try {
      const { count } = await supabase
        .from('email_sends')
        .select('id', { count: 'exact', head: true })
        .in('campaign_id', campaignIds)
        .gte('sent_at', weekAgo);
      emailsSentThisWeek = count || 0;
    } catch {}
  }

  // Autopilot — leads chauds cette sem (score>=70 + form rempli), via workflows
  let hotLeadsThisWeek = 0;
  try {
    const { data: wfs } = await supabase
      .from('autopilot_workflows')
      .select('id')
      .eq('user_id', userId);
    const wfIds = (wfs || []).map((x) => x.id);
    if (wfIds.length) {
      const { count } = await supabase
        .from('autopilot_executions')
        .select('id', { count: 'exact', head: true })
        .in('workflow_id', wfIds)
        .gte('computed_score', 70)
        .gte('form_submitted_at', weekAgo);
      hotLeadsThisWeek = count || 0;
    }
  } catch {}

  // Estimate this week from current month (rough)
  const dayOfMonth = now.getDate();
  const weekRatio = Math.min(1, 7 / dayOfMonth);
  const searchesThisWeek = Math.round((current.searches || 0) * weekRatio);
  const enrichmentsThisWeek = Math.round((current.enrichments || 0) * weekRatio);

  return {
    week: {
      searches: searchesThisWeek,
      enrichments: enrichmentsThisWeek,
      deals: dealsThisWeek,
      campaigns: campaignsThisWeek,
      emails_sent: emailsSentThisWeek,
      hot_leads: hotLeadsThisWeek,
    },
    month: {
      searches_current: current.searches || 0,
      searches_prev: prev.searches || 0,
      enrichments_current: current.enrichments || 0,
      enrichments_prev: prev.enrichments || 0,
    },
    total_activity_score:
      searchesThisWeek + enrichmentsThisWeek + dealsThisWeek * 3 + campaignsThisWeek * 2,
  };
}

function buildEmail({ firstName, stats }) {
  const name = firstName || 'toi';
  const w = stats.week;
  const m = stats.month;
  const delta = m.searches_current - m.searches_prev;
  const deltaStr =
    delta > 0 ? `<span style="color:#10b981;font-weight:bold;">+${delta}</span>` :
    delta < 0 ? `<span style="color:#ef4444;font-weight:bold;">${delta}</span>` :
    `<span style="color:#6b7280;">±0</span>`;

  return {
    subject: `${name} — ta semaine Volia en 30 secondes 📊`,
    html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <h1 style="font-size:22px;color:#111827;">Salut ${name},</h1>
  <p style="font-size:14px;line-height:1.6;">
    Ton récap Volia de la semaine — 30 secondes de lecture, promis.
  </p>

  <div style="margin:24px 0;padding:20px;background:linear-gradient(135deg,#ede9fe,#ddd6fe);border-radius:12px;">
    <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6366f1;font-weight:bold;">Cette semaine sur Volia</p>
    <table style="width:100%;font-size:14px;color:#374151;">
      <tr>
        <td style="padding:6px 0;">🔍 Recherches</td>
        <td style="padding:6px 0;text-align:right;font-weight:bold;font-size:18px;color:#5b21b6;">${w.searches}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;">✉️ Emails enrichis</td>
        <td style="padding:6px 0;text-align:right;font-weight:bold;font-size:18px;color:#5b21b6;">${w.enrichments}</td>
      </tr>
      ${w.campaigns > 0 ? `<tr>
        <td style="padding:6px 0;">📤 Campagnes lancées</td>
        <td style="padding:6px 0;text-align:right;font-weight:bold;font-size:18px;color:#5b21b6;">${w.campaigns}</td>
      </tr>` : ''}
      ${w.emails_sent > 0 ? `<tr>
        <td style="padding:6px 0;">📨 Emails envoyés</td>
        <td style="padding:6px 0;text-align:right;font-weight:bold;font-size:18px;color:#5b21b6;">${w.emails_sent}</td>
      </tr>` : ''}
      ${w.hot_leads > 0 ? `<tr>
        <td style="padding:6px 0;">🔥 Leads chauds (Autopilot)</td>
        <td style="padding:6px 0;text-align:right;font-weight:bold;font-size:18px;color:#be123c;">${w.hot_leads}</td>
      </tr>` : ''}
      ${w.deals > 0 ? `<tr>
        <td style="padding:6px 0;">💼 Deals CRM créés</td>
        <td style="padding:6px 0;text-align:right;font-weight:bold;font-size:18px;color:#5b21b6;">${w.deals}</td>
      </tr>` : ''}
    </table>
  </div>

  <p style="font-size:13px;line-height:1.6;color:#6b7280;">
    <strong>Tendance mensuelle</strong> : ${m.searches_current} recherches ce mois vs ${m.searches_prev} le mois dernier (${deltaStr})
  </p>

  ${w.searches === 0 && w.enrichments === 0 && w.deals === 0 && w.emails_sent === 0 && w.hot_leads === 0 ? `
  <div style="margin:20px 0;padding:14px;background:#fef3c7;border-left:3px solid #f59e0b;border-radius:4px;">
    <p style="margin:0;font-size:13px;color:#92400e;">
      0 activité cette semaine. Tu galères sur quelque chose ? Réponds à ce mail, je débloque.
    </p>
  </div>
  ` : ''}

  <p style="font-size:14px;line-height:1.6;margin-top:24px;text-align:center;">
    <a href="https://volia.fr/dashboard" style="display:inline-block;padding:12px 28px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Ouvrir Volia</a>
  </p>

  <p style="font-size:13px;color:#6b7280;line-height:1.6;margin-top:24px;">
    Tu reçois ce récap chaque dimanche soir. Pour te désinscrire : <a href="https://volia.fr/settings" style="color:#9ca3af;">paramètres</a>.
  </p>

  <p style="font-size:14px;line-height:1.6;margin-top:24px;">Anthony — Fondateur Volia</p>
</body></html>`,
    text: `Salut ${name},

Ta semaine Volia :
- ${w.searches} recherches
- ${w.enrichments} emails enrichis
${w.campaigns > 0 ? `- ${w.campaigns} campagnes lancées\n` : ''}${w.emails_sent > 0 ? `- ${w.emails_sent} emails envoyés\n` : ''}${w.deals > 0 ? `- ${w.deals} deals CRM créés\n` : ''}

Tendance mensuelle : ${m.searches_current} ce mois vs ${m.searches_prev} le mois dernier (delta ${delta >= 0 ? '+' : ''}${delta})

→ https://volia.fr/dashboard

Anthony — Volia`,
  };
}

export async function runWeeklyValueReport() {
  const startedAt = new Date().toISOString();

  const state = await isGrowthLoopsEnabled();
  if (!state.enabled) {
    return { ok: true, skipped: true, reason: state.reason, startedAt };
  }

  try {
    await enforceQuotaOrThrow('weekly_value_report_email', { perDay: 300 });
  } catch (e) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: e.message, startedAt };
  }

  const supabase = getSupabaseAdmin();
  const cooldownCutoff = new Date(Date.now() - COOLDOWN_DAYS * 86400 * 1000).toISOString();

  const { data: paidUsers } = await supabase
    .from('user_profiles')
    .select('id, plan, weekly_value_email_last_sent_at')
    .neq('plan', 'free')
    .is('churned_at', null)
    .or(`weekly_value_email_last_sent_at.is.null,weekly_value_email_last_sent_at.lt.${cooldownCutoff}`)
    .limit(MAX_PER_RUN);

  if (!paidUsers || paidUsers.length === 0) {
    return { ok: true, processed: 0, startedAt };
  }

  const results = { sent: [], skipped: [], errors: [] };

  for (const user of paidUsers) {
    const { email, firstName } = await getUserContact(supabase, user.id);
    if (!email) {
      results.skipped.push({ user_id: user.id, reason: 'no_email' });
      continue;
    }

    const stats = await computeUserStats(supabase, user.id);
    const tpl = buildEmail({ firstName, stats });

    try {
      await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
      await supabase
        .from('user_profiles')
        .update({ weekly_value_email_last_sent_at: new Date().toISOString() })
        .eq('id', user.id);
      results.sent.push({ user_id: user.id, email, activity_score: stats.total_activity_score });

      await logAutonomousAction({
        actionType: 'weekly_value_report_email',
        source: 'cron/weekly-value-report',
        riskLevel: 'low',
        payload: { user_id: user.id, email, ...stats.week },
        preview: `📊 Weekly value → ${email} (${stats.total_activity_score} pts activité)`,
        rationale: 'Retention via valeur perçue continue',
        autoExecute: true,
      });
    } catch (err) {
      results.errors.push({ user_id: user.id, error: err.message });
    }
  }

  return { ok: true, ...results, startedAt };
}
