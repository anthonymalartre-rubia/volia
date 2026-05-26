'use client';

// InfoTooltip primitive partagée — pour expliquer un concept inline.
//
// Avant : termes techniques (waterfall, DKIM, RGPD, scoring,
// probabilité pondérée…) jamais expliqués → l'utilisateur Google le
// terme ou ignore. Onboarding souffrant.
//
// Après : icône Info discrète + tooltip au hover/focus. Pas de
// dépendance externe (Radix etc.). Accessible (aria-describedby +
// focus-visible). Mobile-friendly (focus = tooltip visible).
//
// Usage :
//   <InfoTooltip content="DKIM = signature cryptographique du domaine émetteur" />
//   <InfoTooltip content="...">Texte wrappé avec l'icône</InfoTooltip>

import { useId, useState } from 'react';
import { Info } from 'lucide-react';

const SIDE_POSITION = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
};

const SIDE_ARROW = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-800 border-x-transparent border-b-transparent border-t-[5px] border-x-[5px]',
  bottom:
    'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-800 border-x-transparent border-t-transparent border-b-[5px] border-x-[5px]',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-800 border-y-transparent border-r-transparent border-l-[5px] border-y-[5px]',
  right:
    'right-full top-1/2 -translate-y-1/2 border-r-zinc-800 border-y-transparent border-l-transparent border-r-[5px] border-y-[5px]',
};

/**
 * InfoTooltip
 *
 * Props :
 * - content   : ReactNode — le contenu du tooltip
 * - side?     : 'top' (default) | 'bottom' | 'left' | 'right'
 * - children? : si fourni → wrappe le children, sinon → juste l'icône Info
 * - className?: extension sur le wrapper
 * - iconSize? : taille de l'icône Info (default 12)
 */
export default function InfoTooltip({
  content,
  side = 'top',
  children,
  className = '',
  iconSize = 12,
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const tooltipId = `tt-${id}`;

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return (
    <span
      className={`relative inline-flex items-center gap-1 ${className}`.trim()}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      <button
        type="button"
        aria-describedby={tooltipId}
        aria-label="Plus d'informations"
        onFocus={show}
        onBlur={hide}
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className="inline-flex items-center justify-center rounded-full text-content-tertiary hover:text-content-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:text-content-primary transition-colors"
      >
        <Info size={iconSize} aria-hidden="true" />
      </button>

      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute z-50 max-w-xs w-max px-2.5 py-1.5 rounded-md bg-zinc-800 text-white text-xs leading-snug shadow-lg transition-opacity duration-150 ${
          SIDE_POSITION[side] || SIDE_POSITION.top
        } ${open ? 'opacity-100' : 'opacity-0'}`}
      >
        {content}
        <span
          aria-hidden="true"
          className={`absolute w-0 h-0 ${SIDE_ARROW[side] || SIDE_ARROW.top}`}
        />
      </span>
    </span>
  );
}
