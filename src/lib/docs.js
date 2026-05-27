// ─────────────────────────────────────────────────────────────────────
// docs.js — Help Center data (catégories + articles)
// ─────────────────────────────────────────────────────────────────────
// Source unique de vérité pour /docs et /docs/[slug].
// Format markdown léger (h2/h3/listes/code/liens/bold) rendu par le
// même moteur inline que /blog (cf. src/app/blog/[slug]/page.js).
//
// Convention :
//   - slug = kebab-case (matche [slug] route)
//   - category = id d'une catégorie de DOCS_CATEGORIES
//   - content = markdown (intro courte + étapes + FAQ + related)
//   - updatedAt = ISO date (affichée sur l'article)
//   - tags = string[] (utilisés pour le search côté client)
// ─────────────────────────────────────────────────────────────────────

export const DOCS_CATEGORIES = [
  {
    id: 'getting-started',
    label: 'Premiers pas',
    description: 'Ton compte, ta première recherche, en 5 min.',
    icon: 'Rocket',
    color: 'violet',
  },
  {
    id: 'prospection',
    label: 'Prospection',
    description: 'Comment trouver des leads B2B qui répondent.',
    icon: 'Search',
    color: 'violet',
  },
  {
    id: 'campagnes',
    label: 'Campagnes Email',
    description: 'Cold email qui atterrit en inbox, pas en spam.',
    icon: 'Mail',
    color: 'blue',
  },
  {
    id: 'crm',
    label: 'CRM',
    description: 'Pipeline, deals, activités. Sans config bullshit.',
    icon: 'KanbanSquare',
    color: 'emerald',
  },
  {
    id: 'api-integrations',
    label: 'API & Intégrations',
    description: 'API publique, webhooks, Zapier, Make. Exemples copy-paste.',
    icon: 'Plug',
    color: 'amber',
  },
  {
    id: 'compte',
    label: 'Compte & Facturation',
    description: 'Plans, Stripe, RGPD, comment supprimer ton compte.',
    icon: 'CreditCard',
    color: 'zinc',
  },
];

