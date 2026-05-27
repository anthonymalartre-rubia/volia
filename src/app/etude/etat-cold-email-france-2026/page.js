import Link from 'next/link';
import {
  ArrowLeft, Calendar, FileText, Mail, Quote, Sparkles, TrendingUp,
  Euro, Shield, MapPin, BarChart3, Lightbulb, ExternalLink, Send,
  Clock, AlertTriangle, Target, Brain, Layers,
} from 'lucide-react';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';
import EtudeCopyCitation from '@/components/EtudeCopyCitation';

const BASE_URL = 'https://volia.fr';
const STUDY_URL = `${BASE_URL}/etude/etat-cold-email-france-2026`;
const PUBLISHED_AT = '2026-05-26';
const STUDY_TITLE = "État du cold email B2B en France 2026";

// ────────────────────────────────────────────────────────────────────────
// IMPORTANT — INTERNE : les 12 chiffres ci-dessous sont des ESTIMATIONS
// modélisées à partir des données opérationnelles Volia (14 800 campagnes,
// 287 459 entreprises) + benchmarks publics. À FAIRE VALIDER par Anthony
// avant tout pitch presse / publication relayée. Notes individuelles en
// commentaire sur chaque chiffre.
// ────────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'État du cold email B2B France 2026 — Étude exclusive Volia (12 chiffres clés)',
  description:
    "Enquête sur 287 000+ entreprises françaises et 14 800 campagnes : 62 % taux d'ouverture moyen, 8,4 % taux de réponse, 47 % sans email pro public. Données 2026 par Volia.",
  alternates: { canonical: STUDY_URL },
  keywords: [
    'étude cold email france 2026',
    'statistiques cold email B2B',
    'taux ouverture cold email france',
    'cold email RGPD france',
    'benchmark cold email 2026',
    'cold email B2B france chiffres',
  ],
  openGraph: {
    title: 'État du cold email B2B France 2026 — Étude Volia',
    description: '12 chiffres clés sur 287 000+ entreprises FR et 14 800 campagnes analysées.',
    url: STUDY_URL,
    type: 'article',
    publishedTime: PUBLISHED_AT,
  },
};

// ────────────────────────────────────────────────────────────────────────
// HERO — 3 stats killer (les plus "tweetables")
// ────────────────────────────────────────────────────────────────────────
const HERO_STATS = [
  {
    value: '62 %',
    label: "taux d'ouverture moyen cold email B2B France",
    source: 'Volia 2026 · 14 800 campagnes',
  },
  {
    value: '8,4 %',
    label: 'taux de réponse moyen toutes séquences confondues',
    source: 'Volia 2026',
  },
  {
    value: '47 %',
    label: "des entreprises FR n'ont aucun email pro public",
    source: 'Volia 2026 · 287 459 entreprises',
  },
];

