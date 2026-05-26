// Source unique des Q/R de la landing — partagée entre le client component
// (FAQSection accordion) et le serveur (JSON-LD FAQPage schema dans page.js).

export const FAQ_ITEMS = [
  {
    question: "Comment fonctionne Volia.fr ?",
    answer:
      "Volia utilise l'API Google Places pour identifier les entreprises correspondant a vos criteres (departement, categorie). Ensuite, notre systeme d'enrichissement en cascade scrape les sites web, pages contact et mentions legales pour extraire les emails professionnels. Tout est automatise : vous selectionnez vos cibles, on fait le reste.",
  },
  {
    question: "Les donnees sont-elles fiables ?",
    answer:
      "Les informations proviennent directement de Google Places (nom, adresse, telephone, site web, avis). Pour les emails, chaque adresse recoit un score de fiabilite : verification de domaine (100 pts), email contact@ (80 pts), email professionnel (60 pts), email generique (20 pts). Vous pouvez filtrer par niveau de confiance.",
  },
  {
    question: "Combien de prospects puis-je trouver ?",
    answer:
      "Cela depend du departement et de la categorie. En moyenne, une recherche retourne entre 20 et 60 prospects par combinaison departement/categorie. Pour une recherche sur l'Ile-de-France avec toutes les categories B2B, vous pouvez obtenir plusieurs centaines de leads qualifies.",
  },
  {
    question: "Comment fonctionne l'enrichissement email ?",
    answer:
      "Notre enrichissement en cascade (waterfall) combine plusieurs methodes : scraping intelligent du site web de l'entreprise, recherche Google pour identifier les emails publics, puis un fallback sur les patterns courants (contact@, info@). Le processus s'arrete des qu'un email est trouve et vous donne un score de confiance (verifie, probable, devine).",
  },
  {
    question: "Puis-je exporter vers mon CRM ?",
    answer:
      "Oui, l'export CSV standard est compatible avec tous les CRM (HubSpot, Salesforce, Zoho, Pipedrive, etc.) et tous les outils d'outreach (Lemlist, Apollo, Smartlead...). Vous pouvez aussi filtrer vos leads avant l'export pour n'obtenir que les prospects pertinents.",
  },
  {
    question: "Quelles sont les limites du plan gratuit ?",
    answer:
      "Le plan Starter (gratuit) vous offre 100 prospects, 20 enrichissements et 5 exports par mois pour decouvrir la plateforme. Pour passer a 1 000 prospects + 400 enrichissements, le plan Solo est a seulement 19€/mois — le ticket d'entree le moins cher du marche. Plans Pro (49€) et Business (99€) disponibles pour volumes plus eleves.",
  },
  {
    question: "Mes donnees sont-elles securisees ?",
    answer:
      "Absolument. Toutes vos donnees sont chiffrees au repos et en transit (TLS 1.2+). Nous sommes conformes au RGPD : vos leads vous appartiennent, vous pouvez les exporter ou les supprimer a tout moment depuis votre dashboard. Aucune donnee n'est revendue ni partagee a des tiers commerciaux.",
  },
  {
    question: "Puis-je annuler a tout moment ?",
    answer:
      "Oui, sans engagement. Vous pouvez annuler votre abonnement Pro ou Enterprise a tout moment depuis votre compte. Vos donnees et leads restent accessibles meme apres l'annulation, tant que votre compte existe.",
  },
  {
    question: "Quelle est la difference avec Apollo.io, Hunter ou Lusha ?",
    answer:
      "Apollo, Hunter et Lusha sont des bases de donnees d'enrichissement : vous devez deja avoir une liste de prospects a enrichir. Volia fait les DEUX en un : decouverte des prospects via Google Places (150+ categories, 101 departements francais) + enrichissement email automatique. A partir de 19€/mois avec Solo (vs 39€ Snov, 49€ Hunter, 99€ Apollo), c'est le ticket d'entree le moins cher du marche francais.",
  },
  {
    question: "Quelle difference avec HubSpot, Apollo ou Lemlist en tant que suite ?",
    answer:
      "HubSpot, Apollo et Lemlist sont 3 outils separes que la plupart des equipes B2B finissent par cumuler (~270€/mois total). Volia regroupe les 3 fonctions — Prospection (vs Apollo), Campagnes email (vs Lemlist), CRM pipeline (vs HubSpot) — dans une seule suite francaise a 99€/mois en plan Business. Les donnees sont partagees nativement : un lead trouve dans Prospection devient automatiquement un contact CRM des qu'il repond a une campagne. Aucun export/import CSV entre outils.",
  },
  {
    question: "Puis-je utiliser uniquement la Prospection sans Campagnes ni CRM ?",
    answer:
      "Oui. Le plan Solo a 19€/mois ne contient que le module Prospection — parfait si vous utilisez deja Lemlist ou HubSpot. En pratique, 90% de nos utilisateurs passent rapidement au plan Business pour avoir les 3 modules connectes, car le gain de temps (zero saisie manuelle entre les outils) compense largement les 80€ supplementaires.",
  },
  {
    question: "Comment fonctionne la recherche en langage naturel ?",
    answer:
      "Decrivez simplement ce que vous cherchez en francais, par exemple : \"je cherche des restaurants haut de gamme a Paris et Lyon\". Notre IA analyse votre requete, identifie les categories et departements correspondants, puis lance automatiquement la recherche. Pas besoin de configurer manuellement.",
  },
];
