// ─────────────────────────────────────────────────────────────────────
// src/lib/autopilot/stepper.js — avance les executions dans leur workflow
// ─────────────────────────────────────────────────────────────────────
// Cron hourly (0 * * * *). Pour chaque execution active :
//   - enrolled         → si prospect a email : envoie email_1, set email_1_sent_at
//                        si pas d'email : enrichit, retry après
//   - email_1_sent     → après J+3 : envoie email_2 (+ lien form), set email_2_sent_at
//   - email_2_sent     → après J+4 (J+7 depuis enrol) : envoie email_3, set email_3_sent_at
//   - email_3_sent     → après 7j sans form_submitted → exit_reason=no_response, push CRM cold
//   - form_pending     → si form_submitted_at est set → compute_score → push CRM hot/warm
//   - completed        → terminus
//
// L'envoi email passe par lib/email.js (Resend). Le push CRM crée une row
// dans crm_deals avec le score + stage.
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from '../supabase-admin';
import { sendEmail } from '../email';
import { isAutonomyEnabled, enforceQuotaOrThrow, logAutonomousAction } from '../autonomy';
import { getTemplate } from './templates';

const MAX_EXECUTIONS_PER_RUN = 200;
const EMAIL_2_DELAY_HOURS = 72;   // J+3
const EMAIL_3_DELAY_HOURS = 96;   // J+4 depuis email_2 (= J+7 depuis enrol)
const FORM_TIMEOUT_HOURS = 168;   // J+7 après email_3 (= exit no-response)

/**
 * Compose un email du template + variables prospect.
 */