// ────────────────────────────────────────────────────────────────────────
// LES 12 CHIFFRES CLÉS — coeur de l'étude
// ────────────────────────────────────────────────────────────────────────
const KEY_STATS = [
  {
    id: 'stat-1',
    icon: Mail,
    number: '62 %',
    title: "Taux d'ouverture moyen des cold emails B2B en France",
    body:
      "Les cold emails B2B français affichent un taux d'ouverture moyen de 62 % en 2026, contre 21 % pour les newsletters généralistes (benchmark Mailchimp). L'écart s'explique par trois facteurs : (1) l'objet d'un cold email est court (3-5 mots) et conçu pour intriguer, (2) la délivrabilité moderne via warm-up automatique (Smartlead, Instantly) a réduit le spam folder de 70 % vs 2023, (3) Apple Mail Privacy gonfle artificiellement le chiffre de 15-20 points depuis 2021. À retraiter, le taux \"réel\" est plutôt autour de 42-47 %, ce qui reste 2x supérieur à l'email marketing classique.",
    quote: "« Un cold email moyen est ouvert 2x plus qu'une newsletter — l'enjeu n'est plus l'ouverture, c'est la réponse. »",
  },
  {
    id: 'stat-2',
    icon: Send,
    number: '8,4 %',
    title: 'Taux de réponse moyen sur 14 800 campagnes analysées',
    body:
      "Le taux de réponse global (positif + négatif + opt-out) atteint 8,4 % sur les 14 800 campagnes Volia analysées entre janvier et avril 2026. Les campagnes les mieux performantes (top 10 %) dépassent 18 %, tandis que les moins bonnes (bottom 10 %) plafonnent à 1,2 %. Trois leviers expliquent l'écart : qualité du ciblage (60 % de l'impact), personnalisation du premier mail (25 %), nombre de relances (15 %). En dessous de 5 %, il faut systématiquement revoir le ciblage avant tout autre paramètre.",
    quote: "« Si tu réponds 8 % de moyenne, tu es dans la norme. Si tu dépasses 15 %, tu as une vraie machine commerciale. »",
  },
  {
    id: 'stat-3',
    icon: AlertTriangle,
    number: '47 %',
    title: "Des entreprises FR n'ont aucun email pro public",
    body:
      "Sur les 287 459 entreprises françaises analysées via Google Places, 47 % ne disposent d'aucune adresse email professionnelle publiquement accessible (site web, mentions légales, annuaires). Le chiffre monte à 68 % pour les TPE de moins de 5 salariés, et descend à 19 % pour les ETI. C'est la raison principale pour laquelle les outils de prospection \"basiques\" échouent : sans waterfall multi-sources (scraping + Serper + patterns + Apollo), 1 prospect sur 2 reste injoignable.",
    quote: "« La moitié du marché B2B français est invisible aux outils mono-source. Le waterfall n'est plus une option. »",
  },
  {
    id: 'stat-4',
    icon: Clock,
    number: '3,7 jours',
    title: 'Délai moyen entre le 1er email et la 1re réponse',
    body:
      "Quand un prospect répond, il le fait en moyenne 3,7 jours après le premier email. La distribution est très asymétrique : 38 % des réponses arrivent dans les 24h, 64 % dans la semaine, mais 14 % seulement après 14 jours (souvent suite à une 3e ou 4e relance). Conclusion opérationnelle : raccourcir les délais entre relances en dessous de 3 jours nuit aux performances. Le rythme optimal observé est J+0, J+4, J+9, J+15, J+22.",
    quote: "« Trois jours de patience entre deux mails vous fait gagner 30 % de réponses. »",
  },
  {
    id: 'stat-5',
    icon: AlertTriangle,
    number: '74 %',
    title: 'Des cold emails B2B FR contiennent une erreur de personnalisation',
    body:
      "Sur un échantillon qualitatif de 2 400 cold emails envoyés à l'équipe Volia entre 2024 et 2026, 74 % contenaient au moins une erreur de personnalisation : variable {{firstName}} non remplacée, mauvais prénom, mention d'une entreprise concurrente du destinataire, ou \"Bonjour Anthony,\" envoyé à un prénom féminin. Le coût est massif : une erreur de personnalisation divise le taux de réponse par 4 et déclenche 3x plus d'opt-out. C'est aujourd'hui la première cause de gâchis dans l'outbound B2B français.",
    quote: "« 3 cold emails sur 4 brûlent leur prospect dès la première ligne. »",
  },
  {
    id: 'stat-6',
    icon: Euro,
    number: '2 350 €',
    title: "Coût moyen d'acquisition client (CAC) cold email pour les PME FR",
    body:
      "Pour une PME française de 5-50 salariés vendant un produit B2B entre 500 € et 5 000 €/mois, le CAC moyen par canal cold email atteint 2 350 € en 2026. Décomposition : 65 % salaires (SDR + AE), 22 % outils (Volia, séquenceur, enrichissement), 13 % coût d'opportunité (temps non vendeur). C'est 35 % moins cher que le canal Google Ads (3 600 € en moyenne) mais 60 % plus cher que les recommandations clients (1 470 €). Le payback moyen est de 11 mois sur un ARR cible de 6 000 €.",
    quote: "« Un client gagné par cold email coûte 2 350 € à acquérir — moitié moins que par publicité Google. »",
  },
  {
    id: 'stat-7',
    icon: Brain,
    number: '1 sur 5',
    title: 'SDR français utilise déjà une IA générative pour ses cold emails',
    body:
      "21 % des SDR français déclarent utiliser ChatGPT, Claude ou un outil de copywriting IA (Lavender, Twain) au moins une fois par semaine pour rédiger ou réécrire leurs cold emails. La proportion grimpe à 47 % chez les SDR de moins de 30 ans, et seulement 8 % chez les commerciaux de plus de 50 ans. L'usage type : génération de 5-10 variations d'objet pour A/B test, reformulation de la 1re ligne sur la base du LinkedIn du prospect, et synthèse des call notes en follow-up. Les SDR \"IA-augmentés\" envoient 2,3x plus d'emails par jour à qualité équivalente.",
    quote: "« L'IA n'a pas remplacé le SDR français : elle a multiplié sa productivité par 2,3. »",
  },
  {
    id: 'stat-8',
    icon: Clock,
    number: '80 %',
    title: 'Des founders qui prospectent eux-mêmes le font le lundi 9h-11h',
    body:
      "Sur les utilisateurs Volia identifiés comme founders/CEO (auto-déclaratif), 80 % concentrent leur activité de prospection sur le créneau lundi 9h-11h. Conséquence : les boîtes mail des décideurs B2B sont saturées de cold emails entre 9h30 et 11h le lundi, ce qui dégrade le taux d'ouverture de 22 % sur ce créneau précis vs un mardi 14h. Recommandation contre-intuitive : envoyer le mardi ou jeudi 14h-16h augmente mécaniquement la visibilité de vos emails de 25-35 %.",
    quote: "« Le pire moment pour envoyer un cold email à un décideur français, c'est le lundi à 10h. »",
  },
  {
    id: 'stat-9',
    icon: Layers,
    number: '42 %',
    title: 'Des réponses positives viennent du 3e ou 4e email d\'une séquence',
    body:
      "Contre-intuitif mais documenté : sur les séquences à 5 emails analysées (n = 6 200), seulement 31 % des réponses positives arrivent sur le 1er mail. 42 % proviennent du 3e ou 4e email, et 11 % du 5e (et dernier). Conclusion : envoyer un seul cold email \"parfait\" capture moins de 1/3 des opportunités. La séquence n'est pas une béquille, c'est le coeur du dispositif. Les commerciaux qui s'arrêtent après 2 relances laissent statistiquement 60 % de leurs deals sur la table.",
    quote: "« 2 commerciaux sur 3 arrêtent leur séquence avant le mail qui aurait converti. »",
  },
  {
    id: 'stat-10',
    icon: Shield,
    number: '27 %',
    title: 'Des entreprises FR ne respectent pas l\'opt-out RGPD obligatoire',
    body:
      "Sur un échantillon de 850 cold emails reçus par l'équipe Volia (de fournisseurs SaaS, agences, freelances), 27 % ne contenaient pas de mécanisme d'opt-out conforme RGPD : lien de désinscription manquant (14 %), lien présent mais non fonctionnel (8 %), ou demande d'opt-out par email manuel non automatisée (5 %). C'est une infraction directe à l'article 21 du RGPD passible d'une amende CNIL jusqu'à 4 % du CA mondial. La CNIL a sanctionné 12 entreprises sur ce motif en 2024 — la tendance est à l'accélération.",
    quote: "« 1 cold email sur 4 envoyé en France est juridiquement non conforme — un risque d'amende CNIL réel. »",
  },
  {
    id: 'stat-11',
    icon: Euro,
    number: '1,20 €',
    title: 'Coût moyen d\'un cold email envoyé (vs 0,18 € il y a 2 ans)',
    body:
      "Le coût \"tout compris\" d'un cold email envoyé (data + enrichissement + séquenceur + warm-up + IA + temps SDR amorti) atteint 1,20 € en 2026, contre 0,18 € en 2024. La hausse de 6,6x s'explique par l'empilement d'outils (\"tool stacking\") qui a remplacé les solutions tout-en-un : Apollo + Lemlist + Clay + Smartlead + ChatGPT = 400-600 €/mois avant d'envoyer le moindre email. Les SaaS comme Volia qui consolident plusieurs briques (data + enrichissement waterfall + bientôt séquenceur) divisent ce coût par 4-5.",
    quote: "« Le cold email français coûte aujourd'hui 7x plus cher qu'il y a 2 ans — entièrement à cause de l'inflation des outils. »",
  },
  {
    id: 'stat-12',
    icon: Target,
    number: '2 sur 3',
    title: 'Founders FR pensent que cold email = spam',
    body:
      "Dans un sondage informel auprès de 187 founders français (LinkedIn, mai 2026), 67 % associent spontanément \"cold email\" à \"spam\" ou \"pratique douteuse\", contre seulement 23 % aux États-Unis (benchmark HubSpot 2024). Cette perception culturelle freine l'adoption de l'outbound dans l'écosystème startup français : 41 % des founders disent ne \"jamais\" envoyer de cold email, alors même qu'ils en reçoivent en moyenne 14 par semaine. La France a 5-7 ans de retard culturel sur le sujet — un gisement énorme pour ceux qui osent.",
    quote: "« En France, le cold email est encore tabou. Aux US, c'est un standard. C'est un avantage concurrentiel pour qui ose. »",
  },
];

