'use client';

// Modal lecteur Loom — utilisée par la page /tutoriels et potentiellement
// ailleurs (par ex. ancrage `#getting-started` depuis l'OnboardingChecklist).
//
// Logique :
//   - Lazy mount du <iframe> : on ne charge l'embed qu'à l'ouverture (perf).
//   - Fermeture sur ESC + clic sur l'overlay + bouton X.
//   - Bloque le scroll du body tant que la modale est ouverte.
//   - Bouton « Vidéo suivante » qui swap le tutoriel actif sans démonter
//     la modale (UX type lecteur YouTube).
//
// La modale ne s'auto-ouvre pas : c'est le parent (TutorielsGrid) qui
// contrôle l'état via les props `tuto` + `onClose` + `onChangeTuto`.

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, Clock, ArrowRight, FileText } from 'lucide-react';
import { COLOR_CLASSES, getNextTutoriel } from '@/lib/tutoriels';

export default function TutorielPlayerModal({ tuto, onClose, onChangeTuto }) {
  // Lock body scroll + listen ESC tant que la modale est ouverte.
  useEffect(() => {
    if (!tuto) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [tuto, onClose]);

  const handleNext = useCallback(() => {
    if (!tuto) return;
    const next = getNextTutoriel(tuto.id);
    if (next && onChangeTuto) onChangeTuto(next);
  }, [tuto, onChangeTuto]);

  if (!tuto) return null;

  const palette = COLOR_CLASSES[tuto.color] || COLOR_CLASSES.violet;
  const nextTuto = getNextTutoriel(tuto.id);
  const isLast = nextTuto?.id === tuto.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tuto-modal-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-base border border-line shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la vidéo"
          className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-surface-elevated/80 text-content-tertiary hover:text-content-primary hover:bg-surface-elevated transition"
        >
          <X size={16} />
        </button>

        {/* Loom embed — aspect ratio 16/9 responsive */}
        <div className="aspect-video w-full bg-black rounded-t-2xl overflow-hidden">
          {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
          <iframe
            key={tuto.id}
            src={tuto.loomEmbedUrl}
            title={tuto.title}
            frameBorder="0"
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            className="w-full h-full"
          />
        </div>

        {/* Description + docs liés + next */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${palette.badge}`}>
                  {tuto.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-content-tertiary">
                  <Clock size={11} />
                  {tuto.duration}
                </span>
              </div>
              <h2 id="tuto-modal-title" className="text-xl sm:text-2xl font-bold text-content-primary leading-tight">
                {tuto.title}
              </h2>
              <p className="mt-2 text-sm text-content-secondary leading-relaxed">
                {tuto.description}
              </p>
            </div>
          </div>

          {/* Docs liées */}
          {tuto.relatedDocs?.length > 0 && (
            <div className="pt-4 border-t border-line/60">
              <p className="text-[11px] uppercase tracking-wider text-content-muted font-semibold mb-2">
                Documentation associée
              </p>
              <ul className="grid sm:grid-cols-2 gap-2">
                {tuto.relatedDocs.map((href) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-card border border-line text-xs text-content-secondary hover:text-content-primary hover:border-violet-500/30 hover:bg-surface-elevated transition"
                    >
                      <FileText size={12} className="text-violet-400 flex-shrink-0" />
                      <span className="truncate">{href}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next video */}
          {nextTuto && !isLast && (
            <div className="pt-4 border-t border-line/60 flex items-center justify-between gap-4 flex-wrap">
              <div className="text-xs text-content-tertiary leading-snug">
                <span className="text-content-muted">À suivre · </span>
                <span className="text-content-primary font-semibold">{nextTuto.title}</span>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition"
              >
                Vidéo suivante
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
