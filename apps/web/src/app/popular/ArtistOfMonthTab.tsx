'use client';

import { addMonths, format, parseISO, startOfMonth } from 'date-fns';
import { ChartPie, Construction, List } from 'lucide-react';
import { useState } from 'react';

import StaticLoading from '@/components/StaticLoading';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useArtistRankingsQuery } from '@/queries/artistVoteQuery';
import { cn } from '@/utils/cn';
import { getCurrentMonthFirstDayKST, getPrevMonthFirstDayKST } from '@/utils/kst';

import ArtistRankingBoard from './ArtistRankingBoard';
import ArtistRankingChart from './ArtistRankingChart';
import ArtistVotePanel from './ArtistVotePanel';
import MonthSelector from './MonthSelector';

const MONTH_FORMAT = 'yyyy-MM-dd';
const shiftMonth = (month: string, delta: number) =>
  format(startOfMonth(addMonths(parseISO(month), delta)), MONTH_FORMAT);

export default function ArtistOfMonthTab() {
  // 순위는 월말에 확정되므로 인기곡 차트와 똑같이 전월을 기본으로 본다.
  const [month, setMonth] = useState(getPrevMonthFirstDayKST);
  // 같은 순위 데이터를 순위표로 볼지, 득표 비중 파이로 볼지 고르는 스위치
  const [view, setView] = useState<'list' | 'chart'>('list');

  const currentMonth = getCurrentMonthFirstDayKST();
  // 이번 달은 아직 집계 전이라 순위 대신 내 투표를 편집하는 화면을 보여준다.
  const isVotingMonth = month === currentMonth;

  const { data, isPending, isPlaceholderData } = useArtistRankingsQuery(month);

  if (isPending) {
    return <StaticLoading />;
  }

  const availableMonths = data?.availableMonths ?? [];
  const items = data?.items ?? [];

  // 확정 월 + 이번 달(투표) + 현재 조회 월을 합쳐 최신순으로 둔다.
  // 아직 확정되지 않은 월을 보고 있어도 셀렉트 값이 비지 않게 하기 위함이다.
  const selectableMonths = [...new Set([...availableMonths, currentMonth, month])].sort().reverse();

  const oldestMonth = selectableMonths.at(-1);
  const canGoPrev = !!oldestMonth && month > oldestMonth;
  const canGoNext = month < currentMonth;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <MonthSelector
        month={month}
        selectableMonths={selectableMonths}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={() => setMonth(shiftMonth(month, -1))}
        onNext={() => setMonth(shiftMonth(month, 1))}
        onChange={setMonth}
      />

      {isVotingMonth ? (
        <ArtistVotePanel />
      ) : (
        <>
          {items.length > 0 && (
            <div className="flex shrink-0 items-center justify-end gap-2">
              {/* 지난 달 결과를 보다가 바로 이번 달 투표로 넘어갈 수 있게 둔다.
                  월 선택기의 다음 달 버튼으로도 갈 수 있지만 그건 눈에 잘 띄지 않는다. */}
              <Button size="sm" variant="outline" onClick={() => setMonth(currentMonth)}>
                투표하러 가기
              </Button>

              <div className="bg-muted flex items-center gap-0.5 rounded-md p-0.5">
                <Button
                  variant={view === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="size-7"
                  aria-label="순위표로 보기"
                  aria-pressed={view === 'list'}
                  onClick={() => setView('list')}
                >
                  <List className="size-4" />
                </Button>
                <Button
                  variant={view === 'chart' ? 'default' : 'ghost'}
                  size="icon"
                  className="size-7"
                  aria-label="차트로 보기"
                  aria-pressed={view === 'chart'}
                  onClick={() => setView('chart')}
                >
                  <ChartPie className="size-4" />
                </Button>
              </div>
            </div>
          )}

          <ScrollArea className="min-h-0 flex-1">
            <div className={cn('transition-opacity', isPlaceholderData && 'opacity-50')}>
              {items.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4">
                  <Construction className="text-muted-foreground h-16 w-16" />
                  <p className="text-muted-foreground text-xl">아직 확정된 결과가 없어요</p>
                </div>
              ) : view === 'chart' ? (
                <ArtistRankingChart items={items} />
              ) : (
                <ArtistRankingBoard items={items} />
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
