import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuthenticatedUser } from '@/lib/auth';
import { PLANS, getStripePriceId } from '@/lib/plans';
import { cleanEnv } from '@/lib/envClean';

function getStripe() {
  // cleanEnv : strip espaces, \n, et littéraux \n (2 chars) que Vercel UI
  // peut conserver après un copy-paste imparfait.
  return new Stripe(cleanEnv(process.env.STRIPE_SECRET_KEY), {
    maxNetworkRetries: 1,
    timeout: 15000,
  });
}

export async function POST(request) {
  try {
    // Vérification précoce des env vars (cause #1 historique d'échec)
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[stripe/checkout] STRIPE_SECRET_KEY missing');
      return NextResponse.json(
        { error: 'Configuration Stripe manquante (STRIPE_SECRET_KEY). Contactez le support.' },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { planId, period: rawPeriod } = await request.json();
    const period = rawPeriod === 'yearly' ? 'yearly' : 'monthly';
    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: `Plan inconnu : ${planId}` }, { status: 400 });
    }
    if (planId === 'free') {
      return NextResponse.json({ error: 'Le plan Gratuit ne nécessite pas de checkout.' }, { status: 400 });
    }
    // Pick price ID selon la période (monthly = price, yearly = priceYearly)
    const stripePriceId = cleanEnv(getStripePriceId(planId, period));
    if (!stripePriceId) {
      const envVar = period === 'yearly'
        ? `STRIPE_${planId.toUpperCase()}_YEARLY_PRICE_ID`
        : `STRIPE_${planId.toUpperCase()}_PRICE_ID`;
      console.error(`[stripe/checkout] Missing ${envVar} for plan ${planId} (${period})`);
      return NextResponse.json(
        { error: `Tarif Stripe indisponible pour ${plan.name} (${period}). Variable ${envVar} à configurer.` },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      // idempotency_key : si le user double-clique ou que le réseau retry,
      // Stripe ne crée pas 2 customers pour le même user.
      const customer = await stripe.customers.create(
        {
          email: user.email,
          metadata: { supabase_user_id: user.id },
        },
        { idempotencyKey: `customer-create-${user.id}` }
      );
      customerId = customer.id;
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // URL de retour : on privilégie l'origin de la requête (suit le domaine
    // réel : volia.fr, www., preview…) plutôt qu'une env var.
    const origin = request.headers.get('origin')
      || process.env.NEXT_PUBLIC_APP_URL
      || 'https://volia.fr';

    // ─── Auto-apply coupon Business promo lancement ─────────────────
    // Si plan=business + period=monthly + env STRIPE_BUSINESS_PROMO_COUPON_ID
    // existe, on applique automatiquement le coupon promo (-30 €/mois pendant
    // 12 mois) au checkout. Le client n'a rien à coder à la main.
    //
    // Anthony doit créer ce coupon dans Stripe Dashboard :
    //   - Type : Repeating
    //   - Duration : 12 months
    //   - Amount off : 30.00 EUR
    //   - Code (optionnel) : VOLIA-LAUNCH-12M
    //
    // Puis copier l'ID (commence par "promo_..." ou "coupon_...") dans
    // l'env var STRIPE_BUSINESS_PROMO_COUPON_ID sur Vercel.
    // ─────────────────────────────────────────────────────────────────
    const businessPromoCouponId = cleanEnv(process.env.STRIPE_BUSINESS_PROMO_COUPON_ID || '');
    const shouldApplyBusinessPromo =
      planId === 'business' && period === 'monthly' && businessPromoCouponId;

    // ─── Auto-apply MAX99 : MAX mensuel → 99 €/mois les 3 premiers mois ──
    // Le code MAX99 est mis en avant partout (landing, pricing). On l'applique
    // AUTOMATIQUEMENT au checkout MAX mensuel → l'utilisateur voit 99 € sans
    // avoir à taper le code (meilleure conversion).
    // Source : env STRIPE_MAX_PROMO_COUPON_ID ; fallback = ID du coupon Stripe
    // créé au lancement (−80 €/mois × 3 mois). Ce n'est PAS un secret (un ID de
    // coupon n'est pas sensible). La création de session est résiliente plus bas :
    // si ce coupon est un jour supprimé côté Stripe, on retente SANS discount
    // plutôt que de faire échouer 100 % des checkouts MAX.
    const MAX99_COUPON_FALLBACK = '0k6rxEgs';
    const maxPromoCouponId = cleanEnv(process.env.STRIPE_MAX_PROMO_COUPON_ID || MAX99_COUPON_FALLBACK);
    const shouldApplyMaxPromo =
      planId === 'max' && period === 'monthly' && Boolean(maxPromoCouponId);
    const appliedCoupon = shouldApplyBusinessPromo
      ? businessPromoCouponId
      : (shouldApplyMaxPromo ? maxPromoCouponId : null);

    // ─── Attribution UTM (first-touch) → metadata Stripe ────────────────
    // Lit le cookie volia_attr (posé par AttributionTracker) pour rattacher
    // chaque paiement à sa campagne pub (ROAS visible dans Stripe + base pour
    // la Conversions API serveur plus tard).
    const utmMeta = {};
    try {
      const rawAttr = request.cookies.get('volia_attr')?.value;
      if (rawAttr) {
        const a = JSON.parse(decodeURIComponent(rawAttr));
        for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'channel']) {
          if (a && a[k]) utmMeta[k] = String(a[k]).slice(0, 200);
        }
      }
    } catch { /* cookie illisible → attribution ignorée */ }

    // Montant facturé la 1re période → transmis au retour pour l'event purchase.
    const firstPeriodValueEur =
      period === 'yearly'
        ? Math.round((plan.priceYearly || plan.price || 0) / 100)
        : (shouldApplyMaxPromo && plan.promo?.displayPrice
            ? Math.round(plan.promo.displayPrice / 100)
            : Math.round((plan.price || 0) / 100));

    // ─── Programme apporteurs d'affaires ────────────────────────────
    // Le lien volia.fr/?aff=CODE pose un cookie `volia_aff`. On le récupère
    // ici pour le transmettre en metadata de la session → le webhook
    // checkout.session.completed liera le client à l'affilié.
    const affiliateCode = (request.cookies.get('volia_aff')?.value || '').trim().toUpperCase().slice(0, 16) || null;

    const sessionParams = {
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: stripePriceId, quantity: 1 }],
      // Carte uniquement — on désactive Klarna (incompatible avec les abos
      // récurrents), Amazon Pay (rare en B2B FR), et Link saved cards
      // (qui pré-affiche des cartes d'autres SaaS, source de confusion).
      // Pour réactiver Link plus tard : ['card', 'link'].
      payment_method_types: ['card'],
      success_url: `${origin}/dashboard?upgrade=success&plan=${planId}&value=${firstPeriodValueEur}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?upgrade=cancelled`,
      // metadata sur la session : disponible dans checkout.session.completed
      metadata: {
        supabase_user_id: user.id,
        plan_id: planId,
        period,
        ...(shouldApplyBusinessPromo ? { business_launch_promo_applied: 'true' } : {}),
        ...(shouldApplyMaxPromo ? { max99_promo_applied: 'true' } : {}),
        ...(affiliateCode ? { affiliate_code: affiliateCode } : {}),
        ...utmMeta,
      },
      // subscription_data.metadata : ATTACHÉ À LA SUBSCRIPTION elle-même
      // → retrouvable dans tous les futurs events subscription.updated /
      //   subscription.deleted / invoice.payment_failed sans dépendre de la DB.
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan_id: planId, period, ...utmMeta },
      },
      // Coupon promo (Business legacy OU MAX99) : appliqué via `discounts`
      // (mutuellement exclusif avec allow_promotion_codes — Stripe refuse les 2).
      // Sinon on laisse l'utilisateur saisir un code promo manuel.
      ...(appliedCoupon
        ? { discounts: [{ coupon: appliedCoupon }] }
        : { allow_promotion_codes: true }),
      // Email de facturation Stripe directement à l'user
      customer_update: { address: 'auto', name: 'auto' },
      billing_address_collection: 'auto',
    };

    // Création de la session. Filet de sécurité : si un coupon a été appliqué
    // mais qu'il a été supprimé/désactivé côté Stripe, la création lève une
    // erreur (souvent resource_missing). On RETENTE alors sans le discount, avec
    // saisie manuelle de code promo activée → on ne bloque JAMAIS une vente à
    // cause d'un coupon obsolète (au pire l'utilisateur ne voit pas l'auto-promo).
    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (e) {
      const couponIssue = appliedCoupon && (e?.code === 'resource_missing' || /coupon|promotion/i.test(e?.message || ''));
      if (!couponIssue) throw e;
      console.error(`[stripe/checkout] coupon ${appliedCoupon} invalide (${e?.code || e?.message}) — retry sans discount pour ne pas bloquer le paiement`);
      const { discounts, ...withoutDiscount } = sessionParams;
      session = await stripe.checkout.sessions.create({ ...withoutDiscount, allow_promotion_codes: true });
    }

    if (appliedCoupon) {
      console.log(`[stripe/checkout] coupon ${appliedCoupon} appliqué pour user ${user.id} (plan ${planId})`);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Logue le détail complet côté serveur
    console.error('[stripe/checkout] error:', {
      message: err?.message,
      type: err?.type,
      code: err?.code,
      raw: err?.raw,
      statusCode: err?.statusCode,
    });
    // Renvoie un message exploitable côté client (Stripe expose des messages
    // utilisateur-safe pour ses propres erreurs).
    const isStripeError = err?.type?.startsWith('Stripe');
    return NextResponse.json(
      {
        error: isStripeError
          ? `Stripe : ${err.message}`
          : `Erreur lors de la création de la session : ${err?.message || 'inconnue'}`,
        code: err?.code,
        type: err?.type,
      },
      { status: 500 }
    );
  }
}
