import { createClient } from '@supabase/supabase-js';

// RLS를 우회해야 하는 서버 전용 배치(예: 아티스트 투표 월간 집계)에서만 사용한다.
// 절대 클라이언트 번들에 노출되면 안 되므로 'use client' 컴포넌트에서 import 금지.
export default function createServiceRoleClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
