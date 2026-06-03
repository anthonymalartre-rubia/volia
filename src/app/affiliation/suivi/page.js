'use client';

// /affiliation/suivi?code=XXXX — tableau de bord affilié (lecture seule).
// Le code (dans le lien privé envoyé par email) sert de jeton d'accès.

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MarketingHeader from '@/components/MarketingHeader';
import { Copy, Check, Loader2 } from 'lucide-react';

const eur = (cents) => (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-5">
      <div className={`text-2xl font-bold ${accent || 'text-content-primary'}`}>{value}</div>
      <div className="mt-1 text-xs text-content-tertiary">{label}</div>
    </div>
  );
}

function SuiviInner() {
  const params = useSearchParams();
  const code = params.get('code');
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading'); // loading | ok | error
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) { setState('error'); return; }
    fetch(`/api/affiliates/me?code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) { setData(d); setState('ok'); } else setState('error');
      })
      .catch(() => setState('error'));
  }, [code]);

  const link = code ? `https://volia.fr/?aff=${code}` : '';
  const copy = () => {
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (state === 'loading') {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>;
  }
  if (state === 'error') {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-bold text-content-primary">Lien invalide</h1>
        <p className="mt-2 text-content-secondary">
          Ce tableau de bord s'ouvre via ton lien privé (reçu par email). Besoin d'aide ? contact@volia.fr
        </p>
      </div>
    );
  }

  const { affiliate, stats, commissions } = data;
  const pending = affiliate.status !== 'approved';

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-content-primary">
        Bonjour {affiliate.name || 'cher affilié'} 👋
      </h1>

      {pending && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          Ton compte est <b>{affiliate.status === 'pending' ? 'en cours de validation' : affiliate.status}</b>.
          Ton lien deviendra actif une fois approuvé.
        </div>
      )}

      {/* Lien d'affiliation */}
      <div className="mt-6 rounded-2xl border border-line bg-surface-raised p-5">
        <div className="text-xs font-semibold text-content-tertiary">TON LIEN D'AFFILIATION</div>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <code className="flex-1 truncate rounded-lg bg-surface-base px-4 py-3 text-sm text-content-primary">{link}</code>
          <button
            onClick={copy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clients amenés" value={stats.clients} accent="text-violet-600" />
        <StatCard label="Gains cumulés (hors annulés)" value={eur(stats.earnedTotalCents)} accent="text-content-primary" />
        <StatCard label="À verser (disponible)" value={eur(stats.payableCents)} accent="text-emerald-600" />
        <StatCard label="Déjà versé" value={eur(stats.paidCents)} accent="text-indigo-600" />
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <StatCard label="En attente (délai 30 j)" value={eur(stats.pendingHoldCents)} accent="text-amber-600" />
        <StatCard label="Annulé (remboursements)" value={eur(stats.clawedBackCents)} accent="text-content-tertiary" />
      </div>

      {/* Historique */}
      <h2 className="mt-10 text-lg font-bold text-content-primary">Historique des commissions</h2>
      {commissions.length === 0 ? (
        <p className="mt-3 text-sm text-content-tertiary">
          Pas encore de commission. Partage ton lien — chaque client payant te rapporte 50 % la 1ʳᵉ année.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised text-left text-xs text-content-tertiary">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Taux</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="px-4 py-3 text-content-secondary">{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-content-secondary">{Math.round(c.rate * 100)} %</td>
                  <td className="px-4 py-3 font-semibold text-content-primary">{eur(c.commission_cents)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-surface-base px-2 py-0.5 text-xs text-content-secondary">
                      {c.status === 'paid' ? 'Versé' : c.status === 'clawed_back' ? 'Annulé' : 'En cours'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-8 text-xs text-content-tertiary">
        Versement sur facture une fois un seuil atteint. Les commissions deviennent disponibles 30 jours
        après le paiement du client. Une question ? contact@volia.fr
      </p>
    </div>
  );
}

export default function AffiliateDashboardPage() {
  return (
    <>
      <MarketingHeader />
      <main id="main-content" className="bg-surface-base min-h-screen">
        <Suspense fallback={<div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>}>
          <SuiviInner />
        </Suspense>
      </main>
    </>
  );
}
