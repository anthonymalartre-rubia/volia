-- ─────────────────────────────────────────────────────────────────────
-- WS1 — Verrouille l'auto-crédit et l'escalade de privilège sur user_profiles
-- ─────────────────────────────────────────────────────────────────────
-- Audit adversarial (P0 #1) : la policy `anyone_update_own` est FOR UPDATE
-- USING (auth.uid()=id) SANS WITH CHECK, et le trigger freeze ne figeait que
-- is_admin/plan — PAS credit_balance. Résultat : n'importe quel user connecté
-- pouvait `UPDATE user_profiles SET credit_balance = 999999` (crédits illimités,
-- contournement du modèle payant). Et `anyone_insert` (BEFORE UPDATE seulement
-- côté trigger) laissait forger une ligne avec is_admin=true.
--
-- SÛR : les RPC de facturation (increment_usage_atomic, add/consume_purchased_
-- credits) et handle_new_user sont SECURITY DEFINER → current_user = owner
-- (hors 'authenticated'/'anon') → le gel ci-dessous NE les affecte PAS : ils
-- continuent d'ajuster credit_balance/plan légitimement.
--
-- Ne gèle PAS encore trial_*/referral_bonus_months/stripe_* : ils ont des
-- écritures client LÉGITIMES (referrals.js, stripe-coupons.js, checkout) — à
-- basculer d'abord en service-role (WS1b) avant de les geler.
-- ─────────────────────────────────────────────────────────────────────

-- 1) Étend le gel à credit_balance ET couvre l'INSERT (neutralise les colonnes
--    privilégiées côté client, sans jamais bloquer l'insertion).
CREATE OR REPLACE FUNCTION public.freeze_privileged_profile_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $freeze$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.is_admin       := false;
      new.plan           := 'free';
      new.credit_balance := 0;
    else
      new.is_admin       := old.is_admin;
      new.plan           := old.plan;
      new.credit_balance := old.credit_balance;
    end if;
  end if;
  return new;
end;
$freeze$;

-- 2) Étend le trigger de BEFORE UPDATE à BEFORE INSERT OR UPDATE.
DROP TRIGGER IF EXISTS trg_freeze_privileged_profile_columns ON public.user_profiles;
CREATE TRIGGER trg_freeze_privileged_profile_columns
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.freeze_privileged_profile_columns();

-- 3) Durcit la policy UPDATE : le WITH CHECK empêche de repointer sa ligne vers
--    un autre id (défense en profondeur ; le gel colonne fait déjà le gros).
ALTER POLICY anyone_update_own ON public.user_profiles WITH CHECK (auth.uid() = id);

-- 4) Défense en profondeur : le solde ne peut jamais devenir négatif
--    (aucun solde négatif en base à l'application — vérifié : 0/30).
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_credit_balance_nonneg CHECK (credit_balance >= 0);
