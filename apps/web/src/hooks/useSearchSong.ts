import { useCallback, useDeferredValue, useMemo, useState } from 'react';
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

  const { mutate: postSearchLog } = usePostSearchLogMutation();

  const { setFooterAnimateKey } = useFooterAnimateStore();
  const { addToHistory } = useSearchHistoryStore();
  const { addGuestToSingSong, removeGuestToSingSong } = useGuestToSingStore();

  const deferredSearch = useDeferredValue(search);

  const autoCompleteList = useMemo(
    () => getAutoCompleteSuggestions(deferredSearch),
    [deferredSearch],
  );

  const handleSearch = (termOverride?: string, typeOverride?: SearchType) => {
    // trim 제거
    const trimSearch = (termOverride ?? search).trim();

    if (!trimSearch) {
      setQuery('');
      return;
    }

    // 입력한 말이 별칭과 정확히 겹치면 그 별칭의 공식 명칭으로 바꿔 검색한다.
    // 후보 개수로 판단하면("리스트가 하나일 때만") 같은 아티스트의 별칭끼리 접두가
    // 겹치는 순간 치환이 통째로 건너뛰어졌다 — "원오크"는 "원오크락"과 함께 걸려
    // 후보가 2개가 되는데, ONE OK ROCK은 artist_ko가 비어 있어 치환 없이는 0건이었다.
    const exactMatch = autoCompleteList.find(
      candidate => candidate.label.toLowerCase() === trimSearch.toLowerCase(),
    );
    const parsedSearch = exactMatch ? exactMatch.value : trimSearch;
    // 중간 띄어쓰기는 제거하지 않고 그대로 전달한다.
    // 검색어의 공백 처리(토큰 분리 → %로 치환)는 검색 API(/api/search)가 담당한다.

    if (parsedSearch) {
      setQuery(parsedSearch);
      setSearch(parsedSearch);
      setQueryType(typeOverride ?? searchType);
      addToHistory(parsedSearch);
      postSearchLog(parsedSearch);
    }
  };

  const handleSearchTypeChange = (value: SearchType) => {
    setSearchType(value);
  };

  const handleToggleToSing = useCallback(
    async (song: Song, method: Method) => {
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
    },
    [
      isAuthenticated,
      isToggleToSingPending,
      addGuestToSingSong,
      removeGuestToSingSong,
      setFooterAnimateKey,
      toggleToSing,
    ],
  );

  const handleToggleLike = useCallback(
    async (songId: string, method: Method) => {
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
    },
    [isAuthenticated, isToggleLikePending, setFooterAnimateKey, toggleLike],
  );

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
