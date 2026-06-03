'use client';

// /admin/affiliates — gestion du programme apporteurs d'affaires.
// Valider les candidatures, suivre les commissions, marquer les versements.
// Protégé côté API (/api/admin/affiliates vérifie is_admin).

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const eur = (cents) => ((cents || 0) / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  suspended: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  async function load() {
    try {
      const res = await fetch('/api/admin/affiliates');
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error || 'Erreur'); return; }
      setAffiliates(data.affiliates);
    } catch {
      setError('Connexion impossible');
    }
  }
  useEffect(() => { load(); }, []);

  async function act(affiliateId, action) {
    if (action === 'mark_paid') {
      const ref = prompt('N° de facture de l\'affilié (optionnel) :') || '';
      if (!confirm('Marquer comme PAYÉ toutes les commissions disponibles de cet affilié ?')) return;
      setBusy(affiliateId);
      await fetch('/api/admin/affiliates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, affiliateId, payoutInvoiceRef: ref }),
      });
    } else {
      setBusy(affiliateId);
      await fetch('/api/admin/affiliates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, affiliateId }),
      });
    }
    setBusy(null);
    load();
  }

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!affiliates) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-content-primary">Affiliés ({affiliates.length})</h1>
      <p className="mt-1 text-sm text-content-tertiary">Programme apporteurs d'affaires — validation, suivi, versements.</p>

      <div className="mt-6 space-y-4">
        {affiliates.map((a) => (
          <div key={a.id} className="rounded-2xl border border-line bg-surface-raised p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-content-primary">{a.name || '(sans nom)'}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[a.status] || ''}`}>{a.status}</span>
                  <code className="rounded bg-surface-base px-2 py-0.5 text-xs text-content-secondary">{a.code}</code>
                </div>
                <div className="mt-1 text-sm text-content-tertiary">
                  {a.email}{a.company ? ` · ${a.company}` : ''}{a.phone ? ` · ${a.phone}` : ''}
                </div>
                {a.motivation && <div className="mt-2 max-w-2xl text-sm text-content-secondary">“{a.motivation}”</div>}
              </div>
              <div className="flex flex-wrap gap-2">
                {a.status === 'pending' && (
                  <>
                    <button onClick={() => act(a.id, 'approve')} disabled={busy === a.id} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50">Approuver</button>
                    <button onClick={() => act(a.id, 'reject')} disabled={busy === a.id} className="rounded-lg border border-line px-3 py-1.5 text-sm text-content-secondary hover:bg-surface-base">Rejeter</button>
                  </>
                )}
                {a.status === 'approved' && (
                  <>
                    <button onClick={() => act(a.id, 'mark_paid')} disabled={busy === a.id} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">Marquer payé</button>
                    <button onClick={() => act(a.id, 'suspend')} disabled={busy === a.id} className="rounded-lg border border-line px-3 py-1.5 text-sm text-content-secondary hover:bg-surface-base">Suspendre</button>
                  </>
                )}
                {a.status === 'suspended' && (
                  <button onClick={() => act(a.id, 'reactivate')} disabled={busy === a.id} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50">Réactiver</button>
                )}
              </div>
            </div>

            {/* Résumé commissions */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-lg bg-surface-base p-3 text-center">
                <div className="text-sm font-bold text-content-primary">{a.summary.count}</div>
                <div className="text-[11px] text-content-tertiary">commissions</div>
              </div>
              <div className="rounded-lg bg-surface-base p-3 text-center">
                <div className="text-sm font-bold text-emerald-600">{eur(a.summary.payableCents)}</div>
                <div className="text-[11px] text-content-tertiary">à verser</div>
              </div>
              <div className="rounded-lg bg-surface-base p-3 text-center">
                <div className="text-sm font-bold text-amber-600">{eur(a.summary.pendingHoldCents)}</div>
                <div className="text-[11px] text-content-tertiary">en attente (30j)</div>
              </div>
              <div className="rounded-lg bg-surface-base p-3 text-center">
                <div className="text-sm font-bold text-indigo-600">{eur(a.summary.paidCents)}</div>
                <div className="text-[11px] text-content-tertiary">versé</div>
              </div>
              <div className="rounded-lg bg-surface-base p-3 text-center">
                <div className="text-sm font-bold text-content-tertiary">{eur(a.summary.clawedBackCents)}</div>
                <div className="text-[11px] text-content-tertiary">annulé</div>
              </div>
            </div>
            {a.payout_info && <div className="mt-3 text-xs text-content-tertiary">Versement : {a.payout_info}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
