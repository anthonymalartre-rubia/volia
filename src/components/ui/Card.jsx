// Card primitive partagée.
//
// Conventions de radius adoptées (cohérence design system) :
// - rounded-lg  : inputs, badges, petits boutons compacts
// - rounded-xl  : cards standards, CTAs (default Card)
// - rounded-2xl : sections marketing, modales, cards "hero"
//
// Variants :
// - default     : bordure subtle + bg surface-card (dashboard, settings)
// - marketing   : gradient subtle + bordure white/[0.06] (landing dark)
// - highlighted : ring violet + gradient accent (pricing featured)
// - interactive : hover scale + cursor pointer (cards cliquables)

const VARIANTS = {
  default: 'bg-surface-card border border-line',
  marketing: 'bg-surface-elevated/40 border border-line',
  highlighted:
    'bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.08] border-2 border-violet-500/30',
  interactive:
    'bg-surface-card border border-line hover:border-violet-500/40 hover:bg-surface-elevated cursor-pointer transition-all duration-150',
};

const SIZES = {
  sm: 'p-3 rounded-xl',
  md: 'p-5 rounded-xl',
  lg: 'p-6 sm:p-7 rounded-2xl',
  xl: 'p-7 sm:p-10 rounded-2xl',
};

/**
 * Card primitive
 *
 * Props :
 * - variant : 'default' (def) | 'marketing' | 'highlighted' | 'interactive'
 * - size    : 'sm' | 'md' (def) | 'lg' | 'xl'
 * - as      : élément HTML ('div' default, 'article', 'section', 'a'...)
 * - className : extension exceptionnelle
 */
export default function Card({
  variant = 'default',
  size = 'md',
  as: Component = 'div',
  className = '',
  children,
  ...rest
}) {
  const classes = `${VARIANTS[variant] || VARIANTS.default} ${SIZES[size] || SIZES.md} ${className}`.trim();
  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
