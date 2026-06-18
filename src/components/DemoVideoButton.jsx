'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { trackProductEvent } from '@/lib/track';

/**
 * Bouton « Voir une démo » qui ouvre une vidéo YouTube en modale.
 *
 * - `youtubeId` vide → on garde l'ancre vers la démo live (`fallbackHref`),
 *   donc aucun changement de comportement tant que la vidéo n'est pas branchée.
 * - Lecteur via youtube-nocookie.com (RGPD-friendly), iframe chargée UNIQUEMENT
 *   à l'ouverture (pas de poids ni de cookie au chargement de la page).
 * - ESC + clic en dehors pour fermer, scroll body verrouillé, tracking.
 */
export default function DemoVideoButton({
  videoSrc = '',
  youtubeId = '',
  className = '',
  children,
  fallbackHref = '#try-live',
}) {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
    trackProductEvent('demo_video_play', { source: 'hero' });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!youtubeId && !videoSrc) {
    return <a href={fallbackHref} className={className}>{children}</a>;
  }

  return (
    <>
      <button type="button" onClick={handleOpen} className={className}>
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white flex items-center gap-1 text-sm"
              aria-label="Fermer la vidéo"
            >
              <X size={18} /> Fermer
            </button>
            {videoSrc ? (
              // MP4 auto-hébergé : marche pour tous (Brave/adblock inclus), 0 cookie tiers.
              <video
                className="w-full h-full rounded-xl shadow-2xl bg-black"
                src={videoSrc}
                controls
                autoPlay
                playsInline
              />
            ) : (
              <iframe
                className="w-full h-full rounded-xl shadow-2xl bg-black"
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title="Démo Volia"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
