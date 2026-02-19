import { useDeferredValue, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useMoveSaveSongMutation } from '@/queries/saveSongQuery';
import {
  useInfiniteSearchSongQuery,
  useSaveMutation,
  useToggleLikeMutation,
  useToggleToSingMutation,
} from '@/queries/searchSongQuery';
import useAuthStore from '@/stores/useAuthStore';
import useFooterAnimateStore from '@/stores/useFooterAnimateStore';
import useGuestToSingStore from '@/stores/useGuestToSingStore';
import useSearchHistoryStore from '@/stores/useSearchHistoryStore';
import { Method } from '@/types/common';
import { SearchSong, Song } from '@/types/song';
import { getAutoCompleteSuggestions } from '@/utils/getArtistAlias';

type SearchType = 'all' | 'title' | 'artist';

type SaveModalType = '' | 'POST' | 'PATCH';

export default function useSearchSong() {
  const { isAuthenticated } = useAuthStore();

  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState<SearchType>('all');
  const [saveModalType, setSaveModalType] = useState<SaveModalType>('');
  const [selectedSaveSong, setSelectedSaveSong] = useState<SearchSong | null>(null);
  const { mutate: toggleToSing, isPending: isToggleToSingPending } = useToggleToSingMutation(
    query,
    queryType,
  );
  const { mutate: toggleLike, isPending: isToggleLikePending } = useToggleLikeMutation(
    query,
    queryType,
  );
  const { mutate: postSong, isPending: isPostSongPending } = useSaveMutation();
  const { mutate: moveSong, isPending: isMoveSongPending } = useMoveSaveSongMutation();

  const {
    data: searchResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isPendingSearch,
    isError,
  } = useInfiniteSearchSongQuery(query, queryType, isAuthenticated);

  const { setFooterAnimateKey } = useFooterAnimateStore();
  const { addToHistory } = useSearchHistoryStore();
  const { addGuestToSingSong, removeGuestToSingSong } = useGuestToSingStore();

  const deferredSearch = useDeferredValue(search);

  const autoCompleteList = useMemo(
    () => getAutoCompleteSuggestions(deferredSearch),
    [deferredSearch],
  );

  const handleSearch = () => {
    // trim 제거
    const trimSearch = search.trim();

    let parsedSearch = trimSearch;

    if (autoCompleteList.length === 1) {
      // 자동완성 리스트가 하나(정확히 일치하면) 해당 alias의 value로 자동 치환
      parsedSearch = autoCompleteList[0].value;
    } else {
      // 한글이 있다면 공백 제거
      const hasKorean = /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(trimSearch);
      if (hasKorean) {
        parsedSearch = parsedSearch.replace(/ /g, '');
      }
    }

    if (parsedSearch) {
      setQuery(parsedSearch);
      setSearch(parsedSearch);
      setQueryType(searchType);
      addToHistory(parsedSearch);
    }
  };

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value as SearchType);
  };

  const handleToggleToSing = async (song: Song, method: Method) => {
    if (!isAuthenticated) {
      if (method === 'POST') {
        addGuestToSingSong(song);
        setFooterAnimateKey('TOSING');
      } else {
        removeGuestToSingSong(song.id);
      }
      return;
    }

    if (isToggleToSingPending) {
      toast.error('요청 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (method === 'POST') {
      setFooterAnimateKey('TOSING');
    }
    toggleToSing({ songId: song.id, method });
  };

  const handleToggleLike = async (songId: string, method: Method) => {
    if (!isAuthenticated) {
      toast.error('로그인하고 곡을 저장해보세요!');
      return;
    }

    if (isToggleLikePending) {
      toast.error('요청 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (method === 'POST') {
      setFooterAnimateKey('INFO');
    }
    toggleLike({ songId, method });
  };

  const handleToggleSave = async (song: SearchSong, method: Method) => {
    if (!isAuthenticated) {
      toast.error('로그인하고 곡을 저장해보세요!');
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

    setFooterAnimateKey('INFO');
    postSong({ songId, folderName, query, searchType: queryType });
  };

  const patchSaveSong = async (songId: string, folderId: string) => {
    if (isMoveSongPending) {
      toast.error('요청 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setFooterAnimateKey('INFO');
    moveSong({ songIdArray: [songId], folderId });
  };

  return {
    search,
    setSearch,
    searchType,
    autoCompleteList,
    query,

    searchResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPendingSearch,
    isError,

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

    isAuthenticated,
  };
}
