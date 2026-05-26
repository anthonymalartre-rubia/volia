'use client';

// ─────────────────────────────────────────────────────────────────────
// /app/crm/pipelines/[id] — Édition d'un pipeline custom.
// ─────────────────────────────────────────────────────────────────────
// Permet de :
//   - Modifier nom / description / couleur du pipeline
//   - Ajouter / supprimer / renommer / réordonner les stages (drag-drop)
//   - Set probability + closing_type par stage
//   - Supprimer le pipeline (si pas default)
//
// Drag-drop : HTML5 natif (avec touch fallback simple via boutons ↑↓).
// ─────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, GitBranch, Plus, Trash2, AlertCircle, Loader2,
  GripVertical, Save, ChevronUp, ChevronDown, Lock, Sparkles,
  CheckCircle2, XCircle, MinusCircle,
} from 'lucide-react';
import TopBar from '@/components/TopBar';
import { getSupabase } from '@/lib/supabase';
import CrmSidebar from '@/components/crm/CrmSidebar';
import { ConfirmModal } from '@/components/ui';
import { PIPELINE_COLORS, STAGE_PROBABILITIES } from '@/lib/crm';

const BUSINESS_PLANS = ['business', 'enterprise'];

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

const CLOSING_OPTIONS = [
  { value: 'none', label: 'Aucun', icon: MinusCircle, className: 'text-zinc-600' },
  { value: 'won', label: 'Gagné', icon: CheckCircle2, className: 'text-emerald-600' },
  { value: 'lost', label: 'Perdu', icon: XCircle, className: 'text-rose-600' },
];

