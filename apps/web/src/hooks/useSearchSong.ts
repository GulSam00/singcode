import { useDeferredValue, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  useInfiniteSearchSongQuery,
  useToggleLikeMutation,
  useToggleToSingMutation,
} from '@/queries/searchSongQuery';
import useAuthStore from '@/stores/useAuthStore';
import useFooterAnimateStore from '@/stores/useFooterAnimateStore';
import useGuestToSingStore from '@/stores/useGuestToSingStore';
import useSearchHistoryStore from '@/stores/useSearchHistoryStore';
import { Method } from '@/types/common';
import { Song } from '@/types/song';
import { getAutoCompleteSuggestions } from '@/utils/getArtistAlias';

type SearchType = 'all' | 'title' | 'artist';

export default function useSearchSong() {
  const { isAuthenticated } = useAuthStore();

  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState<SearchType>('all');

  const { mutate: toggleToSing, isPending: isToggleToSingPending } = useToggleToSingMutation(
    query,
    queryType,
  );
  const { mutate: toggleLike, isPending: isToggleLikePending } = useToggleLikeMutation(
    query,
    queryType,
  );

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

  return {
    search,
    setSearch,
    searchType,
    autoCompleteList,
    query,
    queryType,

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

    isAuthenticated,
  };
}
