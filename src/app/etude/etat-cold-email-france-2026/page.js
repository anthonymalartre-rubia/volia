import Link from 'next/link';
import {
  ArrowLeft, Calendar, FileText, Mail, Quote, Sparkles, TrendingUp,
  Shield, BarChart3, Lightbulb, ExternalLink, Send, Clock, Layers, Target, Brain,
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
// MÉTHODOLOGIE — Deux types de chiffres, jamais mélangés :
//   • BENCHMARKS PUBLICS : chiffres marché (taux de réponse, relances…)
//     attribués individuellement à leur source externe (Belkins, Instantly…).
//   • DONNÉES VOLIA : uniquement des stats de COUVERTURE réellement mesurées
//     sur ~40 000 entreprises analysées (provenance des emails, find-rate,
//     présence site/téléphone). Aucune donnée de performance de campagne
//     n'est revendiquée comme « Volia » — nous n'en publions pas tant que
//     l'échantillon n'est pas statistiquement solide.
// ────────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'État du cold email B2B France 2026 — Benchmark Volia',
  description:
    "Benchmark du cold email B2B en France 2026 : taux de réponse réalistes, poids des relances, longueur de séquence, conformité RGPD. Sources publiques (Belkins, Instantly, HubSpot) + données de couverture Volia sur ~40 000 entreprises.",
  alternates: { canonical: STUDY_URL },
  keywords: [
    'étude cold email france 2026',
    'statistiques cold email B2B',
    'taux de réponse cold email france',
    'cold email RGPD france',
    'benchmark cold email 2026',
    'cold email B2B france chiffres',
  ],
  openGraph: {
    title: 'État du cold email B2B France 2026 — Benchmark Volia',
    description: 'Les chiffres réalistes du cold email B2B FR : réponse, relances, séquences, RGPD. Sources publiques + données de couverture Volia.',
    url: STUDY_URL,
    type: 'article',
    publishedTime: PUBLISHED_AT,
  },
};

// ────────────────────────────────────────────────────────────────────────
// HERO — 3 chiffres "tweetables", honnêtes et sourcés
// ────────────────────────────────────────────────────────────────────────
const HERO_STATS = [
  {
    value: '1-5 %',
    label: "taux de réponse moyen d'un cold email B2B (top : 10-15 %)",
    source: 'Benchmarks publics · Belkins, Instantly 2025',
  },
  {
    value: '55-65 %',
    label: 'des réponses arrivent via les relances, pas sur le 1er mail',
    source: 'Benchmarks publics · Belkins, thedigitalbloom 2025',
  },
  {
    value: '0 %',
    label: "d'emails devinés dans la base Volia (100 % vérifiés)",
    source: 'Données Volia · ~40 000 entreprises analysées',
  },
];

