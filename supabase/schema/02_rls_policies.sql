-- ============================================================================
-- Volia — SNAPSHOT des policies RLS (schéma public) — 123 policies / 02/07/2026
-- Fichier de RÉFÉRENCE (audit d'isolation multi-tenant), pas à rejouer en prod.
--
-- ⚠️ POINT D'ATTENTION relevé à l'extraction (audit) :
--   user_profiles.anyone_update_own est FOR UPDATE ... USING (auth.uid()=id)
--   SANS WITH CHECK → un client pourrait modifier is_admin/plan. C'est
--   NEUTRALISÉ par le trigger freeze_privileged_profile_columns (01_functions.sql
--   + 03_triggers.sql) qui fige ces 2 colonnes pour authenticated/anon.
--   → À terme : ajouter un WITH CHECK explicite plutôt que de dépendre du trigger.
--
--   Plusieurs tables ont des policies "TO public USING (true)" pour le service
--   role (api_usage_log, api_usage_monthly) — accès total assumé côté service.
-- ============================================================================

-- api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_create_own_api_keys ON public.api_keys FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
CREATE POLICY users_delete_own_api_keys ON public.api_keys FOR DELETE TO authenticated USING ((user_id = auth.uid()));
CREATE POLICY users_read_own_api_keys   ON public.api_keys FOR SELECT TO authenticated USING ((user_id = auth.uid()));
CREATE POLICY users_update_own_api_keys ON public.api_keys FOR UPDATE TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));

-- api_usage_log / api_usage_monthly (service-role full access)
ALTER TABLE public.api_usage_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on api_usage_log" ON public.api_usage_log FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.api_usage_monthly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on api_usage_monthly" ON public.api_usage_monthly FOR ALL TO public USING (true) WITH CHECK (true);

-- app_settings (admin only)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY app_settings_admin_all ON public.app_settings FOR ALL TO authenticated
  USING ((EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.is_admin = true)))))
  WITH CHECK ((EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.is_admin = true)))));

-- auto_blog_posts / auto_changelog_proposals (admin write, public read published)
ALTER TABLE public.auto_blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_blog_admin_write ON public.auto_blog_posts FOR ALL TO authenticated
  USING ((EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.is_admin = true)))))
  WITH CHECK ((EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.is_admin = true)))));
CREATE POLICY auto_blog_public_read_published ON public.auto_blog_posts FOR SELECT TO anon, authenticated USING ((status = 'published'::text));
ALTER TABLE public.auto_changelog_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_changelog_admin_write ON public.auto_changelog_proposals FOR ALL TO authenticated
  USING ((EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.is_admin = true)))))
  WITH CHECK ((EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.is_admin = true)))));
CREATE POLICY auto_changelog_public_read_published ON public.auto_changelog_proposals FOR SELECT TO anon, authenticated USING ((status = 'published'::text));

-- autonomous_actions (admin)
ALTER TABLE public.autonomous_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read all autonomous actions" ON public.autonomous_actions FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true)))));
CREATE POLICY "Admin can update autonomous actions" ON public.autonomous_actions FOR UPDATE TO public USING ((EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true)))));

-- autopilot_executions / autopilot_workflows (owner via workflow)
ALTER TABLE public.autopilot_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_all_autopilot_executions ON public.autopilot_executions FOR ALL TO authenticated
  USING ((workflow_id IN ( SELECT autopilot_workflows.id FROM autopilot_workflows WHERE (autopilot_workflows.user_id = auth.uid()))))
  WITH CHECK ((workflow_id IN ( SELECT autopilot_workflows.id FROM autopilot_workflows WHERE (autopilot_workflows.user_id = auth.uid()))));
ALTER TABLE public.autopilot_workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_all_autopilot_workflows ON public.autopilot_workflows FOR ALL TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));

-- credit_transactions (owner read)
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY credit_tx_owner_select ON public.credit_transactions FOR SELECT TO public USING ((auth.uid() = user_id));

