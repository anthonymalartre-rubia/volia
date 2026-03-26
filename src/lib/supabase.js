import { createBrowserClient } from '@supabase/ssr';

let _supabase = null;

export function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('Missing Supabase environment variables');
    return null;
  }
  _supabase = createBrowserClient(url, key);
  return _supabase;
}
