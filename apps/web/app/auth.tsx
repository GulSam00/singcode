'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/lib/store/useAuthStore';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
};

export default AuthProvider;
