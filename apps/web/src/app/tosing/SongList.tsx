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

import CharacterMessage from '@/components/CharacterMessage';
import StaticLoading from '@/components/StaticLoading';
import useToSingSong from '@/hooks/useToSingSong';
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
  } = useToSingSong();

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
            <CharacterMessage
              variant="joy"
              message={
                <>
                  검색 페이지에서 부를곡을 추가해주세요!
                  <br />
                  신나게 노래방을 즐겨요!
                </>
              }
            />
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
