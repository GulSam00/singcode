'use client';

import { AlertCircle, Home } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type ErrorPageProps = {
  error: Error;
  reset: () => void;
};

interface AuthError {
  code: string;
  message: string;
  type: string;
}

export default function Error({ error }: ErrorPageProps) {
  const message = error.message;
  let errorDetails: AuthError | null = null;
  let isAuthError = false;

  // 에러 메시지 파싱 시도
  try {
    errorDetails = JSON.parse(error.message) as AuthError;
    isAuthError = Boolean(errorDetails?.code);
  } catch {
    // 파싱 실패 시 기본 메시지 사용
  }

  // 에러 로깅
  // useEffect(() => {
  //   console.error('페이지 에러:', error);
  // }, [error]);

  return (
    <div className="container flex h-dvh items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            {isAuthError ? '인증 오류' : '오류가 발생했습니다'}
          </CardTitle>
          <CardDescription className="text-center">
            {isAuthError
              ? '인증 과정에서 문제가 발생했습니다'
              : '페이지를 로드하는 중 문제가 발생했습니다'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {errorDetails?.code ? `에러 코드: ${errorDetails.code}` : '오류 발생'}
            </AlertTitle>
            <AlertDescription>
              {errorDetails
                ? decodeURIComponent(errorDetails.message)
                : message || '서버에서 오류가 발생했습니다.'}
            </AlertDescription>
          </Alert>

          {errorDetails?.type === 'access_denied' && (
            <div className="text-muted-foreground bg-muted rounded-md p-3 text-sm">
              <p>
                인증 링크가 만료되었거나 유효하지 않습니다. 새로운 인증 링크를 요청하시거나 다시
                시도해주세요.
              </p>
            </div>
          )}

          {!isAuthError && (
            <div className="text-muted-foreground bg-muted rounded-md p-3 text-sm">
              <p>
                일시적인 문제일 수 있습니다. 다시 시도하거나 홈으로 돌아가 다른 기능을 이용해보세요.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button className="w-full gap-2 sm:w-1/2" onClick={() => (window.location.href = '/')}>
            <Home className="h-4 w-4" />
            홈으로 돌아가기
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
