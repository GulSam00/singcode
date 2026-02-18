'use client';

import { cn } from '@/utils/cn';
import { getAutoCompleteSuggestions } from '@/utils/getArtistAlias';

interface SearchAutocompleteProps {
  search: string;
  onSelect: (value: string) => void;
  className?: string;
}

export default function SearchAutocomplete({
  search,
  onSelect,
  className,
}: SearchAutocompleteProps) {
  const autoCompleteList = getAutoCompleteSuggestions(search);

  if (autoCompleteList.length === 0) return null;

  return (
    <div
      className={cn(
        'bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-md border shadow-md',
        className,
      )}
    >
      <ul className="py-1">
        {autoCompleteList.map((item, index) => (
          <li key={index}>
            <button
              type="button"
              className="hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm select-none"
              onClick={() => onSelect(item.value)}
              onMouseDown={e => e.preventDefault()}
            >
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
