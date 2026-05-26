// Skeleton primitives partagées.
//
// Avant : <CenteredSpinner /> plein écran sur toutes les pages (avec
// définition dupliquée dans chaque fichier). Spinner ≠ perception de
// chargement, l'utilisateur voit un écran blanc.
//
// Après : 4 skeletons standardisés (Table, CardList, DashboardStats,
// DetailPage) alignés sur le KanbanSkeleton existant (cf.
// src/app/app/crm/page.js ligne 38). Réduit le LCP perçu.
//
// On garde le CenteredSpinner ailleurs pour les redirects courts (auth
// checks) où skeleton serait overkill.

const PULSE_BAR = 'bg-zinc-200/80 dark:bg-zinc-700/40 rounded animate-pulse';
const PULSE_CARD = 'bg-surface-card border border-line rounded-xl';

/**
 * TableSkeleton — pour les tables de contacts, listes, etc.
 *
 * Props :
 * - rows? (default 5)
 * - cols? (default 4)
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className={`${PULSE_CARD} overflow-hidden`}>
      <div className="bg-surface-elevated px-4 py-3 border-b border-line flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className={`h-3 flex-1 ${PULSE_BAR}`} />
        ))}
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-3 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className={`h-3.5 ${PULSE_BAR}`}
                style={{
                  // Largeurs variées pour un rendu réaliste
                  flex: c === 0 ? 2 : c === cols - 1 ? 0.5 : 1,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * CardListSkeleton — pour les grids de cards (listes, campagnes…).
 *
 * Props :
 * - count? (default 6)
 */
export function CardListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${PULSE_CARD} p-5 space-y-3`}>
          <div className="flex items-start justify-between gap-2">
            <div className={`h-4 w-32 ${PULSE_BAR}`} />
            <div className={`h-3 w-3 ${PULSE_BAR}`} />
          </div>
          <div className={`h-2.5 w-3/4 ${PULSE_BAR}`} />
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="bg-surface-elevated rounded-lg px-2 py-1.5 space-y-1"
              >
                <div className={`h-2 w-10 ${PULSE_BAR}`} />
                <div className={`h-3 w-12 ${PULSE_BAR}`} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * DashboardStatsSkeleton — 4 grandes cards stats animate-pulse.
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`${PULSE_CARD} p-4 space-y-2`}>
          <div className="flex items-center gap-1.5">
            <div className={`h-3 w-3 ${PULSE_BAR}`} />
            <div className={`h-2.5 w-16 ${PULSE_BAR}`} />
          </div>
          <div className={`h-7 w-20 ${PULSE_BAR}`} />
        </div>
      ))}
    </div>
  );
}

/**
 * DetailPageSkeleton — header + 3 sections.
 */
export function DetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-surface-base p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className={`h-3 w-32 ${PULSE_BAR}`} />
          <div className={`h-8 w-64 ${PULSE_BAR}`} />
          <div className={`h-3 w-96 max-w-full ${PULSE_BAR}`} />
        </div>

        {/* Stats row */}
        <DashboardStatsSkeleton />

        {/* Section 1 */}
        <div className={`${PULSE_CARD} p-6 space-y-4`}>
          <div className={`h-4 w-40 ${PULSE_BAR}`} />
          <div className="space-y-2">
            <div className={`h-3 w-full ${PULSE_BAR}`} />
            <div className={`h-3 w-5/6 ${PULSE_BAR}`} />
            <div className={`h-3 w-3/4 ${PULSE_BAR}`} />
          </div>
        </div>

        {/* Section 2 — table */}
        <TableSkeleton rows={4} cols={5} />
      </div>
    </div>
  );
}