-- crm_* (owner via user_id, sub-tables via pipeline)
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can delete own activities" ON public.crm_activities FOR DELETE TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own activities" ON public.crm_activities FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update own activities" ON public.crm_activities FOR UPDATE TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own activities"   ON public.crm_activities FOR SELECT TO public USING ((auth.uid() = user_id));
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can delete own contacts" ON public.crm_contacts FOR DELETE TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own contacts" ON public.crm_contacts FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update own contacts" ON public.crm_contacts FOR UPDATE TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own contacts"   ON public.crm_contacts FOR SELECT TO public USING ((auth.uid() = user_id));
ALTER TABLE public.crm_custom_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user owns custom_fields" ON public.crm_custom_fields FOR ALL TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can delete own deals" ON public.crm_deals FOR DELETE TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own deals" ON public.crm_deals FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update own deals" ON public.crm_deals FOR UPDATE TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own deals"   ON public.crm_deals FOR SELECT TO public USING ((auth.uid() = user_id));
ALTER TABLE public.crm_pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can delete own pipelines" ON public.crm_pipelines FOR DELETE TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own pipelines" ON public.crm_pipelines FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update own pipelines" ON public.crm_pipelines FOR UPDATE TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own pipelines"   ON public.crm_pipelines FOR SELECT TO public USING ((auth.uid() = user_id));
ALTER TABLE public.crm_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can delete stages of own pipelines" ON public.crm_stages FOR DELETE TO public USING ((EXISTS ( SELECT 1 FROM crm_pipelines WHERE ((crm_pipelines.id = crm_stages.pipeline_id) AND (crm_pipelines.user_id = auth.uid())))));
CREATE POLICY "Users can insert stages in own pipelines" ON public.crm_stages FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1 FROM crm_pipelines WHERE ((crm_pipelines.id = crm_stages.pipeline_id) AND (crm_pipelines.user_id = auth.uid())))));
CREATE POLICY "Users can update stages of own pipelines" ON public.crm_stages FOR UPDATE TO public USING ((EXISTS ( SELECT 1 FROM crm_pipelines WHERE ((crm_pipelines.id = crm_stages.pipeline_id) AND (crm_pipelines.user_id = auth.uid())))));
CREATE POLICY "Users can view stages of own pipelines"   ON public.crm_stages FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM crm_pipelines WHERE ((crm_pipelines.id = crm_stages.pipeline_id) AND (crm_pipelines.user_id = auth.uid())))));

-- email_* (owner via owner_id ; sends via campaign)
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_manage_own_email_campaigns ON public.email_campaigns FOR ALL TO authenticated USING ((owner_id = auth.uid())) WITH CHECK ((owner_id = auth.uid()));
ALTER TABLE public.email_senders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user owns email_senders" ON public.email_senders FOR ALL TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_read_own_email_sends ON public.email_sends FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM email_campaigns ec WHERE ((ec.id = email_sends.campaign_id) AND (ec.owner_id = auth.uid())))));
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages sequences" ON public.email_sequences FOR ALL TO authenticated USING ((owner_id = auth.uid())) WITH CHECK ((owner_id = auth.uid()));

-- enrichment_jobs (owner)
ALTER TABLE public.enrichment_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY enrichment_jobs_insert_own ON public.enrichment_jobs FOR INSERT TO public WITH CHECK ((user_id = auth.uid()));
CREATE POLICY enrichment_jobs_select_own ON public.enrichment_jobs FOR SELECT TO public USING ((user_id = auth.uid()));
CREATE POLICY enrichment_jobs_update_own ON public.enrichment_jobs FOR UPDATE TO public USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));

-- forms + fields + files + responses (owner via forms.user_id / responses.user_id)
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY forms_delete_own ON public.forms FOR DELETE TO public USING ((user_id = auth.uid()));
CREATE POLICY forms_insert_own ON public.forms FOR INSERT TO public WITH CHECK ((user_id = auth.uid()));
CREATE POLICY forms_select_own ON public.forms FOR SELECT TO public USING ((user_id = auth.uid()));
CREATE POLICY forms_update_own ON public.forms FOR UPDATE TO public USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY form_fields_delete_own ON public.form_fields FOR DELETE TO public USING ((EXISTS ( SELECT 1 FROM forms f WHERE ((f.id = form_fields.form_id) AND (f.user_id = auth.uid())))));
CREATE POLICY form_fields_insert_own ON public.form_fields FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1 FROM forms f WHERE ((f.id = form_fields.form_id) AND (f.user_id = auth.uid())))));
CREATE POLICY form_fields_select_own ON public.form_fields FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM forms f WHERE ((f.id = form_fields.form_id) AND (f.user_id = auth.uid())))));
CREATE POLICY form_fields_update_own ON public.form_fields FOR UPDATE TO public USING ((EXISTS ( SELECT 1 FROM forms f WHERE ((f.id = form_fields.form_id) AND (f.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1 FROM forms f WHERE ((f.id = form_fields.form_id) AND (f.user_id = auth.uid())))));
ALTER TABLE public.form_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY form_files_delete_own ON public.form_files FOR DELETE TO public USING ((EXISTS ( SELECT 1 FROM form_responses r WHERE ((r.id = form_files.form_response_id) AND (r.user_id = auth.uid())))));
CREATE POLICY form_files_select_own ON public.form_files FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM form_responses r WHERE ((r.id = form_files.form_response_id) AND (r.user_id = auth.uid())))));
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY form_responses_delete_own ON public.form_responses FOR DELETE TO public USING ((user_id = auth.uid()));
CREATE POLICY form_responses_select_own ON public.form_responses FOR SELECT TO public USING ((user_id = auth.uid()));
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY form_templates_select_all ON public.form_templates FOR SELECT TO public USING (true);

