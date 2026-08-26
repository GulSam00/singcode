'use client';

import { ArtistRankingItem } from '@/types/artistVote';
import { cn } from '@/utils/cn';
import { formatVoteShare } from '@/utils/formatVoteShare';

import ArtistName from './ArtistName';
import ArtistPortrait, { PortraitTone } from './ArtistPortrait';
import WinStars from './WinStars';

/**
 * 1~3위 액자 카드의 톤·크기. 1위만 한 단계 크게 둬서 위계를 남긴다.
 * 2·3위는 은·동 대신 황동 하나를 그대로 나눠 쓴다(이유는 PortraitTone 주석 참고).
 * 둘의 카드가 완전히 같으므로, 크기 차이를 1위와의 사이에만 두는 지금 배치를 유지해야
 * 2위와 3위가 순위 라벨과 순서로만 구분된다.
 */
const MEDAL = {
  1: { tone: 'gold', size: 96, card: 'border-amber-500 bg-amber-500/10' },
  2: { tone: 'brass', size: 80, card: 'border-[#a38c64] bg-[#a38c64]/10' },
  3: { tone: 'brass', size: 80, card: 'border-[#a38c64] bg-[#a38c64]/10' },
} satisfies Record<number, { tone: PortraitTone; size: number; card: string }>;

/**
 * 액자가 차지하는 자리의 폭. 액자 자체는 순위마다 작아져도 이 칸은 1위 크기로 고정한다.
 * 칸이 액자를 따라 줄면 오른쪽 본문이 카드마다 다른 지점에서 시작해, 세 카드를 세로로
 * 쌓았을 때 이름 줄이 계단처럼 어긋난다. 1위 크기를 그대로 참조해 둘이 벌어지지 않게 한다.
 */
const PORTRAIT_SLOT = MEDAL[1].size;

/**
 * 4위 아래 막대의 농도. 같은 색 하나를 옅게 단계지어 구간을 구분한다.
 * 서로 다른 색을 쓰면 순위가 아니라 종류가 다른 것처럼 읽힌다.
 */
const BAR_TONES = [
  { from: 4, to: 10, bar: 'bg-foreground/70' },
  { from: 11, to: 20, bar: 'bg-foreground/45' },
  { from: 21, to: 30, bar: 'bg-foreground/25' },
];

const getBarTone = (rank: number) =>
  BAR_TONES.find(tone => rank >= tone.from && rank <= tone.to)?.bar ?? 'bg-foreground/25';

interface MedalCardProps {
  item: ArtistRankingItem;
  total: number;
}

/** 1~3위 — 왼쪽 액자, 오른쪽 정보 */
function MedalCard({ item, total }: MedalCardProps) {
  const medal = MEDAL[item.rank as 1 | 2 | 3];

  return (
    <div className={cn('flex w-full flex-col gap-3 rounded-xl border-2 p-4', medal.card)}>
      {/* 역대 우승 표식 — 프로 스포츠가 엠블럼 위에 우승 별을 달듯 카드 맨 위에 새긴다. */}
      <WinStars artist={item.artist} wins={item.wins} />

      <div className="flex w-full items-center gap-4">
        {/* 작은 액자는 1위와 같은 폭의 칸 안에 가운데로 놓는다.
            왼쪽으로 붙이면 액자 오른쪽에만 빈 자리가 생겨 칸을 고정한 티가 난다. */}
        <span className="flex shrink-0 justify-center" style={{ width: PORTRAIT_SLOT }}>
          <ArtistPortrait
            name={item.artist}
            imageUrl={item.artistImage}
            size={medal.size}
            tone={medal.tone}
          />
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1">
          {item.rank === 1 ? (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              🏆 이달의 아티스트
            </span>
          ) : (
            <span className="text-muted-foreground text-xs font-bold">{item.rank}위</span>
          )}

          <ArtistName
            name={item.artist}
            artistKo={item.artistKo}
            className={item.rank === 1 ? 'text-lg font-bold' : 'text-base font-bold'}
          />

          <span className="text-muted-foreground text-sm">
            <span className="text-foreground font-bold tabular-nums">{item.totalVotes}</span>P ·{' '}
            <span className="tabular-nums">{formatVoteShare(item.totalVotes, total)}</span>
          </span>

          {item.topVoterNickname && (
            <span className="text-muted-foreground truncate text-xs">
              최다 투표 {item.topVoterNickname}
              {item.topVoterAmount !== null && ` (${item.topVoterAmount}P)`}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

interface BarRowProps {
  item: ArtistRankingItem;
  total: number;
  /** 1위 득표. 막대 길이의 기준이라 전 구간이 같은 자로 재진다. */
  maxVotes: number;
}

/** 4~30위 — 액자 없이 한 줄. 막대 길이는 득표량, 농도는 순위 구간을 뜻한다. */
function BarRow({ item, total, maxVotes }: BarRowProps) {
  const width = maxVotes > 0 ? (item.totalVotes / maxVotes) * 100 : 0;

  return (
    <div className="flex w-full items-center gap-3 border-b px-2 py-2 last:border-0">
      <span className="text-muted-foreground w-6 shrink-0 text-sm font-bold tabular-nums">
        {item.rank}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <ArtistName name={item.artist} artistKo={item.artistKo} className="text-sm" />
        <span className="bg-muted h-1 w-full overflow-hidden rounded-full">
          {/* 득표가 아주 적어도 막대가 사라지지 않도록 최소 폭을 남긴다 */}
          <span
            className={cn('block h-full rounded-full', getBarTone(item.rank))}
            style={{ width: `${Math.max(width, 2)}%` }}
          />
        </span>
      </span>

      <span className="text-muted-foreground shrink-0 text-right text-xs tabular-nums">
        <span className="block">{item.totalVotes}P</span>
        <span className="block">{formatVoteShare(item.totalVotes, total)}</span>
      </span>
    </div>
  );
}

interface ArtistRankingBoardProps {
  items: ArtistRankingItem[];
}

export default function ArtistRankingBoard({ items }: ArtistRankingBoardProps) {
  const total = items.reduce((sum, item) => sum + item.totalVotes, 0);
  const maxVotes = Math.max(...items.map(item => item.totalVotes), 1);

  const medalists = items.filter(item => item.rank <= 3);
  const rest = items.filter(item => item.rank >= 4);

  return (
    <div className="flex flex-col gap-3">
      {medalists.map(item => (
        <MedalCard key={item.artist} item={item} total={total} />
      ))}

      {rest.length > 0 && (
        <div className="flex flex-col">
          {rest.map(item => (
            <BarRow key={item.artist} item={item} total={total} maxVotes={maxVotes} />
          ))}
        </div>
      )}
    </div>
  );
}
