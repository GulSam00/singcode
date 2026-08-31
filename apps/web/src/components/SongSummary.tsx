'use client';

import { getPrimaryArtistName } from '@repo/constants';

import MarqueeText from '@/components/MarqueeText';
import SongBadges from '@/components/SongBadges';
import { useCurrentArtistOfMonthQuery } from '@/queries/artistVoteQuery';
import { Song } from '@/types/song';
import { cn } from '@/utils/cn';
import { splitDisplay } from '@/utils/songDisplay';

type SummarySong = Pick<
  Song,
  'title' | 'artist' | 'title_ko' | 'artist_ko' | 'num_tj' | 'num_ky' | 'badges'
>;

interface SongSummaryProps {
  song: SummarySong;
  className?: string;
}

/**
 * 곡 카드의 공통 본문 — 뱃지 / 제목 / 아티스트 / TJ·금영 번호.
 *
 * 부를 곡·최신 곡·인기 곡 화면이 각자 다른 마크업으로 같은 정보를 그리고 있어
 * 글자 크기와 번호 정렬이 제각각이었다. 여기 한 곳만 고치면 세 화면이 함께 바뀐다.
 * 순위 뱃지, 드래그 핸들, 액션 버튼처럼 화면마다 다른 요소는 각 카드가 감싸서 붙인다.
 */
export default function SongSummary({ song, className }: SongSummaryProps) {
  const { title, artist, title_ko, artist_ko, num_tj, num_ky, badges } = song;

  const titleParts = splitDisplay(title_ko, title);
  const artistParts = splitDisplay(artist_ko, artist);

  // songs.artist는 "IU(Feat.최백호)"처럼 원문 그대로라, artists 마스터에 등록된 정규화된
  // 이름과 곧이곧대로 비교하면 우승 아티스트의 피처링·듀엣 곡에 배지가 빠진다.
  // 맨 앞에 적힌 주 아티스트만 뽑아 비교한다.
  const { data: artistOfMonth } = useCurrentArtistOfMonthQuery();
  const isArtistOfMonth = !!artistOfMonth && artistOfMonth.artist === getPrimaryArtistName(artist);

  return (
    <div className={cn('flex w-full items-start justify-between gap-3', className)}>
      {/* min-w-0가 없으면 MarqueeText가 부모를 밀어내 번호 영역이 잘린다 */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <SongBadges badges={badges} className="mb-0.5" />

        <MarqueeText className="text-base font-medium">{titleParts.primary}</MarqueeText>
        {titleParts.secondary && (
          <MarqueeText className="text-muted-foreground text-xs">
            {titleParts.secondary}
          </MarqueeText>
        )}

        <MarqueeText className="text-muted-foreground text-sm">{artistParts.primary}</MarqueeText>
        {artistParts.secondary && (
          <MarqueeText className="text-muted-foreground/70 text-xs">
            {artistParts.secondary}
          </MarqueeText>
        )}
        {isArtistOfMonth && (
          <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            {/* month는 'YYYY-MM-DD'(매월 1일)라 앞 7자리만 잘라 쓴다.
                "이달"이 언제인지는 곡 카드만 보면 알 수 없어 선정된 달을 함께 적는다. */}
            🏆 {artistOfMonth.month.slice(0, 7)} 이달의 아티스트
          </span>
        )}
      </div>

      {/* 번호는 자릿수가 달라도 세로로 맞아떨어지도록 고정폭 + tabular-nums */}
      <div className="shrink-0 space-y-0.5">
        <div className="flex items-center justify-end gap-1">
          <span className="text-brand-tj text-xs font-bold">TJ</span>
          <span className="w-12 text-right text-sm font-medium tabular-nums">{num_tj}</span>
        </div>
        <div className="flex items-center justify-end gap-1">
          <span className="text-brand-ky text-xs font-bold">금영</span>
          <span className="w-12 text-right text-sm font-medium tabular-nums">{num_ky}</span>
        </div>
      </div>
    </div>
  );
}
