'use client';

// Bannière sticky-top affichée pendant un scraping en cours.
// But UX : prévenir l'utilisateur que fermer = perdre tous les prospects
// scrapés mais pas encore insérés en DB (insert en bloc à la fin de la boucle).
// Couplée au beforeunload handler dans dashboard/page.js qui ajoute aussi
// le popup natif du navigateur.

import { AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SearchInProgressBanner({ isSearching, current, total, currentQuery }) {
  const [dismissed, setDismissed] = useState(false);

  // Reset le dismiss à chaque nouveau search start
  useEffect(() => {
    if (isSearching) setDismissed(false);
  }, [isSearching]);

  if (!isSearching || dismissed) return null;

  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <AlertTriangle className="shrink-0 animate-pulse" size={18} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">
            ⚠️ Recherche en cours — NE FERMEZ PAS CETTE PAGE
          </p>
          <p className="text-xs opacity-90 leading-tight mt-0.5">
            <strong>{current}/{total}</strong> ({pct}%) ·
            Les prospects sont sauvés en base seulement quand la recherche se termine.
            Si tu fermes maintenant, tu perds tout. Pour arrêter sans perte, clique le bouton « Arrêter » rouge.
            {currentQuery && <span className="ml-1 italic opacity-75">· {currentQuery}</span>}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded hover:bg-white/20 transition"
          aria-label="Masquer la bannière (le warning reste actif)"
          title="Masquer la bannière (le scraping continue)"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