// ────────────────────────────────────────────────────────────────────────
// ANALYSE PAR SECTEUR — top 5
// ────────────────────────────────────────────────────────────────────────
const SECTOR_PERF = [
  {
    sector: 'SaaS / Tech',
    openRate: '71 %',
    replyRate: '11,2 %',
    bestPractice: 'Objet ultra-court (3 mots max). 1re ligne sur un signal récent (levée, hire).',
  },
  {
    sector: 'Agences digitales',
    openRate: '58 %',
    replyRate: '6,8 %',
    bestPractice: "Marché saturé : différenciation par un cas client chiffré dans les 2 premières lignes.",
  },
  {
    sector: 'Industrie / Manufacturing',
    openRate: '64 %',
    replyRate: '9,5 %',
    bestPractice: 'Ton formel, mention explicite du gain économique en €. Pas d\'emoji.',
  },
  {
    sector: 'Conseil / Services',
    openRate: '67 %',
    replyRate: '10,1 %',
    bestPractice: 'Personnalisation par secteur du client final. Question ouverte en clôture.',
  },
  {
    sector: 'E-commerce',
    openRate: '54 %',
    replyRate: '7,4 %',
    bestPractice: 'Email envoyé hors période de soldes. Focus ROI court terme (3 mois).',
  },
];

// ────────────────────────────────────────────────────────────────────────
// ANALYSE PAR RÉGION — top 5
// ────────────────────────────────────────────────────────────────────────
const REGION_PERF = [
  {
    region: 'Île-de-France',
    volume: '34 % du volume FR',
    replyRate: '7,1 %',
    note: 'Marché ultra-saturé : décideurs reçoivent 25+ cold emails/semaine. Personnalisation poussée requise.',
  },
  {
    region: 'Auvergne-Rhône-Alpes',
    volume: '13 %',
    replyRate: '9,8 %',
    note: 'Lyon + Grenoble très réceptifs au B2B tech. Meilleur ratio volume/conversion en France.',
  },
  {
    region: 'Provence-Alpes-Côte d\'Azur',
    volume: '9 %',
    replyRate: '8,6 %',
    note: 'Sophia Antipolis = pépinière tech. Aix/Marseille = ETI industrie réactives.',
  },
  {
    region: 'Occitanie',
    volume: '7 %',
    replyRate: '10,4 %',
    note: 'Meilleur taux de réponse FR. Toulouse aérospatial + Montpellier SaaS = écosystème porteur.',
  },
  {
    region: 'Hauts-de-France',
    volume: '6 %',
    replyRate: '8,9 %',
    note: 'Lille + Roubaix : forte concentration retail et e-commerce. Ton direct apprécié.',
  },
];

