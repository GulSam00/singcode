import { useEffect, useState } from 'react';

import { deleteLikeSong, postLikeSong } from '@/lib/api/likeSong';
import { getSearchSong } from '@/lib/api/searchSong';
import { deleteToSingSong, postToSingSong } from '@/lib/api/tosing';
import { postTotalStat } from '@/lib/api/totalStat';
import { useSearchSongQuery } from '@/queries/searchSongQuery';
import useLoadingStore from '@/stores/useLoadingStore';
import { Method } from '@/types/common';
import { SearchSong } from '@/types/song';
import { isSuccessResponse } from '@/utils/isSuccessResponse';

type SearchType = 'title' | 'artist';

export default function useSearch() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchSong[]>([]);
  const [searchType, setSearchType] = useState<SearchType>('title');
  const { startLoading, stopLoading, initialLoading } = useLoadingStore();
  const [isModal, setIsModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SearchSong | null>(null);
  const { data, isLoading } = useSearchSongQuery(query, searchType);
  console.log('test : ', data, isLoading);

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
    setQuery(search);

    await handleApiCall(
      async () => {
        const response = await getSearchSong(search, searchType);
        if (isSuccessResponse(response)) {
          setSearchResults(response.data ?? []);
        } else {
          setSearchResults([]);
        }
        return response.success;
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
        response = await postToSingSong({ songId });
      } else {
        response = await deleteToSingSong({ songId });
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
      await postTotalStat({
        songId,
        countType: 'like_count',
        isMinus: method === 'DELETE',
      });

      let response;
      if (method === 'POST') {
        response = await postLikeSong({ songId });
      } else {
        response = await deleteLikeSong({ songId });
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
