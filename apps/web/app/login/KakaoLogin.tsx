'use client';

import Image from 'next/image';

import { useAuthStore } from '@/store/useAuthStore';

// 클라이언트용 Supabase 클라이언트

export default function KakaoLogin() {
  const { authKaKaoLogin } = useAuthStore();

  const handleKakaoLogin = async () => {
    await authKaKaoLogin();
  };

  return (
    <div className="flex cursor-pointer items-center justify-center" onClick={handleKakaoLogin}>
      <Image src="/kakao_login.png" alt="kakao" width={360} height={50} />
    </div>
  );
}
