'use client';

import { Mic, Search } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SearchType = 'title' | 'artist';

// 검색 결과 타입 정의
interface SearchResult {
  id: string;
  title: string;
  artist: string;
  kumyoungNumber: string;
  tjNumber: string;
}

// 샘플 데이터
const sampleData: SearchResult[] = [
  { id: '1', title: '눈의 꽃', artist: '박효신', kumyoungNumber: '47251', tjNumber: '62867' },
  { id: '2', title: '거리에서', artist: '성시경', kumyoungNumber: '84173', tjNumber: '48506' },
  {
    id: '3',
    title: '벚꽃 엔딩',
    artist: '버스커 버스커',
    kumyoungNumber: '46079',
    tjNumber: '30184',
  },
  { id: '4', title: '사랑했나봐', artist: '윤도현', kumyoungNumber: '41906', tjNumber: '35184' },
  {
    id: '5',
    title: '너를 사랑하고 있어',
    artist: '백지영',
    kumyoungNumber: '38115',
    tjNumber: '46009',
  },
  { id: '6', title: '보고싶다', artist: '김범수', kumyoungNumber: '30444', tjNumber: '34147' },
  {
    id: '7',
    title: '사랑이 멀어지면',
    artist: '씨엔블루',
    kumyoungNumber: '46513',
    tjNumber: '47278',
  },
  {
    id: '8',
    title: '너에게 난 나에게 넌',
    artist: '자전거 탄 풍경',
    kumyoungNumber: '16293',
    tjNumber: '44871',
  },
  { id: '9', title: '사랑스러워', artist: '김종국', kumyoungNumber: '35174', tjNumber: '46522' },
  { id: '10', title: '내 사람', artist: 'SG워너비', kumyoungNumber: '45872', tjNumber: '62427' },
];

// const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>('title');

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value as SearchType);
    // 검색 유형이 변경되면 현재 쿼리로 다시 검색
  };

  // 검색 기능
  const handleSearch = async () => {
    setIsSearching(true);

    console.log(query);
    const response = await fetch(`api/search?q=${query}&type=${searchType}`);

    const data = await response.json();

    console.log('search ', data);

    // 실제로는 API 호출을 할 것이지만, 여기서는 샘플 데이터를 필터링
    const filtered = sampleData.filter(
      item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.artist.toLowerCase().includes(query.toLowerCase()),
    );

    // 약간의 지연을 주어 검색 중인 느낌을 줌 (실제 구현에서는 제거)
    setTimeout(() => {
      setResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  // 엔터 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 초기 로드 시 빈 검색 결과
  useEffect(() => {
    setResults([]);
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-background sticky top-0 z-10 p-3 pb-2 shadow-sm">
        <h1 className="mb-3 text-xl font-bold">노래 검색</h1>

        {/* 검색 유형 선택 탭 */}
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
        ) : results.length > 0 ? (
          <div className="flex flex-col space-y-3">
            {results.map(result => (
              <SearchResultCard key={result.id} result={result} />
            ))}
          </div>
        ) : query ? (
          <div className="text-muted-foreground flex h-40 items-center justify-center">
            검색 결과가 없습니다
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

// 검색 결과 카드 컴포넌트
function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex flex-col">
          <h3 className="truncate text-base font-medium">{result.title}</h3>
          <p className="text-muted-foreground truncate text-sm">{result.artist}</p>

          <div className="mt-2 flex space-x-4">
            <div className="flex items-center">
              <span className="text-muted-foreground mr-1 text-xs">금영</span>
              <span className="text-sm font-medium">{result.kumyoungNumber}</span>
            </div>
            <div className="flex items-center">
              <span className="text-muted-foreground mr-1 text-xs">TJ</span>
              <span className="text-sm font-medium">{result.tjNumber}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
