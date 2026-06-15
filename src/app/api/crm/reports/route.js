// GET /api/crm/reports?pipeline_id=  → rapport de performance commerciale (P3-1)
// Agrégats calculés en base via la RPC crm_pipeline_report (SECURITY INVOKER,
// donc RLS appliquée). Freemium : ouvert à tous les plans (quotas via plans.js).

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkCrmAccess } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: 'Limite de votre plan atteinte — passez à MAX pour l\'illimité' },
      { status: 403 }
    );
  }

  const pipelineId = new URL(request.url).searchParams.get('pipeline_id');
  if (!pipelineId) {
    return NextResponse.json({ success: false, error: 'pipeline_id requis' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('crm_pipeline_report', { p_pipeline_id: pipelineId });
  if (error) {
    console.error('[api/crm/reports] rpc error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data || {} });
}
