import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getTopHotLeads } from '@/lib/lead-scoring';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const result = await getTopHotLeads(50);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result);
}
