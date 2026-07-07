import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cleanEnv } from './envClean';

/**
 * Verify the current user from cookies in an API route.
 * Returns { user, supabase } or throws a Response.
 */
export async function getAuthenticatedUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, supabase };
  }

  // Heartbeat d'activité pour le win-back C1 (lifecycle-triggers) : au plus
  // 1 écriture / 6 h grâce au WHERE — l'UPDATE ne matche que si la valeur est
  // vieille (ou null, comptes pré-migration). RLS anyone_update_own l'autorise,
  // et last_active_at n'est pas dans les colonnes gelées par le trigger WS1b.
  // Best-effort : un échec ici ne doit jamais casser une route API.
  try {
    const cutoff = new Date(Date.now() - 6 * 3600 * 1000).toISOString();
    // supabase-js ne throw pas sur un refus RLS/colonne absente : il renvoie
    // { error }. On le logge — si ce heartbeat casse en silence, toute la
    // base dérive vers « inactif 14 j » et le win-back C1 tire sur des actifs.
    const { error: hbError } = await supabase
      .from('user_profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id)
      .or(`last_active_at.is.null,last_active_at.lt.${cutoff}`);
    if (hbError) console.warn('[auth] last_active_at heartbeat failed:', hbError.message);
  } catch {}

  return { user, supabase };
}
