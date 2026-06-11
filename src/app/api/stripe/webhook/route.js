import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/email';
import {
  paymentSuccessEmail,
  subscriptionCancelledEmail,
  paymentFailedEmail,
  planChangedEmail,
} from '@/lib/emailTemplates';
import { PLANS } from '@/lib/plans';
import { cleanEnv } from '@/lib/envClean';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createNotification, NOTIF_TYPES } from '@/lib/notifications';
import { ensureTeamForOwner, planAllowsTeams } from '@/lib/teams';
import { reportError } from '@/lib/errorReporting';

function getStripe() {
  return new Stripe(cleanEnv(process.env.STRIPE_SECRET_KEY));
}

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Récupère l'email + full_name d'un user.
 * - email : stocké dans auth.users (PAS dans user_profiles → c'était la cause
 *   du bug où les emails de confirmation/annulation n'étaient JAMAIS envoyés).
 * - full_name : stocké dans user_metadata côté auth.users.
 */
async function getUserContact(supabaseAdmin, userId) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error || !data?.user) return { email: null, fullName: null };
    return {
      email: data.user.email || null,
      fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
    };
  } catch (err) {
    console.error('[webhook] getUserContact failed:', err);
    return { email: null, fullName: null };
  }
}

/**
 * Match un price.id Stripe avec un plan local.
 * Vérifie monthly ET yearly. Renvoie 'free' si aucun match (sécurité).
 *
 * ⚠️ Pivot freemium (11/06/2026) : les prices Solo et Business sont
 * PARTAGÉS avec les nouveaux plans 'prospection' et 'max'. Pour ne
 * jamais re-mapper un abonné grandfatheré (ex: Business 6000 crédits
 * → max 2000), si `currentPlan` correspond déjà à ce price, on le
 * conserve tel quel.
 */
function planIdFromPriceId(priceId, currentPlan = null) {
  if (!priceId) return 'free';
  if (currentPlan && PLANS[currentPlan]) {
    const cp = PLANS[currentPlan];
    if (cp.stripePriceId === priceId || cp.stripePriceIdYearly === priceId) {
      return currentPlan;
    }
  }
  for (const [id, plan] of Object.entries(PLANS)) {
    // 'enterprise_legacy' est l'ALIAS historique (ancien Business 99€). Il partage
    // STRIPE_BUSINESS_YEARLY_PRICE_ID avec business → on le SKIP de la boucle pour
    // éviter une collision de mapping, et on le route via le fallback ci-dessous.
    // ⚠️ Ne PAS skip 'enterprise' : c'est désormais un vrai plan vendu (499€) avec
    // ses propres price IDs — le skipper rétrogradait tout abonné Enterprise.
    if (id === 'enterprise_legacy') continue;
    if (plan.stripePriceId && plan.stripePriceId === priceId) return id;
    if (plan.stripePriceIdYearly && plan.stripePriceIdYearly === priceId) return id;
  }
  // Fallback compat : ancien price_id Enterprise legacy → mappé sur business.
  if (PLANS.enterprise_legacy?.stripePriceId === priceId) return 'business';
  return 'free';
}

// ─── Handler ──────────────────────────────────────────────────────

