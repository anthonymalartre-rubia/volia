// MarketingCard — primitive pour les cards des pages publiques (landing,
// /vs, /outils, /personas...). Unifie 3 patterns qui existaient
// indépendamment :
//
// - Pricing card (rounded-2xl + p-7 + gradient highlight)  → variant="default" ou "highlighted"
// - Testimonial card (rounded-2xl + p-5 + border simple)   → variant="default"
// - Persona card (rounded-2xl + gradient bg + hover scale) → variant="persona"
//
// Toutes sont dark-forced (utilisées sur les pages marketing avec fond noir).
// Pas de mode light : ces cards ne vivent que sur les pages marketing.
//
// Hover scale est strictement réservé aux cards cliquables (asLink/onClick).

import Link from 'next/link';

const VARIANTS = {
  // Card neutre : fond white/[0.02], border white/[0.06]
  default: 'bg-surface-elevated/40 border border-line',

  // Card mise en avant (ex: plan pricing "Recommandé"). Ring violet visible.
  highlighted:
    'bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.08] border-2 border-violet-500/30 relative',

  // Card persona/secteur avec accent coloré subtil (couleur passée via gradientClass)
  persona: 'border border-line',
};

const SIZES = {
  sm: 'p-4 rounded-xl',
  md: 'p-5 rounded-2xl',
  lg: 'p-6 sm:p-7 rounded-2xl',
};

/**
 * MarketingCard
 *
 * Props :
 * - variant   : 'default' (def) | 'highlighted' | 'persona'
 * - size      : 'sm' | 'md' (def) | 'lg'
 * - href      : si fourni, rend un <Link> et active hover scale + transition
 * - onClick   : idem
 * - gradientClass : pour variant="persona", classe gradient bg additionnelle
 *                  (ex: "bg-gradient-to-br from-violet-500/15 to-indigo-500/15")
 * - className : extension
 * - as        : élément HTML (article, section, div...)
 */
export default function MarketingCard({
  variant = 'default',
  size = 'md',
  href,
  onClick,
  gradientClass = '',
  className = '',
  as: Component = 'div',
  children,
  ...rest
}) {
  const interactive = !!(href || onClick);
  const interactiveClasses = interactive
    ? 'hover:border-line-hover hover:scale-[1.01] transition-all duration-200 cursor-pointer'
    : '';

  const classes = `${VARIANTS[variant] || VARIANTS.default} ${SIZES[size] || SIZES.md} ${gradientClass} ${interactiveClasses} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <Component className={classes} onClick={onClick} {...rest}>
      {children}
    </Component>
  );
}
