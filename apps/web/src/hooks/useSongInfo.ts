'use client';

import { useEffect, useState } from 'react';

import useLoadingStore from '@/stores/useLoadingStore';
import useSongStore from '@/stores/useSongStore';

export default function useAddSongList() {
  const [deleteLikeSelected, setDeleteLikeSelected] = useState<string[]>([]);
  const { startLoading, stopLoading, initialLoading } = useLoadingStore();

  const { refreshLikeSongs, refreshRecentSongs, deleteLikeSong } = useSongStore();

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

  const getLikedSongs = async () => {
    await handleApiCall(async () => {
      refreshLikeSongs();
    });
  };

  const getRecentSong = async () => {
    await handleApiCall(async () => {
      refreshRecentSongs();
    });
  };

  const handleToggleSelect = (songId: string) => {
    setDeleteLikeSelected(prev =>
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId],
    );
  };

  const handleDelete = async () => {
    await handleApiCall(async () => {
      await deleteLikeSong(deleteLikeSelected);
      setDeleteLikeSelected([]);
    });
  };

  const totalSelectedCount = deleteLikeSelected.length;

  useEffect(() => {
    getLikedSongs();
    getRecentSong();
    initialLoading();
  }, []);

  return {
    deleteLikeSelected,
    totalSelectedCount,
    handleToggleSelect,
    handleDelete,
  };
}
