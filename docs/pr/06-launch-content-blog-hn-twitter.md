# 🚀 Contenu de lancement : Blog + Hacker News + Twitter

> **Sprint nuit 1er juin 2026** — Tous les contenus prêts à publier pour le lancement PR.
> Adapter à ta voix, remplir les `[CHIFFRES]`, puis publier.

---

## 📝 1. Article de blog — « Comment j'ai construit Volia en 12 mois avec Claude »

**Suggestion d'intégration** : ajoute cet article dans `src/lib/blog.js` (en haut du tableau `BLOG_POSTS`). Slug recommandé : `comment-jai-construit-volia-en-12-mois-avec-claude`.

### Métadonnées suggérées
- **slug** : `comment-jai-construit-volia-en-12-mois-avec-claude`
- **title** : "Comment j'ai construit Volia en 12 mois, seul, avec Claude (Anthropic) comme co-pilote"
- **description** : "Story 100% transparente : 370+ commits, 4 modules, 0 levée, 0 salarié. Voici la méthode, les erreurs, et ce que l'IA agentique a vraiment changé."
- **publishedAt** : '2026-06-01'
- **author** : 'Anthony Malartre'
- **readTime** : 12
- **category** : 'Founder'
- **keywords** : ['claude', 'anthropic', 'founder solo', 'IA agentique', 'volia', 'saas bootstrap', 'ai-augmented', 'human-in-the-loop']

### Contenu complet

