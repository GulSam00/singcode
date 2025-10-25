import { useState } from 'react';
import { toast } from 'sonner';

import { useMoveSaveSongMutation } from '@/queries/saveSongQuery';
import {
  useInfiniteSearchSongQuery,
  useSaveMutation,
  useToggleLikeMutation,
  useToggleToSingMutation,
} from '@/queries/searchSongQuery';
import useAuthStore from '@/stores/useAuthStore';
import { Method } from '@/types/common';
import { SearchSong } from '@/types/song';

type SearchType = 'all' | 'title' | 'artist';

type SaveModalType = '' | 'POST' | 'PATCH';

export default function useSearchSong() {
  const { isAuthenticated } = useAuthStore();

  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [saveModalType, setSaveModalType] = useState<SaveModalType>('');
  const [selectedSaveSong, setSelectedSaveSong] = useState<SearchSong | null>(null);
  // const { data: searchResults, isLoading } = useSearchSongQuery(query, searchType, isAuthenticated);
  const { mutate: toggleToSing, isPending: isToggleToSingPending } = useToggleToSingMutation();
  const { mutate: toggleLike, isPending: isToggleLikePending } = useToggleLikeMutation();
  const { mutate: postSong, isPending: isPostSongPending } = useSaveMutation();
  const { mutate: moveSong, isPending: isMoveSongPending } = useMoveSaveSongMutation();

  const {
    data: searchResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteSearchSongQuery(query, searchType, isAuthenticated);

  const handleSearch = () => {
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      setQuery(trimmedSearch);
      setSearch(trimmedSearch);
    }
  };

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value as SearchType);
  };

  const handleToggleToSing = async (songId: string, method: Method) => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요해요.');
      return;
    }

    if (isToggleToSingPending) {
      toast.error('요청 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    toggleToSing({ songId, method, query, searchType });
  };

  const handleToggleLike = async (songId: string, method: Method) => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요해요.');
      return;
    }

    if (isToggleLikePending) {
      toast.error('요청 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    toggleLike({ songId, method, query, searchType });
  };

  const handleToggleSave = async (song: SearchSong, method: Method) => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요해요.');
      return;
    }

    setSelectedSaveSong(song);
    setSaveModalType(method === 'POST' ? 'POST' : 'PATCH');
  };

  const postSaveSong = async (songId: string, folderName: string) => {
    if (isPostSongPending) {
      toast.error('요청 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    postSong({ songId, folderName, query, searchType });
  };

  const patchSaveSong = async (songId: string, folderId: string) => {
    if (isMoveSongPending) {
      toast.error('요청 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    moveSong({ songIdArray: [songId], folderId });
  };

  return {
    search,
    setSearch,
    query,

    searchResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,

    searchType,
    handleSearchTypeChange,
    handleSearch,
    handleToggleToSing,
    handleToggleLike,
    handleToggleSave,
    saveModalType,
    setSaveModalType,
    selectedSaveSong,
    postSaveSong,
    patchSaveSong,
  };
}
