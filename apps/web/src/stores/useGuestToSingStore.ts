import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface GuestToSingState {
  localToSingSongIds: string[];
  addGuestToSingSong: (songId: string) => void;
  removeGuestToSingSong: (songId: string) => void;
  swapGuestToSingSongs: (targetId: string, moveIndex: number) => void;
  clearGuestToSingSongs: () => void;
}

const GUEST_TO_SING_KEY = 'guest_to_sing';

const initialState = {
  localToSingSongIds: [] as string[],
};

const useGuestToSingStore = create(
  persist<GuestToSingState>(
    set => ({
      ...initialState,
      addGuestToSingSong: (songId: string) => {
        set(state => {
          // 중복 방지 (필요 시 정책 변경 가능)
          if (state.localToSingSongIds.includes(songId)) return state;
          return { localToSingSongIds: [...state.localToSingSongIds, songId] };
        });
      },
      removeGuestToSingSong: (songId: string) => {
        set(state => ({
          localToSingSongIds: state.localToSingSongIds.filter(id => id !== songId),
        }));
      },
      swapGuestToSingSongs: (targetId: string, moveIndex: number) => {
        set(state => {
          const newSongIds = [...state.localToSingSongIds];

          const targetIndex = newSongIds.findIndex(id => id === targetId);
          const [movedItem] = newSongIds.splice(targetIndex, 1);
          newSongIds.splice(moveIndex, 0, movedItem);
          return { localToSingSongIds: newSongIds };
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
