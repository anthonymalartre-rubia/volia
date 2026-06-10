'use client';

// ─────────────────────────────────────────────────────────────────────
// NewProjectModal — création de projet en UNE étape (pas de wizard).
// Nom + modèle optionnel (cartes cliquables) + couleur. C'est tout.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { X, Loader2, FolderPlus } from 'lucide-react';
import { PROJECT_COLORS } from '@/lib/projects';

const COLOR_CLASSES = {
  violet: 'bg-violet-500',
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  cyan: 'bg-cyan-500',
};

export default function NewProjectModal({ templates = [], onClose, onCreated }) {
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState(null);
  const [color, setColor] = useState('violet');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e) {
    e?.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), color, template_id: templateId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Erreur création');
      onCreated?.(json.data);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-label="Nouveau projet"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-surface-raised border border-line rounded-2xl shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-content-primary flex items-center gap-2">
            <FolderPlus size={20} className="text-amber-500" />
            Nouveau projet
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-base text-content-tertiary"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du projet (ex: Onboarding Société Dupont)"
          maxLength={200}
          className="w-full px-4 py-3 rounded-xl bg-surface-base border border-line text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-amber-500/50 mb-4"
        />

        {templates.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-2">
              Démarrer depuis un modèle
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {templates.map((tpl) => {
                const selected = templateId === tpl.id;
                const count = Array.isArray(tpl.tasks) ? tpl.tasks.length : 0;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setTemplateId(selected ? null : tpl.id)}
                    className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
                      selected
                        ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
                        : 'border-line bg-surface-base hover:border-amber-500/40'
                    }`}
                  >
                    <span className="block text-sm font-medium text-content-primary truncate">
                      {tpl.emoji} {tpl.name}
                    </span>
                    <span className="block text-[11px] text-content-tertiary mt-0.5">
                      {count === 0 ? 'Vide' : `${count} tâches pré-remplies`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mr-1">
            Couleur
          </span>
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Couleur ${c}`}
              className={`w-6 h-6 rounded-full ${COLOR_CLASSES[c]} transition-transform ${
                color === c ? 'ring-2 ring-offset-2 ring-content-primary scale-110' : 'opacity-60 hover:opacity-100'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={!name.trim() || saving}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : null}
          {saving ? 'Création…' : 'Créer le projet'}
        </button>
      </form>
    </div>
  );
}
