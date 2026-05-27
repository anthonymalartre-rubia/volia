'use client';

// ─────────────────────────────────────────────────────────────────────
// UpgradeCrmModal — modale upgrade quand l'user tente d'utiliser une
// feature CRM sans plan Business (notamment "Envoyer vers CRM" depuis
// la Prospection).
// ─────────────────────────────────────────────────────────────────────

import { X, Sparkles, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function UpgradeCrmModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-crm-title"
        className="relative w-full max-w-md rounded-2xl bg-surface-base border border-line shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200 overflow-hidden"
      >
        {/* Decorative gradient blob */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-to-br from-emerald-200/40 via-teal-100/30 to-transparent rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-content-tertiary hover:text-content-primary hover:bg-surface-elevated transition-colors"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        <div className="relative px-6 pt-8 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Lock size={26} className="text-white" />
            </div>
          </div>

          <h2
            id="upgrade-crm-title"
            className="text-xl font-bold text-content-primary text-center mb-2"
          >
            Volia CRM est réservé au Business
          </h2>
          <p className="text-sm text-content-secondary text-center mb-5 leading-relaxed">
            Poussez vos prospects qualifiés vers le CRM en 1 clic, suivez vos deals
            sur un Kanban, et gardez toute votre activité commerciale au même endroit.
          </p>

          <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 p-4 mb-5 text-center">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Sparkles size={10} />
              Plan Business
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-extrabold text-content-primary">149 €</span>
              <span className="text-content-tertiary text-sm">/mois</span>
            </div>
            <p className="text-[11px] text-content-tertiary mt-1">
              10 000 prospects · CRM complet · Support prioritaire
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium text-content-secondary hover:bg-surface-elevated transition-colors"
            >
              Plus tard
            </button>
            <Link
              href="/pricing"
              onClick={() => onClose?.()}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 transition-all"
            >
              Passer en Business
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
