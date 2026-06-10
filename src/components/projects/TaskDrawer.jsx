'use client';

// ─────────────────────────────────────────────────────────────────────
// TaskDrawer — panneau latéral d'édition d'une tâche.
// Titre inline, statut, échéance, jalon ⭐, description, commentaires.
// Toute édition = PATCH immédiat (pas de bouton "Enregistrer").
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { X, Star, Trash2, Loader2, Send } from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'todo', label: 'À faire' },
  { id: 'doing', label: 'En cours' },
  { id: 'done', label: 'Fait' },
];

export default function TaskDrawer({ task, onClose, onUpdate, onDelete }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [comments, setComments] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setComments(null);
    let cancelled = false;
    fetch(`/api/projects/tasks/${task.id}/comments`)
      .then((r) => r.json())
      .then((j) => !cancelled && setComments(j.success ? j.data : []))
      .catch(() => !cancelled && setComments([]));
    return () => {
      cancelled = true;
    };
  }, [task.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function addComment() {
    const content = newComment.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/projects/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (json.success) {
        setComments((c) => [...(c || []), json.data]);
        setNewComment('');
      }
    } finally {
      setSending(false);
    }
  }

  const dueValue = task.due_at ? new Date(task.due_at).toISOString().slice(0, 10) : '';

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} aria-hidden="true" />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-surface-raised border-l border-line shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b border-line">
          <button
            type="button"
            onClick={() => onUpdate(task.id, { is_milestone: !task.is_milestone })}
            className={`p-2 rounded-lg transition-colors ${
              task.is_milestone
                ? 'text-amber-500 bg-amber-500/10'
                : 'text-content-tertiary hover:text-amber-500 hover:bg-amber-500/10'
            }`}
            title={task.is_milestone ? 'Retirer le jalon' : 'Marquer comme jalon'}
          >
            <Star size={18} className={task.is_milestone ? 'fill-amber-500' : ''} />
          </button>
          <div className="flex rounded-lg border border-line overflow-hidden ml-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onUpdate(task.id, { status: s.id })}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  task.status === s.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-surface-base text-content-secondary hover:bg-surface-raised'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (confirm('Supprimer cette tâche ?')) onDelete(task.id);
              }}
              className="p-2 rounded-lg text-content-tertiary hover:text-red-500 hover:bg-red-500/10"
              aria-label="Supprimer la tâche"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-content-tertiary hover:bg-surface-base"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && title !== task.title && onUpdate(task.id, { title: title.trim() })}
            rows={2}
            className="w-full text-lg font-semibold text-content-primary bg-transparent resize-none focus:outline-none"
            aria-label="Titre de la tâche"
          />

          <div>
            <label className="block text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-1.5">
              Échéance
            </label>
            <input
              type="date"
              value={dueValue}
              onChange={(e) =>
                onUpdate(task.id, {
                  due_at: e.target.value ? new Date(e.target.value + 'T12:00:00').toISOString() : null,
                })
              }
              className="px-3 py-2 rounded-xl bg-surface-base border border-line text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() =>
                description !== (task.description || '') && onUpdate(task.id, { description })
              }
              rows={4}
              placeholder="Détails, contexte, liens…"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-base border border-line text-sm text-content-primary placeholder:text-content-tertiary resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-2">
              Commentaires
            </label>
            {comments === null ? (
              <div className="flex items-center gap-2 text-sm text-content-tertiary py-2">
                <Loader2 size={14} className="animate-spin" /> Chargement…
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-content-tertiary py-1">Aucun commentaire.</p>
            ) : (
              <ul className="space-y-3">
                {comments.map((c) => (
                  <li key={c.id} className="bg-surface-base border border-line rounded-xl px-3 py-2.5">
                    <p className="text-sm text-content-primary whitespace-pre-wrap">{c.content}</p>
                    <p className="text-[11px] text-content-tertiary mt-1">
                      {new Date(c.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Composer commentaire */}
        <div className="p-3 border-t border-line flex items-center gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addComment()}
            placeholder="Écrire un commentaire…"
            className="flex-1 px-3 py-2.5 rounded-xl bg-surface-base border border-line text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
          <button
            type="button"
            onClick={addComment}
            disabled={!newComment.trim() || sending}
            className="p-2.5 rounded-xl bg-amber-500 text-white disabled:opacity-40 hover:bg-amber-400 transition-colors"
            aria-label="Envoyer le commentaire"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
}
