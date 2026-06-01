// ─────────────────────────────────────────────────────────────────────
// src/lib/publish-actions.js — Logique du cron publish-approved-actions
// ─────────────────────────────────────────────────────────────────────
//
// Extraite du route handler /api/cron/publish-approved-actions pour
// pouvoir être appelée aussi depuis /api/admin/trigger-cron (auth
// admin, pas CRON_SECRET) — utile pour tester manuellement sans
// attendre le prochain tick de 15 min.
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';
import {
  isAutonomyEnabled,
  markActionExecuted,
  markActionFailed,
} from './autonomy';
import { publishOn } from './publishers';
import { createGithubIssue } from './github-api';
import { sendEmail } from './email';
import { markdownToBasicHtml } from './faq-reply-drafter';

const MAX_PER_RUN = 5;
const ELIGIBLE_ACTION_TYPES = ['linkedin_post', 'github_issue_create', 'faq_reply_proposal'];

/**
 * Pioche jusqu'à 5 actions approuvées non-publiées, publie sur LinkedIn,
 * marque executed/failed selon résultat. Retourne un summary.
 */
export async function runPublishApprovedActions() {
  const autonomyState = await isAutonomyEnabled();
  if (!autonomyState.enabled) {
    return {
      ok: true,
      skipped: true,
      reason: 'autonomy_disabled',
      source: autonomyState.source,
      detail: autonomyState.reason,
    };
  }

  const supabase = getSupabaseAdmin();

  const { data: actions, error } = await supabase
    .from('autonomous_actions')
    .select('id, action_type, payload, approved_at, expires_at')
    .eq('status', 'approved')
    .in('action_type', ELIGIBLE_ACTION_TYPES)
    .is('result', null)
    .order('approved_at', { ascending: true })
    .limit(MAX_PER_RUN);

  if (error) {
    return {
      ok: false,
      error: 'query_error',
      detail: error.message,
    };
  }

  if (!actions || actions.length === 0) {
    return { ok: true, processed: 0, message: 'queue vide' };
  }

  const results = [];
  for (const action of actions) {
    try {
      // Dispatch par action_type

      // ─── faq_reply_proposal : envoie email réponse via Resend
      if (action.action_type === 'faq_reply_proposal') {
        const {
          from_email,
          draft_subject,
          draft_body_markdown,
          draft_body_text,
        } = action.payload || {};

        if (!from_email || !draft_subject || !draft_body_text) {
          await markActionFailed(
            action.id,
            'payload incomplet (from_email, draft_subject, draft_body_text requis)'
          );
          results.push({ id: action.id, ok: false, error: 'missing_faq_fields' });
          continue;
        }

        try {
          const html = markdownToBasicHtml(draft_body_markdown || draft_body_text);
          const sent = await sendEmail({
            to: from_email,
            subject: draft_subject,
            html,
            text: draft_body_text,
            // from default = noreply@volia.fr ou contact@volia.fr selon la config sendEmail
          });
          await markActionExecuted(action.id, {
            faq_reply: {
              sent_to: from_email,
              subject: draft_subject,
              sent_at: new Date().toISOString(),
              provider_id: sent?.id || null,
            },
          });
          results.push({ id: action.id, ok: true, sent_to: from_email, type: 'faq_reply' });
          console.log(`[publish-approved] FAQ reply OK → ${from_email}`);
        } catch (err) {
          const errMsg = err.message || String(err);
          await markActionFailed(action.id, errMsg.slice(0, 500));
          results.push({ id: action.id, ok: false, error: errMsg });
          console.error(`[publish-approved] FAQ reply FAILED : ${errMsg}`);
        }
        continue;
      }

      if (action.action_type === 'github_issue_create') {
        const { title, body, labels } = action.payload || {};
        if (!title || !body) {
          await markActionFailed(action.id, 'payload.title ou payload.body absent');
          results.push({ id: action.id, ok: false, error: 'missing_issue_fields' });
          continue;
        }
        const ghResult = await createGithubIssue({ title, body, labels });
        if (ghResult.ok) {
          await markActionExecuted(action.id, {
            github: {
              issue_url: ghResult.html_url,
              issue_number: ghResult.number,
              created_at: new Date().toISOString(),
            },
            sentry_id: action.payload?.sentry_id || null,
          });
          results.push({ id: action.id, ok: true, url: ghResult.html_url, type: 'github_issue' });
          console.log(`[publish-approved] GitHub issue OK → ${ghResult.html_url}`);
        } else {
          await markActionFailed(action.id, (ghResult.error || 'unknown').slice(0, 500));
          results.push({ id: action.id, ok: false, error: ghResult.error });
          console.error(`[publish-approved] GitHub issue FAILED : ${ghResult.error}`);
        }
        continue; // pass to next action
      }

      // Default : action_type === 'linkedin_post'
      const linkedinText = action.payload?.linkedin;
      if (!linkedinText) {
        await markActionFailed(action.id, 'payload.linkedin absent');
        results.push({ id: action.id, ok: false, error: 'no_linkedin_text' });
        continue;
      }

      const publishResult = await publishOn('linkedin', linkedinText, {
        action_id: action.id,
        metadata: {
          action_type: action.action_type,
          main_topic: action.payload?.main_topic || null,
        },
      });

      if (publishResult.ok) {
        const compiled = {
          linkedin: {
            url: publishResult.post_url,
            post_id: publishResult.post_id,
            posted_at: new Date().toISOString(),
            auto_liked_at: publishResult.auto_liked_at || null,
            auto_like_error: publishResult.auto_like_error || null,
          },
          twitter: {
            skipped: true,
            reason: 'manual_copy_paste',
            text: action.payload?.twitter || null,
          },
        };
        await markActionExecuted(action.id, compiled);
        results.push({ id: action.id, ok: true, url: publishResult.post_url });
        console.log(`[publish-approved] LinkedIn OK → ${publishResult.post_url}`);
      } else if (publishResult.skipped) {
        results.push({
          id: action.id,
          ok: false,
          skipped: true,
          reason: publishResult.reason,
        });
        console.log(`[publish-approved] LinkedIn skipped : ${publishResult.reason}`);
      } else {
        const errMsg = publishResult.error || 'unknown publish error';
        await markActionFailed(action.id, errMsg.slice(0, 500));
        results.push({ id: action.id, ok: false, error: errMsg });
        console.error(`[publish-approved] LinkedIn FAILED : ${errMsg}`);
      }
    } catch (err) {
      console.error(`[publish-approved] action ${action.id} unhandled`, err);
      await markActionFailed(action.id, err.message || String(err));
      results.push({ id: action.id, ok: false, error: err.message });
    }
  }

  return {
    ok: true,
    processed: results.length,
    published: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok && !r.skipped).length,
    skipped: results.filter((r) => r.skipped).length,
    results,
  };
}
