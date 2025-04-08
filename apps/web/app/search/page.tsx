'use client';

import { Mic, Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/useAuthStore';
import { Method } from '@/types/common';
import { SearchSong } from '@/types/song';

import SearchResultCard from './SearchResultCard';

type SearchType = 'title' | 'artist';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchSong[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>('title');

  const { user } = useAuthStore(); // store에서 user 정보 가져오기

  // 엔터 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value as SearchType);
    // 검색 유형이 변경되면 현재 쿼리로 다시 검색
  };

  // 검색 기능
  const handleSearch = async () => {
    if (!query) {
      return;
    }
    setIsSearching(true);
    const response = await fetch(
      `api/search?q=${query}&type=${searchType}&userId=${user?.id || ''}`,
    );
    const data = await response.json();

    console.log('handleSearch data : ', data);

    if (data.success) {
      setSearchResults(data.songs);
    } else {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleToggleToSing = async (songId: string, method: Method) => {
    const url = `/api/songs/tosing`;
    const userId = user?.id ?? null;
    const response = await fetch(url, {
      method,
      body: JSON.stringify({ songId, userId }),
      headers: { 'Content-Type': 'application/json' },
    });

    const { success } = await response.json();
    if (success) {
      handleSearch();
    }
  };

  const handleToggleLike = async (songId: string, method: Method) => {
    const url = `/api/songs/like`;
    const userId = user?.id ?? null;
    const response = await fetch(url, {
      method,
      body: JSON.stringify({ songId, userId }),
      headers: { 'Content-Type': 'application/json' },
    });

    const { success } = await response.json();
    if (success) {
      handleSearch();
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-background sticky top-0 z-10 p-3 pb-2 shadow-sm">
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
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            검색
          </Button>
        </div>
      </div>

      <div className="p-3 pt-2">
        {isSearching ? (
          <div className="text-muted-foreground flex h-40 items-center justify-center">
            검색 중...
          </div>
        ) : searchResults.length > 0 ? (
          <div className="flex flex-col space-y-3">
            {searchResults.map((song, index) => (
              <SearchResultCard
                key={song.artist + song.title + index}
                song={song}
                onToggleToSing={handleToggleToSing}
                onToggleLike={handleToggleLike}
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground flex h-40 flex-col items-center justify-center">
            <p className="mb-2">노래 제목이나 가수를 검색해보세요</p>
            <Mic className="h-8 w-8 opacity-50" />
          </div>
        )}
      </div>
    </div>
  );
}
