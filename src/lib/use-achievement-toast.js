// src/lib/use-achievement-toast.js
// ─────────────────────────────────────────────────────────────────────────
// Helper client pour déclencher le toast achievement depuis n'importe où.
//
// Pourquoi ce module à part : `showAchievement` est déjà exporté par
// `@/components/welcome/AchievementToast`, mais ce composant pull lucide-react
// + le composant Mascot + ConfettiExplosion. Importer juste la fonction
// trigger côté server-rendered pages ou côté serveur déclencheur (action
// route handler) ne devrait PAS forcer le bundling du composant complet.
//
// Ce module ne pull rien : il dispatch un CustomEvent natif sur window. Le
// composant AchievementToast (monté UNE fois dans le layout) écoute l'event.
//
// Pattern public :
//   import { showAchievementToast } from '@/lib/use-achievement-toast';
//   // ...après un fetch dont la réponse contient `achievement: {...}` :
//   showAchievementToast(data.achievement);
//
// Sécurité : `achievement` peut être null/undefined → no-op.
// SSR-safe : check typeof window.
// ─────────────────────────────────────────────────────────────────────────

const EVENT_NAME = 'volia:achievement';

/**
 * Déclenche l'affichage d'un toast achievement.
 * @param {object|null|undefined} achievement - L'objet retourné par l'API
 *   (shape : { key, label, description, icon, color, unlocked_at }).
 *   Peut être null ou undefined — dans ce cas la fonction ne fait rien.
 */
export function showAchievementToast(achievement) {
  if (typeof window === 'undefined' || !achievement || !achievement.key) {
    return;
  }
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: achievement }));
  } catch {
    // jsdom / vieux navigateurs : silent fail (cohérent avec showAchievement
    // dans AchievementToast.jsx).
  }
}

/**
 * Helper de convenience : prend une réponse JSON d'API et fire le toast
 * si `response.achievement` est présent.
 *
 *   const data = await res.json();
 *   maybeShowAchievement(data);
 *
 * @param {object|null|undefined} responseData
 */
export function maybeShowAchievement(responseData) {
  if (!responseData) return;
  if (responseData.achievement && responseData.achievement.key) {
    showAchievementToast(responseData.achievement);
  }
}
