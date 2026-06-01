// ─────────────────────────────────────────────────────────────────────
// /api/inbound/contact — Sprint 3 Phase 2 : Feedback mining
// ─────────────────────────────────────────────────────────────────────
// Webhook Resend Inbound pour catch-all contact@volia.fr.
//
// Pipeline pour chaque email :
//   1. INSERT raw dans inbound_feedback_emails (status=pending)
//   2. classifyEmail() via Claude → category + priority + summary
//   3. UPDATE row avec classification
//   4. Selon category, créer une action autonomy adaptée :
//      - bug          → action_type='bug_triage_from_email' (medium, founder review)
//      - feature_req  → action_type='feature_request_logged' (low, auto-execute)
//      - question     → action_type='faq_reply_proposal' (medium, draft reply Claude)
//      - sales        → action_type='sales_lead_alert' (low, alerte + create CRM contact)
//      - spam         → silent ignore (just log)
//      - other        → noop, founder review manuel
//
// Toujours retourne 200 OK (sinon Resend retry infini).
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { classifyEmail } from '@/lib/feedback-classifier';
import { draftFaqReply } from '@/lib/faq-reply-drafter';
import { logAutonomousAction, isAutonomyEnabled } from '@/lib/autonomy';
import { verifyResendSignature } from '@/lib/webhooks/resend-verify';
import { cleanEnv } from '@/lib/envClean';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request) {
  // 1. Lire le body en RAW string pour vérif signature
  const rawBody = await request.text().catch(() => '');
  if (!rawBody) {
    return NextResponse.json({ ok: false, reason: 'empty_body' }, { status: 400 });
  }

  // 2. Vérifier signature Svix Resend si secret configuré
  const secret = cleanEnv(process.env.RESEND_INBOUND_CONTACT_SECRET);
  if (secret) {
    try {
      verifyResendSignature({ payload: rawBody, headers: request.headers, secret });
    } catch (err) {
      console.warn('[inbound/contact] signature invalide', err.message);
      // Pour /contact on retourne 200 OK même si signature ko (sinon Resend retry infini)
      // mais on log + skip le traitement
      return NextResponse.json({ ok: true, ignored: 'invalid_signature' });
    }
  } else {
    console.warn('[inbound/contact] RESEND_INBOUND_CONTACT_SECRET non configuré, skip signature check');
  }

  // 3. Parse JSON
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_json' }, { status: 400 });
  }

  // Normalisation payload Resend Inbound
  const fromRaw = (body.from?.email || body.from || body.sender || '').toString();
  const fromMatch = fromRaw.match(/^(.+?)\s*<(.+?)>$/);
  const from_email = (fromMatch ? fromMatch[2] : fromRaw).toLowerCase().trim();
  const from_name = fromMatch ? fromMatch[1].trim() : (body.from?.name || '').toString();
  const subject = (body.subject || '').toString().slice(0, 500);
  const bodyText = (body.text || body.plain || body.body || '').toString();
  const raw_email_id = body.message_id || body.id || body.email_id || null;

  if (!from_email) {
    return NextResponse.json({ ok: true, skipped: 'no_from' });
  }

  const supabase = getSupabaseAdmin();

  // 1. Dédup via raw_email_id si présent
  if (raw_email_id) {
    const { data: existing } = await supabase
      .from('inbound_feedback_emails')
      .select('id')
      .eq('raw_email_id', raw_email_id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ ok: true, skipped: 'duplicate', id: existing.id });
    }
  }

  // 2. INSERT raw row (status=pending)
  const { data: inserted, error: insertErr } = await supabase
    .from('inbound_feedback_emails')
    .insert({
      from_email,
      from_name,
      subject,
      body_preview: bodyText.slice(0, 1000),
      body_full: bodyText,
      raw_email_id,
      category: 'pending',
    })
    .select('id')
    .single();
  if (insertErr) {
    console.error('[inbound/contact] insert failed', insertErr);
    return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
  }

  const feedbackId = inserted.id;

  // 3. Classify via Claude (fire-and-continue : si Claude plante on garde le raw)
  let classification;
  try {
    classification = await classifyEmail({ from_email, from_name, subject, body: bodyText });
  } catch (err) {
    await supabase
      .from('inbound_feedback_emails')
      .update({
        classifier_error: (err.message || String(err)).slice(0, 500),
        classified_at: new Date().toISOString(),
        category: 'other',
        priority: 'medium',
      })
      .eq('id', feedbackId);
    return NextResponse.json({ ok: true, classified: false, error: err.message, id: feedbackId });
  }

  // 4. UPDATE classification
  await supabase
    .from('inbound_feedback_emails')
    .update({
      category: classification.category,
      priority: classification.priority,
      summary: classification.summary,
      suggested_action: classification.suggested_action,
      classified_at: new Date().toISOString(),
    })
    .eq('id', feedbackId);

  // 5. Skip si autonomy désactivée (on garde le log mais on ne crée pas d'action)
  const autonomyState = await isAutonomyEnabled();
  if (!autonomyState.enabled) {
    return NextResponse.json({
      ok: true,
      classified: true,
      action_created: false,
      reason: 'autonomy_disabled',
      id: feedbackId,
      classification,
    });
  }

  // 6. Créer action autonomy selon catégorie
  let actionId = null;
  try {
    actionId = await createActionFromClassification(feedbackId, classification, {
      from_email,
      from_name,
      subject,
      body_preview: bodyText.slice(0, 500),
    });
    if (actionId) {
      await supabase
        .from('inbound_feedback_emails')
        .update({ autonomous_action_id: actionId })
        .eq('id', feedbackId);
    }
  } catch (err) {
    console.error('[inbound/contact] action creation failed', err);
  }

  return NextResponse.json({
    ok: true,
    classified: true,
    action_created: Boolean(actionId),
    id: feedbackId,
    action_id: actionId,
    classification,
  });
}

