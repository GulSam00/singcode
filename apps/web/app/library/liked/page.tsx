'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import useSongInfo from '@/hooks/useSongInfo';
import useSongStore from '@/stores/useSongStore';

import SongItem from './SongItem';

export default function LikedPage() {
  const router = useRouter();
  const { likedSongs } = useSongStore();
  const { deleteLikeSelected, handleToggleSelect, handleDelete } = useSongInfo();

  return (
    <div className="bg-background h-full px-4">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">좋아요 곡 관리</h1>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {deleteLikeSelected.length > 0
            ? `${deleteLikeSelected.length}곡 선택됨`
            : `총 ${likedSongs.length}곡`}
        </p>
        {deleteLikeSelected.length > 0 && (
          <Button variant="destructive" size="sm" className="gap-2" onClick={handleDelete}>
            삭제
          </Button>
        )}
      </div>

      <Separator className="mb-4" />

      <ScrollArea className="h-[calc(100vh-10rem)]">
        {likedSongs.map(song => (
          <SongItem
            key={song.id}
            song={song}
            isSelected={deleteLikeSelected.includes(song.id)}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
