// ─────────────────────────────────────────────────────────────────────
// src/lib/email-sender-sync.js — Synchronise un domaine d'envoi avec Resend
// ─────────────────────────────────────────────────────────────────────
//
// Centralise la logique partagée entre :
//   - /api/email-senders (GET) : auto-refresh à l'ouverture de la page
//     (triggerVerify = false → lecture seule, NE FAIT PAS régresser un SPF
//      déjà 'verified' ; corrige juste l'affichage figé).
//   - /api/cron/verify-email-domains : re-vérif horaire des domaines pending
//     (triggerVerify = true → force Resend à re-sonder le DNS).
//
// Pourquoi distinguer ? POST /domains/{id}/verify de Resend REMET tous les
// records à 'pending' le temps du re-check async. Donc on ne le déclenche
// qu'en tâche de fond (cron), jamais à chaque chargement de page.
//
// Bascule en 'verified' → démarre le warmup + enrôle dans le pool peer
// (idempotent : UNIQUE constraint bloque les doublons, code 23505).
// ─────────────────────────────────────────────────────────────────────

import { getResendDomain, verifyResendDomain } from '@/lib/resend-domains';
import { buildPeerEmailAddress } from '@/lib/warmup-peer';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const SELECT_COLS =
  'id, domain, resend_domain_id, status, dns_records, from_name, verified_at, last_check_at, created_at, updated_at';

function normalizeStatus(resendStatus) {
  // Resend : not_started | pending | verified | failed | temporary_failure
  if (!resendStatus) return 'pending';
  if (resendStatus === 'verified') return 'verified';
  if (resendStatus === 'failed') return 'failed';
  if (resendStatus === 'temporary_failure') return 'temp_failure';
  return 'pending';
}

/**
 * Lit le statut Resend d'un sender et synchronise la row Supabase.
 * @param {object} opts
 * @param {object} opts.supabase  - client Supabase (user RLS ou service-role)
 * @param {object} opts.sender    - { id, resend_domain_id, verified_at, user_id? }
 * @param {boolean} [opts.triggerVerify=false] - force un re-check Resend avant lecture
 * @returns {Promise<{ sender: object, changed: boolean, flipped: boolean }>}
 */
export async function syncSenderFromResend({ supabase, sender, triggerVerify = false }) {
  if (!sender?.resend_domain_id) return { sender, changed: false, flipped: false };

  // 1) On LIT D'ABORD le statut réel (jamais de reset).
  //    ⚠️ POST /domains/{id}/verify de Resend REMET tout à 'pending' le temps
  //    du re-check async. Si on l'appelait AVANT le get, on relirait toujours
  //    'pending' (bug observé). Donc : get d'abord, nudge ensuite.
  let resendData;
  try {
    resendData = await getResendDomain(sender.resend_domain_id);
  } catch {
    // Resend indispo : on tente quand même un nudge best-effort si demandé.
    if (triggerVerify) {
      try { await verifyResendDomain(sender.resend_domain_id); } catch { /* noop */ }
    }
    return { sender, changed: false, flipped: false };
  }

  const newStatus = normalizeStatus(resendData.status);
  const changed = newStatus !== sender.status;
  const flipped = newStatus === 'verified' && !sender.verified_at;

  const now = new Date().toISOString();
  const updates = {
    status: newStatus,
    dns_records: resendData.records || [],
    last_check_at: now,
    updated_at: now,
  };
  if (flipped) updates.verified_at = now;

  const { data, error } = await supabase
    .from('email_senders')
    .update(updates)
    .eq('id', sender.id)
    .select(SELECT_COLS)
    .single();

  if (error) {
    return { sender, changed: false, flipped: false };
  }

  // Première bascule en verified → warmup + pool peer (idempotent).
  //
  // ⚠️ On utilise le client SERVICE-ROLE (admin) pour ces inserts, pas le
  //    `supabase` reçu en argument. Raison : quand le flip se produit via la
  //    route GET /api/email-senders, `supabase` est le client RLS du user.
  //    Or `warmup_peer_pool` n'a QU'UNE policy SELECT pour le propriétaire et
  //    AUCUNE policy INSERT → l'insert user était silencieusement refusé par
  //    RLS (avalé par le catch). Résultat : warmup_sessions OK (policy ALL)
  //    mais enrôlement peer pool manquant. Le service-role bypasse la RLS et
  //    rend le bootstrap fiable quel que soit l'appelant (GET ou cron).
  if (flipped && sender.user_id) {
    let admin = null;
    try { admin = getSupabaseAdmin(); } catch { admin = supabase; }
    const db = admin || supabase;
    try {
      await db.from('warmup_sessions').insert({
        sender_id: sender.id, user_id: sender.user_id, current_day: 1, status: 'active',
      });
    } catch { /* 23505 = déjà démarré */ }
    try {
      const peerEmail = buildPeerEmailAddress(sender.id);
      if (peerEmail) {
        await db.from('warmup_peer_pool').insert({
          sender_id: sender.id, peer_email: peerEmail, active: true,
        });
      }
    } catch { /* 23505 = déjà enrôlé */ }
  }

  // 2) Toujours pending + mode cron → on « nudge » Resend pour forcer un
  //    re-check DNS d'ici la prochaine passe. Fire-and-forget : on NE relit
  //    PAS le résultat (sinon on remettrait l'affichage à 'pending').
  if (triggerVerify && newStatus !== 'verified') {
    try { await verifyResendDomain(sender.resend_domain_id); } catch { /* noop */ }
  }

  return { sender: data, changed, flipped };
}
