'use client';

// ─────────────────────────────────────────────────────────────────────
// /app/formulaires/stats — Dashboard stats global du module (Sprint F7)
// ─────────────────────────────────────────────────────────────────────
// Fetch /api/admin/forms/stats puis affiche :
//   - 4 KPI cards (views, submits, conv rate, bridges health)
//   - Bridge breakdown détaillé
//   - Courbe submissions 30 jours
//   - Top 5 forms (triable submissions vs conv rate)
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, ArrowLeft, Loader2, Sparkles, FileText } from 'lucide-react';
import StatsCards from '@/components/forms/stats/StatsCards';
import SubmissionsChart from '@/components/forms/stats/SubmissionsChart';
import TopFormsTable from '@/components/forms/stats/TopFormsTable';

export default function FormsStatsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/forms/stats');
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || 'Erreur de chargement');
        } else {
          setData(json);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const noForms = !loading && data && (data.totals?.forms_count || 0) === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link
        href="/app/formulaires"
        className="inline-flex items-center gap-1.5 text-xs text-content-tertiary hover:text-pink-700 transition-colors mb-4"
      >
        <ArrowLeft size={14} /> Mes formulaires
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={14} className="text-pink-600" />
          <p className="text-[11px] uppercase tracking-wider font-semibold text-pink-700">
            Analytics · Sprint F7
          </p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-content-primary tracking-tight">
          Statistiques
        </h1>
        <p className="mt-2 text-content-tertiary text-sm sm:text-base max-w-2xl">
          Vue d&apos;ensemble de vos formulaires : vues, conversions, santé des
          bridges CRM et Campagnes.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-line bg-surface-card p-10 text-center">
          <Loader2 size={20} className="mx-auto text-pink-600 animate-spin mb-2" />
          <p className="text-sm text-content-tertiary">Chargement des stats…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 p-4 mb-4">
          {error}
        </div>
      )}

      {/* Empty state — pas de form */}
      {noForms && (
        <div className="rounded-2xl border border-dashed border-line bg-surface-card/50 p-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-pink-100 text-pink-600 mb-4">
            <FileText size={22} />
          </div>
          <h3 className="text-lg font-semibold text-content-primary">
            Pas encore de stats.
          </h3>
          <p className="mt-1 text-sm text-content-tertiary max-w-md mx-auto">
            Crée ton premier form. Les vues, soumissions et conversion s&apos;afficheront ici.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Link
              href="/app/formulaires/templates"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm font-medium shadow-lg shadow-pink-500/20 transition-all"
            >
              <Sparkles size={14} /> Créer ton premier form
            </Link>
            <Link
              href="/app/formulaires"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-card border border-line hover:border-pink-200 text-content-primary text-sm font-medium transition-all"
            >
              Voir mes formulaires
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      {!loading && !error && data && !noForms && (
        <div className="space-y-4">
          <StatsCards totals={data.totals} bridgesHealth={data.bridges_health} />

          <SubmissionsChart data={data.submissions_by_day} />

          <TopFormsTable
            topBySubmissions={data.top_by_submissions}
            topByConversion={data.top_by_conversion}
          />
        </div>
      )}
    </div>
  );
}
