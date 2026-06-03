// ─────────────────────────────────────────────────────────────────────
// src/lib/affiliates.js — Programme d'apporteurs d'affaires (affiliés)
// ─────────────────────────────────────────────────────────────────────
// Un affilié (commercial indépendant) obtient un lien volia.fr/?aff=CODE.
// Quand un client arrive via ce lien et devient payant, l'affilié touche
// une commission sur CHAQUE paiement :
//   - 50 % la 1ʳᵉ année (mois 0 → 11)
//   - 30 % la 2ᵉ année  (mois 12 → 23)
//   - 0 % ensuite
// Calcul sur le montant NET réellement encaissé (invoice.amount_paid).
//
// Flux :
//   1. Candidature (/affiliation) → affiliates.status = 'pending'
//   2. Admin approuve → status = 'approved', code actif
//   3. Client clique le lien → cookie volia_aff → checkout → metadata
//   4. webhook checkout.session.completed → user_profiles.affiliate_id
//   5. webhook invoice.paid → accrueCommissionForInvoice() → ledger
//   6. Admin verse sur facture → status 'paid'
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';

const RATE_YEAR_1 = 0.5; // 50 % mois 0-11
const RATE_YEAR_2 = 0.3; // 30 % mois 12-23
const COMMISSION_MONTHS = 24; // au-delà : 0

/** Taux de commission selon le nombre de mois écoulés depuis le 1er paiement. */
export function commissionRate(monthsSinceStart) {
  if (monthsSinceStart < 12) return RATE_YEAR_1;
  if (monthsSinceStart < COMMISSION_MONTHS) return RATE_YEAR_2;
  return 0;
}

/** Nombre de mois calendaires pleins entre deux dates. */
function monthsBetween(from, to) {
  const a = new Date(from);
  const b = new Date(to);
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months -= 1; // mois pas encore "complété"
  return Math.max(0, months);
}

/** Génère un code affilié unique (8 caractères, sans ambiguïté visuelle). */
async function generateUniqueCode(supabase) {
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans I,O,0,1
  for (let attempt = 0; attempt < 6; attempt++) {
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    const { data } = await supabase
      .from('affiliates')
      .select('id')
      .eq('code', code)
      .maybeSingle();
    if (!data) return code;
  }
  // Fallback ultra-improbable
  return 'AFF' + Date.now().toString(36).toUpperCase();
}

/**
 * Crée une candidature d'affilié (status 'pending').
 * Idempotent sur l'email : si une candidature existe déjà, on la renvoie.
 */
export async function createAffiliateApplication({ email, name, company, phone, motivation, userId }) {
  if (!email) return { ok: false, error: 'email requis' };
  const supabase = getSupabaseAdmin();
  const cleanEmail = String(email).trim().toLowerCase();

  const { data: existing } = await supabase
    .from('affiliates')
    .select('id, code, status')
    .eq('email', cleanEmail)
    .maybeSingle();
  if (existing) {
    return { ok: true, already_exists: true, affiliate: existing };
  }

  const code = await generateUniqueCode(supabase);
  const { data, error } = await supabase
    .from('affiliates')
    .insert({
      code,
      email: cleanEmail,
      name: name?.trim() || null,
      company: company?.trim() || null,
      phone: phone?.trim() || null,
      motivation: motivation?.trim() || null,
      user_id: userId || null,
      status: 'pending',
    })
    .select('id, code, status, email, name')
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, affiliate: data };
}

/** Récupère un affilié par code (n'importe quel statut). */
export async function getAffiliateByCode(code) {
  if (!code) return null;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('affiliates')
    .select('*')
    .eq('code', String(code).trim().toUpperCase())
    .maybeSingle();
  return data || null;
}

/** Récupère un affilié APPROUVÉ par code (pour validation au checkout). */
export async function getApprovedAffiliate(code) {
  const aff = await getAffiliateByCode(code);
  return aff && aff.status === 'approved' ? aff : null;
}

/**
 * Lie un client à un affilié (au 1er checkout). Anti-fraude :
 *  - affilié doit être approuvé
 *  - pas d'auto-parrainage (affilié ≠ client)
 *  - n'écrase pas une attribution existante
 */
export async function linkClientToAffiliate(userId, affiliateCode) {
  if (!userId || !affiliateCode) return { ok: false, reason: 'missing' };
  const supabase = getSupabaseAdmin();

  const aff = await getApprovedAffiliate(affiliateCode);
  if (!aff) return { ok: false, reason: 'affiliate_not_approved' };
  if (aff.user_id && aff.user_id === userId) return { ok: false, reason: 'self_referral' };

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('affiliate_id')
    .eq('id', userId)
    .maybeSingle();
  if (profile?.affiliate_id) return { ok: true, already_linked: true };

  await supabase
    .from('user_profiles')
    .update({ affiliate_id: aff.id })
    .eq('id', userId);

  return { ok: true, affiliate_id: aff.id, code: aff.code };
}

