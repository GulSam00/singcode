import { create } from 'zustand';

import { deleteLikedSongsArray, getLikedSongs } from '@/lib/api/like_activites';
import { getRecentSongs } from '@/lib/api/songs';
import { deleteToSingSongs, getToSingSongs, postToSingSongsArray } from '@/lib/api/tosings';
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
  deleteToSingSong: (songId: string) => Promise<void>;
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
    const { success, data } = await getToSingSongs();
    if (success) {
      set({ toSings: data });
    }
  },

  refreshLikedSongs: async () => {
    const { success, data } = await getLikedSongs();
    if (success) {
      set({ likedSongs: data });
    }
  },
  refreshRecentSongs: async () => {
    const { success, data } = await getRecentSongs();
    if (success) {
      set({ recentSongs: data });
    }
  },

  postToSingSongs: async (songIds: string[]) => {
    const { success } = await postToSingSongsArray({ songIds });
    if (success) {
      get().refreshToSings();
      get().refreshLikedSongs();
      get().refreshRecentSongs();
    }
  },

  deleteToSingSong: async (songId: string) => {
    const { success } = await deleteToSingSongs({ songId });
    if (success) {
      get().refreshToSings();
      get().refreshLikedSongs();
      get().refreshRecentSongs();
    }
  },

  deleteLikedSongs: async (songIds: string[]) => {
    const { success } = await deleteLikedSongsArray({ songIds });
    if (success) {
      get().refreshLikedSongs();
    }
  },
}));

export default useSongStore;
