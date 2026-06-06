'use client';

import { Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useSaveSongModal from '@/hooks/useSaveSongModal';
import useSearchSong from '@/hooks/useSearchSong';
import useGuestToSingStore from '@/stores/useGuestToSingStore';
import { SearchSong } from '@/types/song';

import AddFolderModal from './AddFolderModal';
// import ChatBot from './ChatBot';
import JpnArtistList from './JpnArtistList';
import PopularSearchHistory from './PopularSearchHistory';
import SearchAutocomplete from './SearchAutocomplete';
import SearchHistory from './SearchHistory';
import SearchResultCard from './SearchResultCard';
import SearchStatus from './SearchStatus';

export default function SearchPage() {
  const {
    search,
    searchType,
    setSearch,
    autoCompleteList,
    query,
    queryType,

    searchResults,
    isPendingSearch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,

    handleSearchTypeChange,
    handleSearch,
    handleToggleToSing,
    handleToggleLike,

    isAuthenticated,
  } = useSearchSong();

  const {
    saveModalType,
    setSaveModalType,
    selectedSaveSong,
    handleToggleSave,
    postSaveSong,
    patchSaveSong,
  } = useSaveSongModal(query, queryType);

  const [isJpnArtistModalOpen, setIsJpnArtistModalOpen] = useState(false);
  const [isFocusAuto, setIsFocusAuto] = useState(false);
  // const [isChatBotEnabled, setIsChatBotEnabled] = useState(() => {
  //   if (typeof window === 'undefined') return true;
  //   const stored = localStorage.getItem('chatbot-enabled');
  //   return stored === null ? true : stored === 'true';
  // });

  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const { ref, inView } = useInView({
    root: scrollRef,
    rootMargin: '0px 0px 800px 0px', // 스크롤 하단 600px 이전에 미리 로딩
  });

  const { guestToSingSongs } = useGuestToSingStore();

  // const handleToggleChatBot = (checked: boolean) => {
  //   setIsChatBotEnabled(checked);
  //   localStorage.setItem('chatbot-enabled', String(checked));
  // };

  const isToSing = (song: SearchSong, songId: string) => {
    if (!isAuthenticated) {
      return guestToSingSongs?.some(item => item.songs.id === songId);
    }
    return song.isToSing;
  };

  const searchSongs: SearchSong[] = searchResults
    ? searchResults.pages.flatMap(page => page.data)
    : [];

  // 엔터 키 처리
  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
      setIsFocusAuto(false);
    }
  };

  const handleSearchClick = () => {
    handleSearch();
    setIsFocusAuto(false);
  };

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (searchType === 'number' && value.length > 5) return;
    setSearch(value);
    setIsFocusAuto(true);
  };

  const handleHistoryClick = (term: string) => {
    setSearch(term);
  };

  const handleAutocompleteClick = (term: string) => {
    setSearch(term);
    setIsFocusAuto(false);
  };

  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'title':
        return '노래 제목 검색';
      case 'artist':
        return '가수 이름 검색';
      case 'number':
        return '노래방 번호 검색 (TJ/KY)';
      default:
        return '전체 키워드 검색';
    }
  };

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isError) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, isError]);

  return (
    <div className="bg-background">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">노래 검색</h1>

            {!isAuthenticated && (
              <span className="text-muted-foreground text-sm">
                Guest 상태에서는 <br />
                [부를곡 추가]만 가능합니다.
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <JpnArtistList
              open={isJpnArtistModalOpen}
              onOpenChange={setIsJpnArtistModalOpen}
              onSelectArtist={setSearch}
              callback={() => handleSearchTypeChange('artist')}
            />
            {/* <div className="flex items-center gap-2">
              <Checkbox
                id="chatbot-toggle"
                checked={isChatBotEnabled}
                onCheckedChange={handleToggleChatBot}
              />
              <Label
                htmlFor="chatbot-toggle"
                className="text-muted-foreground cursor-pointer text-xs"
              >
                AI 챗봇
              </Label>
            </div> */}
          </div>
        </div>

        <Tabs defaultValue="all" value={searchType} onValueChange={handleSearchTypeChange}>
          <TabsList className="dark:bg-muted/50 grid w-full grid-cols-4 dark:border">
            {(
              [
                ['all', '전체'],
                ['title', '제목'],
                ['artist', '가수'],
                ['number', '번호'],
              ] as const
            ).map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="dark:data-[state=active]:bg-accent/15 dark:data-[state=active]:text-accent dark:data-[state=active]:shadow-(--glow-accent)"
              >
                {label}
              </TabsTrigger>
            ))}
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
              onChange={handleChangeSearch}
              onKeyUp={handleKeyUp}
              onFocus={() => setIsFocusAuto(true)}
              onBlur={() => setIsFocusAuto(false)}
            />
            {isFocusAuto && (
              <SearchAutocomplete
                autoCompleteList={autoCompleteList}
                onSelect={handleAutocompleteClick}
              />
            )}
          </div>

          <Button className="w-[60px]" onClick={handleSearchClick} disabled={isPendingSearch}>
            {isPendingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : '검색'}
          </Button>
        </div>
      </div>
      <div ref={setScrollRef} className="h-[calc(100vh-22rem)] overflow-x-hidden overflow-y-auto">
        {searchSongs.length > 0 && (
          <div className="flex w-full max-w-md flex-col gap-4 p-4">
            {searchSongs.map((song, index) => (
              <SearchResultCard
                key={song.artist + song.title + index}
                song={song}
                isToSing={isToSing(song, song.id)}
                isLike={song.isLike}
                isSave={song.isSave}
                onToggleToSing={() =>
                  handleToggleToSing(song, isToSing(song, song.id) ? 'DELETE' : 'POST')
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
        {isPendingSearch && <SearchStatus status="loading" />}

        {!isPendingSearch && searchSongs.length === 0 && query && <SearchStatus status="empty" />}

        {searchSongs.length === 0 && !query && (
          <div className="flex h-full flex-col justify-center gap-2">
            <SearchHistory onHistoryClick={handleHistoryClick} />
            <PopularSearchHistory onHistoryClick={handleHistoryClick} />
          </div>
        )}
      </div>

      {selectedSaveSong && (
        <AddFolderModal
          modalType={saveModalType}
          closeModal={() => setSaveModalType('')}
          song={selectedSaveSong}
          postSaveSong={postSaveSong}
          patchSaveSong={patchSaveSong}
        />
      )}

      {/* 챗봇 위젯 */}
      {/* {isChatBotEnabled && <ChatBot setInputSearch={setSearch} />} */}
    </div>
  );
}
