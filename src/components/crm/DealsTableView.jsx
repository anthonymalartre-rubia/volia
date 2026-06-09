'use client';

// Vue Liste / Tableau des deals (CRM P2-1) — alternative au Kanban.
// Colonnes triables + export CSV. Consomme les deals déjà filtrés par la page
// (statut + recherche). Le tri colonne est local à la vue.
//
// Props :
//   - deals        : liste de deals (filtrés) avec contact + stage embarqués
//   - onOpenDeal(id): ouvre le drawer du deal
//   - pipelineName : pour le nom de fichier export

import { useMemo, useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { formatDealValue } from '@/lib/crm';

const STATUS_LABEL = { open: 'Ouvert', won: 'Gagné', lost: 'Perdu' };
const STATUS_CLASS = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-rose-50 text-rose-700 border-rose-200',
};

function fmtDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch { return '—'; }
}

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function DealsTableView({ deals = [], onOpenDeal, pipelineName = 'pipeline' }) {
  const [sortKey, setSortKey] = useState('value'); // value|title|stage|close|status|contact
  const [sortDir, setSortDir] = useState('desc');

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir(key === 'value' ? 'desc' : 'asc'); }
  };

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const val = (d) => {
      switch (sortKey) {
        case 'title': return (d.title || '').toLowerCase();
        case 'contact': return (d.contact?.name || d.contact?.company || '').toLowerCase();
        case 'stage': return d.stage?.position ?? 0;
        case 'close': return d.expected_close_date ? new Date(d.expected_close_date).getTime() : Infinity;
        case 'status': return d.status || '';
        case 'value':
        default: return d.value_cents || 0;
      }
    };
    return deals.slice().sort((a, b) => {
      const va = val(a), vb = val(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [deals, sortKey, sortDir]);

  const totalValue = useMemo(
    () => deals.reduce((s, d) => s + (d.value_cents || 0), 0),
    [deals]
  );

  const exportCsv = () => {
    const header = ['Titre', 'Contact', 'Société', 'Étape', 'Montant (€)', 'Clôture prévue', 'Statut', 'Créé le'];
    const rows = sorted.map((d) => [
      d.title,
      d.contact?.name || '',
      d.contact?.company || '',
      d.stage?.name || '',
      Math.round((d.value_cents || 0) / 100),
      d.expected_close_date || '',
      STATUS_LABEL[d.status] || d.status,
      d.created_at ? new Date(d.created_at).toISOString().slice(0, 10) : '',
    ]);
    const csv = [header, ...rows].map((r) => r.map(csvEscape).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deals-${pipelineName.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ArrowUpDown size={11} className="text-content-faint" />;
    return sortDir === 'asc'
      ? <ArrowUp size={11} className="text-emerald-600" />
      : <ArrowDown size={11} className="text-emerald-600" />;
  };

  const Th = ({ col, label, align = 'left' }) => (
    <th className={`px-3 py-2 text-${align} font-medium text-content-faint uppercase tracking-wider text-[10px]`}>
      <button
        type="button"
        onClick={() => toggleSort(col)}
        className={`inline-flex items-center gap-1 hover:text-content-secondary transition ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        {label} <SortIcon col={col} />
      </button>
    </th>
  );

  if (deals.length === 0) {
    return (
      <div className="text-center py-16 text-content-tertiary text-sm">
        Aucun deal ne correspond aux filtres.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-line">
        <p className="text-xs text-content-tertiary">
          <strong className="text-content-secondary tabular-nums">{deals.length}</strong> deals ·{' '}
          <strong className="text-content-secondary tabular-nums">{formatDealValue(totalValue)}</strong> au total
        </p>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-content-secondary hover:bg-surface-elevated hover:text-content-primary transition"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-line bg-surface-deep">
              <Th col="title" label="Deal" />
              <Th col="contact" label="Contact" />
              <Th col="stage" label="Étape" />
              <Th col="value" label="Montant" align="right" />
              <Th col="close" label="Clôture" />
              <Th col="status" label="Statut" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr
                key={d.id}
                onClick={() => onOpenDeal?.(d.id)}
                className="border-b border-line/60 last:border-0 hover:bg-surface-elevated/60 cursor-pointer transition"
              >
                <td className="px-3 py-2 font-medium text-content-primary max-w-[260px] truncate">{d.title}</td>
                <td className="px-3 py-2 text-content-secondary">
                  {d.contact?.name || '—'}
                  {d.contact?.company && (
                    <span className="text-content-faint"> · {d.contact.company}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    {d.stage?.name || '—'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold text-content-secondary">
                  {formatDealValue(d.value_cents)}
                </td>
                <td className="px-3 py-2 text-content-tertiary tabular-nums">{fmtDate(d.expected_close_date)}</td>
                <td className="px-3 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold ${STATUS_CLASS[d.status] || ''}`}>
                    {STATUS_LABEL[d.status] || d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
