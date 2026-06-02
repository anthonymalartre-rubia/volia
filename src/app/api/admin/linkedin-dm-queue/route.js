// API CRUD pour /admin/linkedin-dm-queue — Wave 2.1 mode manuel
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { logAutonomousAction } from '@/lib/autonomy';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['pending', 'sent', 'replied', 'skipped'];

async function requireAdmin() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { error: 'Unauthorized', status: 401 };
  const { data: profile } = await supabase
    .from('user_profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!profile?.is_admin) return { error: 'Forbidden', status: 403 };
  return { user };
}

export async function GET(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || null;

  const supabase = getSupabaseAdmin();
  let q = supabase
    .from('linkedin_dm_queue')
    .select('*')
    .order('detected_at', { ascending: false })
    .limit(200);
  if (status && VALID_STATUSES.includes(status)) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Compteurs par status
  const { data: countsRaw } = await supabase
    .from('linkedin_dm_queue')
    .select('status');
  const counts = (countsRaw || []).reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  // DMs envoyés cette semaine
  const weekAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
  const { count: sentThisWeek } = await supabase
    .from('linkedin_dm_queue')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'sent')
    .gte('dm_sent_at', weekAgo);

  return NextResponse.json({
    ok: true,
    items: data || [],
    counts,
    sent_this_week: sentThisWeek || 0,
    weekly_limit: 20,
  });
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const { id, status, notes } = body;

  if (!id || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid params (id + status required)' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const update = { status };
  if (notes !== undefined) update.notes = notes;
  if (status === 'sent') {
    update.dm_sent_at = new Date().toISOString();
    update.dm_method = 'manual';
  } else if (status === 'replied') {
    update.replied_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('linkedin_dm_queue')
    .update(update)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit trail si sent
  if (status === 'sent' && data) {
    await logAutonomousAction({
      actionType: 'linkedin_dm_outbound',
      source: 'admin/linkedin-dm-queue',
      riskLevel: 'low',
      payload: { id: data.id, urn: data.li_urn, name: data.li_name },
      preview: `💼 LI DM manuel → ${data.li_name || data.li_urn}`,
      rationale: 'DM envoyé manuellement par founder via queue admin',
      autoExecute: true,
    });
  }

  return NextResponse.json({ ok: true, item: data });
}
