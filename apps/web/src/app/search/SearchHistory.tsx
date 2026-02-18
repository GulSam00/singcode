import { X } from 'lucide-react';

import useSearchHistoryStore from '@/stores/useSearchHistoryStore';

interface SearchHistoryProps {
  onHistoryClick: (term: string) => void;
}

export default function SearchHistory({ onHistoryClick }: SearchHistoryProps) {
  const { searchHistory, removeFromHistory } = useSearchHistoryStore();

  if (searchHistory.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-4">
      {searchHistory.map((term, index) => (
        <button
          key={index}
          className="bg-background flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
          type="button"
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
        </button>
      ))}
    </div>
  );
}
