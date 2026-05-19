import { createBrowserClient } from '@supabase/ssr';
import { cleanEnv } from './envClean';

let _supabase = null;

export function getSupabase() {
  if (_supabase) return _supabase;
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !key) {
    console.warn('Missing Supabase environment variables');
    return null;
  }
  _supabase = createBrowserClient(url, key);
  return _supabase;
}
