// Wordmark unifié Prospectia.
//
// Avant : 2 brand marks coexistaient — "Prospectia.ai" en rose (login,
// signup, TopBar) vs "Prospectia.cloud" en violet (footer, marketing,
// auth shell). Schizophrénie complète alors que le domaine officiel
// est prospectia.cloud (cf CLAUDE.md).
//
// Maintenant : utilise le composant <Logo /> (vrai logo Prospectia avec
// symbole P + viseur, intégré en mai 2026). Le placeholder "P" carré
// dans un gradient a été remplacé partout.
//
// Variants conservés pour rétro-compat avec l'ancienne API :
// - default : juste le wordmark "Prospectia" (image SVG)
// - logo : symbole P + texte "Prospectia"
// - compact : juste le symbole P (rare)

import Link from 'next/link';
import Image from 'next/image';
import { LogoIcon } from './Logo';

const SIZES = {
  xs: { wordmarkH: 'h-4', iconSize: 'xs', gap: 'gap-1.5' },
  sm: { wordmarkH: 'h-5', iconSize: 'sm', gap: 'gap-2' },
  md: { wordmarkH: 'h-6', iconSize: 'sm', gap: 'gap-2' },
  lg: { wordmarkH: 'h-7', iconSize: 'md', gap: 'gap-2.5' },
  xl: { wordmarkH: 'h-10', iconSize: 'lg', gap: 'gap-3' },
};

export default function BrandWordmark({
  variant = 'default',
  size = 'md',
  asLink = false,
  href = '/',
  className = '',
}) {
  const s = SIZES[size] || SIZES.md;

  // variant="compact" : juste le symbole P (sans wordmark)
  if (variant === 'compact') {
    return <LogoIcon size={s.iconSize} className={className} asLink={asLink} href={href} />;
  }

  // variant="logo" : symbole P + wordmark côte à côte
  // variant="default" : juste wordmark
  const inner = (
    <span className={`inline-flex items-center ${s.gap} text-content-primary ${className}`}>
      {variant === 'logo' && <LogoIcon size={s.iconSize} />}
      <Image
        src="/logos/prospectia-wordmark.svg"
        alt="Prospectia"
        width={367}
        height={100}
        className={`w-auto ${s.wordmarkH}`}
        priority={size === 'lg' || size === 'xl'}
      />
    </span>
  );

  if (asLink) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-90 transition">
        {inner}
      </Link>
    );
  }
  return inner;
}
