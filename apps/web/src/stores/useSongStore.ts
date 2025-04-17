import { create } from 'zustand';

import { deleteLikeSongArray, getLikeSongs } from '@/lib/api/likeSong';
import { getRecentSong } from '@/lib/api/recentSong';
import { deleteToSingSong, getToSingSong, postToSingSongArray } from '@/lib/api/tosing';
import { AddListModalSong, ToSingSong } from '@/types/song';
import { isSuccessResponse } from '@/utils/isSuccessResponse';

interface SongStore {
  toSings: ToSingSong[];
  likedSongs: AddListModalSong[];
  recentSongs: AddListModalSong[];
  swapToSings: (toSings: ToSingSong[]) => void;
  refreshToSings: () => Promise<void>;
  refreshLikeSongs: () => Promise<void>;
  refreshRecentSongs: () => Promise<void>;
  postToSingSong: (songIds: string[]) => Promise<void>;
  deleteToSingSong: (songId: string) => Promise<void>;
  deleteLikeSong: (songIds: string[]) => Promise<void>;
}

const useSongStore = create<SongStore>((set, get) => ({
  toSings: [],
  likedSongs: [],
  recentSongs: [],

  swapToSings: (toSings: ToSingSong[]) => {
    set({ toSings });
  },

  refreshToSings: async () => {
    const response = await getToSingSong();
    if (isSuccessResponse(response) && response.data) {
      set({ toSings: response.data });
    }
  },

  refreshLikeSongs: async () => {
    const response = await getLikeSongs();
    if (isSuccessResponse(response) && response.data) {
      set({ likedSongs: response.data });
    }
  },

  refreshRecentSongs: async () => {
    const response = await getRecentSong();
    if (isSuccessResponse(response) && response.data) {
      set({ recentSongs: response.data });
    }
  },

  postToSingSong: async (songIds: string[]) => {
    const response = await postToSingSongArray({ songIds });
    if (isSuccessResponse(response)) {
      get().refreshToSings();
      get().refreshLikeSongs();
      get().refreshRecentSongs();
    }
  },

  deleteToSingSong: async (songId: string) => {
    const response = await deleteToSingSong({ songId });
    if (isSuccessResponse(response)) {
      get().refreshToSings();
      get().refreshLikeSongs();
      get().refreshRecentSongs();
    }
  },

  deleteLikeSong: async (songIds: string[]) => {
    const response = await deleteLikeSongArray({ songIds });
    if (isSuccessResponse(response)) {
      get().refreshLikeSongs();
    }
  },
}));

export default useSongStore;
