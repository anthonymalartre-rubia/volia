'use client';

// ─────────────────────────────────────────────────────────────────────
// /app/crm — Volia CRM (Phase 2 : Kanban opérationnel)
// ─────────────────────────────────────────────────────────────────────
//
// Gating Business : seuls les plans 'business' et 'enterprise' (alias
// legacy) accèdent au Kanban. Les autres voient un upgrade CTA + la
// waitlist beta (héritée de la phase 1 du module).
//
// Architecture client :
//   1. Auth + plan check (Supabase browser) au mount.
//   2. Fetch pipelines (avec auto-création default), deals, contacts.
//   3. Render KanbanBoard + header + modals.
//   4. Optimistic updates sur drag-drop (revert si l'API échoue).
//
// Le Phase 2 reste mono-pipeline (le default). Le sélecteur multi-pipelines
// arrivera en Phase 3 avec la gestion des stages custom.
// ─────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  KanbanSquare, Plus, Loader2, AlertCircle, Sparkles, Lock,
  TrendingUp, Filter, Inbox,
} from 'lucide-react';
import TopBar from '@/components/TopBar';
import { getSupabase } from '@/lib/supabase';
import { formatDealValue, calculatePipelineStats } from '@/lib/crm';
import KanbanBoard from '@/components/crm/KanbanBoard';
import NewDealModal from '@/components/crm/NewDealModal';
import DealDetailDrawer from '@/components/crm/DealDetailDrawer';
import WaitlistForm from './WaitlistForm';

const BUSINESS_PLANS = ['business', 'enterprise'];

