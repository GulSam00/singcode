'use client';

import Image from 'next/image';

import useAuthStore from '@/stores/useAuthStore';

// 클라이언트용 Supabase 클라이언트

export default function KakaoLogin() {
  const { authKaKaoLogin } = useAuthStore();

  const handleKakaoLogin = async () => {
    await authKaKaoLogin();
  };

  return (
    <div
      className="relative flex h-[50px] w-full cursor-pointer items-center justify-center"
      onClick={handleKakaoLogin}
    >
      <Image src="/kakao_login.png" alt="kakao" fill />
    </div>
  );
}
