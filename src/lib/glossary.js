// Glossary terms — 50 SEO-targeted definitions

export const GLOSSARY = [
  {
    slug: 'cold-emailing',
    term: 'Cold Emailing',
    shortDef: 'Envoi d\'emails commerciaux à des prospects qui n\'ont pas encore manifesté d\'intérêt pour votre produit.',
    longDef: `Le **cold emailing** désigne l'envoi d'emails commerciaux à des prospects "froids", c'est-à-dire qui ne vous connaissent pas et n'ont pas demandé à être contactés. C'est une technique d'**outbound marketing** très utilisée en B2B pour générer des rendez-vous commerciaux.

En 2026, le cold emailing fonctionne toujours mais nécessite une approche très différente d'il y a 5 ans : personnalisation massive, micro-batchs (20-50 emails/jour), warming des domaines, et conformité RGPD stricte. Voir notre [guide complet du cold emailing 2026](/blog/cold-emailing-2026).

**Bonnes pratiques** :
- Sujet court (3-7 mots), pas de majuscules ni d'emojis
- Personnalisation réelle (référence à leur entreprise/poste)
- Soft CTA en bas du mail
- Lien d'opt-out obligatoire (RGPD)
- Suivi 2-3 fois max si pas de réponse`,
    related: ['lead-magnet', 'icp', 'rgpd', 'deliverability', 'warm-up'],
    category: 'Outbound',
  },
  {
    slug: 'lead-magnet',
    term: 'Lead Magnet',
    shortDef: 'Contenu gratuit (ebook, template, calculateur) offert en échange d\'une adresse email de prospect.',
    longDef: `Un **lead magnet** (aimant à prospects) est un contenu gratuit offert en échange des coordonnées d'un prospect, généralement son email. C'est l'outil principal de l'**inbound marketing** pour capturer des leads qualifiés.

**Formats efficaces en B2B** :
- Ebook PDF (15-30 pages)
- Templates Excel/Notion
- Checklist
- Calculateur (ROI, économies)
- Webinar replay
- Audit gratuit
- Mini-cours email (5-7 jours)

**Critères d'un bon lead magnet** :
- Résout un problème **précis** de votre ICP
- Promet un **résultat tangible** (chiffrable)
- Téléchargeable **immédiatement**
- Démontre votre **expertise**

Exemples Volia : "Template Excel : Plan de prospection 30 jours" ou "100 sujets cold email B2B testés".`,
    related: ['icp', 'cold-emailing', 'inbound-marketing'],
    category: 'Inbound',
  },
  {
    slug: 'icp',
    term: 'ICP (Ideal Customer Profile)',
    shortDef: 'Description précise du client idéal pour votre produit (secteur, taille, poste, besoin).',
    longDef: `L'**ICP** (*Ideal Customer Profile*) est la description précise du client idéal pour votre produit ou service. C'est la fondation de toute stratégie de prospection B2B efficace : sans ICP clair, vous arrosez large et convertissez peu.

**Composantes d'un ICP B2B** :
- **Firmographie** : secteur, taille (CA, effectifs), maturité, géographie
- **Technographie** : outils/tech stack utilisés
- **Comportemental** : signaux d'achat, événements déclencheurs (levée de fonds, embauche, etc.)
- **Persona décideur** : poste, séniorité, problèmes prioritaires

**Différence ICP vs Buyer Persona** :
- L'ICP décrit l'**entreprise** cible
- Le buyer persona décrit la **personne** dans cette entreprise

**Comment construire son ICP** :
1. Analyser vos 10 meilleurs clients actuels
2. Identifier les points communs (secteur, taille, problèmes résolus)
3. Calculer le **LTV** moyen et le **payback period**
4. Filtrer pour ne garder que les profils rentables`,
    related: ['lead-magnet', 'cold-emailing', 'bant'],
    category: 'Stratégie',
  },
  {
    slug: 'bant',
    term: 'BANT',
    shortDef: 'Framework de qualification commerciale : Budget, Authority, Need, Timing.',
    longDef: `**BANT** est un framework de qualification commerciale créé par IBM dans les années 60. Il sert à évaluer si un prospect est **vraiment qualifié** pour devenir client.

Les 4 critères :
- **B**udget : a-t-il les moyens d'acheter ?
- **A**uthority : est-il décideur ?
- **N**eed : a-t-il un vrai besoin ?
- **T**iming : est-ce le bon moment ?

**Comment l'utiliser dans un discovery call** :

> *"Pour bien comprendre ton besoin, j'aurais 4 questions rapides : quel budget vous avez sur ce sujet (B), qui prend la décision finale (A), quel est ton problème principal aujourd'hui (N), et quand voudrais-tu une solution en place (T) ?"*

**Limites de BANT** :
- Trop directif pour les modèles freemium ou self-serve
- Pas adapté aux ventes complexes multi-décideurs
- Alternatives modernes : **MEDDIC**, **GPCTBA/C&I**, **SPIN Selling**

Mais BANT reste **utile pour qualifier rapidement** un cold email reply ou un lead inbound avant de booker un meeting.`,
    related: ['icp', 'cold-emailing'],
    category: 'Vente',
  },
  {
    slug: 'rgpd',
    term: 'RGPD',
    shortDef: 'Règlement Général sur la Protection des Données. Loi européenne encadrant la collecte et l\'usage des données personnelles.',
    longDef: `Le **RGPD** (Règlement Général sur la Protection des Données) est entré en vigueur en mai 2018 dans toute l'Union Européenne. Il encadre la **collecte**, le **stockage** et l'**usage** des données personnelles.

**En prospection B2B**, le RGPD ne vous interdit PAS la prospection. Vous pouvez utiliser la base légale "intérêt légitime" (article 6.1.f) pour contacter des décideurs B2B sans leur consentement préalable, à 4 conditions :

1. Email **professionnel** (pas Gmail/Hotmail perso)
2. Email **lié à l'activité** du destinataire (pas de B2C déguisé)
3. Opt-out **simple** dans chaque email
4. Données **proportionnées** (pas de scraping massif de données privées)

**Sanctions** :
- Amende CNIL : jusqu'à **4% du CA mondial** ou 20M€
- Plainte civile possible
- Réputation : domain blacklist

**En pratique**, la CNIL ne sanctionne quasiment jamais les TPE/PME qui font du démarchage B2B "raisonnable" et respectent l'opt-out.

Voir notre [guide complet RGPD prospection B2B](/blog/rgpd-prospection-b2b).`,
    related: ['cold-emailing', 'opt-out', 'cnil'],
    category: 'Légal',
  },
  {
    slug: 'opt-out',
    term: 'Opt-out',
    shortDef: 'Possibilité pour un destinataire de se désinscrire d\'une liste d\'emails.',
    longDef: `L'**opt-out** est le droit pour un destinataire d'**arrêter de recevoir** vos emails. C'est une obligation légale en France et en Europe (RGPD).

**Comment implémenter un opt-out conforme** :
- Lien **"Se désinscrire"** dans chaque email (pas caché)
- Page **publique d'opt-out** sur votre site
- Suppression de l'email **sous 30 jours max**
- Ajout à une **blocklist** pour ne plus jamais le contacter (même via autre canal)
- Confirmation écrite si demandée

**Différence opt-out vs opt-in** :
- **Opt-in** : le destinataire **demande** à recevoir (newsletter, lead magnet)
- **Opt-out** : le destinataire peut **refuser** après réception (cold email B2B)

En B2B, l'opt-out est suffisant (base légale "intérêt légitime"). En B2C, l'**opt-in explicite est obligatoire** (consentement préalable).

Volia gère l'opt-out automatiquement : page publique [/opt-out](/opt-out) + blocklist + filtrage automatique des futurs enrichissements.`,
    related: ['rgpd', 'cnil', 'cold-emailing'],
    category: 'Légal',
  },
  {
    slug: 'cnil',
    term: 'CNIL',
    shortDef: 'Commission Nationale de l\'Informatique et des Libertés. Autorité française de protection des données.',
    longDef: `La **CNIL** (Commission Nationale de l'Informatique et des Libertés) est l'autorité administrative indépendante française chargée de **faire respecter le RGPD** et la **loi Informatique et Libertés**.

**Rôle de la CNIL** :
- Recevoir les plaintes des particuliers (~14 000/an)
- Contrôler les entreprises (sur place ou sur pièces)
- Prononcer des sanctions (amendes, injonctions)
- Conseiller sur la conformité RGPD

**En prospection B2B**, la CNIL est rarement sollicitée. Les plaintes viennent surtout du B2C (newsletters non sollicitées, démarchage téléphonique abusif).

**Bonnes pratiques pour éviter la CNIL** :
- Respecter opt-out (cause #1 de plaintes)
- Mentions légales claires (nom, SIREN, adresse)
- Pas de scraping de données personnelles (LinkedIn perso, etc.)
- Ne pas acheter de bases de données externes douteuses
- Documenter votre base légale (intérêt légitime)

**Amendes 2024-2025** :
- Médiane TPE/PME : 5 000-50 000€
- Médiane ETI : 100 000-500 000€
- Grandes entreprises : plusieurs millions`,
    related: ['rgpd', 'opt-out', 'cold-emailing'],
    category: 'Légal',
  },
  {
    slug: 'deliverability',
    term: 'Deliverability',
    shortDef: 'Capacité d\'un email à arriver dans l\'inbox du destinataire (vs spam).',
    longDef: `La **deliverability** (délivrabilité) mesure le pourcentage d'emails qui arrivent dans la **boîte de réception principale** du destinataire (vs spam, promotions, ou bouncing).

**Une bonne deliverability = 90%+ d'inbox placement.** En cold emailing, c'est l'**indicateur le plus critique** (avant même le taux d'ouverture).

**Facteurs qui impactent la deliverability** :

1. **Authentification email** :
   - SPF, DKIM, DMARC correctement configurés
   - BIMI (logo dans Gmail)

2. **Réputation domaine** :
   - Âge du domaine (>30 jours)
   - Volume d'envoi régulier (pas de pics)
   - Taux de bounce <2%
   - Taux de plainte <0.1%

3. **Qualité du contenu** :
   - Pas de mots déclencheurs spam ("gratuit !", "argent rapide")
   - Ratio texte/HTML équilibré
   - Pas de liens raccourcis (bit.ly)
   - Pas d'images sans alt text

4. **Engagement** :
   - Taux d'ouverture (signal positif)
   - Réponses (excellent signal)
   - Mark as spam (très mauvais)

**Outils de test** :
- [Mail-tester.com](https://mail-tester.com) : score sur 10
- [GlockApps](https://glockapps.com) : test par provider
- [MXToolbox](https://mxtoolbox.com) : check blacklist`,
    related: ['cold-emailing', 'warm-up', 'spf-dkim-dmarc'],
    category: 'Technique',
  },
  {
    slug: 'warm-up',
    term: 'Warm-up (warming domain)',
    shortDef: 'Période d\'envoi progressif d\'emails pour construire la réputation d\'un nouveau domaine.',
    longDef: `Le **warm-up** (ou *warming*) est la période pendant laquelle on **augmente progressivement** le volume d'envoi d'un nouveau domaine email pour construire sa **réputation** auprès des fournisseurs (Gmail, Outlook, Yahoo).

**Pourquoi c'est nécessaire** :
Un nouveau domaine qui envoie soudainement 100 emails/jour = **comportement de spammer** → blacklist automatique.

**Protocole de warm-up classique** (28 jours) :
- Jour 1-3 : 5 emails/jour
- Jour 4-7 : 10 emails/jour
- Semaine 2 : 25 emails/jour
- Semaine 3 : 50 emails/jour
- Semaine 4 : 75 emails/jour
- Mois 2+ : 100-150/jour (max recommandé)

**Outils de warm-up automatique** :
- **Mailwarm** (~10$/mo)
- **Lemwarm** (intégré à Lemlist)
- **Warmup Inbox** (~9$/mo)
- **Mailreach** (10-30$/mo)

Ces outils simulent des échanges entre boîtes mail (envois + réponses + marquage "non-spam") pour construire artificiellement une réputation positive.

**Important** : même un domaine **chaud** doit être maintenu (envoi régulier d'emails légitimes). Ne pas envoyer pendant 2 mois = perte de réputation.`,
    related: ['deliverability', 'cold-emailing', 'spf-dkim-dmarc'],
    category: 'Technique',
  },
  {
    slug: 'spf-dkim-dmarc',
    term: 'SPF, DKIM, DMARC',
    shortDef: 'Trois protocoles d\'authentification email essentiels pour éviter le spam.',
    longDef: `**SPF**, **DKIM** et **DMARC** sont 3 protocoles DNS qui authentifient vos emails et préviennent l'**usurpation d'identité** (phishing).

**Sans ces 3 protocoles, vos emails finissent quasi-systématiquement en spam en 2026.**

### SPF (Sender Policy Framework)
Autorise certains serveurs à envoyer des emails depuis votre domaine.

Exemple record DNS TXT :
\`\`\`
v=spf1 include:_spf.google.com include:sendgrid.net ~all
\`\`\`

### DKIM (DomainKeys Identified Mail)
Signe cryptographiquement chaque email avec une clé privée. Les destinataires vérifient avec votre clé publique (record DNS).

Exemple record DNS TXT :
\`\`\`
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ...
\`\`\`

### DMARC (Domain-based Message Authentication)
Politique qui définit quoi faire si SPF ou DKIM échouent.

Exemple record DNS TXT :
\`\`\`
v=DMARC1; p=quarantine; rua=mailto:dmarc@votre-domaine.com
\`\`\`

**Politiques DMARC** :
- \`p=none\` : monitoring seulement
- \`p=quarantine\` : mettre en spam si échec
- \`p=reject\` : refuser totalement si échec

**Configuration** : 5-10 min via votre registrar DNS (OVH, Cloudflare, Gandi, etc.).

**Test** : [mxtoolbox.com](https://mxtoolbox.com/SuperTool.aspx) pour vérifier vos records.`,
    related: ['deliverability', 'warm-up', 'cold-emailing'],
    category: 'Technique',
  },
  {
    slug: 'b2b',
    term: 'B2B',
    shortDef: 'Business-to-Business : entreprise qui vend à d\'autres entreprises (vs B2C qui vend aux particuliers).',
    longDef: `**B2B** signifie *Business-to-Business* : entreprise qui vend des produits ou services à **d'autres entreprises**, par opposition au **B2C** (Business-to-Consumer) qui vend aux particuliers.

**Caractéristiques du B2B** :
- Cycles de vente plus longs (3-12 mois)
- Décisions multi-personnes (5-7 décideurs en moyenne)
- Ticket moyen plus élevé (5-100k€+)
- Relation long terme (LTV élevée)
- ROI mesurable et chiffré

**Canaux d'acquisition B2B principaux** :
- **Outbound** : cold email, cold call, LinkedIn outreach
- **Inbound** : SEO, content marketing, lead magnets
- **Paid** : Google Ads, LinkedIn Ads
- **Référence** : recommandation client (le plus efficace)
- **Partenariats** : intégrateurs, revendeurs, agences

**Outils B2B essentiels** :
- **CRM** : Pipedrive, HubSpot, Salesforce
- **Prospection** : Volia, Apollo, Hunter, Lusha
- **Email marketing** : Lemlist, Instantly, Klenty
- **Analytics** : Mixpanel, Amplitude, GA4`,
    related: ['icp', 'cold-emailing', 'crm'],
    category: 'Vente',
  },
  {
    slug: 'crm',
    term: 'CRM',
    shortDef: 'Customer Relationship Management. Logiciel pour gérer les prospects et clients.',
    longDef: `Un **CRM** (*Customer Relationship Management*) est un logiciel pour gérer toutes les interactions avec vos **prospects** et **clients** : contacts, deals, emails, appels, notes, tâches.

**À quoi sert un CRM** :
- Centraliser les contacts (vs Excel + emails dispersés)
- Suivre le pipeline commercial (où en sont vos deals)
- Automatiser les relances (séquences emails, tâches)
- Mesurer la performance (taux conversion, cycle de vente)
- Collaborer en équipe (assignment, notes partagées)

**CRMs populaires en 2026** :

| CRM | Pour qui ? | Prix |
|---|---|---|
| **Pipedrive** | TPE/PME | 14-99€/user/mo |
| **HubSpot** | Tous, freemium | 0-1200€/mo |
| **Salesforce** | ETI/grandes | 25-300€/user/mo |
| **Zoho CRM** | TPE/PME budget | 12-52€/user/mo |
| **Notion** | Solos/freelances | 8€/user/mo |
| **Folk** | Agences | 19-59€/user/mo |
| **Attio** | Tech-savvy | 29-99€/user/mo |

**Conseil** : commencez **simple**. Notion ou Pipedrive suffisent jusqu'à 10 commerciaux. Migrez vers HubSpot/Salesforce quand vraiment nécessaire.

Volia exporte en **CSV standard** (nom, email, téléphone, site web, adresse, département, catégorie) — compatible avec **n'importe quel CRM** : HubSpot, Salesforce, Zoho, Pipedrive, Notion. 1-clic depuis le dashboard.`,
    related: ['b2b', 'icp', 'cold-emailing'],
    category: 'Outils',
  },
  // ─────────────────────────────────────────────────────────────────
  // Nouveaux termes ajoutés (passage de 12 à ~62) — couvre les courte
  // traîne sales/marketing les plus recherchées en France en 2026.
  // ─────────────────────────────────────────────────────────────────

  // === Sales metrics ===
  {
    slug: 'cac',
    term: 'CAC (Customer Acquisition Cost)',
    shortDef: 'Coût total pour acquérir un nouveau client (marketing + sales + outils).',
    longDef: `Le **CAC** (*Customer Acquisition Cost*, ou Coût d'Acquisition Client) est le coût total moyen pour gagner **un** nouveau client : salaires marketing/sales + outils + publicité + frais opérationnels, divisé par le nombre de nouveaux clients sur la période.

**Formule simple** : CAC = (Total dépenses marketing + sales) / Nombre de nouveaux clients

**Benchmarks B2B France 2026** (source [étude Volia](/etude/prospection-b2b-france-2026)) :
- TPE/PME SaaS : 600 € à 1 500 € par client
- Mid-market : 2 000 € à 8 000 €
- Enterprise : 10 000 € à 50 000 €+

**Ratio CAC/LTV** : doit être inférieur à 1/3 pour un business sain (chaque euro dépensé en acquisition doit en rapporter au moins 3 sur la durée de vie du client).

Volia réduit le CAC en automatisant la phase la plus chère du funnel : la découverte + l'enrichissement (vs SDR humain à 38 k€/an + outils).`,
    related: ['ltv', 'mrr', 'icp', 'cold-emailing'],
    category: 'Métriques',
  },
  {
    slug: 'ltv',
    term: 'LTV (Lifetime Value)',
    shortDef: 'Revenu total qu\'un client va générer sur toute la durée de sa relation avec votre entreprise.',
    longDef: `La **LTV** (*Lifetime Value*, ou Valeur Vie Client) est le revenu total moyen qu'un client va générer pendant toute la durée de sa relation avec votre entreprise. C'est la métrique reine du B2B SaaS : sans LTV solide, votre CAC vous tue.

**Formule** : LTV = ARPU mensuel × Durée moyenne de l'abonnement (en mois)

Exemple : un client à 49 €/mois qui reste 24 mois → LTV = 1 176 €.

**Ratio CAC/LTV optimal** : minimum 1/3 (CAC ≤ LTV/3). Au-dessous, votre business saigne.

**3 leviers pour augmenter la LTV** :
1. Réduire le churn (rétention)
2. Augmenter l'ARPU (upsell, cross-sell)
3. Allonger la durée moyenne (engagement)`,
    related: ['cac', 'churn', 'mrr', 'arr'],
    category: 'Métriques',
  },
  {
    slug: 'mrr',
    term: 'MRR (Monthly Recurring Revenue)',
    shortDef: 'Revenu mensuel récurrent prévisible d\'un business SaaS B2B.',
    longDef: `Le **MRR** (*Monthly Recurring Revenue*, ou Revenu Mensuel Récurrent) est le montant total facturé chaque mois de manière récurrente par un business SaaS. C'est la métrique principale d'un SaaS : tout le reste (MRR growth, churn, ARR) s'en déduit.

**Calcul** : MRR = somme des abonnements mensuels actifs (les annuels sont divisés par 12).

**Sous-types utiles** :
- **New MRR** : ajouts du mois
- **Expansion MRR** : upsells/cross-sells
- **Churned MRR** : annulations
- **Net New MRR** : New + Expansion − Churned

**MRR Growth Rate** sain pour un SaaS B2B early-stage : 10-15 %/mois ; mature : 3-5 %/mois.`,
    related: ['arr', 'churn', 'ltv', 'cac'],
    category: 'Métriques',
  },
  {
    slug: 'arr',
    term: 'ARR (Annual Recurring Revenue)',
    shortDef: 'MRR × 12 — le revenu annuel récurrent normalisé d\'un SaaS B2B.',
    longDef: `L'**ARR** (*Annual Recurring Revenue*) est simplement le MRR × 12, ou la somme des abonnements annuels actifs. C'est la métrique préférée des investisseurs B2B SaaS car elle lisse les variations mensuelles.

**Convention** : on parle d'un SaaS en termes d'ARR à partir de ~100 k€ ARR (= ~8 300 €/mois). En dessous, on raisonne en MRR ou en cash mensuel.

**Cibles de croissance ARR pour lever des fonds** :
- Seed (1-3 M€ levés) : 100-500 k€ ARR
- Series A (5-15 M€) : 1-3 M€ ARR
- Series B (15-50 M€) : 5-15 M€ ARR
- Series C+ : 20 M€ ARR+

**Règle des 40** : ARR Growth % + EBITDA Margin % ≥ 40 → SaaS sain.`,
    related: ['mrr', 'churn', 'cac', 'ltv'],
    category: 'Métriques',
  },
  {
    slug: 'churn',
    term: 'Churn (Taux d\'attrition)',
    shortDef: 'Pourcentage de clients qui annulent leur abonnement chaque mois.',
    longDef: `Le **churn** est le pourcentage de clients (ou de revenu) que vous perdez chaque mois. C'est l'ennemi public n°1 du SaaS B2B : un churn élevé annihile toute croissance.

**Deux types** :
- **Customer churn** : % de clients perdus = (clients perdus / clients début de période) × 100
- **Revenue churn (MRR churn)** : % de MRR perdu (plus pertinent car pondère par valeur)

**Benchmarks 2026** :
- **Excellent** : < 2 %/mois (24 %/an)
- **Bon** : 2-5 %/mois
- **À surveiller** : 5-10 %/mois
- **Critique** : > 10 %/mois

**Net Revenue Retention (NRR)** : MRR récurrent + expansion − churn. Si > 100 %, le business croît même sans nouveaux clients (= rêve).`,
    related: ['mrr', 'arr', 'ltv', 'nps'],
    category: 'Métriques',
  },
  {
    slug: 'nps',
    term: 'NPS (Net Promoter Score)',
    shortDef: 'Mesure de satisfaction client : pourcentage de promoteurs − pourcentage de détracteurs.',
    longDef: `Le **NPS** (*Net Promoter Score*) est un indicateur de satisfaction client basé sur **une seule question** : "Sur une échelle de 0 à 10, recommanderiez-vous notre produit/service à un collègue ?".

**Calcul** : NPS = % Promoteurs (9-10) − % Détracteurs (0-6). Les passifs (7-8) sont ignorés.

**Échelle de référence B2B SaaS** :
- **> 50** : excellent (Tesla, Apple, Stripe)
- **30-50** : très bon
- **0-30** : moyen
- **< 0** : alarme rouge

**Pourquoi c'est utile** : le NPS prédit la croissance organique (bouche-à-oreille, referrals) et est inversement corrélé au churn.`,
    related: ['churn', 'csm', 'b2b'],
    category: 'Métriques',
  },
  {
    slug: 'win-rate',
    term: 'Win Rate',
    shortDef: 'Pourcentage d\'opportunités commerciales qui se concrétisent en client signé.',
    longDef: `Le **win rate** est le ratio d'opportunités qualifiées (SQL) qui se transforment en clients signés (Closed-Won). C'est l'indicateur de performance des commerciaux le plus regardé.

**Formule** : Win Rate = Opportunités gagnées / (Opportunités gagnées + perdues)

**Benchmarks B2B SaaS 2026** :
- **Excellent** : > 30 %
- **Bon** : 20-30 %
- **Moyen** : 10-20 %
- **À améliorer** : < 10 %

**3 leviers pour augmenter le win rate** :
1. **Mieux qualifier** en amont (ICP strict, BANT/MEDDIC)
2. **Raccourcir le sales cycle** (objection handling, demo personnalisée)
3. **Améliorer le pricing fit** (proposition de valeur claire, ROI démontré)`,
    related: ['sql', 'mql', 'pipeline', 'sales-cycle'],
    category: 'Métriques',
  },
  {
    slug: 'pipeline',
    term: 'Pipeline commercial',
    shortDef: 'Ensemble des opportunités commerciales en cours, valorisées par étape du funnel.',
    longDef: `Le **pipeline** (ou *sales pipeline*) est la représentation visuelle de toutes les opportunités commerciales en cours, organisées par étape du processus de vente : prospect → qualification → demo → proposition → négociation → closed.

**Pipeline coverage** : ratio Pipeline valorisé / Objectif de la période. Cible saine = **3x** (un pipeline 3 fois plus gros que l'objectif compense les pertes naturelles).

Exemple : objectif Q1 = 100 k€ → pipeline ciblé = 300 k€.

**Outils de pilotage** : tous les CRM (Pipedrive, HubSpot, Salesforce, Folk) affichent le pipeline en kanban avec valorisation automatique.`,
    related: ['crm', 'win-rate', 'sales-cycle', 'sql', 'mql'],
    category: 'Sales process',
  },
  {
    slug: 'sales-cycle',
    term: 'Sales cycle (cycle de vente)',
    shortDef: 'Durée moyenne entre le premier contact avec un prospect et la signature du contrat.',
    longDef: `Le **sales cycle** est la durée moyenne (en jours) entre le premier contact avec un prospect et la signature finale. C'est un indicateur de **prédictibilité** : plus il est court et régulier, plus le forecast est fiable.

**Benchmarks B2B 2026** :
- **TPE/petites PME** (ticket < 100 €/mois) : 7-30 jours
- **PME mid-market** (ticket 100-1 000 €/mois) : 30-90 jours
- **Enterprise** (ticket > 10 k€/an) : 90-270 jours

**3 leviers pour raccourcir le sales cycle** :
1. Multi-threading dès la demo (impliquer 3-5 stakeholders)
2. Pricing transparent en ligne (évite l'aller-retour devis)
3. Trial gratuit ou freemium (accélère la décision)`,
    related: ['pipeline', 'win-rate', 'meddic', 'bant'],
    category: 'Sales process',
  },

  // === Sales process / méthodologies ===
  {
    slug: 'meddic',
    term: 'MEDDIC',
    shortDef: 'Méthodologie de qualification d\'opportunités B2B enterprise (Metrics, Economic buyer, Decision criteria…).',
    longDef: `**MEDDIC** est une méthodologie de qualification d'opportunités B2B enterprise, particulièrement utilisée pour les deals à long cycle et fort enjeu. Acronyme :

- **M**etrics : quels chiffres économiques le prospect veut-il améliorer ?
- **E**conomic buyer : qui a le pouvoir de signer le chèque ?
- **D**ecision criteria : quels critères seront utilisés pour choisir ?
- **D**ecision process : quelles étapes pour arriver à la décision ?
- **I**dentify pain : quel problème spécifique à résoudre ?
- **C**hampion : qui en interne pousse votre solution ?

**À utiliser quand** : deals > 50 k€/an, cycles > 60 jours, 3+ stakeholders impliqués.

**À éviter pour** : deals self-service ou TPE/PME où c'est overkill.

Pour TPE/PME, préférez [BANT](/glossaire/bant) ou simplement un découverte structurée en 5 questions.`,
    related: ['bant', 'spin-selling', 'sales-cycle', 'pipeline'],
    category: 'Sales process',
  },
  {
    slug: 'spin-selling',
    term: 'SPIN Selling',
    shortDef: 'Méthode de vente consultative basée sur 4 types de questions (Situation, Problème, Implication, Need-payoff).',
    longDef: `**SPIN Selling** est une méthodologie de vente consultative théorisée par Neil Rackham (1988) basée sur 4 types de questions à poser au prospect pendant la discovery call :

1. **S**ituation : comprendre le contexte (peu de questions, juste assez)
2. **P**roblème : identifier les difficultés rencontrées
3. **I**mplication : faire prendre conscience des conséquences du problème
4. **N**eed-payoff : faire visualiser les bénéfices de la solution

**Idéal pour** : ventes B2B complexes, deals > 10 k€, cycle > 30 jours.

**Erreur classique** : trop de questions Situation (perçues comme intrusives) et pas assez d'Implication/Need-payoff (qui font le vrai travail de conviction).`,
    related: ['meddic', 'bant', 'discovery-call'],
    category: 'Sales process',
  },
  {
    slug: 'discovery-call',
    term: 'Discovery call',
    shortDef: 'Premier appel structuré avec un prospect pour qualifier le besoin et le contexte.',
    longDef: `Le **discovery call** est le premier rendez-vous structuré avec un prospect, idéalement après un cold email réussi ou un lead inbound. Son objectif n'est **pas** de vendre, mais de qualifier (BANT, MEDDIC) et de décider si on continue vers une demo.

**Structure type (30 min)** :
1. **Rapport** (2 min) : briser la glace, contexte
2. **Agenda** (1 min) : aligner sur ce qu'on va couvrir
3. **Situation** (5 min) : comprendre leur process actuel
4. **Pain points** (10 min) : identifier les vraies douleurs
5. **Impact** (5 min) : quantifier les conséquences
6. **Next steps** (5 min) : qualifier (BANT) et caler la suite
7. **Q&A** (2 min)

**Règle d'or** : le commercial parle **30 %** du temps, le prospect **70 %**. Si c'est l'inverse, vous avez pitché trop tôt.`,
    related: ['meddic', 'spin-selling', 'bant', 'demo'],
    category: 'Sales process',
  },
  {
    slug: 'demo',
    term: 'Demo (démonstration produit)',
    shortDef: 'Présentation personnalisée du produit à un prospect qualifié, suivant la discovery call.',
    longDef: `La **demo** (démonstration produit) est la présentation personnalisée de votre produit/service à un prospect qualifié, après une discovery call. Elle doit être **personnalisée** sur les pain points découverts, pas une démo générique.

**Structure efficace (30 min)** :
1. **Recap** (3 min) : rappeler ce qui a été discuté en discovery
2. **Pain → Solution** (15 min) : montrer comment votre outil résout les 2-3 problèmes prioritaires identifiés
3. **Differentiators** (5 min) : pourquoi vous vs concurrents
4. **Pricing** (2 min) : transparent, simple
5. **Next steps** (5 min) : trial, POC, devis ?

**Erreurs classiques** : démo générique, pas de fil narratif, trop de fonctionnalités montrées (max 5 features), pas de "demo no-shows" gérés.`,
    related: ['discovery-call', 'closing', 'sales-cycle'],
    category: 'Sales process',
  },
  {
    slug: 'closing',
    term: 'Closing',
    shortDef: 'Étape finale du processus de vente où le prospect signe et devient client.',
    longDef: `Le **closing** est l'étape finale du processus de vente : on transforme une opportunité en client signé. Contrairement à la légende, le closing n'est pas un moment où on "force" la décision — c'est l'aboutissement naturel d'un bon process en amont.

**Techniques de closing pertinentes en B2B 2026** :
- **Assumptive close** : "Quelle date de démarrage préférez-vous, le 1er ou le 15 ?"
- **Summary close** : récapituler tous les bénéfices, demander la signature
- **Urgency close** (à utiliser avec parcimonie) : offre limitée dans le temps
- **Take-away close** : "Peut-être que ce n'est pas le bon moment pour vous"

**Erreur fréquente** : closer trop tôt (avant d'avoir bien qualifié le budget et le décideur).`,
    related: ['discovery-call', 'demo', 'meddic', 'win-rate'],
    category: 'Sales process',
  },
  {
    slug: 'mql',
    term: 'MQL (Marketing Qualified Lead)',
    shortDef: 'Prospect qualifié par le marketing comme suffisamment mûr pour être contacté par la sales.',
    longDef: `Un **MQL** (*Marketing Qualified Lead*) est un prospect que le marketing a identifié comme suffisamment intéressé et qualifié pour être transmis à l'équipe commerciale. Critères typiques : a téléchargé un lead magnet, visité 3+ pages clés, demandé une démo, ou atteint un score de lead scoring défini.

**Vs Lead vs SQL** :
- **Lead** : prospect identifié (a laissé son email)
- **MQL** : lead qualifié par le marketing (mûr pour la sales)
- **SQL** : MQL qualifié par la sales (vraie opportunité commerciale)

**Coût moyen d'un MQL B2B en France** : 80-450 € selon [étude Volia 2026](/etude/prospection-b2b-france-2026), variable selon le secteur et la maturité du marché.`,
    related: ['sql', 'lead-scoring', 'lead-nurturing', 'pipeline'],
    category: 'Sales process',
  },
  {
    slug: 'sql',
    term: 'SQL (Sales Qualified Lead)',
    shortDef: 'MQL qualifié par la sales comme vraie opportunité commerciale active.',
    longDef: `Un **SQL** (*Sales Qualified Lead*) est un MQL qui a été qualifié par un commercial (généralement lors d'une discovery call) comme une vraie opportunité commerciale active. Le SQL entre dans le pipeline et fait l'objet d'un forecast.

**Critères de passage MQL → SQL** : BANT validé (Budget, Authority, Need, Timing) ou méthodologie équivalente.

**Conversion rates typiques B2B SaaS** :
- Lead → MQL : 10-20 %
- MQL → SQL : 20-40 %
- SQL → Closed-Won : 20-30 %

**Coût d'un SQL** : 200-800 € selon Pavilion 2025, soit 3-5x le coût d'un MQL.`,
    related: ['mql', 'pipeline', 'win-rate', 'discovery-call', 'meddic'],
    category: 'Sales process',
  },

  // === Sales roles ===
  {
    slug: 'sdr',
    term: 'SDR (Sales Development Representative)',
    shortDef: 'Commercial dédié à la prospection sortante (cold email, cold call) et à la qualification de leads.',
    longDef: `Un **SDR** (*Sales Development Representative*) est un commercial junior dédié à la prospection sortante et à la qualification des leads entrants. Son rôle : générer des meetings qualifiés pour les Account Executives.

**Tâches quotidiennes** :
- 80-150 cold emails / jour
- 30-50 cold calls / jour
- Qualification BANT des leads inbound
- Booking de meetings avec AE

**Salaire France 2026** (source [étude Volia](/etude/prospection-b2b-france-2026)) : 32-38 k€/an brut + variable (5-10 k€).

**KPI principaux** : nombre de meetings qualifiés/mois (cible : 15-30), reply rate (cible : 8-15 %), pipeline généré.

**SDR vs BDR** : souvent confondus. Le SDR fait du **inbound** (qualifie les leads marketing), le BDR fait du **outbound** (prospecte à froid). En PME française, un même profil fait souvent les deux.`,
    related: ['bdr', 'ae', 'cold-emailing', 'pipeline'],
    category: 'Rôles',
  },
  {
    slug: 'bdr',
    term: 'BDR (Business Development Representative)',
    shortDef: 'Commercial spécialisé dans la prospection outbound pure (cold email, cold call, social selling).',
    longDef: `Un **BDR** (*Business Development Representative*) est un commercial dédié à la prospection sortante (outbound), par opposition au SDR souvent positionné sur l'inbound. En pratique, en France, les deux termes sont largement interchangeables dans les PME.

**Tâches BDR** :
- Construction de listes de prospects ciblés (ICP)
- Cold emails personnalisés (50-100/jour)
- Cold calling
- Social selling (LinkedIn)
- Booking de discovery calls pour les AE

**Salaire France 2026** : 32-40 k€/an brut + variable.

**Outils typiques** : Volia (sourcing + enrichissement), Lemlist/Smartlead (cadenceur), LinkedIn Sales Navigator, CRM (Pipedrive/HubSpot).`,
    related: ['sdr', 'ae', 'cold-emailing', 'icp'],
    category: 'Rôles',
  },
  {
    slug: 'ae',
    term: 'AE (Account Executive)',
    shortDef: 'Commercial senior qui prend en main les opportunités qualifiées et conduit la vente jusqu\'au closing.',
    longDef: `Un **AE** (*Account Executive*) est un commercial senior qui prend en main les opportunités qualifiées par les SDR/BDR. Il gère le cycle de vente complet : discovery, demo, négociation, closing.

**Tâches quotidiennes** :
- Discovery calls (3-5/jour)
- Demos personnalisées (2-3/semaine)
- Négociation contrats
- Multi-threading (mobilisation de plusieurs stakeholders côté prospect)
- Suivi pipeline et forecast

**Salaire France 2026** : 55-80 k€/an brut + variable (30-50 k€ uncapped pour les top performers).

**KPI principaux** : ARR signé, win rate, deal size moyen, sales cycle.`,
    related: ['sdr', 'bdr', 'csm', 'meddic', 'closing'],
    category: 'Rôles',
  },
  {
    slug: 'csm',
    term: 'CSM (Customer Success Manager)',
    shortDef: 'Responsable de la rétention et de l\'expansion des clients existants après la vente.',
    longDef: `Un **CSM** (*Customer Success Manager*) est responsable de la satisfaction, de la rétention et de l'expansion (upsell, cross-sell) des clients existants. C'est lui qui transforme un client one-shot en client fidèle et qui augmente la LTV.

**Tâches** :
- Onboarding des nouveaux clients
- QBR (Quarterly Business Reviews)
- Identification d'opportunités upsell/cross-sell
- Gestion des renouvellements
- Lutte contre le churn

**Salaire France 2026** : 42-65 k€/an brut + variable lié à la rétention.

**KPI principaux** : NRR (Net Revenue Retention), churn rate, NPS, expansion ARR.

**Ratio CSM/clients** : 1 CSM pour ~30-50 clients SMB, ~10-20 clients mid-market, ~3-5 clients enterprise.`,
    related: ['nps', 'churn', 'ltv', 'ae'],
    category: 'Rôles',
  },
  {
    slug: 'sales-ops',
    term: 'Sales Ops (Sales Operations)',
    shortDef: 'Équipe qui optimise les processus, les outils et le reporting de la fonction commerciale.',
    longDef: `Le **Sales Ops** (Sales Operations) est l'équipe (1 personne en PME, plusieurs en scale-up) qui optimise les processus, les outils et le reporting de la fonction commerciale. Rôle hybride entre IT, finance et sales.

**Responsabilités** :
- Admin du CRM (Salesforce/HubSpot)
- Création de dashboards et reporting
- Forecasting et analyse pipeline
- Process design (lead routing, SLA, qualification)
- Sélection et intégration des outils sales

**Salaire France 2026** : 50-90 k€/an selon séniorité.

**KPI principaux** : Sales velocity (taille deal × win rate × nb deals / sales cycle), pipeline coverage, data quality.`,
    related: ['crm', 'pipeline', 'sales-cycle', 'win-rate'],
    category: 'Rôles',
  },

  // === Email tech ===
  {
    slug: 'sender-reputation',
    term: 'Sender Reputation',
    shortDef: 'Score attribué par les fournisseurs email (Gmail, Outlook) à votre domaine d\'envoi, qui détermine si vos mails arrivent en inbox ou en spam.',
    longDef: `La **sender reputation** est un score (0-100) attribué par les fournisseurs email majeurs (Gmail, Outlook, Yahoo) à votre domaine d'envoi. Plus le score est haut, plus vos emails arrivent en inbox plutôt qu'en spam.

**Facteurs qui impactent la reputation** :
- Authentification ([SPF, DKIM, DMARC](/glossaire/spf-dkim-dmarc))
- Taux de plaintes (clics "Spam") : doit être < 0.1 %
- Bounce rate : doit être < 5 %
- Engagement (opens, replies, clics) : positif
- Volume d'envoi (montée progressive via warm-up)

**Outils pour vérifier** : Google Postmaster Tools (gratuit, indispensable), MXToolbox, Talos Intelligence.

**Une mauvaise reputation se répare en 4-8 semaines** avec un protocole strict : pause warm-up, baisse de volume, nettoyage de liste.`,
    related: ['deliverability', 'warm-up', 'spf-dkim-dmarc', 'bounce-rate'],
    category: 'Email tech',
  },
  {
    slug: 'bounce-rate',
    term: 'Bounce rate',
    shortDef: 'Pourcentage d\'emails qui sont rejetés et n\'arrivent jamais au destinataire.',
    longDef: `Le **bounce rate** (taux de rebond) est le pourcentage d'emails envoyés qui sont rejetés par le serveur du destinataire et ne sont jamais livrés.

**Deux types de bounces** :
- **Hard bounce** : adresse définitivement invalide (compte fermé, domaine inexistant). À retirer immédiatement de la liste.
- **Soft bounce** : rejet temporaire (boîte pleine, serveur en maintenance). Réessayer dans 24-48h.

**Cibles à respecter pour préserver la reputation** :
- **Excellent** : < 2 %
- **Acceptable** : 2-5 %
- **Problème** : 5-10 %
- **Critique** : > 10 % (Gmail bloque le domaine)

**Comment baisser le bounce rate** : utiliser un email verifier (NeverBounce, Findymail, Million Verifier) avant l'envoi, et nettoyer la liste régulièrement.`,
    related: ['sender-reputation', 'deliverability', 'warm-up'],
    category: 'Email tech',
  },
  {
    slug: 'spam-trap',
    term: 'Spam trap',
    shortDef: 'Adresse email piège placée par les anti-spam pour détecter les expéditeurs qui scrapent sans permission.',
    longDef: `Un **spam trap** est une adresse email piège, créée et placée par les fournisseurs anti-spam (Spamhaus, Microsoft, Google) pour détecter les expéditeurs qui scrapent du web ou achètent des listes sans qualification.

**Deux types** :
- **Pristine** : email jamais utilisé, créé exprès comme piège (toucher = blacklist instantanée)
- **Recycled** : ancienne adresse abandonnée, recyclée en trap (toucher = baisse de reputation)

**Conséquences** : blacklist Spamhaus ou Microsoft → 90 % des emails finissent en spam pendant 3-12 mois.

**Comment éviter** :
- Ne jamais acheter de listes
- Utiliser un email verifier avant chaque campagne (Findymail, NeverBounce)
- Nettoyer les adresses inactives > 12 mois
- Privilégier le double opt-in pour les leads inbound`,
    related: ['sender-reputation', 'bounce-rate', 'deliverability'],
    category: 'Email tech',
  },

  // === Lead-gen tactics ===
  {
    slug: 'abm',
    term: 'ABM (Account-Based Marketing)',
    shortDef: 'Stratégie B2B où on cible une liste précise de comptes stratégiques au lieu d\'une audience large.',
    longDef: `L'**ABM** (*Account-Based Marketing*) est une stratégie B2B où l'on cible une liste précise de comptes stratégiques (typiquement 50-500) avec des campagnes hyper-personnalisées, au lieu de viser une audience large.

**3 niveaux** :
- **1-to-1 ABM** : 10-50 comptes ultra-stratégiques, campagnes 100 % sur-mesure
- **1-to-Few ABM** : 50-200 comptes par segments, personnalisation par segment
- **1-to-Many ABM** : 200-1000 comptes, personnalisation par industrie/taille

**Stack typique** : Volia (sourcing) + Clay (enrichissement) + Lemlist/La Growth Machine (multicanal) + CRM (HubSpot ABM) + LinkedIn Ads.

**Pertinent quand** : ACV > 20 k€/an, cycle > 60 jours, < 1000 comptes adressables. Inadapté pour TPE ou self-service.`,
    related: ['icp', 'lookalike', 'intent-data', 'retargeting'],
    category: 'Tactiques',
  },
  {
    slug: 'intent-data',
    term: 'Intent data',
    shortDef: 'Signaux comportementaux indiquant qu\'une entreprise est en train d\'évaluer une solution (recherches, downloads, événements).',
    longDef: `L'**intent data** (données d'intention) regroupe les signaux comportementaux qui indiquent qu'une entreprise est en train d'évaluer activement une solution : recherches Google sur des mots-clés concurrents, téléchargements de comparatifs, participation à des webinars, visites de pages pricing, etc.

**Fournisseurs de données d'intent (B2B)** : Bombora, ZoomInfo (TechTarget), 6sense, Demandbase, G2 Buyer Intent.

**Cas d'usage typique** :
1. Identifier les comptes "in-market" cette semaine
2. Prioriser les BDR sur ces comptes (3-5x plus de chance de convertir)
3. Lancer une campagne ABM ciblée

**Bémol** : très américain, mauvaise couverture France. Pour le marché FR, une alternative locale : surveiller les annonces de levée de fonds (Maddyness, FrenchTech) et d'embauche (LinkedIn).`,
    related: ['abm', 'icp', 'lead-scoring'],
    category: 'Tactiques',
  },
  {
    slug: 'lead-scoring',
    term: 'Lead scoring',
    shortDef: 'Système qui attribue un score à chaque lead pour prioriser les commerciaux sur les plus chauds.',
    longDef: `Le **lead scoring** est un système qui attribue un score numérique à chaque lead, basé sur ses caractéristiques (fit) et son comportement (intent). Permet aux commerciaux de prioriser leur temps sur les leads les plus susceptibles de convertir.

**Critères typiques** :
- **Fit (qui c'est)** : poste (+10 pour décideur), taille entreprise, secteur, géographie
- **Intent (ce qu'il fait)** : ouverture email (+5), visite page pricing (+15), demande de demo (+50)

**Seuils** :
- Score < 30 : "lead froid" → nurturing email
- Score 30-70 : "MQL" → suivi automatique, scoring renforcé
- Score > 70 : "SQL" → contact commercial direct sous 24h

**Outils** : HubSpot (natif), Salesforce + Pardot, Customer.io, ActiveCampaign. Pour PME : Google Sheets + formule pondérée suffit largement.`,
    related: ['mql', 'sql', 'intent-data', 'lead-nurturing'],
    category: 'Tactiques',
  },
  {
    slug: 'lead-nurturing',
    term: 'Lead nurturing',
    shortDef: 'Séquence automatisée d\'emails pour faire mûrir un lead pas encore prêt à acheter.',
    longDef: `Le **lead nurturing** consiste à entretenir une relation par email avec des leads qui ne sont pas encore prêts à acheter, jusqu'à ce qu'ils le deviennent. Statistique connue : **70-80 % des leads B2B ne sont pas prêts à acheter immédiatement** mais le seront dans 6-18 mois.

**Format type** : drip campaign de 5-10 emails étalés sur 4-8 semaines.

**Contenus efficaces** :
- Études de cas clients
- Comparatifs vs concurrents
- Articles éducatifs / guides
- Témoignages
- Webinars replays
- Invitations à des événements

**Outils** : HubSpot, ActiveCampaign, Customer.io, Lemlist (campagnes inbound).

**KPI à surveiller** : taux d'ouverture (cible 30-40 %), taux de clic (3-7 %), conversion vers MQL (5-15 %).`,
    related: ['mql', 'lead-scoring', 'drip-campaign', 'inbound-marketing'],
    category: 'Tactiques',
  },
  {
    slug: 'drip-campaign',
    term: 'Drip campaign',
    shortDef: 'Séquence automatisée d\'emails envoyés à intervalles réguliers à un lead inscrit dans un workflow.',
    longDef: `Une **drip campaign** ("goutte-à-goutte") est une séquence automatisée d'emails envoyés à intervalles réguliers à un lead, déclenchée par un événement (téléchargement d'un lead magnet, inscription newsletter, signup trial).

**Vs cold email sequence** :
- **Drip** : inbound, déclenché par une action volontaire du lead (opt-in)
- **Cold email** : outbound, envoyé à des leads qui ne vous connaissent pas

**Structure type d'une drip nurturing (5 emails sur 3 semaines)** :
1. J+0 : Bienvenue + magnet livré
2. J+3 : Contexte / "pourquoi ce sujet est important"
3. J+7 : Cas client ou témoignage
4. J+14 : Comparatif vs alternatives
5. J+21 : Offre / CTA discovery call

**Outils** : ActiveCampaign, HubSpot, MailerLite, ConvertKit.`,
    related: ['lead-nurturing', 'lead-magnet', 'inbound-marketing'],
    category: 'Tactiques',
  },
  {
    slug: 'lookalike',
    term: 'Lookalike audience',
    shortDef: 'Audience publicitaire (Facebook, LinkedIn) construite à partir de vos meilleurs clients existants.',
    longDef: `Une **lookalike audience** (audience similaire) est une audience publicitaire générée par un algorithme (Facebook Ads, LinkedIn Ads) à partir de votre liste de meilleurs clients existants. L'algo cherche des prospects partageant des caractéristiques similaires.

**Cas d'usage B2B** :
- Uploader la liste des 100 meilleurs clients sur LinkedIn Campaign Manager
- Créer un lookalike 1 % (les 1 % d'utilisateurs LinkedIn les plus similaires)
- Lancer des ads sponsored content vers cette audience

**Avantage** : qualifie l'audience par fit comportemental (pas juste démographique).

**Limites** : nécessite minimum 100-300 clients pour fonctionner, peu pertinent si votre ICP est trop niche (< 5000 prospects au total).`,
    related: ['icp', 'abm', 'retargeting'],
    category: 'Tactiques',
  },
  {
    slug: 'retargeting',
    term: 'Retargeting (reciblage)',
    shortDef: 'Publicité qui suit les visiteurs de votre site sur d\'autres sites/réseaux pour les ramener.',
    longDef: `Le **retargeting** (ou reciblage) est une technique publicitaire qui consiste à afficher des annonces aux visiteurs de votre site quand ils naviguent sur d'autres sites ou réseaux sociaux. Permet de "ramener" les visiteurs qui n'ont pas converti.

**Plateformes principales** :
- **Google Ads (Display Network)** : couvre 2M+ sites
- **LinkedIn Ads** : meilleure plateforme B2B pour le retargeting
- **Meta (Facebook + Instagram)** : moins B2B mais très efficace pour SaaS PLG

**Stratégie B2B classique** :
- Ad #1 : aux visiteurs de la home (notoriété)
- Ad #2 : aux visiteurs de pages pricing (conversion)
- Ad #3 : aux signups trial non convertis (réactivation)

**Budget typique** : 500-3000 €/mois pour démarrer.`,
    related: ['lookalike', 'abm', 'intent-data'],
    category: 'Tactiques',
  },

  // === Funnel / inbound ===
  {
    slug: 'funnel',
    term: 'Funnel (tunnel de conversion)',
    shortDef: 'Représentation du parcours d\'un prospect, de la première interaction jusqu\'à l\'achat (et au-delà).',
    longDef: `Le **funnel** (ou tunnel de conversion) est la représentation visuelle du parcours d'un prospect, de la première interaction avec votre marque jusqu'à l'achat et la fidélisation.

**Funnel B2B SaaS classique (TOFU/MOFU/BOFU)** :
- **TOFU** (*Top of Funnel*) : awareness → contenus SEO, articles de blog, social
- **MOFU** (*Middle of Funnel*) : consideration → lead magnets, webinars, comparatifs
- **BOFU** (*Bottom of Funnel*) : decision → demos, trials, études de cas, devis

**Conversion rates moyens B2B SaaS** (étape par étape) :
- Visiteurs → Leads : 1-5 %
- Leads → MQL : 10-20 %
- MQL → SQL : 20-40 %
- SQL → Closed-Won : 20-30 %
- **Funnel global** : 0.02-0.5 % visiteurs → clients

**Optimisation** : commencer par mesurer chaque étape, puis travailler en priorité la moins bonne.`,
    related: ['pipeline', 'mql', 'sql', 'win-rate', 'inbound-marketing'],
    category: 'Inbound',
  },
  {
    slug: 'inbound-marketing',
    term: 'Inbound marketing',
    shortDef: 'Stratégie marketing qui attire des prospects via du contenu de valeur (blog, SEO, lead magnets).',
    longDef: `L'**inbound marketing** est une stratégie qui consiste à attirer des prospects en créant du contenu de valeur (articles de blog, SEO, lead magnets, webinars) plutôt qu'à aller les chercher activement (outbound). Théorisé par HubSpot en 2006.

**4 étapes** :
1. **Attract** : contenu SEO, social media, ads
2. **Convert** : lead magnets, landing pages avec formulaire
3. **Close** : nurturing, scoring, hand-off à la sales
4. **Delight** : onboarding, customer success, NPS

**Avantages** : prospects qualifiés (ils viennent à vous), coût décroissant dans le temps, brand authority.

**Inconvénients** : long démarrage (6-12 mois pour voir des résultats SEO), nécessite production de contenu régulière, ROI difficile à attribuer.

**Stack typique** : HubSpot ou WordPress + Yoast SEO + Ahrefs/Semrush + Mailchimp/ActiveCampaign.`,
    related: ['content-marketing', 'seo', 'funnel', 'lead-nurturing', 'lead-magnet'],
    category: 'Inbound',
  },
  {
    slug: 'content-marketing',
    term: 'Content marketing',
    shortDef: 'Production régulière de contenus utiles (blog, vidéos, podcasts) pour attirer et fidéliser une audience.',
    longDef: `Le **content marketing** est la production régulière de contenus utiles et pertinents (articles, vidéos, podcasts, infographies, ebooks) destinés à attirer, engager et fidéliser une audience cible.

**Pilier de l'inbound marketing**, c'est aussi un excellent levier SEO long terme.

**Formats efficaces B2B 2026** :
- **Articles de blog SEO** (1500-3000 mots, sujets ciblés sur les questions de votre ICP)
- **Études et benchmarks originaux** (génèrent des backlinks éditoriaux durables, ex : [étude Volia 2026](/etude/prospection-b2b-france-2026))
- **Comparatifs** (très bon CTR : "X vs Y vs Z")
- **Guides experts** (lead magnet + autorité topique)
- **Newsletter** (rétention)

**Fréquence recommandée** : 1-2 articles/semaine minimum pour voir un impact SEO en 6-12 mois.`,
    related: ['inbound-marketing', 'seo', 'lead-magnet', 'sem'],
    category: 'Inbound',
  },
  {
    slug: 'seo',
    term: 'SEO (Search Engine Optimization)',
    shortDef: 'Ensemble de techniques pour faire remonter un site dans les résultats organiques de Google et autres moteurs.',
    longDef: `Le **SEO** (*Search Engine Optimization*) regroupe les techniques pour faire remonter un site dans les résultats **organiques** (non payés) de Google, Bing et autres moteurs. C'est le levier d'acquisition long terme le moins cher du marché — mais aussi le plus lent (6-18 mois pour voir des résultats sérieux).

**3 piliers** :
1. **SEO technique** : vitesse, mobile-friendly, sitemap.xml, robots.txt, schema.org
2. **SEO on-page** : titles, meta descriptions, headings, contenu de qualité, maillage interne
3. **SEO off-page** : backlinks (domaines référents), notoriété de marque, signaux sociaux

**Et maintenant : GEO (Generative Engine Optimization)** : comment apparaître dans les réponses de ChatGPT, Claude, Perplexity, Gemini. Levier émergent 2025-2026 (fichier llms.txt, schema Dataset, sources sourcées).`,
    related: ['sem', 'content-marketing', 'inbound-marketing'],
    category: 'Inbound',
  },
  {
    slug: 'sem',
    term: 'SEM (Search Engine Marketing)',
    shortDef: 'Publicité payante sur les moteurs de recherche (Google Ads, Bing Ads).',
    longDef: `Le **SEM** (*Search Engine Marketing*) désigne la publicité payante sur les moteurs de recherche, principalement **Google Ads** (anciennement AdWords). Vous payez pour apparaître au-dessus des résultats organiques sur certains mots-clés.

**Modèle** : enchères CPC (Cost Per Click). Vous fixez un budget max et un CPC max, Google enchérit pour vous.

**CPC moyens B2B France 2026** :
- Mots-clés génériques ("CRM", "outil sales") : 3-15 €
- Mots-clés concurrentiels ("alternative Salesforce") : 5-25 €
- Mots-clés long tail ("logiciel prospection PME B2B") : 1-5 €

**Avantages SEM vs SEO** : résultats immédiats (vs 6-12 mois), ciblage précis (mots-clés + audience + géo).

**Inconvénients** : coût élevé qui augmente avec la concurrence, dépendance à Google (si on arrête de payer, on disparaît).`,
    related: ['seo', 'retargeting', 'funnel'],
    category: 'Inbound',
  },
  {
    slug: 'landing-page',
    term: 'Landing page (page d\'atterrissage)',
    shortDef: 'Page unique optimisée pour une conversion précise (signup, démo, téléchargement).',
    longDef: `Une **landing page** (page d'atterrissage) est une page web dédiée à un objectif unique de conversion : signup d'un trial, demande de démo, téléchargement d'un lead magnet, inscription à un webinar. Elle n'a pas de menu de navigation (pour ne pas distraire).

**Structure type efficace** :
1. **Hero** : promesse claire + CTA principal
2. **Social proof** : logos clients, témoignages, chiffres
3. **Bénéfices** : 3-5 points clés
4. **Démonstration** : screenshot, vidéo, GIF
5. **FAQ** : objections traitées
6. **CTA répété** en bas de page

**Taux de conversion moyen B2B SaaS** :
- Excellent : > 10 %
- Bon : 5-10 %
- Moyen : 2-5 %
- À améliorer : < 2 %

**Outils** : Webflow, Framer, Unbounce, Instapage, ou directement React/Next.js pour les SaaS techniques.`,
    related: ['funnel', 'lead-magnet', 'inbound-marketing'],
    category: 'Inbound',
  },

  // === Légal complément ===
  {
    slug: 'gdpr',
    term: 'GDPR (General Data Protection Regulation)',
    shortDef: 'Version anglaise du RGPD : règlement européen sur la protection des données personnelles.',
    longDef: `**GDPR** est simplement la traduction anglaise de RGPD (*General Data Protection Regulation*). Même règlement, même périmètre : l'Union Européenne + Royaume-Uni post-Brexit (UK-GDPR quasi identique).

Voir notre fiche détaillée [RGPD](/glossaire/rgpd) pour le cadre complet et les obligations en prospection B2B.

**Différences pratiques avec le terme "RGPD"** :
- Quand on lit la doc d'un outil US (Apollo, Hunter, ZoomInfo), on parle de **GDPR compliance**
- Quand on lit la doc d'un outil français/européen (Volia, Dropcontact), on parle de **conformité RGPD**

C'est exactement la même chose.`,
    related: ['rgpd', 'cnil', 'opt-out', 'consent'],
    category: 'Légal',
  },
  {
    slug: 'consent',
    term: 'Consentement (RGPD)',
    shortDef: 'Accord explicite et éclairé d\'une personne pour le traitement de ses données personnelles.',
    longDef: `Le **consentement** est l'un des 6 fondements juridiques du RGPD pour traiter des données personnelles (article 6). Il doit être **libre, spécifique, éclairé et univoque** (article 4).

**4 critères cumulatifs** :
- **Libre** : pas de pression, pas de conditionnement à un service
- **Spécifique** : pour une finalité précise (pas un "j'accepte tout")
- **Éclairé** : la personne sait ce qu'elle accepte
- **Univoque** : action positive (case cochée, clic sur "Accepter")

**En B2B (cold email)** : on n'utilise PAS le consentement, mais l'**intérêt légitime** (art. 6.1.f). Le consentement est obligatoire uniquement en B2C, ou pour les cookies non essentiels (loi e-Privacy).

Voir [RGPD](/glossaire/rgpd) pour le cadre complet.`,
    related: ['rgpd', 'gdpr', 'opt-out', 'double-optin', 'cnil'],
    category: 'Légal',
  },
  {
    slug: 'double-optin',
    term: 'Double opt-in',
    shortDef: 'Processus en 2 étapes : inscription puis confirmation par lien email avant validation finale.',
    longDef: `Le **double opt-in** est un processus d'inscription email en 2 étapes :
1. L'utilisateur s'inscrit (formulaire)
2. Il reçoit un email avec un lien de confirmation à cliquer pour valider

Cela garantit que l'email appartient bien à l'inscrit (vs simple opt-in où on prend l'inscription telle quelle).

**Obligatoire ?** Pas légalement en France, mais **fortement recommandé** pour :
- La qualité de la liste (pas d'emails bidon)
- La preuve de consentement en cas de contrôle CNIL
- La délivrabilité (moins de bounces et de plaintes)

**Adopté par défaut** sur la plupart des outils B2C (Mailchimp, MailerLite) et de plus en plus en B2B (HubSpot, ActiveCampaign).`,
    related: ['consent', 'rgpd', 'opt-out', 'deliverability'],
    category: 'Légal',
  },
  {
    slug: 'can-spam',
    term: 'CAN-SPAM Act',
    shortDef: 'Loi américaine encadrant l\'envoi d\'emails commerciaux aux USA (équivalent du RGPD côté US).',
    longDef: `Le **CAN-SPAM Act** (2003) est la loi fédérale américaine qui encadre l'envoi d'emails commerciaux aux États-Unis. Beaucoup plus permissive que le RGPD européen, elle autorise le cold email B2B et B2C sans consentement préalable, mais impose 4 obligations strictes :

1. **En-tête honnête** : "From" et "Reply-To" doivent identifier clairement l'expéditeur
2. **Objet non trompeur** : pas de bait-and-switch ("Re:" sans avoir reçu de mail)
3. **Adresse physique** : adresse postale valide dans le pied de page
4. **Opt-out fonctionnel** : lien de désinscription qui marche, traité sous 10 jours ouvrés

**Sanctions** : jusqu'à 51 744 $ par email non conforme.

**Pertinent pour vous ?** Si vous envoyez des cold emails à des prospects US. Sinon, focus sur le RGPD.`,
    related: ['rgpd', 'gdpr', 'opt-out'],
    category: 'Légal',
  },

  // === Outils et concepts ===
  {
    slug: 'b2c',
    term: 'B2C (Business-to-Consumer)',
    shortDef: 'Commerce entre une entreprise et des consommateurs particuliers (vs B2B).',
    longDef: `Le **B2C** (*Business-to-Consumer*) désigne le commerce entre une entreprise et des consommateurs individuels (particuliers), par opposition au [B2B](/glossaire/b2b) (entre entreprises).

**Différences clés vs B2B** :
| | B2C | B2B |
|---|---|---|
| Décideur | 1 personne (souvent émotionnel) | 3-7 personnes (rationnel) |
| Cycle de vente | Quelques minutes à 1 mois | 1 à 12 mois |
| Volume | Beaucoup de clients, petits paniers | Peu de clients, gros tickets |
| Cold email | Interdit sans opt-in (RGPD) | Autorisé sous intérêt légitime |
| Ad spend | Très scalable | Plus difficile (audience plus restreinte) |

**Exemples de SaaS B2C** : Notion (freemium grand public), Spotify, Netflix, Strava.`,
    related: ['b2b', 'saas', 'rgpd'],
    category: 'Concepts',
  },
  {
    slug: 'saas',
    term: 'SaaS (Software as a Service)',
    shortDef: 'Logiciel accessible via internet sur abonnement, hébergé chez le fournisseur (vs licence one-shot).',
    longDef: `Le **SaaS** (*Software as a Service*) est un modèle de distribution de logiciel où l'éditeur héberge l'application dans le cloud et la met à disposition par abonnement (mensuel ou annuel), accessible via un navigateur web.

**Vs modèles classiques** :
- **License perpetual** : achat one-shot, à installer (Microsoft Office 2010)
- **On-premise** : hébergé chez le client, maintenance par le client
- **SaaS** : hébergé chez l'éditeur, mise à jour automatique, abonnement (Salesforce, HubSpot, Volia)

**Avantages clients** : pas d'install, mise à jour auto, accessible partout, prix prévisible (mensuel).

**Avantages éditeurs** : revenus récurrents (MRR/ARR), contrôle total du produit, scalabilité massive.

**Marché SaaS mondial 2026** : ~330 Mds$ (vs 250 Mds$ en 2024).`,
    related: ['b2b', 'b2c', 'mrr', 'arr', 'plg'],
    category: 'Concepts',
  },
  {
    slug: 'plg',
    term: 'PLG (Product-Led Growth)',
    shortDef: 'Stratégie de croissance où le produit lui-même attire, convertit et fidélise les utilisateurs.',
    longDef: `Le **PLG** (*Product-Led Growth*) est une stratégie de croissance B2B où le **produit lui-même** est le principal moteur d'acquisition, de conversion et de rétention — par opposition au modèle traditionnel **sales-led** où une équipe commerciale convertit.

**Caractéristiques d'un SaaS PLG** :
- **Freemium ou trial gratuit** sans carte bancaire
- **Onboarding self-service** ultra-soigné
- **Time-to-value** rapide (< 10 min)
- **Pricing transparent** en ligne
- **Upgrade contextuel** dans le produit (au moment où le user atteint une limite)

**Exemples** : Notion, Figma, Slack, Calendly, Loom, Volia (plan Gratuit).

**Avantages** : CAC très bas, scalable sans embauche, viralité naturelle.
**Inconvénients** : ACV plus bas, conversion plus lente, moins adapté aux deals enterprise.`,
    related: ['saas', 'b2b', 'cac', 'ltv'],
    category: 'Concepts',
  },
  {
    slug: 'scraping',
    term: 'Web scraping',
    shortDef: 'Extraction automatisée de données publiques depuis des sites web.',
    longDef: `Le **web scraping** est l'extraction automatisée de données publiques depuis des sites web, via des scripts ou outils dédiés. Très utilisé en prospection B2B pour récupérer des emails, numéros de téléphone, noms d'entreprises, descriptions de produits, etc.

**Techniques courantes** :
- **HTML scraping** : parsing du HTML brut (Cheerio, BeautifulSoup)
- **Headless browser** : simulation d'un navigateur (Puppeteer, Playwright)
- **API publiques** : quand disponibles (préférable au scraping)
- **Scraping de SERP** : extraction de résultats Google (Serper, ScraperAPI)

**Cadre légal en France** : autorisé pour les données publiquement accessibles, sous condition de respecter robots.txt, de ne pas surcharger les serveurs, et de respecter le RGPD pour les données personnelles (cf. [arrêt Cour de Cassation 2017](https://www.legifrance.gouv.fr/juri/id/JURITEXT000035419717)).

Volia utilise un scraping intelligent éthique : respect de robots.txt, throttling, exclusion des données personnelles non professionnelles.`,
    related: ['enrichment', 'rgpd', 'crm'],
    category: 'Concepts',
  },
  {
    slug: 'enrichment',
    term: 'Enrichissement (data enrichment)',
    shortDef: 'Ajout d\'informations complémentaires à un lead existant (email, téléphone, poste, taille entreprise).',
    longDef: `L'**enrichissement de données** (*data enrichment*) consiste à ajouter des informations à un lead existant : à partir d'un nom + entreprise, on retrouve l'email, le téléphone, le poste LinkedIn, la taille de l'entreprise, son secteur, etc.

**Méthodes** :
- **Pattern matching** : devine l'email à partir du nom + domaine (prenom.nom@…) — Hunter
- **Scraping waterfall** : combine plusieurs sources (site web → Google → LinkedIn → patterns) — Volia, Dropcontact
- **Base de données B2B** : interroge une base massive précompilée — Apollo, ZoomInfo
- **LinkedIn scraping** : extrait depuis les profils LinkedIn — Kaspr, Lusha

**Critères de choix** :
- Marché français : Volia (19 €/mo), Dropcontact (31 €/mo)
- Marché mondial : Apollo (49-99 €/mo), Hunter (49 €/mo)
- LinkedIn-first : Kaspr, Lusha

Voir [comparatif détaillé](/comparatif-outils-prospection-b2b-france) des 11 outils.`,
    related: ['scraping', 'cold-emailing', 'crm', 'icp'],
    category: 'Concepts',
  },
  {
    slug: 'data-cleansing',
    term: 'Data cleansing (nettoyage de données)',
    shortDef: 'Suppression des doublons, fautes et données invalides d\'une base de prospects pour améliorer la qualité.',
    longDef: `Le **data cleansing** (nettoyage de données) est le processus de suppression des doublons, fautes typographiques, formats incorrects et données obsolètes d'une base de prospects ou clients. Indispensable avant tout envoi cold email pour préserver la sender reputation.

**Opérations classiques** :
- **Déduplication** : un seul enregistrement par prospect
- **Vérification email** : retrait des bounces (via NeverBounce, Million Verifier, Findymail)
- **Normalisation** : noms en MAJUSCULES, téléphones au format E.164
- **Détection des emails personnels** : @gmail, @hotmail à filtrer en B2B
- **Suppression des opt-outs** : croiser avec la liste opt-out RGPD

**Outils** : OpenRefine (gratuit), Talend Data Quality, Dropcontact, ou des scripts Python custom.

**Fréquence** : après chaque import massif, et 1× par mois en routine.`,
    related: ['scraping', 'enrichment', 'bounce-rate', 'deliverability'],
    category: 'Concepts',
  },
  {
    slug: 'sequence',
    term: 'Sequence (séquence d\'outreach)',
    shortDef: 'Suite automatisée d\'emails et de touches multicanales envoyés à un prospect sur plusieurs jours.',
    longDef: `Une **sequence** (séquence d'outreach) est une suite automatisée de touches commerciales envoyées à un prospect sur plusieurs jours : emails initiaux + relances + parfois LinkedIn + cold call. L'outil cadenceur (Lemlist, Smartlead, Lemcal, La Growth Machine) gère l'envoi automatique aux bons moments.

**Structure type B2B (7-10 touches sur 21 jours)** :
1. J+0 : Email initial (pain point + question)
2. J+3 : Email relance (case study ou statistique)
3. J+7 : Connexion LinkedIn
4. J+10 : Message LinkedIn court
5. J+14 : Email "loop in" (involve un autre stakeholder)
6. J+18 : Cold call
7. J+21 : Email break-up

**Règle d'or** : arrêter immédiatement la séquence dès qu'il y a une réponse (positive ou négative). Continuer = perte de confiance.`,
    related: ['cold-emailing', 'cadence', 'bdr', 'sdr'],
    category: 'Outbound',
  },
  {
    slug: 'cadence',
    term: 'Cadence (rythme de prospection)',
    shortDef: 'Le rythme et l\'ordre des touches commerciales dans une séquence outbound multicanale.',
    longDef: `La **cadence** est le rythme et l'ordre des touches commerciales (email, LinkedIn, téléphone, voicemail) dans une séquence outbound multicanale. Le terme est parfois utilisé comme synonyme de "sequence" mais désigne plus précisément le pattern temporel + canal.

**Cadences efficaces 2026** :
- **Cadence email-only (10 touches)** : pour les profils non disponibles sur LinkedIn (artisans, restaurateurs)
- **Cadence multi-touch (7 touches sur 3 semaines)** : email + LinkedIn + call, le plus efficace en B2B mid-market
- **Cadence high-touch (15+ touches sur 6 semaines)** : enterprise, deals > 50 k€

**Outils** : Lemlist, Smartlead, Outreach.io, SalesLoft, La Growth Machine.

**KPI à surveiller** : reply rate par touche (la première touche doit faire 50-70 % du reply rate total).`,
    related: ['sequence', 'cold-emailing', 'sales-engagement'],
    category: 'Outbound',
  },
  {
    slug: 'sales-engagement',
    term: 'Sales engagement platform',
    shortDef: 'Outil qui automatise et orchestre les séquences multicanales (email + LinkedIn + cold call).',
    longDef: `Une **sales engagement platform** (SEP) est un outil qui automatise et orchestre les séquences d'outreach multicanales : emails, LinkedIn, cold calls, voicemails. Différent d'un simple cadenceur email car gère plusieurs canaux nativement.

**Catégorie créée par Outreach et SalesLoft** (USA, 2014-2016). Aujourd'hui :
- **Enterprise** : Outreach.io, SalesLoft, Apollo (sequences module)
- **Mid-market** : Lemlist, Smartlead, La Growth Machine
- **Niche** : HeyReach (LinkedIn-first), Reply.io (multi-channel)

**Stack typique 2026** :
- Sourcing : Volia, Apollo
- Enrichissement : Dropcontact, Findymail
- Sales engagement : Lemlist, Smartlead, La Growth Machine
- CRM : Pipedrive, HubSpot, Salesforce

**Budget moyen** : 30-150 €/user/mois pour le sales engagement seul.`,
    related: ['sequence', 'cadence', 'cold-emailing'],
    category: 'Outbound',
  },
  {
    slug: 'omnichannel',
    term: 'Omnichannel (multicanal)',
    shortDef: 'Approche de prospection qui combine plusieurs canaux (email, LinkedIn, téléphone, SMS, WhatsApp).',
    longDef: `L'approche **omnichannel** (ou multicanal) consiste à combiner plusieurs canaux de prospection pour toucher un prospect là où il est le plus réceptif : email, LinkedIn, téléphone, SMS, WhatsApp, voire courrier physique.

**Statistique clé** : une séquence multicanale (email + LinkedIn) génère **+60 % de réponses** vs email seul ([source](/blog/multicanal-cold-email-linkedin-2026)).

**Combinaisons efficaces par persona** :
- **Cadres dirigeants** : LinkedIn + email + appel direct
- **Artisans / commerces** : SMS + appel téléphone (LinkedIn peu présent)
- **Tech / SaaS** : email + LinkedIn + parfois Twitter/X DM
- **Avocats / professions libérales** : email + appel cabinet

**Outils** : La Growth Machine (focus omnichannel), Lemlist (email + LinkedIn), HeyReach (LinkedIn-first multi-account).`,
    related: ['sequence', 'cadence', 'sales-engagement', 'cold-emailing'],
    category: 'Outbound',
  },
  {
    slug: 'sales-velocity',
    term: 'Sales velocity (vélocité commerciale)',
    shortDef: 'Vitesse à laquelle les opportunités progressent dans le pipeline et génèrent du revenu.',
    longDef: `La **sales velocity** est une métrique composite qui mesure la vitesse à laquelle votre pipeline génère du revenu. Elle combine 4 variables :

**Formule** : Sales Velocity = (Nb d'opportunités × Deal size moyen × Win rate) / Sales cycle (en jours)

Exemple : 50 opps × 5 000 € × 25 % / 60 jours = **1 042 € de revenu / jour**

**4 leviers pour accélérer la velocity** (par ordre de difficulté) :
1. ⬆ **Nb d'opps** : plus facile via plus de prospection (Volia)
2. ⬆ **Deal size** : upsell, cross-sell, packages
3. ⬆ **Win rate** : meilleure qualification (MEDDIC), demos personnalisées
4. ⬇ **Sales cycle** : raccourcir via pricing transparent, multi-threading, trial

**À surveiller mensuellement** dans tout SaaS B2B.`,
    related: ['pipeline', 'win-rate', 'sales-cycle', 'sales-ops'],
    category: 'Métriques',
  },
];

export function getGlossaryTerm(slug) {
  return GLOSSARY.find((t) => t.slug === slug) || null;
}

export function getAllGlossaryTerms() {
  return GLOSSARY;
}

export function getGlossaryByCategory() {
  const grouped = {};
  for (const term of GLOSSARY) {
    if (!grouped[term.category]) grouped[term.category] = [];
    grouped[term.category].push(term);
  }
  return grouped;
}
