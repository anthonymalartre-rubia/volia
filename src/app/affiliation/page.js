// /affiliation — Programme d'apporteurs d'affaires (page publique)
// Pitch + formulaire de candidature (validation manuelle).

import MarketingHeader from '@/components/MarketingHeader';
import ReaderFooter from '@/components/ReaderFooter';
import AffiliateApplyForm from '@/components/AffiliateApplyForm';
import { Banknote, Link2, ShieldCheck, TrendingUp, FileText } from 'lucide-react';

export const metadata = {
  title: 'Programme apporteurs d\'affaires — Gagne des commissions avec Volia',
  description:
    'Recommande Volia et touche 50 % de commission la 1ʳᵉ année, 30 % la 2ᵉ, sur chaque client que tu amènes. Programme pour commerciaux indépendants — Made in France.',
  alternates: { canonical: 'https://volia.fr/affiliation' },
  openGraph: {
    title: 'Deviens apporteur d\'affaires Volia',
    description: 'Ton lien, tes clients, tes commissions : 50 % la 1ʳᵉ année, 30 % la 2ᵉ.',
    type: 'website',
  },
};

const STEPS = [
  { icon: Link2, title: 'Tu obtiens ton lien', text: 'Après validation de ta candidature, tu reçois ton lien d\'affiliation unique + un tableau de bord.' },
  { icon: TrendingUp, title: 'Tu recommandes Volia', text: 'Tu partages ton lien à ton réseau (TPE, indépendants, commerciaux). Chaque clic est tracké.' },
  { icon: Banknote, title: 'Tu es payé·e', text: 'Pour chaque client qui devient payant : 50 % de commission la 1ʳᵉ année, 30 % la 2ᵉ. Versé sur facture.' },
];

export default function AffiliationPage() {
  return (
    <>
      <MarketingHeader />
      <main id="main-content" className="bg-surface-base text-content-primary">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 pt-16 pb-10 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised px-4 py-1.5 text-xs font-semibold text-violet-500">
            🤝 Programme apporteurs d'affaires
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Recommande Volia. <span className="bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent">Touche des commissions.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-content-secondary">
            Tu as un réseau de TPE, d'indépendants ou de commerciaux ? Recommande l'outil de prospection
            le moins cher du marché et sois rémunéré·e sur chaque client que tu amènes.
          </p>
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-line bg-surface-raised px-8 py-5">
            <div>
              <div className="text-3xl font-bold text-violet-600">50 %</div>
              <div className="text-xs text-content-tertiary">de commission la 1ʳᵉ année</div>
            </div>
            <div className="h-10 w-px bg-line" />
            <div>
              <div className="text-3xl font-bold text-indigo-600">30 %</div>
              <div className="text-xs text-content-tertiary">la 2ᵉ année</div>
            </div>
            <div className="h-10 w-px bg-line" />
            <div>
              <div className="text-3xl font-bold text-amber-500">récurrent</div>
              <div className="text-xs text-content-tertiary">sur chaque paiement</div>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <h2 className="text-center text-2xl font-bold">Comment ça marche</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={i} className="rounded-2xl border border-line bg-surface-raised p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-xs font-semibold text-content-tertiary">ÉTAPE {i + 1}</div>
                <h3 className="mt-1 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-content-secondary">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pourquoi Volia se recommande bien */}
        <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <div className="rounded-2xl border border-line bg-surface-raised p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="h-5 w-5 text-emerald-500" /> Un produit facile à recommander
            </h2>
            <ul className="mt-4 grid gap-3 text-sm text-content-secondary sm:grid-cols-2">
              <li>🇫🇷 Made in France, hébergement 100 % UE, RGPD natif</li>
              <li>💸 Dès 19 €/mois — accessible aux TPE et indépendants</li>
              <li>🤖 L'IA fait la corvée, l'humain garde la décision</li>
              <li>🧩 Suite complète : Prospection · Campagnes · CRM · Forms</li>
              <li>🎁 Essai 14 jours sans carte bancaire (faible friction)</li>
              <li>📊 Tableau de bord affilié : suis tes gains en temps réel</li>
            </ul>
          </div>
        </section>

        {/* Formulaire */}
        <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <h2 className="text-center text-2xl font-bold">Postuler au programme</h2>
          <p className="mx-auto mt-2 mb-6 max-w-md text-center text-sm text-content-tertiary">
            Les candidatures sont validées manuellement. Tu recevras ton lien et tes accès par email.
          </p>
          <AffiliateApplyForm />
          <p className="mt-4 text-center text-sm text-content-tertiary">
            <a
              href="/contrat-apporteur-affaires-volia.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-violet-500 underline-offset-2 hover:underline"
            >
              <FileText className="h-4 w-4" /> Consulter le contrat type d'apporteur d'affaires (PDF)
            </a>
          </p>
        </section>

        {/* Mentions */}
        <section className="mx-auto max-w-2xl px-4 pb-16 text-center text-xs text-content-tertiary sm:px-6">
          <p>
            La rémunération est versée sur présentation d'une facture (statut d'indépendant requis).
            Les commissions deviennent payables 30 jours après le paiement du client (fenêtre de remboursement)
            et sont annulées en cas de remboursement. Conditions complètes communiquées à la validation.
          </p>
        </section>
      </main>
      <ReaderFooter />
    </>
  );
}
