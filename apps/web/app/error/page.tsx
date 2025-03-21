'use client';

import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message');

  return (
    <div className="error-container">
      <h1>인증 오류</h1>
      <div className="error-content">
        <p className="error-message">{errorMessage ? errorMessage : '알 수 없는 오류가 발생했습니다.'}</p>
        <div className="error-actions">
          <button onClick={() => (window.location.href = '/login')} className="retry-button">
            로그인 페이지로 돌아가기
          </button>
          <button onClick={() => (window.location.href = '/')} className="home-button">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
