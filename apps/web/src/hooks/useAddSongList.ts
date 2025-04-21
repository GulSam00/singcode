'use client';

import { useState } from 'react';

import { usePostToSingSongMutation } from '@/queries/tosingSongQuery';

export default function useAddSongList() {
  const [activeTab, setActiveTab] = useState('liked');

  const [songSelected, setSongSelected] = useState<string[]>([]);

  const { mutate: postToSingSong } = usePostToSingSongMutation();

  const handleToggleSelect = (songId: string) => {
    setSongSelected(prev =>
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId],
    );
  };

  const handleConfirmAdd = () => {
    postToSingSong(songSelected);
    setSongSelected([]);
  };

  const totalSelectedCount = songSelected.length;

  return {
    activeTab,
    setActiveTab,
    songSelected,
    handleToggleSelect,
    handleConfirmAdd,
    totalSelectedCount,
  };
}
