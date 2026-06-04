// ─────────────────────────────────────────────────────────────────────
// src/lib/seats.js — Facturation au siège (plan Business)
// ─────────────────────────────────────────────────────────────────────
// Business = 1 utilisateur inclus (l'owner), puis +10 €/mois par utilisateur
// supplémentaire. On facture DÈS L'INVITATION (un siège est réservé tant que
// l'invite est pending ou que le membre est actif).
//
// Mécanique Stripe : à côté de la ligne de base Business (179 €), une 2e ligne
// "Siège supplémentaire" (STRIPE_SEAT_PRICE_ID, 10 €/mois) dont la QUANTITÉ est
// synchronisée sur le nombre de sièges payants. Proration automatique.
//
// Formule : sièges_payants = (membres + invitations pending) − 1 inclus.
// On appelle syncTeamSeats() après chaque invite / annulation d'invite / retrait
// de membre. Best-effort : une erreur ne casse jamais l'action côté équipe.
// ─────────────────────────────────────────────────────────────────────

import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const SEAT_PRICE_ID = (process.env.STRIPE_SEAT_PRICE_ID || '').trim();
const INCLUDED_SEATS = 1; // l'owner est inclus

function stripeClient() {
  const key = (process.env.STRIPE_SECRET_KEY || '').replace(/\s/g, '');
  if (!key) return null;
  return new Stripe(key);
}

/** Nombre de sièges facturables d'une team = (membres + invites pending) − inclus. */
export async function countBillableSeats(supabase, teamId) {
  const { count: members } = await supabase
    .from('team_members')
    .select('id', { count: 'exact', head: true })
    .eq('team_id', teamId);
  const { count: pending } = await supabase
    .from('team_invitations')
    .select('id', { count: 'exact', head: true })
    .eq('team_id', teamId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString());
  const total = (members || 0) + (pending || 0);
  return Math.max(0, total - INCLUDED_SEATS);
}

/**
 * Synchronise la quantité de la ligne "siège" de l'abonnement Stripe de la team
 * sur le nombre réel de sièges facturables. Idempotent + best-effort.
 * @returns {Promise<{ok:boolean, seats?:number, reason?:string}>}
 */
export async function syncTeamSeats(teamId) {
  if (!teamId) return { ok: false, reason: 'no_team_id' };
  if (!SEAT_PRICE_ID) return { ok: false, reason: 'no_seat_price_env' };
  const stripe = stripeClient();
  if (!stripe) return { ok: false, reason: 'no_stripe' };

  const supabase = getSupabaseAdmin();
  try {
    const { data: team } = await supabase
      .from('teams').select('owner_id').eq('id', teamId).maybeSingle();
    if (!team) return { ok: false, reason: 'no_team' };

    const { data: prof } = await supabase
      .from('user_profiles').select('stripe_subscription_id').eq('id', team.owner_id).maybeSingle();
    const subId = prof?.stripe_subscription_id;
    // Owner sans abonnement Stripe (ex : Business en trial) → pas de facturation
    // siège possible pour l'instant. On ne bloque pas l'équipe.
    if (!subId) return { ok: false, reason: 'no_subscription' };

    const seats = await countBillableSeats(supabase, teamId);
    const sub = await stripe.subscriptions.retrieve(subId);
    const seatItem = (sub.items?.data || []).find((it) => it.price?.id === SEAT_PRICE_ID);

    if (seats > 0) {
      if (seatItem) {
        if (seatItem.quantity !== seats) {
          await stripe.subscriptionItems.update(seatItem.id, {
            quantity: seats,
            proration_behavior: 'create_prorations',
          });
        }
      } else {
        await stripe.subscriptionItems.create({
          subscription: subId,
          price: SEAT_PRICE_ID,
          quantity: seats,
          proration_behavior: 'create_prorations',
        });
      }
    } else if (seatItem) {
      // Plus de sièges payants → on retire la ligne (avoir proraté).
      await stripe.subscriptionItems.del(seatItem.id, { proration_behavior: 'create_prorations' });
    }

    return { ok: true, seats };
  } catch (e) {
    console.error('[seats] syncTeamSeats failed:', e?.message || e);
    return { ok: false, reason: 'stripe_error', error: e?.message };
  }
}
