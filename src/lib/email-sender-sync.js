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

  if (triggerVerify) {
    try { await verifyResendDomain(sender.resend_domain_id); } catch { /* best-effort */ }
  }

  let resendData;
  try {
    resendData = await getResendDomain(sender.resend_domain_id);
  } catch {
    // Resend indispo / transitoire → on garde la row DB telle quelle.
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
  if (flipped && sender.user_id) {
    try {
      await supabase.from('warmup_sessions').insert({
        sender_id: sender.id, user_id: sender.user_id, current_day: 1, status: 'active',
      });
    } catch { /* 23505 = déjà démarré */ }
    try {
      const peerEmail = buildPeerEmailAddress(sender.id);
      if (peerEmail) {
        await supabase.from('warmup_peer_pool').insert({
          sender_id: sender.id, peer_email: peerEmail, active: true,
        });
      }
    } catch { /* 23505 = déjà enrôlé */ }
  }

  return { sender: data, changed, flipped };
}
