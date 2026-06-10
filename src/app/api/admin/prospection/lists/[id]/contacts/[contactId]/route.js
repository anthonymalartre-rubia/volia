// DELETE /api/admin/prospection/lists/[id]/contacts/[contactId]
// Supprime un contact spécifique d'une liste.

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';

export async function DELETE(request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;
  const { id: listId, contactId } = await params;

  const { error } = await supabase
    .from('prospect_contacts')
    .delete()
    .eq('list_id', listId)
    .eq('id', contactId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PATCH pour marquer opt-out / unopt-out
export async function PATCH(request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;
  const { id: listId, contactId } = await params;
  const body = await request.json().catch(() => ({}));

  const updates = { updated_at: new Date().toISOString() };
  if (typeof body.opt_out === 'boolean') {
    updates.opt_out = body.opt_out;
    updates.opt_out_at = body.opt_out ? new Date().toISOString() : null;
    if (body.opt_out_reason) updates.opt_out_reason = String(body.opt_out_reason).slice(0, 200);
  }

  const { data, error } = await supabase
    .from('prospect_contacts')
    .update(updates)
    .eq('list_id', listId)
    .eq('id', contactId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contact: data });
}
