'use client';

import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTotalStatQuery } from '@/queries/totalStatQuery';
import { CountType, PeriodType } from '@/types/totalStat';

export default function PopularPage() {
  const [mainTab, setMainTab] = useState<CountType>('sing_count');
  const [singTab, setSingTab] = useState<PeriodType>('all');

  const { isLoading, data } = useTotalStatQuery(mainTab, singTab);
  console.log('useTotalStatQuery', data);

  return (
    <div className="bg-background mx-auto h-full px-2 py-4 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">인기 노래</h1>

      <Tabs
        value={mainTab}
        onValueChange={value => setMainTab(value as CountType)}
        className="w-full"
      >
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="sing_count">부른 곡</TabsTrigger>
          <TabsTrigger value="like_count">좋아요</TabsTrigger>
        </TabsList>

        {/* 부른 곡 탭 콘텐츠 */}
        <TabsContent value="sing_count" className="space-y-6">
          <Tabs value={singTab} onValueChange={value => setSingTab(value as PeriodType)}>
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
              {/* <RankingList title="전체 부른 곡 순위" items={SUNG_ALL_SONGS} /> */}
            </TabsContent>

            <TabsContent value="monthly" className="mt-4">
              {/* <RankingList title="월별 부른 곡 순위" items={SUNG_MONTHLY_SONGS} /> */}
            </TabsContent>

            <TabsContent value="weekly" className="mt-4">
              {/* <RankingList title="주별 부른 곡 순위" items={SUNG_WEEKLY_SONGS} /> */}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* 좋아요 탭 콘텐츠 */}
        <TabsContent value="like_count">
          {/* <RankingList title="좋아요 많은 곡 순위" items={LIKED_SONGS} /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
