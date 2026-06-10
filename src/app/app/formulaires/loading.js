// ─────────────────────────────────────────────────────────────────
// /app/formulaires — Skeleton (Sprint F7)
// ─────────────────────────────────────────────────────────────────

export default function FormsHubLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-3 w-32 bg-surface-elevated rounded mb-3" />
        <div className="h-9 w-64 bg-surface-elevated rounded mb-2" />
        <div className="h-4 w-full max-w-xl bg-surface-elevated rounded" />
      </div>

      {/* Action bar */}
      <div className="mb-6 flex items-center justify-between gap-3 animate-pulse">
        <div className="h-4 w-32 bg-surface-elevated rounded" />
        <div className="h-10 w-44 bg-surface-elevated rounded-xl" />
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-line bg-surface-card animate-pulse"
          >
            <div className="h-4 w-2/3 bg-surface-elevated rounded mb-2" />
            <div className="h-3 w-1/3 bg-surface-elevated rounded mb-3" />
            <div className="flex items-center gap-3">
              <div className="h-3 w-16 bg-surface-elevated rounded" />
              <div className="h-3 w-16 bg-surface-elevated rounded" />
              <div className="h-3 w-16 bg-surface-elevated rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