```markdown
## Le déclic : 271€/mois pour 6 outils qui ne se parlent pas

Il y a 12 mois, j'ai payé ma facture mensuelle de stack outbound :

- HubSpot Starter (CRM) : 90 €
- Apollo (data prospects) : 49 $
- Lemlist (cold email) : 39 €
- Typeform (formulaires) : 29 $
- Zapier (le truc qui essaie de tout coller) : 20 $
- Notion (notes commerciales) : 10 $

**Total : 271 €/mois** pour 6 outils qui ne se parlent pas nativement.

Quand un prospect remplissait mon Typeform, il fallait Zapier pour 
qu'il atterrisse dans HubSpot. Quand quelqu'un répondait à un cold 
email Lemlist, il fallait que je le re-crée à la main dans le CRM. 
Quand je voulais analyser ma performance, je devais croiser 4 dashboards.

Le matin du 1er juin 2025, j'ai décidé d'arrêter.

Pas de "faisons une étude de marché".
Pas de "levons un seed".
Pas de "recrutons un CTO".

J'ai ouvert mon Mac. J'ai ouvert Claude.
Et j'ai commencé à construire Volia.

## L'idée folle : un founder solo peut-il construire HubSpot+Apollo+Lemlist+Tally ?

À cette époque, j'étais founder solo bootstrap, pas dev full-stack. 
Je savais coder un peu (JavaScript, Python, basique SQL), mais pas 
au niveau d'un CTO avec 10 ans d'XP qui aurait construit une stack 
B2B complète.

L'hypothèse que je voulais tester : **est-ce qu'un humain qui sait 
ce qu'il veut construire peut, avec une IA agentique comme co-pilote, 
shipper un produit B2B sérieux en quelques mois ?**

Pas un prototype. Pas une démo. Un produit vendable.

Spoiler : oui. Et voici comment.

## La méthode "human-in-the-loop" : qui décide quoi

Quand je dis "construit avec Claude", on imagine souvent un truc 
magique où l'IA fait tout. C'est faux.

Voici le partage réel du travail :

| Anthony (humain) | Claude (IA agentique) |
|---|---|
| Vision produit + décisions stratégiques | Implémentation du code |
| Validation de chaque PR (sans exception) | Refactor + tests + documentation |
| Sales + customer success + support | Génération migrations DB |
| Roadmap + priorités | Suggestions architecture |
| Marketing + brand voice | Optimisations performance |
| Conversations clients | Code review automatique |

Règles non-négociables :
- **Aucune feature shippée sans validation humaine**
- **Aucune décision produit déléguée à l'IA**
- **Aucun client contacté par l'IA**
- **Chaque commit est attribué (`Co-Authored-By: Claude` quand il a participé)**

Sans ça, on n'aurait pas un produit B2B sérieux. On aurait une démo virale.

## Le workflow type d'une feature

Pour donner un exemple concret, voici comment a été shippée la 
feature "auto-create CRM depuis email replies" :

**Lundi 14h** — un client me dit dans un Slack DM : *"Quand quelqu'un 
me répond à un cold email, ce serait génial qu'un deal se crée auto 
dans le CRM."*

**Lundi 14h15** — j'ouvre Claude. Je tape : *"Volia a un module 
Campagnes (envoi cold email via Resend) et un module CRM. Comment 
détecter une reply et créer un deal auto ? Quelles parties du code 
existant on doit toucher ?"*

**Lundi 14h25** — Claude propose une architecture : webhook Resend 
sur `delivered`/`opened`/`replied`, lib `crm-auto-create.js`, idempotence 
via `webhook_events` table, routing `c-{campaign_id}@reply.volia.fr`.

**Lundi 14h35** — je valide l'approche, on commence l'implémentation.

**Lundi 17h00** — code shippé en prod. Test sur mon propre email : 
ça marche. 1h plus tard, le client a son premier deal auto-créé.

**Total : 3h de boulot, pour une feature que les concurrents demandent 
une intégration Zapier pour faire.**

Sans Claude, j'aurais mis 2 jours pour la même feature. Et je n'aurais 
probablement pas pris le temps de bien penser l'idempotence des 
webhooks (Claude a insisté).

## Les erreurs qu'on a faites

Pour pas paraître pour des magiciens, voici 3 erreurs réelles 
qu'on a faites cette année :

### 1. La grande migration "Prospectia → Volia"
J'avais lancé sous le nom "Prospectia". 8 mois plus tard, j'ai 
décidé de pivoter vers une suite multi-modules. Volia était un 
meilleur nom. La migration a touché 50+ fichiers, tous les logos, 
tous les emails transactionnels, le domaine, l'OAuth Google, le 
Stripe portal... 3 jours de boulot pour rien casser. Avec Claude : 
3 jours quand même, mais pas une seule régression en prod.

### 2. La promesse Pro 49€ qui contredisait plans.js
On a pitché pendant 2 mois que Volia Campagnes était "inclus dans 
Pro 49€" sur la landing produit, alors que `plans.js` disait que 
Campagnes était Business-only. Un client a souscrit Pro, n'a pas 
eu accès, m'a envoyé un mail mécontent. J'ai dû refunder + corriger 
le pricing partout. Risque DGCCRF en bonus.

Leçon : la cohérence entre marketing et code n'est pas optionnelle.

### 3. La régression du sticky header CRM
Pendant 1 semaine, le header de colonne du Kanban CRM tombait en 
bas de l'écran à cause d'un mauvais `position: sticky` sur un parent 
`overflow: hidden`. J'ai bidouillé 6 commits différents avant de 
comprendre qu'il fallait refactor le layout en `h-screen + overflow-hidden`. 
Claude m'a proposé la bonne solution dès la 1ère itération, je ne 
l'ai pas écouté. J'ai perdu 4 jours.

Leçon : quand Claude propose une refonte au lieu d'un patch, 
écouter Claude.

## Les chiffres réels au 1er juin 2026

- **Commits publics** : 370+ ([github.com/anthonymalartre-rubia/volia](https://github.com/anthonymalartre-rubia/volia))
- **Modules en production** : 4 (Prospection, Campagnes, CRM, Formulaires)
- **Cron jobs Vercel actifs** : 10
- **Pays couverts** : 8 (FR/BE/CH/LU/DE/UK/ES/IT)
- **Catégories d'activité** : 150+
- **Départements français** : 101
- **Entreprises accessibles** : 287 000+ via Google Places
- **Levée de fonds** : 0 €
- **Salariés supplémentaires** : 0 (founder solo + prestataires ponctuels compta/juridique)

## Pour qui c'est ?

Volia est positionné aujourd'hui sur le plan **Business à 149 €/mois** 
(promo 12 premiers mois, puis 179 €/mois). Cible :

- **Founders SaaS B2B** (1-3 personnes) qui font leur propre sales 
  et veulent un outil tout-en-un
- **Head of Sales d'agences/PME** (1-5 commerciaux) avec besoin d'une 
  stack intégrée
- **Consultants seniors B2B** qui pitchent aux PME

Si tu paies aujourd'hui plus de 200 €/mois en outils dispersés 
(HubSpot+Apollo+Lemlist+Tally+Zapier), Volia te fait économiser 
~50-130 €/mois ET te libère du Zapier hell.

## Ce que l'IA ne fait pas (et ne fera pas demain)

Pour finir, soyons honnêtes sur les limites :

- **L'IA ne décide pas** ce qui doit être construit. Si je donne à Claude 
  un mauvais brief, il code parfaitement... une mauvaise feature.
- **L'IA ne parle pas aux clients**. Le sales B2B reste 100% humain. 
  Personne ne signe à 149 €/mois avec un robot.
- **L'IA ne sent pas** quand un prospect ment dans une démo, ou quand 
  un client est sur le point de churner.
- **L'IA n'a pas de jugement business**. Choix entre 2 visions stratégiques, 
  pricing, positioning : 100% moi.

Ce que l'IA fait redoutablement bien :
- Code propre, tests, documentation
- Refactor 10000 lignes en 5 min
- Proposer des architectures qu'un humain seul mettrait des jours à concevoir
- Détecter les bugs subtils dans le code que je viens d'écrire

Le founder du futur n'est pas celui qui code le mieux.  
C'est celui qui décide le mieux. Et qui sait orchestrer ses agents IA.

## Tu veux essayer ?

Si tu veux voir ce qu'on a construit :

- **La suite Volia** : [volia.fr](https://volia.fr) — 4 modules connectés à 149 €/mois
- **Notre histoire complète** : [volia.fr/notre-histoire](https://volia.fr/notre-histoire)
- **Tous les commits publics** : [github.com/anthonymalartre-rubia/volia](https://github.com/anthonymalartre-rubia/volia)
- **Le changelog** : [volia.fr/changelog](https://volia.fr/changelog)

Et si tu es un founder bootstrap qui veut discuter méthode : 
**anthony@volia.fr** — je réponds personnellement.
```

