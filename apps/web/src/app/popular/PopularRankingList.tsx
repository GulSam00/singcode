'use client';

import { Construction } from 'lucide-react';

import RankingItem from '@/components/RankingItem';
import StaticLoading from '@/components/StaticLoading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSongThumbQuery } from '@/queries/songThumbQuery';

export default function PopularRankingList() {
  const { data, isPending } = useSongThumbQuery();

  if (isPending) {
    return <StaticLoading />;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">추천 곡 순위</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0">
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <RankingItem key={index} {...item} rank={index + 1} value={item.total_thumb} />
            ))
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-4">
              <Construction className="text-muted-foreground h-16 w-16" />
              <p className="text-muted-foreground text-xl">데이터를 준비중이에요</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
