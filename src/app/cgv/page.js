import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Conditions Générales de Vente — Volia.fr',
  description:
    'Conditions Générales de Vente (CGV) de Volia.fr : abonnement SaaS B2B, plans Starter, Solo, Pro, Business, paiement Stripe, résiliation, garanties et droit applicable.',
  alternates: { canonical: '/cgv' },
};

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-content-secondary hover:text-content-primary transition mb-10"
        >
          <ArrowLeft size={16} />
          Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Conditions Générales de Vente
        </h1>
        <p className="text-content-secondary text-sm mb-4">
          Dernière mise à jour : 26 mai 2026
        </p>

        {/* En résumé global */}
        <div className="mb-6 p-5 rounded-xl border border-violet-500/30 bg-violet-500/5 text-sm text-content-secondary leading-relaxed">
          <p className="text-content-primary font-semibold mb-2">L&apos;essentiel pour les pressés</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>4 plans : Starter (gratuit) · Solo 19€ · Pro 49€ · Business 149€ par mois.</li>
            <li>Paiement par Stripe. Annulation en un clic depuis votre espace, à tout moment.</li>
            <li>Pas de remboursement au prorata, mais on étudie les cas particuliers.</li>
            <li>Vos données vous appartiennent. Vous les récupérez en CSV, on les supprime après 30 jours.</li>
            <li>Droit français, tribunaux de Lyon en cas de litige.</li>
          </ul>
        </div>

        <div className="mb-10 p-4 rounded-xl border border-line bg-surface-card text-sm text-content-secondary">
          <p>
            <span className="text-content-primary font-medium">Note :</span>{' '}
            Les présentes CGV sont un modèle standard pour un SaaS B2B français. Si vous êtes un grand
            compte, un marché public ou un secteur régulé, faites-les relire par votre conseil juridique.
          </p>
        </div>

        <div className="space-y-10 text-content-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">1. Objet</h2>
            <p>
              Les présentes Conditions Générales de Vente (ci-après « CGV ») ont pour objet
              de définir les conditions dans lesquelles Volia.fr (ci-après « Volia »)
              commercialise, par voie d&apos;abonnement, l&apos;accès à sa plateforme SaaS
              de prospection commerciale B2B (ci-après le « Service ») à ses clients
              professionnels (ci-après le « Client »).
            </p>
            <p className="mt-3">
              Les présentes CGV sont complétées par les{' '}
              <Link
                href="/cgu"
                className="text-violet-400 hover:text-violet-300 transition"
              >
                Conditions Générales d&apos;Utilisation (CGU)
              </Link>{' '}
              qui régissent l&apos;usage du Service, et par la{' '}
              <Link
                href="/confidentialite"
                className="text-violet-400 hover:text-violet-300 transition"
              >
                Politique de Confidentialité
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              2. Acceptation des CGV
            </h2>
            <p>
              La souscription à un abonnement payant et / ou l&apos;utilisation du Service
              emportent acceptation pleine, entière et sans réserve des présentes CGV par
              le Client. Le Client reconnaît disposer de la capacité juridique pour
              contracter et agir en qualité de professionnel.
            </p>
            <p className="mt-3">
              Les présentes CGV prévalent sur tout autre document, et notamment sur les
              conditions générales d&apos;achat du Client, sauf accord écrit exprès et
              préalable de Volia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              3. Définitions
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="text-content-primary font-medium">Service</span> : la
                plateforme SaaS Volia accessible sur volia.fr, comprenant les modules
                Volia Prospection, Volia Campagnes et Volia CRM.
              </li>
              <li>
                <span className="text-content-primary font-medium">Client</span> : la
                personne morale ou physique exerçant à titre professionnel qui souscrit
                un abonnement au Service.
              </li>
              <li>
                <span className="text-content-primary font-medium">Compte</span> :
                l&apos;espace personnel sécurisé créé par le Client pour accéder au Service.
              </li>
              <li>
                <span className="text-content-primary font-medium">Plan</span> : l&apos;offre
                tarifaire souscrite par le Client (Starter, Solo, Pro, Business),
                définissant les fonctionnalités et limites d&apos;usage applicables.
              </li>
              <li>
                <span className="text-content-primary font-medium">Abonnement</span> :
                le contrat de fourniture du Service conclu pour une durée mensuelle ou
                annuelle, tacitement reconductible.
              </li>
              <li>
                <span className="text-content-primary font-medium">Données Client</span> :
                l&apos;ensemble des données téléversées, traitées ou stockées par le
                Client dans le cadre de son utilisation du Service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              4. Description du Service
            </h2>
            <p>
              Volia est une suite SaaS de growth B2B structurée en trois modules :
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <span className="text-content-primary font-medium">Volia Prospection</span> :
                génération de leads B2B (Google Places + cascade waterfall multi-sources,
                scraping intelligent, scoring de confiance).
              </li>
              <li>
                <span className="text-content-primary font-medium">Volia Campagnes</span> :
                envoi de séquences email / SMS automatisées sur les prospects qualifiés.
              </li>
              <li>
                <span className="text-content-primary font-medium">Volia CRM</span>
                {' '}(à venir) : pipeline et suivi commercial natif.
              </li>
            </ul>
            <p className="mt-4">
              Le périmètre exact des fonctionnalités accessibles dépend du Plan souscrit
              et est décrit sur la page{' '}
              <Link
                href="/pricing"
                className="text-violet-400 hover:text-violet-300 transition"
              >
                /pricing
              </Link>
              . Volia se réserve le droit de faire évoluer le Service (ajouts,
              modifications, retraits de fonctionnalités) à des fins d&apos;amélioration
              continue, sans que cela ne constitue une modification substantielle du
              contrat.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              5. Création de compte et inscription
            </h2>
            <p>
              Pour souscrire au Service, le Client doit créer un Compte en renseignant
              une adresse email professionnelle valide et un mot de passe. Le Client
              s&apos;engage à fournir des informations exactes, à les maintenir à jour
              et à conserver la confidentialité de ses identifiants.
            </p>
            <p className="mt-3">
              Toute action effectuée depuis le Compte est réputée l&apos;être par le
              Client. Le Client s&apos;engage à informer Volia sans délai de toute
              utilisation non autorisée de son Compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              6. Plans tarifaires et facturation
            </h2>

            <div className="mb-5 p-4 rounded-xl border border-line bg-surface-card text-sm">
              <p className="text-content-primary font-semibold mb-1">En résumé</p>
              <p>
                Vous choisissez un plan, vous payez via Stripe (mensuel ou annuel avec 2 mois offerts).
                TVA française 20% si vous êtes en France, autoliquidation si vous êtes dans l&apos;UE
                avec un numéro de TVA valide. Pas de paiement à temps = accès suspendu.
              </p>
            </div>

            <p>
              Volia propose les plans suivants, facturables mensuellement ou annuellement
              (le paiement annuel donne droit à 2 mois offerts) :
            </p>
            <div className="mt-4 rounded-xl border border-line overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-card">
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">
                      Plan
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">
                      Prix mensuel
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">
                      Quota
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">
                      Starter
                    </td>
                    <td className="py-3 px-4">Gratuit</td>
                    <td className="py-3 px-4">100 prospects / mois</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">Solo</td>
                    <td className="py-3 px-4">19 €</td>
                    <td className="py-3 px-4">1 000 prospects / mois</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">Pro</td>
                    <td className="py-3 px-4">49 €</td>
                    <td className="py-3 px-4">5 000 prospects / mois</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-content-primary">
                      Business
                    </td>
                    <td className="py-3 px-4">149 €</td>
                    <td className="py-3 px-4">10 000 prospects / mois</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              <span className="text-content-primary font-medium">Taxes :</span> les prix
              affichés s&apos;entendent toutes taxes comprises (TVA française 20 %) pour
              les Clients établis en France. Pour les Clients professionnels établis dans
              un autre État membre de l&apos;Union européenne et disposant d&apos;un
              numéro de TVA intracommunautaire valide, l&apos;autoliquidation de la TVA
              s&apos;applique (mention : « TVA due par le preneur — article 196 de la
              directive 2006/112/CE »). Pour les Clients hors UE, les prix sont entendus
              hors taxes.
            </p>
            <p className="mt-3">
              <span className="text-content-primary font-medium">Paiement :</span> les
              paiements sont traités par Stripe Payments Europe Ltd, prestataire de
              services de paiement agréé. Volia n&apos;a aucun accès aux données
              bancaires du Client. Le paiement est exigible à la date d&apos;échéance
              et automatiquement prélevé sur le moyen de paiement enregistré.
            </p>
            <p className="mt-3">
              <span className="text-content-primary font-medium">
                Facturation annuelle :
              </span>{' '}
              le paiement annuel est effectué en une seule fois à la souscription ou au
              renouvellement. Aucun prorata n&apos;est dû en cas de résiliation
              anticipée en cours d&apos;abonnement annuel.
            </p>
            <p className="mt-3">
              <span className="text-content-primary font-medium">Factures :</span>
              {' '}Les factures sont émises électroniquement et mises à disposition dans
              l&apos;espace Client.
            </p>
            <p className="mt-3">
              <span className="text-content-primary font-medium">
                Retard ou défaut de paiement :
              </span>{' '}
              tout retard de paiement entraînera de plein droit, sans mise en demeure
              préalable, la suspension immédiate de l&apos;accès au Service. Conformément
              à l&apos;article L. 441-10 du Code de commerce, des intérêts de retard au
              taux BCE + 10 points et une indemnité forfaitaire pour frais de recouvrement
              de 40 € seront applicables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              7. Durée et reconduction
            </h2>
            <p>
              L&apos;Abonnement est conclu pour une durée initiale égale à la périodicité
              choisie (mensuelle ou annuelle) à compter de la date de souscription. Il
              est <span className="text-content-primary font-medium">
              tacitement reconduit</span> pour des périodes successives de même durée,
              sauf résiliation par l&apos;une des parties dans les conditions prévues à
              l&apos;article 8.
            </p>
            <p className="mt-3">
              Conformément à l&apos;article L. 215-1 du Code de la consommation
              (applicable aux contrats conclus avec des professionnels employant cinq
              salariés au plus), le Client est informé par email entre 1 et 3 mois avant
              la date d&apos;échéance annuelle de la possibilité de ne pas reconduire
              son abonnement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              8. Résiliation et remboursement
            </h2>

            <div className="mb-5 p-4 rounded-xl border border-line bg-surface-card text-sm">
              <p className="text-content-primary font-semibold mb-1">En résumé</p>
              <p>
                Vous annulez quand vous voulez depuis votre espace, en un clic. L&apos;accès reste
                actif jusqu&apos;à la fin du mois (ou de l&apos;année) déjà payé. Pas de remboursement
                au prorata, mais on étudie les cas exceptionnels. Vos données restent récupérables
                pendant 30 jours après la résiliation.
              </p>
            </div>

            <p>
              <span className="text-content-primary font-medium">
                Résiliation par le Client :
              </span>{' '}
              le Client peut résilier son Abonnement à tout moment, en un clic, depuis
              le portail client Stripe accessible dans ses paramètres. La résiliation
              prend effet à la fin de la période de facturation en cours ; l&apos;accès
              au Service est maintenu jusqu&apos;à cette date.
            </p>
            <p className="mt-3">
              <span className="text-content-primary font-medium">Remboursement :</span>{' '}
              les abonnements payés ne donnent pas lieu à remboursement pro-rata. Volia
              pourra toutefois étudier les demandes exceptionnelles (indisponibilité
              majeure du Service, double facturation, erreur de plan souscrit) et
              procéder, le cas échéant, à un remboursement de tout ou partie des sommes
              versées, à sa libre appréciation.
            </p>
            <p className="mt-3">
              <span className="text-content-primary font-medium">
                Résiliation par Volia :
              </span>{' '}
              Volia se réserve le droit de suspendre ou résilier l&apos;Abonnement de
              plein droit en cas de manquement grave du Client à ses obligations (défaut
              de paiement, violation des CGU, usage frauduleux), sans préavis ni
              indemnité, et sans préjudice de tout dommage et intérêt.
            </p>
            <p className="mt-3">
              <span className="text-content-primary font-medium">
                Sort des Données Client :
              </span>{' '}
              à compter de la résiliation effective, les Données Client sont conservées
              pendant 30 jours pour permettre leur récupération (export CSV depuis
              l&apos;espace Client). À l&apos;issue de ce délai, elles sont supprimées
              définitivement des systèmes de Volia, sauf obligation légale de
              conservation (notamment données de facturation conservées 10 ans).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              9. Obligations du Client
            </h2>
            <p>Le Client s&apos;engage à :</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Utiliser le Service conformément aux CGU et à la réglementation applicable, notamment au RGPD et à la loi Informatique et Libertés ;</li>
              <li>Disposer d&apos;une base légale valide pour traiter les données issues du Service (notamment l&apos;intérêt légitime en prospection B2B) ;</li>
              <li>Informer les personnes prospectées conformément aux articles 13 et 14 du RGPD et respecter leur droit d&apos;opposition ;</li>
              <li>Insérer un lien de désinscription fonctionnel dans tout email de prospection envoyé via le Service ;</li>
              <li>Régler les sommes dues aux échéances convenues ;</li>
              <li>Maintenir à jour les informations de son Compte (coordonnées de facturation, moyen de paiement).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              10. Obligations de Volia
            </h2>
            <p>Volia s&apos;engage à :</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Mettre à disposition le Service dans des conditions de disponibilité et de sécurité conformes à l&apos;état de l&apos;art (objectif 99,5 % de disponibilité mensuelle hors maintenance planifiée) ;</li>
              <li>Mettre en place des mesures techniques et organisationnelles de sécurité (chiffrement TLS en transit, AES-256 au repos, MFA, journalisation des accès) ;</li>
              <li>Assister le Client par un support en français accessible par email (réponse sous 1 jour ouvré) ;</li>
              <li>Notifier le Client sans délai injustifié de toute violation de données personnelles le concernant, conformément à l&apos;article 33 du RGPD ;</li>
              <li>Respecter ses obligations de sous-traitant au sens de l&apos;article 28 du RGPD (voir{' '}
                <Link href="/dpa" className="text-violet-400 hover:text-violet-300 transition">
                  DPA
                </Link>
                ).
              </li>
            </ul>
            <p className="mt-4">
              Les obligations de Volia constituent une obligation de moyens. Volia ne
              garantit pas l&apos;atteinte d&apos;un résultat commercial particulier
              (nombre de leads convertis, taux d&apos;ouverture email, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              11. Garantie et limitation de responsabilité
            </h2>
            <p>
              Volia ne saurait être tenue responsable des dommages indirects subis par
              le Client (perte de chiffre d&apos;affaires, perte de clientèle, atteinte
              à l&apos;image, perte de données dans la mesure où elles auraient pu être
              sauvegardées par le Client).
            </p>
            <p className="mt-3">
              <span className="text-content-primary font-medium">
                Plafond de responsabilité :
              </span>{' '}
              en tout état de cause et sauf faute lourde ou dolosive, la responsabilité
              globale de Volia, tous chefs de préjudice confondus, ne pourra excéder le
              montant total des sommes effectivement versées par le Client à Volia au
              titre de l&apos;Abonnement au cours des douze (12) mois précédant
              l&apos;événement générateur de responsabilité.
            </p>
            <p className="mt-3">
              Volia ne garantit pas l&apos;exactitude, l&apos;exhaustivité ni la
              délivrabilité des données issues des sources tierces interrogées par le
              Service (Google Places, Apollo.io, Serper, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              12. Propriété intellectuelle
            </h2>
            <p>
              Volia conserve l&apos;ensemble des droits de propriété intellectuelle
              relatifs au Service (logiciel, interface, marque, logo, documentation).
              Le Client se voit concéder un droit d&apos;usage personnel, non exclusif
              et non cessible, pour la durée de son Abonnement.
            </p>
            <p className="mt-3">
              Les Données Client demeurent la propriété exclusive du Client. Volia ne
              les utilise que dans la stricte mesure nécessaire à la fourniture du
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              13. Données personnelles et RGPD
            </h2>
            <p>
              Volia respecte la réglementation applicable en matière de protection des
              données personnelles (RGPD, loi Informatique et Libertés). Les modalités
              de traitement sont détaillées dans la{' '}
              <Link
                href="/confidentialite"
                className="text-violet-400 hover:text-violet-300 transition"
              >
                Politique de Confidentialité
              </Link>
              .
            </p>
            <p className="mt-3">
              Dans le cadre de la fourniture du Service, Volia agit en qualité de{' '}
              <span className="text-content-primary font-medium">sous-traitant</span> du
              Client au sens de l&apos;article 28 du RGPD pour le traitement des données
              que le Client lui confie. Les engagements correspondants sont formalisés
              dans l&apos;{' '}
              <Link href="/dpa" className="text-violet-400 hover:text-violet-300 transition">
                Accord de Traitement de Données (DPA)
              </Link>{' '}
              accessible à tout Client professionnel sur simple demande.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              14. Confidentialité
            </h2>
            <p>
              Chacune des parties s&apos;engage à conserver confidentielles l&apos;ensemble
              des informations non publiques échangées dans le cadre du présent contrat
              (informations techniques, commerciales, financières, données personnelles),
              et à ne pas les communiquer à des tiers sans l&apos;accord préalable de
              l&apos;autre partie, sauf obligation légale.
            </p>
            <p className="mt-3">
              Cette obligation de confidentialité demeure en vigueur pendant toute la
              durée du contrat et pour une durée de trois (3) ans à compter de son terme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              15. Force majeure
            </h2>
            <p>
              Aucune des parties ne pourra être tenue responsable de la non-exécution ou
              du retard dans l&apos;exécution de ses obligations résultant d&apos;un cas
              de force majeure au sens de l&apos;article 1218 du Code civil (notamment :
              catastrophe naturelle, guerre, attaque informatique massive, indisponibilité
              d&apos;un fournisseur tiers essentiel, décision d&apos;une autorité
              publique).
            </p>
            <p className="mt-3">
              Si le cas de force majeure se prolonge au-delà de trente (30) jours,
              chaque partie pourra résilier le contrat de plein droit sans indemnité par
              simple notification écrite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              16. Modification des CGV
            </h2>
            <p>
              Volia se réserve le droit de modifier les présentes CGV à tout moment.
              Toute modification substantielle sera notifiée au Client par email au
              moins trente (30) jours avant son entrée en vigueur. À défaut de
              résiliation par le Client dans ce délai, les nouvelles CGV seront réputées
              acceptées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              17. Cession
            </h2>
            <p>
              Volia pourra céder ou transférer tout ou partie de ses droits et
              obligations issus des présentes CGV à un tiers, notamment dans le cadre
              d&apos;une opération de fusion, acquisition ou réorganisation, sans
              accord préalable du Client. Le Client ne pourra céder le présent contrat
              sans l&apos;accord écrit et préalable de Volia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              18. Litiges et droit applicable
            </h2>
            <p>
              Les présentes CGV sont régies par le droit français. En cas de litige
              relatif à leur formation, exécution ou interprétation, les parties
              s&apos;efforceront de trouver une solution amiable préalablement à toute
              action contentieuse.
            </p>
            <p className="mt-3">
              À défaut d&apos;accord amiable dans un délai de trente (30) jours,{' '}
              <span className="text-content-primary font-medium">
                compétence exclusive est attribuée aux tribunaux compétents de Lyon
              </span>
              , même en cas de pluralité de défendeurs, d&apos;appel en garantie ou de
              procédures d&apos;urgence.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              19. Élection de domicile
            </h2>
            <p>
              Pour l&apos;exécution des présentes, les parties élisent domicile à leur
              adresse respective figurant aux factures et / ou aux conditions
              particulières d&apos;abonnement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              20. Contact
            </h2>
            <p>
              Pour toute question relative aux présentes CGV ou à la facturation :{' '}
              <span className="text-content-primary font-medium">hello@volia.fr</span>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-content-secondary">
          <div className="flex flex-wrap gap-6">
            <Link href="/cgu" className="hover:text-content-primary transition">
              CGU
            </Link>
            <Link href="/dpa" className="hover:text-content-primary transition">
              DPA
            </Link>
            <Link
              href="/confidentialite"
              className="hover:text-content-primary transition"
            >
              Confidentialité
            </Link>
            <Link href="/rgpd" className="hover:text-content-primary transition">
              RGPD
            </Link>
          </div>
          <p className="text-content-tertiary text-xs">&copy; 2026 Volia.fr</p>
        </div>
      </div>
    </div>
  );
}
