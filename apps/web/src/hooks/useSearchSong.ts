import { useState } from 'react';

import {
  useSearchSongSongQuery,
  useToggleLikeMutation,
  useToggleToSingMutation,
} from '@/queries/searchSongQuery';
import { Method } from '@/types/common';
import { SearchSong } from '@/types/song';

type SearchType = 'title' | 'artist';

export default function useSearchSong() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('title');
  const [isModal, setIsModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SearchSong | null>(null);
  const { data: searchResults, isLoading } = useSearchSongSongQuery(query, searchType);
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
    toggleToSing({ songId, method, query, searchType });
  };

  const handleToggleLike = async (songId: string, method: Method) => {
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
