'use client';

// ─────────────────────────────────────────────────────────────────────────
// Mascot — placeholder TEMPORAIRE.
//
// TODO MERGE FINAL : la vraie mascotte est produite par le Sprint Visuel en
// parallèle (composant <Mascot variant="welcome|celebration|happy|thinking">).
// Ce fichier sera REMPLACÉ ou supprimé au moment du merge avec ce sprint.
//
// En attendant, on a besoin d'une mascotte fonctionnelle pour :
//  - WelcomeOverlay (variant welcome, size xl)
//  - ConfirmWelcome (variant welcome, size lg)
//  - Step 3 onboarding (variant celebration, size lg)
//  - AchievementToast (variant celebration, size sm)
//
// Le placeholder est un cercle gradient violet qui contient un emoji
// adapté à la variante. Visuellement cohérent avec la palette Volia.
// ─────────────────────────────────────────────────────────────────────────

const SIZE_PX = {
  sm: 40,
  md: 64,
  lg: 96,
  xl: 144,
};

const VARIANT_EMOJI = {
  welcome: '👋',
  celebration: '🎉',
  happy: '😊',
  thinking: '🤔',
};

const VARIANT_GRADIENT = {
  welcome: 'from-violet-500 via-indigo-500 to-fuchsia-500',
  celebration: 'from-amber-400 via-pink-500 to-violet-500',
  happy: 'from-emerald-400 to-cyan-500',
  thinking: 'from-sky-500 to-indigo-500',
};

export default function Mascot({
  variant = 'welcome',
  size = 'md',
  className = '',
  animate = false,
}) {
  const px = SIZE_PX[size] || SIZE_PX.md;
  const emoji = VARIANT_EMOJI[variant] || VARIANT_EMOJI.welcome;
  const grad = VARIANT_GRADIENT[variant] || VARIANT_GRADIENT.welcome;
  const fontPx = Math.round(px * 0.55);

  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br ${grad} shadow-lg shadow-violet-500/30 ring-4 ring-white/10 select-none ${
        animate ? 'animate-bounce-soft' : ''
      } ${className}`}
      style={{ width: px, height: px, fontSize: fontPx, lineHeight: 1 }}
    >
      {emoji}
    </span>
  );
}
