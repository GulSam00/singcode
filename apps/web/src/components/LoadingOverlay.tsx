'use client';

import { useEffect, useState } from 'react';

// import useLoadingStore from '@/stores/useLoadingStore';

export default function LoadingOverlay() {
  // const { isLoading } = useLoadingStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // if (!isLoading) return null;

  return (
    <div className="fixed top-0 z-[9999] flex h-full w-[360px] items-center justify-center bg-white/90">
      <div className="border-secondary border-t-primary h-12 w-12 animate-spin rounded-full border-4" />
    </div>
  );
}
