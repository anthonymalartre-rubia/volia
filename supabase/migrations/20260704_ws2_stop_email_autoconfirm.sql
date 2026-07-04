-- ─────────────────────────────────────────────────────────────────────
-- WS2 — Rétablit la preuve de possession d'email à l'inscription
-- ─────────────────────────────────────────────────────────────────────
-- Audit adversarial (P0 #2) : handle_new_user() forçait email_confirmed_at=now()
-- sur CHAQUE nouvel utilisateur → neutralisait toute la confirmation d'email et
-- permettait de créer un compte au nom d'un email tiers (account squatting).
--
-- Or le flux d'inscription (src/app/api/auth/signup/route.js) est DÉJÀ construit
-- pour la confirmation : il crée l'user email_confirmed_at=null via l'admin API,
-- génère un lien de confirmation et envoie un email brandé via Resend (+ endpoint
-- /api/auth/resend-confirmation). L'auto-confirm du trigger SABOTAIT ce flux.
--
-- Fix : on retire le bloc d'auto-confirmation. La création du profil freemium
-- est conservée à l'identique.
--
-- ⚠️ REQUIS pour l'enforcement complet au login : "Confirm email" doit être
--    ACTIVÉ dans Supabase Auth (Dashboard → Authentication → Providers → Email).
--    Sans ce réglage, signInWithPassword laisse passer les non-confirmés (pas de
--    lockout, mais confirmation non gatée). Les emails de confirmation par défaut
--    de Supabase restent désactivés (Volia envoie les siens via Resend).
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Freemium pur (décision 20/06/2026) : chaque nouvel inscrit démarre en 'free'.
  INSERT INTO public.user_profiles (id, plan)
  VALUES (NEW.id, 'free')
  ON CONFLICT (id) DO NOTHING;

  -- WS2 : PLUS d'auto-confirmation de l'email. Le flux api/auth/signup crée
  -- l'user non confirmé et envoie un lien de confirmation via Resend. La
  -- confirmation est désormais réellement requise (proof of possession).
  RETURN NEW;
END;
$function$;
