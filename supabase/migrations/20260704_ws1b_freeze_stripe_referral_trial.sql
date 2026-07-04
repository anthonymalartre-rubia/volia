-- ─────────────────────────────────────────────────────────────────────
-- WS1b — Étend le gel des colonnes privilégiées de user_profiles
-- ─────────────────────────────────────────────────────────────────────
-- Suite de WS1 (qui ne gelait que is_admin/plan/credit_balance). Le plan de
-- remédiation imposait de basculer d'abord les écritures client légitimes de
-- ces colonnes en service-role AVANT de les geler, sous peine de casser la
-- persistance Stripe/parrainage.
--
-- Vérification (grep) des écritures restantes après WS1b côté code :
--   - referral_bonus_months : referrals.js + stripe-coupons.js → getSupabaseAdmin ✓
--   - stripe_subscription_id : sync-subscription + webhook Stripe → admin ✓
--   - stripe_customer_id     : checkout + credits-checkout BASCULÉS en admin
--                              (ce commit) ; affiliates.js déjà admin ✓
--   - trial_*                : buildTrialFields() est dead code (aucun conso),
--                              trial_converted_at seulement via webhook admin ✓
-- Aucune écriture user-client légitime ne subsiste sur ces colonnes → gel sûr.
--
-- SÛR : les RPC de facturation et handle_new_user sont SECURITY DEFINER
-- (current_user = owner, hors 'authenticated'/'anon') ; les clients admin
-- (service_role) ne sont pas non plus 'authenticated'/'anon'. Tous BYPASS le gel.
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.freeze_privileged_profile_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $freeze$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      -- Un client ne peut créer une ligne qu'avec les défauts non privilégiés.
      new.is_admin              := false;
      new.plan                  := 'free';
      new.credit_balance        := 0;
      new.referral_bonus_months := 0;
      new.stripe_customer_id     := null;
      new.stripe_subscription_id := null;
      new.trial_plan            := null;
      new.trial_started_at      := null;
      new.trial_ends_at         := null;
      new.trial_converted_at    := null;
    else
      -- UPDATE : toute colonne privilégiée conserve sa valeur OLD côté client.
      new.is_admin              := old.is_admin;
      new.plan                  := old.plan;
      new.credit_balance        := old.credit_balance;
      new.referral_bonus_months := old.referral_bonus_months;
      new.stripe_customer_id     := old.stripe_customer_id;
      new.stripe_subscription_id := old.stripe_subscription_id;
      new.trial_plan            := old.trial_plan;
      new.trial_started_at      := old.trial_started_at;
      new.trial_ends_at         := old.trial_ends_at;
      new.trial_converted_at    := old.trial_converted_at;
    end if;
  end if;
  return new;
end;
$freeze$;
