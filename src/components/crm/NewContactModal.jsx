'use client';

// ─────────────────────────────────────────────────────────────────────
// NewContactModal — formulaire création de contact CRM (Phase 3).
// ─────────────────────────────────────────────────────────────────────
// Props :
//   - open : bool
//   - onClose : () => void
//   - onCreated(contact) : callback après POST success
//
// Le serveur déduplique sur (user_id, lower(email)). En cas de 409,
// on affiche un message + un lien vers le contact existant si l'API
// retourne son id (fallback : on guide l'user vers la recherche).
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Loader2, Plus, AlertCircle, Search, ChevronDown } from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  position: '',
  notes: '',
};

export default function NewContactModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Si email dupliqué, on garde la valeur entrée pour proposer un fallback search
  const [duplicateEmail, setDuplicateEmail] = useState('');
  // Quick win #2 CRM : accordéon "Détails" (poste, entreprise, notes)
  const [detailsOpen, setDetailsOpen] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM });
      setError('');
      setDuplicateEmail('');
      setDetailsOpen(false);
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setDuplicateEmail('');

    const name = form.name.trim();
    if (!name) {
      setError('Le nom est requis');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          company: form.company.trim() || null,
          position: form.position.trim() || null,
          notes: form.notes.trim() || null,
          source: 'manual',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setDuplicateEmail(form.email.trim());
          setError('Un contact avec cet email existe déjà.');
        } else {
          setError(data.error || 'Erreur création contact');
        }
        setLoading(false);
        return;
      }
      onCreated?.(data.data);
      onClose?.();
    } catch (err) {
      console.error('[NewContactModal] error', err);
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

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
        aria-labelledby="new-contact-title"
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-surface-base border border-line shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-surface-base border-b border-line">
          <h2 id="new-contact-title" className="text-lg font-bold text-content-primary">
            Nouveau contact
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-content-tertiary hover:text-content-primary hover:bg-surface-elevated transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Nom (required) */}
          <div>
            <label htmlFor="contact-name" className="block text-xs font-semibold text-content-secondary mb-1.5">
              Nom <span className="text-rose-600">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="contact-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex : Marie Dupont"
              maxLength={200}
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="contact-email" className="block text-xs font-semibold text-content-secondary mb-1.5">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="marie@acme.fr"
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor="contact-phone" className="block text-xs font-semibold text-content-secondary mb-1.5">
              Téléphone
            </label>
            <input
              id="contact-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="06 12 34 56 78"
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Accordéon Détails (poste, entreprise, notes) — Quick win #2 CRM */}
          <div>
            <button
              type="button"
              onClick={() => setDetailsOpen((v) => !v)}
              aria-expanded={detailsOpen}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-600 transition-colors"
            >
              <ChevronDown
                size={13}
                className={`transition-transform ${detailsOpen ? 'rotate-180' : ''}`}
              />
              {detailsOpen ? 'Masquer les détails' : '+ Détails (poste, entreprise, notes)'}
            </button>

            {detailsOpen && (
              <div className="mt-3 space-y-4 pl-1 border-l-2 border-emerald-100">
                <div className="pl-3">
                  <label htmlFor="contact-position" className="block text-xs font-semibold text-content-secondary mb-1.5">
                    Poste
                  </label>
                  <input
                    id="contact-position"
                    type="text"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    placeholder="CEO, Sales, ..."
                    className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div className="pl-3">
                  <label htmlFor="contact-company" className="block text-xs font-semibold text-content-secondary mb-1.5">
                    Entreprise
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div className="pl-3">
                  <label htmlFor="contact-notes" className="block text-xs font-semibold text-content-secondary mb-1.5">
                    Notes
                  </label>
                  <textarea
                    id="contact-notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Contexte, historique, préférences…"
                    className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs font-medium">
                <p>{error}</p>
                {duplicateEmail && (
                  <Link
                    href={`/app/crm/contacts?q=${encodeURIComponent(duplicateEmail)}`}
                    className="mt-1 inline-flex items-center gap-1 text-rose-800 underline hover:text-rose-900"
                    onClick={() => onClose?.()}
                  >
                    <Search size={11} />
                    Voir le contact existant
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-content-secondary hover:bg-surface-elevated transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Création…
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Créer le contact
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
