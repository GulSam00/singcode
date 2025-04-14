import { create } from 'zustand';

import { AddListModalSong, ToSing } from '@/types/song';

interface SongStore {
  toSings: ToSing[];
  likedSongs: AddListModalSong[];
  recentSongs: AddListModalSong[];
  swapToSings: (toSings: ToSing[]) => void;
  refreshToSings: () => Promise<void>;
  refreshLikedSongs: () => Promise<void>;
  refreshRecentSongs: () => Promise<void>;
  postToSingSongs: (songIds: string[]) => Promise<void>;
  deleteLikedSongs: (songIds: string[]) => Promise<void>;
}

const useSongStore = create<SongStore>((set, get) => ({
  toSings: [],
  likedSongs: [],
  recentSongs: [],

  swapToSings: (toSings: ToSing[]) => {
    set({ toSings });
  },

  refreshToSings: async () => {
    const response = await fetch('/api/songs/tosing');
    const { success, data } = await response.json();
    if (success) {
      set({ toSings: data });
    }
  },

  refreshLikedSongs: async () => {
    const response = await fetch('/api/songs/like');
    const { success, data } = await response.json();
    if (success) {
      set({ likedSongs: data });
    }
  },
  refreshRecentSongs: async () => {
    const response = await fetch('/api/songs/recent');
    const { success, data } = await response.json();
    if (success) {
      set({ recentSongs: data });
    }
  },

  postToSingSongs: async (songIds: string[]) => {
    const response = await fetch('/api/songs/tosing/array', {
      method: 'POST',
      body: JSON.stringify({ songIds }),
    });
    const { success } = await response.json();
    if (success) {
      get().refreshToSings();
      get().refreshLikedSongs();
      get().refreshRecentSongs();
    }
  },
  deleteLikedSongs: async (songIds: string[]) => {
    const response = await fetch('/api/songs/like/arr', {
      method: 'DELETE',
      body: JSON.stringify({ songIds }),
    });
    const { success } = await response.json();
    if (success) {
      get().refreshLikedSongs();
    }
  },
}));

export default useSongStore;
