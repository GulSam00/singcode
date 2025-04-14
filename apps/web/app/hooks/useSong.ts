// hooks/useToSingList.ts
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useEffect } from 'react';

import useAuthStore from '@/stores/useAuthStore';
import useLoadingStore from '@/stores/useLoadingStore';
import useSongStore from '@/stores/useSongStore';

export default function useSong() {
  const { startLoading, stopLoading, initialLoading } = useLoadingStore();
  const { isAuthenticated } = useAuthStore();
  const { toSings, swapToSings, refreshToSings, refreshLikedSongs, refreshRecentSongs } =
    useSongStore();

  const handleApiCall = async <T>(apiCall: () => Promise<T>, onError?: () => void) => {
    startLoading();
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      console.error('API 호출 실패:', error);
      if (onError) onError();
      return null;
    } finally {
      stopLoading();
    }
  };

  const handleSearch = async () => {
    await handleApiCall(async () => {
      refreshToSings();
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    await handleApiCall(async () => {
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

      swapToSings(newItems);
      return success;
    }, handleSearch);
  };

  const handleDelete = async (songId: string) => {
    await handleApiCall(async () => {
      await fetch('/api/songs/tosing', {
        method: 'DELETE',
        body: JSON.stringify({ songId }),
        headers: { 'Content-Type': 'application/json' },
      });
      swapToSings(toSings.filter(item => item.songs.id !== songId));
      refreshLikedSongs();
      refreshRecentSongs();
    }, handleSearch);
  };

  const handleMoveToTop = async (songId: string, oldIndex: number) => {
    if (oldIndex === 0) return;

    await handleApiCall(async () => {
      const newItems = arrayMove(toSings, oldIndex, 0);
      const newWeight = toSings[0].order_weight - 1;

      const response = await fetch('/api/songs/tosing', {
        method: 'PATCH',
        body: JSON.stringify({ songId, newWeight }),
        headers: { 'Content-Type': 'application/json' },
      });
      const { success } = await response.json();
      swapToSings(newItems);
      return success;
    }, handleSearch);
  };

  const handleMoveToBottom = async (songId: string, oldIndex: number) => {
    const lastIndex = toSings.length - 1;
    if (oldIndex === lastIndex) return;

    await handleApiCall(async () => {
      const newItems = arrayMove(toSings, oldIndex, lastIndex);
      const newWeight = toSings[lastIndex].order_weight + 1;

      const response = await fetch('/api/songs/tosing', {
        method: 'PATCH',
        body: JSON.stringify({ songId, newWeight }),
        headers: { 'Content-Type': 'application/json' },
      });
      const { success } = await response.json();
      swapToSings(newItems);
      return success;
    }, handleSearch);
  };

  const handleSung = async (songId: string) => {
    await handleApiCall(async () => {
      // 순서 이동
      const oldIndex = toSings.findIndex(item => item.songs.id === songId);
      await handleMoveToBottom(songId, oldIndex);

      // 통계 업데이트
      await Promise.all([
        fetch('/api/songs/total_stats', {
          method: 'POST',
          body: JSON.stringify({ songId, countType: 'sing_count' }),
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('/api/songs/user_stats', {
          method: 'POST',
          body: JSON.stringify({ songId }),
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('/api/sing_logs', {
          method: 'POST',
          body: JSON.stringify({ songId }),
          headers: { 'Content-Type': 'application/json' },
        }),
        handleDelete(songId),
      ]);
    }, handleSearch);
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      handleSearch();
      initialLoading();
    }
  }, [isAuthenticated]);

  return {
    handleDragEnd,
    handleSearch,
    handleDelete,
    handleMoveToTop,
    handleMoveToBottom,
    handleSung,
  };
}
