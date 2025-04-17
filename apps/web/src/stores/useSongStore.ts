import { create } from 'zustand';

import { deleteLikedSongsArray, getLikedSongs } from '@/lib/api/likeActivites';
import { getRecentSongs } from '@/lib/api/songs';
import { deleteToSingSongs, getToSingSongs, postToSingSongsArray } from '@/lib/api/tosings';
import { AddListModalSong, ToSingSong } from '@/types/song';
import { isSuccessResponse } from '@/utils/isSuccessResponse';

interface SongStore {
  toSings: ToSingSong[];
  likedSongs: AddListModalSong[];
  recentSongs: AddListModalSong[];
  swapToSings: (toSings: ToSingSong[]) => void;
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

  swapToSings: (toSings: ToSingSong[]) => {
    set({ toSings });
  },

  refreshToSings: async () => {
    const response = await getToSingSongs();
    if (isSuccessResponse(response) && response.data) {
      set({ toSings: response.data });
    }
  },

  refreshLikedSongs: async () => {
    const response = await getLikedSongs();
    if (isSuccessResponse(response) && response.data) {
      set({ likedSongs: response.data });
    }
  },

  refreshRecentSongs: async () => {
    const response = await getRecentSongs();
    if (isSuccessResponse(response) && response.data) {
      set({ recentSongs: response.data });
    }
  },

  postToSingSongs: async (songIds: string[]) => {
    const response = await postToSingSongsArray({ songIds });
    if (isSuccessResponse(response)) {
      get().refreshToSings();
      get().refreshLikedSongs();
      get().refreshRecentSongs();
    }
  },

  deleteToSingSong: async (songId: string) => {
    const response = await deleteToSingSongs({ songId });
    if (isSuccessResponse(response)) {
      get().refreshToSings();
      get().refreshLikedSongs();
      get().refreshRecentSongs();
    }
  },

  deleteLikedSongs: async (songIds: string[]) => {
    const response = await deleteLikedSongsArray({ songIds });
    if (isSuccessResponse(response)) {
      get().refreshLikedSongs();
    }
  },
}));

export default useSongStore;
