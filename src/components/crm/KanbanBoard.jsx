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

import { useEffect, useRef, useState } from 'react';
import { Plus, Inbox, Trash2, Check, X, Loader2, PlusCircle } from 'lucide-react';
import DealCard from './DealCard';
import { formatDealValue } from '@/lib/crm';
import { ConfirmModal, InfoTooltip } from '@/components/ui';

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
  onMoveStage,
  canMovePrev = true,
  canMoveNext = true,
  onRenameStage,
  onDeleteStage,
  canDelete = true,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(stage.name || '');
  const [savingName, setSavingName] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const nameInputRef = useRef(null);

  const colors = getStageColors(stage.color);
  const isClosingWon = stage.closing_type === 'won';
  const isClosingLost = stage.closing_type === 'lost';
  const isClosing = isClosingWon || isClosingLost;

  const totalValue = deals.reduce((sum, d) => sum + (d.value_cents || 0), 0);

  // ─── Focus auto sur l'input quand on entre en mode édition
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // ─── Sync local state si la prop change (après reload du parent)
  useEffect(() => {
    if (!isEditingName) setEditName(stage.name || '');
  }, [stage.name, isEditingName]);

  async function commitRename() {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === stage.name) {
      setIsEditingName(false);
      setEditName(stage.name || '');
      return;
    }
    setSavingName(true);
    try {
      await onRenameStage?.(stage.id, trimmed);
      setIsEditingName(false);
    } catch (e) {
      console.error('[KanbanColumn] rename error', e);
      // Revert sur erreur
      setEditName(stage.name || '');
    } finally {
      setSavingName(false);
    }
  }

  function handleNameKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditingName(false);
      setEditName(stage.name || '');
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await onDeleteStage?.(stage.id);
      setConfirmDelete(false);
    } catch (e) {
      console.error('[KanbanColumn] delete error', e);
    } finally {
      setDeleting(false);
    }
  }

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
        group/col
        flex-shrink-0 w-[280px] sm:w-[300px]
        flex flex-col rounded-xl
        bg-surface-elevated/40
        ${columnBorder}
        transition-colors
        lg:h-full lg:max-h-full
      `}
      aria-label={`Colonne ${stage.name}, ${deals.length} deals`}
    >
      {/* ─── Header compact (1 ligne : nom + total + %) ────────
          État stable post-essais sticky (28 mai 2026) : le header de
          stage est rendu IN-COLUMN, sur 1 seule ligne pour économiser
          de la hauteur. Pas de sticky (toutes les tentatives ont causé
          des bugs visuels : sticky qui colle en bas, masquage des
          cards par overlay opaque, etc.). Trade-off : si beaucoup de
          cards et user scroll profond, le header de colonne sort de la
          viewport — accepté car cas rare et user peut scroll back.

          [28 mai 2026 — inline edit] Le nom est cliquable pour passer
          en mode édition. Trash icon visible au hover (group/col) à
          droite du header. */}
      <div className={`px-3 py-2.5 rounded-t-xl ${colors.headerBg} border-b-2 ${colors.border}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${colors.dot} flex-shrink-0 shadow-sm`}
              aria-hidden="true"
            />
            {isEditingName ? (
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  onBlur={commitRename}
                  disabled={savingName}
                  maxLength={80}
                  className={`flex-1 min-w-0 bg-white/90 border border-white rounded px-1.5 py-0.5 text-sm font-bold ${colors.text} outline-none ring-2 ring-emerald-300/50 focus:ring-emerald-400`}
                  aria-label="Nom du stage"
                />
                {savingName && <Loader2 size={12} className={`${colors.text} animate-spin flex-shrink-0`} />}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onRenameStage && setIsEditingName(true)}
                disabled={!onRenameStage}
                title={onRenameStage ? 'Renommer' : ''}
                className={`text-sm font-bold truncate ${colors.text} text-left min-w-0 ${
                  onRenameStage ? 'hover:underline decoration-dotted underline-offset-2 cursor-text' : 'cursor-default'
                }`}
              >
                {stage.name || 'Stage'}
              </button>
            )}
            <span className={`text-[10px] font-bold tabular-nums flex-shrink-0 px-1.5 py-0.5 rounded-full bg-white/70 ${colors.text}`}>
              {deals.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`text-xs font-bold tabular-nums whitespace-nowrap ${colors.text} opacity-90`}>
              {formatDealValue(totalValue)}
            </span>
            {!isClosing && (
              <span className={`text-[10px] font-bold tabular-nums whitespace-nowrap px-1.5 py-0.5 rounded-md bg-white/70 ${colors.text} inline-flex items-center gap-1`}>
                {stage.probability}%
                <InfoTooltip
                  content={`Probabilité de closing à ce stade (${stage.probability}%). Utilisée pour calculer le pipeline pondéré : somme des deals × probabilité de leur stage.`}
                  iconSize={10}
                />
              </span>
            )}
            {onDeleteStage && canDelete && !isEditingName && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                title="Supprimer cette colonne"
                aria-label={`Supprimer la colonne ${stage.name}`}
                className={`opacity-0 group-hover/col:opacity-100 transition-opacity p-1 rounded hover:bg-white/70 ${colors.text} hover:text-rose-600`}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Confirm modal de suppression ──────────────────── */}
      <ConfirmModal
        open={confirmDelete}
        onClose={() => !deleting && setConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title={`Supprimer la colonne « ${stage.name} » ?`}
        message={
          deals.length > 0 ? (
            <>
              <strong>{deals.length} deal{deals.length > 1 ? 's' : ''}</strong> de
              cette colonne {deals.length > 1 ? 'seront déplacés' : 'sera déplacé'}
              {' '}vers la première colonne restante du pipeline. Cette action est
              irréversible.
            </>
          ) : (
            <>La colonne est vide, elle sera supprimée définitivement.</>
          )
        }
        confirmLabel={deleting ? 'Suppression…' : 'Supprimer'}
        cancelLabel="Annuler"
        variant="danger"
        loading={deleting}
      />

      {/* ─── Body : list of cards ────────────────────────────
          flex-1 prend toute la hauteur restante dans la column.
          Sur desktop (h-screen layout), la column a h-full → le body
          a une hauteur calculée automatique → scroll interne si trop
          de cards. Sur mobile, fallback max-h pour éviter qu'une
          column géante avec 20 cards déborde sans scroll. */}
      <div className="flex-1 p-2 space-y-2 min-h-[120px] overflow-y-auto max-h-[calc(100vh-280px)] lg:max-h-none">
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
              onMoveStage={onMoveStage}
              canMovePrev={canMovePrev}
              canMoveNext={canMoveNext}
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

// ─── AddStageColumn (interne) ──────────────────────────────────────
// Colonne placeholder à droite du board pour créer un nouveau stage.
// 2 états : bouton "+ Ajouter une colonne" (collapsed) → click → input
// inline avec Enter (save) / Escape (cancel).
function AddStageColumn({ onAddStage }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function commit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setOpen(false);
      setName('');
      return;
    }
    setSaving(true);
    try {
      await onAddStage(trimmed);
      setName('');
      setOpen(false);
    } catch (e) {
      console.error('[AddStageColumn] add error', e);
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setName('');
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-shrink-0 w-[280px] sm:w-[300px] self-start rounded-xl border-2 border-dashed border-line hover:border-emerald-300 hover:bg-emerald-50/40 text-content-tertiary hover:text-emerald-700 transition-colors py-3 px-4 inline-flex items-center justify-center gap-2 text-sm font-medium group"
        aria-label="Ajouter une nouvelle colonne"
      >
        <PlusCircle size={16} className="opacity-70 group-hover:opacity-100" />
        Ajouter une colonne
      </button>
    );
  }

  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[300px] self-start rounded-xl border-2 border-emerald-300 bg-white shadow-sm p-2">
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={saving}
        maxLength={80}
        placeholder="Nom de la colonne (ex. Négociation)"
        className="w-full px-2 py-1.5 text-sm font-semibold rounded-lg border border-line bg-surface-base text-content-primary outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
        aria-label="Nom de la nouvelle colonne"
      />
      <div className="mt-2 flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setName('');
          }}
          disabled={saving}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-content-tertiary hover:text-content-primary hover:bg-surface-elevated transition-colors disabled:opacity-50"
        >
          <X size={12} />
          Annuler
        </button>
        <button
          type="button"
          onClick={commit}
          disabled={saving || !name.trim()}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Ajouter
        </button>
      </div>
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
  onMoveStage, // P1-3 : fallback mobile drag-drop
  onStagesMutation, // refetch pipelines + deals après mutation stages
  sortMode = 'position', // 'position' | 'value_desc' | 'close_asc' | 'recent'
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
  // Tri des cartes dans chaque colonne selon sortMode (P1-3).
  // 'position' = ordre manuel drag-drop (défaut) ; les autres sont des tris
  // d'affichage qui n'altèrent pas la position stockée (repasser en 'position'
  // pour réorganiser à la main).
  const byPosition = (a, b) => {
    const posA = a.position ?? 0;
    const posB = b.position ?? 0;
    if (posA !== posB) return posA - posB;
    return new Date(b.created_at) - new Date(a.created_at);
  };
  const comparators = {
    position: byPosition,
    value_desc: (a, b) => (b.value_cents || 0) - (a.value_cents || 0) || byPosition(a, b),
    close_asc: (a, b) => {
      // Sans date de clôture → en dernier
      const ta = a.expected_close_date ? new Date(a.expected_close_date).getTime() : Infinity;
      const tb = b.expected_close_date ? new Date(b.expected_close_date).getTime() : Infinity;
      if (ta !== tb) return ta - tb;
      return byPosition(a, b);
    },
    recent: (a, b) => new Date(b.created_at) - new Date(a.created_at),
  };
  const cmp = comparators[sortMode] || byPosition;
  for (const sid of Object.keys(dealsByStage)) {
    dealsByStage[sid].sort(cmp);
  }

  const stageCount = pipeline.stages.length;
  // On désactive le delete si une seule colonne reste (l'API refuse de toutes
  // façons, mais on cache le bouton pour clarifier l'intention)
  const canDeleteAnyStage = stageCount > 1;

  // ─── Handlers API stages (rename / add / delete) ─────────
  // Throw on error pour que le composant enfant puisse revert son état local.
  async function handleRenameStage(stageId, newName) {
    const res = await fetch(`/api/crm/stages/${stageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Erreur lors du renommage');
    }
    await onStagesMutation?.();
  }

  async function handleDeleteStage(stageId) {
    const res = await fetch(`/api/crm/stages/${stageId}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      const msg = data.error || 'Erreur lors de la suppression';
      // On affiche l'erreur côté user via alert (cas rare : "dernier stage")
      if (typeof window !== 'undefined') window.alert(msg);
      throw new Error(msg);
    }
    await onStagesMutation?.();
  }

  async function handleAddStage(name) {
    const res = await fetch(`/api/crm/pipelines/${pipeline.id}/stages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color: 'zinc', probability: 0 }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      const msg = data.error || 'Erreur lors de la création';
      if (typeof window !== 'undefined') window.alert(msg);
      throw new Error(msg);
    }
    await onStagesMutation?.();
  }

  // Si onStagesMutation n'est pas fourni, on désactive les actions stage
  // (sécurité : ne pas muter sans avoir le moyen de refresh).
  const enableStageActions = typeof onStagesMutation === 'function';

  return (
    <div className="w-full overflow-x-auto pb-4 lg:h-full lg:pb-2">
      <div className="flex gap-3 min-w-min px-1 lg:h-full">
        {pipeline.stages.map((stage, idx) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] || []}
            onDealMove={onDealMove}
            onDealClick={onDealClick}
            onNewDeal={onNewDeal}
            draggingDealId={draggingDealId}
            setDraggingDealId={setDraggingDealId}
            onMoveStage={onMoveStage}
            canMovePrev={idx > 0}
            canMoveNext={idx < stageCount - 1}
            onRenameStage={enableStageActions ? handleRenameStage : undefined}
            onDeleteStage={enableStageActions ? handleDeleteStage : undefined}
            canDelete={canDeleteAnyStage}
          />
        ))}
        {enableStageActions && <AddStageColumn onAddStage={handleAddStage} />}
      </div>
    </div>
  );
}

// [Retiré 28 mai 2026] Composant `KanbanStagesBar` (export nommé)
// Tentative pattern Linear : barre horizontale sticky avec les noms
// de stages au-dessus du board. Plusieurs itérations (sticky dans la
// column → tombait en bas, hoist hors KanbanBoard → masquait les
// cards au scroll, tunings divers de top/padding → de pire en pire
// d'après le founder). Abandonné, retour au header in-column simple.
// Si besoin reprend : voir commits 9458dc3 / 3bd8e30 / 4e7eb29 / 455cdcb.
