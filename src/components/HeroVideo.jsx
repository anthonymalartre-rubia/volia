'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, X } from 'lucide-react';
import { trackProductEvent } from '@/lib/track';

/**
 * Vidéo « démo produit » du hero landing.
 *
 * Pattern hybride SaaS :
 *  - boucle MUETTE en autoplay dans le hero (le « wow » visuel, n'impacte pas le
 *    LCP grâce au poster), encadrée dans une fausse fenêtre navigateur cohérente
 *    avec les cards du hero.
 *  - au clic → modale qui joue le commercial narré complet (`fullSrc`).
 *
 * Tant qu'aucun asset n'est fourni, ne pas activer (cf. HERO_VIDEO dans
 * LandingContent.jsx) : le hero garde son mockup 3-cards.
 *
 * Assets attendus (à déposer dans /public/hero/) :
 *  - loopSrc / loopWebm : boucle 12-20s, sans son, < 3 Mo (MP4 H.264 + WebM VP9)
 *  - poster             : 1ère frame en WebP/JPG (affichée avant lecture)
 *  - fullSrc            : commercial 45-60s. MP4 direct, OU laisser vide et
 *                         brancher un lecteur Mux/Cloudflare Stream (cf. note bas).
 */
export default function HeroVideo({
  loopSrc = '',
  loopWebm = '',
  poster = '',
  fullSrc = '',
  caption = 'Démo Volia',
}) {
  const [open, setOpen] = useState(false);
  const videoRef = useRef(null);

  // Accessibilité : pas d'autoplay de la boucle si l'utilisateur a demandé à
  // réduire les animations.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduce) v.pause();
  }, []);

  const openModal = useCallback(() => {
    if (!fullSrc) return;
    setOpen(true);
    trackProductEvent('hero_video_play');
  }, [fullSrc]);

  // ESC pour fermer + verrou du scroll body pendant la modale.
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

  return (
    <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-150">
      {/* Sticker « live » repris du mockup pour la continuité visuelle */}
      <div className="absolute -top-4 -left-4 z-20 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 shadow-md flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold text-emerald-700">{caption}</span>
      </div>

      {/* Fausse fenêtre navigateur autour de la vidéo */}
      <div className="rounded-2xl bg-white border border-line shadow-2xl shadow-violet-500/10 overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-line bg-surface-alt">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="ml-3 text-[11px] text-content-tertiary font-medium">app.volia.fr</span>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="group relative block w-full aspect-video bg-surface-alt"
          aria-label={fullSrc ? 'Voir la démo complète' : 'Aperçu Volia'}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={poster || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            {loopWebm ? <source src={loopWebm} type="video/webm" /> : null}
            {loopSrc ? <source src={loopSrc} type="video/mp4" /> : null}
          </video>

          {/* Bouton play visible seulement si un commercial complet est dispo */}
          {fullSrc ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
              <span className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 shadow-lg text-sm font-semibold text-content-primary">
                <Play size={16} className="text-violet-600 fill-violet-600" />
                Voir la démo · 45s
              </span>
            </span>
          ) : null}
        </button>
      </div>

      {/* Carte décorative flottante reprise du mockup */}
      <div className="hidden lg:flex absolute -bottom-4 -right-4 z-20 px-4 py-2.5 rounded-xl bg-white border border-line shadow-xl items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1000">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 via-blue-500 to-emerald-500 flex items-center justify-center">
          <Play size={16} className="text-white fill-white" />
        </div>
        <div>
          <div className="text-[10px] text-content-tertiary uppercase tracking-wider font-semibold">Volia en action</div>
          <div className="text-xs font-bold text-content-primary">Prospection → CRM</div>
        </div>
      </div>

      {/* Modale lecteur du commercial complet */}
      {open && fullSrc ? (
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
            {/* MP4 direct. Pour Mux/Cloudflare Stream : remplacer ce <video> par
                leur <iframe> d'embed (fullSrc = URL d'embed). */}
            <video
              className="w-full h-full rounded-xl shadow-2xl bg-black"
              src={fullSrc}
              poster={poster || undefined}
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