// ────────────────────────────────────────────────────────────────────────
// LES CHIFFRES CLÉS — chacun sourcé. "public" = benchmark externe attribué ;
// "volia" = donnée de couverture réellement mesurée par Volia.
// ────────────────────────────────────────────────────────────────────────
const KEY_STATS = [
  {
    id: 'stat-1',
    kind: 'public',
    icon: Send,
    number: '1-5 %',
    title: 'Le taux de réponse moyen réaliste, pas les chiffres gonflés',
    body:
      "Les benchmarks publics 2025 convergent : le taux de réponse moyen d'un cold email B2B se situe entre 1 % et 5 %, avec un médian autour de 3-6 %. Les meilleures campagnes (top 10 %) atteignent 10-15 % et plus, mais c'est l'exception, pas la norme. En dessous de 2 %, le problème vient quasi toujours du ciblage ou de la délivrabilité, pas du texte du mail. Méfiez-vous des études qui annoncent « 8-15 % de moyenne » : ce sont des chiffres de vitrine, rarement reproductibles.",
    source: 'Belkins, Instantly, Built For B2B 2025',
    quote: "« Viser 3-5 % de réponse, c'est sain. Promettre 15 % de moyenne, c'est de la vitrine. »",
  },
  {
    id: 'stat-2',
    kind: 'public',
    icon: Mail,
    number: '~27 %',
    title: "Le taux d'ouverture ne veut presque plus rien dire",
    body:
      "Le taux d'ouverture moyen tourne autour de 27 % d'après les benchmarks 2026 — mais ce chiffre est devenu peu fiable. Apple Mail Privacy Protection charge automatiquement les pixels de tracking sur une grande partie du trafic, ce qui fausse la mesure à la hausse. Conséquence pratique : ne pilotez plus vos campagnes sur l'ouverture. La seule métrique qui indique vraiment si ça marche, c'est le taux de réponse.",
    source: 'Instantly, Mailforge 2026',
    quote: "« L'ouverture est devenue du bruit. La réponse est le seul vrai signal. »",
  },
  {
    id: 'stat-3',
    kind: 'public',
    icon: Layers,
    number: '55-65 %',
    title: 'La majorité des réponses arrive après le 1er email',
    body:
      "C'est le chiffre le plus négligé du cold email : 55 à 65 % des réponses proviennent des relances, pas du premier message. Le premier email capte environ 40-58 % des réponses, le reste se gagne sur les suivis. Les commerciaux qui s'arrêtent après une ou deux tentatives laissent mécaniquement une grande partie de leurs opportunités sur la table. La séquence n'est pas une béquille : c'est le cœur du dispositif.",
    source: 'Belkins, thedigitalbloom 2025',
    quote: "« Envoyer un seul mail “parfait”, c'est capter moins de la moitié des réponses possibles. »",
  },
  {
    id: 'stat-4',
    kind: 'public',
    icon: Clock,
    number: '3-5 mails',
    title: 'La longueur de séquence optimale',
    body:
      "Le point d'équilibre documenté : 3 à 5 emails étalés sur environ 20 jours. Deux à trois relances peuvent augmenter le taux de réponse de façon significative (jusqu'à ~65 % d'amélioration selon certaines études). Mais au-delà de 5 messages, le gain devient marginal et le risque de plaintes spam et de dégradation de la délivrabilité l'emporte. Un rythme à espacement croissant (J+0, J+3, J+7, J+14…) capture l'essentiel des réponses dans les deux premières semaines.",
    source: 'Instantly, Belkins 2025',
    quote: "« 3 à 5 mails bien espacés. Au-delà, vous abîmez votre réputation pour un gain quasi nul. »",
  },
  {
    id: 'stat-5',
    kind: 'public',
    icon: Target,
    number: '5,8 % vs 2,1 %',
    title: 'Le ciblage serré bat le volume, nettement',
    body:
      "Les campagnes envoyées à moins de 50 destinataires affichent en moyenne 5,8 % de réponse, contre 2,1 % pour les gros envois de masse. Autrement dit, un ciblage chirurgical fait plus que doubler vos résultats. C'est contre-intuitif quand on cherche du volume, mais c'est la donnée la plus actionnable : mieux vaut 100 prospects parfaitement ciblés que 2 000 envoyés à l'aveugle. La longueur idéale d'un cold email tourne par ailleurs autour de 50 à 125 mots.",
    source: 'Built For B2B, Instantly 2025',
    quote: "« 100 prospects parfaitement ciblés battent 2 000 envoyés à l'aveugle. »",
  },
  {
    id: 'stat-6',
    kind: 'volia',
    icon: BarChart3,
    number: '0 %',
    title: "Volia ne devine jamais un email — 100 % sont vérifiés",
    body:
      "Sur ~40 000 entreprises françaises analysées, tous les emails de notre base sont soit scrapés directement sur le site officiel (≈70 %), soit issus d'une recherche Google (≈30 %). Zéro email fabriqué par pattern (contact@, info@…). C'est un choix assumé : un email deviné bounce, abîme la réputation d'envoi et n'a aucune valeur en prospection sérieuse. Quand Volia enrichit une entreprise qui a un site web, il trouve un email professionnel vérifié dans environ 46 % des cas.",
    source: 'Données de couverture Volia · ~40 000 entreprises, 2025-2026',
    quote: "« Un email deviné, c'est un bounce qui détruit votre délivrabilité. On préfère ne pas en mettre. »",
  },
  {
    id: 'stat-7',
    kind: 'volia',
    icon: Shield,
    number: '~1 sur 4',
    title: "Une entreprise FR sur quatre n'a pas de site web",
    body:
      "Dans notre échantillon, 75,3 % des entreprises disposent d'un site web et 95,6 % d'un téléphone public. Concrètement : environ une entreprise sur quatre n'a pas de présence web et reste quasi injoignable par email — mais joignable par téléphone. C'est la principale raison pour laquelle une stratégie 100 % email plafonne, et pourquoi le multicanal (email + téléphone) reste indispensable sur le marché français, surtout sur les TPE.",
    source: 'Données de couverture Volia · ~40 000 entreprises, 2025-2026',
    quote: "« Sur le marché FR, le tout-email plafonne : une entreprise sur quatre n'a pas de site. »",
  },
  {
    id: 'stat-8',
    kind: 'public',
    icon: Shield,
    number: 'Art. 6.1.f',
    title: 'Le cold email B2B est légal en France — sous conditions',
    body:
      "En B2B, la prospection par email est licite sous régime de l'intérêt légitime (RGPD art. 6.1.f), à quatre conditions : (1) cibler une fonction professionnelle et non un individu en tant que tel, (2) un opt-out clair en 1 clic dans chaque message, (3) un registre des traitements à jour mentionnant la source des contacts, (4) une suppression après une durée raisonnable sans interaction. La délibération CNIL n°2022-103 détaille le cadre. À surveiller : le règlement ePrivacy pourrait durcir les règles à l'avenir.",
    source: 'CNIL — délibération n°2022-103, RGPD art. 6.1.f',
    quote: "« Le cold email B2B est légal en France — à condition de viser une fonction et d'offrir un vrai opt-out. »",
  },
];

