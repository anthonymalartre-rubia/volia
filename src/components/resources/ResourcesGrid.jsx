'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Download, Search, X,
  Mail, Phone, Calculator, TrendingUp, ShieldCheck, Flame, BookOpen, Target, Users,
} from 'lucide-react';

const ICON_MAP = {
  Mail, Phone, Calculator, TrendingUp, ShieldCheck, Flame, BookOpen, Target,
};

/**
 * Grille interactive des ressources avec :
 * - Search bar (filtre par titre + description + keywords)
 * - Filtres par catégorie
 * - Filtres par format (PDF / Calculateur)
 * - Social proof : nb downloads par ressource
 */
export default function ResourcesGrid({ resources, downloadCounts = {} }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFormat, setActiveFormat] = useState('all');

  const categories = useMemo(() => {
    const set = new Set(resources.map((r) => r.category));
    return ['all', ...Array.from(set)];
  }, [resources]);

  const formats = useMemo(() => {
    const set = new Set();
    resources.forEach((r) => {
      if (r.deliveryMode === 'direct') set.add('Calculateur');
      else set.add('PDF / Document');
    });
    return ['all', ...Array.from(set)];
  }, [resources]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resources.filter((r) => {
      // Search
      if (q) {
        const haystack = [r.title, r.shortDesc, ...(r.keywords || [])].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      // Category
      if (activeCategory !== 'all' && r.category !== activeCategory) return false;
      // Format
      if (activeFormat !== 'all') {
        const isCalc = r.deliveryMode === 'direct';
        if (activeFormat === 'Calculateur' && !isCalc) return false;
        if (activeFormat === 'PDF / Document' && isCalc) return false;
      }
      return true;
    });
  }, [resources, search, activeCategory, activeFormat]);

  return (
    <div>
      {/* Search + filters bar */}
      <div className="mb-8 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une ressource…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-surface-card border border-line text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-violet-500 transition"
            aria-label="Rechercher dans les ressources"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content-primary"
              aria-label="Effacer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Pills filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition border ${
                activeCategory === c
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-surface-card text-content-secondary border-line hover:border-violet-500/30 hover:text-violet-300'
              }`}
            >
              {c === 'all' ? 'Toutes catégories' : c}
            </button>
          ))}
          <span className="mx-1 self-center text-content-tertiary">·</span>
          {formats.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFormat(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition border ${
                activeFormat === f
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-surface-card text-content-secondary border-line hover:border-indigo-500/30 hover:text-indigo-300'
              }`}
            >
              {f === 'all' ? 'Tous formats' : f}
            </button>
          ))}
        </div>

        {/* Count */}
        <div className="text-xs text-content-tertiary">
          {filtered.length === resources.length
            ? `${resources.length} ressources disponibles`
            : `${filtered.length} ressource${filtered.length > 1 ? 's' : ''} sur ${resources.length}`}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-line">
          <Search size={28} className="mx-auto mb-2 text-content-tertiary opacity-50" />
          <p className="text-content-tertiary">Aucune ressource ne matche. Essaye un autre mot.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filtered.map((r) => {
            const Icon = ICON_MAP[r.icon] || Download;
            const count = downloadCounts[r.slug] || 0;
            return (
              <Link
                key={r.slug}
                href={`/ressources/${r.slug}`}
                className="group rounded-2xl border border-line bg-surface-card hover:bg-surface-elevated hover:border-violet-500/30 transition p-5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                    <Icon size={18} className="text-violet-300" />
                  </div>
                  {count >= 10 && (
                    <span className="inline-flex items-center gap-1 text-xs text-content-tertiary" title={`${count} téléchargements`}>
                      <Users size={11} />
                      {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-content-primary group-hover:text-violet-400 transition mb-2 leading-snug">
                  {r.title}
                </h3>
                <p className="text-sm text-content-secondary leading-relaxed mb-4 flex-1">
                  {r.shortDesc}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-content-tertiary">
                    {r.format}
                    {r.pages ? ` · ${r.pages} pages` : ''}
                  </span>
                  <span className="text-violet-300 font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Télécharger <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
