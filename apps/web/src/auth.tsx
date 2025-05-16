'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

import useAuthStore from '@/stores/useAuthStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const handleAuth = async () => {
      const allowPaths = ['/login', '/signup', '/update-password', '/', '/popular'];

      const isAuthenticated = await checkAuth();
      if (!isAuthenticated && !allowPaths.includes(pathname)) {
        toast.error('로그인이 필요해요.', {
          description: '로그인 후 이용해주세요.',
        });
        router.push('/login');
      }
    };

    handleAuth();
  }, [pathname, router, checkAuth]);

  return <>{children}</>;
}
