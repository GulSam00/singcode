'use client';

import { useLoadingStore } from '@/stores/useLoadingStore';

const LoadingOverlay = () => {
  const isLoading = useLoadingStore(state => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="bg-opacity-30 pointer-events-auto fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-white" />
    </div>
  );
};

export default LoadingOverlay;
