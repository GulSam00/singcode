'use client';

import { Mic, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useSearchSong from '@/hooks/useSearchSong';

import SearchResultCard from './SearchResultCard';

export default function SearchPage() {
  const {
    search,
    setSearch,
    searchResults,
    searchType,
    data,
    isLoading,
    handleSearchTypeChange,
    handleSearch,
    handleToggleToSing,
    handleToggleLike,
    handleOpenPlaylistModal,
    // isModal,
    // selectedSong,
    // handleSavePlaylist,
  } = useSearchSong();

  console.log('test : ', data);
  // 엔터 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-background">
      <div className="bg-background p-2 shadow-sm">
        <h1 className="mb-3 text-xl font-bold">노래 검색</h1>

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
      <ScrollArea className="h-[calc(100vh-15rem)]">
        {searchResults.length > 0 ? (
          <div className="flex w-[360px] flex-col gap-3 p-3">
            {searchResults.map((song, index) => (
              <SearchResultCard
                key={song.artist + song.title + index}
                song={song}
                onToggleToSing={() =>
                  handleToggleToSing(song.id, song.isToSing ? 'DELETE' : 'POST')
                }
                onToggleLike={() => handleToggleLike(song.id, song.isLiked ? 'DELETE' : 'POST')}
                onClickOpenPlaylistModal={() => handleOpenPlaylistModal(song)}
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground flex h-40 flex-col items-center justify-center">
            <p className="mb-2">노래 제목이나 가수를 검색해보세요</p>
            <Mic className="h-8 w-8 opacity-50" />
          </div>
        )}
      </ScrollArea>
      {/* {isModal && <PlaylistModal song={selectedSong} />} */}
    </div>
  );
}
