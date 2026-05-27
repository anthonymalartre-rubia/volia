import Link from 'next/link';
import { ArrowLeft, Mail, Download } from 'lucide-react';

export const metadata = {
  title: 'Accord de Traitement de Données (DPA) — Volia.fr',
  description:
    'Data Processing Agreement (DPA) Volia : sous-traitance RGPD article 28, sécurité, sous-sous-traitants, transferts UE, audit et suppression des données.',
  alternates: { canonical: '/dpa' },
};

const DPA_MAILTO =
  'mailto:hello@volia.fr?subject=Demande%20DPA%20sign%C3%A9%20%E2%80%94%20Volia&body=Bonjour%2C%0A%0AJe%20souhaite%20recevoir%20le%20DPA%20Volia%20pr%C3%A9rempli%20et%20pr%C3%AAt%20%C3%A0%20signer%20pour%20notre%20entreprise.%0A%0ARaison%20sociale%20%3A%20%0AAdresse%20%3A%20%0ASIREN%20%2F%20num%C3%A9ro%20de%20TVA%20%3A%20%0AContact%20signataire%20(nom%2C%20fonction%2C%20email)%20%3A%20%0A%0AMerci.';

export default function DPAPage() {
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
          Accord de Traitement de Données
        </h1>
        <p className="text-content-secondary text-sm mb-6">
          Data Processing Agreement (DPA) · Dernière mise à jour : 26 mai 2026
        </p>

        {/* En résumé global */}
        <div className="mb-6 p-5 rounded-xl border border-violet-500/30 bg-violet-500/5 text-sm text-content-secondary leading-relaxed">
          <p className="text-content-primary font-semibold mb-2">En 2 phrases</p>
          <p>
            Quand vous utilisez Volia pour traiter vos propres données client, c&apos;est vous qui
            décidez (responsable de traitement) et c&apos;est Volia qui exécute (sous-traitant). Ce
            document décrit qui fait quoi, comment on sécurise vos données, et ce qu&apos;il se passe
            en cas de problème ou de fin de contrat.
          </p>
        </div>

        {/* Intro */}
        <div className="mb-8 p-5 rounded-xl border border-line bg-surface-card text-sm text-content-secondary leading-relaxed">
          <p>
            Volia agit en qualité de{' '}
            <span className="text-content-primary font-medium">sous-traitant</span> au
            sens de l&apos;
            <span className="text-content-primary font-medium">article 28 du RGPD</span>{' '}
            pour le compte de ses clients lorsqu&apos;elle traite, dans le cadre de la
            fourniture du Service, des données personnelles dont ils sont responsables
            de traitement. Le présent DPA formalise les rôles, responsabilités et
            engagements de chaque partie.
          </p>
        </div>

        {/* CTA téléchargement / signature */}
        <div className="mb-12 p-6 rounded-xl border border-violet-500/30 bg-violet-500/5">
          <h2 className="text-lg font-semibold text-content-primary mb-2">
            Obtenir le DPA signé
          </h2>
          <p className="text-sm text-content-secondary mb-4">
            Pour recevoir un DPA prérempli aux coordonnées de votre entreprise et
            prêt à signer, contactez-nous. Vous recevrez le document sous 24 heures
            ouvrées.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={DPA_MAILTO}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition"
            >
              <Mail size={16} />
              Demander le DPA par email
            </a>
            <a
              href={DPA_MAILTO}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-line bg-surface-elevated hover:bg-surface-card text-content-primary text-sm font-semibold transition"
            >
              <Download size={16} />
              Recevoir la version PDF
            </a>
          </div>
          <p className="text-xs text-content-tertiary mt-3">
            Adresse de contact :{' '}
            <span className="text-content-secondary">hello@volia.fr</span>
          </p>
        </div>

        <div className="mb-10 p-4 rounded-xl border border-line bg-surface-card text-sm text-content-secondary">
          <p>
            <span className="text-content-primary font-medium">Note :</span> Ce DPA est un modèle
            standard pour un SaaS B2B français. Si vous êtes dans la santé, le secteur public, OIV
            ou OSE, faites-le relire par votre DPO ou conseil juridique.
          </p>
        </div>

        <div className="space-y-10 text-content-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              1. Objet du DPA
            </h2>
            <p>
              Le présent Accord de Traitement de Données (ci-après « DPA ») a pour objet
              de définir les conditions dans lesquelles Volia, en qualité de
              sous-traitant, traite les données personnelles pour le compte du Client,
              responsable de traitement, dans le cadre de la fourniture du Service décrit
              dans les{' '}
              <Link
                href="/cgv"
                className="text-violet-400 hover:text-violet-300 transition"
              >
                Conditions Générales de Vente
              </Link>
              .
            </p>
            <p className="mt-3">
              Le présent DPA est conforme aux exigences de l&apos;article 28 du
              Règlement (UE) 2016/679 (RGPD) et de la loi n° 78-17 du 6 janvier 1978
              modifiée (loi Informatique et Libertés).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              2. Définitions
            </h2>
            <p>
              Les termes utilisés avec une majuscule dans le présent DPA ont le sens
              qui leur est donné dans le RGPD, notamment :
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <span className="text-content-primary font-medium">
                  Données personnelles
                </span>{' '}
                : toute information se rapportant à une personne physique identifiée ou
                identifiable.
              </li>
              <li>
                <span className="text-content-primary font-medium">Traitement</span> :
                toute opération effectuée sur des Données personnelles.
              </li>
              <li>
                <span className="text-content-primary font-medium">
                  Responsable de traitement
                </span>{' '}
                : le Client, qui détermine les finalités et moyens du Traitement.
              </li>
              <li>
                <span className="text-content-primary font-medium">Sous-traitant</span>{' '}
                : Volia, qui traite les Données personnelles pour le compte du Client.
              </li>
              <li>
                <span className="text-content-primary font-medium">
                  Sous-sous-traitant
                </span>{' '}
                : tout tiers auquel Volia confie tout ou partie du Traitement (Supabase,
                Vercel, Stripe, etc.).
              </li>
              <li>
                <span className="text-content-primary font-medium">
                  Violation de Données
                </span>{' '}
                : violation de la sécurité entraînant, de manière accidentelle ou
                illicite, la destruction, la perte, l&apos;altération, la divulgation
                non autorisée de Données personnelles ou l&apos;accès non autorisé à
                de telles données.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              3. Rôles et responsabilités
            </h2>
            <p>
              Dans le cadre de l&apos;utilisation du Service :
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                Le <span className="text-content-primary font-medium">Client</span> agit
                en qualité de Responsable de traitement. Il détermine les finalités du
                Traitement (prospection commerciale, envoi de campagnes, gestion CRM),
                la base légale et les destinataires des données.
              </li>
              <li>
                <span className="text-content-primary font-medium">Volia</span> agit en
                qualité de Sous-traitant. Elle ne traite les Données personnelles que
                sur instruction documentée du Client, telle qu&apos;exprimée par
                l&apos;usage normal du Service ou par toute instruction écrite
                spécifique.
              </li>
            </ul>
            <p className="mt-4">
              Volia ne traite pas les Données du Client à des fins de profilage,
              d&apos;entraînement de modèles d&apos;intelligence artificielle ou de
              monétisation publicitaire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              4. Description du traitement
            </h2>

            <h3 className="text-lg font-medium text-content-primary mt-5 mb-2">
              4.1 Nature et finalités
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hébergement et stockage des Données du Client ;</li>
              <li>Enrichissement, recherche et organisation des prospects ;</li>
              <li>Envoi de campagnes email / SMS pour le compte du Client ;</li>
              <li>Reporting d&apos;activité et statistiques d&apos;utilisation.</li>
            </ul>

            <h3 className="text-lg font-medium text-content-primary mt-5 mb-2">
              4.2 Catégories de personnes concernées
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Prospects et clients B2B du Client (interlocuteurs professionnels) ;
              </li>
              <li>Utilisateurs et collaborateurs du Client ayant accès au Compte ;</li>
              <li>Destinataires des campagnes envoyées par le Client.</li>
            </ul>

            <h3 className="text-lg font-medium text-content-primary mt-5 mb-2">
              4.3 Catégories de Données personnelles
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identité professionnelle (nom, prénom, fonction) ;</li>
              <li>Coordonnées professionnelles (email, téléphone, adresse) ;</li>
              <li>Données relatives à l&apos;entreprise (raison sociale, secteur) ;</li>
              <li>Données d&apos;activité et de campagne (ouvertures, clics, réponses) ;</li>
              <li>Notes et annotations saisies par le Client.</li>
            </ul>
            <p className="mt-3">
              <span className="text-content-primary font-medium">
                Aucune donnée sensible
              </span>{' '}
              au sens de l&apos;article 9 du RGPD ne doit être traitée via le Service.
              Le Client s&apos;engage à ne pas téléverser ce type de données.
            </p>

            <h3 className="text-lg font-medium text-content-primary mt-5 mb-2">
              4.4 Durée du traitement
            </h3>
            <p>
              Le traitement est effectué pour la durée de l&apos;Abonnement du Client.
              Les Données sont conservées 30 jours après la résiliation pour permettre
              leur récupération, puis supprimées définitivement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              5. Obligations du sous-traitant Volia
            </h2>
            <p>
              Conformément à l&apos;article 28 § 3 du RGPD, Volia s&apos;engage à :
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <span className="text-content-primary font-medium">
                  Traiter sur instruction
                </span>{' '}
                : ne traiter les Données que sur instruction documentée du Client, y
                compris en cas de transfert hors UE ;
              </li>
              <li>
                <span className="text-content-primary font-medium">Confidentialité</span>{' '}
                : garantir que les personnes autorisées à traiter les Données
                s&apos;engagent à la confidentialité ;
              </li>
              <li>
                <span className="text-content-primary font-medium">Sécurité</span> :
                mettre en œuvre les mesures techniques et organisationnelles
                appropriées (article 32 RGPD) — voir section 7 ;
              </li>
              <li>
                <span className="text-content-primary font-medium">
                  Sous-sous-traitance
                </span>{' '}
                : ne recourir à un sous-sous-traitant qu&apos;en respectant les
                conditions de la section 9 ;
              </li>
              <li>
                <span className="text-content-primary font-medium">Assistance</span> :
                aider le Client à répondre aux demandes d&apos;exercice de droits des
                personnes concernées ;
              </li>
              <li>
                <span className="text-content-primary font-medium">Notification</span> :
                notifier au Client toute Violation de Données dans les meilleurs délais
                — voir section 8 ;
              </li>
              <li>
                <span className="text-content-primary font-medium">Coopération</span> :
                aider le Client à respecter ses obligations d&apos;analyse d&apos;impact
                (AIPD) et de consultation préalable ;
              </li>
              <li>
                <span className="text-content-primary font-medium">
                  Restitution / suppression
                </span>{' '}
                : à la fin du contrat, restituer ou supprimer les Données selon le
                choix du Client — voir section 12 ;
              </li>
              <li>
                <span className="text-content-primary font-medium">Documentation</span>{' '}
                : tenir à disposition du Client la documentation prouvant le respect
                des présentes obligations.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              6. Obligations du responsable de traitement (Client)
            </h2>
            <p>Le Client s&apos;engage à :</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                Disposer d&apos;une <span className="text-content-primary font-medium">
                base légale valide</span> pour chaque traitement effectué via le
                Service (notamment l&apos;intérêt légitime pour la prospection B2B,
                article 6.1.f RGPD) ;
              </li>
              <li>
                Informer les personnes concernées conformément aux articles 13 et 14
                du RGPD ;
              </li>
              <li>
                Respecter et faire respecter les droits des personnes (accès,
                rectification, suppression, opposition) ;
              </li>
              <li>
                Insérer un mécanisme de désinscription fonctionnel dans toute
                communication envoyée via le Service ;
              </li>
              <li>
                Tenir le <span className="text-content-primary font-medium">
                registre des traitements</span> visé à l&apos;article 30 du RGPD ;
              </li>
              <li>
                Réaliser, le cas échéant, une analyse d&apos;impact (AIPD) ;
              </li>
              <li>
                Ne pas téléverser de données sensibles (art. 9 RGPD) ni de données
                relatives à des mineurs sans base légale valide.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              7. Sécurité et mesures techniques
            </h2>

            <div className="mb-5 p-4 rounded-xl border border-line bg-surface-card text-sm">
              <p className="text-content-primary font-semibold mb-1">En résumé</p>
              <p>
                Chiffrement TLS en transit, AES-256 au repos, MFA disponible, Row Level Security
                Supabase, backups quotidiens, hébergement UE. Le tableau ci-dessous détaille chaque
                domaine.
              </p>
            </div>

            <p>
              Conformément à l&apos;article 32 du RGPD, Volia met en œuvre les mesures
              techniques et organisationnelles suivantes :
            </p>
            <div className="mt-4 rounded-xl border border-line overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-card">
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">
                      Domaine
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">
                      Mesure
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">
                      Chiffrement en transit
                    </td>
                    <td className="py-3 px-4">TLS 1.2 minimum sur tous les flux</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">
                      Chiffrement au repos
                    </td>
                    <td className="py-3 px-4">
                      AES-256 sur la base de données Supabase
                    </td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">
                      Authentification
                    </td>
                    <td className="py-3 px-4">
                      Mots de passe hashés (bcrypt), MFA disponible, OAuth Google
                    </td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">
                      Contrôle d&apos;accès
                    </td>
                    <td className="py-3 px-4">
                      Row Level Security Supabase, principe du moindre privilège
                    </td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">
                      Journalisation
                    </td>
                    <td className="py-3 px-4">
                      Logs d&apos;accès et d&apos;actions, conservation 12 mois
                    </td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">
                      Sauvegarde
                    </td>
                    <td className="py-3 px-4">
                      Backups quotidiens automatiques, rétention 7 jours
                    </td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">
                      Sécurité applicative
                    </td>
                    <td className="py-3 px-4">
                      Validation des entrées, anti-SSRF, rate limiting, CSP
                    </td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">
                      Tests
                    </td>
                    <td className="py-3 px-4">
                      Revues de code, audits ponctuels de sécurité
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-content-primary">
                      Hébergement
                    </td>
                    <td className="py-3 px-4">
                      Infrastructure UE (Supabase EU, Vercel Edge UE)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              8. Notification de violation
            </h2>
            <p>
              En cas de Violation de Données affectant les Données du Client, Volia
              s&apos;engage à notifier le Client{' '}
              <span className="text-content-primary font-medium">
                dans les meilleurs délais et au plus tard 72 heures
              </span>{' '}
              après en avoir pris connaissance, par email aux contacts de référence
              indiqués sur le Compte.
            </p>
            <p className="mt-3">La notification précisera, dans la mesure du possible :</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>la nature de la violation et les catégories de Données concernées ;</li>
              <li>le nombre approximatif de personnes concernées ;</li>
              <li>
                les conséquences probables et les mesures prises ou proposées pour y
                remédier ;
              </li>
              <li>
                les coordonnées du point de contact Volia pour obtenir plus
                d&apos;informations.
              </li>
            </ul>
            <p className="mt-3">
              Il appartient au Client, en sa qualité de Responsable de traitement, de
              notifier la violation à la CNIL et, le cas échéant, aux personnes
              concernées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              9. Sous-sous-traitants
            </h2>
            <p>
              Le Client autorise Volia, dans le cadre du présent DPA, à recourir aux
              sous-sous-traitants nécessaires à la fourniture du Service.
            </p>
            <p className="mt-3">
              La liste à jour des sous-sous-traitants est disponible dans la{' '}
              <Link
                href="/confidentialite"
                className="text-violet-400 hover:text-violet-300 transition"
              >
                Politique de Confidentialité
              </Link>{' '}
              (sections 8.1 et 8.2). Elle inclut notamment : Supabase (base de données),
              Vercel (hébergement), Stripe (paiements), Resend (emails transactionnels),
              Google Places, Apollo.io, Serper, Enrichly, Anymail Finder et Findymail
              (enrichissement).
            </p>
            <p className="mt-3">
              Volia informera le Client par email de tout ajout ou remplacement de
              sous-sous-traitant au moins{' '}
              <span className="text-content-primary font-medium">
                30 jours avant son entrée en vigueur
              </span>
              , permettant au Client de s&apos;y opposer dans ce délai. En cas
              d&apos;opposition légitime non levée d&apos;un commun accord, le Client
              pourra résilier le contrat sans pénalité.
            </p>
            <p className="mt-3">
              Volia impose à ses sous-sous-traitants, par contrat, des obligations de
              protection des données équivalentes à celles du présent DPA, conformément
              à l&apos;article 28 § 4 du RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              10. Transferts internationaux
            </h2>
            <p>
              L&apos;infrastructure principale de Volia (base de données, hébergement)
              est localisée dans l&apos;
              <span className="text-content-primary font-medium">Union européenne</span>.
              Certains sous-sous-traitants opèrent depuis des pays tiers (notamment les
              États-Unis pour certaines APIs d&apos;enrichissement).
            </p>
            <p className="mt-3">
              Pour ces transferts, Volia s&apos;appuie sur les garanties suivantes :
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <span className="text-content-primary font-medium">
                  Clauses Contractuelles Types (CCT)
                </span>{' '}
                adoptées par la Commission européenne (décision 2021/914) ;
              </li>
              <li>
                <span className="text-content-primary font-medium">
                  EU-U.S. Data Privacy Framework
                </span>{' '}
                pour les sous-sous-traitants américains certifiés ;
              </li>
              <li>
                Évaluation d&apos;impact des transferts (Transfer Impact Assessment)
                tenue à jour ;
              </li>
              <li>Mesures techniques complémentaires (chiffrement, pseudonymisation).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              11. Audit
            </h2>
            <p>
              Volia met à disposition du Client toute information nécessaire pour
              démontrer le respect de ses obligations RGPD, sur demande raisonnable
              adressée à <span className="text-content-primary font-medium">
              hello@volia.fr</span>.
            </p>
            <p className="mt-3">
              Le Client peut, à ses frais et au plus une fois par an, demander la
              réalisation d&apos;un audit, sous réserve d&apos;un préavis écrit de 30
              jours et d&apos;un engagement de confidentialité. Cet audit pourra être
              satisfait par la communication de rapports d&apos;audit existants ou de
              certifications (lorsque disponibles).
            </p>
            <p className="mt-3">
              En cas de contrôle d&apos;une autorité de protection des données (CNIL ou
              équivalent UE), Volia coopèrera de bonne foi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              12. Suppression des données
            </h2>
            <p>
              À la fin du contrat (résiliation, expiration), et à compter d&apos;un
              délai de 30 jours permettant la récupération par le Client, Volia procède
              à la <span className="text-content-primary font-medium">
              suppression définitive</span> des Données du Client de ses systèmes
              actifs.
            </p>
            <p className="mt-3">
              Les sauvegardes sont purgées dans un délai maximum de 30 jours
              supplémentaires. Les données conservées au titre d&apos;obligations
              légales (facturation, journalisation de sécurité) le sont selon les
              durées légalement requises.
            </p>
            <p className="mt-3">
              Sur demande écrite, Volia fournira au Client une attestation de
              suppression.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              13. Durée et résiliation
            </h2>
            <p>
              Le présent DPA entre en vigueur à la souscription d&apos;un Abonnement
              au Service par le Client. Il demeure applicable pendant toute la durée du
              contrat et survit à sa résiliation pour les obligations qui le
              nécessitent (confidentialité, suppression des données).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">
              14. Loi applicable
            </h2>
            <p>
              Le présent DPA est régi par le droit français et interprété conformément
              au RGPD. En cas de litige, les tribunaux compétents de Lyon seront seuls
              compétents, conformément à l&apos;article 18 des CGV.
            </p>
            <p className="mt-3">
              Pour toute question relative au présent DPA :{' '}
              <span className="text-content-primary font-medium">hello@volia.fr</span>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-content-secondary">
          <div className="flex flex-wrap gap-6">
            <Link href="/cgu" className="hover:text-content-primary transition">
              CGU
            </Link>
            <Link href="/cgv" className="hover:text-content-primary transition">
              CGV
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
