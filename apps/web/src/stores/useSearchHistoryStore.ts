import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SearchHistoryState {
  searchHistory: string[];
  addToHistory: (searchTerm: string) => void;
  removeFromHistory: (searchTerm: string) => void;
  clearHistory: () => void;
}

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 20;

export const useSearchHistoryStore = create(
  persist<SearchHistoryState>(
    set => ({
      searchHistory: [],
      addToHistory: (searchTerm: string) => {
        if (!searchTerm.trim()) return;

        set(state => {
          const filtered = state.searchHistory.filter(item => item !== searchTerm);
          const newHistory = [searchTerm, ...filtered].slice(0, MAX_HISTORY_ITEMS);
          return { searchHistory: newHistory };
        });
      },
      removeFromHistory: (searchTerm: string) => {
        set(state => ({
          searchHistory: state.searchHistory.filter(item => item !== searchTerm),
        }));
      },
      clearHistory: () => {
        set({ searchHistory: [] });
      },
    }),
    {
      name: SEARCH_HISTORY_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
