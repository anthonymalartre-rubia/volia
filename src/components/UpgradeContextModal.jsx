'use client';

// Wave 2.2 — In-app upgrade prompt intelligent
// Affiche modal si user >=80% usage limit, cooldown 7j

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, TrendingUp, Zap, ArrowRight } from 'lucide-react';

const SHOW_PATH_PREFIXES = ['/dashboard', '/app'];

export default function UpgradeContextModal() {
  const pathname = usePathname();
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  const onAppRoute = pathname && SHOW_PATH_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!onAppRoute) return;
    let aborted = false;
    (async () => {
      try {
        const res = await fetch('/api/usage/threshold-check');
        if (!res.ok) return;
        const d = await res.json();
        if (!aborted && d.show) {
          setData(d);
          // Délai 4s pour laisser le user voir son dashboard avant le modal
          setTimeout(() => setOpen(true), 4000);
        }
      } catch {}
    })();
    return () => { aborted = true; };
  }, [onAppRoute]);

  async function handleDismiss() {
    setDismissing(true);
    try {
      await fetch('/api/usage/threshold-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss' }),
      });
    } catch {}
    setOpen(false);
    setDismissing(false);
  }

  if (!onAppRoute || !data || !open) return null;

  const metricLabel = data.metric_at_limit === 'searches' ? 'recherches' : 'enrichissements';

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} />
            <span className="font-semibold text-sm">Tu utilises bien Volia</span>
          </div>
          <button
            onClick={handleDismiss}
            disabled={dismissing}
            className="p-1 rounded hover:bg-white/20 disabled:opacity-50"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-4">
            Tu as utilisé <strong className="text-indigo-700 dark:text-indigo-400">{data.current_usage}/{data.current_limit}</strong> {metricLabel} de ton plan{' '}
            <strong className="capitalize">{data.current_plan}</strong> ({data.usage_pct}%).
          </p>
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                Plan {data.next_plan_label}
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {data.next_limit && (
                <>
                  <strong>{data.next_limit}</strong> {metricLabel}/mois ·{' '}
                </>
              )}
              <strong>{data.next_plan_price_eur}€/mois</strong>
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            On te rappelle dans 7 jours si tu fermes. Pas de spam.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              disabled={dismissing}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Plus tard
            </button>
            <Link
              href="/pricing"
              onClick={handleDismiss}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500"
            >
              Voir {data.next_plan_label} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
