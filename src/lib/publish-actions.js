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

const MAX_PER_RUN = 5;
const ELIGIBLE_ACTION_TYPES = ['linkedin_post'];

/**
 * Pioche jusqu'à 5 actions approuvées non-publiées, publie sur LinkedIn,
 * marque executed/failed selon résultat. Retourne un summary.
 */
export async function runPublishApprovedActions() {
  if (!isAutonomyEnabled()) {
    return {
      ok: true,
      skipped: true,
      reason: 'autonomy_disabled',
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
