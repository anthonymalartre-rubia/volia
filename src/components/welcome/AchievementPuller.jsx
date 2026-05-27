'use client';

// ─────────────────────────────────────────────────────────────────────────
// AchievementPuller — composant invisible monté dans les pages app
// authentifiées (via AppShell + dashboard).
//
// Rôle : au mount, fetch /api/achievements/unseen pour récupérer les
// achievements débloqués côté serveur sans toast affiché (typiquement :
// webhook resend.inbound → first_reply_received, form public submit →
// first_lead_via_form). Puis cascade les toasts un par un via le helper
// showAchievementToast existant, et POST /api/achievements/mark-seen
// pour marquer chaque achievement comme vu.
//
// Sécurité affichage :
//   - Un seul fetch par session-mount (useRef guard).
//   - Si l'API renvoie 401 (pas auth, ou cache stale), on no-op.
//   - Si la cascade est interrompue (refresh, navigation), les toasts non
//     encore montrés gardent toast_shown_at = NULL et seront repickup au
//     prochain mount.
//
// UX cascade :
//   - 5500ms entre chaque toast (le toast auto-dismiss à 5s, +500ms respir).
//   - Si ≥3 achievements à afficher → intro spéciale "X achievements
//     débloqués pendant ton absence" avant la cascade.
//   - mark-seen appelé après CHAQUE toast (pas seulement à la fin) pour
//     éviter de re-spammer si le user refresh en plein milieu.
//
// Aucun rendu visuel — le toast est rendu par <AchievementToast /> déjà
// monté dans le layout racine.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { showAchievementToast } from '@/lib/use-achievement-toast';

const TOAST_INTERVAL_MS = 5500; // 5s auto-dismiss + 500ms respiration
const INTRO_DELAY_MS = 5500; // même cadence après l'intro
const INTRO_THRESHOLD = 3; // ≥3 achievements → on affiche un toast d'intro

/**
 * Forge un "fake achievement" purement présentationnel pour l'intro.
 * Réutilise le rendering existant d'AchievementToast (icon Sparkles +
 * label/description). Pas de row DB, pas de mark-seen — c'est un toast
 * UI-only.
 */
function buildIntroAchievement(count) {
  return {
    key: '__intro__',
    label: `${count} achievements débloqués pendant ton absence`,
    description: 'On t\'a fait un petit récap. Ça arrive juste après.',
    icon: 'Sparkles',
    color: 'violet',
  };
}

export default function AchievementPuller() {
  // Garde anti double-fetch : strict mode en dev déclenche 2x useEffect.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    const timers = [];

    async function markSeen(ids) {
      if (!ids || ids.length === 0) return;
      try {
        await fetch('/api/achievements/mark-seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
          // keepalive : si user navigue ailleurs, la requête finit quand même
          keepalive: true,
        });
      } catch {
        // Silent fail — au pire on re-affichera au prochain login (idempotent
        // côté UX puisque l'utilisateur a vu le toast).
      }
    }

    async function run() {
      let res;
      try {
        res = await fetch('/api/achievements/unseen', {
          credentials: 'same-origin',
          cache: 'no-store',
        });
      } catch {
        return; // network down → tant pis
      }
      if (cancelled) return;
      if (!res.ok) return; // 401 anon ou 5xx → no-op

      let data;
      try {
        data = await res.json();
      } catch {
        return;
      }
      const achievements = Array.isArray(data?.achievements) ? data.achievements : [];
      if (achievements.length === 0) return;

      const showIntro = achievements.length >= INTRO_THRESHOLD;

      // Décalage initial avant le 1er toast (laisse la page se charger
      // visuellement, on évite le toast qui apparaît avant même que la
      // sidebar finisse son fade-in).
      let cursor = 800;

      if (showIntro) {
        const intro = buildIntroAchievement(achievements.length);
        timers.push(
          setTimeout(() => {
            if (!cancelled) showAchievementToast(intro);
          }, cursor)
        );
        cursor += INTRO_DELAY_MS;
      }

      // Cascade : un toast toutes les TOAST_INTERVAL_MS, mark-seen après chaque.
      achievements.forEach((ach) => {
        const delay = cursor;
        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            showAchievementToast(ach);
            // mark-seen indépendant : si le user navigue avant la fin, les
            // toasts déjà montrés ne reviendront pas.
            markSeen([ach.id]);
          }, delay)
        );
        cursor += TOAST_INTERVAL_MS;
      });
    }

    run();

    return () => {
      cancelled = true;
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return null;
}
