// GET   /api/crm/automations → préférences d'automatisation CRM du user
// PATCH /api/crm/automations → { won_onboarding?, stale_relance? } (booléens)
// Réservé au plan Business.

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkCrmAccess } from '@/lib/crm';

export const dynamic = 'force-dynamic';

const DEFAULTS = { won_onboarding: true, stale_relance: true };

function forbidden() {
  return NextResponse.json({ success: false, error: 'CRM réservé au plan Business' }, { status: 403 });
}

export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkCrmAccess(supabase, user.id))) return forbidden();

  const { data } = await supabase
    .from('user_profiles').select('crm_automation_prefs').eq('id', user.id).maybeSingle();
  return NextResponse.json({ success: true, data: { ...DEFAULTS, ...(data?.crm_automation_prefs || {}) } });
}

export async function PATCH(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!(await checkCrmAccess(supabase, user.id))) return forbidden();

  const body = await request.json().catch(() => ({}));
  const { data: existing } = await supabase
    .from('user_profiles').select('crm_automation_prefs').eq('id', user.id).maybeSingle();
  const prefs = { ...DEFAULTS, ...(existing?.crm_automation_prefs || {}) };
  if (typeof body.won_onboarding === 'boolean') prefs.won_onboarding = body.won_onboarding;
  if (typeof body.stale_relance === 'boolean') prefs.stale_relance = body.stale_relance;

  const { error } = await supabase
    .from('user_profiles').update({ crm_automation_prefs: prefs }).eq('id', user.id);
  if (error) {
    console.error('[api/crm/automations] PATCH error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: prefs });
}
