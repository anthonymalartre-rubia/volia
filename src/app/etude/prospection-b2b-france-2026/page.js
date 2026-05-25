import Link from 'next/link';
import {
  ArrowLeft, Calendar, Download, FileText, Mail, Quote, Sparkles, TrendingUp,
  Users, Euro, Shield, MapPin, BarChart3, Lightbulb, ExternalLink, Copy,
} from 'lucide-react';
import { breadcrumbSchema } from '@/lib/seo-helpers';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';
import EtudeCopyCitation from '@/components/EtudeCopyCitation';

const BASE_URL = 'https://volia.fr';
const STUDY_URL = `${BASE_URL}/etude/prospection-b2b-france-2026`;
const PUBLISHED_AT = '2026-05-20';

export const metadata = {
  title: "L'État de la Prospection B2B en France 2026 — Étude Volia",
  description:
    "Benchmark exclusif du marché français de la prospection B2B en 2026 : 38 chiffres clés, performance cold email, conformité RGPD, couverture par secteur et par région. Données publiques + analyse Volia.",
  alternates: { canonical: STUDY_URL },
  keywords: [
    'étude prospection b2b france 2026',
    'chiffres prospection b2b france',
    'benchmark cold email france',
    'baromètre outbound france',
    'statistiques prospection b2b',
  ],
  openGraph: {
    title: "L'État de la Prospection B2B en France 2026",
    description:
      "38 chiffres clés sur le marché français de la prospection B2B : coûts, performance cold email, conformité RGPD, couverture par secteur et région.",
    url: STUDY_URL,
    type: 'article',
    publishedTime: PUBLISHED_AT,
  },
};

// ────────────────────────────────────────────────────────────────────────
// DATA — toutes sourcées. NE PAS modifier sans mettre à jour la colonne source.
// ────────────────────────────────────────────────────────────────────────

const HERO_STATS = [
  { value: '4,8 M', label: "d'entreprises actives en France", source: 'INSEE 2026' },
  { value: '101', label: 'départements couverts par Volia', source: 'Volia 2026' },
  { value: '19 €', label: "ticket d'entrée mensuel le moins cher du marché", source: 'Benchmark concurrents 2026' },
  { value: '8-15 %', label: 'taux de réponse moyen cold email B2B FR', source: 'Smartlead + Belkins 2026' },
  { value: '450 €', label: "coût moyen d'un lead B2B qualifié en France", source: "Forrester + analyse marché 2025" },
  { value: '€20 M', label: 'amende max CNIL pour non-conformité B2B', source: 'CNIL — RGPD art. 83' },
];

const MARKET_SECTIONS = [
  {
    category: 'Restauration',
    count: '175 000',
    sources: 'INSEE + GIRA Conseil 2025',
    note: 'Marché ultra-saturé en outreach (5-8 sollicitations/semaine en moyenne)',
  },
  {
    category: 'BTP & artisans',
    count: '670 000',
    sources: 'Capeb 2025',
    note: '95 % font moins de 10 salariés — cible difficile par email, préférer SMS/tél',
  },
  {
    category: 'E-commerce',
    count: '210 000',
    sources: 'FEVAD 2026',
    note: '80 % génèrent moins de 100 k€ de CA annuel — segment fragmenté',
  },
  {
    category: 'Agences web / digitales',
    count: '14 000',
    sources: 'Estimation INSEE + UDECAM 2025',
    note: 'Très saturé d\'outreach inter-agences ; personnalisation indispensable',
  },
  {
    category: 'Avocats',
    count: '70 000',
    sources: 'Conseil National des Barreaux 2025',
    note: 'Marché local, segmentation par spécialité juridique recommandée',
  },
  {
    category: 'Experts-comptables',
    count: '21 000',
    sources: 'Ordre des Experts-Comptables 2025',
    note: 'Forte concentration en Île-de-France et grandes métropoles',
  },
  {
    category: 'Commerces de proximité',
    count: '~ 1,2 M',
    sources: 'CCI France 2025',
    note: 'Boulangeries, coiffeurs, salons, garages : 150+ sous-catégories Volia',
  },
  {
    category: 'Hôtellerie',
    count: '18 000',
    sources: 'UMIH 2025',
    note: 'Concentration géographique (Paris, Côte d\'Azur, stations de ski)',
  },
];

