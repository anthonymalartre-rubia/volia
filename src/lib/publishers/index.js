// ─────────────────────────────────────────────────────────────────────
// src/lib/publishers/index.js — Registry + helpers pour publishers
// ─────────────────────────────────────────────────────────────────────
//
// Façade unique côté serveur pour :
//   - charger un publisher actif depuis publisher_credentials
//   - dispatcher vers le bon driver (linkedin, twitter, webhook)
//   - logger la dernière utilisation (success/error)
//
// Convention :
//   - 1 ligne par platform max (UNIQUE constraint en DB)
//   - Si platform désactivée OU pas configurée → publishOn() renvoie
//     { ok: false, skipped: true, reason: 'not_configured' } sans throw
//     (le cron continue tranquillement et le founder copie manuellement).
// ─────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from '../supabase-admin';
import { publishToLinkedIn, testLinkedInToken } from './linkedin';
import { publishToWebhook } from './webhook';

const DRIVERS = {
  linkedin: publishToLinkedIn,
  webhook: publishToWebhook,
  // twitter: à brancher quand on aura le budget API v2 ($100/mo)
};

/**
 * Charge le publisher actif pour une plateforme donnée.
 * Renvoie null si pas configurée ou désactivée.
 */
export async function getPublisher(platform) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('publisher_credentials')
    .select('*')
    .eq('platform', platform)
    .eq('enabled', true)
    .maybeSingle();
  if (error) {
    console.error(`[publishers] getPublisher(${platform}) error`, error);
    return null;
  }
  return data;
}

/**
 * Publie un texte sur une platform donnée. Centralise :
 *   - Récup credentials + check enabled
 *   - Appel du driver approprié
 *   - Update publisher_credentials.last_used_at / last_published_url / last_error
 *
 * @param {string} platform - 'linkedin' | 'webhook' | 'twitter'
 * @param {string} text
 * @param {object} [opts] - passé au driver (action_id, metadata, visibility…)
 * @returns {Promise<{ok, post_url?, error?, skipped?, reason?}>}
 */
export async function publishOn(platform, text, opts = {}) {
  const publisher = await getPublisher(platform);
  if (!publisher) {
    return {
      ok: false,
      skipped: true,
      reason: 'not_configured',
      message: `Aucun publisher actif pour platform "${platform}". Configure dans /admin/publishers.`,
    };
  }

  const driver = DRIVERS[platform];
  if (!driver) {
    return {
      ok: false,
      skipped: true,
      reason: 'no_driver',
      message: `Aucun driver pour platform "${platform}".`,
    };
  }

  const result = await driver(text, publisher.credentials, opts);

  // Update tracking côté DB (fire-and-forget, on log si fail)
  const supabase = getSupabaseAdmin();
  const updates = {
    last_used_at: new Date().toISOString(),
  };
  if (result.ok) {
    updates.last_published_url = result.post_url || null;
    updates.last_error = null;
  } else {
    updates.last_error = (result.error || 'unknown error').slice(0, 500);
  }
  supabase
    .from('publisher_credentials')
    .update(updates)
    .eq('id', publisher.id)
    .then(({ error }) => {
      if (error) console.error('[publishers] update tracking failed', error);
    });

  return result;
}

/**
 * Re-export du test connection LinkedIn pour /api/admin/publishers/test.
 */
export { testLinkedInToken };

/**
 * Liste des plateformes connues + leur statut de config.
 * Utilisé par /admin/publishers pour afficher l'état général.
 */
export async function listPublishersStatus() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('publisher_credentials')
    .select('id, platform, enabled, label, last_used_at, last_published_url, last_error, test_passed_at, updated_at, credentials')
    .order('platform');

  // Masque les secrets sensibles avant retour
  return (data || []).map((row) => ({
    ...row,
    credentials: row.credentials
      ? maskCredentials(row.platform, row.credentials)
      : {},
    has_driver: !!DRIVERS[row.platform],
  }));
}

function maskCredentials(platform, creds) {
  const out = { ...creds };
  // Masque tout ce qui ressemble à un token / secret
  const sensitiveKeys = ['access_token', 'api_secret', 'access_secret', 'secret', 'api_key'];
  for (const k of sensitiveKeys) {
    if (out[k]) {
      const v = String(out[k]);
      out[k] = v.length > 10 ? `${v.slice(0, 4)}…${v.slice(-4)}` : '••••';
    }
  }
  return out;
}
