// Catalogue des lead magnets téléchargeables (/ressources/[slug]).
//
// Chaque ressource est :
// - SEO-friendly (page dédiée avec metadata + JSON-LD)
// - Téléchargeable contre email (capture lead via /api/ressources/download)
// - Liée à un article de blog ou un guide (maillage interne)

export const RESOURCES = [
  {
    slug: 'templates-cold-email-b2b-fr',
    title: '20 templates de cold email B2B français qui convertissent',
    shortDesc: '20 templates testés en France en 2026 (objet + corps), classés par persona et secteur. Reply rate moyen : 12-18 %.',
    longDesc: `Ce pack contient **20 templates de cold email B2B** testés et validés en France en 2026. Pour chaque template, vous trouverez :

- L'**objet exact** à utiliser (testé pour maximiser l'open rate)
- Le **corps du mail** complet (80-150 mots, prêt à personnaliser)
- Le **CTA** recommandé (soft vs hard selon le persona)
- Le **reply rate moyen** observé sur 1000+ envois

Couverture :
- **8 personas** : CEO/Fondateur, CMO, DAF, CTO/DSI, Head of Sales, RH, Office Manager, Directeur de production
- **6 secteurs** : SaaS, e-commerce, hôtellerie/HCR, BTP, professions libérales, industrie
- **3 cas d'usage** : prospection à froid, relance, prise de RDV

À utiliser dans votre cadenceur (Lemlist, Smartlead, Instantly, Apollo) ou directement dans votre boîte mail.`,
    format: 'PDF',
    pages: 28,
    icon: 'Mail',
    category: 'Templates',
    keywords: ['templates cold email b2b', 'modèles cold email français', 'cold email exemples'],
    relatedArticle: '/blog/cold-email-templates-b2b-2026',
    fileSize: '1.2 MB',
    deliveryMode: 'email', // email | direct | redirect
  },
  {
    slug: 'script-cold-call-b2b-fr',
    title: 'Script cold call B2B : 5 scénarios qui prennent des RDV',
    shortDesc: '5 scripts d\'appel à froid B2B en français (ouverture, qualification, gestion d\'objections, prise de RDV). Conversion : 4-8 % par appel.',
    longDesc: `Le téléphone reste **le canal le plus efficace** pour les artisans, commerces locaux et profils 50+ ans. Mais 90 % des cold calls échouent dès la 1re phrase.

Ce pack contient **5 scripts complets** avec :

- L'**ouverture en 15 secondes** qui passe l'assistant
- La **question qualifiante** qui ouvre la conversation
- Les **5 objections les plus courantes** et comment les retourner
- La **transition vers le RDV** (assumptive close, alternative close)
- Le **suivi post-appel** (email récap, calendrier partagé)

Scénarios couverts :
1. Cold call à un dirigeant TPE/PME
2. Cold call à un cadre mid-market
3. Cold call après un cold email (callback)
4. Cold call après une demande inbound
5. Cold call de relance "résurrection" (deal perdu il y a 3-6 mois)

Inclus : **trame d'enregistrement** pour analyser vos appels après coup.`,
    format: 'PDF',
    pages: 18,
    icon: 'Phone',
    category: 'Templates',
    keywords: ['script cold call', 'téléprospection b2b', 'modèle appel commercial'],
    relatedArticle: '/blog/cold-call-vs-cold-email-b2b-2026',
    fileSize: '0.9 MB',
    deliveryMode: 'email',
  },
  {
    slug: 'calculateur-cac-ltv-saas',
    title: 'Calculateur CAC / LTV pour SaaS B2B',
    shortDesc: 'Calculez votre CAC, LTV, ratio CAC/LTV et CAC payback en direct. Avec benchmarks France 2026 par segment.',
    longDesc: `Le **ratio CAC/LTV** est la métrique reine du SaaS B2B. En dessous de 1/3, votre business saigne. Au-dessus de 1/3, vous êtes sain.

Ce calculateur interactif vous permet d'obtenir en 2 minutes :

- Votre **CAC réel** (en intégrant les coûts cachés souvent oubliés : outils, formation, salaires sales+marketing)
- Votre **LTV** (basée sur ARPU + durée moyenne d'abonnement + expansion revenue)
- Votre **ratio CAC/LTV** et son interprétation
- Votre **CAC payback** (combien de mois pour rentabiliser un client)
- Le **benchmark** vs SaaS B2B français de votre segment (TPE / PME / Mid-market / Enterprise)

Données utilisées pour les benchmarks : [étude Prospectia 2026](/etude/prospection-b2b-france-2026).

Outil 100 % en ligne, données calculées côté client (rien n'est stocké).`,
    format: 'Web app',
    pages: null,
    icon: 'Calculator',
    category: 'Calculateurs',
    keywords: ['calculateur cac', 'calculateur ltv', 'cac ltv ratio', 'saas metrics calculator'],
    relatedArticle: '/glossaire/cac',
    fileSize: null,
    deliveryMode: 'direct', // pas de capture lead — accès direct
  },
  {
    slug: 'calculateur-roi-prospection-b2b',
    title: 'Calculateur de ROI prospection B2B',
    shortDesc: 'Estimez le ROI réel de votre stack outils + équipe sales : combien de leads, combien de clients, quelle marge.',
    longDesc: `Combien rapporte vraiment votre poste outbound ? Ce calculateur prend en compte :

- **Coûts** : salaires SDR/AE, outils (sourcing + cadenceur + CRM + dialer), formation, coachs
- **Volume** : nb emails/jour, nb meetings/mois, win rate moyen
- **Revenus** : deal size moyen, durée de vie client, expansion

En sortie :
- ROI mensuel et annuel
- Coût d'acquisition par client (CAC)
- Pipeline généré
- Seuil de rentabilité (mois pour amortir l'embauche d'un SDR)
- Comparaison vs benchmark France 2026

Pratique pour **justifier un budget** auprès de votre direction, ou **comparer 2 stratégies** (interne vs externalisé, 1 SDR vs 3 SDR, etc.).`,
    format: 'Web app',
    pages: null,
    icon: 'TrendingUp',
    category: 'Calculateurs',
    keywords: ['calculateur roi prospection', 'roi sales b2b', 'calculer roi sdr'],
    relatedArticle: '/blog/budget-stack-outils-prospection-b2b-2026',
    fileSize: null,
    deliveryMode: 'direct',
  },
  {
    slug: 'checklist-rgpd-cold-email',
    title: 'Checklist RGPD cold email B2B en France',
    shortDesc: '47 points à valider pour faire du cold email B2B en France sans risque CNIL en 2026. Audit complet de votre conformité.',
    longDesc: `Le cold email B2B en France est **légal en 2026** sous régime de l'intérêt légitime (RGPD art. 6.1.f). Mais la CNIL a sanctionné **87 entreprises en 2024**, dont ~12 sur des cas de démarchage B2B.

Cette checklist détaille **47 points à valider** pour être 100 % conforme :

- **9 points** sur la base légale (intérêt légitime, finalité, conservation < 3 ans)
- **8 points** sur la collecte des emails (filtre @gmail/@hotmail, opt-out lists)
- **7 points** sur le contenu des emails (lien désinscription, identification expéditeur)
- **6 points** sur le traitement des opt-outs (sous 48h, registre)
- **6 points** sur le DPO et la documentation
- **5 points** sur les sous-traitants (DPA, transfert hors UE)
- **6 points** sur les preuves en cas de contrôle CNIL

Au-delà du PDF, **template de registre des traitements** prêt à remplir (au format Notion).

Indispensable si vous faites > 500 cold emails/mois.`,
    format: 'PDF + Notion',
    pages: 14,
    icon: 'ShieldCheck',
    category: 'Checklists',
    keywords: ['checklist rgpd cold email', 'conformité rgpd b2b', 'cnil démarchage email'],
    relatedArticle: '/blog/rgpd-prospection-b2b-legal-2026',
    fileSize: '0.7 MB',
    deliveryMode: 'email',
  },
  {
    slug: 'checklist-warmup-domaine-cold-email',
    title: 'Checklist warmup de domaine cold email (28 jours)',
    shortDesc: 'Protocole complet pour warmer un nouveau domaine d\'envoi cold email en 28 jours : DNS, volumes, métriques, outils.',
    longDesc: `Sans warmup, votre meilleur cold email finit en spam. Cette checklist vous guide étape par étape pour warmer un nouveau domaine en **28 jours** :

- **Pré-warmup (J-7 à J0)** : configuration DNS complète (SPF, DKIM, DMARC, MX, BIMI)
- **Phase 1 (J+1 à J+7)** : soft launch, 10-30 emails/jour, warmup auto
- **Phase 2 (J+8 à J+21)** : montée progressive, 30-100 emails/jour
- **Phase 3 (J+22 à J+28)** : cruise, atteinte du volume cible

Pour chaque phase :
- Volume précis recommandé
- Outils à utiliser (Lemwarm, Smartlead, Mailwarm)
- Métriques à surveiller (bounce, spam, open) avec seuils d'alerte
- Actions correctives si dépassement de seuil

Inclus : **template de monitoring** Google Postmaster Tools (étape par étape).

Indispensable avant tout cold email volume > 50/jour.`,
    format: 'PDF',
    pages: 12,
    icon: 'Flame',
    category: 'Checklists',
    keywords: ['warmup cold email', 'warmup domaine', 'délivrabilité cold email'],
    relatedArticle: '/blog/warmup-domain-cold-email-2026',
    fileSize: '0.6 MB',
    deliveryMode: 'email',
  },
  {
    slug: 'template-sales-playbook-tpe-pme',
    title: 'Template sales playbook TPE/PME (Notion + PDF)',
    shortDesc: 'Template complet de sales playbook pour TPE/PME B2B : ICP, personas, scripts, objections, KPIs. Format Notion + PDF.',
    longDesc: `Le sales playbook = bible commerciale écrite de votre boîte. Indispensable dès le premier SDR embauché.

Ce template contient **7 sections pré-remplies avec exemples** :

1. **ICP** (Ideal Customer Profile) — critères firmographiques + technographiques + comportementaux
2. **Personas** — fiches détaillées (titre, douleurs, objections, métriques, canaux)
3. **Méthodes d'outbound** — cadences, templates, volumes cibles
4. **Qualification BANT/MEDDIC** — grille de scoring + process hand-off SDR → AE
5. **Demo** — structure minute par minute + storyboard
6. **Closing** — techniques + table des 15 objections fréquentes + réponses
7. **Post-vente** — hand-off CSM + onboarding + alertes churn

Formats inclus :
- **Notion** (lien Duplicate to my workspace)
- **PDF** (28 pages, prêt à imprimer pour onboarding)
- **Google Doc** (lien copiable)

Bonus : **grille de scoring BANT** prête à utiliser dans votre CRM.`,
    format: 'Notion + PDF',
    pages: 28,
    icon: 'BookOpen',
    category: 'Templates',
    keywords: ['sales playbook template', 'template sales b2b', 'playbook commercial pme'],
    relatedArticle: '/blog/sales-playbook-template-tpe-pme-2026',
    fileSize: '2.4 MB',
    deliveryMode: 'email',
  },
  {
    slug: 'template-icp-b2b',
    title: 'Template ICP B2B : définissez votre client idéal en 30 minutes',
    shortDesc: 'Template guidé pour construire votre Ideal Customer Profile en 30 min. Avec exemples concrets et grille de scoring.',
    longDesc: `L'ICP (Ideal Customer Profile) est la fondation de toute stratégie de prospection B2B. **Sans ICP clair, vous arrosez large et convertissez peu.**

Ce template vous guide en **30 minutes** pour construire votre ICP :

- **Étape 1 (10 min)** : analyser vos 10 meilleurs clients actuels (revenus, profil, comportements)
- **Étape 2 (10 min)** : identifier les points communs (firmographique + technographique + comportemental)
- **Étape 3 (5 min)** : écrire votre **anti-ICP** (qui exclure absolument)
- **Étape 4 (5 min)** : valider l'ICP avec 5 questions pratiques

Inclus :
- **Template PDF** (12 pages, prêt à imprimer)
- **Template Notion** (avec base de données pour stocker vos ICP par segment)
- **Grille de scoring** (0-100) pour qualifier rapidement un prospect par rapport à votre ICP
- **3 exemples** d'ICP réels de SaaS français (anonymisés)

Bonus : **prompt ChatGPT** pour générer un draft d'ICP à partir de vos 10 meilleurs clients.`,
    format: 'PDF + Notion',
    pages: 12,
    icon: 'Target',
    category: 'Templates',
    keywords: ['template icp', 'ideal customer profile template', 'définir icp b2b'],
    relatedArticle: '/blog/definir-icp-b2b-2026',
    fileSize: '0.8 MB',
    deliveryMode: 'email',
  },
];

export function getResource(slug) {
  return RESOURCES.find((r) => r.slug === slug) || null;
}

export function getAllResources() {
  return RESOURCES;
}

export function getResourcesByCategory() {
  const grouped = {};
  for (const r of RESOURCES) {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  }
  return grouped;
}
