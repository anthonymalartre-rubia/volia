-- ============================================================================
-- 30/07/2026 — Ferme l'accès PUBLIC sur api_usage_log / api_usage_monthly
-- ============================================================================
-- CONSTAT (test empirique avec la clé anon, 30/07/2026) :
--   GET /rest/v1/api_usage_log?select=*      → HTTP 206, 1 ligne renvoyée
--   GET /rest/v1/api_usage_monthly?select=*  → HTTP 206, 1 ligne renvoyée
-- Toutes les autres tables sensibles testées le même jour (opt_out_list,
-- newsletter_subscribers, resource_leads, global_contacts, prospects,
-- user_profiles, email_senders, crm_contacts) renvoient bien 0 ligne.
--
-- CAUSE : les deux policies s'appellent « Service role full access » mais sont
-- accordées TO public avec USING (true) WITH CHECK (true). Or le service role
-- CONTOURNE RLS par conception — il n'a jamais eu besoin d'une policy. Ces deux
-- lignes n'ouvraient donc rien d'utile, seulement l'accès à anon et authenticated,
-- en lecture ET en écriture (FOR ALL + WITH CHECK (true)).
--
-- CE QUI FUIT : aucun nom ni email (ces tables n'en contiennent pas), mais
--   - le détail des coûts d'API (service, endpoint, cost_cents),
--   - les user_id (UUID) associés,
--   - depuis le 30/07/2026, le verdict de chaque vérification d'email
--     (verify/ok, verify/catch_all…) — donc la qualité réelle de la donnée.
-- Autrement dit : du renseignement économique sur Volia, lisible par quiconque
-- possède la clé anon, laquelle est publique par nature (NEXT_PUBLIC_*).
--
-- CORRECTIF : supprimer les deux policies. RLS reste ACTIVÉ sur les deux tables,
-- donc sans policy : anon et authenticated ne voient plus rien, tandis que le
-- service role (crons, routes serveur, trackApiCall) continue d'écrire et de
-- lire normalement puisqu'il n'est pas soumis à RLS.
--
-- IMPACT ATTENDU CÔTÉ APP : nul. Aucun composant client ne lit ces tables —
-- l'admin passe par /api/admin/* en service role.
-- ============================================================================

DROP POLICY IF EXISTS "Service role full access on api_usage_log" ON public.api_usage_log;
DROP POLICY IF EXISTS "Service role full access on api_usage_monthly" ON public.api_usage_monthly;

-- Ceinture et bretelles : on s'assure que RLS est bien actif (il l'était déjà).
ALTER TABLE public.api_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_monthly ENABLE ROW LEVEL SECURITY;
