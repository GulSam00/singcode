import createClient from '@/lib/supabase/client';

export function getSupabase() {
  const supabase = createClient();
  if (!supabase) throw new Error('Supabase client not initialized');
  return supabase;
}
