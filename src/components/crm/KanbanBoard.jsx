'use client';

// ─────────────────────────────────────────────────────────────────────
// KanbanBoard — Kanban du pipeline CRM (drag-drop natif HTML5).
// ─────────────────────────────────────────────────────────────────────
// Props :
//   - pipeline : { id, name, stages: [...] } (stages triées par position)
//   - deals    : array de deals (avec stage embarqué)
//   - onDealMove(dealId, stageId, position) : appelé après un drop
//   - onDealClick(deal) : ouvre le drawer
//   - onNewDeal(stageId) : ouvre le modal pré-rempli sur ce stage
//
// Drag-drop : API native HTML5 (pas de dépendance).
//   - DealCard.draggable=true + dataTransfer.setData('dealId', id)
//   - Column.onDragOver preventDefault + visual highlight
//   - Column.onDrop : appelle onDealMove
//
// Layout : flex overflow-x-auto pour scroll horizontal sur petits écrans.
// Sur mobile (<sm), on stack vertical avec navigation par tabs (gérée
// dans la page parent via le filtre stage).
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Plus, Inbox } from 'lucide-react';
import DealCard from './DealCard';
import { formatDealValue } from '@/lib/crm';
import { InfoTooltip } from '@/components/ui';

// ─── Palette stage → classes Tailwind (toutes déclarées en dur pour le purge)
const STAGE_COLORS = {
  zinc:    { dot: 'bg-zinc-400',    headerBg: 'bg-zinc-50',    border: 'border-zinc-200',    text: 'text-zinc-700' },
  blue:    { dot: 'bg-blue-500',    headerBg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700' },
  indigo:  { dot: 'bg-indigo-500',  headerBg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700' },
  violet:  { dot: 'bg-violet-500',  headerBg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700' },
  emerald: { dot: 'bg-emerald-500', headerBg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  teal:    { dot: 'bg-teal-500',    headerBg: 'bg-teal-50',    border: 'border-teal-200',    text: 'text-teal-700' },
  amber:   { dot: 'bg-amber-500',   headerBg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700' },
  rose:    { dot: 'bg-rose-500',    headerBg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700' },
};

function getStageColors(color) {
  return STAGE_COLORS[color] || STAGE_COLORS.zinc;
}

// ─── KanbanColumn (interne) ────────────────────────────────────────
function KanbanColumn({
  stage,
  deals,
  onDealMove,
  onDealClick,
  onNewDeal,
  draggingDealId,
  setDraggingDealId,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const colors = getStageColors(stage.color);
  const isClosingWon = stage.closing_type === 'won';
  const isClosingLost = stage.closing_type === 'lost';
  const isClosing = isClosingWon || isClosingLost;

  const totalValue = deals.reduce((sum, d) => sum + (d.value_cents || 0), 0);

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  }
  function handleDragLeave(e) {
    // Vérifier qu'on quitte vraiment la colonne et pas un enfant
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  }
  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const dealId = e.dataTransfer.getData('dealId');
    const sourceStageId = e.dataTransfer.getData('sourceStageId');
    setDraggingDealId(null);
    if (!dealId) return;
    // Pas d'op si on drop dans la même colonne (Phase 2 : pas de reorder
    // intra-colonne, juste move entre stages).
    if (sourceStageId === stage.id) return;
    onDealMove(dealId, stage.id, deals.length);
  }

  // Border treatment selon closing
  const columnBorder = isDragOver
    ? 'border-2 border-emerald-400 bg-emerald-50/30'
    : isClosingWon
    ? 'border-2 border-emerald-200/70'
    : isClosingLost
    ? 'border-2 border-rose-200/70'
    : 'border border-line';

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex-shrink-0 w-[280px] sm:w-[300px]
        flex flex-col rounded-xl
        bg-surface-elevated/40
        ${columnBorder}
        transition-colors
      `}
      aria-label={`Colonne ${stage.name}, ${deals.length} deals`}
    >
      {/* ─── Header combiné (nom + count + % + total value) ──── */}
      <div className={`px-3 py-3 rounded-t-xl ${colors.headerBg} border-b-2 ${colors.border}`}>
        {/* Ligne 1 : dot + nom + badge count + probabilité */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2.5 h-2.5 rounded-full ${colors.dot} flex-shrink-0 shadow-sm`}
              aria-hidden="true"
            />
            <h3 className={`text-sm font-bold truncate ${colors.text}`}>
              {stage.name || 'Stage'}
            </h3>
            <span className={`text-[10px] font-bold tabular-nums flex-shrink-0 px-1.5 py-0.5 rounded-full bg-white/70 ${colors.text}`}>
              {deals.length}
            </span>
          </div>
          {!isClosing && (
            <span className={`text-[10px] font-bold tabular-nums whitespace-nowrap px-1.5 py-0.5 rounded-md bg-white/70 ${colors.text} inline-flex items-center gap-1`}>
              {stage.probability}%
              <InfoTooltip
                content={`Probabilité de closing à ce stade (${stage.probability}%). Utilisée pour calculer le pipeline pondéré : somme des deals × probabilité de leur stage.`}
                iconSize={10}
              />
            </span>
          )}
        </div>
        {/* Ligne 2 : total value */}
        <div className={`text-xs font-bold tabular-nums ${colors.text} opacity-80`}>
          {formatDealValue(totalValue)}
        </div>
      </div>

      {/* ─── Body : list of cards ──────────────────────────── */}
      <div className="flex-1 p-2 space-y-2 min-h-[120px] overflow-y-auto max-h-[calc(100vh-280px)]">
        {deals.length === 0 ? (
          <button
            type="button"
            onClick={() => onNewDeal(stage.id)}
            className="w-full py-8 px-3 rounded-lg border-2 border-dashed border-line hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors flex flex-col items-center justify-center gap-1.5 text-content-tertiary hover:text-emerald-700 group"
          >
            <Inbox size={18} className="opacity-60 group-hover:opacity-100" />
            <span className="text-[11px] font-medium">Vide.</span>
            <span className="text-[10px] text-content-muted group-hover:text-emerald-600">
              + Créer un deal
            </span>
          </button>
        ) : (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onClick={() => onDealClick(deal)}
              isDragging={draggingDealId === deal.id}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('dealId', deal.id);
                e.dataTransfer.setData('sourceStageId', deal.stage_id);
                setDraggingDealId(deal.id);
              }}
              onDragEnd={() => setDraggingDealId(null)}
            />
          ))
        )}
      </div>

      {/* ─── Footer : "+ New" (sauf closing stages quand pleines) ── */}
      {!isClosing && deals.length > 0 && (
        <div className="p-2 border-t border-line">
          <button
            type="button"
            onClick={() => onNewDeal(stage.id)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-content-tertiary hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <Plus size={12} />
            Nouveau deal
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main KanbanBoard ───────────────────────────────────────────────
export default function KanbanBoard({
  pipeline,
  deals = [],
  onDealMove,
  onDealClick,
  onNewDeal,
}) {
  const [draggingDealId, setDraggingDealId] = useState(null);

  if (!pipeline || !Array.isArray(pipeline.stages)) {
    return (
      <div className="text-center py-12 text-content-tertiary text-sm">
        Pipeline introuvable.
      </div>
    );
  }

  // Group deals by stage_id
  const dealsByStage = {};
  for (const stage of pipeline.stages) {
    dealsByStage[stage.id] = [];
  }
  for (const d of deals) {
    if (dealsByStage[d.stage_id]) {
      dealsByStage[d.stage_id].push(d);
    }
  }
  // Sort by position then created_at desc inside each column
  for (const sid of Object.keys(dealsByStage)) {
    dealsByStage[sid].sort((a, b) => {
      const posA = a.position ?? 0;
      const posB = b.position ?? 0;
      if (posA !== posB) return posA - posB;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-min px-1">
        {pipeline.stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] || []}
            onDealMove={onDealMove}
            onDealClick={onDealClick}
            onNewDeal={onNewDeal}
            draggingDealId={draggingDealId}
            setDraggingDealId={setDraggingDealId}
          />
        ))}
      </div>
    </div>
  );
}