-- inbound_events / inbound_feedback_emails
ALTER TABLE public.inbound_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own inbound_events" ON public.inbound_events FOR SELECT TO authenticated USING ((user_id = auth.uid()));
ALTER TABLE public.inbound_feedback_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY inbound_feedback_emails_admin_all ON public.inbound_feedback_emails FOR ALL TO authenticated
  USING ((EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.is_admin = true)))))
  WITH CHECK ((EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.is_admin = true)))));

-- lead_folders / lead_tags
ALTER TABLE public.lead_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_delete_own_folders ON public.lead_folders FOR DELETE TO public USING ((auth.uid() = user_id));
CREATE POLICY users_insert_own_folders ON public.lead_folders FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY users_select_own_folders ON public.lead_folders FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY users_update_own_folders ON public.lead_folders FOR UPDATE TO public USING ((auth.uid() = user_id));
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tags" ON public.lead_tags FOR ALL TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_delete_own_notifs ON public.notifications FOR DELETE TO authenticated USING ((user_id = auth.uid()));
CREATE POLICY users_read_own_notifs   ON public.notifications FOR SELECT TO authenticated USING ((user_id = auth.uid()));
CREATE POLICY users_update_own_notifs ON public.notifications FOR UPDATE TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));

-- profiles (legacy) / user_profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_read_own_profile   ON public.profiles FOR SELECT TO public USING ((auth.uid() = id));
CREATE POLICY users_update_own_profile ON public.profiles FOR UPDATE TO public USING ((auth.uid() = id));
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY anyone_insert           ON public.user_profiles FOR INSERT TO public WITH CHECK ((auth.uid() = id));
-- ⚠️ pas de WITH CHECK ci-dessous — neutralisé par trigger freeze_privileged_profile_columns
CREATE POLICY anyone_update_own       ON public.user_profiles FOR UPDATE TO public USING ((auth.uid() = id));
CREATE POLICY users_select_own_profile ON public.user_profiles FOR SELECT TO public USING ((auth.uid() = id));

-- project_* (owner via projects.user_id)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own projects delete" ON public.projects FOR DELETE TO public USING ((auth.uid() = user_id));
CREATE POLICY "own projects insert" ON public.projects FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "own projects select" ON public.projects FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY "own projects update" ON public.projects FOR UPDATE TO public USING ((auth.uid() = user_id));
ALTER TABLE public.project_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own activity insert" ON public.project_activity FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1 FROM projects p WHERE ((p.id = project_activity.project_id) AND (p.user_id = auth.uid())))));
CREATE POLICY "own activity select" ON public.project_activity FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM projects p WHERE ((p.id = project_activity.project_id) AND (p.user_id = auth.uid())))));
ALTER TABLE public.project_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attachments" ON public.project_attachments FOR ALL TO public USING ((EXISTS ( SELECT 1 FROM projects p WHERE ((p.id = project_attachments.project_id) AND (p.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1 FROM projects p WHERE ((p.id = project_attachments.project_id) AND (p.user_id = auth.uid())))));
ALTER TABLE public.project_deliverables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own deliverables" ON public.project_deliverables FOR ALL TO public USING ((EXISTS ( SELECT 1 FROM projects p WHERE ((p.id = project_deliverables.project_id) AND (p.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1 FROM projects p WHERE ((p.id = project_deliverables.project_id) AND (p.user_id = auth.uid())))));
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own shares" ON public.project_shares FOR ALL TO public USING ((EXISTS ( SELECT 1 FROM projects p WHERE ((p.id = project_shares.project_id) AND (p.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1 FROM projects p WHERE ((p.id = project_shares.project_id) AND (p.user_id = auth.uid())))));
ALTER TABLE public.project_task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own task comments" ON public.project_task_comments FOR ALL TO public USING ((EXISTS ( SELECT 1 FROM (project_tasks t JOIN projects p ON ((p.id = t.project_id))) WHERE ((t.id = project_task_comments.task_id) AND (p.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1 FROM (project_tasks t JOIN projects p ON ((p.id = t.project_id))) WHERE ((t.id = project_task_comments.task_id) AND (p.user_id = auth.uid())))));
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own project tasks" ON public.project_tasks FOR ALL TO public USING ((EXISTS ( SELECT 1 FROM projects p WHERE ((p.id = project_tasks.project_id) AND (p.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1 FROM projects p WHERE ((p.id = project_tasks.project_id) AND (p.user_id = auth.uid())))));
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates delete" ON public.project_templates FOR DELETE TO public USING ((auth.uid() = user_id));
CREATE POLICY "templates insert" ON public.project_templates FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "templates select" ON public.project_templates FOR SELECT TO public USING (((user_id IS NULL) OR (auth.uid() = user_id)));
CREATE POLICY "templates update" ON public.project_templates FOR UPDATE TO public USING ((auth.uid() = user_id));

