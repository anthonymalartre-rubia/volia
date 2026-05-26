'use client';

// ─────────────────────────────────────────────────────────────────────
// PageTabs — Onglets pour naviguer entre les pages (F4)
// ─────────────────────────────────────────────────────────────────────
// Features F4 :
//   - Sortable horizontalement (drag handle visible au hover)
//   - Drop target pour cross-page field move (highlight violet quand un
//     field du canvas est dragé par-dessus)
//   - Bouton ⚡ "Jump logic" si page.jump_logic.rules exists ou clickable
//
// Cohabitation dnd-kit : le PageTabs est dans le SAME DndContext que
// la palette + canvas (BuilderLayout). Les ids sont préfixés :
//   - sortable page : "page:<id>"  (data.source = 'page-tab' pour drop target field)
// ─────────────────────────────────────────────────────────────────────

import { Plus, X, FileText, Pencil, Check, Zap, GripVertical } from 'lucide-react';
import { useState } from 'react';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

function PageTab({
  page,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onOpenJumpLogic,
  canDelete,
  hasJumpLogic,
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(page.title || '');

  // Sortable (reorder pages)
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `page:${page.id}`,
    data: { source: 'page-tab-sortable', pageId: page.id },
  });

  // Droppable (cross-page field drop)
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `page-drop:${page.id}`,
    data: { source: 'page-tab-drop', pageId: page.id },
  });

  // Compose les 2 refs sur le même DOM node
  const setRefs = (el) => {
    setSortableRef(el);
    setDropRef(el);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  function commit() {
    const t = title.trim();
    if (t && t !== page.title) {
      onRename(page.id, { title: t });
    }
    setEditing(false);
  }

  return (
    <div
      ref={setRefs}
      style={style}
      role="tab"
      aria-selected={isActive}
      className={`group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
        isActive
          ? 'bg-pink-100 text-pink-700 border-pink-200'
          : 'bg-surface-card text-content-tertiary border-line hover:border-pink-200 hover:text-pink-700'
      } ${
        isOver
          ? 'ring-2 ring-violet-400 border-violet-400 bg-violet-50 animate-pulse'
          : ''
      }`}
    >
      {/* Drag handle (sort pages) */}
      <button
        type="button"
        {...listeners}
        {...attributes}
        className="opacity-0 group-hover:opacity-100 text-content-faint hover:text-content-primary cursor-grab active:cursor-grabbing transition-opacity"
        aria-label="Réordonner cette page"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={10} />
      </button>

      <button
        type="button"
        onClick={() => onSelect(page.id)}
        className="inline-flex items-center gap-1.5"
      >
        <FileText size={11} />
        {editing ? (
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') {
                setTitle(page.title || '');
                setEditing(false);
              }
            }}
            className="bg-white border border-pink-300 rounded px-1.5 py-0.5 text-xs w-28 focus:outline-none focus:ring-2 focus:ring-pink-500/40"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span>{page.title || 'Page'}</span>
        )}
      </button>

      {hasJumpLogic && !editing && (
        <span
          className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-violet-100 text-violet-700"
          title="Cette page a une logique de saut"
        >
          <Zap size={7} />
        </span>
      )}

      {!editing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          className="opacity-0 group-hover:opacity-100 text-content-faint hover:text-pink-600 transition-opacity"
          aria-label="Renommer la page"
        >
          <Pencil size={10} />
        </button>
      )}

      {!editing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenJumpLogic(page.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-content-faint hover:text-violet-600 transition-opacity"
          aria-label="Configurer la logique de saut"
          title="Logique de saut"
        >
          <Zap size={10} />
        </button>
      )}

      {editing && (
        <button type="button" onClick={commit} className="text-pink-600">
          <Check size={11} />
        </button>
      )}
      {canDelete && !editing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Supprimer "${page.title}" ? Les champs seront déplacés vers la 1ère page.`)) {
              onDelete(page.id);
            }
          }}
          className="opacity-0 group-hover:opacity-100 text-content-faint hover:text-rose-600 transition-opacity"
          aria-label="Supprimer la page"
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}

export default function PageTabs({
  pages,
  currentPageId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onOpenJumpLogic,
}) {
  const sorted = [...(pages || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
  const canDelete = sorted.length > 1;

  return (
    <div className="flex items-center gap-2 flex-wrap" role="tablist" aria-label="Pages du formulaire">
      <SortableContext
        items={sorted.map((p) => `page:${p.id}`)}
        strategy={horizontalListSortingStrategy}
      >
        {sorted.map((page) => (
          <PageTab
            key={page.id}
            page={page}
            isActive={page.id === currentPageId}
            onSelect={onSelect}
            onRename={onRename}
            onDelete={onDelete}
            onOpenJumpLogic={onOpenJumpLogic}
            canDelete={canDelete}
            hasJumpLogic={!!page.jump_logic?.rules?.length}
          />
        ))}
      </SortableContext>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-dashed border-line text-content-tertiary hover:border-pink-300 hover:text-pink-700 transition-all"
        aria-label="Ajouter une page"
      >
        <Plus size={11} /> Page
      </button>
    </div>
  );
}