---

## 🟧 2. Post Hacker News

**À publier dimanche 22h heure FR (= 16h ET dimanche US, prime time HN).**

### Titre (obligatoire format "Show HN:")
```
Show HN: Volia – I built a 4-module B2B SaaS suite solo with Claude (Anthropic)
```

### Lien
```
https://volia.fr/notre-histoire
```

### Premier commentaire (à publier toi-même IMMÉDIATEMENT après le post — règle HN)
```
Anthony from Volia here, happy to answer any questions.

Quick context:
- I'm a solo founder, based in Bordeaux (France), bootstrapping (no fundraising)
- Started May 2025 with just a Mac + Claude
- 12 months later: 4 connected modules (Prospection, Email Campaigns, 
  CRM, Forms), production-ready, paying customers at €149/month
- 370+ commits publicly visible: https://github.com/anthonymalartre-rubia/volia
- Public changelog: https://volia.fr/changelog
- 0 employees added (just me + occasional contractors for legal/accounting)

The thing that surprised me most: it's not "the AI builds the app". 
It's "the AI removes the 70% of grunt work that wasn't where my 
judgment added value". I still do all the product decisions, all 
the sales, all customer success. But I ship features in hours that 
would have taken days.

Stack: Next.js 14, Supabase, Stripe, Vercel, Resend, Claude (Anthropic).

If you're a founder thinking "I can't build that, I'd need a team" — 
maybe you can now. Happy to chat about anything: workflow, what works, 
what doesn't, business model, etc.
```

