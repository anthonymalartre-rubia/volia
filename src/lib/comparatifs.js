// ─────────────────────────────────────────────────────────────────────
// /comparatif/[slug] — Données long-form pour les 3 comparatifs phares
// ─────────────────────────────────────────────────────────────────────
//
// 3 comparatifs 1-vs-Volia approfondis ciblant le N°1 du marché par
// module Volia (Prospection, Campagnes, CRM). Pages ~2000-3000 mots
// chacune, optimisées SEO long-tail ("alternative apollo france",
// "migration lemlist", "remplacer hubspot starter").
//
// ⚠️ Ne pas confondre avec :
//   - /vs/[competitor]            : 14 pages courtes génériques
//   - /alternative/[competitor]   : 14 variantes "switcher"
//   - /outils/comparatif/[pair]   : 91 pages 1-vs-1 entre concurrents
//
// Ici on n'a que 3 entrées : apollo-vs-volia, lemlist-vs-volia,
// hubspot-vs-volia. Contenu unique et profond pour chaque.
//
// Toutes les données concurrentes (prix, features manquantes) sont
// croisées avec src/lib/competitors.js quand pertinent — mais ce
// fichier va plus loin (segments tables, FAQ, migration, etc).
// ─────────────────────────────────────────────────────────────────────

export const COMPARATIFS = {
  // ─── 1. Apollo vs Volia (Prospection) ─────────────────────────────
  'apollo-vs-volia': {
    slug: 'apollo-vs-volia',
    competitor: {
      slug: 'apollo',
      name: 'Apollo.io',
      domain: 'apollo.io',
      logo: 'A',          // initiale pour avatar
      logoBg: 'bg-orange-500',
      tagline: 'Plateforme US de sales intelligence',
      countryFlag: '🇺🇸',
    },
    module: 'prospection',
    color: 'violet',
    colorClasses: {
      bg: 'bg-violet-50',
      bgGradient: 'from-violet-50 via-white to-indigo-50/40',
      softGradient: 'bg-gradient-to-b from-white via-violet-50/20 to-white',
      border: 'border-violet-200',
      borderStrong: 'border-violet-300',
      text: 'text-violet-700',
      textStrong: 'text-violet-900',
      ring: 'ring-violet-300',
      buttonGradient: 'from-violet-600 to-indigo-600',
      buttonHover: 'hover:from-violet-500 hover:to-indigo-500',
      badgeBg: 'bg-violet-100',
      badgeBorder: 'border-violet-200',
      badgeText: 'text-violet-700',
      accentDot: 'bg-violet-600',
      tableBg: 'bg-violet-50/30',
    },
    hero: {
      eyebrow: 'Comparatif détaillé 2026',
      h1: 'Apollo vs Volia : lequel choisir en 2026 ?',
      subtitle: (
        // text-only used as JSX in component — keep as plain string with markers
        "Apollo.io facture 99 $/mois pour 40 % de couverture France. Volia propose 287 000+ entreprises françaises à partir de 19 €/mois — une économie moyenne de 80 €/mois pour les freelances et 130 €/mois pour les équipes growth. Comparatif exhaustif, sans langue de bois."
      ),
      ctaPrimary: { label: 'Essayer Volia gratuitement', href: '/signup?plan=starter' },
      ctaSecondary: { label: 'Voir le tableau comparatif', href: '#comparatif-features' },
    },
    tldr: [
      "Volia est 4 à 5× moins chère qu'Apollo en France (19 € vs 92 € équivalent) — économie moyenne 80 €/mois en solo, 130 €/mois pour une petite équipe.",
      "Apollo ne couvre que ~40 % des PME françaises (base US-first, données souvent obsolètes en EU). Volia couvre 78 % du tissu français via Google Places + waterfall.",
      "Killer feature manquante chez Apollo : recherche par catégorie + département français, waterfall multi-sources, et conformité RGPD native (CNIL + opt-out auto).",
      "Apollo reste meilleur pour : vendre aux USA à des grands comptes SaaS, intégration native Salesforce profonde, intent data B2B mondial.",
      "Pour 80 % des PME / freelances / agences françaises : Volia est le meilleur choix. Pour scale-ups B2B SaaS visant l'international : Apollo reste pertinent.",
    ],
    chiffresCles: [
      { label: 'Prix d\'entrée', apollo: '49 $/mo (Basic)', volia: '19 €/mo (Solo)', voliaWins: true },
      { label: 'Prix Pro (5k contacts)', apollo: '99 $/mo (~92 €)', volia: '49 €/mo (Pro)', voliaWins: true },
      { label: 'Prix scale (10k+)', apollo: '149 $/mo + emails illimités', volia: '149 €/mo (Business)', voliaWins: true },
      { label: 'Plan gratuit', apollo: '60 crédits/mois', volia: '100 prospects/mois', voliaWins: true },
      { label: 'Base de contacts', apollo: '220M (monde)', volia: '287k entreprises FR vérifiées', voliaWins: null },
      { label: 'Couverture PME France', apollo: '~40 %', volia: '78 % (#1 marché FR)', voliaWins: true },
      { label: 'Note Trustpilot', apollo: '4,3 / 5', volia: '4,8 / 5 (FR)', voliaWins: true },
      { label: 'Marché cible', apollo: '🇺🇸 USA / international', volia: '🇫🇷 France + DOM-TOM', voliaWins: null },
      { label: 'Support en français', apollo: '❌', volia: '✓ humain 24 h', voliaWins: true },
      { label: 'Conformité RGPD native', apollo: 'Partielle (toggle EU)', volia: '✓ by-design CNIL', voliaWins: true },
      { label: 'Hébergement', apollo: 'AWS US (Virginia)', volia: 'Vercel EU + Supabase EU', voliaWins: true },
    ],
    features: [
      // Section 1 : Fonctionnalités de base
      { section: 'Fonctionnalités de base' },
      { label: 'Recherche par catégorie B2B (150+)', apollo: 'partial', volia: 'yes', note: 'Apollo : 30 industries génériques. Volia : 150+ catégories Google Places (restaurant, BTP, santé…).' },
      { label: 'Recherche par département / région FR', apollo: 'no', volia: 'yes', note: '101 départements FR + 14 régions. Apollo : filtre pays + state US only.' },
      { label: 'Recherche en langage naturel (IA)', apollo: 'yes', volia: 'yes', note: 'Apollo : Apollo AI. Volia : Anthropic Claude (Made in France).' },
      { label: 'Multi-sélection zones géographiques', apollo: 'partial', volia: 'yes' },
      { label: 'Filtres avancés (taille, revenus, tech stack)', apollo: 'yes', volia: 'partial', note: 'Avantage Apollo : tech stack data + revenue ranges précis.' },
      { label: 'Intent data B2B', apollo: 'yes', volia: 'no', note: 'Avantage Apollo : signaux d\'achat depuis Bombora.' },

      // Section 2 : Enrichissement & données
      { section: 'Enrichissement & données' },
      { label: 'Email B2B France', apollo: 'partial', volia: 'yes', note: 'Apollo : ~40 % couverture FR. Volia : 78 % via waterfall.' },
      { label: 'Téléphone direct entreprise', apollo: 'yes', volia: 'yes' },
      { label: 'Téléphone mobile décideur', apollo: 'yes', volia: 'no', note: 'Avantage Apollo : mobile direct dial sur 50M+ contacts.' },
      { label: 'Waterfall multi-sources (scraping + Google + patterns)', apollo: 'no', volia: 'yes' },
      { label: 'Scoring de confiance par email', apollo: 'yes', volia: 'yes' },
      { label: 'Vérification SMTP (anti-bounce)', apollo: 'yes', volia: 'yes', note: 'Volia : MillionVerifier intégré.' },
      { label: 'Données décideurs (LinkedIn)', apollo: 'yes', volia: 'partial' },

      // Section 3 : Intégrations
      { section: 'Intégrations & écosystème' },
      { label: 'Salesforce natif', apollo: 'yes', volia: 'partial', note: 'Avantage Apollo : sync 2-way Salesforce.' },
      { label: 'HubSpot natif', apollo: 'yes', volia: 'yes' },
      { label: 'Pipedrive', apollo: 'yes', volia: 'yes' },
      { label: 'Zoho CRM (export pré-mappé)', apollo: 'no', volia: 'yes' },
      { label: 'Brevo / Mailjet', apollo: 'no', volia: 'yes' },
      { label: 'API publique', apollo: 'yes', volia: 'partial', note: 'Volia : API en beta sur plan Business.' },
      { label: 'Extension Chrome', apollo: 'yes', volia: 'no', note: 'Avantage Apollo : extension Apollo + LinkedIn intégrée.' },
      { label: 'Zapier / Make', apollo: 'yes', volia: 'yes' },

      // Section 4 : Cadence / Outreach
      { section: 'Cadence / Outreach (Apollo) vs Campagnes (Volia)' },
      { label: 'Séquences email automatisées', apollo: 'yes', volia: 'yes', note: 'Volia : module Campagnes (inclus dans Business).' },
      { label: 'A/B testing emails', apollo: 'yes', volia: 'yes' },
      { label: 'LinkedIn outreach intégré', apollo: 'yes', volia: 'no', note: 'Apollo : 1-clic connect LinkedIn via Apollo SDR.' },
      { label: 'SMS outbound', apollo: 'no', volia: 'yes' },
      { label: 'Warmup IP natif', apollo: 'no', volia: 'partial', note: 'Apollo : warmup via Smartlead. Volia : warmup Volia (beta).' },

      // Section 5 : Support & onboarding
      { section: 'Support & onboarding' },
      { label: 'Support en français', apollo: 'no', volia: 'yes' },
      { label: 'Chat live < 4 h', apollo: 'partial', volia: 'yes' },
      { label: 'Onboarding gratuit', apollo: 'no', volia: 'yes', note: 'Volia : appel onboarding 30 min offert (Pro+).' },
      { label: 'Documentation FR', apollo: 'no', volia: 'yes' },
      { label: 'Communauté utilisateurs FR', apollo: 'no', volia: 'partial' },

      // Section 6 : RGPD & Légal
      { section: 'RGPD & conformité française' },
      { label: 'Hébergement EU', apollo: 'no', volia: 'yes' },
      { label: 'DPA signable en français', apollo: 'partial', volia: 'yes' },
      { label: 'Filtre emails personnels (anti @gmail)', apollo: 'no', volia: 'yes', note: 'Volia : 28 domaines bloqués par défaut.' },
      { label: 'Opt-out automatique', apollo: 'partial', volia: 'yes' },
      { label: 'Blocklist permanente', apollo: 'no', volia: 'yes' },
      { label: 'Recommandations CNIL respectées', apollo: 'no', volia: 'yes' },

      // Section 7 : Pricing
      { section: 'Pricing & flexibilité' },
      { label: 'Plan gratuit', apollo: 'partial', volia: 'yes' },
      { label: 'Engagement annuel obligatoire', apollo: 'yes', volia: 'no', note: 'Apollo : -20 % en annuel mais engage. Volia : mensuel ou annuel libre.' },
      { label: 'Annulation 1 clic', apollo: 'no', volia: 'yes' },
      { label: 'Tarification transparente', apollo: 'partial', volia: 'yes', note: 'Apollo : crédits Email + crédits Phone séparés.' },
    ],
    analyses: [
      {
        title: 'Couverture France : qui gagne vraiment ?',
        body: "Apollo annonce fièrement 220 millions de contacts mondiaux. C'est vrai. Mais dans le détail, sa base française est constituée majoritairement de profils LinkedIn scrapés, avec une fraîcheur souvent supérieure à 18 mois. Sur les PME (TPE + ETI), la couverture réelle plafonne autour de 40 % — testez vous-même : cherchez \"boulangerie Lille\" sur Apollo, vous remonterez 8-12 résultats. Sur Volia, vous en aurez 200+, sourcés via Google Places (mis à jour quotidiennement par les commerçants eux-mêmes). Volia n'a pas la profondeur mondiale d'Apollo, mais sur la France elle gagne sur le terrain : 287 000+ entreprises actives, 78 % de couverture sur les PME, et un waterfall qui va chercher l'email là où Apollo abandonne (scraping du site puis Google via Serper avant le pattern guessing). Pour cibler la France, Volia est mathématiquement meilleur. Pour cibler l'international, Apollo reste devant.",
      },
      {
        title: 'Fonctionnalités prospection : qui est plus complet ?',
        body: "Apollo a une longueur d'avance sur trois axes : (1) l'intent data via Bombora (signaux d'achat — qui cherche un CRM cette semaine ?), (2) les téléphones mobiles directs sur ~50M de décideurs US, et (3) les filtres tech stack (qui utilise Salesforce + Pardot ?). Volia n'a aucun de ces trois éléments — assumé. En contrepartie, Volia apporte ce qu'Apollo ne fait pas : recherche par département FR (Apollo ne sait pas filtrer par \"Bouches-du-Rhône\"), recherche par catégorie locale française (Apollo n'a pas \"boulangerie-pâtisserie\" comme catégorie), et waterfall multi-sources qui économise vos crédits (Volia s'arrête dès qu'un email est trouvé, Apollo consomme un crédit même pour un échec). Pour la prospection enterprise B2B SaaS, Apollo gagne. Pour la prospection PME France, Volia gagne.",
      },
      {
        title: 'Intégrations & écosystème : où sont les écarts ?',
        body: "C'est le terrain où Apollo écrase. Connecteurs natifs avec Salesforce (2-way sync), Outreach, Salesloft, Marketo — toute la stack enterprise US. Une extension Chrome surpuissante qui s'injecte dans LinkedIn Sales Navigator, Gmail, et Salesforce. API publique mature, webhooks, SDK. Volia est plus jeune : exports CSV impeccables (HubSpot, Pipedrive, Zoho pré-mappés), connecteurs Brevo et Mailjet pour l'emailing FR, intégration Zapier qui couvre les 90 % de besoins courants. Mais pas (encore) d'extension Chrome, pas de sync 2-way Salesforce, API en beta. Si vous êtes une équipe sales de 20+ avec Salesforce Enterprise au cœur de votre stack, Apollo est plus mature. Si vous êtes une PME / agence avec HubSpot, Pipedrive ou Zoho, Volia couvre tout ce dont vous avez besoin sans surcouche.",
      },
      {
        title: 'Support client et onboarding : Volia, le seul en français',
        body: "Apollo a un support… américain. Chat en anglais, articles en anglais, onboarding self-service uniquement (sauf plan enterprise à 4-5 chiffres). Pour une équipe française, ça veut dire : tickets traduits via Google Translate, fuseaux horaires PST (réponses 8-12 h plus tard), et zéro accompagnement à la prise en main. Volia est nativement français : équipe basée en France, support email garanti < 24 h sur Pro/Business, onboarding gratuit 30 min offert au-dessus de Pro (un humain qui vous configure votre première recherche + import HubSpot), et documentation entièrement en français incluant les subtilités CNIL. Sur l'ergonomie, l'interface Apollo est dense (faite pour les power users), Volia est épurée (faite pour démarrer en 5 min). Si vous parlez anglais couramment et aimez les outils complexes : Apollo. Sinon : Volia.",
      },
      {
        title: 'Conformité RGPD : pourquoi c\'est critique en France',
        body: "Apollo collecte vos données utilisateurs et celles de vos prospects sur des serveurs AWS US, sous juridiction du Cloud Act. Le DPA est signable mais générique, et l'opt-out se fait via un mécanisme qui n'est pas conforme aux recommandations CNIL (pas de proof of consent par défaut, pas de blocklist permanente). Concrètement : si vous vous faites contrôler par la CNIL et que vous prospectez via Apollo sans config manuelle (rare), vous êtes exposé. Volia est conçu RGPD-by-design : hébergement EU (Vercel Frankfurt + Supabase EU), DPA signable en français, filtre des emails personnels activé par défaut (28 domaines @gmail / @hotmail bloqués), opt-out one-click avec blocklist permanente, et respect des 4 recommandations CNIL pour la prospection B2B. Pour une boîte française, ce n'est pas un nice-to-have : c'est ce qui vous évite l'amende DGCCRF + le scandale presse.",
      },
    ],
    personas: [
      {
        title: 'Vous êtes freelance B2B France',
        before: 'Apollo Basic 49 $/mo (~46 €) — 60 crédits/mois, vite épuisés',
        after: 'Volia Solo 19 €/mois — 1 000 prospects, exports illimités',
        savings: '27 €/mois (~325 €/an) + waterfall multi-sources',
        verdict: 'Volia Solo. Vous économisez 1/3 du prix et vous obtenez 10× plus de prospects. Aucun débat.',
      },
      {
        title: 'Vous êtes une agence growth 5 personnes',
        before: 'Apollo Professional 99 $/mo (~92 €) × 1 seat + outreach manuel',
        after: 'Volia Pro 49 €/mois — 5 000 prospects + module Campagnes 5 sièges',
        savings: '43 €/mois sur la prospection + module Campagnes intégré',
        verdict: 'Volia Pro. Vous gagnez prospection + cadence dans un seul outil français, et vous restez sous le prix d\'un seul siège Apollo.',
      },
      {
        title: 'Vous êtes une startup avec une équipe sales 3 BDR',
        before: 'Apollo Custom (~250 €/mois mini contrat annuel) + Salesforce',
        after: 'Volia Business 149 €/mois — 10k prospects + Campagnes + CRM (à venir)',
        savings: '~100 €/mois + zéro engagement annuel',
        verdict: 'Volia Business. Sauf si vous êtes 100 % sous Salesforce avec sync 2-way obligatoire (auquel cas Apollo reste plus mature).',
      },
    ],
    migration: {
      intro: "Migrer d'Apollo vers Volia se fait en moins de 2 heures pour une base de 5 000 contacts. Voici la procédure exacte, validée par 40+ migrations clients.",
      steps: [
        {
          title: 'Exporter vos données depuis Apollo',
          time: '10 min',
          desc: 'Allez dans Apollo → Search → People → Export all to CSV. Sélectionnez les champs : Name, Email, Phone, Company, Title, LinkedIn URL, City, Country. Téléchargez le CSV (jusqu\'à 10k lignes par export sur Apollo Basic, illimité sur Pro+).',
        },
        {
          title: 'Créer votre compte Volia (Starter gratuit)',
          time: '2 min',
          desc: 'volia.fr/signup → email pro ou Google OAuth. Aucune carte bancaire demandée pour le plan Starter (100 prospects/mois). Vous pouvez upgrader en Solo/Pro/Business plus tard depuis le dashboard.',
        },
        {
          title: 'Importer vos prospects (CSV)',
          time: '5 min',
          desc: 'Dashboard Volia → Listes → Importer CSV. Volia détecte automatiquement les colonnes (email, téléphone, nom, entreprise) et déduplique sur l\'email. Les contacts importés ne consomment AUCUN crédit (vous payez uniquement les nouvelles recherches).',
        },
        {
          title: 'Re-vérifier les emails importés',
          time: '10 min (auto)',
          desc: 'Optionnel mais recommandé : lancez la vérification MillionVerifier sur les emails Apollo (souvent 18+ mois de vétusté). Volia fait la passe SMTP en arrière-plan, vous obtenez le score Vérifié / Risky / Invalid pour chaque adresse.',
        },
        {
          title: 'Configurer vos domaines d\'envoi (si Campagnes)',
          time: '30 min',
          desc: 'Si vous utilisiez les sequences Apollo, migrez vers Volia Campagnes : Dashboard → Campagnes → Configurer domaine. Ajoutez votre SPF + DKIM + DMARC (Volia génère les enregistrements à copier dans votre DNS). Compatible Google Workspace, Microsoft 365, Brevo, Mailjet, OVH.',
        },
        {
          title: 'Recréer vos séquences / pipelines',
          time: '45 min',
          desc: 'Importez vos templates Apollo (copier-coller). Volia Campagnes utilise un éditeur visuel similaire : étapes email + délais + conditions de réponse. Les variables sont compatibles ({{first_name}}, {{company}}, {{custom_field}}).',
        },
        {
          title: 'Annuler Apollo',
          time: '5 min',
          desc: 'Apollo → Settings → Billing → Cancel subscription. Note : pas de remboursement au prorata, attendez la fin de votre cycle pour annuler. Exportez une dernière fois vos data Apollo avant suppression (Apollo purge le compte sous 30 j après annulation).',
        },
      ],
      totalTime: '~2 h pour 5 000 contacts',
      faqMigration: [
        { q: 'Vais-je perdre l\'historique de mes séquences Apollo ?', a: 'Apollo n\'exporte pas l\'historique d\'envoi (open/click). Vous gardez la liste des contacts contactés. Recommandation : exportez aussi le rapport "Sequence Performance" en CSV avant annulation pour vos archives.' },
        { q: 'Mes intégrations Salesforce vont-elles casser ?', a: 'Volia exporte vers Salesforce via CSV (mapping pré-fait) ou Zapier. Si vous aviez un sync 2-way Apollo → SFDC, vous le perdez. Migration recommandée si Salesforce n\'est PAS au cœur de votre stack — sinon, gardez Apollo pour cette intégration spécifique.' },
        { q: 'Combien coûte la migration ?', a: 'Gratuite. Volia ne fait pas payer l\'import CSV ni l\'onboarding (offert au-dessus du plan Pro à 49 €/mois).' },
      ],
    },
    temoignage: {
      quote: "J'ai migré d'Apollo vers Volia en 2 jours. Économie : 90 €/mois sur le seul siège que j'avais. Ce qui m'a convaincu : le support en français, les emails déjà vérifiés à 47 %, et le filtre RGPD activé par défaut. Apollo m'avait pris 6 mois pour avoir la même base de clients FR — Volia me sort des prospects à Marseille en 30 secondes.",
      author: 'Sophie Martin',
      role: 'Founder, Cabinet Conseil Lyon',
      avatar: 'SM',
      avatarGradient: 'from-violet-500 to-indigo-600',
      metric: '-90 €/mois',
      metricLabel: 'sur 12 mois = 1 080 €/an',
    },
    faq: [
      { q: 'Volia est-il vraiment moins cher qu\'Apollo à fonctionnalités égales ?', a: 'Oui — et la différence est marquée. Le plan Solo Volia (19 €/mo, 1 000 prospects) équivaut grossièrement au plan Basic Apollo (49 $/mo, 60 crédits) avec 16× plus de volume mensuel. Le plan Pro Volia (49 €/mo, 5k prospects + module Campagnes inclus) équivaut au plan Professional Apollo (99 $/mo, ~92 €) sans cadenceur intégré. Sur 12 mois, l\'économie moyenne pour un freelance est de 880 €, et pour une équipe growth 3-5 personnes de 1 560 €.' },
      { q: 'Quelle est la principale faiblesse d\'Apollo vs Volia ?', a: 'La couverture France. Apollo a été construit pour le marché US d\'abord — sa base européenne est constituée principalement de profils LinkedIn scrapés, avec une fraîcheur souvent supérieure à 18 mois. Sur les PME et TPE françaises (qui ne sont pas toutes sur LinkedIn), Apollo plafonne à ~40 % de couverture. Volia, via Google Places + waterfall, atteint 78 % sur le tissu français.' },
      { q: 'Volia a-t-il un essai gratuit aussi long qu\'Apollo ?', a: 'Volia propose un plan Starter 100 % gratuit à vie (100 prospects/mois, sans carte bancaire). Apollo propose un free trial avec 60 crédits one-time, puis force le passage payant. Donc oui : Volia est plus généreux sur le free, en quantité comme en durée.' },
      { q: 'Puis-je migrer mes données d\'Apollo vers Volia ?', a: 'Oui, en moins de 2 h pour une base de 5k contacts. Apollo exporte en CSV (10k lignes/export sur Basic, illimité sur Pro+), Volia importe avec déduplication automatique. Les contacts importés ne consomment aucun crédit. Volia offre aussi une re-vérification SMTP gratuite des emails Apollo (souvent vieillis).' },
      { q: 'Apollo a-t-il un avantage où Volia est en retard ?', a: 'Oui — soyons honnêtes. Apollo gagne sur 3 axes : (1) intent data via Bombora (signaux d\'achat en temps réel), (2) téléphones mobiles directs sur 50M+ décideurs US, (3) intégration native Salesforce 2-way et extension Chrome ultra-mature. Si l\'un de ces 3 points est critique pour votre activité, gardez Apollo (ou utilisez les deux : Volia pour la France, Apollo pour l\'international enterprise).' },
      { q: 'Volia est-il aussi fiable qu\'Apollo (uptime, support) ?', a: 'Uptime Volia : 99,9 % sur les 12 derniers mois (page status publique : volia.fr/status). Hébergé sur Vercel EU (Frankfurt) + Supabase EU avec failover automatique. Support FR garanti < 24 h sur Pro/Business, vs Apollo qui répond en 8-12 h en anglais (fuseau PST). Sur la fiabilité technique, parité. Sur le support : Volia gagne.' },
      { q: 'Quelle solution pour une grosse équipe (20+ users) ?', a: 'À partir de 20 sièges, Apollo Custom devient compétitif (négociation directe, intent data inclus). Volia Business à 149 €/mois inclut le multi-user (à venir) et l\'API beta — la version Volia Enterprise (à venir) ciblera ce segment. Notre recommandation actuelle : équipes < 15 → Volia Business ; équipes 20+ → Apollo Custom OU attendre Volia Enterprise (Q3 2026).' },
      { q: 'Comparatif side-by-side : où Volia gagne clairement ?', a: 'Prix (-50 à -80 %), couverture France (78 % vs 40 %), recherche par catégorie + département FR, waterfall multi-sources (économie de crédits), conformité RGPD native, support français, hébergement EU, plan Starter gratuit généreux, intégration Zoho CRM + Brevo + Mailjet.' },
      { q: 'Apollo a-t-il une intégration que Volia n\'a pas ?', a: 'Oui : Salesforce 2-way sync (Volia exporte mais ne sync pas en temps réel), Outreach.io, Salesloft, et l\'extension Chrome native LinkedIn Sales Nav. Volia couvre HubSpot, Pipedrive, Zoho, Brevo, Mailjet, Zapier, Make — soit 90 % des besoins PME / mid-market FR.' },
      { q: 'Verdict final : pour quel profil chaque outil ?', a: 'Apollo : équipes B2B SaaS US/international 20+ sièges avec Salesforce au cœur, budget 1k €/mois+, besoin d\'intent data. Volia : freelances + PME + agences growth + startups FR jusqu\'à 15 sièges, budget < 200 €/mois, focus marché français/européen, conformité RGPD critique.' },
    ],
    verdict: {
      voliaWins: ['Prix (3-5× moins cher)', 'Couverture France (78 % vs 40 %)', 'Support en français', 'Conformité RGPD native', 'Suite intégrée Prospection + Campagnes (+ CRM bientôt)', 'Plan gratuit généreux (100 prospects/mois à vie)'],
      competitorWins: ['Salesforce 2-way sync natif (mature)', 'Intent data B2B mondial via Bombora', 'Téléphones mobiles décideurs US (50M+)', 'Extension Chrome LinkedIn Sales Nav'],
      conclusion: "Pour 80 % des PME, freelances et agences françaises, Volia est le meilleur choix : économie de 50-80 % sur le prix, meilleure couverture France, conformité RGPD native, support en français. Apollo reste pertinent pour les équipes B2B SaaS internationales avec Salesforce + besoin d'intent data — un segment niche en France.",
    },
    keywords: ['alternative apollo france', 'apollo vs volia', 'volia ou apollo', 'migration apollo', 'remplacer apollo io', 'comparatif apollo apollo io', 'apollo io france alternative', 'meilleure alternative apollo', 'apollo concurrent francais', 'logiciel prospection alternative apollo'],
  },

  // ─── 2. Lemlist vs Volia (Campagnes) ──────────────────────────────
  'lemlist-vs-volia': {
    slug: 'lemlist-vs-volia',
    competitor: {
      slug: 'lemlist',
      name: 'Lemlist',
      domain: 'lemlist.com',
      logo: 'L',
      logoBg: 'bg-pink-500',
      tagline: 'Cadenceur multicanal français premium',
      countryFlag: '🇫🇷',
    },
    module: 'campagnes',
    color: 'blue',
    colorClasses: {
      bg: 'bg-blue-50',
      bgGradient: 'from-blue-50 via-white to-sky-50/40',
      softGradient: 'bg-gradient-to-b from-white via-blue-50/20 to-white',
      border: 'border-blue-200',
      borderStrong: 'border-blue-300',
      text: 'text-blue-700',
      textStrong: 'text-blue-900',
      ring: 'ring-blue-300',
      buttonGradient: 'from-blue-600 to-sky-600',
      buttonHover: 'hover:from-blue-500 hover:to-sky-500',
      badgeBg: 'bg-blue-100',
      badgeBorder: 'border-blue-200',
      badgeText: 'text-blue-700',
      accentDot: 'bg-blue-600',
      tableBg: 'bg-blue-50/30',
    },
    hero: {
      eyebrow: 'Comparatif détaillé 2026',
      h1: 'Lemlist vs Volia : lequel choisir en 2026 ?',
      subtitle: "Lemlist est le premier cadenceur français premium (59 €/mo). Volia Campagnes propose le même cadenceur — mais inclus dans une suite avec prospection intégrée à 49 €/mo. Économie typique : 150 €/mois pour une agence 5 personnes. Comparatif sans complaisance.",
      ctaPrimary: { label: 'Essayer Volia gratuitement', href: '/signup?plan=starter' },
      ctaSecondary: { label: 'Voir le tableau comparatif', href: '#comparatif-features' },
    },
    tldr: [
      "Lemlist est excellent en cadenceur pur (warmup IP natif Lemwarm, personnalisation avancée). Mais il ne fait QUE le cadenceur — pas de découverte de prospects, pas d'enrichissement.",
      "Volia inclut le cadenceur Campagnes + la prospection + bientôt CRM, à partir de 49 €/mo (vs Lemlist 59 €/mo cadenceur seul).",
      "Killer feature manquante chez Lemlist : découverte de prospects + enrichissement email intégrés. Vous devez payer Hunter (49 $) ou Dropcontact (31 €) en complément.",
      "Lemlist reste meilleur pour : warmup IP avancé (Lemwarm est le best-in-class), personnalisation visuelle complexe (images dynamiques), équipes 100 % outbound déjà équipées d'un enrichisseur séparé.",
      "Pour 75 % des PME / agences françaises voulant 1 seul outil prospection + cadence : Volia. Pour les power users outbound pur déjà équipés : Lemlist garde une longueur d'avance technique sur le cadenceur.",
    ],
    chiffresCles: [
      { label: 'Prix d\'entrée cadenceur', apollo: '59 €/mo (Email Starter)', volia: '49 €/mo (Pro, inclus)', voliaWins: true },
      { label: 'Prix Pro', apollo: '99 €/mo (Email Pro)', volia: '49 €/mo (Pro)', voliaWins: true },
      { label: 'Prix Enterprise multicanal', apollo: '159 €/mo (Multichannel)', volia: '149 €/mo (Business)', voliaWins: true },
      { label: 'Plan gratuit', apollo: '14 j trial', volia: '100 prospects/mois à vie', voliaWins: true },
      { label: 'Découverte de prospects incluse', apollo: '❌ (outil séparé)', volia: '✓ inclus', voliaWins: true },
      { label: 'Enrichissement email inclus', apollo: '❌ (Hunter en + : +49 $)', volia: '✓ waterfall inclus', voliaWins: true },
      { label: 'Warmup IP natif', apollo: '✓ Lemwarm (best-in-class)', volia: '✓ Volia Warm (beta)', voliaWins: false },
      { label: 'Note Trustpilot', apollo: '4,4 / 5', volia: '4,8 / 5', voliaWins: true },
      { label: 'Marché cible', apollo: '🇫🇷 France + International', volia: '🇫🇷 France + DOM-TOM', voliaWins: null },
      { label: 'Support en français', apollo: '✓', volia: '✓', voliaWins: null },
      { label: 'Conformité RGPD', apollo: '✓', volia: '✓ by-design CNIL', voliaWins: null },
    ],
    features: [
      { section: 'Cadenceur email — fonctionnalités de base' },
      { label: 'Séquences email automatisées', apollo: 'yes', volia: 'yes' },
      { label: 'Éditeur visuel de workflow', apollo: 'yes', volia: 'yes' },
      { label: 'A/B testing emails', apollo: 'yes', volia: 'yes' },
      { label: 'Variables dynamiques ({{first_name}})', apollo: 'yes', volia: 'yes' },
      { label: 'Variables IA (GPT/Claude)', apollo: 'yes', volia: 'yes' },
      { label: 'Images dynamiques personnalisées', apollo: 'yes', volia: 'partial', note: 'Avantage Lemlist : screenshots auto, vidéos custom — leur signature.' },
      { label: 'Pages d\'atterrissage personnalisées', apollo: 'yes', volia: 'no', note: 'Avantage Lemlist : Lemcal + Lemwarm intégrés.' },

      { section: 'Délivrabilité' },
      { label: 'Warmup IP natif', apollo: 'yes', volia: 'partial', note: 'Lemwarm est la référence du marché. Volia Warm en beta.' },
      { label: 'Rotation multi-inbox', apollo: 'yes', volia: 'yes' },
      { label: 'Vérification email pré-envoi', apollo: 'yes', volia: 'yes' },
      { label: 'Score SPF/DKIM/DMARC en dashboard', apollo: 'yes', volia: 'yes' },
      { label: 'Pause automatique sur taux de bounce', apollo: 'yes', volia: 'yes' },
      { label: 'Auto-cap quotidien d\'envois', apollo: 'yes', volia: 'yes' },

      { section: 'Découverte & enrichissement (le différenciateur)' },
      { label: 'Trouver des prospects', apollo: 'no', volia: 'yes', note: 'Lemlist : zéro découverte, vous devez importer une liste pré-faite.' },
      { label: 'Enrichissement email à la volée', apollo: 'no', volia: 'yes', note: 'Lemlist nécessite Hunter / Dropcontact en complément.' },
      { label: 'Recherche par catégorie B2B France', apollo: 'no', volia: 'yes' },
      { label: 'Recherche par département / région', apollo: 'no', volia: 'yes' },
      { label: 'Waterfall multi-sources email', apollo: 'no', volia: 'yes' },
      { label: 'Téléphones inclus', apollo: 'no', volia: 'yes' },

      { section: 'Multi-canal' },
      { label: 'Email cold', apollo: 'yes', volia: 'yes' },
      { label: 'LinkedIn (visites, invitations, messages)', apollo: 'yes', volia: 'no', note: 'Avantage Lemlist : LinkedIn natif via leur plan Multichannel 159 €/mo.' },
      { label: 'SMS outbound', apollo: 'no', volia: 'yes', note: 'Avantage Volia : SMS via Twilio intégré.' },
      { label: 'Appels enregistrés (call tasks)', apollo: 'yes', volia: 'no' },
      { label: 'Whatsapp Business', apollo: 'no', volia: 'no' },

      { section: 'Intégrations' },
      { label: 'HubSpot natif', apollo: 'yes', volia: 'yes' },
      { label: 'Salesforce natif', apollo: 'yes', volia: 'partial' },
      { label: 'Pipedrive', apollo: 'yes', volia: 'yes' },
      { label: 'Zoho CRM', apollo: 'partial', volia: 'yes' },
      { label: 'API publique', apollo: 'yes', volia: 'partial', note: 'Volia : API beta plan Business.' },
      { label: 'Webhooks', apollo: 'yes', volia: 'yes' },
      { label: 'Zapier / Make', apollo: 'yes', volia: 'yes' },
      { label: 'Aircall', apollo: 'yes', volia: 'no' },

      { section: 'Personnalisation & IA' },
      { label: 'Lemcal (booking pages)', apollo: 'yes', volia: 'no', note: 'Lemlist : Calendly intégré + branding.' },
      { label: 'Génération IA d\'icebreakers', apollo: 'yes', volia: 'yes' },
      { label: 'Templates de séquences pré-faits', apollo: 'yes', volia: 'yes' },
      { label: 'Spintax (rotation phrases anti-spam)', apollo: 'yes', volia: 'yes' },

      { section: 'Support & onboarding' },
      { label: 'Support en français', apollo: 'yes', volia: 'yes' },
      { label: 'Chat live < 4 h', apollo: 'yes', volia: 'yes' },
      { label: 'Onboarding gratuit', apollo: 'partial', volia: 'yes', note: 'Lemlist : onboarding only sur Multichannel 159 €/mo. Volia : Pro+ 49 €/mo.' },
      { label: 'Communauté utilisateurs FR (slack, events)', apollo: 'yes', volia: 'partial', note: 'Lemlist a une communauté très active (#Lemlist).' },
      { label: 'Documentation FR', apollo: 'yes', volia: 'yes' },

      { section: 'RGPD & conformité française' },
      { label: 'Hébergement EU', apollo: 'yes', volia: 'yes' },
      { label: 'DPA signable FR', apollo: 'yes', volia: 'yes' },
      { label: 'Filtre emails personnels (anti @gmail)', apollo: 'partial', volia: 'yes' },
      { label: 'Opt-out automatique footer email', apollo: 'yes', volia: 'yes' },
      { label: 'Blocklist permanente', apollo: 'yes', volia: 'yes' },
      { label: 'Recommandations CNIL respectées', apollo: 'yes', volia: 'yes' },

      { section: 'Pricing & flexibilité' },
      { label: 'Plan gratuit', apollo: 'no', volia: 'yes' },
      { label: 'Engagement annuel obligatoire', apollo: 'no', volia: 'no' },
      { label: 'Annulation 1 clic', apollo: 'yes', volia: 'yes' },
      { label: 'Tarification transparente', apollo: 'yes', volia: 'yes' },
      { label: 'Prix par siège (vs base)', apollo: 'par siège', volia: 'par compte', note: 'Avantage Volia : 1 compte = équipe, pas de coût par siège (limité par plan).' },
    ],
    analyses: [
      {
        title: 'Délivrabilité : qui gagne ?',
        body: "Lemlist gagne clairement sur ce terrain — et c'est même leur signature. Lemwarm, leur warmup IP intégré, est considéré comme le best-in-class du marché européen depuis 2019. Concrètement, Lemwarm envoie automatiquement des emails entre comptes Lemlist (avec ouvertures + réponses simulées) pour réchauffer votre IP avant les vraies séquences. Résultat typique : 95 %+ d'inbox placement chez les utilisateurs Lemlist expérimentés. Volia Warm, l'équivalent Volia, est en beta — il fonctionne mais avec une base utilisateurs plus petite (donc des signaux d'engagement moins variés). Si vous démarrez du cold email sans expérience et que la délivrabilité est votre obsession N°1 : Lemlist garde l'avantage. Si vous avez déjà un domaine warm ou si vous envoyez sur des prospects France où la réputation IP compte moins que la pertinence (PME locales) : la différence est négligeable.",
      },
      {
        title: 'Le vrai différenciateur : prospection + cadence en 1 outil',
        body: "C'est là que Lemlist coince : vous devez arriver avec votre liste de prospects pré-faite. Pour la construire, les utilisateurs Lemlist payent en moyenne en supplément : Hunter (49 $/mo) pour les emails, ou Dropcontact (31 €/mo) pour l'enrichissement RGPD-friendly, parfois Apollo (99 $) pour la découverte. Soit un coût total de 89 à 158 €/mois pour le combo Lemlist + outil de prospection. Volia inclut tout dans le plan Pro à 49 €/mo : recherche par catégorie + département, waterfall enrichissement, ET cadenceur Campagnes. Pour une agence ou un freelance qui démarre, c'est l'argument économique massif : ~100 €/mois d'économie minimum. Pour un power user déjà équipé d'un enrichisseur séparé, l'argument est moins fort — vous payez juste le cadenceur.",
      },
      {
        title: 'Personnalisation visuelle : Lemlist a un avantage cosmétique réel',
        body: "Lemlist a inventé en 2019 les emails avec images personnalisées dynamiques (une photo du dashboard du prospect, son logo posé sur un mockup, etc.). C'est leur signature, et c'est techniquement bluffant. Volia propose les variables dynamiques classiques ({{first_name}}, {{company}}) et la génération IA d'icebreakers, mais pas les images dynamiques au niveau Lemlist. Si votre stratégie de cold email repose sur la sur-personnalisation visuelle (typique des agences haut-de-gamme qui prospectent des CEO), Lemlist garde un avantage net. Si vous misez sur la pertinence du message texte (ce qui marche mieux pour 80 % des cas d'usage B2B France selon notre étude 2026), la différence est marginale.",
      },
      {
        title: 'Multi-canal : Lemlist a LinkedIn, Volia a SMS',
        body: "Lemlist propose un module LinkedIn intégré (visites de profil, invitations, messages) dans son plan Multichannel à 159 €/mo. C'est puissant si vous prospectez des décideurs très présents sur LinkedIn (tech, SaaS, consulting). Volia n'a pas de LinkedIn natif (recommandation : utiliser Waalaxy 56 € en parallèle si critique pour vous). En contrepartie, Volia inclut le SMS outbound via Twilio dans Campagnes — ce que Lemlist ne fait pas. Pour cibler des artisans, commerçants, ou des entreprises moins LinkedIn-actives, le SMS Volia est un canal souvent sous-utilisé avec un taux de lecture 95 %+. Choix selon votre cible.",
      },
      {
        title: 'Pricing : le calcul total qui compte vraiment',
        body: "Lemlist Email Starter : 59 €/mo pour le cadenceur seul. Email Pro : 99 €/mo (+ Lemcal). Multichannel : 159 €/mo (+ LinkedIn). Ajoutez Hunter (49 $) ou Dropcontact (31 €) pour la découverte → coût réel 90 à 190 €/mo pour la stack complète. Volia Pro : 49 €/mo, prospection + Campagnes inclus, 5k prospects, cadenceur illimité. Volia Business : 149 €/mo, 10k prospects + Campagnes + CRM (à venir). Pour une agence growth 5 personnes : Lemlist Multichannel × 5 sièges ≈ 195 €/mo (et c'est par siège), Volia Pro 1 compte = 49 €/mo. L'écart est massif. Sauf cas spécifique (besoin Lemwarm absolu OU LinkedIn outreach hardcore), Volia gagne sur le total cost.",
      },
    ],
    personas: [
      {
        title: 'Vous êtes freelance B2B France (1 personne)',
        before: 'Lemlist Email Starter 59 €/mo + Dropcontact 31 €/mo = 90 €/mo',
        after: 'Volia Solo 19 €/mo + upgrade Pro 49 €/mo si volume = 49 €/mo max',
        savings: '41 €/mois (~490 €/an) + tout en 1 outil',
        verdict: 'Volia Pro. Sauf si Lemwarm est non-négociable pour vous (cold email pur sur emails froids inconnus).',
      },
      {
        title: 'Vous êtes une agence growth 5 personnes',
        before: 'Lemlist Email Pro 99 €/mo × 5 sièges = 495 €/mo + Hunter 49 $',
        after: 'Volia Pro 49 €/mo (1 compte, équipe) — séquences illimitées + 5k prospects',
        savings: '~450 €/mois (~5 400 €/an) — record absolu du comparatif',
        verdict: 'Volia Pro. Le modèle "par compte" vs "par siège" change tout pour une agence. Vous gardez Lemlist en backup uniquement si workflows complexes hérités.',
      },
      {
        title: 'Vous êtes une startup B2B SaaS avec 3 BDR',
        before: 'Lemlist Multichannel 159 €/mo × 3 sièges = 477 €/mo + Apollo (~150 €)',
        after: 'Volia Business 149 €/mo — 10k prospects + Campagnes + CRM bientôt',
        savings: '~475 €/mois (~5 700 €/an)',
        verdict: 'Volia Business. Si vous avez vraiment besoin du LinkedIn natif Lemlist (cible tech / SaaS), restez sur Lemlist Multichannel SEULEMENT pour ça, et utilisez Volia pour la prospection FR + emailing complémentaire.',
      },
    ],
    migration: {
      intro: "Migrer de Lemlist vers Volia se fait en moins de 3 heures, séquences comprises. Procédure validée par 25+ migrations clients ces 6 derniers mois.",
      steps: [
        {
          title: 'Exporter vos contacts et leads depuis Lemlist',
          time: '15 min',
          desc: 'Lemlist → Leads → Export to CSV. Exportez aussi les campagnes actives (Campaigns → Export performance report) pour conserver les stats. Lemlist permet l\'export complet sur tous les plans.',
        },
        {
          title: 'Sauvegarder vos templates de séquences',
          time: '20 min',
          desc: 'Lemlist → Templates → Copier-coller chaque template email (sujet + corps) dans un fichier (Notion, Google Doc). Notez aussi les délais entre étapes et conditions de réponse — vous les recréerez dans Volia Campagnes.',
        },
        {
          title: 'Créer votre compte Volia',
          time: '2 min',
          desc: 'volia.fr/signup → plan Starter gratuit pour tester, ou Pro 49 €/mo directement si vous savez que vous migrerez (recommandé : prenez le mensuel pour la transition, pas l\'annuel).',
        },
        {
          title: 'Importer vos contacts (CSV)',
          time: '5 min',
          desc: 'Dashboard Volia → Listes → Importer CSV. Volia détecte les colonnes auto (email, nom, entreprise) et déduplique. Les contacts ne consomment aucun crédit.',
        },
        {
          title: 'Configurer vos domaines d\'envoi',
          time: '30 min',
          desc: 'Volia → Campagnes → Domaines → Ajouter votre domaine. Volia génère SPF + DKIM + DMARC à copier dans votre DNS (OVH, Cloudflare, Gandi). Vérification auto sous 5-30 min. Compatible Google Workspace, Microsoft 365, Brevo, Mailjet, ProtonMail.',
        },
        {
          title: 'Activer le warmup Volia',
          time: '5 min (+ 2 sem warmup)',
          desc: 'Volia Warm démarre auto sur les nouveaux domaines. Warmup recommandé : 2 semaines avant de lancer des séquences à volume (50+/jour). Si vous migrez un domaine déjà warm depuis Lemwarm, vous pouvez démarrer plus tôt.',
        },
        {
          title: 'Recréer vos séquences dans Volia Campagnes',
          time: '60 min',
          desc: 'Volia → Campagnes → Nouvelle campagne. Copier-coller vos templates depuis votre sauvegarde, définir les délais entre étapes (Lemlist et Volia utilisent le même modèle : email > délai > email > délai…). Variables compatibles : {{first_name}}, {{company}}, {{custom_field}}.',
        },
        {
          title: 'Lancer la première campagne test',
          time: '15 min',
          desc: 'Sur 20 prospects pour valider l\'inbox placement. Vérifier les stats Volia (ouvertures, clics, réponses) — comparer avec Lemlist pour calibrer. En cas d\'écart > 20 % de delivery, vérifier le warmup status.',
        },
        {
          title: 'Annuler Lemlist',
          time: '5 min',
          desc: 'Lemlist → Settings → Billing → Cancel subscription. Lemlist propose un downgrade à un plan inférieur pour transition, ou annulation pure. Pas de remboursement au prorata. Exportez une dernière fois vos data avant suppression.',
        },
      ],
      totalTime: '~3 h (+ 2 sem warmup recommandé)',
      faqMigration: [
        { q: 'Vais-je perdre l\'historique d\'envoi et les stats Lemlist ?', a: 'Lemlist exporte les rapports de campagne en CSV (open rate, click rate, reply rate). Vous gardez vos archives mais les données ne se réimportent pas dans Volia (architectures différentes). Recommandation : exporter avant annulation et garder le CSV en backup.' },
        { q: 'Mon warmup Lemwarm sera-t-il perdu ?', a: 'La réputation de votre IP/domaine appartient à vous, pas à Lemlist. En basculant vers Volia Warm, vous continuez à émettre depuis le même domaine — pas de reset de réputation. Mais Lemwarm avait potentiellement des signaux d\'engagement plus variés (base utilisateurs plus grande). Plan B : continuer Lemwarm pendant 1 mois en parallèle pendant la transition.' },
        { q: 'Mes intégrations Lemlist → CRM vont-elles casser ?', a: 'Volia Campagnes a ses propres connecteurs HubSpot, Pipedrive, Zoho. Si vous utilisiez Zapier entre Lemlist et votre CRM, recréez les zaps avec Volia comme source (les triggers sont équivalents : "new reply", "new bounce", "campaign completed").' },
      ],
    },
    temoignage: {
      quote: "On était sur Lemlist Email Pro à 99 €/mois × 4 sièges = 396 €. Plus Dropcontact à 31 €. Total : 427 €/mois pour faire de l'outbound. On a migré sur Volia Pro à 49 €/mois — TOUT compris, équipe entière, prospection + cadence + enrichissement. Économie : 378 €/mois, soit 4 536 €/an. Les délivrabilités sont équivalentes (on était déjà warm), et le support FR de Volia est honnêtement meilleur. Aucun regret.",
      author: 'Thomas Lecomte',
      role: 'CEO, Agence Growth Bordeaux',
      avatar: 'TL',
      avatarGradient: 'from-blue-500 to-sky-600',
      metric: '-378 €/mois',
      metricLabel: 'soit 4 536 €/an d\'économies',
    },
    faq: [
      { q: 'Volia est-il vraiment moins cher que Lemlist à fonctionnalités égales ?', a: 'Pour le cadenceur pur, Volia Pro (49 €/mo) inclut ce que Lemlist Email Starter (59 €/mo) propose, plus la prospection et l\'enrichissement. Pour le Multichannel (LinkedIn + email), Lemlist à 159 €/mo bat Volia à 149 €/mo SI vous avez vraiment besoin du LinkedIn natif. Pour les agences (par compte vs par siège), l\'écart explose en faveur de Volia : 49 €/mo Volia Pro 1 compte vs 495 €/mo Lemlist 5 sièges Email Pro.' },
      { q: 'Quelle est la principale faiblesse de Lemlist vs Volia ?', a: 'L\'absence totale de découverte de prospects et d\'enrichissement intégré. Lemlist suppose que vous arrivez avec votre liste — vous devez donc payer en plus Hunter, Dropcontact ou Apollo. Pour une PME ou un freelance qui démarre, c\'est un coût et une complexité supplémentaires (multi-outils, multi-factures, mappings CSV manuels).' },
      { q: 'Volia a-t-il un essai gratuit aussi long que Lemlist ?', a: 'Volia propose un plan Starter gratuit à vie (100 prospects/mois, sans CB). Lemlist propose un free trial de 14 jours, puis force le passage payant. Sur la durée, Volia est plus généreux.' },
      { q: 'Puis-je migrer mes données de Lemlist vers Volia ?', a: 'Oui, en ~3 h pour une base de 5k contacts. Lemlist exporte contacts + campagnes en CSV (tous plans). Les séquences elles-mêmes ne s\'importent pas automatiquement (architectures différentes), vous les recréez dans l\'éditeur Volia Campagnes (compter ~60 min pour 5-10 séquences). Migration gratuite.' },
      { q: 'Lemlist a-t-il un avantage où Volia est en retard ?', a: 'Trois axes honnêtes : (1) Lemwarm — le warmup IP best-in-class, surtout critique sur domaines neufs ; (2) images dynamiques personnalisées niveau Lemlist (mockups screenshots auto) ; (3) module LinkedIn natif (visites + invitations + messages) dans le plan Multichannel.' },
      { q: 'Volia est-il aussi fiable que Lemlist (uptime, délivrabilité) ?', a: 'Uptime Volia : 99,9 % sur 12 mois (status public). Délivrabilité Volia Campagnes : 92-96 % d\'inbox placement sur domaines warm (vs ~95-98 % chez Lemlist mature). L\'écart se ferme à mesure que Volia Warm gagne en maturité. Côté support : parité, les deux en français < 24 h sur les plans payants.' },
      { q: 'Quelle solution pour une grosse équipe (20+ users) ?', a: 'Lemlist devient prohibitif (159 €/mo × 20 sièges = 3 180 €/mo Multichannel). Volia Business 149 €/mo est par compte (limité par volume, pas par user — multi-user en version Business+ à venir). Pour 20+ users actifs en outbound : Volia Business actuellement, Volia Enterprise (Q3 2026) pour les workflows multi-user avancés.' },
      { q: 'Comparatif side-by-side : où Volia gagne clairement ?', a: 'Prix (-50 à -85 % selon profil), modèle par compte vs par siège (massif pour équipes), prospection intégrée (Lemlist 0), enrichissement waterfall (Lemlist 0), SMS outbound (Lemlist 0), plan gratuit généreux à vie, recherche par catégorie + département FR.' },
      { q: 'Lemlist a-t-il une intégration que Volia n\'a pas ?', a: 'Oui : LinkedIn outreach natif (Lemlist Multichannel), Aircall pour les call tasks, Lemcal (booking pages branded). Volia couvre HubSpot, Pipedrive, Zoho, Brevo, Mailjet, Zapier — soit le standard PME / mid-market FR.' },
      { q: 'Verdict final : pour quel profil chaque outil ?', a: 'Lemlist : équipes outbound pures déjà équipées d\'un enrichisseur séparé, besoin Lemwarm absolu (cold email à froid sur domaines neufs), prospection LinkedIn-first cible tech/SaaS, budget 100+ €/mo/siège accepté. Volia : freelances + PME + agences voulant 1 seul outil (prospection + cadence + bientôt CRM), facturation par compte, focus France/DOM-TOM, budget maîtrisé < 200 €/mo.' },
    ],
    verdict: {
      voliaWins: ['Prix total (-50 à -85 %)', 'Modèle par compte (vs par siège Lemlist)', 'Prospection intégrée (Lemlist en a 0)', 'Enrichissement waterfall inclus', 'SMS outbound natif', 'Plan gratuit à vie (100 prospects/mois)'],
      competitorWins: ['Lemwarm — warmup IP best-in-class du marché', 'Images dynamiques personnalisées niveau pro', 'LinkedIn outreach natif (plan Multichannel)', 'Communauté outbound très active (#Lemlist)'],
      conclusion: "Pour 75 % des PME, freelances et agences françaises voulant un seul outil pour prospecter + cadencer : Volia gagne nettement sur le prix total et l'intégration. Lemlist reste pertinent pour les power users outbound pur (équipes dédiées 100 % cold email), surtout si Lemwarm + LinkedIn natif sont non-négociables. Solution hybride possible : Volia pour prospection + Lemlist pour Lemwarm si critique.",
    },
    keywords: ['alternative lemlist', 'lemlist vs volia', 'volia ou lemlist', 'migration lemlist', 'remplacer lemlist', 'lemlist concurrent', 'cadenceur cold email france', 'lemlist alternative gratuite', 'cold email france alternative', 'outil cadence email francais'],
  },

  // ─── 3. HubSpot vs Volia (CRM + suite all-in-one) ─────────────────
  'hubspot-vs-volia': {
    slug: 'hubspot-vs-volia',
    competitor: {
      slug: 'hubspot',
      name: 'HubSpot Starter',
      domain: 'hubspot.com',
      logo: 'H',
      logoBg: 'bg-orange-600',
      tagline: 'Suite CRM + marketing américaine leader',
      countryFlag: '🇺🇸',
    },
    module: 'crm',
    color: 'emerald',
    colorClasses: {
      bg: 'bg-emerald-50',
      bgGradient: 'from-emerald-50 via-white to-teal-50/40',
      softGradient: 'bg-gradient-to-b from-white via-emerald-50/20 to-white',
      border: 'border-emerald-200',
      borderStrong: 'border-emerald-300',
      text: 'text-emerald-700',
      textStrong: 'text-emerald-900',
      ring: 'ring-emerald-300',
      buttonGradient: 'from-emerald-600 to-teal-600',
      buttonHover: 'hover:from-emerald-500 hover:to-teal-500',
      badgeBg: 'bg-emerald-100',
      badgeBorder: 'border-emerald-200',
      badgeText: 'text-emerald-700',
      accentDot: 'bg-emerald-600',
      tableBg: 'bg-emerald-50/30',
    },
    hero: {
      eyebrow: 'Comparatif détaillé 2026',
      h1: 'HubSpot Starter vs Volia : lequel choisir en 2026 ?',
      subtitle: "HubSpot Starter facture 90 €/mois par utilisateur pour son Sales Hub — sans prospection ni cadenceur sérieux inclus. Volia propose la suite complète (prospection + campagnes + CRM bientôt) à 149 €/mo pour toute l'équipe. Économie typique : 200-400 €/mois pour une PME 5 personnes. Analyse approfondie.",
      ctaPrimary: { label: 'Essayer Volia gratuitement', href: '/signup?plan=starter' },
      ctaSecondary: { label: 'Voir le tableau comparatif', href: '#comparatif-features' },
    },
    tldr: [
      "HubSpot Starter est facturé par utilisateur : 90 €/mo/user pour Sales Hub Starter, 450 €/mo/user pour Pro. Volia est par compte : 149 €/mo pour toute l'équipe.",
      "HubSpot est une suite complète et mature (CRM + Marketing + Sales + Service + CMS), mais coûte très cher en France pour les PME. Volia couvre 70 % des besoins PME à 20 % du prix.",
      "Killer feature manquante chez HubSpot Starter : pas de prospection intégrée (vous devez ajouter Apollo / Hunter), pas de cadenceur cold email avancé.",
      "HubSpot reste meilleur pour : marketing automation complexe (lead scoring multi-critères, parcours nurturing 30+ steps), CMS site web, équipes 50+ avec budget enterprise, écosystème intégré profond.",
      "Pour 70 % des PME françaises (5-20 personnes, focus outbound + suivi simple de pipeline) : Volia est le meilleur choix. Pour les scale-ups inbound-first avec marketing automation hardcore : HubSpot reste devant.",
    ],
    chiffresCles: [
      { label: 'Prix CRM gratuit', apollo: '✓ Free CRM (limité)', volia: '✓ Starter gratuit', voliaWins: null },
      { label: 'Prix entry Sales', apollo: '20 €/mo/user (Sales Starter)', volia: '49 €/mo (Pro, toute équipe)', voliaWins: true },
      { label: 'Prix Pro', apollo: '90 €/mo/user (Sales Pro)', volia: '49 €/mo (Pro)', voliaWins: true },
      { label: 'Prix Suite complète', apollo: '~1 200 €/mo (Pro 5 users)', volia: '149 €/mo (Business)', voliaWins: true },
      { label: 'Modèle facturation', apollo: 'Par utilisateur', volia: 'Par compte', voliaWins: true },
      { label: 'Prospection intégrée', apollo: '❌', volia: '✓ inclus', voliaWins: true },
      { label: 'Cadenceur cold email', apollo: 'partial (Sequences Pro+)', volia: '✓ Campagnes (Pro+)', voliaWins: true },
      { label: 'Note Trustpilot', apollo: '4,3 / 5', volia: '4,8 / 5', voliaWins: true },
      { label: 'Marché cible', apollo: '🇺🇸 USA → International', volia: '🇫🇷 France + DOM-TOM', voliaWins: null },
      { label: 'Support en français', apollo: '✓ (Pro+ uniquement)', volia: '✓ tous plans', voliaWins: true },
      { label: 'Onboarding obligatoire', apollo: '✓ payant (1 500-3 000 €)', volia: '✗ self-service + offert', voliaWins: true },
    ],
    features: [
      { section: 'CRM — Pipeline & contacts' },
      { label: 'Pipeline Kanban personnalisable', apollo: 'yes', volia: 'partial', note: 'Volia CRM en beta — disponible Q3 2026.' },
      { label: 'Contacts illimités', apollo: 'yes', volia: 'yes' },
      { label: 'Deals / opportunités', apollo: 'yes', volia: 'partial', note: 'Volia CRM beta : module deals en cours.' },
      { label: 'Tasks & rappels', apollo: 'yes', volia: 'partial' },
      { label: 'Email tracking (open/click)', apollo: 'yes', volia: 'yes' },
      { label: 'Templates email', apollo: 'yes', volia: 'yes' },
      { label: 'Notes & timeline contact', apollo: 'yes', volia: 'partial' },
      { label: 'Custom fields illimités', apollo: 'partial', volia: 'yes', note: 'HubSpot Starter : 10 custom fields max. Pro : illimité.' },

      { section: 'Prospection — Découverte de prospects' },
      { label: 'Trouver des prospects par catégorie', apollo: 'no', volia: 'yes', note: 'HubSpot : zéro découverte, intégration Apollo nécessaire.' },
      { label: 'Recherche par département / région FR', apollo: 'no', volia: 'yes' },
      { label: 'Base d\'entreprises France', apollo: 'no', volia: 'yes', note: 'Volia : 287k entreprises FR.' },
      { label: 'Enrichissement email natif', apollo: 'partial', volia: 'yes', note: 'HubSpot : Breeze AI enrichit existant, ne découvre pas.' },
      { label: 'Waterfall multi-sources', apollo: 'no', volia: 'yes' },
      { label: 'Téléphones inclus', apollo: 'partial', volia: 'yes' },

      { section: 'Sales engagement (cadenceur)' },
      { label: 'Séquences email', apollo: 'partial', volia: 'yes', note: 'HubSpot Sequences : disponible à partir de Sales Pro 90 €/mo/user.' },
      { label: 'A/B testing emails', apollo: 'partial', volia: 'yes' },
      { label: 'Warmup IP', apollo: 'no', volia: 'partial' },
      { label: 'Multi-inbox rotation', apollo: 'no', volia: 'yes' },
      { label: 'SMS outbound', apollo: 'no', volia: 'yes' },
      { label: 'Call recording & tracking', apollo: 'yes', volia: 'no', note: 'HubSpot : intégration native Aircall, RingCentral.' },

      { section: 'Marketing automation' },
      { label: 'Email marketing newsletter', apollo: 'partial', volia: 'partial', note: 'HubSpot Marketing Hub Starter : 1k contacts, à 18 €/mo. Volia : pas de newsletter intégrée.' },
      { label: 'Workflows nurturing complexes', apollo: 'yes', volia: 'no', note: 'Avantage HubSpot : Marketing Hub Pro (805 €/mo) — workflows multi-critères, scoring lead.' },
      { label: 'Lead scoring multi-critères', apollo: 'yes', volia: 'partial', note: 'Avantage HubSpot.' },
      { label: 'Landing pages builder', apollo: 'yes', volia: 'no', note: 'Avantage HubSpot.' },
      { label: 'Formulaires & pop-ups', apollo: 'yes', volia: 'no' },
      { label: 'Chatbot / Live chat', apollo: 'yes', volia: 'no' },

      { section: 'Reporting & analytics' },
      { label: 'Dashboards personnalisables', apollo: 'yes', volia: 'partial' },
      { label: 'Rapport pipeline / conversion', apollo: 'yes', volia: 'partial' },
      { label: 'Attribution multi-touch', apollo: 'yes', volia: 'no', note: 'Avantage HubSpot Pro.' },
      { label: 'Exports en bulk', apollo: 'yes', volia: 'yes' },

      { section: 'Intégrations & écosystème' },
      { label: 'Marketplace apps', apollo: 'yes', volia: 'partial', note: 'HubSpot : 1 700+ apps. Volia : 50+ via Zapier.' },
      { label: 'Salesforce sync', apollo: 'yes', volia: 'partial' },
      { label: 'Gmail / Outlook intégration native', apollo: 'yes', volia: 'partial' },
      { label: 'Slack', apollo: 'yes', volia: 'yes' },
      { label: 'Stripe / paiements', apollo: 'yes', volia: 'no' },
      { label: 'Zapier / Make', apollo: 'yes', volia: 'yes' },
      { label: 'Webhooks', apollo: 'yes', volia: 'yes' },
      { label: 'API publique', apollo: 'yes', volia: 'partial' },

      { section: 'Support & onboarding' },
      { label: 'Support en français', apollo: 'partial', volia: 'yes', note: 'HubSpot : FR uniquement sur Pro+ (à partir de 450 €/mo/user). Volia : tous plans.' },
      { label: 'Onboarding obligatoire payant', apollo: 'yes', volia: 'no', note: 'HubSpot : 1 500-3 000 € onboarding obligatoire sur Pro+. Volia : offert.' },
      { label: 'Documentation FR', apollo: 'yes', volia: 'yes' },
      { label: 'Académie / formations', apollo: 'yes', volia: 'partial', note: 'HubSpot Academy est best-in-class.' },
      { label: 'Communauté FR', apollo: 'yes', volia: 'partial' },

      { section: 'RGPD & conformité française' },
      { label: 'Hébergement EU', apollo: 'partial', volia: 'yes', note: 'HubSpot : data center EU optionnel sur Pro+ uniquement.' },
      { label: 'DPA signable FR', apollo: 'yes', volia: 'yes' },
      { label: 'Filtre emails personnels anti-spam', apollo: 'no', volia: 'yes' },
      { label: 'Opt-out automatique', apollo: 'yes', volia: 'yes' },
      { label: 'Recommandations CNIL respectées', apollo: 'partial', volia: 'yes' },

      { section: 'Pricing & flexibilité' },
      { label: 'Plan gratuit', apollo: 'yes', volia: 'yes' },
      { label: 'Engagement annuel obligatoire', apollo: 'yes', volia: 'no', note: 'HubSpot Pro+ : engagement 12 mois minimum + onboarding.' },
      { label: 'Annulation 1 clic', apollo: 'no', volia: 'yes' },
      { label: 'Tarification transparente', apollo: 'partial', volia: 'yes', note: 'HubSpot : pricing très complexe (5 hubs × 4 tiers × add-ons).' },
      { label: 'Prix par utilisateur ou par compte', apollo: 'par user', volia: 'par compte', note: 'Coup massif pour les équipes.' },
    ],
    analyses: [
      {
        title: 'Le piège du "par utilisateur" : où HubSpot tue les PME',
        body: "HubSpot facture par utilisateur — c'est la norme US, mais c'est destructeur pour le budget des PME françaises. Exemple concret : Sales Hub Starter à 20 €/mo/user paraît raisonnable, mais Sales Hub Pro (où les Sequences et l'automation deviennent utiles) est à 90 €/mo/user, avec un MINIMUM de 5 utilisateurs facturés. Soit 450 €/mois pour une équipe de 5 personnes, 900 €/mo pour 10 personnes. À cela s'ajoutent l'onboarding obligatoire (1 500-3 000 € one-time) et l'engagement annuel. Pour une PME française de 10 personnes, la facture HubSpot Pro annuelle dépasse facilement 12 000 € avec onboarding. Volia est par compte : 149 €/mo Business inclut toute l'équipe (limité par volume mensuel, pas par seat). Sur le même cas, l'économie annuelle atteint 11 000 € soit ~90 %.",
      },
      {
        title: 'CRM/Pipeline : HubSpot mature, Volia en construction',
        body: "Le CRM HubSpot est ce qui se fait de mieux dans la catégorie : pipelines Kanban illimités, deals avec multi-étapes, association contacts-deals-companies-tickets, custom fields illimités sur Pro, vue 360° par contact avec timeline complète. C'est une référence du marché depuis 10 ans. Volia CRM est en beta — disponible Q3 2026 à date de cet article. Le pipeline de base, la gestion des deals et la timeline contact sont en cours d'implémentation. Si vous avez besoin AUJOURD'HUI d'un CRM mature pour structurer un cycle de vente complexe (multi-étapes, multi-décideurs, intégration ERP), HubSpot gagne sans discussion. Si vous démarrez ou vous voulez un CRM léger pour suivre vos prospects extraits, attendez Volia CRM beta ou utilisez la liste contacts + tags Volia en transition.",
      },
      {
        title: 'Marketing automation : où HubSpot reste indétrônable',
        body: "Sur le terrain marketing automation (workflows nurturing multi-critères, lead scoring intelligent, attribution multi-touch, parcours conditionnels complexes), HubSpot Marketing Hub Pro reste le leader européen avec Salesforce Marketing Cloud. Si votre stratégie repose sur l'inbound marketing (blog SEO → form → workflow nurturing 12 emails → scoring → handoff sales), HubSpot est l'outil. Volia ne propose pas (encore) de marketing automation à ce niveau — c'est assumé. La cible Volia est l'outbound + le suivi pipeline simple. Pour une scale-up qui investit massivement en content + paid + nurturing : HubSpot. Pour une PME qui fait majoritairement de l'outbound + un peu de nurturing simple : Volia + une stack légère (Brevo/Mailjet pour les newsletters à 25 €/mo) couvre 80 % des besoins à 10 % du prix.",
      },
      {
        title: 'Suite complète : Volia couvre 70 % des besoins PME à 20 % du prix',
        body: "HubSpot vend une suite complète : Sales Hub + Marketing Hub + Service Hub + CMS Hub + Operations Hub. C'est puissant mais coûteux : la suite Pro complète pour 10 users dépasse 1 500 €/mois en France. Volia se positionne différemment : un outil all-in-one PME (Prospection + Campagnes + CRM bientôt) pour 149 €/mo Business — toute l'équipe incluse. Sur le périmètre Sales (trouver des prospects + envoyer des séquences + suivre le pipeline), Volia couvre 90 % des besoins HubSpot. Sur le périmètre Marketing (inbound, nurturing, attribution), Volia couvre ~30 % et reste à compléter (Brevo, Plausible, etc.). Sur le Service (helpdesk), Volia n'a rien — utiliser Crisp ou Intercom Starter. Conclusion : pour une PME française dont 70 % de l'activité commerciale est outbound + un peu de marketing simple, Volia + 1-2 outils complémentaires couvre tout, à 20-30 % du prix HubSpot complet.",
      },
      {
        title: 'Support et onboarding : le coût caché HubSpot',
        body: "HubSpot Pro+ impose un onboarding payant obligatoire de 1 500 à 3 000 € (parfois 5 000 € selon le scope), facturé par HubSpot ou un partenaire certifié. C'est un investissement one-time qui peut être rentable pour une grosse boîte avec workflows complexes, mais c'est un frein massif pour une PME française qui veut juste démarrer. À cela s'ajoute l'engagement annuel : si vous résiliez avant 12 mois, vous payez l'année complète. Support en français : disponible UNIQUEMENT sur Pro+ (à 90 €/mo/user mini). Volia n'a aucun onboarding payant obligatoire — self-service complet, et appel onboarding 30 min OFFERT au-dessus de Pro 49 €/mo. Support FR dès le plan gratuit. Aucun engagement annuel, annulation 1 clic. Pour une PME française qui démarre : Volia élimine tous les frictions HubSpot.",
      },
    ],
    personas: [
      {
        title: 'Vous êtes freelance B2B France (1 personne)',
        before: 'HubSpot Sales Starter 20 €/mo/user + besoin prospection séparée (Apollo 99 $)',
        after: 'Volia Solo 19 €/mo OU Pro 49 €/mo',
        savings: '90 à 110 €/mois selon plan',
        verdict: 'Volia Solo (Pro si vous avez besoin du cadenceur). HubSpot Starter est sous-équipé en cadenceur, vous finirez par payer Pro = explosion budget.',
      },
      {
        title: 'Vous êtes une PME 5 personnes (commerce, services B2B)',
        before: 'HubSpot Sales Pro 90 €/mo × 5 users = 450 €/mo + onboarding 2 000 € + engagement annuel',
        after: 'Volia Pro 49 €/mo (toute équipe) OU Business 149 €/mo (+ CRM beta)',
        savings: '350 à 400 €/mois (~4 500 €/an) + zéro onboarding payant + zéro engagement',
        verdict: 'Volia Pro/Business. Si vous avez besoin d\'un CRM mature MAINTENANT, attendez Volia CRM Q3 2026 ou utilisez HubSpot CRM gratuit + Volia Pro pour le reste.',
      },
      {
        title: 'Vous êtes une startup avec une équipe sales 3 BDR + 2 AE',
        before: 'HubSpot Sales Pro 90 €/mo × 5 = 450 €/mo + Marketing Hub Starter 18 €/mo + Apollo 99 $/mo = ~560 €/mo',
        after: 'Volia Business 149 €/mo + Brevo 25 €/mo pour newsletters = 174 €/mo',
        savings: '~390 €/mois (~4 680 €/an)',
        verdict: 'Volia Business + outils complémentaires légers. Sauf si votre stratégie repose lourdement sur l\'inbound marketing automation, auquel cas HubSpot Marketing Pro garde une avance.',
      },
    ],
    migration: {
      intro: "Migrer de HubSpot vers Volia est plus complexe que les autres migrations (HubSpot est mature, vous avez probablement des workflows et automations). Comptez 1 semaine pour une base de 5 000 contacts + 10 workflows. Procédure éprouvée sur 15+ migrations.",
      steps: [
        {
          title: 'Audit de votre setup HubSpot actuel',
          time: '1 h',
          desc: 'Listez ce que vous utilisez vraiment dans HubSpot : contacts (combien ?), deals (pipelines actifs), workflows (combien et complexité), forms, landing pages, emails marketing, sequences sales. Cet audit détermine ce qui se migre dans Volia et ce qui nécessite un outil complémentaire (Brevo, Plausible, Crisp).',
        },
        {
          title: 'Exporter contacts et deals depuis HubSpot',
          time: '20 min',
          desc: 'HubSpot → Contacts → Export → CSV. Sélectionnez les champs essentiels (email, name, company, phone, custom fields critiques). Pour les deals : Sales → Deals → Export. HubSpot exporte en CSV ou Excel sur tous les plans.',
        },
        {
          title: 'Documenter les workflows et sequences',
          time: '2-3 h selon complexité',
          desc: 'Pour chaque workflow / sequence active : exporter ou screenshoter la logique (trigger, étapes, conditions, emails). Vous recréerez la logique outbound dans Volia Campagnes — pour les workflows marketing complexes, vous devrez décider quoi conserver (et potentiellement garder HubSpot Marketing Hub Free en parallèle).',
        },
        {
          title: 'Créer votre compte Volia',
          time: '2 min',
          desc: 'volia.fr/signup → Pro 49 €/mo (recommandé pour les PME ex-HubSpot) ou Business 149 €/mo si vous voulez CRM beta + multi-user. Mensuel d\'abord pendant la transition.',
        },
        {
          title: 'Importer contacts dans Volia',
          time: '15 min',
          desc: 'Dashboard Volia → Listes → Importer CSV HubSpot. Volia détecte les colonnes auto (email, phone, company) et déduplique. Mapping custom fields possible sur Pro+. Les contacts importés ne consomment aucun crédit prospection.',
        },
        {
          title: 'Configurer Volia Campagnes (séquences outbound)',
          time: '2-3 h',
          desc: 'Recréer vos sequences HubSpot dans Volia Campagnes (l\'éditeur visuel est similaire). Configurer le domaine d\'envoi (SPF + DKIM + DMARC), lancer le warmup Volia Warm sur les nouveaux domaines (2 semaines recommandées avant volume).',
        },
        {
          title: 'Stack complémentaire si nécessaire',
          time: '1-2 h',
          desc: 'Pour les besoins non couverts par Volia : Brevo (newsletters & marketing automation simple : 25 €/mo), Crisp (live chat : gratuit ou 25 €/mo), Plausible/Matomo (analytics RGPD : 9 €/mo). Coût total stack post-migration : ~150-180 €/mo vs 800-1 500 €/mo HubSpot.',
        },
        {
          title: 'Phase de double-run (recommandée)',
          time: '1 mois',
          desc: 'Gardez HubSpot Starter Free (CRM gratuit) en parallèle pendant 1 mois pour les workflows critiques, puis bascule complète. Cette phase évite les pertes de données ou les ruptures de continuité commerciale.',
        },
        {
          title: 'Annuler HubSpot Pro+',
          time: '15 min',
          desc: 'HubSpot → Settings → Subscriptions → Cancel. ATTENTION : HubSpot Pro+ est sur engagement annuel — si vous résiliez avant la fin du contrat, vous restez facturé jusqu\'au renouvellement. Calez votre migration sur la date de renouvellement pour éviter cela. Vous pouvez downgrade vers HubSpot Free CRM (gardé en parallèle) sans frais.',
        },
      ],
      totalTime: '~1 semaine total (étalée selon complexité workflows)',
      faqMigration: [
        { q: 'Vais-je perdre l\'historique deals et timeline contact HubSpot ?', a: 'HubSpot exporte les contacts + deals + activités en CSV mais l\'historique d\'activités riche (call notes, meeting notes, email threads) reste partiellement dans l\'export. Recommandation : exporter via l\'API HubSpot (gratuit) si vous voulez tout, ou accepter de perdre l\'historique granulaire et garder HubSpot Free CRM en archive read-only.' },
        { q: 'HubSpot a un engagement annuel — comment je résilie ?', a: 'Vous ne pouvez pas résilier avant la fin du contrat sans payer le solde. Stratégie recommandée : (1) commencer la migration vers Volia 2 mois avant la date de renouvellement, (2) tester en double-run pendant ces 2 mois, (3) résilier HubSpot au renouvellement (window de 30 j avant). Pas de remboursement au prorata.' },
        { q: 'Et les workflows marketing automation complexes ?', a: 'Volia ne réplique pas (encore) les workflows multi-critères type "si lead a visité X page ET ouvert Y email DANS 7 jours ALORS scoring +5". Pour ces cas : (a) garder HubSpot Marketing Hub Free (1k contacts gratuit) pour les workflows critiques, (b) utiliser Brevo Marketing Automation (à partir de 25 €/mo) qui couvre 70 % des besoins HubSpot Pro, (c) attendre Volia Marketing (roadmap 2027).' },
      ],
    },
    temoignage: {
      quote: "On était sur HubSpot Sales Pro à 90 €/mo × 6 users = 540 €/mois. Plus l'engagement annuel + 2 800 € d'onboarding obligatoire. On a fait l'audit : on n'utilisait QUE le CRM basique + les sequences. On a migré sur Volia Business 149 €/mo + on garde HubSpot CRM Free en archive. Économie : 391 €/mois, soit 4 692 €/an. Plus 2 800 € d'onboarding évités sur le renouvellement. Le seul truc qu'on a perdu : les rapports d'attribution multi-touch — on s'en passe très bien.",
      author: 'Camille Rousseau',
      role: 'Head of Sales, Startup B2B SaaS Paris',
      avatar: 'CR',
      avatarGradient: 'from-emerald-500 to-teal-600',
      metric: '-391 €/mois',
      metricLabel: '+ 2 800 € onboarding évités/an',
    },
    faq: [
      { q: 'Volia est-il vraiment moins cher que HubSpot à fonctionnalités égales ?', a: 'Sur le périmètre Sales (prospection + cadence + CRM basique), oui — massivement. Volia Pro 49 €/mo (toute équipe) vs HubSpot Sales Pro 90 €/mo/user × 5 users mini = 450 €/mo. Économie 90 % minimum. Sur le périmètre Marketing complet (automation nurturing + landing pages + attribution), HubSpot reste plus complet — mais c\'est un autre besoin que Volia ne prétend pas couvrir aujourd\'hui.' },
      { q: 'Quelle est la principale faiblesse de HubSpot vs Volia ?', a: 'Le modèle de facturation par utilisateur, combiné à l\'engagement annuel et à l\'onboarding obligatoire (1 500-3 000 €). Pour une PME française qui veut juste structurer son commercial, le ticket d\'entrée HubSpot Pro est prohibitif. HubSpot Starter (20 €/mo/user) est sous-équipé en cadenceur sérieux, vous finirez par devoir upgrader Pro = explosion budget.' },
      { q: 'Volia a-t-il un essai gratuit aussi long que HubSpot ?', a: 'Volia : plan Starter gratuit à VIE (100 prospects/mois, sans CB). HubSpot : Free CRM à vie (1M contacts mais sans sequences, sans automation, sans email marketing). Les deux ont un plan free généreux. Volia est plus utile out-of-the-box pour démarrer l\'outbound (prospection incluse), HubSpot est plus utile pour le CRM mature pur.' },
      { q: 'Puis-je migrer mes données de HubSpot vers Volia ?', a: 'Oui — comptez ~1 semaine pour une base 5k contacts + 10 workflows. HubSpot exporte contacts + deals + activités en CSV/API. Volia importe avec déduplication auto et mapping custom fields. Les workflows complexes ne se migrent pas auto (architectures différentes) — vous documentez et recréez (~2-3 h). Phase de double-run 1 mois recommandée.' },
      { q: 'HubSpot a-t-il un avantage où Volia est en retard ?', a: 'Oui, plusieurs axes honnêtes : (1) Marketing automation mature (workflows multi-critères, scoring, attribution multi-touch), (2) CMS Hub pour gérer le site web depuis HubSpot, (3) Marketplace de 1 700+ apps tierces, (4) HubSpot Academy (formations gratuites best-in-class), (5) écosystème de partenaires intégrateurs FR matures, (6) Service Hub pour le helpdesk.' },
      { q: 'Volia est-il aussi fiable que HubSpot (uptime, support) ?', a: 'Uptime Volia : 99,9 % sur 12 mois. HubSpot : 99,95 % (référence du marché). Très proche, parité quasi-totale. Support FR : Volia tous plans dès gratuit ; HubSpot uniquement sur Pro+ (à 90 €/mo/user). Avantage Volia sur l\'accessibilité du support.' },
      { q: 'Quelle solution pour une grosse équipe (20+ users) ?', a: 'À ce niveau, HubSpot devient une décision stratégique : Sales Hub Enterprise (1 200 €/mo/user) + Marketing Hub Enterprise (3 600 €/mo) = 100 000-300 000 €/an. Volia Business 149 €/mo gère 20+ users en volume mais pas (encore) en multi-user fine-grained (roadmap Q3-Q4 2026 : Volia Enterprise). Pour 20+ users tout de suite avec workflows complexes : HubSpot reste le standard. Pour 20+ users en mode léger : Volia Business + attendre l\'évolution.' },
      { q: 'Comparatif side-by-side : où Volia gagne clairement ?', a: 'Prix (-90 % typique), modèle par compte (massif vs par user HubSpot), prospection intégrée (HubSpot 0), zéro engagement annuel, zéro onboarding payant obligatoire, support FR tous plans, RGPD by-design (HubSpot data center EU uniquement Pro+).' },
      { q: 'HubSpot a-t-il une intégration que Volia n\'a pas ?', a: 'Beaucoup. HubSpot a 1 700+ apps au marketplace. Volia couvre 50+ via Zapier + connecteurs natifs (HubSpot, Pipedrive, Zoho, Brevo, Mailjet). Si vous dépendez d\'une intégration native spécifique (Salesforce 2-way, Aircall, Stripe billing), HubSpot peut être plus mature. Pour la majorité des PME : Zapier couvre tout.' },
      { q: 'Verdict final : pour quel profil chaque outil ?', a: 'HubSpot : scale-ups 20+ users avec budget enterprise (~10k €/mo+), stratégie inbound + marketing automation mature, besoin CMS + Service intégrés. Volia : PME 1-15 users (freelances, agences, startups B2B), focus outbound + suivi pipeline simple, budget maîtrisé < 200 €/mo, marché FR/EU prioritaire.' },
    ],
    verdict: {
      voliaWins: ['Prix total (-80 à -95 %)', 'Modèle par compte (vs par user HubSpot)', 'Prospection intégrée (HubSpot en a 0)', 'Zéro onboarding payant obligatoire', 'Zéro engagement annuel — annulation 1 clic', 'Support FR tous plans (HubSpot : Pro+ uniquement)'],
      competitorWins: ['CRM mature et profond (pipelines + deals + custom fields illimités Pro)', 'Marketing automation best-in-class (workflows + lead scoring + attribution)', 'CMS Hub pour gérer le site web', 'Marketplace 1 700+ apps', 'HubSpot Academy (formations gratuites de référence)'],
      conclusion: "Pour 70 % des PME françaises (5-20 personnes, focus outbound + suivi pipeline simple) : Volia est le meilleur choix — économie 80-90 %, simplicité, aucun engagement. HubSpot reste pertinent pour les scale-ups inbound-first avec marketing automation complexe et budget enterprise. Solution hybride courante : Volia pour Sales (prospection + cadence + CRM léger) + HubSpot Free CRM en archive + Brevo pour marketing simple.",
    },
    keywords: ['alternative hubspot france', 'hubspot vs volia', 'volia ou hubspot', 'migration hubspot', 'remplacer hubspot starter', 'hubspot concurrent francais', 'crm alternative hubspot', 'hubspot trop cher', 'meilleure alternative hubspot pme', 'crm pme france pas cher'],
  },
};

export function getComparatif(slug) {
  return COMPARATIFS[slug] || null;
}

export function getAllComparatifs() {
  return Object.values(COMPARATIFS);
}

export function getAllComparatifSlugs() {
  return Object.keys(COMPARATIFS);
}
