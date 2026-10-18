'use client';

import { useState } from 'react';

import CharacterMessage from '@/components/CharacterMessage';
import MonthSelector from '@/components/MonthSelector';
import StaticLoading from '@/components/StaticLoading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRecentAddSongQuery } from '@/queries/recentAddSongQuery';
import { getCurrentMonthFirstDayKST, shiftMonth } from '@/utils/kst';

import ChartPageHeader from '../ChartPageHeader';

import RecentSongCard from './RecentSongCard';

// 최신곡은 과거 20년치 월을 고를 수 있다.
const SELECTABLE_MONTH_COUNT = 240;

export default function RecentSongPage() {
  const currentMonth = getCurrentMonthFirstDayKST();
  const [month, setMonth] = useState(currentMonth);

  // 월 선택기는 최신순 목록을 기대한다.
  const selectableMonths = Array.from({ length: SELECTABLE_MONTH_COUNT }, (_, i) =>
    shiftMonth(currentMonth, -i),
  );

  const { data: recentAddSongs, isLoading: isLoadingRecentAddSongs } = useRecentAddSongQuery(
    Number(month.slice(0, 4)),
    Number(month.slice(5, 7)) - 1,
  );

  return (
    <div className="bg-background flex h-full flex-col space-y-4">
      <ChartPageHeader title="최신곡" />

      <MonthSelector
        month={month}
        selectableMonths={selectableMonths}
        canGoPrev={month > selectableMonths[SELECTABLE_MONTH_COUNT - 1]}
        canGoNext={month < currentMonth}
        onPrev={() => setMonth(shiftMonth(month, -1))}
        onNext={() => setMonth(shiftMonth(month, 1))}
        onChange={setMonth}
      />

      {recentAddSongs && recentAddSongs.length > 0 ? (
        <ScrollArea className="min-h-0 flex-1">
          {recentAddSongs.map(song => (
            <RecentSongCard key={song.id} song={song} />
          ))}
        </ScrollArea>
      ) : (
        <CharacterMessage
          variant="curious"
          message={
            <>
              해당하는 달에 추가된 노래가 없어요.
              <br />
              어떤 곡이 추가될지 궁금하네요!
            </>
          }
        />
      )}
      {isLoadingRecentAddSongs && <StaticLoading />}
    </div>
  );
}
