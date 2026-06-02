// ─────────────────────────────────────────────────────────────────────
// src/lib/linkedin-engagers-detector.js — Wave 2.1 Growth Loops
// ─────────────────────────────────────────────────────────────────────
// Cron weekly mardi 11h. Détecte les top engageurs sur les posts LinkedIn
// récents (14 derniers jours) → insère dans linkedin_dm_queue.
//
// MODE A — Token w_messaging disponible : envoie DM auto via API
// MODE B — Token sans scope DM : queue dans /admin pour DM manuel
//
// Garde-fous :
//   - Max 20 DM/sem (limite safe LinkedIn)
//   - Skip si déjà DM ces 90j (UNIQUE li_urn)
//   - Skip si engagement < 2 actions (faut au moins 2 likes ou 1 commentaire)
//
// API LinkedIn :
//   - /v2/socialActions/{post-urn}/likes
//   - /v2/socialActions/{post-urn}/comments
//   - /v2/messaging/conversations (scope w_messaging requis)
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';
import { isGrowthLoopsEnabled } from './growth-loops-base';
import { enforceQuotaOrThrow, logAutonomousAction } from './autonomy';

const MAX_DMS_PER_WEEK = 20;
const ENGAGEMENT_WINDOW_DAYS = 14;

async function getLinkedInToken(supabase) {
  const { data } = await supabase
    .from('publisher_credentials')
    .select('access_token, person_urn, scopes')
    .eq('platform', 'linkedin')
    .eq('active', true)
    .maybeSingle();
  return data || null;
}

async function fetchRecentPosts(personUrn, token) {
  // List 14 derniers posts publiés par le founder
  const res = await fetch(
    `https://api.linkedin.com/rest/posts?q=author&author=${encodeURIComponent(personUrn)}&count=20`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202405',
      },
    }
  );
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  return data.elements || [];
}