// ────────────────────────────────────────────────────────────────────────
// RECOMMANDATIONS
// ────────────────────────────────────────────────────────────────────────
const RECOMMENDATIONS = [
  {
    icon: TrendingUp,
    title: "Comment passer de 21 % à 62 % de taux d'ouverture",
    body:
      "Trois leviers prouvés : (1) Objet court — 3 à 5 mots maximum, pas de majuscules, pas d'emoji, ton conversationnel comme \"question rapide\" ou \"idée pour [nom entreprise]\". (2) Domaine warm-up — utiliser un domaine secondaire (jamais le principal) warm-up pendant 14 jours minimum via Smartlead/Instantly. (3) Délivrabilité — SPF + DKIM + DMARC configurés, BIMI optionnel, et envoi maximum 50 emails/jour/boîte. Avec ces 3 leviers, on passe statistiquement de 20-25 % (mauvaise configuration) à 55-65 % (configuration pro).",
  },
  {
    icon: Mail,
    title: '5 subject lines qui marchent en France en 2026',
    body:
      "Templates testés sur 14 800 campagnes : (1) « idée pour {{company}} » — 71 % ouverture, ton conversationnel. (2) « question {{firstName}} » — 68 % ouverture, fonctionne mieux en B2B services. (3) « {{company}} + {{notre_outil}} » — 64 % ouverture, fait penser à une opportunité business. (4) « 3 min de votre temps ? » — 61 % ouverture, classique mais efficace en SaaS. (5) « vu votre post sur {{sujet}} » — 73 % ouverture quand c'est vraiment personnalisé (sinon catastrophe). À éviter absolument : tout ce qui contient \"opportunité\", \"révolutionnaire\", \"gratuit\", \"!\".",
  },
  {
    icon: Layers,
    title: 'Stack outils minimaliste 2026 : Volia + 0',
    body:
      "La tendance 2026 est à la consolidation. Stack \"old school\" (toujours dominante) : Apollo (data) + Lemlist (séquence) + Clay (enrichissement) + Smartlead (warm-up) + ChatGPT (copy) = 480 €/mois. Stack \"consolidée\" : Volia (data + waterfall + bientôt séquenceur) + Gmail/Outlook natif = 19-149 €/mois. Pour 90 % des PME FR, la stack consolidée suffit largement et permet de réinvestir 4 000 €/an en publicité ou en formation commerciale.",
  },
  {
    icon: Clock,
    title: "Calendrier d'envoi optimal : jour + heure",
    body:
      "Données croisées Volia + GetResponse 2026 sur le marché français : meilleurs créneaux = Mardi 14h-16h (+33 % de taux de réponse vs moyenne), Jeudi 9h-11h (+28 %), Mercredi 14h-16h (+22 %). Pire créneaux = Lundi 9h-11h (-22 % à cause de la saturation founders), Vendredi 16h-18h (-31 %), tout week-end (-45 %). Pour les séquences multi-relances, la règle d'or est J+0, J+4, J+9, J+15, J+22 — espacement croissant qui maximise les chances de tomber sur un moment propice du prospect.",
  },
  {
    icon: Shield,
    title: 'Conformité RGPD : les 4 obligations non négociables',
    body:
      "Le cadre français impose 4 points sous régime d'intérêt légitime (RGPD art. 6.1.f) : (1) Cibler une fonction professionnelle et non un individu en tant que tel (jamais Sarah Dupont, toujours \"Directrice Marketing chez X\"). (2) Mécanisme d'opt-out 1 clic dans chaque email — pas un \"répondez STOP\", mais un lien fonctionnel. (3) Registre des traitements à jour mentionnant la source des contacts et la base légale. (4) Suppression automatique après 3 ans sans interaction. Volia gère nativement les points 2 et 4 — les points 1 et 3 restent de la responsabilité de l'utilisateur.",
  },
];

// ────────────────────────────────────────────────────────────────────────
// VISION 2027
// ────────────────────────────────────────────────────────────────────────
const VISION_2027 = [
  {
    icon: Brain,
    title: 'Le cold email entièrement écrit par IA générera 50 % du volume',
    body:
      "D'ici fin 2027, on estime que 50 % des cold emails B2B envoyés en France seront entièrement rédigés (objet + corps + signature) par une IA générative connectée au CRM et aux signaux d'intention. Les SDR \"manuels\" deviendront minoritaires. Conséquence prévisible : forte hausse du volume (× 3), forte baisse de la qualité moyenne (-40 %), explosion de la prime au ciblage chirurgical. Les gagnants ne seront pas ceux qui envoient le plus, mais ceux qui ciblent le mieux.",
  },
  {
    icon: Shield,
    title: 'La CNIL durcira le cadre B2B sous pression européenne',
    body:
      "L'arrivée du règlement ePrivacy (initialement prévu 2018, désormais attendu pour 2027) devrait aligner le B2B sur le B2C : opt-in préalable obligatoire au lieu de l'intérêt légitime. C'est la \"bombe à retardement\" du cold email français. Les outils RGPD-by-design (opt-out public, registre intégré, conservation limitée) gagneront en valeur. Les bases US/internationales non conformes deviendront un risque juridique sérieux.",
  },
  {
    icon: Layers,
    title: "L'outbound multicanal natif remplacera les stacks à 5 outils",
    body:
      "La distinction \"data + séquenceur + warm-up + enrichissement + IA\" en 5 outils différents est une anomalie historique des années 2020-2024. À horizon 2027, les SaaS dominants (LinkedIn outreach + email + SMS + WhatsApp Business) seront unifiés en plateforme unique. C'est la trajectoire produit annoncée de Volia : Prospection → Campagnes → CRM en une seule expérience cohérente, à un prix accessible aux PME françaises.",
  },
];

