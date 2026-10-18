import SongSummary from '@/components/SongSummary';
import { TjChartRankingSong } from '@/types/tjChart';
import { cn } from '@/utils/cn';

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-amber-500 text-white font-bold';
    case 2:
      return 'bg-gray-300 text-white font-bold';
    case 3:
      return 'bg-amber-700 text-white font-bold';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

// 허브 미리보기와 전체 보기가 같은 행 모양을 쓴다.
export default function ChartRankItem({ item }: { item: TjChartRankingSong }) {
  return (
    <div className="flex items-start gap-4 border-b px-4 py-3 last:border-0">
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          getRankStyle(item.rank),
        )}
      >
        {item.rank}
      </div>
      {/* 순위 뱃지와 같은 행이라 min-w-0이 없으면 긴 곡 제목·가수가 번호 영역을 밀어낸다 */}
      <SongSummary song={item} className="min-w-0 flex-1" />
    </div>
  );
}
