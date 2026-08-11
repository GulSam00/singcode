'use client';

import { addMonths, format, parseISO, startOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Construction } from 'lucide-react';
import { useState } from 'react';

import MarqueeText from '@/components/MarqueeText';
import SongBadges from '@/components/SongBadges';
import StaticLoading from '@/components/StaticLoading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTjChartQuery } from '@/queries/tjChartQuery';
import { StrType } from '@/types/tjChart';
import { cn } from '@/utils/cn';
import { getPrevMonthFirstDayKST } from '@/utils/kst';

import ChartGenreFilter from './ChartGenreFilter';

const MONTH_FORMAT = 'yyyy-MM-dd';

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

const formatMonth = (month: string) => {
  const [year, m] = month.split('-');
  return `${year}년 ${Number(m)}월`;
};

const shiftMonth = (month: string, delta: number) =>
  format(startOfMonth(addMonths(parseISO(month), delta)), MONTH_FORMAT);

export default function ChartRankingList() {
  const [genre, setGenre] = useState<StrType>(StrType.All);
  // 차트는 월 단위로 마감되므로 이번 달 데이터는 아직 없다. 전월을 기본으로 보여준다.
  const [month, setMonth] = useState(getPrevMonthFirstDayKST);

  const { data, isPending, isError, isPlaceholderData } = useTjChartQuery(month, genre);

  if (isPending) {
    return <StaticLoading />;
  }

  const availableMonths = data?.availableMonths ?? [];
  const items = data?.items ?? [];

  // availableMonths는 최신순이므로 마지막 원소가 가장 오래된 월이다.
  const oldestMonth = availableMonths.at(-1);
  const canGoPrev = !!oldestMonth && month > oldestMonth;
  const canGoNext = month < getPrevMonthFirstDayKST();

  return (
    <Card className="relative flex min-h-0 flex-1 flex-col">
      <CardHeader className="flex shrink-0 flex-col gap-3 pb-2">
        {/* 차트 제목은 페이지 h1로 빠졌고, 헤더에는 조회 월만 중앙에 둔다. */}
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="이전 달"
            disabled={!canGoPrev}
            onClick={() => setMonth(shiftMonth(month, -1))}
          >
            <ChevronLeft />
          </Button>

          <span className="w-24 text-center text-sm font-medium">{formatMonth(month)}</span>

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="다음 달"
            disabled={!canGoNext}
            onClick={() => setMonth(shiftMonth(month, 1))}
          >
            <ChevronRight />
          </Button>
        </div>

        <ChartGenreFilter value={genre} onChange={setGenre} />
      </CardHeader>

      <ScrollArea className="min-h-0 flex-1">
        <CardContent className="pt-0">
          <div className={cn('space-y-0 transition-opacity', isPlaceholderData && 'opacity-50')}>
            {isError || items.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-4">
                <Construction className="text-muted-foreground h-16 w-16" />
                <p className="text-muted-foreground text-xl">데이터를 준비중이에요</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className={cn('flex gap-4 border-b py-3 last:border-0')}>
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      getRankStyle(item.rank),
                    )}
                  >
                    {item.rank}
                  </div>
                  <div className="flex w-full justify-between gap-2">
                    <div className="w-[140px] shrink-0">
                      {/* TJ가 같은 곡을 버전별로 따로 올리므로, 무엇이 다른지 여기서 알려준다 */}
                      <SongBadges badges={item.badges} className="mb-0.5" />
                      <MarqueeText className="text-sm font-medium">{item.title}</MarqueeText>
                      {item.title_ko && item.title_ko !== item.title && (
                        <MarqueeText className="text-muted-foreground text-xs">
                          {item.title_ko}
                        </MarqueeText>
                      )}
                      <MarqueeText className="text-muted-foreground text-xs">
                        {item.artist}
                      </MarqueeText>
                      {item.artist_ko && item.artist_ko !== item.artist && (
                        <MarqueeText className="text-muted-foreground/70 text-xs">
                          {item.artist_ko}
                        </MarqueeText>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center">
                        <span className="text-brand-tj mr-1 w-8 text-xs">TJ</span>
                        <span className="text-sm font-medium">{item.num_tj}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-brand-ky mr-1 w-8 text-xs">금영</span>
                        <span className="text-sm font-medium">{item.num_ky}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
