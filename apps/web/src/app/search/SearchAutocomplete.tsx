'use client';

import * as React from 'react';

import { cn } from '@/utils/cn';

interface SearchAutocompleteProps {
  items: string[];
  onSelect: (value: string) => void;
  className?: string;
}

export default function SearchAutocomplete({
  items,
  onSelect,
  className,
}: SearchAutocompleteProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        'bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-md border shadow-md',
        className
      )}
    >
      <ul className="py-1">
        {items.map((item, index) => (
          <li key={index}>
            <button
              type="button"
              className="hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-left select-none"
              onClick={() => onSelect(item)}
            >
              <span>{item}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
