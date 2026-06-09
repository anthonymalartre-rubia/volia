'use client';

// ─────────────────────────────────────────────────────────────────────
// /app/crm/reports — Rapport de performance commerciale (CRM P3-1)
// ─────────────────────────────────────────────────────────────────────
// Gating Business. Agrégats via RPC crm_pipeline_report (1 appel /api/crm/reports).
// Affiche : KPIs (CA gagné, taux de win, cycle moyen, pipeline pondéré),
// funnel (répartition par étape) + prévision de CA par mois (graphes SVG maison).
// ─────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Loader2, TrendingUp, Percent, Clock, Target, ChevronDown, Zap } from 'lucide-react';
import TopBar from '@/components/TopBar';
import CrmSidebar from '@/components/crm/CrmSidebar';
import { getSupabase } from '@/lib/supabase';
import { formatDealValue } from '@/lib/crm';

const BUSINESS_PLANS = ['business', 'enterprise'];

const STAGE_BAR = {
  sky: 'bg-sky-400', blue: 'bg-blue-400', violet: 'bg-violet-400',
  amber: 'bg-amber-400', emerald: 'bg-emerald-400', rose: 'bg-rose-400',
  zinc: 'bg-zinc-400', teal: 'bg-teal-400', indigo: 'bg-indigo-400',
};

function monthLabel(ym) {
  // 'YYYY-MM' → 'juil. 26'
  try {
    const [y, m] = ym.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  } catch { return ym; }
}

function KpiCard({ icon: Icon, label, value, sub, tone = 'emerald' }) {
  const tones = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    violet: 'text-violet-600 bg-violet-50 border-violet-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
  };
  return (
    <div className="rounded-xl border border-line bg-surface-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex items-center justify-center h-7 w-7 rounded-lg border ${tones[tone]}`}>
          <Icon size={14} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-content-faint">{label}</span>
      </div>
      <div className="text-xl font-bold text-content-primary tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-content-tertiary mt-0.5">{sub}</div>}
    </div>
  );
}

