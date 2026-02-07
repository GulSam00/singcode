import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Song, ToSingSong } from '@/types/song';

interface GuestToSingState {
  guestToSingSongs: ToSingSong[];
  addGuestToSingSong: (song: Song) => void;
  removeGuestToSingSong: (songId: string) => void;
  swapGuestToSingSongs: (targetId: string, moveIndex: number) => void;
  clearGuestToSingSongs: () => void;
}

const GUEST_TO_SING_KEY = 'guest_to_sing';

const initialState = {
  guestToSingSongs: [] as ToSingSong[],
};

const useGuestToSingStore = create(
  persist<GuestToSingState>(
    set => ({
      ...initialState,
      addGuestToSingSong: (song: Song) => {
        set(state => {
          // 중복 방지
          if (state.guestToSingSongs.some(item => item.songs.id === song.id)) return state;

          const newToSingSong: ToSingSong = {
            order_weight: 0, // 로컬에서는 index가 순서이므로 weight는 의미 없음 (0으로 고정)
            songs: song, // song 객체 전체 저장
          };

          return { guestToSingSongs: [...state.guestToSingSongs, newToSingSong] };
        });
      },
      removeGuestToSingSong: (songId: string) => {
        set(state => ({
          guestToSingSongs: state.guestToSingSongs.filter(item => item.songs.id !== songId),
        }));
      },
      swapGuestToSingSongs: (targetId: string, moveIndex: number) => {
        set(state => {
          if (moveIndex < 0 || moveIndex >= state.guestToSingSongs.length) return state;
          const newSongs = [...state.guestToSingSongs];
          const targetIndex = newSongs.findIndex(item => item.songs.id === targetId);

          if (targetIndex === -1) return state;

          const [movedItem] = newSongs.splice(targetIndex, 1);
          newSongs.splice(moveIndex, 0, movedItem);

          return { guestToSingSongs: newSongs };
        });
      },
      clearGuestToSingSongs: () => {
        set(initialState);
      },
    }),
    {
      name: GUEST_TO_SING_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useGuestToSingStore;
