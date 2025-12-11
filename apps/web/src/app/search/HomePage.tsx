'use client';

import { Loader2, Search, SearchX, X } from 'lucide-react';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import useSearchSong from '@/hooks/useSearchSong';
import { SearchSong } from '@/types/song';

import AddFolderModal from './AddFolderModal';
import SearchResultCard from './SearchResultCard';

export default function SearchPage() {
  const {
    search,
    query,
    setSearch,

    searchResults,
    isPendingSearch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,

    saveModalType,
    setSaveModalType,
    selectedSaveSong,
    searchType,
    handleSearchTypeChange,
    handleSearch,
    handleToggleToSing,
    handleToggleLike,
    handleToggleSave,
    postSaveSong,
    patchSaveSong,
  } = useSearchSong();

  const { ref, inView } = useInView();

  let searchSongs: SearchSong[] = [];

  if (searchResults) {
    searchSongs = searchResults.pages.flatMap(page => page.data);
  }

  const { searchHistory, addToHistory, removeFromHistory } = useSearchHistory();

  // 엔터 키 처리
  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
      addToHistory(search);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (inView && hasNextPage && !isFetchingNextPage && !isError) {
        fetchNextPage();
      }
    }, 1000); // 1000ms 정도 지연

    return () => clearTimeout(timeout);
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, isError]);

  const handleSearchClick = () => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) {
      toast.error('검색어를 입력해주세요.');
      return;
    }

    handleSearch();
    addToHistory(trimmedSearch);
  };

  const handleHistoryClick = (term: string) => {
    setSearch(term);
  };

  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'title':
        return '노래 제목 검색';
      case 'artist':
        return '가수 이름 검색';
      default:
        return '전체 키워드 검색';
    }
  };

  return (
    <div className="bg-background">
      <div className="bg-background p-2 pt-4 shadow-sm">
        <h1 className="mb-3 text-2xl font-bold">노래 검색</h1>

        <Tabs
          defaultValue="all"
          value={searchType}
          onValueChange={handleSearchTypeChange}
          className="mb-3"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="title">제목</TabsTrigger>
            <TabsTrigger value="artist">가수</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="text"
              placeholder={getPlaceholder(searchType)}
              className="pl-8"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyUp={handleKeyUp}
            />
          </div>

          <Button className="w-[60px]" onClick={handleSearchClick} disabled={isPendingSearch}>
            {isPendingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : '검색'}
          </Button>
        </div>
        {searchHistory.length > 0 && (
          <div className="m-2 flex gap-2 overflow-x-auto pt-2">
            {searchHistory.map((term, index) => (
              <div
                key={index}
                className="bg-background flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
              >
                <button
                  type="button"
                  className="hover:text-primary"
                  onClick={() => handleHistoryClick(term)}
                >
                  {term}
                </button>
                <button
                  type="button"
                  className="hover:text-destructive"
                  onClick={() => removeFromHistory(term)}
                  title="검색 기록 삭제"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <ScrollArea className="h-[calc(100vh-24rem)]">
        {searchSongs.length > 0 && (
          <div className="flex w-[360px] flex-col gap-3 px-2 py-4">
            {searchSongs.map((song, index) => (
              <SearchResultCard
                key={song.artist + song.title + index}
                song={song}
                onToggleToSing={() =>
                  handleToggleToSing(song.id, song.isToSing ? 'DELETE' : 'POST')
                }
                onToggleLike={() => handleToggleLike(song.id, song.isLike ? 'DELETE' : 'POST')}
                onClickSave={() => handleToggleSave(song, song.isSave ? 'PATCH' : 'POST')}
              />
            ))}
            {hasNextPage && !isFetchingNextPage && (
              <div ref={ref} className="flex h-10 items-center justify-center p-2">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </div>
        )}
        {isPendingSearch && (
          <div className="text-muted-foreground flex h-40 flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="m-2">검색 중입니다...</p>
          </div>
        )}

        {!isPendingSearch && searchSongs.length === 0 && query && (
          <div className="text-muted-foreground flex h-40 flex-col items-center justify-center">
            <SearchX className="h-8 w-8 opacity-50" />
            <p className="m-2">검색 결과가 없습니다.</p>
          </div>
        )}
        {searchSongs.length === 0 && !query && (
          <div className="text-muted-foreground flex h-40 flex-col items-center justify-center">
            <Search className="h-8 w-8 opacity-50" />
            <p className="m-2">노래 제목이나 가수를 검색해보세요</p>
          </div>
        )}
      </ScrollArea>

      {selectedSaveSong && (
        <AddFolderModal
          modalType={saveModalType}
          closeModal={() => setSaveModalType('')}
          song={selectedSaveSong}
          postSaveSong={postSaveSong}
          patchSaveSong={patchSaveSong}
        />
      )}
    </div>
  );
}
