// ErrorPanel primitive partagée — affiche une erreur avec recovery action.
//
// Avant : partout setError('Erreur réseau') → simple texte rouge sans
// que l'utilisateur sache quoi faire. Pas d'action de recovery.
//
// Après : panneau standardisé avec :
//   - Icône AlertTriangle
//   - Titre (extrait de error.message ou error string)
//   - Détails optionnels (error.details si structuré)
//   - Bouton "Réessayer" si onRetry fourni
//   - Lien "Contacter le support" (mailto:hello@volia.fr) si supportLink !== false
//   - Children pour custom content
//
// Style : palette red sémantique (bg-red-50/border-red-200 light,
// bg-red-500/10/border-red-500/30 dark via les tokens) cohérente avec
// les badges error existants (cf. CRM contacts page erreur banner).

import { AlertTriangle, RotateCcw, LifeBuoy } from 'lucide-react';

/**
 * ErrorPanel
 *
 * Props :
 * - error       : string OU { message: string, details?: string }
 * - onRetry?    : () => void — affiche le bouton "Réessayer"
 * - supportLink?: bool (default true) — affiche le lien support
 * - className?  : extension
 * - children?   : contenu additionnel (CTAs custom, etc.)
 */
export default function ErrorPanel({
  error,
  onRetry,
  supportLink = true,
  className = '',
  children,
}) {
  // Extract title + details depuis string ou objet structuré
  const title =
    typeof error === 'string'
      ? error
      : error?.message || 'Une erreur est survenue';
  const details =
    typeof error === 'object' && error !== null ? error.details : null;

  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4 text-red-700 dark:text-red-300 ${className}`.trim()}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={18}
          className="flex-shrink-0 mt-0.5 text-red-500 dark:text-red-400"
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{title}</p>
          {details && (
            <p className="mt-1 text-xs leading-relaxed text-red-600/90 dark:text-red-300/80">
              {details}
            </p>
          )}
          {children && <div className="mt-2 text-xs">{children}</div>}

          {(onRetry || supportLink) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-200 transition-colors"
                >
                  <RotateCcw size={12} />
                  Réessayer
                </button>
              )}
              {supportLink && (
                <a
                  href="mailto:hello@volia.fr?subject=Aide%20Volia"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/20 text-red-600 dark:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LifeBuoy size={12} />
                  Contacter le support
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
