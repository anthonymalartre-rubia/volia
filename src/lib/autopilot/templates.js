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

// ─── 5 TEMPLATES VERTICAUX (sectorielles spécifiques) ──────────────

const IMMOBILIER_PARTENAIRES = tpl({
  id: 'immobilier_b2b_partenaires',
  name: '🏠 Immobilier — Réseau partenaires B2B',
  tagline: 'Connecte agences immo avec notaires, courtiers, home stagers, diagnostiqueurs. Réseau récurrent = mandats récurrents.',
  segment: 'Agences immobilières, mandataires, syndics',
  icon: 'Briefcase',
  color: 'sky',
  target: {
    categories: ['real estate agency', 'notary', 'property management company', 'home stager', 'real estate appraiser', 'mortgage broker'],
    departments_strategy: 'Toutes métropoles + zones péri-urbaines (forte densité transactions)',
    company_size: 'TPE 2-15 (agences indé) + structures 15-50',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, votre réseau de partenaires B2B est complet ?', body_summary: 'Accroche : pain trouver bons partenaires fiables + pitch Volia comme dénicheur de partenaires qualifiés + CTA form', includes_form_link: true, includes_calcom: false },
    { day: 3, subject: '{{company}} + 5 partenaires complémentaires en 2 sem', body_summary: 'Reframe + exemple concret de mise en relation + form qualif besoin partenaires + bénéfice volume mandats', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'On en parle ? Sinon on archive', body_summary: 'Cash transparency + cas client agence + Cal.com 15 min commercial spécialisé immo', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Votre réseau de partenaires — 2 min',
    questions: [
      { label: 'Quel type d\'agence ?', type: 'select', options: ['Transaction', 'Location', 'Gestion locative', 'Syndic', 'Multi-activités'] },
      { label: 'Combien de transactions/mois ?', type: 'select', options: ['< 5', '5-15', '15-30', '30+'] },
      { label: 'Quels partenaires vous manquent ?', type: 'multiselect', options: ['Notaire', 'Courtier', 'Diagnostiqueur', 'Home stager', 'Photographe', 'Travaux', 'Autre'] },
      { label: 'Démarrage souhaité ?', type: 'select', options: ['Cette semaine', 'Ce mois', 'Trimestre prochain', 'Veille'] },
    ],
    scoring: 'Transaction/Location + 15+ transactions/mois + 2+ partenaires manquants + démarrage <1m = score 80+.',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Hot" + démo perso + sélection partenaires curated',
    warm: 'Score 40-69 → CRM "Warm" + drip mensuel cas clients immo',
    cold: 'Score < 40 → Archive 6 mois (relance rentrée immo septembre)',
  },
  expected: { open: 36, form: 11, hot: 38 },
});

const RESTAURATEURS_FOURNISSEURS = tpl({
  id: 'restaurateurs_fournisseurs_b2b',
  name: '🍽️ Restaurants — Fournisseurs B2B qualifiés',
  tagline: 'Restaurants cherchent fournisseurs frais, boissons, software résa. Connecte-les sans démarcher 1 par 1.',
  segment: 'Restaurants indé, bistrots, brasseries',
  icon: 'Store',
  color: 'orange',
  target: {
    categories: ['restaurant', 'bistro', 'brasserie', 'pizzeria', 'gastropub', 'cafe', 'wine bar'],
    departments_strategy: 'Métropoles + zones touristiques saisonnières',
    company_size: 'TPE 2-15 (équipe restau standard)',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, vos fournisseurs actuels vous conviennent ?', body_summary: 'Accroche pain quotidien restaurateur + pitch Volia comme passerelle vers fournisseurs vérifiés + CTA form rapide', includes_form_link: true, includes_calcom: false },
    { day: 3, subject: 'Frais, boissons, soft résa — 3 alternatives à découvrir', body_summary: 'Empathie marges serrées + exemples concrets de fournisseurs partenaires + form besoins + RGPD restaurateurs', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Promis dernier mail — fournisseur ou pas ?', body_summary: 'Direct + 2 options (Cal.com avec commercial ou form 90 sec) + sortie polie', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Vos besoins fournisseurs — 90 sec',
    questions: [
      { label: 'Type d\'établissement ?', type: 'select', options: ['Restaurant traditionnel', 'Bistrot', 'Brasserie', 'Pizzeria', 'Café/Bar', 'Autre'] },
      { label: 'Nombre de couverts/jour ?', type: 'select', options: ['< 30', '30-80', '80-150', '150+'] },
      { label: 'Quels types de fournisseurs cherchez-vous ?', type: 'multiselect', options: ['Frais (boucher, primeur)', 'Boissons (vin, bières)', 'Soft résa', 'Caisse/POS', 'Équipement cuisine', 'Hygiène'] },
      { label: 'Démarrage ?', type: 'select', options: ['Urgent', '1 mois', '3 mois', 'Veille'] },
    ],
    scoring: '80+ couverts/jour + 2+ types fournisseurs cherchés + démarrage urgent = score 80.',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Hot" + commercial spécialisé food appelle dans 48h',
    warm: 'Score 40-69 → CRM "Warm" + catalogue fournisseurs + drip',
    cold: 'Score < 40 → Archive',
  },
  expected: { open: 34, form: 10, hot: 38 },
});

const SANTE_PARAMEDICAL = tpl({
  id: 'sante_paramedical_b2b',
  name: '⚕️ Santé & paramédical — Équipement & soft B2B',
  tagline: 'Cabinets médicaux, kinés, dentistes, labos : équipement, software, formation. Marché stable, gros tickets.',
  segment: 'Professionnels de santé indé et cabinets',
  icon: 'Heart',
  color: 'rose',
  tier: 'business',
  target: {
    categories: ['medical clinic', 'dental clinic', 'physical therapist', 'osteopath', 'medical laboratory', 'pharmacy', 'optician', 'veterinary clinic'],
    departments_strategy: 'France entière (cabinets répartis uniformément)',
    company_size: 'Cabinet indé 1-5 + cabinets pluridisciplinaires 6-30',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, votre cabinet équipé pour 2026 ?', body_summary: 'Accroche neutralité + pitch équipement/soft santé moderne + bénéfice patient + CTA form RGPD-friendly', includes_form_link: true, includes_calcom: false },
    { day: 3, subject: 'Vos consoeurs équipent leur cabinet — voici comment', body_summary: 'Social proof discret + reframe (gain temps soins) + form besoins + mention agrément', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'On boucle ce sujet — RDV ou non ?', body_summary: 'Cash + 2 options + Cal.com avec spécialiste santé + RGPD strict mention', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Votre cabinet — 2 min',
    questions: [
      { label: 'Spécialité ?', type: 'select', options: ['Médecin', 'Kiné', 'Dentiste', 'Ostéo', 'Labo', 'Pharmacie', 'Optique', 'Vétérinaire', 'Autre'] },
      { label: 'Mode d\'exercice ?', type: 'select', options: ['Indépendant solo', 'Cabinet groupe', 'Clinique', 'Hôpital'] },
      { label: 'Besoin principal ?', type: 'multiselect', options: ['Équipement médical', 'Logiciel cabinet', 'Téléconsult', 'Formation continue', 'Mobilier ergo'] },
      { label: 'Budget annuel équipement ?', type: 'select', options: ['< 5k€', '5-20k€', '20-50k€', '50k€+'] },
    ],
    scoring: 'Cabinet groupe + besoin équipement/logiciel + budget 20k€+ = score 80.',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Hot" + commercial certifié santé + démo agréée',
    warm: 'Score 40-69 → CRM "Warm" + catalogue + invitation salon santé',
    cold: 'Score < 40 → Archive 12 mois (cycle long secteur)',
  },
  expected: { open: 32, form: 12, hot: 32 },
});

const AUTOMOBILE_B2B = tpl({
  id: 'automobile_b2b',
  name: '🚗 Auto — Garages & concessions fournisseurs',
  tagline: 'Garages indé, carrosseries, concessions : pièces, logiciels DMS, formation tech. Tickets B2B récurrents.',
  segment: 'Garages, carrosseries, concessions multimarques',
  icon: 'Briefcase',
  color: 'slate',
  target: {
    categories: ['auto repair shop', 'car dealership', 'auto body shop', 'tire shop', 'auto parts store', 'motorcycle dealer'],
    departments_strategy: 'France entière (forte densité périurbaine)',
    company_size: 'TPE 2-10 (garages) + 11-50 (concessions)',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, votre garage tient encore au DMS papier ?', body_summary: 'Accroche moderne vs ancien + pitch software/équipement garage + ROI mesurable + CTA', includes_form_link: true, includes_calcom: false },
    { day: 3, subject: 'Comment vos confrères gèrent stock + RDV', body_summary: 'Social proof confrères + reframe gains organisation + form besoins + bénéfice client final', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Dernier mail — modernisation ou statu quo ?', body_summary: 'Cash + Cal.com avec tech expert garage + RGPD', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Votre garage — 2 min',
    questions: [
      { label: 'Type d\'activité ?', type: 'select', options: ['Garage généraliste', 'Carrosserie', 'Concession marque', 'Pneus/pièces', 'Moto', 'Multi'] },
      { label: 'Nombre de ponts/baies ?', type: 'select', options: ['1-2', '3-5', '6-10', '10+'] },
      { label: 'Besoin principal ?', type: 'multiselect', options: ['Logiciel DMS/RDV', 'Outillage', 'Pièces détachées', 'Formation tech', 'Site web/SEO local'] },
      { label: 'CA annuel approximatif ?', type: 'select', options: ['< 200k€', '200-500k€', '500k-1M€', '1M€+'] },
    ],
    scoring: '3+ ponts + besoin DMS/pièces + CA 200k€+ = score 80.',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Hot" + démo logiciel garage + offre installation gratuite',
    warm: 'Score 40-69 → CRM "Warm" + catalogue pièces + drip',
    cold: 'Score < 40 → Archive 6 mois',
  },
  expected: { open: 30, form: 9, hot: 35 },
});

const BTP_ARTISANS = tpl({
  id: 'btp_artisans_partenaires',
  name: '🔨 BTP — Artisans, maîtrise d\'œuvre, fournisseurs',
  tagline: 'Met en relation artisans (plombiers, électriciens, maçons) avec maîtres d\'œuvre, archis, fournisseurs gros œuvre.',
  segment: 'Artisans BTP + entreprises générales bâtiment',
  icon: 'Building2',
  color: 'amber',
  target: {
    categories: ['plumber', 'electrician', 'carpenter', 'mason', 'painting contractor', 'roofing contractor', 'general contractor', 'architect'],
    departments_strategy: 'France entière (zones travaux et péri-urbain prioritaires)',
    company_size: 'TPE 2-10 (artisans) + PME 11-50 (entreprises générales)',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, votre carnet de commandes est plein pour 2026 ?', body_summary: 'Accroche pain artisan (creux activité) + pitch mise en relation chantiers + CTA form', includes_form_link: true, includes_calcom: false },
    { day: 3, subject: 'Vos confrères trouvent leurs chantiers comme ça', body_summary: 'Cas client artisan + reframe (anti-démarchage Pages Jaunes) + form qualif activité', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Promis dernier mail — RDV terrain ou archive ?', body_summary: 'Cash + Cal.com + signature équipe terrain BTP', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Votre activité BTP — 90 sec',
    questions: [
      { label: 'Métier ?', type: 'select', options: ['Plomberie', 'Électricité', 'Maçonnerie', 'Peinture/finitions', 'Toiture', 'Menuiserie', 'Entreprise générale', 'Architecte'] },
      { label: 'Taille équipe ?', type: 'select', options: ['Solo', '2-5', '6-15', '15+'] },
      { label: 'Type chantiers cherchés ?', type: 'multiselect', options: ['Particuliers neuf', 'Particuliers rénov', 'Pro/tertiaire', 'Sous-traitance entreprises'] },
      { label: 'Carnet de commandes actuel ?', type: 'select', options: ['Vide', '1-3 mois', '3-6 mois', '6+ mois'] },
    ],
    scoring: 'Équipe 2-15 + cherche sous-traitance ou pro/tertiaire + carnet < 3 mois = score 80 (besoin urgent).',
  },
  routing: {
    hot: 'Score >= 70 + carnet vide → CRM "Hot" + commercial appelle dans 24h',
    warm: 'Score 40-69 → CRM "Warm" + newsletter chantiers locaux',
    cold: 'Score < 40 ou carnet 6m+ → Archive 3 mois',
  },
  expected: { open: 34, form: 11, hot: 40 },
});

// ─── 3 TEMPLATES ÉVÉNEMENTIELS ──────────────────────────────────────

const ANNONCE_PRODUIT = tpl({
  id: 'annonce_produit_b2b',
  name: '📢 Annonce produit / feature aux prospects warm',
  tagline: 'Push produit/feature à ta base prospects warm + leads CRM. Convertit le tiède en chaud sur un trigger précis.',
  segment: 'Base prospects warm + clients existants',
  icon: 'Rocket',
  color: 'violet',
  target: {
    categories: ['existing_crm_warm'],
    departments_strategy: 'Pas de scraping — utilise CRM Volia existant filtré par tag/stage',
    company_size: 'Tous (filtré côté CRM)',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, on a sorti la feature que tu attendais', body_summary: 'Accroche directe nouvelle feature + pitch valeur + CTA replay démo ou form intérêt', includes_form_link: true, includes_calcom: true },
    { day: 3, subject: '24 utilisateurs ont déjà activé — voici pourquoi', body_summary: 'Social proof activations + 2-3 cas usage concrets + form 30 sec intérêt', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Dernier mail — tu veux voir ça ou pas ?', body_summary: 'Cash + Cal.com 15 min démo perso + lien doc/blog post', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Cette nouveauté t\'intéresse ?',
    questions: [
      { label: 'Intéressé par la feature ?', type: 'select', options: ['Très intéressé', 'Curieux', 'Pas pour le moment'] },
      { label: 'Quel use case pour vous ?', type: 'long_text' },
      { label: 'Timing souhaité démo ?', type: 'select', options: ['Cette semaine', 'Ce mois', 'Quand vous voulez', 'Pas de démo, juste doc'] },
    ],
    scoring: 'Très intéressé + use case détaillé + démo cette semaine = score 90+.',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Hot" + démo prio + activation feature pre-launch',
    warm: 'Score 40-69 → CRM "Warm" + ajouté à liste waitlist feature',
    cold: 'Score < 40 → Garde sur newsletter mensuelle',
  },
  expected: { open: 48, form: 18, hot: 35 },
});

const SALON_B2B = tpl({
  id: 'salon_b2b_pre_post',
  name: '🎪 Salon B2B — Pré-show + post-show',
  tagline: 'Maximise ROI salon : RDV qualifiés avant le salon, follow-up tiède après. 1 campagne, 2 phases.',
  segment: 'Event marketing salon professionnel',
  icon: 'Calendar',
  color: 'fuchsia',
  target: {
    categories: ['software company', 'marketing agency', 'consulting firm', 'manufacturer'],
    departments_strategy: 'France entière, focus région du salon',
    company_size: 'PME 11-250',
  },
  sequence: [
    { day: 0, subject: 'On se voit au {{event_name}} ? Stand {{stand}}', body_summary: 'Invitation pre-show + topic stand + bénéfice 15 min RDV salon + Cal.com créneaux salon', includes_form_link: false, includes_calcom: true },
    { day: 3, subject: 'Dernière chance — 3 créneaux dispo {{event_name}}', body_summary: 'Urgence créneaux restants + topics démo précis + Cal.com', includes_form_link: false, includes_calcom: true },
    { day: 7, subject: 'On s\'est croisés à {{event_name}} ? Récap', body_summary: 'Post-show : merci venue + récap démo/topics + form RDV approfondi + ressource bonus PDF', includes_form_link: true, includes_calcom: true },
  ],
  form: {
    title: 'Suite de notre échange au salon',
    questions: [
      { label: 'On s\'est rencontrés au stand ?', type: 'select', options: ['Oui démo complète', 'Oui passage rapide', 'Non, intéressé après', 'Pas encore inscrit au salon'] },
      { label: 'Sujet d\'intérêt principal ?', type: 'short_text' },
      { label: 'Suite souhaitée ?', type: 'select', options: ['Démo perso 30 min', 'Devis détaillé', 'Documentation', 'Juste rester en contact'] },
    ],
    scoring: 'Démo complète + sujet intérêt + démo perso = score 90+. Passage rapide + intérêt = 60.',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Hot" + démo prio sous 7j + offre salon -10%',
    warm: 'Score 40-69 → CRM "Warm" + envoi devis détaillé + drip post-salon',
    cold: 'Score < 40 → Garde liste pour prochain salon',
  },
  expected: { open: 42, form: 16, hot: 45 },
});

const RENTREE_Q4_PUSH = tpl({
  id: 'rentree_q4_pipeline_push',
  name: '📅 Rentrée Q4 — Push pipeline avant clôture année',
  tagline: 'Septembre-octobre = budgets non utilisés à dépenser + rentrée projets 2026. Maxime le sprint avant fin d\'année.',
  segment: 'Tous secteurs B2B avec cycle annuel',
  icon: 'Calendar',
  color: 'orange',
  target: {
    categories: ['marketing agency', 'consulting firm', 'software company', 'training school', 'professional services'],
    departments_strategy: 'France entière, focus métropoles tertiaires',
    company_size: 'PME 11-250 (gros budgets fin année)',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, budget {{year}} entièrement utilisé ?', body_summary: 'Accroche budget non utilisé + pitch action concrète Q4 + CTA quick win', includes_form_link: true, includes_calcom: false },
    { day: 3, subject: '6 sem avant clôture — voici 3 quick wins', body_summary: 'Sens urgence rentrée + 3 actions concrètes activables 30 jours + form besoin', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Dernier mail Q4 — on agit ou on attend janvier ?', body_summary: 'Cash + comparatif coût opportunité Q4 vs janvier + Cal.com 15 min', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Votre Q4 — 2 min',
    questions: [
      { label: 'Budget restant pour Q4 ?', type: 'select', options: ['Très peu', 'Modéré', 'Important', 'Je ne sais pas encore'] },
      { label: 'Projets prioritaires Q4 ?', type: 'multiselect', options: ['Acquisition leads', 'Refonte process', 'Outils SaaS', 'Formation équipe', 'Marketing'] },
      { label: 'Décision finale d\'ici ?', type: 'select', options: ['2 semaines', '4 semaines', '8 semaines', '2027'] },
    ],
    scoring: 'Budget important + projet prioritaire + décision <4 sem = score 90+ (sprint Q4 confirmé).',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Hot" + démo express 30 min + offre Q4 -15%',
    warm: 'Score 40-69 → CRM "Warm" + drip Q4 quick wins',
    cold: 'Score < 40 → Archive jusqu\'à rentrée 2027',
  },
  expected: { open: 36, form: 12, hot: 42 },
});

// ─── 3 TEMPLATES UPSELL CRM (clients existants) ──────────────────────

const UPSELL_FEATURES = tpl({
  id: 'crm_upsell_features',
  name: '⬆️ Upsell features — Clients existants',
  tagline: 'Push features avancées à clients déjà actifs. Cross-sell smart basé sur usage. Marge nette pure.',
  segment: 'Clients actifs CRM (pas du cold)',
  icon: 'Rocket',
  color: 'emerald',
  tier: 'business',
  target: {
    categories: ['existing_crm_active_clients'],
    departments_strategy: 'Pas de scraping — utilise CRM Volia stage "Client actif" ou tag "paying"',
    company_size: 'Tous (filtre côté CRM)',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, t\'as débloqué la moitié de {{your_product}}', body_summary: 'Accroche usage actuel + reveal features non utilisées + ROI estimé activation + CTA démo express', includes_form_link: false, includes_calcom: true },
    { day: 3, subject: 'Comment {{similar_client}} utilise {{your_product}} en full power', body_summary: 'Cas client similaire en full activation + ROI mesuré + form intérêt features', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'On débloque tout sous 30 min ?', body_summary: 'Cash + offre activation accompagnée gratuite + Cal.com Customer Success', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Tes features wishlist',
    questions: [
      { label: 'Quelles features t\'intéressent le plus ?', type: 'multiselect', options: ['Autopilot illimité', 'CRM custom fields', 'API publique', 'Multi-users', 'Webhooks sortants', 'Reporting avancé'] },
      { label: 'Quel use case prioritaire ?', type: 'long_text' },
      { label: 'Budget mensuel additionnel possible ?', type: 'select', options: ['< 50€', '50-150€', '150-500€', '500€+'] },
    ],
    scoring: '2+ features + use case détaillé + budget 150€+ = score 90 (vrai upsell).',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Upsell Hot" + Customer Success appelle + offre activation -20% 12 mois',
    warm: 'Score 40-69 → CRM "Upsell Warm" + ajout liste beta nouvelles features',
    cold: 'Score < 40 → Reste actif, no push agressif',
  },
  expected: { open: 56, form: 24, hot: 48 },
});

const UPSELL_SEATS = tpl({
  id: 'crm_upsell_seats',
  name: '👥 Upsell seats — Multi-users dans équipe',
  tagline: 'Push utilisateurs supplémentaires aux comptes solo qui montent en équipe. Naturel quand équipe grossit.',
  segment: 'Clients Solo/Pro avec signaux croissance équipe',
  icon: 'Users',
  color: 'cyan',
  tier: 'business',
  target: {
    categories: ['existing_crm_growth_signals'],
    departments_strategy: 'Pas de scraping — filtre côté CRM (LinkedIn growth signal, hiring posts, etc.)',
    company_size: 'Solo + 2-5 → cible upgrade équipe',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, ton équipe grandit ? On adapte ton compte', body_summary: 'Accroche signal growth + pitch multi-users seamless + bénéfice collaboration + CTA', includes_form_link: true, includes_calcom: false },
    { day: 3, subject: 'Ajoute ton équipe sur Volia — 1 clic', body_summary: 'Pas pratique solo si équipe + démo multi-users en 2 min + form taille équipe', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Plan team = X €/user — récap', body_summary: 'Cash + tarif clair + Cal.com onboarding équipe gratuit', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'Ton équipe sur Volia',
    questions: [
      { label: 'Combien d\'utilisateurs additionnels ?', type: 'select', options: ['+1', '+2-5', '+5-10', '+10+'] },
      { label: 'Quels rôles dans ton équipe ?', type: 'multiselect', options: ['Sales', 'Marketing', 'Ops', 'Founder', 'Customer Success'] },
      { label: 'Timing onboarding ?', type: 'select', options: ['Cette semaine', 'Ce mois', '3 mois', 'Veille'] },
    ],
    scoring: '+2 users + 2+ rôles + onboarding ce mois = score 90 (upsell prêt).',
  },
  routing: {
    hot: 'Score >= 70 → CRM "Upsell Hot" + setup multi-users gratuit + onboarding session',
    warm: 'Score 40-69 → CRM "Upsell Warm" + envoi guide multi-users + drip',
    cold: 'Score < 40 → Reste sur plan actuel',
  },
  expected: { open: 52, form: 22, hot: 52 },
});

const RENEWAL_AT_RISK = tpl({
  id: 'crm_renewal_at_risk',
  name: '🚨 Renewal at-risk — Anti-churn pré-renouvellement',
  tagline: 'Détecte les clients dont usage chute 60 jours avant renouvellement. Re-engagement avant qu\'ils churnent.',
  segment: 'Clients avec usage en baisse approchant renouvellement',
  icon: 'AlertCircle',
  color: 'red',
  tier: 'enterprise',
  target: {
    categories: ['existing_crm_at_risk'],
    departments_strategy: 'Pas de scraping — filtre côté CRM (usage_score < seuil + renewal_date < 60j)',
    company_size: 'Tous clients actifs',
  },
  sequence: [
    { day: 0, subject: '{{first_name}}, on n\'a pas eu de nouvelles — tout va bien ?', body_summary: 'Accroche check-in chaleureux + non-pitch + question ouverte besoin + CTA réponse directe', includes_form_link: false, includes_calcom: false },
    { day: 3, subject: 'Si {{your_product}} ne te sert plus, dis-le moi cash', body_summary: 'Transparence radicale + 3 questions courtes form (utilité, blocage, alternative) + bénéfice retour', includes_form_link: true, includes_calcom: false },
    { day: 7, subject: 'Dernier message avant ton renouvellement', body_summary: 'Cash + offre 1 session optimisation gratuite + Cal.com Customer Success senior', includes_form_link: false, includes_calcom: true },
  ],
  form: {
    title: 'On reste ou on arrête ?',
    questions: [
      { label: 'Volia te sert encore ?', type: 'select', options: ['Oui beaucoup', 'Oui par moments', 'Plus vraiment', 'Non on a stoppé'] },
      { label: 'Si moins, qu\'est-ce qui bloque ?', type: 'long_text' },
      { label: 'Tu utilises autre chose à la place ?', type: 'short_text' },
      { label: 'Renouveler ?', type: 'select', options: ['Oui certain', 'Oui mais discount', 'Pas sûr', 'Non on stoppe'] },
    ],
    scoring: 'Sert encore beaucoup/par moments + blocage clair = score 70 (save possible). Stop = score 10 (graceful exit).',
  },
  routing: {
    hot: 'Score >= 50 → CRM "Renewal Save" + Customer Success senior appelle + offre rétention -20%',
    warm: 'Score 30-49 → CRM "Renewal Risk" + session optimisation gratuite',
    cold: 'Score < 30 → Graceful exit + survey churn + voucher futur',
  },
  expected: { open: 68, form: 38, hot: 25 },
});

// ─── EXPORT FINAL : 23 templates ────────────────────────────────────

export const AUTOPILOT_TEMPLATES = [
  // 5 pré-existants (V1 Phase 1)
  COLD_PROVOCATEUR,
  COLD_SYMPATHIQUE,
  WEBINAR_REGISTER,
  REACTIVATION_COLD,
  DEMO_BOOKING,
  // 7 ICP-focused (workflow multi-agents)
  AGENCES_DIGITALES,
  FREELANCES,
  SAAS_B2B_PME,
  FORMATEURS_B2B,
  FOURNISSEUR_RETAILER,
  CONSULTING_NURTURE,
  RECRUTEMENT,
  // 5 verticaux sectoriels (v2)
  IMMOBILIER_PARTENAIRES,
  RESTAURATEURS_FOURNISSEURS,
  SANTE_PARAMEDICAL,
  AUTOMOBILE_B2B,
  BTP_ARTISANS,
  // 3 événementiels (v2)
  ANNONCE_PRODUIT,
  SALON_B2B,
  RENTREE_Q4_PUSH,
  // 3 upsell CRM clients existants (v2)
  UPSELL_FEATURES,
  UPSELL_SEATS,
  RENEWAL_AT_RISK,
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