/**
 * Moteur de commission : appelé sur chaque webhook invoice.paid.
 * Crée une ligne de commission si le client est attribué à un affilié.
 * Idempotent (contrainte UNIQUE sur stripe_invoice_id).
 *
 * @param {object} invoice - l'objet Stripe invoice
 * @returns {Promise<{ok, skipped?, reason?, commission_cents?}>}
 */
export async function accrueCommissionForInvoice(invoice) {
  if (!invoice?.id) return { ok: false, reason: 'no_invoice' };
  const supabase = getSupabaseAdmin();

  const customerId = invoice.customer;
  const amountPaid = invoice.amount_paid || 0; // centimes, net de remise
  if (!customerId || amountPaid <= 0) return { ok: true, skipped: true, reason: 'no_amount' };

  // Trouve le client + son affilié
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, affiliate_id, affiliate_first_paid_at')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (!profile?.affiliate_id) return { ok: true, skipped: true, reason: 'no_affiliate' };

  // Date de cette facture (Stripe : created en secondes epoch)
  const invoiceDate = invoice.created ? new Date(invoice.created * 1000) : new Date();

  // 1er paiement attribué → on stamp affiliate_first_paid_at
  let firstPaidAt = profile.affiliate_first_paid_at;
  if (!firstPaidAt) {
    firstPaidAt = invoiceDate.toISOString();
    await supabase
      .from('user_profiles')
      .update({ affiliate_first_paid_at: firstPaidAt })
      .eq('id', profile.id);
  }

  const monthsSinceStart = monthsBetween(firstPaidAt, invoiceDate);
  const rate = commissionRate(monthsSinceStart);
  const commissionCents = Math.round(amountPaid * rate);

  if (commissionCents <= 0) {
    return { ok: true, skipped: true, reason: 'rate_zero', monthsSinceStart };
  }

  // payable 30 jours après (fenêtre de remboursement)
  const payableAt = new Date(invoiceDate.getTime() + 30 * 86400 * 1000).toISOString();

  const { error } = await supabase
    .from('affiliate_commissions')
    .insert({
      affiliate_id: profile.affiliate_id,
      referred_user_id: profile.id,
      stripe_invoice_id: invoice.id,
      stripe_customer_id: customerId,
      amount_paid_cents: amountPaid,
      rate,
      commission_cents: commissionCents,
      months_since_start: monthsSinceStart,
      status: 'pending',
      payable_at: payableAt,
    });

  if (error) {
    // 23505 = duplicate (facture déjà traitée) → idempotent, pas une erreur
    if (error.code === '23505') return { ok: true, duplicate: true };
    return { ok: false, error: error.message };
  }

  return { ok: true, affiliate_id: profile.affiliate_id, commission_cents: commissionCents, rate, monthsSinceStart };
}

/** Annule (clawback) la commission liée à une facture remboursée. */
export async function clawbackCommissionForInvoice(invoiceId) {
  if (!invoiceId) return { ok: false };
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('affiliate_commissions')
    .update({ status: 'clawed_back' })
    .eq('stripe_invoice_id', invoiceId)
    .in('status', ['pending', 'payable'])
    .select('id, affiliate_id, commission_cents');
  return { ok: true, clawed_back: data?.length || 0 };
}

/**
 * Stats d'un affilié (pour son dashboard) — résolu par code.
 * Le code joue le rôle de jeton d'accès (lien privé envoyé par email).
 */
export async function getAffiliateStats(code) {
  const aff = await getAffiliateByCode(code);
  if (!aff) return null;
  const supabase = getSupabaseAdmin();

  const { data: comms } = await supabase
    .from('affiliate_commissions')
    .select('commission_cents, status, payable_at, created_at, months_since_start, rate')
    .eq('affiliate_id', aff.id)
    .order('created_at', { ascending: false });

  // Nombre de clients attribués (distinct)
  const { count: clientsCount } = await supabase
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('affiliate_id', aff.id);

  const list = comms || [];
  const now = Date.now();
  const sum = (arr) => arr.reduce((t, c) => t + (c.commission_cents || 0), 0);

  const paid = list.filter((c) => c.status === 'paid');
  const cancelled = list.filter((c) => c.status === 'clawed_back');
  const active = list.filter((c) => c.status === 'pending' || c.status === 'payable');
  const payableNow = active.filter((c) => new Date(c.payable_at).getTime() <= now);
  const pendingHold = active.filter((c) => new Date(c.payable_at).getTime() > now);

  return {
    affiliate: {
      code: aff.code,
      status: aff.status,
      name: aff.name,
      email: aff.email,
      hasPayoutInfo: !!aff.payout_info,
    },
    stats: {
      clients: clientsCount || 0,
      commissionsCount: list.length,
      earnedTotalCents: sum(paid) + sum(active), // hors clawback
      paidCents: sum(paid),
      payableCents: sum(payableNow),
      pendingHoldCents: sum(pendingHold),
      clawedBackCents: sum(cancelled),
    },
    commissions: list.slice(0, 100),
  };
}
