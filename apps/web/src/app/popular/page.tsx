import { Construction } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PopularPage() {
  return (
    <div className="bg-background h-full px-4 py-12">
      <Card className="m-auto h-full w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl">서비스 준비 중</CardTitle>
          <CardDescription className="text-center">
            더 나은 서비스를 위해 준비 중입니다
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col items-center justify-center py-8">
          <Construction className="text-muted-foreground mb-4 h-24 w-24" />
          <p className="text-muted-foreground text-center">
            곧 새로운 기능으로 찾아뵙겠습니다
            <br />
            조금만 기다려주세요
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
