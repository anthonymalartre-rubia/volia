'use client';

// ─────────────────────────────────────────────────────────────────────
// /pricing — page tarification standalone Volia (client component)
// ─────────────────────────────────────────────────────────────────────
// Copy intégrée depuis audit-prive/copy-one-pricing-volia.md (section
// « PAGE /pricing »), conforme à la Bible de marque Volia. Tutoiement,
// « 19 €/mois » (espace avant €), un seul ✈️ (CTA final), zéro lexique
// banni.
//
// Structure (doc source) :
//   1. Hero (variante 2 « medium » par défaut) + barre de réassurance
//   2. Les 3 cartes (Gratuit / Prospection / MAX) — MAX en 3e position,
//      badge factuel « Pour un flux régulier »
//   3. Ligne d'appui + encart MAX99 + anti-vente
//   4. Un crédit c'est quoi · Ce que Volia ne fait pas · Prospection ou
//      MAX · tableau comparatif · On prospecte dans les règles · Et les
//      outils américains
//   5. FAQ tarifaire (8 Q/R)
//   6. CTA final (seul ✈️ de la page)
//
// NOTE : la copy des cartes (prix, promesse, features, CTA) est LOCALE
// (verbatim du doc source), PAS tirée de lib/plans.js — plans.js.features
// est consommé par d'autres surfaces (settings, admin, webhook,
// PricingContentEN…) et son wording diffère de cette copy marketing. Les
// montants (0 € / 19 € / 179 € / MAX99) restent alignés sur plans.js.
//
// Forcé en light mode (cohérence pages marketing Volia).
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import Link from 'next/link';
import {
  Check, ChevronDown, ArrowRight, Sparkles,
} from 'lucide-react';
import { useForceLightTheme } from '@/lib/use-force-light-theme';
import MotionInView from '@/components/MotionInView';
import MarketingHeader from '@/components/MarketingHeader';
import ReaderFooter from '@/components/ReaderFooter';

// ─── Les 3 cartes (bloc de décision) ────────────────────────────
// Copy verbatim du doc source. MAX en 3e position (crescendo voir →
// piloter → déléguer), badge factuel « Pour un flux régulier »
// (jamais « Populaire » : aucun chiffre publié ne le prouve).
const CARDS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0 €',
    promise: 'Tape ton domaine. Vois tes vrais leads. Juge sur pièces.',
    features: [
      'Tape ton domaine : tes leads s’affichent, emails complets débloqués.',
      '25 crédits Prospection pour tester sur ton vrai marché, pas sur une démo.',
      'Chaque email arrive avec son score de confiance : Vérifié, Google ou Probable. Tu sais ce que tu tiens.',
      'Les 5 modules ouverts, avec quotas. Assez pour te faire un avis.',
      'Filtre RGPD des emails personnels activé d’office. Tu prospectes propre dès le premier jour.',
    ],
    cta: 'Voir mes leads — 0 €',
    microcopy: '0 €. Et ça reste gratuit.',
    href: '/signup?plan=free',
    badge: null,
  },
  {
    id: 'prospection',
    name: 'Prospection',
    price: '19 €/mois',
    promise: 'Volia One en solo : il trouve et rédige, tu pilotes.',
    features: [
      '500 crédits par mois : de quoi alimenter ton pipeline chaque semaine.',
      'L’IA rédige tes cold emails à partir de ton activité. Tu modifies, tu valides, tu signes — c’est ton nom en bas.',
      'Email + téléphone + score de confiance, sur 101 départements et 150+ catégories.',
      'Warmup progressif de ton domaine : tes envois montent en puissance proprement.',
      'Sans engagement. Tu annules en 2 clics, depuis ton compte.',
    ],
    cta: 'Prospecter à 19 €/mois',
    microcopy: 'Sans engagement. Moins cher que ton forfait mobile.',
    href: '/signup?plan=prospection',
    badge: null,
  },
  {
    id: 'max',
    name: 'MAX',
    price: '179 €/mois',
    promise: 'Pendant que tu bosses, Volia prospecte. L’Autopilot fait tourner One 24/7, selon tes règles.',
    features: [
      'Autopilot : tu écris les règles — ton, secteurs, exclusions, plafonds. One les applique, jour et nuit.',
      '2 000 crédits par mois. Un gros mois ? Ajoute un pack ponctuel, sans changer de plan.',
      'Toute la suite : Prospection, Campagnes, CRM, Formulaires, Project. Un seul login.',
      'Une réponse reçue = un contact créé dans ton CRM. Tu ne recopies plus rien.',
      'L’Autopilot suit tes règles. Il ne décide jamais à ta place.',
    ],
    cta: 'Activer l’Autopilot',
    microcopy: 'Code MAX99 : 3 premiers mois à 99 € au lieu de 179 €.',
    href: '/signup?plan=max',
    badge: 'Pour un flux régulier',
  },
];

