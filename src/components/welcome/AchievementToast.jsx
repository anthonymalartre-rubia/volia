'use client';

// ─────────────────────────────────────────────────────────────────────────
// AchievementToast — toast bottom-right qui apparait quand un achievement
// vient d'être unlocked.
//
// Architecture pub/sub :
//  - Une route API qui détecte un newly_unlocked achievement le retourne
//    dans son JSON : { ..., achievement: { key, label, description, icon } }
//  - Le code client (panel, page) appelle showAchievement(achievement)
//  - showAchievement dispatch un évènement global window 'volia:achievement'
//  - Ce composant écoute l'évènement et render le toast
//
// Pourquoi un event bus plutôt qu'un contexte React : le composant est
// monté UNE FOIS dans le layout dashboard, et n'importe quel descendant
// (panneaux lazy-loaded, modales, etc.) peut tirer un achievement sans
// devoir prop-drill un context. Pattern proche de react-hot-toast.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import * as Icons from 'lucide-react';
import Mascot from './Mascot';
import ConfettiExplosion from './ConfettiExplosion';

const EVENT_NAME = 'volia:achievement';
const AUTO_DISMISS_MS = 5000;

/**
 * API publique : à appeler depuis n'importe où côté client.
 *   import { showAchievement } from '@/components/welcome/AchievementToast';
 *   showAchievement({ key, label, description, icon, color });
 *
 * No-op côté serveur (typeof window check).
 */
export function showAchievement(achievement) {
  if (typeof window === 'undefined' || !achievement) return;
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: achievement }));
  } catch {
    // jsdom / vieux navigateurs : silent fail
  }
}

const COLOR_BG = {
  violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/40',
  indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/40',
  sky: 'from-sky-500/20 to-sky-500/5 border-sky-500/40',
  amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/40',
  emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/40',
  fuchsia: 'from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-500/40',
};

function resolveIcon(name) {
  // lucide-react expose chaque icône en PascalCase. Fallback Trophy.
  const Component = (name && Icons[name]) || Icons.Trophy;
  return Component;
}

export default function AchievementToast() {
  // Stack des toasts (max 3 simultanés, FIFO).
  const [stack, setStack] = useState([]);

  const dismiss = useCallback((id) => {
    setStack((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    function onAchievement(e) {
      const ach = e?.detail;
      if (!ach || !ach.key) return;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setStack((prev) => {
        const next = [...prev, { id, ach }];
        // Cap à 3 pour éviter le spam si plusieurs achievements en parallèle
        return next.length > 3 ? next.slice(-3) : next;
      });
      // Auto-dismiss
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    }
    window.addEventListener(EVENT_NAME, onAchievement);
    return () => window.removeEventListener(EVENT_NAME, onAchievement);
  }, [dismiss]);

  if (stack.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[90] flex flex-col-reverse gap-2 max-w-[calc(100vw-2rem)] sm:max-w-sm pointer-events-none"
    >
      {stack.map(({ id, ach }) => {
        const Icon = resolveIcon(ach.icon);
        const accent = COLOR_BG[ach.color] || COLOR_BG.violet;
        return (
          <div
            key={id}
            role="status"
            className={`relative pointer-events-auto overflow-hidden bg-gradient-to-br ${accent} bg-surface-card/95 backdrop-blur-sm border rounded-xl shadow-2xl shadow-black/30 p-3.5 pr-9 flex items-start gap-3 animate-toast-in`}
          >
            {/* Confetti à l'intérieur du toast */}
            <ConfettiExplosion count={14} duration={2500} intensity="subtle" />

            <div className="shrink-0 relative z-10">
              <Mascot variant="celebration" size="sm" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                <Icon size={11} aria-hidden="true" />
                Achievement débloqué
              </p>
              <p className="text-sm font-semibold text-content-primary mt-0.5 leading-snug">
                {ach.label}
              </p>
              {ach.description && (
                <p className="text-xs text-content-secondary mt-0.5 leading-snug line-clamp-2">
                  {ach.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => dismiss(id)}
              aria-label="Fermer"
              className="absolute top-2 right-2 w-6 h-6 rounded-md text-content-tertiary hover:text-content-primary hover:bg-surface-elevated transition flex items-center justify-center"
            >
              <Icons.X size={12} />
            </button>

            <style jsx>{`
              @keyframes volia-toast-in {
                0% { opacity: 0; transform: translateX(40px) scale(0.95); }
                100% { opacity: 1; transform: translateX(0) scale(1); }
              }
              .animate-toast-in {
                animation: volia-toast-in 350ms cubic-bezier(0.34, 1.32, 0.64, 1) forwards;
              }
            `}</style>
          </div>
        );
      })}
    </div>
  );
}
