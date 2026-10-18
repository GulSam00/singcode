import SongSummary from '@/components/SongSummary';
import { Song } from '@/types/song';

export default function RecentSongCard({ song }: { song: Song }) {
  // 간격과 구분선은 인기 차트(ChartRankingList)와 같은 규칙을 쓴다.
  // 행 아래쪽 테두리로 선을 긋고 마지막 행에서만 지워, 리스트 끝에 선이 떠 있지 않게 한다.
  return (
    <div className="border-b px-4 py-3 last:border-0">
      <SongSummary song={song} />
    </div>
  );
}