export const DOCS_ARTICLES = [
  // ─────────────────────────────────────────────────────────────────────
  // GETTING STARTED (6)
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'creer-compte',
    category: 'getting-started',
    title: 'Créer son compte Volia',
    description: "Tout ce qu'il faut pour démarrer en 60 secondes : email, Google OAuth, vérification.",
    updatedAt: '2026-05-12',
    tags: ['inscription', 'compte', 'oauth', 'google'],
    content: `## Démarrer en moins d'une minute

Volia est gratuit pour commencer : 100 prospects offerts, aucune carte bancaire demandée. Tu peux t'inscrire de deux manières.

### 1. Inscription par email

1. Va sur [volia.fr/signup](/signup).
2. Renseigne ton email professionnel et un mot de passe (12 caractères minimum).
3. Clique sur **Créer mon compte**.
4. Vérifie ta boîte mail : on t'envoie un lien de confirmation valable 24 h.
5. Clique sur le lien → tu arrives directement sur ton dashboard.

### 2. Inscription Google OAuth (recommandé)

1. Sur [volia.fr/signup](/signup), clique sur **Continuer avec Google**.
2. Choisis ton compte Google pro.
3. Accepte les permissions (email + profil — on ne touche jamais à ta boîte mail).
4. Compte créé, tu es loggé d'office.

![Capture inscription](/docs/screenshots/signup.png)

## Et après ?

- Suis l'[onboarding wizard](/docs/onboarding-wizard) (4 étapes guidées, 2 min).
- Lance ta [première recherche](/docs/premiere-recherche) de prospects.
- Active ton [essai Pro gratuit 14 jours](/docs/activer-trial-pro) si tu veux tester la cascade waterfall complète.

## FAQ rapide

**Email pas reçu ?** Vérifie tes spams. Si rien après 5 min, retente l'inscription — le système renvoie automatiquement le mail.
**Email pro vs Gmail ?** Aucune différence côté Volia, mais on recommande un email pro pour la délivrabilité de tes futures campagnes.
**Carte bancaire demandée ?** Jamais sur le plan gratuit. Uniquement au moment où tu passes Solo / Pro / Business.

## Articles liés

- [Onboarding wizard pas à pas](/docs/onboarding-wizard)
- [Comprendre les plans Volia](/docs/comprendre-plans)
- [Inviter mon équipe](/docs/inviter-equipe)
`,
  },
  {
    slug: 'onboarding-wizard',
    category: 'getting-started',
    title: "L'onboarding wizard pas à pas",
    description: "Les 4 étapes guidées qui configurent ton compte en 2 minutes.",
    updatedAt: '2026-05-12',
    tags: ['onboarding', 'setup', 'demarrage'],
    content: `## À quoi sert l'onboarding ?

Dès ta première connexion, Volia affiche un wizard en 4 étapes pour pré-configurer ton compte selon ton métier. Ça te fait gagner 10 minutes de réglages et garantit que tes premières recherches sont pertinentes.

## Les 4 étapes

### Étape 1 — Ton activité

Choisis ton secteur : **Agence**, **SaaS B2B**, **Services pro** (avocat, expert-comptable…), **Commerce / Restauration**, ou **Autre**. Cette info pré-remplit tes catégories de prospection favorites.

### Étape 2 — Ta zone géographique

Sélectionne tes départements cibles parmi les 101 (96 métropole + 5 outre-mer). Tu peux sélectionner une région entière en un clic. Modifiable à tout moment depuis chaque recherche.

### Étape 3 — Ton objectif principal

- **Trouver des prospects** (Prospection seule)
- **Envoyer des campagnes** (Prospection + Campagnes)
- **Tout-en-un growth** (Prospection + Campagnes + CRM)

Cette étape pré-active les modules correspondants dans le ModuleSwitcher en haut du dashboard.

### Étape 4 — Notifications

Choisis tes alertes email :
- Recherche terminée (recommandé)
- Limite mensuelle atteinte à 80 % (recommandé)
- Newsletter produit (mensuelle)

## Sauter l'onboarding

Tu peux fermer le wizard à tout moment en cliquant sur la croix en haut à droite. Les valeurs par défaut s'appliquent. Tu peux le relancer depuis **Paramètres → Préférences → Relancer l'onboarding**.

## FAQ rapide

**J'ai mal choisi mon secteur ?** Pas grave — tu peux changer toutes ces valeurs depuis l'onglet **Préférences**.
**Le wizard ne s'affiche pas ?** Il ne s'affiche qu'une fois. Pour le rejouer : Paramètres → Préférences → Relancer l'onboarding.

## Articles liés

- [Lancer ma première recherche](/docs/premiere-recherche)
- [Utiliser les 101 départements](/docs/utiliser-101-departements)
`,
  },
  {
    slug: 'premiere-recherche',
    category: 'getting-started',
    title: 'Lancer ma première recherche',
    description: "De la sélection à l'export CSV : ta première vague de prospects en 5 minutes.",
    updatedAt: '2026-05-12',
    tags: ['recherche', 'demarrage', 'prospection'],
    content: `## Objectif : 50 prospects qualifiés en 5 minutes

Pour ta première recherche, on te recommande de viser petit et précis. Voilà la marche à suivre.

### Étape 1 — Ouvre le module Prospection

Sur le dashboard, vérifie que le ModuleSwitcher (en haut à gauche) est sur **Prospection**.

### Étape 2 — Choisis une catégorie

Dans le panneau de gauche, déplie **B2B** ou **Copropriété** et coche **1 seule catégorie** pour ta première recherche (ex: *Avocat*, *Garage automobile*, *Salon de coiffure*).

### Étape 3 — Sélectionne 1 département

Clique sur **Sélection géographique** et coche un département de taille moyenne (ex: *33 - Gironde*, *44 - Loire-Atlantique*). Évite Paris pour ta première, ça génère beaucoup de résultats à traiter.

### Étape 4 — Lance

Clique sur **Lancer la recherche**. Volia interroge Google Places, puis lance la [cascade waterfall](/docs/cascade-waterfall-enrichissement) pour enrichir chaque entreprise avec son email.

### Étape 5 — Filtre & exporte

Une fois terminé, utilise les filtres (note Google, présence email…) puis clique **Exporter CSV** ou **Export Zoho CRM**.

## FAQ rapide

**Combien de temps ça prend ?** ~30 sec pour 50 entreprises, ~3 min pour 500.
**Pourquoi certains résultats n'ont pas d'email ?** Le site web est introuvable ou bloque le scraping. Active le [filtrage RGPD](/docs/filtrage-rgpd-emails-personnels) si tu veux n'exporter que les emails pro.
**Ça compte dans mon quota ?** Oui, chaque prospect enregistré décrémente ton quota mensuel.

## Articles liés

- [Cascade waterfall : comment Volia trouve les emails](/docs/cascade-waterfall-enrichissement)
- [Export CSV ou Zoho CRM](/docs/export-csv-zoho)
- [Recherche en langage naturel](/docs/recherche-langage-naturel)
`,
  },
  {
    slug: 'comprendre-plans',
    category: 'getting-started',
    title: 'Comprendre les plans Volia',
    description: "Free, Solo, Pro, Business : à qui s'adresse quoi et comment switcher.",
    updatedAt: '2026-05-12',
    tags: ['plans', 'pricing', 'limites', 'quota'],
    content: `## Vue d'ensemble

Volia propose 4 plans, tous facturables au mois ou à l'année (2 mois offerts en annuel).

| Plan | Prix | Prospects/mois | Idéal pour |
| --- | --- | --- | --- |
| **Free** | 0 € | 100 | Tester l'outil |
| **Solo** | 19 €/mo | 1 000 | Freelances, consultants |
| **Pro** | 49 €/mo | 5 000 | PME, agences |
| **Business** | 99 €/mo | 10 000 | Sales teams, scale-ups |

### Ce qui est inclus dans **tous** les plans

- 101 départements (métropole + outre-mer)
- 150+ catégories B2B
- Cascade waterfall multi-sources
- Filtrage RGPD emails personnels
- Export CSV + Zoho CRM
- Module Campagnes Email
- Module CRM

### Ce qui change avec le plan

- Le **quota mensuel** de prospects découverts (reset le 1er du mois).
- Le nombre de **domaines d'envoi** connectables (Free: 1, Solo: 2, Pro: 5, Business: illimité).
- Le **support** : email pour tous, prioritaire à partir de Pro.

## Changer de plan

1. Va sur **Paramètres → Plan & Usage**.
2. Clique sur le plan souhaité.
3. Tu es redirigé vers Stripe Checkout (CB, SEPA, virement).
4. Une fois payé, ton nouveau quota est actif immédiatement.

Plus de détails dans [Changer de plan](/docs/changer-plan).

## FAQ rapide

**Si je dépasse mon quota ?** Une modale "Limite atteinte" s'affiche et te propose un upgrade. Aucun prospect supplémentaire n'est ajouté tant que tu n'as pas upgradé ou attendu le 1er du mois.
**Le passage Free → payant est instantané ?** Oui, dès validation Stripe.
**Je peux downgrader ?** Oui, à tout moment depuis Paramètres → Plan. Effectif à la fin de la période payée.

## Articles liés

- [Changer de plan](/docs/changer-plan)
- [Annuler mon abonnement](/docs/annuler-abonnement)
- [Activer l'essai Pro 14 jours](/docs/activer-trial-pro)
`,
  },
  {
    slug: 'activer-trial-pro',
    category: 'getting-started',
    title: "Activer l'essai Pro 14 jours",
    description: "Comment tester Pro gratuitement sans carte bancaire (sous conditions).",
    updatedAt: '2026-05-12',
    tags: ['trial', 'essai', 'pro', 'gratuit'],
    content: `## Le trial Pro en pratique

Volia offre **14 jours d'essai Pro** (5 000 prospects + cascade waterfall complète + support prioritaire) à tout nouveau compte Free, sans carte bancaire.

## Comment l'activer

1. Sur ton dashboard, regarde la **TrialBanner** en haut.
2. Clique sur **Activer mes 14 jours Pro**.
3. C'est tout — aucun paiement, aucune CB demandée.

Ton compteur passe à 5 000 prospects pour 14 jours.

## Pendant le trial

- Tous les enrichissements premium (waterfall multi-sources) sont actifs.
- Tu peux connecter jusqu'à 5 domaines d'envoi.
- Le support prioritaire est activé (réponse < 4 h ouvrées).
- Le module CRM est complètement débloqué.

## À la fin du trial

À J+14, si tu n'as rien fait :
- Ton plan repasse en **Free** (100 prospects/mois).
- Tes prospects découverts pendant le trial restent dans ta base (jamais supprimés).
- Tes campagnes en cours continuent jusqu'à épuisement, mais tu ne peux plus en créer de nouvelles tant que tu es Free.

Pour rester Pro : Paramètres → Plan → Souscrire Pro 49 €/mo.

## FAQ rapide

**Je peux activer plusieurs trials ?** Non, 1 par compte / email / IP.
**Et si j'upgrade pendant le trial ?** Tu passes en payant immédiatement et tu n'as pas à attendre la fin.
**Mes données sont conservées ?** Oui, à vie tant que ton compte existe.

## Articles liés

- [Comprendre les plans](/docs/comprendre-plans)
- [Changer de plan](/docs/changer-plan)
`,
  },
  {
    slug: 'inviter-equipe',
    category: 'getting-started',
    title: 'Inviter mon équipe',
    description: "Workspaces partagés : invite tes collègues, partage prospects, campagnes et CRM.",
    updatedAt: '2026-05-12',
    tags: ['team', 'equipe', 'invitations', 'workspace'],
    content: `## Volia est multi-utilisateurs

À partir du plan **Pro**, tu peux inviter des membres dans ton workspace. Tous partagent la même base de prospects, les mêmes campagnes et le même pipeline CRM.

## Inviter un membre

1. Va sur **Paramètres → Équipe**.
2. Clique sur **+ Inviter un membre**.
3. Entre son email et son rôle :
    - **Admin** : tous les droits (sauf suppression du compte).
    - **Membre** : prospection, campagnes, CRM. Pas d'accès à la facturation.
    - **Lecteur** : lecture seule (utile pour un manager).
4. Envoie l'invitation. Le membre reçoit un email avec un lien valide 7 jours.

## Gérer les rôles

Depuis **Paramètres → Équipe**, tu peux changer le rôle d'un membre ou le retirer du workspace à tout moment. Ses prospects et campagnes restent dans le workspace.

## Quotas partagés

Le quota mensuel de prospects (5 000 pour Pro, 10 000 pour Business) est **partagé** entre tous les membres. Pas de quota individuel.

## FAQ rapide

**Combien de membres je peux inviter ?** Solo: 1 (toi), Pro: 5, Business: illimité.
**Un membre peut voir mes mots de passe SMTP / API ?** Non, les credentials des domaines d'envoi et clés API ne sont visibles que par les Admins.
**Et si je retire un membre ?** Ses sessions sont invalidées immédiatement et il perd tout accès au workspace.

## Articles liés

- [Comprendre les plans](/docs/comprendre-plans)
- [Clés API & sécurité](/docs/cles-api-securite)
`,
  },

  // ─────────────────────────────────────────────────────────────────────
  // PROSPECTION (8)
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'lancer-recherche-google-places',
    category: 'prospection',
    title: 'Lancer une recherche via Google Places',
    description: "Comment Volia utilise Google Places (New) pour identifier toutes les entreprises d'une zone.",
    updatedAt: '2026-05-12',
    tags: ['google places', 'recherche', 'departement', 'categorie'],
    content: `## Le moteur de Volia Prospection

Volia s'appuie sur **Google Places API (New)** pour trouver les entreprises. C'est la base de données la plus à jour pour les commerces et services locaux français (mise à jour quotidienne par Google).

## Comment lancer une recherche

1. Ouvre **Prospection** dans le ModuleSwitcher.
2. Dans le panneau gauche :
    - Coche une ou plusieurs **catégories** (ex: *Avocat*, *Restaurant*).
    - Sélectionne tes **départements** (1 ou plusieurs, jusqu'à 101).
3. Clique sur **Lancer la recherche**.

Volia interroge Google Places pour chaque combinaison catégorie × département, puis lance la [cascade waterfall](/docs/cascade-waterfall-enrichissement) pour récupérer les emails.

## Combien de résultats par recherche ?

Google Places limite à **60 résultats par requête**. Pour maximiser la couverture, Volia découpe automatiquement les grandes villes en quartiers (recherche par grid). Tu peux donc obtenir 200-500 entreprises par département pour les catégories denses (restaurants, garages).

## Données collectées

Pour chaque entreprise :
- Nom, adresse, téléphone
- Site web (si connu)
- Note Google + nombre d'avis
- Catégorie
- Place ID (identifiant unique Google)

L'email arrive ensuite via la [cascade waterfall](/docs/cascade-waterfall-enrichissement).

## FAQ rapide

**Volia est-il limité par les quotas Google ?** Oui, mais on a notre propre clé Google Places avec un quota élevé. Tu ne devrais jamais voir d'erreur quota.
**Données à jour ?** Oui, Google met à jour quotidiennement les fiches Places.
**Couverture France ?** Excellente sur les 101 départements (métropole + DOM-TOM).

## Articles liés

- [Cascade waterfall : trouver les emails](/docs/cascade-waterfall-enrichissement)
- [Utiliser les 101 départements](/docs/utiliser-101-departements)
- [Recherche multi-critères](/docs/recherche-multi-criteres)
`,
  },
  {
    slug: 'cascade-waterfall-enrichissement',
    category: 'prospection',
    title: "Cascade waterfall : comment Volia trouve les emails",
    description: "Scraping intelligent → Google via Serper → fallback patterns. Le moteur qui change tout.",
    updatedAt: '2026-05-12',
    tags: ['waterfall', 'enrichissement', 'email', 'serper', 'scraping'],
    content: `## Pourquoi une cascade ?

Un seul outil d'email finder (Hunter, Apollo…) trouve en moyenne **35-40 %** des emails B2B en France. Volia combine 3 sources en cascade : on trouve **80 %** en moyenne.

## Les 3 étages de la cascade

### Étage 1 — Scraping intelligent du site web

Volia ouvre le site web de l'entreprise (renvoyé par Google Places) et cherche un email sur :
- La page **Contact** (détection automatique des liens "contact", "nous joindre", "mentions légales").
- Le **footer** de toutes les pages.
- Les **mentions légales** (obligatoires en France, contiennent souvent un email).
- Les balises \`mailto:\` dans le HTML.

→ Score : **Vérifié** (email trouvé sur le site officiel).

### Étage 2 — Recherche Google via Serper

Si rien sur le site, Volia interroge Google via [Serper.dev](https://serper.dev) avec des requêtes du type \`"@nomentreprise.fr" contact\`. Elle parse les résultats pour extraire des emails dans :
- Annuaires (PagesJaunes, Societe.com)
- Profils LinkedIn publics
- Anciens communiqués de presse

→ Score : **Google** (email trouvé via une source tierce indexée).

### Étage 3 — Fallback patterns

Si toujours rien, Volia génère les **patterns d'email les plus courants** (contact@, info@, hello@, bonjour@) sur le domaine détecté.

→ Score : **Probable** (pattern deviné, à valider avant envoi).

## Quand la cascade s'arrête

Dès qu'un email est trouvé à un étage, **les étages suivants ne sont pas exécutés**. Économie de quota et de temps.

## Quel score pour quel usage ?

| Score | Usage recommandé |
| --- | --- |
| **Vérifié** | Cold email direct OK |
| **Google** | Cold email OK, vérification email recommandée |
| **Probable** | Vérification obligatoire (sinon bounce risk) |

Voir [Scoring de confiance](/docs/scoring-confiance-emails).

## FAQ rapide

**Combien de temps ça prend par prospect ?** 2-5 secondes selon les étages traversés.
**Ça compte dans mon quota ?** Chaque prospect enregistré (avec ou sans email) décrémente ton quota.
**Je peux désactiver certains étages ?** Pas individuellement, mais tu peux activer le filtrage RGPD pour éliminer les emails personnels.

## Articles liés

- [Scoring de confiance des emails](/docs/scoring-confiance-emails)
- [Filtrage RGPD emails personnels](/docs/filtrage-rgpd-emails-personnels)
`,
  },
  {
    slug: 'scoring-confiance-emails',
    category: 'prospection',
    title: 'Scoring de confiance des emails',
    description: "Vérifié, Google, Probable : comprendre les 3 niveaux et savoir quoi envoyer.",
    updatedAt: '2026-05-12',
    tags: ['scoring', 'email', 'qualite', 'verification'],
    content: `## Pourquoi un scoring ?

Tous les emails trouvés ne se valent pas. Volia attribue un score de confiance à chaque email basé sur sa **source** (cf. [cascade waterfall](/docs/cascade-waterfall-enrichissement)).

## Les 3 niveaux

### Vérifié — pastille verte

L'email a été trouvé **directement sur le site web officiel** de l'entreprise (page contact, mentions légales, footer). Taux de bounce observé : < 2 %.

→ **Envoi direct OK.**

### Google — pastille bleue

L'email a été trouvé via une **recherche Google** (annuaire, LinkedIn, presse). Taux de bounce observé : ~ 5-8 %.

→ **Envoi OK**, vérification email recommandée si tu envoies > 100 emails / jour sur un domaine neuf.

### Probable — pastille orange

L'email a été **deviné par pattern** (contact@, info@…). Taux de bounce observé : 15-25 %.

→ **Vérification obligatoire** avant envoi. Utilise un vérificateur (NeverBounce, ZeroBounce, ou notre outil interne).

## Comment vérifier en masse

1. Dans le panneau Résultats, filtre sur **Score = Probable**.
2. Exporte en CSV.
3. Charge le CSV dans NeverBounce ou ZeroBounce (~ 0,008 €/email).
4. Réimporte les emails valides dans Volia Campagnes.

Volia prévoit un vérificateur natif Q3 2026 (déjà en bêta privée).

## Filtrer par score

Dans le panneau Résultats :
- Coche/décoche les pastilles **Vérifié / Google / Probable** pour filtrer.
- Combine avec le filtre **note Google ≥ 4.0** pour ne cibler que les entreprises actives.

## FAQ rapide

**Quel score viser pour cold emailing ?** Vérifié + Google si délivrabilité importante.
**Le score change-t-il dans le temps ?** Non, il est figé au moment de l'enrichissement.
**Si j'envoie un email Probable et qu'il bounce ?** Ton domaine prend une mauvaise réputation. À éviter sur un domaine fraîchement warmé.

## Articles liés

- [Cascade waterfall](/docs/cascade-waterfall-enrichissement)
- [Filtrage RGPD emails personnels](/docs/filtrage-rgpd-emails-personnels)
- [Warmup domaine 28 jours](/docs/warmup-domaine-28j)
`,
  },
  {
    slug: 'recherche-langage-naturel',
    category: 'prospection',
    title: 'Recherche en langage naturel',
    description: "Décris ta cible en français, l'IA Claude la convertit en requête Google Places.",
    updatedAt: '2026-05-12',
    tags: ['nlp', 'ia', 'claude', 'recherche naturelle'],
    content: `## Pourquoi le langage naturel ?

Les 150+ catégories couvrent 95 % des besoins, mais parfois tu veux quelque chose de très spécifique (*"food trucks bio en région PACA"*, *"cabinets dentaires avec implantologie à Bordeaux"*). C'est là qu'intervient la recherche NLP.

## Comment ça marche

1. Dans le panneau Prospection, clique sur le toggle **Langage naturel**.
2. Décris ta cible en français, en 1-2 phrases.
3. Volia envoie ta description à **Claude (Anthropic)** qui la convertit en :
    - 1 ou plusieurs termes de recherche Google Places
    - 1 ou plusieurs départements suggérés
4. Tu valides → la recherche se lance comme une recherche classique.

## Exemples qui marchent bien

- *"Restaurants végétariens à Paris avec note > 4"* → terme "vegetarian restaurant Paris", filtres ajoutés automatiquement.
- *"Garages spécialisés voiture électrique en région Auvergne-Rhône-Alpes"* → terme "EV garage", départements 01, 03, 07, 15, 26, 38, 42, 43, 63, 69, 73, 74.
- *"Cabinets d'avocats en droit du travail à Lyon"* → terme "labor law attorney Lyon", département 69.

## Limites

- 1 requête NLP = 1 appel Claude (compte dans ton quota de prospects au moment de l'enrichissement).
- L'IA peut se tromper sur les départements (vérifie avant de lancer).
- Pour les ciblages très techniques (ex: "PME avec > 50 salariés et CA > 5M€"), Google Places ne donne pas ces infos — utilise un autre outil enrichissement côté CRM.

## FAQ rapide

**C'est gratuit ?** Inclus dans tous les plans, sans surcoût.
**Mes requêtes sont-elles loggées ?** Oui, en interne (sans contenu sensible) pour améliorer le moteur. Anonymisées au bout de 30 jours.
**Je peux désactiver ?** Oui, le toggle reste éteint par défaut.

## Articles liés

- [Lancer une recherche Google Places](/docs/lancer-recherche-google-places)
- [Recherche multi-critères](/docs/recherche-multi-criteres)
`,
  },
  {
    slug: 'export-csv-zoho',
    category: 'prospection',
    title: 'Exporter en CSV ou Zoho CRM',
    description: "Deux formats au choix : CSV standard ou pré-formaté pour Zoho CRM.",
    updatedAt: '2026-05-12',
    tags: ['export', 'csv', 'zoho', 'crm'],
    content: `## Format CSV standard

C'est le format universel : compatible Excel, Google Sheets, HubSpot, Pipedrive, n'importe quel CRM.

**Colonnes exportées :**
- nom, adresse, telephone, email, email_method, site_web, note, nb_avis, type, departement, categorie, created_at

### Comment exporter

1. Dans le panneau Résultats, applique tes filtres (score, note, département…).
2. Clique sur **Exporter CSV**.
3. Le fichier se télécharge instantanément (\`volia-prospects-YYYYMMDD.csv\`).

## Format Zoho CRM

Pré-formaté pour un import direct dans Zoho CRM via **Leads → Import**. Les colonnes matchent les champs Zoho standards.

**Colonnes exportées :**
- First Name (à compléter), Last Name (= nom entreprise), Email, Phone, Company, Website, Street, City, Country, Description (note Google + avis)

### Comment exporter

1. Mêmes étapes que CSV standard.
2. Clique sur **Exporter Zoho CRM** au lieu de **Exporter CSV**.
3. Importe le fichier dans Zoho : Leads → Import Leads → Upload File.

## Limites d'export

| Plan | Export max par jour |
| --- | --- |
| Free | 200 lignes |
| Solo | 2 000 lignes |
| Pro | 10 000 lignes |
| Business | illimité |

Les limites se réinitialisent à minuit (heure de Paris).

## FAQ rapide

**Je peux exporter plusieurs fois les mêmes prospects ?** Oui, l'export ne décrémente pas ton quota mensuel (seule la découverte décrémente).
**Encodage du CSV ?** UTF-8 avec BOM (Excel ouvre direct sans bug d'accents).
**Connecteur HubSpot natif ?** Pas encore — utilise CSV standard et l'import HubSpot.

## Articles liés

- [Recherche multi-critères](/docs/recherche-multi-criteres)
- [Filtrage RGPD emails personnels](/docs/filtrage-rgpd-emails-personnels)
`,
  },
  {
    slug: 'filtrage-rgpd-emails-personnels',
    category: 'prospection',
    title: 'Filtrage RGPD des emails personnels',
    description: "28 domaines bloqués (Gmail, Hotmail…) pour ne garder que des emails pro.",
    updatedAt: '2026-05-12',
    tags: ['rgpd', 'email', 'gmail', 'filtrage', 'conformite'],
    content: `## Pourquoi filtrer les emails personnels ?

Le RGPD est plus strict pour les emails personnels (jean.dupont@gmail.com) que pour les emails pro (contact@entreprise.fr) :
- Email pro : base légale **intérêt légitime** acceptable pour la prospection B2B.
- Email perso : nécessite généralement un **consentement préalable** (opt-in).

Pour rester safe, Volia te permet de filtrer automatiquement les emails personnels avant export.

## Activer le filtre

1. Va sur **Paramètres → Préférences**.
2. Active le toggle **Filtrer les emails personnels (RGPD)**.
3. Désormais, tous les emails appartenant à un des 28 domaines bloqués sont **exclus** des résultats et exports.

## Les 28 domaines bloqués

Tous les principaux fournisseurs de mail grand public :
- gmail.com, googlemail.com, yahoo.fr/com/.co.uk, hotmail.fr/com, outlook.fr/com, live.fr/com, msn.com, icloud.com, me.com, mac.com, aol.com, free.fr, orange.fr, wanadoo.fr, laposte.net, sfr.fr, bbox.fr, neuf.fr, numericable.fr, club-internet.fr, voila.fr, gmx.fr/com, protonmail.com, tutanota.com, mail.com, yandex.com, ymail.com, rocketmail.com.

## Avertissement juridique

Volia affiche un **bandeau d'avertissement** si tu désactives le filtre. Tu restes responsable de la conformité de tes envois — vérifie auprès de ton DPO ou avocat avant de prospecter des emails personnels.

## Sur quoi le filtre s'applique

- ✅ Affichage dans le panneau Résultats
- ✅ Exports CSV / Zoho
- ✅ Push vers Volia Campagnes
- ❌ La base de données conserve les emails personnels (au cas où tu changerais d'avis)

## FAQ rapide

**Mon CRM reçoit-il les emails personnels ?** Non si le filtre est actif.
**Et les emails du type prenom.nom@nomentreprise.fr ?** Ce ne sont pas des emails perso, ils passent le filtre.
**Je peux ajouter mes propres domaines à bloquer ?** Pas encore via UI, contacte le support pour une whitelist custom.

## Articles liés

- [Page RGPD complète](/rgpd)
- [Export CSV ou Zoho](/docs/export-csv-zoho)
- [RGPD : exporter mes données](/docs/rgpd-export-donnees)
`,
  },
  {
    slug: 'utiliser-101-departements',
    category: 'prospection',
    title: 'Utiliser les 101 départements',
    description: "Métropole (96) + outre-mer (5), organisés en 14 régions sélectionnables.",
    updatedAt: '2026-05-12',
    tags: ['departements', 'regions', 'geographie', 'france'],
    content: `## Couverture géographique

Volia couvre les **101 départements français** :
- **96 départements métropolitains** (01 à 95 + 2A/2B Corse).
- **5 départements d'outre-mer** : 971 Guadeloupe, 972 Martinique, 973 Guyane, 974 La Réunion, 976 Mayotte.

## Sélectionner par région

Les départements sont groupés en **14 régions** dans le panneau Prospection. Tu peux cocher une région entière en un clic :

| Région | Nb dép. |
| --- | --- |
| Île-de-France | 8 |
| Auvergne-Rhône-Alpes | 12 |
| Nouvelle-Aquitaine | 12 |
| Occitanie | 13 |
| Provence-Alpes-Côte d'Azur | 6 |
| Grand Est | 10 |
| Hauts-de-France | 5 |
| Normandie | 5 |
| Bretagne | 4 |
| Pays de la Loire | 5 |
| Centre-Val de Loire | 6 |
| Bourgogne-Franche-Comté | 8 |
| Corse | 2 |
| Outre-mer | 5 |

## Bonnes pratiques

- **Test sur 1 département** avant de lancer une recherche multi-régions, surtout sur des catégories denses.
- **Évite Paris (75) pour ta 1ère** : ~10 000 résultats potentiels qui mangent ton quota.
- **DOM-TOM** : couverture solide grâce à Google Places, idéal pour les commerces et services locaux.

## Combien de prospects par département ?

Très variable selon la catégorie. Indicatif moyen :
- Petite ville (< 50k hab.) : 5-50 entreprises / catégorie
- Ville moyenne : 50-200
- Grande ville (Lyon, Marseille, Toulouse) : 200-800
- Paris : jusqu'à 2000+

## FAQ rapide

**Frontières mises à jour ?** Oui, on suit le découpage INSEE 2023 + Mayotte (976) en cours d'évolution administrative.
**Recherche transfrontalière (Suisse, Belgique) ?** Pas dans Volia France — voir [volia.fr/prospection-be](/prospection-be) et [/prospection-ch](/prospection-ch).
**Données mises à jour à quelle fréquence ?** Google Places met à jour quotidiennement.

## Articles liés

- [Lancer une recherche Google Places](/docs/lancer-recherche-google-places)
- [Recherche multi-critères](/docs/recherche-multi-criteres)
`,
  },
  {
    slug: 'recherche-multi-criteres',
    category: 'prospection',
    title: 'Recherche multi-critères',
    description: "Combine catégories, départements, note Google, présence email pour cibler chirurgical.",
    updatedAt: '2026-05-12',
    tags: ['recherche', 'filtres', 'criteres', 'ciblage'],
    content: `## Construire une recherche ultra-ciblée

Plus tu combines de critères, plus ton ciblage est précis (et plus ton taux de conversion en cold email monte).

## Les 4 dimensions de recherche

### 1. Catégories (obligatoire)

Coche **1 à N catégories** dans le panneau gauche. Les catégories sont organisées en 12 secteurs B2B + 3 groupes copropriété.

### 2. Géographie (obligatoire)

Coche **1 à 101 départements**. Tu peux mixer métropole et DOM-TOM.

### 3. Filtres qualité (optionnels, appliqués après recherche)

- **Note Google ≥ X** : filtre les entreprises notées ≥ 3.5, 4.0, 4.5.
- **Nombre d'avis ≥ X** : filtre les entreprises avec ≥ 10, 50, 100 avis (proxy d'activité).
- **Présence email** : seulement les prospects avec email trouvé.
- **Score email** : Vérifié / Google / Probable (cf. [scoring](/docs/scoring-confiance-emails)).

### 4. Filtres méthode email (optionnels)

Filtre par méthode d'enrichissement : scrape (vérifié), waterfall (Google), guess (pattern).

## Exemple concret : ciblage premium

> *"Restaurants gastronomiques en Île-de-France, note > 4.5, > 100 avis, avec email vérifié"*

1. Catégorie : **Restaurant gastronomique**.
2. Départements : **75, 77, 78, 91, 92, 93, 94, 95**.
3. Lancer la recherche.
4. Filtres après-recherche : Note ≥ 4.5, Nb avis ≥ 100, Score email = Vérifié.

→ Résultat type : 50-150 prospects ultra-qualifiés, taux de réponse cold email observé ~ 12-18 %.

## Sauvegarder une recherche

Toutes tes recherches sont automatiquement enregistrées dans la **Sidebar → Historique**. Clique pour rejouer une recherche à l'identique.

## FAQ rapide

**Je peux exclure une catégorie ?** Pas directement, mais tu peux exclure des prospects manuellement après recherche.
**Combien de recherches simultanées ?** 1 à la fois (sinon les quotas Google Places explosent).
**L'historique se purge ?** Non, conservé tant que ton compte existe.

## Articles liés

- [Lancer une recherche Google Places](/docs/lancer-recherche-google-places)
- [Recherche en langage naturel](/docs/recherche-langage-naturel)
- [Scoring de confiance](/docs/scoring-confiance-emails)
`,
  },

  // ─────────────────────────────────────────────────────────────────────
  // CAMPAGNES (10)
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'connecter-domaine-envoi',
    category: 'campagnes',
    title: "Connecter mon domaine d'envoi",
    description: "Première étape obligatoire pour envoyer des emails depuis Volia.",
    updatedAt: '2026-05-12',
    tags: ['domaine', 'envoi', 'smtp', 'setup'],
    content: `## Pourquoi connecter un domaine ?

Volia ne t'envoie pas d'emails depuis **@volia.fr** (mauvais pour la délivrabilité). Tu dois utiliser **ton propre domaine** d'envoi (ex: prospection@tonentreprise.fr, hello@taboite.com).

## Pré-requis

- Un nom de domaine que tu possèdes (registrar OVH, Gandi, Cloudflare…).
- Accès à la zone DNS du domaine pour ajouter SPF / DKIM / DMARC.
- Un sous-domaine dédié recommandé pour la prospection (ex: \`mail.tonentreprise.fr\` ou \`outbound.tonentreprise.fr\`) — protège ton domaine principal de la mauvaise réputation potentielle.

## Étapes

1. Va sur **Paramètres → Domaines email**.
2. Clique sur **+ Ajouter un domaine**.
3. Entre ton domaine (ex: \`mail.tonentreprise.fr\`).
4. Volia te génère **3 enregistrements DNS** à ajouter (SPF, DKIM, DMARC).
5. Ajoute-les chez ton registrar (cf. [Configurer DNS](/docs/configurer-dns-spf-dkim)).
6. Clique sur **Vérifier** dans Volia. Les enregistrements peuvent prendre jusqu'à 48 h pour se propager (souvent < 1 h).
7. Une fois vérifié, ton domaine apparaît avec un statut **Actif**.

## Combien de domaines je peux connecter ?

| Plan | Domaines |
| --- | --- |
| Free | 1 |
| Solo | 2 |
| Pro | 5 |
| Business | illimité |

Tu peux utiliser **plusieurs adresses d'envoi par domaine** (alex@mail.boite.fr, marie@mail.boite.fr…) sans limite.

## FAQ rapide

**Et si je n'ai pas de domaine ?** Achètes-en un (~ 10 €/an chez OVH ou Gandi). Sans domaine, pas de cold email pro.
**Volia gère le warmup auto ?** Oui, cf. [Warmup domaine 28 jours](/docs/warmup-domaine-28j).
**Et un domaine en .com / .io ?** Aucun problème, mais .fr est légèrement mieux pour la prospection FR.

## Articles liés

- [Configurer DNS (SPF, DKIM, DMARC)](/docs/configurer-dns-spf-dkim)
- [Warmup domaine 28 jours](/docs/warmup-domaine-28j)
- [Créer ma première campagne](/docs/creer-premiere-campagne)
`,
  },
  {
    slug: 'configurer-dns-spf-dkim',
    category: 'campagnes',
    title: 'Configurer DNS : SPF, DKIM, DMARC',
    description: "Les 3 enregistrements DNS indispensables pour ne pas finir en spam.",
    updatedAt: '2026-05-12',
    tags: ['dns', 'spf', 'dkim', 'dmarc', 'delivrabilite'],
    content: `## Pourquoi ces 3 enregistrements ?

Les FAI (Gmail, Outlook, Yahoo) vérifient 3 choses avant d'accepter ton email :
- **SPF** : "ce serveur est-il autorisé à envoyer pour ce domaine ?"
- **DKIM** : "le contenu de l'email a-t-il été altéré ?"
- **DMARC** : "que faire si SPF ou DKIM échoue ?"

Sans ces 3 enregistrements bien configurés, **50-80 % de tes emails finissent en spam**.

## Étape 1 — SPF

Dans la zone DNS de ton domaine, ajoute un enregistrement **TXT** :
- **Nom** : \`@\` (ou laissé vide, dépend du registrar)
- **Valeur** : \`v=spf1 include:_spf.volia.fr include:_spf.google.com ~all\`

⚠️ Si tu as déjà un SPF (Google Workspace, etc.), **ajoute** \`include:_spf.volia.fr\` dans l'existant. Tu ne peux pas avoir 2 enregistrements SPF.

## Étape 2 — DKIM

Volia génère une clé DKIM unique pour ton domaine. Dans **Paramètres → Domaines email → ton domaine**, copie la valeur.

Ajoute un enregistrement **TXT** :
- **Nom** : \`volia._domainkey\`
- **Valeur** : \`v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEB...\` (longue chaîne fournie par Volia)

## Étape 3 — DMARC

Ajoute un enregistrement **TXT** :
- **Nom** : \`_dmarc\`
- **Valeur** : \`v=DMARC1; p=none; rua=mailto:dmarc@tonentreprise.fr\`

Tu peux passer en \`p=quarantine\` ou \`p=reject\` après 30 jours d'observation des rapports DMARC.

## Vérification

Après ajout :
1. Attends 5-30 min (propagation DNS).
2. Dans Volia, clique sur **Vérifier**.
3. Statut **Actif** = tu peux envoyer.

Tu peux aussi tester manuellement avec [mail-tester.com](https://mail-tester.com) (score ≥ 9/10 = bon).

## FAQ rapide

**Et BIMI ?** Optionnel, ajoute ton logo dans Gmail. Pas critique mais joli.
**Mon score mail-tester est < 7 ?** Vérifie le contenu de ton email (mots spammy, ratio texte/image, liens trackés) en plus du DNS.
**Volia peut faire le DNS pour moi ?** Pas encore. On regarde un partenariat OVH / Cloudflare API pour 2026.

## Articles liés

- [Connecter mon domaine d'envoi](/docs/connecter-domaine-envoi)
- [Warmup domaine 28 jours](/docs/warmup-domaine-28j)
`,
  },
  {
    slug: 'creer-premiere-campagne',
    category: 'campagnes',
    title: 'Créer ma première campagne',
    description: "De la sélection des prospects à l'envoi : 6 étapes guidées.",
    updatedAt: '2026-05-12',
    tags: ['campagne', 'demarrage', 'email', 'sequence'],
    content: `## Pré-requis

Avant de créer une campagne :
- ✅ Au moins 1 [domaine d'envoi connecté](/docs/connecter-domaine-envoi) et vérifié.
- ✅ Au moins 50 prospects découverts via Prospection (sinon le ciblage sera trop fin).
- ✅ Si domaine neuf, [warmup démarré depuis ≥ 7 jours](/docs/warmup-domaine-28j).

## Les 6 étapes

### 1. Module Campagnes

Dans le ModuleSwitcher (haut gauche), clique sur **Campagnes**.

### 2. Nouvelle campagne

Clique sur **+ Nouvelle campagne** dans la sidebar.

### 3. Sélection prospects

Filtre tes prospects (catégorie, département, score email, note Google…) puis clique **Ajouter à la campagne** sur ceux qui t'intéressent. Tu peux aussi cocher tout et "Tout ajouter".

### 4. Choix du template

Pars d'un [template pré-fait](/docs/choisir-template) ou crée une séquence from scratch. Pour un 1er essai : template **Cold Discovery 3-touch FR**.

### 5. Personnalisation

Édite chaque email de la séquence :
- Variables : \`{{prenom}}\`, \`{{entreprise}}\`, \`{{ville}}\`, \`{{categorie}}\`, etc.
- Lignes d'objet : crée 1-2 variantes pour [A/B testing](/docs/ab-testing-subject).
- Footer obligatoire RGPD : lien de désinscription (auto-ajouté par Volia).

### 6. Planning

- **Quand envoyer** : start now, ou date/heure précise.
- **Timezone** : Europe/Paris par défaut (cf. [Scheduling timezone](/docs/scheduling-timezone)).
- **Cadence** : 50-100 emails/jour max si domaine warmé < 4 sem.

Clique **Lancer la campagne**. Volia commence à envoyer selon le planning.

## Suivre la campagne

Onglet **Campagnes → ta campagne** :
- Envoyés, délivrés, ouverts, cliqués, répondus, désinscrits.
- Timeline par prospect.
- Replies remontés direct dans le module CRM si activé.

## FAQ rapide

**Combien de prospects max dans 1 campagne ?** Pas de limite techinique, mais reste sous 1 000 prospects par campagne pour rester gérable.
**Je peux mettre en pause ?** Oui, à tout moment depuis la liste des campagnes.
**Et si un prospect répond ?** Volia stoppe les emails suivants pour ce prospect (logique anti-spam).

## Articles liés

- [Choisir un template](/docs/choisir-template)
- [Créer une séquence multi-step](/docs/creer-sequence-multi-step)
- [A/B testing subject](/docs/ab-testing-subject)
`,
  },
  {
    slug: 'choisir-template',
    category: 'campagnes',
    title: 'Choisir un template de campagne',
    description: "Templates pré-faits cold discovery, follow-up, événement, reactivation.",
    updatedAt: '2026-05-12',
    tags: ['template', 'campagne', 'email'],
    content: `## Pourquoi des templates ?

Écrire un cold email qui convertit prend du temps. Volia te fournit des templates testés sur des milliers d'envois pour démarrer rapidement.

## Les templates disponibles

| Template | Touches | Objectif |
| --- | --- | --- |
| **Cold Discovery 3-touch FR** | 3 | Premier contact + 2 relances |
| **Cold Discovery 5-touch FR** | 5 | Premier contact + 4 relances (cycle long) |
| **Follow-up post-démo** | 2 | Relancer un prospect qui a vu une démo |
| **Reactivation 6 mois** | 1 | Réveiller des leads dormants |
| **Invitation événement** | 2 | Inviter à un webinar / IRL |
| **Survey rapide** | 1 | Demander un avis (3 questions max) |

Tous les templates sont en français, ton commercial mais pas agressif, conformes RGPD (footer désinscription auto-ajouté).

## Utiliser un template

1. Quand tu crées une campagne, clique sur **Partir d'un template** à l'étape 4.
2. Choisis le template adapté.
3. Tous les emails de la séquence sont pré-remplis.
4. Personnalise chaque email avant lancement.

## Variables disponibles

Dans tous les templates :
- \`{{prenom}}\` : prénom du contact (si présent dans CRM)
- \`{{nom}}\` : nom du contact
- \`{{entreprise}}\` : nom de l'entreprise
- \`{{ville}}\` : ville d'implantation
- \`{{departement}}\` : nom du département
- \`{{categorie}}\` : catégorie (ex: "restaurant", "garage")
- \`{{custom_XXX}}\` : champs personnalisés CRM

Si une variable n'a pas de valeur, Volia utilise un fallback (vide ou texte par défaut).

## Sauvegarder ton propre template

1. Crée une campagne et personnalise complètement.
2. Avant lancement, clique sur **Enregistrer comme template**.
3. Donne-lui un nom — il apparaît dans **Mes templates** au prochain usage.

## FAQ rapide

**Templates en anglais ?** Pas encore, prévu Q3 2026.
**Je peux partager mes templates avec mon équipe ?** Oui, automatiquement (templates = workspace-level).
**Modifier un template officiel ?** Non, mais tu peux le dupliquer puis modifier.

## Articles liés

- [Créer ma première campagne](/docs/creer-premiere-campagne)
- [Créer une séquence multi-step](/docs/creer-sequence-multi-step)
- [A/B testing subject](/docs/ab-testing-subject)
`,
  },
  {
    slug: 'creer-sequence-multi-step',
    category: 'campagnes',
    title: 'Créer une séquence multi-step',
    description: "Touches multiples, délais entre étapes, conditions d'arrêt : tout configurer.",
    updatedAt: '2026-05-12',
    tags: ['sequence', 'multi-step', 'follow-up', 'cadence'],
    content: `## Séquence vs. campagne single-touch

- **Single-touch** : 1 email envoyé, point.
- **Séquence multi-step** : 2 à 7 emails envoyés en suivi automatique avec délai entre chaque, arrêt si réponse.

Les séquences multiplient le taux de réponse par **2-3x** sur le cold email B2B.

## Architecture d'une séquence

Chaque séquence = une liste d'**étapes** :

\`\`\`
Étape 1 → email d'intro (Jour 0)
   ↓ +3 jours, si pas de réponse
Étape 2 → relance courte ("up?")
   ↓ +5 jours
Étape 3 → relance avec angle différent (case study, social proof)
   ↓ +7 jours
Étape 4 → email de clôture ("break-up")
\`\`\`

## Créer une séquence

1. Crée une campagne, va à l'étape **Séquence**.
2. Clique **+ Ajouter une étape**.
3. Pour chaque étape :
    - **Délai** : nombre de jours après l'étape précédente (0 = même jour, 1 = lendemain…).
    - **Heure d'envoi** : 09:00-11:00 ou 14:00-16:00 recommandé.
    - **Subject** : objet de l'email (variables OK).
    - **Body** : corps de l'email (variables, liens trackés).

## Conditions d'arrêt automatique

Volia arrête d'envoyer les étapes suivantes si :
- ✅ Le prospect **répond** à n'importe quelle étape.
- ✅ Le prospect **clique sur le lien de désinscription**.
- ✅ L'email **bounce** (adresse invalide).
- ✅ Tu **mets en pause** la campagne manuellement.

## Bonnes pratiques

- **Max 4-5 touches** sur une séquence cold (au-delà = spam).
- **Espace de 3-7 jours** entre touches.
- **Réutilise l'historique** : "Comme je te disais le 12 mars…" est très efficace en touche 3.
- **Vary les angles** : touche 1 = problème, touche 2 = chiffre, touche 3 = case study, touche 4 = break-up.

## FAQ rapide

**Conditional branching (si ouvert → envoie A, sinon B) ?** Pas encore en V1, prévu Q4 2026.
**Templates de séquence pré-écrits ?** Oui, voir [Choisir un template](/docs/choisir-template).
**Cadence max par séquence ?** 50-100 emails/jour pour rester safe en délivrabilité.

## Articles liés

- [Créer ma première campagne](/docs/creer-premiere-campagne)
- [Choisir un template](/docs/choisir-template)
- [A/B testing subject](/docs/ab-testing-subject)
- [Tracking opens & clicks](/docs/tracking-opens-clicks)
`,
  },
  {
    slug: 'ab-testing-subject',
    category: 'campagnes',
    title: 'A/B testing du subject',
    description: "Tester 2 variantes de ligne d'objet automatiquement et garder la meilleure.",
    updatedAt: '2026-05-12',
    tags: ['ab-test', 'subject', 'objet', 'optimisation'],
    content: `## Pourquoi tester l'objet ?

L'objet d'un cold email = **70 % du taux d'ouverture**. Un mauvais objet et même le meilleur corps ne sera jamais lu. L'A/B testing systématique te fait gagner +30-50 % d'ouvertures sur 6 mois.

## Comment ça marche

1. Dans n'importe quelle étape de séquence, clique sur **+ Variante A/B**.
2. Entre **2 lignes d'objet** différentes (variante A, variante B).
3. Volia envoie 50/50 aléatoirement aux prospects de cette étape.
4. Au bout de **20 emails par variante**, le winner est déterminé statistiquement.
5. Les prospects suivants reçoivent **uniquement le winner**.

## Critère de win

- Critère par défaut : **taux d'ouverture**.
- Critère alternatif : **taux de réponse** (plus pertinent mais plus long à mesurer, ≥ 50 emails par variante recommandé).

## Bonnes pratiques

- **Teste 1 variable à la fois** : objet OU corps, pas les 2.
- **Différencie nettement** : "Question rapide" vs "Une idée pour {{entreprise}}" — pas "Question rapide" vs "Une question rapide".
- **Garde le winner** comme nouveau baseline pour la prochaine campagne.

## Exemples qui marchent

| Variante A | Variante B | Vainqueur typique |
| --- | --- | --- |
| "Question rapide" | "Une idée pour {{entreprise}}" | B (+40 % open) |
| "{{prenom}}, 2 min ?" | "À propos de {{entreprise}}" | A (+25 % open) |
| "Augmenter votre CA de 20 %" | "Comment {{concurrent}} a fait +20 %" | B (+30 % open) |

## FAQ rapide

**Je peux tester 3+ variantes ?** Pas en V1 (multi-variate testing). 2 variantes A/B uniquement.
**A/B test sur le corps ?** Pas encore — prévu Q3 2026.
**Combien de temps pour avoir un winner ?** 1-3 jours selon ton volume d'envoi.

## Articles liés

- [Créer une séquence multi-step](/docs/creer-sequence-multi-step)
- [Tracking opens & clicks](/docs/tracking-opens-clicks)
`,
  },
  {
    slug: 'scheduling-timezone',
    category: 'campagnes',
    title: 'Scheduling et timezone',
    description: "Envoyer au bon moment selon la timezone du prospect, pas la tienne.",
    updatedAt: '2026-05-12',
    tags: ['timezone', 'scheduling', 'planning', 'horaires'],
    content: `## Le piège de la timezone

Si tu envoies un email à 09:00 heure de Paris à un prospect à Cayenne (Guyane, UTC-3), il le reçoit à 04:00 du matin local. Mauvais ouverture, mauvais signal pour les FAI.

Volia gère ça automatiquement.

## Auto-détection timezone

Pour chaque prospect, Volia détermine la timezone à partir de :
1. Le **département** (97x DOM-TOM → UTC-3/-4, 974 La Réunion → UTC+4, etc.).
2. À défaut, **Europe/Paris** (métropole).

## Configurer les horaires d'envoi

Dans chaque campagne :
- **Fenêtre d'envoi** : ex. 09:00-11:00 + 14:00-16:00 (horaires locaux du prospect).
- **Jours actifs** : Lun-Ven par défaut (désactiver weekend).
- **Jours fériés** : automatiquement exclus (calendrier France + DOM-TOM).

Volia répartit ensuite les envois sur la fenêtre pour ne pas saturer ton domaine (max 1 email toutes les 30-60 sec).

## Override manuel

Tu peux forcer une timezone spécifique sur une campagne (utile si tu prospectes uniquement en métropole) :
1. Édite la campagne.
2. Section **Scheduling → Timezone**.
3. Choisis **Europe/Paris** (ou autre).

## FAQ rapide

**Et les prospects à l'étranger (Belgique, Suisse) ?** Volia détecte le pays via le domaine email (.be → UTC+1, .ch → UTC+1).
**Heures d'été / hiver ?** Auto-gérées via tzdata IANA.
**Je peux envoyer le weekend ?** Oui en cochant les jours dans le planning, mais peu efficace en B2B.

## Articles liés

- [Créer ma première campagne](/docs/creer-premiere-campagne)
- [Warmup domaine 28 jours](/docs/warmup-domaine-28j)
`,
  },
  {
    slug: 'warmup-domaine-28j',
    category: 'campagnes',
    title: 'Warmup domaine 28 jours',
    description: "Comment Volia chauffe ton domaine pour passer en boîte de réception et pas en spam.",
    updatedAt: '2026-05-12',
    tags: ['warmup', 'domaine', 'delivrabilite', 'reputation'],
    content: `## Pourquoi le warmup ?

Un domaine neuf qui envoie 500 emails dès le jour 1 est **flagué spam** par Gmail/Outlook. Le warmup = augmenter le volume progressivement pour bâtir une réputation.

Volia inclut un warmup automatique sur **28 jours**, gratuit avec tous les plans.

## Comment ça marche

1. Dès qu'un domaine est vérifié dans Volia, le warmup démarre.
2. Volia envoie des emails entre **comptes de warmup** (réseau interne de centaines de comptes Volia consentants) pendant 28 jours.
3. Ces emails sont **automatiquement ouverts, répondus, marqués "important"** par les comptes du réseau.
4. Cela apprend aux FAI que ton domaine est légitime.

## Courbe progressive

| Jour | Emails warmup / jour | Capacité campagnes |
| --- | --- | --- |
| J0-J7 | 5-20 | 0 (ne lance pas de campagne) |
| J8-J14 | 20-50 | 20-30 emails/jour max |
| J15-J21 | 50-100 | 50-80 emails/jour |
| J22-J28 | 100-200 | 100-150 emails/jour |
| J28+ | 100-300 (continu) | 200-500 emails/jour |

⚠️ **Ne lance pas de campagne avant J7 minimum**. Idéalement J14.

## Pendant le warmup

- Ne change pas tes DNS (SPF/DKIM/DMARC).
- Ne change pas l'adresse d'envoi (alex@mail.boite.fr → reste alex@…).
- Préfère envoyer aussi quelques emails "humains" (toi qui réponds à des leads manuellement).

## Vérifier le statut warmup

Dans **Paramètres → Domaines email → ton domaine** :
- Jauge de progression 0/28 jours.
- Score de réputation actuel (vert / orange / rouge).
- Inbox placement (boîte de réception vs. promotions vs. spam) sur Gmail/Outlook/Yahoo.

## FAQ rapide

**Warmup auto sans rien faire ?** Oui, c'est 100 % automatique une fois le domaine vérifié.
**Je peux désactiver ?** Oui, mais déconseillé. Toggle dans **Domaines email → ton domaine → Warmup**.
**Combien ça coûte ?** Gratuit avec tous les plans payants. Plan Free : limité à 1 domaine warmup.

## Articles liés

- [Connecter mon domaine d'envoi](/docs/connecter-domaine-envoi)
- [Configurer DNS SPF/DKIM/DMARC](/docs/configurer-dns-spf-dkim)
- [Créer ma première campagne](/docs/creer-premiere-campagne)
`,
  },
  {
    slug: 'tracking-opens-clicks',
    category: 'campagnes',
    title: 'Tracking opens & clicks',
    description: "Mesurer ouvertures, clics, réponses. Limites du tracking et alternatives.",
    updatedAt: '2026-05-12',
    tags: ['tracking', 'opens', 'clicks', 'analytics'],
    content: `## Les 3 métriques principales

| Métrique | Comment Volia mesure | Précision |
| --- | --- | --- |
| **Open** | Pixel invisible 1x1 chargé à l'ouverture | ~ 60-70 % réelle (Apple Mail prefetch fausse) |
| **Click** | Liens trackés (redirection via volia.fr/r/xxx) | ~ 95 % |
| **Reply** | Detection auto via reply-to header | ~ 99 % |

## Apple Mail Privacy Protection (MPP)

Depuis iOS 15 (sept. 2021), Apple Mail **précharge** les pixels de tracking côté serveur Apple, faussant les opens. ~ 40 % des emails B2B en France sont ouverts sur Apple Mail → tes stats opens sont **gonflées d'environ 20-30 %**.

Reste fiable :
- Comparaison **relative entre campagnes** (campagne A vs B).
- Clics et replies (non affectés par MPP).

## Activer / désactiver le tracking

Dans chaque campagne :
- **Open tracking** : activé par défaut, désactivable si tu veux des stats 100 % "vraies" (mais tu perds la métrique).
- **Click tracking** : activé par défaut. Désactivé : les liens sont nus (pas de redirection), mais tu perds la métrique click.

## Lire les stats d'une campagne

Onglet **Campagnes → ta campagne → Stats** :
- **Sent** : nombre d'emails envoyés.
- **Delivered** : envoyés - bounces.
- **Open rate** : ouvertures uniques / délivrés.
- **Click rate** : clics uniques / délivrés.
- **Reply rate** : réponses / délivrés (la métrique qui compte vraiment).
- **Bounce rate** : si > 5 %, problème de qualité d'emails.
- **Unsubscribe rate** : si > 2 %, problème de ciblage.

## Stats par prospect

Clique sur un prospect dans la campagne pour voir :
- Date/heure d'envoi de chaque étape.
- Opens (avec timestamp).
- Clicks (avec URL).
- Reply (avec extrait du message reçu).

## FAQ rapide

**Tracking GDPR-compliant ?** Oui, le pixel et les liens trackés sont mentionnés dans la politique de confidentialité Volia, et le lien de désinscription est obligatoire.
**Webhooks pour pousser les events ?** Oui, cf. [Webhooks sortants](/docs/webhooks-sortants).
**Stats exportables ?** Oui, en CSV depuis la page stats de la campagne.

## Articles liés

- [Webhooks sortants](/docs/webhooks-sortants)
- [Gestion des replies & auto-CRM](/docs/gestion-replies-auto-crm)
- [A/B testing subject](/docs/ab-testing-subject)
`,
  },
  {
    slug: 'gestion-replies-auto-crm',
    category: 'campagnes',
    title: 'Gestion des replies & auto-CRM',
    description: "Quand un prospect répond, Volia crée le deal dans le CRM automatiquement.",
    updatedAt: '2026-05-12',
    tags: ['replies', 'crm', 'auto', 'deal'],
    content: `## Le flow automatique

Quand un prospect répond à une de tes campagnes, Volia fait automatiquement 3 choses :

1. **Stoppe la séquence** : les étapes suivantes ne sont pas envoyées (logique anti-spam).
2. **Marque le prospect** comme "Replied" dans la liste de la campagne.
3. **Crée un deal** dans Volia CRM dans la colonne **"Nouveau lead"**, avec la réponse en pièce jointe / timeline.

## Activer l'auto-CRM

Par défaut, **activé** sur tous les comptes. Pour désactiver :
1. Va sur **Paramètres → Préférences**.
2. Décoche **Créer automatiquement un deal CRM à chaque reply**.

## Catégorisation IA des replies

Volia analyse la réponse avec Claude et la catégorise :
- 🟢 **Intéressé** : "Oui, dis-m'en plus", "On peut en parler ?"
- 🟡 **Pas le bon moment** : "Rappelle-moi dans 6 mois", "Pas de budget cette année"
- 🔴 **Non intéressé** : "Pas intéressé", "Stop"
- 🔵 **Désinscription** : "Désinscris-moi", "Unsubscribe"
- ⚪ **Out-of-office** : "Je suis en congés…"

Le deal créé est **pré-positionné dans la bonne colonne** du pipeline selon la catégorie.

## Traiter les replies

Va dans **CRM** → colonne **Nouveau lead** :
- Tu vois tous les deals créés par tes campagnes.
- Drag & drop vers **Qualifié**, **Démo prévue**, **Proposition envoyée**, etc.
- Réponds depuis Volia (la réponse part de ton domaine connecté).
- Toute l'historique de la campagne est dans la timeline du deal.

## Désinscriptions automatiques

Si la réponse contient "désinscris", "stop", "unsubscribe", "leave me alone" :
- Le prospect est **ajouté à ta blocklist** automatiquement.
- Il ne recevra plus aucun email de **aucune** de tes campagnes futures.
- Conformité RGPD / CNIL automatique.

## FAQ rapide

**Et les out-of-office ?** Volia détecte les OOO et **ne stoppe pas la séquence** (relance après la date de retour).
**Catégorisation IA fiable ?** ~ 92 % accuracy sur nos benchmarks internes. Tu peux corriger manuellement.
**Je peux désactiver l'auto-CRM ?** Oui, Paramètres → Préférences. Les replies restent visibles côté Campagne sans deal CRM créé.

## Articles liés

- [Pipeline kanban drag & drop](/docs/pipeline-kanban-drag-drop)
- [Auto-create deals depuis replies](/docs/auto-create-depuis-replies)
- [Tracking opens & clicks](/docs/tracking-opens-clicks)
`,
  },

  // ─────────────────────────────────────────────────────────────────────
  // CRM (6)
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'pipeline-kanban-drag-drop',
    category: 'crm',
    title: 'Pipeline kanban : drag & drop',
    description: "Manipuler ton pipeline en colonnes : créer, déplacer, fermer un deal.",
    updatedAt: '2026-05-12',
    tags: ['crm', 'kanban', 'pipeline', 'deal'],
    content: `## Vue kanban par défaut

Le CRM Volia s'affiche en **kanban horizontal** avec des colonnes représentant les étapes de ton pipeline.

Pipeline par défaut :
- **Nouveau lead** (entrée auto via [auto-CRM](/docs/auto-create-depuis-replies))
- **Qualifié**
- **Démo prévue**
- **Proposition envoyée**
- **Négociation**
- **Gagné** ✅
- **Perdu** ❌

Tu peux [créer tes propres pipelines](/docs/custom-pipelines) avec d'autres étapes.

## Manipuler les deals

### Déplacer un deal

Drag & drop d'une colonne à une autre. La date de changement est loggée dans la timeline.

### Créer un deal manuellement

1. Clique **+ Nouveau deal** dans la colonne souhaitée.
2. Renseigne nom, contact, valeur, date prévue de closing.
3. Sauvegarde.

### Ouvrir un deal

Clique sur la card pour ouvrir le panneau détail à droite :
- Infos contact (email, tel, entreprise).
- Champs custom.
- Timeline (emails, calls, notes).
- Activités à venir (rappels).

### Fermer un deal

- **Gagné** : drag dans la colonne Gagné → modale demande valeur finale + date.
- **Perdu** : drag dans la colonne Perdu → modale demande raison (Prix, Concurrent, Pas le bon moment, Autre).

## Filtres et tri

En haut du kanban :
- **Filtre par owner** (membre de l'équipe).
- **Filtre par tag** (tag custom sur les deals).
- **Filtre par valeur** (≥ X €).
- **Tri** : valeur décroissante, date close, date création.

## Vue liste alternative

Bouton **Vue liste** en haut à droite pour passer en tableau classique (sortable par colonne, exportable CSV).

## FAQ rapide

**Combien de deals max dans une colonne ?** Pas de limite technique, mais > 50 deviennent illisibles — filtre ou archive.
**Je peux annoter une card sans l'ouvrir ?** Oui, raccourci **N** (note rapide).
**Drag & drop sur mobile ?** Oui, gestures tactiles supportés.

## Articles liés

- [Créer un deal](/docs/creer-deal)
- [Custom pipelines](/docs/custom-pipelines)
- [Custom fields contacts & deals](/docs/custom-fields-contacts-deals)
`,
  },
  {
    slug: 'creer-deal',
    category: 'crm',
    title: 'Créer un deal',
    description: "3 façons de créer un deal : manuel, depuis prospect, depuis reply.",
    updatedAt: '2026-05-12',
    tags: ['crm', 'deal', 'creation'],
    content: `## 3 façons de créer un deal

### 1. Manuellement (cas standard)

1. Va dans **CRM**.
2. Clique sur **+ Nouveau deal** dans la colonne d'entrée.
3. Renseigne :
    - **Nom du deal** (ex: "Restaurant Le Soleil — site web")
    - **Contact** (nouveau ou existant)
    - **Valeur** estimée en €
    - **Date de clôture prévue**
    - **Owner** (membre équipe responsable)
    - **Tags** (ex: \`hot\`, \`enterprise\`, \`upsell\`)

### 2. Depuis un prospect (Volia Prospection)

1. Dans le panneau Résultats de Prospection.
2. Clique droit sur un prospect → **Créer un deal**.
3. Le contact est créé avec toutes les infos Google Places (nom, adresse, tel, email, site).
4. Renseigne juste la valeur estimée et la date.

### 3. Depuis un reply de campagne (auto-CRM)

Automatique si auto-CRM activé. Cf. [Gestion des replies & auto-CRM](/docs/gestion-replies-auto-crm).

Le deal arrive dans **Nouveau lead** avec la réponse en timeline. Tu n'as qu'à le qualifier et déplacer.

## Champs obligatoires vs optionnels

**Obligatoires** : Nom du deal, Contact.
**Optionnels mais recommandés** : Valeur, Date close prévue (pour avoir un forecast).
**Custom fields** : tous configurables, voir [Custom fields](/docs/custom-fields-contacts-deals).

## Bonnes pratiques nommage

Format conseillé : \`{{Nom entreprise}} — {{produit/service vendu}}\`
- ✅ "Garage Dupont — site web responsive"
- ✅ "Cabinet Martin — refonte branding"
- ❌ "Deal 142" (générique, illisible)

## FAQ rapide

**Plusieurs deals pour le même contact ?** Oui, illimité.
**Un contact peut être lié à plusieurs entreprises ?** En V1 : un contact = une entreprise. Multi-entreprises prévu Q4 2026.
**Doublons automatiques détectés ?** Oui, sur email + nom entreprise. Tu vois une alerte avant création.

## Articles liés

- [Pipeline kanban](/docs/pipeline-kanban-drag-drop)
- [Custom fields contacts & deals](/docs/custom-fields-contacts-deals)
- [Auto-create depuis replies](/docs/auto-create-depuis-replies)
`,
  },
  {
    slug: 'custom-pipelines',
    category: 'crm',
    title: 'Pipelines personnalisés',
    description: "Créer un pipeline custom (sales, support, recruitment…) avec tes propres étapes.",
    updatedAt: '2026-05-12',
    tags: ['crm', 'pipeline', 'custom', 'workflow'],
    content: `## Pourquoi plusieurs pipelines ?

Tu peux gérer plusieurs flux indépendamment :
- **Sales B2B** : pipeline classique 7 étapes.
- **Sales B2C** : pipeline raccourci 4 étapes.
- **Support** : ticket new → in progress → resolved → closed.
- **Recrutement** : candidatures, entretiens, offre, embauche.

## Créer un pipeline

1. Va dans **CRM → ⚙️ Paramètres → Pipelines**.
2. Clique **+ Nouveau pipeline**.
3. Donne-lui un nom (ex: "Sales B2B", "Support clients").
4. Définis les **étapes** dans l'ordre :
    - Nom (ex: "Qualifié")
    - Probabilité de win (0-100 %) — utilisée pour le forecast
    - Couleur (visuel kanban)
5. Sauvegarde.

## Switcher entre pipelines

En haut de la vue CRM, dropdown **Pipeline** : choisis lequel afficher.

## Pipeline par défaut

Tu peux marquer un pipeline comme **par défaut** :
- Les nouveaux deals créés (manuel ou auto-CRM) y atterrissent.
- Réglage dans **CRM → Paramètres → Pipelines**.

## Migrer un deal entre pipelines

Ouvre le deal → **Actions → Changer de pipeline** → choisis la nouvelle étape. La timeline garde l'historique.

## Limites par plan

| Plan | Nb pipelines |
| --- | --- |
| Free | 1 (default) |
| Solo | 2 |
| Pro | 5 |
| Business | illimité |

## FAQ rapide

**Je peux dupliquer un pipeline ?** Oui, action **Dupliquer** dans la liste des pipelines.
**Suppression d'un pipeline avec des deals dedans ?** Volia demande où migrer les deals avant suppression.
**Templates de pipelines pré-faits ?** Pas encore, prévu Q3 2026.

## Articles liés

- [Pipeline kanban](/docs/pipeline-kanban-drag-drop)
- [Custom fields contacts & deals](/docs/custom-fields-contacts-deals)
- [Timeline & activities](/docs/timeline-activities)
`,
  },
  {
    slug: 'custom-fields-contacts-deals',
    category: 'crm',
    title: 'Custom fields : contacts & deals',
    description: "Ajouter tes propres champs (texte, nombre, date, select) sur contacts et deals.",
    updatedAt: '2026-05-12',
    tags: ['crm', 'custom fields', 'contacts', 'deals'],
    content: `## Pourquoi des custom fields ?

Les champs standards (nom, email, valeur…) ne suffisent pas toujours. Custom fields = adapter Volia CRM à ton métier précis.

## Types de champs disponibles

| Type | Exemple |
| --- | --- |
| **Texte court** | "Code postal client", "Numéro SIRET" |
| **Texte long** | "Notes commerciales" |
| **Nombre** | "Effectif", "CA annuel" |
| **Date** | "Date prochain contact", "Anniversaire" |
| **Select (single)** | "Source du lead" : LinkedIn / Email / Salon / Reco |
| **Multi-select** | "Tags produits" : Site web, SEO, Ads |
| **Checkbox** | "RGPD signé" |
| **URL** | "Profil LinkedIn" |
| **Email** | "Email secondaire" |

## Créer un custom field

1. Va dans **CRM → ⚙️ Paramètres → Custom fields**.
2. Choisis **Contact** ou **Deal**.
3. Clique **+ Nouveau champ**.
4. Configure :
    - Nom du champ (ex: "Code SIRET")
    - Type
    - Obligatoire ou non
    - Visible dans la liste / le détail / les exports
5. Sauvegarde.

Le champ apparaît immédiatement sur tous les contacts/deals.

## Limites par plan

| Plan | Custom fields contact | Custom fields deal |
| --- | --- | --- |
| Free | 3 | 3 |
| Solo | 10 | 10 |
| Pro | 25 | 25 |
| Business | illimité | illimité |

## Utiliser dans les filtres et exports

Tous les custom fields sont :
- **Filtrables** dans le kanban et la vue liste.
- **Exportables** en CSV.
- **Utilisables comme variables** dans les campagnes : \`{{custom_code_siret}}\`, \`{{custom_effectif}}\`.

## FAQ rapide

**Renommer un custom field ?** Oui, sans perdre les valeurs.
**Supprimer un custom field ?** Confirmation requise, les valeurs sont effacées (irréversible).
**Custom fields synchronisés avec l'API ?** Oui, voir [API publique v1](/docs/api-publique-v1).

## Articles liés

- [Créer un deal](/docs/creer-deal)
- [Pipeline kanban](/docs/pipeline-kanban-drag-drop)
- [API publique v1](/docs/api-publique-v1)
`,
  },
  {
    slug: 'timeline-activities',
    category: 'crm',
    title: 'Timeline & activities',
    description: "Logger des appels, notes, emails et rappels sur chaque deal pour ne rien oublier.",
    updatedAt: '2026-05-12',
    tags: ['crm', 'timeline', 'activities', 'rappels'],
    content: `## La timeline du deal

Quand tu ouvres un deal, la **timeline** liste chronologiquement tout ce qui s'est passé :
- 📧 Emails envoyés (depuis Volia Campagnes)
- 📥 Replies reçus
- 📞 Appels loggés manuellement
- 📝 Notes ajoutées
- 🔄 Changements d'étape (auto)
- ✅ Tasks complétées
- ⏰ Rappels créés/effectués

## Logger une activité

Bouton **+ Activité** en haut du panneau deal. 4 types :

### 📞 Appel

- Durée
- Notes du call
- Résultat (Connecté / Voicemail / Pas de réponse)
- Date / heure

### 📝 Note

- Texte libre (markdown supporté)
- Optionnel : mention de membres (\`@alex\`) qui reçoivent une notif

### 📧 Email (hors campagne)

- Subject, body
- Envoyé depuis ton domaine connecté
- Reply tracking actif

### ⏰ Rappel / Task

- Titre
- Date d'échéance
- Owner (toi ou collègue)
- Notification email + dashboard au bon moment

## Voir tous tes rappels

**Dashboard → Mes tâches** : liste tous les rappels qui te sont assignés, triés par date d'échéance. Rappels en retard surlignés en rouge.

## Filtrer la timeline

En haut de la timeline d'un deal, filtres :
- **Type** : tout / emails / appels / notes / tasks
- **Owner** : tous / moi / membre X

## FAQ rapide

**Intégration calendrier (Google Cal, Outlook) ?** Pas encore, prévu Q3 2026.
**Appels VoIP intégrés ?** Pas en V1. Integrations Aircall / Ringover prévues.
**Recording des appels ?** Non, pour des raisons RGPD.

## Articles liés

- [Pipeline kanban](/docs/pipeline-kanban-drag-drop)
- [Gestion des replies & auto-CRM](/docs/gestion-replies-auto-crm)
- [Auto-create depuis replies](/docs/auto-create-depuis-replies)
`,
  },
  {
    slug: 'auto-create-depuis-replies',
    category: 'crm',
    title: 'Auto-create deals depuis replies',
    description: "Configurer la création automatique de deals quand un prospect répond.",
    updatedAt: '2026-05-12',
    tags: ['crm', 'auto', 'replies', 'automation'],
    content: `## Le principe

Chaque reply à une campagne crée un deal dans le CRM, avec :
- **Contact** pré-rempli (nom, email, entreprise depuis le prospect).
- **Pipeline** : par défaut.
- **Étape** : "Nouveau lead" (ou équivalent dans ton pipeline).
- **Catégorie IA** : Intéressé / Pas le bon moment / Non intéressé / Désinscription / OOO.
- **Timeline** : tout l'historique de la campagne (emails envoyés, ouvertures, reply).

## Activation

Activé par défaut. Pour désactiver / reconfigurer :
1. **Paramètres → Préférences**.
2. Section **Automatisations CRM**.
3. Toggle **Créer automatiquement un deal CRM à chaque reply**.

## Personnaliser le routing

Tu peux router les deals créés vers un pipeline ou une étape spécifique selon la **catégorie IA** :

| Catégorie | Pipeline / Étape par défaut |
| --- | --- |
| 🟢 Intéressé | Sales B2B → Qualifié |
| 🟡 Pas le bon moment | Sales B2B → Nurturing |
| 🔴 Non intéressé | (pas de deal créé) |
| 🔵 Désinscription | (pas de deal créé + ajout blocklist) |
| ⚪ Out-of-office | (pas de deal créé, séquence relancée plus tard) |

Modifie le mapping dans **Paramètres → Automatisations → Routing replies**.

## Assigner automatiquement à un owner

Configure dans **Paramètres → Automatisations → Owner par défaut** :
- **Toujours moi** (ton compte)
- **Round-robin** entre membres de l'équipe (utile pour SDR teams)
- **Owner de la campagne** (suit qui a créé la campagne)

## Notifs sur nouveau deal

Quand un deal est créé auto :
- Notif dashboard (cloche) pour l'owner.
- Notif email si activée dans **Paramètres → Notifications**.
- Webhook \`deal.created\` envoyé si configuré (cf. [Webhooks](/docs/webhooks-sortants)).

## FAQ rapide

**Je peux désactiver pour une campagne précise ?** Oui, dans les paramètres avancés de la campagne.
**Et si le contact existe déjà ?** Volia détecte le doublon et **ajoute juste un deal au contact existant** (pas de duplication contact).
**Erreur IA catégorisation ?** Re-catégorise manuellement dans le deal — Volia apprend (mais ne ré-route pas l'ancien deal).

## Articles liés

- [Gestion des replies & auto-CRM](/docs/gestion-replies-auto-crm)
- [Custom pipelines](/docs/custom-pipelines)
- [Webhooks sortants](/docs/webhooks-sortants)
`,
  },

  // ─────────────────────────────────────────────────────────────────────
  // API & INTÉGRATIONS (5)
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'api-publique-v1',
    category: 'api-integrations',
    title: 'API publique v1',
    description: "Endpoints REST pour prospects, campagnes, deals. Auth Bearer, rate-limited.",
    updatedAt: '2026-05-12',
    tags: ['api', 'rest', 'integration', 'developer'],
    content: `## URL de base

\`\`\`
https://api.volia.fr/v1
\`\`\`

## Authentication

Toutes les requêtes nécessitent un header :

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

Génère ta clé API dans **Paramètres → API & intégrations**. Cf. [Clés API & sécurité](/docs/cles-api-securite).

## Rate limits

- **60 requêtes / minute** par clé API (Free / Solo).
- **300 requêtes / minute** (Pro).
- **1500 requêtes / minute** (Business).

Si dépassé : HTTP 429 + header \`Retry-After\`.

## Endpoints principaux

### Prospects

\`\`\`
GET    /v1/prospects                      Liste paginated
GET    /v1/prospects/:id                  Détail
POST   /v1/prospects                      Créer (manuel)
PATCH  /v1/prospects/:id                  Update
DELETE /v1/prospects/:id                  Delete
POST   /v1/prospects/search               Lancer une recherche (async, retourne job_id)
GET    /v1/prospects/search/:job_id       Statut d'une recherche
\`\`\`

### Campagnes

\`\`\`
GET    /v1/campaigns                      Liste
POST   /v1/campaigns                      Créer
PATCH  /v1/campaigns/:id                  Update
POST   /v1/campaigns/:id/launch           Lancer
POST   /v1/campaigns/:id/pause            Pause
GET    /v1/campaigns/:id/stats            Stats
\`\`\`

### CRM

\`\`\`
GET    /v1/deals                          Liste deals
POST   /v1/deals                          Créer
PATCH  /v1/deals/:id                      Update (changer étape, valeur…)
GET    /v1/contacts/:id                   Détail contact
GET    /v1/pipelines                      Liste pipelines + étapes
\`\`\`

## Exemple — Lister mes 50 derniers prospects

\`\`\`bash
curl -H "Authorization: Bearer sk_live_xxx" \\
  https://api.volia.fr/v1/prospects?limit=50&order=desc
\`\`\`

## Exemple — Créer un deal

\`\`\`bash
curl -X POST https://api.volia.fr/v1/deals \\
  -H "Authorization: Bearer sk_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Garage Dupont — site web",
    "value": 5000,
    "contact_id": "ctc_abc123",
    "pipeline_id": "pip_default",
    "stage": "Qualifié"
  }'
\`\`\`

## Format réponse

JSON uniquement. Pagination cursor-based (\`next_cursor\`).

\`\`\`json
{
  "data": [ { ... }, { ... } ],
  "next_cursor": "eyJpZCI6...",
  "has_more": true
}
\`\`\`

## FAQ rapide

**Doc OpenAPI (Swagger) ?** Disponible sur [api.volia.fr/v1/openapi.json](https://api.volia.fr/v1/openapi.json).
**SDK officiel ?** Pas encore — Node SDK prévu Q3 2026.
**Webhooks sortants ?** Oui, cf. [Webhooks](/docs/webhooks-sortants).

## Articles liés

- [Clés API & sécurité](/docs/cles-api-securite)
- [Webhooks sortants](/docs/webhooks-sortants)
- [Intégration Zapier](/docs/integration-zapier)
`,
  },
  {
    slug: 'webhooks-sortants',
    category: 'api-integrations',
    title: 'Webhooks sortants',
    description: "Pousser les events Volia (deal créé, reply, campagne terminée) vers ton endpoint HTTPS.",
    updatedAt: '2026-05-12',
    tags: ['webhooks', 'api', 'events', 'http'],
    content: `## Concept

Volia peut **pousser** des events HTTP vers ton serveur dès qu'ils se produisent, plutôt que de te faire poller l'API.

## Events disponibles

| Event | Quand |
| --- | --- |
| \`prospect.created\` | Nouveau prospect ajouté |
| \`prospect.enriched\` | Email trouvé via waterfall |
| \`campaign.launched\` | Campagne démarrée |
| \`campaign.completed\` | Tous les emails envoyés |
| \`email.sent\` | Email envoyé |
| \`email.opened\` | Email ouvert (warning: open tracking biased) |
| \`email.clicked\` | Lien cliqué |
| \`email.replied\` | Reply reçu |
| \`email.bounced\` | Hard bounce |
| \`email.unsubscribed\` | Désinscription |
| \`deal.created\` | Nouveau deal CRM |
| \`deal.stage_changed\` | Deal changé d'étape |
| \`deal.won\` / \`deal.lost\` | Deal clôturé |

## Configurer un webhook

1. Va sur **Paramètres → Webhooks**.
2. Clique **+ Nouveau webhook**.
3. Configure :
    - **URL endpoint** : ton serveur HTTPS (HTTPS obligatoire, HTTP refusé).
    - **Events** : coche ceux à recevoir.
    - **Secret** : auto-généré, sert à signer les payloads.
4. Sauvegarde.

## Payload format

POST JSON :

\`\`\`json
{
  "event": "deal.created",
  "occurred_at": "2026-05-12T14:32:01Z",
  "data": {
    "id": "deal_xxx",
    "name": "Garage Dupont — site web",
    "value": 5000,
    "stage": "Nouveau lead",
    "pipeline": "Sales B2B",
    ...
  }
}
\`\`\`

Header signature :

\`\`\`
X-Volia-Signature: sha256=abc123...
\`\`\`

Vérifie la signature côté serveur avec ton secret (HMAC-SHA256 sur le body).

## Retry policy

Si ton endpoint répond ≠ 2xx :
- Retry après 30 sec, 2 min, 10 min, 1 h, 6 h, 24 h.
- Après 6 tentatives échouées : webhook désactivé automatiquement + alerte email.

## Logs et debug

**Paramètres → Webhooks → ton webhook → Logs** :
- Historique des 100 derniers événements envoyés.
- Status HTTP, body de la réponse, durée.
- Bouton **Replay** pour rejouer un event.

## FAQ rapide

**Multiples endpoints possibles ?** Oui, illimité (Pro+), 1 (Free).
**Test endpoint avant prod ?** Utilise [webhook.site](https://webhook.site) pour voir les payloads.
**Délai max avant timeout ?** Ton endpoint doit répondre en < 10 sec.

## Articles liés

- [API publique v1](/docs/api-publique-v1)
- [Intégration Zapier](/docs/integration-zapier)
- [Intégration Make](/docs/integration-make)
`,
  },
  {
    slug: 'integration-zapier',
    category: 'api-integrations',
    title: 'Intégration Zapier',
    description: "Connecter Volia à 5000+ apps via Zapier sans coder.",
    updatedAt: '2026-05-12',
    tags: ['zapier', 'integration', 'no-code', 'automation'],
    content: `## L'intégration Volia Zapier

Disponible sur [zapier.com/apps/volia](https://zapier.com/apps/volia) — installation en 2 clics.

## Triggers Volia disponibles

- **New Prospect Found** : un prospect ajouté.
- **New Reply Received** : un reply reçu.
- **Deal Created** : un deal créé dans le CRM.
- **Deal Won** : un deal clôturé en Gagné.
- **Campaign Completed** : une campagne terminée.

## Actions Volia disponibles

- **Create Prospect** : ajouter un prospect manuellement (depuis Google Sheets, Typeform…).
- **Add Prospect to Campaign** : pousser un prospect dans une campagne existante.
- **Create Deal** : créer un deal CRM (depuis Calendly, HubSpot…).
- **Update Deal Stage** : changer l'étape d'un deal.
- **Log Activity** : ajouter une note/activité sur un deal.

## Exemple Zap — Nouveau reply → Notif Slack

1. Trigger : Volia → **New Reply Received**
2. Filter : catégorie = "Intéressé"
3. Action : Slack → Send Channel Message → \`#sales-replies\`

→ Tu reçois une notif Slack avec extrait du reply à chaque lead chaud.

## Exemple Zap — Calendly démo → Deal CRM

1. Trigger : Calendly → **New Booking**
2. Action : Volia → **Create Deal**
    - Pipeline : Sales B2B
    - Étape : Démo prévue
    - Contact : email Calendly
    - Valeur estimée : 5000 €

→ Tous tes RDV démo créent un deal CRM automatiquement.

## Authentification

À l'install du Zap :
1. Zapier te demande ta clé API Volia.
2. Génère-la dans **Paramètres → API & intégrations → Nouvelle clé**.
3. Colle-la dans Zapier — connexion établie.

## Tarifs

- **Zapier Free** : 100 tasks/mois, suffisant pour démarrer.
- **Zapier Starter** : 19$/mo, 750 tasks.
- **Zapier Pro** : 49$/mo, 2000 tasks (recommandé pour automations sérieuses).

L'utilisation Zapier ne consomme **pas** ton quota Volia (sauf actions Create qui peuvent décrémenter le quota prospects).

## FAQ rapide

**Make.com ou n8n ?** Oui, cf. [Intégration Make](/docs/integration-make). n8n natif via webhooks.
**Erreur "401 Unauthorized" ?** Régénère ta clé API et reconnecte le Zap.
**Délai trigger ?** ~ 1-3 min (Zapier polle ou reçoit le webhook).

## Articles liés

- [Intégration Make](/docs/integration-make)
- [Webhooks sortants](/docs/webhooks-sortants)
- [API publique v1](/docs/api-publique-v1)
`,
  },
  {
    slug: 'integration-make',
    category: 'api-integrations',
    title: 'Intégration Make',
    description: "Plus puissant que Zapier sur les workflows complexes — installer le module Volia.",
    updatedAt: '2026-05-12',
    tags: ['make', 'integromat', 'integration', 'no-code'],
    content: `## Pourquoi Make plutôt que Zapier ?

- ✅ Workflows visuels complexes (boucles, branches conditionnelles, error handling).
- ✅ Moins cher (Free 1000 ops/mo, Core 9$/mo 10k ops).
- ✅ Meilleur pour les power-users.

Zapier reste mieux pour : intégrations rapides single-trigger, simplicité.

## Installation

L'intégration Volia est dispo sur [make.com/apps/volia](https://make.com/apps/volia).

1. Crée un compte Make (free).
2. Nouveau scénario → cherche **Volia**.
3. À l'ajout du 1er module Volia, Make demande ta clé API.
4. Génère-la dans Volia → **Paramètres → API & intégrations**.
5. Colle-la dans Make.

## Modules Volia disponibles

### Triggers

- **Watch Prospects** : nouveau prospect.
- **Watch Replies** : nouveau reply.
- **Watch Deals** : nouveau deal ou changement d'étape.

### Actions

- **Create Prospect**
- **Get Prospect**
- **Update Prospect**
- **List Prospects**
- **Create Deal**
- **Update Deal**
- **Get Pipeline / Stages**
- **Add to Campaign**

### Search

- **Search Prospects by filter** : retourne une liste filtrée.

## Exemple scénario — Lead scoring → Auto-CRM

1. Trigger : Volia → **Watch Prospects** (new prospects toutes les 15 min).
2. Filter : note Google ≥ 4.5 ET nb_avis ≥ 50.
3. HTTP module : enrichir via Clearbit (CA, effectif).
4. Filter : CA estimé ≥ 1M€.
5. Action : Volia → **Create Deal** (pipeline "Hot leads", étape "Qualifié auto").
6. Action : Slack → Notify \`#sales-hot\`.

→ Pipeline auto-alimenté en deals ultra-qualifiés.

## Tarifs Make

- **Free** : 1 000 ops/mo, 2 scénarios actifs.
- **Core** : 9$/mo, 10 000 ops, scénarios illimités.
- **Pro** : 16$/mo, 10 000 ops + features avancées.

## FAQ rapide

**Webhook Make = plus rapide que polling ?** Oui, utilise les triggers "instant" quand possible.
**Erreur 429 (rate limit) ?** Augmente l'intervalle entre runs ou upgrade ton plan Volia.
**Debug d'un scénario ?** Bouton "Run once" + inspecte chaque module.

## Articles liés

- [Intégration Zapier](/docs/integration-zapier)
- [Webhooks sortants](/docs/webhooks-sortants)
- [API publique v1](/docs/api-publique-v1)
`,
  },
  {
    slug: 'cles-api-securite',
    category: 'api-integrations',
    title: 'Clés API & sécurité',
    description: "Générer, révoquer, scoper tes clés API. Bonnes pratiques de sécurité.",
    updatedAt: '2026-05-12',
    tags: ['api', 'cles', 'securite', 'bearer'],
    content: `## Format des clés

\`\`\`
sk_live_abc123def456...
\`\`\`

- Préfixe \`sk_live_\` (production) ou \`sk_test_\` (sandbox, à venir).
- 64 caractères alphanumériques.
- Affichée **une seule fois** au moment de la création. Stocke-la en lieu sûr (1Password, Vault).

## Générer une clé

1. **Paramètres → API & intégrations**.
2. Clique **+ Nouvelle clé API**.
3. Donne-lui un nom (ex: "Zapier prod", "Script Python interne").
4. (Optionnel) Restreins par **scopes** (Pro+ uniquement) :
    - \`prospects:read\` / \`prospects:write\`
    - \`campaigns:read\` / \`campaigns:write\`
    - \`deals:read\` / \`deals:write\`
    - \`*\` (full access)
5. Copie la clé immédiatement après affichage.

## Révoquer une clé

1. **Paramètres → API & intégrations**.
2. Liste des clés → bouton **Révoquer**.
3. Confirmation → la clé est invalidée immédiatement (toutes les requêtes futures retournent 401).

À faire systématiquement :
- Si tu suspectes une fuite.
- Si tu changes de prestataire (script externe).
- Si un membre de l'équipe quitte.

## Bonnes pratiques

- ❌ **Jamais** de clé en clair dans un repo Git.
- ❌ **Jamais** de clé dans le code frontend (visible aux users).
- ✅ Stocke en **variables d'environnement** (\`.env\`, Vercel env, AWS Secrets Manager).
- ✅ **Rotate** tes clés tous les 6-12 mois.
- ✅ **Scope** au strict minimum (1 clé Zapier = lecture prospects + écriture deals, pas full access).

## Limites par plan

| Plan | Nb clés API actives |
| --- | --- |
| Free | 1 |
| Solo | 3 |
| Pro | 10 |
| Business | illimité |

## Audit log

Sur Pro+, **Paramètres → API → Audit log** :
- Historique des 30 derniers jours.
- Filtrable par clé, endpoint, status code, IP.
- Export CSV.

## FAQ rapide

**Une clé compromise = data leak ?** Oui, révoque immédiatement et change ce qui a pu être consulté.
**Restriction par IP ?** Pas en V1, prévu Q4 2026 (Business only).
**Sandbox / test mode ?** Pas encore, prévu Q3 2026.

## Articles liés

- [API publique v1](/docs/api-publique-v1)
- [Webhooks sortants](/docs/webhooks-sortants)
- [Inviter mon équipe](/docs/inviter-equipe)
`,
  },

  // ─────────────────────────────────────────────────────────────────────
  // COMPTE & FACTURATION (5)
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'changer-plan',
    category: 'compte',
    title: 'Changer de plan',
    description: "Upgrader ou downgrader, comment ça se passe côté facturation et quota.",
    updatedAt: '2026-05-12',
    tags: ['plan', 'upgrade', 'downgrade', 'stripe'],
    content: `## Upgrader (passer à un plan supérieur)

1. Va sur **Paramètres → Plan & Usage**.
2. Clique sur le plan souhaité.
3. Tu es redirigé vers **Stripe Checkout** (CB / SEPA / virement / Apple Pay).
4. Confirme le paiement.
5. **Effet immédiat** : nouveau quota actif, nouvelles fonctionnalités débloquées.

### Facturation au prorata

Si tu upgrades en cours de mois, Stripe te facture **uniquement le delta** prorata sur les jours restants du cycle. Exemple :
- 10 du mois, tu passes de Solo (19€) à Pro (49€).
- Stripe te facture : (49 - 19) × (20 jours restants / 30) ≈ **20 €**.
- Le mois suivant, facturation normale 49 €.

## Downgrader (passer à un plan inférieur)

1. Mêmes étapes, choisis un plan inférieur.
2. **Effet différé** : ton plan actuel reste actif jusqu'à **la fin de la période payée**.
3. Au prochain cycle, tu passes au nouveau plan.

### Si je downgrade et que je suis au-dessus du nouveau quota ?

- Aucun prospect ne sera supprimé.
- Mais tu ne pourras plus en ajouter tant que ton usage est au-dessus du nouveau quota.

## Passage mensuel ↔ annuel

L'annuel offre **2 mois gratuits** :
- Solo : 19 €/mo → 190 €/an (au lieu de 228 €).
- Pro : 49 €/mo → 490 €/an (au lieu de 588 €).
- Business : 99 €/mo → 990 €/an (au lieu de 1188 €).

Bascule depuis **Paramètres → Plan & Usage** → onglet **Annuel**. Effet immédiat (Stripe te crédite ce qui a déjà été payé).

## FAQ rapide

**Free → Payant en 1 clic ?** Oui, via Stripe Checkout.
**Annulation possible ?** Oui à tout moment, cf. [Annuler abonnement](/docs/annuler-abonnement).
**Refund ?** Politique : refund pro rata des jours non consommés sur demande à support@volia.fr dans les 14 jours.

## Articles liés

- [Annuler mon abonnement](/docs/annuler-abonnement)
- [Gérer ma facturation Stripe](/docs/gerer-facturation-stripe)
- [Comprendre les plans](/docs/comprendre-plans)
`,
  },
  {
    slug: 'annuler-abonnement',
    category: 'compte',
    title: 'Annuler mon abonnement',
    description: "Comment résilier, ce qui se passe ensuite, comment réactiver.",
    updatedAt: '2026-05-12',
    tags: ['annulation', 'cancel', 'resiliation'],
    content: `## Annuler depuis Volia

1. **Paramètres → Plan & Usage → Gérer mon abonnement**.
2. Tu arrives sur le **portail client Stripe**.
3. Clique sur **Annuler l'abonnement**.
4. Confirme (Stripe demande une raison optionnelle).

## Ce qui se passe ensuite

- ✅ Ton plan actuel reste **actif jusqu'à la fin de la période payée** (pas de refund automatique).
- ✅ À la fin, tu repasses en **plan Free** automatiquement.
- ✅ Tes données (prospects, campagnes, deals) sont **conservées**.
- ❌ Tes campagnes en cours sont **stoppées** quand tu repasses Free (Free n'a pas accès aux campagnes au-delà du test).

## Email de confirmation

Tu reçois :
- Email de confirmation d'annulation immédiate.
- Email rappel 3 jours avant la fin de la période payée.
- Email de bascule en Free à la fin.

## Réactiver

À tout moment dans **Paramètres → Plan & Usage** :
1. Clique sur ton ancien plan.
2. Stripe Checkout → paiement.
3. Réactivation immédiate, données intactes.

## Annuler **immédiatement** (sans attendre la fin)

Possible via support : envoie un mail à **support@volia.fr** avec ton email de compte. On annule + refund pro rata sous 24-48h.

## Suppression complète du compte

L'annulation **ne supprime pas** ton compte. Pour supprimer toutes tes données : cf. [Supprimer mon compte](/docs/supprimer-compte).

## FAQ rapide

**Pourquoi pas de refund auto ?** Politique standard SaaS B2B (tu as accès au service jusqu'à la fin payée).
**Annulation = perte des prospects ?** Non, les données restent en base. Tu peux exporter avant si rassuré.
**Et si je perds l'accès Stripe ?** Mail support@volia.fr, on traite manuellement.

## Articles liés

- [Changer de plan](/docs/changer-plan)
- [Gérer ma facturation Stripe](/docs/gerer-facturation-stripe)
- [Supprimer mon compte](/docs/supprimer-compte)
`,
  },
  {
    slug: 'gerer-facturation-stripe',
    category: 'compte',
    title: 'Gérer ma facturation Stripe',
    description: "Factures PDF, modifier CB, ajouter TVA intracom, gérer les paiements échoués.",
    updatedAt: '2026-05-12',
    tags: ['stripe', 'facturation', 'cb', 'factures', 'tva'],
    content: `## Accéder au portail client Stripe

1. **Paramètres → Plan & Usage → Gérer ma facturation**.
2. Tu es redirigé vers le portail Stripe sécurisé.
3. Tu y trouves :
    - Tes factures (téléchargement PDF).
    - Ta CB enregistrée (modifiable).
    - Ton historique de paiements.
    - Tes coordonnées de facturation (raison sociale, adresse, TVA).

## Télécharger une facture

- Liste des factures dans le portail Stripe.
- Clique sur l'icône PDF à droite d'une ligne.
- Format conforme aux normes comptables FR (mentions légales, TVA, etc.).

## Modifier la carte bancaire

1. Portail Stripe → **Méthodes de paiement**.
2. Clique **Ajouter une méthode**.
3. Renseigne nouvelle CB / SEPA.
4. Définis comme méthode par défaut.
5. Supprime l'ancienne.

## Ajouter ton numéro de TVA intracommunautaire

Si tu es une entreprise UE hors France :
1. Portail Stripe → **Informations de facturation**.
2. Champ **VAT ID** : renseigne ton numéro (ex: BE0123456789).
3. Sauvegarde.

→ Tes prochaines factures sont émises **hors TVA** (autoliquidation).

## Payment failed (paiement échoué)

Si Stripe n'arrive pas à débiter ta CB :
1. **J0** : 1ère tentative échouée → email d'alerte.
2. **J+3, J+5, J+7** : nouvelles tentatives auto.
3. **J+7** : si toujours échec, ton plan repasse en **Free** + email de notification.

Pour éviter ça : garde ta CB à jour, vérifie tes notifs.

## Coordonnées de facturation (raison sociale)

À l'inscription, tu peux renseigner :
- Raison sociale (ex: "Mon Agence SAS")
- Adresse de facturation
- SIRET (FR), TVA intracom (UE)

Modifiable à tout moment dans le portail Stripe.

## FAQ rapide

**Virement bancaire dispo ?** Oui sur Business uniquement (annual seulement). Contact support@volia.fr.
**Refund possible via Stripe ?** Oui, demande à support@volia.fr — on gère depuis Stripe Dashboard.
**Facture pour les comptes Free ?** Non (plan gratuit, pas de facture).

## Articles liés

- [Changer de plan](/docs/changer-plan)
- [Annuler mon abonnement](/docs/annuler-abonnement)
`,
  },
  {
    slug: 'rgpd-export-donnees',
    category: 'compte',
    title: 'RGPD : exporter mes données',
    description: "Exporter toutes tes données (prospects, campagnes, deals) en 1 clic.",
    updatedAt: '2026-05-12',
    tags: ['rgpd', 'export', 'donnees', 'gdpr'],
    content: `## Le droit à la portabilité

Le RGPD (Art. 20) te donne le droit de récupérer toutes tes données dans un format structuré lisible par machine. Volia te le fournit en 1 clic.

## Demander un export complet

1. Va sur **Paramètres → Préférences → Mes données**.
2. Clique **Exporter toutes mes données**.
3. Volia prépare un fichier ZIP avec :
    - \`prospects.csv\` (tous tes prospects)
    - \`campaigns.csv\` (toutes tes campagnes + stats)
    - \`emails_sent.csv\` (historique d'envois)
    - \`deals.csv\` (tous tes deals CRM)
    - \`contacts.csv\` (tous tes contacts CRM)
    - \`activities.csv\` (timeline complète)
    - \`account.json\` (infos de ton compte)
4. Tu reçois un **email avec un lien de téléchargement** valable 7 jours.
5. Le ZIP est chiffré par un mot de passe envoyé séparément (par sécurité).

## Délai de génération

- Compte Free / Solo : < 1 min.
- Compte Pro : 1-5 min.
- Compte Business avec > 50 000 prospects : 5-30 min.

## Que faire du fichier ?

Tu peux :
- Importer dans un autre outil (HubSpot, Pipedrive, Salesforce…).
- Garder en archive locale.
- Le transmettre à ton DPO pour audit.

## Données conservées vs. supprimées

L'export inclut **toutes les données te concernant**. Mais Volia conserve quelques métadonnées techniques (logs anonymisés, audit DMARC) jusqu'à 12 mois après ton départ pour des raisons légales (lutte fraude, abus).

## FAQ rapide

**Coût ?** Gratuit, illimité (1 export/jour max pour éviter l'abus).
**Format compatible avec quel outil ?** CSV UTF-8 standard, importable partout.
**Et les fichiers attachés (images, signatures) ?** Inclus si tu en as uploadé dans Volia.

## Articles liés

- [Page RGPD complète](/rgpd)
- [Supprimer mon compte](/docs/supprimer-compte)
- [Filtrage RGPD emails personnels](/docs/filtrage-rgpd-emails-personnels)
`,
  },
  {
    slug: 'supprimer-compte',
    category: 'compte',
    title: 'Supprimer mon compte',
    description: "Suppression définitive : ce qui se passe, comment exporter avant, comment confirmer.",
    updatedAt: '2026-05-12',
    tags: ['suppression', 'compte', 'rgpd', 'danger'],
    content: `## ⚠️ Action irréversible

La suppression de compte est **définitive sous 30 jours**. Toutes tes données seront effacées (prospects, campagnes, deals, contacts, paramètres). Aucune restauration possible passé ce délai.

## Avant de supprimer

**Pense à** :
1. ✅ [Exporter toutes tes données](/docs/rgpd-export-donnees) (1 clic, 1 ZIP).
2. ✅ Vérifier qu'aucune campagne en cours n'est critique (arrête-les).
3. ✅ Récupérer tes factures (cf. [Gérer facturation](/docs/gerer-facturation-stripe)).
4. ✅ Annuler ton abonnement Stripe (sinon Stripe continue de débiter).

## Comment supprimer

1. **Paramètres → Zone dangereuse**.
2. Clique **Supprimer mon compte**.
3. Tape ton email exact pour confirmer.
4. Renseigne le mot de passe (sécurité).
5. (Optionnel) Réponds à la question "Pourquoi tu pars ?" (nous aide à améliorer).
6. Clique **Supprimer définitivement**.

## Ce qui se passe ensuite

| Étape | Délai |
| --- | --- |
| Compte verrouillé (plus d'accès) | Immédiat |
| Email de confirmation reçu | Immédiat |
| Annulation abonnement Stripe | Immédiat |
| Email "période de grâce 30 jours" | J0 |
| Possibilité de réactiver via support | J0 à J30 |
| **Suppression définitive** | **J30** |

## Période de grâce 30 jours

Pendant les 30 jours :
- Compte verrouillé mais données conservées.
- Mail à **support@volia.fr** pour réactiver (full restore).
- Au-delà : impossible, suppression irréversible.

## Données vraiment supprimées

- ✅ Tous les prospects, campagnes, deals, contacts, activités, custom fields.
- ✅ Email + profil utilisateur.
- ✅ Domaines email connectés.
- ✅ Clés API + webhooks.
- ⚠️ **Conservés 12 mois** (légal) : logs anonymisés, factures Stripe, audit DMARC.
- ⚠️ Si tu es l'admin d'un workspace équipe : les autres membres perdent l'accès aussi.

## FAQ rapide

**Si je suis dans un workspace équipe et pas admin ?** Tu pars du workspace mais ne supprimes pas les données équipe.
**Et mes prospects désinscrits (blocklist) ?** Conservés (obligation légale CNIL — pour empêcher d'autres comptes Volia de les contacter).
**Suppression GDPR-compliant ?** Oui, art. 17 du RGPD respecté.

## Articles liés

- [Exporter mes données RGPD](/docs/rgpd-export-donnees)
- [Annuler mon abonnement](/docs/annuler-abonnement)
- [Page RGPD](/rgpd)
`,
  },
];

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

export function getAllArticles() {
  return DOCS_ARTICLES;
}

export function getArticleBySlug(slug) {
  return DOCS_ARTICLES.find((a) => a.slug === slug) || null;
}

export function getArticlesByCategory(categoryId) {
  return DOCS_ARTICLES.filter((a) => a.category === categoryId);
}

export function getCategoryById(id) {
  return DOCS_CATEGORIES.find((c) => c.id === id) || null;
}

export function getCategoriesWithCounts() {
  return DOCS_CATEGORIES.map((cat) => ({
    ...cat,
    count: DOCS_ARTICLES.filter((a) => a.category === cat.id).length,
  }));
}
