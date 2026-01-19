'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import StaticLoading from '@/components/StaticLoading';
import useSong from '@/hooks/useSong';
import { ToSingSong } from '@/types/song';

import SongCard from './SongCard';

export default function SongList() {
  const {
    isLoading,
    toSingSongs,
    handleDragEnd,
    handleDelete,
    handleMoveToTop,
    handleMoveToBottom,
  } = useSong();

  const sensors = useSensors(
    useSensor(PointerSensor),

    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      {isLoading && <StaticLoading />}
      <SortableContext
        items={toSingSongs.map((item: ToSingSong) => item.songs.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-4">
          {toSingSongs.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-sm">플레이리스트가 없습니다.</p>
            </div>
          )}
          {toSingSongs.map((item: ToSingSong, index: number) => (
            <SongCard
              key={item.songs.id}
              song={item.songs}
              onDelete={() => handleDelete(item.songs.id)}
              onMoveToTop={() => handleMoveToTop(item.songs.id, index)}
              onMoveToBottom={() => handleMoveToBottom(item.songs.id, index)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
