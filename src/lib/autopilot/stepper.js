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
import { generateEmailBody } from './claude-writer';
import { resolveRouting, scoreToTier } from './scoring';
import { routeLeadToCrm } from './crm-bridge';
import { pickVariant } from './ab-testing';

const MAX_EXECUTIONS_PER_RUN = 200;
const EMAIL_2_DELAY_HOURS = 72;   // J+3
const EMAIL_3_DELAY_HOURS = 96;   // J+4 depuis email_2 (= J+7 depuis enrol)
const FORM_TIMEOUT_HOURS = 168;   // J+7 après email_3 (= exit no-response)

// Plafond mensuel d'appels Claude (génération body perso) PAR workflow.
// Au-delà, on retombe gracieusement sur body_summary template (0 coût).
// Override possible via workflow.config.claude_monthly_cap.
// 1500 ≈ 100 prospects/sem × 3 emails × ~4 semaines avec marge.
const CLAUDE_WRITES_PER_WORKFLOW_PER_MONTH = 1500;

/**
 * Compose un email du template + variables prospect.
 * Phase 2 : tente Claude generation, fallback sur body_summary si échec.
 */
async function composeEmail({ template, stepIndex, prospect, workflowId, executionId, baseUrl, workflowMetricsCache, allowClaude = true }) {
  const step = template.sequence[stepIndex];
  const firstName = prospect.contact_name || prospect.nom?.split(' ')[0] || 'toi';
  const company = prospect.nom || prospect.company || 'votre entreprise';

  // ─── Phase 3.1 : A/B subject variant picker ───────────────────
  // Si step.subject est un array de variants, on pick le bon variant
  // selon le winner désigné (ou rotation déterministe en exploration).
  const variantPick = pickVariant({
    subject: step.subject,
    executionId,
    workflowMetricsCache,
    stepIndex,
  });
  const subject = (variantPick.variant_text || '')
    .replace(/{{first_name}}/g, firstName)
    .replace(/{{company}}/g, company);

  // ─── Phase 2/3 : Claude generation (gated par quota mensuel) ──────
  // On tente d'abord la génération Claude (perso prospect + ton template),
  // SAUF si le quota mensuel du workflow est atteint (allowClaude=false).
  // Si échec/quota, fallback sur body_summary template — l'email part
  // toujours, 0 coût Claude.
  let bodyText = null;
  let bodyMethod = allowClaude ? 'fallback_summary' : 'quota_capped';
  if (allowClaude) {
    try {
      const claudeBody = await generateEmailBody({ template, stepIndex, prospect });
      if (claudeBody) {
        bodyText = claudeBody;
        bodyMethod = 'claude';
      }
    } catch (err) {
      console.warn('[autopilot/stepper] Claude body gen failed', err.message);
    }
  }
  if (!bodyText) {
    bodyText = (step.body_summary || '')
      .replace(/{{first_name}}/g, firstName)
      .replace(/{{company}}/g, company);
  }
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

  return {
    subject,
    html: htmlBody,
    text: textBody,
    bodyMethod,
    subjectVariantId: variantPick.variant_id,
    subjectVariantPhase: variantPick.phase, // 'explore' ou 'exploit'
  };
}

/**
 * Avance 1 execution selon son current_step.
 * @param {string} [fromHeader] - sender résolu (workflow.config.email_sender_id)
 */
