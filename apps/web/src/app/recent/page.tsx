'use client';

import { ArrowLeft, ArrowRight, Construction } from 'lucide-react';
import { useState } from 'react';

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
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="m-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 px-2 py-4 text-2xl font-bold">
          <Select value={today.getFullYear().toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="border-none p-0 text-2xl font-bold shadow-none focus-visible:ring-0">
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
            <SelectTrigger className="border-none p-0 text-2xl font-bold shadow-none focus-visible:ring-0">
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
          <h1>최신곡</h1>
        </div>

        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="m-2">
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
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Construction className="text-muted-foreground h-16 w-16" />
          <p className="text-muted-foreground text-xl">해당하는 월의 최신곡이 없어요.</p>
        </div>
      )}
      {isLoadingRecentAddSongs && <StaticLoading />}
    </div>
  );
}
