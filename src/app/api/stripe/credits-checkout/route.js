// POST /api/stripe/credits-checkout — achat d'un pack de crédits
// Prospection (paiement one-time, pas un abonnement).
//
// Body : { packId: 's' | 'm' | 'l' }
// → crée une Checkout Session mode 'payment' avec metadata
//   { supabase_user_id, credit_pack, credits }. Le webhook
//   checkout.session.completed crédite ensuite le solde via la RPC
//   idempotente add_purchased_credits (un retry ne crédite pas 2×).

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuthenticatedUser } from '@/lib/auth';
import { getCreditPack } from '@/lib/credit-packs';
import { cleanEnv } from '@/lib/envClean';

function getStripe() {
  return new Stripe(cleanEnv(process.env.STRIPE_SECRET_KEY), {
    maxNetworkRetries: 1,
    timeout: 15000,
  });
}

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[stripe/credits-checkout] STRIPE_SECRET_KEY missing');
      return NextResponse.json(
        { error: 'Configuration Stripe manquante. Contactez le support.' },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { packId } = await request.json().catch(() => ({}));
    const pack = getCreditPack(packId);
    if (!pack) {
      return NextResponse.json({ error: `Pack inconnu : ${packId}` }, { status: 400 });
    }
    if (!pack.stripePriceId) {
      console.error(`[stripe/credits-checkout] Missing STRIPE_CREDITS_${String(packId).toUpperCase()}_PRICE_ID`);
      return NextResponse.json(
        { error: 'Tarif Stripe indisponible pour ce pack. Contactez le support.' },
        { status: 500 }
      );
    }

    // Get or create Stripe customer (même pattern que /api/stripe/checkout)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create(
        { email: user.email, metadata: { supabase_user_id: user.id } },
        { idempotencyKey: `customer-create-${user.id}` }
      );
      customerId = customer.id;
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const origin = request.headers.get('origin')
      || process.env.NEXT_PUBLIC_APP_URL
      || 'https://volia.fr';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{ price: pack.stripePriceId, quantity: 1 }],
      payment_method_types: ['card'],
      success_url: `${origin}/settings?credits=success`,
      cancel_url: `${origin}/settings?credits=cancelled`,
      metadata: {
        supabase_user_id: user.id,
        credit_pack: pack.id,
        credits: String(pack.credits),
      },
      // Facture client : utile en B2B (les packs sont des achats ponctuels)
      invoice_creation: { enabled: true },
      customer_update: { address: 'auto', name: 'auto' },
      billing_address_collection: 'auto',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe/credits-checkout] error:', {
      message: err?.message,
      type: err?.type,
      code: err?.code,
    });
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement. Réessayez ou contactez le support.' },
      { status: 500 }
    );
  }
}
