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
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Loader2 } from 'lucide-react';

import useToSingList from '@/hooks/useToSingList';
import useLoadingStore from '@/stores/useLoadingStore';
import useSongStore from '@/stores/useSongStore';
import { ToSing } from '@/types/song';

import SongCard from './SongCard';

export default function SongList() {
  const { handleDragEnd, handleDelete, handleMoveToTop, handleMoveToBottom, handleSung } =
    useToSingList();
  const { toSings } = useSongStore();
  const { isInitialLoading } = useLoadingStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
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
      <SortableContext
        items={toSings.map(item => item.songs.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-4">
          {isInitialLoading && (
            <div className="fixed inset-0 flex h-full items-center justify-center bg-white/90">
              <Loader2 className="h-16 w-16 animate-spin" />
            </div>
          )}
          {!isInitialLoading && toSings.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-sm">노래방 플레이리스트가 없습니다.</p>
            </div>
          )}
          {toSings.map((item: ToSing, index: number) => (
            <SongCard
              key={item.songs.id}
              song={item.songs}
              onSung={() => handleSung(item.songs.id)}
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
