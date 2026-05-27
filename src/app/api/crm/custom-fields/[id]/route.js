// ─────────────────────────────────────────────────────────────────────
// /api/crm/custom-fields/[id]
// ─────────────────────────────────────────────────────────────────────
// PATCH  → update label / options / position / required / archived
// DELETE → soft delete (archived = true). Pas de hard delete pour
//          préserver les valeurs déjà stockées sur les contacts/deals.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkCrmAccess } from '@/lib/crm';

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'CRM réservé au plan Business 149€/mois' },
    { status: 403 }
  );
}

function normalizeOptions(type, raw) {
  if (type !== 'select') return null;
  let arr = [];
  if (Array.isArray(raw)) arr = raw;
  else if (raw && Array.isArray(raw.options)) arr = raw.options;
  arr = arr
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter((s) => s.length > 0)
    .slice(0, 50);
  return { options: arr };
}

export async function PATCH(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return forbidden();

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  // Fetch current pour avoir le field_type (utile à la normalisation options)
  const { data: existing } = await supabase
    .from('crm_custom_fields')
    .select('id, field_type')
    .eq('id', id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Field introuvable' }, { status: 404 });
  }

  const updates = {};
  if (typeof body.field_label === 'string') {
    const l = body.field_label.trim();
    if (!l) {
      return NextResponse.json(
        { success: false, error: 'field_label ne peut pas être vide' },
        { status: 400 }
      );
    }
    updates.field_label = l.slice(0, 100);
  }
  if (body.field_options !== undefined) {
    updates.field_options = normalizeOptions(existing.field_type, body.field_options);
  }
  if (body.position !== undefined) {
    const p = Number(body.position);
    if (!Number.isInteger(p) || p < 0) {
      return NextResponse.json(
        { success: false, error: 'position doit être un entier positif' },
        { status: 400 }
      );
    }
    updates.position = p;
  }
  if (body.required !== undefined) {
    updates.required = !!body.required;
  }
  if (body.archived !== undefined) {
    updates.archived = !!body.archived;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { success: false, error: 'Aucune modification fournie' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('crm_custom_fields')
    .update(updates)
    .eq('id', id)
    .select('id, entity, field_key, field_label, field_type, field_options, position, required, archived, created_at')
    .single();

  if (error) {
    console.error('[api/crm/custom-fields/[id]] PATCH error', error);
    if (error.code === 'PGRST116') {
      return NextResponse.json({ success: false, error: 'Field introuvable' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return forbidden();

  const { id } = await params;

  // Soft delete : archived = true
  const { data, error } = await supabase
    .from('crm_custom_fields')
    .update({ archived: true })
    .eq('id', id)
    .select('id')
    .single();

  if (error) {
    console.error('[api/crm/custom-fields/[id]] DELETE error', error);
    if (error.code === 'PGRST116') {
      return NextResponse.json({ success: false, error: 'Field introuvable' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
