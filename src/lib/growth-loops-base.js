// ─────────────────────────────────────────────────────────────────────
// src/lib/growth-loops-base.js — Master switch des boucles Growth
// ─────────────────────────────────────────────────────────────────────
// Sprint Growth Loops introduit 10 nouvelles boucles axées MRR (activation,
// conversion, rétention). On les met derrière un toggle dédié pour pouvoir
// les désactiver d'un coup sans toucher au master autonomy.
//
// Hiérarchie des kill switches :
//   1. AUTONOMOUS_MODE_ENABLED (ENV/DB)  → coupe TOUT
//   2. growth_loops_enabled    (DB only) → coupe juste les Growth Loops
//
// Si l'un OU l'autre est OFF, la boucle skip.
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase-admin';
import { isAutonomyEnabled } from './autonomy';

/**
 * Combine master autonomy + growth_loops_enabled.
 * Retourne { enabled, reason } où reason explique POURQUOI off si désactivé.
 */
export async function isGrowthLoopsEnabled() {
  const autonomy = await isAutonomyEnabled();
  if (!autonomy.enabled) {
    return { enabled: false, reason: `autonomy_disabled (${autonomy.reason || 'master off'})` };
  }
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'growth_loops_enabled')
    .maybeSingle();
  // Default = true (si pas de row, considère activé)
  const v = data?.value;
  const off = v === 'false' || v === false || v === '0';
  if (off) return { enabled: false, reason: 'growth_loops_explicitly_disabled' };
  return { enabled: true };
}
