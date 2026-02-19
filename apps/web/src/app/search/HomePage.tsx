'use client';

import { Loader2, Search, SearchX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useSaveSongModal from '@/hooks/useSaveSongModal';
import useSearchSong from '@/hooks/useSearchSong';
import useGuestToSingStore from '@/stores/useGuestToSingStore';
import { SearchSong } from '@/types/song';

import AddFolderModal from './AddFolderModal';
import ChatBot from './ChatBot';
import JpnArtistList from './JpnArtistList';
import SearchAutocomplete from './SearchAutocomplete';
import SearchHistory from './SearchHistory';
import SearchResultCard from './SearchResultCard';

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

  const [isFocusAuto, setIsFocusAuto] = useState(false);

  const { ref, inView } = useInView();

  const { guestToSingSongs } = useGuestToSingStore();

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
    if (!search.trim()) {
      toast.error('검색어를 입력해주세요.');
      return;
    }

    handleSearch();
    setIsFocusAuto(false);
  };

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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
          <JpnArtistList
            onSelectArtist={setSearch}
            callback={() => handleSearchTypeChange('artist')}
          />
        </div>

        <Tabs defaultValue="all" value={searchType} onValueChange={handleSearchTypeChange}>
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
        {/* 검색 기록 */}
        <SearchHistory onHistoryClick={handleHistoryClick} />
      </div>
      <div className="h-[calc(100vh-24rem)] overflow-x-hidden overflow-y-auto">
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
                onClickArtist={() => setSearch(song.artist)}
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
      <ChatBot setInputSearch={setSearch} />
    </div>
  );
}
