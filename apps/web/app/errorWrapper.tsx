'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function ErrorWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    // 에러 파라미터 확인
    const error = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      // 에러 정보를 구조화
      const errorMessage = {
        code: errorCode || 'unknown',
        message: errorDescription?.replace(/\+/g, ' ') || '인증 오류가 발생했습니다.',
        type: error,
      }

      // 에러를 throw하여 Error Boundary 트리거
      throw new Error(JSON.stringify(errorMessage))
    }
  }, [searchParams])

  return children
}