// ─── Tableau comparatif ──────────────────────────────────────────
// « Des faits en lignes, pas des coches marketing. »
// Cellule modules du plan Prospection = « One en solo » (doc source).
const COMPARE_ROWS = [
  ['Prix', '0 €', '19 €/mois', '179 €/mois'],
  ['Crédits Prospection', '25', '500 / mois', '2 000 / mois'],
  ['Volia One (domaine → leads + emails)', true, true, true],
  ['Score de confiance (Vérifié / Google / Probable)', true, true, true],
  ['Email + téléphone (101 dépts, 150+ catégories)', true, true, true],
  ['L’IA rédige, tu valides et tu signes', true, true, true],
  ['Autopilot 24/7 selon tes règles', false, false, true],
  ['Les 5 modules', 'Avec quotas', 'One en solo', 'Suite complète'],
  ['Warmup progressif du domaine', true, true, true],
  ['Filtre RGPD, opt-out public, DPA', true, true, true],
  ['Sans engagement, annulable en 2 clics', true, true, true],
];

// ─── FAQ tarifaire — 8 Q/R (doc source) ──────────────────────────
const FAQ_PRICING = [
  {
    q: '« Sans engagement », c’est vraiment sans engagement ?',
    a: 'Oui. Abonnement mensuel, annulable en 2 clics depuis ton compte. Pas de préavis, pas d’email à envoyer, personne à convaincre au téléphone. Tu gardes l’accès jusqu’à la fin du mois payé. Tu annules, ça s’arrête. C’est tout.',
  },
  {
    q: 'Un crédit, c’est quoi exactement ?',
    a: 'L’unité qui paie le travail de recherche d’un prospect : l’entreprise, l’email, le téléphone, le score de confiance. On cherche d’abord sur leur site. Pas trouvé ? On fouille Google. Toujours rien ? On teste les formats classiques — et on te marque « Probable ». 25 crédits en Gratuit, 500 par mois en Prospection, 2 000 par mois en MAX.',
  },
  {
    q: 'Il me faut plus de crédits ce mois-ci. Je fais quoi ?',
    a: 'Tu ajoutes un pack ponctuel. Paiement unique, pas un deuxième abonnement. Ton plan ne bouge pas, ton prix mensuel non plus. Le prix du pack est affiché au moment de l’achat.',
  },
  {
    q: 'MAX99, où est l’entourloupe ?',
    a: 'Il n’y en a pas, et voilà les termes complets : 3 premiers mois de MAX à 99 € au lieu de 179 €. Au 4e mois, 179 €/mois, le prix normal. Tu peux annuler avant, pendant, après — en 2 clics. On te le dit ici pour que tu ne le découvres jamais sur une facture.',
  },
  {
    q: 'Prospection ou MAX : la vraie différence ?',
    a: 'Le pilote. Avec Prospection, tu lances One quand tu veux : il trouve, il rédige, tu valides. Avec MAX, l’Autopilot fait tourner One 24/7 selon tes règles — ton, secteurs, exclusions, plafonds. Plus 2 000 crédits au lieu de 500, et toute la suite. Si tu as le temps de piloter chaque semaine, Prospection te suffit. On te le dit franchement.',
  },
  {
    q: 'Et si le gratuit me suffit ?',
    a: 'Alors reste gratuit, sans culpabilité. Ce plan n’est pas un appât, c’est notre argument commercial : voir avant de croire. Le jour où tes 25 crédits ne suffisent plus, tu sauras exactement pourquoi tu passes à 19 €/mois. Et si ce jour n’arrive pas, tu n’auras rien payé pour l’apprendre.',
  },
  {
    q: 'Comment je paie ? Comment j’annule ?',
    a: 'Carte bancaire, paiement sécurisé par Stripe — on ne voit jamais ton numéro. Tes factures sont dans ton espace. Pour annuler : ton compte, 2 clics, à tout moment. Tu changes de plan dans les deux sens, quand tu veux. Pas de rétention déguisée, pas de « appelez-nous pour résilier ».',
  },
  {
    q: 'Et le RGPD, concrètement ?',
    a: 'La prospection B2B est légale en France (base : intérêt légitime). Volia est construit pour rester dans les clous : données professionnelles uniquement, filtre automatique des emails personnels, page d’opt-out publique, DPA téléchargeable. Ton juriste veut vérifier ? Le DPA se télécharge, il n’y a rien à nous demander. Quel que soit ton plan.',
  },
];