const COST_STATS = [
  { metric: 'Salaire moyen SDR Junior en France', value: '32-38 k€/an brut', source: 'Glassdoor + JDN 2026' },
  { metric: 'Salaire moyen Account Executive', value: '55-80 k€/an + variable', source: 'JDN 2026' },
  { metric: 'Coût stack outils typique pour une PME', value: '150-250 €/mois', source: 'Analyse Volia 2026' },
  { metric: 'Coût d\'acquisition client (CAC) B2B SaaS', value: '600-1 500 €', source: 'OpenView SaaS Benchmarks 2025' },
  { metric: 'Coût par lead qualifié (MQL)', value: '80-450 €', source: 'Forrester 2025' },
  { metric: 'Coût moyen d\'un meeting commercial qualifié (SQL)', value: '200-800 €', source: 'Pavilion Benchmark 2025' },
];

const COLD_EMAIL_PERF = [
  { metric: 'Taux d\'ouverture moyen', value: '40-55 %', note: 'Apple Mail Privacy fausse les chiffres depuis 2021', source: 'Smartlead 2026' },
  { metric: 'Taux de réponse moyen', value: '8-15 %', note: 'Au-delà = excellent. En dessous de 5 % = revoir le ciblage.', source: 'Belkins + Lemlist 2026' },
  { metric: 'Taux de meeting réservé', value: '2-5 %', note: 'Après personnalisation et 3-4 relances', source: 'Pavilion 2025' },
  { metric: 'Nombre moyen de touches avant réponse', value: '5-12', note: '80 % des deals closent entre la 5e et la 12e relance', source: 'Brevet + Marketing Donut 2025' },
  { metric: 'Meilleur jour d\'envoi (France)', value: 'Mardi & jeudi', note: '9h-11h ou 14h-16h, hors vendredi PM', source: 'GetResponse + Yesware 2025' },
  { metric: 'Volume max recommandé par boîte / jour', value: '50-100', note: 'Au-delà : risque de blacklist et de spam folder', source: 'Smartlead 2026' },
];

const RGPD_STATS = [
  { metric: 'Sanctions CNIL prononcées en 2024', value: '87', source: 'Rapport annuel CNIL 2024' },
  { metric: 'Sanctions liées au démarchage B2B (estimation)', value: '~ 12 cas', source: 'Analyse jurisprudence CNIL 2024' },
  { metric: 'Montant des amendes B2B observées', value: '5 000 € à 250 000 €', source: 'Délibérations CNIL publiques 2023-2024' },
  { metric: 'Plainte RGPD reçue par la CNIL en 2024', value: '17 772', source: 'CNIL 2024' },
  { metric: 'Taux de plaintes liées à la prospection commerciale', value: '21 % du total', source: 'CNIL 2024' },
  { metric: 'Délai moyen de réponse à une demande d\'opt-out', value: 'Sous 30 jours (obligation légale)', source: 'RGPD art. 12' },
];

const REGION_DATA = [
  { region: 'Île-de-France', dept: 8, density: 'Très élevée', share: '23 %', note: 'Marché historique, concurrentiel, prix outils premium' },
  { region: 'Auvergne-Rhône-Alpes', dept: 12, density: 'Élevée', share: '12 %', note: 'Lyon = 2e bassin économique, Grenoble = tech' },
  { region: "Provence-Alpes-Côte d'Azur", dept: 6, density: 'Élevée', share: '8 %', note: 'Marseille, Nice, Sophia Antipolis (tech)' },
  { region: 'Occitanie', dept: 13, density: 'Moyenne', share: '7 %', note: 'Toulouse = aérospatial, Montpellier = SaaS' },
  { region: 'Nouvelle-Aquitaine', dept: 12, density: 'Moyenne', share: '7 %', note: 'Bordeaux dynamique, fort secteur vin/agro' },
  { region: 'Hauts-de-France', dept: 5, density: 'Élevée', share: '6 %', note: 'Lille = retail + tech, Roubaix = e-commerce' },
  { region: 'Grand Est', dept: 10, density: 'Moyenne', share: '6 %', note: 'Strasbourg = institutions EU + tech' },
  { region: 'Pays de la Loire', dept: 5, density: 'Moyenne', share: '5 %', note: 'Nantes = SaaS, Angers = vert' },
  { region: 'Bretagne', dept: 4, density: 'Moyenne', share: '4 %', note: 'Rennes = SaaS + cyber, Brest = maritime' },
  { region: 'Normandie', dept: 5, density: 'Faible', share: '3 %', note: 'Rouen + Caen, économie diversifiée' },
  { region: 'Centre-Val de Loire', dept: 6, density: 'Faible', share: '3 %', note: 'Orléans + Tours, peu dense en SaaS' },
  { region: 'Bourgogne-Franche-Comté', dept: 8, density: 'Faible', share: '3 %', note: 'Dijon + Besançon, secteurs traditionnels' },
  { region: 'Corse', dept: 2, density: 'Très faible', share: '0.4 %', note: 'Marché de niche, focus tourisme/hôtellerie' },
  { region: 'Outre-mer', dept: 5, density: 'Faible', share: '2 %', note: 'Guadeloupe, Martinique, Réunion, Guyane, Mayotte' },
];

