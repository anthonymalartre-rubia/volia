import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getInsightsOverview } from '@/lib/data-insights';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase
    .from('user_profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const result = await getInsightsOverview();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
