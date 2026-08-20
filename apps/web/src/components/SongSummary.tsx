'use client';

import MarqueeText from '@/components/MarqueeText';
import SongBadges from '@/components/SongBadges';
import { useCurrentArtistOfMonthQuery } from '@/queries/artistVoteQuery';
import { Song } from '@/types/song';
import { cn } from '@/utils/cn';

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

  const hasKoTitle = !!title_ko && title_ko !== title;
  const hasKoArtist = !!artist_ko && artist_ko !== artist;

  const { data: artistOfMonth } = useCurrentArtistOfMonthQuery();
  const isArtistOfMonth = artistOfMonth?.artist === artist;

  return (
    <div className={cn('flex w-full items-start justify-between gap-3', className)}>
      {/* min-w-0가 없으면 MarqueeText가 부모를 밀어내 번호 영역이 잘린다 */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <SongBadges badges={badges} className="mb-0.5" />

        <MarqueeText className="text-base font-medium">{title}</MarqueeText>
        {hasKoTitle && (
          <MarqueeText className="text-muted-foreground text-xs">{title_ko}</MarqueeText>
        )}

        <MarqueeText className="text-muted-foreground text-sm">{artist}</MarqueeText>
        {hasKoArtist && (
          <MarqueeText className="text-muted-foreground/70 text-xs">{artist_ko}</MarqueeText>
        )}
        {isArtistOfMonth && (
          <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            🏆 이달의 아티스트
            {artistOfMonth.starCount > 0 && ` ★${artistOfMonth.starCount}`}
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
