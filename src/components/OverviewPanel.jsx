'use client';

import { useMemo } from 'react';
import { Users, Mail, Phone, Globe, TrendingUp, BarChart3, MapPin, Target, Zap, CheckCircle } from 'lucide-react';
import { computeAnalytics } from '@/lib/analytics';
import { DEPTS } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';

export default function OverviewPanel({ prospects, searchHistory }) {
  const { t } = useI18n();
  const analytics = useMemo(
    () => computeAnalytics(prospects || [], searchHistory || []),
    [prospects, searchHistory]
  );

  const hasData = analytics.total > 0;

  return (
    <div className="space-y-6">
      {/* Header de section avec hiérarchie premium (label uppercase + titre + subtitle) */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-400 mb-2">
          Aperçu général
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
          Vue d&apos;ensemble
        </h2>
        <p className="text-sm text-content-tertiary mt-1.5 leading-relaxed">
          Statistiques et tendances de vos campagnes de prospection.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={Users}
          label="Prospects"
          value={analytics.total.toLocaleString('fr-FR')}
          color="text-violet-400"
          bgColor="bg-violet-500/10"
        />
        <KpiCard
          icon={Mail}
          label="Emails"
          value={analytics.withEmail.toLocaleString('fr-FR')}
          sub={`${analytics.enrichmentRate}% enrichis`}
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
        <KpiCard
          icon={Phone}
          label="Téléphones"
          value={analytics.withPhone.toLocaleString('fr-FR')}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <KpiCard
          icon={Globe}
          label="Sites web"
          value={analytics.withWebsite.toLocaleString('fr-FR')}
          color="text-amber-600"
          bgColor="bg-amber-500/10"
        />
      </div>

      {/* Enrichment progress — the most important metric */}
      {hasData && (
        <div className="rounded-2xl border border-line bg-surface-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-content-secondary mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-400" /> Progression enrichissement
          </h3>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1 h-4 bg-surface-elevated rounded-full overflow-hidden flex">
              {analytics.withEmail > 0 && (
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${(analytics.withEmail / analytics.total) * 100}%` }}
                  title={`${analytics.withEmail} emails trouvés`}
                />
              )}
            </div>
            <span className="text-sm font-bold text-content-primary tabular-nums">
              {analytics.enrichmentRate}%
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-content-tertiary">
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              {analytics.withEmail.toLocaleString('fr-FR')} avec email
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-surface-elevated" />
              {(analytics.total - analytics.withEmail).toLocaleString('fr-FR')} sans email
            </span>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly trend */}
        <div className="rounded-2xl border border-line bg-surface-card p-5 shadow-sm">
          <h3 className="text-sm font-medium text-content-secondary mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Tendance (4 semaines)
          </h3>
          <div className="flex items-end gap-3 h-36">
            {analytics.weeklyTrend.map((w, i) => {
              const maxCount = Math.max(...analytics.weeklyTrend.map(x => x.count), 1);
              const height = maxCount > 0 ? (w.count / maxCount) * 100 : 0;
              const isCurrentWeek = i === analytics.weeklyTrend.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-mono text-content-tertiary tabular-nums">
                    {w.count > 0 ? w.count.toLocaleString('fr-FR') : ''}
                  </span>
                  <div className="w-full flex items-end" style={{ height: '80px' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${isCurrentWeek ? 'bg-violet-500' : 'bg-violet-500/40'}`}
                      style={{ height: w.count > 0 ? `${Math.max(8, height)}%` : '4px' }}
                    />
                  </div>
                  <span className={`text-[10px] leading-tight text-center ${isCurrentWeek ? 'text-violet-400 font-medium' : 'text-content-muted'}`}>
                    {w.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* By department — top 6 */}
        <div className="rounded-2xl border border-line bg-surface-card p-5 shadow-sm">
          <h3 className="text-sm font-medium text-content-secondary mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Top départements
          </h3>
          <div className="space-y-2.5">
            {Object.entries(analytics.byDept)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([dept, count]) => {
                const maxDept = Math.max(...Object.values(analytics.byDept));
                const pct = maxDept > 0 ? (count / maxDept) * 100 : 0;
                return (
                  <div key={dept}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-content-secondary">{dept} — {DEPTS[dept]?.name || dept}</span>
                      <span className="text-content-tertiary font-mono tabular-nums">{count.toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            {Object.keys(analytics.byDept).length === 0 && (
              <p className="text-xs text-content-muted">Pas de donnée encore.</p>
            )}
          </div>
        </div>
      </div>

      {/* Score distribution & email methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-line bg-surface-card p-5 shadow-sm">
          <h3 className="text-sm font-medium text-content-secondary mb-4 flex items-center gap-2">
            <Target className="h-4 w-4" /> Qualité des prospects
          </h3>
          {hasData ? (
            <div className="space-y-2.5">
              {[
                { key: 'excellent', label: 'Excellent (email + tel + site)', color: 'bg-green-500' },
                { key: 'bon', label: 'Bon (email + tel ou site)', color: 'bg-blue-500' },
                { key: 'moyen', label: 'Moyen (tel ou site seul)', color: 'bg-amber-500' },
                { key: 'faible', label: 'Faible (peu de données)', color: 'bg-red-500' },
              ].map(({ key, label, color }) => {
                const count = analytics.scoreDistribution[key];
                const pct = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
                    <span className="text-xs text-content-secondary flex-1">{label}</span>
                    <span className="text-xs font-mono text-content-tertiary tabular-nums">{pct}%</span>
                    <span className="text-xs font-medium text-content-primary tabular-nums w-12 text-right">{count.toLocaleString('fr-FR')}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-content-muted">Lance une recherche. La qualité s&apos;affichera ici.</p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface-card p-5 shadow-sm">
          <h3 className="text-sm font-medium text-content-secondary mb-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Sources d&apos;enrichissement
          </h3>
          {Object.keys(analytics.byMethod).length > 0 ? (
            <div className="space-y-2.5">
              {Object.entries(analytics.byMethod).sort((a, b) => b[1] - a[1]).map(([method, count]) => {
                const colors = {
                  scrape: 'bg-green-500',
                  serper: 'bg-yellow-500',
                  apollo: 'bg-orange-500',
                  apollo_org: 'bg-orange-400',
                  guess: 'bg-zinc-500',
                  'deep-verified': 'bg-emerald-500',
                  'deep-pattern': 'bg-purple-500',
                };
                const labels = {
                  scrape: 'Scraping site web',
                  serper: 'Recherche Google',
                  apollo: 'Apollo (ancien)',
                  apollo_org: 'Apollo Org (ancien)',
                  guess: 'Email deviné',
                  'deep-verified': 'Deep - vérifié',
                  'deep-pattern': 'Deep - pattern',
                };
                const pct = analytics.withEmail > 0 ? Math.round((count / analytics.withEmail) * 100) : 0;
                return (
                  <div key={method} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${colors[method] || 'bg-violet-500'} shrink-0`} />
                    <span className="text-xs text-content-secondary flex-1">{labels[method] || method}</span>
                    <span className="text-xs font-mono text-content-tertiary tabular-nums">{pct}%</span>
                    <span className="text-xs font-medium text-content-primary tabular-nums w-12 text-right">{count.toLocaleString('fr-FR')}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-content-muted">Pas d&apos;enrichissement encore. Tes prochaines recherches le rempliront.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color = 'text-violet-400', bgColor = 'bg-violet-500/10' }) {
  return (
    <div className="group rounded-2xl border border-line bg-surface-card p-5 shadow-sm hover:shadow-md hover:border-line-hover transition-all duration-200">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`p-2 rounded-xl ${bgColor} group-hover:scale-105 transition-transform`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <span className="text-[11px] text-content-tertiary uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <div className="text-3xl font-bold text-content-primary tabular-nums tracking-tight">{value}</div>
      {sub && <div className="text-[11px] text-content-muted mt-1.5">{sub}</div>}
    </div>
  );
}
