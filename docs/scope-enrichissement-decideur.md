# Scope — Enrichissement « Décideur » (Business+)

> Statut : **proposition à valider** · Auteur : assistant · Date : 2026-06
> Dépend de la cascade existante (`global-contacts` couche 0 → scrape → Serper).

## 1. Problème

L'enrichissement actuel renvoie surtout des emails **génériques** (`contact@`, `salon@`, `info@`). C'est :
- ✅ **le bon contact** pour les **commerces / TPE locales** (Google Places : salon, taxi, resto, véto…) — pas de C-suite.
- ❌ **peu de valeur** pour cibler des **entreprises avec décideurs** (PME/ETI), où joindre le CEO/CTO/Head of Marketing convertit bien mieux que `contact@`.

## 2. Objectif

Ajouter un **mode d'enrichissement « Décideur »** qui, pour un prospect donné, tente de trouver le **contact nominatif d'un décideur** (rôle au choix), **en plus** (pas à la place) de l'email générique.

- **Segment commerces** → comportement inchangé (générique vérifié = OK).
- **Segment entreprises** → couche décideur activée.
- **Gating : plan Business et plus** (Pro/Free = enrichissement générique seul).

## 3. Où ça s'insère dans la cascade

Cascade actuelle : `global_contacts (couche 0)` → `scrape` → `serper`.

Cascade cible (mode décideur activé, prospect avec domaine) :

```
0. global_contacts  (cache mutualisé — domaine + rôle)   ← lookup décideur d'abord
1. scrape           (générique, gratuit — gardé tel quel)
2. serper email     (générique Google — gardé)
── si mode décideur ON & plan Business+ ──
3. décideur :       domaine → personne+rôle (Serper LinkedIn) → email pattern → vérif MX/SMTP
```

→ Le générique reste TOUJOURS récupéré (valeur de base). Le décideur est une **surcouche**.

## 4. Algorithme « étape décideur »

Entrée : `{ domain, companyName, role }` (role ∈ **direction | marketing | commercial | rse | rh** — décidé).

Mots-clés Serper par rôle :
- **direction** : "CEO" OR "Fondateur" OR "Co-fondateur" OR "Gérant" OR "Président" OR "Directeur général" OR "Dirigeant"
- **marketing** : "CMO" OR "Directeur marketing" OR "Responsable marketing" OR "Head of Marketing" OR "Growth"
- **commercial** : "Directeur commercial" OR "Sales" OR "Responsable commercial" OR "Business Developer" OR "Head of Sales"
- **rse** : "RSE" OR "Responsable RSE" OR "Développement durable" OR "Sustainability" OR "QSE"
- **rh** : "DRH" OR "Directeur des ressources humaines" OR "Responsable RH" OR "Talent" OR "People"

1. **Cache** : `lookupDecisionMaker({ domain, role })` dans `global_contacts` (clé domaine+role). Hit frais → servir, 0 crédit.
2. **Trouver la personne** : Serper `site:linkedin.com/in "<companyName>" <mots-clés rôle>` (ex direction → "CEO" OR "Fondateur" OR "Gérant" OR "Directeur"). Parser nom + titre depuis les snippets/titres.
3. **Dériver l'email** : à partir de `prenom`/`nom` + `domain`, générer les patterns probables :
   `prenom.nom@`, `pnom@`, `prenom@`, `nom@`, `prenom-nom@` (+ variantes sans accents).
