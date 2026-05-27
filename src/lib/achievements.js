// src/lib/achievements.js
// ─────────────────────────────────────────────────────────────────────────
// Système d'achievements Volia (Sprint Brand 3).
//
// Modèle DB : table user_achievements (user_id, achievement_key UNIQUE).
// L'unlock est idempotent — ON CONFLICT DO NOTHING + détection insert via
// le retour de select('id').
//
// Pattern d'utilisation côté API route (serveur uniquement) :
//   import { unlockAchievement } from '@/lib/achievements';
//   const ach = await unlockAchievement(userId, 'first_search', { dept: '75' });
//   if (ach.newly_unlocked) {
//     return NextResponse.json({ ...data, achievement: ach.achievement });
//   }
//
// Le client (dashboard, panneaux) check la présence de `achievement` dans
// la réponse JSON et trigger le composant AchievementToast en bottom-right.
//
// Important : on utilise getSupabaseAdmin() (service_role) pour bypass RLS.
// Les routes appelantes ont déjà authentifié le user ; on lui INSERT pour
// son propre compte. Pas de risque de spoof — les userId viennent des
// helpers getAuthenticatedUser() et jamais d'un body client.
// ─────────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';

/**
 * Catalogue des achievements. Le client utilise ce catalogue pour rendre
 * le toast (icon, label, description) sans devoir refaire un fetch.
 *
 * icon = nom d'une icône lucide-react. Le composant AchievementToast la
 * résout dynamiquement.
 */
export const ACHIEVEMENTS = {
  first_search: {
    key: 'first_search',
    label: 'Premier prospect trouvé',
    description: 'Tu viens de lancer ta première recherche Volia. Bienvenue dans le club.',
    icon: 'Search',
    color: 'violet',
  },
  first_campaign_sent: {
    key: 'first_campaign_sent',
    label: 'Première campagne envoyée',
    description: 'Tes prospects sont prévenus. Maintenant, on attend les réponses.',
    icon: 'Send',
    color: 'indigo',
  },
  first_form_created: {
    key: 'first_form_created',
    label: 'Premier formulaire publié',
    description: 'Ton formulaire est en ligne. Tu peux le partager partout.',
    icon: 'FormInput',
    color: 'sky',
  },
  first_crm_deal: {
    key: 'first_crm_deal',
    label: 'Premier deal créé',
    description: 'Ton pipeline est lancé. Allez, on closer.',
    icon: 'Trophy',
    color: 'amber',
  },
  first_reply_received: {
    key: 'first_reply_received',
    label: 'Première réponse reçue !',
    description: 'Un prospect a répondu. Saute dessus pendant que c\'est chaud.',
    icon: 'MessageCircle',
    color: 'emerald',
  },
  first_lead_via_form: {
    key: 'first_lead_via_form',
    label: 'Premier lead via formulaire',
    description: 'Un nouveau lead vient de remplir ton form. Inbound activé.',
    icon: 'Zap',
    color: 'fuchsia',
  },
};

/**
 * Tente d'unlock un achievement pour un user donné.
 *
 * @param {string} userId - UUID auth.users
 * @param {string} key - Clé du catalogue ACHIEVEMENTS
 * @param {object} [payload={}] - Données contextuelles (dept, deal_id…)
 * @param {object} [options={}]
 * @param {boolean} [options.markToastShown=false] - Si true, set
 *   toast_shown_at = NOW() à l'insert. À passer quand le caller affiche
 *   déjà le toast en live côté client (réponse JSON contenant `achievement`).
 *   Les callers "silencieux" (webhooks, form submit public) doivent laisser
 *   à false → toast_shown_at reste NULL → pickup par /api/achievements/unseen
 *   au prochain login.
 * @returns {Promise<{newly_unlocked: boolean, achievement: object|null}>}
 *
 * Best-effort : ne throw jamais. Si erreur DB ou clé inconnue, retourne
 * { newly_unlocked: false, achievement: null } et log côté serveur. Les
 * achievements ne doivent JAMAIS bloquer la requête métier qui les déclenche.
 */
export async function unlockAchievement(userId, key, payload = {}, options = {}) {
  if (!userId || !key) {
    return { newly_unlocked: false, achievement: null };
  }
  const meta = ACHIEVEMENTS[key];
  if (!meta) {
    // Clé inconnue : on log pour repérer un appel obsolète, mais on n'échoue pas.
    // eslint-disable-next-line no-console
    console.warn('[achievements] unknown key:', key);
    return { newly_unlocked: false, achievement: null };
  }

  const { markToastShown = false } = options || {};

  try {
    const supabase = getSupabaseAdmin();

    // INSERT idempotent. Si la row existe déjà (UNIQUE constraint),
    // .select() renvoie [] → newly_unlocked = false.
    // .upsert avec ignoreDuplicates ne renvoie pas la ligne en cas de conflit,
    // ce qui est exactement ce qu'on veut.
    const insertRow = {
      user_id: userId,
      achievement_key: key,
      payload: payload || {},
    };
    if (markToastShown) {
      // Pose le timestamp dès l'insert → le puller au prochain login
      // n'affichera PAS ce toast (déjà montré live). Évite le double-affichage.
      insertRow.toast_shown_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .upsert(insertRow, {
        onConflict: 'user_id,achievement_key',
        ignoreDuplicates: true,
      })
      .select('id, unlocked_at');

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[achievements] insert error:', error.message);
      return { newly_unlocked: false, achievement: null };
    }

    const newly = Array.isArray(data) && data.length > 0;
    return {
      newly_unlocked: newly,
      achievement: newly ? { ...meta, unlocked_at: data[0].unlocked_at } : null,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[achievements] unexpected error:', err?.message || err);
    return { newly_unlocked: false, achievement: null };
  }
}

/**
 * Récupère la liste des achievements unlocked pour un user.
 * Utilisé par le dashboard pour afficher les badges déjà gagnés.
 */
export async function listUserAchievements(userId, supabase) {
  if (!userId || !supabase) return [];
  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement_key, unlocked_at, payload')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[achievements] list error:', error.message);
    return [];
  }

  return (data || [])
    .map((row) => {
      const meta = ACHIEVEMENTS[row.achievement_key];
      if (!meta) return null;
      return { ...meta, unlocked_at: row.unlocked_at, payload: row.payload };
    })
    .filter(Boolean);
}