export async function POST(request) {
  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, cleanEnv(process.env.STRIPE_WEBHOOK_SECRET));
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // ─── Idempotence ──────────────────────────────────────────────
  // Stripe retransmet les webhooks (retry sur 4xx/5xx, replays).
  // Sans cette garde, double-traitement = double emails / actions répétées.
  const { error: idempotencyError } = await supabaseAdmin
    .from('stripe_webhook_events')
    .insert({ id: event.id, type: event.type });

  if (idempotencyError) {
    if (idempotencyError.code === '23505') {
      console.log(`[webhook] Duplicate event ${event.id} (${event.type}), skipping`);
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error('[webhook] Idempotency insert failed (non-blocking):', idempotencyError);
  }

  console.log(`[webhook] Processing ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      // ═══════════════════════════════════════════════════════════
      // checkout.session.expired → Wave 1.2 Growth Loops :
      // user a abandonné le checkout, on prépare la séquence de relance
      // (3 emails à J+1h, J+24h, J+72h via cron checkout-recovery)
      // ═══════════════════════════════════════════════════════════
      case 'checkout.session.expired': {
        const session = event.data.object;
        try {
          const { captureExpiredCheckout } = await import('@/lib/checkout-recovery');
          await captureExpiredCheckout({ session, supabase: supabaseAdmin });
        } catch (recErr) {
          console.error('[webhook] checkout-recovery capture failed', recErr);
        }
        break;
      }

      // ═══════════════════════════════════════════════════════════
      // checkout.session.completed → premier paiement réussi
      // ═══════════════════════════════════════════════════════════
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id;
        const planId = session.metadata?.plan_id;

        // Marque tout attempt de recovery comme converti (analytics + stop séquence)
        try {
          const recoveryEmail = session.customer_details?.email || session.customer_email;
          if (recoveryEmail) {
            const { markAttemptRecovered } = await import('@/lib/checkout-recovery');
            await markAttemptRecovered(recoveryEmail.toLowerCase());
          }
        } catch (recErr) {
          console.error('[webhook] markAttemptRecovered failed', recErr);
        }

        if (!userId || !planId) {
          console.warn('[webhook] checkout.session.completed missing metadata', { userId, planId });
          break;
        }

        // Trial conversion : si le user était en trial, on stamp
        // trial_converted_at pour le marquer "consommé" (pas de re-trial)
        // et pour les analytics.
        const { data: trialProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('trial_started_at, trial_converted_at')
          .eq('id', userId)
          .maybeSingle();

        const trialConvertedAt =
          trialProfile?.trial_started_at && !trialProfile.trial_converted_at
            ? new Date().toISOString()
            : trialProfile?.trial_converted_at || null;

        const { error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update({
            plan: planId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            updated_at: new Date().toISOString(),
            ...(trialConvertedAt ? { trial_converted_at: trialConvertedAt } : {}),
          })
          .eq('id', userId);

        if (updateError) {
          console.error('[webhook] checkout.session.completed update failed:', updateError);
          break;
        }

        // ─── Multi-utilisateurs : auto-create team si plan Business ──
        // Justifie la marche tarifaire 49→149€ : l'owner peut inviter
        // jusqu'à N teammates (quota partagé, RBAC simple).
        if (planAllowsTeams(planId)) {
          try {
            const { email: ownerEmail } = await getUserContact(supabaseAdmin, userId);
            await ensureTeamForOwner(userId, ownerEmail);
          } catch (err) {
            console.error('[webhook] ensureTeamForOwner failed:', err);
          }
        }

        // Email de confirmation (features personnalisées par plan + period)
        const { email, fullName } = await getUserContact(supabaseAdmin, userId);
        if (email) {
          const plan = PLANS[planId] || { name: planId, price: 0, features: [] };
          const period = session.metadata?.period === 'yearly' ? 'yearly' : 'monthly';
          const amount = session.amount_total
            || (period === 'yearly' ? plan.priceYearly : plan.price);
          const tpl = paymentSuccessEmail(fullName, plan.name, amount, period, plan.features);
          sendEmail({ to: email, subject: tpl.subject, html: tpl.html })
            .catch((err) => console.error('[webhook] Payment email failed:', err));
        }
        // Notification in-app
        createNotification(userId, {
          type: NOTIF_TYPES.PAYMENT_SUCCESS,
          title: `Bienvenue sur le plan ${PLANS[planId]?.name || planId} !`,
          body: 'Votre paiement a été confirmé. Tous les nouveaux quotas sont actifs immédiatement.',
          link: '/dashboard',
          metadata: { plan_id: planId, session_id: session.id },
        }).catch((err) => console.error('[webhook] Notif success failed:', err));

        // Programme de parrainage : qualifier la referral + double-side incentive
        // (parrain +N mois, filleul +1 mois de bienvenue)
        try {
          const { qualifyReferral } = require('@/lib/referrals');
          const qualResult = await qualifyReferral(userId);
          if (qualResult.referrer_id) {
            // ─ Notif + email PARRAIN ─
            createNotification(qualResult.referrer_id, {
              type: NOTIF_TYPES.PAYMENT_SUCCESS,
              title: '🎉 Vous avez gagné 1 mois gratuit !',
              body: `Un de vos filleuls vient de devenir client payant. Total de bonus accumulés : ${qualResult.referrer_new_bonus} mois.`,
              link: '/parrainage',
              metadata: { referral_id: qualResult.referral_id },
            }).catch(() => {});
            const { email: refEmail, fullName: refName } = await getUserContact(supabaseAdmin, qualResult.referrer_id);
            if (refEmail) {
              const { referralRewardEmail } = require('@/lib/emailTemplates');
              const tplRef = referralRewardEmail(refName, qualResult.referrer_new_bonus);
              sendEmail({ to: refEmail, subject: tplRef.subject, html: tplRef.html }).catch(() => {});
            }

            // ─ Notif FILLEUL (bonus de bienvenue) ─
            createNotification(userId, {
              type: NOTIF_TYPES.PAYMENT_SUCCESS,
              title: '🎁 Bonus de bienvenue : 1 mois offert',
              body: `Vous êtes arrivé via un parrainage. Profitez d'1 mois bonus crédité automatiquement (total : ${qualResult.referred_new_bonus} mois).`,
              link: '/parrainage',
            }).catch(() => {});
          }
        } catch (err) {
          console.error('[webhook] Referral qualify failed:', err);
        }

        // Programme apporteurs d'affaires : lier le client à l'affilié
        // (via le code passé en metadata depuis le cookie volia_aff au checkout).
        try {
          const affCode = session.metadata?.affiliate_code;
          if (affCode) {
            const { linkClientToAffiliate } = require('@/lib/affiliates');
            await linkClientToAffiliate(userId, affCode);
          }
        } catch (err) {
          console.error('[webhook] Affiliate link failed:', err);
        }
        break;
      }

      // ═══════════════════════════════════════════════════════════
      // invoice.paid → tout paiement réussi (1er + renouvellements).
      // Point d'entrée du moteur de commission affilié (récurrent).
      // ═══════════════════════════════════════════════════════════
      case 'invoice.paid': {
        const invoice = event.data.object;
        try {
          const { accrueCommissionForInvoice } = require('@/lib/affiliates');
          const res = await accrueCommissionForInvoice(invoice);
          if (res.commission_cents) {
            console.log(`[webhook] Commission affilié ${res.affiliate_id} : ${res.commission_cents}c (taux ${res.rate})`);
            // Notif email "commission gagnée" à l'affilié (non bloquant)
            try {
              const { getSupabaseAdmin } = require('@/lib/supabase-admin');
              const { sendEmail } = require('@/lib/email');
              const { data: aff } = await getSupabaseAdmin()
                .from('affiliates')
                .select('email, name, code, status')
                .eq('id', res.affiliate_id)
                .maybeSingle();
              if (aff?.email && aff.status === 'approved') {
                const eur = (res.commission_cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
                const pct = Math.round((res.rate || 0) * 100);
                const dash = `https://volia.fr/affiliation/suivi?code=${aff.code}`;
                await sendEmail({
                  to: aff.email,
                  subject: `💸 Nouvelle commission : ${eur}`,
                  html: `<p>Salut ${aff.name || ''},</p>
<p>Bonne nouvelle : un client que tu as amené vient de payer. Tu gagnes <b>${eur}</b> (taux ${pct} %).</p>
<p>Elle devient disponible 30 jours après le paiement (fenêtre de remboursement), puis réglée sur facture.</p>
<p>Suivi en temps réel : <a href="${dash}">${dash}</a></p>
<p>Continue comme ça 🚀<br>Anthony · Volia</p>`,
                  tags: [{ name: 'type', value: 'affiliate_commission' }],
                });
              }
            } catch (mailErr) {
              console.error('[webhook] Affiliate commission email failed:', mailErr);
            }
          }
        } catch (err) {
          console.error('[webhook] Affiliate commission accrual failed:', err);
        }
        break;
      }

      // ═══════════════════════════════════════════════════════════
      // charge.refunded → clawback de la commission de la facture liée
      // ═══════════════════════════════════════════════════════════
      case 'charge.refunded': {
        const charge = event.data.object;
        const invoiceId = charge.invoice;
        if (invoiceId) {
          try {
            const { clawbackCommissionForInvoice } = require('@/lib/affiliates');
            const res = await clawbackCommissionForInvoice(invoiceId);
            if (res.clawed_back) console.log(`[webhook] Clawback ${res.clawed_back} commission(s) sur ${invoiceId}`);
          } catch (err) {
            console.error('[webhook] Affiliate clawback failed:', err);
          }
        }
        break;
      }

      // ═══════════════════════════════════════════════════════════
      // customer.subscription.updated → changement plan / annulation programmée
      // ═══════════════════════════════════════════════════════════
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        // Trouve l'user par son subscription_id
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('id, plan')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        if (!profile) {
          // Fallback : essaie via metadata supabase_user_id sur la subscription
          const metaUserId = subscription.metadata?.supabase_user_id;
          if (!metaUserId) {
            console.warn('[webhook] subscription.updated : user introuvable', subscription.id);
            break;
          }
          // (la suite utilisera metaUserId, mais on a déjà pas le profil)
        }

        const userId = profile?.id || subscription.metadata?.supabase_user_id;
        if (!userId) break;

        // Détecte le NOUVEAU plan basé sur le price.id actuel.
        // currentPlan passé pour la stabilité des grandfatherés (prices
        // Solo/Business partagés avec prospection/max).
        const newPriceId = subscription.items?.data?.[0]?.price?.id;
        const newPlanId = planIdFromPriceId(newPriceId, profile?.plan);

        // Si la subscription est marquée pour cancel à la fin de période,
        // on garde le plan actuel jusqu'au period_end (le user a payé).
        // Quand customer.subscription.deleted arrivera, on bascule en free.
        const isScheduledCancel = subscription.cancel_at_period_end === true;

        // Update seulement si le plan a changé
        if (profile?.plan && profile.plan !== newPlanId && !isScheduledCancel) {
          await supabaseAdmin
            .from('user_profiles')
            .update({
              plan: newPlanId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          // Si upgrade vers Business → s'assurer qu'on a une team
          if (planAllowsTeams(newPlanId)) {
            try {
              const { email: ownerEmail } = await getUserContact(supabaseAdmin, userId);
              await ensureTeamForOwner(userId, ownerEmail);
            } catch (err) {
              console.error('[webhook] ensureTeamForOwner (subscription.updated) failed:', err);
            }
          }

          // Email "votre plan a changé"
          const { email, fullName } = await getUserContact(supabaseAdmin, userId);
          if (email) {
            const oldPlan = PLANS[profile.plan] || { name: profile.plan };
            const newPlan = PLANS[newPlanId] || { name: newPlanId };
            const tpl = planChangedEmail(fullName, oldPlan.name, newPlan.name);
            sendEmail({ to: email, subject: tpl.subject, html: tpl.html })
              .catch((err) => console.error('[webhook] Plan change email failed:', err));
          }
          // Notification in-app
          createNotification(userId, {
            type: NOTIF_TYPES.PLAN_CHANGED,
            title: `Plan changé : ${PLANS[profile.plan]?.name || profile.plan} → ${PLANS[newPlanId]?.name || newPlanId}`,
            body: 'Vos quotas ont été mis à jour. Le changement est effectif immédiatement.',
            link: '/settings#plan',
            metadata: { old_plan: profile.plan, new_plan: newPlanId },
          }).catch((err) => console.error('[webhook] Notif plan change failed:', err));
        }
        break;
      }

      // ═══════════════════════════════════════════════════════════
      // customer.subscription.deleted → annulation effective
      // ═══════════════════════════════════════════════════════════
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        const userId = profile?.id || subscription.metadata?.supabase_user_id;
        if (!userId) {
          console.warn('[webhook] subscription.deleted : user introuvable', subscription.id);
          break;
        }

        await supabaseAdmin
          .from('user_profiles')
          .update({
            plan: 'free',
            stripe_subscription_id: null,
            // Marketing Compound Phase 4 — déclenche séquence reactivation J+30/60/90
            churned_at: new Date().toISOString(),
            reactivation_step_1_sent_at: null,
            reactivation_step_2_sent_at: null,
            reactivation_step_3_sent_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        // Email d'annulation
        const { email, fullName } = await getUserContact(supabaseAdmin, userId);
        if (email) {
          const tpl = subscriptionCancelledEmail(fullName);
          sendEmail({ to: email, subject: tpl.subject, html: tpl.html })
            .catch((err) => console.error('[webhook] Cancellation email failed:', err));
        }
        // Notification in-app
        createNotification(userId, {
          type: NOTIF_TYPES.SUBSCRIPTION_CANCELLED,
          title: 'Abonnement annulé',
          body: 'Vous êtes désormais sur le plan Starter (gratuit). Vos données restent accessibles.',
          link: '/settings#plan',
        }).catch((err) => console.error('[webhook] Notif cancelled failed:', err));
        break;
      }

      // ═══════════════════════════════════════════════════════════
      // invoice.payment_failed → renouvellement échoué
      // ═══════════════════════════════════════════════════════════
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle();
        if (!profile) break;

        // On ne change pas le plan tout de suite : Stripe va retry et finir
        // par envoyer subscription.deleted si tous les retries échouent.
        // On notifie juste l'user pour qu'il mette à jour son moyen de paiement.
        const { email, fullName } = await getUserContact(supabaseAdmin, profile.id);
        if (email) {
          const tpl = paymentFailedEmail(fullName, invoice.amount_due, invoice.hosted_invoice_url);
          sendEmail({ to: email, subject: tpl.subject, html: tpl.html })
            .catch((err) => console.error('[webhook] Payment failed email failed:', err));
        }
        // Notification in-app (importante : reste visible tant que pas lue)
        createNotification(profile.id, {
          type: NOTIF_TYPES.PAYMENT_FAILED,
          title: 'Paiement échoué',
          body: 'Le renouvellement de votre abonnement a échoué. Mettez à jour votre moyen de paiement pour éviter une interruption.',
          link: invoice.hosted_invoice_url || '/settings#plan',
          metadata: { amount_due: invoice.amount_due, invoice_id: invoice.id },
        }).catch((err) => console.error('[webhook] Notif payment failed:', err));
        break;
      }

      default:
        // Event reçu mais non géré : pas grave, on ack quand même.
        break;
    }
  } catch (err) {
    // On log mais on retourne 200 quand même pour ne pas faire retry Stripe
    // sur des erreurs métier (sinon on peut spammer le user d'emails).
    console.error(`[webhook] Handler crashed on ${event.type}:`, err);
    reportError(err, {
      webhook: 'stripe',
      eventType: event.type,
      eventId: event.id,
    });
  }

  return NextResponse.json({ received: true });
}
