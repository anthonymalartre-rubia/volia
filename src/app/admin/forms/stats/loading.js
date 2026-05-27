export default function FormsStatsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="h-3 w-32 bg-surface-elevated rounded mb-3 animate-pulse" />
      <div className="h-9 w-48 bg-surface-elevated rounded mb-2 animate-pulse" />
      <div className="h-4 w-full max-w-2xl bg-surface-elevated rounded mb-8 animate-pulse" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-surface-card p-4 animate-pulse">
            <div className="h-3 w-20 bg-surface-elevated rounded mb-3" />
            <div className="h-7 w-16 bg-surface-elevated rounded mb-2" />
            <div className="h-3 w-32 bg-surface-elevated rounded" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-surface-card p-4 mb-4 animate-pulse">
        <div className="h-4 w-48 bg-surface-elevated rounded mb-3" />
        <div className="h-48 bg-surface-elevated rounded" />
      </div>

      <div className="rounded-2xl border border-line bg-surface-card p-4 animate-pulse">
        <div className="h-4 w-32 bg-surface-elevated rounded mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-surface-elevated rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
