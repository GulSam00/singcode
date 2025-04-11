'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import useAddSongList from '@/hooks/useAddSongList';
import useSongStore from '@/stores/useSongStore';

import SongItem from './SongItem';

export default function LikedPage() {
  const router = useRouter();
  const { likedSongs } = useSongStore();
  const { handleConfirm, songSelected, handleToggleSelect } = useAddSongList();

  return (
    <div className="bg-background h-full px-4">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">좋아요 곡 관리</h1>
      </div>

      <ScrollArea className="h-[calc(100vh-10rem)]">
        {likedSongs.map(song => (
          <SongItem
            key={song.id}
            song={song}
            isSelected={songSelected.includes(song.id)}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
