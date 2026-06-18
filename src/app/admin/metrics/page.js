'use client';

// ─────────────────────────────────────────────────────────────────────
// /admin/metrics — Dashboard business metrics Volia
// ─────────────────────────────────────────────────────────────────────
// Vue d'ensemble pour Anthony des metrics SaaS critiques :
//   - MRR + delta vs période précédente
//   - Customers payants + Churn 30j
//   - Activation rate (signup → 1ère action)
//   - Funnel signup → activé → checkout → paid
//   - Cohort signup par mois (rétention D1/D7/D30 + conv paid)
//   - Top features used (Prospection / Campagnes / CRM)
//   - Plan distribution (donut)
//
// Tout est fetch via /api/admin/metrics (server-side, requireAdmin).
// Graphes en SVG inline pour éviter d'ajouter recharts/chart.js
// (objectif : 0 dep externe, contrôle total du style Volia).
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Users,
  DollarSign, Target, UserX, Activity, BarChart3, Loader2,
  Sparkles, Search, Mail, Briefcase,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { Card } from '@/components/ui';

const PERIOD_OPTIONS = [
  { value: '7', label: '7 j' },
  { value: '30', label: '30 j' },
  { value: '90', label: '90 j' },
  { value: 'all', label: 'Tout' },
];

const PLAN_COLORS = {
  free: '#64748b',      // slate-500
  solo: '#22c55e',      // green-500
  pro: '#8b5cf6',       // violet-500
  business: '#f59e0b',  // amber-500
  enterprise: '#f59e0b',
};

const PLAN_LABELS = {
  free: 'Gratuit',
  prospection: 'Prospection',
  max: 'MAX',
  solo: 'Solo (legacy)',
  pro: 'Pro (legacy)',
  business: 'Business (legacy)',
  enterprise: 'Enterprise (legacy)',
  enterprise_legacy: 'Business 99€ (legacy)',
};

