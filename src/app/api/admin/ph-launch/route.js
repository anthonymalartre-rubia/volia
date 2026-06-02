// API CRUD minimaliste pour Wave 3.1 — Product Hunt launches
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { generateMakerComment } from '@/lib/product-hunt-launcher';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function requireAdmin() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { error: 'Unauthorized', status: 401 };
  const { data: profile } = await supabase
    .from('user_profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!profile?.is_admin) return { error: 'Forbidden', status: 403 };
  return { user };
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('product_hunt_launches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  return NextResponse.json({ ok: true, launches: data || [] });
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const { action, id, ...fields } = body;

  const supabase = getSupabaseAdmin();

  if (action === 'create') {
    const { data, error } = await supabase
      .from('product_hunt_launches')
      .insert({
        name: fields.name || 'Volia Launch',
        scheduled_date: fields.scheduled_date || null,
        status: 'planning',
      })
      .select()
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, launch: data });
  }

  if (action === 'update') {
    if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
    const update = { updated_at: new Date().toISOString() };
    [
      'name', 'scheduled_date', 'status', 'checklist_state', 'maker_comment_draft',
      'tagline', 'description', 'hunter_list',
      'network_emails_sent_count', 'hunters_dm_sent_count',
      'votes_count', 'rank_of_day', 'rank_of_week', 'signups_attributed', 'notes',
    ].forEach((k) => {
      if (fields[k] !== undefined) update[k] = fields[k];
    });
    const { data, error } = await supabase
      .from('product_hunt_launches')
      .update(update)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, launch: data });
  }

  if (action === 'generate_maker_comment') {
    const result = await generateMakerComment({
      tagline: fields.tagline || '',
      description: fields.description || '',
      vibe: fields.vibe || 'authentic-founder',
    });
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
}
