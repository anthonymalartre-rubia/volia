'use client';

// ConfirmModal primitive partagée — remplace les confirm() natifs.
//
// Avant : if (!confirm('...')) return → bloque le thread JS, pas
// accessible, pas brandé, design système OS.
//
// Après : modale centrée, branded Volia, accessible (escape, focus,
// aria), animation slide-in, variantes default/danger.
//
// Pattern visuel calqué sur LimitReachedModal.jsx et SendToCampagneModal.jsx
// pour la cohérence du module.

import { useEffect, useRef } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

/**
 * ConfirmModal
 *
 * Props :
 * - open          : bool — pilote l'affichage
 * - onClose       : () => void
 * - onConfirm     : () => void | Promise<void>
 * - title         : string
 * - message?      : string | ReactNode
 * - confirmLabel? : string (default 'Confirmer')
 * - cancelLabel?  : string (default 'Annuler')
 * - variant?      : 'default' | 'danger' (default 'default')
 * - loading?      : bool — désactive les boutons + bloque escape
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'default',
  loading = false,
}) {
  const confirmRef = useRef(null);

  // Escape pour fermer (bloqué si loading) + lock body scroll
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    // Focus le bouton de confirmation par défaut (a11y)
    confirmRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const isDanger = variant === 'danger';

  const confirmClasses = isDanger
    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20'
    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20';

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => !loading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-surface-card border border-line shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-elevated transition disabled:opacity-50"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>

        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start gap-3">
            {isDanger && (
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
            )}
            <div className="flex-1 min-w-0 pr-6">
              <h2
                id="confirm-modal-title"
                className="text-base font-semibold text-content-primary leading-tight"
              >
                {title}
              </h2>
              {message && (
                <div className="mt-1.5 text-sm text-content-secondary leading-relaxed">
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-1 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-line bg-surface-card text-sm font-medium text-content-secondary hover:text-content-primary hover:bg-surface-elevated transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${confirmClasses}`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
