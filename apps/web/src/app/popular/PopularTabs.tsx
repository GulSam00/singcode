'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import ArtistOfMonthTab from './ArtistOfMonthTab';
import ChartRankingList from './ChartRankingList';

export default function PopularTabs() {
  return (
    <Tabs defaultValue="chart" className="flex min-h-0 flex-1 flex-col gap-3">
      <TabsList className="w-full">
        <TabsTrigger value="chart">노래방 인기곡</TabsTrigger>
        <TabsTrigger value="artist">이달의 아티스트</TabsTrigger>
      </TabsList>

      <TabsContent value="chart" className="flex min-h-0 flex-1 flex-col">
        <ChartRankingList />
      </TabsContent>

      <TabsContent value="artist" className="flex min-h-0 flex-1 flex-col">
        <ArtistOfMonthTab />
      </TabsContent>
    </Tabs>
  );
}