-- prospects + tags (owner)
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read all prospects" ON public.prospects FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.is_admin = true)))));
CREATE POLICY users_delete_own ON public.prospects FOR DELETE TO public USING ((auth.uid() = user_id));
CREATE POLICY users_insert_own ON public.prospects FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY users_select_own ON public.prospects FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY users_update_own ON public.prospects FOR UPDATE TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
ALTER TABLE public.prospect_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_manage_own_prospect_tags ON public.prospect_tags FOR ALL TO public USING ((EXISTS ( SELECT 1 FROM prospects p WHERE ((p.id = prospect_tags.prospect_id) AND (p.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1 FROM prospects p WHERE ((p.id = prospect_tags.prospect_id) AND (p.user_id = auth.uid())))));

-- prospect_lists + contacts (owner via prospect_lists.owner_id)
ALTER TABLE public.prospect_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_manage_own_lists ON public.prospect_lists FOR ALL TO authenticated USING ((owner_id = auth.uid())) WITH CHECK ((owner_id = auth.uid()));
ALTER TABLE public.prospect_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_manage_own_contacts ON public.prospect_contacts FOR ALL TO authenticated USING ((EXISTS ( SELECT 1 FROM prospect_lists pl WHERE ((pl.id = prospect_contacts.list_id) AND (pl.owner_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1 FROM prospect_lists pl WHERE ((pl.id = prospect_contacts.list_id) AND (pl.owner_id = auth.uid())))));

-- publisher_credentials (admin) / referrals (owner read)
ALTER TABLE public.publisher_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY publisher_credentials_admin_all ON public.publisher_credentials FOR ALL TO authenticated
  USING ((EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.is_admin = true)))))
  WITH CHECK ((EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.is_admin = true)))));
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Referrals: owner can read" ON public.referrals FOR SELECT TO public USING ((referrer_id = auth.uid()));

-- search_sessions
ALTER TABLE public.search_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_own_sessions ON public.search_sessions FOR ALL TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

-- sequence_* (owner via email_sequences.owner_id)
ALTER TABLE public.sequence_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner sees enrollments via sequence" ON public.sequence_enrollments FOR SELECT TO authenticated USING ((sequence_id IN ( SELECT email_sequences.id FROM email_sequences WHERE (email_sequences.owner_id = auth.uid()))));
CREATE POLICY users_enroll_own_sequences ON public.sequence_enrollments FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1 FROM email_sequences s WHERE ((s.id = sequence_enrollments.sequence_id) AND (s.owner_id = auth.uid())))));
ALTER TABLE public.sequence_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages steps via sequence" ON public.sequence_steps FOR ALL TO authenticated USING ((sequence_id IN ( SELECT email_sequences.id FROM email_sequences WHERE (email_sequences.owner_id = auth.uid())))) WITH CHECK ((sequence_id IN ( SELECT email_sequences.id FROM email_sequences WHERE (email_sequences.owner_id = auth.uid()))));

-- sms_* (owner via owner_id / user_id ; sends via campaign)
ALTER TABLE public.sms_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_manage_own_sms_campaigns ON public.sms_campaigns FOR ALL TO authenticated USING ((owner_id = auth.uid())) WITH CHECK ((owner_id = auth.uid()));
ALTER TABLE public.sms_senders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user owns sms_senders" ON public.sms_senders FOR ALL TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
ALTER TABLE public.sms_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_read_own_sms_sends ON public.sms_sends FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM sms_campaigns sc WHERE ((sc.id = sms_sends.campaign_id) AND (sc.owner_id = auth.uid())))));

