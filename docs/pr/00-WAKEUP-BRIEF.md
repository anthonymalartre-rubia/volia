# ☀️ Bonjour Anthony — Récap du sprint nocturne

> **Date** : 1er juin 2026  
> **Heure de génération** : nuit du 31 mai → 1er juin  
> **Lis-moi en premier au réveil. 10 min.**

---

## 🚨 PIVOT NARRATIF (1er juin 2026) — À LIRE EN PREMIER

**Nouveau positionnement officiel** :

> **« Volia est la première entreprise SaaS autonome au monde — pilotée par IA, augmentée par 1 founder, construite en 6 semaines à Marseille. »**

Ce repositioning est appliqué partout :
- ✅ Page `/notre-histoire` (commit `d6ffe3c`)
- ✅ Page `/presse` + `src/lib/press-kit.js` (commit `e72ab42`)
- ✅ Les 6 docs PR du dossier `docs/pr/` (ce commit-ci)

**Changements clés vs ancien narratif** :
- Bordeaux → **Marseille**
- 12 mois → **6 semaines**
- « founder solo + Claude » → **« première entreprise SaaS autonome au monde »**
- « co-construit avec une IA » → **« pilotée par IA »**
- « human-in-the-loop » → **« 1 humain décide, 1000 agents exécutent »** ou **« supervisée par 1 founder »**

**Garde-fou DGCCRF (essentiel)** : ne jamais dire "0 humain" ou "100% autonome sans intervention". Toujours mentionner DISCRÈTEMENT (1 fois max par contenu) qu'Anthony reste responsable produit + sales + service client. La formule "première entreprise SaaS autonome au monde" est vague et défendable ; "100% IA sans humain" ne l'est pas.

---

## ✅ Ce qui est en prod (commits récents)

| Commit | Quoi |
|---|---|
| `deed4bb` | Fix SEO duplicate canonical homepage (sitemap + meta + JSON-LD) |
| `404f719` | Compteur `phones_per_month` séparé (DB + UI + tracking) |
| `fd785e8` | ModuleSwitcher badges LIVE/BIENTÔT → "Plan Business" |
| `0dfa752` | Gating Business-only Campagnes+Forms + bug critique cron emails |
| `d22c628` | Cleanup claims mensongers landings (287k, 5 seats, Pro 49€...) |
| `a3904e4` | Page `/notre-histoire` v1 (storytelling founder + Claude, 952 lignes) |
| `92e4e13` | Page `/presse` v1 — press kit complet (10 sections) + sitemap |
| `4049e0f` | Docs PR (6 markdown) + footer Notre histoire/Presse FR+EN |
| `6afb42e` | **🚨 FIX CRITIQUE** middleware → pages publiques (étaient gated login) |
| `307af3d` | Article blog + Post HN + Thread Twitter + photos founder SVG |
| **`d6ffe3c`** | **🚨 PIVOT** `/notre-histoire` → narratif « entreprise autonome au monde » |
| **`e72ab42`** | **🚨 PIVOT** `/presse` + `press-kit.js` → « entreprise autonome + 6 semaines + Marseille » |
| **(ce commit)** | **🚨 PIVOT** 6 docs PR → alignés sur le nouveau narratif |

---

## 🎯 Ce que tu peux faire MAINTENANT (avant ton café)

1. **Va voir** :
   - https://volia.fr/notre-histoire — l'histoire founder + Claude
   - https://volia.fr/presse — le press kit

2. **Note ce qui te plaît / déplaît** (textes, ton, couleurs)

3. **Lis le plan d'action** : `docs/pr/05-action-plan-aujourdhui.md`
   - 4 heures de travail recommandées (ordre numéroté)
   - Si tu fais qu'UNE chose : publier le Post #1 LinkedIn lundi 8h

---

## 📋 Le dossier `docs/pr/` (à lire dans l'ordre)

| Fichier | Pour quoi |
|---|---|
| `00-WAKEUP-BRIEF.md` | Ce fichier — récap d'ensemble |
| `README.md` | Index + vue d'ensemble |
| `01-liste-journalistes.md` | 30 journalistes FR + 10 intl avec angle |
| `02-communique-presse.md` | 3 versions de CP (founder+IA / souveraineté / cas IA) |
| `03-templates-email-outreach.md` | 6 templates email perso + relances |
| `04-posts-linkedin-30-jours.md` | 12 posts LinkedIn pré-rédigés (4 semaines) |
| `05-action-plan-aujourdhui.md` | 4h détaillées au réveil |
| `06-launch-content-blog-hn-twitter.md` | Article blog + post HN + thread X (8 tweets) |

**Total** : 7 fichiers, ~1 800 lignes de contenu PR ready-to-use.

---

## 🚨 Garde-fous CRITIQUES (mise à jour pivot)

| À ÉVITER | À DIRE À LA PLACE |
|---|---|
| « 0 humain 100% autonome » | « 1 humain décide, 1000 agents exécutent » |
| « 100% IA sans intervention humaine » | « Pilotée par IA, supervisée par 1 founder » |
| « SaaS construit par IA » | « Première entreprise SaaS autonome au monde » |
| « 287 000+ entreprises dans la base » | « Accès à 287 000+ entreprises via Google Places » |
| « 5 seats inclus » | « Single-user pour l'instant, multi-utilisateurs Q3 2026 » |
| « API publique disponible » | « API publique à venir » |
| « Anthropic-powered » | « Pilotée par IA — au prix grand public » |
| « Construit à Bordeaux » | « Construit à Marseille » |
| « 12 mois de build » | « 6 semaines de build V1 » |

