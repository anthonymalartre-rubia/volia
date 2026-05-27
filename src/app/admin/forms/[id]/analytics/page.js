'use client';

// ─────────────────────────────────────────────────────────────────────
// /admin/forms/[id]/analytics — Analytics par form (Sprint F7)
// ─────────────────────────────────────────────────────────────────────
// Fetch /api/admin/forms/[id]/analytics et affiche les stats per-form.
// Garde la sidebar du module (non-fullscreen).
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  Loader2,
  Eye,
  Send,
  TrendingUp,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Globe,
  ExternalLink,
  Inbox,
} from 'lucide-react';
import SubmissionsChart from '@/components/forms/stats/SubmissionsChart';

function formatNumber(n) {
  if (n == null) return '0';
  return new Intl.NumberFormat('fr-FR').format(n);
}

function formatPercent(n) {
  if (n == null) return '0 %';
  return `${Number(n).toFixed(1)} %`;
}

function formatDuration(ms) {
  if (ms == null || ms <= 0) return '—';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest === 0 ? `${m} min` : `${m} min ${rest} s`;
}

export default function FormAnalyticsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/forms/${id}/analytics`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || 'Erreur de chargement');
        } else {
          setData(json);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link
        href={`/admin/forms/${id}`}
        className="inline-flex items-center gap-1.5 text-xs text-content-tertiary hover:text-pink-700 transition-colors mb-4"
      >
        <ArrowLeft size={14} /> Retour au formulaire
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={14} className="text-pink-600" />
          <p className="text-[11px] uppercase tracking-wider font-semibold text-pink-700">
            Analytics par formulaire
          </p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-content-primary tracking-tight">
          {data?.form?.name || 'Analytics'}
        </h1>
        {data?.form && (
          <p className="mt-2 text-content-tertiary text-sm sm:text-base">
            /{data.form.slug} · {data.form.status === 'published' ? 'publié' : data.form.status}
          </p>
        )}
      </div>

      {loading && (
        <div className="rounded-2xl border border-line bg-surface-card p-10 text-center">
          <Loader2 size={20} className="mx-auto text-pink-600 animate-spin mb-2" />
          <p className="text-sm text-content-tertiary">Chargement…</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 p-4 mb-4">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi label="Vues" value={formatNumber(data.totals.views)} icon={Eye} tone="sky" />
            <Kpi label="Soumissions" value={formatNumber(data.totals.submissions)} icon={Send} tone="pink" />
            <Kpi label="Conversion" value={formatPercent(data.totals.conversion_rate)} icon={TrendingUp} tone="emerald" />
            <Kpi label="Temps moyen" value={formatDuration(data.totals.avg_completion_ms)} icon={Clock} tone="violet" sub="Complétion (30j)" />
          </div>

          {/* Chart */}
          <SubmissionsChart
            data={data.submissions_by_day}
            title="Soumissions de ce formulaire (30 derniers jours)"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top sources */}
            <div className="rounded-2xl border border-line bg-surface-card overflow-hidden">
              <div className="px-4 py-3 border-b border-line flex items-center gap-2">
                <Globe size={14} className="text-content-tertiary" />
                <h3 className="text-sm font-semibold text-content-primary">Top sources (30j)</h3>
              </div>
              {data.top_referers.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-content-tertiary">Pas encore de source enregistrée.</p>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {data.top_referers.map((r, i) => {
                    const max = data.top_referers[0]?.count || 1;
                    const pct = Math.round((r.count / max) * 100);
                    return (
                      <li key={r.host} className="px-4 py-2.5">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-xs font-medium text-content-primary truncate">
                            {i + 1}. {r.host}
                          </span>
                          <span className="text-xs font-mono text-content-tertiary tabular-nums">
                            {r.count}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-surface-elevated overflow-hidden">
                          <div
                            className="h-full bg-pink-500/70"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Device distribution */}
            <div className="rounded-2xl border border-line bg-surface-card overflow-hidden">
              <div className="px-4 py-3 border-b border-line">
                <h3 className="text-sm font-semibold text-content-primary">Devices (30j)</h3>
              </div>
              <div className="p-4 space-y-2">
                {data.device_distribution.map((d) => {
                  const Icon =
                    d.device === 'mobile' ? Smartphone :
                    d.device === 'tablet' ? Tablet :
                    d.device === 'desktop' ? Monitor : Globe;
                  const label =
                    d.device === 'mobile' ? 'Mobile' :
                    d.device === 'tablet' ? 'Tablette' :
                    d.device === 'desktop' ? 'Desktop' : 'Inconnu';
                  return (
                    <div key={d.device} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-content-primary">
                            {label}
                          </span>
                          <span className="text-xs font-mono text-content-tertiary tabular-nums">
                            {d.count} <span className="text-content-faint">({d.percent} %)</span>
                          </span>
                        </div>
                        <div className="mt-1 h-1 rounded-full bg-surface-elevated overflow-hidden">
                          <div
                            className="h-full bg-pink-500/70"
                            style={{ width: `${d.percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bridge breakdown */}
          <div className="rounded-2xl border border-line bg-surface-card p-4">
            <h3 className="text-sm font-semibold text-content-primary mb-3">
              Bridges (30 derniers jours)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <BridgeStat label="Succès" count={data.bridges_breakdown.succeeded} icon={CheckCircle2} tone="emerald" />
              <BridgeStat label="Échec" count={data.bridges_breakdown.failed} icon={XCircle} tone="rose" />
              <BridgeStat label="En attente" count={data.bridges_breakdown.pending} icon={Clock} tone="amber" />
              <BridgeStat label="Sans bridge" count={data.bridges_breakdown.skipped} icon={MinusCircle} tone="zinc" />
            </div>
          </div>

          {/* CTA → toutes les réponses */}
          <div className="rounded-2xl border border-line bg-surface-card p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                <Inbox size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-content-primary">Réponses détaillées</p>
                <p className="text-xs text-content-tertiary">
                  Voir chaque soumission, exporter en CSV, re-trigger les bridges manuellement.
                </p>
              </div>
            </div>
            <Link
              href={`/admin/forms/${id}/responses`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium transition-colors"
            >
              Voir toutes les réponses <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
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

function Kpi({ label, value, icon: Icon, tone, sub }) {
  const t = TONES[tone] || TONES.pink;
  return (
    <div className={`rounded-2xl border bg-surface-card p-4 ${t.border}`}>
      <div className="flex items-center justify-between mb-2">
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

function BridgeStat({ label, count, icon: Icon, tone }) {
  const t = TONES[tone] || TONES.zinc;
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.iconBg}`}>
        <Icon size={14} />
      </div>
      <div>
        <p className="text-xs text-content-tertiary">{label}</p>
        <p className="text-sm font-semibold text-content-primary tabular-nums">{count}</p>
      </div>
    </div>
  );
}
