# 🤖 Plan d'autonomie Volia — Niveau 2 cible J+90

> **Décision founder (1er juin 2026)** : on rend Volia *vraiment* autonome (cohérent avec le pitch « 1ère entreprise SaaS autonome au monde »). Niveau 2 : IA décide low-risk, founder valide high-stakes. Foundation d'abord (garde-fous), boucles auto ensuite.

---

## 📐 Niveau d'autonomie cible

| Niveau | Description | Statut |
|---|---|---|
| Niveau 1 | IA propose, humain valide tout | Trop manuel pour le pitch |
| **Niveau 2** | **IA décide low-risk, humain valide high-stakes** | **✅ CIBLE J+90** |
| Niveau 3 | IA full auto, humain par exception | Reporté (post 6-12 mois de tuning N2) |

**Règle d'or** :
> Si une action est **répétitive + low-risk + mesurable** → IA décide + exécute.  
> Si une action est **unique + high-stakes + irréversible** → IA propose + founder valide.

## 🎯 Classification des actions

### 🟢 Low-risk (IA décide + exécute auto)
- Crons de processing email/sequences (déjà en place)
- Auto-changelog depuis git commits
- Auto-relance trials (J+3, J+7, J+13)
- Auto-A/B test des CTAs landing
- SEO programmatic gap-filling
- Health checks hebdo
- Anomaly detection
- Auto-merge Dependabot si tests verts
- Webhook routing (Resend, Stripe, etc.)
- Reactivation churners (cold email automated)

### 🟡 Medium-risk (IA propose, founder valide 1-clic)
- Posts LinkedIn / Twitter
- Newsletter mensuelle
- Articles blog auto-rédigés
- Réponses aux mentions sociales
- Réponses aux emails FAQ clients
- Bug fixes auto-générés depuis Sentry
- Démarrage de nouvelles campagnes outbound

### 🔴 High-stakes (humain seul)
- Closing de deals importants (>5k€/an ARR)
- Communication crise / réponse à un journaliste majeur
- Changements de pricing / business model
- Refunds > 500€
- Embauche / partenariats
- Conflits clients
- Réponses à autorité (CNIL, DGCCRF, fisc)

---

## 🛡️ Garde-fous fondamentaux (à coder EN PREMIER)

| Garde-fou | Statut | Pourquoi |
|---|---|---|
| **Kill switch global** `AUTONOMOUS_MODE_ENABLED` env var | ⚙️ À coder | Désactiver tout l'auto en 1 commit si dérape |
| **Audit trail Supabase** table `autonomous_actions` | ⚙️ À coder | Logger TOUT (qui, quoi, quand, payload, status) |
| **Approval queue UI** `/admin/auto-queue` | ⚙️ À coder | Layer humain pour actions yellow-flag |
| **Throttling per-action** (max emails/jour, max posts/sem) | ⚙️ À coder | Cap journalier anti-spam + DGCCRF |
| **Anomaly detection + alertes** | ⚙️ À coder | Détection précoce dérives KPIs |
| **"STOP" kill switch via email** | ⚙️ À coder | Mobile-friendly emergency shutdown |
| **Weekly audit auto** | ⚙️ À coder | Rapport email lundi 9h |

---

## 📅 Roadmap 90 jours

### Sprint 1 (J0-J30) — Foundation + Comm

**Phase A : Garde-fous (21h)** ← PRIORITÉ ABSOLUE
- [x] Migration DB `autonomous_actions`
- [x] Env var `AUTONOMOUS_MODE_ENABLED` + lib helper `isAutonomyEnabled()`
- [x] `lib/autonomy.js` : `logAction`, `requireApproval`, `approveAction`, `rejectAction`
- [x] Page admin `/admin/auto-queue` (UI list + approve/reject)
- [ ] Throttling per-action (table `autonomous_rate_limits`)
- [ ] Anomaly detection (cron hebdo)
- [ ] STOP email kill switch (parsing email + désactivation flag)
- [ ] Weekly audit report (cron lundi 9h)

**Phase B : Comm (13h)**
- [ ] Cron `auto-content-proposer` (2×/sem) : lit changelog + events business → génère 3 brouillons LinkedIn + 3 tweets via Claude API
- [ ] Approval queue UI `/admin/auto-queue` (déjà fait dans Phase A)
- [ ] Auto-publish LinkedIn + X (Buffer API ou direct LinkedIn API)

**Phase C : Marketing quick win (9h)**
- [ ] Cron `seo-gap-detector` (hebdo) : GSC API → liste articles à écrire
- [ ] Auto-changelog (chaque push)

**Livrable J30** : tu valides 1 batch/sem de contenu LinkedIn, tu reçois 1 rapport hebdo, GSC gaps détectés, changelog auto-généré.

### Sprint 2 (J30-J60) — Commercial + Auto-amélioration

**Phase D : Commercial (18h)**
- [ ] Cron `dogfood-outreach` : Volia démarche 50-100 founders FR/sem via sa propre stack
- [ ] Lead scoring IA à chaque signup (score 0-100)
- [ ] Auto-relance trials extend (J+3, J+7, J+13) avec emails persos
- [ ] Bot d'aide in-app pour onboarding

