import { useEffect, useState } from 'react';

import useLoadingStore from '@/stores/useLoadingStore';
import { Method } from '@/types/common';
import { SearchSong } from '@/types/song';

type SearchType = 'title' | 'artist';

export default function useSearch() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SearchSong[]>([]);
  const [searchType, setSearchType] = useState<SearchType>('title');
  const { startLoading, stopLoading, initialLoading } = useLoadingStore();
  const [isModal, setIsModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SearchSong | null>(null);

  const handleApiCall = async <T>(apiCall: () => Promise<T>, onError?: () => void) => {
    startLoading();
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      console.error('API 호출 실패:', error);
      if (onError) onError();
      return null;
    } finally {
      stopLoading();
    }
  };

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value as SearchType);
  };

  const handleSearch = async () => {
    if (!search) return;

    await handleApiCall(
      async () => {
        const response = await fetch(`api/search?q=${search}&type=${searchType}`);
        const data = await response.json();

        if (data.success) {
          setSearchResults(data.songs);
        } else {
          setSearchResults([]);
        }
        return data.success;
      },
      () => {
        setSearchResults([]);
      },
    );
  };

  const handleToggleToSing = async (songId: string, method: Method) => {
    await handleApiCall(async () => {
      const response = await fetch('/api/songs/tosing', {
        method,
        body: JSON.stringify({ songId }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { success } = await response.json();
      if (success) {
        const newResults = searchResults.map(song => {
          if (song.id === songId) {
            return { ...song, isToSing: !song.isToSing };
          }
          return song;
        });
        setSearchResults(newResults);
      } else {
        handleSearch();
      }
      return success;
    }, handleSearch);
  };

  const handleToggleLike = async (songId: string, method: Method) => {
    await handleApiCall(async () => {
      await fetch('/api/songs/total_stats', {
        method: 'POST',
        body: JSON.stringify({
          songId,
          countType: 'like_count',
          isMinus: method === 'DELETE',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await fetch(`/api/songs/like`, {
        method,
        body: JSON.stringify({ songId }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { success } = await response.json();
      if (success) {
        const newResults = searchResults.map(song => {
          if (song.id === songId) {
            return { ...song, isLiked: !song.isLiked };
          }
          return song;
        });
        setSearchResults(newResults);
      } else {
        handleSearch();
      }
      return success;
    }, handleSearch);
  };

  const handleOpenPlaylistModal = (song: SearchSong) => {
    setSelectedSong(song);
    setIsModal(true);
  };

  const handleSavePlaylist = async () => {};

  useEffect(() => {
    initialLoading();
  }, []);

  return {
    search,
    setSearch,
    searchResults,
    searchType,
    handleSearchTypeChange,
    handleSearch,
    handleToggleToSing,
    handleToggleLike,
    handleOpenPlaylistModal,
    isModal,
    selectedSong,
    handleSavePlaylist,
  };
}
