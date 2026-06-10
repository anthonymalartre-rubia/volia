'use client';

// ─────────────────────────────────────────────────────────────────────
// /app/projets/[id] — écran de travail Volia Project.
// Kanban 3 colonnes ⇄ vue liste, drawer tâche, header progression.
// Updates optimistes avec rollback (pattern KanbanBoard CRM).
// ─────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, KanbanSquare, List, Star, CheckCircle2, CalendarDays, Loader2, AlertCircle, Link2,
} from 'lucide-react';
import TopBar from '@/components/TopBar';
import { getSupabase } from '@/lib/supabase';
import { computeProjectStats } from '@/lib/projects';
import ProjectKanban from '@/components/projects/ProjectKanban';
import TaskDrawer from '@/components/projects/TaskDrawer';
import ShareModal from '@/components/projects/ShareModal';

const STATUS_LABELS = { todo: 'À faire', doing: 'En cours', done: 'Fait' };

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState('kanban'); // kanban | list
  const [openTaskId, setOpenTaskId] = useState(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) router.push('/login');
      else setUser(data.user);
    });
  }, [router]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('volia_project_view');
      if (saved === 'list' || saved === 'kanban') setView(saved);
    } catch {}
  }, []);

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`);
    if (res.status === 401) return router.push('/login');
    if (res.status === 403) return router.push('/app/projets');
    if (res.status === 404) return setError('Projet introuvable');
    const json = await res.json();
    if (json.success) setProject(json.data);
    else setError(json.error || 'Erreur');
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(
    () => (project ? computeProjectStats(project.tasks) : null),
    [project]
  );

  function switchView(v) {
    setView(v);
    try {
      localStorage.setItem('volia_project_view', v);
    } catch {}
  }

  // ── Mutations optimistes ────────────────────────────────────────
  const patchTaskLocal = useCallback((taskId, patch) => {
    setProject((p) =>
      p ? { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) } : p
    );
  }, []);

  const updateTask = useCallback(
    async (taskId, patch) => {
      const before = project?.tasks.find((t) => t.id === taskId);
      patchTaskLocal(taskId, patch);
      try {
        const res = await fetch(`/api/projects/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        patchTaskLocal(taskId, json.data);
      } catch {
        if (before) patchTaskLocal(taskId, before); // rollback
      }
    },
    [project, patchTaskLocal]
  );

  const deleteTask = useCallback(
    async (taskId) => {
      setOpenTaskId(null);
      const prev = project?.tasks;
      setProject((p) => (p ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p));
      const res = await fetch(`/api/projects/tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok && prev) setProject((p) => (p ? { ...p, tasks: prev } : p));
    },
    [project]
  );

  const addTask = useCallback(
    async (title, status = 'todo') => {
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, status }),
      });
      const json = await res.json();
      if (json.success) {
        setProject((p) => (p ? { ...p, tasks: [...p.tasks, json.data] } : p));
      }
    },
    [id]
  );

  const openTask = project?.tasks.find((t) => t.id === openTaskId) || null;

  if (error) {
    return (
      <div className="min-h-screen bg-surface-base">
        <TopBar user={user} />
        <main className="max-w-xl mx-auto px-4 pt-24 text-center">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-4" />
          <p className="text-content-primary font-semibold mb-4">{error}</p>
          <Link href="/app/projets" className="text-amber-600 text-sm font-medium hover:underline">
            ← Retour aux projets
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <TopBar user={user} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {!project ? (
          <div className="flex items-center justify-center py-32 text-content-tertiary">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : (
          <>
            {/* Header projet */}
            <div className="mb-6">
              <Link
                href="/app/projets"
                className="inline-flex items-center gap-1.5 text-sm text-content-tertiary hover:text-content-primary mb-3 transition-colors"
              >
                <ArrowLeft size={15} /> Projets
              </Link>
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-2xl font-bold text-content-primary">{project.name}</h1>
                {project.status === 'done' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={13} /> Terminé
                  </span>
                )}
                {project.crm_deal_id && (
                  <Link
                    href="/app/crm"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full hover:bg-emerald-500/20 transition-colors"
                    title="Ce projet est lié à un deal gagné du CRM"
                  >
                    Deal CRM lié →
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setShowShare(true)}
                  className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-700 text-sm font-semibold hover:bg-amber-500/20 transition-colors"
                >
                  <Link2 size={14} /> Partager
                </button>
                <div className="flex rounded-xl border border-line overflow-hidden">
                  <button
                    type="button"
                    onClick={() => switchView('kanban')}
                    className={`px-3 py-2 ${view === 'kanban' ? 'bg-amber-500 text-white' : 'bg-surface-raised text-content-secondary'}`}
                    aria-label="Vue kanban"
                  >
                    <KanbanSquare size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => switchView('list')}
                    className={`px-3 py-2 ${view === 'list' ? 'bg-amber-500 text-white' : 'bg-surface-raised text-content-secondary'}`}
                    aria-label="Vue liste"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>

              {/* Barre de progression globale */}
              {stats && stats.total > 0 && (
                <div className="mt-4 max-w-md">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-content-tertiary">
                      {stats.done}/{stats.total} tâches
                      {stats.overdue > 0 && (
                        <span className="text-red-500 font-medium"> · {stats.overdue} en retard</span>
                      )}
                    </span>
                    <span className="font-semibold text-content-secondary">{stats.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-raised border border-line overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                      style={{ width: `${stats.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Board */}
            {view === 'kanban' ? (
              <ProjectKanban
                tasks={project.tasks}
                onMove={(taskId, status) => updateTask(taskId, { status })}
                onOpenTask={(t) => setOpenTaskId(t.id)}
                onAddInline={addTask}
              />
            ) : (
              <div className="bg-surface-raised border border-line rounded-2xl overflow-hidden">
                {project.tasks.length === 0 ? (
                  <p className="text-sm text-content-tertiary text-center py-12">
                    Aucune tâche. Passe en vue kanban pour en ajouter.
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {project.tasks.map((t) => {
                      const overdue =
                        t.due_at && t.status !== 'done' && new Date(t.due_at).getTime() < Date.now();
                      return (
                        <li key={t.id}>
                          <button
                            type="button"
                            onClick={() => setOpenTaskId(t.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-base text-left transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={t.status === 'done'}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateTask(t.id, { status: e.target.checked ? 'done' : 'todo' });
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 accent-amber-500 shrink-0"
                              aria-label={`Marquer "${t.title}" comme faite`}
                            />
                            {t.is_milestone && (
                              <Star size={14} className="text-amber-500 fill-amber-500 shrink-0" />
                            )}
                            <span
                              className={`text-sm flex-1 truncate ${
                                t.status === 'done'
                                  ? 'text-content-tertiary line-through'
                                  : 'text-content-primary'
                              }`}
                            >
                              {t.title}
                            </span>
                            <span className="text-[11px] text-content-tertiary hidden sm:block">
                              {STATUS_LABELS[t.status]}
                            </span>
                            {t.due_at && (
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-medium shrink-0 ${
                                  overdue ? 'text-red-500' : 'text-content-tertiary'
                                }`}
                              >
                                <CalendarDays size={12} />
                                {new Date(t.due_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {openTask && (
        <TaskDrawer
          task={openTask}
          onClose={() => setOpenTaskId(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      )}

      {showShare && project && (
        <ShareModal
          project={project}
          userId={user?.id}
          onClose={() => setShowShare(false)}
          onChanged={load}
        />
      )}
    </div>
  );
}
