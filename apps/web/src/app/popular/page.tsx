'use client';

import { useState } from 'react';

import StaticLoading from '@/components/StaticLoading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTotalStatQuery } from '@/queries/totalStatQuery';
import { PeriodType } from '@/types/totalStat';

import PopularRankingList from './PopularRankingList';

export default function PopularPage() {
  const [periodTab, setPeriodTab] = useState<PeriodType>('all');

  const { isLoading, isPending, data } = useTotalStatQuery('sing_count', periodTab);

  if (isLoading || isPending || !data) return <StaticLoading />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">인기 노래</h1>

      {/* 부른 곡 탭 콘텐츠 */}
      <Tabs value={periodTab} onValueChange={value => setPeriodTab(value as PeriodType)}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            전체
          </TabsTrigger>
          <TabsTrigger value="year" className="flex-1">
            년별
          </TabsTrigger>
          <TabsTrigger value="month" className="flex-1">
            월별
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="py-4">
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <PopularRankingList title="전체 부른 곡 순위" songStats={data} />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="year" className="py-4">
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <PopularRankingList title="연간 부른 곡 순위" songStats={data} />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="month" className="py-4">
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <PopularRankingList title="월간 부른 곡 순위" songStats={data} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
