// ─────────────────────────────────────────────────────────────────
// GET /api/app/formulaires/[id]/analytics — Analytics par form (Sprint F7)
// ─────────────────────────────────────────────────────────────────
// Renvoie les stats détaillées d'un seul formulaire :
//   - totals : views, submissions, conv rate, avg completion time
//   - submissions_by_day : courbe 30 derniers jours
//   - top_referers : top 10 sources
//   - device_distribution : count par device_type (mobile/desktop/tablet)
//   - bridges_breakdown : count par bridge_status
//
// Important : on n'expose pas les answers ici. La page détail réponse
// utilise /api/app/formulaires/[id]/responses + responses/[responseId].
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

function isoDay(iso) {
  if (!iso) return null;
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

// Normalise un referer en "host" propre pour grouper (drop query/path)
function normalizeReferer(ref) {
  if (!ref || typeof ref !== 'string') return null;
  try {
    const u = new URL(ref);
    return u.hostname.replace(/^www\./, '');
  } catch {
    // pas une URL valide
    return ref.slice(0, 80);
  }
}

export async function GET(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  const { id } = await params;

  // Ownership check + récupération des counters globaux
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id, name, slug, status, submission_count, view_count, published_at, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (formError) {
    return NextResponse.json({ success: false, error: formError.message }, { status: 500 });
  }
  if (!form) {
    return NextResponse.json({ success: false, error: 'Formulaire introuvable' }, { status: 404 });
  }

  // 30 derniers jours
  const sinceIso = new Date(Date.now() - 30 * 86400 * 1000).toISOString();

  const { data: responses, error: respError } = await supabase
    .from('form_responses')
    .select('bridge_status, metadata, submitted_at')
    .eq('form_id', id)
    .gte('submitted_at', sinceIso)
    .order('submitted_at', { ascending: false })
    .limit(5000);

  if (respError) {
    return NextResponse.json({ success: false, error: respError.message }, { status: 500 });
  }

  // Init dayMap 30 jours
  const dayMap = new Map();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400 * 1000);
    dayMap.set(isoDay(d), 0);
  }

  const bridgesBreakdown = { succeeded: 0, failed: 0, skipped: 0, pending: 0 };
  const refererCounts = new Map();
  const deviceCounts = { mobile: 0, desktop: 0, tablet: 0, unknown: 0 };
  let completionTimes = []; // ms

  for (const r of responses || []) {
    const day = isoDay(r.submitted_at);
    if (day && dayMap.has(day)) dayMap.set(day, dayMap.get(day) + 1);

    const status = r.bridge_status || 'pending';
    if (bridgesBreakdown[status] !== undefined) {
      bridgesBreakdown[status] += 1;
    } else {
      bridgesBreakdown.pending += 1;
    }

    const meta = r.metadata && typeof r.metadata === 'object' ? r.metadata : {};
    const refHost = normalizeReferer(meta.referer);
    if (refHost) {
      refererCounts.set(refHost, (refererCounts.get(refHost) || 0) + 1);
    } else {
      refererCounts.set('(direct)', (refererCounts.get('(direct)') || 0) + 1);
    }

    const device = meta.device_type || 'unknown';
    if (deviceCounts[device] !== undefined) {
      deviceCounts[device] += 1;
    } else {
      deviceCounts.unknown += 1;
    }

    if (typeof meta.completion_time_ms === 'number' && meta.completion_time_ms > 0) {
      completionTimes.push(meta.completion_time_ms);
    }
  }

  const submissionsByDay = Array.from(dayMap.entries()).map(([day, count]) => ({ day, count }));

  const topReferers = Array.from(refererCounts.entries())
    .map(([host, count]) => ({ host, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
  const deviceDistribution = Object.entries(deviceCounts).map(([device, count]) => ({
    device,
    count,
    percent: totalDevices > 0 ? Number(((count / totalDevices) * 100).toFixed(1)) : 0,
  }));

  const avgCompletionMs = completionTimes.length > 0
    ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
    : null;

  const conversionRate = (form.view_count || 0) > 0
    ? Number(((form.submission_count / form.view_count) * 100).toFixed(2))
    : 0;

  return NextResponse.json({
    success: true,
    form: {
      id: form.id,
      name: form.name,
      slug: form.slug,
      status: form.status,
      created_at: form.created_at,
      published_at: form.published_at,
    },
    totals: {
      views: form.view_count || 0,
      submissions: form.submission_count || 0,
      conversion_rate: conversionRate,
      avg_completion_ms: avgCompletionMs,
      window_submissions_30d: (responses || []).length,
    },
    submissions_by_day: submissionsByDay,
    top_referers: topReferers,
    device_distribution: deviceDistribution,
    bridges_breakdown: bridgesBreakdown,
  });
}
