// DELETE /api/v1/webhooks/[id]  → désabonne (REST Hooks : Zapier appelle ça
//                                  à la désactivation d'un Zap)
// GET    /api/v1/webhooks/[id]  → détail d'une subscription
//
// On hard-delete plutôt que de set active=false : Zapier attend 200/204 et
// considère la ressource supprimée. Les deliveries historiques restent
// (ON DELETE SET NULL sur subscription_id côté DB).

import { NextResponse } from 'next/server';
import { authenticateApiRequest, apiCorsHeaders } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function corsHeadersAll() {
  return {
    ...apiCorsHeaders(),
    'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeadersAll() });
}

export async function GET(request, { params }) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: apiCorsHeaders() });
  }
  const { id } = await params;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .select('id, target_url, events, label, active, last_triggered_at, success_rate, created_at')
    .eq('id', id)
    .eq('user_id', auth.userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Erreur lecture' }, { status: 500, headers: apiCorsHeaders() });
  }
  if (!data) {
    return NextResponse.json({ error: 'Subscription introuvable' }, { status: 404, headers: apiCorsHeaders() });
  }

  return NextResponse.json(
    {
      id: data.id,
      event_type: Array.isArray(data.events) && data.events.length === 1 ? data.events[0] : null,
      events: data.events || [],
      target_url: data.target_url,
      label: data.label || null,
      active: data.active,
      last_triggered_at: data.last_triggered_at || null,
      success_rate: data.success_rate ?? null,
      created_at: data.created_at,
    },
    { headers: apiCorsHeaders() }
  );
}

export async function DELETE(request, { params }) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: apiCorsHeaders() });
  }
  const { id } = await params;

  const supabase = getSupabaseAdmin();
  // Filtre par user_id pour éviter qu'une clé valide puisse supprimer la
  // subscription d'un autre user via l'UUID (RLS supplémentaire).
  const { error } = await supabase
    .from('webhook_subscriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.userId);

  if (error) {
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500, headers: apiCorsHeaders() });
  }

  return new NextResponse(null, { status: 204, headers: corsHeadersAll() });
}
