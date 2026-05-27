'use client';

// ─────────────────────────────────────────────────────────────────────
// NewDealModal — formulaire création de deal.
// ─────────────────────────────────────────────────────────────────────
// Props :
//   - open : bool
//   - onClose : () => void
//   - onCreated(deal) : callback après POST success
//   - pipelineId : string (UUID)
//   - defaultStageId : string (UUID) — pré-rempli sur la column cliquée
//   - stages : liste des stages du pipeline (pour le select)
//   - contacts : liste des contacts existants (pour le select)
//
// Sub-modal "Nouveau contact" géré inline (toggle UI).
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { X, Loader2, Plus, AlertCircle, User, Building2 } from 'lucide-react';

const EMPTY_FORM = {
  title: '',
  contact_id: '',
  stage_id: '',
  value: '',
  expected_close_date: '',
  notes: '',
};

const EMPTY_CONTACT = {
  name: '',
  email: '',
  company: '',
};

export default function NewDealModal({
  open,
  onClose,
  onCreated,
  pipelineId,
  defaultStageId,
  defaultContactId, // Phase 3 : pré-remplit le contact (utilisé depuis la page détail contact)
  stages = [],
  contacts = [],
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [newContactMode, setNewContactMode] = useState(false);
  const [newContact, setNewContact] = useState({ ...EMPTY_CONTACT });
  const [contactQuery, setContactQuery] = useState('');
  const [showContactList, setShowContactList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const titleInputRef = useRef(null);

  // Reset / focus quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY_FORM,
        stage_id: defaultStageId || stages[0]?.id || '',
        contact_id: defaultContactId || '',
      });
      setNewContactMode(false);
      setNewContact({ ...EMPTY_CONTACT });
      setContactQuery('');
      setShowContactList(false);
      setError('');
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [open, defaultStageId, defaultContactId, stages]);

  // Escape pour fermer
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  // ─── Submit ────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (loading) return;

    const title = form.title.trim();
    if (!title) {
      setError('Le titre est requis');
      return;
    }
    if (!form.stage_id) {
      setError('Sélectionnez une étape');
      return;
    }

    setLoading(true);

    try {
      let contactId = form.contact_id || null;

      // 1. Création contact si demandée
      if (newContactMode && newContact.name.trim()) {
        const cRes = await fetch('/api/crm/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newContact.name.trim(),
            email: newContact.email.trim() || null,
            company: newContact.company.trim() || null,
            source: 'manual',
          }),
        });
        const cData = await cRes.json();
        if (!cRes.ok) {
          // 409 (déjà existant) → on essaie de retrouver le contact côté front
          if (cRes.status === 409 && newContact.email) {
            const existing = contacts.find(
              (c) => c.email?.toLowerCase() === newContact.email.trim().toLowerCase()
            );
            if (existing) {
              contactId = existing.id;
            } else {
              setError('Contact déjà existant — sélectionnez-le dans la liste');
              setLoading(false);
              return;
            }
          } else {
            setError(cData.error || 'Erreur création contact');
            setLoading(false);
            return;
          }
        } else {
          contactId = cData.data.id;
        }
      }

      // 2. Création du deal
      const valueCents = form.value
        ? Math.max(0, Math.round(parseFloat(form.value) * 100))
        : 0;

      const dRes = await fetch('/api/crm/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          pipeline_id: pipelineId,
          stage_id: form.stage_id,
          contact_id: contactId,
          value_cents: valueCents,
          currency: 'EUR',
          expected_close_date: form.expected_close_date || null,
          notes: form.notes.trim() || null,
        }),
      });
      const dData = await dRes.json();
      if (!dRes.ok) {
        setError(dData.error || 'Erreur création deal');
        setLoading(false);
        return;
      }

      // Achievement toast (first_crm_deal) — best-effort, no-op si null
      try {
        const { maybeShowAchievement } = await import('@/lib/use-achievement-toast');
        maybeShowAchievement(dData);
      } catch {}

      onCreated?.(dData.data);
      onClose?.();
    } catch (err) {
      console.error('[NewDealModal] error', err);
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  // ─── Contact autocomplete filter ────────────────────────────
  const filteredContacts = contactQuery.trim()
    ? contacts
        .filter((c) => {
          const q = contactQuery.toLowerCase();
          return (
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.company?.toLowerCase().includes(q)
          );
        })
        .slice(0, 8)
    : contacts.slice(0, 8);

  const selectedContact = form.contact_id
    ? contacts.find((c) => c.id === form.contact_id)
    : null;

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
        aria-labelledby="new-deal-title"
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-surface-base border border-line shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-surface-base border-b border-line">
          <h2 id="new-deal-title" className="text-lg font-bold text-content-primary">
            Nouveau deal
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
          {/* Title (required) */}
          <div>
            <label htmlFor="deal-title" className="block text-xs font-semibold text-content-secondary mb-1.5">
              Titre du deal <span className="text-rose-600">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="deal-title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex : Nouvelle agence web pour Acme"
              maxLength={200}
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Stage */}
          <div>
            <label htmlFor="deal-stage" className="block text-xs font-semibold text-content-secondary mb-1.5">
              Étape <span className="text-rose-600">*</span>
            </label>
            <select
              id="deal-stage"
              value={form.stage_id}
              onChange={(e) => setForm({ ...form, stage_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            >
              <option value="">— Sélectionner —</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.probability}%)
                </option>
              ))}
            </select>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">
              Contact
            </label>

            {!newContactMode ? (
              <div className="relative">
                {selectedContact ? (
                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <User size={14} className="text-emerald-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-content-primary truncate">
                          {selectedContact.name}
                        </div>
                        {selectedContact.company && (
                          <div className="text-[11px] text-content-tertiary truncate">
                            {selectedContact.company}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, contact_id: '' });
                        setContactQuery('');
                      }}
                      className="text-content-tertiary hover:text-rose-600 p-1"
                      aria-label="Retirer le contact"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={contactQuery}
                      onChange={(e) => {
                        setContactQuery(e.target.value);
                        setShowContactList(true);
                      }}
                      onFocus={() => setShowContactList(true)}
                      onBlur={() => setTimeout(() => setShowContactList(false), 150)}
                      placeholder="Rechercher un contact existant…"
                      className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    {showContactList && filteredContacts.length > 0 && (
                      <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-lg border border-line bg-surface-base shadow-xl max-h-56 overflow-y-auto">
                        {filteredContacts.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setForm({ ...form, contact_id: c.id });
                              setContactQuery('');
                              setShowContactList(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-emerald-50 border-b border-line last:border-b-0 transition-colors"
                          >
                            <div className="text-sm font-medium text-content-primary">{c.name}</div>
                            <div className="text-[11px] text-content-tertiary">
                              {[c.company, c.email].filter(Boolean).join(' • ')}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setNewContactMode(true);
                    setForm({ ...form, contact_id: '' });
                    setContactQuery('');
                  }}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700"
                >
                  <Plus size={11} /> Créer un nouveau contact
                </button>
              </div>
            ) : (
              <div className="space-y-2 p-3 rounded-lg border border-emerald-200 bg-emerald-50/30">
                <input
                  type="text"
                  required
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Nom complet *"
                  className="w-full px-3 py-1.5 rounded-md border border-line bg-surface-base text-sm focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="Email (optionnel)"
                  className="w-full px-3 py-1.5 rounded-md border border-line bg-surface-base text-sm focus:outline-none focus:border-emerald-500"
                />
                <div className="relative">
                  <Building2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-content-tertiary" />
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    placeholder="Entreprise (optionnel)"
                    className="w-full pl-7 pr-3 py-1.5 rounded-md border border-line bg-surface-base text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewContactMode(false);
                    setNewContact({ ...EMPTY_CONTACT });
                  }}
                  className="text-[11px] text-content-tertiary hover:text-content-primary"
                >
                  ← Choisir un contact existant
                </button>
              </div>
            )}
          </div>

          {/* Value + close date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="deal-value" className="block text-xs font-semibold text-content-secondary mb-1.5">
                Valeur (€)
              </label>
              <input
                id="deal-value"
                type="number"
                min="0"
                step="100"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="deal-date" className="block text-xs font-semibold text-content-secondary mb-1.5">
                Closing prévu
              </label>
              <input
                id="deal-date"
                type="date"
                value={form.expected_close_date}
                onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="deal-notes" className="block text-xs font-semibold text-content-secondary mb-1.5">
              Notes
            </label>
            <textarea
              id="deal-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Contexte, besoins exprimés, prochaines étapes…"
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{error}</p>
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
                  Créer le deal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
