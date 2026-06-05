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

Entrée : `{ domain, companyName, role }` (role ∈ direction | tech | marketing | commercial | rh).

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

## 7. Quota & coût

- Étape décideur = **+1 à +2 appels Serper** + N vérifs SMTP par prospect → bien plus cher que le scrape.
- Compteur dédié : **`decision_maker_enrichments`** (séparé de `enrichments`) dans `usage_tracking` + limites par plan dans `plans.js` :
  - Free/Solo/Pro : 0 (feature verrouillée).
  - Business : quota (ex. 1 000 / mois) — à définir.
  - Enterprise : illimité ou volume élevé.
- Gating technique : réutiliser le pattern `unlocksModules` / un nouveau flag `unlocksDecisionMaker` dans `plans.js`, vérifié dans l'API + l'UI (comme le serveur MCP Business-only).

## 8. UI (dashboard, vue Prospection)

- Sélecteur **« Trouver le décideur »** (toggle) + **rôle cible** (Direction / Tech / Marketing / Commercial / RH) à côté de « Enrichir tout ».
- Verrou + CTA upgrade pour les non-Business (même UX que CRM/Campagnes).
- Colonnes table : `Contact` (nom) + `Rôle` + badge `Décideur` sur l'email (`email_method='decision_maker'`).
- Aperçu de confiance (vérifié SMTP vs probable).

## 9. Découpage

- **MVP** : 1 rôle « Direction » (CEO/Fondateur/Gérant) — le plus universel — sur les prospects avec domaine + nom. Réutilise Serper + vérif MX existante. Gating Business.
- **V2** : multi-rôles (tech/marketing/commercial/RH), cache décideur dans `global_contacts`, colonne UI, quota dédié.
- **V3** : score de confiance affiné, multi-personnes par boîte, export enrichi.

## 10. Coordination

⚠️ La couche `global_contacts` est en cours de construction par une autre session. **À aligner avant code** : le niveau « personne/rôle » doit être ajouté **dans** ce modèle (section 5), pas dans une table concurrente.

## 11. Questions ouvertes (à trancher)

1. Quota Business mensuel pour `decision_maker_enrichments` ? (proposition : 1 000/mois)
2. Rôles exposés au MVP : juste « Direction », ou direction+marketing+commercial dès le départ ?
3. Servir un email décideur **non vérifié** (probable) avec badge « probable », ou **uniquement vérifié** (politique zéro-bounce) ? (reco : uniquement vérifié)
4. Source personne : Serper LinkedIn uniquement (MVP), ou prévoir un connecteur Apollo/people-DB plus tard ?
