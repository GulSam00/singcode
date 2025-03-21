'use client';

type ErrorPageProps = {
  error: Error;
  reset: () => void;
};

interface AuthError {
  code: string;
  message: string;
  type: string;
}

export default function Error({ error, reset }: ErrorPageProps) {
  const errorMessage = error.message;
  let errorDetails: AuthError | null = null;

  // 에러 메시지 파싱 시도
  try {
    errorDetails = JSON.parse(error.message) as AuthError;
  } catch {
    // 파싱 실패 시 기본 메시지 사용
  }

  return (
    <div className="error-container">
      <h1>인증 오류</h1>

      {errorDetails ? (
        <div>
          <p className="error-code">에러 코드: {errorDetails.code}</p>
          <p className="error-message">{decodeURIComponent(errorDetails.message)}</p>
          {errorDetails.type === 'access_denied' && <p>인증 링크가 만료되었거나 유효하지 않습니다.</p>}
        </div>
      ) : (
        <p>{errorMessage || '서버에서 오류가 발생했습니다.'}</p>
      )}

      <div className="action-buttons">
        <button onClick={() => reset()}>다시 시도</button>
        <button onClick={() => (window.location.href = '/')}>홈으로 돌아가기</button>
      </div>
    </div>
  );
}
