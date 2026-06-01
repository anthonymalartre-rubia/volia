// /docs/configurer-domaine-email — Guide DNS ultra-simple, accessible sans login.
// Pour le démarchage pré-vente : "Avant de signer, voici exactement
// comment vous configurez votre domaine en 10 minutes."

import Link from 'next/link';
import MarketingHeader from '@/components/MarketingHeader';
import ReaderFooter from '@/components/ReaderFooter';
import { Mail, CheckCircle2, AlertCircle, Clock, Copy, ExternalLink, ArrowRight, HelpCircle } from 'lucide-react';

export const metadata = {
  title: "Configurer son domaine email Volia — Guide 10 minutes (Infomaniak, OVH, Gandi, Cloudflare)",
  description: "Guide pas-à-pas pour configurer SPF, DKIM et DMARC sur votre domaine pour envoyer des campagnes email avec Volia. Tous les registrars couverts.",
  alternates: { canonical: 'https://volia.fr/docs/configurer-domaine-email' },
};

export default function ConfigurerDomaineEmailPage() {
  return (
    <>
      <MarketingHeader />
      <main className="min-h-screen bg-surface-base py-12 px-4">
        <article className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="mb-10">
            <Link href="/docs" className="text-sm text-content-soft hover:text-content-strong">
              ← Docs
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-content-strong mt-3 mb-3 tracking-tight">
              Configurer votre domaine email
            </h1>
            <p className="text-base text-content-secondary leading-relaxed">
              10 minutes chrono, sans connaissance technique requise. Vous configurerez
              vous-même 3 enregistrements DNS pour que vos campagnes partent depuis
              votre propre domaine professionnel (et pas depuis un domaine partagé Volia).
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-content-soft">
              <span className="inline-flex items-center gap-1">
                <Clock size={12} /> 10 minutes
              </span>
              <span className="inline-flex items-center gap-1">
                <HelpCircle size={12} /> Aucune compétence technique requise
              </span>
            </div>
          </div>

          {/* Pourquoi */}
          <section className="mb-10 p-5 rounded-xl bg-violet-50 border border-violet-200">
            <h2 className="text-base font-bold text-violet-900 mb-2">Pourquoi cette étape ?</h2>
            <p className="text-sm text-violet-900 leading-relaxed">
              Sans cette configuration, vos emails partiraient depuis un domaine
              générique Volia → arrivent quasi-systématiquement en spam.
              Avec votre domaine configuré (ex : <code className="bg-white px-1.5 py-0.5 rounded text-xs">vous@votre-entreprise.fr</code>),
              vos campagnes arrivent en inbox et préservent votre réputation de marque.
            </p>
          </section>

          {/* Étapes vue d'ensemble */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-content-strong mb-4">
              Vue d&apos;ensemble
            </h2>
            <ol className="space-y-3">
              <Step n={1} title="Identifier votre registrar" />
              <Step n={2} title="Ajouter 3 enregistrements DNS" />
              <Step n={3} title="Attendre la propagation (5 min à 24 h)" />
              <Step n={4} title="Connecter le domaine dans Volia" />
            </ol>
          </section>

          {/* Étape 1 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-content-strong mb-3">
              1. Identifier votre registrar
            </h2>
            <p className="text-sm text-content-secondary leading-relaxed mb-4">
              Votre registrar = la société chez qui vous avez acheté votre nom
              de domaine. Si vous ne savez pas où, allez vérifier ici :{' '}
              <a href="https://www.whois.com" target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">
                whois.com <ExternalLink size={11} className="inline" />
              </a>
              {' '}— tapez votre domaine, le registrar apparaît dans les résultats.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {['Infomaniak', 'OVH', 'Gandi', 'Cloudflare'].map((r) => (
                <div key={r} className="p-3 rounded-lg bg-surface-soft border border-line-soft text-center font-semibold">
                  {r}
                </div>
              ))}
              {['GoDaddy', 'Namecheap', 'Hostinger', 'Autre'].map((r) => (
                <div key={r} className="p-3 rounded-lg bg-surface-soft border border-line-soft text-center text-content-soft">
                  {r}
                </div>
              ))}
            </div>
            <p className="text-xs text-content-soft mt-3 italic">
              Tous les registrars suivent la même logique : ajouter 3 enregistrements
              DNS. Seule l&apos;interface change.
            </p>
          </section>

          {/* Étape 2 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-content-strong mb-3">
              2. Ajouter 3 enregistrements DNS
            </h2>
            <p className="text-sm text-content-secondary leading-relaxed mb-4">
              Connectez-vous à votre registrar → trouvez la section <strong>DNS</strong> ou{' '}
              <strong>Gestion des zones</strong>. Ajoutez ces 3 enregistrements
              (Volia vous donnera les valeurs exactes au moment de la connexion) :
            </p>
            <div className="space-y-3">
              <DnsRecord
                type="TXT"
                name="resend._domainkey"
                purpose="DKIM"
                description="Signature cryptographique qui prouve que l'email vient bien de vous."
              />
              <DnsRecord
                type="TXT"
                name="@ (racine du domaine)"
                purpose="SPF"
                description="Autorise les serveurs Resend (notre prestataire d'envoi) à envoyer pour votre compte."
              />
              <DnsRecord
                type="TXT"
                name="_dmarc"
                purpose="DMARC"
                description="Définit la politique à appliquer si un email n'est pas authentifié."
              />
            </div>
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-900 leading-relaxed">
                <strong>⚠️ Attention :</strong> n&apos;ajoutez PAS plusieurs records SPF.
                Si vous avez déjà un SPF (par ex pour Google Workspace), vous devez
                le <em>fusionner</em> avec celui de Volia, pas en ajouter un second.
                Si vous n&apos;êtes pas sûr, contactez{' '}
                <a href="mailto:contact@volia.fr" className="underline font-semibold">contact@volia.fr</a>{' '}
                — on regarde ensemble.
              </p>
            </div>
          </section>

          {/* Captures par registrar */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-content-strong mb-3">
              Tutoriels par registrar
            </h2>
            <div className="space-y-4">
              <RegistrarGuide
                name="Infomaniak"
                steps={[
                  "Connectez-vous à votre Manager Infomaniak",
                  "Menu de gauche → Hébergement → votre domaine",
                  "Onglet « DNS » → bouton « Ajouter une entrée »",
                  "Choisir le type (TXT), renseigner le nom et la valeur fournis par Volia",
                  "Répéter pour les 3 records",
                  "Sauvegarder (propagation : 5 min à 4 h)",
                ]}
                helpUrl="https://www.infomaniak.com/fr/support/faq/2055/gerer-les-enregistrements-dns-d-un-domaine"
              />
              <RegistrarGuide
                name="OVH"
                steps={[
                  "Espace client OVH → Web Cloud → Domaines",
                  "Cliquez sur votre domaine → onglet « Zone DNS »",
                  "Bouton « Ajouter une entrée » (en haut à droite)",
                  "Sélectionner type TXT → coller nom et valeur Volia",
                  "Cliquer « Suivant » puis « Confirmer »",
                  "Propagation : 10 min à 24 h",
                ]}
                helpUrl="https://help.ovhcloud.com/csm/fr-dns-add-record"
              />
              <RegistrarGuide
                name="Gandi"
                steps={[
                  "Tableau de bord Gandi → Domaine → votre domaine",
                  "Onglet « DNS Records » → bouton « Add »",
                  "Type : TXT, Name : valeur Volia, Value : valeur Volia",
                  "Cliquer « Create »",
                  "Propagation : 5 min à 4 h",
                ]}
                helpUrl="https://docs.gandi.net/fr/noms_de_domaine/dns_gandi/enregistrements.html"
              />
              <RegistrarGuide
                name="Cloudflare"
                steps={[
                  "Dashboard Cloudflare → cliquer sur votre domaine",
                  "Menu de gauche → DNS → Records → bouton « Add record »",
                  "Type : TXT → Name + Content (valeurs Volia)",
                  "⚠️ DÉSACTIVER le proxy (orange cloud → gris) pour les records TXT",
                  "Cliquer « Save »",
                  "Propagation : quasi-instantanée (1-5 min)",
                ]}
                helpUrl="https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/"
              />
            </div>
          </section>

          {/* Étape 3 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-content-strong mb-3">
              3. Attendre la propagation
            </h2>
            <p className="text-sm text-content-secondary leading-relaxed mb-3">
              Après avoir sauvegardé les records, ils doivent se propager sur
              Internet. Le délai varie selon votre registrar :
            </p>
            <ul className="text-sm space-y-1 text-content-secondary mb-4 list-disc list-inside">
              <li><strong>Cloudflare :</strong> 1-5 minutes</li>
              <li><strong>Infomaniak / Gandi :</strong> 5 min à 4 h</li>
              <li><strong>OVH :</strong> 10 min à 24 h</li>
              <li><strong>Autres :</strong> jusqu&apos;à 48 h dans les cas rares</li>
            </ul>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900 leading-relaxed">
                <strong>💡 Vérifier la propagation :</strong> allez sur{' '}
                <a href="https://mxtoolbox.com/SuperTool.aspx" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                  mxtoolbox.com <ExternalLink size={11} className="inline" />
                </a>
                {' '}→ choisir « TXT Lookup » → taper <code className="bg-white px-1.5 py-0.5 rounded text-xs">resend._domainkey.votre-domaine.fr</code>.
                Si vous voyez le record, c&apos;est propagé.
              </p>
            </div>
          </section>

          {/* Étape 4 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-content-strong mb-3">
              4. Connecter le domaine dans Volia
            </h2>
            <p className="text-sm text-content-secondary leading-relaxed mb-4">
              Une fois les 3 records DNS ajoutés (peu importe la propagation) :
            </p>
            <ol className="space-y-2 text-sm text-content-secondary mb-4 list-decimal list-inside">
              <li>Connectez-vous à <a href="https://volia.fr/dashboard" className="text-violet-600 underline">volia.fr/dashboard</a></li>
              <li>Allez dans <strong>Réglages → Domaines d&apos;envoi</strong></li>
              <li>Cliquez sur <strong>« + Connecter un domaine »</strong></li>
              <li>Tapez votre domaine, ex : <code className="bg-surface-soft px-1.5 py-0.5 rounded text-xs">votre-entreprise.fr</code></li>
              <li>Volia vérifie automatiquement les 3 records (icône verte si OK)</li>
              <li>Si un record est manquant, l&apos;interface vous dit lequel</li>
            </ol>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-sm text-emerald-900 leading-relaxed">
                <strong>✅ Une fois validé :</strong> vous pouvez envoyer vos
                campagnes depuis <code className="bg-white px-1.5 py-0.5 rounded text-xs">vous@votre-domaine.fr</code>.
                Tous vos emails arrivent en inbox.
              </p>
            </div>
          </section>

          {/* FAQ courte */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-content-strong mb-4">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              <Faq
                q="Et si je ne sais vraiment pas configurer mon DNS ?"
                a={<>Aucun souci : pour les <strong>10 premiers clients Volia</strong>, nous configurons votre domaine à votre place gratuitement. Envoyez un email à <a href="mailto:contact@volia.fr" className="text-violet-600 underline">contact@volia.fr</a> avec votre domaine et un accès temporaire à votre registrar (ou un appel visio de 15 min).</>}
              />
              <Faq
                q="Je n'ai pas de domaine, que faire ?"
                a={<>Achetez-en un sur <a href="https://www.infomaniak.com" target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">Infomaniak <ExternalLink size={11} className="inline" /></a> ou <a href="https://www.ovh.com" target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">OVH <ExternalLink size={11} className="inline" /></a>. Comptez 10 €/an pour un .fr. Choisissez un nom qui ressemble à votre entreprise — c&apos;est l&apos;adresse qui apparaîtra en expéditeur.</>}
              />
              <Faq
                q="J'ai déjà Google Workspace ou Microsoft 365, ça pose problème ?"
                a={<>Non, c&apos;est compatible. Vous gardez Google/Microsoft pour recevoir vos emails standards, Volia s&apos;ajoute pour envoyer vos campagnes. Attention juste à ne pas avoir plusieurs records SPF — si besoin, on les fusionne ensemble.</>}
              />
              <Faq
                q="Combien de temps reste valide la config ?"
                a={<>Tant que vous ne supprimez pas les records, la config reste active à vie. Aucune maintenance requise. Si vous arrêtez Volia, supprimez juste les records (10 secondes).</>}
              />
              <Faq
                q="C'est risqué pour mon site ?"
                a={<>Zéro risque. On ajoute uniquement des <strong>records TXT</strong> (texte) pour authentifier vos emails. On ne touche pas aux records A, CNAME ou MX qui gèrent votre site web et votre messagerie. Votre site et votre email restent intacts.</>}
              />
            </div>
          </section>

          {/* CTA fin */}
          <section className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-center">
            <h2 className="text-xl font-bold mb-2">Prêt à configurer ?</h2>
            <p className="text-sm opacity-90 mb-4">
              On vous accompagne en 15 min sur Cal.com si vous voulez qu&apos;on fasse ça ensemble.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href="https://cal.com/anthony-volia/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-white text-violet-700 font-semibold text-sm hover:bg-violet-50 transition"
              >
                Réserver 15 min <ArrowRight size={14} />
              </a>
              <a
                href="mailto:contact@volia.fr?subject=Aide config domaine"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-white/10 text-white border border-white/30 font-semibold text-sm hover:bg-white/20 transition"
              >
                <Mail size={14} /> Demander de l&apos;aide
              </a>
            </div>
          </section>
        </article>
      </main>
      <ReaderFooter />
    </>
  );
}

function Step({ n, title }) {
  return (
    <li className="flex items-center gap-3 p-3 rounded-lg bg-surface-soft border border-line-soft">
      <span className="shrink-0 w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
        {n}
      </span>
      <span className="text-sm font-medium text-content-strong">{title}</span>
    </li>
  );
}

function DnsRecord({ type, name, purpose, description }) {
  return (
    <div className="p-4 rounded-xl border border-line-soft bg-surface-soft">
      <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold">
            {type}
          </span>
          <span className="font-mono text-sm text-content-strong">{name}</span>
        </div>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
          {purpose}
        </span>
      </div>
      <p className="text-xs text-content-soft leading-relaxed">{description}</p>
    </div>
  );
}

function RegistrarGuide({ name, steps, helpUrl }) {
  return (
    <details className="rounded-xl border border-line-soft bg-surface-soft p-4 group">
      <summary className="cursor-pointer font-semibold text-content-strong flex items-center justify-between">
        <span>{name}</span>
        <span className="text-xs text-content-soft group-open:hidden">cliquer pour ouvrir</span>
      </summary>
      <ol className="mt-4 space-y-2 text-sm text-content-secondary list-decimal list-inside">
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      <a
        href={helpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs text-violet-600 hover:underline"
      >
        Aide officielle {name} <ExternalLink size={10} />
      </a>
    </details>
  );
}

function Faq({ q, a }) {
  return (
    <details className="rounded-xl border border-line-soft bg-surface-soft p-4 group">
      <summary className="cursor-pointer font-semibold text-content-strong text-sm">
        {q}
      </summary>
      <div className="mt-3 text-sm text-content-secondary leading-relaxed">{a}</div>
    </details>
  );
}
