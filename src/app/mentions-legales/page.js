import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Mentions légales — Volia.fr',
  description: 'Mentions légales de Volia.fr : éditeur, hébergeur, propriété intellectuelle et contact, conformément à la loi pour la confiance dans l\'économie numérique (LCEN).',
  alternates: { canonical: 'https://volia.fr/mentions-legales' },
};

// ─────────────────────────────────────────────────────────────────────
// ⚠️ À COMPLÉTER PAR ANTHONY avant la pub : les champs balisés [À COMPLÉTER]
// ci-dessous sont obligatoires (art. 6 III LCEN) et ne peuvent pas être
// devinés. Renseigne la forme juridique, le SIREN/SIRET, le RCS et (le cas
// échéant) le capital social + n° de TVA intracommunautaire.
//   - Micro-entreprise / EI : indiquer « Entrepreneur individuel » + SIREN +
//     ville d'immatriculation au RM/RCS. Pas de capital social.
//   - Société (SAS, SASU…) : raison sociale + capital + RCS + SIREN + TVA.
// L'adresse, l'email et le directeur de publication sont déjà renseignés
// (issus du compte Stripe Volia vérifié).
// ─────────────────────────────────────────────────────────────────────

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-content-secondary hover:text-content-primary transition mb-10">
          <ArrowLeft size={16} />
          Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Mentions légales</h1>
        <p className="text-content-secondary text-sm mb-10">Dernière mise à jour : 17 juin 2026</p>

        <div className="space-y-10 text-content-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">1. Éditeur du site</h2>
            <p>
              Le site <span className="text-content-primary font-medium">volia.fr</span> est édité par :
            </p>
            <ul className="mt-3 space-y-1">
              <li><span className="text-content-primary font-medium">Volia</span></li>
              <li>Forme juridique : <span className="text-content-primary font-medium">[À COMPLÉTER — ex. Entrepreneur individuel / SAS]</span></li>
              <li>Siège social : 116 Rue Sarah Bernhardt, 07430 Davézieux, France</li>
              <li>SIREN / SIRET : <span className="text-content-primary font-medium">[À COMPLÉTER]</span></li>
              <li>Immatriculation : <span className="text-content-primary font-medium">[À COMPLÉTER — RCS / RM + ville]</span></li>
              <li>N° de TVA intracommunautaire : <span className="text-content-primary font-medium">[À COMPLÉTER ou « Non assujetti à la TVA — art. 293 B du CGI »]</span></li>
              <li>Email : <span className="text-content-primary font-medium">contact@volia.fr</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">2. Directeur de la publication</h2>
            <p>
              Le directeur de la publication est{' '}
              <span className="text-content-primary font-medium">Anthony Malartre</span>, en sa qualité de représentant
              légal de l&apos;éditeur. Contact : <span className="text-content-primary font-medium">contact@volia.fr</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">3. Hébergement</h2>
            <p>Le site est hébergé par :</p>
            <div className="mt-3 space-y-4">
              <div>
                <p className="text-content-primary font-medium">Vercel Inc.</p>
                <p>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
                <p>
                  Site :{' '}
                  <a href="https://vercel.com" className="text-violet-400 hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a>
                </p>
              </div>
              <div>
                <p className="text-content-primary font-medium">Supabase (base de données)</p>
                <p>Supabase Inc. — données hébergées en Union européenne (région UE).</p>
                <p>
                  Site :{' '}
                  <a href="https://supabase.com" className="text-violet-400 hover:underline" target="_blank" rel="noopener noreferrer">supabase.com</a>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">4. Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des éléments du site (structure, textes, logos, marque « Volia », graphismes, interfaces,
              code source) est protégé par le droit de la propriété intellectuelle et reste la propriété exclusive de
              l&apos;éditeur, sauf mention contraire. Toute reproduction, représentation, modification ou exploitation,
              totale ou partielle, sans autorisation écrite préalable, est interdite et constitue une contrefaçon
              sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">5. Données personnelles</h2>
            <p>
              Le traitement des données personnelles est détaillé dans notre{' '}
              <Link href="/confidentialite" className="text-violet-400 hover:underline">Politique de confidentialité</Link>{' '}
              et notre page{' '}
              <Link href="/rgpd" className="text-violet-400 hover:underline">Droits RGPD</Link>. Vous pouvez exercer
              vos droits (accès, rectification, suppression, opposition) à tout moment à l&apos;adresse{' '}
              <span className="text-content-primary font-medium">contact@volia.fr</span> ou via la page{' '}
              <Link href="/opt-out" className="text-violet-400 hover:underline">opt-out</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">6. Cookies</h2>
            <p>
              La gestion des cookies et traceurs est décrite dans notre page dédiée{' '}
              <Link href="/cookies" className="text-violet-400 hover:underline">Cookies</Link>. Aucun cookie de mesure
              d&apos;audience ou publicitaire n&apos;est déposé sans votre consentement préalable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">7. Conditions d&apos;utilisation</h2>
            <p>
              L&apos;utilisation du service est régie par nos{' '}
              <Link href="/cgu" className="text-violet-400 hover:underline">Conditions générales d&apos;utilisation</Link>{' '}
              et nos{' '}
              <Link href="/cgv" className="text-violet-400 hover:underline">Conditions générales de vente</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">8. Médiation et litiges</h2>
            <p>
              Les présentes mentions légales sont soumises au droit français. En cas de litige et à défaut de résolution
              amiable, les tribunaux français seront seuls compétents. Conformément à l&apos;article L.612-1 du Code de la
              consommation, le client consommateur peut recourir gratuitement à un médiateur de la consommation en vue
              de la résolution amiable d&apos;un litige.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-content-primary mb-3">9. Contact</h2>
            <p>
              Pour toute question relative au site ou au service :{' '}
              <span className="text-content-primary font-medium">contact@volia.fr</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
