'use client';

import { useState } from 'react';

import StaticLoading from '@/components/StaticLoading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSongThumbQuery } from '@/queries/songThumbQuery';

import PopularRankingList from './PopularRankingList';

export default function PopularPage() {
  const { isPending, data } = useSongThumbQuery();

  if (isPending || !data) return <StaticLoading />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">인기 노래</h1>

      {/* 추천 곡 순위 */}
      <ScrollArea className="h-[calc(100vh-20rem)]">
        <PopularRankingList title="추천 곡 순위" songStats={data} />
      </ScrollArea>
    </div>
  );
}
