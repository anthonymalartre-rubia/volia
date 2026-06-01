import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase
    .from('user_profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const daysBack = Math.min(Math.max(parseInt(searchParams.get('days') || '14', 10), 1), 90);

  const supaAdmin = getSupabaseAdmin();
  const fromDate = new Date(Date.now() - daysBack * 86400 * 1000).toISOString().slice(0, 10);

  const { data: metrics, error } = await supaAdmin
    .from('autonomy_metrics_daily')
    .select('*')
    .gte('date', fromDate)
    .order('date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aggregate par action_type
  const byType = {};
  let totalCost = 0;
  let totalValue = 0;
  let totalAttempted = 0;
  let totalSucceeded = 0;
  for (const m of metrics || []) {
    if (!byType[m.action_type]) {
      byType[m.action_type] = {
        attempted: 0, succeeded: 0, failed: 0, skipped: 0, cost: 0, value: 0,
      };
    }
    const b = byType[m.action_type];
    b.attempted += m.attempted;
    b.succeeded += m.succeeded;
    b.failed += m.failed;
    b.skipped += m.skipped;
    b.cost += Number(m.est_cost_eur);
    b.value += Number(m.est_value_eur);
    totalCost += Number(m.est_cost_eur);
    totalValue += Number(m.est_value_eur);
    totalAttempted += m.attempted;
    totalSucceeded += m.succeeded;
  }

  const summary = Object.entries(byType).map(([type, b]) => ({
    action_type: type,
    ...b,
    cost: Number(b.cost.toFixed(2)),
    value: Number(b.value.toFixed(2)),
    success_rate_pct: b.attempted > 0 ? Math.round((b.succeeded / b.attempted) * 100) : 0,
    roi_pct: b.cost > 0 ? Math.round(((b.value - b.cost) / b.cost) * 100) : null,
  })).sort((a, b) => b.value - a.value);

  return NextResponse.json({
    ok: true,
    days_back: daysBack,
    total_attempted: totalAttempted,
    total_succeeded: totalSucceeded,
    overall_success_rate_pct: totalAttempted > 0 ? Math.round((totalSucceeded / totalAttempted) * 100) : 0,
    total_cost_eur: Number(totalCost.toFixed(2)),
    total_value_eur: Number(totalValue.toFixed(2)),
    overall_roi_pct: totalCost > 0 ? Math.round(((totalValue - totalCost) / totalCost) * 100) : null,
    by_action_type: summary,
    daily: metrics || [],
  });
}
