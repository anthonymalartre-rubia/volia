// /api/usage/threshold-check — Wave 2.2 In-app upgrade prompt
// Vérifie si user >=80% de la limite du plan + cooldown 7j

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PLANS } from '@/lib/plans';

export const dynamic = 'force-dynamic';

const COOLDOWN_DAYS = 7;
const THRESHOLD_PCT = 0.8;

const NEXT_PLAN = { free: 'solo', solo: 'pro', pro: 'business', starter: 'solo' };

export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ show: false, reason: 'unauthenticated' });

  const supaAdmin = getSupabaseAdmin();
  const { data: profile } = await supaAdmin
    .from('user_profiles')
    .select('plan, upgrade_prompt_dismissed_at, upgrade_prompt_last_shown_at')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) return NextResponse.json({ show: false, reason: 'no_profile' });

  // Cooldown 7j depuis dernier show OR dismiss
  const lastShown = profile.upgrade_prompt_last_shown_at
    ? new Date(profile.upgrade_prompt_last_shown_at)
    : null;
  const dismissed = profile.upgrade_prompt_dismissed_at
    ? new Date(profile.upgrade_prompt_dismissed_at)
    : null;
  const cooldownMs = COOLDOWN_DAYS * 86400 * 1000;
  if (lastShown && Date.now() - lastShown < cooldownMs) {
    return NextResponse.json({ show: false, reason: 'cooldown_shown' });
  }
  if (dismissed && Date.now() - dismissed < cooldownMs) {
    return NextResponse.json({ show: false, reason: 'cooldown_dismissed' });
  }

  // Check usage vs plan limit
  const planKey = profile.plan || 'free';
  const plan = PLANS[planKey];
  if (!plan) return NextResponse.json({ show: false, reason: 'unknown_plan' });

  const nextKey = NEXT_PLAN[planKey];
  if (!nextKey || !PLANS[nextKey]) return NextResponse.json({ show: false, reason: 'no_upgrade_path' });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: usage } = await supaAdmin
    .from('usage_tracking')
    .select('searches, enrichments')
    .eq('user_id', user.id)
    .eq('month', currentMonth)
    .maybeSingle();

  const searchesUsed = usage?.searches || 0;
  const enrichmentsUsed = usage?.enrichments || 0;
  const searchesLimit = plan.searches || plan.searchesPerMonth || 0;
  const enrichmentsLimit = plan.enrichmentsPerMonth || plan.enrichments || 0;

  const searchesPct = searchesLimit > 0 ? searchesUsed / searchesLimit : 0;
  const enrichmentsPct = enrichmentsLimit > 0 ? enrichmentsUsed / enrichmentsLimit : 0;
  const maxPct = Math.max(searchesPct, enrichmentsPct);

  if (maxPct < THRESHOLD_PCT) {
    return NextResponse.json({ show: false, reason: 'below_threshold', usage_pct: Math.round(maxPct * 100) });
  }

  // SHOW the prompt — mark last_shown
  await supaAdmin
    .from('user_profiles')
    .update({ upgrade_prompt_last_shown_at: new Date().toISOString() })
    .eq('id', user.id);

  const nextPlan = PLANS[nextKey];

  return NextResponse.json({
    show: true,
    current_plan: planKey,
    next_plan: nextKey,
    next_plan_label: nextPlan.label || nextKey,
    next_plan_price_eur: nextPlan.priceMonthly || nextPlan.price || 0,
    metric_at_limit: searchesPct >= enrichmentsPct ? 'searches' : 'enrichments',
    current_usage: searchesPct >= enrichmentsPct ? searchesUsed : enrichmentsUsed,
    current_limit: searchesPct >= enrichmentsPct ? searchesLimit : enrichmentsLimit,
    next_limit:
      searchesPct >= enrichmentsPct
        ? nextPlan.searches || nextPlan.searchesPerMonth
        : nextPlan.enrichmentsPerMonth || nextPlan.enrichments,
    usage_pct: Math.round(maxPct * 100),
  });
}

export async function POST(request) {
  // Dismiss action
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (body.action !== 'dismiss') return NextResponse.json({ ok: false, error: 'invalid_action' }, { status: 400 });

  const supaAdmin = getSupabaseAdmin();
  await supaAdmin
    .from('user_profiles')
    .update({ upgrade_prompt_dismissed_at: new Date().toISOString() })
    .eq('id', user.id);
  return NextResponse.json({ ok: true });
}