// ─────────────────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────────────────
export default function MetricsPage() {
  const router = useRouter();
  const supabase = getSupabase();
  const [authState, setAuthState] = useState('loading'); // loading | guest | no-admin | ok
  const [period, setPeriod] = useState('30');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auth gate
  useEffect(() => {
    (async () => {
      if (!supabase) { setAuthState('guest'); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login?return=/admin/metrics'); return; }
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();
      if (!profile?.is_admin) { router.push('/dashboard'); return; }
      setAuthState('ok');
    })();
  }, [router, supabase]);

  // Fetch metrics
  useEffect(() => {
    if (authState !== 'ok') return;
    loadMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState, period]);

  async function loadMetrics() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/metrics?period=${period}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur API');
      setData(json);
    } catch (e) {
      setError(e.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  if (authState !== 'ok') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-content-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Header
        period={period}
        setPeriod={setPeriod}
        onRefresh={loadMetrics}
        loading={loading}
        generatedAt={data?.generated_at}
      />

      {error && (
        <Card className="mt-6 border-rose-500/30 bg-rose-500/5">
          <p className="text-sm text-rose-300">Erreur : {error}</p>
        </Card>
      )}

      {loading && !data && <SkeletonKpis />}

      {data && (
        <>
          <KpiGrid data={data} />
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MrrChartCard history={data.mrr_history} />
            </div>
            <div>
              <PlanDistributionCard distribution={data.plan_distribution} />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FunnelCard funnel={data.funnel} />
            <FeaturesUsageCard usage={data.features_usage} />
          </div>
          <div className="mt-6">
            <CohortTableCard cohorts={data.cohorts} />
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────
function Header({ period, setPeriod, onRefresh, loading, generatedAt }) {
  const generated = generatedAt ? new Date(generatedAt) : null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-content-muted hover:text-content-secondary mb-2 transition"
        >
          <ArrowLeft size={12} />
          Admin
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-content-primary flex items-center gap-2.5">
          <BarChart3 size={24} className="text-violet-400" />
          Metrics business
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          MRR, churn, activation, cohort &middot; vue d&apos;ensemble Volia
          {generated && (
            <span className="text-content-muted ml-2">
              · MAJ {generated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-xl border border-line bg-surface-card p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                period === opt.value
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-line text-content-secondary hover:text-content-primary hover:border-violet-500/40 transition disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// KPI Grid
// ─────────────────────────────────────────────────────────────────────
function KpiGrid({ data }) {
  const { kpis } = data;
  const items = [
    {
      label: 'MRR',
      value: `${kpis.mrr_eur.toLocaleString('fr-FR')} €`,
      delta: kpis.mrr_delta_eur,
      deltaPct: kpis.mrr_delta_percent,
      deltaSuffix: '€',
      icon: DollarSign,
      tone: 'violet',
    },
    {
      label: 'Customers payants',
      value: kpis.customers_paid.toString(),
      icon: Users,
      tone: 'green',
      sub: `${kpis.total_users} users total`,
    },
    {
      label: 'Signups période',
      value: kpis.signups_period.toString(),
      delta: kpis.signups_period - kpis.signups_prev_period,
      deltaPct: kpis.signups_prev_period > 0
        ? Math.round(((kpis.signups_period - kpis.signups_prev_period) / kpis.signups_prev_period) * 100)
        : null,
      icon: Sparkles,
      tone: 'amber',
    },
    {
      label: 'Activation rate',
      value: `${Math.round(kpis.activation_rate * 100)}%`,
      icon: Target,
      tone: 'blue',
      sub: 'Users avec ≥1 action',
    },
    {
      label: 'Churn (30 j)',
      value: `${(kpis.churn_30d * 100).toFixed(1)}%`,
      icon: UserX,
      tone: kpis.churn_30d > 0.05 ? 'red' : 'green',
      sub: `${kpis.churned_count_30d} users churned`,
      inverted: true,
    },
    {
      label: 'ARR (proj.)',
      value: `${(kpis.mrr_eur * 12).toLocaleString('fr-FR')} €`,
      icon: TrendingUp,
      tone: 'violet',
      sub: 'MRR × 12',
    },
  ];

  return (
    <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {items.map((it) => (
        <KpiCard key={it.label} {...it} />
      ))}
    </div>
  );
}

function KpiCard({ label, value, delta, deltaPct, deltaSuffix, icon: Icon, tone, sub, inverted }) {
  const toneStyles = {
    violet: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    blue: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    red: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  };
  const isPositive = (delta || 0) > 0;
  const isNegative = (delta || 0) < 0;
  // inverted = false par défaut : delta positif = vert (bon)
  // inverted = true (ex: churn) : delta positif = rouge
  const goodColor = inverted
    ? (isNegative ? 'text-emerald-400' : isPositive ? 'text-rose-400' : 'text-content-muted')
    : (isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-content-muted');

  return (
    <Card size="sm">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wide font-medium text-content-muted">
          {label}
        </span>
        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${toneStyles[tone] || toneStyles.violet}`}>
          <Icon size={13} />
        </div>
      </div>
      <div className="text-2xl font-bold text-content-primary tabular-nums">{value}</div>
      {(delta !== undefined && delta !== null) && (
        <div className={`text-xs mt-1 font-medium tabular-nums ${goodColor}`}>
          {isPositive ? '+' : ''}{delta.toLocaleString('fr-FR')}{deltaSuffix || ''}
          {deltaPct !== null && deltaPct !== undefined && (
            <span className="ml-1 text-content-muted">({isPositive ? '+' : ''}{deltaPct}%)</span>
          )}
        </div>
      )}
      {sub && !delta && (
        <div className="text-xs mt-1 text-content-muted">{sub}</div>
      )}
      {sub && delta !== undefined && (
        <div className="text-[10px] mt-0.5 text-content-muted">{sub}</div>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────
// MRR line chart (SVG inline)
// ─────────────────────────────────────────────────────────────────────
function MrrChartCard({ history }) {
  return (
    <Card size="lg">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-content-primary flex items-center gap-2">
          <TrendingUp size={16} className="text-violet-400" />
          Évolution MRR — 6 derniers mois
        </h3>
        <span className="text-xs text-content-muted">€ / mois</span>
      </div>
      <p className="text-xs text-content-muted mb-4">
        Approximation basée sur les abonnements actifs aujourd&apos;hui projetés sur les mois passés.
      </p>
      <MetricLineChart data={history} valueKey="mrr" labelKey="label" />
    </Card>
  );
}

function MetricLineChart({ data = [], valueKey, labelKey, height = 200 }) {
  if (!data.length) return <p className="text-sm text-content-muted">Pas de données.</p>;

  const W = 600;
  const H = height;
  const P = { top: 20, right: 16, bottom: 32, left: 44 };
  const innerW = W - P.left - P.right;
  const innerH = H - P.top - P.bottom;

  const values = data.map((d) => d[valueKey] || 0);
  const max = Math.max(...values, 1);
  const min = 0;

  const xStep = data.length > 1 ? innerW / (data.length - 1) : innerW;
  const yScale = (v) => P.top + innerH - ((v - min) / (max - min)) * innerH;
  const xScale = (i) => P.left + i * xStep;

  const path = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d[valueKey] || 0)}`)
    .join(' ');

  // Area path (fill under line)
  const areaPath = `${path} L ${xScale(data.length - 1)} ${P.top + innerH} L ${xScale(0)} ${P.top + innerH} Z`;

  // Y axis ticks (0, max/2, max)
  const ticks = [0, Math.round(max / 2), max];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ minWidth: 480 }}>
        <defs>
          <linearGradient id="mrr-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid + Y axis */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={P.left}
              y1={yScale(t)}
              x2={W - P.right}
              y2={yScale(t)}
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeDasharray="3 3"
            />
            <text
              x={P.left - 6}
              y={yScale(t) + 3}
              textAnchor="end"
              className="fill-current text-content-muted"
              fontSize="10"
            >
              {t.toLocaleString('fr-FR')}
            </text>
          </g>
        ))}

        {/* Area */}
        <path d={areaPath} fill="url(#mrr-gradient)" />
        {/* Line */}
        <path d={path} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Points + X labels */}
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={xScale(i)}
              cy={yScale(d[valueKey] || 0)}
              r="3"
              fill="#8b5cf6"
              stroke="var(--surface-card, #0a0a0a)"
              strokeWidth="2"
            />
            <text
              x={xScale(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-current text-content-muted"
              fontSize="10"
            >
              {d[labelKey]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Funnel
// ─────────────────────────────────────────────────────────────────────
function FunnelCard({ funnel }) {
  const top = funnel.signups || 1;
  const steps = [
    { label: 'Signups', value: funnel.signups, color: 'bg-violet-500' },
    { label: 'Activé (≥1 action)', value: funnel.active, color: 'bg-blue-500' },
    { label: 'Checkout démarré', value: funnel.trial, color: 'bg-amber-500' },
    { label: 'Converti paid', value: funnel.paid, color: 'bg-emerald-500' },
  ];

  return (
    <Card size="lg">
      <h3 className="font-semibold text-content-primary flex items-center gap-2 mb-1">
        <Target size={16} className="text-violet-400" />
        Funnel signup → paid
      </h3>
      <p className="text-xs text-content-muted mb-5">
        Parcours des nouveaux signups sur la période sélectionnée.
      </p>
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const widthPct = top > 0 ? (step.value / top) * 100 : 0;
          const convPct = top > 0 ? Math.round((step.value / top) * 100) : 0;
          const prevConv = idx > 0 ? steps[idx - 1].value : null;
          const dropoff = prevConv && prevConv > 0 ? Math.round(((prevConv - step.value) / prevConv) * 100) : null;
          return (
            <div key={step.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-content-secondary font-medium">{step.label}</span>
                <span className="text-content-primary tabular-nums">
                  <strong>{step.value}</strong>
                  <span className="text-content-muted ml-1.5">({convPct}%)</span>
                  {dropoff > 0 && (
                    <span className="text-rose-400 ml-2">-{dropoff}%</span>
                  )}
                </span>
              </div>
              <div className="h-7 bg-surface-base rounded-lg overflow-hidden border border-line">
                <div
                  className={`h-full ${step.color} transition-all duration-500`}
                  style={{ width: `${Math.max(widthPct, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Features usage (bar chart horizontal)
// ─────────────────────────────────────────────────────────────────────
function FeaturesUsageCard({ usage }) {
  const items = [
    { key: 'prospection_searches', label: 'Recherches Prospection', value: usage.prospection_searches, icon: Search, color: 'bg-violet-500' },
    { key: 'campaigns_created', label: 'Campagnes créées', value: usage.campaigns_created, icon: Mail, color: 'bg-blue-500' },
    { key: 'campaigns_sent', label: 'Emails envoyés', value: usage.campaigns_sent, icon: Mail, color: 'bg-emerald-500' },
    { key: 'crm_deals_created', label: 'Deals CRM créés', value: usage.crm_deals_created, icon: Briefcase, color: 'bg-amber-500' },
  ];
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <Card size="lg">
      <h3 className="font-semibold text-content-primary flex items-center gap-2 mb-1">
        <Activity size={16} className="text-violet-400" />
        Activité sur la période
      </h3>
      <p className="text-xs text-content-muted mb-5">Top features utilisées par tous les users.</p>
      <div className="space-y-3.5">
        {items.map((it) => {
          const Icon = it.icon;
          const widthPct = (it.value / max) * 100;
          return (
            <div key={it.key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-content-secondary font-medium flex items-center gap-1.5">
                  <Icon size={12} className="text-content-muted" />
                  {it.label}
                </span>
                <span className="text-content-primary tabular-nums font-semibold">
                  {it.value.toLocaleString('fr-FR')}
                </span>
              </div>
              <div className="h-2 bg-surface-base rounded-full overflow-hidden border border-line">
                <div
                  className={`h-full ${it.color} transition-all duration-500`}
                  style={{ width: `${Math.max(widthPct, 1)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Plan distribution (donut)
// ─────────────────────────────────────────────────────────────────────
function PlanDistributionCard({ distribution }) {
  const total = Object.values(distribution).reduce((sum, v) => sum + v, 0);
  // Merge enterprise into business pour affichage
  const merged = { ...distribution };
  if (merged.enterprise) {
    merged.business = (merged.business || 0) + merged.enterprise;
    delete merged.enterprise;
  }
  const entries = Object.entries(merged).filter(([_, v]) => v > 0);

  return (
    <Card size="lg">
      <h3 className="font-semibold text-content-primary flex items-center gap-2 mb-1">
        <Users size={16} className="text-violet-400" />
        Distribution plans
      </h3>
      <p className="text-xs text-content-muted mb-4">{total} users au total.</p>
      <div className="flex flex-col items-center">
        <Donut entries={entries} total={total} />
        <div className="mt-4 w-full space-y-1.5">
          {entries.map(([plan, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={plan} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: PLAN_COLORS[plan] || '#64748b' }}
                  />
                  <span className="text-content-secondary">{PLAN_LABELS[plan] || plan}</span>
                </span>
                <span className="text-content-primary tabular-nums font-medium">
                  {count} <span className="text-content-muted">({pct}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function Donut({ entries, total }) {
  const size = 160;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;

  if (total === 0) {
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth={stroke} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth={stroke} />
      {entries.map(([plan, count]) => {
        const pct = count / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const offset = -accumulated * circumference;
        accumulated += pct;
        return (
          <circle
            key={plan}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={PLAN_COLORS[plan] || '#64748b'}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={offset}
            strokeLinecap="butt"
          />
        );
      })}
      {/* Centre label */}
      <g className="rotate-90" transform={`rotate(90 ${cx} ${cy})`}>
        <text x={cx} y={cy - 2} textAnchor="middle" className="fill-current text-content-primary" fontSize="20" fontWeight="700">
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-current text-content-muted" fontSize="9">
          USERS
        </text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Cohort table
// ─────────────────────────────────────────────────────────────────────
function CohortTableCard({ cohorts }) {
  return (
    <Card size="lg">
      <h3 className="font-semibold text-content-primary flex items-center gap-2 mb-1">
        <BarChart3 size={16} className="text-violet-400" />
        Cohort retention — 6 derniers mois
      </h3>
      <p className="text-xs text-content-muted mb-4">
        Activation des users selon leur mois d&apos;inscription (≥1 action sur Prospection / Campagnes / CRM).
      </p>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-content-muted text-left">
              <th className="px-2 py-2 font-medium">Mois</th>
              <th className="px-2 py-2 font-medium text-right">Signups</th>
              <th className="px-2 py-2 font-medium text-right">J+1</th>
              <th className="px-2 py-2 font-medium text-right">J+7</th>
              <th className="px-2 py-2 font-medium text-right">J+30</th>
              <th className="px-2 py-2 font-medium text-right">Conv. paid</th>
            </tr>
          </thead>
          <tbody>
            {cohorts.map((c) => (
              <tr key={c.month} className="border-t border-line">
                <td className="px-2 py-2.5 text-content-primary font-medium capitalize">{c.label}</td>
                <td className="px-2 py-2.5 text-right text-content-primary tabular-nums">{c.signups}</td>
                <CohortPctCell value={c.d1} />
                <CohortPctCell value={c.d7} />
                <CohortPctCell value={c.d30} />
                <CohortPctCell value={c.paid} accent />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CohortPctCell({ value, accent }) {
  // Heatmap-style cell — opacité proportionnelle à la valeur
  const opacity = Math.min(value / 100, 1);
  const bg = accent
    ? `rgba(139, 92, 246, ${0.08 + opacity * 0.4})`
    : `rgba(34, 197, 94, ${0.05 + opacity * 0.35})`;
  const fg = accent ? 'text-violet-300' : 'text-emerald-300';
  return (
    <td className="px-2 py-2.5 text-right">
      <span
        className={`inline-block min-w-[44px] px-2 py-0.5 rounded-md tabular-nums text-xs font-medium ${fg}`}
        style={{ backgroundColor: bg }}
      >
        {value}%
      </span>
    </td>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Skeleton loading
// ─────────────────────────────────────────────────────────────────────
function SkeletonKpis() {
  return (
    <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} size="sm">
          <div className="h-3 w-20 bg-surface-base rounded mb-3 animate-pulse" />
          <div className="h-7 w-16 bg-surface-base rounded animate-pulse" />
          <div className="h-3 w-24 bg-surface-base rounded mt-2 animate-pulse" />
        </Card>
      ))}
    </div>
  );
}
