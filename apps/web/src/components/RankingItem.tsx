import { cn } from '@/utils/cn';

interface RankingItemProps {
  rank: number;
  title: string;
  artist: string;
  value: number;
  className?: string;
}

export default function RankingItem({ rank, title, artist, value, className }: RankingItemProps) {
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
      <div className="flex w-full justify-between">
        <div className="max-w-[200px] min-w-0 flex-1">
          <h4 className="truncate text-sm font-medium">{title}</h4>
          <p className="text-muted-foreground truncate text-xs">{artist}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="truncate text-xs">{value}회</p>
        </div>
      </div>
    </div>
  );
}
