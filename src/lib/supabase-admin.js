import { createClient } from '@supabase/supabase-js';
import { cleanEnv } from './envClean';

/**
 * Client Supabase admin (service_role) singleton.
 *
 * Centralise la création pour :
 *   - Réutiliser le même client entre invocations chaudes (perf).
 *   - Appliquer cleanEnv() systématiquement → immunité aux \n / espaces
 *     parasites dans NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.
 *
 * IMPORTANT : à n'utiliser QUE côté serveur (jamais importer dans un
 * composant client — sinon la clé fuiterait dans le bundle).
 */
let _client = null;

export function getSupabaseAdmin() {
  if (!_client) {
    const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const key = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (!url || !key) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    _client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}