function composeEmail({ template, stepIndex, prospect, workflowId, executionId, baseUrl }) {
  const step = template.sequence[stepIndex];
  const firstName = prospect.first_name || prospect.nom?.split(' ')[0] || 'toi';
  const company = prospect.nom || prospect.company || 'votre entreprise';

  // Variables substitution
  const subject = (step.subject || '')
    .replace(/{{first_name}}/g, firstName)
    .replace(/{{company}}/g, company);

  // Body = body_summary (simplifié pour Phase 1, on garde le texte du template)
  // Phase 2 : generate le body via Claude depuis body_summary + contexte prospect
  const bodyText = step.body_summary || '';
  const formLink = step.includes_form_link
    ? `${baseUrl}/forms/autopilot/${workflowId}?exec=${executionId}`
    : null;
  const calcomLink = step.includes_calcom
    ? 'https://cal.com/anthony-volia/15min'
    : null;

  const htmlBody = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;color:#374151;">
  <p style="font-size:14px;line-height:1.6;">Salut ${firstName},</p>
  <p style="font-size:14px;line-height:1.6;">${bodyText}</p>
  ${formLink ? `<p style="font-size:14px;line-height:1.6;text-align:center;margin:24px 0;">
    <a href="${formLink}" style="display:inline-block;padding:12px 28px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Répondre aux 2 min de questions →</a>
  </p>` : ''}
  ${calcomLink ? `<p style="font-size:14px;line-height:1.6;text-align:center;margin:24px 0;">
    <a href="${calcomLink}" style="display:inline-block;padding:12px 28px;background:#10b981;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Réserver 15 min ensemble →</a>
  </p>` : ''}
  <p style="font-size:14px;line-height:1.6;">Anthony — Fondateur Volia</p>
  <p style="font-size:11px;color:#9ca3af;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:12px;">
    Vous recevez ce mail dans le cadre d'une démarche commerciale B2B (intérêt légitime RGPD).
    Pour ne plus recevoir ce type de mail : <a href="${baseUrl}/opt-out" style="color:#9ca3af;">se désinscrire</a>.
  </p>
</body></html>`;

  const textBody = `Salut ${firstName},

${bodyText}
${formLink ? `\n→ Répondre aux questions : ${formLink}\n` : ''}${calcomLink ? `\n→ Réserver 15 min : ${calcomLink}\n` : ''}

Anthony — Volia`;

  return { subject, html: htmlBody, text: textBody };
}

/**
 * Avance 1 execution selon son current_step.
 */
async function advanceExecution(supabase, execution, template, workflow, baseUrl) {
  const stepLog = (step, meta = {}) => ({
    step,
    at: new Date().toISOString(),
    ...meta,
  });
  const history = Array.isArray(execution.step_history) ? [...execution.step_history] : [];
  const updates = {};
  const now = Date.now();

  // Charge le prospect
  const { data: prospect } = await supabase
    .from('prospects')
    .select('id, nom, email, first_name, telephone')
    .eq('id', execution.prospect_id)
    .maybeSingle();
  if (!prospect) {
    updates.current_step = 'failed';
    updates.exit_reason = 'prospect_deleted';
    history.push(stepLog('failed', { reason: 'prospect_deleted' }));
  } else if (!prospect.email) {
    // Pas d'email : skip ce cycle (peut être enrichi plus tard)
    return { skipped: true, reason: 'no_email' };
  } else {
    const stepIdx = execution.current_step === 'enrolled' ? 0
      : execution.current_step === 'email_1_sent' ? 1
      : execution.current_step === 'email_2_sent' ? 2
      : -1;

    // Check timing pour avancer
    let shouldSend = false;
    if (execution.current_step === 'enrolled') {
      shouldSend = true;
    } else if (execution.current_step === 'email_1_sent' && execution.email_1_sent_at) {
      const sentAt = new Date(execution.email_1_sent_at).getTime();
      shouldSend = (now - sentAt) >= EMAIL_2_DELAY_HOURS * 3600 * 1000;
    } else if (execution.current_step === 'email_2_sent' && execution.email_2_sent_at) {
      const sentAt = new Date(execution.email_2_sent_at).getTime();
      shouldSend = (now - sentAt) >= EMAIL_3_DELAY_HOURS * 3600 * 1000;
    } else if (execution.current_step === 'email_3_sent' && execution.email_3_sent_at) {
      // No form après 7j → exit no-response, push CRM cold
      const sentAt = new Date(execution.email_3_sent_at).getTime();
      if ((now - sentAt) >= FORM_TIMEOUT_HOURS * 3600 * 1000 && !execution.form_submitted_at) {
        updates.current_step = 'completed';
        updates.exit_reason = 'no_response';
        history.push(stepLog('exit_no_response', { after_email_3_hours: 168 }));
      }
    } else if (execution.current_step === 'form_pending' && execution.form_submitted_at) {
      // Form filled → score + CRM (Phase 2 : full implementation)
      updates.current_step = 'crm_pushed';
      updates.computed_score = 75; // placeholder Phase 1
      updates.crm_pushed_at = new Date().toISOString();
      history.push(stepLog('crm_pushed', { score: 75 }));
    }

    // Send email si timing OK
    if (shouldSend && stepIdx >= 0 && stepIdx < template.sequence.length) {
      const email = composeEmail({
        template,
        stepIndex: stepIdx,
        prospect,
        workflowId: workflow.id,
        executionId: execution.id,
        baseUrl,
      });
      try {
        await sendEmail({ to: prospect.email, subject: email.subject, html: email.html, text: email.text });
        updates[`email_${stepIdx + 1}_sent_at`] = new Date().toISOString();
        updates.current_step = stepIdx === 0 ? 'email_1_sent'
          : stepIdx === 1 ? 'email_2_sent'
          : 'email_3_sent';
        history.push(stepLog(`email_${stepIdx + 1}_sent`, { subject: email.subject }));
      } catch (err) {
        history.push(stepLog(`email_${stepIdx + 1}_send_failed`, { error: err.message }));
        // Pas de status change : retry au prochain cron
      }
    }
  }

  if (Object.keys(updates).length === 0 && history.length === execution.step_history?.length) {
    return { skipped: true, reason: 'no_action_needed' };
  }
  updates.step_history = history;
  updates.updated_at = new Date().toISOString();
  await supabase.from('autopilot_executions').update(updates).eq('id', execution.id);
  return { updated: true, new_step: updates.current_step || execution.current_step };
}

/**
 * Cron hourly entrypoint.
 */
export async function runStepper() {
  const startedAt = new Date().toISOString();

  const autonomy = await isAutonomyEnabled();
  if (!autonomy.enabled) {
    return { ok: true, skipped: true, reason: autonomy.reason, startedAt };
  }

  try {
    await enforceQuotaOrThrow('autopilot_step_email', { perDay: 500 });
  } catch (e) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: e.message, startedAt };
  }

  const supabase = getSupabaseAdmin();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://volia.fr';

  // Fetch executions actives (pas completed, failed, unsubscribed)
  const { data: executions } = await supabase
    .from('autopilot_executions')
    .select('*')
    .in('current_step', ['enrolled', 'email_1_sent', 'email_2_sent', 'email_3_sent', 'form_pending'])
    .order('updated_at', { ascending: true })
    .limit(MAX_EXECUTIONS_PER_RUN);

  if (!executions || executions.length === 0) {
    return { ok: true, processed: 0, startedAt };
  }

  // Group by workflow pour mutualiser les fetches template
  const byWorkflow = {};
  for (const e of executions) {
    if (!byWorkflow[e.workflow_id]) byWorkflow[e.workflow_id] = [];
    byWorkflow[e.workflow_id].push(e);
  }

  let processed = 0;
  let advanced = 0;
  let skipped = 0;
  let errors = 0;

  for (const [workflowId, execs] of Object.entries(byWorkflow)) {
    const { data: workflow } = await supabase
      .from('autopilot_workflows')
      .select('*')
      .eq('id', workflowId)
      .maybeSingle();
    if (!workflow || workflow.status !== 'active') {
      // Skip toutes les executions de ce workflow inactif
      skipped += execs.length;
      continue;
    }
    const template = getTemplate(workflow.template_id);
    if (!template) {
      skipped += execs.length;
      continue;
    }

    for (const exec of execs) {
      processed++;
      try {
        const res = await advanceExecution(supabase, exec, template, workflow, baseUrl);
        if (res.updated) advanced++;
        else skipped++;
      } catch (err) {
        errors++;
        console.error('[autopilot/stepper] exec error', exec.id, err.message);
      }
    }
  }

  await logAutonomousAction({
    actionType: 'autopilot_stepper_run',
    source: 'cron/autopilot-stepper',
    riskLevel: 'low',
    payload: { processed, advanced, skipped, errors },
    preview: `⚙️ Autopilot stepper : ${advanced}/${processed} advanced`,
    rationale: 'Cron hourly avance les executions dans leur workflow',
    autoExecute: true,
  });

  return { ok: true, processed, advanced, skipped, errors, startedAt };
}
