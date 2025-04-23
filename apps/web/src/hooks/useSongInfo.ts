'use client';

import { useState } from 'react';

import { useDeleteLikeSongArrayMutation } from '@/queries/likeSongQuery';

// import { useDeleteLikedSongMutation } from '@/queries/likeSongQuery';

export default function useSongInfo() {
  const [deleteLikeSelected, setDeleteLikeSelected] = useState<string[]>([]);

  const { mutate: deleteLikeSongArray } = useDeleteLikeSongArrayMutation();
  // const { mutate: deleteLikeSong } = useDeleteLikedSongMutation();

  const handleToggleSelect = (songId: string) => {
    setDeleteLikeSelected(prev =>
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId],
    );
  };

  const handleDeleteArray = () => {
    console.log('deleteLikeSelected', deleteLikeSelected);
    deleteLikeSongArray(deleteLikeSelected);
    setDeleteLikeSelected([]);
  };

  // const handleDelete = () => {
  //   deleteLikeSelected.forEach(songId => {
  //     deleteLikeSong(songId);
  //   });
  //   setDeleteLikeSelected([]);
  // };

  const totalSelectedCount = deleteLikeSelected.length;

  return {
    deleteLikeSelected,
    totalSelectedCount,
    handleToggleSelect,
    handleDeleteArray,
  };
}