**Phase E : Auto-amélioration (17h)**
- [ ] Cron `sentry-digest` (hebdo) : top 10 erreurs récurrentes → GitHub issues auto
- [ ] Cron `feedback-mining` : analyse emails contact@ → catégorise (bug/feature/question)
- [ ] Dependabot avec auto-merge si Playwright + build verts
- [ ] Detection features demandées par X clients en 1 mois → escalade backlog

**Livrable J60** : Volia démarche ses propres prospects + détecte ses propres bugs + alimente ses propres tasks.

### Sprint 3 (J60-J90) — Full auto + polish

**Phase F : Marketing avancé (16h)**
- [ ] Cron `blog-auto-write` (1/sem) : pioche backlog SEO → génère article Claude → tag "needs-review"
- [ ] Auto-A/B test landings (1 variant/mois sur CTAs)
- [ ] Newsletter mensuelle auto-générée (4 stats + 3 features + 1 quote)
- [ ] Reactivation churners (cron 30/60/90j post-churn)

**Phase G : Commercial avancé (16h)**
- [ ] Demo bot conversationnel sur `/demo-chat`
- [ ] Auto-reply emails FAQ (avec validation queue)
- [ ] Auto-optimisation pages SEO refresh 90j

**Livrable J90** : ~80% des décisions opérationnelles automatisées. Founder intervient 1-2h/jour pour validation queue + exceptions.

---

## 🚨 Risques + mitigation

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Bot auto-comm publie un truc gênant | Moyenne | Élevé (brand) | Approval queue obligatoire pour tous posts sociaux + ton mock review |
| Cold email outbound déclenche signalement spam | Moyenne | Critique (deliverability domaine) | Throttling strict + warmup respecté + opt-out OBLIGATOIRE + ciblage manuel valider les listes |
| Bug auto-merge casse la prod | Faible | Élevé | Tests Playwright passent + canary deploy + auto-rollback si erreur Sentry spike |
| Génération IA hallucinée → claim faux DGCCRF | Moyenne | Critique (légal) | Approval queue + linter de claims (regex sur "287000+", "0 humain", etc.) + sandbox draft avant publication |
| Coût Claude API explose | Faible | Moyen (€€€) | Hard cap budget/mois via API limit + alertes |
| Anthropic récupère Volia comme cas marketing IA | Élevée | Moyen (positionnement) | Garder narratif "supervisé par 1 founder" + ne pas surcommuniquer "Anthropic-powered" |

---

## 🔥 Kill switches (3 niveaux)

1. **Env var `AUTONOMOUS_MODE_ENABLED=false`** sur Vercel → désactive tous les crons "intelligents" en 1 redeploy (30s)
2. **Email à `stop@volia.fr` avec subject "STOP"** → désactive le flag instantanément via webhook (Resend Inbound) — mobile-friendly
3. **Page `/admin/auto-kill-switch`** → toggle UI accessible founder only

---

## 📊 KPIs de succès J+90

| KPI | Cible |
|---|---|
| Temps founder hebdo sur tâches répétitives | -70% (de ~30h/sem à ~10h/sem) |
| Contenu sociaux publiés/sem | 5+ (vs 1-2 actuel) |
| Articles blog publiés/mois | 4-5 (vs ~2 actuel) |
| Cold emails outbound envoyés/mois | 500-1000 (qualité maintenue) |
| Bugs auto-détectés et fixés | 80% des erreurs Sentry récurrentes |
| Trials → Business conversion | +20-30% (auto-relance) |
| Coût opérationnel IA mensuel | < 200€ (Claude API + tools) |
| Incidents nécessitant kill switch | < 1/mois |

---

## 📝 Anti-patterns à éviter

- **Over-engineering** : ne pas coder un agent méta-conscient. Boucles simples = mieux.
- **Auto-tout** : la moitié des actions doit rester humaine (closing, contenu stratégique, support critique). Sinon on devient soulless.
- **Vaporware** : pas pitcher "entreprise autonome" tant que les boucles auto ne tournent pas vraiment.
- **Ignorer les anomalies** : un cron qui plante en silence pendant 1 semaine = catastrophe.

---

## 📂 Structure dossier `docs/autonomy/`

```
docs/autonomy/
├── 00-PLAN.md                    ← Ce fichier
├── 01-garde-fous.md              ← Spec détaillée des garde-fous
├── 02-comm-roadmap.md            ← Détail des cron comm
├── 03-marketing-roadmap.md       ← Détail des cron marketing
├── 04-commercial-roadmap.md      ← Détail des cron commercial
├── 05-product-roadmap.md         ← Détail des cron auto-amélioration
└── 06-incident-runbook.md        ← Que faire si une boucle dérape
```

---

**Dernière mise à jour** : 1er juin 2026
**Owner** : Anthony Malartre
**Status** : Sprint 1 Phase A (garde-fous) — IN PROGRESS
