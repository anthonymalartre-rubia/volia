-- ─────────────────────────────────────────────────────────────────────
-- WS5 — Claim atomique anti-double-envoi sur email_sends
-- ─────────────────────────────────────────────────────────────────────
-- Audit adversarial (CRITICAL) : process-email-campaigns fait
-- SELECT status='pending' → sendEmail → UPDATE status='sent', SANS claim entre
-- les deux. Deux invocations concurrentes du cron (chevauchement, retrigger)
-- sélectionnent le même batch et l'envoient DEUX FOIS → réputation domaine
-- cramée + double-facturation emails_sent.
--
-- Fix : colonne claimed_at posée atomiquement avant l'envoi. Le cron fait
--   UPDATE email_sends SET claimed_at=now()
--   WHERE id IN (batch) AND status='pending'
--     AND (claimed_at IS NULL OR claimed_at < now()-15min) RETURNING id
-- Postgres verrouille les lignes → chaque cron ne récupère que des lignes
-- disjointes. Un claim périmé (cron crashé en plein envoi) est repris après
-- 15 min (statut resté 'pending'). Aucun nouveau statut → pas de risque de
-- "sending" bloqué.
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.email_sends ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_email_sends_pending_claim
  ON public.email_sends (claimed_at)
  WHERE status = 'pending';