-- teams / team_members / team_invitations
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY teams_delete ON public.teams FOR DELETE TO authenticated USING ((owner_id = auth.uid()));
CREATE POLICY teams_select ON public.teams FOR SELECT TO authenticated USING (((owner_id = auth.uid()) OR (id IN ( SELECT team_members.team_id FROM team_members WHERE (team_members.user_id = auth.uid())))));
CREATE POLICY teams_update ON public.teams FOR UPDATE TO authenticated USING ((owner_id = auth.uid())) WITH CHECK ((owner_id = auth.uid()));
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_members_delete_owner ON public.team_members FOR DELETE TO authenticated USING ((team_id IN ( SELECT teams.id FROM teams WHERE (teams.owner_id = auth.uid()))));
CREATE POLICY team_members_delete_self  ON public.team_members FOR DELETE TO authenticated USING ((user_id = auth.uid()));
CREATE POLICY team_members_select ON public.team_members FOR SELECT TO authenticated USING ((team_id IN ( SELECT teams.id FROM teams WHERE (teams.owner_id = auth.uid()) UNION SELECT team_members_1.team_id FROM team_members team_members_1 WHERE (team_members_1.user_id = auth.uid()))));
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_invitations_select ON public.team_invitations FOR SELECT TO authenticated USING (((invited_by = auth.uid()) OR (team_id IN ( SELECT teams.id FROM teams WHERE (teams.owner_id = auth.uid()) UNION SELECT team_members.team_id FROM team_members WHERE (team_members.user_id = auth.uid()))) OR (lower(email) = ( SELECT lower((users.email)::text) AS lower FROM auth.users WHERE (users.id = auth.uid())))));

-- usage_tracking (owner read + admin read ; ⚠️ écriture uniquement en service-role, PAS de policy INSERT/UPDATE — cf. audit usage.js:15)
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read all usage" ON public.usage_tracking FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM user_profiles up WHERE ((up.id = auth.uid()) AND (up.is_admin = true)))));
CREATE POLICY "Users can read own usage"  ON public.usage_tracking FOR SELECT TO public USING ((auth.uid() = user_id));

-- user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_achievements_insert_own ON public.user_achievements FOR INSERT TO public WITH CHECK ((user_id = auth.uid()));
CREATE POLICY user_achievements_select_own ON public.user_achievements FOR SELECT TO public USING ((user_id = auth.uid()));
CREATE POLICY user_achievements_update_own ON public.user_achievements FOR UPDATE TO public USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));

-- volia_one_runs (owner)
ALTER TABLE public.volia_one_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY volia_one_runs_insert_own ON public.volia_one_runs FOR INSERT TO public WITH CHECK ((auth.uid() = owner_id));
CREATE POLICY volia_one_runs_select_own ON public.volia_one_runs FOR SELECT TO public USING ((auth.uid() = owner_id));

-- warmup_* (owner via email_senders.user_id)
ALTER TABLE public.warmup_exchanges ENABLE ROW LEVEL SECURITY;
CREATE POLICY warmup_exchanges_select_own ON public.warmup_exchanges FOR SELECT TO authenticated USING (((from_peer_id IN ( SELECT wpp.id FROM (warmup_peer_pool wpp JOIN email_senders es ON ((es.id = wpp.sender_id))) WHERE (es.user_id = auth.uid()))) OR (to_peer_id IN ( SELECT wpp.id FROM (warmup_peer_pool wpp JOIN email_senders es ON ((es.id = wpp.sender_id))) WHERE (es.user_id = auth.uid())))));
ALTER TABLE public.warmup_peer_pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY warmup_peer_pool_select_own ON public.warmup_peer_pool FOR SELECT TO authenticated USING ((sender_id IN ( SELECT email_senders.id FROM email_senders WHERE (email_senders.user_id = auth.uid()))));
ALTER TABLE public.warmup_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user owns warmup_sessions" ON public.warmup_sessions FOR ALL TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));

-- webhook_deliveries / webhook_subscriptions (owner)
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhook_deliveries_owner ON public.webhook_deliveries FOR ALL TO public USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhook_subs_owner ON public.webhook_subscriptions FOR ALL TO public USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
