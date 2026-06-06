'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';

import CharacterMessage from '@/components/CharacterMessage';
import StaticLoading from '@/components/StaticLoading';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRecentAddSongQuery } from '@/queries/recentAddSongQuery';

import RecentSongCard from './RecentSongCard';

export default function RecentSongPage() {
  const [today, setToday] = useState(new Date());

  const { data: recentAddSongs, isLoading: isLoadingRecentAddSongs } = useRecentAddSongQuery(
    today.getFullYear(),
    today.getMonth(),
  );

  const handlePrevMonth = () => {
    setToday(new Date(today.getFullYear(), today.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setToday(new Date(today.getFullYear(), today.getMonth() + 1, 1));
  };

  const handleYearChange = (year: string) => {
    setToday(new Date(Number(year), today.getMonth(), 1));
  };

  const handleMonthChange = (month: string) => {
    setToday(new Date(today.getFullYear(), Number(month), 1));
  };

  const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="bg-background h-full space-y-4">
      <div className="flex items-center justify-between px-2">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-1 text-xl font-bold whitespace-nowrap">
          <Select value={today.getFullYear().toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="border-none p-0 text-xl font-bold shadow-none focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={today.getMonth().toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="border-none p-0 text-xl font-bold shadow-none focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month} value={month.toString()}>
                  {month + 1}월
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>최신곡</span>
        </div>

        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      {recentAddSongs && recentAddSongs.length > 0 ? (
        <div className="flex h-[calc(100vh-16rem)] flex-col overflow-y-auto">
          {recentAddSongs.map(song => (
            <RecentSongCard key={song.id} song={song} />
          ))}
        </div>
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
