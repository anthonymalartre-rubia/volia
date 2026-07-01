// Source unique des Q/R de la landing — partagée entre le client component
// (FAQSection accordion) et le serveur (JSON-LD FAQPage schema dans page.js).
//
// Chaque item porte une `category` parmi : 'product' | 'trust' | 'pricing' | 'vs'.
// Refonte UX mai 2026 : tabs + search + icônes par catégorie au lieu d'une
// liste mono-bloc qui faisait "trop long et simple".

export const FAQ_CATEGORIES = [
  { id: 'all', label: 'Tout', count: null },
  { id: 'product', label: 'Produit', icon: '🚀', accent: 'violet' },
  { id: 'trust', label: 'Données & sécurité', icon: '🛡️', accent: 'emerald' },
  { id: 'pricing', label: 'Tarifs & compte', icon: '💳', accent: 'amber' },
  { id: 'vs', label: 'Concurrents', icon: '⚔️', accent: 'rose' },
];

export const FAQ_ITEMS = [
  {
    category: 'product',
    question: "Concrètement, c'est quoi Volia ?",
    answer:
      "Un pipeline B2B en autopilot : tu sélectionnes ta cible, Volia exécute la chaîne complète — scrap des boites (Google Places, 150+ catégories, 101 départements), email personnalisé par IA, formulaire de qualification, scoring, puis push du lead chaud dans ton CRM. Ça remplace une stack Apollo + Lemlist + HubSpot, en une seule app — gratuite pour démarrer, dès 19€/mois pour la donnée : de la cible au lead chaud livré, tu ne touches pas la mécanique.",
  },
  {
    category: 'product',
    question: 'Comment marche Volia Autopilot ?',
    answer:
      "C'est le pipeline B2B automatisé de bout en bout. Tu choisis ta cible (secteur + zone) et un template d'email, puis Volia enchaîne tout seul : scrap des entreprises, enrichissement des emails, envoi d'un email personnalisé par IA, formulaire de qualification, scoring du lead, et push dans ton CRM. De la cible au lead chaud livré, automatisé — tu suis juste les résultats.",
  },
  {
    category: 'product',
    question: 'Je dois gérer quoi exactement ?',
    answer:
      "Deux choses : tu choisis ta cible et tu choisis ton template d'email. C'est tout. Volia fait le reste — scrap, enrichissement, envoi, qualification, scoring, push CRM — et tu reçois les leads chauds dans ton pipeline. Tu ne gères pas la mécanique, tu récupères les résultats.",
  },
  {
    category: 'pricing',
    question: 'Autopilot est inclus dans quel plan ?',
    answer:
      "Autopilot est inclus dans le plan MAX à 179€/mois : 3 workflows en parallèle, branches IF/ELSE et A/B testing. Avec le code MAX99, les 3 premiers mois sont à 99€/mois. Et l'essai gratuit de 14 jours te donne MAX complet, sans carte bancaire. Tu peux changer de plan à tout moment depuis tes paramètres.",
  },
  {
    category: 'trust',
    question: 'Les données sont fiables ?',
    answer:
      "Les infos viennent direct de Google Places (nom, adresse, tél, site, avis). Sur chaque email, un score : Vérifié (trouvé sur le site), Google (récupéré via recherche), Probable (deviné par pattern). Vous filtrez selon votre niveau de confort.",
  },
  {
    category: 'product',
    question: 'Combien de prospects par recherche ?',
    answer:
      "Entre 20 et 60 par combo département × catégorie en moyenne. Une recherche Île-de-France toutes catégories B2B : plusieurs centaines de leads qualifiés. Tout dépend de la densité du secteur.",
  },
  {
    category: 'product',
    question: "L'enrichissement email, ça marche comment ?",
    answer:
      "Cascade waterfall : on scrape le site, puis on cherche sur Google via Serper, puis on devine via patterns courants (contact@, info@…). On s'arrête au premier email trouvé. Chaque email a son score de confiance. Pas de magie, pas d'oracle.",
  },
  {
    category: 'product',
    question: "J'exporte vers mon CRM ?",
    answer:
      "Oui. Export CSV standard compatible HubSpot, Salesforce, Zoho, Pipedrive, Lemlist, Apollo, Smartlead. Format Zoho dédié dispo. Vous pouvez aussi filtrer avant export pour ne sortir que les bons leads.",
  },
  {
    category: 'pricing',
    question: 'Le plan gratuit, ça couvre quoi ?',
    answer:
      "Gratuit = toute la suite avec des limites : 25 crédits Prospection/mois, 100 recherches, 200 cold emails, 1 séquence, 1 pipeline CRM, 2 formulaires, 5 exports CSV. Sans CB. Pour la donnée à volume, Prospection à 19€/mois (500 crédits) — le moins cher du marché français. MAX à 179€/mois pour la suite complète + Autopilot.",
  },
  {
    category: 'trust',
    question: 'Mes données sont en sécu ?',
    answer:
      "Chiffrement TLS 1.2+ au repos et en transit. RGPD respecté à la lettre : vos leads vous appartiennent, vous exportez ou supprimez quand vous voulez. Aucune donnée revendue, jamais. C'est non négociable.",
  },
  {
    category: 'pricing',
    question: 'Je peux annuler quand je veux ?',
    answer:
      "Sans engagement. 1 clic dans les paramètres, l'accès reste actif jusqu'à la fin de la période payée. Vos données restent accessibles tant que le compte existe.",
  },
  {
    category: 'vs',
    question: 'Quelle différence avec Apollo, Hunter ou Lusha ?',
    answer:
      "Apollo, Hunter, Lusha enrichissent des listes que vous avez déjà. Volia fait les DEUX : on découvre les boites (Google Places, 101 dépts × 150 catégories) ET on chope les emails. À 19€/mois (vs 49€ Hunter, 99€ Apollo), c'est le ticket d'entrée le moins cher du marché français.",
  },
  {
    category: 'vs',
    question: 'Et vs HubSpot + Apollo + Lemlist en stack ?',
    answer:
      "Stack classique B2B = HubSpot + Apollo + Lemlist + un email finder. Total : ~270€/mois. Volia c'est les 4 dans une app à 179€/mois (MAX) — et 99€/mois les 3 premiers mois avec le code MAX99. Les données sont partagées en natif : un lead découvert en Prospection devient contact CRM dès qu'il répond à une campagne. Zéro export/import entre outils.",
  },
  {
    category: 'pricing',
    question: 'Je peux prendre que la Prospection ?',
    answer:
      "Oui. Le plan Prospection à 19€/mois, c'est la donnée : 500 crédits/mois, 500 téléphones, exports illimités, API publique — parfait si vous avez déjà Lemlist ou HubSpot. Les autres modules restent dispo gratuitement avec des limites, et MAX à 179€/mois passe toute la suite en illimité avec Autopilot.",
  },
  {
    category: 'product',
    question: 'La recherche en langage naturel, comment ça marche ?',
    answer:
      "Vous tapez en français : « restaurants haut de gamme à Paris et Lyon ». L'IA (Claude) traduit en catégories Google Places + départements, et lance la recherche. Aucune configuration manuelle.",
  },
];
