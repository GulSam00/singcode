'use client';

import { ChartNoAxesCombined } from 'lucide-react';

import { useSearchLogQuery } from '@/queries/searchLogQuery';

interface PopularSearchHistoryProps {
  onHistoryClick: (term: string) => void;
}

export default function PopularSearchHistory({ onHistoryClick }: PopularSearchHistoryProps) {
  const { data: searchLogs } = useSearchLogQuery();

  if (!searchLogs || searchLogs.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2">
        <ChartNoAxesCombined className="h-4 w-4" />
        <p className="m-2">인기 검색어</p>
      </div>
      <div className="flex flex-wrap gap-2 pb-4">
        {searchLogs.slice(0, 10).map((log, index) => (
          <div
            key={`${log.text}-${index}`}
            className="bg-background flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
          >
            <span className="text-xs">{index + 1}</span>
            <span
              className="hover:text-primary max-w-30 cursor-pointer truncate text-left"
              onClick={() => onHistoryClick(log.text)}
            >
              {log.text}
            </span>
            <span className="text-muted-foreground text-xs">{log.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
