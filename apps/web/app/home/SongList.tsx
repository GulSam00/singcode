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

import useToSingList from '@/hooks/useToSingList';
import { ToSing } from '@/types/song';

import SongCard from './SongCard';

export default function SongList() {
  const { toSings, handleDragEnd, handleDelete, handleMoveToTop, handleMoveToBottom, handleSung } =
    useToSingList();

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
