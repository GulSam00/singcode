'use client';

import { useState } from 'react';

import StaticLoading from '@/components/StaticLoading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTotalStatQuery } from '@/queries/totalStatQuery';
import { CountType, PeriodType } from '@/types/totalStat';

import PopularRankingList from './PopularRankingList';

export default function PopularPage() {
  const [typeTab, setTypeTab] = useState<CountType>('sing_count');
  const [periodTab, setPeriodTab] = useState<PeriodType>('all');

  const { isLoading, isPending, data } = useTotalStatQuery(typeTab, periodTab);

  if (isLoading || isPending || !data) return <StaticLoading />;

  return (
    <div className="bg-background h-full px-2 py-4 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">인기 노래</h1>

      <Tabs
        value={typeTab}
        onValueChange={value => setTypeTab(value as CountType)}
        className="w-full"
      >
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="sing_count">부른 곡</TabsTrigger>
          <TabsTrigger value="like_count">좋아요</TabsTrigger>
        </TabsList>

        {/* 부른 곡 탭 콘텐츠 */}
        <TabsContent value="sing_count" className="space-y-6">
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

            <TabsContent value="all" className="mt-4">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <PopularRankingList title="전체 부른 곡 순위" songStats={data} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="year" className="mt-4">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <PopularRankingList title="연간 부른 곡 순위" songStats={data} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="month" className="mt-4">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <PopularRankingList title="월간 부른 곡 순위" songStats={data} />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* 좋아요 탭 콘텐츠 */}
        <TabsContent value="like_count">
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <PopularRankingList title="좋아요 순위" songStats={data} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