4. **Vérifier** : MX + SMTP (réutilise la logique de la page Vérification) → ne garder QUE les emails vérifiés (sinon bounce). Score de confiance = (pattern rang × résultat SMTP).
5. **Write-back** : `upsertDecisionMaker` dans `global_contacts` (même cadre `GLOBAL_POOL_WRITE` que l'existant).
6. **Fallback** : si rien de vérifié → on garde le générique (pas d'email deviné non vérifié servi comme « décideur »).

## 5. Modèle de données

Option retenue : **étendre `global_contacts`** (ne pas créer une table parallèle) avec un niveau personne.

Colonnes à ajouter (nullable, rétro-compatible) :
- `contact_type text default 'generic'`  — `'generic'` | `'decision_maker'`
- `role text`            — direction | tech | marketing | commercial | rh
- `full_name text`
- `title text`           — intitulé brut LinkedIn
- `linkedin_url text`
- `confidence smallint`  — 0-100 (pattern + vérif SMTP)

Clé de lookup décideur : `(domain, role, contact_type='decision_maker')`.
> Sur les **prospects** (table `prospects`), ajouter `contact_role text` + `contact_name text` (affichage colonne). `email_method` gagne la valeur `'decision_maker'`.

## 6. RGPD ⚠️ (à cadrer avec juridique)

- Email **nominatif** B2B = donnée personnelle → base légale **intérêt légitime** + finalité prospection B2B + **opt-out** (déjà en place via `opt_out_list`, à checker AVANT de servir/écrire un contact décideur).
- Mention d'information + droit d'opposition : déjà couverts par `/opt-out` et la politique de confidentialité (à compléter d'une ligne « contacts décideurs »).
- **Ne jamais** stocker de donnée sensible (uniquement nom + rôle pro + email pro + URL LinkedIn publique).
- Cache mutualisé : garder `GLOBAL_POOL_WRITE='volia_only'` tant que le cadre client n'est pas validé.

## 7. Quota & coût — DÉCIDÉ

**Pas de compteur séparé.** Un enrichissement décideur **compte comme 1 enrichissement** (même `enrichments` que le générique) — on ajoute juste la *profondeur* de recherche. Comme cette profondeur coûte plus cher (Serper LinkedIn + vérifs SMTP), on **abaisse le quota Business** pour absorber le coût :

- **Business : 10 000 → 6 000 enrichissements / mois** (un seul compteur, générique + décideur confondus).
- Free/Solo/Pro : quotas inchangés ; le **mode décideur reste verrouillé** (gating plan), ils gardent l'enrichissement générique.
- Enterprise : inchangé (volume élevé / illimité).

> ⚠️ Le passage 10 000 → 6 000 s'applique **au lancement de la feature** (sinon on nerferait Business sans contrepartie). À faire dans le même déploiement que la feature.

- Gating technique : nouveau flag `unlocksDecisionMaker: true` (Business+) dans `plans.js`, vérifié dans l'API + l'UI (même pattern que le serveur MCP Business-only). Le toggle « décideur » est ignoré/verrouillé hors Business.

## 8. UI (dashboard, vue Prospection)

- Sélecteur **« Trouver le décideur »** (toggle) + **rôle cible** (Direction / Tech / Marketing / Commercial / RH) à côté de « Enrichir tout ».
- Verrou + CTA upgrade pour les non-Business (même UX que CRM/Campagnes).
- Colonnes table : `Contact` (nom) + `Rôle` + badge `Décideur` sur l'email (`email_method='decision_maker'`).
- Aperçu de confiance (vérifié SMTP vs probable).

## 9. Découpage

- **MVP** : les **5 rôles** (direction / marketing / commercial / rse / rh), **emails vérifiés uniquement** (zéro-bounce), **Serper LinkedIn** seule source, gating **Business**. Sur les prospects avec domaine + nom. Réutilise Serper + vérif MX/SMTP existante. Quota Business 10k→6k au lancement.
- **V2** : cache décideur dans `global_contacts` (économie Serper), colonne UI + badge, score de confiance affiné, choix multi-rôles en 1 passe.
- **V3** : multi-personnes par boîte, connecteur tiers (Apollo/people-DB) en option, export enrichi.

## 10. Coordination

⚠️ La couche `global_contacts` est en cours de construction par une autre session. **À aligner avant code** : le niveau « personne/rôle » doit être ajouté **dans** ce modèle (section 5), pas dans une table concurrente.

## 11. Décisions actées (2026-06)

1. **Quota** : pas de compteur séparé — même décompte que le générique ; **Business 10 000 → 6 000 enrichissements/mois** (au lancement).
2. **Rôles MVP** : **direction + marketing + commercial + rse + rh** (les 5).
3. **Vérif** : **emails vérifiés uniquement** (zéro-bounce) — pas de « probable » servi.
4. **Source** : **Serper LinkedIn seule** au MVP (porte ouverte pour Apollo/people-DB en V3).

## 12. Plan de build (séquencement)

⚠️ Le cœur (cascade, `global_contacts`, `enrich-waterfall-core`, `enrichment-jobs`) est **en cours de réécriture par l'autre session**. Pour éviter les collisions :

- **Étape A — sans collision (faisable maintenant)** : `src/lib/decision-maker-core.js` (module autonome : map rôles, recherche personne Serper, dérivation patterns email, hook de vérif) — pur, non câblé, ne touche aucun fichier de l'autre session. ✅ **FAIT**
- **Étape B — à coordonner** : extension schéma `global_contacts` (niveau personne) + insertion de l'étape dans la cascade + `plans.js` (flag `unlocksDecisionMaker` + quota 6k) + UI toggle/colonne. À faire **une fois la cascade de l'autre session stabilisée**. ✅ **FAIT** (cascade stable 17h, 0 client Business impacté par le quota).

## 13. Étape B — livré (2026-06)

- **Migration** `decision_maker_person_columns` : `global_contacts` (+ contact_type/role/full_name/title/linkedin_url/confidence, additif & nullable) + `prospects` (+ contact_name/contact_role). N'altère NI la contrainte `UNIQUE(domain)` NI l'`upsertGlobalContact` générique.
- **`src/lib/email-verify.js`** (nouveau) : `verifyEmailRaw` + `isEmailDeliverable` (zéro-bounce = MillionVerifier `ok`). `/api/verify-emails` refactoré pour l'utiliser (comportement identique).
- **`/api/enrich-waterfall`** : étape décideur AVANT couche 0 (priorité au contact nominatif), gatée `unlocksDecisionMaker` + rôle valide + domaine. Compte 1 enrichissement. Best-effort → retombe sur le générique si rien de vérifié.
- **`plans.js`** : `unlocksDecisionMaker: true` (business/enterprise_legacy/enterprise), Business `enrichments_per_month` 10 000 → **6 000**, libellés features MAJ.
- **UI** : toggle « Décideur » + sélecteur de rôle à côté d'« Enrichir tout » (verrou + lien /pricing hors Business), badge `Décideur` sur l'email, nom+rôle du contact affiché sous l'email. Persistance `contact_name`/`contact_role`.

## 14. V2 — livré (2026-06)

- **Cache décideur** : table **dédiée** `decision_maker_contacts` (clé `(domain, role)`, RLS service-role) au lieu d'étendre `global_contacts` — évite de toucher la contrainte `UNIQUE(domain)` et l'upsert générique de l'autre session (les 6 colonnes ajoutées au MVP sur `global_contacts` ont été retirées). `lookupDecisionMaker`/`upsertDecisionMaker` (TTL 3 ans + opt-out + `GLOBAL_POOL_WRITE`). Câblé dans la route : couche 0 décideur (cache → 0 crédit Serper) avant le live, write-back après une recherche réussie.
- **Colonne « Contact (décideur) »** togglable dans le sélecteur de colonnes (défaut visible, même pour les configs sauvegardées) — remplace l'affichage inline sous l'email.
- **Export CSV enrichi** : colonnes `contact_decideur` + `role_decideur` (+ `COLS` du chargement prospects étendu).
- **Ligne RGPD** : section 4 de `/confidentialite` complétée (contacts décideurs, finalité B2B, droit d'opposition /opt-out).

### Reste V3 (non bloquant)
- Choix multi-rôles en une passe ; multi-personnes par boîte ; connecteur tiers (Apollo/people-DB) en option.
