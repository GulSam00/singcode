'use client';

import { ChartNoAxesCombined, Loader2 } from 'lucide-react';

import { useSearchLogQuery } from '@/queries/searchLogQuery';

interface PopularSearchHistoryProps {
  onHistoryClick: (term: string) => void;
}

export default function PopularSearchHistory({ onHistoryClick }: PopularSearchHistoryProps) {
  const { data: searchLogs, isPending } = useSearchLogQuery();

  return (
    <div className="h-30 overflow-hidden">
      <div className="flex items-center gap-2">
        <ChartNoAxesCombined className="h-4 w-4" />
        <p className="m-2">인기 검색어</p>
      </div>
      {isPending ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pb-4">
          {searchLogs?.slice(0, 10).map((log, index) => (
            <div
              key={`${log.text}-${index}`}
              className="bg-background flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
            >
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
      )}
    </div>
  );
}
