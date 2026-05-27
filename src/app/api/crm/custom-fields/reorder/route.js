// ─────────────────────────────────────────────────────────────────────
// /api/crm/custom-fields/reorder
// ─────────────────────────────────────────────────────────────────────
// POST body: { ids: [uuid, uuid, ...] }
//   → réécrit la position de chaque field dans l'ordre du tableau.
// RLS Supabase garantit qu'on ne peut update que ses propres fields.
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

export async function POST(request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const hasAccess = await checkCrmAccess(supabase, user.id);
  if (!hasAccess) return forbidden();

  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === 'string') : [];

  if (ids.length === 0) {
    return NextResponse.json(
      { success: false, error: 'ids[] requis' },
      { status: 400 }
    );
  }
  if (ids.length > 100) {
    return NextResponse.json(
      { success: false, error: 'Trop de fields (max 100)' },
      { status: 400 }
    );
  }

  // Update sequentiel — petit volume, simple, RLS-safe.
  const errors = [];
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from('crm_custom_fields')
      .update({ position: i })
      .eq('id', ids[i])
      .eq('user_id', user.id);
    if (error) errors.push({ id: ids[i], error: error.message });
  }

  if (errors.length > 0) {
    console.error('[api/crm/custom-fields/reorder] partial errors', errors);
    return NextResponse.json(
      { success: false, error: 'Certaines positions n\'ont pas pu être mises à jour', errors },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
