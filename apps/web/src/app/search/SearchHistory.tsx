import { Clock, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import useSearchHistoryStore from '@/stores/useSearchHistoryStore';

interface SearchHistoryProps {
  onHistoryClick: (term: string) => void;
}

export default function SearchHistory({ onHistoryClick }: SearchHistoryProps) {
  const { searchHistory, removeFromHistory } = useSearchHistoryStore();

  return (
    <div className="h-30 overflow-hidden">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <p className="m-2">최근 검색어</p>
      </div>

      <div className="flex flex-wrap gap-2 pb-4">
        {searchHistory.length === 0 && (
          <div className="text-muted-foreground flex h-15 w-full items-center justify-center">
            최근 검색어가 없습니다.
          </div>
        )}
        {searchHistory.slice(0, 10).map((term, index) => (
          <div
            key={`${term}-${index}`}
            className="bg-background flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
          >
            <span
              className="hover:text-primary max-w-30 cursor-pointer truncate text-left"
              onClick={() => onHistoryClick(term)}
            >
              {term}
            </span>
            <span
              className="hover:text-destructive cursor-pointer"
              onClick={() => removeFromHistory(term)}
              title="검색 기록 삭제"
            >
              <X className="h-4 w-4" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
