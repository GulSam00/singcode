'use client';

import { AlertCircle, Home, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

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

// confirm.ts가 직접 붙이는 코드만 한글 문구를 갖는다.
// 그 밖의 값은 Supabase가 던진 영문 원문이라 종류가 열려 있어 번역할 수 없다.
const MESSAGE_BY_CODE: Record<string, string> = {
  'missing-parameters': '인증 링크에 필요한 정보가 없어요. 메일에 온 링크를 다시 확인해주세요.',
  'unexpected-error': '예상치 못한 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
};

const FALLBACK_MESSAGE = '인증에 실패했어요. 링크가 만료되었을 수 있어요.';

function ErrorMessage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  const knownMessage = message ? MESSAGE_BY_CODE[message] : null;
  // 원문을 화면에서 지우면 문의가 들어왔을 때 원인을 되짚을 길이 없다.
  // 기본 문구로 덮되, 펼쳐서 볼 수 있게 남겨 둔다.
  const rawMessage = message && !knownMessage ? message : null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>인증에 실패했어요</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <span>
          {knownMessage ?? (message ? FALLBACK_MESSAGE : '알 수 없는 오류가 발생했어요.')}
        </span>

        {rawMessage && (
          <details className="text-muted-foreground text-xs">
            <summary className="cursor-pointer">오류 원문 보기</summary>
            <p className="mt-1 break-all">{rawMessage}</p>
          </details>
        )}
      </AlertDescription>
    </Alert>
  );
}

export default function ErrorPage() {
  return (
    <div className="flex min-h-full items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">인증 오류</CardTitle>
          <CardDescription className="text-center">인증 과정에서 문제가 발생했어요</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* useSearchParams를 감싸지 않으면 페이지 전체가 CSR로 빠져, JS가 로드될 때까지
              제목도 버튼도 없는 빈 화면이 된다. 조회 문자열이 필요한 부분만 넘긴다. */}
          <Suspense fallback={<div className="bg-muted h-20 animate-pulse rounded-lg" />}>
            <ErrorMessage />
          </Suspense>

          <div className="text-muted-foreground bg-muted rounded-md p-3 text-sm">
            <p>인증 링크는 한 번만 쓸 수 있고 일정 시간이 지나면 만료돼요. 다시 시도해주세요.</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button className="w-full gap-2 sm:w-1/2" asChild>
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              로그인 페이지로
            </Link>
          </Button>
          <Button variant="outline" className="w-full gap-2 sm:w-1/2" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              홈으로 돌아가기
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
