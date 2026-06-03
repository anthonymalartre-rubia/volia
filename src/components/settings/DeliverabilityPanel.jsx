'use client';

// ─────────────────────────────────────────────────────────────────────
// DeliverabilityPanel — santé d'envoi (à monter sur /settings/email-senders).
// Récap 30j (délivrés / bounces / plaintes) + par domaine : DNS + warmup.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, AlertTriangle, Flame, Activity } from 'lucide-react';

function Rate({ label, value, danger }) {
  const color = danger ? 'text-rose-600' : value > 0 ? 'text-content-primary' : 'text-content-tertiary';
  return (
    <div className="text-center">
      <p className={`text-lg font-bold tabular-nums ${color}`}>{value}%</p>
      <p className="text-[10px] uppercase tracking-wider text-content-tertiary">{label}</p>
    </div>
  );
}

function DnsBadge({ label, ok }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
        ok === true ? 'bg-emerald-100 text-emerald-700' : ok === false ? 'bg-rose-100 text-rose-700' : 'bg-zinc-100 text-zinc-500'
      }`}
    >
      {label} {ok === true ? '✓' : ok === false ? '✗' : '—'}
    </span>
  );
}

export default function DeliverabilityPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/email-senders/deliverability')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (!d.success) setError(d.error || 'Erreur');
        else setData(d);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Erreur réseau');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-line bg-surface-card p-5 flex items-center gap-2 text-sm text-content-tertiary">
        <Loader2 size={16} className="animate-spin" /> Chargement de la santé d&apos;envoi…
      </section>
    );
  }
  if (error || !data) return null;

  const s = data.stats30d;
  const bounceDanger = s.bounce_rate > 2;
  const complaintDanger = s.complaint_rate > 0.1;

  return (
    <section className="rounded-2xl border border-line bg-surface-card p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Activity size={16} className="text-violet-500" />
        <h2 className="text-sm font-semibold text-content-primary">Santé d&apos;envoi</h2>
        <span className="text-[11px] text-content-tertiary">· 30 derniers jours</span>
      </div>

      {/* Stats 30j */}
      <div className="grid grid-cols-4 gap-2 rounded-xl border border-line bg-surface-base p-3">
        <div className="text-center">
          <p className="text-lg font-bold tabular-nums text-content-primary">{s.sent}</p>
          <p className="text-[10px] uppercase tracking-wider text-content-tertiary">Envoyés</p>
        </div>
        <Rate label="Délivrés" value={s.delivery_rate} />
        <Rate label="Bounces" value={s.bounce_rate} danger={bounceDanger} />
        <Rate label="Plaintes" value={s.complaint_rate} danger={complaintDanger} />
      </div>
      {(bounceDanger || complaintDanger) && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <p className="text-xs">
            {bounceDanger && 'Taux de bounce élevé (>2%) — nettoie ta liste. '}
            {complaintDanger && 'Taux de plaintes élevé (>0,1%) — ralentis et soigne le ciblage.'}
          </p>
        </div>
      )}

      {/* Par domaine */}
      {data.senders.length > 0 ? (
        <ul className="space-y-2">
          {data.senders.map((sd) => (
            <li key={sd.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-line bg-surface-base flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck size={14} className={sd.status === 'verified' ? 'text-emerald-500' : 'text-zinc-400'} />
                <span className="text-sm font-semibold text-content-primary truncate">{sd.domain}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${sd.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {sd.status === 'verified' ? 'vérifié' : sd.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <DnsBadge label="SPF" ok={sd.dns.spf} />
                <DnsBadge label="DKIM" ok={sd.dns.dkim} />
                <DnsBadge label="DMARC" ok={sd.dns.dmarc} />
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700" title="Warmup : peers actifs / emails échangés">
                  <Flame size={10} /> {sd.warmup.active}/{sd.warmup.peers} · {sd.warmup.sent} env.
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-content-tertiary">Aucun domaine d&apos;envoi vérifié pour l&apos;instant.</p>
      )}
    </section>
  );
}
