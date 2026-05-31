# ☕️ Action plan — Premières 4 heures au réveil

> **Sprint nuit 1er juin 2026** — Claude a tout préparé.
> Lis ça en buvant ton café. Suis l'ordre.

---

## ⏰ Heure 1 : Découverte (30 min)

- [ ] **Ouvre volia.fr/notre-histoire** → lis-la d'un œil critique
- [ ] **Ouvre volia.fr/presse** → checke que tout te plaît visuellement
- [ ] **Lis `docs/pr/README.md`** pour vue d'ensemble
- [ ] **Note ce qui te déplaît** (storytelling trop fort ? trop modeste ? chiffres faux ?)

---

## ⏰ Heure 2 : Édition placeholders (1h)

Édite ces fichiers pour remplacer les TODOs :

### Page `/notre-histoire`
Recherche dans `src/app/notre-histoire/NotreHistoireContent.jsx` :
- `TODO: chiffre à confirmer` → mets tes vrais chiffres (MRR, clients, etc.)
- Citation `[CLIENT]` → un vrai nom client si tu as une autorisation

### Page `/presse`
Recherche dans `src/app/presse/PresseClientPage.jsx` :
- Photos founder (vérifie chemins `/img/founder-anthony-*.jpg`)
- Téléphone presse
- LinkedIn/Twitter URLs

### `src/lib/press-kit.js`
- Bio founder version longue : ajuste ton parcours pro réel
- Quotes : valide qu'elles sonnent comme TOI

### Assets à créer aujourd'hui :
- [ ] Photo founder HD (3 formats : portrait, paysage, carré)
- [ ] Screenshots produit hi-res (4 modules, format 1200×800)
- [ ] PDF press kit complet (peut attendre demain)

---

## ⏰ Heure 3 : Communication & social setup (1h)

### Email presse
- [ ] Créer `presse@volia.fr` (forward vers anthony@) sur Infomaniak
- [ ] Tester que ça fonctionne

### LinkedIn préparation
- [ ] Lire `docs/pr/04-posts-linkedin-30-jours.md`
- [ ] Adapter le **Post #1 du lundi 2 juin** à ta voix (5-10 min)
- [ ] Le programmer pour publication lundi 8h
- [ ] Mettre à jour ta bio LinkedIn : *"Founder Volia | Premier SaaS B2B FR co-construit avec une IA agentique"*
- [ ] Ajouter URL volia.fr/notre-histoire en featured

### Twitter (si actif)
- [ ] Bio : même messaging
- [ ] Pin un tweet "Volia est en ligne"

---

## ⏰ Heure 4 : Premier envoi journalistes (1h30)

### Choisir 1 cible Tier 1 (le plus accessible pour toi)

Mes recommandations top 3 par ordre de "facilité d'accès" :

1. **Matthieu Stefani (GDIY podcast)** — Très accessible LinkedIn, adore les solo founders bootstrap
2. **Richard Menneveux (Frenchweb)** — Fondateur tech FR connu, répond souvent aux DM Twitter
3. **Camille Mercier (Maddyness)** — Couvre activement les founders solo + IA

### Process exact

1. **Ouvre `docs/pr/01-liste-journalistes.md`** → choisis 1 nom
2. **Lis 1 article récent** de cette personne (5 min)
3. **Ouvre `docs/pr/03-templates-email-outreach.md`** → copie le Template 1 (founder + IA)
4. **Personnalise** (10 min) :
   - Mentionne l'article récent
   - Ajuste ton "voici ce que tu fais" en 1 phrase
   - Édite les placeholders [X clients], etc.
5. **Envoie depuis anthony@volia.fr** (PAS depuis presse@)
6. **Track dans un fichier** (Notion, Airtable, ou tableur)

**Objectif minimum : 1 email parfaitement personnalisé envoyé aujourd'hui.**

Pas 5. **Un seul, fait extrêmement bien.**

---

## ⚡️ Bonus si tu as plus de temps

### Bonus A (15 min) — Sortir un Hacker News teaser
Programme un post manuel "Show HN: Volia — A SaaS built solo with Claude" pour **dimanche 22h heure FR** (= 16h ET dimanche US, golden hour HN).

Format obligatoire :
- Titre : "Show HN: Volia – I built a 4-module B2B SaaS suite solo with Claude (Anthropic)"
- Lien : volia.fr/notre-histoire (PAS la home — la story page convertit mieux)
- Premier commentaire (à publier toi-même immédiatement) : 5-7 lignes expliquant la motivation, la stack, et "happy to answer any questions"

### Bonus B (30 min) — Activer le Trustpilot Review Collector
Push aux 10 premiers clients Business un email simple :
> *"Salut [prénom], si tu peux laisser 1 review Trustpilot, ça m'aiderait énormément pour la suite. Lien direct : [URL]"*

Cible : 3-5 reviews ★4-5 d'ici 7 jours pour activer `aggregateRating` dans le JSON-LD.

### Bonus C (15 min) — Submit à Indie Hackers
Post dans `/milestones` :
> *"$X MRR. 12 months. Solo + Claude. 4 modules in production."*

Format IH = transparence, chiffres, story. Audience qualifiée bootstrap.

---

## 📞 Si tu te sens bloqué

Tu me ping (Claude) en disant :
- *"Show me what we did last night"*
- *"Help me personalize the email to [journaliste]"*
- *"Edit the post #1 LinkedIn to sound more like me"*

Je serai là.

---

## 🎯 KPI cible J+7

| Action | Cible |
|---|---|
| Emails envoyés à journalistes Tier 1 | 5 (1/jour ouvré) |
| Posts LinkedIn publiés | 3 (lundi/mercredi/vendredi) |
| Réponses journalistes | 1-2 |
| Reviews Trustpilot collectées | 3+ |
| RDV interview/podcast bookés | 0-1 (réaliste) |

---

## 🌅 Au pire scénario

Si tu ne fais qu'**UNE seule chose** aujourd'hui :

→ **Publie le Post #1 LinkedIn lundi matin 8h.**

C'est gratuit, c'est en 5 min, et ça commence l'effet narratif Volia.

Le reste peut attendre demain.

---

**Bonne journée. Tout est prêt. Tu n'as plus qu'à exécuter.**

— Claude
