import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuthenticatedUser } from '@/lib/auth';
import { PLANS } from '@/lib/plans';
import { cleanEnv } from '@/lib/envClean';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * POST /api/stripe/sync-subscription
 *
 * Force la synchronisation du plan utilisateur depuis Stripe.
 *
 * Cas d'usage :
 *  - Le user a payé mais le webhook n'a pas tourné (config Stripe Dashboard
 *    cassée, secret incorrect, etc.).
 *  - Récupérer son plan après une réparation manuelle de base.
 *
 * Logique :
 *  1. Récupère le stripe_customer_id du user authentifié.
 *  2. Liste les souscriptions actives du customer côté Stripe.
 *  3. Match avec un plan (via le price.id) et update user_profiles.
 *
 * Réservé aux utilisateurs authentifiés (chacun ne sync que son propre compte).
 */
function getStripe() {
  return new Stripe(cleanEnv(process.env.STRIPE_SECRET_KEY), {
    maxNetworkRetries: 1,
    timeout: 15000,
  });
}

export async function POST() {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    }

    // 1. Fetch the user's stripe_customer_id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id, plan')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'Aucun stripe_customer_id pour ce user' }, { status: 404 });
    }

    // 2. List active subscriptions via Stripe
    const stripe = getStripe();
    const subs = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      limit: 5,
      expand: ['data.items'],
    });

    if (!subs.data || subs.data.length === 0) {
      // No active sub → downgrade to free
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin
        .from('user_profiles')
        .update({ plan: 'free', stripe_subscription_id: null, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      return NextResponse.json({
        synced: true,
        plan: 'free',
        message: 'Aucune subscription active : plan repassé à free.',
      });
    }

    // Take the most recent
    const sub = subs.data[0];
    const priceId = sub.items?.data?.[0]?.price?.id;

    // Map price → plan
    let matchedPlan = 'free';
    for (const [planId, plan] of Object.entries(PLANS)) {
      if (plan.stripePriceId && plan.stripePriceId.trim() === priceId) {
        matchedPlan = planId;
        break;
      }
    }

    // 3. Update user_profiles via service_role
    const supabaseAdmin = getSupabaseAdmin();
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        plan: matchedPlan,
        stripe_subscription_id: sub.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[sync-subscription] update failed:', updateError);
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
    }

    return NextResponse.json({
      synced: true,
      plan: matchedPlan,
      subscription_id: sub.id,
      price_id: priceId,
      message: `Plan synchronisé : ${matchedPlan} (sub ${sub.id})`,
    });
  } catch (err) {
    console.error('[sync-subscription] error:', {
      message: err?.message,
      type: err?.type,
      code: err?.code,
    });
    return NextResponse.json(
      { error: err?.message || 'Erreur de synchronisation' },
      { status: 500 }
    );
  }
}
