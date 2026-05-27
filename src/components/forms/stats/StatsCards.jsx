'use client';

// ─────────────────────────────────────────────────────────────────────
// StatsCards — 4 KPI cards pour /admin/forms/stats (Sprint F7)
// ─────────────────────────────────────────────────────────────────────
// Affiche : Vues totales, Soumissions, Taux conv global, Bridges health.
// Compact, light mode, accent pink. Pattern aligné sur les autres KPI
// dashboards (admin/metrics).
// ─────────────────────────────────────────────────────────────────────

import { Eye, Send, TrendingUp, Activity, CheckCircle2, XCircle, MinusCircle, Clock } from 'lucide-react';

function formatNumber(n) {
  if (n == null) return '0';
  return new Intl.NumberFormat('fr-FR').format(n);
}

function formatPercent(n) {
  if (n == null) return '0 %';
  return `${n.toFixed(1)} %`;
}

export default function StatsCards({ totals, bridgesHealth }) {
  const totalBridges =
    (bridgesHealth?.succeeded || 0) +
    (bridgesHealth?.failed || 0) +
    (bridgesHealth?.skipped || 0) +
    (bridgesHealth?.pending || 0);

  const bridgesHealthScore = totalBridges > 0
    ? Math.round(((bridgesHealth?.succeeded || 0) / totalBridges) * 100)
    : null;

  const cards = [
    {
      label: 'Vues totales',
      value: formatNumber(totals?.views || 0),
      icon: Eye,
      tone: 'sky',
      sub: `${totals?.forms_count || 0} formulaire${(totals?.forms_count || 0) > 1 ? 's' : ''} · ${totals?.published_count || 0} publié${(totals?.published_count || 0) > 1 ? 's' : ''}`,
    },
    {
      label: 'Soumissions',
      value: formatNumber(totals?.submissions || 0),
      icon: Send,
      tone: 'pink',
      sub: 'Cumulé depuis la création',
    },
    {
      label: 'Taux de conversion',
      value: formatPercent(totals?.conversion_rate || 0),
      icon: TrendingUp,
      tone: 'emerald',
      sub: 'Submissions ÷ vues',
    },
    {
      label: 'Bridges OK (30j)',
      value: bridgesHealthScore != null ? `${bridgesHealthScore} %` : '—',
      icon: Activity,
      tone: 'violet',
      sub: `${formatNumber(bridgesHealth?.succeeded || 0)} ok · ${formatNumber(bridgesHealth?.failed || 0)} échec`,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <KpiCard key={c.label} {...c} />
        ))}
      </div>

      {/* Bridge breakdown détaillé */}
      {totalBridges > 0 && (
        <div className="mt-3 rounded-2xl border border-line bg-surface-card p-4">
          <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-3">
            Détail bridges sur 30 jours
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <BridgePill
              label="Succès"
              count={bridgesHealth.succeeded || 0}
              total={totalBridges}
              icon={CheckCircle2}
              tone="emerald"
            />
            <BridgePill
              label="Échec"
              count={bridgesHealth.failed || 0}
              total={totalBridges}
              icon={XCircle}
              tone="rose"
            />
            <BridgePill
              label="En attente"
              count={bridgesHealth.pending || 0}
              total={totalBridges}
              icon={Clock}
              tone="amber"
            />
            <BridgePill
              label="Sans bridge"
              count={bridgesHealth.skipped || 0}
              total={totalBridges}
              icon={MinusCircle}
              tone="zinc"
            />
          </div>
        </div>
      )}
    </>
  );
}

const TONES = {
  pink:    { iconBg: 'bg-pink-100 text-pink-600',       border: 'border-pink-200/70' },
  sky:     { iconBg: 'bg-sky-100 text-sky-600',         border: 'border-sky-200/70' },
  emerald: { iconBg: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-200/70' },
  violet:  { iconBg: 'bg-violet-100 text-violet-600',   border: 'border-violet-200/70' },
  rose:    { iconBg: 'bg-rose-100 text-rose-600',       border: 'border-rose-200/70' },
  amber:   { iconBg: 'bg-amber-100 text-amber-600',     border: 'border-amber-200/70' },
  zinc:    { iconBg: 'bg-zinc-100 text-zinc-600',       border: 'border-zinc-200/70' },
};

function KpiCard({ label, value, icon: Icon, tone, sub }) {
  const t = TONES[tone] || TONES.pink;
  return (
    <div className={`rounded-2xl border bg-surface-card p-4 ${t.border}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-content-tertiary uppercase tracking-wider">
          {label}
        </p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.iconBg}`}>
          <Icon size={15} />
        </div>
      </div>
      <p className="text-2xl font-bold text-content-primary tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-content-faint">{sub}</p>}
    </div>
  );
}

function BridgePill({ label, count, total, icon: Icon, tone }) {
  const t = TONES[tone] || TONES.zinc;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.iconBg}`}>
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-content-tertiary">{label}</p>
        <p className="text-sm font-semibold text-content-primary tabular-nums">
          {count} <span className="text-[10px] font-normal text-content-faint">({pct} %)</span>
        </p>
      </div>
    </div>
  );
}