async function advanceExecution(supabase, execution, template, workflow, baseUrl, fromHeader, allowClaude = true) {
  const stepLog = (step, meta = {}) => ({
    step,
    at: new Date().toISOString(),
    ...meta,
  });
  const history = Array.isArray(execution.step_history) ? [...execution.step_history] : [];
  const updates = {};
  const now = Date.now();
  let claudeUsed = false; // pour le compteur quota mensuel par workflow

  // Charge le prospect.
  // ⚠️ La table prospects N'A PAS de colonne first_name (colonnes nom / contact_name).
  // Sélectionner first_name renvoyait une 400 PostgREST → prospect=null → CHAQUE
  // exécution marquée 'prospect_deleted' (autopilot 100% cassé). On lit contact_name
  // et on garde l'erreur pour ne pas brûler une exécution sur un simple souci réseau.
  const { data: prospect, error: prospectErr } = await supabase
    .from('prospects')
    .select('id, nom, contact_name, email, telephone')
    .eq('id', execution.prospect_id)
    .maybeSingle();
  if (prospectErr) {
    // Erreur DB transitoire : on NE marque PAS prospect_deleted (sinon on brûle
    // l'exécution sur un simple souci réseau). On skippe ce cycle → retry au prochain cron.
    console.error('[autopilot/stepper] prospect fetch error', prospectErr?.message || prospectErr);
    return { skipped: true, reason: 'prospect_fetch_error' };
  }
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
      // ─── Phase 2 : Real CRM push avec branching ───────────────
      // Cas où le form a été submitted via webhook mais le push CRM
      // n'a pas été immédiat (typiquement : tier warm/cold → différé
      // au stepper pour éventuellement traiter en batch).
      // Le tier vient soit du score déjà calculé (form-submit l'a fait)
      // soit on le recalcule depuis computed_score.
      if (execution.crm_deal_id) {
        // Déjà push (probablement par webhook hot path)
        updates.current_step = 'crm_pushed';
        history.push(stepLog('crm_already_pushed', { deal_id: execution.crm_deal_id }));
      } else {
        const score = execution.computed_score ?? 50;
        const tier = scoreToTier(score);
        const routing = resolveRouting(tier, workflow.config, template);

        const bridge = await routeLeadToCrm(supabase, {
          userId: workflow.user_id,
          prospect,
          workflow,
          execution,
          score,
          tier,
          routing,
          formResponse: execution.form_response,
        });

        if (bridge.deal_id || bridge.delivered) {
          updates.crm_deal_id = bridge.deal_id || null;
          updates.crm_pushed_at = new Date().toISOString();
          updates.current_step = 'crm_pushed';
          history.push(stepLog('crm_pushed_stepper', {
            destination: bridge.destination || 'volia',
            deal_id: bridge.deal_id || null,
            contact_id: bridge.contact_id || null,
            stage_id: bridge.stage_id || null,
            score,
            tier,
            routing_source: routing.source,
          }));
        } else {
          history.push(stepLog('crm_push_failed', {
            error: bridge.error || 'unknown',
            score,
            tier,
          }));
        }
      }
    }

    // ─── RGPD : check opt-out global AVANT tout envoi ──────────────
    // Si le prospect est dans opt_out_list, on stoppe la séquence net.
    // (même logique que les campagnes, mais via la blocklist globale
    // opt_out_list car les prospects autopilot n'ont pas de flag opt_out).
    if (shouldSend && prospect.email) {
      const { data: optedOut } = await supabase
        .from('opt_out_list')
        .select('id')
        .ilike('email', prospect.email) // ilike sans wildcard = égalité insensible à la casse
        .maybeSingle();
      if (optedOut) {
        shouldSend = false;
        updates.current_step = 'completed';
        updates.exit_reason = 'opted_out';
        history.push(stepLog('exit_opted_out'));
      }
    }

    // ─── GARDE-FOU RÉPUTATION (critique) ──────────────────────────
    // On n'envoie JAMAIS de cold outreach sans expéditeur vérifié du user.
    // Pas de fallback hello@volia.fr : ça crame la réputation du domaine
    // Volia pour tous les clients. Si pas de sender vérifié → on bloque
    // l'envoi (l'execution reste à son step, repartira une fois le domaine
    // branché). fromHeader n'est défini que si sender status='verified'.
    if (shouldSend && !fromHeader) {
      shouldSend = false;
      const alreadyFlagged = history.some((h) => h.step === 'send_blocked_no_verified_sender');
      if (!alreadyFlagged) {
        history.push(stepLog('send_blocked_no_verified_sender'));
      }
    }

    // Send email si timing OK
    if (shouldSend && stepIdx >= 0 && stepIdx < template.sequence.length) {
      const email = await composeEmail({
        template,
        stepIndex: stepIdx,
        prospect,
        workflowId: workflow.id,
        executionId: execution.id,
        baseUrl,
        workflowMetricsCache: workflow.metrics_cache,
        allowClaude,
      });
      claudeUsed = email.bodyMethod === 'claude'; // coût Claude payé (même si l'envoi échoue ensuite)
      try {
        await sendEmail({
          to: prospect.email,
          subject: email.subject,
          html: email.html,
          text: email.text,
          from: fromHeader,
          // Tags Resend → permettent au webhook d'attribuer opens/bounces
          // à cette execution + variant (Phase 3 : signal A/B + anti-bounce).
          tags: [
            { name: 'kind', value: 'autopilot' },
            { name: 'exec_id', value: execution.id },
            { name: 'workflow_id', value: workflow.id },
            { name: 'step', value: String(stepIdx + 1) },
            { name: 'variant', value: email.subjectVariantId || 'default' },
          ],
        });
        updates[`email_${stepIdx + 1}_sent_at`] = new Date().toISOString();
        updates.current_step = stepIdx === 0 ? 'email_1_sent'
          : stepIdx === 1 ? 'email_2_sent'
          : 'email_3_sent';
        history.push(stepLog(`email_${stepIdx + 1}_sent`, {
          subject: email.subject,
          body_method: email.bodyMethod,            // 'claude' ou 'fallback_summary'
          subject_variant_id: email.subjectVariantId, // pour compute winner
          subject_variant_phase: email.subjectVariantPhase, // 'explore'|'exploit'
        }));
      } catch (err) {
        history.push(stepLog(`email_${stepIdx + 1}_send_failed`, { error: err.message }));
        // Pas de status change : retry au prochain cron
      }
    }
  }

  if (Object.keys(updates).length === 0 && history.length === (execution.step_history?.length ?? 0)) {
    return { skipped: true, reason: 'no_action_needed', claudeUsed };
  }
  updates.step_history = history;
  updates.updated_at = new Date().toISOString();
  await supabase.from('autopilot_executions').update(updates).eq('id', execution.id);
  return { updated: true, new_step: updates.current_step || execution.current_step, claudeUsed };
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

    // Résout le sender du workflow (multi-tenant) : si l'user a configuré
    // un email_sender vérifié, les emails partent de SON domaine (meilleure
    // deliverability + branding). Sinon fallback défaut Volia dans email.js.
    let fromHeader;
    const senderId = workflow.config?.email_sender_id;
    if (senderId) {
      const { data: sender } = await supabase
        .from('email_senders')
        .select('domain, from_name, status')
        .eq('id', senderId)
        .maybeSingle();
      if (sender?.status === 'verified' && sender.domain) {
        fromHeader = `${sender.from_name || 'Volia'} <noreply@${sender.domain}>`;
      }
    }

    // Quota Claude mensuel par workflow (Phase 3) : on lit l'usage du mois
    // courant, reset si le mois a changé. allowClaude tombe à false une fois
    // le plafond atteint → fallback body_summary (0 coût).
    const curMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
    let claudeUsage = workflow.metrics_cache?.claude_usage || { month: null, count: 0 };
    if (claudeUsage.month !== curMonth) claudeUsage = { month: curMonth, count: 0 };
    const claudeCap = workflow.config?.claude_monthly_cap ?? CLAUDE_WRITES_PER_WORKFLOW_PER_MONTH;
    let claudeUsedThisRun = 0;

    for (const exec of execs) {
      processed++;
      try {
        const allowClaude = (claudeUsage.count + claudeUsedThisRun) < claudeCap;
        const res = await advanceExecution(supabase, exec, template, workflow, baseUrl, fromHeader, allowClaude);
        if (res.claudeUsed) claudeUsedThisRun++;
        if (res.updated) advanced++;
        else skipped++;
      } catch (err) {
        errors++;
        console.error('[autopilot/stepper] exec error', exec.id, err.message);
      }
    }

    // Persiste le compteur Claude (merge dans metrics_cache, 1 seul write/workflow)
    if (claudeUsedThisRun > 0) {
      await supabase
        .from('autopilot_workflows')
        .update({
          metrics_cache: {
            ...(workflow.metrics_cache || {}),
            claude_usage: { month: curMonth, count: claudeUsage.count + claudeUsedThisRun },
          },
        })
        .eq('id', workflowId);
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
