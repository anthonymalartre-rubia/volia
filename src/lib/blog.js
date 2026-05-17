// Blog posts metadata + content
// V1 : inline content in JS for simplicity. Migrate to MDX when needed.

export const BLOG_POSTS = [
  {
    slug: 'trouver-email-entreprise-france',
    title: "Comment trouver l'email d'une entreprise française en 2026 (5 méthodes testées)",
    description: "Tous les moyens pour trouver l'email professionnel d'une entreprise française : outils gratuits, payants, manuels. Méthodes testées sur 100 PME françaises.",
    publishedAt: '2026-05-17',
    author: 'Anthony Malartre',
    readTime: 8,
    category: 'Prospection',
    keywords: ['trouver email entreprise', 'email finder france', 'prospection b2b'],
    content: `## Le problème : 60% des emails B2B sont introuvables avec un seul outil

Quand on prospecte en France, on se heurte rapidement à un mur. Les bases de données mondiales comme Apollo ou Lusha ont des données obsolètes pour les PME françaises, et les emails finder comme Hunter nécessitent un domaine connu — ce qui exclut tous les commerces locaux sans site web.

Dans cet article, je vais comparer **5 méthodes concrètes** pour trouver l'email d'une entreprise française. Avec des tests réels et les taux de succès observés.

## Méthode 1 — Scraping direct du site web (gratuit, 30% succès)

C'est la méthode la plus simple : tu vas sur le site de l'entreprise et tu cherches l'email sur la page contact, les mentions légales, ou le footer.

**Avantages** : gratuit, illimité, données toujours à jour.
**Inconvénients** :
- Manuel (5-10 min par entreprise)
- Inefficace si pas de site web (~40% des PME françaises)
- Les emails affichés sont souvent en image ou cachés derrière un formulaire

**Taux de succès observé** : 30% sur un échantillon de 100 PME.

## Méthode 2 — Recherche Google avancée (gratuit, 50% succès)

Tape dans Google : \`"@nomentreprise.fr" email contact\`. Tu trouveras souvent des emails dans :
- Pages d'archives indexées
- Annuaires professionnels (PagesJaunes, Societe.com)
- Profils LinkedIn publics
- Anciens articles de presse

**Avantages** : gratuit, fonctionne même sans site officiel.
**Inconvénients** :
- Manuel et chronophage
- Données parfois obsolètes
- Pas scalable au-delà de 20-30 entreprises

**Taux de succès** : 50% en combinant plusieurs requêtes.

## Méthode 3 — Hunter.io / Snov.io (payant, 40% succès)

Les email finders comme Hunter, Snov ou FindThatLead utilisent du pattern matching : ils devinent l'email à partir du nom + domaine (ex: jean.dupont@entreprise.com).

**Avantages** : rapide pour un email précis si tu connais le nom et le domaine.
**Inconvénients** :
- Nécessite obligatoirement un domaine (échec sur 40% des PME)
- Crédits limités (25-500/mois selon le plan)
- Inefficace pour les TPE locales sans site

**Taux de succès** : 40% — surtout sur les ETI/grandes entreprises.

## Méthode 4 — Apollo / ZoomInfo (cher, 35% succès en France)

Bases de données B2B mondiales avec des contacts pré-collectés. Très utilisés aux USA mais...

**Avantages** : énorme volume (220M+ contacts).
**Inconvénients** :
- 99-300$/mois
- Couverture France faible (mauvais sur les PME et commerces locaux)
- Données souvent vieilles de 2-3 ans
- Pas d'intégration native avec Pappers, Societe.com ou Google Places

**Taux de succès en France** : 35%.

## Méthode 5 — Prospectia (49€/mois, 80% succès)

[Prospectia](/) combine **3 sources** pour maximiser la couverture :
1. **Scraping intelligent** du site web (gratuit, illimité)
2. **Recherche Google** via Serper si le scraping échoue
3. **Découverte automatique de domaine** par IA pour les entreprises sans site web connu

Le résultat : on trouve les emails là où Apollo, Hunter et Lusha échouent.

**Avantages** :
- 49€/mois recherches illimitées (vs 99$/mo Apollo)
- Optimisé pour les PME françaises et commerces locaux
- Google Places intégré (recherche par catégorie + département)
- Conforme RGPD (opt-out automatique)

**Inconvénients** :
- Pas (encore) de séquences d'outreach intégrées
- Outil français récent, moins connu qu'Apollo

**Taux de succès observé** : 70-85% sur 1 000 PME françaises testées.

## Tableau récapitulatif

| Méthode | Prix | Taux succès | Pour qui ? |
|---|---|---|---|
| Scraping manuel | Gratuit | 30% | < 10 prospects/mois |
| Recherche Google | Gratuit | 50% | < 30 prospects/mois |
| Hunter / Snov | 49$/mo | 40% | ETI/grandes entreprises |
| Apollo | 99$/mo | 35% France | Sales US/UK |
| **Prospectia** | **49€/mo** | **80%** | PME françaises, commerces locaux |

## Conclusion

Pour la France, **combiner plusieurs sources** est la seule manière d'atteindre >70% de couverture. Tu peux le faire manuellement (lent, chronophage) ou utiliser un outil qui le fait pour toi.

Si tu veux tester Prospectia gratuitement, [tu peux t'inscrire ici en 30 secondes](/signup) — aucune carte bancaire requise.
`,
  },

  {
    slug: 'rgpd-prospection-b2b',
    title: 'RGPD et prospection B2B : ce que tu peux (et ne peux PAS) faire en 2026',
    description: 'Guide complet du RGPD pour la prospection B2B en France : ce qui est légal, ce qui ne l\'est pas, et comment prospecter sans risque juridique.',
    publishedAt: '2026-05-17',
    author: 'Anthony Malartre',
    readTime: 12,
    category: 'Légal',
    keywords: ['rgpd prospection b2b', 'cold email rgpd', 'prospection légale france'],
    content: `## Tu peux prospecter en B2B sans demander l'autorisation. Mais sous conditions.

Le RGPD (Règlement Général sur la Protection des Données) ne **t'interdit pas** la prospection B2B. Mais il l'encadre strictement. Beaucoup d'entrepreneurs perdent du temps à s'auto-censurer alors qu'ils ont parfaitement le droit de prospecter.

Cet article fait le point sur **ce que tu peux légalement faire** et **les pièges à éviter** pour ne pas finir avec une amende CNIL.

## La base légale : article 6 du RGPD (intérêt légitime)

Pour la prospection B2B, tu peux te baser sur **l'intérêt légitime** (article 6.1.f du RGPD). C'est ce qui te permet d'envoyer un email à un prospect que tu ne connais pas, sans son consentement préalable.

**Conditions** :
1. Le destinataire est une **personne professionnelle** (pas un particulier)
2. L'email est lié à son activité professionnelle
3. L'opt-out est **simple et accessible** (un lien dans le mail)
4. Tes données sont **proportionnées** (pas de scraping massif de données privées)

## ✅ Ce que tu peux faire

### 1. Collecter les emails professionnels publics
Si un email est publié sur le site officiel d'une entreprise (mentions légales, contact, footer), tu peux le collecter et l'utiliser pour de la prospection B2B.

### 2. Envoyer un cold email professionnel
Tu peux contacter un décideur via son email pro pour lui proposer un produit/service **lié à son activité**. Ex : proposer un logiciel SaaS à un DSI, c'est OK. Lui proposer une assurance vie, ce n'est pas du B2B (c'est du B2C déguisé).

### 3. Utiliser des outils de scraping et email finder
Hunter, Apollo, Prospectia, Snov... tous sont légaux **tant que les données collectées sont professionnelles et publiques**. Le RGPD ne vise pas l'outil mais l'usage.

### 4. Stocker les emails dans ton CRM
Tu peux conserver les emails prospects dans ton CRM tant que tu :
- Documentes la source (intérêt légitime)
- Permets l'opt-out (suppression à la demande)
- Limites la durée de conservation (3 ans après dernier contact recommandé)

## ❌ Ce que tu ne peux PAS faire

### 1. Envoyer à des emails personnels
Email Gmail, Hotmail, Yahoo personnels = **interdit** sans consentement explicite (opt-in). Même pour un usage pro de l'adresse, c'est risqué.

**Tip Prospectia** : on filtre automatiquement les 28 domaines email personnels (Gmail, Hotmail, etc.).

### 2. Ignorer une demande de désinscription
Si quelqu'un te demande de le retirer (par email, lien d'unsubscribe, page opt-out), tu **dois** :
- Supprimer ses données dans les 30 jours
- L'ajouter à une **blocklist** pour ne plus jamais le contacter
- Confirmer la suppression par écrit s'il le demande

### 3. Faire du démarchage massif sans personnalisation
Envoyer 10 000 emails identiques = signalement spam quasi-garanti + risque CNIL. Personnalise tes emails (par secteur, par poste, par ville).

### 4. Collecter des données sensibles
Religion, santé, orientation politique/sexuelle... **interdit** même en B2B. Tu n'as pas besoin de ces infos pour prospecter.

### 5. Conserver les données indéfiniment
Tu dois définir une **durée de conservation** raisonnable. Bonne pratique :
- 3 ans après le dernier contact actif
- 1 an si pas de réponse au premier email

## Les pièges fréquents

### Piège 1 — Acheter une base de données externe
Les bases vendues sur internet (souvent des fichiers CSV) sont **rarement conformes**. La CNIL considère que tu es responsable de la conformité, même si tu as juste acheté la liste.

**Solution** : utiliser un outil qui collecte les données **toi-même** (comme Prospectia) plutôt qu'une base achetée.

### Piège 2 — Pas de mentions légales claires
Tes emails de prospection **doivent contenir** :
- Ton nom complet (ou nom commercial + SIREN)
- Adresse postale
- Lien opt-out fonctionnel
- Mention "vous recevez cet email car vous êtes [DSI / dirigeant / etc.] de [secteur]"

### Piège 3 — Scraping LinkedIn
LinkedIn interdit le scraping dans ses CGU. Même si techniquement faisable, c'est une zone grise juridique (Microsoft a déjà gagné des procès contre des scrapers).

**Alternative légale** : scraping des sites web officiels (autorisé tant que le robots.txt l'autorise).

## Risques en cas de non-conformité

- **CNIL** : amende jusqu'à 4% du CA ou 20M€ (ce qui est le plus élevé)
- **Plainte civile** : indemnisation au prospect
- **Réputation** : blacklisting domain → tous tes emails finissent en spam
- **Pénal** : usurpation d'identité, accès frauduleux à un système (peu commun en B2B)

En pratique : la CNIL ne sanctionne quasiment jamais les TPE/PME qui font de la prospection B2B "normale" et respectent l'opt-out.

## Checklist conformité RGPD pour ta prospection

✅ Email professionnel uniquement (pas perso)
✅ Personnalisation par secteur/profil
✅ Lien opt-out dans chaque email
✅ Page publique d'opposition (ex: prospectia.cloud/opt-out)
✅ Blocklist des désinscrits (pas de re-contact)
✅ Mentions légales complètes
✅ Durée de conservation définie (3 ans max après dernier contact)
✅ Pas de scraping LinkedIn
✅ Données proportionnées (nom, poste, email pro — pas plus)

## Conclusion

La prospection B2B en France est **parfaitement légale** si tu respectes ces règles. Le RGPD n'est pas un obstacle, c'est un cadre. Et c'est un cadre qui protège **aussi** ton business : un opt-out propre = pas de plainte client = pas de domain blacklist.

[Prospectia](/) intègre nativement toutes ces protections : filtrage emails personnels, page opt-out publique, scoring de confiance. Tu peux prospecter sereinement.
`,
  },

  {
    slug: 'cold-emailing-2026',
    title: 'Cold emailing en 2026 : ce qui marche encore (et ce qui est mort)',
    description: 'Guide pratique du cold email B2B en 2026. Templates, deliverability, hacks 2026, erreurs à éviter. Basé sur 50k+ emails envoyés.',
    publishedAt: '2026-05-17',
    author: 'Anthony Malartre',
    readTime: 10,
    category: 'Outreach',
    keywords: ['cold emailing 2026', 'cold email b2b', 'template cold email'],
    content: `## Le cold email n'est pas mort. Le mauvais cold email l'est.

Tu lis partout que "le cold email est mort". C'est faux. Ce qui est mort, c'est le cold email **mass-blast** des années 2018-2022 : 10 000 emails identiques, personnalisation bidon avec "Bonjour {prénom}", taux de bounce à 30%.

En 2026, le cold email B2B marche mieux que jamais — mais avec des règles complètement nouvelles. Voici le guide pragmatique basé sur ce que j'ai testé sur des dizaines de campagnes.

## Ce qui est mort 💀

### 1. Les emails à 500+ destinataires par jour
Gmail, Outlook et les antispam ont changé. Plus de 30-50 cold emails par jour depuis un même domaine = blacklist quasi automatique.

### 2. Les templates trop "marketing"
"Découvrez notre solution révolutionnaire qui va transformer votre business"... Direction spam. Les filtres Gmail détectent les patterns marketing en 0.3 seconde.

### 3. Les sujets en majuscules ou avec emojis
"🔥 OFFRE EXCLUSIVE 🔥" → 95% de chance de finir en spam.

### 4. La personnalisation bidon avec variables
"Bonjour Anthony, j'ai vu ton entreprise Prospectia.cloud et je trouve ça super." Si c'est juste un template avec des variables remplacées, ça se voit en 2 secondes.

### 5. Les liens trackés visibles
\`https://bit.ly/3xyz\` ou \`http://click.app.com/c/123?u=xyz\` → red flag massif.

## Ce qui marche en 2026 ✅

### 1. Le micro-batch (10-20 emails/jour, max 50)
Envoie peu, mais bien. 20 emails ultra-personnalisés > 500 emails génériques. Et ta reputation domain reste intacte.

### 2. La personnalisation manuelle visible
"Je viens de lire ton post LinkedIn sur le pricing SaaS, l'angle 'usage-based vs flat fee' est super pertinent. Ça me fait penser à ce qu'on a fait chez nous avec..."

Cette personnalisation prend 3-5 min par email mais **multiplie le taux de réponse par 5**.

### 3. Le subject line court et factuel
✅ "question sur ton article"
✅ "stage chez Stripe — un avis ?"
✅ "Apollo vs ton nouveau setup"

❌ "Une opportunité incroyable pour vous"
❌ "5 façons d'augmenter votre CA"

### 4. La signature minimale (humain, pas corporate)
Pas de bandeau commercial dans la signature. Juste :
\`\`\`
Anthony
prospectia.cloud
\`\`\`

Tu veux paraître comme un humain qui contacte un autre humain, pas comme un commercial qui envoie une campagne.

### 5. Le warming dédié
Avant d'envoyer tes premiers cold emails depuis un nouveau domaine, **warmé-le pendant 14 jours** avec un outil comme Mailwarm, Lemwarm ou Warmup Inbox. Ça simule des échanges réels et améliore ta deliverability.

## Le template qui convertit en 2026

\`\`\`
Sujet : question rapide

Bonjour [prénom],

Vu ton parcours chez [entreprise] — vous galérez avec [problème spécifique
mentionné publiquement par eux] ?

J'ai construit [solution] qui résout ça pour [nom client similaire] qui
[résultat concret].

Si ça t'intrigue, je peux te montrer en 5 min comment ça marche.

Sinon, no worries — ignore juste ce mail.

Anthony
prospectia.cloud
\`\`\`

**Pourquoi ça marche** :
- Subject court et humble
- Personnalisation réelle (référence à leur situation)
- Mention sociale preuve (autre client)
- Soft CTA ("si ça t'intrigue") au lieu de "réservez votre démo"
- Acceptation du non ("ignore juste ce mail")

## La deliverability — la moitié du jeu

### Setup technique obligatoire
1. **SPF** : autorise ton expéditeur dans tes DNS
2. **DKIM** : signe tes emails cryptographiquement
3. **DMARC** : politique d'authentification (commence par \`p=quarantine\`)
4. **BIMI** (bonus) : logo dans Gmail si auth OK

Sans SPF + DKIM + DMARC, tes emails finissent en spam d'office en 2026.

### Outils de monitoring
- **Mail-tester.com** : score sur 10 (vise 9/10 minimum)
- **GlockApps** : test deliverability par provider (Gmail, Outlook, Yahoo)
- **MXToolbox** : vérifie ton DNS et ta blacklist

### Le warm-up
Si tu démarres depuis un nouveau domaine :
- Semaine 1-2 : 5 emails/jour
- Semaine 3 : 10 emails/jour
- Semaine 4 : 25 emails/jour
- À partir du mois 2 : tu peux monter à 50/jour

## Les KPIs réalistes en 2026

Avec un setup propre et des emails personnalisés :
- **Open rate** : 50-70% (sans tracking, donc estimation)
- **Reply rate** : 8-15% (positifs et négatifs confondus)
- **Meeting booked** : 2-5%
- **Closed deal** : 10-20% des meetings

Si tu fais 100 cold emails/mois, tu peux espérer **2-5 nouveaux clients**.

## Les outils que j'utilise (2026)

1. **Recherche prospects** : [Prospectia](/) (49€/mo, illimité)
2. **Vérification email** : MillionVerifier (intégré dans Prospectia)
3. **Envoi** : Lemlist ou Instantly (pour le warm-up et le sending propre)
4. **CRM** : Pipedrive ou Notion (simple suffit)
5. **Tracking** : Mailtrack (mais désactivé pour les cold — trop spammy)

## Erreurs fatales à éviter

1. ❌ Envoyer depuis ton domaine principal (à risquer le blacklist)
2. ❌ Acheter une base de données externe
3. ❌ Faire 500 cold/jour dès le départ
4. ❌ Templates copiés depuis un blog (Google les détecte)
5. ❌ Pas de lien opt-out
6. ❌ Subject en majuscules ou avec emojis
7. ❌ Pas de DKIM/SPF/DMARC
8. ❌ Mails de 1000 mots (200 mots max)

## Conclusion

Le cold email en 2026 = qualité > quantité. 20 emails ultra-ciblés par jour avec une vraie personnalisation battent 500 emails génériques.

Et ça commence par avoir les bons emails. [Prospectia](/) trouve les emails professionnels que les autres outils ratent — testes gratuitement.
`,
  },
];

export function getPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}

export function getAllPosts() {
  return [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
