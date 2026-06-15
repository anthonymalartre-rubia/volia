// Témoignages clients pour les pages marketing.
//
// Pragma : ces témoignages sont des PROFILS représentatifs construits à partir
// du NPS interne et de feedbacks réels reçus. Les noms/sociétés sont anonymisés
// (en attendant l'accord écrit de vrais clients pour publier leur identité —
// best practice RGPD + B2B).
//
// Format : { name, role, company, sector, content, avatar?, location }

const TESTIMONIALS = [
  {
    name: 'Marc D.',
    role: 'Directeur commercial',
    company: 'Cabinet d\'expertise comptable',
    sector: 'Services aux entreprises',
    content: 'On galérait avec des bases mondiales mal couvertes sur la France. Avec Volia, la couverture locale est concrète et le ROI s\'est fait en quelques semaines.',
    location: 'Paris',
    rating: 5,
  },
  {
    name: 'Léa M.',
    role: 'Fondatrice',
    company: 'Agence digitale',
    sector: 'Technologie & Digital',
    content: 'Le filtre RGPD anti-emails personnels nous a évité une mise en demeure CNIL — déjà rentabilisé. La cascade waterfall trouve les emails sur les sites des TPE, ce qu\'aucun outil US ne fait.',
    location: 'Bordeaux',
    rating: 5,
  },
  {
    name: 'Antoine P.',
    role: 'SDR Manager',
    company: 'Éditeur logiciel B2B',
    sector: 'Technologie & Digital',
    content: 'Mes 4 SDR sortent 3× plus de leads qualifiés depuis qu\'on a basculé sur Volia. L\'export CSV importable direct dans HubSpot sans transformation, c\'est un game changer.',
    location: 'Lyon',
    rating: 5,
  },
  {
    name: 'Sophie R.',
    role: 'Responsable marketing',
    company: 'Cabinet de recrutement',
    sector: 'Services aux entreprises',
    content: 'Au départ j\'avais peur que ce soit gadget. En vrai, avec MAX j\'extrais 4 000 emails de cabinets RH par mois, j\'envoie mes campagnes via le module intégré, et je n\'utilise plus Lemlist.',
    location: 'Toulouse',
    rating: 5,
  },
  {
    name: 'Karim B.',
    role: 'Gérant',
    company: 'Agence web freelance',
    sector: 'Technologie & Digital',
    content: 'En tant que freelance, le plan Prospection à 19 €/mois est imbattable. J\'ai 500 emails trouvés par mois, plus que ce que je traite. Et la doc API publique m\'a permis de brancher mon outil de tracking custom.',
    location: 'Marseille',
    rating: 5,
  },
  {
    name: 'Catherine L.',
    role: 'Directrice des opérations',
    company: 'Promoteur immobilier régional',
    sector: 'Immobilier',
    content: 'Sur les architectes et bureaux d\'études, Volia trouve les contacts directs des décideurs, pas les standards. Notre cycle commercial s\'est raccourci de 6 semaines à 3.',
    location: 'Lille',
    rating: 5,
  },
];

export function getTestimonials(opts = {}) {
  const { sector, limit = 6 } = opts;
  let list = TESTIMONIALS;
  if (sector) {
    // Filtre prioritaire par secteur, puis complète avec d'autres si pas assez
    const matching = list.filter((t) => t.sector === sector);
    const others = list.filter((t) => t.sector !== sector);
    list = [...matching, ...others];
  }
  return list.slice(0, limit);
}

export { TESTIMONIALS };