// ────────────────────────────────────────────────────────────────────────
// COUVERTURE VOLIA — données réelles (provenance des emails)
// ────────────────────────────────────────────────────────────────────────
const EMAIL_SOURCES = [
  { label: 'Scrapés directement sur le site officiel', rate: 70 },
  { label: 'Trouvés via une recherche Google', rate: 30 },
  { label: 'Devinés par pattern (contact@, info@…)', rate: 0 },
];

const COVERAGE_KPIS = [
  { v: '~40 000', l: 'entreprises analysées' },
  { v: '83', l: 'départements représentés' },
  { v: '~46 %', l: 'find-rate email (avec site web)' },
  { v: '95,6 %', l: 'ont un téléphone public' },
];

// ────────────────────────────────────────────────────────────────────────
// RECOMMANDATIONS — best practices, sans chiffres fabriqués
// ────────────────────────────────────────────────────────────────────────
const RECOMMENDATIONS = [
  {
    icon: Target,
    title: 'Ciblez serré avant tout',
    body:
      "C'est le levier #1, loin devant le texte. Les benchmarks montrent que les petits envois bien ciblés (< 50 destinataires) répondent deux à trois fois mieux que les envois de masse. Segmentez par secteur, taille et signal d'intention, et limitez chaque segment à quelques dizaines de prospects vraiment pertinents. Un mauvais ciblage ne se rattrape par aucune astuce de copywriting.",
  },
  {
    icon: Layers,
    title: 'Relancez — la séquence fait la moitié du travail',
    body:
      "Puisque 55-65 % des réponses viennent des suivis, prévoyez 3 à 5 messages espacés sur ~20 jours, à intervalle croissant. Chaque relance doit apporter un angle nouveau (preuve, cas d'usage, question courte), pas un simple « petit up ». Au-delà de 5 messages, arrêtez : le risque de plainte dépasse le gain.",
  },
  {
    icon: Mail,
    title: 'Soignez la délivrabilité, pas le taux d\'ouverture',
    body:
      "Configurez SPF, DKIM et DMARC, utilisez un domaine secondaire warm-up, et limitez le volume par boîte (50-100 emails/jour max). Gardez un objet court et conversationnel, évitez les mots déclencheurs de spam (« gratuit », « opportunité », « !!! ») et les majuscules. L'ouverture étant faussée par Apple Mail Privacy, pilotez sur la réponse.",
  },
  {
    icon: TrendingUp,
    title: 'Restez court et concret',
    body:
      "Les emails de 50 à 125 mots performent le mieux. Une accroche personnalisée sur un fait réel (secteur, actualité, signal), une proposition de valeur claire, une seule question de clôture facile à répondre. Pas de pavé, pas de pitch produit complet : l'objectif d'un cold email, c'est d'obtenir une réponse, pas de vendre.",
  },
  {
    icon: Shield,
    title: 'Conformité RGPD : les 4 obligations non négociables',
    body:
      "Sous régime d'intérêt légitime (RGPD art. 6.1.f) : (1) cibler une fonction professionnelle, jamais un particulier ; (2) un opt-out 1 clic fonctionnel dans chaque email (pas un « répondez STOP ») ; (3) un registre des traitements à jour avec la source des contacts ; (4) une suppression après une durée raisonnable sans interaction. Volia gère nativement l'opt-out public et le filtrage des emails personnels — le ciblage et le registre restent de votre responsabilité.",
  },
];

