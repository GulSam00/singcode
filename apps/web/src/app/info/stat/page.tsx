'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import StaticLoading from '@/components/StaticLoading';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import useUserStat from '@/hooks/useUserStat';

import UserRankingList from './UserRankingList';

export default function StatsPage() {
  const router = useRouter();

  const { userStat, isLoading } = useUserStat();

  return (
    <div className="bg-background flex h-full flex-col gap-4">
      {isLoading && <StaticLoading />}
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">노래 통계</h1>
      </div>

      <ScrollArea className="h-[calc(100vh-20rem)]">
        <UserRankingList title="가장 많이 부른 곡" items={userStat.slice(0, 10)} />
      </ScrollArea>
    </div>
  );
}
