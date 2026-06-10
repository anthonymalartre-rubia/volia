'use client';

// ─────────────────────────────────────────────────────────────────────
// AddToCampagneModal — pousse N contacts CRM vers une liste Campagnes.
// ─────────────────────────────────────────────────────────────────────
// Props :
//   - open : bool
//   - onClose : () => void
//   - contactIds : string[] (IDs des crm_contacts)
//   - dealId? : string  (lié à l'activity log si présent)
//   - onSuccess?({ list_id, list_name, inserted, skipped, activities_logged }) : callback
//
// Flow :
//   1. Au mount, fetch GET /api/admin/prospection/lists pour proposer
//      les listes existantes. (Si l'API renvoie 403, l'option "liste existante"
//      est masquée et seule la création reste possible.)
//   2. L'user choisit : créer nouvelle liste OU sélectionner une existante.
//   3. POST /api/crm/send-to-campagne avec contact_ids, deal_id éventuel.
//
// Cohérence visuelle : palette violet/purple (module Campagnes), miroir
// de SendToCampagneModal (Prospection → Campagnes).
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Megaphone,
  Plus,
  ListChecks,
} from 'lucide-react';

export default function AddToCampagneModal({
  open,
  onClose,
  contactIds = [],
  dealId = null,
  onSuccess,
}) {
  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [listsAvailable, setListsAvailable] = useState(true); // false si 403 GET lists

  const [mode, setMode] = useState('new'); // 'new' | 'existing'
  const [newName, setNewName] = useState('');
  const [existingId, setExistingId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const count = contactIds.length;

  // ─── Reset state quand on ouvre ───────────────────────────
  useEffect(() => {
    if (!open) return;
    setResult(null);
    setError('');
    setNewName('');
    setExistingId('');
    setMode('new');
    setLoadingLists(true);
    setListsAvailable(true);

    fetch('/api/admin/prospection/lists')
      .then((r) => r.json().then((d) => ({ ok: r.ok, status: r.status, d })))
      .then(({ ok, status, d }) => {
        if (!ok) {
          // 403 = pas admin → on n'affiche pas les listes existantes
          // mais on peut toujours créer une nouvelle liste (l'API
          // send-to-campagne utilise getAuthenticatedUser, pas requireAdmin).
          setListsAvailable(false);
          setLists([]);
        } else {
          const arr = Array.isArray(d?.lists) ? d.lists : [];
          setLists(arr);
          if (arr.length > 0) setExistingId(arr[0].id);
        }
        setLoadingLists(false);
      })
      .catch(() => {
        setListsAvailable(false);
        setLoadingLists(false);
      });
  }, [open]);

  // ─── Escape close ─────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape' && !submitting) onClose?.();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, submitting]);

  const canSubmit = useMemo(() => {
    if (count === 0 || submitting) return false;
    if (mode === 'new') return newName.trim().length > 0;
    if (mode === 'existing') return existingId.length > 0;
    return false;
  }, [count, submitting, mode, newName, existingId]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setSubmitting(true);

    try {
      const body = {
        contact_ids: contactIds,
        create_new_list: mode === 'new',
      };
      if (mode === 'new') {
        body.list_name = newName.trim();
      } else {
        body.existing_list_id = existingId;
      }
      if (dealId) body.deal_id = dealId;

      const res = await fetch('/api/crm/send-to-campagne', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur envoi vers Campagnes');
        setSubmitting(false);
        return;
      }
      setResult(data.data);
      onSuccess?.(data.data);
    } catch (err) {
      console.error('[AddToCampagneModal] submit error', err);
      setError('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-camp-title"
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-surface-base border border-line shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 bg-surface-base border-b border-line">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Megaphone size={14} className="text-white" />
            </div>
            <h2
              id="add-camp-title"
              className="text-base font-bold text-content-primary"
            >
              Ajouter à une séquence
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-content-tertiary hover:text-content-primary hover:bg-surface-elevated transition-colors disabled:opacity-50"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {result ? (
          // ─── Success state ─────────────────────────────────
          <div className="px-5 py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={20} className="text-violet-600" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-content-primary">
                  Contacts ajoutés
                </p>
                <p className="text-xs text-content-tertiary truncate">
                  Liste « {result.list_name} »
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3">
                <div className="text-2xl font-extrabold text-violet-700 tabular-nums">
                  {result.inserted || 0}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-violet-700/80 font-semibold mt-0.5">
                  Ajoutés
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="text-2xl font-extrabold text-zinc-700 tabular-nums">
                  {result.skipped || 0}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold mt-0.5">
                  Doublons
                </div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                <div className="text-2xl font-extrabold text-emerald-700 tabular-nums">
                  {result.activities_logged || 0}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-700/80 font-semibold mt-0.5">
                  Activités
                </div>
              </div>
            </div>

            {result.ineligible > 0 && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                {result.ineligible} contact{result.ineligible > 1 ? 's' : ''} ignoré
                {result.ineligible > 1 ? 's' : ''} (pas d&apos;email ni de téléphone).
              </div>
            )}

            {result.errors && result.errors.length > 0 && (
              <div className="mb-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <p className="font-semibold mb-1">Erreurs partielles :</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-md shadow-violet-500/20 transition-all"
              >
                Terminer
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          // ─── Form state ────────────────────────────────────
          <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50/60 border border-violet-200">
              <ListChecks size={16} className="text-violet-600 flex-shrink-0" />
              <p className="text-sm text-content-primary">
                <strong className="font-bold tabular-nums">{count}</strong> contact
                {count > 1 ? 's' : ''} {count > 1 ? 'vont' : 'va'} être ajouté
                {count > 1 ? 's' : ''} à une séquence email/SMS.
              </p>
            </div>

            {count === 0 && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium">
                  Sélectionne au moins un contact d&apos;abord.
                </p>
              </div>
            )}

            {/* Mode select */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-content-tertiary">
                Destination
              </label>

              {/* New list */}
              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                  mode === 'new'
                    ? 'border-violet-400 bg-violet-50/60 ring-2 ring-violet-500/20'
                    : 'border-line bg-surface-card hover:bg-surface-elevated'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value="new"
                  checked={mode === 'new'}
                  onChange={() => setMode('new')}
                  className="mt-0.5 w-4 h-4 text-violet-600 border-line focus:ring-violet-500 focus:ring-offset-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Plus size={12} className="text-violet-600" />
                    <span className="text-sm font-semibold text-content-primary">
                      Nouvelle liste
                    </span>
                  </div>
                  <p className="text-[11px] text-content-tertiary mt-0.5">
                    Crée une nouvelle liste dans Campagnes.
                  </p>
                  {mode === 'new' && (
                    <input
                      type="text"
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder='Ex: "Relance leads Q2"'
                      maxLength={120}
                      className="mt-2 w-full px-3 py-1.5 rounded-md border border-line bg-surface-base text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                  )}
                </div>
              </label>

              {/* Existing list */}
              {listsAvailable && (
                <label
                  className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                    mode === 'existing'
                      ? 'border-violet-400 bg-violet-50/60 ring-2 ring-violet-500/20'
                      : 'border-line bg-surface-card hover:bg-surface-elevated'
                  } ${lists.length === 0 && !loadingLists ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="existing"
                    checked={mode === 'existing'}
                    disabled={lists.length === 0 && !loadingLists}
                    onChange={() => setMode('existing')}
                    className="mt-0.5 w-4 h-4 text-violet-600 border-line focus:ring-violet-500 focus:ring-offset-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <ListChecks size={12} className="text-violet-600" />
                      <span className="text-sm font-semibold text-content-primary">
                        Liste existante
                      </span>
                    </div>
                    <p className="text-[11px] text-content-tertiary mt-0.5">
                      {loadingLists
                        ? 'Chargement…'
                        : lists.length === 0
                        ? 'Pas encore de liste. Crées-en une au-dessus.'
                        : `${lists.length} liste${lists.length > 1 ? 's' : ''} disponible${lists.length > 1 ? 's' : ''}.`}
                    </p>
                    {mode === 'existing' && lists.length > 0 && (
                      <select
                        value={existingId}
                        onChange={(e) => setExistingId(e.target.value)}
                        className="mt-2 w-full px-3 py-1.5 rounded-md border border-line bg-surface-base text-sm text-content-primary focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      >
                        {lists.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                            {typeof l.contacts_count === 'number'
                              ? ` (${l.contacts_count})`
                              : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>
              )}
            </div>

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
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-content-secondary hover:bg-surface-elevated transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-md shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Envoi…
                  </>
                ) : (
                  <>
                    <Megaphone size={14} />
                    Ajouter {count > 0 ? `(${count})` : ''}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
