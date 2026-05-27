'use client';

// ─────────────────────────────────────────────────────────────────────────
// ConfirmWelcome — animation 2-3 secondes affichée par /auth/confirm
// quand l'email est confirmé et que le user n'a PAS encore été welcomé.
//
// Visuel :
//  - Mascot welcome (taille xl) qui apparait avec fade-in + scale-up
//  - Confetti subtle autour
//  - Texte "Bienvenue dans Volia, [prénom] 👋"
//  - Sous-texte "On t'envoie au dashboard."
//
// Le composant est purement présentation. Le push() vers le dashboard est
// géré par le parent (/auth/confirm) via le callback onComplete au bout du
// timer interne.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import Mascot from './Mascot';
import ConfettiExplosion from './ConfettiExplosion';

const DEFAULT_DURATION_MS = 1800;

export default function ConfirmWelcome({
  firstName = '',
  onComplete,
  durationMs = DEFAULT_DURATION_MS,
}) {
  // Trigger onComplete au bout de la durée — laisse le temps de l'animation
  // + de lire le texte avant le redirect dashboard.
  useEffect(() => {
    if (typeof onComplete !== 'function') return undefined;
    const t = setTimeout(onComplete, durationMs);
    return () => clearTimeout(t);
  }, [onComplete, durationMs]);

  const displayName = (firstName || '').trim();

  return (
    <div className="relative flex flex-col items-center text-center px-6">
      {/* Container relatif pour positionner les confettis derrière la mascotte */}
      <div className="relative w-44 h-44 flex items-center justify-center mb-6">
        <ConfettiExplosion count={32} duration={2200} intensity="normal" />
        <div className="animate-welcome-pop">
          <Mascot variant="welcome" size="xl" />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-content-primary animate-fade-in-up">
        Bienvenue dans Volia{displayName ? `, ${displayName}` : ''}.
      </h1>
      <p className="mt-2 text-sm text-content-secondary animate-fade-in-up-delay">
        On t&apos;envoie au dashboard.
      </p>

      <style jsx>{`
        @keyframes volia-welcome-pop {
          0% {
            opacity: 0;
            transform: scale(0.4) translateY(20px);
          }
          60% {
            opacity: 1;
            transform: scale(1.08) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes volia-fade-in-up {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-welcome-pop {
          animation: volia-welcome-pop 700ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        :global(.animate-fade-in-up) {
          opacity: 0;
          animation: volia-fade-in-up 500ms ease-out 400ms forwards;
        }
        :global(.animate-fade-in-up-delay) {
          opacity: 0;
          animation: volia-fade-in-up 500ms ease-out 700ms forwards;
        }
      `}</style>
    </div>
  );
}