// ─── Composant principal ─────────────────────────────────────────
export default function PricingContent() {
  useForceLightTheme();
  const [openFaq, setOpenFaq] = useState(null);

  // Helper rendu cellule comparatif (fait booléen ou valeur texte)
  function renderCell(value) {
    if (value === true) return <Check size={16} className="text-emerald-500 mx-auto" aria-label="Inclus" />;
    if (value === false) return <span className="text-content-muted mx-auto" aria-hidden="true">—</span>;
    return <span className="text-xs text-content-secondary">{value}</span>;
  }

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <MarketingHeader />

      <main className="pt-24 pb-12">
        {/* ─── 1. HERO ───────────────────────────────────────── */}
        {/* Variante 2 « medium » = défaut (signature n°10 de la bible).
            Variantes A/B en réserve (ne pas décommenter sans instrumenter) :

            Variante 1 — sobre :
            H1 : « Trois plans. Zéro piège. »
            Sous-titre : « Gratuit pour voir tes leads. 19 €/mois pour
            prospecter. 179 €/mois pour que ça tourne selon tes règles, 24/7. »
            CTA : « Voir mes leads — 0 € » · Microcopy : « Ton domaine
            suffit. Tu juges sur pièces. »

            Variante 3 — audacieuse :
            H1 : « Tu cherches le piège. C'est normal. »
            Sous-titre : « Alors on a tout mis à plat : prix, crédits,
            annulation, RGPD. Et même ce que Volia ne sait pas faire. »
            CTA : « Chercher le piège — c'est gratuit » · Microcopy :
            « Spoiler : il n'y en a pas. Vérifie quand même. » */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center mb-12">
          <MotionInView>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-xs font-medium text-violet-700 mb-6">
              <Sparkles size={12} />
              Les prix. Sans bullshit.
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
              0 € pour voir.<br />19 € pour prospecter.<br />179 € pour ne plus y penser.
            </h1>
            <p className="text-lg sm:text-xl text-content-secondary leading-relaxed max-w-2xl mx-auto mb-8">
              Tape ton domaine. Volia trouve tes prospects, écrit tes emails,
              remplit ton pipeline. Toi, tu choisis la cadence.
            </p>

            <Link
              href="/one"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition shadow-lg shadow-violet-500/20"
            >
              Je tape mon domaine <ArrowRight size={14} />
            </Link>
            <p className="text-xs text-content-tertiary mt-3 mb-8">
              30 secondes. 0 €. Tu juges sur pièces.
            </p>

            {/* Barre de réassurance sous le hero — 3 items, une ligne */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-content-tertiary">
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> Sans engagement, annulable en 2 clics</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> RGPD par construction</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> Gratuit pour vérifier avant de croire</span>
            </div>
          </MotionInView>
        </section>

        {/* ─── 2. LES 3 CARTES (bloc de décision) ─────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {CARDS.map((card, idx) => {
              const isMax = card.id === 'max';
              return (
                <MotionInView key={card.id} delay={idx * 80}>
                  <div
                    className={`relative h-full p-6 rounded-2xl border flex flex-col ${
                      isMax
                        ? 'border-amber-400 ring-2 ring-amber-400/30 bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-50 md:-mt-2 md:mb-2 shadow-lg shadow-amber-500/10'
                        : card.id === 'prospection'
                          ? 'border-violet-300 bg-violet-50/40'
                          : 'border-line bg-surface-card'
                    }`}
                  >
                    {/* Badge factuel — jamais « Populaire » */}
                    {card.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[11px] font-semibold rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg whitespace-nowrap">
                        {card.badge}
                      </div>
                    )}

                    <h3 className={`text-lg font-semibold mb-1 ${
                      isMax ? 'text-amber-700' : card.id === 'prospection' ? 'text-violet-700' : 'text-content-tertiary'
                    }`}>
                      {card.name}
                    </h3>

                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-4xl font-bold text-content-primary">{card.price}</span>
                    </div>

                    <p className="text-sm font-medium text-content-primary mb-5 min-h-[48px]">
                      {card.promise}
                    </p>

                    <Link
                      href={card.href}
                      className={`block w-full py-3 text-center text-sm font-semibold rounded-xl transition mb-1.5 ${
                        isMax
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/20'
                          : card.id === 'prospection'
                            ? 'bg-content-primary text-surface-base hover:bg-content-secondary'
                            : 'border border-line-hover hover:bg-surface-elevated text-content-secondary'
                      }`}
                    >
                      {card.cta}
                    </Link>
                    <p className="text-[11px] text-content-tertiary mb-5 text-center">
                      {card.microcopy}
                    </p>

                    <div className="space-y-2.5 flex-1 pt-4 border-t border-line">
                      {card.features.map((f) => (
                        <div key={f} className="flex items-start gap-2">
                          <Check
                            size={14}
                            className={`mt-0.5 flex-shrink-0 ${isMax ? 'text-amber-500' : 'text-violet-500'}`}
                          />
                          <span className="text-xs text-content-secondary leading-relaxed">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </MotionInView>
              );
            })}
          </div>

          {/* Ligne d'appui sous la grille */}
          <p className="mt-8 text-center text-sm text-content-secondary max-w-2xl mx-auto">
            19 €, c’est toi qui prospectes avec Volia. 179 €, c’est Volia qui
            prospecte selon tes règles.
          </p>
        </section>

        {/* ─── 3. ENCART MAX99 + ANTI-VENTE ───────────────────── */}
        {/* Une ligne, pas une bannière. DGCCRF-proof : pas de prix barré,
            pas de compte à rebours, le prix du 4e mois annoncé maintenant. */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-20">
          <MotionInView>
            <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 p-5 sm:p-6">
              <p className="text-sm sm:text-base text-amber-900">
                <strong>Code MAX99</strong> : les 3 premiers mois de MAX à
                99 € au lieu de 179 €. Au 4e mois, tarif normal : 179 €/mois —
                on te le dit maintenant, pas sur la facture. Trois mois pour
                juger l’Autopilot sur pièces. Tu annules quand tu veux, en
                2 clics.
              </p>
              <p className="text-xs text-amber-800/90 italic mt-3">
                Pas sûr d’avoir besoin de MAX ? Alors tu n’en as pas besoin
                aujourd’hui. Commence gratuit, passe à 19 €/mois, et monte quand
                tes soirées n’y suffisent plus.
              </p>
            </div>
          </MotionInView>
        </section>

        {/* ─── 4a. UN CRÉDIT, C'EST QUOI ? ────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
          <MotionInView>
            <h2 className="text-2xl sm:text-3xl font-bold mb-5">Un crédit, c’est quoi ?</h2>
            <div className="space-y-3 text-content-secondary leading-relaxed">
              <p>
                C’est l’unité qui paie le travail de recherche d’un prospect :
                l’entreprise, l’email, le téléphone, le score de confiance.
              </p>
              <p>
                On cherche d’abord sur leur site. Pas trouvé ? On fouille Google.
                Toujours rien ? On teste les formats classiques — et on te marque
                « Probable ».
              </p>
              <p>
                Ils se rechargent chaque mois : 500 en Prospection, 2 000 en MAX.
                Le compte gratuit en donne 25 — assez pour tester sur ton vrai
                marché.
              </p>
              <p>
                Un gros mois ? Des packs ponctuels existent, sans changer
                d’abonnement. Prix affiché au moment de l’achat.
              </p>
            </div>
          </MotionInView>
        </section>

        {/* ─── 4b. CE QUE VOLIA NE FAIT PAS ───────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-20">
          <MotionInView>
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">Ce que Volia ne fait pas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl border border-line bg-surface-card">
                <h3 className="text-base font-semibold text-content-primary mb-3">Volia n’envoie rien sans toi.</h3>
                <p className="text-sm text-content-secondary leading-relaxed">
                  L’IA rédige des brouillons de cold emails. Toi, tu modifies, tu
                  valides, tu signes. C’est ton nom en bas. Même l’Autopilot suit
                  tes règles : ton ton, tes secteurs, tes exclusions, tes plafonds.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-line bg-surface-card">
                <h3 className="text-base font-semibold text-content-primary mb-3">Volia ne garantit pas tes résultats.</h3>
                <p className="text-sm text-content-secondary leading-relaxed">
                  Personne d’honnête ne le fait. Ni l’inbox garantie, d’ailleurs.
                  Ce qu’on fait : des prospects joignables, un warmup progressif
                  de ton domaine, un envoi dans les règles. Signer, c’est ton métier.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-line bg-surface-card">
                <h3 className="text-base font-semibold text-content-primary mb-3">Volia ne trouve pas tout.</h3>
                <p className="text-sm text-content-secondary leading-relaxed">
                  Sur une niche très étroite, il y a parfois peu de résultats. On
                  préfère te le montrer gratuitement que te le faire payer. Et
                  « Probable » veut dire probable : chaque email affiche son score
                  de confiance.
                </p>
              </div>
            </div>
          </MotionInView>
        </section>

        {/* ─── 4c. PROSPECTION OU MAX ? ───────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
          <MotionInView>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Prospection ou MAX ?</h2>
            <p className="text-content-tertiary mb-6">Choisis le moins cher qui te suffit.</p>

            <div className="space-y-2.5 mb-6">
              <p className="text-content-secondary">
                Tu veux vérifier que ça marche sur ton secteur → <strong className="text-content-primary">Gratuit</strong>.
              </p>
              <p className="text-content-secondary">
                Tu veux prospecter chaque semaine en gardant la main → <strong className="text-content-primary">Prospection</strong>.
              </p>
              <p className="text-content-secondary">
                Tu veux un flux régulier sans y passer tes soirées → <strong className="text-content-primary">MAX</strong>.
              </p>
            </div>

            <div className="space-y-3 text-content-secondary leading-relaxed mb-6">
              <p>
                Sur Prospection, c’est toi qui appuies. Chaque recherche, chaque
                envoi : ta main, ta validation.
              </p>
              <p>
                Sur MAX, tu écris les règles une fois : ton, secteurs, exclusions,
                plafonds. L’Autopilot les applique, jour et nuit. Une réponse
                arrive ? Le contact est créé dans ton CRM. Toi, tu réponds aux
                intéressés. Pendant que tu bosses, Volia prospecte.
              </p>
              <p>
                179 €/mois, c’est cher ? Compare au stack qu’il remplace : Apollo
                + Lemlist + intégrations. En dollars, en anglais, en plusieurs
                logins. Ou à une demi-journée de commercial.
              </p>
            </div>

            <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-5">
              <p className="text-content-primary font-semibold mb-1">
                Tu hésites entre deux ? Prends le moins cher.
              </p>
              <p className="text-sm text-content-secondary">
                On préfère que tu montes en gamme par besoin, pas par peur de
                rater quelque chose.
              </p>
            </div>
          </MotionInView>
        </section>

        {/* ─── 4d. TABLEAU COMPARATIF ─────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
          <MotionInView>
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Le détail, pour ceux qui vérifient.</h2>
              <p className="text-content-tertiary">Tu veux le détail ? Le voilà.</p>
            </div>

            {/* Desktop : tableau dense */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-line bg-surface-card shadow-sm">
              <table className="w-full min-w-[640px]">
                <thead className="bg-surface-card border-b border-line">
                  <tr>
                    <th className="text-left text-xs font-semibold text-content-tertiary uppercase tracking-wider px-5 py-4 w-[40%]" />
                    <th className="text-center text-sm font-bold text-content-primary px-3 py-4 w-[20%]">Gratuit</th>
                    <th className="text-center text-sm font-bold text-content-primary px-3 py-4 w-[20%]">Prospection</th>
                    <th className="text-center text-sm font-bold text-content-primary px-3 py-4 w-[20%]">MAX</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, ri) => (
                    <tr
                      key={row[0]}
                      className={`border-b border-line/60 ${ri % 2 === 1 ? 'bg-surface-elevated/30' : ''}`}
                    >
                      <td className="px-5 py-3 text-sm text-content-secondary">{row[0]}</td>
                      <td className="px-3 py-3 text-center">{renderCell(row[1])}</td>
                      <td className="px-3 py-3 text-center">{renderCell(row[2])}</td>
                      <td className="px-3 py-3 text-center">{renderCell(row[3])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile : lignes empilées, 3 mini-colonnes */}
            <div className="md:hidden space-y-2">
              {COMPARE_ROWS.map((row) => (
                <div key={row[0]} className="rounded-xl border border-line bg-surface-card px-4 py-3">
                  <div className="text-sm text-content-primary font-medium mb-2">{row[0]}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {['Gratuit', 'Prospection', 'MAX'].map((label, ci) => (
                      <div key={label} className="rounded-lg bg-surface-elevated/60 px-2 py-1.5 text-center">
                        <div className="text-[10px] uppercase tracking-wider text-content-tertiary mb-0.5">{label}</div>
                        <div className="flex items-center justify-center min-h-[20px]">
                          {renderCell(row[ci + 1])}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </MotionInView>
        </section>

        {/* ─── 4e. ON PROSPECTE. DANS LES RÈGLES. ─────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
          <MotionInView>
            <h2 className="text-2xl sm:text-3xl font-bold mb-5">On prospecte. Dans les règles.</h2>
            <div className="space-y-3 text-content-secondary leading-relaxed">
              <p className="text-content-primary font-semibold">
                « C’est légal, ce scraping ? » Oui. Et voilà pourquoi.
              </p>
              <p>
                La prospection B2B est légale en France. Base juridique :
                l’intérêt légitime.
              </p>
              <p>
                Volia est construit pour rester dans les clous, pas pour frôler
                la ligne. Données professionnelles uniquement. Filtre automatique
                des emails personnels — les @gmail restent dehors.
              </p>
              <p>Page d’opt-out publique. DPA téléchargeable.</p>
              <p>
                On ne joue pas avec ça — c’est aussi ton nom qui part dans ces
                emails.
              </p>
            </div>
          </MotionInView>
        </section>

        {/* ─── 4f. ET LES OUTILS AMÉRICAINS ? ─────────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
          <MotionInView>
            <h2 className="text-2xl sm:text-3xl font-bold mb-5">Et les outils américains ?</h2>
            <div className="space-y-3 text-content-secondary leading-relaxed">
              <p>
                Apollo et Lemlist sont d’excellents outils. Pensés pour des
                équipes US, en anglais, facturés en dollars. Et il t’en faut
                plusieurs pour couvrir la chaîne complète.
              </p>
              <p>
                Volia fait tout du même endroit : trouvé → écrit → envoyé →
                répondu → dans ton CRM. En français, sur des données françaises —
                101 départements, 150+ catégories — avec le téléphone en plus de
                l’email.
              </p>
              <p>
                Toi, tu vends en France. C’est notre seul terrain, et on le
                connaît.
              </p>
            </div>
          </MotionInView>
        </section>

        {/* ─── 5. FAQ TARIFAIRE (8 Q/R) ───────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20" id="faq">
          <MotionInView>
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-violet-600 mb-3">FAQ TARIFICATION</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Vos questions, nos réponses</h2>
            </div>

            <div className="space-y-3">
              {FAQ_PRICING.map((item, idx) => {
                const isOpen = openFaq === idx;
                const panelId = `pricing-faq-panel-${idx}`;
                const buttonId = `pricing-faq-button-${idx}`;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-line bg-surface-card overflow-hidden transition-colors hover:border-line-hover"
                  >
                    <button
                      type="button"
                      id={buttonId}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-inset"
                    >
                      <span className="text-sm font-medium text-content-primary">{item.q}</span>
                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className={`text-content-tertiary flex-shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      hidden={!isOpen}
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-5 pb-4 pt-0">
                        <p className="text-sm text-content-secondary leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </MotionInView>
        </section>

        {/* ─── 6. CTA FINAL (seul ✈️ de la page) ──────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6">
          <MotionInView>
            <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 p-10 sm:p-14 text-center text-white shadow-2xl shadow-violet-500/20">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                Encore un doute ? Tant mieux.
              </h2>
              <div className="text-violet-100 text-base sm:text-lg mb-8 max-w-xl mx-auto space-y-2">
                <p>Le doute, ça se règle avec une preuve, pas avec une page de vente.</p>
                <p>Tape ton domaine. 30 secondes, 0 €, tes vrais leads.</p>
                <p>Si Volia ne trouve rien sur ton secteur, tu le sauras sans payer.</p>
                <p>Si ton pipeline décolle, tu sauras pourquoi. ✈️</p>
              </div>
              <Link
                href="/one"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-violet-700 text-sm font-semibold hover:bg-violet-50 transition shadow-lg"
              >
                Tape ton domaine — 0 € <ArrowRight size={14} />
              </Link>
              <p className="text-xs text-violet-100 mt-4">Le piège n’est toujours pas là.</p>
            </div>
          </MotionInView>
        </section>
      </main>

      <ReaderFooter />
    </div>
  );
}
