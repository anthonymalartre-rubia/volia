// ─────────────────────────────────────────────────────────────────────
// src/lib/autopilot/templates.js — Volia Autopilot marketplace
// ─────────────────────────────────────────────────────────────────────
// Source unique de vérité des templates Phase 1.
// 12 templates au total : 5 génériques + 7 ciblés (designés via workflow
// multi-agents).
//
// Schema : { id, name, tagline, segment, icon, color, target, sequence,
//            form, routing, complexity, tier, expected }
//
// Au runtime, lorsqu'un user crée un workflow depuis un template, on copie
// le config dans autopilot_workflows.config. Les overrides utilisateur
// y vivent ensuite, le template reste intact pour les futurs users.
// ─────────────────────────────────────────────────────────────────────

const SHARED_DAYS = [0, 3, 7]; // J+0, J+3, J+7 (Phase 1 = sequence figée)

/**
 * Builder helper — réduit la verbosité des templates.
 * Tous les champs sont overridables par l'user dans le builder.
 */
function tpl({
  id,
  name,
  tagline,
  segment,
  icon = 'Zap',
  color = 'violet',
  target,
  sequence,
  form,
  routing,
  complexity = 'linéaire',
  tier = 'pro',
  expected,
  pre_existing = false,
}) {
  return {
    id,
    name,
    tagline,
    segment,
    icon,
    color,
    target,
    sequence,
    form,
    routing,
    complexity,
    tier,
    expected,
    pre_existing,
  };
}

// ─── 5 TEMPLATES PRÉ-EXISTANTS (les classiques V1) ──────────────────

