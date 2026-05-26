'use client';

// ─────────────────────────────────────────────────────────────────────
// CustomFieldsSection — affiche les custom fields d'une entity (contact|deal)
// et permet l'édition inline.
// ─────────────────────────────────────────────────────────────────────
// Props :
//   - entity : 'contact' | 'deal'
//   - entityId : uuid de l'entité (contact ou deal)
//   - values : objet { field_key: value, ... } (custom_fields jsonb)
//   - onValuesChange(nextValues) : callback après PATCH success
//   - apiPath : '/api/crm/contacts' ou '/api/crm/deals' (préfixe pour le PATCH)
//
// Fetch lui-même la liste des fields définis (GET /api/crm/custom-fields?entity=).
// Chaque champ déclenche un PATCH onBlur (ou onChange pour checkbox/select/date).
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Settings, AlertCircle, Sliders } from 'lucide-react';
import Link from 'next/link';

export default function CustomFieldsSection({
  entity,
  entityId,
  values = {},
  onValuesChange,
  apiPath, // ex: '/api/crm/contacts' (sans /[id])
}) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingKey, setSavingKey] = useState(null);
  const [localValues, setLocalValues] = useState(values || {});

  // Sync local state quand le parent change values (ex: refetch)
  useEffect(() => {
    setLocalValues(values || {});
  }, [values]);

  // Fetch des definitions
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/crm/custom-fields?entity=${entity}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (!d?.success) {
          setError(d?.error || 'Erreur chargement champs');
          setLoading(false);
          return;
        }
        setFields(Array.isArray(d.data) ? d.data : []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Erreur réseau');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entity]);

  const persistChange = useCallback(
    async (fieldKey, nextValue) => {
      if (!entityId) return;
      const merged = { ...localValues, [fieldKey]: nextValue };
      // Strip null/undefined/'' pour ne pas polluer le jsonb
      const cleaned = Object.fromEntries(
        Object.entries(merged).filter(([, v]) => v !== null && v !== undefined && v !== '')
      );
      setSavingKey(fieldKey);
      setError('');
      try {
        const res = await fetch(`${apiPath}/${entityId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ custom_fields: cleaned }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erreur mise à jour');
          setSavingKey(null);
          return;
        }
        setLocalValues(cleaned);
        onValuesChange?.(cleaned);
      } catch {
        setError('Erreur réseau');
      } finally {
        setSavingKey(null);
      }
    },
    [apiPath, entityId, localValues, onValuesChange]
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-content-tertiary py-2">
        <Loader2 size={12} className="animate-spin" />
        Chargement des champs…
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface-card/50 p-3 text-center">
        <Sliders size={14} className="inline text-content-tertiary mr-1.5" />
        <span className="text-[11px] text-content-tertiary">
          Aucun champ personnalisé.{' '}
          <Link
            href="/app/crm/custom-fields"
            className="text-emerald-700 hover:underline font-medium"
          >
            Configurer
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-content-tertiary">
          Champs personnalisés
        </label>
        <Link
          href="/app/crm/custom-fields"
          className="inline-flex items-center gap-1 text-[10px] text-content-tertiary hover:text-emerald-700 transition-colors"
          title="Gérer les champs personnalisés"
        >
          <Settings size={10} />
          Configurer
        </Link>
      </div>

      <div className="space-y-3">
        {fields.map((f) => (
          <CustomFieldInput
            key={f.id}
            field={f}
            value={localValues[f.field_key]}
            saving={savingKey === f.field_key}
            onCommit={(v) => persistChange(f.field_key, v)}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700">
          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CustomFieldInput — input contrôlé selon le type
// ─────────────────────────────────────────────────────────────────────
function CustomFieldInput({ field, value, saving, onCommit }) {
  const [local, setLocal] = useState(valueToString(value, field.field_type));

  useEffect(() => {
    setLocal(valueToString(value, field.field_type));
  }, [value, field.field_type]);

  const baseInputClass =
    'w-full px-2.5 py-1.5 rounded-md border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all';

  const labelEl = (
    <label className="block text-[11px] font-medium text-content-secondary mb-1">
      {field.field_label}
      {field.required && <span className="text-rose-500 ml-0.5">*</span>}
      {saving && <Loader2 size={10} className="inline ml-2 animate-spin text-emerald-600" />}
      {field.required && !hasValue(value, field.field_type) && (
        <span className="ml-2 text-[10px] text-rose-600 font-normal">Requis</span>
      )}
    </label>
  );

  function commitText(strValue) {
    const trimmed = strValue.trim();
    if (trimmed === valueToString(value, field.field_type)) return;
    onCommit(trimmed || null);
  }

  function commitNumber(strValue) {
    if (strValue === '' || strValue == null) {
      if (value !== null && value !== undefined && value !== '') onCommit(null);
      return;
    }
    const n = Number(strValue);
    if (!Number.isFinite(n)) return;
    if (n === Number(value)) return;
    onCommit(n);
  }

  switch (field.field_type) {
    case 'text':
      return (
        <div>
          {labelEl}
          <input
            type="text"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={() => commitText(local)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            placeholder={`Saisir ${field.field_label.toLowerCase()}…`}
            className={baseInputClass}
          />
        </div>
      );

    case 'number':
      return (
        <div>
          {labelEl}
          <input
            type="number"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={() => commitNumber(local)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            placeholder="0"
            className={`${baseInputClass} tabular-nums`}
          />
        </div>
      );

    case 'date':
      return (
        <div>
          {labelEl}
          <input
            type="date"
            value={local}
            onChange={(e) => {
              setLocal(e.target.value);
              onCommit(e.target.value || null);
            }}
            className={baseInputClass}
          />
        </div>
      );

    case 'boolean': {
      const checked = !!value;
      return (
        <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-md hover:bg-surface-card transition-colors">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCommit(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 border-line focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-[12px] font-medium text-content-secondary">
            {field.field_label}
            {field.required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
          {saving && <Loader2 size={10} className="animate-spin text-emerald-600" />}
        </label>
      );
    }

    case 'select': {
      const options = Array.isArray(field.field_options?.options)
        ? field.field_options.options
        : [];
      return (
        <div>
          {labelEl}
          <select
            value={local}
            onChange={(e) => {
              setLocal(e.target.value);
              onCommit(e.target.value || null);
            }}
            className={baseInputClass}
          >
            <option value="">— Aucun —</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    default:
      return (
        <div className="text-[11px] text-content-tertiary">
          Type non supporté : {field.field_type}
        </div>
      );
  }
}

function valueToString(v, type) {
  if (v === null || v === undefined) return '';
  if (type === 'boolean') return v ? '1' : '';
  return String(v);
}

function hasValue(v, type) {
  if (v === null || v === undefined || v === '') return false;
  if (type === 'boolean') return !!v;
  return true;
}
