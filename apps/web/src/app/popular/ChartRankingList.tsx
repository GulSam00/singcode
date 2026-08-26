'use client';

import { addMonths, format, parseISO, startOfMonth } from 'date-fns';
import { Construction } from 'lucide-react';
import { useState } from 'react';

import SongSummary from '@/components/SongSummary';
import StaticLoading from '@/components/StaticLoading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTjChartQuery } from '@/queries/tjChartQuery';
import { StrType } from '@/types/tjChart';
import { cn } from '@/utils/cn';
import { getPrevMonthFirstDayKST } from '@/utils/kst';

import ChartGenreFilter from './ChartGenreFilter';
import MonthSelector from './MonthSelector';

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

  // 아직 집계되지 않은 월을 보고 있으면 availableMonths에 없어 셀렉트 값이 비어버린다.
  // 현재 조회 월을 항상 선택지에 포함시키고 최신순 정렬은 그대로 유지한다.
  const selectableMonths = availableMonths.includes(month)
    ? availableMonths
    : [...availableMonths, month].sort().reverse();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* 차트 제목은 페이지 h1로 빠졌고, 여기서는 조회 월 선택만 한 줄을 통째로 쓴다. */}
      <MonthSelector
        month={month}
        selectableMonths={selectableMonths}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={() => setMonth(shiftMonth(month, -1))}
        onNext={() => setMonth(shiftMonth(month, 1))}
        onChange={setMonth}
      />

      <ChartGenreFilter value={genre} onChange={setGenre} />

      <ScrollArea className="min-h-0 flex-1">
        <div className={cn('transition-opacity', isPlaceholderData && 'opacity-50')}>
          {isError || items.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4">
              <Construction className="text-muted-foreground h-16 w-16" />
              <p className="text-muted-foreground text-xl">데이터를 준비중이에요</p>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className="flex items-start gap-4 border-b px-4 py-3 last:border-0"
              >
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
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
