import { useEffect, useState } from 'react';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 20;

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addToHistory = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== searchTerm);
      const newHistory = [searchTerm, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const removeFromHistory = (searchTerm: string) => {
    setSearchHistory(prev => {
      const newHistory = prev.filter(item => item !== searchTerm);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
  };
};
