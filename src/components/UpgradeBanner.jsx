'use client';

import { useState } from 'react';
import { AlertTriangle, X, ArrowUpRight } from 'lucide-react';

const LIMIT_LABELS = {
  searches: 'recherches',
  enrichments: 'enrichissements',
  exports: 'exports',
};

export default function UpgradeBanner({ plan, usage, onUpgrade }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !plan || !usage) return null;

  // Only show for free/starter plan users
  if (plan.id !== 'free') return null;

  const items = [
    { key: 'searches', label: 'recherches', current: usage.searches || 0, limit: plan.limits.searches_per_month },
    { key: 'enrichments', label: 'enrichissements', current: usage.enrichments || 0, limit: plan.limits.enrichments_per_month },
    { key: 'exports', label: 'exports', current: usage.exports || 0, limit: plan.limits.exports_per_month },
  ];

  // Find the highest usage item that is at 80%+
  const warningItems = items
    .filter(i => i.limit !== -1 && (i.current / i.limit) >= 0.8)
    .sort((a, b) => (b.current / b.limit) - (a.current / a.limit));

  if (warningItems.length === 0) return null;

  const top = warningItems[0];
  const pct = Math.min(100, Math.round((top.current / top.limit) * 100));
  const isMaxed = pct >= 100;

  const accentBorder = isMaxed ? 'border-red-500/30' : 'border-amber-500/30';
  const accentBg = isMaxed ? 'bg-red-500/5' : 'bg-amber-500/5';
  const accentText = isMaxed ? 'text-red-400' : 'text-amber-400';
  const accentIcon = isMaxed ? 'bg-red-500/20' : 'bg-amber-500/20';
  const barColor = isMaxed ? 'bg-red-500' : 'bg-amber-500';

  return (
    <div className={`mx-3 sm:mx-4 md:mx-6 mt-3 sm:mt-4 rounded-xl border ${accentBorder} ${accentBg} p-4`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${accentIcon} shrink-0`}>
          <AlertTriangle className={`h-4 w-4 ${accentText}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className={`text-sm font-medium ${accentText}`}>
              {isMaxed
                ? `Limite de ${top.label} atteinte`
                : `Vous avez utilisé ${pct}% de vos ${top.label} ce mois`}
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-md hover:bg-surface-elevated transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5 text-content-muted" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-surface-elevated overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-content-tertiary">
              {top.current} / {top.limit} {top.label} utilisé{top.label !== 'exports' ? 'e' : ''}s
              {warningItems.length > 1 && (
                <span className="ml-1">
                  (+{warningItems.length - 1} autre{warningItems.length > 2 ? 's' : ''} limite{warningItems.length > 2 ? 's' : ''} proche{warningItems.length > 2 ? 's' : ''})
                </span>
              )}
            </span>
            <button
              onClick={onUpgrade}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/20 shrink-0"
            >
              Passer Pro <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
