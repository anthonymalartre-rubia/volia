'use client';

import { Zap, ArrowUpRight } from 'lucide-react';

export default function UsageBanner({ plan, usage, onUpgrade }) {
  if (!plan || !usage) return null;

  const items = [
    { label: 'Recherches', current: usage.searches || 0, limit: plan.limits.searches_per_month },
    { label: 'Enrichissements', current: usage.enrichments || 0, limit: plan.limits.enrichments_per_month },
    { label: 'Téléphones', current: usage.phones || 0, limit: plan.limits.phones_per_month },
    { label: 'Exports', current: usage.exports || 0, limit: plan.limits.exports_per_month },
  ];

  return (
    <div className="mx-4 mt-4 rounded-xl border border-line bg-surface-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-medium text-content-primary">
            Plan {plan.name}
          </span>
        </div>
        {plan.id === 'free' && (
          <button
            onClick={onUpgrade}
            className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            Passer Pro <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="space-y-2">
        {items.map(({ label, current, limit }) => {
          const isUnlimited = limit === -1;
          const pct = isUnlimited ? 0 : Math.min(100, (current / limit) * 100);
          const isWarning = !isUnlimited && pct >= 80;
          const isMaxed = !isUnlimited && pct >= 100;

          return (
            <div key={label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-content-secondary">{label}</span>
                <span className={isMaxed ? 'text-red-400' : isWarning ? 'text-amber-600' : 'text-content-tertiary'}>
                  {current} / {isUnlimited ? '\u221e' : limit}
                </span>
              </div>
              {!isUnlimited && (
                <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isMaxed ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-violet-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
