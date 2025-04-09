'use client';

import {
  DndContext,
  DragEndEvent,
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
import { useEffect, useState } from 'react';

import { ToSing } from '@/types/song';

import SongCard from './SongCard';

// import dynamic from 'next/dynamic';
// const SongCard = dynamic(() => import('./SongCard'), { ssr: false });

export default function SongList() {
  const [toSings, setToSings] = useState<ToSing[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = toSings.findIndex(item => item.songs.id === active.id);
    const newIndex = toSings.findIndex(item => item.songs.id === over.id);

    if (oldIndex === newIndex) return;

    const newItems = arrayMove(toSings, oldIndex, newIndex);
    const prevItem = newItems[newIndex - 1];
    const nextItem = newItems[newIndex + 1];

    let newWeight;

    if (!prevItem && nextItem) {
      // 제일 앞으로 이동한 경우
      newWeight = toSings[0].order_weight - 1;
    } else if (prevItem && !nextItem) {
      // 제일 뒤로 이동한 경우
      newWeight = toSings[toSings.length - 1].order_weight + 1;
    } else {
      // 중간에 삽입
      newWeight = (prevItem.order_weight + nextItem.order_weight) / 2;
    }

    const response = await fetch(`/api/songs/tosing`, {
      method: 'PATCH',
      body: JSON.stringify({
        songId: active.id,
        newWeight,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const { success } = await response.json();

    if (success) {
      setToSings(newItems);
    } else {
      handleSearch();
    }
  };

  const handleDelete = async (songId: string) => {
    const response = await fetch(`/api/songs/tosing`, {
      method: 'DELETE',
      body: JSON.stringify({ songId }),
      headers: { 'Content-Type': 'application/json' },
    });

    const newItem = toSings.filter(item => item.songs.id !== songId);
    const { success } = await response.json();
    if (success) {
      setToSings(newItem);
    } else {
      handleSearch();
    }
  };

  const handleMoveToTop = async (songId: string, oldIndex: number) => {
    if (oldIndex === 0) return;
    const newItems = arrayMove(toSings, oldIndex, 0);

    const newWeight = toSings[0].order_weight - 1;

    const response = await fetch(`/api/songs/tosing`, {
      method: 'PATCH',
      body: JSON.stringify({
        songId,
        newWeight,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const { success } = await response.json();

    if (success) {
      setToSings(newItems);
    } else {
      handleSearch();
    }
  };

  const handleMoveToBottom = async (songId: string, oldIndex: number) => {
    const lastIndex = toSings.length - 1;
    if (oldIndex === lastIndex) return;

    const newItems = arrayMove(toSings, oldIndex, lastIndex);
    const newWeight = toSings[lastIndex].order_weight + 1;

    const response = await fetch(`/api/songs/tosing`, {
      method: 'PATCH',
      body: JSON.stringify({
        songId,
        newWeight,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const { success } = await response.json();

    if (success) {
      setToSings(newItems);
    } else {
      handleSearch();
    }
  };

  const handleSung = async (songId: string) => {
    handleMoveToBottom(
      songId,
      toSings.findIndex(item => item.songs.id === songId),
    );

    await fetch(`/api/songs/total_stats`, {
      method: 'POST',
      body: JSON.stringify({
        songId,
        countType: 'sing_count',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    await fetch(`/api/songs/user_stats`, {
      method: 'POST',
      body: JSON.stringify({
        songId,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    await fetch('/api/sing_logs', {
      method: 'POST',
      body: JSON.stringify({
        songId,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const handleSearch = async () => {
    const response = await fetch(`/api/songs/tosing`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const { data, success } = await response.json();
    if (success) {
      setToSings(data);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

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
          {toSings.map((item, index) => (
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
