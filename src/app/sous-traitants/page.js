import Link from 'next/link';
import { ExternalLink, ShieldCheck, MapPin, FileText } from 'lucide-react';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderFooter from '@/components/ReaderFooter';

export const metadata = {
  title: 'Sous-traitants RGPD — Volia',
  description:
    'Liste transparente des sous-traitants Volia : Supabase, Resend, Stripe, Vercel, Cal.com. Tous conformes RGPD avec DPA accessibles.',
  keywords: [
    'sous-traitants rgpd volia',
    'data processors volia',
    'rgpd saas b2b transparence',
  ],
  alternates: {
    canonical: 'https://volia.fr/sous-traitants',
  },
};

const SUBPROCESSORS = [
  {
    name: 'Supabase',
    role: 'Hébergement BDD PostgreSQL + Auth + Storage',
    data: 'Toutes les données utilisateur (profils, prospects, deals, etc.)',
    location: 'UE (Frankfurt)',
    region: 'eu',
    dpaUrl: 'https://supabase.com/legal/dpa',
    dpaLabel: 'DPA Supabase',
  },
  {
    name: 'Vercel',
    role: 'Hébergement infrastructure web (frontend + serverless)',
    data: 'Logs techniques + temporary request data',
    location: 'UE (Frankfurt, Stockholm)',
    region: 'eu',
    dpaUrl: 'https://vercel.com/legal/dpa',
    dpaLabel: 'DPA Vercel',
  },
  {
    name: 'Resend',
    role: 'Envoi et réception emails transactionnels et campagnes',
    data: 'Adresses email + contenu des emails',
    location: 'UE (Ireland)',
    region: 'eu',
    dpaUrl: 'https://resend.com/legal/dpa',
    dpaLabel: 'DPA Resend',
  },
  {
    name: 'Stripe',
    role: 'Gestion des paiements et abonnements',
    data: 'Nom, email, infos paiement (CB tokenisé)',
    location: 'UE (Irlande) + USA (cf SCC)',
    region: 'mixed',
    dpaUrl: 'https://stripe.com/legal/dpa',
    dpaLabel: 'DPA Stripe',
  },
  {
    name: 'Twilio',
    role: '(Désactivé, futur) SMS et numéros virtuels',
    data: 'Numéros téléphone, contenu SMS',
    location: 'UE + USA (SCC)',
    region: 'mixed',
    dpaUrl: 'https://www.twilio.com/legal/dpa',
    dpaLabel: 'DPA Twilio',
  },
  {
    name: 'Cal.com',
    role: 'Booking demos (optionnel, externe)',
    data: 'Email du visiteur si booking',
    location: 'UE',
    region: 'eu',
    dpaUrl: 'https://cal.com/dpa',
    dpaLabel: 'DPA Cal.com',
  },
  {
    name: 'Trustpilot',
    role: 'Collecte d\'avis clients',
    data: 'Email + avis publiés',
    location: 'UE',
    region: 'eu',
    dpaUrl: 'https://legal.trustpilot.com/legal-documents/end-user-terms-and-data-processing-agreement',
    dpaLabel: 'DPA Trustpilot',
  },
  {
    name: 'Upstash Redis',
    role: 'Cache + rate limiting',
    data: 'Hashes, compteurs anonymes',
    location: 'UE',
    region: 'eu',
    dpaUrl: 'https://upstash.com/trust',
    dpaLabel: 'Privacy Upstash',
  },
  {
    name: 'Anthropic',
    role: 'API IA (parse-search recherche en langage naturel)',
    data: 'Texte de requête utilisateur (anonymisé)',
    location: 'USA (SCC)',
    region: 'us',
    dpaUrl: 'https://www.anthropic.com/legal/dpa',
    dpaLabel: 'DPA Anthropic',
  },
  {
    name: 'Google Places',
    role: 'API Google pour rechercher entreprises (données publiques)',
    data: 'Nom entreprise, adresse, catégorie',
    location: 'USA (SCC)',
    region: 'us',
    dpaUrl: 'https://cloud.google.com/terms/data-processing-addendum',
    dpaLabel: 'DPA Google Cloud',
  },
];

function LocationBadge({ region, location }) {
  const styles = {
    eu: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    us: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    mixed:
      'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${styles[region] || styles.eu}`}
    >
      <MapPin size={12} />
      {location}
    </span>
  );
}

