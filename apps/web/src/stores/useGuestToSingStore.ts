import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface GuestToSingState {
  localToSingSongIds: string[];
  addSong: (songId: string) => void;
  removeSong: (songId: string) => void;
  swapSongs: (fromIndex: number, toIndex: number) => void;
  clearSongs: () => void;
}

const GUEST_TO_SING_KEY = 'guest_to_sing';

const initialState = {
  localToSingSongIds: [] as string[],
};

const useGuestToSingStore = create(
  persist<GuestToSingState>(
    set => ({
      ...initialState,
      addSong: (songId: string) => {
        set(state => {
          // 중복 방지 (필요 시 정책 변경 가능)
          if (state.localToSingSongIds.includes(songId)) return state;
          return { localToSingSongIds: [...state.localToSingSongIds, songId] };
        });
      },
      removeSong: (songId: string) => {
        set(state => ({
          localToSingSongIds: state.localToSingSongIds.filter(id => id !== songId),
        }));
      },
      swapSongs: (fromIndex: number, toIndex: number) => {
        set(state => {
          const newSongIds = [...state.localToSingSongIds];
          if (
            fromIndex < 0 ||
            fromIndex >= newSongIds.length ||
            toIndex < 0 ||
            toIndex >= newSongIds.length
          ) {
            return state;
          }
          const [movedItem] = newSongIds.splice(fromIndex, 1);
          newSongIds.splice(toIndex, 0, movedItem);
          return { localToSingSongIds: newSongIds };
        });
      },
      clearSongs: () => {
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
