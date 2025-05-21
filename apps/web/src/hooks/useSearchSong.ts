import { useState } from 'react';
import { toast } from 'sonner';

import {
  useSaveMutation,
  useSearchSongQuery,
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
  const [isSaveModal, setIsSaveModal] = useState(false);
  const [selectedSaveSong, setSelectedSaveSong] = useState<SearchSong | null>(null);
  const { data: searchResults, isLoading } = useSearchSongQuery(query, searchType, isAuthenticated);
  const { mutate: toggleToSing } = useToggleToSingMutation();
  const { mutate: toggleLike } = useToggleLikeMutation();
  const { mutate: mutateSave } = useSaveMutation();

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

  const handleOpenSaveModal = (song: SearchSong) => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요해요.');
      return;
    }

    setSelectedSaveSong(song);
    setIsSaveModal(true);
  };

  const saveSong = async (songId: string, folderName: string, method: Method) => {
    mutateSave({ songId, folderName, method, query, searchType });
  };

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
    handleOpenSaveModal,
    isSaveModal,
    setIsSaveModal,
    selectedSaveSong,
    saveSong,
  };
}
