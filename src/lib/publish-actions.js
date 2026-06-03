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
const ELIGIBLE_ACTION_TYPES = [
  'linkedin_post',
  'github_issue_create',
  'faq_reply_proposal',
  'changelog_entry',
  'blog_post_draft',
  'newsletter_send',
  'inbound_reply_suggested',
];

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

      // ─── newsletter_send : envoie la newsletter à tous subscribers via Resend
      if (action.action_type === 'newsletter_send') {
        const { subject, html_body, text_body, month_label } = action.payload || {};
        if (!subject || !html_body) {
          await markActionFailed(action.id, 'payload incomplet (subject + html_body requis)');
          results.push({ id: action.id, ok: false, error: 'missing_newsletter_fields' });
          continue;
        }
        try {
          const { sendNewsletterToAllSubscribers } = await import('./newsletter-generator');
          const result = await sendNewsletterToAllSubscribers({
            subject,
            html: html_body,
            text: text_body || '',
            monthLabel: month_label || 'newsletter',
          });
          await markActionExecuted(action.id, {
            newsletter: {
              sent: result.sent,
              failed: result.failed,
              total_subscribers: result.total_subscribers,
              sent_at: new Date().toISOString(),
              errors_sample: result.errors_sample || [],
            },
          });
          results.push({
            id: action.id,
            ok: true,
            sent: result.sent,
            failed: result.failed,
            type: 'newsletter',
          });
          console.log(`[publish-approved] Newsletter OK → ${result.sent} sent, ${result.failed} failed`);
        } catch (err) {
          const errMsg = err.message || String(err);
          await markActionFailed(action.id, errMsg.slice(0, 500));
          results.push({ id: action.id, ok: false, error: errMsg });
          console.error(`[publish-approved] Newsletter FAILED : ${errMsg}`);
        }
        continue;
      }

      // ─── blog_post_draft : INSERT dans auto_blog_posts (status='published')
      if (action.action_type === 'blog_post_draft') {
        const supabase = getSupabaseAdmin();
        const {
          slug,
          title,
          description,
          category,
          keywords,
          tldr,
          excerpt,
          content_markdown,
          word_count,
          estimated_read_minutes,
        } = action.payload || {};

        if (!slug || !title || !content_markdown) {
          await markActionFailed(action.id, 'payload incomplet (slug, title, content_markdown requis)');
          results.push({ id: action.id, ok: false, error: 'missing_blog_fields' });
          continue;
        }

        try {
          const { data: inserted, error: insertErr } = await supabase
            .from('auto_blog_posts')
            .insert({
              slug,
              title,
              description,
              category,
              keywords: keywords || [],
              tldr,
              excerpt,
              content: content_markdown,
              word_count: word_count || null,
              read_time: estimated_read_minutes || null,
              source_action_id: action.id,
              status: 'published',
              published_at: new Date().toISOString().split('T')[0],
              published_timestamp: new Date().toISOString(),
            })
            .select('id, slug')
            .single();
          if (insertErr) throw new Error(insertErr.message);

          const publicUrl = `https://volia.fr/blog/${inserted.slug}`;
          await markActionExecuted(action.id, {
            blog_post: {
              post_id: inserted.id,
              slug: inserted.slug,
              public_url: publicUrl,
              published_at: new Date().toISOString(),
            },
          });
          results.push({ id: action.id, ok: true, url: publicUrl, type: 'blog_post' });
          console.log(`[publish-approved] Blog post OK → ${publicUrl}`);
        } catch (err) {
          const errMsg = err.message || String(err);
          await markActionFailed(action.id, errMsg.slice(0, 500));
          results.push({ id: action.id, ok: false, error: errMsg });
          console.error(`[publish-approved] Blog post FAILED : ${errMsg}`);
        }
        continue;
      }

      // ─── changelog_entry : INSERT dans auto_changelog_proposals + update last_sha
      if (action.action_type === 'changelog_entry') {
        const supabase = getSupabaseAdmin();
        const {
          entry_date,
          version,
          title,
          items,
          source_commits,
          newest_commit_sha,
        } = action.payload || {};

        if (!entry_date || !title || !Array.isArray(items) || items.length === 0) {
          await markActionFailed(action.id, 'payload incomplet (entry_date, title, items requis)');
          results.push({ id: action.id, ok: false, error: 'missing_changelog_fields' });
          continue;
        }

        try {
          const { data: inserted, error: insertErr } = await supabase
            .from('auto_changelog_proposals')
            .insert({
              entry_date,
              version,
              title,
              items,
              source_commits: source_commits || [],
              source_action_id: action.id,
              status: 'published',
              published_at: new Date().toISOString(),
            })
            .select('id')
            .single();
          if (insertErr) throw new Error(insertErr.message);

          // Update last_changelog_commit_sha pour ne pas re-processer ces commits
          if (newest_commit_sha) {
            await supabase
              .from('app_settings')
              .update({
                value: newest_commit_sha,
                notes: `Mis à jour le ${new Date().toLocaleString('fr-FR')} après publication changelog v${version}`,
                updated_by: 'cron/publish-approved-actions',
              })
              .eq('key', 'last_changelog_commit_sha');
          }

          await markActionExecuted(action.id, {
            changelog: {
              entry_id: inserted.id,
              version,
              title,
              published_at: new Date().toISOString(),
              public_url: 'https://volia.fr/changelog',
            },
          });
          results.push({ id: action.id, ok: true, url: 'https://volia.fr/changelog', type: 'changelog' });
          console.log(`[publish-approved] Changelog v${version} OK → /changelog`);
        } catch (err) {
          const errMsg = err.message || String(err);
          await markActionFailed(action.id, errMsg.slice(0, 500));
          results.push({ id: action.id, ok: false, error: errMsg });
          console.error(`[publish-approved] Changelog FAILED : ${errMsg}`);
        }
        continue;
      }

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

      // ─── inbound_reply_suggested : réponse à un prospect, validée par
      // l'humain → envoi depuis le domaine VÉRIFIÉ du user (jamais hello@volia.fr,
      // règle réputation). Si pas de sender vérifié → on échoue l'action plutôt
      // que d'envoyer depuis un domaine de repli.
      if (action.action_type === 'inbound_reply_suggested') {
        const supabase = getSupabaseAdmin();
        const {
          to,
          draft_subject,
          draft_body,
          email_sender_id,
          reply_to,
          classification,
        } = action.payload || {};

        if (!to || !draft_subject || !draft_body || !email_sender_id) {
          await markActionFailed(action.id, 'payload incomplet (to, draft_subject, draft_body, email_sender_id requis)');
          results.push({ id: action.id, ok: false, error: 'missing_reply_fields' });
          continue;
        }

        try {
          // Re-vérifie le sender AU MOMENT de l'envoi (il a pu être supprimé/
          // dé-vérifié entre la mise en file et l'approbation).
          const { data: sender } = await supabase
            .from('email_senders')
            .select('id, domain, from_name, status')
            .eq('id', email_sender_id)
            .maybeSingle();

          if (!sender || sender.status !== 'verified' || !sender.domain) {
            await markActionFailed(action.id, 'sender non vérifié à l\'envoi — réponse NON envoyée (règle réputation : jamais hello@volia.fr)');
            results.push({ id: action.id, ok: false, error: 'sender_not_verified' });
            continue;
          }

          const fromHeader = `${sender.from_name || 'Volia'} <noreply@${sender.domain}>`;
          const html = markdownToBasicHtml(draft_body);
          const sent = await sendEmail({
            to,
            subject: draft_subject,
            html,
            from: fromHeader,
            replyTo: reply_to || undefined,
            tags: [{ name: 'type', value: 'inbound_reply' }],
          });

          // sendEmail peut basculer sur un domaine de repli si le primaire est
          // refusé. Pour une réponse prospect, on REFUSE ce repli (réputation).
          if (sent?.fallbackUsed) {
            await markActionFailed(action.id, `refus repli hello@volia.fr (sender ${sender.domain} a été refusé par Resend) — vérifier le domaine`);
            results.push({ id: action.id, ok: false, error: 'fallback_refused' });
            console.error(`[publish-approved] inbound_reply fallback REFUSED → ${to}`);
            continue;
          }
          if (!sent?.success) {
            await markActionFailed(action.id, (sent?.error || 'send failed').slice(0, 500));
            results.push({ id: action.id, ok: false, error: sent?.error || 'send_failed' });
            continue;
          }

          await markActionExecuted(action.id, {
            inbound_reply: {
              sent_to: to,
              subject: draft_subject,
              from: fromHeader,
              category: classification?.category || null,
              sent_at: new Date().toISOString(),
              provider_id: sent?.id || null,
            },
          });
          results.push({ id: action.id, ok: true, sent_to: to, type: 'inbound_reply' });
          console.log(`[publish-approved] Inbound reply OK → ${to} (from @${sender.domain})`);
        } catch (err) {
          const errMsg = err.message || String(err);
          await markActionFailed(action.id, errMsg.slice(0, 500));
          results.push({ id: action.id, ok: false, error: errMsg });
          console.error(`[publish-approved] Inbound reply FAILED : ${errMsg}`);
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
