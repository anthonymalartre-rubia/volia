'use client';

// ─────────────────────────────────────────────────────────────────────
// ImportCsvModal — modale d'import CSV inline depuis le hub Campagnes
// ─────────────────────────────────────────────────────────────────────
//
// Fix P1-1 audit UX : avant, le CTA "Créer une liste" depuis le hub
// Campagnes redirigeait vers /admin/prospection (page liste générique)
// → user perd le fil. Maintenant, modale inline en 2 étapes :
//
//   1) saisir nom de liste + uploader CSV
//   2) POST création liste (/api/admin/prospection/lists)
//      puis POST import (/api/admin/prospection/lists/[id]/import)
//   3) onSuccess(listId) → le caller redirige vers /campaigns/new?list=<id>
//
// Volontairement minimal — pas de mapping de colonnes ni de drag&drop.
// Le CSV doit avoir au moins une colonne `email` (le parser fait le reste).
// Les freelances qui veulent du fancy passent par /admin/prospection.

import { useEffect, useRef, useState } from 'react';
import { Loader2, Upload, X, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

export default function ImportCsvModal({ open, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { inserted, skipped, listId }
  const nameRef = useRef(null);

  // Reset à chaque ouverture
  useEffect(() => {
    if (open) {
      setName('');
      setFile(null);
      setSubmitting(false);
      setError(null);
      setResult(null);
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open]);

  // Escape pour fermer (sauf en plein submit)
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape' && !submitting) onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, submitting, onClose]);

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (submitting) return;
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Donnez un nom à votre liste.');
      return;
    }
    if (!file) {
      setError('Choisissez un fichier CSV.');
      return;
    }

    setSubmitting(true);
    try {
      // 1) Création de la liste (POST /lists)
      const createRes = await fetch('/api/admin/prospection/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          source: 'csv_import',
          legal_basis: 'legitimate_interest',
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData.list?.id) {
        setError(createData.error || 'Erreur création de la liste');
        setSubmitting(false);
        return;
      }
      const listId = createData.list.id;

      // 2) Upload du CSV (POST /lists/[id]/import — multipart/form-data)
      const form = new FormData();
      form.append('file', file);
      const importRes = await fetch(`/api/admin/prospection/lists/${listId}/import`, {
        method: 'POST',
        body: form,
      });
      const importData = await importRes.json();
      if (!importRes.ok) {
        // Liste créée mais import KO — on propose au user de poursuivre
        // avec la liste vide (il peut réessayer depuis /admin/prospection).
        setError(importData.error || 'CSV importé mais erreur lors du parsing');
        setSubmitting(false);
        return;
      }

      setResult({
        listId,
        inserted: importData.inserted || 0,
        skipped: importData.skipped || 0,
        duplicates: importData.duplicates || 0,
      });
      setSubmitting(false);
    } catch {
      setError('Erreur réseau');
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (result?.listId) onSuccess?.(result.listId);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={() => !submitting && onClose?.()}
    >
      <div
        className="max-w-lg w-full rounded-2xl border border-line bg-surface-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
              <Upload size={16} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-content-primary">
                Importer un CSV
              </h3>
              <p className="text-xs text-content-tertiary">
                Crée une liste depuis ton fichier de prospects.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !submitting && onClose?.()}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-surface-elevated text-content-tertiary disabled:opacity-40"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Résultat post-import — écran succès */}
        {result ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-4 flex items-start gap-3">
              <CheckCircle size={20} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-content-primary">
                  Liste créée avec {result.inserted} contact{result.inserted > 1 ? 's' : ''}.
                </p>
                <p className="text-xs text-content-tertiary mt-1 leading-relaxed">
                  {result.skipped > 0 && `${result.skipped} ligne${result.skipped > 1 ? 's' : ''} ignorée${result.skipped > 1 ? 's' : ''} (pas d'email valide). `}
                  {result.duplicates > 0 && `${result.duplicates} doublon${result.duplicates > 1 ? 's' : ''} déjà présent${result.duplicates > 1 ? 's' : ''}. `}
                  Prêt à créer ta campagne.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/20"
              >
                Continuer vers la campagne
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300 flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="csv-list-name" className="block text-xs text-content-tertiary mb-1.5 font-medium">
                Nom de la liste
              </label>
              <input
                id="csv-list-name"
                ref={nameRef}
                type="text"
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex : Prospects salon Janvier"
                disabled={submitting}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-base border border-line text-sm text-content-primary focus:outline-none focus:border-violet-500 transition disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="csv-file" className="block text-xs text-content-tertiary mb-1.5 font-medium">
                Fichier CSV
              </label>
              <label
                htmlFor="csv-file"
                className={`flex items-center gap-3 px-3 py-3 rounded-lg border-2 border-dashed cursor-pointer transition ${
                  file
                    ? 'border-violet-500/40 bg-violet-500/[0.04]'
                    : 'border-line hover:border-violet-500/40 hover:bg-surface-elevated'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FileText size={20} className={file ? 'text-violet-400' : 'text-content-tertiary'} />
                <div className="flex-1 min-w-0">
                  {file ? (
                    <>
                      <div className="text-sm font-medium text-content-primary truncate">{file.name}</div>
                      <div className="text-[11px] text-content-tertiary">{(file.size / 1024).toFixed(1)} KB · cliquez pour changer</div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-content-secondary">Cliquez pour choisir un fichier</div>
                      <div className="text-[11px] text-content-tertiary">CSV avec au moins une colonne email</div>
                    </>
                  )}
                </div>
              </label>
              <input
                id="csv-file"
                type="file"
                accept=".csv,text/csv"
                disabled={submitting}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <p className="text-[10px] text-content-tertiary mt-1.5 leading-relaxed">
                Colonnes reconnues : <code>email</code>, <code>first_name</code>, <code>last_name</code>,
                <code> company</code>, <code>phone</code>, <code>position_title</code>. Le séparateur est détecté automatiquement.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => !submitting && onClose?.()}
                disabled={submitting}
                className="px-3 py-2 rounded-lg text-sm text-content-secondary hover:text-content-primary hover:bg-surface-elevated transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim() || !file}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition shadow-lg shadow-violet-500/20"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Import en cours…
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Importer
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
