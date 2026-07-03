-- ============================================================================
-- Volia — SNAPSHOT des fonctions Postgres (schéma public)
-- Extrait de la prod (projet kqrarrrojdtxijkhejhg) le 02/07/2026 via MCP.
-- Fichier de RÉFÉRENCE (review + reproductibilité), pas une migration à rejouer :
-- ces objets existent déjà en prod. Toute évolution = nouvelle migration datée
-- dans supabase/migrations/ (voir supabase/README.md).
--
-- ⭐ Contient enfin dans le repo le MOTEUR DE CRÉDITS (increment_usage_atomic),
--    consume_purchased_credits, add_purchased_credits et le garde-fou
--    freeze_privileged_profile_columns — jusqu'ici invisibles du code (audit H1).
-- ============================================================================

-- ============================================================
-- FUNCTION: add_purchased_credits(p_user_id uuid, p_amount integer, p_session_id text, p_pack_id text)
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_purchased_credits(p_user_id uuid, p_amount integer, p_session_id text, p_pack_id text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_balance integer;
begin
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  insert into credit_transactions (user_id, delta, reason, pack_id, stripe_session_id)
  values (p_user_id, p_amount, 'purchase', p_pack_id, p_session_id)
  on conflict (stripe_session_id) do nothing;
  if not found then
    -- session déjà traitée (retry webhook) → no-op
    select credit_balance into v_balance from user_profiles where id = p_user_id;
    return coalesce(v_balance, 0);
  end if;
  update user_profiles
    set credit_balance = credit_balance + p_amount, updated_at = now()
    where id = p_user_id
    returning credit_balance into v_balance;
  return coalesce(v_balance, 0);
end $function$
;

-- ============================================================
-- FUNCTION: consume_purchased_credits(p_user_id uuid, p_amount integer)
-- ============================================================
CREATE OR REPLACE FUNCTION public.consume_purchased_credits(p_user_id uuid, p_amount integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_balance integer;
begin
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  update user_profiles
    set credit_balance = credit_balance - p_amount, updated_at = now()
    where id = p_user_id and credit_balance >= p_amount
    returning credit_balance into v_balance;
  if v_balance is null then return -1; end if;
  insert into credit_transactions (user_id, delta, reason)
  values (p_user_id, -p_amount, 'consume');
  return v_balance;
end $function$
;

-- ============================================================
-- FUNCTION: increment_usage_atomic(p_user_id uuid, p_month text, p_action text, p_amount integer, p_monthly_limit integer)
-- ⭐ LE MOTEUR DE CRÉDITS (touché le 02/07, commit 18e127f). Upsert atomique du
--    compteur mensuel + débit PARTIEL (plancher 0) du solde acheté pour la part
--    au-delà du quota. Seuls les enrichments débitent le solde.
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_usage_atomic(p_user_id uuid, p_month text, p_action text, p_amount integer, p_monthly_limit integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_new_count integer;
  v_overflow  integer;
  v_balance   integer;
  v_debit     integer := 0;
begin
  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  -- Whitelist STRICTE du nom de colonne (anti-injection SQL) : exactement les
  -- compteurs de usage_tracking. Toute nouvelle colonne devra être ajoutée ici.
  if p_action not in ('searches', 'enrichments', 'exports', 'verifications',
                      'phones', 'emails_sent', 'form_submissions') then
    raise exception 'invalid action: %', p_action;
  end if;

  -- Upsert atomique du compteur mensuel : plus de perte d'update concurrent.
  execute format(
    'insert into usage_tracking (user_id, month, %1$I) values ($1, $2, $3)
     on conflict (user_id, month)
     do update set %1$I = coalesce(usage_tracking.%1$I, 0) + excluded.%1$I,
                   updated_at = now()
     returning %1$I',
    p_action
  ) into v_new_count using p_user_id, p_month, p_amount;

  -- ─── Relais crédits achetés (packs one-time) ───
  -- RÈGLE ENCODÉE ICI : seuls les ENRICHISSEMENTS débitent le solde acheté
  -- (la donnée a un coût API réel). searches / phones / emails_sent / etc.
  -- ne touchent JAMAIS credit_balance.
  if p_action = 'enrichments' and p_monthly_limit >= 0 then
    -- Part de CET incrément au-delà du quota mensuel inclus.
    v_overflow := least(p_amount, greatest(0, v_new_count - p_monthly_limit));
    if v_overflow > 0 then
      -- Verrou ligne : sérialise les débits concurrents sur le même user.
      select credit_balance into v_balance
        from user_profiles where id = p_user_id for update;
      v_debit := least(coalesce(v_balance, 0), v_overflow); -- partiel, jamais négatif
      if v_debit > 0 then
        update user_profiles
           set credit_balance = credit_balance - v_debit, updated_at = now()
         where id = p_user_id;
        insert into credit_transactions (user_id, delta, reason)
        values (p_user_id, -v_debit, 'consume');
      end if;
    end if;
  end if;

  return jsonb_build_object('new_count', v_new_count, 'credits_debited', v_debit);
end $function$
;

-- ============================================================
-- FUNCTION: increment_api_usage(p_service text, p_month text, p_cost numeric)
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_api_usage(p_service text, p_month text, p_cost numeric)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO api_usage_monthly (service, month, call_count, total_cost_cents, updated_at)
  VALUES (p_service, p_month, 1, p_cost, now())
  ON CONFLICT (service, month)
  DO UPDATE SET
    call_count = api_usage_monthly.call_count + 1,
    total_cost_cents = api_usage_monthly.total_cost_cents + p_cost,
    updated_at = now();
END;
$function$
;

-- ============================================================
-- FUNCTION: freeze_privileged_profile_columns()
-- ⭐ Garde-fou anti-élévation de privilèges : fige is_admin + plan pour les
--    rôles client (authenticated/anon). Neutralise la policy user_profiles
--    "anyone_update_own" qui n'a PAS de WITH CHECK (cf. 02_rls_policies.sql).
-- ============================================================
CREATE OR REPLACE FUNCTION public.freeze_privileged_profile_columns()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if current_user in ('authenticated', 'anon') then
    new.is_admin := old.is_admin;
    new.plan     := old.plan;
  end if;
  return new;
end;
$function$
;

-- ============================================================
-- FUNCTION: handle_new_user()  — trigger auth.users → user_profiles
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Freemium pur (décision 20/06/2026) : PLUS d'essai Pro/MAX d'office.
  INSERT INTO public.user_profiles (id, plan)
  VALUES (NEW.id, 'free')
  ON CONFLICT (id) DO NOTHING;

  IF NEW.email_confirmed_at IS NULL THEN
    UPDATE auth.users SET email_confirmed_at = now() WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$function$
;

-- ============================================================
-- FUNCTION: assign_referral_code()  — trigger user_profiles BEFORE INSERT
-- ============================================================
CREATE OR REPLACE FUNCTION public.assign_referral_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$function$
;

-- ============================================================
-- FUNCTION: generate_referral_code()
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_referral_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  chars text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i int := 0;
  exists_check int;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
    END LOOP;
    SELECT COUNT(*) INTO exists_check FROM user_profiles WHERE referral_code = result;
    EXIT WHEN exists_check = 0;
  END LOOP;
  RETURN result;
END;
$function$
;

-- ============================================================
-- FUNCTION: get_published_form(p_slug text)  — SECURITY DEFINER, lecture publique d'un form publié
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_published_form(p_slug text)
 RETURNS TABLE(id uuid, slug text, name text, description text, schema jsonb, settings jsonb, published_at timestamp with time zone, owner_name text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select f.id, f.slug, f.name, f.description, f.schema, f.settings, f.published_at,
         nullif(btrim(up.company_name), '') as owner_name
  from public.forms f
  left join public.user_profiles up on up.id = f.user_id
  where f.slug = p_slug and f.status = 'published'
  limit 1;
$function$
;

-- ============================================================
-- FUNCTION: session_prospect_counts(p_user_id uuid, p_session_ids uuid[])
-- ============================================================
CREATE OR REPLACE FUNCTION public.session_prospect_counts(p_user_id uuid, p_session_ids uuid[])
 RETURNS TABLE(search_session_id uuid, total bigint, with_email bigint, importable bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select
    p.search_session_id,
    count(*) as total,
    count(distinct lower(btrim(p.email)))
      filter (where p.email is not null and btrim(p.email) <> '') as with_email,
    count(distinct lower(btrim(p.email)))
      filter (where p.email is not null and btrim(p.email) <> '')
    +
    count(distinct btrim(p.telephone))
      filter (where (p.email is null or btrim(p.email) = '')
                and p.telephone is not null and btrim(p.telephone) <> '') as importable
  from prospects p
  where p.user_id = p_user_id
    and p.search_session_id = any(p_session_ids)
  group by p.search_session_id;
$function$
;

-- ============================================================
-- FUNCTION: crm_pipeline_report(p_pipeline_id uuid)
-- ============================================================
CREATE OR REPLACE FUNCTION public.crm_pipeline_report(p_pipeline_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select jsonb_build_object(
    'funnel', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'stage', s.name, 'color', s.color, 'position', s.position,
          'closing_type', s.closing_type,
          'count', coalesce(c.cnt, 0),
          'value_cents', coalesce(c.val, 0)
        ) order by s.position
      ), '[]'::jsonb)
      from crm_stages s
      left join (
        select stage_id, count(*) cnt, sum(value_cents) val
        from crm_deals where pipeline_id = p_pipeline_id group by stage_id
      ) c on c.stage_id = s.id
      where s.pipeline_id = p_pipeline_id
    ),
    'open_count', (select count(*) from crm_deals where pipeline_id = p_pipeline_id and status = 'open'),
    'won_count', (select count(*) from crm_deals where pipeline_id = p_pipeline_id and status = 'won'),
    'lost_count', (select count(*) from crm_deals where pipeline_id = p_pipeline_id and status = 'lost'),
    'open_value_cents', (select coalesce(sum(value_cents),0) from crm_deals where pipeline_id = p_pipeline_id and status = 'open'),
    'won_value_cents', (select coalesce(sum(value_cents),0) from crm_deals where pipeline_id = p_pipeline_id and status = 'won'),
    'lost_value_cents', (select coalesce(sum(value_cents),0) from crm_deals where pipeline_id = p_pipeline_id and status = 'lost'),
    'avg_cycle_days', (
      select round(avg(extract(epoch from (closed_at - created_at)) / 86400.0))
      from crm_deals
      where pipeline_id = p_pipeline_id and status = 'won' and closed_at is not null
    ),
    'forecast', (
      select coalesce(jsonb_agg(x order by x->>'month'), '[]'::jsonb) from (
        select jsonb_build_object(
          'month', to_char(date_trunc('month', d.expected_close_date), 'YYYY-MM'),
          'weighted_cents', round(sum(d.value_cents * coalesce(st.probability,0) / 100.0)),
          'raw_cents', sum(d.value_cents),
          'count', count(*)
        ) as x
        from crm_deals d
        left join crm_stages st on st.id = d.stage_id
        where d.pipeline_id = p_pipeline_id and d.status = 'open' and d.expected_close_date is not null
        group by date_trunc('month', d.expected_close_date)
      ) f
    )
  );
$function$
;

-- ============================================================
-- FUNCTION: crm_reindex_stage(p_pipeline_id uuid, p_stage_id uuid)
-- ============================================================
CREATE OR REPLACE FUNCTION public.crm_reindex_stage(p_pipeline_id uuid, p_stage_id uuid)
 RETURNS void
 LANGUAGE sql
 SET search_path TO 'public'
AS $function$
  with ordered as (
    select id,
           (row_number() over (order by position asc, updated_at desc)) - 1 as new_pos
    from crm_deals
    where pipeline_id = p_pipeline_id and stage_id = p_stage_id
  )
  update crm_deals d
  set position = o.new_pos
  from ordered o
  where d.id = o.id and d.position is distinct from o.new_pos;
$function$
;

-- ============================================================
-- FUNCTION: crm_stale_open_deals(p_days integer)
-- ============================================================
CREATE OR REPLACE FUNCTION public.crm_stale_open_deals(p_days integer DEFAULT 7)
 RETURNS TABLE(deal_id uuid, user_id uuid, title text, contact_id uuid, contact_name text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select d.id, d.user_id, d.title, d.contact_id, c.name
  from crm_deals d
  join crm_stages s on s.id = d.stage_id and s.closing_type is null
  join user_profiles up on up.id = d.user_id
  left join crm_contacts c on c.id = d.contact_id
  where d.status = 'open'
    and d.created_at < now() - make_interval(days => p_days)
    and coalesce((up.crm_automation_prefs->>'stale_relance')::boolean, true) = true
    and not exists (
      select 1 from crm_activities a
      where a.deal_id = d.id and a.created_at > now() - make_interval(days => p_days)
    )
    and not exists (
      select 1 from crm_activities a2
      where a2.deal_id = d.id and a2.completed_at is null
        and a2.metadata->>'automation' = 'relance'
    );
$function$
;

-- ============================================================
-- FUNCTION: bump_crm_contact_engagement(contact_uuid uuid, delta integer)
-- ============================================================
CREATE OR REPLACE FUNCTION public.bump_crm_contact_engagement(contact_uuid uuid, delta integer)
 RETURNS void
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  UPDATE crm_contacts
     SET engagement_score = COALESCE(engagement_score, 0) + delta,
         last_engagement_at = now()
   WHERE id = contact_uuid;
$function$
;

-- ============================================================
-- FUNCTIONS: refresh stats / counts (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.refresh_email_campaign_stats(campaign_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.email_campaigns
  SET
    sent_count      = (SELECT COUNT(*) FROM public.email_sends WHERE campaign_id = campaign_uuid AND status IN ('sent', 'delivered', 'opened', 'clicked', 'replied')),
    delivered_count = (SELECT COUNT(*) FROM public.email_sends WHERE campaign_id = campaign_uuid AND status IN ('delivered', 'opened', 'clicked', 'replied')),
    opened_count    = (SELECT COUNT(*) FROM public.email_sends WHERE campaign_id = campaign_uuid AND opened_at IS NOT NULL),
    clicked_count   = (SELECT COUNT(*) FROM public.email_sends WHERE campaign_id = campaign_uuid AND clicked_at IS NOT NULL),
    bounced_count   = (SELECT COUNT(*) FROM public.email_sends WHERE campaign_id = campaign_uuid AND status = 'bounced'),
    failed_count    = (SELECT COUNT(*) FROM public.email_sends WHERE campaign_id = campaign_uuid AND status = 'failed'),
    replied_count   = (SELECT COUNT(*) FROM public.email_sends WHERE campaign_id = campaign_uuid AND replied_at IS NOT NULL),
    updated_at      = NOW()
  WHERE id = campaign_uuid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_prospect_list_counts(list_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.prospect_lists
  SET
    contacts_count = (SELECT COUNT(*) FROM public.prospect_contacts WHERE list_id = list_uuid),
    email_count    = (SELECT COUNT(*) FROM public.prospect_contacts WHERE list_id = list_uuid AND email IS NOT NULL),
    phone_count    = (SELECT COUNT(*) FROM public.prospect_contacts WHERE list_id = list_uuid AND phone IS NOT NULL),
    opt_out_count  = (SELECT COUNT(*) FROM public.prospect_contacts WHERE list_id = list_uuid AND opt_out = true),
    updated_at     = NOW()
  WHERE id = list_uuid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_sms_campaign_stats(campaign_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.sms_campaigns
  SET
    sent_count       = (SELECT COUNT(*) FROM public.sms_sends WHERE campaign_id = campaign_uuid AND status IN ('sent', 'delivered')),
    delivered_count  = (SELECT COUNT(*) FROM public.sms_sends WHERE campaign_id = campaign_uuid AND status = 'delivered'),
    failed_count     = (SELECT COUNT(*) FROM public.sms_sends WHERE campaign_id = campaign_uuid AND status IN ('failed', 'undelivered')),
    actual_cost_eur  = COALESCE((SELECT SUM(cost_eur) FROM public.sms_sends WHERE campaign_id = campaign_uuid), 0),
    updated_at       = NOW()
  WHERE id = campaign_uuid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trigger_refresh_list_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_prospect_list_counts(OLD.list_id);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' AND OLD.list_id != NEW.list_id THEN
    PERFORM public.refresh_prospect_list_counts(OLD.list_id);
    PERFORM public.refresh_prospect_list_counts(NEW.list_id);
    RETURN NEW;
  ELSE
    PERFORM public.refresh_prospect_list_counts(NEW.list_id);
    RETURN NEW;
  END IF;
END;
$function$
;

-- ============================================================
-- FUNCTIONS: compteurs email_sends / forms (SECURITY DEFINER pour les webhooks/public)
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_email_send_clicks(send_id uuid)
 RETURNS void LANGUAGE sql SET search_path TO 'public', 'pg_temp'
AS $function$
  UPDATE email_sends SET clicks_count = COALESCE(clicks_count, 0) + 1, clicked_at = COALESCE(clicked_at, now()) WHERE id = send_id;
$function$
;
CREATE OR REPLACE FUNCTION public.increment_email_send_opens(send_id uuid)
 RETURNS void LANGUAGE sql SET search_path TO 'public', 'pg_temp'
AS $function$
  UPDATE email_sends SET opens_count = COALESCE(opens_count, 0) + 1, opened_at = COALESCE(opened_at, now()) WHERE id = send_id;
$function$
;
CREATE OR REPLACE FUNCTION public.increment_form_submission_count(p_form_id uuid)
 RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $function$
  UPDATE public.forms SET submission_count = submission_count + 1 WHERE id = p_form_id;
$function$
;
CREATE OR REPLACE FUNCTION public.increment_form_view_count(p_form_id uuid)
 RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $function$
  UPDATE public.forms SET view_count = view_count + 1 WHERE id = p_form_id;
$function$
;

-- ============================================================
-- FUNCTIONS: warmup peer pool counters (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.bump_warmup_peer_clicked(peer_id uuid)  RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp' AS $function$ BEGIN UPDATE warmup_peer_pool SET total_clicked = total_clicked + 1 WHERE id = peer_id; END; $function$;
CREATE OR REPLACE FUNCTION public.bump_warmup_peer_opened(peer_id uuid)   RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp' AS $function$ BEGIN UPDATE warmup_peer_pool SET total_opened = total_opened + 1 WHERE id = peer_id; END; $function$;
CREATE OR REPLACE FUNCTION public.bump_warmup_peer_received(peer_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp' AS $function$ BEGIN UPDATE warmup_peer_pool SET total_received = total_received + 1 WHERE id = peer_id; END; $function$;
CREATE OR REPLACE FUNCTION public.bump_warmup_peer_replied(peer_id uuid)  RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp' AS $function$ BEGIN UPDATE warmup_peer_pool SET total_replied = total_replied + 1 WHERE id = peer_id; END; $function$;
CREATE OR REPLACE FUNCTION public.bump_warmup_peer_sent(peer_id uuid)     RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp' AS $function$ BEGIN UPDATE warmup_peer_pool SET total_sent = total_sent + 1 WHERE id = peer_id; END; $function$;

-- ============================================================
-- FUNCTIONS: triggers "updated_at" (génériques)
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()            RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $function$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;
CREATE OR REPLACE FUNCTION public.forms_set_updated_at()                RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $function$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$;
CREATE OR REPLACE FUNCTION public.teams_set_updated_at()                RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $function$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$;
CREATE OR REPLACE FUNCTION public.touch_warmup_peer_pool_updated_at()   RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $function$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$;
CREATE OR REPLACE FUNCTION public.update_app_settings_updated_at()      RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $function$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;
CREATE OR REPLACE FUNCTION public.update_auto_blog_posts_updated_at()   RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $function$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;
CREATE OR REPLACE FUNCTION public.update_auto_changelog_updated_at()    RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $function$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;
CREATE OR REPLACE FUNCTION public.update_inbound_feedback_updated_at()  RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $function$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;
CREATE OR REPLACE FUNCTION public.update_publisher_credentials_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $function$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$;
