'use client';

// ─────────────────────────────────────────────────────────────────────
// LanguageSwitcher — switcher FR / EN visible dans le header marketing
// ─────────────────────────────────────────────────────────────────────
// Pattern minimal "FR | EN" avec la langue active soulignée. Au clic :
// navigue vers la même page dans l'autre locale (ex: /pricing ↔
// /en/pricing). Utilise usePathname() pour calculer le href cross-locale.
//
// Mapping URL :
//   /                 → /en
//   /pricing          → /en/pricing
//   /produits/x       → /en/products/x
//   /en               → /
//   /en/pricing       → /pricing
//   /en/products/x    → /produits/x
//
// Pages qui ne sont pas (encore) traduites côté /en/ retombent sur /en
// pour éviter un 404 (blog, glossaire, guide, outils, comparatifs sont
// FR-only pour l'instant).
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Pages qui ont une version EN dédiée. Si la page n'est pas dans cette
// liste, on retombe sur /en (landing) ou / (landing FR).
const EN_TRANSLATED_PREFIXES = [
  '/en',
  '/en/pricing',
  '/en/products',
];

// Mapping FR → EN pour les segments d'URL qui changent.
const FR_TO_EN_SEGMENT = {
  '/produits': '/en/products',
};

// Mapping EN → FR.
const EN_TO_FR_SEGMENT = {
  '/en/products': '/produits',
};

function toEnHref(pathname) {
  if (!pathname || pathname === '/') return '/en';
  // Mapping spécifique (ex: /produits/* → /en/products/*)
  for (const [fr, en] of Object.entries(FR_TO_EN_SEGMENT)) {
    if (pathname.startsWith(fr)) return en + pathname.slice(fr.length);
  }
  // /pricing → /en/pricing
  if (pathname === '/pricing') return '/en/pricing';
  // Pour les autres pages FR-only (blog, glossaire, guide…), retomber
  // sur la landing EN pour éviter un 404.
  return '/en';
}

function toFrHref(pathname) {
  if (!pathname || pathname === '/en') return '/';
  for (const [en, fr] of Object.entries(EN_TO_FR_SEGMENT)) {
    if (pathname.startsWith(en)) return fr + pathname.slice(en.length);
  }
  if (pathname === '/en/pricing') return '/pricing';
  return '/';
}

export default function LanguageSwitcher({ className = '' }) {
  const pathname = usePathname() || '/';
  const isEn = pathname === '/en' || pathname.startsWith('/en/');

  const frHref = isEn ? toFrHref(pathname) : pathname;
  const enHref = isEn ? pathname : toEnHref(pathname);

  return (
    <div className={`flex items-center gap-1 text-xs font-semibold ${className}`} aria-label="Sélectionner la langue">
      <Link
        href={frHref}
        prefetch={false}
        aria-current={!isEn ? 'true' : undefined}
        className={
          !isEn
            ? 'text-content-primary underline underline-offset-4 decoration-2 decoration-violet-500'
            : 'text-content-tertiary hover:text-content-primary transition'
        }
      >
        FR
      </Link>
      <span className="text-content-muted" aria-hidden="true">|</span>
      <Link
        href={enHref}
        prefetch={false}
        aria-current={isEn ? 'true' : undefined}
        className={
          isEn
            ? 'text-content-primary underline underline-offset-4 decoration-2 decoration-violet-500'
            : 'text-content-tertiary hover:text-content-primary transition'
        }
      >
        EN
      </Link>
    </div>
  );
}
