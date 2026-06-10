// GET    /api/admin/prospection/lists/[id]   → détails liste + premiers contacts
// PATCH  /api/admin/prospection/lists/[id]   → met à jour nom/description/source
// DELETE /api/admin/prospection/lists/[id]   → supprime liste + contacts (cascade)

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';

export async function GET(request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;
  const { id } = await params;

  const url = new URL(request.url);
  const limit = Math.min(500, parseInt(url.searchParams.get('limit') || '100', 10));
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));
  const search = url.searchParams.get('search') || '';

  // Récup la liste (RLS vérifie owner_id)
  const { data: list, error: listErr } = await supabase
    .from('prospect_lists')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (listErr || !list) return NextResponse.json({ error: 'Liste introuvable' }, { status: 404 });

  // Récup les contacts
  let query = supabase
    .from('prospect_contacts')
    .select('id, email, phone, first_name, last_name, company, position_title, custom_fields, opt_out, opt_out_at, bounce_count, last_email_at, last_sms_at, imported_at', { count: 'exact' })
    .eq('list_id', id)
    .order('imported_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    const safeSearch = search.replace(/[%_]/g, '\\$&');
    const like = `%${safeSearch}%`;
    query = query.or(`email.ilike.${like},first_name.ilike.${like},last_name.ilike.${like},company.ilike.${like}`);
  }

  const { data: contacts, error: cErr, count } = await query;
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

  return NextResponse.json({
    list,
    contacts: contacts || [],
    pagination: { total: count || 0, limit, offset, has_more: (offset + limit) < (count || 0) },
  });
}

export async function PATCH(request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const updates = {};
  if (typeof body.name === 'string') updates.name = body.name.trim().slice(0, 120);
  if (typeof body.description === 'string') updates.description = body.description.trim();
  if (typeof body.source === 'string') updates.source = body.source.trim();
  if (body.legal_basis === 'consent' || body.legal_basis === 'legitimate_interest') {
    updates.legal_basis = body.legal_basis;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Rien à mettre à jour' }, { status: 400 });
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('prospect_lists')
    .update(updates)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ list: data });
}

export async function DELETE(request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;
  const { id } = await params;

  const { error } = await supabase
    .from('prospect_lists')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
