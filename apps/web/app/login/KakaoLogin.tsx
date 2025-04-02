'use client';

import Image from 'next/image';

import { createClient } from '@/supabase/client';

// 클라이언트용 Supabase 클라이언트

export default function KakaoLogin() {
  const handleKakaoLogin = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
    });

    console.log('data : ', data);
    console.log('error : ', error);
  };

  return (
    <div className="flex cursor-pointer items-center justify-center" onClick={handleKakaoLogin}>
      <Image src="/kakao_login.png" alt="kakao" width={360} height={50} />
    </div>
  );
}
