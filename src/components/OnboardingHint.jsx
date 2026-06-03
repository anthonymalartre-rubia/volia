'use client';

import { useState } from 'react';
import { safeStorage } from "@/lib/safe-storage";
import { Lightbulb } from 'lucide-react';

/**
 * Hint contextuel dismissible (gardé en localStorage par storageKey).
 *
 * Avant : ce composant était dupliqué dans SearchPanel et ResultsPanel.
 * Bonus fix (audit P2 #19) : on ne masque PLUS automatiquement tous les
 * hints quand `onboarding_completed` est posé. Avant, faire l'onboarding
 * général une fois condamnait à ne JAMAIS voir les hints contextuels
 * (enrichissement, export). Maintenant chaque hint a son propre cycle de
 * vie via son storageKey.
 */
export default function OnboardingHint({ storageKey, children, dismissLabel = 'Compris' }) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      return safeStorage.get(storageKey) === '1';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { safeStorage.set(storageKey, '1'); } catch {}
  };

  return (
    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07] animate-gentle-glow">
      <div className="p-1.5 rounded-lg bg-indigo-500/15 flex-shrink-0 mt-0.5">
        <Lightbulb size={14} className="text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-indigo-300 leading-relaxed">{children}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-indigo-400 border border-indigo-500/25 hover:bg-indigo-500/15 transition flex-shrink-0"
      >
        {dismissLabel}
      </button>
    </div>
  );
}
