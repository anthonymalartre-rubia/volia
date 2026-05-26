'use client';

// ─────────────────────────────────────────────────────────────────────
// LogicOverview — Read-only viewer arborescent de toute la logique (F4)
// ─────────────────────────────────────────────────────────────────────
// Affiche : pages → jump_logic + fields visibles/conditionnels.
// Utile pour debug & confiance utilisateur.
// ─────────────────────────────────────────────────────────────────────

import { X, FileText, Zap, FormInput, ArrowRight, Send } from 'lucide-react';
import {
  FORM_CONDITION_OPERATORS,
  normalizeConditionalLogic,
} from '@/lib/forms';

function operatorLabel(value) {
  return FORM_CONDITION_OPERATORS.find((o) => o.value === value)?.label || value;
}

function formatCondition(rawCondition) {
  const norm = normalizeConditionalLogic(rawCondition);
  if (!norm || norm.conditions.length === 0) return null;
  const sep = norm.combinator === 'OR' ? ' OU ' : ' ET ';
  return norm.conditions
    .map((c) => {
      const op = operatorLabel(c.operator);
      const valStr = c.value !== undefined && c.value !== '' ? ` "${c.value}"` : '';
      return `"${c.field_key}" ${op}${valStr}`;
    })
    .join(sep);
}

export default function LogicOverview({ open, schema, onClose }) {
  if (!open) return null;

  const pages = [...(schema.pages || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
  const fieldsByPage = new Map();
  for (const f of schema.fields || []) {
    if (!fieldsByPage.has(f.page_id)) fieldsByPage.set(f.page_id, []);
    fieldsByPage.get(f.page_id).push(f);
  }
  fieldsByPage.forEach((arr) => arr.sort((a, b) => (a.position || 0) - (b.position || 0)));

  const totalRules = pages.reduce((acc, p) => acc + (p.jump_logic?.rules?.length || 0), 0);
  const totalConditionalFields = (schema.fields || []).filter((f) => f.conditional_logic?.show_if).length;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
        aria-label="Fermer"
      />

      <div className="ml-auto relative w-full max-w-lg bg-surface-base shadow-2xl border-l border-line flex flex-col h-full">
        <header className="shrink-0 px-5 py-4 border-b border-line flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-content-muted font-semibold flex items-center gap-1">
              <Zap size={11} /> Vue d&apos;ensemble de la logique
            </p>
            <h2 className="mt-0.5 text-sm font-semibold text-content-primary">
              {totalConditionalFields} champ{totalConditionalFields > 1 ? 's' : ''} conditionnel{totalConditionalFields > 1 ? 's' : ''} ·{' '}
              {totalRules} règle{totalRules > 1 ? 's' : ''} de saut
            </h2>
            <p className="mt-1 text-[11px] text-content-tertiary">
              Vue en lecture seule. Édite via le panneau de droite ou le bouton ⚡ d&apos;un onglet de page.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-content-faint hover:bg-surface-card hover:text-content-primary transition-colors"
            aria-label="Fermer"
          >
            <X size={14} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {pages.length === 0 && (
            <p className="text-xs text-content-tertiary italic">Aucune page.</p>
          )}

          {pages.map((page) => {
            const pageFields = fieldsByPage.get(page.id) || [];
            const rules = page.jump_logic?.rules || [];
            return (
              <section key={page.id} className="rounded-xl border border-line bg-surface-card p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <FileText size={12} className="text-pink-600" />
                  <h3 className="text-xs font-semibold text-content-primary">
                    {page.title || page.id}
                  </h3>
                  <span className="text-[10px] text-content-faint">
                    · {pageFields.length} champ{pageFields.length > 1 ? 's' : ''}
                  </span>
                </div>

                {rules.length > 0 && (
                  <ul className="mb-2 ml-4 space-y-1">
                    {rules.map((r, i) => {
                      const condStr = formatCondition(r.condition) || '(condition vide)';
                      const targetLabel =
                        r.target_page_id === 'submit'
                          ? 'Soumettre'
                          : pages.find((p) => p.id === r.target_page_id)?.title || r.target_page_id;
                      return (
                        <li key={i} className="text-[11px] text-violet-700 flex items-start gap-1.5">
                          <Zap size={10} className="mt-0.5 shrink-0" />
                          <span>
                            Si {condStr} <ArrowRight size={10} className="inline mx-0.5" />{' '}
                            {r.target_page_id === 'submit' ? (
                              <span className="inline-flex items-center gap-0.5">
                                <Send size={9} /> {targetLabel}
                              </span>
                            ) : (
                              targetLabel
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {pageFields.length === 0 ? (
                  <p className="ml-4 text-[11px] text-content-faint italic">
                    Aucun champ sur cette page.
                  </p>
                ) : (
                  <ul className="ml-4 space-y-0.5">
                    {pageFields.map((f) => {
                      const condStr = formatCondition(f.conditional_logic?.show_if);
                      return (
                        <li key={f.id} className="text-[11px] text-content-tertiary flex items-start gap-1.5">
                          <FormInput size={10} className="mt-0.5 shrink-0 text-content-faint" />
                          <span>
                            <span className="text-content-primary">{f.label}</span>
                            <span className="text-content-faint"> ({f.key})</span>
                            {condStr ? (
                              <span className="text-violet-700"> · si {condStr}</span>
                            ) : (
                              <span className="text-content-faint italic"> · toujours visible</span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