export default function SousTraitantsPage() {
  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <ReaderHeader />

      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <header className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold border border-violet-500/20 mb-5">
              <ShieldCheck size={14} />
              Transparence RGPD
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              Sous-traitants RGPD de Volia
            </h1>
            <p className="text-base sm:text-lg text-content-secondary leading-relaxed max-w-3xl">
              Les outils tiers qui font tourner Volia, leur rôle, leur localisation,
              et le lien vers leur DPA. Rien de caché.
            </p>
            <p className="text-xs text-content-muted mt-4">
              Dernière mise à jour : 26 mai 2026
            </p>
          </header>

          {/* En résumé global */}
          <section className="mb-8">
            <div className="p-5 rounded-xl border border-violet-500/30 bg-violet-500/5 text-sm text-content-secondary leading-relaxed">
              <p className="text-content-primary font-semibold mb-2">En 2 phrases</p>
              <p>
                Volia s&apos;appuie sur 10 services tiers (hébergement, paiement, IA, emails). Vos
                données utilisateur sont stockées dans l&apos;UE ; pour les rares sous-traitants
                hors UE, on s&apos;appuie sur les Clauses Contractuelles Types et le Data Privacy
                Framework.
              </p>
            </div>
          </section>

          {/* Introduction */}
          <section className="mb-10">
            <div className="p-5 sm:p-6 rounded-2xl border border-line bg-surface-card">
              <p className="text-content-secondary leading-relaxed">
                Conformément à l&apos;article 28 du RGPD, Volia (responsable de
                traitement) utilise des sous-traitants pour vous fournir le
                Service. Chacun est listé ci-dessous avec son rôle, sa
                localisation, et un lien vers ses garanties contractuelles.
              </p>
            </div>
          </section>

          {/* Table */}
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              Liste des sous-traitants ({SUBPROCESSORS.length})
            </h2>

            <div className="rounded-2xl border border-line bg-surface-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[760px]">
                  <thead className="sticky top-0 bg-surface-elevated/95 backdrop-blur z-10">
                    <tr className="border-b border-line">
                      <th className="text-left py-3 px-4 font-semibold text-content-primary whitespace-nowrap">
                        Sous-traitant
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-content-primary">
                        Rôle
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-content-primary">
                        Données traitées
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-content-primary whitespace-nowrap">
                        Localisation
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-content-primary whitespace-nowrap">
                        DPA
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUBPROCESSORS.map((sp, idx) => (
                      <tr
                        key={sp.name}
                        className={
                          idx !== SUBPROCESSORS.length - 1
                            ? 'border-b border-line'
                            : ''
                        }
                      >
                        <td className="py-3 px-4 font-semibold text-content-primary whitespace-nowrap align-top">
                          {sp.name}
                        </td>
                        <td className="py-3 px-4 text-content-secondary align-top">
                          {sp.role}
                        </td>
                        <td className="py-3 px-4 text-content-secondary align-top">
                          {sp.data}
                        </td>
                        <td className="py-3 px-4 align-top">
                          <LocationBadge
                            region={sp.region}
                            location={sp.location}
                          />
                        </td>
                        <td className="py-3 px-4 align-top">
                          <a
                            href={sp.dpaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:text-violet-500 transition text-sm font-medium whitespace-nowrap"
                          >
                            {sp.dpaLabel}
                            <ExternalLink size={12} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Notes complémentaires */}
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              Notes complémentaires
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-line bg-surface-card flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="text-emerald-500 mt-0.5 shrink-0"
                />
                <p className="text-sm text-content-secondary">
                  Toutes les données utilisateurs sont{' '}
                  <span className="text-content-primary font-medium">
                    stockées et hébergées dans l&apos;UE
                  </span>{' '}
                  (Supabase Frankfurt).
                </p>
              </div>
              <div className="p-4 rounded-xl border border-line bg-surface-card flex items-start gap-3">
                <FileText
                  size={18}
                  className="text-amber-500 mt-0.5 shrink-0"
                />
                <p className="text-sm text-content-secondary">
                  Pour les sous-traitants USA : signature{' '}
                  <span className="text-content-primary font-medium">
                    SCC (Standard Contractual Clauses)
                  </span>{' '}
                  + Data Privacy Framework (DPF) certifiés.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-line bg-surface-card flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="text-violet-500 mt-0.5 shrink-0"
                />
                <p className="text-sm text-content-secondary">
                  Volia s&apos;engage à{' '}
                  <span className="text-content-primary font-medium">
                    notifier ses clients dans les 30 jours
                  </span>{' '}
                  avant tout ajout / changement de sous-traitant majeur.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-line bg-surface-card flex items-start gap-3">
                <FileText
                  size={18}
                  className="text-content-tertiary mt-0.5 shrink-0"
                />
                <p className="text-sm text-content-secondary">
                  Liste mise à jour à chaque modification de la stack.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-4">
            <div className="p-6 sm:p-8 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-violet-500/5">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                Besoin d&apos;un DPA personnalisé pour votre entreprise ?
              </h2>
              <p className="text-content-secondary mb-5 text-sm sm:text-base">
                On vous prépare un Data Processing Agreement adapté à vos contraintes :
                annexe sécurité, liste de sous-traitants à jour, droit d&apos;audit.
              </p>
              <Link
                href="/dpa"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition text-sm"
              >
                Demander un DPA personnalisé
                <ExternalLink size={14} />
              </Link>
            </div>
          </section>

          {/* Footer nav links */}
          <div className="mt-12 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4 text-sm text-content-secondary">
            <div className="flex flex-wrap gap-5">
              <Link
                href="/confidentialite"
                className="hover:text-content-primary transition"
              >
                Confidentialité
              </Link>
              <Link href="/cgu" className="hover:text-content-primary transition">
                CGU
              </Link>
              <Link
                href="/rgpd"
                className="hover:text-content-primary transition"
              >
                RGPD
              </Link>
              <Link
                href="/opt-out"
                className="hover:text-content-primary transition"
              >
                Opt-out
              </Link>
            </div>
            <p className="text-content-tertiary text-xs">&copy; 2026 Volia.fr</p>
          </div>
        </div>
      </main>

      <ReaderFooter />
    </div>
  );
}