// ────────────────────────────────────────────────────────────────────────
// VISION 2027 — opinions explicitement prospectives
// ────────────────────────────────────────────────────────────────────────
const VISION_2027 = [
  {
    icon: Brain,
    title: "L'IA fait exploser le volume — la prime va au ciblage",
    body:
      "Notre conviction : à mesure que l'IA générative rédige une part croissante des cold emails, le volume va augmenter et la qualité moyenne baisser. Les gagnants ne seront pas ceux qui envoient le plus, mais ceux qui ciblent le mieux et personnalisent sur des faits réels. L'IA est un multiplicateur de productivité au service de l'humain qui décide — pas un pilote automatique.",
  },
  {
    icon: Shield,
    title: 'Le cadre RGPD du B2B pourrait se durcir',
    body:
      "L'arrivée éventuelle du règlement ePrivacy pourrait, à terme, rapprocher le B2B du B2C (consentement préalable plutôt qu'intérêt légitime). C'est une hypothèse, pas une certitude — mais elle plaide pour des outils RGPD-by-design dès aujourd'hui : opt-out public natif, registre, conservation limitée. Les bases non conformes deviendraient un risque juridique.",
  },
  {
    icon: Layers,
    title: "Le multicanal natif remplacera les stacks à 5 outils",
    body:
      "Empiler data + séquenceur + warm-up + enrichissement + IA dans cinq outils différents est une anomalie des années 2020-2024. La trajectoire produit de Volia va dans l'autre sens : Prospection → Campagnes → CRM dans une seule expérience cohérente, à un prix accessible aux PME françaises.",
  },
];

