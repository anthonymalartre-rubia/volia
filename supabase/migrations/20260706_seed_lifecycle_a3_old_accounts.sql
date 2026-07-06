-- ─────────────────────────────────────────────────────────────────────
-- Backfill data : marquer lifecycle_a3 comme « envoyé » pour les comptes
-- anciens (> 14 jours). Appliqué en prod le 06/07/2026 (audit de clôture).
--
-- Pourquoi : lifecycle_a3 est une clé drip introduite le 05/07/2026 (email
-- A3 « Ton premier cold email », J+4). Le cron drip n'a pas de borne
-- inférieure de fenêtre : sans ce seed, tout compte historique dont la
-- condition mûrit (1 email trouvé + 0 campagne) recevait « ton premier
-- cold email » à J+60 ou plus, hors contexte. Les comptes dont la fenêtre
-- d'onboarding est finie (> 14 j = dernier step du drip) sont donc marqués
-- comme déjà servis.
--
-- Idempotent : le filtre `NOT (... ? 'lifecycle_a3')` rend le re-run inoffensif.
-- ─────────────────────────────────────────────────────────────────────

UPDATE public.user_profiles
SET drip_emails_sent = coalesce(drip_emails_sent, '[]'::jsonb) || '["lifecycle_a3"]'::jsonb
WHERE created_at < now() - interval '14 days'
  AND NOT (coalesce(drip_emails_sent, '[]'::jsonb) ? 'lifecycle_a3');
