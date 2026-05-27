// ─────────────────────────────────────────────────────────────────────
// Logo Volia — composant unifié
// ─────────────────────────────────────────────────────────────────────
//
// 2 sous-composants :
//
// 1. <Logo /> — wordmark complet (juste le texte "Volia")
//    Utilise les SVG public/logos/volia-wordmark-{dark,light}.svg,
//    swap CSS via la classe .light sur <html>.
//
// 2. <LogoIcon /> — symbole 🚀 fusée seul, fond gradient
//    violet → indigo → pink. Pour favicon-like, sidebar, hero, OG images.
//
// Refonte mai 2026 : remplace l'ancien symbole V (entonnoir + diamant
// viseur) par une fusée. Cohérent avec l'animation hero rocket et la
// promesse "décolle ta prospection". Le rocket est l'icon Lucide
// (path lucide v0.x) tournée -45° (cap NE) pour suggérer ascension.
//
// Brand evolution :
// - 2024 : "P + viseur" (Prospectia)
// - Mai 2026 (early) : "V + diamant viseur" (rebrand Volia, focus ciblage)
// - Mai 2026 (late)  : 🚀 fusée (focus traction / vitesse / "décollage")
//
// Concept design : énergie ascendante (Volia, mai 2026).
// ─────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import Image from 'next/image';

const SIZES = {
  xs: { icon: 'h-6 w-6', wordmark: 'h-5' },     // sidebar, footer
  sm: { icon: 'h-7 w-7', wordmark: 'h-6' },     // nav, top bar
  md: { icon: 'h-9 w-9', wordmark: 'h-7' },     // login/signup pages
  lg: { icon: 'h-12 w-12', wordmark: 'h-9' },   // hero landing
  xl: { icon: 'h-16 w-16', wordmark: 'h-12' },  // showcase / large
};

// ─────────────────────────────────────────────────────────────────────
// LogoIcon — symbole 🚀 fusée seul avec fond gradient violet→indigo→pink
// ─────────────────────────────────────────────────────────────────────
// Le gradient et l'orientation -45° matchent EXACTEMENT la fusée animée
// du hero landing (LandingContent.jsx) → continuité brand totale.
// ─────────────────────────────────────────────────────────────────────
export function LogoIcon({
  size = 'md',
  className = '',
  asLink = false,
  href = '/',
  ariaLabel = 'Volia',
}) {
  const s = SIZES[size] || SIZES.md;
  const icon = (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-pink-500 shadow-lg shadow-violet-500/30 ${s.icon} ${className}`}
      aria-label={ariaLabel}
      role="img"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-[62%] h-[62%] -rotate-45"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Fusée (Lucide icon Rocket) — corps + ailettes + flammes */}
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    </span>
  );

  if (asLink) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-90 transition">
        {icon}
      </Link>
    );
  }
  return icon;
}

// ─────────────────────────────────────────────────────────────────────
// Logo — wordmark complet (juste le texte "Volia")
// ─────────────────────────────────────────────────────────────────────
//
// 2 SVG en swap CSS via la classe .light (ajoutée sur <html> par
// ThemeProvider en mode light) :
// - volia-wordmark-dark.svg : fill blanc, visible sur fond sombre
// - volia-wordmark-light.svg : fill noir, visible sur fond clair
//
// Pourquoi 2 fichiers et pas fill="currentColor" : <Image> de next/image
// traite le SVG comme un raster et NE propage PAS currentColor. Les
// alternatives (mask-image, inline SVG) sont plus lourdes à maintenir.
//
// Variants :
// - "wordmark" : SVG texte "Volia"
// - "icon" : juste le symbole V (alias de LogoIcon)
//
export default function Logo({
  variant = 'wordmark',
  size = 'md',
  className = '',
  asLink = false,
  href = '/',
}) {
  if (variant === 'icon') {
    return <LogoIcon size={size} className={className} asLink={asLink} href={href} />;
  }

  const s = SIZES[size] || SIZES.md;
  const wordmark = (
    <span
      className={`inline-flex items-center ${className}`}
      aria-label="Volia"
    >
      {/* Version dark mode (par défaut, fill blanc) — masquée en .light */}
      <Image
        src="/logos/volia-wordmark-dark.svg"
        alt=""
        width={480}
        height={150}
        className={`w-auto block [.light_&]:hidden ${s.wordmark}`}
        priority={size === 'lg' || size === 'xl'}
      />
      {/* Version light mode (fill noir) — visible uniquement quand .light */}
      <Image
        src="/logos/volia-wordmark-light.svg"
        alt=""
        width={480}
        height={150}
        className={`w-auto hidden [.light_&]:block ${s.wordmark}`}
        priority={size === 'lg' || size === 'xl'}
      />
    </span>
  );

  if (asLink) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-90 transition">
        {wordmark}
      </Link>
    );
  }
  return wordmark;
}
