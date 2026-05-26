'use client';

// ─────────────────────────────────────────────────────────────────────
// CustomFieldEditorModal — modal de création / édition d'un custom field.
// ─────────────────────────────────────────────────────────────────────
// Props :
//   - open : bool
//   - entity : 'contact' | 'deal'
//   - field : null (création) ou objet field (édition)
//   - onClose()
//   - onSaved(field) : callback après POST/PATCH success
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { X, Plus, Trash2, Loader2, AlertCircle, Save } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'text', label: 'Texte', help: 'Une ligne de texte' },
  { value: 'number', label: 'Nombre', help: 'Valeur numérique' },
  { value: 'select', label: 'Liste déroulante', help: 'Choix parmi des options' },
  { value: 'date', label: 'Date', help: 'Sélecteur de date' },
  { value: 'boolean', label: 'Oui / Non', help: 'Case à cocher' },
];

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
}

export default function CustomFieldEditorModal({
  open,
  entity,
  field = null,
  onClose,
  onSaved,
}) {
  const isEdit = !!field?.id;

  const [label, setLabel] = useState('');
  const [keyDraft, setKeyDraft] = useState('');
  const [keyEdited, setKeyEdited] = useState(false);
  const [type, setType] = useState('text');
  const [options, setOptions] = useState(['']);
  const [required, setRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Reset à chaque ouverture / changement de field
  useEffect(() => {
    if (!open) return;
    if (field) {
      setLabel(field.field_label || '');
      setKeyDraft(field.field_key || '');
      setKeyEdited(true);
      setType(field.field_type || 'text');
      setOptions(
        Array.isArray(field.field_options?.options) && field.field_options.options.length > 0
          ? [...field.field_options.options]
          : ['']
      );
      setRequired(!!field.required);
    } else {
      setLabel('');
      setKeyDraft('');
      setKeyEdited(false);
      setType('text');
      setOptions(['']);
      setRequired(false);
    }
    setError('');
    setSaving(false);
  }, [open, field]);

  // Auto-slug du field_key tant que l'user ne l'a pas édité
  useEffect(() => {
    if (!keyEdited && !isEdit) {
      setKeyDraft(slugify(label));
    }
  }, [label, keyEdited, isEdit]);

  // Escape close
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  function addOption() {
    setOptions((prev) => [...prev, '']);
  }
  function removeOption(idx) {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateOption(idx, v) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? v : o)));
  }

  async function handleSave(e) {
    e?.preventDefault?.();
    if (!label.trim()) {
      setError('Le label est requis');
      return;
    }
    if (type === 'select') {
      const clean = options.map((o) => o.trim()).filter(Boolean);
      if (clean.length === 0) {
        setError('Une liste déroulante doit avoir au moins une option');
        return;
      }
    }

    setSaving(true);
    setError('');

    try {
      let res, data;
      if (isEdit) {
        // PATCH : label, options, required (type/key immutables)
        res = await fetch(`/api/crm/custom-fields/${field.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            field_label: label.trim(),
            field_options:
              type === 'select'
                ? { options: options.map((o) => o.trim()).filter(Boolean) }
                : null,
            required,
          }),
        });
      } else {
        res = await fetch('/api/crm/custom-fields', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entity,
            field_label: label.trim(),
            field_key: keyDraft || undefined,
            field_type: type,
            field_options:
              type === 'select'
                ? { options: options.map((o) => o.trim()).filter(Boolean) }
                : null,
            required,
          }),
        });
      }
      data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur sauvegarde');
        setSaving(false);
        return;
      }
      onSaved?.(data.data);
      onClose?.();
    } catch {
      setError('Erreur réseau');
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Éditer le champ' : 'Nouveau champ'}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-surface-base rounded-2xl shadow-2xl border border-line"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 bg-surface-base border-b border-line">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Champ personnalisé · {entity === 'deal' ? 'Deals' : 'Contacts'}
            </p>
            <h2 className="text-base font-bold text-content-primary">
              {isEdit ? 'Éditer le champ' : 'Nouveau champ'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-content-tertiary hover:text-content-primary hover:bg-surface-elevated"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Label */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-content-tertiary mb-1.5">
              Label affiché *
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Source du lead, Valeur estimée…"
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              maxLength={100}
            />
          </div>

          {/* Field key (auto-slug, éditable avant création) */}
          {!isEdit && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-content-tertiary mb-1.5">
                Clé technique
              </label>
              <input
                type="text"
                value={keyDraft}
                onChange={(e) => {
                  setKeyEdited(true);
                  setKeyDraft(slugify(e.target.value));
                }}
                placeholder="source_lead"
                className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary font-mono placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                maxLength={60}
              />
              <p className="mt-1 text-[10px] text-content-tertiary">
                Identifiant interne, non modifiable après création.
              </p>
            </div>
          )}

          {/* Type */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-content-tertiary mb-1.5">
              Type {isEdit && <span className="text-content-tertiary font-normal normal-case">(non modifiable)</span>}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TYPE_OPTIONS.map((t) => {
                const active = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    disabled={isEdit}
                    onClick={() => setType(t.value)}
                    className={`text-left px-3 py-2 rounded-lg border transition-all ${
                      active
                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                        : 'border-line bg-surface-card hover:border-emerald-300'
                    } ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-[12px] font-semibold text-content-primary">
                      {t.label}
                    </div>
                    <div className="text-[10px] text-content-tertiary">{t.help}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options (si select) */}
          {type === 'select' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-content-tertiary mb-1.5">
                Options
              </label>
              <div className="space-y-1.5">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 px-3 py-1.5 rounded-md border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      maxLength={80}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      disabled={options.length <= 1}
                      className="p-1.5 rounded-md text-content-tertiary hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Supprimer l'option"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  <Plus size={11} />
                  Ajouter une option
                </button>
              </div>
            </div>
          )}

          {/* Required toggle */}
          <label className="flex items-center gap-2 cursor-pointer py-2">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 border-line focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-[12px] font-medium text-content-secondary">
              Champ requis (affiche un avertissement si vide)
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-content-secondary hover:bg-surface-elevated transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {isEdit ? 'Enregistrer' : 'Créer le champ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