const COLD_PROVOCATEUR = tpl({
  id: 'cold_b2b_provocateur',
  name: 'Cold B2B provocateur',
  tagline: 'Ton agressif factuel — démolit les mythes du marché. Pour agences et consultants qui osent.',
  segment: 'Agences, consultants génériques',
  icon: 'Flame',
  color: 'red',
  pre_existing: true,
  target: {
    categories: ['marketing agency', 'consulting firm', 'web design company'],
    departments_strategy: 'France entière, top métropoles prioritaires',
    company_size: 'TPE 2-10 et PME 11-50',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, on parle vrai 30 secondes ?', body_summary: 'Accroche démolition mythe + chiffre concret + pitch one-liner + CTA Cal.com', includes_form_link: false, includes_calcom: true },
    { day: 3, subject: 'Pas convaincu ? Normal. Form 2 min', body_summary: 'Reconnaissance + reframe + lien form qualif honnête', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Dernier mail, on enterre ou on tente ?', body_summary: 'Cash + mini cas client + 2 options + sortie élégante + RGPD', includes_form_link: true, includes_calcom: true },
  ],
  form: {
    title: 'Volia te correspond ? 2 min pour savoir',
    questions: [
      { label: 'Combien de clients vous prospectez par mois ?', type: 'select', options: ['< 10', '10-50', '50-200', '200+'] },
      { label: 'Quel est votre principal blocage ?', type: 'select', options: ['Pas de leads qualifiés', 'Trop de temps perdu', 'Outils trop chers', 'Autre'] },
      { label: 'Quand voulez-vous démarrer ?', type: 'select', options: ['Cette semaine', 'Ce mois', 'Trimestre prochain', 'Juste curieux'] },
    ],
    scoring: 'Volume >= 50 = +30. Démarrage cette semaine = +30. Blocage = +20 (sauf curieux = +5).',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Hot" + tag urgence',
    warm: 'Score 40-69 → CRM "Warm" + drip 6 sem',
    cold: 'Score < 40 ou pas de form → CRM "Cold" + relance J+90',
  },
  expected: { open: 38, form: 9, hot: 42 },
});

const COLD_SYMPATHIQUE = tpl({
  id: 'cold_b2b_sympathique',
  name: 'Cold B2B sympathique',
  tagline: 'Ton chaleureux et humain. Pour indépendants et solo founders qui préfèrent la subtilité.',
  segment: 'Freelances, indépendants',
  icon: 'Heart',
  color: 'pink',
  pre_existing: true,
  target: {
    categories: ['consulting firm', 'marketing agency', 'photographer', 'graphic designer'],
    departments_strategy: 'France entière',
    company_size: 'Solo et TPE 2-5',
  },
  sequence: [
    { day: 0, subject: 'Salut {{first_name}}, j\'ai vu {{company}}', body_summary: 'Accroche personnalisée chaleureuse + curiosité + pitch soft + CTA réponse', includes_form_link: false, includes_calcom: false },
    { day: 3, subject: 'Re: {{company}} — juste 2 questions', body_summary: 'Relance douce + form 3 questions courtes + bénéfice pour le user', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Dernier mail promis 🙏', body_summary: 'Reconnaissance silence + soft CTA Cal.com + sortie polite', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: '2 minutes pour mieux te connaître',
    questions: [
      { label: 'Tu es seul ou en équipe ?', type: 'select', options: ['Solo', '2-5', '6+'] },
      { label: 'Tu fais quoi exactement ?', type: 'short_text' },
      { label: 'Qu\'est-ce qui te prend le plus de temps actuellement ?', type: 'long_text' },
    ],
    scoring: 'Long_text rempli = +30. Équipe 2-5 = +20. Solo avec activité claire = +25.',
  },
  routing: {
    hot: 'Score >= 60 + form rempli → CRM "Hot" + reply perso 24h',
    warm: 'Form partiel → CRM "Warm" + email de valeur dans 7j',
    cold: 'Pas de réponse → CRM "Cold" + archive 6 mois',
  },
  expected: { open: 42, form: 11, hot: 38 },
});

const WEBINAR_REGISTER = tpl({
  id: 'webinar_drive_to_register',
  name: 'Webinar — Drive to register',
  tagline: 'Remplis ton webinar B2B en 21 jours avec des inscrits qualifiés (pas des no-shows).',
  segment: 'Event marketing, lancement produit',
  icon: 'Video',
  color: 'indigo',
  pre_existing: true,
  target: {
    categories: ['marketing agency', 'software company', 'consulting firm'],
    departments_strategy: 'France entière, focus métropoles',
    company_size: 'TPE/PME 2-50',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, webinar le {{event_date}} — vous venez ?', body_summary: 'Invitation directe + topic + speaker + lien inscription', includes_form_link: true, includes_calcom: false },
    { day: 3, subject: 'Plus que 2 sem — programme du webinar', body_summary: 'Détail programme + bénéfices clés + témoignage + lien inscription', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Demain — derniers inscrits', body_summary: 'Urgence + récap topics + lien direct + replay sera envoyé', includes_form_link: true, includes_calcom: false },
  ],
  form: {
    title: 'Inscription webinar — {{event_topic}}',
    questions: [
      { label: 'Email pro', type: 'email' },
      { label: 'Société', type: 'short_text' },
      { label: 'Quelle est votre principale attente du webinar ?', type: 'long_text' },
    ],
    scoring: 'Email pro fourni = +50. Société remplie = +30. Attente détaillée = +20.',
  },
  routing: {
    hot: 'Inscrit + attente détaillée → CRM "Hot" + invitation Q&A perso',
    warm: 'Inscrit seul → CRM "Warm" + replay envoyé',
    cold: 'Pas inscrit → CRM "Cold" + re-tentative prochain webinar',
  },
  expected: { open: 45, form: 18, hot: 35 },
});

const REACTIVATION_COLD = tpl({
  id: 'reactivation_cold_leads',
  name: 'Reactivation cold leads',
  tagline: 'Réveille ta base CRM dormante. Détecte qui est encore intéressé et qui peut être archivé.',
  segment: 'Base CRM existante',
  icon: 'RefreshCw',
  color: 'amber',
  pre_existing: true,
  target: {
    categories: ['existing_crm_cold'],
    departments_strategy: 'Pas de scraping — utilise prospects CRM existants',
    company_size: 'Tous',
  },
  sequence: [
    { day: 0, subject: 'On reprend contact, {{first_name}} ?', body_summary: 'Reconnaissance ancienneté + reframe nouveauté + soft CTA', includes_form_link: false, includes_calcom: false },
    { day: 3, subject: 'Quick update sur {{your_product}}', body_summary: 'Récap 3 features ajoutées + cas client + lien form rapide', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Dernier coup de fil avant archive', body_summary: 'Cash transparency + 1 question oui/non + sortie élégante', includes_form_link: true, includes_calcom: false },
  ],
  form: {
    title: 'On reste en contact ?',
    questions: [
      { label: 'Êtes-vous toujours intéressé par {{your_product}} ?', type: 'select', options: ['Oui activement', 'Plus tard', 'Pas pour le moment', 'Désinscription'] },
      { label: 'Si oui, quel est votre timing ?', type: 'select', options: ['Maintenant', '3 mois', '6 mois', '+1 an'] },
    ],
    scoring: 'Oui activement + maintenant = +80. Oui + 3 mois = +60. Plus tard = +30. Non = -50.',
  },
  routing: {
    hot: 'Score >= 60 → CRM "Hot" + relance perso',
    warm: 'Score 30-59 → CRM "Warm" + drip mensuel',
    cold: 'Score < 30 ou désinscription → Archive + opt-out',
  },
  expected: { open: 28, form: 22, hot: 25 },
});

const DEMO_BOOKING = tpl({
  id: 'demo_booking_funnel',
  name: 'Demo booking funnel',
  tagline: 'Push direct vers Cal.com avec qualification rapide. Pour SaaS B2B qui veulent du volume de démos.',
  segment: 'SaaS B2B mid-market',
  icon: 'Calendar',
  color: 'blue',
  pre_existing: true,
  target: {
    categories: ['software company', 'tech startup'],
    departments_strategy: 'Top métropoles tech (75, 92, 69, 13, 33)',
    company_size: 'PME 11-50 et 51-250',
  },
  sequence: [
    { day: 0, subject: '15 min pour voir si {{your_product}} matche {{company}} ?', body_summary: 'Hyper-personnalisation société + pitch direct + lien Cal.com', includes_form_link: false, includes_calcom: true },
    { day: 3, subject: 'Pas sûr ? 3 questions rapides', body_summary: 'Reframe + form qualif court + double CTA (form ou call)', includes_form_link: true, includes_calcom: true },
    { day: 7, subject: 'Dernier mail — book ou archive', body_summary: 'Cash transparency + récap valeur + Cal.com final', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Qualification rapide — 90 sec',
    questions: [
      { label: 'Taille équipe ?', type: 'select', options: ['1-10', '11-50', '51-250', '250+'] },
      { label: 'Rôle ?', type: 'select', options: ['CEO/Fondateur', 'CTO/DSI', 'CMO/Marketing', 'Sales/Ops'] },
      { label: 'Budget mensuel outils SaaS ?', type: 'select', options: ['< 200€', '200-500€', '500-2000€', '2000€+'] },
    ],
    scoring: 'PME 11-250 + décideur + budget 500-2000€ = score 80+. CEO/CTO décideur = bonus +20.',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Hot" + Cal.com prio + coupon HOTLEAD50',
    warm: 'Score 40-69 → CRM "Warm" + nurture',
    cold: 'Score < 40 → CRM "Cold"',
  },
  expected: { open: 35, form: 12, hot: 45 },
});

// ─── 7 TEMPLATES NOUVEAUX (designés via workflow multi-agents) ──────

const AGENCES_DIGITALES = tpl({
  id: 'agences_digitales_pipeline_outbound',
  name: '🏆 Agences digitales — Pipeline outbound',
  tagline: 'Remplis le pipeline de ton agence sans dépendre du bouche-à-oreille. 2-4 clients/mois en autopilot.',
  segment: 'Agences marketing/web/com 2-10 personnes',
  icon: 'Briefcase',
  color: 'violet',
  target: {
    categories: ['marketing agency', 'advertising agency', 'web design company', 'graphic designer', 'public relations firm'],
    departments_strategy: 'Top 10 métropoles France (75, 69, 13, 33, 31, 44, 59, 35, 67, 06)',
    company_size: 'TPE 2-10 (dirigeants impliqués commercial)',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, votre agence prend encore des clients ?', body_summary: 'Accroche perso + pain bouche-à-oreille + pitch outbound + CTA form', includes_form_link: true, includes_calcom: false },
    { day: 3, subject: 'Le bouche-à-oreille c\'est cool, jusqu\'à ce que…', body_summary: 'Reconnaissance + reframe + mini cas client agence + form', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Dernier mail — on parle ou on archive ?', body_summary: 'Cash transparency + 2 options (Cal.com ou form) + RGPD', includes_form_link: true, includes_calcom: true },
  ],
  form: {
    title: 'Volia matche votre agence ?',
    questions: [
      { label: 'Combien de clients actuellement ?', type: 'select', options: ['1-5', '6-15', '16-30', '30+'] },
      { label: 'Combien de nouveaux clients/mois ?', type: 'select', options: ['0-1', '2-4', '5-10', '10+'] },
      { label: 'Budget mensuel outils prospection ?', type: 'select', options: ['0€', '< 100€', '100-300€', '300€+'] },
    ],
    scoring: '6-30 clients + 2-4 nouveaux/mois + budget existant = score 70-80.',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Hot" + démo perso 30 min',
    warm: 'Score 40-69 → CRM "Warm" + drip 4 sem cas clients agences',
    cold: 'Score < 40 → Archive 6 mois',
  },
  expected: { open: 38, form: 9, hot: 42 },
});

const FREELANCES = tpl({
  id: 'freelance_flux_continu',
  name: '🥈 Freelances Autopilot — Flux continu',
  tagline: 'Arrête de prier le bouche-à-oreille. Volia te ramène 3-5 RDV qualifiés/mois pendant que tu factures.',
  segment: 'Freelances indépendants Solo',
  icon: 'User',
  color: 'emerald',
  target: {
    categories: ['consultant', 'freelance', 'graphic designer', 'photographer', 'software developer'],
    departments_strategy: 'France entière',
    company_size: 'Solo uniquement',
  },
  sequence: [
    { day: 0, subject: 'Salut {{first_name}}, freelance toi aussi ?', body_summary: 'Tutoiement direct + pain solo (pas le temps de prospecter) + soft pitch + CTA', includes_form_link: true, includes_calcom: false },
    { day: 3, subject: 'Re: le truc le plus chiant quand tu factures', body_summary: 'Empathie + reframe (Volia bosse pendant que tu factures) + lien form', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'OK je te lâche — sauf si...', body_summary: 'Sortie polie + CTA Cal.com final + RGPD', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Toi en freelance — 2 min',
    questions: [
      { label: 'Tu factures combien par mois en ce moment ?', type: 'select', options: ['< 3k€', '3-6k€', '6-10k€', '10k€+'] },
      { label: 'D\'où viennent tes clients aujourd\'hui ?', type: 'multiselect', options: ['Bouche-à-oreille', 'LinkedIn', 'Plateforme freelance', 'Cold outbound', 'Autre'] },
      { label: 'Tu cherches à scaler ou maintenir ?', type: 'select', options: ['Scaler 2x', 'Maintenir', 'Diversifier']  },
    ],
    scoring: 'Facturation 3-10k€ + bouche-à-oreille principal + scaler = score 75+. Tutoiement OK pour ce segment.',
  },
  routing: {
    hot: 'Score >= 70 + scaler → CRM "Hot" + RDV perso 15 min',
    warm: 'Score 40-69 → CRM "Warm" + newsletter freelances',
    cold: 'Score < 40 → Archive',
  },
  expected: { open: 38, form: 9, hot: 35 },
});

const SAAS_B2B_PME = tpl({
  id: 'saas_b2b_demo_booking_pme',
  name: '🥉 SaaS B2B → Demo booking PME',
  tagline: 'Le pipeline cold email → demo booking calibré pour founders SaaS B2B fatigués de chasser à la main.',
  segment: 'Founders SaaS vendant aux PME',
  icon: 'Rocket',
  color: 'cyan',
  target: {
    categories: ['software company', 'marketing agency', 'consulting firm', 'accounting firm', 'law firm'],
    departments_strategy: 'Top 12 métropoles tech FR (75, 92, 69, 13, 33, 31, 59, 44, 67, 35, 06, 38)',
    company_size: 'PME 11-50 prio, 51-250 ok',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, votre tunnel demo convertit à combien ?', body_summary: 'Accroche perso + chiffre sec marché + pitch one-liner + Cal.com (chauds direct)', includes_form_link: false, includes_calcom: true },
    { day: 3, subject: 'Pas sûr que ce soit pour vous — 3 questions', body_summary: 'Reconnaissance + twist honnête + form 5 questions + coupon HOTLEAD50 si hot', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Dernier message — on archive ou on parle ?', body_summary: 'Cash + cas client SaaS + 2 options + coupon -50% si signature 7j + RGPD', includes_form_link: true, includes_calcom: true },
  ],
  form: {
    title: '2 min pour voir si on peut vraiment vous aider',
    questions: [
      { label: 'Combien d\'employés dans votre entreprise ?', type: 'select', options: ['1-10', '11-50', '51-250', '250+'] },
      { label: 'Quel est votre rôle ?', type: 'select', options: ['CEO/Fondateur', 'DSI/CTO', 'CMO/Marketing', 'COO/Ops', 'Manager', 'Autre'] },
      { label: 'Budget mensuel SaaS B2B actuel ?', type: 'select', options: ['< 200€', '200-500€', '500-2000€', '2000€+', 'Je ne sais pas'] },
      { label: 'Timing achat ?', type: 'select', options: ['< 1 mois', '1-3 mois', '6 mois', 'Veille'] },
      { label: 'Principal blocage prospection actuelle ?', type: 'long_text' },
    ],
    scoring: 'Taille (11-50=25, 51-250=30). Rôle décideur (CEO/DSI/CMO/COO)=25. Budget 500-2000€=25. Timing <1m=25. Total/100.',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Hot" + tag demo_ready + Slack notif + coupon HOTLEAD50',
    warm: 'Score 40-69 → CRM "Warm" + nurture trimestriel',
    cold: 'Score < 40 ou pas form J+10 → CRM "Cold" park 6m',
  },
  expected: { open: 38, form: 9, hot: 42 },
});

const FORMATEURS_B2B = tpl({
  id: 'formation_b2b_rentree_pipeline',
  name: '🎓 Formateurs B2B — Pipeline rentrée',
  tagline: 'Remplis ton agenda de septembre dès juin, sans cold call. OPCO friendly.',
  segment: 'Organismes de formation, coachs business',
  icon: 'GraduationCap',
  color: 'amber',
  target: {
    categories: ['training school', 'business coach', 'language school', 'professional services'],
    departments_strategy: 'France entière, focus zones high-density entreprises',
    company_size: 'TPE/PME 2-50 (RH ou direction)',
  },
  sequence: [
    { day: 0, subject: 'Vos formations rentrée 2026 — programme prêt ?', body_summary: 'Accroche saisonnalité + pain remplissage agenda + pitch lead generation + CTA', includes_form_link: true, includes_calcom: false },
    { day: 3, subject: 'Budget OPCO 2026 — vous l\'avez débloqué ?', body_summary: 'Reframe OPCO + form rapide budget/timing + bénéfice anticipation', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Septembre approche — dernier mail', body_summary: 'Urgence + récap + Cal.com 15 min', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Vos besoins formation rentrée 2026',
    questions: [
      { label: 'Quel type de formation cherchez-vous ?', type: 'short_text' },
      { label: 'Combien de collaborateurs concernés ?', type: 'select', options: ['1-3', '4-10', '11-25', '25+'] },
      { label: 'Budget OPCO mobilisé ?', type: 'select', options: ['Oui validé', 'En cours validation', 'Pas encore', 'Pas OPCO'] },
      { label: 'Démarrage souhaité ?', type: 'select', options: ['Septembre', 'Octobre', 'Q4 2026', '2027'] },
    ],
    scoring: 'Budget OPCO validé + 4+ collaborateurs + démarrage <3 mois = score 80. OPCO en cours = +50.',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Hot" + envoi catalogue perso',
    warm: 'Score 40-69 → CRM "Warm" + relance août',
    cold: 'Score < 40 → Archive 12 mois (prochaine campagne septembre 2027)',
  },
  expected: { open: 38, form: 9, hot: 35 },
});

const FOURNISSEUR_RETAILER = tpl({
  id: 'b2b_ecom_retailer_acquisition',
  name: '🛒 Fournisseur B2B → Retailers',
  tagline: 'Remplis ton pipeline de revendeurs physiques sans démarcher 8h/jour. Volume Google Places.',
  segment: 'Fournisseurs vendant aux boutiques indé',
  icon: 'Store',
  color: 'orange',
  tier: 'business',
  target: {
    categories: ['boutique', 'concept store', 'specialty store', 'gift shop', 'home goods store'],
    departments_strategy: 'France entière (volume massif via Places)',
    company_size: 'TPE 2-10 (boutiques indé)',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, votre boutique recherche de nouvelles marques ?', body_summary: 'Accroche locale + pitch fournisseur + différenciation + catalogue PDF', includes_form_link: false, includes_calcom: false },
    { day: 3, subject: 'Re: nouvelles marques — exclu région {{region}}', body_summary: 'Reframe exclusivité géo + form qualif rapide + visite commercial', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Dernier mail — RDV ou catalogue ?', body_summary: 'Cash + 2 options claires + Cal.com call commercial', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Votre boutique — 90 sec',
    questions: [
      { label: 'Surface de vente ?', type: 'select', options: ['< 50m²', '50-150m²', '150m²+'] },
      { label: 'Combien de marques distribuées ?', type: 'select', options: ['< 10', '10-30', '30-100', '100+'] },
      { label: 'CA mensuel approximatif ?', type: 'select', options: ['< 10k€', '10-30k€', '30-100k€', '100k€+'] },
      { label: 'Vous cherchez de nouvelles marques activement ?', type: 'select', options: ['Oui activement', 'Au cas par cas', 'Non actuellement'] },
    ],
    scoring: 'Surface 50m²+ + 30+ marques + CA 30k€+ + recherche active = score 80. Boutique mature.',
  },
  routing: {
    hot: 'Score >= 70 + recherche active → CRM "Hot" + visite commercial sous 7j',
    warm: 'Score 40-69 → CRM "Warm" + catalogue + drip',
    cold: 'Score < 40 → Archive',
  },
  expected: { open: 38, form: 8, hot: 35 },
});

const CONSULTING_NURTURE = tpl({
  id: 'consulting_long_cycle_nurture',
  name: '💼 Cabinets conseil — Nurture long',
  tagline: 'Pipeline outbound automatisé pour cabinets conseil : qualifie avant le RDV, ferme plus vite.',
  segment: 'Cabinets conseil 5-30 personnes (RH, stratégie, IT)',
  icon: 'Building2',
  color: 'slate',
  tier: 'business',
  complexity: 'avec_branching',
  target: {
    categories: ['consulting firm', 'management consultant', 'business consultant', 'IT consultant'],
    departments_strategy: 'Top métropoles business (75, 92, 69, 13, 33)',
    company_size: 'PME 5-30 (cabinets), prospects PME/ETI 50-250',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, transformation {{vertical}} chez {{company}} ?', body_summary: 'Hyper-personnalisation + insight industrie + pitch consultant + CTA réponse', includes_form_link: false, includes_calcom: false },
    { day: 3, subject: '3 leviers que vos pairs activent en 2026', body_summary: 'Valeur pure (pas pitch) + benchmark sectoriel + lien form qualif', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Dernier mail — call ou archive ?', body_summary: 'Cash + cas client cabinet conseil + 2 options', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Qualification cabinet conseil',
    questions: [
      { label: 'Taille équipe ?', type: 'select', options: ['Solo', '2-5', '6-15', '16-30', '30+'] },
      { label: 'Type de prestations ?', type: 'multiselect', options: ['Stratégie', 'RH/Transformation', 'IT/Tech', 'Finance', 'Marketing', 'Autre'] },
      { label: 'Ticket moyen mission ?', type: 'select', options: ['< 5k€', '5-25k€', '25-100k€', '100k€+'] },
      { label: 'Combien de nouveaux clients/an ?', type: 'select', options: ['< 5', '5-15', '15-30', '30+'] },
    ],
    scoring: 'Équipe 6-30 + ticket 25k€+ + 5-15 clients/an = score 80. Sweet spot Business.',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Hot" + Cal.com prio + email enrichi cas client précis',
    warm: 'Score 40-69 → CRM "Warm" + drip mensuel valeur',
    cold: 'Score < 40 → Archive 6m',
  },
  expected: { open: 38, form: 9, hot: 35 },
});

const RECRUTEMENT = tpl({
  id: 'recruitment_agency_dual_pipeline',
  name: '🎯 Cabinets recrutement — Pipeline clients',
  tagline: 'Remplis ton pipeline de mandats avant que tes concurrents appellent les mêmes DRH.',
  segment: 'Cabinets recrutement spécialisés (tech/sales/finance)',
  icon: 'Users',
  color: 'fuchsia',
  target: {
    categories: ['recruitment agency', 'staffing agency', 'executive search', 'HR consulting'],
    departments_strategy: 'Métropoles business + zones industrielles',
    company_size: 'Cabinets 2-20 personnes ciblant PME/ETI 50-500',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, vos prochains mandats {{vertical}} ?', body_summary: 'Accroche signal LinkedIn jobs actifs + pitch sourcing automatisé + CTA', includes_form_link: false, includes_calcom: false },
    { day: 3, subject: 'Vos concurrents appellent les mêmes DRH', body_summary: 'Urgence + reframe avantage timing + form qualif mandat', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Dernier mail — on tente ?', body_summary: 'Cash + cas client cabinet recrutement + Cal.com 20 min', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Vos mandats actuels — 2 min',
    questions: [
      { label: 'Spécialité principale ?', type: 'select', options: ['Tech/IT', 'Sales/BD', 'Finance', 'RH', 'Direction', 'Multi'] },
      { label: 'Combien de mandats actifs ?', type: 'select', options: ['< 5', '5-15', '15-30', '30+'] },
      { label: 'Honoraires moyens placement ?', type: 'select', options: ['< 5k€', '5-15k€', '15-30k€', '30k€+'] },
      { label: 'Vous cherchez plus de clients ou plus de candidats ?', type: 'select', options: ['Clients (entreprises)', 'Candidats', 'Les deux'] },
    ],
    scoring: 'Honoraires 15-30k€+ + 5-15 mandats + cherche clients = score 80. Volia = pipeline clients.',
  },
  routing: {
    hot: 'Score >= 70 + cherche clients → CRM "Hot" + Cal.com 20 min',
    warm: 'Score 40-69 → CRM "Warm" + drip mensuel cas clients cabinets',
    cold: 'Score < 40 → Archive',
  },
  expected: { open: 38, form: 9, hot: 35 },
});

// ─── EXPORT FINAL : 12 templates ────────────────────────────────────

export const AUTOPILOT_TEMPLATES = [
  // 5 pré-existants
  COLD_PROVOCATEUR,
  COLD_SYMPATHIQUE,
  WEBINAR_REGISTER,
  REACTIVATION_COLD,
  DEMO_BOOKING,
  // 7 nouveaux (designés via workflow multi-agents)
  AGENCES_DIGITALES,
  FREELANCES,
  SAAS_B2B_PME,
  FORMATEURS_B2B,
  FOURNISSEUR_RETAILER,
  CONSULTING_NURTURE,
  RECRUTEMENT,
];

export function getTemplate(id) {
  return AUTOPILOT_TEMPLATES.find((t) => t.id === id) || null;
}

export function getTemplatesByTier(tier) {
  // Tier ordering : pro < business < enterprise
  const order = { pro: 1, business: 2, enterprise: 3 };
  const userOrder = order[tier] || 0;
  return AUTOPILOT_TEMPLATES.filter((t) => (order[t.tier] || 1) <= userOrder);
}
