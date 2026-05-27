'use client';

// ─────────────────────────────────────────────────────────────────────
// FieldPropertiesPanel — Right rail, édition du field sélectionné
// ─────────────────────────────────────────────────────────────────────
// Sections collapsibles :
//   - Général : label, key, placeholder, help_text, required
//   - Options : pour select/radio/checkbox
//   - Validation : selon type
//   - Logique conditionnelle : 3 dropdowns inline
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Zap,
  ShieldCheck,
  Settings2,
  ListChecks,
} from 'lucide-react';
import { normalizeConditionalLogic } from '@/lib/forms';
import ConditionsBuilder from './ConditionsBuilder';

function Section({ title, icon: Icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-semibold text-content-tertiary hover:text-pink-700 transition-colors"
      >
        {Icon && <Icon size={12} />}
        <span className="flex-1 text-left">{title}</span>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-content-tertiary mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-content-faint">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-2.5 py-1.5 rounded-md bg-surface-card border border-line text-xs text-content-primary focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-colors';

function OptionsEditor({ options, onChange }) {
  const opts = Array.isArray(options) ? options : [];

  const update = (i, patch) => {
    const next = opts.map((o, idx) => (idx === i ? { ...o, ...patch } : o));
    onChange(next);
  };
  const remove = (i) => onChange(opts.filter((_, idx) => idx !== i));
  const add = () => onChange([...opts, { label: `Option ${opts.length + 1}`, value: `option_${opts.length + 1}` }]);

  return (
    <div className="space-y-1.5">
      {opts.map((opt, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <GripVertical size={12} className="text-content-faint" />
          <input
            type="text"
            value={opt.label || ''}
            onChange={(e) => {
              const newLabel = e.target.value;
              update(i, {
                label: newLabel,
                // Auto-slug de la value tant qu'elle suit le label
                value:
                  !opt.value || opt.value === slugifyOption(opt.label)
                    ? slugifyOption(newLabel)
                    : opt.value,
              });
            }}
            placeholder="Libellé"
            className={`${inputCls} flex-1`}
          />
          <input
            type="text"
            value={opt.value || ''}
            onChange={(e) => update(i, { value: e.target.value })}
            placeholder="value"
            className={`${inputCls} w-24`}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="p-1 text-content-faint hover:text-rose-600 transition-colors"
            aria-label="Supprimer l'option"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md border border-dashed border-line text-[11px] text-content-tertiary hover:border-pink-300 hover:text-pink-700 transition-all"
      >
        <Plus size={11} /> Ajouter
      </button>
    </div>
  );
}

function slugifyOption(label) {
  return String(label || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'option';
}

function ConditionalLogicEditor({ field, otherFields, onChange }) {
  const cl = field.conditional_logic;
  const enabled = !!cl?.show_if;

  function toggle(on) {
    if (on) {
      const first = otherFields[0];
      onChange({
        show_if: {
          combinator: 'AND',
          conditions: [
            { field_key: first?.key || '', operator: 'equals', value: '' },
          ],
        },
      });
    } else {
      onChange(null);
    }
  }

  function handleConditionsChange(nextValue) {
    // nextValue toujours { combinator, conditions[] } depuis ConditionsBuilder
    if (!nextValue || nextValue.conditions.length === 0) {
      onChange(null);
      return;
    }
    onChange({ show_if: nextValue });
  }

  return (
    <div className="space-y-3">
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => toggle(e.target.checked)}
          className="mt-0.5 accent-pink-600"
        />
        <span className="text-xs text-content-primary">
          Afficher ce champ seulement si...
        </span>
      </label>

      {enabled && (
        <div className="pl-5">
          <ConditionsBuilder
            value={cl.show_if}
            onChange={handleConditionsChange}
            availableFields={otherFields}
          />
        </div>
      )}
    </div>
  );
}

function ValidationEditor({ field, onChange }) {
  const v = field.validation || {};
  const patch = (p) => onChange({ ...v, ...p });

  return (
    <div className="space-y-3">
      {(field.type === 'text' || field.type === 'textarea' || field.type === 'email' || field.type === 'tel') && (
        <>
          <Field label="Longueur minimale">
            <input
              type="number"
              min={0}
              value={v.min_length ?? ''}
              onChange={(e) => patch({ min_length: e.target.value === '' ? null : parseInt(e.target.value, 10) })}
              className={inputCls}
            />
          </Field>
          <Field label="Longueur maximale">
            <input
              type="number"
              min={0}
              value={v.max_length ?? ''}
              onChange={(e) => patch({ max_length: e.target.value === '' ? null : parseInt(e.target.value, 10) })}
              className={inputCls}
            />
          </Field>
        </>
      )}

      {field.type === 'number' && (
        <>
          <Field label="Valeur minimum">
            <input
              type="number"
              value={v.min ?? ''}
              onChange={(e) => patch({ min: e.target.value === '' ? null : parseFloat(e.target.value) })}
              className={inputCls}
            />
          </Field>
          <Field label="Valeur maximum">
            <input
              type="number"
              value={v.max ?? ''}
              onChange={(e) => patch({ max: e.target.value === '' ? null : parseFloat(e.target.value) })}
              className={inputCls}
            />
          </Field>
        </>
      )}

      {field.type === 'rating' && (
        <Field label="Nombre d'étoiles" hint="Entre 3 et 10">
          <input
            type="number"
            min={3}
            max={10}
            value={v.max ?? 5}
            onChange={(e) => patch({ max: parseInt(e.target.value, 10) || 5 })}
            className={inputCls}
          />
        </Field>
      )}

      {(field.type === 'text' || field.type === 'tel') && (
        <Field label="Pattern (regex)" hint="Ex: ^[A-Z]{2}[0-9]{4}$">
          <input
            type="text"
            value={v.pattern ?? ''}
            onChange={(e) => patch({ pattern: e.target.value || null })}
            placeholder="Optionnel"
            className={inputCls}
          />
        </Field>
      )}

      {field.type === 'file' && (
        <Field label="Types de fichiers acceptés">
          <div className="space-y-1.5">
            {[
              { label: 'Images (jpg, png, webp)', value: 'image/*' },
              { label: 'PDF', value: 'application/pdf' },
              { label: 'Word / Excel', value: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
              { label: 'Tous', value: '*' },
            ].map((mime) => {
              const accepts = Array.isArray(v.accept) ? v.accept : [];
              const checked = accepts.includes(mime.value);
              return (
                <label key={mime.value} className="flex items-center gap-2 text-xs text-content-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...accepts, mime.value]
                        : accepts.filter((x) => x !== mime.value);
                      patch({ accept: next });
                    }}
                    className="accent-pink-600"
                  />
                  {mime.label}
                </label>
              );
            })}
          </div>
        </Field>
      )}
    </div>
  );
}

export default function FieldPropertiesPanel({ field, allFields, onUpdate, onClose }) {
  if (!field) {
    return (
      <aside className="w-80 shrink-0 border-l border-line bg-surface-base/50 h-full overflow-y-auto">
        <div className="p-6 text-center">
          <p className="text-xs text-content-tertiary">
            Sélectionnez un champ dans le canvas pour en modifier les propriétés.
          </p>
        </div>
      </aside>
    );
  }

  const otherFields = (allFields || []).filter((f) => f.id !== field.id);
  const needsOptions = ['select', 'radio', 'checkbox'].includes(field.type);

  return (
    <aside className="w-80 shrink-0 border-l border-line bg-surface-base/50 h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-line sticky top-0 bg-surface-base/95 backdrop-blur z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-content-muted font-semibold">
              Champ · {field.type}
            </p>
            <p className="text-xs text-content-primary font-semibold truncate">{field.label}</p>
          </div>
        </div>
      </div>

      <Section title="Général" icon={Settings2} defaultOpen>
        <Field label="Libellé">
          <input
            type="text"
            value={field.label || ''}
            onChange={(e) => onUpdate(field.id, { label: e.target.value })}
            className={inputCls}
          />
        </Field>
        {field.type !== 'hidden' && (
          <>
            <Field label="Placeholder">
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Texte d'aide">
              <input
                type="text"
                value={field.help_text || ''}
                onChange={(e) => onUpdate(field.id, { help_text: e.target.value })}
                className={inputCls}
              />
            </Field>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!field.required}
                onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
                className="accent-pink-600"
              />
              <span className="text-xs text-content-primary">Champ obligatoire</span>
            </label>
          </>
        )}
      </Section>

      {needsOptions && (
        <Section title="Options" icon={ListChecks} defaultOpen>
          <OptionsEditor
            options={field.options}
            onChange={(next) => onUpdate(field.id, { options: next })}
          />
        </Section>
      )}

      {field.type !== 'hidden' && (
        <Section title="Validation" icon={ShieldCheck} defaultOpen={false}>
          <ValidationEditor
            field={field}
            onChange={(next) => onUpdate(field.id, { validation: next })}
          />
        </Section>
      )}

      <Section title="Afficher si…" icon={Zap} defaultOpen={false}>
        <ConditionalLogicEditor
          field={field}
          otherFields={otherFields}
          onChange={(next) => onUpdate(field.id, { conditional_logic: next })}
        />
      </Section>

      <Section title="Avancé" icon={Settings2} defaultOpen={false}>
        <Field label="Clé technique" hint="snake_case, utilisée pour l'export CSV, l'API et le CRM. Modifie uniquement si tu sais ce que tu fais.">
          <input
            type="text"
            value={field.key || ''}
            onChange={(e) => onUpdate(field.id, { key: e.target.value })}
            className={`${inputCls} font-mono`}
          />
        </Field>
      </Section>
    </aside>
  );
}
