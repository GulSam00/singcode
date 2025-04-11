import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';

interface RankingItemProps {
  rank: number;
  title: string;
  artist: string;

  className?: string;
}

export function RankingItem({ rank, title, artist, className }: RankingItemProps) {
  // 등수에 따른 색상 및 스타일 결정
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-500 text-white font-bold'; // 금메달 색상
      case 2:
        return 'bg-gray-300 text-white font-bold'; // 은메달 색상
      case 3:
        return 'bg-amber-700 text-white font-bold'; // 동메달 색상
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className={cn('flex items-start space-x-3 border-b py-3 last:border-0', className)}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          getRankStyle(rank),
        )}
      >
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium">{title}</h4>
        <p className="text-muted-foreground truncate text-xs">{artist}</p>
      </div>
    </div>
  );
}

interface RankingListProps {
  title: string;
  items: Array<Omit<RankingItemProps, 'className'>>;
  className?: string;
}

export default function RankingList({ title, items, className }: RankingListProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0">
          {items.map((item, index) => (
            <RankingItem key={index} {...item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
