'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import StaticLoading from '@/components/StaticLoading';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { usePointLogsQuery } from '@/queries/userQuery';
import useAuthStore from '@/stores/useAuthStore';

export default function PointLogsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading } = usePointLogsQuery(isAuthenticated);
  const logs = data ?? [];

  return (
    <div className="bg-background h-full">
      {isLoading && <StaticLoading />}
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">포인트 사용 내역</h1>
      </div>

      <div className="flex h-[48px] items-center p-2">
        <p className="text-muted-foreground text-sm">총 {logs.length}건</p>
      </div>

      <Separator className="mb-4" />

      <ScrollArea className="h-[calc(100vh-20rem)]">
        {logs.length === 0 && !isLoading ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            <p>포인트 사용 내역이 없습니다.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {logs.map(log => (
              <li key={log.id} className="flex items-center justify-between px-2 py-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{log.description}</span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(log.created_at).toLocaleString('ko-KR')}
                  </span>
                </div>
                <span className="text-sm font-bold text-red-500">-{log.amount}P</span>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
