'use client';

// ─────────────────────────────────────────────────────────────────────
// DocsSidebar — sidebar gauche du help center
// ─────────────────────────────────────────────────────────────────────
// Affichée sur /docs/[slug] (et optionnellement sur /docs hub).
// - 6 catégories pliables (l'active est dépliée par défaut)
// - Search bar en haut qui filtre la liste en temps réel (matche title/tags)
// - Article courant highlighted (violet, barre latérale)
// ─────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Rocket,
  Search,
  Mail,
  KanbanSquare,
  Plug,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Search as SearchIcon,
  X,
} from 'lucide-react';

const ICON_MAP = {
  Rocket,
  Search,
  Mail,
  KanbanSquare,
  Plug,
  CreditCard,
};

export default function DocsSidebar({ categories, articles, currentSlug }) {
  const [query, setQuery] = useState('');

  // Catégorie active : celle de l'article courant
  const currentCategory = useMemo(() => {
    if (!currentSlug) return null;
    const article = articles.find((a) => a.slug === currentSlug);
    return article?.category || null;
  }, [currentSlug, articles]);

  // État ouvert/fermé par catégorie. Par défaut : tout ouvert si recherche, sinon
  // seule la catégorie courante est ouverte (les autres se déplient au clic).
  const [openCats, setOpenCats] = useState(() => {
    const initial = {};
    categories.forEach((c) => {
      initial[c.id] = c.id === currentCategory || !currentCategory;
    });
    return initial;
  });

  const toggleCat = (id) =>
    setOpenCats((s) => ({ ...s, [id]: !s[id] }));

  // Filtrage temps réel sur titre + tags
  const q = query.trim().toLowerCase();
  const filteredArticlesByCat = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = articles.filter((a) => {
        if (a.category !== c.id) return false;
        if (!q) return true;
        return (
          a.title.toLowerCase().includes(q) ||
          (a.description || '').toLowerCase().includes(q) ||
          (a.tags || []).some((t) => t.toLowerCase().includes(q))
        );
      });
    });
    return map;
  }, [articles, categories, q]);

  const isSearching = q.length > 0;

  return (
    <aside className="w-full lg:w-72 lg:flex-shrink-0">
      <div className="lg:sticky lg:top-20 space-y-3">
        {/* Search */}
        <div className="relative">
          <SearchIcon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cherche un guide…"
            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-line bg-surface-card text-content-primary placeholder:text-content-muted focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-content-muted hover:text-content-primary hover:bg-surface-elevated transition"
              aria-label="Effacer la recherche"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Categories */}
        <nav
          className="space-y-1"
          aria-label="Navigation documentation"
        >
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Rocket;
            const articles = filteredArticlesByCat[cat.id] || [];
            const isOpen = isSearching ? articles.length > 0 : !!openCats[cat.id];
            const hasMatches = articles.length > 0;

            // Quand on cherche et qu'aucun match, on masque la catégorie pour
            // alléger la sidebar.
            if (isSearching && !hasMatches) return null;

            return (
              <div key={cat.id}>
                <button
                  onClick={() => !isSearching && toggleCat(cat.id)}
                  disabled={isSearching}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition
                    text-content-primary hover:bg-surface-card
                    ${isSearching ? 'cursor-default' : ''}
                  `}
                  aria-expanded={isOpen}
                >
                  <Icon size={14} className="text-violet-500 dark:text-violet-400 flex-shrink-0" />
                  <span className="flex-1 text-left">{cat.label}</span>
                  <span className="text-[10px] text-content-muted font-normal">
                    {articles.length}
                  </span>
                  {!isSearching && (isOpen ? (
                    <ChevronDown size={12} className="text-content-muted flex-shrink-0" />
                  ) : (
                    <ChevronRight size={12} className="text-content-muted flex-shrink-0" />
                  ))}
                </button>

                {isOpen && (
                  <ul className="mt-1 ml-2 space-y-px border-l border-line/60">
                    {articles.map((a) => {
                      const isActive = a.slug === currentSlug;
                      return (
                        <li key={a.slug}>
                          <Link
                            href={`/docs/${a.slug}`}
                            aria-current={isActive ? 'page' : undefined}
                            className={`
                              relative block pl-4 pr-3 py-1.5 text-xs leading-snug rounded-r-md transition
                              ${
                                isActive
                                  ? 'text-violet-600 dark:text-violet-300 font-semibold bg-violet-500/5'
                                  : 'text-content-tertiary hover:text-content-primary hover:bg-surface-card'
                              }
                            `}
                          >
                            {isActive && (
                              <span className="absolute left-0 top-1.5 bottom-1.5 w-px bg-violet-500" />
                            )}
                            {a.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}

          {isSearching &&
            Object.values(filteredArticlesByCat).every((arr) => arr.length === 0) && (
              <p className="px-3 py-4 text-xs text-content-muted">
                Aucun article trouvé pour "{query}".
              </p>
            )}
        </nav>
      </div>
    </aside>
  );
}