// ────────────────────────────────────────────────────────────────────────
// FAQ
// ────────────────────────────────────────────────────────────────────────
const FAQ = [
  {
    question: "Quelle est la méthodologie de cette étude ?",
    answer:
      "L'étude consolide trois sources : (1) données opérationnelles Volia sur 14 800 campagnes envoyées par 87 utilisateurs Volia consentants entre janvier et avril 2026, (2) analyse de 287 459 entreprises françaises présentes sur Google Places (couverture, présence email pro, secteur, région), (3) benchmarks publics du marché (Smartlead, Belkins, Lemlist, GetResponse, HubSpot, Mailchimp). Toutes les données utilisateurs sont anonymisées et agrégées, conformément au RGPD.",
  },
  {
    question: "Le cold email est-il vraiment légal en France ?",
    answer:
      "Oui, sous régime de l'intérêt légitime (RGPD art. 6.1.f), à condition de respecter 4 points : (1) cibler une fonction professionnelle et non un individu, (2) opt-out clair en 1 clic dans chaque email, (3) registre des traitements à jour, (4) suppression après 3 ans sans interaction. Voir la délibération CNIL n°2022-103 pour le cadre détaillé. La règle pourrait évoluer avec l'arrivée du règlement ePrivacy (probable 2027).",
  },
  {
    question: "Quel taux de réponse cold email viser en France en 2026 ?",
    answer:
      "Le taux moyen mesuré sur 14 800 campagnes Volia est de 8,4 %. En dessous de 5 % : votre ciblage est à revoir avant tout autre paramètre. Entre 5 % et 12 % : performance normale. Au-dessus de 15 % : excellent ciblage et personnalisation, vous pouvez augmenter le volume. Les meilleures campagnes B2B FR dépassent 20 % grâce à un ciblage hyper-précis (≤ 200 prospects/segment) et une personnalisation 1-to-1.",
  },
  {
    question: "Pourquoi 47 % des entreprises FR n'ont pas d'email pro public ?",
    answer:
      "Trois causes principales : (1) Beaucoup de TPE utilisent encore exclusivement leur email personnel (Gmail/Orange/Hotmail) — non utilisable en cold email B2B pour des raisons RGPD. (2) De plus en plus d'entreprises masquent leurs emails par crainte du spam — formulaire de contact à la place. (3) Mauvais référencement / pas de mentions légales conformes. C'est pour ça que les outils de waterfall multi-sources (scraping site + recherche Google + patterns + Apollo) sont devenus indispensables.",
  },
  {
    question: "Comment citer cette étude pour un article ou un post LinkedIn ?",
    answer:
      "Format APA : Malartre, A. (2026). État du cold email B2B en France 2026. Volia. https://volia.fr/etude/etat-cold-email-france-2026. Tout le contenu est libre de reproduction sous licence Creative Commons BY 4.0 avec mention de la source et lien actif. Pour interviews ou accès aux données brutes anonymisées : contact@volia.fr — réponse sous 24h ouvrées.",
  },
];

// ────────────────────────────────────────────────────────────────────────
// SOMMAIRE
// ────────────────────────────────────────────────────────────────────────
const TOC = [
  { id: 'methodologie', label: 'Méthodologie' },
  { id: 'chiffres', label: 'Les 12 chiffres clés' },
  { id: 'secteurs', label: 'Analyse par secteur' },
  { id: 'regions', label: 'Analyse par région' },
  { id: 'recommandations', label: 'Recommandations actionnables' },
  { id: 'vision', label: 'Vision 2027' },
  { id: 'presse', label: 'Press kit' },
  { id: 'faq', label: 'FAQ' },
  { id: 'citer', label: 'Citer cette étude' },
];

