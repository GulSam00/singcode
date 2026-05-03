import { SupabaseClient } from '@supabase/supabase-js';

import { getAuthenticatedUser } from './getAuthenticatedUser';

export async function getAdminUser(supabase: SupabaseClient): Promise<string> {
  const userId = await getAuthenticatedUser(supabase);

  const adminId = process.env.ADMIN_USER_ID;
  if (!adminId || userId !== adminId) {
    throw new Error('Forbidden', { cause: 'forbidden' });
  }

  return userId;
}
