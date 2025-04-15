import { useEffect, useState } from 'react';

import { deleteLikedSongs, postLikedSongs } from '@/lib/api/like_activites';
import { getSearch } from '@/lib/api/search';
import { deleteToSingSongs, postToSingSongs } from '@/lib/api/tosings';
import { postTotalStats } from '@/lib/api/total_stats';
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
        const { success, data } = await getSearch(search, searchType);
        if (success) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
        return success;
      },
      () => {
        setSearchResults([]);
      },
    );
  };

  const handleToggleToSing = async (songId: string, method: Method) => {
    await handleApiCall(async () => {
      let response;
      if (method === 'POST') {
        response = await postToSingSongs({ songId });
      } else {
        response = await deleteToSingSongs({ songId });
      }

      const { success } = response;
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
      await postTotalStats({
        songId,
        countType: 'like_count',
        isMinus: method === 'DELETE',
      });

      let response;
      if (method === 'POST') {
        response = await postLikedSongs({ songId });
      } else {
        response = await deleteLikedSongs({ songId });
      }

      const { success } = response;
      const newResults = searchResults.map(song => {
        if (song.id === songId) {
          return { ...song, isLiked: !song.isLiked };
        }
        return song;
      });
      setSearchResults(newResults);

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
