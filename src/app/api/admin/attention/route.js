import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getCockpitAttention } from '@/lib/cockpit-attention';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase
    .from('user_profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const data = await getCockpitAttention();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