export default function CrmReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [pipelines, setPipelines] = useState([]);
  const [pipelineId, setPipelineId] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoPrefs, setAutoPrefs] = useState(null); // { won_onboarding, stale_relance }

  // Auth + gating
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) { setAuthChecked(true); return; }
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { router.push('/login'); return; }
      setUser(u);
      const { data: profile } = await supabase
        .from('user_profiles').select('plan').eq('id', u.id).maybeSingle();
      if (!BUSINESS_PLANS.includes(profile?.plan || 'free')) {
        router.replace('/app/crm');
        return;
      }
      setAuthChecked(true);
    });
  }, [router]);

  // Pipelines
  useEffect(() => {
    if (!authChecked) return;
    fetch('/api/crm/pipelines')
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d.data) ? d.data : [];
        setPipelines(list);
        const def = list.find((p) => p.is_default) || list[0];
        if (def) setPipelineId(def.id);
        else { setLoading(false); }
      })
      .catch(() => setLoading(false));
  }, [authChecked]);

  const fetchReport = useCallback(async () => {
    if (!pipelineId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/crm/reports?pipeline_id=${pipelineId}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erreur chargement rapport');
      setReport(d.data || {});
    } catch (e) {
      setError(e.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [pipelineId]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  // Préférences d'automatisation
  useEffect(() => {
    if (!authChecked) return;
    fetch('/api/crm/automations')
      .then((r) => r.json())
      .then((d) => { if (d?.success) setAutoPrefs(d.data); })
      .catch(() => {});
  }, [authChecked]);

  const toggleAuto = useCallback(async (key) => {
    if (!autoPrefs) return;
    const next = { ...autoPrefs, [key]: !autoPrefs[key] };
    setAutoPrefs(next); // optimiste
    try {
      const res = await fetch('/api/crm/automations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: next[key] }),
      });
      if (!res.ok) setAutoPrefs(autoPrefs); // rollback
    } catch {
      setAutoPrefs(autoPrefs);
    }
  }, [autoPrefs]);

  const winRate = useMemo(() => {
    if (!report) return null;
    const closed = (report.won_count || 0) + (report.lost_count || 0);
    return closed > 0 ? Math.round((report.won_count / closed) * 100) : null;
  }, [report]);

  const weightedForecast = useMemo(() => {
    if (!report?.forecast) return 0;
    return report.forecast.reduce((s, f) => s + (f.weighted_cents || 0), 0);
  }, [report]);

  const maxFunnel = useMemo(() => {
    if (!report?.funnel) return 1;
    return Math.max(1, ...report.funnel.map((f) => f.count || 0));
  }, [report]);

  const maxForecast = useMemo(() => {
    if (!report?.forecast) return 1;
    return Math.max(1, ...report.forecast.map((f) => f.weighted_cents || 0));
  }, [report]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-content-tertiary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base text-content-primary flex flex-col">
      <TopBar user={user} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1 min-h-0">
        <CrmSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="px-4 sm:px-6 py-4 border-b border-line bg-surface-base">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-violet-600" />
                <h1 className="text-base sm:text-lg font-bold">Performance commerciale</h1>
              </div>
              {pipelines.length > 0 && (
                <div className="relative">
                  <select
                    value={pipelineId || ''}
                    onChange={(e) => setPipelineId(e.target.value)}
                    className="appearance-none rounded-lg border border-line bg-surface-card pl-3 pr-8 py-1.5 text-xs font-semibold text-content-secondary focus:border-violet-500/40 focus:outline-none"
                  >
                    {pipelines.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
                </div>
              )}
            </div>
          </header>

          <section className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 bg-gradient-to-br from-violet-50/20 via-surface-base to-surface-base">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-content-tertiary" />
              </div>
            ) : error ? (
              <div className="text-center py-16 text-rose-600 text-sm">{error}</div>
            ) : !report ? (
              <div className="text-center py-16 text-content-tertiary text-sm">Aucune donnée.</div>
            ) : (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiCard icon={TrendingUp} tone="emerald" label="CA gagné"
                    value={formatDealValue(report.won_value_cents || 0)}
                    sub={`${report.won_count || 0} affaire${(report.won_count || 0) > 1 ? 's' : ''} gagnée${(report.won_count || 0) > 1 ? 's' : ''}`} />
                  <KpiCard icon={Percent} tone="blue" label="Taux de win"
                    value={winRate === null ? '—' : `${winRate}%`}
                    sub={`${report.won_count || 0} gagnés / ${report.lost_count || 0} perdus`} />
                  <KpiCard icon={Clock} tone="amber" label="Cycle moyen"
                    value={report.avg_cycle_days && report.avg_cycle_days > 0 ? `${report.avg_cycle_days} j` : '—'}
                    sub="création → closing (gagnés)" />
                  <KpiCard icon={Target} tone="violet" label="Prévisionnel pondéré"
                    value={formatDealValue(weightedForecast)}
                    sub={`sur ${formatDealValue(report.open_value_cents || 0)} ouverts`} />
                </div>

                {/* Funnel */}
                <div className="rounded-xl border border-line bg-surface-card p-4">
                  <h2 className="text-sm font-semibold text-content-primary mb-3">Répartition par étape</h2>
                  {(!report.funnel || report.funnel.length === 0) ? (
                    <p className="text-xs text-content-tertiary py-4">Aucun deal.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {report.funnel.map((f) => (
                        <div key={f.stage} className="flex items-center gap-3">
                          <div className="w-32 shrink-0 text-xs text-content-secondary truncate" title={f.stage}>{f.stage}</div>
                          <div className="flex-1 h-6 rounded-md bg-surface-elevated overflow-hidden">
                            <div
                              className={`h-full rounded-md ${STAGE_BAR[f.color] || 'bg-zinc-400'} flex items-center justify-end px-2`}
                              style={{ width: `${Math.max(6, ((f.count || 0) / maxFunnel) * 100)}%` }}
                            >
                              <span className="text-[10px] font-bold text-white tabular-nums">{f.count || 0}</span>
                            </div>
                          </div>
                          <div className="w-24 shrink-0 text-right text-[11px] tabular-nums text-content-tertiary">
                            {formatDealValue(f.value_cents || 0)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prévision CA par mois */}
                <div className="rounded-xl border border-line bg-surface-card p-4">
                  <h2 className="text-sm font-semibold text-content-primary mb-1">Prévision de CA par mois</h2>
                  <p className="text-[11px] text-content-tertiary mb-4">Deals ouverts, pondérés par la probabilité de leur étape.</p>
                  {(!report.forecast || report.forecast.length === 0) ? (
                    <p className="text-xs text-content-tertiary py-4">Aucune date de clôture prévue sur les deals ouverts.</p>
                  ) : (
                    <div className="flex items-end gap-4 h-48 px-2">
                      {report.forecast.map((f) => (
                        <div key={f.month} className="flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0">
                          <span className="text-[10px] font-bold text-violet-600 tabular-nums">{formatDealValue(f.weighted_cents || 0)}</span>
                          <div
                            className="w-full max-w-[56px] rounded-t-md bg-gradient-to-t from-violet-500 to-violet-400"
                            style={{ height: `${Math.max(4, ((f.weighted_cents || 0) / maxForecast) * 100)}%` }}
                            title={`${f.count} deal(s) · brut ${formatDealValue(f.raw_cents || 0)}`}
                          />
                          <span className="text-[10px] text-content-tertiary">{monthLabel(f.month)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Automatisations (P3-2) */}
                {autoPrefs && (
                  <div className="rounded-xl border border-line bg-surface-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap size={15} className="text-violet-600" />
                      <h2 className="text-sm font-semibold text-content-primary">Automatisations</h2>
                    </div>
                    <div className="space-y-2">
                      {[
                        { key: 'won_onboarding', label: 'Tâche d’onboarding auto', desc: 'Quand un deal passe en « gagné », créer une tâche d’onboarding du contact.' },
                        { key: 'stale_relance', label: 'Relance auto des deals dormants', desc: 'Deal ouvert sans activité depuis 7 jours → tâche de relance créée automatiquement.' },
                      ].map((row) => (
                        <div key={row.key} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-base px-3 py-2.5">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-content-primary">{row.label}</div>
                            <div className="text-[11px] text-content-tertiary mt-0.5">{row.desc}</div>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={!!autoPrefs[row.key]}
                            onClick={() => toggleAuto(row.key)}
                            className={`relative shrink-0 h-5 w-9 rounded-full transition-colors ${autoPrefs[row.key] ? 'bg-emerald-500' : 'bg-content-faint/40'}`}
                          >
                            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${autoPrefs[row.key] ? 'left-[18px]' : 'left-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