/**
 * Mapping category → autonomy action.
 * Retourne l'action_id créée (ou null si pas d'action déclenchée).
 */
async function createActionFromClassification(feedbackId, classification, emailMeta) {
  const { category, priority, summary, suggested_action } = classification;

  // Spam = silent. Just logged.
  if (category === 'spam') return null;

  // Other = pas d'action auto, founder review manuel
  if (category === 'other') return null;

  const basePayload = {
    feedback_id: feedbackId,
    from_email: emailMeta.from_email,
    from_name: emailMeta.from_name,
    subject: emailMeta.subject,
    body_preview: emailMeta.body_preview,
    classification_summary: summary,
    suggested_action,
    priority,
  };

  let actionType, riskLevel, preview, rationale;
  // Modifier basePayload depuis les branches (mutation OK puisque on lit après)

  if (category === 'bug') {
    actionType = 'bug_triage_from_email';
    riskLevel = 'medium';
    preview = `🐛 Bug signalé : ${summary}`;
    rationale = `Email de ${emailMeta.from_email}. Suggested: ${suggested_action}. Priorité IA: ${priority}.`;
  } else if (category === 'feature_request') {
    actionType = 'feature_request_logged';
    riskLevel = 'low';
    preview = `💡 Feature demandée : ${summary}`;
    rationale = `Email de ${emailMeta.from_email}. Priorité IA: ${priority}.`;
  } else if (category === 'question') {
    actionType = 'faq_reply_proposal';
    riskLevel = 'medium';

    // Tente de générer le brouillon de réponse maintenant (Sprint Phase 2.1).
    // Si Claude plante ou décide should_send=false, on log quand même
    // l'action sans draft → founder répondra à la main.
    try {
      const draft = await draftFaqReply(
        {
          from_email: emailMeta.from_email,
          from_name: emailMeta.from_name,
          subject: emailMeta.subject,
          body: emailMeta.body_preview,
        },
        classification
      );
      if (draft.should_send) {
        basePayload.draft_subject = draft.subject;
        basePayload.draft_body_markdown = draft.body_markdown;
        basePayload.draft_body_text = draft.body_text;
        basePayload.draft_rationale = draft.rationale;
        preview = `❓ Q ${emailMeta.from_email} → "${(draft.body_text || '').slice(0, 90)}…"`;
        rationale = `Email reçu, brouillon FAQ généré par Claude. ${draft.rationale}`;
      } else {
        // Claude refuse de répondre → founder doit gérer à la main
        basePayload.draft_skipped_reason = draft.wont_send_reason || 'Claude a refusé de générer';
        preview = `❓ Question (sensible) : ${summary}`;
        rationale = `Email de ${emailMeta.from_email}. Claude n'a pas généré de brouillon : ${draft.wont_send_reason || 'raison non précisée'}. Founder doit répondre perso.`;
      }
    } catch (draftErr) {
      console.error('[inbound/contact] FAQ draft failed', draftErr);
      basePayload.draft_error = (draftErr.message || String(draftErr)).slice(0, 300);
      preview = `❓ Question : ${summary}`;
      rationale = `Email de ${emailMeta.from_email}. Brouillon génération failed : ${draftErr.message}. Founder répond manuel.`;
    }
  } else if (category === 'sales_inquiry') {
    actionType = 'sales_lead_alert';
    riskLevel = 'low';
    preview = `💰 Lead commercial : ${summary}`;
    rationale = `Email de ${emailMeta.from_email}. Priorité IA: ${priority}. À forwarder/contacter rapidement.`;
  } else {
    return null;
  }

  const action = await logAutonomousAction({
    actionType,
    source: 'inbound/contact',
    riskLevel,
    payload: basePayload,
    preview,
    rationale,
    autoExecute: false, // toujours en queue pour V1, le founder décide
    expiresInHours: priority === 'urgent' ? 24 : priority === 'high' ? 48 : 168,
  });

  return action.id;
}

// GET pour healthcheck
export async function GET() {
  return NextResponse.json({
    endpoint: 'inbound/contact',
    description: 'POST webhook Resend Inbound pour contact@volia.fr — feedback mining + classification IA',
  });
}
