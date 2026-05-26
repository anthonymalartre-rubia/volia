'use client';

// ─────────────────────────────────────────────────────────────────────
// /app/crm/custom-fields — Gestion des champs personnalisés CRM.
// ─────────────────────────────────────────────────────────────────────
// 2 onglets : Contacts / Deals.
// Liste les fields actifs avec drag-drop reorder (HTML5 native).
// Actions : éditer, archiver. Soft delete uniquement.
// Bouton "+ Ajouter un champ" ouvre CustomFieldEditorModal.
// ─────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sliders,
  Plus,
  Users,
  KanbanSquare,
  Pencil,
  Trash2,
  GripVertical,
  Loader2,
  AlertCircle,
  X,
  Hash,
  Type,
  Calendar,
  ChevronDown,
  Check,
} from 'lucide-react';
import TopBar from '@/components/TopBar';
import CrmSidebar from '@/components/crm/CrmSidebar';
import CustomFieldEditorModal from '@/components/crm/CustomFieldEditorModal';
import { getSupabase } from '@/lib/supabase';

const BUSINESS_PLANS = ['business', 'enterprise'];

const TYPE_META = {
  text: { Icon: Type, label: 'Texte', color: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
  number: { Icon: Hash, label: 'Nombre', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  select: { Icon: ChevronDown, label: 'Liste', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  date: { Icon: Calendar, label: 'Date', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  boolean: { Icon: Check, label: 'Oui/Non', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function CustomFieldsPage() {
  const router = useRouter();

  // Auth
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [entity, setEntity] = useState('contact'); // 'contact' | 'deal'
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [archivingId, setArchivingId] = useState(null);

  // Drag-drop
  const [draggedId, setDraggedId] = useState(null);

  // ─── Auth ────────────────────────────────────────────────
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
      const userPlan = profile?.plan || 'free';
      if (!BUSINESS_PLANS.includes(userPlan)) {
        router.replace('/app/crm');
        return;
      }
      setAuthChecked(true);
    });
  }, [router]);

  // ─── Fetch ───────────────────────────────────────────────
  const fetchFields = useCallback(
    async (forEntity = entity) => {
      if (!authChecked) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/crm/custom-fields?entity=${forEntity}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erreur chargement');
        }
        setFields(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error('[CRM custom-fields] fetch error', err);
        setError(err.message || 'Erreur réseau');
      } finally {
        setLoading(false);
      }
    },
    [authChecked, entity]
  );

  useEffect(() => {
    if (authChecked) fetchFields(entity);
  }, [authChecked, entity, fetchFields]);

  // ─── Actions ─────────────────────────────────────────────
  function openCreate() {
    setEditingField(null);
    setEditorOpen(true);
  }
  function openEdit(field) {
    setEditingField(field);
    setEditorOpen(true);
  }

  function handleSaved(savedField) {
    if (!savedField) return;
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === savedField.id);
      if (idx === -1) {
        return [...prev, savedField].sort((a, b) => a.position - b.position);
      }
      const next = [...prev];
      next[idx] = savedField;
      return next;
    });
  }

  async function handleArchive(field) {
    if (!field || archivingId) return;
    if (!window.confirm(`Archiver le champ "${field.field_label}" ?\nLes valeurs déjà saisies sur les ${field.entity === 'deal' ? 'deals' : 'contacts'} ne seront pas supprimées.`)) {
      return;
    }
    setArchivingId(field.id);
    try {
      const res = await fetch(`/api/crm/custom-fields/${field.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur archivage');
        return;
      }
      setFields((prev) => prev.filter((f) => f.id !== field.id));
    } catch {
      setError('Erreur réseau');
    } finally {
      setArchivingId(null);
    }
  }

  // ─── Drag-drop reorder ──────────────────────────────────
  function onDragStart(id) {
    setDraggedId(id);
  }
  function onDragOver(e, overId) {
    e.preventDefault();
    if (!draggedId || draggedId === overId) return;
    setFields((prev) => {
      const from = prev.findIndex((f) => f.id === draggedId);
      const to = prev.findIndex((f) => f.id === overId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }
  async function onDragEnd() {
    if (!draggedId) return;
    setDraggedId(null);
    // Persiste l'ordre
    try {
      const ids = fields.map((f) => f.id);
      const res = await fetch('/api/crm/custom-fields/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur réordonnancement');
      }
    } catch {
      setError('Erreur réseau');
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse">
          <Sliders size={28} className="text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base text-content-primary flex flex-col">
      <TopBar user={user} onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="flex flex-1">
        <CrmSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="border-b border-line bg-surface-base sticky top-14 z-30">
            <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <Sliders size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-content-primary">
                    Champs personnalisés
                  </h1>
                  <p className="text-[11px] sm:text-xs text-content-tertiary">
                    Ajoutez vos propres champs (Source, Industrie, Date démo…) sur les contacts et deals.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all whitespace-nowrap"
              >
                <Plus size={14} />
                Ajouter un champ
              </button>
            </div>

            {/* Tabs Contact / Deal */}
            <div className="px-4 sm:px-6 pb-3">
              <div className="inline-flex items-center rounded-lg border border-line bg-surface-card p-0.5">
                <button
                  type="button"
                  onClick={() => setEntity('contact')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    entity === 'contact'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-content-tertiary hover:text-content-primary'
                  }`}
                >
                  <Users size={12} />
                  Contacts
                </button>
                <button
                  type="button"
                  onClick={() => setEntity('deal')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    entity === 'deal'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-content-tertiary hover:text-content-primary'
                  }`}
                >
                  <KanbanSquare size={12} />
                  Deals
                </button>
              </div>
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
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* Content */}
          <section className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-emerald-50/20 via-surface-base to-teal-50/10">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-emerald-600" />
              </div>
            ) : fields.length === 0 ? (
              <div className="max-w-md mx-auto text-center py-12">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 mb-4">
                  <Sliders size={24} className="text-emerald-600" />
                </div>
                <h2 className="text-base font-bold text-content-primary mb-1">
                  Aucun champ personnalisé sur les {entity === 'deal' ? 'deals' : 'contacts'}
                </h2>
                <p className="text-sm text-content-tertiary mb-5">
                  Ajoutez vos propres champs pour suivre l&apos;information qui vous est utile :
                  Source du lead, Industrie, Date dernière démo, Valeur estimée…
                </p>
                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Plus size={14} />
                  Créer mon premier champ
                </button>
              </div>
            ) : (
              <ul className="max-w-3xl mx-auto space-y-2">
                {fields.map((f) => {
                  const meta = TYPE_META[f.field_type] || TYPE_META.text;
                  const Icon = meta.Icon;
                  return (
                    <li
                      key={f.id}
                      draggable
                      onDragStart={() => onDragStart(f.id)}
                      onDragOver={(e) => onDragOver(e, f.id)}
                      onDragEnd={onDragEnd}
                      onDrop={(e) => e.preventDefault()}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl border bg-surface-base transition-all ${
                        draggedId === f.id
                          ? 'border-emerald-400 shadow-md opacity-60'
                          : 'border-line hover:border-emerald-200 hover:shadow-sm'
                      }`}
                    >
                      <button
                        type="button"
                        className="text-content-muted hover:text-content-primary cursor-grab active:cursor-grabbing"
                        aria-label="Réordonner"
                      >
                        <GripVertical size={14} />
                      </button>

                      <div className={`p-1.5 rounded-md border ${meta.color}`}>
                        <Icon size={14} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-content-primary truncate">
                            {f.field_label}
                          </span>
                          {f.required && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              Requis
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-content-tertiary">
                          <span className="font-mono">{f.field_key}</span>
                          <span>·</span>
                          <span>{meta.label}</span>
                          {f.field_type === 'select' && Array.isArray(f.field_options?.options) && (
                            <>
                              <span>·</span>
                              <span className="truncate">
                                {f.field_options.options.length} option
                                {f.field_options.options.length > 1 ? 's' : ''}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => openEdit(f)}
                          className="p-1.5 rounded-md text-content-tertiary hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Éditer"
                          aria-label="Éditer le champ"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArchive(f)}
                          disabled={archivingId === f.id}
                          className="p-1.5 rounded-md text-content-tertiary hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors"
                          title="Archiver"
                          aria-label="Archiver le champ"
                        >
                          {archivingId === f.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </main>
      </div>

      <CustomFieldEditorModal
        open={editorOpen}
        entity={entity}
        field={editingField}
        onClose={() => setEditorOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
