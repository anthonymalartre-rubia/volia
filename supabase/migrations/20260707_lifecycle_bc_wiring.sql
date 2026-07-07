-- Câblage B2/B3 + C1-C3 (séquences lifecycle Fable) — appliqué en prod le 07/07/2026.
-- Deux données manquaient pour leurs déclencheurs :
--   1. drip_sent_at : timestamp d'envoi PAR clé (B2 = « J+2 après B1 »,
--      C2/C3 = « J+7/J+14 après C1 », cap global 1 email lifecycle / 24 h).
--      drip_emails_sent (array de clés) reste la source d'idempotence ;
--      drip_sent_at n'est que la dimension temps, remplie à partir de maintenant.
--   2. last_active_at : détection d'inactivité pour le win-back C1 (14 j).
--      Seedé depuis la vraie donnée de connexion (auth.users.last_sign_in_at),
--      entretenu ensuite par un heartbeat throttlé dans getAuthenticatedUser().

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS drip_sent_at jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz;

-- Seed depuis la donnée réelle : dernière connexion connue, sinon création.
UPDATE public.user_profiles up
SET last_active_at = greatest(coalesce(au.last_sign_in_at, au.created_at), up.created_at)
FROM auth.users au
WHERE au.id = up.id
  AND up.last_active_at IS NULL;

-- Filet de sécurité pour d'éventuels profils orphelins.
UPDATE public.user_profiles
SET last_active_at = created_at
WHERE last_active_at IS NULL;

-- Les nouveaux inscrits démarrent « actifs à la création ».
ALTER TABLE public.user_profiles
  ALTER COLUMN last_active_at SET DEFAULT now();
