'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';

import SongCard from './SongCard';

// 초기 노래 데이터
const initialSongs = [
  { id: '1', title: '눈의 꽃', artist: '박효신', kumyoungNumber: '47251', tjNumber: '62867' },
  { id: '2', title: '거리에서', artist: '성시경', kumyoungNumber: '84173', tjNumber: '48506' },
  {
    id: '3',
    title: '벚꽃 엔딩',
    artist: '버스커 버스커',
    kumyoungNumber: '46079',
    tjNumber: '30184',
  },
  { id: '4', title: '사랑했나봐', artist: '윤도현', kumyoungNumber: '41906', tjNumber: '35184' },
  {
    id: '5',
    title: '너를 사랑하고 있어',
    artist: '백지영',
    kumyoungNumber: '38115',
    tjNumber: '46009',
  },
];

export default function SongList() {
  const [songs, setSongs] = useState(initialSongs);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSongs(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function handleDelete(id: string) {
    setSongs(songs.filter(song => song.id !== id));
  }

  function handleMoveToTop(id: string) {
    setSongs(prev => {
      const songIndex = prev.findIndex(song => song.id === id);
      if (songIndex <= 0) return prev;

      const newSongs = [...prev];
      const [movedSong] = newSongs.splice(songIndex, 1);
      newSongs.unshift(movedSong);

      return newSongs;
    });
  }

  function handleMoveToBottom(id: string) {
    setSongs(prev => {
      const songIndex = prev.findIndex(song => song.id === id);
      if (songIndex === -1 || songIndex === prev.length - 1) return prev;

      const newSongs = [...prev];
      const [movedSong] = newSongs.splice(songIndex, 1);
      newSongs.push(movedSong);

      return newSongs;
    });
  }

  function handleToggleSung(id: string) {
    setSongs(prev =>
      prev.map(song => (song.id === id ? { ...song, sung: song.sung ? !song.sung : true } : song)),
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={songs.map(song => song.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {songs.map(song => (
            <SongCard
              key={song.id}
              song={song}
              onDelete={() => handleDelete(song.id)}
              onMoveToTop={() => handleMoveToTop(song.id)}
              onMoveToBottom={() => handleMoveToBottom(song.id)}
              onToggleSung={() => handleToggleSung(song.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
