# Base de données Volia — schéma versionné

> Créé le **02/07/2026** (Étape 0 du plan de refactorisation, finding **H1** de l'audit).
> Avant ça : **0 migration SQL dans le repo** — le schéma, les policies RLS et le
> moteur de crédits ne vivaient que dans Supabase, appliqués « à la volée » via MCP.
> Un incident RLS documenté (`src/lib/usage.js:15-19`) avait déjà cassé les compteurs
> **en silence** parce que la policy n'existait nulle part dans le code.

## Arborescence

```
supabase/
├── README.md                         ← ce fichier (discipline + procédure)
├── schema/                           ← SNAPSHOT de référence de la prod (02/07/2026)
│   ├── 01_functions.sql              ← 30 fonctions dont ⭐ increment_usage_atomic (moteur de crédits),
│   │                                    consume/add_purchased_credits, freeze_privileged_profile_columns
│   ├── 02_rls_policies.sql           ← 123 policies RLS (isolation multi-tenant, reviewable enfin)
│   └── 03_triggers_indexes.sql       ← 16 triggers + ~260 index
└── migrations/                       ← migrations INCRÉMENTALES futures (vide au départ)
    └── (à venir : <timestamp>_<nom>.sql)
```

## Rôle des deux dossiers

- **`schema/`** = **photographie de l'état prod au 02/07/2026**, pour la **revue** et la
  **reproductibilité**. ⚠️ **Ne pas rejouer tel quel contre la prod** : ces objets y
  existent déjà (les `CREATE POLICY` échoueraient sur doublon). C'est un document de
  référence, régénérable (voir plus bas).
- **`migrations/`** = **tout changement DB futur**. Un fichier SQL par migration,
  **commité AVANT application**.

## LA RÈGLE (discipline go-forward)

> **Aucun changement de schéma, de policy RLS, de fonction ou de trigger ne part en
> prod sans un fichier SQL commité dans `supabase/migrations/` d'abord.**

Concrètement, pour toute évolution DB :
1. Écrire la migration dans `supabase/migrations/<AAAAMMJJHHMMSS>_<nom>.sql`.
2. La faire relire (diff PR) — c'est le point que l'audit réclamait : un `ALTER`/`DROP`
   ou une policy ne doit plus être invisible.
3. L'appliquer (via le MCP Supabase `apply_migration`, ou `supabase db push` si le
   projet est lié).
4. Après application, régénérer le snapshot `schema/` si l'objet touché y figure.

## Ce qui manque encore dans ce snapshot : le DDL exact des 82 tables

Le snapshot capture les objets **comportementaux** (fonctions, RLS, triggers, index) —
c'est le cœur de ce que l'audit voulait rendre reviewable. Le **DDL exact des colonnes
des 82 tables** (`CREATE TABLE ... (col type, ...)` avec defaults/FK) n'y est pas :
sa capture byte-perfecte passe par `supabase db dump`, qui exige de **lier le projet**
avec des identifiants (token d'accès + mot de passe DB) — action **Anthony** (je ne
peux pas saisir de credentials).

Pour compléter quand tu veux un dump complet :

```bash
supabase login                              # ou export SUPABASE_ACCESS_TOKEN=...
supabase link --project-ref kqrarrrojdtxijkhejhg
supabase db dump --schema public -f supabase/schema/00_tables.sql   # DDL tables complet
# (db dump peut aussi régénérer functions/policies/triggers/index d'un coup)
```

Les 82 tables sont listables et leurs colonnes consultables à tout moment via le MCP
Supabase (`list_tables`) ou le dashboard — donc l'absence de DDL de table n'est pas
bloquante au quotidien, contrairement au moteur de crédits/RLS qui, eux, sont désormais
dans le repo.

## Points d'attention relevés à l'extraction (à traiter dans le plan de refacto)

- **`user_profiles.anyone_update_own`** est `FOR UPDATE ... USING (auth.uid()=id)`
  **sans `WITH CHECK`** → un client pourrait modifier `is_admin`/`plan`. C'est
  **neutralisé** par le trigger `freeze_privileged_profile_columns`. À terme : ajouter
  un `WITH CHECK` explicite plutôt que de dépendre du trigger (défense en profondeur).
- **`usage_tracking`** n'a **aucune policy INSERT/UPDATE** : l'écriture des compteurs
  ne marche qu'en **service-role**. Tout nouveau code qui écrit l'usage avec le client
  user échouera **silencieusement** (c'est l'incident historique). Documenté ici pour
  que ce ne soit plus une surprise.
- Prices Stripe **partagés** entre plans (Solo↔Prospection, Business↔MAX) : le mapping
  `price→plan` dépend de l'ordre des clés de `plans.js` — cf. findings H4 de l'audit.