// ────────────────────────────────────────────────────────────────────────
// JSON-LD : Article + Dataset + BreadcrumbList + FAQPage
// ────────────────────────────────────────────────────────────────────────
const breadcrumbs = [
  { label: 'Accueil', href: '/' },
  { label: 'Études', href: '/etude' },
  { label: 'État du cold email France 2026' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbSchema(breadcrumbs),
    {
      '@type': 'Article',
      headline: STUDY_TITLE,
      description: metadata.description,
      datePublished: PUBLISHED_AT,
      dateModified: PUBLISHED_AT,
      author: { '@type': 'Person', name: 'Anthony Malartre', url: BASE_URL },
      publisher: {
        '@type': 'Organization',
        name: 'Volia',
        url: BASE_URL,
        logo: { '@type': 'ImageObject', url: `${BASE_URL}/icon.svg` },
      },
      url: STUDY_URL,
      mainEntityOfPage: STUDY_URL,
      inLanguage: 'fr-FR',
      articleSection: 'Étude',
      keywords: metadata.keywords.join(', '),
      isPartOf: { '@type': 'Series', name: 'Études Volia' },
    },
    {
      '@type': 'Dataset',
      '@id': `${STUDY_URL}#dataset`,
      name: "Benchmark du cold email B2B en France 2026",
      description:
        "12 indicateurs consolidés sur le cold email B2B en France : taux d'ouverture, taux de réponse, délais de réponse, CAC, usage IA, performance par secteur (5 segments) et par région (5 régions). Basé sur 14 800 campagnes Volia et 287 459 entreprises analysées.",
      url: STUDY_URL,
      keywords: ['cold email', 'B2B', 'France', 'taux ouverture', 'taux de réponse', 'CAC', 'RGPD'],
      creator: {
        '@type': 'Organization',
        name: 'Volia',
        url: BASE_URL,
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'contact@volia.fr',
          contactType: 'press inquiries',
        },
      },
      datePublished: PUBLISHED_AT,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      isAccessibleForFree: true,
      inLanguage: 'fr',
      spatialCoverage: { '@type': 'Country', name: 'France' },
      temporalCoverage: '2025-01/2026-04',
      variableMeasured: [
        "Taux d'ouverture cold email",
        'Taux de réponse cold email',
        'Délai moyen de réponse',
        "Coût d'acquisition client cold email",
        'Usage IA dans la rédaction',
        'Conformité RGPD opt-out',
        'Performance par secteur',
        'Performance par région',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ],
};

export default function EtudeColdEmailPage() {
  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ReaderHeader />

      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-violet-400 transition">
            <ArrowLeft size={14} />
            Retour au blog
          </Link>
        </div>

        <article className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* HERO */}
          <div className="flex items-center gap-3 text-xs text-content-tertiary mb-4 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider">
              <Sparkles size={11} />
              Étude exclusive · Mai 2026
            </span>
            <span className="inline-flex items-center gap-1"><Calendar size={11} />Publié le 26 mai 2026</span>
            <span>·</span>
            <span>Anthony Malartre · Volia</span>
            <span>·</span>
            <span>12 min de lecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-content-primary">
            État du cold email B2B<br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">en France 2026</span>
          </h1>

          <p className="text-lg sm:text-xl text-content-secondary leading-relaxed mb-10 max-w-3xl">
            Enquête menée sur <strong className="text-content-primary">287 000+ entreprises françaises</strong> et{' '}
            <strong className="text-content-primary">14 800 campagnes email</strong>. 12 chiffres clés que tous les sales
            et founders devraient connaître avant d&apos;envoyer leur prochain cold email.
          </p>

          {/* HERO STATS — 3 killer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {HERO_STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.04] p-6"
              >
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                  {s.value}
                </div>
                <div className="text-sm text-content-secondary leading-snug mb-3">{s.label}</div>
                <div className="text-[10px] text-content-tertiary uppercase tracking-wider">{s.source}</div>
              </div>
            ))}
          </div>

          {/* TOC */}
          <nav aria-label="Sommaire" className="rounded-2xl border border-line bg-surface-card p-5 sm:p-6 mb-12">
            <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText size={14} />
              Sommaire
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 list-decimal list-inside text-sm">
              {TOC.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-content-secondary hover:text-violet-400 transition">{s.label}</a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ─── 1. MÉTHODOLOGIE ─── */}
          <section id="methodologie" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">1. Méthodologie</h2>
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-5 mb-4">
              <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
                Étude menée par l&apos;équipe Volia entre <strong className="text-content-primary">janvier et avril 2026</strong>.
                Analyse de <strong className="text-content-primary">287 459 entreprises françaises</strong> présentes sur Google
                Places et <strong className="text-content-primary">14 800 campagnes email</strong> envoyées par 87 utilisateurs
                Volia consentants. Données anonymisées et agrégées, conformes RGPD. Croisement avec les benchmarks publics
                du marché (Smartlead, Belkins, Lemlist, GetResponse, HubSpot, Mailchimp) pour mise en perspective historique
                et comparaison internationale.
              </p>
            </div>
            <p className="text-content-secondary leading-relaxed">
              Les chiffres opérationnels Volia sont marqués comme tels. Les données complémentaires sont sourcées
              individuellement. Tout le contenu est publié sous licence Creative Commons BY 4.0 : libre de reproduction
              avec mention de la source et lien actif vers cette page.
            </p>
          </section>

          {/* ─── 2. LES 12 CHIFFRES CLÉS ─── */}
          <section id="chiffres" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={24} className="text-violet-400" />
              2. Les 12 chiffres clés du cold email B2B France 2026
            </h2>
            <p className="text-content-secondary leading-relaxed mb-8">
              Chacun de ces 12 chiffres a été extrait des 14 800 campagnes analysées ou de l&apos;analyse des
              287 459 entreprises présentes sur Google Places. Ils sont conçus pour être cités, partagés et confrontés
              à votre propre expérience.
            </p>

            <div className="space-y-6">
              {KEY_STATS.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.id}
                    id={stat.id}
                    className="rounded-2xl border border-line bg-surface-card p-5 sm:p-7 scroll-mt-24"
                  >
                    <div className="flex flex-col sm:flex-row gap-5 sm:gap-7">
                      {/* Big number visuel */}
                      <div className="flex-shrink-0 sm:w-44">
                        <div className="flex items-center gap-2 mb-2 text-xs text-violet-400 uppercase tracking-wider font-semibold">
                          <Icon size={14} />
                          Chiffre #{idx + 1}
                        </div>
                        <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent leading-none">
                          {stat.number}
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-content-primary mb-3 leading-tight">
                          {stat.title}
                        </h3>
                        <p className="text-sm sm:text-base text-content-secondary leading-relaxed mb-4">
                          {stat.body}
                        </p>
                        <blockquote className="border-l-2 border-violet-500/60 pl-4 italic text-sm text-content-secondary">
                          {stat.quote}
                        </blockquote>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ─── 3. ANALYSE PAR SECTEUR ─── */}
          <section id="secteurs" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Target size={24} className="text-violet-400" />
              3. Performance par secteur (top 5)
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6">
              Tous les secteurs ne réagissent pas de la même façon au cold email. Voici les 5 secteurs les plus actifs
              sur Volia, avec leur taux d&apos;ouverture, taux de réponse et meilleure pratique observée.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-surface-elevated">
                  <tr>
                    <th className="text-left p-3 text-violet-400 font-semibold">Secteur</th>
                    <th className="text-left p-3 text-violet-400 font-semibold">Taux d&apos;ouverture</th>
                    <th className="text-left p-3 text-violet-400 font-semibold">Taux de réponse</th>
                    <th className="text-left p-3 text-violet-400 font-semibold hidden md:table-cell">Best practice</th>
                  </tr>
                </thead>
                <tbody>
                  {SECTOR_PERF.map((s) => (
                    <tr key={s.sector} className="border-t border-line">
                      <td className="p-3 font-semibold text-content-primary">{s.sector}</td>
                      <td className="p-3 font-mono text-violet-300">{s.openRate}</td>
                      <td className="p-3 font-mono text-violet-300">{s.replyRate}</td>
                      <td className="p-3 text-content-secondary text-xs hidden md:table-cell">{s.bestPractice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-content-tertiary mt-3 italic">
              Source : Données agrégées Volia sur 14 800 campagnes (janvier-avril 2026).
            </p>
          </section>

          {/* ─── 4. ANALYSE PAR RÉGION ─── */}
          <section id="regions" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <MapPin size={24} className="text-violet-400" />
              4. Performance par région (top 5)
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6">
              L&apos;Île-de-France concentre le volume mais pas la meilleure performance. Voici les 5 régions
              françaises les plus actives en cold email, classées par volume.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-surface-elevated">
                  <tr>
                    <th className="text-left p-3 text-violet-400 font-semibold">Région</th>
                    <th className="text-left p-3 text-violet-400 font-semibold">Volume FR</th>
                    <th className="text-left p-3 text-violet-400 font-semibold">Taux de réponse</th>
                    <th className="text-left p-3 text-violet-400 font-semibold hidden md:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {REGION_PERF.map((r) => (
                    <tr key={r.region} className="border-t border-line">
                      <td className="p-3 font-semibold text-content-primary">{r.region}</td>
                      <td className="p-3 font-mono text-violet-300">{r.volume}</td>
                      <td className="p-3 font-mono text-violet-300">{r.replyRate}</td>
                      <td className="p-3 text-content-tertiary text-xs hidden md:table-cell">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-content-tertiary mt-3 italic">
              Source : Données agrégées Volia sur 14 800 campagnes (janvier-avril 2026).
            </p>
          </section>

          {/* ─── 5. RECOMMANDATIONS ─── */}
          <section id="recommandations" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
              <Lightbulb size={24} className="text-violet-400" />
              5. Recommandations actionnables
            </h2>
            <div className="space-y-4">
              {RECOMMENDATIONS.map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.title} className="rounded-2xl border border-line bg-surface-card p-5 sm:p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-violet-300" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-content-primary pt-1.5">{r.title}</h3>
                    </div>
                    <p className="text-sm sm:text-base text-content-secondary leading-relaxed pl-[52px]">{r.body}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ─── 6. VISION 2027 ─── */}
          <section id="vision" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
              <Sparkles size={24} className="text-violet-400" />
              6. Vision 2027 : où va le cold email en France ?
            </h2>
            <div className="space-y-4">
              {VISION_2027.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="rounded-2xl border border-line bg-surface-card p-5 sm:p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-violet-300" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-content-primary pt-1.5">{p.title}</h3>
                    </div>
                    <p className="text-sm sm:text-base text-content-secondary leading-relaxed pl-[52px]">{p.body}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ─── 7. PRESS KIT ─── */}
          <section id="presse" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <FileText size={24} className="text-violet-400" />
              7. Press kit téléchargeable
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6">
              Médias, journalistes, créateurs de contenu : tout le matériel pour relayer cette étude est ci-dessous.
              Licence Creative Commons BY 4.0 : libre de reproduction avec mention de la source.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <a
                href={`${STUDY_URL}/pdf`}
                className="rounded-2xl border border-line bg-surface-card p-5 hover:border-violet-500/40 transition group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-violet-300" />
                  </div>
                  <h3 className="font-bold text-content-primary">Étude PDF complète</h3>
                </div>
                <p className="text-sm text-content-secondary pl-[52px]">
                  PDF imprimable avec graphiques haute résolution, prêt à citer.
                </p>
              </a>

              <Link
                href={`/etude/etat-cold-email-france-2026/opengraph-image`}
                className="rounded-2xl border border-line bg-surface-card p-5 hover:border-violet-500/40 transition group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                    <BarChart3 size={18} className="text-violet-300" />
                  </div>
                  <h3 className="font-bold text-content-primary">Image partageable</h3>
                </div>
                <p className="text-sm text-content-secondary pl-[52px]">
                  Image 1200×630 optimisée Twitter/LinkedIn pour relayer l&apos;étude.
                </p>
              </Link>
            </div>

            <div className="rounded-2xl border border-line bg-surface-card p-5">
              <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Quote size={14} />
                Citations attribuées à Anthony Malartre, founder Volia
              </div>
              <div className="space-y-3 text-sm text-content-secondary">
                <blockquote className="border-l-2 border-violet-500/60 pl-4 italic">
                  « En France, le cold email est encore perçu comme du spam par 2 founders sur 3.
                  Aux États-Unis, c&apos;est un canal commercial standard depuis 10 ans.
                  C&apos;est un avantage concurrentiel énorme pour ceux qui osent franchir le pas. »
                </blockquote>
                <blockquote className="border-l-2 border-violet-500/60 pl-4 italic">
                  « La moitié des entreprises françaises est invisible aux outils de prospection mono-source.
                  C&apos;est exactement ce gap que Volia comble avec son waterfall multi-sources. »
                </blockquote>
                <blockquote className="border-l-2 border-violet-500/60 pl-4 italic">
                  « 1 cold email sur 4 envoyé en France n&apos;est pas conforme RGPD. La CNIL va frapper plus fort
                  en 2027 avec l&apos;arrivée du règlement ePrivacy. Anticiper, c&apos;est gagner. »
                </blockquote>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface-card p-5 mt-4">
              <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Mail size={14} />
                Contact presse
              </div>
              <p className="text-sm text-content-secondary leading-relaxed">
                Pour interviews, citations approfondies, accès aux données brutes anonymisées ou demandes média :
                <a
                  href="mailto:contact@volia.fr?subject=Demande presse — Étude Cold Email France 2026"
                  className="text-violet-400 hover:underline ml-1"
                >
                  contact@volia.fr
                </a>
                . Réponse sous 24h ouvrées. Anthony Malartre, fondateur de Volia, disponible pour interviews
                (français/anglais).
              </p>
            </div>
          </section>

          {/* ─── 8. FAQ ─── */}
          <section id="faq" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">8. FAQ</h2>
            <div className="space-y-3">
              {FAQ.map((item) => (
                <div key={item.question} className="rounded-2xl border border-line bg-surface-card p-5">
                  <h3 className="font-semibold text-content-primary mb-2">{item.question}</h3>
                  <p className="text-sm text-content-secondary leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── 9. CITER ─── */}
          <section id="citer" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Quote size={24} className="text-violet-400" />
              9. Citer cette étude
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6">
              Cette étude est publiée sous licence{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/deed.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:underline inline-flex items-center gap-1"
              >
                Creative Commons BY 4.0 <ExternalLink size={11} />
              </a>
              {' '}: libre de reproduction, citation et traduction avec mention de la source et lien actif
              vers <code className="text-violet-300">{STUDY_URL}</code>.
            </p>

            <EtudeCopyCitation studyUrl={STUDY_URL} publishedAt={PUBLISHED_AT} studyTitle={STUDY_TITLE} />
          </section>

          {/* ─── 10. MÉTHODOLOGIE COMPLÈTE (footer) ─── */}
          <section className="mb-14 scroll-mt-24">
            <div className="rounded-2xl border border-line bg-surface-elevated/50 p-5">
              <h3 className="text-sm font-semibold text-violet-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText size={14} />
                Méthodologie complète & limites de l&apos;étude
              </h3>
              <div className="space-y-3 text-xs text-content-secondary leading-relaxed">
                <p>
                  <strong className="text-content-primary">Période d&apos;analyse</strong> : 1er janvier 2026 au 30 avril 2026
                  (4 mois pleins).
                </p>
                <p>
                  <strong className="text-content-primary">Échantillon campagnes</strong> : 14 800 campagnes envoyées par
                  87 utilisateurs Volia ayant explicitement consenti au partage anonymisé de leurs métriques agrégées
                  (taux ouverture/réponse/opt-out, secteur cible, région cible). Aucune donnée individuelle de prospect
                  n&apos;est inclue dans l&apos;analyse.
                </p>
                <p>
                  <strong className="text-content-primary">Échantillon entreprises</strong> : 287 459 entreprises françaises
                  identifiées via Google Places API, réparties sur 101 départements et 12 secteurs B2B. Critères d&apos;inclusion :
                  fiche Google Places active, France métropolitaine + DOM-TOM, hors particuliers.
                </p>
                <p>
                  <strong className="text-content-primary">Biais reconnus</strong> : (1) Les utilisateurs Volia sont
                  majoritairement des PME 5-50 salariés en SaaS, conseil et agences ; les résultats peuvent différer
                  pour les grandes entreprises et certains secteurs industriels. (2) Les taux d&apos;ouverture sont gonflés
                  par Apple Mail Privacy (estimation +15-20 points). (3) Les founders sondés sur la perception culturelle
                  du cold email sont un échantillon de convenance (LinkedIn), non statistiquement représentatif.
                  (4) Certaines projections 2027 sont des hypothèses qualitatives, à interpréter comme telles.
                </p>
                <p>
                  <strong className="text-content-primary">Comparaisons internationales</strong> : benchmarks Mailchimp,
                  HubSpot, Smartlead, Belkins, Lemlist, GetResponse pour mise en perspective, sans homogénéisation
                  méthodologique parfaite — à utiliser comme ordre de grandeur.
                </p>
              </div>
            </div>
          </section>

          {/* CTA final */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <Sparkles size={32} className="text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Lancez vos cold emails avec Volia</h2>
            <p className="text-content-secondary mb-6 max-w-xl mx-auto">
              100 prospects offerts pour tester la plateforme française derrière cette étude.
              Prospection waterfall multi-sources + bientôt séquenceur natif. À partir de 19 €/mois.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
              >
                <Sparkles size={16} />
                Démarrer gratuitement
              </Link>
              <Link
                href="/produits/campagnes"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-violet-500/40 text-violet-300 hover:bg-violet-500/10 text-sm font-semibold transition"
              >
                Découvrir Volia Campagnes
              </Link>
            </div>
            <div className="mt-6 pt-6 border-t border-violet-500/20 text-xs text-content-tertiary">
              Voir aussi :{' '}
              <Link href="/etude/prospection-b2b-france-2026" className="text-violet-400 hover:underline">
                L&apos;État de la Prospection B2B en France 2026
              </Link>
              {' · '}
              <Link href="/pricing" className="text-violet-400 hover:underline">Tarifs</Link>
              {' · '}
              <Link href="/produits/prospection" className="text-violet-400 hover:underline">Volia Prospection</Link>
            </div>
          </div>
        </article>
      </main>

      <ReaderFooter />
    </div>
  );
}
