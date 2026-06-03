'use client';

// ─────────────────────────────────────────────────────────────────────
// /admin/forms/templates — Bibliothèque de templates (Sprint F7)
// ─────────────────────────────────────────────────────────────────────
// Fetch dynamique depuis form_templates (via API /api/admin/forms/templates).
// Filtres par category (chips) + search bar.
//
// Click "Utiliser ce template" → POST /api/admin/forms/templates/use avec
// le slug → redirect vers /admin/forms/[newId] (le builder).
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutTemplate,
  ArrowLeft,
  Plus,
  Loader2,
  Search,
  Mail,
  Calendar,
  FileText,
  UserCheck,
  Download,
  Star,
  MessageSquare,
  Tag,
} from 'lucide-react';

// ─── Métadonnées catégories ─────────────────────────────────────────
const CATEGORY_META = {
  contact:    { label: 'Contact',    icon: Mail,        gradient: 'from-pink-500/20 to-rose-500/20' },
  leadgen:    { label: 'Lead Magnet', icon: Download,    gradient: 'from-amber-500/20 to-orange-500/20' },
  sales:      { label: 'Vente B2B',  icon: FileText,    gradient: 'from-emerald-500/20 to-teal-500/20' },
  event:      { label: 'Événement',  icon: Calendar,    gradient: 'from-violet-500/20 to-fuchsia-500/20' },
  hr:         { label: 'RH',         icon: UserCheck,   gradient: 'from-sky-500/20 to-blue-500/20' },
  feedback:   { label: 'Feedback',   icon: MessageSquare, gradient: 'from-indigo-500/20 to-purple-500/20' },
};

function getCategoryMeta(category) {
  return CATEGORY_META[category] || { label: category, icon: Tag, gradient: 'from-zinc-500/20 to-zinc-400/20' };
}

// SVG illustration fallback (utilisé en preview si pas d'image)
function TemplateIllustration({ category }) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;
  return (
    <div className={`h-32 bg-gradient-to-br ${meta.gradient} flex items-center justify-center border-b border-line relative overflow-hidden`}>
      {/* Decorative dots */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-3 left-4 w-1.5 h-1.5 rounded-full bg-white" />
        <div className="absolute top-7 right-8 w-1 h-1 rounded-full bg-white" />
        <div className="absolute bottom-4 left-10 w-1 h-1 rounded-full bg-white" />
        <div className="absolute bottom-8 right-4 w-1.5 h-1.5 rounded-full bg-white" />
      </div>
      <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur shadow-sm">
        <Icon size={28} className="text-pink-600" />
      </div>
    </div>
  );
}

export default function FormsTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loadingSlug, setLoadingSlug] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/forms/templates');
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || 'Erreur de chargement');
        } else {
          setTemplates(json.data || []);
          setCategories(json.categories || []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtres client-side (rapide, 6 templates de toute façon)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      if (activeCategory !== 'all' && t.category !== activeCategory) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
  }, [templates, activeCategory, search]);

  async function applyTemplate(tpl) {
    setLoadingSlug(tpl.slug);
    setError(null);
    try {
      const res = await fetch('/api/admin/forms/templates/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_slug: tpl.slug }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Erreur création');
        setLoadingSlug(null);
        return;
      }
      router.push(`/admin/forms/${json.data.id}`);
    } catch (e) {
      setError(e.message);
      setLoadingSlug(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link
        href="/admin/forms"
        className="inline-flex items-center gap-1.5 text-xs text-content-tertiary hover:text-pink-700 transition-colors mb-4"
      >
        <ArrowLeft size={14} /> Mes formulaires
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <LayoutTemplate size={14} className="text-pink-600" />
          <p className="text-[11px] uppercase tracking-wider font-semibold text-pink-700">
            Bibliothèque · Sprint F7
          </p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-content-primary tracking-tight">
          Templates
        </h1>
        <p className="mt-2 text-content-tertiary text-sm sm:text-base max-w-2xl">
          Démarrez avec un formulaire pré-rempli adapté à votre cas d&apos;usage.
          Vous personnaliserez tout ensuite dans le builder.
        </p>
      </div>

      {/* Barre filtres + search */}
      <div className="mb-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-faint pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un template…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-card border border-line text-sm text-content-primary placeholder:text-content-faint focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/15 transition-all"
          />
        </div>

        {/* Chips catégories */}
        <div className="flex flex-wrap gap-1.5">
          <CategoryChip
            label="Tout"
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          />
          {categories.map((cat) => {
            const meta = getCategoryMeta(cat);
            return (
              <CategoryChip
                key={cat}
                label={meta.label}
                icon={meta.icon}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* État loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-line bg-surface-card overflow-hidden animate-pulse"
            >
              <div className="h-32 bg-surface-elevated" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-surface-elevated rounded w-3/4" />
                <div className="h-3 bg-surface-elevated rounded w-full" />
                <div className="h-3 bg-surface-elevated rounded w-2/3" />
                <div className="h-8 bg-surface-elevated rounded-lg mt-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state filtré */}
      {!loading && filtered.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-line bg-surface-card/50 p-10 text-center">
          <p className="text-sm text-content-tertiary">
            Aucun template ne matche. Essaye un autre mot.
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tpl) => {
            const isLoading = loadingSlug === tpl.slug;
            const meta = getCategoryMeta(tpl.category);
            return (
              <div
                key={tpl.slug}
                className="group rounded-2xl border border-line bg-surface-card hover:bg-surface-elevated hover:border-pink-200 transition-all overflow-hidden flex flex-col"
              >
                <TemplateIllustration category={tpl.category} />
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-pink-700 px-1.5 py-0.5 rounded bg-pink-50 border border-pink-100">
                      <meta.icon size={9} />
                      {meta.label}
                    </span>
                    {tpl.is_premium && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-100">
                        <Star size={9} /> Premium
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-content-primary group-hover:text-pink-700 transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-content-tertiary leading-relaxed">
                    {tpl.description}
                  </p>

                  {Array.isArray(tpl.use_cases) && tpl.use_cases.length > 0 && (
                    <ul className="mt-2.5 space-y-1">
                      {tpl.use_cases.slice(0, 3).map((u, i) => (
                        <li key={i} className="text-[11px] text-content-tertiary flex items-start gap-1.5">
                          <span className="text-pink-500 mt-0.5">·</span>
                          <span>{u}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-wider text-content-faint">
                    <span>{tpl.fields_count} champs</span>
                    <span>·</span>
                    <span>
                      {tpl.pages_count} {tpl.pages_count > 1 ? 'pages' : 'page'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    disabled={isLoading || !!loadingSlug}
                    className="mt-auto pt-4"
                  >
                    <span className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                      Utiliser ce template
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CategoryChip({ label, icon: Icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active
          ? 'bg-pink-600 text-white border-pink-600 shadow-sm shadow-pink-500/20'
          : 'bg-surface-card text-content-tertiary border-line hover:border-pink-200 hover:text-pink-700'
      }`}
    >
      {Icon && <Icon size={11} />}
      {label}
    </button>
  );
}
