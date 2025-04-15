import { Home } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="container flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">페이지를 찾을 수 없어요</CardTitle>
          <CardDescription className="text-center">
            요청하신 페이지가 존재하지 않아요
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="text-muted-foreground mb-4 text-8xl font-bold">404</div>
          <p className="text-muted-foreground text-center">
            주소가 올바른지 확인하거나 <br />
            다른 페이지로 이동해보세요
          </p>
        </CardContent>

        <CardFooter className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button className="w-full gap-2 sm:w-1/2" asChild>
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
