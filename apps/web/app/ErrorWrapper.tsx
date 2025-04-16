'use client';

import { Suspense } from 'react';

import ErrorContent from '@/components/ErrorContent';

export default function ErrorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p>로딩 중...</p>
        </div>
      }
    >
      <ErrorContent>{children}</ErrorContent>
    </Suspense>
  );
}