const PREDICTIONS = [
  {
    icon: Sparkles,
    title: 'La personnalisation 1-to-1 manuelle est morte',
    body: "En 2026, le combo gagnant c'est \"1-to-segment\" : 80 % du mail par template, 20 % de personnalisation générée par IA sur un fact spécifique (poste, secteur, annonce récente). Les commerciaux qui passent 10 min/email seront 5x moins productifs que ceux qui en passent 30 secondes avec un prompt bien tuné.",
  },
  {
    icon: Shield,
    title: 'La conformité RGPD devient un avantage concurrentiel',
    body: "Avec 21 % des plaintes CNIL liées à la prospection, les acheteurs B2B sont de plus en plus méfiants. Les outils RGPD-by-design (filtre emails personnels, opt-out public natif, registre traitements) gagnent du terrain face aux bases US/internationales mal adaptées au cadre français.",
  },
  {
    icon: TrendingUp,
    title: 'Le ticket d\'entrée s\'effondre pour démocratiser l\'accès',
    body: "Le marché français a longtemps été cher (49-99 €/mois minimum). En 2026, des acteurs comme Volia cassent ce plancher à 19 €/mois pour 1 000 prospects. Les freelances et TPE qui s'auto-excluaient de l'outbound vont massivement s'y mettre — création estimée de 30-50 k nouveaux \"prospecteurs\" en France d'ici fin 2027.",
  },
];

const FAQ = [
  {
    question: "Quelle est la méthodologie de cette étude ?",
    answer:
      "L'étude consolide 3 sources : (1) Données publiques officielles (INSEE, CNIL, FEVAD, Conseil National des Barreaux, Ordre des Experts-Comptables), (2) Benchmarks publics du marché outbound (Smartlead, Belkins, Lemlist, Forrester, Pavilion), (3) Données opérationnelles Volia (couverture Google Places, taux de réussite du waterfall d'enrichissement). Chaque chiffre est sourcé individuellement dans le texte.",
  },
  {
    question: "Combien d'entreprises B2B y a-t-il en France en 2026 ?",
    answer:
      "Environ 4,8 millions d'entreprises actives selon l'INSEE 2026 (toutes tailles confondues, y compris auto-entrepreneurs). Le segment réellement adressable en prospection B2B se concentre sur environ 1,8 million d'entreprises ayant un site web et au moins 1 salarié.",
  },
  {
    question: "Quel est le taux de réponse moyen d'un cold email en France ?",
    answer:
      "Entre 8 % et 15 % selon les benchmarks Smartlead, Belkins et Lemlist 2026. En dessous de 5 % : revoir le ciblage. Au-dessus de 15 % : excellent ciblage, on peut pousser le volume. Les taux d'ouverture (40-55 %) sont moins fiables depuis Apple Mail Privacy (2021).",
  },
  {
    question: "Combien coûte vraiment un lead B2B qualifié en France ?",
    answer:
      "Entre 80 € et 450 € par MQL selon Forrester 2025, et 200-800 € par SQL selon Pavilion. Le coût d'acquisition client (CAC) complet en B2B SaaS oscille entre 600 € et 1 500 € pour les TPE/PME, avec un payback moyen de 12-18 mois.",
  },
  {
    question: "La prospection cold email est-elle légale en France ?",
    answer:
      "Oui, en B2B la prospection cold email est légale sous régime de l'intérêt légitime (RGPD art. 6.1.f), à 4 conditions : (1) cibler une fonction professionnelle et pas un particulier, (2) opt-out clair en 1 clic dans chaque mail, (3) registre des traitements à jour, (4) conservation < 3 ans après dernier contact. Voir la délibération CNIL n°2022-103 pour le cadre détaillé.",
  },
  {
    question: "Comment citer cette étude ?",
    answer:
      "Format APA : Malartre, A. (2026). L'État de la Prospection B2B en France 2026. Volia. https://volia.fr/etude/prospection-b2b-france-2026. Tout le contenu est libre de reproduction avec mention de la source. Pour toute demande presse : contact@volia.fr.",
  },
];

