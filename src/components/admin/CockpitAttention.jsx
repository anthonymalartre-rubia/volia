'use client';

// Affiche en tête du Dashboard tab : alertes critiques + today's inbox
// Auto-refresh 60s pour rester live

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, CheckCircle2, RefreshCw, Loader2, Inbox, ChevronRight,
  Briefcase, Lightbulb, MessageSquare, Mail, Flame, ListChecks, Bot,
} from 'lucide-react';

const ICONS = { Briefcase, Lightbulb, MessageSquare, Mail, Flame, ListChecks, Bot };

const SEVERITY_STYLES = {
  critical: {
    container: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-900 dark:text-red-200',
    message: 'text-red-700 dark:text-red-300',
    btn: 'bg-red-600 text-white hover:bg-red-500',
  },
  warning: {
    container: 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700',
    icon: 'text-amber-600 dark:text-amber-400',
    title: 'text-amber-900 dark:text-amber-200',
    message: 'text-amber-700 dark:text-amber-300',
    btn: 'bg-amber-600 text-white hover:bg-amber-500',
  },
  info: {
    container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-200',
    message: 'text-blue-700 dark:text-blue-300',
    btn: 'bg-blue-600 text-white hover:bg-blue-500',
  },
};

export default function CockpitAttention() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isManual = false) {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch('/api/admin/attention');
      const d = await res.json();
      if (res.ok) setData(d);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 60_000); // auto-refresh 1 min
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="rounded-xl border border-line bg-surface-card p-6 flex items-center justify-center">
        <Loader2 className="animate-spin text-content-tertiary" size={20} />
      </div>
    );
  }

  if (!data) return null;

  const showAllGood = data.alerts.length === 0 && data.inbox_total_count === 0;

  return (
    <div className="space-y-4">
      {/* ALL GOOD STATE */}
      {showAllGood && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/10 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Tout est sous contrôle
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                0 alerte critique · 0 action en attente. Tu peux te concentrer sur le démarchage.
              </p>
            </div>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 p-1"
            title="Refresh"
          >
            {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          </button>
        </div>
      )}

      {/* ALERTS CRITIQUES */}
      {data.alerts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-content-strong flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              Alertes
              <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {data.alerts.length}
              </span>
            </h3>
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="text-content-soft hover:text-content-strong p-1"
              title="Refresh"
            >
              {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            </button>
          </div>
          <div className="space-y-2">
            {data.alerts.map((alert, i) => {
              const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.warning;
              const isExternal = alert.action_url?.startsWith('http');
              return (
                <div
                  key={i}
                  className={`rounded-xl border ${style.container} p-4 flex items-start justify-between gap-3`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <AlertTriangle className={`${style.icon} shrink-0 mt-0.5`} size={18} />
                    <div className="min-w-0">
                      <p className={`text-sm font-bold ${style.title}`}>{alert.title}</p>
                      <p className={`text-xs ${style.message} mt-0.5 leading-relaxed`}>{alert.message}</p>
                    </div>
                  </div>
                  {alert.action_url && (
                    isExternal ? (
                      <a
                        href={alert.action_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${style.btn}`}
                      >
                        {alert.action_label || 'Voir'} <ChevronRight size={12} />
                      </a>
                    ) : (
                      <Link
                        href={alert.action_url}
                        className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${style.btn}`}
                      >
                        {alert.action_label || 'Voir'} <ChevronRight size={12} />
                      </Link>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TODAY'S INBOX */}
      {data.inbox_total_count > 0 && (
        <div className="rounded-xl border border-line bg-surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-content-strong flex items-center gap-2">
              <Inbox size={16} className="text-violet-500" />
              Today's inbox
              <span className="text-xs px-2 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                {data.inbox_total_count} items
              </span>
            </h3>
            {!data.alerts.length && (
              <button
                onClick={() => load(true)}
                disabled={refreshing}
                className="text-content-soft hover:text-content-strong p-1"
                title="Refresh"
              >
                {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.inbox_active.map((item) => {
              const Icon = ICONS[item.icon] || Inbox;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-line hover:border-${item.color}-400 hover:bg-${item.color}-50/40 dark:hover:bg-${item.color}-900/10 transition-all`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={16} className={`text-${item.color}-500 shrink-0`} />
                    <span className="text-xs text-content-secondary truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-sm font-bold text-${item.color}-600`}>{item.count}</span>
                    <ChevronRight size={12} className="text-content-tertiary group-hover:text-content-secondary transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer mini info refresh */}
      {data.generated_at && (
        <p className="text-[10px] text-content-tertiary text-right">
          Auto-refresh 60s · dernier check : {new Date(data.generated_at).toLocaleTimeString('fr-FR')}
        </p>
      )}
    </div>
  );
}
