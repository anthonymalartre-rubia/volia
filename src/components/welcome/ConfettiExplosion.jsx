'use client';

// ─────────────────────────────────────────────────────────────────────────
// ConfettiExplosion — animation confetti pure CSS sans dépendance externe.
//
// On évite canvas-confetti / react-confetti pour rester sur le budget JS
// actuel (browserslist moderne + bundle analyzer). 24 particules carrées
// animées via @keyframes définis inline (style jsx-less : tailwind +
// CSS vars custom). Auto-dismiss après ~2.5s, retire la node du DOM
// pour libérer la GPU.
//
// Props :
//   - count : nombre de particules (default 24, max 60)
//   - duration : ms — durée totale avant unmount (default 2500)
//   - intensity : 'subtle' | 'normal' | 'wild' (default 'normal')
//
// Le composant se base sur prefers-reduced-motion : si l'user a demandé
// motion réduite, on skip entièrement l'animation.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react';

const COLORS = [
  '#7c3aed', // violet-600 (brand)
  '#a78bfa', // violet-400
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#ec4899', // pink-500
  '#3b82f6', // blue-500
];

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export default function ConfettiExplosion({
  count = 24,
  duration = 2500,
  intensity = 'normal',
  className = '',
}) {
  const [mounted, setMounted] = useState(true);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  useEffect(() => {
    if (reduced) {
      setMounted(false);
      return undefined;
    }
    const t = setTimeout(() => setMounted(false), duration);
    return () => clearTimeout(t);
  }, [duration, reduced]);

  if (!mounted || reduced) return null;

  const n = Math.min(Math.max(count, 1), 60);
  const spread = intensity === 'wild' ? 360 : intensity === 'subtle' ? 90 : 180;

  // Pré-calcul des particules : chaque particule a un angle, distance,
  // taille, couleur et delay random. Calcul une seule fois au mount.
  const particles = Array.from({ length: n }).map((_, i) => {
    const angle = (Math.random() - 0.5) * spread; // -spread/2 → +spread/2
    const distance = 80 + Math.random() * 180; // px
    const size = 6 + Math.random() * 6; // px
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const delay = Math.random() * 200; // ms
    const rotate = Math.random() * 720 - 360; // deg
    const tx = Math.sin((angle * Math.PI) / 180) * distance;
    const ty = -Math.cos((angle * Math.PI) / 180) * distance - 40;
    return { i, size, color, delay, rotate, tx, ty };
  });

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {particles.map((p) => (
        <span
          key={p.i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.i % 3 === 0 ? '50%' : '2px',
            opacity: 0,
            transform: 'translate(-50%, -50%)',
            animation: `volia-confetti-burst ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${p.delay}ms forwards`,
            // CSS vars consommées par le keyframe
            '--vc-tx': `${p.tx}px`,
            '--vc-ty': `${p.ty}px`,
            '--vc-rot': `${p.rotate}deg`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes volia-confetti-burst {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(0.4);
          }
          15% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(var(--vc-tx), var(--vc-ty)) rotate(var(--vc-rot)) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
