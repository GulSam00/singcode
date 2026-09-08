import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

  // 검색 결과 도착을 기다리는 인기 검색어 로그 후보
  const [pendingLog, setPendingLog] = useState<{ text: string; seq: number } | null>(null);
  const seqRef = useRef(0);

  const { setFooterAnimateKey } = useFooterAnimateStore();
  const { addToHistory } = useSearchHistoryStore();
  const { addGuestToSingSong, removeGuestToSingSong } = useGuestToSingStore();

  // 아티스트 별칭 사전이라 제목·번호 탭에서는 후보를 만들지 않는다.
  // 드롭다운만 숨기면 절반만 막힌다 — handleSearch의 별칭 치환은 이 목록을 직접 보므로,
  // 제목 탭에서 "원오크"를 직접 타이핑해 엔터를 눌러도 ONE OK ROCK으로 바뀌어 0건이 됐다.
  // 목록 자체를 비워 드롭다운과 치환을 한 곳에서 함께 끈다.
  const canUseArtistAlias = searchType === 'all' || searchType === 'artist';

  // handleSearch가 이 목록에서 별칭 치환을 하므로 search를 그대로 따라가야 한다.
  // useDeferredValue를 끼우면 목록이 한 박자 늦어, 붙여넣기 직후 엔터처럼 지연이 큰
  // 순간에 "검색할 문자열"과 "그 문자열의 후보"가 어긋나 치환이 조용히 빠진다.
  // 사전 규모가 수백 개라 미룰 만큼 무겁지도 않다.
  const autoCompleteList = useMemo(
    () => (canUseArtistAlias ? getAutoCompleteSuggestions(search) : []),
    [search, canUseArtistAlias],
  );

  const handleSearch = () => {
    // trim 제거
    const trimSearch = search.trim();

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
      setQueryType(searchType);
      addToHistory(parsedSearch);
      // 인기 검색어 로그는 여기서 바로 남기지 않는다.
      // 결과가 0건인 오타·존재하지 않는 곡까지 집계되면 인기 검색어가 오염된다.
      // 검색 결과가 도착한 뒤 1건이라도 있을 때만 아래 effect가 기록한다.
      // seq는 같은 검색어를 연달아 검색해도 effect가 다시 돌게 하는 용도다.
      seqRef.current += 1;
      setPendingLog({ text: parsedSearch, seq: seqRef.current });
    }
  };

  // 검색 결과가 1건 이상일 때만 인기 검색어 로그를 남긴다.
  useEffect(() => {
    if (!pendingLog) return;
    // 이번 검색어의 결과가 아직 도착하지 않았으면 대기한다.
    if (query !== pendingLog.text || isPendingSearch) return;

    setPendingLog(null);
    if (isError) return;

    const hasResult = searchResults?.pages.some(page => page.data.length > 0) ?? false;
    if (hasResult) {
      postSearchLog(pendingLog.text);
    }
  }, [pendingLog, query, isPendingSearch, isError, searchResults, postSearchLog]);

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
