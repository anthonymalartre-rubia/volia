// /api/webhooks/subscriptions/[id]/test
//
// Envoie un payload de test à une subscription existante (event_type='test').
// Le résultat est inséré dans webhook_deliveries → visible dans le tab Logs.
//
// Réponse JSON : { delivery: { status, duration_ms, success, error, ... } }

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';
import { sendWebhookOnce } from '@/lib/webhooks/emitter';

export async function POST(_request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;
  const { id } = await params;

  const { data: sub, error } = await supabase
    .from('webhook_subscriptions')
    .select('id, target_url, secret, events')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[api/webhooks/subscriptions/[id]/test] fetch error', error);
    return NextResponse.json({ error: 'Erreur lecture' }, { status: 500 });
  }
  if (!sub) return NextResponse.json({ error: 'Webhook introuvable' }, { status: 404 });

  const result = await sendWebhookOnce({
    subscriptionId: sub.id,
    userId: user.id,
    eventType: 'test',
    targetUrl: sub.target_url,
    secret: sub.secret,
    payload: {
      event_type: 'test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook from Volia' },
      test: true,
    },
  });

  return NextResponse.json({ delivery: result });
}
