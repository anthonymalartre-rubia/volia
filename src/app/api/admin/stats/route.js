import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

async function checkAdmin(user, supabase) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  return !!profile?.is_admin;
}

export async function GET() {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    if (!(await checkAdmin(user, supabase))) return NextResponse.json({ error: 'Non autorise' }, { status: 403 });

    const admin = getSupabaseAdmin();

    // Current month string
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Run all queries in parallel
    // Build last 6 months list
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const [
      profilesRes,
      prospectsCountRes,
      prospectsWithEmailRes,
      usageThisMonthRes,
      enrichmentSourcesRes,
      usageHistoryRes,
      prospectsByUserRes,
      apiCostsThisMonthRes,
      apiCostsHistoryRes,
    ] = await Promise.all([
      // All user profiles
      admin.from('user_profiles').select('id, plan, stripe_customer_id, created_at'),
      // Total prospects count
      admin.from('prospects').select('id', { count: 'exact', head: true }),
      // Prospects with email
      admin.from('prospects').select('id', { count: 'exact', head: true }).not('email', 'is', null).neq('email', ''),
      // Usage this month
      admin.from('usage_tracking').select('*').eq('month', currentMonth),
      // Enrichment sources breakdown
      admin.from('prospects').select('email_method'),
      // Usage history last 6 months
      admin.from('usage_tracking').select('month, searches, enrichments, exports').in('month', last6Months),
      // Prospect counts per user
      admin.from('prospects').select('user_id'),
      // API costs this month
      admin.from('api_usage_monthly').select('service, call_count, total_cost_cents').eq('month', currentMonth),
      // API costs last 6 months
      admin.from('api_usage_monthly').select('service, month, call_count, total_cost_cents').in('month', last6Months),
    ]);

    const profiles = profilesRes.data || [];
    const totalProspects = prospectsCountRes.count || 0;
    const totalWithEmail = prospectsWithEmailRes.count || 0;
    const usageThisMonth = usageThisMonthRes.data || [];
    const enrichmentRaw = enrichmentSourcesRes.data || [];
    const usageHistoryRaw = usageHistoryRes.data || [];
    const prospectsByUser = prospectsByUserRes.data || [];

    // Plan breakdown
    const planCounts = { free: 0, pro: 0, enterprise: 0 };
    profiles.forEach(p => {
      const plan = p.plan || 'free';
      if (planCounts[plan] !== undefined) planCounts[plan]++;
      else planCounts.free++;
    });

    // MRR
    const mrr = (planCounts.pro * 49) + (planCounts.enterprise * 149);

    // Totals this month
    let totalSearches = 0, totalEnrichments = 0, totalExports = 0;
    usageThisMonth.forEach(u => {
      totalSearches += u.searches || 0;
      totalEnrichments += u.enrichments || 0;
      totalExports += u.exports || 0;
    });

    // Enrichment sources breakdown
    const enrichmentSources = {};
    enrichmentRaw.forEach(p => {
      const method = p.email_method || 'unknown';
      enrichmentSources[method] = (enrichmentSources[method] || 0) + 1;
    });

    // Usage history grouped by month
    const usageHistory = {};
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      usageHistory[m] = { searches: 0, enrichments: 0, exports: 0 };
    }
    usageHistoryRaw.forEach(u => {
      if (usageHistory[u.month]) {
        usageHistory[u.month].searches += u.searches || 0;
        usageHistory[u.month].enrichments += u.enrichments || 0;
        usageHistory[u.month].exports += u.exports || 0;
      }
    });

    // Prospect counts per user
    const prospectCountMap = {};
    prospectsByUser.forEach(p => {
      prospectCountMap[p.user_id] = (prospectCountMap[p.user_id] || 0) + 1;
    });

    // Usage per user this month (for top users)
    const usagePerUser = usageThisMonth.map(u => ({
      user_id: u.user_id,
      searches: u.searches || 0,
      enrichments: u.enrichments || 0,
      exports: u.exports || 0,
      prospects: prospectCountMap[u.user_id] || 0,
    }));

    // API costs this month (per service)
    const apiCostsThisMonth = {};
    let totalApiCostCents = 0;
    (apiCostsThisMonthRes.data || []).forEach(row => {
      apiCostsThisMonth[row.service] = {
        calls: row.call_count || 0,
        cost_cents: parseFloat(row.total_cost_cents) || 0,
      };
      totalApiCostCents += parseFloat(row.total_cost_cents) || 0;
    });

    // API costs history (per month, all services aggregated)
    const apiCostsHistory = {};
    last6Months.forEach(m => { apiCostsHistory[m] = { total_cents: 0, services: {} }; });
    (apiCostsHistoryRes.data || []).forEach(row => {
      if (apiCostsHistory[row.month]) {
        apiCostsHistory[row.month].total_cents += parseFloat(row.total_cost_cents) || 0;
        apiCostsHistory[row.month].services[row.service] = {
          calls: row.call_count || 0,
          cost_cents: parseFloat(row.total_cost_cents) || 0,
        };
      }
    });

    return NextResponse.json({
      global: {
        totalUsers: profiles.length,
        totalProspects,
        totalWithEmail,
        totalSearches,
        totalEnrichments,
        totalExports,
      },
      revenue: {
        planCounts,
        mrr,
      },
      enrichmentSources,
      usageHistory,
      usagePerUser,
      apiCosts: {
        thisMonth: apiCostsThisMonth,
        totalThisMonth: totalApiCostCents,
        history: apiCostsHistory,
      },
    });
  } catch (err) {
    console.error('Admin stats GET error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
