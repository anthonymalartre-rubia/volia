// /api/webhooks/test
//
// "Ad-hoc test" — utilisé dans la modal de création AVANT que la subscription
// n'ait été persistée. L'user saisit URL + secret et clique "Tester" : on POST
// le payload de test directement sans subscription_id (NULL).
//
// La row webhook_deliveries est quand même créée (subscription_id=null) pour
// donner un trace audit dans le tab Logs si besoin.

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';
import { sendWebhookOnce, generateWebhookSecret } from '@/lib/webhooks/emitter';

export async function POST(request) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  const body = await request.json().catch(() => ({}));
  if (!body.target_url || typeof body.target_url !== 'string') {
    return NextResponse.json({ error: 'target_url requis' }, { status: 400 });
  }

  const secret =
    typeof body.secret === 'string' && body.secret.length >= 16
      ? body.secret
      : generateWebhookSecret();

  const result = await sendWebhookOnce({
    subscriptionId: null,
    userId: user.id,
    eventType: 'test',
    targetUrl: body.target_url,
    secret,
    payload: {
      event_type: 'test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook from Volia' },
      test: true,
    },
  });

  return NextResponse.json({ delivery: result });
}