async function fetchEngagers(postUrn, token) {
  // Comments + reactions sur ce post
  const out = [];
  try {
    const likesRes = await fetch(
      `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(postUrn)}/likes?count=50`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (likesRes.ok) {
      const data = await likesRes.json().catch(() => ({}));
      for (const like of data.elements || []) {
        out.push({ urn: like.actor, type: 'like', post_id: postUrn });
      }
    }
    const commentsRes = await fetch(
      `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(postUrn)}/comments?count=50`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (commentsRes.ok) {
      const data = await commentsRes.json().catch(() => ({}));
      for (const c of data.elements || []) {
        out.push({ urn: c.actor, type: 'comment', post_id: postUrn });
      }
    }
  } catch (err) {
    console.warn('[linkedin-engagers] fetch failed for', postUrn, err.message);
  }
  return out;
}

async function fetchProfile(urn, token) {
  try {
    const id = urn.split(':').pop();
    const res = await fetch(
      `https://api.linkedin.com/v2/people/(id:${id})?projection=(localizedFirstName,localizedLastName,localizedHeadline)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data
      ? { name: `${data.localizedFirstName || ''} ${data.localizedLastName || ''}`.trim(), headline: data.localizedHeadline || '' }
      : null;
  } catch {
    return null;
  }
}

function hasDmScope(scopes) {
  if (!scopes) return false;
  const s = String(scopes).toLowerCase();
  return s.includes('w_messaging') || s.includes('w_message');
}

async function sendLinkedInDm({ recipientUrn, message, token }) {
  // API LinkedIn Messaging (scope w_messaging requis)
  try {
    const res = await fetch('https://api.linkedin.com/v2/messaging/conversations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        recipients: [recipientUrn],
        subject: '',
        body: { text: message },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `LinkedIn ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function buildDmTemplate({ firstName }) {
  const name = firstName || 'toi';
  return `Salut ${name}, j'ai vu que tu likes mes posts sur Volia. Curieux d'avoir ton avis si jamais tu testes ? volia.fr/signup (trial 14j sans CB). Anthony`;
}

export async function runLinkedInEngagersDetector() {
  const startedAt = new Date().toISOString();

  const state = await isGrowthLoopsEnabled();
  if (!state.enabled) {
    return { ok: true, skipped: true, reason: state.reason, startedAt };
  }

  try {
    await enforceQuotaOrThrow('linkedin_dm_outbound', { perWeek: MAX_DMS_PER_WEEK });
  } catch (e) {
    return { ok: true, skipped: true, reason: 'quota_exceeded', detail: e.message, startedAt };
  }

  const supabase = getSupabaseAdmin();
  const creds = await getLinkedInToken(supabase);
  if (!creds?.access_token || !creds?.person_urn) {
    return { ok: false, error: 'linkedin_credentials_missing', startedAt };
  }

  // Fetch posts récents
  const posts = await fetchRecentPosts(creds.person_urn, creds.access_token);
  if (!posts.length) {
    return { ok: true, processed: 0, reason: 'no_recent_posts', startedAt };
  }

  // Agrège engageurs avec compte
  const engagementMap = new Map();
  for (const post of posts.slice(0, 14)) {
    const engagers = await fetchEngagers(post.id || post.urn, creds.access_token);
    for (const e of engagers) {
      if (!engagementMap.has(e.urn)) {
        engagementMap.set(e.urn, { urn: e.urn, count: 0, types: [], post_ids: [] });
      }
      const entry = engagementMap.get(e.urn);
      entry.count++;
      entry.types.push(e.type);
      entry.post_ids.push(e.post_id);
    }
  }

  // Top engageurs (>=2 actions)
  const topEngagers = Array.from(engagementMap.values())
    .filter((e) => e.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_DMS_PER_WEEK);

  if (topEngagers.length === 0) {
    return { ok: true, processed: 0, reason: 'no_qualifying_engagers', startedAt };
  }

  const results = { sent: [], queued: [], skipped: [], errors: [] };
  const canDm = hasDmScope(creds.scopes);

  for (const engager of topEngagers) {
    // Skip si déjà dans la queue (UNIQUE urn)
    const { data: existing } = await supabase
      .from('linkedin_dm_queue')
      .select('id, status')
      .eq('li_urn', engager.urn)
      .maybeSingle();
    if (existing) {
      results.skipped.push({ urn: engager.urn, reason: 'already_in_queue' });
      continue;
    }

    // Fetch profile (optionnel)
    const profile = await fetchProfile(engager.urn, creds.access_token);
    const firstName = profile?.name?.split(' ')[0] || null;

    // Insert dans queue
    const baseRow = {
      li_urn: engager.urn,
      li_name: profile?.name || null,
      li_headline: profile?.headline || null,
      li_post_id: engager.post_ids[0],
      engagement_type: `${engager.count}x: ${[...new Set(engager.types)].join(',')}`,
      status: 'pending',
    };

    if (canDm) {
      const dmRes = await sendLinkedInDm({
        recipientUrn: engager.urn,
        message: buildDmTemplate({ firstName }),
        token: creds.access_token,
      });
      if (dmRes.ok) {
        await supabase.from('linkedin_dm_queue').insert({
          ...baseRow,
          dm_sent_at: new Date().toISOString(),
          dm_method: 'api_auto',
          status: 'sent',
        });
        results.sent.push({ urn: engager.urn, name: profile?.name });
        await logAutonomousAction({
          actionType: 'linkedin_dm_outbound',
          source: 'cron/linkedin-engagers-detector',
          riskLevel: 'medium',
          payload: { urn: engager.urn, name: profile?.name, count: engager.count },
          preview: `💼 LI DM → ${profile?.name || engager.urn}`,
          rationale: `Top engageur ${engager.count}x sur posts récents`,
          autoExecute: true,
        });
      } else {
        // Fallback queue manuelle si DM auto fail
        await supabase.from('linkedin_dm_queue').insert({
          ...baseRow,
          status: 'pending',
          notes: `auto-send failed: ${dmRes.error}`,
        });
        results.queued.push({ urn: engager.urn, reason: 'api_failed', detail: dmRes.error });
      }
    } else {
      // Queue manuelle (founder DM lui-même via /admin/linkedin-dm-queue)
      await supabase.from('linkedin_dm_queue').insert({
        ...baseRow,
        status: 'pending',
        notes: 'no_w_messaging_scope_in_token',
      });
      results.queued.push({ urn: engager.urn, reason: 'no_dm_scope' });
    }
  }

  return {
    ok: true,
    sent_count: results.sent.length,
    queued_count: results.queued.length,
    skipped_count: results.skipped.length,
    errors_count: results.errors.length,
    dm_mode: canDm ? 'api_auto' : 'manual_queue',
    results,
    startedAt,
  };
}
