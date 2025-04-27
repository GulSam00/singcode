import { useState } from 'react';
import { toast } from 'sonner';

import {
  useSearchSongSongQuery,
  useToggleLikeMutation,
  useToggleToSingMutation,
} from '@/queries/searchSongQuery';
import useAuthStore from '@/stores/useAuthStore';
import { Method } from '@/types/common';
import { SearchSong } from '@/types/song';

type SearchType = 'title' | 'artist';

export default function useSearchSong() {
  const { isAuthenticated } = useAuthStore();

  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('title');
  const [isModal, setIsModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SearchSong | null>(null);
  const { data: searchResults, isLoading } = useSearchSongSongQuery(
    query,
    searchType,
    isAuthenticated,
  );
  const { mutate: toggleToSing } = useToggleToSingMutation();
  const { mutate: toggleLike } = useToggleLikeMutation();

  const searchSongs = searchResults ?? [];

  const handleSearch = () => {
    setQuery(search);
    setSearch('');
  };

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value as SearchType);
  };

  const handleToggleToSing = async (songId: string, method: Method) => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요해요.');
      return;
    }
    toggleToSing({ songId, method, query, searchType });
  };

  const handleToggleLike = async (songId: string, method: Method) => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요해요.');
      return;
    }
    toggleLike({ songId, method, query, searchType });
  };

  const handleOpenPlaylistModal = (song: SearchSong) => {
    setSelectedSong(song);
    setIsModal(true);
  };

  const handleSavePlaylist = async () => {};

  return {
    search,
    setSearch,
    query,
    searchSongs,
    isLoading,
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
