import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Politique de Confidentialité — Prospectia.ai',
  description: 'Politique de confidentialité et protection des données personnelles de Prospectia.ai.',
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-content-secondary hover:text-content-primary transition mb-10">
          <ArrowLeft size={16} />
          Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Politique de Confidentialité</h1>
        <p className="text-content-secondary text-sm mb-10">Dernière mise à jour : 28 mars 2026</p>

        <div className="space-y-10 text-content-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles est Prospectia.ai.<br />
              Contact DPO : <span className="text-content-primary font-medium">contact@prospectia.ai</span>
            </p>
            <p className="mt-3">
              Prospectia.ai agit en qualité d&apos;<span className="text-content-primary font-medium">agrégateur technique</span> de
              données professionnelles B2B. Cette politique distingue deux catégories de données :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><span className="text-content-primary font-medium">Données des utilisateurs</span> : données de compte et d&apos;utilisation des personnes inscrites au Service</li>
              <li><span className="text-content-primary font-medium">Données des prospects</span> : données professionnelles d&apos;entreprises et de professionnels agrégées via les sources tierces</li>
            </ul>
          </section>

          {/* ===== PARTIE A : DONNÉES DES UTILISATEURS ===== */}
          <section>
            <div className="p-4 rounded-xl bg-surface-card border border-line mb-6">
              <p className="text-content-primary font-semibold text-lg">Partie A — Données des utilisateurs du Service</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">2. Données des utilisateurs collectées</h2>

            <h3 className="text-lg font-medium text-content-primary mt-5 mb-2">2.1 Données de compte</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Adresse email</li>
              <li>Mot de passe (stocké sous forme hashée, jamais en clair)</li>
              <li>Date de création du compte</li>
              <li>Plan d&apos;abonnement</li>
            </ul>

            <h3 className="text-lg font-medium text-content-primary mt-5 mb-2">2.2 Données d&apos;utilisation</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Historique des recherches (départements, catégories, requêtes)</li>
              <li>Résultats sauvegardés (prospects, emails trouvés)</li>
              <li>Préférences d&apos;interface (thème clair/sombre, colonnes affichées)</li>
              <li>Sessions de recherche et statistiques d&apos;utilisation</li>
            </ul>

            <h3 className="text-lg font-medium text-content-primary mt-5 mb-2">2.3 Données techniques</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Adresse IP</li>
              <li>Type et version du navigateur</li>
              <li>Pages visitées et durée de visite</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">3. Bases légales du traitement — Données des utilisateurs</h2>
            <p>Le traitement des données des utilisateurs repose sur les bases légales suivantes :</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><span className="text-content-primary font-medium">Exécution du contrat</span> (art. 6.1.b RGPD) : pour la fourniture du Service, la gestion de votre compte et de votre abonnement</li>
              <li><span className="text-content-primary font-medium">Consentement</span> (art. 6.1.a RGPD) : pour les cookies non essentiels et les communications marketing</li>
              <li><span className="text-content-primary font-medium">Intérêt légitime</span> (art. 6.1.f RGPD) : pour l&apos;amélioration du Service, la sécurité et la prévention de la fraude</li>
              <li><span className="text-content-primary font-medium">Obligation légale</span> (art. 6.1.c RGPD) : pour la facturation et les obligations comptables</li>
            </ul>
          </section>

          {/* ===== PARTIE B : DONNÉES DES PROSPECTS ===== */}
          <section>
            <div className="p-4 rounded-xl bg-surface-card border border-line mb-6">
              <p className="text-content-primary font-semibold text-lg">Partie B — Données des prospects (personnes prospectées)</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">4. Données des prospects traitées</h2>
            <p>
              Dans le cadre de son activité d&apos;agrégation, Prospectia.ai traite les données professionnelles suivantes
              concernant les entreprises et professionnels référencés :
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Raison sociale / nom commercial</li>
              <li>Adresse professionnelle de l&apos;établissement</li>
              <li>Numéro de téléphone professionnel</li>
              <li>Adresse email professionnelle (domaine de l&apos;entreprise uniquement)</li>
              <li>URL du site web de l&apos;entreprise</li>
              <li>Note et nombre d&apos;avis Google</li>
              <li>Catégorie d&apos;activité professionnelle</li>
              <li>Département et localisation géographique</li>
            </ul>
            <p className="mt-4">
              <span className="text-content-primary font-medium">Prospectia.ai ne traite aucune donnée sensible</span> au sens
              de l&apos;article 9 du RGPD (origine ethnique, opinions politiques, convictions religieuses, données de santé, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">5. Base légale du traitement — Données des prospects</h2>
            <p>
              Le traitement des données professionnelles des prospects repose sur l&apos;<span className="text-content-primary font-medium">intérêt
              légitime</span> (article 6.1.f du RGPD), conformément aux lignes directrices de la CNIL concernant la
              prospection commerciale B2B.
            </p>

            <h3 className="text-lg font-medium text-content-primary mt-5 mb-2">5.1 Analyse de la mise en balance (balancing test)</h3>
            <p>Conformément à l&apos;article 6.1.f du RGPD, nous avons réalisé l&apos;analyse suivante :</p>

            <div className="mt-4 p-4 rounded-xl border border-line bg-surface-card space-y-4">
              <div>
                <p className="text-content-primary font-medium">Intérêt poursuivi</p>
                <p className="text-sm mt-1">
                  Permettre à des professionnels de la prospection B2B d&apos;identifier et de contacter des entreprises
                  dans le cadre de relations commerciales inter-entreprises. Cet intérêt est reconnu comme légitime par
                  la CNIL dans ses recommandations sur la prospection commerciale B2B.
                </p>
              </div>
              <div>
                <p className="text-content-primary font-medium">Nécessité du traitement</p>
                <p className="text-sm mt-1">
                  L&apos;agrégation de données professionnelles publiquement accessibles est nécessaire pour fournir
                  un service de prospection efficace. Sans ce traitement, les utilisateurs devraient effectuer manuellement
                  les mêmes recherches sur chaque source, ce qui ne réduirait pas l&apos;impact sur les personnes concernées.
                </p>
              </div>
              <div>
                <p className="text-content-primary font-medium">Attentes raisonnables des personnes concernées</p>
                <p className="text-sm mt-1">
                  Les professionnels et entreprises qui publient volontairement leurs coordonnées professionnelles
                  (sur leur site web, sur Google Maps, dans des annuaires professionnels) peuvent raisonnablement
                  s&apos;attendre à être contactés dans le cadre de leur activité commerciale. Il s&apos;agit de
                  données publiées à des fins commerciales par les intéressés eux-mêmes.
                </p>
              </div>
              <div>
                <p className="text-content-primary font-medium">Mesures de protection mises en place</p>
                <p className="text-sm mt-1">
                  Pour minimiser l&apos;impact sur les personnes concernées : filtrage automatique des emails personnels,
                  mécanisme d&apos;opt-out accessible (/opt-out), traitement limité aux données professionnelles,
                  scoring de confiance des emails, suppression automatique après 12 mois d&apos;inactivité.
                </p>
              </div>
              <div>
                <p className="text-content-primary font-medium">Conclusion</p>
                <p className="text-sm mt-1">
                  L&apos;intérêt légitime de la prospection B2B prévaut sur les droits des personnes concernées,
                  dans la mesure où (i) seules des données professionnelles publiquement accessibles sont traitées,
                  (ii) les personnes concernées peuvent raisonnablement s&apos;attendre à ce type de contact,
                  (iii) un mécanisme d&apos;opt-out simple et gratuit est disponible, et (iv) des mesures techniques
                  de protection sont en place.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">6. Minimisation des données</h2>
            <p>
              Conformément au principe de minimisation (article 5.1.c du RGPD), Prospectia.ai met en place les
              mesures suivantes :
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <span className="text-content-primary font-medium">Filtrage des emails personnels</span> : les adresses email
                hébergées sur des domaines grand public (@gmail.com, @hotmail.com, @yahoo.fr, @outlook.com, @orange.fr,
                @free.fr, @laposte.net, etc.) sont automatiquement exclues des résultats
              </li>
              <li>
                <span className="text-content-primary font-medium">Données strictement professionnelles</span> : seules les
                coordonnées professionnelles sont collectées (email de domaine d&apos;entreprise, téléphone professionnel,
                adresse de l&apos;établissement)
              </li>
              <li>
                <span className="text-content-primary font-medium">Pas de données sensibles</span> : aucune donnée relative
                à la vie privée, aux opinions, à la santé ou à toute catégorie particulière n&apos;est collectée
              </li>
              <li>
                <span className="text-content-primary font-medium">Scoring de confiance</span> : les emails sont évalués et
                classés par niveau de confiance, permettant aux utilisateurs de ne retenir que les données les plus fiables
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">7. Droits des personnes prospectées</h2>
            <p>
              Si vous êtes un professionnel dont les données sont traitées par Prospectia.ai dans le cadre de
              l&apos;enrichissement B2B, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <span className="text-content-primary font-medium">Droit d&apos;opposition (opt-out)</span> : vous pouvez
                demander à ne plus apparaître dans les résultats de Prospectia.ai via notre
                <Link href="/opt-out" className="text-violet-400 hover:text-violet-300 transition ml-1">page d&apos;opt-out</Link> ou
                par email à <span className="text-content-primary">contact@prospectia.ai</span>. Votre demande sera traitée sous
                72 heures et sera effective pour tous les utilisateurs du Service.
              </li>
              <li>
                <span className="text-content-primary font-medium">Droit d&apos;accès</span> : vous pouvez demander à savoir
                quelles données vous concernant sont traitées et quels utilisateurs y ont accédé
              </li>
              <li>
                <span className="text-content-primary font-medium">Droit de suppression</span> : vous pouvez demander
                l&apos;effacement complet de vos données de notre système
              </li>
              <li>
                <span className="text-content-primary font-medium">Droit de rectification</span> : vous pouvez demander la
                correction de données inexactes vous concernant
              </li>
              <li>
                <span className="text-content-primary font-medium">Droit à la limitation</span> : vous pouvez demander la
                limitation du traitement de vos données
              </li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits : <span className="text-content-primary font-medium">contact@prospectia.ai</span> ou
              via la page <Link href="/opt-out" className="text-violet-400 hover:text-violet-300 transition">/opt-out</Link>.
              Délai de réponse : 30 jours maximum (72 heures pour les demandes d&apos;opt-out).
            </p>
          </section>

          {/* ===== PARTIE C : DISPOSITIONS COMMUNES ===== */}
          <section>
            <div className="p-4 rounded-xl bg-surface-card border border-line mb-6">
              <p className="text-content-primary font-semibold text-lg">Partie C — Dispositions communes</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">8. Sous-traitants et sources d&apos;enrichissement</h2>
            <p>Nous faisons appel aux sous-traitants et fournisseurs suivants pour le fonctionnement du Service :</p>

            <h3 className="text-lg font-medium text-content-primary mt-5 mb-2">8.1 Hébergement et infrastructure</h3>
            <div className="mt-2 rounded-xl border border-line overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-card">
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Sous-traitant</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Finalité</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Localisation</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Garanties</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">Supabase</td>
                    <td className="py-3 px-4">Base de données et authentification</td>
                    <td className="py-3 px-4">UE / USA</td>
                    <td className="py-3 px-4">CCT + DPF</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">Vercel</td>
                    <td className="py-3 px-4">Hébergement et déploiement</td>
                    <td className="py-3 px-4">USA (CDN mondial)</td>
                    <td className="py-3 px-4">CCT + DPF</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-content-primary">Stripe</td>
                    <td className="py-3 px-4">Traitement des paiements</td>
                    <td className="py-3 px-4">USA / Irlande</td>
                    <td className="py-3 px-4">CCT + DPF</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-content-primary mt-5 mb-2">8.2 Sources d&apos;enrichissement de données B2B</h3>
            <div className="mt-2 rounded-xl border border-line overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-card">
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Fournisseur</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Finalité</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Localisation</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Garanties</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">Google Places API</td>
                    <td className="py-3 px-4">Découverte d&apos;établissements professionnels</td>
                    <td className="py-3 px-4">USA</td>
                    <td className="py-3 px-4">CCT + DPF</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">Apollo.io</td>
                    <td className="py-3 px-4">Enrichissement de contacts professionnels B2B</td>
                    <td className="py-3 px-4">USA</td>
                    <td className="py-3 px-4">CCT + DPF</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">Serper.dev</td>
                    <td className="py-3 px-4">Recherche d&apos;informations publiques (SERP)</td>
                    <td className="py-3 px-4">USA</td>
                    <td className="py-3 px-4">CCT</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">Enrichly</td>
                    <td className="py-3 px-4">Enrichissement d&apos;emails professionnels</td>
                    <td className="py-3 px-4">USA</td>
                    <td className="py-3 px-4">CCT</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-medium text-content-primary">Anymail Finder</td>
                    <td className="py-3 px-4">Recherche et vérification d&apos;emails professionnels</td>
                    <td className="py-3 px-4">Royaume-Uni</td>
                    <td className="py-3 px-4">Décision d&apos;adéquation</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-content-primary">Findymail</td>
                    <td className="py-3 px-4">Recherche et vérification d&apos;emails professionnels</td>
                    <td className="py-3 px-4">Union européenne</td>
                    <td className="py-3 px-4">RGPD (UE)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">9. Transferts internationaux de données</h2>
            <p>
              Certains de nos sous-traitants et fournisseurs sont situés en dehors de l&apos;Espace Économique Européen (EEE).
              Pour ces transferts, nous mettons en place les garanties suivantes conformément au Chapitre V du RGPD :
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-3">
              <li>
                <span className="text-content-primary font-medium">Clauses Contractuelles Types (CCT)</span> : tous nos
                sous-traitants et fournisseurs situés aux États-Unis sont soumis aux Clauses Contractuelles Types adoptées
                par la Commission européenne (décision d&apos;exécution 2021/914), garantissant un niveau de protection
                adéquat des données transférées.
              </li>
              <li>
                <span className="text-content-primary font-medium">Data Privacy Framework (DPF)</span> : lorsque disponible,
                nos fournisseurs américains sont certifiés au titre du EU-U.S. Data Privacy Framework (décision d&apos;adéquation
                de la Commission européenne du 10 juillet 2023), offrant une protection supplémentaire. C&apos;est le cas
                notamment de Google, Vercel, Supabase, Stripe et Apollo.io.
              </li>
              <li>
                <span className="text-content-primary font-medium">Royaume-Uni</span> : le Royaume-Uni bénéficie d&apos;une
                décision d&apos;adéquation de la Commission européenne (28 juin 2021), permettant les transferts de données
                sans garanties supplémentaires. Anymail Finder opère sous ce régime.
              </li>
              <li>
                <span className="text-content-primary font-medium">Union européenne</span> : Findymail est basé dans l&apos;UE
                et ne nécessite pas de mécanisme de transfert particulier.
              </li>
            </ul>
            <p className="mt-4">
              Des mesures techniques supplémentaires sont appliquées : chiffrement des données en transit (TLS 1.2+),
              pseudonymisation lorsque possible, et évaluation régulière du niveau de protection offert par chaque juridiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">10. Cookies</h2>
            <p>Le Service utilise les cookies suivants :</p>
            <div className="mt-4 rounded-xl border border-line overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-card">
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Cookie</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Durée</th>
                    <th className="text-left py-3 px-4 font-semibold text-content-primary">Finalité</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-mono text-xs text-content-primary">sb-*-auth-token</td>
                    <td className="py-3 px-4">Essentiel</td>
                    <td className="py-3 px-4">Session</td>
                    <td className="py-3 px-4">Authentification Supabase</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-mono text-xs text-content-primary">theme</td>
                    <td className="py-3 px-4">Préférence</td>
                    <td className="py-3 px-4">1 an</td>
                    <td className="py-3 px-4">Thème clair/sombre</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-3 px-4 font-mono text-xs text-content-primary">cookie_consent</td>
                    <td className="py-3 px-4">Essentiel</td>
                    <td className="py-3 px-4">1 an</td>
                    <td className="py-3 px-4">Consentement cookies</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-xs text-content-primary">columns_*</td>
                    <td className="py-3 px-4">Préférence</td>
                    <td className="py-3 px-4">1 an</td>
                    <td className="py-3 px-4">Colonnes affichées (localStorage)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              Vous pouvez gérer vos préférences de cookies à tout moment via le bandeau de consentement
              ou les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">11. Durée de conservation</h2>

            <h3 className="text-lg font-medium text-content-primary mt-5 mb-2">11.1 Données des utilisateurs</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="text-content-primary font-medium">Données de compte</span> : conservées pendant toute la durée d&apos;utilisation du Service, supprimées dans les 30 jours suivant la fermeture du compte</li>
              <li><span className="text-content-primary font-medium">Données de facturation</span> : conservées 10 ans conformément aux obligations légales comptables (article L. 123-22 du Code de commerce)</li>
              <li><span className="text-content-primary font-medium">Logs techniques</span> : conservés 12 mois maximum</li>
            </ul>

            <h3 className="text-lg font-medium text-content-primary mt-5 mb-2">11.2 Données des prospects</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="text-content-primary font-medium">Données d&apos;enrichissement</span> : les données de prospects sont automatiquement supprimées après <span className="text-content-primary font-medium">12 mois d&apos;inactivité</span> (aucune consultation ni utilisation par un utilisateur du Service)</li>
              <li><span className="text-content-primary font-medium">Liste d&apos;opt-out</span> : les demandes d&apos;opt-out sont conservées sans limitation de durée afin de garantir le respect permanent de l&apos;opposition</li>
              <li><span className="text-content-primary font-medium">Suppression sur demande</span> : toute personne peut demander la suppression immédiate de ses données via la page <Link href="/opt-out" className="text-violet-400 hover:text-violet-300 transition">/opt-out</Link></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">12. Vos droits (RGPD)</h2>

            <h3 className="text-lg font-medium text-content-primary mt-5 mb-2">12.1 Droits des utilisateurs du Service</h3>
            <p>
              Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><span className="text-content-primary font-medium">Droit d&apos;accès</span> : obtenir une copie de vos données personnelles</li>
              <li><span className="text-content-primary font-medium">Droit de rectification</span> : corriger vos données inexactes ou incomplètes</li>
              <li><span className="text-content-primary font-medium">Droit de suppression</span> : demander l&apos;effacement de vos données</li>
              <li><span className="text-content-primary font-medium">Droit à la portabilité</span> : recevoir vos données dans un format structuré et lisible</li>
              <li><span className="text-content-primary font-medium">Droit d&apos;opposition</span> : vous opposer au traitement de vos données</li>
              <li><span className="text-content-primary font-medium">Droit à la limitation</span> : demander la limitation du traitement</li>
            </ul>

            <h3 className="text-lg font-medium text-content-primary mt-5 mb-2">12.2 Droits des personnes prospectées</h3>
            <p>
              Si vos données professionnelles sont traitées par le Service, consultez la section 7 ci-dessus ou rendez-vous
              sur notre <Link href="/opt-out" className="text-violet-400 hover:text-violet-300 transition">page d&apos;opt-out</Link>.
            </p>

            <p className="mt-4">
              Pour exercer ces droits, contactez notre DPO :
              <span className="text-content-primary font-medium"> contact@prospectia.ai</span>
            </p>
            <p className="mt-3">
              Pour plus de détails sur l&apos;exercice de vos droits, consultez notre
              <Link href="/rgpd" className="text-violet-400 hover:text-violet-300 transition ml-1">page dédiée RGPD</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">13. Sécurité</h2>
            <p>
              Nous mettons en place des mesures techniques et organisationnelles appropriées pour protéger
              les données personnelles contre tout accès non autorisé, perte ou altération :
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Chiffrement des données en transit (HTTPS/TLS 1.2+)</li>
              <li>Mots de passe hashés (jamais stockés en clair)</li>
              <li>Authentification sécurisée via Supabase Auth</li>
              <li>Paiements sécurisés via Stripe (certifié PCI DSS)</li>
              <li>Hébergement sécurisé sur Vercel avec CDN et protection DDoS</li>
              <li>Accès aux données restreint au personnel autorisé</li>
              <li>Journalisation des accès aux données sensibles</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">14. Réclamation</h2>
            <p>
              Si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD,
              vous avez le droit d&apos;introduire une réclamation auprès de la
              <span className="text-content-primary font-medium"> CNIL </span>
              (Commission Nationale de l&apos;Informatique et des Libertés) :
            </p>
            <div className="mt-4 p-4 rounded-xl border border-line bg-surface-card">
              <p className="text-content-primary font-medium">CNIL</p>
              <p className="text-sm mt-1">3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</p>
              <p className="text-sm mt-1">Site web : <span className="text-content-primary">www.cnil.fr</span></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">15. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier la présente politique de confidentialité à tout moment.
              Toute modification sera publiée sur cette page avec une date de mise à jour actualisée.
              En cas de modification substantielle, nous vous en informerons par email.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-content-secondary">
          <div className="flex gap-6">
            <Link href="/cgu" className="hover:text-content-primary transition">CGU</Link>
            <Link href="/rgpd" className="hover:text-content-primary transition">RGPD</Link>
          </div>
          <p className="text-content-tertiary text-xs">&copy; 2026 Prospectia.ai</p>
        </div>
      </div>
    </div>
  );
}
