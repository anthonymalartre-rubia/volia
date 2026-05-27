'use client';

// ─────────────────────────────────────────────────────────────────────
// ProductsMenu — dropdown "Produits" exposant les 3 modules de la suite
// ─────────────────────────────────────────────────────────────────────
// Utilisé dans la nav top des pages marketing (landing /, /produits/*,
// /pricing, etc.). Avant on avait un lien direct → /produits/prospection
// qui ne reflétait pas la SUITE Volia (Prospection + Campagnes + CRM).
//
// Comportement :
//   - Desktop : hover open + click pour rester ouvert ; click extérieur ferme
//   - Mobile : tap toggle ouvert/fermé
//   - Esc ferme ; focus trap minimal (click outside)
//   - Couleur d'accent par produit (violet/blue/emerald — cohérent avec
//     LogoMark et ModuleSwitcher in-app)
//
// EN support : passer locale="en" → routes /en/products/{slug}
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, Mail, Users, FormInput } from 'lucide-react';

const PRODUCTS_FR = [
  {
    slug: 'prospection',
    name: 'Volia Prospection',
    description: 'Générez des leads B2B France (101 dépts)',
    icon: Search,
    accent: 'violet',
    badge: 'LIVE',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    slug: 'campagnes',
    name: 'Volia Campagnes',
    description: 'Séquences email automatisées + warmup',
    icon: Mail,
    accent: 'blue',
    badge: 'LIVE',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    slug: 'crm',
    name: 'Volia CRM',
    description: 'Pipeline kanban — réservé plan Business',
    icon: Users,
    accent: 'emerald',
    badge: 'LIVE',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    slug: 'formulaires',
    name: 'Volia Formulaires',
    description: 'Form builder + bridges CRM & Campagnes',
    icon: FormInput,
    accent: 'pink',
    badge: 'LIVE',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
];

const PRODUCTS_EN = [
  {
    slug: 'prospection',
    name: 'Volia Prospection',
    description: 'Generate B2B leads across France',
    icon: Search,
    accent: 'violet',
    badge: 'LIVE',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    slug: 'campaigns',
    name: 'Volia Campaigns',
    description: 'Automated email sequences + warmup',
    icon: Mail,
    accent: 'blue',
    badge: 'LIVE',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    slug: 'crm',
    name: 'Volia CRM',
    description: 'Pipeline kanban — Business plan only',
    icon: Users,
    accent: 'emerald',
    badge: 'LIVE',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    slug: 'forms',
    name: 'Volia Forms',
    description: 'Form builder + native CRM & email bridges',
    icon: FormInput,
    accent: 'pink',
    badge: 'LIVE',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
];

const ACCENT_STYLES = {
  violet: {
    iconBg: 'bg-violet-100 text-violet-600',
    hoverBg: 'group-hover:bg-violet-50',
    name: 'group-hover:text-violet-700',
  },
  blue: {
    iconBg: 'bg-blue-100 text-blue-600',
    hoverBg: 'group-hover:bg-blue-50',
    name: 'group-hover:text-blue-700',
  },
  emerald: {
    iconBg: 'bg-emerald-100 text-emerald-600',
    hoverBg: 'group-hover:bg-emerald-50',
    name: 'group-hover:text-emerald-700',
  },
  pink: {
    iconBg: 'bg-pink-100 text-pink-600',
    hoverBg: 'group-hover:bg-pink-50',
    name: 'group-hover:text-pink-700',
  },
};

export default function ProductsMenu({ label = 'Produits', locale = 'fr' }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const closeTimerRef = useRef(null);
  const isEn = locale === 'en';
  const products = isEn ? PRODUCTS_EN : PRODUCTS_FR;
  const basePath = isEn ? '/en/products' : '/produits';
  const seeAllLabel = isEn ? 'See pricing' : 'Voir les tarifs';
  const seeAllHref = isEn ? '/en/pricing' : '/pricing';

  // Annule un timer de fermeture en attente
  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    cancelClose();
    setOpen(true);
  };

  // Délai 150ms avant fermeture → gère les micro-mouvements souris
  // (ex: traverser le gap entre bouton et dropdown items)
  const handleMouseLeave = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 150);
  };

  // Cleanup timer au unmount
  useEffect(() => () => cancelClose(), []);

  // Click outside fermeture
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-1 text-sm text-content-tertiary hover:text-content-primary transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base rounded"
      >
        {label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown — wrapper avec pt-2 invisible qui BRIDGE le gap entre
          le bouton et la card visible. La souris ne quitte jamais la zone
          hoverable du wrapper. Combiné au délai 150ms, le menu est stable. */}
      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
          onMouseEnter={cancelClose}
        >
          <div
            role="menu"
            className="w-80 sm:w-96 rounded-2xl border border-line bg-surface-base/95 backdrop-blur-xl shadow-2xl shadow-violet-500/10 overflow-hidden relative"
          >
          {/* Hint gradient */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />

          <div className="p-2">
            {products.map((p) => {
              const Icon = p.icon;
              const styles = ACCENT_STYLES[p.accent] || ACCENT_STYLES.violet;
              return (
                <Link
                  key={p.slug}
                  href={`${basePath}/${p.slug}`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={`group flex items-start gap-3 p-3 rounded-xl transition-colors ${styles.hoverBg}`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${styles.iconBg}`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-sm font-semibold text-content-primary transition-colors ${styles.name}`}
                      >
                        {p.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-px rounded border ${p.badgeColor}`}
                      >
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-content-tertiary leading-snug">
                      {p.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer link → pricing */}
          <div className="border-t border-line px-3 py-2.5 bg-surface-card/50">
            <Link
              href={seeAllHref}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between text-xs font-medium text-violet-700 hover:text-violet-600 transition"
            >
              <span>{seeAllLabel}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
