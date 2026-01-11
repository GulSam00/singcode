import { Construction } from 'lucide-react';

import RankingItem from '@/components/RankingItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SongStat } from '@/types/totalStat';

interface RankingListProps {
  title: string;
  songStats: SongStat[];
}
export default function PopularRankingList({ title, songStats }: RankingListProps) {
  return (
    // <Card className={cn('max-w-md w-full')}>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0">
          {songStats.length > 0 ? (
            songStats.map((item, index) => (
              <RankingItem key={index} {...item} rank={index + 1} value={item.value} />
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
