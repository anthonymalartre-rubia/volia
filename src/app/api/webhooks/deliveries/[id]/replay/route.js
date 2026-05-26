// /api/webhooks/deliveries/[id]/replay
//
// Replay manuel d'une delivery échouée.
//
// Flow :
//   1. Récupère la delivery originale (payload, target_url, event_type)
//   2. Récupère le secret actuel de la subscription liée (si encore existante)
//   3. Re-envoie le payload exact (= idempotency identique côté client)
//   4. Insert nouvelle row webhook_deliveries avec attempt = previous + 1

import { NextResponse } from 'next/server';
import { requireCampagnesAccess } from '@/lib/campagnes-access-server';
import { sendWebhookOnce } from '@/lib/webhooks/emitter';

export async function POST(_request, { params }) {
  const auth = await requireCampagnesAccess();
  if (auth instanceof NextResponse) return auth;
  const { user, supabase } = auth;
  const { id } = await params;

  const { data: original, error } = await supabase
    .from('webhook_deliveries')
    .select('id, subscription_id, event_type, target_url, payload, attempt')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[api/webhooks/deliveries/[id]/replay] fetch error', error);
    return NextResponse.json({ error: 'Erreur lecture' }, { status: 500 });
  }
  if (!original) return NextResponse.json({ error: 'Delivery introuvable' }, { status: 404 });

  // On a besoin du secret actuel de la sub pour re-signer.
  // Si la subscription a été supprimée, on bloque le replay (impossible de
  // garantir la signature).
  if (!original.subscription_id) {
    return NextResponse.json(
      { error: 'Replay impossible : webhook ad-hoc (test) sans subscription.' },
      { status: 400 }
    );
  }
  const { data: sub } = await supabase
    .from('webhook_subscriptions')
    .select('id, target_url, secret')
    .eq('id', original.subscription_id)
    .maybeSingle();
  if (!sub) {
    return NextResponse.json(
      { error: 'Replay impossible : la subscription liée a été supprimée.' },
      { status: 410 }
    );
  }

  const result = await sendWebhookOnce({
    subscriptionId: sub.id,
    userId: user.id,
    eventType: original.event_type,
    // On garde l'URL ACTUELLE de la sub (si elle a changé) — c'est le comportement
    // que les users attendent lors d'un replay après correction d'URL.
    targetUrl: sub.target_url,
    secret: sub.secret,
    payload: original.payload,
    attempt: (original.attempt || 1) + 1,
  });

  return NextResponse.json({ delivery: result });
}
