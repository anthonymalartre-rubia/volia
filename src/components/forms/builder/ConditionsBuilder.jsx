'use client';

// ─────────────────────────────────────────────────────────────────────
// ConditionsBuilder — UI réutilisable pour bâtir une condition F4
// ─────────────────────────────────────────────────────────────────────
// Travaille uniquement avec la forme NORMALISÉE :
//   value = { combinator: 'AND'|'OR', conditions: [{ field_key, operator, value }] }
//
// Utilisé par :
//   - FieldPropertiesPanel (logique conditionnelle de field)
//   - JumpLogicDrawer (jump logic de page)
//
// Props :
//   - value (objet ou null)
//   - onChange(nextValue|null)
//   - availableFields (liste des fields utilisables comme cible)
// ─────────────────────────────────────────────────────────────────────

import { Plus, Trash2, GripVertical } from 'lucide-react';
import {
  FORM_CONDITION_OPERATORS,
  OPERATORS_WITHOUT_VALUE,
  OPERATORS_WITH_LIST_VALUE,
  getOperatorsForFieldType,
  normalizeConditionalLogic,
} from '@/lib/forms';

const inputCls =
  'w-full px-2.5 py-1.5 rounded-md bg-surface-card border border-line text-xs text-content-primary focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-colors';

function ConditionRow({ condition, availableFields, onChange, onRemove }) {
  const targetField = availableFields.find((f) => f.key === condition.field_key);
  const allowedOps = targetField ? getOperatorsForFieldType(targetField.type) : null;
  const visibleOperators = FORM_CONDITION_OPERATORS.filter((op) =>
    allowedOps ? allowedOps.includes(op.value) : true
  );

  const needsValue = !OPERATORS_WITHOUT_VALUE.has(condition.operator);
  const isListValue = OPERATORS_WITH_LIST_VALUE.has(condition.operator);

  return (
    <div className="flex items-start gap-1.5 p-2 rounded-lg bg-surface-card border border-line">
      <GripVertical size={11} className="text-content-faint mt-1.5 cursor-grab" />
      <div className="flex-1 grid grid-cols-1 gap-1.5">
        <select
          value={condition.field_key || ''}
          onChange={(e) => onChange({ ...condition, field_key: e.target.value })}
          className={inputCls}
        >
          {availableFields.length === 0 && <option value="">—</option>}
          {availableFields.map((f) => (
            <option key={f.id || f.key} value={f.key}>
              {f.label} ({f.key})
            </option>
          ))}
        </select>
        <select
          value={condition.operator || 'equals'}
          onChange={(e) => onChange({ ...condition, operator: e.target.value })}
          className={inputCls}
        >
          {visibleOperators.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
        {needsValue && (
          targetField && ['select', 'radio'].includes(targetField.type) && !isListValue ? (
            <select
              value={condition.value ?? ''}
              onChange={(e) => onChange({ ...condition, value: e.target.value })}
              className={inputCls}
            >
              <option value="">—</option>
              {(targetField.options || []).map((o, i) => {
                const v = typeof o === 'object' ? o.value : o;
                const l = typeof o === 'object' ? o.label : o;
                return (
                  <option key={i} value={v}>
                    {l}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              type={targetField?.type === 'number' || targetField?.type === 'rating' ? 'number' : 'text'}
              value={condition.value ?? ''}
              onChange={(e) => onChange({ ...condition, value: e.target.value })}
              placeholder={isListValue ? 'valeur1, valeur2, …' : 'Valeur attendue'}
              className={inputCls}
            />
          )
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1 text-content-faint hover:text-rose-600 transition-colors mt-0.5"
        aria-label="Supprimer cette condition"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

export default function ConditionsBuilder({ value, onChange, availableFields }) {
  const normalized = normalizeConditionalLogic(value) || { combinator: 'AND', conditions: [] };

  function patchConditions(nextConditions) {
    onChange({
      combinator: normalized.combinator,
      conditions: nextConditions,
    });
  }

  function addCondition() {
    const first = availableFields[0];
    const newCond = {
      field_key: first?.key || '',
      operator: 'equals',
      value: '',
    };
    patchConditions([...normalized.conditions, newCond]);
  }

  function updateCondition(idx, next) {
    patchConditions(normalized.conditions.map((c, i) => (i === idx ? next : c)));
  }

  function removeCondition(idx) {
    patchConditions(normalized.conditions.filter((_, i) => i !== idx));
  }

  function setCombinator(combinator) {
    onChange({ combinator, conditions: normalized.conditions });
  }

  return (
    <div className="space-y-2">
      {availableFields.length === 0 ? (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          Aucun champ disponible. Ajoute au moins un autre champ pour configurer une condition.
        </p>
      ) : (
        <>
          {normalized.conditions.length >= 2 && (
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-content-tertiary">Faire correspondre :</span>
              <select
                value={normalized.combinator}
                onChange={(e) => setCombinator(e.target.value)}
                className="px-2 py-1 rounded-md bg-surface-card border border-line text-[11px] text-content-primary focus:outline-none focus:ring-2 focus:ring-pink-500/30"
              >
                <option value="AND">Toutes les conditions (ET)</option>
                <option value="OR">Au moins une (OU)</option>
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            {normalized.conditions.map((c, i) => (
              <ConditionRow
                key={i}
                condition={c}
                availableFields={availableFields}
                onChange={(next) => updateCondition(i, next)}
                onRemove={() => removeCondition(i)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addCondition}
            className="w-full inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md border border-dashed border-line text-[11px] text-content-tertiary hover:border-pink-300 hover:text-pink-700 transition-all"
          >
            <Plus size={11} /> Ajouter une condition
          </button>
        </>
      )}
    </div>
  );
}
