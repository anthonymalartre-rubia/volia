'use client';

// ─────────────────────────────────────────────────────────────────────
// /app/crm/pipelines — Gestion des pipelines custom (plan MAX).
// ─────────────────────────────────────────────────────────────────────
// Liste tous les pipelines de l'user avec actions :
//   - Modifier (→ /app/crm/pipelines/[id])
//   - Définir par défaut
//   - Supprimer (cascade : deals réassignés au pipeline default)
//
// Création via NewPipelineModal (template-based).
// ─────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GitBranch, Plus, AlertCircle, Lock, Sparkles,
  MoreVertical, Star, Trash2, Edit3, KanbanSquare, Loader2, Check,
} from 'lucide-react';
import TopBar from '@/components/TopBar';
import { getSupabase } from '@/lib/supabase';
import { PIPELINE_TEMPLATES, CRM_ALLOWED_PLANS as BUSINESS_PLANS } from '@/lib/crm';
import CrmSidebar from '@/components/crm/CrmSidebar';
import NewPipelineModal from '@/components/crm/NewPipelineModal';
import { ConfirmModal } from '@/components/ui';

// Gating CRM ouvert à tous depuis le pivot freemium — voir CRM_ALLOWED_PLANS (lib/crm.js).

const COLOR_DOT = {
  zinc: 'bg-zinc-400',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
};

const COLOR_GRADIENT = {
  zinc: 'from-zinc-100 to-zinc-50',
  blue: 'from-blue-100 to-blue-50',
  indigo: 'from-indigo-100 to-indigo-50',
  violet: 'from-violet-100 to-violet-50',
  emerald: 'from-emerald-100 to-emerald-50',
  teal: 'from-teal-100 to-teal-50',
  amber: 'from-amber-100 to-amber-50',
  rose: 'from-rose-100 to-rose-50',
};

