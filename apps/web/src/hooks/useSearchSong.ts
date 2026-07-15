import { useDeferredValue, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { usePostSearchLogMutation } from '@/queries/searchLogQuery';
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
import { SearchType, Song } from '@/types/song';
import { getAutoCompleteSuggestions } from '@/utils/getArtistAlias';

export default function useSearchSong() {
  const { isAuthenticated } = useAuthStore();

  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState<SearchType>('all');
  // languageTag: Tabs에서 선택 중인(draft) 값. queryLanguageTag: 검색 실행 시 커밋되어 실제 쿼리에 쓰이는 값.
  const [languageTag, setLanguageTag] = useState<number | undefined>(undefined);
  const [queryLanguageTag, setQueryLanguageTag] = useState<number | undefined>(undefined);

  const { mutate: toggleToSing, isPending: isToggleToSingPending } = useToggleToSingMutation(
    query,
    queryType,
    queryLanguageTag,
  );
  const { mutate: toggleLike, isPending: isToggleLikePending } = useToggleLikeMutation(
    query,
    queryType,
    queryLanguageTag,
  );

  const {
    data: searchResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isPendingSearch,
    isError,
  } = useInfiniteSearchSongQuery(query, queryType, isAuthenticated, queryLanguageTag);

  const { mutate: postSearchLog } = usePostSearchLogMutation();

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

    if (!trimSearch) {
      setQuery('');
      return;
    }

    let parsedSearch = trimSearch;

    if (autoCompleteList.length === 1) {
      if (autoCompleteList[0].label === trimSearch) {
        // 자동완성 리스트가 하나(정확히 일치하면)고 label도 일치하면 해당 alias의 value로 자동 치환
        parsedSearch = autoCompleteList[0].value;
      }
    }
    // 중간 띄어쓰기는 제거하지 않고 그대로 전달한다.
    // 검색어의 공백 처리(토큰 분리 → %로 치환)는 검색 API(/api/search)가 담당한다.

    if (parsedSearch) {
      setQuery(parsedSearch);
      setSearch(parsedSearch);
      setQueryType(searchType);
      setQueryLanguageTag(languageTag);
      addToHistory(parsedSearch);
      postSearchLog(parsedSearch);
    }
  };

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value as SearchType);
  };

  const handleLanguageTagChange = (value: number | undefined) => {
    setLanguageTag(value);
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
    languageTag,
    queryLanguageTag,

    searchResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPendingSearch,
    isError,

    handleSearchTypeChange,
    handleLanguageTagChange,
    handleSearch,
    handleToggleToSing,
    handleToggleLike,

    isAuthenticated,
  };
}