export default function CrmAppPage() {
  const router = useRouter();

  // ─── Auth + plan ──────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ─── Data ────────────────────────────────────────────────
  const [pipeline, setPipeline] = useState(null);
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  // ─── UI state ────────────────────────────────────────────
  const [newDealOpen, setNewDealOpen] = useState(false);
  const [newDealStageId, setNewDealStageId] = useState(null);
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'won' | 'lost'

  // ───────────────────────────────────────────────────────────
  // 1. Auth + plan resolution
  // ───────────────────────────────────────────────────────────
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
      // Fetch plan
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

  // ───────────────────────────────────────────────────────────
  // 2. Fetch pipelines + deals + contacts (si plan OK)
  // ───────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!hasBusinessAccess) return;
    setDataLoading(true);
    setDataError('');
    try {
      // Pipelines (auto-création default)
      const pipeRes = await fetch('/api/crm/pipelines');
      const pipeData = await pipeRes.json();
      if (!pipeRes.ok) throw new Error(pipeData.error || 'Erreur pipelines');
      const defaultPipeline = pipeData.data?.find((p) => p.is_default) || pipeData.data?.[0];
      if (!defaultPipeline) throw new Error('Aucun pipeline trouvé');
      setPipeline(defaultPipeline);

      // Deals + contacts en parallèle
      const [dealsRes, contactsRes] = await Promise.all([
        fetch(`/api/crm/deals?pipeline_id=${defaultPipeline.id}`),
        fetch('/api/crm/contacts?limit=100'),
      ]);
      const dealsData = await dealsRes.json();
      const contactsData = await contactsRes.json();
      if (!dealsRes.ok) throw new Error(dealsData.error || 'Erreur deals');
      if (!contactsRes.ok) throw new Error(contactsData.error || 'Erreur contacts');

      setDeals(dealsData.data || []);
      setContacts(contactsData.data || []);
    } catch (err) {
      console.error('[CRM] fetchData error', err);
      setDataError(err.message || 'Erreur chargement');
    } finally {
      setDataLoading(false);
    }
  }, [hasBusinessAccess]);

  useEffect(() => {
    if (authChecked && hasBusinessAccess) {
      fetchData();
    }
  }, [authChecked, hasBusinessAccess, fetchData]);

  // ───────────────────────────────────────────────────────────
  // 3. Drag-drop : optimistic update
  // ───────────────────────────────────────────────────────────
  async function handleDealMove(dealId, newStageId, position) {
    if (!pipeline) return;
    const targetStage = pipeline.stages.find((s) => s.id === newStageId);
    if (!targetStage) return;

    // Snapshot pour rollback
    const snapshot = [...deals];

    // Calcul du nouveau status si closing stage
    let newStatus = 'open';
    let closedAt = null;
    if (targetStage.closing_type === 'won') {
      newStatus = 'won';
      closedAt = new Date().toISOString();
    } else if (targetStage.closing_type === 'lost') {
      newStatus = 'lost';
      closedAt = new Date().toISOString();
    }

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? {
              ...d,
              stage_id: newStageId,
              position,
              status: newStatus,
              closed_at: closedAt,
              stage: targetStage,
            }
          : d
      )
    );

    try {
      const res = await fetch(`/api/crm/deals/${dealId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage_id: newStageId, position }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('[CRM] move failed', data);
        setDataError(data.error || 'Erreur déplacement');
        setDeals(snapshot);
        return;
      }
      // Resync avec la version server (au cas où le server a normalisé qqch)
      setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, ...data.data } : d)));
    } catch (err) {
      console.error('[CRM] move error', err);
      setDataError('Erreur réseau');
      setDeals(snapshot);
    }
  }

  // ───────────────────────────────────────────────────────────
  // 4. Callbacks NewDeal / Detail
  // ───────────────────────────────────────────────────────────
  function handleNewDeal(stageId = null) {
    setNewDealStageId(stageId);
    setNewDealOpen(true);
  }

  function handleDealCreated(newDeal) {
    setDeals((prev) => [newDeal, ...prev]);
  }

  function handleDealUpdated(updatedDeal) {
    setDeals((prev) => prev.map((d) => (d.id === updatedDeal.id ? { ...d, ...updatedDeal } : d)));
  }

  function handleDealDeleted(dealId) {
    setDeals((prev) => prev.filter((d) => d.id !== dealId));
  }

  // ───────────────────────────────────────────────────────────
  // 5. Filtered deals
  // ───────────────────────────────────────────────────────────
  const filteredDeals = useMemo(() => {
    if (statusFilter === 'all') return deals;
    return deals.filter((d) => d.status === statusFilter);
  }, [deals, statusFilter]);

  // ───────────────────────────────────────────────────────────
  // 6. Stats (sur tous les deals open, pas le filtre)
  // ───────────────────────────────────────────────────────────
  const stats = useMemo(() => calculatePipelineStats(deals), [deals]);

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────

  // Loading auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse">
          <KanbanSquare size={28} className="text-white" />
        </div>
      </div>
    );
  }

  // ── BRANCHE 1 : pas le bon plan → upgrade CTA + waitlist ─────────
  if (!hasBusinessAccess) {
    return (
      <div className="min-h-screen bg-surface-base text-content-primary">
        <TopBar user={user} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="relative overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-br from-emerald-200/30 via-teal-100/20 to-green-100/10 rounded-full blur-3xl pointer-events-none -z-0"
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 mb-6">
                <Lock size={32} className="text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent mb-4">
                Volia CRM
              </h1>
              <p className="text-base sm:text-lg text-content-secondary leading-relaxed max-w-xl mx-auto mb-2">
                Le module CRM est réservé au plan{' '}
                <strong className="text-content-primary">Business</strong>.
              </p>
              <p className="text-sm text-content-tertiary">
                Pipeline Kanban, contacts auto-créés depuis Campagnes, reporting natif.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-surface-base to-teal-50 p-8 sm:p-10 text-center shadow-xl shadow-emerald-500/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles size={11} />
                Plan Business
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-content-primary">
                Passer en Business
              </h2>
              <p className="text-content-secondary text-sm sm:text-base mb-2">
                <span className="text-3xl font-extrabold text-content-primary">99 €</span>
                <span className="text-content-tertiary"> /mois</span>
              </p>
              <p className="text-xs text-content-tertiary mb-6">
                10 000 prospects/mois · CRM complet · Support prioritaire
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Voir le plan Business
              </Link>
            </div>

            <div className="mt-10">
              <div className="text-center mb-4">
                <p className="text-xs text-content-tertiary uppercase tracking-wider font-semibold">
                  Ou rejoindre la waitlist beta
                </p>
              </div>
              <WaitlistForm />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── BRANCHE 2 : Business plan → Kanban opérationnel ──────────────
  return (
    <div className="min-h-screen bg-surface-base text-content-primary flex flex-col">
      <TopBar user={user} onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ─── Pipeline header ──────────────────────────────────── */}
        <header className="border-b border-line bg-surface-base sticky top-14 z-30">
          <div className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <KanbanSquare size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-content-primary truncate">
                  {pipeline?.name || 'Pipeline commercial'}
                </h1>
                <div className="flex items-center gap-3 text-[11px] sm:text-xs text-content-tertiary mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Inbox size={11} />
                    <span className="tabular-nums font-semibold text-content-secondary">
                      {stats.openCount}
                    </span>
                    <span>deals ouverts</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <TrendingUp size={11} className="text-emerald-600" />
                    <span className="tabular-nums font-semibold text-content-secondary">
                      {formatDealValue(stats.totalOpenValue)}
                    </span>
                  </span>
                  {stats.wonCount > 0 && (
                    <span className="hidden md:inline-flex items-center gap-1 text-emerald-700">
                      <span className="tabular-nums font-semibold">{stats.wonCount}</span>
                      <span>gagnés</span>
                      <span className="tabular-nums font-semibold">
                        ({formatDealValue(stats.totalWonValue)})
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Status filter */}
              <div className="inline-flex items-center rounded-lg border border-line bg-surface-card p-0.5">
                {[
                  { value: 'all', label: 'Tous' },
                  { value: 'open', label: 'Ouverts' },
                  { value: 'won', label: 'Gagnés' },
                  { value: 'lost', label: 'Perdus' },
                ].map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setStatusFilter(f.value)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      statusFilter === f.value
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-content-tertiary hover:text-content-primary'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleNewDeal(null)}
                disabled={!pipeline}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Nouveau deal</span>
                <span className="sm:hidden">Deal</span>
              </button>
            </div>
          </div>

          {/* Error banner */}
          {dataError && (
            <div className="px-4 sm:px-6 pb-3">
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium flex-1">{dataError}</p>
                <button
                  type="button"
                  onClick={() => setDataError('')}
                  className="text-rose-500 hover:text-rose-700"
                  aria-label="Fermer"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </header>

        {/* ─── Kanban content ──────────────────────────────────── */}
        <section className="flex-1 px-3 sm:px-5 py-4 bg-gradient-to-br from-emerald-50/30 via-surface-base to-teal-50/20 overflow-hidden">
          {dataLoading && !pipeline ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-emerald-600" />
            </div>
          ) : !pipeline ? (
            <div className="text-center py-20 text-content-tertiary">
              <p className="text-sm">Aucun pipeline trouvé. Rechargez la page.</p>
            </div>
          ) : deals.length === 0 ? (
            // ─── EMPTY STATE (aucun deal du tout) ──────────────
            <div className="max-w-md mx-auto py-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 mb-5">
                <KanbanSquare size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-content-primary mb-2">
                Démarrons votre pipeline
              </h2>
              <p className="text-sm text-content-secondary mb-6">
                Créez votre premier deal pour suivre vos opportunités commerciales
                de bout en bout : du lead qualifié au closing.
              </p>
              <button
                type="button"
                onClick={() => handleNewDeal(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <Plus size={16} />
                Créer mon premier deal
              </button>
              <p className="text-[11px] text-content-tertiary mt-4">
                Astuce : drag-drop pour faire avancer vos deals d'une étape à l'autre.
              </p>
            </div>
          ) : (
            <KanbanBoard
              pipeline={pipeline}
              deals={filteredDeals}
              onDealMove={handleDealMove}
              onDealClick={(d) => setSelectedDealId(d.id)}
              onNewDeal={handleNewDeal}
            />
          )}
        </section>
      </main>

      {/* Modals */}
      <NewDealModal
        open={newDealOpen}
        onClose={() => setNewDealOpen(false)}
        onCreated={handleDealCreated}
        pipelineId={pipeline?.id}
        defaultStageId={newDealStageId || pipeline?.stages?.[0]?.id}
        stages={pipeline?.stages || []}
        contacts={contacts}
      />

      <DealDetailDrawer
        dealId={selectedDealId}
        stages={pipeline?.stages || []}
        onClose={() => setSelectedDealId(null)}
        onUpdate={handleDealUpdated}
        onDelete={handleDealDeleted}
      />
    </div>
  );
}
