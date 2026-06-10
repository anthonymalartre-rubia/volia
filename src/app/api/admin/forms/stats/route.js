// ─────────────────────────────────────────────────────────────────
// GET /api/admin/forms/stats — Stats globales du module (Sprint F7)
// ─────────────────────────────────────────────────────────────────
// Renvoie l'agrégat pour la page /app/formulaires/stats :
//   - totals : views, submissions, conversion rate
//   - bridges_health : count par bridge_status
//   - top_by_submissions : top 5 forms triés par submission_count
//   - top_by_conversion : top 5 forms triés par taux (min 20 vues pour
//     éviter les outliers)
//   - submissions_by_day : tableau [{day, count}] des 30 derniers jours
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

// Renvoie 'YYYY-MM-DD' à partir d'une date ISO ou d'un Date object
function isoDay(iso) {
  if (!iso) return null;
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  // ─── 1. Tous les forms de l'user (RLS-aware, on prend juste les cols
  //        nécessaires pour les agrégats — pas le schema) ────
  const { data: forms, error: formsError } = await supabase
    .from('forms')
    .select('id, name, slug, status, submission_count, view_count, created_at')
    .eq('user_id', user.id);

  if (formsError) {
    return NextResponse.json({ success: false, error: formsError.message }, { status: 500 });
  }

  const formsList = forms || [];
  const totalViews = formsList.reduce((acc, f) => acc + (f.view_count || 0), 0);
  const totalSubmissions = formsList.reduce((acc, f) => acc + (f.submission_count || 0), 0);
  const conversionRate = totalViews > 0
    ? Number(((totalSubmissions / totalViews) * 100).toFixed(2))
    : 0;

  // Top 5 par submissions
  const topBySubmissions = [...formsList]
    .sort((a, b) => (b.submission_count || 0) - (a.submission_count || 0))
    .slice(0, 5)
    .map((f) => ({
      id: f.id,
      name: f.name,
      slug: f.slug,
      submissions: f.submission_count || 0,
      views: f.view_count || 0,
      conversion_rate: f.view_count > 0
        ? Number(((f.submission_count / f.view_count) * 100).toFixed(2))
        : 0,
    }));

  // Top 5 par conv rate (min 20 vues pour éviter les outliers)
  const topByConversion = [...formsList]
    .filter((f) => (f.view_count || 0) >= 20)
    .map((f) => ({
      id: f.id,
      name: f.name,
      slug: f.slug,
      submissions: f.submission_count || 0,
      views: f.view_count || 0,
      conversion_rate: Number(((f.submission_count / f.view_count) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.conversion_rate - a.conversion_rate)
    .slice(0, 5);

  // ─── 2. Bridge health : count par status sur les 30 derniers jours ────
  // On filtre par form_id ∈ {nos forms} et submitted_at >= now-30d.
  const sinceIso = new Date(Date.now() - 30 * 86400 * 1000).toISOString();
  let bridgesHealth = { succeeded: 0, failed: 0, skipped: 0, pending: 0 };

  if (formsList.length > 0) {
    const formIds = formsList.map((f) => f.id);
    const { data: responses, error: respError } = await supabase
      .from('form_responses')
      .select('bridge_status, submitted_at')
      .in('form_id', formIds)
      .gte('submitted_at', sinceIso)
      .limit(5000);

    if (!respError && responses) {
      // Bridge health
      for (const r of responses) {
        const status = r.bridge_status || 'pending';
        if (bridgesHealth[status] !== undefined) {
          bridgesHealth[status] += 1;
        } else {
          bridgesHealth.pending += 1;
        }
      }

      // ─── 3. Submissions par jour (30 derniers jours) ────
      const dayMap = new Map();
      // Pré-remplit les 30 derniers jours pour avoir une courbe continue
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400 * 1000);
        dayMap.set(isoDay(d), 0);
      }
      for (const r of responses) {
        const day = isoDay(r.submitted_at);
        if (day && dayMap.has(day)) {
          dayMap.set(day, dayMap.get(day) + 1);
        }
      }
      const submissionsByDay = Array.from(dayMap.entries()).map(([day, count]) => ({
        day,
        count,
      }));

      return NextResponse.json({
        success: true,
        totals: {
          forms_count: formsList.length,
          published_count: formsList.filter((f) => f.status === 'published').length,
          views: totalViews,
          submissions: totalSubmissions,
          conversion_rate: conversionRate,
        },
        bridges_health: bridgesHealth,
        top_by_submissions: topBySubmissions,
        top_by_conversion: topByConversion,
        submissions_by_day: submissionsByDay,
      });
    }
  }

  // Pas de responses ou erreur de fetch → on renvoie la structure complète,
  // avec submissions_by_day vide rempli de 0 sur 30 jours.
  const dayMap = new Map();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400 * 1000);
    dayMap.set(isoDay(d), 0);
  }
  const submissionsByDay = Array.from(dayMap.entries()).map(([day, count]) => ({ day, count }));

  return NextResponse.json({
    success: true,
    totals: {
      forms_count: formsList.length,
      published_count: formsList.filter((f) => f.status === 'published').length,
      views: totalViews,
      submissions: totalSubmissions,
      conversion_rate: conversionRate,
    },
    bridges_health: bridgesHealth,
    top_by_submissions: topBySubmissions,
    top_by_conversion: topByConversion,
    submissions_by_day: submissionsByDay,
  });
}
