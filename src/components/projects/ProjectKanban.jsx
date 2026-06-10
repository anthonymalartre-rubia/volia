'use client';

// ─────────────────────────────────────────────────────────────────────
// ProjectKanban — 3 colonnes fixes (À faire / En cours / Fait).
// Drag-drop HTML5 natif (pas de lib), optimiste avec rollback.
// Jalon = étoile ambre sur la carte. Retard = échéance rouge.
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Star, MessageSquare, CalendarDays } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', label: 'À faire', dot: 'bg-content-tertiary' },
  { id: 'doing', label: 'En cours', dot: 'bg-blue-500' },
  { id: 'done', label: 'Fait', dot: 'bg-emerald-500' },
];

function formatDue(dueAt) {
  if (!dueAt) return null;
  const d = new Date(dueAt);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function ProjectKanban({ tasks, onMove, onOpenTask, onAddInline }) {
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [inlineValues, setInlineValues] = useState({ todo: '', doing: '', done: '' });

  const now = Date.now();

  function handleDrop(colId) {
    if (dragId) onMove?.(dragId, colId);
    setDragId(null);
    setOverCol(null);
  }

  async function handleInlineSubmit(colId) {
    const title = inlineValues[colId]?.trim();
    if (!title) return;
    setInlineValues((v) => ({ ...v, [colId]: '' }));
    await onAddInline?.(title, colId);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(col.id);
            }}
            onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
            onDrop={() => handleDrop(col.id)}
            className={`rounded-2xl border p-3 transition-colors min-h-[180px] ${
              overCol === col.id && dragId
                ? 'border-amber-500/60 bg-amber-500/5'
                : 'border-line bg-surface-raised'
            }`}
          >
            <div className="flex items-center gap-2 px-1 mb-3">
              <span className={`w-2 h-2 rounded-full ${col.dot}`} />
              <h3 className="text-sm font-semibold text-content-primary">{col.label}</h3>
              <span className="ml-auto text-xs text-content-tertiary font-medium">{colTasks.length}</span>
            </div>

            {/* Ajout inline : taper + Enter = tâche créée. Zéro friction. */}
            <input
              type="text"
              value={inlineValues[col.id]}
              onChange={(e) => setInlineValues((v) => ({ ...v, [col.id]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleInlineSubmit(col.id)}
              placeholder="+ Ajouter une tâche"
              className="w-full mb-2 px-3 py-2 rounded-xl bg-surface-base border border-dashed border-line text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-amber-500/60 focus:border-solid"
            />

            <div className="space-y-2">
              {colTasks.map((task) => {
                const overdue =
                  task.due_at && task.status !== 'done' && new Date(task.due_at).getTime() < now;
                return (
                  <button
                    key={task.id}
                    type="button"
                    draggable
                    onDragStart={() => setDragId(task.id)}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => onOpenTask?.(task)}
                    className={`w-full text-left p-3 rounded-xl border bg-surface-base hover:border-amber-500/40 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing ${
                      dragId === task.id ? 'opacity-40' : ''
                    } ${task.is_milestone ? 'border-amber-500/40' : 'border-line'}`}
                  >
                    <div className="flex items-start gap-2">
                      {task.is_milestone && (
                        <Star size={14} className="text-amber-500 fill-amber-500 mt-0.5 shrink-0" />
                      )}
                      <span
                        className={`text-sm leading-snug ${
                          task.status === 'done'
                            ? 'text-content-tertiary line-through'
                            : 'text-content-primary'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    {(task.due_at || task.comments_count > 0) && (
                      <div className="flex items-center gap-3 mt-2">
                        {task.due_at && (
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                              overdue ? 'text-red-500' : 'text-content-tertiary'
                            }`}
                          >
                            <CalendarDays size={12} />
                            {formatDue(task.due_at)}
                          </span>
                        )}
                        {task.comments_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-content-tertiary">
                            <MessageSquare size={12} />
                            {task.comments_count}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