// ────────────────────────────────────────────────────────────────────────
// FAQ
// ────────────────────────────────────────────────────────────────────────
const FAQ = [
  {
    question: "Quelle est la méthodologie de ce benchmark ?",
    answer:
      "Deux types de données, jamais mélangées. (1) Les chiffres de performance marché (taux de réponse, poids des relances, longueur de séquence) proviennent de benchmarks publics 2025-2026, attribués individuellement à leur source (Belkins, Instantly, Built For B2B, thedigitalbloom, Mailforge). (2) Les données de couverture (provenance des emails, find-rate, présence site/téléphone) sont mesurées par Volia sur un échantillon de ~40 000 entreprises françaises analysées via Google Places. Nous ne publions aucune statistique de performance de campagne en propre tant que notre échantillon n'est pas statistiquement solide.",
  },
  {
    question: "Quel taux de réponse cold email viser en France en 2026 ?",
    answer:
      "D'après les benchmarks publics 2025, la moyenne se situe entre 1 % et 5 %, avec un médian autour de 3-6 %. En dessous de 2 % : revoir le ciblage et la délivrabilité avant tout. Entre 3 % et 6 % : performance normale. Au-dessus de 10-15 % : excellent, vous pouvez pousser le volume. Et rappelez-vous : 55-65 % des réponses arrivent via les relances, pas sur le 1er mail.",
  },
  {
    question: "Le cold email est-il vraiment légal en France ?",
    answer:
      "Oui, en B2B, sous régime de l'intérêt légitime (RGPD art. 6.1.f), à condition de respecter 4 points : (1) cibler une fonction professionnelle et non un individu, (2) opt-out clair en 1 clic dans chaque email, (3) registre des traitements à jour, (4) suppression après une durée raisonnable sans interaction. Voir la délibération CNIL n°2022-103. La règle pourrait évoluer avec l'arrivée du règlement ePrivacy.",
  },
  {
    question: "Pourquoi une partie des entreprises FR est-elle injoignable par email ?",
    answer:
      "Dans les données Volia, environ une entreprise sur quatre n'a pas de site web — donc pas d'email professionnel trouvable. S'ajoutent les TPE qui n'utilisent qu'un email personnel (non utilisable en cold email B2B) et celles qui masquent leur adresse derrière un formulaire. C'est pourquoi un waterfall multi-sources (scraping site + recherche Google) et une approche multicanale (email + téléphone) sont nécessaires.",
  },
  {
    question: "Comment citer ce benchmark pour un article ou un post LinkedIn ?",
    answer:
      "Format APA : Malartre, A. (2026). État du cold email B2B en France 2026. Volia. https://volia.fr/etude/etat-cold-email-france-2026. Contenu sous licence Creative Commons BY 4.0 : libre de reproduction avec mention de la source et lien actif. Merci de conserver l'attribution des chiffres marché à leur source d'origine. Contact : contact@volia.fr.",
  },
];

