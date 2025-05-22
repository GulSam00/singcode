'use client';

import { useState } from 'react';

import { useDeleteLikeSongArrayMutation } from '@/queries/likeSongQuery';

// import { useDeleteLikeSongMutation } from '@/queries/likeSongQuery';

export default function useSongInfo() {
  const [deleteLikeSelected, setDeleteLikeSelected] = useState<string[]>([]);

  const { mutate: deleteLikeSongArray } = useDeleteLikeSongArrayMutation();
  // const { mutate: deleteLikeSong } = useDeleteLikeSongMutation();

  const handleToggleSelect = (songId: string) => {
    setDeleteLikeSelected(prev =>
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId],
    );
  };

  const handleDeleteArray = () => {
    deleteLikeSongArray(deleteLikeSelected);
    setDeleteLikeSelected([]);
  };

  const totalSelectedCount = deleteLikeSelected.length;

  return {
    deleteLikeSelected,
    totalSelectedCount,
    handleToggleSelect,
    handleDeleteArray,
  };
}
