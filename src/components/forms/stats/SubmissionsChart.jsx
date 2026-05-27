'use client';

// ─────────────────────────────────────────────────────────────────────
// SubmissionsChart — courbe submissions 30 jours (Sprint F7)
// ─────────────────────────────────────────────────────────────────────
// SVG inline (pas de dep recharts ajoutée). Pattern aligné sur
// /admin/metrics qui fait déjà ses graphes en SVG.
//
// Data : [{ day: 'YYYY-MM-DD', count: number }]
// ─────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';

function shortDay(iso) {
  if (!iso) return '';
  // 'YYYY-MM-DD' → 'DD/MM'
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export default function SubmissionsChart({ data, title = 'Soumissions (30 derniers jours)' }) {
  const max = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return 1;
    return Math.max(1, ...data.map((d) => d.count || 0));
  }, [data]);

  const total = useMemo(() => {
    if (!Array.isArray(data)) return 0;
    return data.reduce((acc, d) => acc + (d.count || 0), 0);
  }, [data]);

  const width = 720;
  const height = 200;
  const padding = { top: 12, right: 12, bottom: 28, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const stepX = data.length > 1 ? chartW / (data.length - 1) : 0;
    return data.map((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - ((d.count || 0) / max) * chartH;
      return { x, y, day: d.day, count: d.count || 0 };
    });
  }, [data, max, chartW, chartH, padding.left, padding.top]);

  const linePath = points.length > 0
    ? points.reduce((acc, p, i) => acc + `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)} `, '').trim()
    : '';
  const areaPath = points.length > 0
    ? `${linePath} L${points[points.length - 1].x.toFixed(1)},${(padding.top + chartH).toFixed(1)} L${points[0].x.toFixed(1)},${(padding.top + chartH).toFixed(1)} Z`
    : '';

  // Y axis : 5 ticks
  const yTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      const value = Math.round((max * i) / 4);
      const y = padding.top + chartH - (i / 4) * chartH;
      ticks.push({ value, y });
    }
    return ticks;
  }, [max, chartH, padding.top]);

  // X axis : 1 label tous les 5 points pour ne pas surcharger
  const xLabels = useMemo(() => {
    return points.filter((_, i) => i % 5 === 0 || i === points.length - 1);
  }, [points]);

  return (
    <div className="rounded-2xl border border-line bg-surface-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-content-primary">{title}</h3>
        <p className="text-xs text-content-tertiary">
          <span className="font-semibold text-pink-700">{total}</span> au total
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[600px]"
          role="img"
          aria-label={title}
        >
          <defs>
            <linearGradient id="forms-chart-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#db2777" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#db2777" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Y */}
          {yTicks.map((t, i) => (
            <g key={`yt-${i}`}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={t.y}
                y2={t.y}
                stroke="currentColor"
                className="text-zinc-200"
                strokeDasharray="2 2"
              />
              <text
                x={padding.left - 6}
                y={t.y + 3}
                textAnchor="end"
                fontSize="9"
                fill="currentColor"
                className="text-content-tertiary"
              >
                {t.value}
              </text>
            </g>
          ))}

          {/* Area */}
          {areaPath && <path d={areaPath} fill="url(#forms-chart-area)" />}
          {/* Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#db2777"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Points (uniquement quand count > 0 pour éviter le bruit) */}
          {points.map((p, i) =>
            p.count > 0 ? (
              <circle
                key={`pt-${i}`}
                cx={p.x}
                cy={p.y}
                r="2.5"
                fill="#db2777"
              >
                <title>{`${shortDay(p.day)} : ${p.count} soumission${p.count > 1 ? 's' : ''}`}</title>
              </circle>
            ) : null
          )}

          {/* X labels */}
          {xLabels.map((p, i) => (
            <text
              key={`xl-${i}`}
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              className="text-content-tertiary"
            >
              {shortDay(p.day)}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
