'use client';

// ─────────────────────────────────────────────────────────────────────
// NewPipelineModal — création d'un nouveau pipeline avec template.
// ─────────────────────────────────────────────────────────────────────
// Props :
//   - open : bool
//   - onClose : () => void
//   - onCreated(pipeline) : callback après POST success
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { X, Loader2, AlertCircle, Check, GitBranch } from 'lucide-react';
import { PIPELINE_TEMPLATES, PIPELINE_COLORS } from '@/lib/crm';

const COLOR_DOT = {
  zinc: 'bg-zinc-400',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
};

const TEMPLATE_LIST = ['sales', 'recruiting', 'partnerships', 'custom'];

export default function NewPipelineModal({ open, onClose, onCreated }) {
  const [templateId, setTemplateId] = useState('sales');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('emerald');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset à l'ouverture + pré-remplit depuis le template choisi
  useEffect(() => {
    if (open) {
      const tpl = PIPELINE_TEMPLATES.sales;
      setTemplateId('sales');
      setName(tpl.name);
      setDescription(tpl.description);
      setColor(tpl.color);
      setError('');
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, submitting, onClose]);

  if (!open) return null;

  function handleSelectTemplate(id) {
    const tpl = PIPELINE_TEMPLATES[id];
    if (!tpl) return;
    setTemplateId(id);
    setName(tpl.name);
    setDescription(tpl.description);
    setColor(tpl.color);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Le nom du pipeline est requis');
      return;
    }
    const tpl = PIPELINE_TEMPLATES[templateId] || PIPELINE_TEMPLATES.custom;

    setSubmitting(true);
    try {
      const res = await fetch('/api/crm/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim() || null,
          color,
          stages: tpl.stages,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erreur création pipeline');
      }
      onCreated?.(json.data);
      onClose();
    } catch (err) {
      console.error('[NewPipelineModal] submit error', err);
      setError(err.message || 'Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => !submitting && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-pipeline-modal-title"
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-surface-card border border-line shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-line flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <GitBranch size={18} className="text-white" />
            </div>
            <div>
              <h2 id="new-pipeline-modal-title" className="text-base font-semibold text-content-primary">
                Nouveau pipeline
              </h2>
              <p className="text-xs text-content-tertiary mt-0.5">
                Crée un pipeline custom avec ses stages.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-elevated transition disabled:opacity-50"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-5 space-y-5 flex-1">
          {/* Templates */}
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-2 uppercase tracking-wider">
              Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATE_LIST.map((id) => {
                const tpl = PIPELINE_TEMPLATES[id];
                const isSelected = templateId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectTemplate(id)}
                    disabled={submitting}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm shadow-emerald-500/10'
                        : 'border-line bg-surface-card hover:border-emerald-200 hover:bg-emerald-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-semibold ${isSelected ? 'text-emerald-700' : 'text-content-primary'}`}>
                        {tpl.label}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-content-tertiary leading-relaxed line-clamp-2">
                      {tpl.description}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      {tpl.stages.slice(0, 6).map((s, idx) => (
                        <span
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${COLOR_DOT[s.color] || 'bg-zinc-400'}`}
                          title={s.name}
                        />
                      ))}
                      <span className="text-[10px] text-content-muted ml-1 tabular-nums">
                        {tpl.stages.length} stages
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nom */}
          <div>
            <label htmlFor="pipeline-name" className="block text-xs font-semibold text-content-secondary mb-1.5 uppercase tracking-wider">
              Nom du pipeline <span className="text-rose-600">*</span>
            </label>
            <input
              id="pipeline-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              placeholder="Ex : Pipeline commercial"
              required
              maxLength={120}
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="pipeline-description" className="block text-xs font-semibold text-content-secondary mb-1.5 uppercase tracking-wider">
              Description <span className="text-content-muted font-normal">(optionnel)</span>
            </label>
            <textarea
              id="pipeline-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              rows={2}
              maxLength={500}
              placeholder="À quoi sert ce pipeline ?"
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface-card text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
            />
          </div>

          {/* Couleur */}
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-2 uppercase tracking-wider">
              Couleur d&apos;accent
            </label>
            <div className="flex flex-wrap gap-2">
              {PIPELINE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  disabled={submitting}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    color === c
                      ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                  aria-label={`Couleur ${c}`}
                >
                  <span className={`w-5 h-5 rounded-full ${COLOR_DOT[c]}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-line flex justify-end gap-2 flex-shrink-0 bg-surface-elevated/30">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl border border-line bg-surface-card text-sm font-medium text-content-secondary hover:text-content-primary hover:bg-surface-elevated transition disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Créer le pipeline
          </button>
        </div>
      </div>
    </div>
  );
}
