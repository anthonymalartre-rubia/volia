'use client';

// ─────────────────────────────────────────────────────────────────────────
// GuidedTourOverlay — tour produit léger (optionnel).
//
// Pattern : un overlay non-bloquant qui pointe successivement vers des
// éléments de l'interface (data-tour="search-button", etc.) avec une bulle
// d'info. Le user peut Skip à tout moment.
//
// Trigger : appelé depuis le dashboard quand l'user clique "Plus tard" sur
// FirstLoginWelcome ET qu'on veut quand même lui faire un mini-tour. Pour
// l'instant, c'est un opt-in que le dashboard expose via un hook (à câbler
// dans une future itération).
//
// Volontairement minimaliste : 1-3 steps max, pas de cascade complexe.
// Inspiré de la philosophie Linear (hints inline > tours intrusifs).
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

/**
 * @param {Array<{selector: string, title: string, body: string}>} steps
 * @param {() => void} onComplete - Appelé quand le user termine ou skip
 */
export default function GuidedTourOverlay({ steps = [], onComplete }) {
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState(null); // { top, left, width, height }

  const current = steps[idx];

  // Recalcule la position de la bulle quand on change de step ou que la
  // fenêtre est redimensionnée.
  useEffect(() => {
    if (!current) return undefined;
    function compute() {
      const el = document.querySelector(current.selector);
      if (!el) {
        setPos(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setPos({
        top: r.top + window.scrollY,
        left: r.left + window.scrollX,
        width: r.width,
        height: r.height,
      });
    }
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, { passive: true });
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute);
    };
  }, [current]);

  if (!current) return null;

  function next() {
    if (idx + 1 >= steps.length) {
      if (typeof onComplete === 'function') onComplete();
    } else {
      setIdx(idx + 1);
    }
  }

  function skip() {
    if (typeof onComplete === 'function') onComplete();
  }

  // Si on n'a pas trouvé l'élément (pos null), on affiche la bulle au
  // centre comme fallback.
  const bubbleStyle = pos
    ? {
        top: pos.top + pos.height + 12,
        left: Math.max(16, pos.left),
      }
    : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  return (
    <div className="fixed inset-0 z-[95] pointer-events-none">
      {/* Spotlight halo autour de l'élément */}
      {pos && (
        <div
          aria-hidden="true"
          className="absolute rounded-xl ring-4 ring-violet-500/60 ring-offset-2 ring-offset-transparent transition-all duration-300 pointer-events-none"
          style={{
            top: pos.top - 4,
            left: pos.left - 4,
            width: pos.width + 8,
            height: pos.height + 8,
          }}
        />
      )}

      {/* Bulle d'info */}
      <div
        role="dialog"
        aria-live="polite"
        style={bubbleStyle}
        className="absolute pointer-events-auto max-w-sm bg-surface-card border border-line rounded-xl shadow-2xl shadow-black/40 p-4"
      >
        <button
          type="button"
          onClick={skip}
          aria-label="Fermer le tour"
          className="absolute top-2 right-2 w-7 h-7 rounded-md text-content-tertiary hover:text-content-primary hover:bg-surface-elevated transition flex items-center justify-center"
        >
          <X size={14} />
        </button>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 mb-1">
          Étape {idx + 1} / {steps.length}
        </p>
        <h3 className="text-sm font-semibold text-content-primary mb-1">{current.title}</h3>
        <p className="text-xs text-content-secondary leading-relaxed mb-3">{current.body}</p>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={skip}
            className="text-[11px] text-content-tertiary hover:text-content-secondary transition"
          >
            Passer le tour
          </button>
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition"
          >
            {idx + 1 >= steps.length ? 'Terminer' : 'Suivant'}
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
