'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCcw, ArrowLeft } from 'lucide-react';

export default function FormsStatsError({ error, reset }) {
  useEffect(() => {
    console.error('[admin/forms/stats] error', error);
  }, [error]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-100 text-rose-600 mb-4">
          <AlertCircle size={22} />
        </div>
        <h1 className="text-lg font-bold text-content-primary mb-2">
          Impossible de charger les statistiques
        </h1>
        <p className="text-xs text-content-tertiary mb-4">
          Réessayez dans quelques secondes — vos données ne sont pas affectées.
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium transition-colors"
          >
            <RefreshCcw size={12} /> Réessayer
          </button>
          <Link
            href="/admin/forms"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-line hover:bg-surface-elevated text-xs font-medium text-content-primary transition-colors"
          >
            <ArrowLeft size={12} /> Mes formulaires
          </Link>
        </div>
      </div>
    </div>
  );
}
