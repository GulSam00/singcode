import { SupabaseClient } from '@supabase/supabase-js';

export async function getAuthenticatedUser(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('User not authenticated', { cause: 'auth' });
  }
  return user.id; // userId만 반환
}
