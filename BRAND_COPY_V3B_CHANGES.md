# Brand Copy V3-B — Péripheriques

Worktree : `worktree-agent-a58dc6cdaa75ffb53`
Date : 2026-05-27

## Objectif

Finaliser le sprint V2 en touchant les chaînes périphériques laissées en
TODO V3 :

- ~30 empty states résiduels (CRM details, forms builder, modals, admin
  prospection).
- Microcopy admin dashboard interne (`/admin`) — ton "admin Anthony"
  plus direct/geek car c'est pour ses yeux.
- Newsletter mensuelle (`newsletterMonthlyEmail`) — refonte subject +
  structure 3 blocs (produit / chiffre / action).

Scope strict : uniquement chaînes de texte. Pas de className/structure.

## Files modifiés

### Empty states résiduels (CRM, forms, modals, admin)

- `src/components/OverviewPanel.jsx`
  - "Aucune donnee" → "Pas de donnée encore."
  - "Aucun enrichissement effectue" → "Pas d'enrichissement encore. Tes prochaines recherches le rempliront."
  - "Lancez une recherche pour voir la qualite" → "Lance une recherche. La qualité s'affichera ici."
- `src/components/crm/DealDetailDrawer.jsx`
  - "Aucun contact lié" → "Pas de contact lié. Ajoutes-en un pour suivre l'historique."
- `src/components/crm/CustomFieldsSection.jsx`
  - "Aucun champ personnalisé." → "Pas encore de champ perso. Ajoutes-en si t'as besoin de tracker autre chose."
- `src/components/crm/KanbanBoard.jsx`
  - "Aucun deal" + "+ Créer" → "Vide. + Créer un deal"
- `src/components/crm/AddToCampagneModal.jsx`
  - "Aucun contact sélectionné." → "Sélectionne au moins un contact d'abord."
  - "Aucune liste disponible." → "Pas encore de liste. Crées-en une au-dessus."
- `src/components/lists/ImportFromCrmModal.jsx`
  - "Aucun contact CRM pour « X »." → "Personne dans ton CRM pour « X »."
- `src/components/lists/ImportFromProspectionModal.jsx`
  - "Aucune recherche encore." → "Pas encore de recherche."
- `src/components/campagnes/TemplateLibraryModal.jsx`
  - "Aucun template ne correspond." → "Aucun template ne matche. Élargis la recherche."
- `src/components/resources/ResourcesGrid.jsx`
  - "Aucune ressource ne correspond à cette recherche." → "Aucune ressource ne matche. Essaye un autre mot."
- `src/components/forms/FormRenderer.jsx`
  - "Aucun champ sur cette page." → "Page vide."
- `src/components/forms/builder/LogicOverview.jsx`
  - "Aucune page." → "Pas de page."
  - "Aucun champ sur cette page." → "Page vide."
- `src/components/forms/builder/ConditionsBuilder.jsx`
  - "Aucun champ disponible…" → "Pas de champ dispo. Ajoutes-en un autre pour configurer une condition."
- `src/app/admin/prospection/sms/[id]/page.js`
  - "Aucun envoi pour le moment." → "Pas encore d'envoi."
- `src/app/admin/prospection/campaigns/[id]/page.js`
  - "Aucun envoi pour le moment." → "Pas encore d'envoi."
- `src/app/admin/prospection/lists/[id]/page.js`
  - "Aucun contact pour cette recherche." → "Personne avec ce filtre."
- `src/app/admin/prospection/templates/page.js`
  - "Aucun template ne correspond." → "Aucun template ne matche. Élargis la recherche."
- `src/app/admin/prospection/sequences/[id]/page.js`
  - "Aucun contact enrôlé…" → "Personne d'enrôlé pour l'instant. Clique sur Démarrer pour enrôler la liste."
- `src/app/admin/forms/templates/page.js`
  - "Aucun template ne correspond à votre recherche." → "Aucun template ne matche. Essaye un autre mot."
- `src/app/admin/forms/[id]/analytics/page.js`
  - "Aucune source enregistrée." → "Pas encore de source enregistrée."
- `src/app/admin/forms/stats/page.js`
  - "Pas encore de stats à afficher" → "Pas encore de stats."
- `src/app/admin/design-system/page.js`
  - Empty state demo : "Aucun résultat" → "Rien à afficher" + sous-texte adapté

### Admin dashboard interne (`src/app/admin/page.js`)

Ton "admin Anthony" — direct, geek, pas de tutoiement formel inutile.

- "Aucune donnee" (Sources enrichissement) → "Vide pour ce mois."
- "Aucun appel API enregistre ce mois…" → "Pas encore d'appel API ce mois. Les coûts apparaîtront ici."
- "Aucune activite ce mois" → "Personne d'actif ce mois."
- "Aucun utilisateur trouve" → "Personne ne matche ta recherche."
- "Donnees actualisees" → "Données refresh."
- "Action effectuee" → "OK."
- "Erreur" / "Erreur reseau" → "Ça plante." / "Réseau cassé."
- "Impossible de charger les statistiques" → "Stats injoignables."

### Newsletter mensuelle (`src/lib/emailTemplates.js`)

- Subject : `📬 Volia · L'édition X · Y` → `X chez Volia : 3 trucs à savoir`
- Hero greeting refondu : direct, sans "Voici le meilleur du mois pour
  booster votre prospection B2B".
- Structure resserrée : 3 blocs labellisés
  - "Quoi de neuf" (article du mois)
  - "Chiffre du mois"
  - "À télécharger" (ressource)
- Footer : signature Anthony founder + désabonnement clean ("Se
  désinscrire en 1 clic." → "Plus envie ? Un clic, c'est fini.")

## Build

`npm run build` à valider en fin de sprint.
