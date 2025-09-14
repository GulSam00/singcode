'use client';

import { ArrowLeft, ArrowRight, Construction } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import StaticLoading from '@/components/StaticLoading';
import { Button } from '@/components/ui/button';
import { useRecentAddSongQuery } from '@/queries/recentAddSongQuery';

import RecentSongCard from './RecentSongCard';

export default function LibraryPage() {
  const [today, setToday] = useState(new Date());
  const [prevAction, setPrevAction] = useState<'prev' | 'next' | null>(null);

  const { data: recentAddSongs, isLoading: isLoadingRecentAddSongs } = useRecentAddSongQuery(
    today.getFullYear(),
    today.getMonth(),
  );

  const handlePrevMonth = () => {
    setToday(new Date(today.getFullYear(), today.getMonth() - 1, 1));
    setPrevAction('prev');
  };

  const handleNextMonth = () => {
    setToday(new Date(today.getFullYear(), today.getMonth() + 1, 1));
    setPrevAction('next');
  };
  console.log('recentAddSongs', recentAddSongs, today.getFullYear(), today.getMonth() + 1);

  return (
    <div className="bg-background h-full space-y-4">
      <div className="flex items-center justify-between">
        <Button
          disabled={prevAction === 'prev' && recentAddSongs?.length === 0}
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          className="m-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 px-2 py-4 text-2xl font-bold">
          <span>{today.getFullYear()}년</span>
          <span>{today.getMonth() + 1}월</span>
          <h1>최신곡</h1>
        </div>

        <Button
          disabled={prevAction === 'next' && recentAddSongs?.length === 0}
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="m-2"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      {/* <h1 className="text-xl font-bold">반가워요, {nickname}</h1> */}

      {recentAddSongs && recentAddSongs.length > 0 ? (
        <div className="flex flex-col">
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