function PipelineCard({ pipeline, dealsCount, onEdit, onSetDefault, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const stagesCount = (pipeline.stages || []).length;
  const dotColor = COLOR_DOT[pipeline.color] || COLOR_DOT.violet;
  const gradient = COLOR_GRADIENT[pipeline.color] || COLOR_GRADIENT.violet;

  return (
    <div
      className={`relative group rounded-2xl border border-line bg-gradient-to-br ${gradient} hover:shadow-lg hover:shadow-emerald-500/5 transition-all overflow-hidden`}
    >
      {/* Menu trigger */}
      <div className="absolute top-3 right-3 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-content-tertiary hover:text-content-primary backdrop-blur transition opacity-0 group-hover:opacity-100"
          aria-label="Actions"
        >
          <MoreVertical size={14} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
            <div className="absolute top-full right-0 mt-1 z-40 min-w-[12rem] rounded-lg border border-line bg-surface-base shadow-lg py-1">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(pipeline);
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-content-primary hover:bg-surface-elevated"
              >
                <Edit3 size={12} /> Modifier
              </button>
              {!pipeline.is_default && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onSetDefault(pipeline);
                  }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-content-primary hover:bg-surface-elevated"
                >
                  <Star size={12} /> Définir par défaut
                </button>
              )}
              {!pipeline.is_default && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(pipeline);
                  }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 size={12} /> Supprimer
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <Link
        href={`/app/crm/pipelines/${pipeline.id}`}
        className="block p-5"
        aria-label={`Modifier ${pipeline.name}`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3 pr-8">
          <div className={`w-10 h-10 rounded-xl ${dotColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <GitBranch size={18} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-content-primary truncate">
                {pipeline.name}
              </h3>
              {pipeline.is_default && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 inline-flex items-center gap-0.5">
                  <Star size={8} /> Défaut
                </span>
              )}
            </div>
            {pipeline.description && (
              <p className="text-[11px] text-content-tertiary mt-0.5 line-clamp-2">
                {pipeline.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] text-content-tertiary mb-3">
          <span className="inline-flex items-center gap-1">
            <span className="tabular-nums font-semibold text-content-secondary">{stagesCount}</span>
            stages
          </span>
          <span className="text-content-faint">·</span>
          <span className="inline-flex items-center gap-1">
            <span className="tabular-nums font-semibold text-content-secondary">{dealsCount || 0}</span>
            deals
          </span>
        </div>

        {/* Stages preview */}
        <div className="flex items-center gap-1 flex-wrap">
          {(pipeline.stages || []).slice(0, 8).map((s) => (
            <span
              key={s.id}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/70 text-[10px] font-medium text-content-secondary`}
              title={`${s.name} (${s.probability}%)`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${COLOR_DOT[s.color] || 'bg-zinc-400'}`} />
              <span className="truncate max-w-[5rem]">{s.name}</span>
            </span>
          ))}
          {stagesCount > 8 && (
            <span className="text-[10px] text-content-muted">+{stagesCount - 8}</span>
          )}
        </div>
      </Link>
    </div>
  );
}

export default function CrmPipelinesPage() {
  const router = useRouter();

  // Auth
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [pipelines, setPipelines] = useState([]);
  const [dealsCounts, setDealsCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // UI
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Quick win #5 : one-click sales template depuis empty state
  const [quickTemplateLoading, setQuickTemplateLoading] = useState(false);
  const [quickTemplateToast, setQuickTemplateToast] = useState('');

  // Auth resolution
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setAuthChecked(true);
      return;
    }
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('plan')
        .eq('id', u.id)
        .maybeSingle();
      setPlan(profile?.plan || 'free');
      setAuthChecked(true);
    });
  }, [router]);

  const hasBusinessAccess = plan && BUSINESS_PLANS.includes(plan);

  // Fetch pipelines + count deals/pipeline
  const fetchAll = useCallback(async () => {
    if (!hasBusinessAccess) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/crm/pipelines');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur chargement');
      const list = Array.isArray(json.data) ? json.data : [];
      setPipelines(list);

      // Récup le count de deals par pipeline (best-effort via /api/crm/deals)
      // On utilise une seule requête supabase via le client browser
      const supabase = getSupabase();
      if (supabase && list.length > 0) {
        const counts = {};
        await Promise.all(
          list.map(async (p) => {
            const { count } = await supabase
              .from('crm_deals')
              .select('id', { count: 'exact', head: true })
              .eq('pipeline_id', p.id);
            counts[p.id] = count || 0;
          })
        );
        setDealsCounts(counts);
      }
    } catch (err) {
      console.error('[CRM/pipelines] fetch error', err);
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [hasBusinessAccess]);

  useEffect(() => {
    if (authChecked && hasBusinessAccess) fetchAll();
  }, [authChecked, hasBusinessAccess, fetchAll]);

  // Actions
  function handleEdit(pipeline) {
    router.push(`/app/crm/pipelines/${pipeline.id}`);
  }

  async function handleSetDefault(pipeline) {
    try {
      const res = await fetch(`/api/crm/pipelines/${pipeline.id}/set-default`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      // Update local : marque ce pipeline comme default + retire des autres
      setPipelines((prev) =>
        prev.map((p) => ({ ...p, is_default: p.id === pipeline.id }))
      );
    } catch (err) {
      console.error('[CRM/pipelines] setDefault error', err);
      setError(err.message || 'Erreur');
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/crm/pipelines/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur suppression');
      setPipelines((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      // Re-fetch pour rafraichir les counts (deals réassignés au default)
      fetchAll();
    } catch (err) {
      console.error('[CRM/pipelines] delete error', err);
      setError(err.message || 'Erreur');
    } finally {
      setDeleting(false);
    }
  }

  function handleCreated(pipeline) {
    setPipelines((prev) => [...prev, pipeline]);
    setDealsCounts((prev) => ({ ...prev, [pipeline.id]: 0 }));
  }

  // Quick win #5 : one-click création pipeline "Sales standard"
  async function handleQuickSalesTemplate() {
    if (quickTemplateLoading) return;
    setQuickTemplateLoading(true);
    setError('');
    try {
      const tpl = PIPELINE_TEMPLATES.sales;
      const res = await fetch('/api/crm/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tpl.name,
          description: tpl.description,
          color: tpl.color,
          stages: tpl.stages,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erreur création pipeline');
      }
      handleCreated(json.data);
      setQuickTemplateToast(`Pipeline "${tpl.name}" créé ✓`);
      setTimeout(() => setQuickTemplateToast(''), 4000);
    } catch (err) {
      console.error('[CRM/pipelines] quick sales template error', err);
      setError(err.message || 'Erreur création pipeline');
    } finally {
      setQuickTemplateLoading(false);
    }
  }

  // Loading auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse">
          <GitBranch size={28} className="text-white" />
        </div>
      </div>
    );
  }

  // No access
  if (!hasBusinessAccess) {
    return (
      <div className="min-h-screen bg-surface-base text-content-primary">
        <TopBar user={user} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 mb-6">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Pipelines</h1>
          <p className="text-content-secondary mb-8">
            Limite du plan atteinte — les pipelines illimités, c&apos;est sur le plan{' '}
            <strong className="text-content-primary">MAX</strong>.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30 transition-all"
          >
            <Sparkles size={16} />
            Voir le plan MAX
          </Link>
        </main>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-surface-base text-content-primary flex flex-col">
      <TopBar user={user} onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="flex flex-1 overflow-hidden">
        <CrmSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          {/* Header sticky relatif au scroll de <main> (qui est overflow-y-auto)
              → top-0 et non top-14. Le top-14 créait une bande aveugle de
              56px qui cachait la première ligne de contenu. */}
          <header className="border-b border-line bg-surface-base sticky top-0 z-30">
            <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <GitBranch size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-content-primary">Pipelines</h1>
                  <p className="text-xs text-content-tertiary">
                    Organise tes processus commerciaux avec des pipelines personnalisés.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNewModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <Plus size={14} />
                Nouveau pipeline
              </button>
            </div>

            {error && (
              <div className="px-4 sm:px-6 pb-3">
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium flex-1">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    className="text-rose-500 hover:text-rose-700"
                    aria-label="Fermer"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* Content */}
          <section className="px-4 sm:px-6 py-6">
            {loading && pipelines.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl border border-line bg-surface-elevated/40 animate-pulse"
                  />
                ))}
              </div>
            ) : pipelines.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 mb-4">
                  <GitBranch size={28} className="text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-content-primary mb-1">Aucun pipeline</h2>
                <p className="text-sm text-content-secondary mb-6 max-w-md mx-auto">
                  Lance-toi avec le template Sales standard (Lead → Qualifié → Proposition → Négociation → Gagné/Perdu) ou pars sur un pipeline custom.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  {/* Quick win #5 : one-click sales template */}
                  <button
                    type="button"
                    onClick={handleQuickSalesTemplate}
                    disabled={quickTemplateLoading}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {quickTemplateLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    Créer mon 1er pipeline (Sales standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewModalOpen(true)}
                    disabled={quickTemplateLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-line bg-surface-card text-content-secondary hover:bg-surface-elevated text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Plus size={14} /> Pipeline custom
                  </button>
                </div>
                {quickTemplateToast && (
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                    <Check size={12} />
                    {quickTemplateToast}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pipelines.map((p) => (
                  <PipelineCard
                    key={p.id}
                    pipeline={p}
                    dealsCount={dealsCounts[p.id]}
                    onEdit={handleEdit}
                    onSetDefault={handleSetDefault}
                    onDelete={(target) => setDeleteTarget(target)}
                  />
                ))}
              </div>
            )}

            {/* Lien retour vers le Kanban */}
            {pipelines.length > 0 && (
              <div className="mt-8 text-center">
                <Link
                  href="/app/crm"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-600 transition"
                >
                  <KanbanSquare size={12} />
                  Retour au Kanban
                </Link>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Modals */}
      <NewPipelineModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onCreated={handleCreated}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Supprimer "${deleteTarget?.name || ''}"`}
        message={
          dealsCounts[deleteTarget?.id] > 0 ? (
            <>
              Ce pipeline contient{' '}
              <strong>{dealsCounts[deleteTarget?.id]} deal(s)</strong> qui seront réassignés
              au pipeline par défaut. Cette action est irréversible.
            </>
          ) : (
            'Cette action est irréversible.'
          )
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
