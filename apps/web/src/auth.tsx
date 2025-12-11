'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import useAuthStore from '@/stores/useAuthStore';

const ALLOW_PATHS = ['/', '/popular', '/login', '/signup', '/recent', '/update-password'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const redirectingRef = useRef(false);
  const currentPathRef = useRef(pathname);

  useEffect(() => {
    const isPublicPath = ALLOW_PATHS.includes(pathname);

    // 경로가 변경되면 체크 상태 리셋
    if (currentPathRef.current !== pathname) {
      setIsAuthChecked(false);
      redirectingRef.current = false;
      currentPathRef.current = pathname;
    }

    // 이미 리다이렉트 중이면 무시
    if (redirectingRef.current) {
      return;
    }

    // 공개 경로는 바로 통과
    if (isPublicPath) {
      setIsAuthChecked(true);
      return;
    }

    // 이미 인증된 상태면 바로 통과 (하지만 체크는 수행)
    const handleAuth = async () => {
      try {
        // 항상 인증 체크 수행 (세션 만료 등 확인)
        const authResult = await checkAuth();

        // 인증되지 않은 경우 리다이렉트
        if (!authResult) {
          redirectingRef.current = true;
          toast.error('로그인이 필요해요.', {
            description: '로그인 후 이용해주세요.',
          });
          // replace를 사용하여 히스토리에 남기지 않고 강제 리다이렉트
          router.replace('/login');
          return;
        }

        setIsAuthChecked(true);
      } catch (error) {
        console.error('인증 체크 오류:', error);
        redirectingRef.current = true;
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
