import { createServerClient, serializeCookieHeader } from '@supabase/ssr';
import { type NextApiRequest, type NextApiResponse } from 'next';

// API client

export default function createClient(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return Object.keys(req.cookies).map(name => ({
          name,
          value: req.cookies[name] || '',
        }));
      },
      setAll(cookiesToSet) {
        res.setHeader(
          'Set-Cookie',
          cookiesToSet.map(({ name, value, options }) =>
            serializeCookieHeader(name, value, options),
          ),
        );
      },
    },
  });

  return supabase;
}
