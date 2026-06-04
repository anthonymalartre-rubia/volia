// Button primitive partagée — la dette #1 du design system.
//
// Avant : chaque bouton ré-écrivait son style Tailwind (px-X py-X rounded-X
// bg-violet-500 hover:bg-violet-400 transition ...). 50+ variants en
// circulation, 0 cohérence. Modifier un radius = grep partout.
//
// Après : 4 variants × 3 sizes = 12 styles canoniques. Tout le reste passe
// par className pour les cas exotiques.
//
// Variants :
// - primary   : CTA principal (violet/indigo gradient + shadow)
// - secondary : action neutre (surface card + border)
// - ghost     : action discrète (transparent + hover bg)
// - danger    : action destructive (rouge)
//
// Sizes :
// - sm : compact (px-3 py-1.5 text-xs)
// - md : standard (px-4 py-2.5 text-sm) — default
// - lg : large (px-5 py-3 text-sm font-semibold)

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

// Brand Sprint 2 — micro-animations subtle :
// - hover : scale 1.02 + glow violet diffus (sur primary uniquement)
// - active : scale 0.98 (feedback haptique-like)
// - disabled : opacity 60 + cursor not-allowed
// Forme commune des CTA primaires, couleur par module (prop `tone`).
// Permet d'harmoniser la FORME des boutons primaires entre modules
// (Prospection/Campagnes/CRM/Autopilot) tout en gardant l'identité couleur.
const SCALE = 'hover:scale-[1.02] active:scale-[0.98]';
const PRIMARY_TONES = {
  violet: 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40',
  blue: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40',
  emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40',
  amber: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40',
  pink: 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40',
};

const VARIANTS = {
  primary: `${PRIMARY_TONES.violet} ${SCALE}`, // surchargé par `tone` dans le composant
  secondary:
    'bg-surface-card hover:bg-surface-elevated text-content-primary border border-line hover:border-line-hover hover:scale-[1.01] active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-surface-elevated text-content-secondary hover:text-content-primary active:scale-[0.98]',
  danger:
    'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3 text-sm font-semibold rounded-xl gap-2',
};

const BASE =
  'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out will-change-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base';

/**
 * Button (ou Link si href est passé)
 *
 * Props :
 * - variant : 'primary' (default) | 'secondary' | 'ghost' | 'danger'
 * - size    : 'sm' | 'md' (default) | 'lg'
 * - href    : si présent, rend un <Link> au lieu d'un <button>
 * - loading : affiche un spinner et désactive
 * - icon    : composant Lucide à placer à gauche du label
 * - iconRight : composant Lucide à placer à droite (utile pour →)
 * - fullWidth : 100% width
 * - className : classes additionnelles (override exceptionnel)
 */
const Button = forwardRef(function Button(
  {
    variant = 'primary',
    tone = 'violet',
    size = 'md',
    href,
    loading = false,
    disabled = false,
    icon: Icon = null,
    iconRight: IconRight = null,
    fullWidth = false,
    className = '',
    type = 'button',
    children,
    ...rest
  },
  ref
) {
  // Pour les CTA primaires, la couleur vient du `tone` (forme commune, couleur module).
  const variantClass = variant === 'primary'
    ? `${PRIMARY_TONES[tone] || PRIMARY_TONES.violet} ${SCALE}`
    : (VARIANTS[variant] || VARIANTS.primary);
  const classes = `${BASE} ${variantClass} ${SIZES[size] || SIZES.md} ${fullWidth ? 'w-full' : ''} ${className}`.trim();

  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
  const inner = (
    <>
      {loading ? (
        // Subtle pulse en plus du spin → effet "réfléchit"
        <Loader2 size={iconSize} className="animate-spin animate-pulse-dot" />
      ) : Icon ? (
        <Icon size={iconSize} />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight size={iconSize} />}
    </>
  );

  if (href) {
    return (
      <Link ref={ref} href={href} className={classes} {...rest}>
        {inner}
      </Link>
    );
  }

  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} {...rest}>
      {inner}
    </button>
  );
});

export default Button;
