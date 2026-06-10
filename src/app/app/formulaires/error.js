'use client';

// ─────────────────────────────────────────────────────────────────
// /app/formulaires — Error boundary (Sprint F7)
// ─────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function FormsHubError({ error, reset }) {
  useEffect(() => {
    console.error('[admin/forms] error boundary caught', error);
  }, [error]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-100 text-rose-600 mb-4">
          <AlertCircle size={22} />
        </div>
        <h1 className="text-xl font-bold text-content-primary mb-2">
          Quelque chose s&apos;est mal passé
        </h1>
        <p className="text-sm text-content-tertiary mb-1 max-w-md mx-auto">
          Le module Formulaires a rencontré une erreur. Pas de panique — vos
          données sont en sécurité, c&apos;est juste l&apos;affichage qui a
          flanché.
        </p>
        {error?.message && (
          <p className="mt-2 text-[11px] font-mono text-rose-700 bg-white/60 inline-block px-2 py-1 rounded border border-rose-200">
            {String(error.message).slice(0, 200)}
          </p>
        )}
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm font-medium shadow-lg shadow-pink-500/20 transition-all"
        >
          <RefreshCcw size={14} /> Réessayer
        </button>
      </div>
    </div>
  );
}
