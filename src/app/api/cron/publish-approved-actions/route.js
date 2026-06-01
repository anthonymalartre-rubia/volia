// ─────────────────────────────────────────────────────────────────────
// /api/cron/publish-approved-actions — Publication auto des actions approuvées
// ─────────────────────────────────────────────────────────────────────
//
// Schedule : */15 * * * * (toutes les 15 minutes)
//
// Pioche les actions autonomes :
//   - status = 'approved'
//   - action_type IN ('linkedin_post')   ← extensible facilement
//   - result IS NULL                      ← pas encore publié
//   - limit 5 par run (anti-rafale, anti-spam)
//
// Pour chaque action :
//   - Publie payload.linkedin via publishOn('linkedin', ...)
//   - Si succès → markActionExecuted({ linkedin: { url, posted_at }, twitter: skipped })
//   - Si fail → markActionFailed(errorMessage)
//
// Garde-fous :
//   - Skip si autonomy_enabled = false (kill switch global)
//   - Skip si publisher LinkedIn pas configuré (founder copie manuellement)
//   - Maximum 5 publications par run pour limiter blast radius
//   - Si LinkedIn renvoie 401 (token expiré) → markFailed + log explicite
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { cleanEnv } from '@/lib/envClean';
import {
  isAutonomyEnabled,
  markActionExecuted,
  markActionFailed,
} from '@/lib/autonomy';
import { publishOn } from '@/lib/publishers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_PER_RUN = 5;
const ELIGIBLE_ACTION_TYPES = ['linkedin_post'];

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Kill switch global
  if (!isAutonomyEnabled()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: 'autonomy_disabled',
    });
  }

  const supabase = getSupabaseAdmin();

  // Récupère les actions approuvées non encore publiées
  const { data: actions, error } = await supabase
    .from('autonomous_actions')
    .select('id, action_type, payload, approved_at, expires_at')
    .eq('status', 'approved')
    .in('action_type', ELIGIBLE_ACTION_TYPES)
    .is('result', null)
    .order('approved_at', { ascending: true })
    .limit(MAX_PER_RUN);

  if (error) {
    console.error('[cron/publish-approved-actions] query error', error);
    return NextResponse.json(
      { ok: false, error: 'query_error', detail: error.message },
      { status: 500 }
    );
  }

  if (!actions || actions.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, message: 'queue vide' });
  }

  // Traite chaque action séquentiellement (anti rate-limit LinkedIn)
  const results = [];
  for (const action of actions) {
    try {
      const linkedinText = action.payload?.linkedin;
      if (!linkedinText) {
        await markActionFailed(action.id, 'payload.linkedin absent');
        results.push({ id: action.id, ok: false, error: 'no_linkedin_text' });
        continue;
      }

      // Publication LinkedIn
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
        // Publisher pas configuré → on ne marque PAS comme failed
        // (l'action reste en 'approved', le founder copie manuellement)
        results.push({
          id: action.id,
          ok: false,
          skipped: true,
          reason: publishResult.reason,
        });
        console.log(`[publish-approved] LinkedIn skipped : ${publishResult.reason}`);
      } else {
        // Erreur réelle (token expiré, 422 duplicate, etc.) → markFailed
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

  const summary = {
    ok: true,
    processed: results.length,
    published: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok && !r.skipped).length,
    skipped: results.filter((r) => r.skipped).length,
    results,
  };
  return NextResponse.json(summary);
}
