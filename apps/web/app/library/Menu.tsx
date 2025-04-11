import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MenuContentProps {
  menuType: 'liked' | 'stats';
}

export default function Menu({ menuType }: MenuContentProps) {
  const router = useRouter();
  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">반갑습니다, 홍길동님</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-muted-foreground text-center">
              {menuType === 'liked'
                ? '좋아요 곡 관리 콘텐츠가 여기에 표시됩니다'
                : '노래방 통계 콘텐츠가 여기에 표시됩니다'}
            </p>
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
}
