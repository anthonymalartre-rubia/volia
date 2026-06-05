# Volia Immo — Étude de marché, business plan, positionnement & pitch
*SaaS de prospection & conversion pour agents immobiliers — document stratégique (juin 2026)*

> Chiffres marché sourcés (voir §8). Les projections financières sont des **hypothèses de travail**, à challenger avec tes premiers clients.

---

## 0. Résumé exécutif (TL;DR)

**Le produit.** Un copilote de prospection pour agents/mandataires immobiliers : il **détecte les biens mis en vente dès leur publication** (pige multi-portails), **score et priorise** les opportunités, **déclenche le bon contact au bon moment**, et **remplit le pipeline de mandats** — sans scraping manuel, sans copier-coller, sans jongler entre 5 outils.

**Pourquoi maintenant.** Le marché de la pige est mature mais **fragmenté** (soit pige seule, soit CRM seul). Personne ne fait proprement **pige → tunnel automatisé → CRM** avec une couche IA. Et surtout : la **réforme du démarchage (11 août 2026)** va imposer le **consentement préalable** — ce qui va tuer le cold-calling de masse et donner une prime énorme à ceux qui captent des **leads vendeurs en opt-in** (tunnel d'estimation). C'est exactement le produit à construire.

**L'atout décisif.** 70 % de la techno existe déjà dans Volia (CRM, Campagnes, Forms, scoring Autopilot, facturation, multi-users). Le net-new = **un connecteur de données pige + des workflows métier immo**. MVP en **4–6 semaines**, pas 6 mois.

**La donnée : acheter, pas scraper.** Brancher une API d'agrégation (Melo & co) qui porte le risque technique/juridique du scraping Leboncoin. Coût ~100 €/mois de base.

**Le marché.** ~30–32 000 agences, **120–160 000 professionnels** de la transaction en France ; ~45 000 mandataires (en forte croissance). **~31–35 % des ventes se font entre particuliers** = le gisement de mandats à capter. SAM réaliste ~50–70 000 pros « prospecteurs actifs ».

**L'objectif.** SOM 3 ans : **1 500–3 000 clients**, soit **~1,5–3 M€ ARR**, en bootstrap.

---

## 1. Le problème

L'agent immobilier vit d'une seule chose : **rentrer des mandats**. Or :

1. **~1 vente sur 3 démarre entre particuliers** (PAP/FSBO). C'est LE vivier de mandats — un particulier sur deux tente de vendre seul, **un tiers abandonne** et finit par signer avec un pro. Celui qui appelle **le premier et le mieux** gagne.
2. **La pige est chronophage et fragmentée** : l'agent surveille manuellement Leboncoin, SeLoger, PAP… repère les nouvelles annonces de particuliers, les recopie, appelle.
3. **Les outils existants sont silotés** : pige d'un côté (Pige Online), CRM de l'autre (Hektor, Apimo), estimation ailleurs. Aucune continuité prospect → mandat → vente.
4. **Le suivi est défaillant** : pas de relance structurée, pas de scoring, les leads tièdes sont perdus.
5. **La conformité se durcit** (RGPD, Bloctel, réforme août 2026) : les pros n'ont ni le temps ni les compétences pour rester carrés.

**Conséquence :** l'agent passe un temps fou à chercher, contacte trop tard, relance mal, et laisse filer des mandats faute d'organisation.

---

## 2. La solution — Volia Immo

Un SaaS unique qui couvre la chaîne **détecter → contacter → qualifier → convertir → suivre** :

| Étape | Ce que fait Volia Immo |
|---|---|
| **1. Détecter** | Pige multi-portails en temps réel (via API d'agrégation). Alertes « nouveau bien vendeur » sur tes secteurs/codes postaux, dès la publication. |
| **2. Prioriser** | Scoring IA : fraîcheur, prix vs marché, type de bien, probabilité de mandat, signaux « particulier pressé » (baisse de prix, re-publication). |
| **3. Contacter** | File d'appels priorisée + scripts personnalisés + (selon conformité) email/SMS sur leads **opt-in**. Synchronisation Bloctel intégrée. |
| **4. Qualifier** | Tunnel d'**estimation en ligne** (lead magnet) → le vendeur saisit son bien → **consentement capté** → estimation auto → RDV. |
| **5. Convertir** | CRM pipeline mandats (Kanban), relances automatiques, modèles de séquences, rappels. |
| **6. Mesurer** | Tableau de bord : mandats rentrés, taux de transformation pige → RDV → mandat, ROI. |

**Le « waouh » :** l'agent ouvre son appli le matin et voit *« 7 nouveaux biens à appeler en priorité aujourd'hui sur ton secteur, classés par probabilité de mandat »* — au lieu de scroller Leboncoin pendant 1 h.

---

## 3. Le marché (TAM / SAM / SOM)

### Taille & dynamique
- **~30–32 000 agences** (consensus) ; en incluant indépendants, franchises, mandataires : **120–160 000 professionnels** de la transaction.
- **~45 000 mandataires** (2023), segment en forte croissance : **27 % des transactions** réalisées par des mandataires en 2024 (vs 16 % en 2018).
- CA du secteur ~**12,2 Md€** en 2025 (en baisse depuis ~15 Md€ en 2022 — marché sous tension = **les pros cherchent à optimiser leur acquisition**, tailwind pour un outil ROI).
- **~31–35 % des ventes entre particuliers** = le gisement de mandats adressable.

### Sizing (hypothèses)
| Niveau | Définition | Volume | ARPU/an | Valeur annuelle |
|---|---|---|---|---|
| **TAM** | Tous pros transaction FR | ~130 000 | ~960 € (80 €/mo) | **~125 M€** |
| **SAM** | Pros « prospecteurs actifs » qui font / paieraient pour la pige | ~50–70 000 | ~960 € | **~50–67 M€** |
| **SOM (3 ans)** | Part réaliste capturée | 1 500–3 000 | ~1 000 € | **~1,5–3 M€ ARR** |

> Repère : Pige Online (leader low-cost) est à **29 €/mois**. Un outil **pige + CRM + tunnel** justifie **79–199 €/mois** → ARPU supérieur.

---

## 4. Concurrence & positionnement

### Cartographie
| Catégorie | Acteurs | Limite |
|---|---|---|
| **Pige pure** | Pige Online (dès 29 €), Immo-Scan | Donne la donnée, pas le tunnel ni le suivi |
| **Veille / data premium** | Yanport, MeilleursAgents Pro, Melo (API) | Cher / orienté data, pas « copilote agent » |
| **CRM immo** | Hektor, Apimo, Netty, Adapt Immo | Gèrent le mandat, pas l'acquisition amont |
| **Pige + estimation + IA** | Jestimia | Concurrent le plus proche → à étudier de près |

### Le trou dans le marché
La plupart des outils sont **soit pige, soit CRM**. **Personne** ne fait proprement la **boucle complète automatisée** (détection → priorisation IA → contact → tunnel opt-in → CRM) packagée pour l'agent solo/petite agence, à un prix accessible.

### Énoncé de positionnement
> **Pour** les agents et mandataires immobiliers qui veulent rentrer plus de mandats sans y passer leurs journées,
> **Volia Immo** est le copilote de prospection qui **détecte les biens à vendre dès leur publication, te dit qui appeler en priorité, et remplit ton pipeline de mandats** —
> **contrairement à** la pige seule ou au CRM seul, il **automatise toute la chaîne** et reste **100 % conforme** (Bloctel, RGPD, réforme 2026) by design.

### Différenciateurs
1. **La boucle complète** (vs outils silotés).
2. **Le scoring IA** « quel bien appeler en priorité » (héritage Autopilot Volia).
3. **Le tunnel d'estimation opt-in** → conformité = avantage produit, pas contrainte (clé post-août 2026).
4. **Speed-to-lead** : alerte instantanée à la publication.
5. **Prix agressif** (héritage ADN Volia « le moins cher du marché »).

---

## 5. Le mur réglementaire (à transformer en moat)

C'est **le** facteur stratégique, pas un détail juridique.

- **Démarchage téléphonique** : interdit week-end/fériés, autorisé 10–13 h / 14–20 h ; obligation de purger **Bloctel tous les 30 jours**.
- **Réforme 11 août 2026** : **consentement préalable obligatoire** avant tout démarchage téléphonique. → Le cold-calling de masse vers les particuliers devient illégal sans opt-in.
- **Email/SMS B2C** : consentement préalable **déjà obligatoire** (identité expéditeur + lien de désinscription). CNIL : **900 k€ d'amende** (mai 2025) à un data broker pour SMS/email sans consentement ; **87 sanctions / 55 M€ en 2024**.

**Implication produit (le pivot intelligent) :** ne construis pas un « blaster » de prospection sortante. Construis un **moteur de leads vendeurs en opt-in** :
- **Tunnel d'estimation** (« Estimez votre bien gratuitement ») = capture le consentement → l'agent peut légalement recontacter.
- **Pige + appel** reste utile **avant août 2026** et le restera pour le **1er contact court conforme** ; mais la valeur durable est dans l'**inbound qualifié**.
- **« Conformité intégrée »** (sync Bloctel, plages horaires, opt-in, traçabilité) devient un **argument de vente** différenciant — les pros ont peur de la CNIL.

---

## 6. Business model & unit economics (hypothèses)

### Pricing (3 paliers)
| Plan | Cible | Prix | Inclus |
|---|---|---|---|
| **Solo** | Agent / mandataire indépendant | **79 €/mois** | 1 secteur (X codes postaux), pige temps réel, scoring, CRM, tunnel estimation, 1 utilisateur |
| **Agence** | Petite agence (2–5 négos) | **199 €/mois** | Multi-secteurs, multi-utilisateurs, séquences avancées, reporting équipe |
| **Réseau** | Réseaux / gros volumes | **sur devis / au siège** | API, marque blanche, onboarding, support dédié |

> Option promo de lancement (réflexe Volia) : **−50 % les 3 premiers mois** pour amorcer.

### Unit economics (cible à maturité)
- **ARPU** : ~90–110 €/mois.
- **COGS** : data agrégée (Melo/équiv.) + infra + IA + email/SMS ≈ **20–30 €/mois/client** → **marge brute ~70 %**.
  - ⚠️ Le coût data est le poste à surveiller : négocier un tarif **volume** dès que tu dépasses quelques dizaines de clients (sinon la marge fond).
- **CAC** cible : **< 300 €** (founder-led + contenu SEO « pige immobilière » + LinkedIn/groupes Facebook immo).
- **Payback** : ~3–4 mois. **LTV/CAC** > 3 visé.
- **Churn** : secteur volatil (agents qui arrêtent, cycles marché) → prévoir **4–5 %/mois au début**, objectif 2–3 % via l'ancrage CRM (plus on y met ses mandats, moins on part).

---

## 7. Go-to-market

### Beachhead (ne pas viser tout le monde)
**Mandataires & agents indépendants en Province** (iad, SAFTI, Capifrance, Optimhome, indés) : nombreux, mal outillés, sensibles au prix, en quête de mandats, décision d'achat individuelle et rapide. Cible 1 ou 2 régions au départ.

### Canaux
1. **Founder-led sales** + démos (cycle court, ticket faible).
2. **SEO/GEO** : « pige immobilière », « rentrer des mandats », « estimation en ligne agent » (tu maîtrises déjà la machine de contenu Volia).
3. **Groupes Facebook / communautés immo**, LinkedIn (les mandataires y vivent).
4. **Partenariats réseaux de mandataires** (revente / co-marketing).
5. **Parrainage** (tu as déjà le moteur dans Volia).

### Séquence de lancement
- **S1–S6** : MVP (pige API + scoring + CRM + tunnel estimation) → 5–10 agents pilotes gratuits.
- **S6–S12** : itérer sur le pilote, premiers payants, étude des cas d'usage, 1 région.
- **M3–M6** : ouvrir l'acquisition (SEO + sales), viser 50–100 clients.
- **M6–M12** : industrialiser, viser 200–400 clients.

---

## 8. Faisabilité technique (rappel)

- **Faisabilité élevée** en **achetant** la donnée (API d'agrégation type Melo : 900+ sources, ~50 000 annonces/jour, webhooks de changement de prix/expiration). Le fournisseur porte le risque scraping Leboncoin (DataDome).
- **Scraping maison** : possible mais arms-race permanent (DataDome), coûteux (proxies résidentiels), à éviter au lancement. À reconsidérer seulement à grande échelle pour la marge.
- **70 % déjà construit dans Volia** : CRM, Forms (tunnel estimation), Campagnes, scoring Autopilot, Stripe + seats, multi-users.
- **Net-new** : connecteur pige + modèle de données « annonce immobilière » (prix, surface, DPE, mandat) + 3–4 workflows immo + dédup/ré-apparition d'annonces + sync Bloctel.

---

## 9. Roadmap MVP (réutilisation Volia)
1. **Connecteur data pige** (API agrégateur) + normalisation annonce immo.
2. **Détection FSBO + dédup** (nouvelle annonce particulier sur secteur).
3. **Scoring immo** (réglage du moteur existant : fraîcheur, prix/marché, type).
4. **File d'appels priorisée** + scripts (réutilise CRM/activités).
5. **Tunnel d'estimation opt-in** (réutilise Forms + bridge CRM).
6. **Pipeline mandats** (réutilise CRM Kanban).
7. **Conformité** : sync Bloctel, plages horaires, traçabilité consentement.
8. **Dashboard ROI** mandats.

---

## 10. SWOT

| | |
|---|---|
| **Forces** | Techno à 70 % prête · ADN prix bas · expertise scoring/automatisation · time-to-market court |
| **Faiblesses** | Dépendance à un fournisseur de données · pas encore de marque immo · churn secteur · besoin d'expertise métier immo |
| **Opportunités** | Réforme 2026 → prime à l'opt-in (inbound estimation) · marché pige fragmenté · marché sous tension = recherche de ROI · mandataires en croissance |
| **Menaces** | Jestimia & CRM qui ajoutent la pige · hausse des coûts data · durcissement RGPD · cyclicité du marché immo |

---

## 11. Risques & mitigations
1. **Réforme démarchage 2026** → pivoter sur **inbound/estimation opt-in** dès le départ (c'est aussi le différenciateur).
2. **Dépendance fournisseur data** → multi-sources à terme + clause volume.
3. **Marché pige saturé** → différencier sur **boucle complète + UX + prix + IA**.
4. **Churn / cyclicité** → ancrage CRM (les mandats vivent dedans) + valeur ROI mesurée.
5. **Conformité B2C** → conformité **as a feature** (Bloctel, opt-in, traçabilité).

---

## 12. Décision recommandée
**Go conditionnel**, en mode **vertical de Volia** (réutilise marque/techno) plutôt que from-scratch :
1. **Valider la demande** avec 5–10 agents pilotes **avant** d'écrire une ligne de scraping.
2. **Acheter la donnée** (API agrégateur), jamais scraper au lancement.
3. **Construire autour de l'opt-in** (tunnel estimation), pas du cold-blast.
4. Si traction → industrialiser ; sinon, coût d'option très faible (MVP sur Volia).

---

## 13. Pitch commercial

### One-liner
> **Volia Immo — rentre plus de mandats, sans passer tes journées à éplucher Leboncoin.**

### Elevator pitch (30 s)
> « Chaque jour, des dizaines de particuliers mettent leur bien en vente sur ton secteur. Le premier agent qui les contacte, bien, signe le mandat. Volia Immo surveille tous les portails en temps réel, te sort le matin la liste des biens à appeler **classés par probabilité de mandat**, déclenche les bons messages, capte les vendeurs via un tunnel d'estimation, et suit tout dans un CRM. Tu arrêtes de chercher, tu signes. À partir de 79 €/mois. »

### Pitch problème → solution (page de vente)
- **Le constat :** 1 vente sur 3 démarre entre particuliers. Tu le sais. Mais les repérer à temps, les appeler avant les 4 autres agences, et les relancer sans rien lâcher… c'est un métier à plein temps.
- **La douleur :** tu scrolles Leboncoin le soir, tu rappelles trop tard, tu perds des mandats à cause d'un post-it oublié.
- **La promesse :** Volia Immo fait la veille à ta place, te dit **qui appeler en priorité**, et transforme ta prospection en machine.
- **La preuve :** détection temps réel · scoring IA · tunnel d'estimation conforme · CRM mandats · conforme Bloctel & RGPD.
- **L'offre :** essai gratuit, puis dès 79 €/mois, sans engagement. Le prix d'**un seul mandat rentré rembourse plusieurs années**.

### Traitement d'objections
| Objection | Réponse |
|---|---|
| « J'ai déjà Pige Online » | Pige Online te donne la liste. Volia Immo te dit **lequel appeler en priorité**, déclenche les relances et **suit jusqu'au mandat**. La pige n'est qu'une brique. |
| « C'est légal de récupérer ces annonces ? » | On passe par des sources agrégées et on est **conformes Bloctel + RGPD by design** — la conformité est intégrée, pas à ta charge. |
| « J'ai pas le temps d'apprendre un outil » | 5 min de setup, et chaque matin une liste prête. Moins d'outils, pas plus. |
| « C'est cher » | Un seul mandat = plusieurs milliers d'euros de commission. 79 €/mois = le prix d'un plein d'essence. |
| « La loi 2026 va tout casser » | Au contraire : notre tunnel d'estimation capte le **consentement** → tu restes le seul à pouvoir recontacter légalement. On t'y prépare. |

### Noms possibles
- **Volia Immo** (vertical, réutilise la marque + techno) ← recommandé pour démarrer
- Marque dédiée si spin-off : *Mandali*, *PrioPige*, *RentréeMandat*, *FlairImmo*

---

## Sources
- Agences/agents FR : [revue-immo.com](https://revue-immo.com/agences-immobilieres-france/), [lesformationsdelouis.com](https://lesformationsdelouis.com/statistiques-agents-immobiliers-france-2026/), [io-immo.com](https://www.io-immo.com/nombre-d-agences-immobilieres-en-france-chiffres-cles-et-tendances/)
- Ventes entre particuliers : [PAP.fr](https://www.pap.fr/actualites/immobilier-un-tiers-des-ventes-se-fait-entre-particuliers/a19088), [Batiactu](https://www.batiactu.com/edito/ventes-immobilieres-31-transactions-se-font-entre-particuliers-47444.php), [lesmakers.fr](https://lesmakers.fr/statistique-immobilier-particuliers/)
- Outils de pige & prix : [Pige Online](https://www.pige-online.fr/tarifs), [Yanport](https://www.yanport.com/solutions/agent-360/pige-et-prospection-immobiliere), [comparatif IA LAB](https://ia-lab-immo.com/blog/outils-pige-immobiliere-comparatif-2026)
- API données agrégées : [Melo.io API](https://www.melo.io/api), [Melo pige](https://www.melo.io/recherche-immobilier/piges-immobilieres)
- Réglementation : [CNIL prospection](https://www.cnil.fr/fr/rgpd-en-pratique-maitrisez-votre-relation-client), [Bloctel FAQ](https://www.bloctel.gouv.fr/faq), [réforme démarchage 2026](https://www.maformationimmo.fr/demarchage-telephonique-immobilier-ce-que-change-la-loi-2026-et-comment-sy-preparer/), [RGPD B2C – leto.legal](https://www.leto.legal/guides/rgpd-et-prospection-btoc-quelles-regles-respecter)
