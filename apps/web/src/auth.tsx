'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import useAuthStore from '@/stores/useAuthStore';

const ALLOW_PATHS = [
  '/',
  '/popular',
  '/login',
  '/signup',
  '/recent',
  '/tosing',
  '/update-password',
];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { checkAuth } = useAuthStore();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const isPublicPath = ALLOW_PATHS.includes(pathname);

    // 이미 인증된 상태면 바로 통과 (하지만 체크는 수행)
    const handleAuth = async () => {
      try {
        // 항상 인증 체크 수행 (세션 만료 등 확인)
        const authResult = await checkAuth();

        // 인증되지 않은 경우 리다이렉트
        if (authResult) {
          setIsAuthChecked(true);
        } else if (!isPublicPath) {
          // replace를 사용하여 히스토리에 남기지 않고 강제 리다이렉트
          router.replace('/login?alert=login');
          return;
        }
      } catch (error) {
        console.error('인증 체크 오류:', error);
        router.replace('/login');
      }
    };

    handleAuth();
  }, [pathname, router, checkAuth]);

  // 인증 체크가 완료되기 전까지 children을 렌더링하지 않음
  // 공개 경로가 아닌 경우에만 체크 완료까지 대기
  const isPublicPath = ALLOW_PATHS.includes(pathname);

  if (!isPublicPath && !isAuthChecked) {
    return null;
  }

  return <>{children}</>;
}
