import { CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server client
export default async function createClient() {
  const cookieStore = await cookies();

  // return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
  //  process.env.SUPABASE_SERVICE_ROLE_KEY?? 출처가 어디지?
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // @ts-expect-error vercel build error
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(
            ({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
              cookieStore.set(name, value, options),
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
