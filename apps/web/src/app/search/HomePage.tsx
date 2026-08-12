'use client';

import { ChevronDown, ChevronUp, HelpCircle, Info, Loader2, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TOUR_DEMO_SEARCH_TERM, TOUR_DEMO_SONG } from '@/constants/tourDemoSong';
import useSaveSongModal from '@/hooks/useSaveSongModal';
import useSearchSong from '@/hooks/useSearchSong';
import useSearchTourController from '@/hooks/useSearchTourController';
import useGuestToSingStore from '@/stores/useGuestToSingStore';
import { SearchSong, SearchType } from '@/types/song';
import { cn } from '@/utils/cn';

import AddFolderModal from './AddFolderModal';
// import ChatBot from './ChatBot';
import JpnArtistList from './JpnArtistList';
import LanguageTagFilter from './LanguageTagFilter';
import NumberKeypad from './NumberKeypad';
import PopularSearchHistory from './PopularSearchHistory';
import SearchAutocomplete from './SearchAutocomplete';
import SearchHistory from './SearchHistory';
import SearchResultCard from './SearchResultCard';
import SearchStatus from './SearchStatus';
import SearchTour from './SearchTour';

export default function SearchPage() {
  const {
    search,
    searchType,
    setSearch,
    autoCompleteList,
    query,
    queryType,
    languageTag,
    queryLanguageTag,

    searchResults,
    isPendingSearch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,

    handleSearchTypeChange,
    handleLanguageTagChange,
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
  } = useSaveSongModal(query, queryType, queryLanguageTag);

  const [isJpnArtistModalOpen, setIsJpnArtistModalOpen] = useState(false);
  const [isFocusAuto, setIsFocusAuto] = useState(false);
  const [isNumberKeypadOpen, setIsNumberKeypadOpen] = useState(false);
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

  const guestToSingIds = useMemo(
    () => new Set(guestToSingSongs?.map(item => item.songs.id)),
    [guestToSingSongs],
  );

  const isToSing = useCallback(
    (song: SearchSong, songId: string) => {
      if (!isAuthenticated) {
        return guestToSingIds.has(songId);
      }
      return song.isToSing;
    },
    [isAuthenticated, guestToSingIds],
  );

  const searchSongs: SearchSong[] = searchResults
    ? searchResults.pages.flatMap(page => page.data)
    : [];

  const handleCardToggleToSing = useCallback(
    (song: SearchSong) => {
      handleToggleToSing(song, isToSing(song, song.id) ? 'DELETE' : 'POST');
    },
    [handleToggleToSing, isToSing],
  );

  const handleCardToggleLike = useCallback(
    (song: SearchSong) => {
      handleToggleLike(song.id, song.isLike ? 'DELETE' : 'POST');
    },
    [handleToggleLike],
  );

  const handleCardClickSave = useCallback(
    (song: SearchSong) => {
      handleToggleSave(song, song.isSave ? 'PATCH' : 'POST');
    },
    [handleToggleSave],
  );

  const isNumberKeypadVisible =
    searchType === 'number' && (isNumberKeypadOpen || searchSongs.length === 0);

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
    setIsNumberKeypadOpen(false);
  };

  const handleToggleNumberKeypad = () => {
    setIsNumberKeypadOpen(prev => !prev);
  };

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (searchType === 'number') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 5);
      setSearch(digitsOnly);
      return;
    }

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

  const handleKeypadDigit = (digit: string) => {
    setSearch(prev => (prev.length >= 5 ? prev : prev + digit));
  };

  const handleKeypadBackspace = () => {
    setSearch(prev => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setSearch('');
  };

  const handleTabChange = (value: string) => {
    if (value === 'number' || searchType === 'number') {
      setSearch('');
      setIsNumberKeypadOpen(false);
    }
    // 번호 검색에서는 언어 필터를 숨기는데, 값이 남아 있으면 화면에 보이지 않는 채로
    // 결과가 걸러져 "번호가 맞는데 안 나온다"가 된다. 상태까지 비운다.
    if (value === 'number') {
      handleLanguageTagChange(undefined);
    }
    handleSearchTypeChange(value as SearchType);
  };

  // 가이드 투어는 실제 검색 대신 가상 카드를 띄운다.
  const [isTourDemo, setIsTourDemo] = useState(false);

  const showTourExampleCard = useCallback(() => {
    setSearch(TOUR_DEMO_SEARCH_TERM);
    setIsTourDemo(true);
  }, [setSearch]);

  // 사용자가 실제로 검색하면 예시 카드는 사라져야 한다.
  useEffect(() => {
    if (query) setIsTourDemo(false);
  }, [query]);

  const {
    tourTriggerSignal,
    handlePrepareExampleSearch,
    handleTourNormalizeState,
    handleStartTour,
  } = useSearchTourController({ handleTabChange, showExampleCard: showTourExampleCard });

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
    <div className="bg-background flex h-full flex-col gap-4">
      <div className="flex shrink-0 flex-col gap-4">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <h1 className="text-2xl font-bold">노래 검색</h1>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleStartTour}
                aria-label="사용법 다시 보기"
              >
                <HelpCircle className="text-muted-foreground h-4 w-4" />
              </Button>
            </div>

            {/* {!isAuthenticated && (
              <span className="text-muted-foreground text-sm">
                Guest 상태에서는 <br />
                [부를곡 추가]만 가능합니다.
              </span>
            )} */}
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

        <Tabs
          defaultValue="all"
          value={searchType}
          onValueChange={handleTabChange}
          data-tour="search-type-tabs"
        >
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
                className="data-[state=inactive]:hover:bg-accent/10 data-[state=inactive]:hover:text-accent dark:data-[state=inactive]:hover:bg-accent/10 dark:data-[state=inactive]:hover:text-accent dark:data-[state=active]:bg-accent/15 dark:data-[state=active]:text-accent dark:data-[state=active]:shadow-(--glow-accent)"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative flex gap-2">
          {searchType === 'number' && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden md:inline-flex"
              onClick={handleToggleNumberKeypad}
              aria-label={isNumberKeypadVisible ? '키패드 닫기' : '키패드 열기'}
            >
              {isNumberKeypadVisible ? (
                <ChevronUp className="h-4 w-4 text-white" />
              ) : (
                <ChevronDown className="h-4 w-4 text-white" />
              )}
            </Button>
          )}

          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />

            <Input
              type="text"
              inputMode={searchType === 'number' ? 'numeric' : 'text'}
              pattern={searchType === 'number' ? '[0-9]*' : undefined}
              placeholder={getPlaceholder(searchType)}
              className="pl-8"
              value={search}
              onChange={handleChangeSearch}
              onKeyUp={handleKeyUp}
              onFocus={() => setIsFocusAuto(true)}
              onBlur={() => setIsFocusAuto(false)}
            />
            {isFocusAuto && searchType !== 'number' && (
              <SearchAutocomplete
                autoCompleteList={autoCompleteList}
                onSelect={handleAutocompleteClick}
              />
            )}
          </div>

          <Button className="w-[60px]" onClick={handleSearchClick} disabled={isPendingSearch}>
            {isPendingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : '검색'}
          </Button>

          {searchType === 'number' && (
            <div
              className={cn(
                'bg-background absolute inset-x-0 top-full z-20 mt-2 hidden h-[35vh] overflow-hidden rounded-md border p-2 shadow-lg transition-opacity duration-200 md:block',
                isNumberKeypadVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              <NumberKeypad
                onDigitClick={handleKeypadDigit}
                onBackspace={handleKeypadBackspace}
                onClear={handleKeypadClear}
                onSearch={handleSearchClick}
                isPending={isPendingSearch}
              />
            </div>
          )}
        </div>

        {/* 번호 검색에는 언어 필터가 의미가 없다.
            값이 남아 있으면 번호가 맞는데도 결과가 걸러져 원인을 알기 어렵다. */}
        {searchType !== 'number' && (
          <div data-tour="language-filter">
            <LanguageTagFilter value={languageTag} onChange={handleLanguageTagChange} />
          </div>
        )}
      </div>
      <div ref={setScrollRef} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        {isTourDemo && (
          <div className="flex w-full max-w-md flex-col gap-4 p-4" data-tour="search-result-list">
            <SearchResultCard
              song={TOUR_DEMO_SONG}
              isDemo
              isToSing={false}
              isLike={false}
              isSave={false}
              onToggleToSing={() => toast.info('가이드 예시 카드예요')}
              onToggleLike={() => toast.info('가이드 예시 카드예요')}
              onClickSave={() => toast.info('가이드 예시 카드예요')}
            />
          </div>
        )}

        {!isTourDemo && searchSongs.length > 0 && (
          <div className="flex w-full max-w-md flex-col gap-4 p-4" data-tour="search-result-list">
            {searchSongs.map((song, index) => (
              <SearchResultCard
                key={song.artist + song.title + index}
                song={song}
                isToSing={isToSing(song, song.id)}
                isLike={song.isLike}
                isSave={song.isSave}
                onToggleToSing={handleCardToggleToSing}
                onToggleLike={handleCardToggleLike}
                onClickSave={handleCardClickSave}
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

        {!isTourDemo && !isPendingSearch && searchSongs.length === 0 && query && (
          <SearchStatus status="empty" />
        )}

        {!isTourDemo && searchSongs.length === 0 && !query && searchType !== 'number' && (
          <div className="flex h-full flex-col gap-2">
            <div className="text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className="m-2">전체 문장보다는 단어 단위로 검색해보세요</span>
            </div>

            <div className="flex h-full flex-col justify-center gap-2">
              <SearchHistory onHistoryClick={handleHistoryClick} />
              <PopularSearchHistory onHistoryClick={handleHistoryClick} />
            </div>
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

      <SearchTour
        onPrepareExampleSearch={handlePrepareExampleSearch}
        onTourNormalizeState={handleTourNormalizeState}
        triggerSignal={tourTriggerSignal}
      />
    </div>
  );
}
