'use client';

// Grid client des tutoriels — sépare la partie interactive (sélection +
// modale player) du shell SEO en RSC (server component) de /tutoriels.
//
// L'ouverture de la modale est gérée ici (state local). Au mount, on lit
// le hash de l'URL (#getting-started, #first-search…) pour permettre les
// deep-links depuis l'onboarding ou la doc.

import { useEffect, useState, useMemo } from 'react';
import { Play, Clock, Rocket, Search, Mail, KanbanSquare, Globe } from 'lucide-react';
import { COLOR_CLASSES, TUTORIELS, getTutorielById } from '@/lib/tutoriels';
import TutorielPlayerModal from '@/components/TutorielPlayerModal';

// Résolution explicite icon name → composant lucide. On ne charge que les
// icônes effectivement utilisées (tree-shaking friendly).
const ICONS = {
  Rocket,
  Search,
  Mail,
  KanbanSquare,
  Globe,
};

export default function TutorielsGrid() {
  const [activeTuto, setActiveTuto] = useState(null);

  // Deep-link via hash (#getting-started) — utile pour l'onboarding qui
  // pointe directement vers /tutoriels#getting-started.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const openFromHash = () => {
      const id = window.location.hash.replace('#', '');
      if (!id) return;
      const tuto = getTutorielById(id);
      if (tuto) setActiveTuto(tuto);
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);

  const cards = useMemo(() => TUTORIELS, []);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((tuto) => {
          const palette = COLOR_CLASSES[tuto.color] || COLOR_CLASSES.violet;
          const Icon = ICONS[tuto.icon] || Play;
          return (
            <article
              key={tuto.id}
              id={tuto.id}
              className="group flex flex-col rounded-2xl border border-line bg-surface-card overflow-hidden hover:border-violet-500/30 hover:bg-surface-elevated transition"
            >
              {/* Thumbnail : gradient + icon module (pas d'image bitmap requise) */}
              <button
                type="button"
                onClick={() => setActiveTuto(tuto)}
                className={`relative aspect-video w-full bg-gradient-to-br ${palette.gradient} flex items-center justify-center overflow-hidden`}
                aria-label={`Regarder ${tuto.title}`}
              >
                <div className={`w-14 h-14 rounded-2xl ${palette.iconBg} flex items-center justify-center backdrop-blur-sm border border-white/10`}>
                  <Icon size={26} />
                </div>
                {/* Bouton play overlay au hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-2xl">
                    <Play size={22} className="text-violet-600 ml-1" fill="currentColor" />
                  </div>
                </div>
                {/* Badge durée bottom-right */}
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 text-white text-[11px] font-mono backdrop-blur-sm">
                  <Clock size={10} />
                  {tuto.duration}
                </span>
              </button>

              {/* Card body */}
              <div className="flex-1 p-4 sm:p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${palette.badge}`}>
                    {tuto.category}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-content-primary leading-snug mb-2">
                  {tuto.title}
                </h2>
                <p className="text-sm text-content-secondary leading-relaxed flex-1">
                  {tuto.description}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTuto(tuto)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600/15 hover:bg-violet-600 text-violet-300 hover:text-white text-sm font-semibold transition self-start"
                >
                  <Play size={13} fill="currentColor" />
                  Regarder
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <TutorielPlayerModal
        tuto={activeTuto}
        onClose={() => setActiveTuto(null)}
        onChangeTuto={setActiveTuto}
      />
    </>
  );
}
