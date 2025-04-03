'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

export async function login(email: string, password: string) {
  const supabase = await createClient();

  const data = {
    email,
    password,
  };

  const response = await supabase.auth.signInWithPassword(data);
  if (response.error) {
    throw new Error(
      JSON.stringify({
        code: response.error.status || 500,
        message: response.error.message,
      }),
    );
  }

  revalidatePath('/', 'layout');
  return response;
}