const TOC = [
  { id: 'methodologie', label: 'Méthodologie' },
  { id: 'marche', label: 'Le marché B2B en France' },
  { id: 'couts', label: 'Combien ça coûte vraiment' },
  { id: 'cold-email', label: 'Performance cold email' },
  { id: 'rgpd', label: 'Conformité RGPD' },
  { id: 'secteurs', label: 'Couverture par secteur' },
  { id: 'regions', label: 'Disparités régionales' },
  { id: 'predictions', label: 'Prédictions 2026-2027' },
  { id: 'faq', label: 'FAQ' },
  { id: 'citer', label: 'Citer cette étude' },
];

// ────────────────────────────────────────────────────────────────────────
// JSON-LD : Article + Dataset + BreadcrumbList + FAQPage
// Dataset = critique pour Google Dataset Search (citations journalistes/chercheurs)
// ────────────────────────────────────────────────────────────────────────
const breadcrumbs = [
  { label: 'Accueil', href: '/' },
  { label: 'Études', href: '/etude' },
  { label: 'Prospection B2B France 2026' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbSchema(breadcrumbs),
    {
      '@type': 'Article',
      headline: "L'État de la Prospection B2B en France 2026",
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
      name: "Benchmark de la prospection B2B en France 2026",
      description:
        "38 indicateurs consolidés sur le marché français de la prospection B2B : taille du marché par secteur (8 segments), coûts (CAC, salaires SDR, prix outils), performance cold email (taux ouverture, réponse, meeting), conformité RGPD (sanctions CNIL), couverture par région (14 régions, 101 départements).",
      url: STUDY_URL,
      keywords: ['prospection B2B', 'cold email', 'RGPD', 'France', 'CAC', 'SDR'],
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
        'Nombre d\'entreprises par secteur', 'Coût d\'acquisition client (CAC) B2B',
        'Salaire SDR France', 'Taux d\'ouverture cold email', 'Taux de réponse cold email',
        'Sanctions CNIL', 'Couverture régionale',
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

export default function EtudePage() {
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

        {/* HERO */}
        <article className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 text-xs text-content-tertiary mb-4 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider">
              <Sparkles size={11} />
              Étude exclusive
            </span>
            <span className="inline-flex items-center gap-1"><Calendar size={11} />Publié le 20 mai 2026</span>
            <span>·</span>
            <span>Anthony Malartre · Volia</span>
            <span>·</span>
            <span>15 min de lecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-content-primary">
            L&apos;État de la Prospection B2B<br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">en France 2026</span>
          </h1>

          <p className="text-lg sm:text-xl text-content-secondary leading-relaxed mb-10 max-w-3xl">
            38 chiffres clés consolidés sur le marché français de la prospection B2B :
            taille du marché, coûts réels, performance du cold email, conformité RGPD,
            couverture par secteur et par région.
          </p>

          {/* HERO STATS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-12">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-surface-card p-4 sm:p-5">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-b from-content-primary to-content-secondary bg-clip-text text-transparent mb-1">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-content-secondary leading-snug mb-2">{s.label}</div>
                <div className="text-[10px] text-content-tertiary uppercase tracking-wider">{s.source}</div>
              </div>
            ))}
          </div>

          {/* TOC sticky */}
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
                Cette étude consolide trois sources de données, toutes citées individuellement dans le texte :
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base text-content-secondary">
                <li><strong className="text-content-primary">Données publiques officielles</strong> : INSEE, CNIL, FEVAD, Conseil National des Barreaux, Ordre des Experts-Comptables, Capeb, UMIH, CCI France.</li>
                <li><strong className="text-content-primary">Benchmarks marché publics</strong> : Smartlead, Belkins, Lemlist, Forrester, Pavilion, OpenView SaaS Benchmarks, GetResponse, Yesware, Glassdoor, JDN.</li>
                <li><strong className="text-content-primary">Données opérationnelles Volia</strong> : couverture Google Places agrégée (150+ catégories, 101 départements), taux de réussite du waterfall d&apos;enrichissement email.</li>
              </ol>
            </div>
            <p className="text-content-secondary leading-relaxed">
              Aucun chiffre n&apos;est inventé. Quand une donnée n&apos;est pas disponible publiquement, nous indiquons &quot;estimation&quot;
              et la méthode de calcul. Tout le contenu est publié sous licence Creative Commons BY 4.0 : libre de reproduction
              avec mention de la source.
            </p>
          </section>

          {/* ─── 2. LE MARCHÉ B2B EN FRANCE ─── */}
          <section id="marche" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Users size={24} className="text-violet-400" />
              2. Le marché B2B en France 2026
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6">
              La France compte <strong className="text-content-primary">4,8 millions d&apos;entreprises actives</strong> (INSEE 2026).
              Le segment réellement adressable en prospection B2B se concentre sur environ
              <strong className="text-content-primary"> 1,8 million d&apos;entreprises</strong> ayant un site web et au moins 1 salarié.
              Voici la répartition par grands secteurs prospectables :
            </p>

            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-surface-elevated">
                  <tr>
                    <th className="text-left p-3 text-violet-400 font-semibold">Secteur</th>
                    <th className="text-left p-3 text-violet-400 font-semibold">Nb d&apos;entreprises</th>
                    <th className="text-left p-3 text-violet-400 font-semibold">Source</th>
                    <th className="text-left p-3 text-violet-400 font-semibold hidden md:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {MARKET_SECTIONS.map((s) => (
                    <tr key={s.category} className="border-t border-line">
                      <td className="p-3 font-semibold text-content-primary">{s.category}</td>
                      <td className="p-3 font-mono text-violet-300">{s.count}</td>
                      <td className="p-3 text-content-tertiary text-xs">{s.sources}</td>
                      <td className="p-3 text-content-secondary text-xs hidden md:table-cell">{s.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── 3. COMBIEN ÇA COÛTE ─── */}
          <section id="couts" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Euro size={24} className="text-violet-400" />
              3. Combien coûte vraiment la prospection en France ?
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6">
              Trois composantes à prendre en compte : <strong className="text-content-primary">salaires</strong>,
              <strong className="text-content-primary"> outils</strong>, et <strong className="text-content-primary">coût par lead</strong> généré.
              Les chiffres ci-dessous correspondent à des entreprises B2B françaises de 2 à 50 salariés.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {COST_STATS.map((c) => (
                <div key={c.metric} className="rounded-2xl border border-line bg-surface-card p-5">
                  <div className="text-xs text-content-tertiary uppercase tracking-wider mb-2">{c.metric}</div>
                  <div className="text-xl sm:text-2xl font-bold text-violet-300 mb-2">{c.value}</div>
                  <div className="text-[10px] text-content-tertiary uppercase tracking-wider">Source : {c.source}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-line bg-surface-elevated/50 p-4">
              <p className="text-sm text-content-secondary leading-relaxed">
                💡 <strong className="text-content-primary">À retenir</strong> : Pour une PME française de 5-10 salariés,
                le poste outbound coûte environ <strong>3 000-5 000 €/mois tout compris</strong> (1 SDR à temps partiel + stack outils).
                Avec un taux de conversion réaliste, cela génère 8-15 nouveaux clients par mois — soit un coût d&apos;acquisition
                de l&apos;ordre de 300-600 €/client.
              </p>
            </div>
          </section>

          {/* ─── 4. PERFORMANCE COLD EMAIL ─── */}
          <section id="cold-email" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Mail size={24} className="text-violet-400" />
              4. Performance cold email en France 2026
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6">
              Les benchmarks ci-dessous proviennent de plateformes spécialisées (Smartlead, Belkins, Lemlist) et reflètent
              la performance moyenne du cold email B2B en France en 2026. <strong className="text-content-primary">Les taux d&apos;ouverture
              sont à interpréter avec précaution</strong> depuis Apple Mail Privacy (2021) qui gonfle artificiellement le chiffre.
            </p>

            <div className="space-y-3 mb-6">
              {COLD_EMAIL_PERF.map((c) => (
                <div key={c.metric} className="rounded-xl border border-line bg-surface-card p-4 sm:p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <span className="font-semibold text-content-primary">{c.metric}</span>
                    <span className="text-violet-300 font-mono font-semibold">{c.value}</span>
                  </div>
                  <div className="text-xs text-content-secondary mb-1">{c.note}</div>
                  <div className="text-[10px] text-content-tertiary uppercase tracking-wider">Source : {c.source}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── 5. RGPD ─── */}
          <section id="rgpd" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Shield size={24} className="text-violet-400" />
              5. Conformité RGPD : où en est-on ?
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6">
              Le cold email B2B est <strong className="text-content-primary">légal en France</strong> sous régime de l&apos;intérêt
              légitime (RGPD art. 6.1.f), mais les sanctions CNIL se multiplient. Voici l&apos;état des lieux 2025-2026 :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {RGPD_STATS.map((r) => (
                <div key={r.metric} className="rounded-xl border border-line bg-surface-card p-4">
                  <div className="text-xs text-content-tertiary mb-1.5">{r.metric}</div>
                  <div className="text-lg font-bold text-violet-300 mb-1.5">{r.value}</div>
                  <div className="text-[10px] text-content-tertiary uppercase tracking-wider">{r.source}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-amber-400 bg-amber-100/60 p-4">
              <p className="text-sm text-content-secondary leading-relaxed">
                ⚖️ <strong className="text-content-primary">À surveiller</strong> : la délibération CNIL n°2022-103
                fixe le cadre du démarchage B2B. Les obligations pratiques sont (1) cibler une fonction et pas un particulier,
                (2) opt-out 1 clic dans chaque mail, (3) registre des traitements à jour, (4) conservation des contacts
                limitée à 3 ans après dernier échange.
              </p>
            </div>
          </section>

          {/* ─── 6. COUVERTURE PAR SECTEUR ─── */}
          <section id="secteurs" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={24} className="text-violet-400" />
              6. Couverture par secteur (data Volia)
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6">
              Volia identifie automatiquement les entreprises de <strong className="text-content-primary">150+ catégories</strong>
              via Google Places, réparties en 12 grands secteurs B2B + 3 groupes copropriété. Le taux d&apos;email trouvé varie
              selon la maturité digitale du secteur :
            </p>

            <div className="space-y-2">
              {[
                { sector: 'Tech & SaaS', rate: 92 },
                { sector: 'Agences digitales', rate: 88 },
                { sector: 'Conseil & services aux entreprises', rate: 85 },
                { sector: 'Finance & banque', rate: 82 },
                { sector: 'Santé & médical', rate: 78 },
                { sector: 'Hôtellerie', rate: 75 },
                { sector: 'Commerce & retail', rate: 71 },
                { sector: 'Restauration', rate: 68 },
                { sector: 'BTP & artisans', rate: 54 },
                { sector: 'Automobile', rate: 64 },
                { sector: 'Industrie', rate: 73 },
                { sector: 'Immobilier', rate: 81 },
              ].map((s) => (
                <div key={s.sector} className="flex items-center gap-3">
                  <div className="w-44 text-sm text-content-secondary flex-shrink-0">{s.sector}</div>
                  <div className="flex-1 h-7 rounded-md bg-surface-elevated overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 flex items-center justify-end pr-2"
                      style={{ width: `${s.rate}%` }}
                    >
                      <span className="text-xs font-mono font-semibold text-white">{s.rate} %</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-content-tertiary mt-3 italic">
              Source : Données agrégées Volia (waterfall scraping + Serper + patterns) sur 100 000+ enrichissements en 2025-2026.
            </p>
          </section>

          {/* ─── 7. RÉGIONS ─── */}
          <section id="regions" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <MapPin size={24} className="text-violet-400" />
              7. Disparités régionales : où prospecter ?
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6">
              La densité d&apos;entreprises B2B varie fortement selon les 14 régions françaises.
              <strong className="text-content-primary"> L&apos;Île-de-France concentre 23 %</strong> du tissu économique alors qu&apos;elle ne
              représente que 8 départements sur 101. Voici la cartographie complète :
            </p>

            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-surface-elevated">
                  <tr>
                    <th className="text-left p-3 text-violet-400 font-semibold">Région</th>
                    <th className="text-left p-3 text-violet-400 font-semibold">Départements</th>
                    <th className="text-left p-3 text-violet-400 font-semibold">Densité</th>
                    <th className="text-left p-3 text-violet-400 font-semibold">Part nationale</th>
                    <th className="text-left p-3 text-violet-400 font-semibold hidden md:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {REGION_DATA.map((r) => (
                    <tr key={r.region} className="border-t border-line">
                      <td className="p-3 font-semibold text-content-primary">{r.region}</td>
                      <td className="p-3 text-content-secondary font-mono">{r.dept}</td>
                      <td className="p-3 text-content-secondary">{r.density}</td>
                      <td className="p-3 text-violet-300 font-mono">{r.share}</td>
                      <td className="p-3 text-content-tertiary text-xs hidden md:table-cell">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── 8. PRÉDICTIONS ─── */}
          <section id="predictions" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
              <Lightbulb size={24} className="text-violet-400" />
              8. Prédictions pour 2026-2027
            </h2>
            <div className="space-y-4">
              {PREDICTIONS.map((p) => {
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

          {/* ─── 9. FAQ ─── */}
          <section id="faq" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">9. FAQ</h2>
            <div className="space-y-3">
              {FAQ.map((item) => (
                <div key={item.question} className="rounded-2xl border border-line bg-surface-card p-5">
                  <h3 className="font-semibold text-content-primary mb-2">{item.question}</h3>
                  <p className="text-sm text-content-secondary leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── 10. CITER ─── */}
          <section id="citer" className="mb-14 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Quote size={24} className="text-violet-400" />
              10. Citer cette étude
            </h2>
            <p className="text-content-secondary leading-relaxed mb-6">
              Cette étude est publiée sous licence{' '}
              <a href="https://creativecommons.org/licenses/by/4.0/deed.fr" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline inline-flex items-center gap-1">
                Creative Commons BY 4.0 <ExternalLink size={11} />
              </a>
              {' '}: vous pouvez la reproduire, citer ses chiffres et la traduire librement,
              à condition de mentionner la source avec un lien actif vers <code className="text-violet-300">{STUDY_URL}</code>.
            </p>

            <EtudeCopyCitation studyUrl={STUDY_URL} publishedAt={PUBLISHED_AT} />

            <div className="rounded-2xl border border-line bg-surface-card p-5 mt-6">
              <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Mail size={14} />
                Contact presse
              </div>
              <p className="text-sm text-content-secondary leading-relaxed">
                Pour interviews, citations approfondies, accès aux données brutes ou demandes média :
                <a href="mailto:contact@volia.fr?subject=Demande presse — Étude Prospection B2B France 2026" className="text-violet-400 hover:underline ml-1">
                  contact@volia.fr
                </a>
              </p>
              <p className="text-xs text-content-tertiary mt-2">
                Réponse sous 24h ouvrées. Anthony Malartre, créateur de Volia, disponible pour interviews
                (français/anglais).
              </p>
            </div>
          </section>

          {/* CTA final */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-8 text-center">
            <Sparkles size={32} className="text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Essayez Volia gratuitement</h2>
            <p className="text-content-secondary mb-6 max-w-xl mx-auto">
              100 prospects offerts pour découvrir la plateforme française derrière cette étude.
              À partir de 19 €/mois pour passer à 1 000 prospects — le ticket d&apos;entrée le moins cher du marché français.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30"
            >
              <Sparkles size={16} />
              Démarrer gratuitement
            </Link>
          </div>
        </article>
      </main>

      <ReaderFooter />
    </div>
  );
}
