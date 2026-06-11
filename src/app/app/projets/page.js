'use client';

// ─────────────────────────────────────────────────────────────────────
// /app/projets — Volia Project, écran hub.
// Grille de cartes projets : progression, prochaine échéance, retards.
// Création en 1 étape via NewProjectModal. Gating Business (403 → gate).
// ─────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderKanban, Plus, Lock, Star, CalendarDays, AlertCircle, CheckCircle2, Archive,
} from 'lucide-react';
import TopBar from '@/components/TopBar';
import { getSupabase } from '@/lib/supabase';
import NewProjectModal from '@/components/projects/NewProjectModal';

const COLOR_BAR = {
  violet: 'bg-violet-500',
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  cyan: 'bg-cyan-500',
};

function ProjectCard({ project }) {
  const { stats } = project;
  const next = stats.nextDue
    ? new Date(stats.nextDue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : null;
  return (
    <Link
      href={`/app/projets/${project.id}`}
      className="group block bg-surface-raised border border-line rounded-2xl p-5 hover:border-amber-500/50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className={`h-1.5 w-10 rounded-full mb-4 ${COLOR_BAR[project.color] || COLOR_BAR.violet}`} />
      <h3 className="font-semibold text-content-primary group-hover:text-amber-600 transition-colors truncate">
        {project.name}
      </h3>
      {project.description && (
        <p className="text-sm text-content-tertiary mt-1 line-clamp-2">{project.description}</p>
      )}

      {/* Progression */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-content-tertiary">
            {stats.done}/{stats.total} tâches
          </span>
          <span className="font-semibold text-content-secondary">{stats.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-base overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 text-[11px] font-medium">
        {project.status === 'done' ? (
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <CheckCircle2 size={12} /> Terminé
          </span>
        ) : (
          <>
            {stats.overdue > 0 && (
              <span className="inline-flex items-center gap-1 text-red-500">
                <AlertCircle size={12} /> {stats.overdue} en retard
              </span>
            )}
            {next && (
              <span className="inline-flex items-center gap-1 text-content-tertiary">
                <CalendarDays size={12} /> Prochaine : {next}
              </span>
            )}
          </>
        )}
        {stats.milestones.total > 0 && (
          <span className="inline-flex items-center gap-1 text-amber-600 ml-auto">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            {stats.milestones.done}/{stats.milestones.total}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function ProjectsHubPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState('active'); // active | done | archived

  const load = useCallback(async (status) => {
    const res = await fetch(`/api/projects?status=${status}`);
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    if (res.status === 403) {
      setAccessDenied(true);
      setProjects([]);
      return;
    }
    const json = await res.json();
    setProjects(json.success ? json.data : []);
  }, [router]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) router.push('/login');
      else setUser(data.user);
    });
  }, [router]);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  useEffect(() => {
    // Templates en arrière-plan (pour la modale) — silencieux si 403.
    fetch('/api/projects/templates')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.success && setTemplates(j.data))
      .catch(() => {});
  }, []);

  // ── Gate Business ───────────────────────────────────────────────
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-surface-base">
        <TopBar user={user} />
        <main className="max-w-xl mx-auto px-4 pt-24 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 mb-5">
            <Lock size={26} />
          </div>
          <h1 className="text-2xl font-bold text-content-primary mb-3">
            Volia Project est réservé au plan Business
          </h1>
          <p className="text-content-secondary mb-6">
            Transforme tes deals gagnés en projets de livraison, suis chaque tâche au kanban et
            partage l&apos;avancement avec tes clients — sans aucun outil en plus.
          </p>
          <Link
            href="/pricing?plan=max"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold shadow-lg shadow-amber-500/30 transition-all"
          >
            Passer au plan Business
          </Link>
        </main>
      </div>
    );
  }

  const FILTERS = [
    { id: 'active', label: 'En cours' },
    { id: 'done', label: 'Terminés' },
    { id: 'archived', label: 'Archivés' },
  ];

  return (
    <div className="min-h-screen bg-surface-base">
      <TopBar user={user} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-content-primary flex items-center gap-2.5">
            <FolderKanban size={24} className="text-amber-500" />
            Projets
          </h1>
          <div className="flex rounded-xl border border-line overflow-hidden ml-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-surface-raised text-content-secondary hover:bg-surface-base'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-semibold shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus size={16} /> Nouveau projet
          </button>
        </div>

        {projects === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-surface-raised border border-line animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-line rounded-2xl">
            {filter === 'active' ? (
              <>
                <FolderKanban size={36} className="mx-auto text-content-tertiary mb-4" />
                <h2 className="text-lg font-semibold text-content-primary mb-2">
                  Ton premier projet en 10 secondes
                </h2>
                <p className="text-sm text-content-tertiary mb-5 max-w-sm mx-auto">
                  Pars d&apos;un modèle (onboarding client, installation, mission…) ou d&apos;une
                  page blanche. Les tâches s&apos;ajoutent en tapant Entrée.
                </p>
                <button
                  type="button"
                  onClick={() => setShowNew(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold"
                >
                  <Plus size={16} /> Créer un projet
                </button>
              </>
            ) : (
              <p className="text-sm text-content-tertiary flex items-center justify-center gap-2">
                <Archive size={16} /> Rien ici pour le moment.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>

      {showNew && (
        <NewProjectModal
          templates={templates}
          onClose={() => setShowNew(false)}
          onCreated={(project) => router.push(`/app/projets/${project.id}`)}
        />
      )}
    </div>
  );
}
