'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import StaticLoading from '@/components/StaticLoading';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import useSongInfo from '@/hooks/useSongInfo';
import { useLikeSongQuery } from '@/queries/likeSongQuery';

import SongItem from './SongItem';

export default function LikePage() {
  const router = useRouter();
  const { data, isLoading } = useLikeSongQuery();
  const { deleteLikeSelected, handleToggleSelect, handleDeleteArray } = useSongInfo();
  const likedSongs = data ?? [];

  return (
    <div className="bg-background h-full">
      {isLoading && <StaticLoading />}
      <div className="mb-6 flex items-center px-2 py-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">좋아요 곡 관리</h1>
      </div>

      <div className="flex h-[48px] items-center justify-between p-2">
        <p className="text-muted-foreground text-sm">
          {deleteLikeSelected.length > 0
            ? `${deleteLikeSelected.length}곡 선택됨`
            : `총 ${likedSongs.length}곡`}
        </p>
        {deleteLikeSelected.length > 0 && (
          <Button variant="destructive" size="sm" className="gap-2" onClick={handleDeleteArray}>
            삭제
          </Button>
        )}
      </div>

      <Separator className="mb-4" />

      <ScrollArea className="h-[calc(100vh-16rem)]">
        {likedSongs.map(song => (
          <SongItem
            key={song.song_id}
            song={song}
            isSelected={deleteLikeSelected.includes(song.song_id)}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
