'use client';

import { Mic, Search, SearchX } from 'lucide-react';

import StaticLoading from '@/components/StaticLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useSearchSong from '@/hooks/useSearchSong';

import PlaylistModal from './PlaylistModal';
import SearchResultCard from './SearchResultCard';

export default function SearchPage() {
  const {
    search,
    query,
    setSearch,
    searchSongs,
    isLoading,
    isSaveModal,
    setIsSaveModal,
    handleOpenSaveModal,
    selectedSaveSong,
    searchType,
    handleSearchTypeChange,
    handleSearch,
    handleToggleToSing,
    handleToggleLike,
    saveSong,
  } = useSearchSong();

  // 엔터 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-background">
      <div className="bg-background px-2 py-4 shadow-sm">
        <h1 className="mb-3 text-2xl font-bold">노래 검색</h1>

        <Tabs
          defaultValue="all"
          value={searchType}
          onValueChange={handleSearchTypeChange}
          className="mb-3"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="title">제목</TabsTrigger>
            <TabsTrigger value="artist">가수</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="text"
              placeholder={searchType === 'title' ? '노래 제목 검색' : '가수 이름 검색'}
              className="pl-8"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button onClick={handleSearch}>검색</Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-16rem)]">
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
                onToggleSave={() => handleOpenSaveModal(song)}
              />
            ))}
          </div>
        )}
        {searchSongs.length === 0 && query && (
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
      {isLoading && <StaticLoading />}
      {selectedSaveSong && (
        <PlaylistModal
          isOpen={isSaveModal}
          setIsSaveModal={setIsSaveModal}
          song={selectedSaveSong}
          saveSong={saveSong}
        />
      )}
    </div>
  );
}
