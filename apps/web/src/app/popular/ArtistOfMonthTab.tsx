'use client';

import { addMonths, format, parseISO, startOfMonth } from 'date-fns';
import { ChartPie, Construction, List, Loader2, TriangleAlert } from 'lucide-react';
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
  // 탭에 들어오면 확정된 순위부터 보여준다. 이번 달은 집계 전이라 순위가 없어서,
  // 이번 달을 기본으로 두면 결과를 보러 온 사람이 매번 이전 달로 한 번 더 이동해야 했다.
  // 어느 달까지 확정됐는지는 서버만 아니까, 처음에는 달을 지정하지 않고 서버가 고른 달(가장 최근
  // 확정 월 = 보통 직전 달)을 따른다. 사용자가 월을 고르면 그때부터 그 값이 주인이 된다.
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  // 같은 순위 데이터를 순위표로 볼지, 득표 비중 파이로 볼지 고르는 스위치
  const [view, setView] = useState<'list' | 'chart'>('list');

  const { data, isPending, isError, isPlaceholderData, refetch } = useArtistRankingsQuery(
    selectedMonth ?? undefined,
  );

  const currentMonth = getCurrentMonthFirstDayKST();
  // 응답 전에도 월 선택기에 쓸 값이 있어야 해서 직전 달로 받쳐 둔다.
  const month = selectedMonth ?? data?.month ?? getPrevMonthFirstDayKST();
  // 이번 달은 아직 집계 전이라 순위 대신 내 투표를 편집하는 화면을 보여준다.
  const isVotingMonth = month === currentMonth;

  if (isPending) {
    return <StaticLoading />;
  }

  // 조회가 실패했을 때 결과가 없는 것처럼 보이면 안 된다.
  // 확정된 데이터가 있는데도 "아직 확정된 결과가 없어요"로 읽히면 원인을 찾을 길이 없다.
  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <TriangleAlert className="text-muted-foreground h-16 w-16" />
        <p className="text-muted-foreground text-xl">순위를 불러오지 못했어요</p>
        <Button variant="outline" onClick={() => refetch()}>
          다시 시도
        </Button>
      </div>
    );
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
        onPrev={() => setSelectedMonth(shiftMonth(month, -1))}
        onNext={() => setSelectedMonth(shiftMonth(month, 1))}
        onChange={setSelectedMonth}
      />

      {isVotingMonth ? (
        <ArtistVotePanel />
      ) : (
        <>
          {items.length > 0 && (
            <div className="flex shrink-0 items-center justify-end gap-2">
              {/* 지난 달 결과를 보다가 바로 이번 달 투표로 넘어갈 수 있게 둔다.
                  월 선택기의 다음 달 버튼으로도 갈 수 있지만 그건 눈에 잘 띄지 않는다. */}
              <Button size="sm" variant="outline" onClick={() => setSelectedMonth(currentMonth)}>
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
                isPlaceholderData ? (
                  // 이 비어 있음은 직전에 보던 달의 응답이다. 지금 고른 달이 미확정이라는
                  // 근거가 못 되므로, 응답이 오기 전까지 단정하지 않고 기다리는 중임만 알린다.
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="text-muted-foreground h-16 w-16 animate-spin" />
                  </div>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center gap-4">
                    <Construction className="text-muted-foreground h-16 w-16" />
                    {/* 확정된 달이 아예 없는 것과, 고른 달만 비어 있는 것은 다른 상황이다. */}
                    <p className="text-muted-foreground text-xl">
                      {availableMonths.length === 0
                        ? '아직 확정된 결과가 없어요'
                        : `${Number(month.slice(5, 7))}월 결과는 아직 확정되지 않았어요`}
                    </p>
                  </div>
                )
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