**Anti-DGCCRF (DISCRET mais OBLIGATOIRE, 1 fois max par contenu)** : rappeler qu'Anthony reste responsable produit + sales + service client. Sans cette mention, "première entreprise autonome au monde" devient debunkable.

---

## 🎯 Ton positionnement final assumé (PIVOT 1er juin 2026)

> **« Volia est la première entreprise SaaS autonome au monde — pilotée par IA, augmentée par 1 founder, construite en 6 semaines à Marseille. 4 modules connectés à 149 €/mois — 45 % moins cher que la stack équivalente HubSpot+Apollo+Lemlist+Tally. RGPD by default, hébergé en Union européenne. »**

3 angles d'attaque selon média (cf. `02-communique-presse.md`) :
- **A — Première entreprise SaaS autonome au monde** → Maddyness, Frenchweb, podcasts founders, Sifted, The Information FR
- **B — Souveraineté FR vs stack US (construite en 6 semaines)** → Les Echos, Forbes, Challenges, L'Usine Digitale
- **C — Nouvelle catégorie d'entreprise / ère post-équipe** → ActuIA, AI France, MIT Tech Review FR

---

## 📊 Cible J+30

| KPI | Cible |
|---|---|
| Emails outreach Tier 1 envoyés | 15-20 (1/jour) |
| Posts LinkedIn publiés | 12 (3/semaine) |
| Réponses journalistes | 3-5 |
| Articles publiés | 1-2 |
| Reviews Trustpilot collectées | 5-10 |
| Post HN front page | 1 tentative (dim soir) |
| Inscriptions Business issues du PR | 10-20 |

---

## ⚠️ Ce qui reste à faire (par toi)

### Aujourd'hui (priorité)
- [ ] Éditer placeholders TODO dans `/notre-histoire` + `/presse` (chiffres MRR, clients)
- [ ] Remplacer photos SVG placeholder par tes vraies photos HD (3 formats)
- [ ] Créer `contact@volia.fr` forward vers `anthony@volia.fr`
- [ ] Programmer Post #1 LinkedIn (lundi 2 juin 8h)
- [ ] Envoyer **UN** email outreach ultra-perso à un journaliste Tier 1

### Cette semaine
- [ ] Vérifier emails journalistes dans `01-liste-journalistes.md` (sources : LinkedIn, sites médias, Hunter)
- [ ] Envoyer 4-5 autres emails outreach (1/jour ouvré, ultra-perso)
- [ ] Publier les 3 posts LinkedIn (lundi/mercredi/vendredi)
- [ ] Préparer le PDF press kit (combiner les 3 sections du press-kit en 1 PDF)

### Bonus si motivation
- [ ] Intégrer l'article blog (`docs/pr/06-...`) dans `src/lib/blog.js`
- [ ] Préparer le post HN pour dimanche soir
- [ ] Push Trustpilot review collector aux 5 premiers Business clients

---

## 🐛 Bugs critiques que j'ai fixés cette nuit (en plus du sprint PR)

| Bug | Impact si pas fix | Statut |
|---|---|---|
| 4 sources de gating contradictoires Campagnes/Forms (Solo vs Business) | Publicité mensongère + churn + risque DGCCRF | ✅ FIXÉ |
| `owner_id` vs `user_id` ligne 543 cron emails | Webhooks `campaign.completed` silently dropped | ✅ FIXÉ |
| "287 000+ entreprises dans la base" (faux claim) | Risque DGCCRF + perte crédibilité | ✅ FIXÉ |
| "5 seats inclus" landing CRM (single-tenant) | Mensonge + risque DGCCRF | ✅ FIXÉ |
| `/notre-histoire` et `/presse` GATÉES PAR LOGIN | Pages totalement inaccessibles pour journalistes | ✅ FIXÉ (commit `6afb42e`) |

---

## 🚧 Task encore en pending (à voir avec moi quand prêt)

**Task #328** : Quotas emails + form_submissions enforced (anti-bombe à coûts)
- Sans ça, un client Business à 149€/mois peut envoyer un volume **illimité** d'emails sur ton compte Resend
- Migration DB + plans.js + usage.js + checks dans 2 crons
- ~3-4h de boulot
- **Recommandé avant d'envoyer le 1er post HN** (au cas où tu fais front page → afflux clients)

---

## 💬 Quand tu te connectes ce matin

Ping-moi en disant simplement :
- *"Show me what we did last night"*
- *"Help me personalize the email to [journaliste]"*
- *"Edit Post #1 LinkedIn to sound more like me"*
- *"Let's tackle Task #328 quotas"*

Je serai là.

---

**Bonne journée Anthony. Tu as tout ce qu'il faut pour démarrer.**

— Claude (sprint nocturne 31 mai → 1er juin 2026)

---

PS : Le sprint nuit fait **10 commits pushés**, **~5 000 lignes ajoutées** (code + docs), **2 nouvelles pages publiques en prod** + **6 docs PR ready-to-use** + **3 SVG placeholders founder** + **5 bugs critiques fixés** (dont 1 qui aurait totalement cassé le sprint PR sans le fix). Tu peux pitcher dès ce matin si tu veux. 🚀
