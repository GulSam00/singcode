'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ErrorContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      const errorMessage = {
        code: errorCode || 'unknown',
        message: errorDescription?.replace(/\+/g, ' ') || '인증 오류가 발생했습니다.',
        type: error,
      };

      throw new Error(JSON.stringify(errorMessage));
    }
  }, [searchParams]);

  return children;
}
