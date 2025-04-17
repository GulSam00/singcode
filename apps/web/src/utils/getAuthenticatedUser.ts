import { SupabaseClient } from '@supabase/supabase-js';

export async function getAuthenticatedUser(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  return user.id; // userId만 반환
}
