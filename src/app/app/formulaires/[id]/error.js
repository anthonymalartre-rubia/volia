'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCcw, ArrowLeft } from 'lucide-react';

export default function FormBuilderError({ error, reset }) {
  useEffect(() => {
    console.error('[admin/forms/[id]] error boundary caught', error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-100 text-rose-600 mb-4">
          <AlertCircle size={22} />
        </div>
        <h1 className="text-lg font-bold text-content-primary mb-2">
          Le builder n&apos;a pas pu être chargé
        </h1>
        <p className="text-xs text-content-tertiary mb-4">
          Vos données sont sauvegardées (auto-save toutes les 2 sec). Réessayez
          ou revenez à la liste de vos formulaires.
        </p>
        {error?.message && (
          <p className="mt-2 mb-4 text-[11px] font-mono text-rose-700 bg-white/60 inline-block px-2 py-1 rounded border border-rose-200">
            {String(error.message).slice(0, 200)}
          </p>
        )}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium transition-colors"
          >
            <RefreshCcw size={12} /> Réessayer
          </button>
          <Link
            href="/app/formulaires"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-line hover:bg-surface-elevated text-xs font-medium text-content-primary transition-colors"
          >
            <ArrowLeft size={12} /> Liste des forms
          </Link>
        </div>
      </div>
    </div>
  );
}