// ─── StageRow ───────────────────────────────────────────────
function StageRow({
  stage,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDraggedOver,
  saving,
}) {
  const closing = stage.closing_type || 'none';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, stage.id)}
      onDragOver={(e) => onDragOver(e, stage.id)}
      onDrop={(e) => onDrop(e, stage.id)}
      onDragEnd={onDragEnd}
      className={`group rounded-xl border bg-surface-card transition-all ${
        isDraggedOver ? 'border-emerald-500 ring-2 ring-emerald-500/20 -translate-y-0.5' : 'border-line hover:border-emerald-200'
      }`}
    >
      <div className="flex items-stretch">
        {/* Drag handle + reorder buttons mobile */}
        <div className="flex flex-col items-center gap-0.5 px-2 py-3 border-r border-line bg-surface-elevated/30 rounded-l-xl text-content-tertiary">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0 || saving}
            className="p-0.5 rounded hover:bg-emerald-100 hover:text-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Monter"
          >
            <ChevronUp size={12} />
          </button>
          <GripVertical size={12} className="cursor-grab active:cursor-grabbing" />
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1 || saving}
            className="p-0.5 rounded hover:bg-emerald-100 hover:text-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Descendre"
          >
            <ChevronDown size={12} />
          </button>
        </div>

        {/* Form fields */}
        <div className="flex-1 p-3 space-y-2.5">
          {/* Row 1 : nom + delete */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={stage.name || ''}
              onChange={(e) => onUpdate(stage.id, { name: e.target.value })}
              placeholder="Nom du stage"
              maxLength={80}
              disabled={saving}
              className="flex-1 px-2.5 py-1.5 rounded-lg border border-line bg-surface-base text-sm font-medium text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            />
            <button
              type="button"
              onClick={() => onDelete(stage)}
              disabled={total <= 1 || saving}
              className="p-1.5 rounded-lg text-content-tertiary hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Supprimer ce stage"
              title={total <= 1 ? 'Impossible de supprimer le dernier stage' : 'Supprimer'}
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Row 2 : color + probability + closing_type */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Color picker */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-content-tertiary mr-1">
                Couleur
              </span>
              {PIPELINE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onUpdate(stage.id, { color: c })}
                  disabled={saving}
                  className={`w-5 h-5 rounded-full ${COLOR_DOT[c]} transition-all ${
                    stage.color === c
                      ? 'ring-2 ring-offset-1 ring-emerald-500 scale-110'
                      : 'hover:scale-110 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Couleur ${c}`}
                />
              ))}
            </div>

            <div className="w-px h-5 bg-line hidden sm:block" />

            {/* Probability */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-content-tertiary mr-1">
                Probabilité
              </span>
              <select
                value={stage.probability ?? 0}
                onChange={(e) => onUpdate(stage.id, { probability: parseInt(e.target.value, 10) })}
                disabled={saving}
                className="px-2 py-1 rounded-md border border-line bg-surface-base text-xs font-medium text-content-primary focus:outline-none focus:border-emerald-500 transition"
              >
                {STAGE_PROBABILITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}%
                  </option>
                ))}
              </select>
            </div>

            <div className="w-px h-5 bg-line hidden sm:block" />

            {/* Closing type */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-content-tertiary mr-1">
                Closing
              </span>
              <div className="inline-flex rounded-md border border-line bg-surface-base p-0.5">
                {CLOSING_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = closing === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        onUpdate(stage.id, {
                          closing_type: opt.value === 'none' ? null : opt.value,
                        })
                      }
                      disabled={saving}
                      title={opt.label}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                        isActive
                          ? opt.value === 'won'
                            ? 'bg-emerald-100 text-emerald-700'
                            : opt.value === 'lost'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-zinc-100 text-zinc-700'
                          : 'text-content-tertiary hover:text-content-primary'
                      }`}
                    >
                      <Icon size={10} />
                      <span className="hidden sm:inline">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function PipelineDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pipelineId = params?.id;

  // Auth
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [pipeline, setPipeline] = useState(null);
  const [stages, setStages] = useState([]); // local state, peut différer de pipeline.stages
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('emerald');
  const [savingPipeline, setSavingPipeline] = useState(false);

  // Stage saves (per-id)
  const [savingStageIds, setSavingStageIds] = useState(new Set());
  const [savingReorder, setSavingReorder] = useState(false);
  const [addingStage, setAddingStage] = useState(false);
  const stageDirty = useRef({}); // { stageId: patch }
  const debounceTimers = useRef({}); // { stageId: timeout }

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingPipeline, setDeletingPipeline] = useState(false);
  const [deleteStageTarget, setDeleteStageTarget] = useState(null);
  const [deletingStage, setDeletingStage] = useState(false);

  // Drag-drop
  const [draggedStageId, setDraggedStageId] = useState(null);
  const [dragOverStageId, setDragOverStageId] = useState(null);

  // Auth
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

  // Fetch pipeline detail
  const fetchPipeline = useCallback(async () => {
    if (!pipelineId || !hasBusinessAccess) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/crm/pipelines/${pipelineId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur chargement');
      const p = json.data;
      setPipeline(p);
      setName(p.name || '');
      setDescription(p.description || '');
      setColor(p.color || 'emerald');
      setStages([...(p.stages || [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
    } catch (err) {
      console.error('[CRM/pipelines/[id]] fetch error', err);
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [pipelineId, hasBusinessAccess]);

  useEffect(() => {
    if (authChecked && hasBusinessAccess) fetchPipeline();
  }, [authChecked, hasBusinessAccess, fetchPipeline]);

  // ─── Save pipeline info (nom, description, color) ───────
  async function handleSavePipeline() {
    if (!pipeline) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Le nom est requis');
      return;
    }
    setSavingPipeline(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch(`/api/crm/pipelines/${pipeline.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          description: description.trim() || null,
          color,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      setPipeline(json.data);
      setNotice('Pipeline enregistré');
      setTimeout(() => setNotice(''), 2500);
    } catch (err) {
      console.error('[CRM/pipelines/[id]] save error', err);
      setError(err.message || 'Erreur');
    } finally {
      setSavingPipeline(false);
    }
  }

  // ─── Update stage (local + debounced save) ──────────────
  function handleStageUpdate(stageId, patch) {
    // Update local
    setStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, ...patch } : s)));

    // Accumule patch dirty
    stageDirty.current[stageId] = { ...(stageDirty.current[stageId] || {}), ...patch };

    // Debounce 500ms
    if (debounceTimers.current[stageId]) {
      clearTimeout(debounceTimers.current[stageId]);
    }
    debounceTimers.current[stageId] = setTimeout(() => {
      flushStageSave(stageId);
    }, 500);
  }

  async function flushStageSave(stageId) {
    const patch = stageDirty.current[stageId];
    if (!patch) return;
    stageDirty.current[stageId] = null;

    setSavingStageIds((prev) => new Set([...prev, stageId]));
    try {
      const res = await fetch(`/api/crm/stages/${stageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur sauvegarde stage');
    } catch (err) {
      console.error('[CRM/pipelines/[id]] stage save error', err);
      setError(err.message || 'Erreur sauvegarde stage');
    } finally {
      setSavingStageIds((prev) => {
        const next = new Set(prev);
        next.delete(stageId);
        return next;
      });
    }
  }

  // ─── Add stage ──────────────────────────────────────────
  async function handleAddStage() {
    if (!pipeline) return;
    setAddingStage(true);
    setError('');
    try {
      const res = await fetch(`/api/crm/pipelines/${pipeline.id}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Nouveau stage ${stages.length + 1}`,
          color: 'zinc',
          probability: 25,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      setStages((prev) => [...prev, json.data]);
    } catch (err) {
      console.error('[CRM/pipelines/[id]] add stage error', err);
      setError(err.message || 'Erreur');
    } finally {
      setAddingStage(false);
    }
  }

  // ─── Delete stage ───────────────────────────────────────
  async function handleConfirmDeleteStage() {
    if (!deleteStageTarget) return;
    setDeletingStage(true);
    try {
      const res = await fetch(`/api/crm/stages/${deleteStageTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      setStages((prev) => prev.filter((s) => s.id !== deleteStageTarget.id));
      setDeleteStageTarget(null);
    } catch (err) {
      console.error('[CRM/pipelines/[id]] delete stage error', err);
      setError(err.message || 'Erreur');
    } finally {
      setDeletingStage(false);
    }
  }

  // ─── Reorder (drag-drop + buttons) ──────────────────────
  async function persistReorder(newOrder) {
    if (!pipeline) return;
    setSavingReorder(true);
    try {
      const res = await fetch(`/api/crm/pipelines/${pipeline.id}/reorder-stages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage_ids: newOrder.map((s) => s.id) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur réordonnancement');
    } catch (err) {
      console.error('[CRM/pipelines/[id]] reorder error', err);
      setError(err.message || 'Erreur');
      // Re-fetch pour réaligner avec le serveur
      fetchPipeline();
    } finally {
      setSavingReorder(false);
    }
  }

  function moveStage(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= stages.length || fromIndex === toIndex) return;
    setStages((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      // Mise à jour positions
      const reordered = next.map((s, i) => ({ ...s, position: i }));
      persistReorder(reordered);
      return reordered;
    });
  }

  function handleMoveUp(index) {
    moveStage(index, index - 1);
  }
  function handleMoveDown(index) {
    moveStage(index, index + 1);
  }

  function handleDragStart(e, stageId) {
    setDraggedStageId(stageId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', stageId);
  }
  function handleDragOver(e, stageId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (stageId !== dragOverStageId) setDragOverStageId(stageId);
  }
  function handleDrop(e, targetStageId) {
    e.preventDefault();
    setDragOverStageId(null);
    if (!draggedStageId || draggedStageId === targetStageId) return;
    const fromIndex = stages.findIndex((s) => s.id === draggedStageId);
    const toIndex = stages.findIndex((s) => s.id === targetStageId);
    if (fromIndex === -1 || toIndex === -1) return;
    moveStage(fromIndex, toIndex);
    setDraggedStageId(null);
  }
  function handleDragEnd() {
    setDraggedStageId(null);
    setDragOverStageId(null);
  }

  // ─── Delete pipeline ────────────────────────────────────
  async function handleConfirmDeletePipeline() {
    if (!pipeline) return;
    setDeletingPipeline(true);
    try {
      const res = await fetch(`/api/crm/pipelines/${pipeline.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      router.push('/app/crm/pipelines');
    } catch (err) {
      console.error('[CRM/pipelines/[id]] delete pipeline error', err);
      setError(err.message || 'Erreur');
      setDeletingPipeline(false);
    }
  }

  // ─── RENDER ─────────────────────────────────────────────
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse">
          <GitBranch size={28} className="text-white" />
        </div>
      </div>
    );
  }

  if (!hasBusinessAccess) {
    return (
      <div className="min-h-screen bg-surface-base text-content-primary">
        <TopBar user={user} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Pipeline</h1>
          <p className="text-content-secondary mb-8">Réservé au plan Business.</p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg"
          >
            <Sparkles size={16} /> Voir le plan Business
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base text-content-primary flex flex-col">
      <TopBar user={user} onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="flex flex-1 overflow-hidden">
        <CrmSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="border-b border-line bg-surface-base sticky top-14 z-30">
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-center gap-2 mb-3 text-xs text-content-tertiary">
                <Link
                  href="/app/crm/pipelines"
                  className="inline-flex items-center gap-1 hover:text-emerald-700 transition"
                >
                  <ArrowLeft size={12} />
                  Tous les pipelines
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl ${COLOR_DOT[color] || COLOR_DOT.violet} flex items-center justify-center flex-shrink-0`}>
                    <GitBranch size={20} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold text-content-primary truncate">
                      {pipeline?.name || 'Pipeline'}
                    </h1>
                    <p className="text-xs text-content-tertiary">
                      {stages.length} stages · {pipeline?.is_default ? 'Pipeline par défaut' : 'Pipeline custom'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {savingReorder && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-content-tertiary">
                      <Loader2 size={11} className="animate-spin" />
                      Sauvegarde…
                    </span>
                  )}
                  {notice && (
                    <span className="text-[11px] text-emerald-700 font-medium">{notice}</span>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
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
              )}
            </div>
          </header>

          {/* Content */}
          <section className="px-4 sm:px-6 py-6 max-w-4xl mx-auto space-y-6">
            {loading ? (
              <div className="space-y-3">
                <div className="h-32 rounded-2xl border border-line bg-surface-elevated/40 animate-pulse" />
                <div className="h-20 rounded-xl border border-line bg-surface-elevated/40 animate-pulse" />
                <div className="h-20 rounded-xl border border-line bg-surface-elevated/40 animate-pulse" />
                <div className="h-20 rounded-xl border border-line bg-surface-elevated/40 animate-pulse" />
              </div>
            ) : !pipeline ? (
              <div className="text-center py-20 text-content-tertiary">
                <p>Pipeline introuvable.</p>
              </div>
            ) : (
              <>
                {/* ─── Pipeline info card ───────────────── */}
                <div className="rounded-2xl border border-line bg-surface-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-content-primary uppercase tracking-wider">
                      Informations
                    </h2>
                    <button
                      type="button"
                      onClick={handleSavePipeline}
                      disabled={savingPipeline}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm transition disabled:opacity-50"
                    >
                      {savingPipeline ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Save size={12} />
                      )}
                      Enregistrer
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-content-secondary mb-1.5 uppercase tracking-wider">
                      Nom <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={120}
                      className="w-full px-3 py-2 rounded-lg border border-line bg-surface-base text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-content-secondary mb-1.5 uppercase tracking-wider">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={500}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-line bg-surface-base text-sm resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-content-secondary mb-2 uppercase tracking-wider">
                      Couleur
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PIPELINE_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            color === c ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'hover:scale-105'
                          }`}
                          aria-label={`Couleur ${c}`}
                        >
                          <span className={`w-4 h-4 rounded-full ${COLOR_DOT[c]}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ─── Stages list ───────────────────────── */}
                <div className="rounded-2xl border border-line bg-surface-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-bold text-content-primary uppercase tracking-wider">
                        Stages
                      </h2>
                      <p className="text-[11px] text-content-tertiary mt-0.5">
                        Drag-drop ou flèches pour réordonner. Modifications enregistrées automatiquement.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddStage}
                      disabled={addingStage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition disabled:opacity-50"
                    >
                      {addingStage ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                      Ajouter
                    </button>
                  </div>

                  <div className="space-y-2">
                    {stages.map((stage, idx) => (
                      <StageRow
                        key={stage.id}
                        stage={stage}
                        index={idx}
                        total={stages.length}
                        saving={savingStageIds.has(stage.id) || savingReorder}
                        onUpdate={handleStageUpdate}
                        onDelete={(s) => setDeleteStageTarget(s)}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                        isDraggedOver={dragOverStageId === stage.id}
                      />
                    ))}
                    {stages.length === 0 && (
                      <p className="text-center py-8 text-sm text-content-tertiary">
                        Aucun stage. Cliquez sur Ajouter pour démarrer.
                      </p>
                    )}
                  </div>
                </div>

                {/* ─── Danger zone ──────────────────────── */}
                {!pipeline.is_default && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
                    <h2 className="text-sm font-bold text-rose-700 uppercase tracking-wider mb-2">
                      Zone dangereuse
                    </h2>
                    <p className="text-xs text-rose-700/80 mb-3">
                      La suppression du pipeline est irréversible. Les deals associés seront réassignés au pipeline par défaut.
                    </p>
                    <button
                      type="button"
                      onClick={() => setDeleteOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition"
                    >
                      <Trash2 size={12} />
                      Supprimer ce pipeline
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>

      {/* Confirms */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => !deletingPipeline && setDeleteOpen(false)}
        onConfirm={handleConfirmDeletePipeline}
        title={`Supprimer "${pipeline?.name || ''}"`}
        message="Cette action est irréversible. Les deals associés seront réassignés au pipeline par défaut."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        loading={deletingPipeline}
      />

      <ConfirmModal
        open={!!deleteStageTarget}
        onClose={() => !deletingStage && setDeleteStageTarget(null)}
        onConfirm={handleConfirmDeleteStage}
        title={`Supprimer "${deleteStageTarget?.name || ''}"`}
        message="Les deals de ce stage seront déplacés vers le premier stage restant du pipeline."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        loading={deletingStage}
      />
    </div>
  );
}
