'use client';

import { createClient } from '@/supabase/client';

// 클라이언트용 Supabase 클라이언트

export default function KakaoLoginButton() {
  const handleKakaoLogin = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
    });

    console.log('data : ', data);
    console.log('error : ', error);
  };

  return (
    <button type="button" onClick={handleKakaoLogin}>
      카카오 로그인
    </button>
  );
}
