'use client';

import { ArtistRankingItem } from '@/types/artistVote';
import { cn } from '@/utils/cn';

const PODIUM_STYLE: Record<number, string> = {
  1: 'border-amber-500 bg-amber-500/10',
  2: 'border-gray-300 bg-gray-300/10',
  3: 'border-amber-700 bg-amber-700/10',
};

const PODIUM_MEDAL: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

function PodiumCard({ item, onClick }: { item: ArtistRankingItem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg border p-3 text-center',
        PODIUM_STYLE[item.rank],
      )}
    >
      <span className="text-2xl">{PODIUM_MEDAL[item.rank]}</span>
      <span className="w-full truncate text-sm font-bold">{item.artist}</span>
      <span className="text-muted-foreground text-xs">{item.totalVotes}P</span>
      {item.topVoterNickname && (
        <span className="text-muted-foreground truncate text-[11px]">
          최다 투표 {item.topVoterNickname}
        </span>
      )}
      {item.rank === 1 && item.starCount > 0 && (
        <span className="text-xs text-amber-500" aria-label={`${item.starCount}회 선정`}>
          {'★'.repeat(item.starCount)}
        </span>
      )}
    </button>
  );
}

interface ArtistRankingBoardProps {
  items: ArtistRankingItem[];
  onSelectArtist: (artist: string) => void;
}

export default function ArtistRankingBoard({ items, onSelectArtist }: ArtistRankingBoardProps) {
  const top3 = items.filter(item => item.rank <= 3);
  const rest = items.filter(item => item.rank > 3);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {top3.map(item => (
          <PodiumCard key={item.artist} item={item} onClick={() => onSelectArtist(item.artist)} />
        ))}
      </div>

      <div className="flex flex-col">
        {rest.map(item => (
          <button
            key={item.artist}
            type="button"
            onClick={() => onSelectArtist(item.artist)}
            className="flex items-center justify-between border-b px-2 py-2 text-left last:border-0"
          >
            <span className="truncate">
              {item.rank}위 {item.artist}
            </span>
            <span className="text-muted-foreground shrink-0 text-sm">{item.totalVotes}P</span>
          </button>
        ))}
      </div>
    </div>
  );
}