const TOC = [
  { id: 'methodologie', label: 'Méthodologie' },
  { id: 'chiffres', label: 'Les chiffres clés' },
  { id: 'couverture', label: 'Données de couverture Volia' },
  { id: 'recommandations', label: 'Recommandations actionnables' },
  { id: 'vision', label: 'Vision 2027' },
  { id: 'presse', label: 'Press kit' },
  { id: 'faq', label: 'FAQ' },
  { id: 'citer', label: 'Citer ce benchmark' },
];

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
        "Benchmark du cold email B2B en France : taux de réponse, poids des relances, longueur de séquence, conformité RGPD (sources publiques attribuées) et données de couverture Volia (provenance des emails, find-rate, présence site/téléphone) sur ~40 000 entreprises analysées.",
      url: STUDY_URL,
      keywords: ['cold email', 'B2B', 'France', 'taux de réponse', 'relances', 'RGPD', 'couverture email'],
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
      temporalCoverage: '2025/2026',
      variableMeasured: [
        'Taux de réponse cold email (benchmark public)',
        'Part des réponses issues des relances (benchmark public)',
        'Longueur de séquence optimale (benchmark public)',
        'Provenance des emails trouvés (donnée Volia)',
        "Taux de découverte d'email (donnée Volia)",
        'Présence site web / téléphone (donnée Volia)',
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
              Benchmark Volia · Mai 2026
            </span>
            <span className="inline-flex items-center gap-1"><Calendar size={11} />Publié le 26 mai 2026</span>
            <span>·</span>
            <span>Anthony Malartre · Volia</span>
            <span>·</span>
            <span>10 min de lecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-content-primary">
            État du cold email B2B<br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">en France 2026</span>
          </h1>

          <p className="text-lg sm:text-xl text-content-secondary leading-relaxed mb-10 max-w-3xl">
            Les chiffres <strong className="text-content-primary">réalistes</strong> du cold email B2B en France — pas les
            chiffres de vitrine. Benchmarks publics attribués à leur source + données de couverture mesurées par Volia sur{' '}
            <strong className="text-content-primary">~40 000 entreprises</strong> analysées.
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
              <p className="text-sm sm:text-base text-content-secondary leading-relaxed mb-3">
                Ce benchmark distingue strictement deux types de chiffres :
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-content-secondary">
                <li>
                  <strong className="text-content-primary">Benchmarks publics</strong> — les chiffres de performance
                  (taux de réponse, poids des relances, longueur de séquence) proviennent d&apos;études publiques 2025-2026
                  et sont attribués individuellement à leur source (Belkins, Instantly, Built For B2B, thedigitalbloom, Mailforge).
                </li>
                <li>
                  <strong className="text-content-primary">Données Volia</strong> — uniquement des statistiques de
                  <em> couverture</em> réellement mesurées sur ~40 000 entreprises françaises analysées via Google Places :
                  provenance des emails, taux de découverte, présence d&apos;un site / d&apos;un téléphone.
                </li>
              </ul>
            </div>
            <p className="text-content-secondary leading-relaxed">
              Nous ne publions <strong className="text-content-primary">aucune statistique de performance de campagne en propre</strong>
              {' '}(taux d&apos;ouverture/réponse « Volia ») tant que notre échantillon n&apos;est pas statistiquement solide.
              Tout le contenu est sous licence Creative Commons BY 4.0 : libre de reproduction avec mention de la source.
            </p>
          </section>

          {/* ─── 2. LES CHIFFRES CLÉS ─── */}
          <section id="chiffres" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={24} className="text-violet-400" />
              2. Les chiffres clés du cold email B2B France 2026
            </h2>
            <p className="text-content-secondary leading-relaxed mb-8">
              Chaque chiffre est étiqueté : <span className="text-violet-300 font-semibold">benchmark public</span> (source externe)
              ou <span className="text-emerald-300 font-semibold">donnée Volia</span> (couverture mesurée). Conçus pour être cités,
              partagés et confrontés à votre propre expérience.
            </p>

            <div className="space-y-6">
              {KEY_STATS.map((stat, idx) => {
                const Icon = stat.icon;
                const isVolia = stat.kind === 'volia';
                return (
                  <div
                    key={stat.id}
                    id={stat.id}
                    className="rounded-2xl border border-line bg-surface-card p-5 sm:p-7 scroll-mt-24"
                  >
                    <div className="flex flex-col sm:flex-row gap-5 sm:gap-7">
                      <div className="flex-shrink-0 sm:w-44">
                        <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider font-semibold text-violet-400">
                          <Icon size={14} />
                          Chiffre #{idx + 1}
                        </div>
                        <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent leading-none">
                          {stat.number}
                        </div>
                        <div className={`mt-3 inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${isVolia ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-violet-500/10 border-violet-500/30 text-violet-300'}`}>
                          {isVolia ? 'Donnée Volia' : 'Benchmark public'}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-content-primary mb-3 leading-tight">
                          {stat.title}
                        </h3>
                        <p className="text-sm sm:text-base text-content-secondary leading-relaxed mb-4">
                          {stat.body}
                        </p>
                        {stat.quote && (
                          <blockquote className="border-l-2 border-violet-500/60 pl-4 italic text-sm text-content-secondary mb-3">
                            {stat.quote}
                          </blockquote>
                        )}
                        <div className="text-[10px] text-content-tertiary uppercase tracking-wider">Source : {stat.source}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ─── 3. COUVERTURE VOLIA ─── */}
          <section id="couverture" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Target size={24} className="text-violet-400" />
              3. Données de couverture Volia
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6">
              Ce que Volia mesure réellement sur le terrain, à partir d&apos;un échantillon de{' '}
              <strong className="text-content-primary">~40 000 entreprises françaises</strong> analysées (83 départements représentés).
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {COVERAGE_KPIS.map((k) => (
                <div key={k.l} className="rounded-xl border border-line bg-surface-card p-4 text-center">
                  <div className="text-xl font-bold text-violet-300">{k.v}</div>
                  <div className="text-[11px] text-content-tertiary mt-1 leading-snug">{k.l}</div>
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-content-primary mb-3">D&apos;où viennent les emails trouvés par Volia</h3>
            <div className="space-y-2 mb-3">
              {EMAIL_SOURCES.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-52 sm:w-64 text-sm text-content-secondary flex-shrink-0">{s.label}</div>
                  <div className="flex-1 h-7 rounded-md bg-surface-elevated overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(s.rate, 2)}%` }}
                    >
                      <span className="text-xs font-mono font-semibold text-white">{s.rate} %</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-content-tertiary mt-3 italic">
              Source : données de couverture agrégées Volia (Google Places + waterfall scraping/recherche), échantillon ~40 000 entreprises, 2025-2026.
            </p>
          </section>

          {/* ─── 4. RECOMMANDATIONS ─── */}
          <section id="recommandations" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
              <Lightbulb size={24} className="text-violet-400" />
              4. Recommandations actionnables
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

          {/* ─── 5. VISION 2027 ─── */}
          <section id="vision" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
              <Sparkles size={24} className="text-violet-400" />
              5. Vision 2027 : où va le cold email en France ?
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6 text-sm italic">
              Cette section est explicitement prospective : ce sont des opinions de Volia, pas des chiffres mesurés.
            </p>
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

          {/* ─── 6. PRESS KIT ─── */}
          <section id="presse" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <FileText size={24} className="text-violet-400" />
              6. Press kit
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6">
              Médias, journalistes, créateurs de contenu : tout pour relayer ce benchmark. Licence Creative Commons BY 4.0,
              libre de reproduction avec mention de la source (et attribution des chiffres marché à leur source d&apos;origine).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
                  Image 1200×630 optimisée Twitter/LinkedIn pour relayer le benchmark.
                </p>
              </Link>

              <Link
                href="/etude/prospection-b2b-france-2026"
                className="rounded-2xl border border-line bg-surface-card p-5 hover:border-violet-500/40 transition group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-violet-300" />
                  </div>
                  <h3 className="font-bold text-content-primary">Étude complémentaire</h3>
                </div>
                <p className="text-sm text-content-secondary pl-[52px]">
                  L&apos;État de la Prospection B2B en France 2026 — marché, coûts, RGPD, couverture.
                </p>
              </Link>
            </div>

            <div className="rounded-2xl border border-line bg-surface-card p-5">
              <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Quote size={14} />
                Citations attribuées à Anthony Malartre, fondateur de Volia
              </div>
              <div className="space-y-3 text-sm text-content-secondary">
                <blockquote className="border-l-2 border-violet-500/60 pl-4 italic">
                  « Le vrai chiffre du cold email B2B, c&apos;est 3 à 5 % de réponse, pas 15. Promettre mieux en moyenne,
                  c&apos;est vendre du rêve — et brûler la confiance des gens. »
                </blockquote>
                <blockquote className="border-l-2 border-violet-500/60 pl-4 italic">
                  « La moitié du travail se joue sur les relances : la majorité des réponses arrive après le premier mail.
                  Ceux qui s&apos;arrêtent trop tôt laissent leurs deals sur la table. »
                </blockquote>
                <blockquote className="border-l-2 border-violet-500/60 pl-4 italic">
                  « Volia ne devine jamais un email : 100 % sont vérifiés sur le site ou via recherche. Un email deviné
                  bounce et détruit votre délivrabilité — c&apos;est tout l&apos;inverse d&apos;une prospection sérieuse. »
                </blockquote>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface-card p-5 mt-4">
              <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Mail size={14} />
                Contact presse
              </div>
              <p className="text-sm text-content-secondary leading-relaxed">
                Pour interviews ou demandes média :
                <a
                  href="mailto:contact@volia.fr?subject=Demande presse — Benchmark Cold Email France 2026"
                  className="text-violet-400 hover:underline ml-1"
                >
                  contact@volia.fr
                </a>
                . Réponse sous 24h ouvrées. Anthony Malartre, fondateur de Volia, disponible pour interviews
                (français/anglais).
              </p>
            </div>
          </section>

          {/* ─── 7. FAQ ─── */}
          <section id="faq" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">7. FAQ</h2>
            <div className="space-y-3">
              {FAQ.map((item) => (
                <div key={item.question} className="rounded-2xl border border-line bg-surface-card p-5">
                  <h3 className="font-semibold text-content-primary mb-2">{item.question}</h3>
                  <p className="text-sm text-content-secondary leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── 8. CITER ─── */}
          <section id="citer" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Quote size={24} className="text-violet-400" />
              8. Citer ce benchmark
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6">
              Publié sous licence{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/deed.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:underline inline-flex items-center gap-1"
              >
                Creative Commons BY 4.0 <ExternalLink size={11} />
              </a>
              {' '}: libre de reproduction, citation et traduction avec mention de la source et lien actif
              vers <code className="text-violet-300">{STUDY_URL}</code>. Merci de conserver l&apos;attribution des chiffres
              marché à leur source d&apos;origine.
            </p>

            <EtudeCopyCitation studyUrl={STUDY_URL} publishedAt={PUBLISHED_AT} studyTitle={STUDY_TITLE} />
          </section>

          {/* ─── MÉTHODOLOGIE COMPLÈTE (footer) ─── */}
          <section className="mb-14 scroll-mt-24">
            <div className="rounded-2xl border border-line bg-surface-elevated/50 p-5">
              <h3 className="text-sm font-semibold text-violet-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText size={14} />
                Méthodologie complète & limites
              </h3>
              <div className="space-y-3 text-xs text-content-secondary leading-relaxed">
                <p>
                  <strong className="text-content-primary">Chiffres de performance</strong> : issus de benchmarks publics
                  2025-2026 (Belkins, Instantly, Built For B2B, thedigitalbloom, Mailforge), attribués individuellement.
                  Les méthodologies de ces sources diffèrent — à utiliser comme ordres de grandeur, pas comme vérités absolues.
                </p>
                <p>
                  <strong className="text-content-primary">Données de couverture Volia</strong> : mesurées sur un échantillon
                  de ~40 000 entreprises françaises identifiées via Google Places (83 départements représentés). Indicateurs :
                  provenance des emails (scraping site / recherche Google / pattern), taux de découverte d&apos;email parmi les
                  entreprises avec site web, présence d&apos;un téléphone / d&apos;un site.
                </p>
                <p>
                  <strong className="text-content-primary">Limites reconnues</strong> : (1) l&apos;échantillon Volia reflète les
                  recherches effectuées par ses utilisateurs et n&apos;est pas un recensement représentatif de toutes les entreprises
                  françaises ; (2) le taux de découverte d&apos;email est calculé sur les zones où l&apos;enrichissement a été lancé ;
                  (3) Volia ne publie aucune statistique de performance de campagne en propre faute d&apos;échantillon suffisant à ce jour ;
                  (4) la section « Vision 2027 » est explicitement prospective.
                </p>
              </div>
            </div>
          </section>

          {/* CTA final */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <Sparkles size={32} className="text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Lancez vos cold emails avec Volia</h2>
            <p className="text-content-secondary mb-6 max-w-xl mx-auto">
              25 crédits offerts chaque mois pour tester la plateforme française derrière ce benchmark.
              Prospection waterfall multi-sources + Campagnes. À partir de 19 €/mois.
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
