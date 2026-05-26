// /api/webhooks/deliveries/[id]
//
// GET → détail complet d'une delivery (payload + response_body inclus).
// Utilisé par le drawer "détail" dans le tab Logs.

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';

export async function GET(_request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;
  const { id } = await params;

  const { data, error } = await supabase
    .from('webhook_deliveries')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[api/webhooks/deliveries/[id]] GET error', error);
    return NextResponse.json({ error: 'Erreur lecture' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Delivery introuvable' }, { status: 404 });

  return NextResponse.json({ delivery: data });
}