### Conseils HN
- Si tu obtiens 10 upvotes dans la 1ère heure → tu as une chance de monter en front page
- Si tu obtiens 50 upvotes dans la 1ère heure → tu vas faire front page (high probability)
- Reste connecté la 2-3 premières heures pour répondre aux commentaires (vital pour le ranking)
- Ne PAS demander à des amis de upvoter (HN détecte et tu te fais shadow-ban)
- Ne PAS poster le mardi (sujet "Show HN" mardi = peu d'audience)

---

## 🐦 3. Twitter/X thread (à poster lundi 2 juin 9h)

### Tweet 1 (hook)
```
1/ Il y a 12 mois, je payais 271€/mois pour 6 outils SaaS qui ne se 
parlaient pas.

HubSpot. Apollo. Lemlist. Typeform. Zapier. Notion.

Hier, j'ai migré sur 1 seul outil que j'ai construit. Seul. 
Avec Claude.

Voici l'histoire. 🧵
```

### Tweet 2
```
2/ Je suis founder solo, basé à Bordeaux, bootstrap. Pas dev full-stack.

J'avais 2 options face à ma facture de 271€/mois :
- Accepter et continuer
- Construire moi-même

J'ai choisi l'option 2. Avec une condition : utiliser Claude 
(Anthropic) comme co-pilote agentique pour aller 10× plus vite.
```

### Tweet 3
```
3/ La règle que je me suis fixée : "human-in-the-loop strict".

Anthony décide. Claude exécute.
Anthony valide chaque PR. Claude code.
Anthony parle aux clients. Claude ne le fait jamais.

Pas de magie. Juste un workflow rigoureux.
```

### Tweet 4
```
4/ 12 mois plus tard :

→ 4 modules en production (Prospection, Campagnes, CRM, Forms)
→ 370+ commits publics (https://github.com/anthonymalartre-rubia/volia)
→ Clients payants à 149€/mois
→ 0 levée de fonds
→ 0 employé supplémentaire (juste prestataires ponctuels)

Tout est documenté : https://volia.fr/notre-histoire
```

### Tweet 5
```
5/ Ce qui m'a surpris ?

L'IA n'a pas "construit l'app". 
L'IA m'a libéré du 70% de grunt work où mon jugement n'apporte rien.

Je ship des features en 3h qui auraient pris 3 jours.
Je passe 80% de mon temps sur sales+support+vision (le vrai produit).
```

### Tweet 6
```
6/ Ce que l'IA ne fait toujours pas :
→ Décider de killer une feature
→ Sentir quand un prospect ment en démo
→ Construire de la confiance avec un humain
→ Avoir du jugement business

Ce qu'elle fait redoutablement bien :
→ Code clean, tests, docs
→ Refactor 10k lignes en 5 min
→ Proposer des architectures
```

### Tweet 7
```
7/ Pour qui c'est intéressant ?

Si tu paies aujourd'hui 200€+/mois en outils dispersés 
(HubSpot+Apollo+Lemlist+Tally+Zapier), Volia te fait 
économiser 50-130€/mois ET te libère du Zapier hell.

149€/mois. 4 modules connectés. RGPD natif. Made in France.

→ https://volia.fr
```

### Tweet 8 (CTA + final)
```
8/ Si tu es founder solo qui pense "je pourrais pas construire ça, 
il me faudrait une équipe" — peut-être que tu peux maintenant.

Happy to chat méthode, workflow, business model.
Email : anthony@volia.fr
DM : @AnthonyMalartre

Article complet : https://volia.fr/notre-histoire
```

---

## 📱 Tableau de planification publication

| Contenu | Plateforme | Quand | Audience cible |
|---|---|---|---|
| Article blog | volia.fr/blog | Lundi 2 juin matin | SEO long-tail + clients |
| Thread Twitter (8 tweets) | X (Twitter) | Lundi 2 juin 9h | Founders FR + intl |
| Post #1 LinkedIn | LinkedIn | Lundi 2 juin 8h | Corporate FR |
| Post Hacker News | HN | Dimanche 8 juin 22h | Tech intl |
| 5 emails outreach Tier 1 | Email perso | Lundi à vendredi (1/jour) | Journalistes FR |
| Post IndieHackers | IH | Vendredi 13 juin | Bootstrap intl |

---

## 🛡️ Garde-fous publication

**À NE PAS faire** :
- Tweeter "100% built by AI" → tu te fais debunker
- Tagger Anthropic dans le tweet (sauf si tu veux qu'ils te récupèrent comme cas marketing — décision à prendre exprès)
- Demander à des amis de upvoter HN → shadow ban
- Cross-poster le contenu identique sur 5 plateformes → algo pénalise

**À faire systématiquement** :
- Répondre à TOUS les commentaires dans les 2h (lundi matin = bloque 1h dans le calendrier)
- Si quelqu'un challenge "0 employé", admets sereinement : "founder solo + prestataires ponctuels compta/juridique"
- Si quelqu'un demande "c'est pas un cas Anthropic-sponsored ?", réponds : "Non, je paie Claude au prix grand public comme tout le monde."

---

**Dernière mise à jour** : 1er juin 2026 (Sprint nuit Claude)
