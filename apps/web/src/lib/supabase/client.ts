import { createBrowserClient } from '@supabase/ssr';

// Component client

export default function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // 개발 환경에서는 에러를 던지고, 프로덕션에서는 콘솔에 경고만
    if (process.env.NODE_ENV === 'development') {
      throw new Error('Missing Supabase environment variables');
    } else {
      console.warn('Missing Supabase environment variables');
      return null;
    }
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
