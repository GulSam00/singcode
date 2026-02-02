import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SearchHistoryState {
  searchHistory: string[];
  addToHistory: (searchQuery: string) => void;
  removeFromHistory: (searchQuery: string) => void;
  clearHistory: () => void;
}

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 20;

const initialState = {
  searchHistory: [] as string[],
};

export const useSearchHistoryStore = create(
  persist<SearchHistoryState>(
    set => ({
      ...initialState,
      addToHistory: (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        set(state => {
          const filtered = state.searchHistory.filter(item => item !== searchQuery);
          const newHistory = [searchQuery, ...filtered].slice(0, MAX_HISTORY_ITEMS);
          return { searchHistory: newHistory };
        });
      },
      removeFromHistory: (searchQuery: string) => {
        set(state => ({
          searchHistory: state.searchHistory.filter(item => item !== searchQuery),
        }));
      },
      clearHistory: () => {
        set(initialState);
      },
    }),
    {
      name: SEARCH_HISTORY_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
