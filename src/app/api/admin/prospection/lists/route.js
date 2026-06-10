// GET  /api/admin/prospection/lists       → liste des listes du user
// POST /api/admin/prospection/lists       → crée une nouvelle liste

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';

export async function GET() {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;

  const { data, error } = await supabase
    .from('prospect_lists')
    .select('id, name, description, source, legal_basis, contacts_count, email_count, phone_count, opt_out_count, created_at, updated_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lists: data || [] });
}

export async function POST(request) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;

  const body = await request.json().catch(() => ({}));
  const name = (body.name || '').trim();
  const description = (body.description || '').trim() || null;
  const source = (body.source || '').trim() || null;
  const legal_basis = body.legal_basis === 'consent' ? 'consent' : 'legitimate_interest';

  if (!name || name.length > 120) {
    return NextResponse.json({ error: 'Nom requis (1-120 caractères)' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('prospect_lists')
    .insert({ owner_id: user.id, name, description, source, legal_basis })
    .select('id, name, description, source, legal_basis, contacts_count, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ list: data });
}
