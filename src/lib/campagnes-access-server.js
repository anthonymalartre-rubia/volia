// ─────────────────────────────────────────────────────────────────────
// src/lib/campagnes-access-server.js (SERVER-ONLY)
// ─────────────────────────────────────────────────────────────────────
// Helpers server-side pour le contrôle d'accès au module Campagnes.
// Importe `next/headers` via `getAuthenticatedUser` → NE PAS importer
// depuis un composant client.
//
// Voir aussi : '@/lib/campagnes-access' (client-safe, constants + pure fn).
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from './auth';
import { CAMPAGNES_ALLOWED_PLANS, isCampagnesAllowedPlan } from './campagnes-access';
import { getEffectivePlan } from './trial';

/**
 * Vérifie qu'un user a accès au module Campagnes (envoi de campagnes email).
 * Server-side : passe le client supabase initialisé.
 * @param {object} supabase - Client Supabase initialisé (server-side)
 * @param {string} userId   - ID du user à vérifier
 * @returns {Promise<boolean>} true si plan in allowed list, false sinon
 */
export async function checkCampagnesAccess(supabase, userId) {
  if (!supabase || !userId) return false;
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan, trial_plan, trial_started_at, trial_ends_at, trial_converted_at')
    .eq('id', userId)
    .maybeSingle();
  // Le trial (14 jours de MAX) donne accès aux Campagnes — freemium :
  // tout plan résolu a accès, seuls les quotas diffèrent.
  return isCampagnesAllowedPlan(getEffectivePlan(profile));
}

/**
 * Wrapper pour API routes — équivalent à requireAdmin() mais sur le plan.
 * À appeler en début de route API campagnes :
 *
 *   const auth = await requireCampagnesAccess();
 *   if (auth instanceof NextResponse) return auth;
 *   const { user, supabase } = auth;
 *
 * @returns {Promise<{user, supabase} | NextResponse>}
 */
export async function requireCampagnesAccess() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ok = await checkCampagnesAccess(supabase, user.id);
  if (!ok) {
    return NextResponse.json(
      { error: 'Forbidden — profil introuvable' },
      { status: 403 }
    );
  }

  return { user, supabase };
}

// Re-export pour praticité côté API si besoin
export { CAMPAGNES_ALLOWED_PLANS };
