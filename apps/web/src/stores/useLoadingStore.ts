import { create } from 'zustand';

interface LoadingState {
  count: number;
  isLoading: boolean;
  isInitialLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  initialLoading: () => void;
}

const useLoadingStore = create<LoadingState>((set, get) => ({
  count: 0,
  isLoading: false,
  isInitialLoading: true,
  startLoading: () => {
    const newCount = get().count + 1;
    set({ count: newCount, isLoading: true });
  },
  stopLoading: () => {
    const newCount = Math.max(0, get().count - 1);
    set({
      count: newCount,
      isLoading: newCount > 0,
    });
  },
  initialLoading: () => {
    set({ isInitialLoading: false });
  },
}));

export default useLoadingStore;
