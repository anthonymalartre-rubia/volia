-- ─────────────────────────────────────────────────────────────────────
-- WS10 — Suppression de compte RGPD complète, transactionnelle, scopée owner
-- ─────────────────────────────────────────────────────────────────────
-- Audit adversarial (P1) : /api/account/delete supprimait 7 tables codées en dur
-- dont DEUX aux mauvais noms (folders/tags au lieu de lead_folders/lead_tags →
-- ces deletes ne supprimaient RIEN). ~35 tables user-owned étaient laissées
-- orphelines (RGPD), dont email_senders/sms_senders qui contiennent les SECRETS
-- Twilio/Resend CHIFFRÉS → fuite de secrets d'un compte supprimé.
--
-- Découverte schéma (information_schema) :
--   - Quasi aucune FK vers auth.users → deleteUser ne cascade PAS les données.
--   - MAIS tous les FK enfant→table-owned sont CASCADE ou SET NULL (0 RESTRICT)
--     → supprimer une table owned cascade ses enfants (email_sends, form_fields,
--       crm_stages, prospect_contacts, project_tasks, sequence_steps…).
--   - Seule contrainte d'ordre entre tables owned : prospects.search_session_id
--     → search_sessions est NO ACTION → supprimer prospects AVANT search_sessions.
--
-- Cette fonction purge les 42 tables user-owned en UNE transaction (atomique :
-- pas de compte à moitié supprimé), scopée à l'owner (jamais de donnée team
-- partagée : chaque ligne est mono-propriétaire). SECURITY DEFINER → bypass RLS.
-- La suppression de auth.users reste faite côté route via l'Admin API Supabase.
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.purge_user_account(p_uid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $purge$
begin
  -- Ordre imposé : prospects avant search_sessions (FK NO ACTION).
  delete from prospects where user_id = p_uid;
  delete from search_sessions where user_id = p_uid;

  -- Prospection / listes (prospect_contacts cascade via prospect_lists)
  delete from prospect_lists where owner_id = p_uid;
  delete from lead_tags where user_id = p_uid;      -- prospect_tags cascade
  delete from lead_folders where user_id = p_uid;
  delete from enrichment_jobs where user_id = p_uid;
  delete from volia_one_runs where owner_id = p_uid;

  -- Campagnes email/SMS (email_sends / sms_sends cascade)
  delete from email_campaigns where owner_id = p_uid;
  delete from email_sequences where owner_id = p_uid;   -- steps/enrollments cascade
  delete from sms_campaigns where owner_id = p_uid;
  delete from email_senders where user_id = p_uid;      -- SECRET Resend + warmup_peer_pool cascade
  delete from sms_senders where user_id = p_uid;        -- SECRET Twilio chiffré
  delete from warmup_sessions where user_id = p_uid;

  -- CRM (crm_stages cascade via pipelines)
  delete from crm_activities where user_id = p_uid;
  delete from crm_deals where user_id = p_uid;
  delete from crm_contacts where user_id = p_uid;
  delete from crm_custom_fields where user_id = p_uid;
  delete from crm_pipelines where user_id = p_uid;

  -- Forms (form_fields cascade via forms ; form_files cascade via form_responses)
  delete from form_responses where user_id = p_uid;
  delete from forms where user_id = p_uid;

  -- Projets (tasks/attachments/deliverables/shares cascade via projects)
  delete from project_task_comments where user_id = p_uid;
  delete from project_activity where user_id = p_uid;
  delete from projects where user_id = p_uid;
  delete from project_templates where user_id = p_uid;

  -- Autopilot / autonomie (executions/runs cascade via workflows)
  delete from autopilot_workflows where user_id = p_uid;
  delete from autonomous_actions where user_id = p_uid;  -- enfants SET NULL

  -- API / webhooks
  delete from webhook_deliveries where user_id = p_uid;
  delete from webhook_subscriptions where user_id = p_uid;
  delete from api_usage_log where user_id = p_uid;
  delete from api_keys where user_id = p_uid;

  -- Facturation / affiliation / parrainage (affiliate_commissions cascade)
  delete from credit_transactions where user_id = p_uid;
  delete from checkout_recovery_attempts where user_id = p_uid;
  delete from affiliates where user_id = p_uid;
  delete from referrals where referrer_id = p_uid;       -- referred_id SET NULL via profiles

  -- Équipes (invitations cascade via teams ; on retire aussi les adhésions)
  delete from team_members where user_id = p_uid;
  delete from teams where owner_id = p_uid;

  -- Divers user-scoped
  delete from notifications where user_id = p_uid;
  delete from user_achievements where user_id = p_uid;
  delete from newsletter_subscribers where user_id = p_uid;
  delete from inbound_events where user_id = p_uid;
  delete from demo_bot_conversations where user_id = p_uid;
  delete from usage_tracking where user_id = p_uid;

  -- Profil en dernier (cascade referrals.referrer_id, SET NULL referred_id)
  delete from user_profiles where id = p_uid;
end;
$purge$;

-- Réservé au service-role (appelé par /api/account/delete via getSupabaseAdmin).
REVOKE ALL ON FUNCTION public.purge_user_account(uuid) FROM public, anon, authenticated;
