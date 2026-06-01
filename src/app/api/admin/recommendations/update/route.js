import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['pending', 'accepted', 'rejected', 'shipped'];

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase
    .from('user_profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const { id, status, notes } = body;
  if (!id || !status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  const supaAdmin = getSupabaseAdmin();
  const { error } = await supaAdmin
    .from('autonomy_recommendations')
    .update({
      status,
      notes: notes || null,
      decided_at: status === 'pending' ? null : new Date().toISOString(),
    })
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
