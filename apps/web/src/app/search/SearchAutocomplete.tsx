'use client';

import { getAutocompleteOptionId } from '@/hooks/useAutocompleteNavigation';
import { cn } from '@/utils/cn';
import { type SearchCandidate } from '@/utils/getArtistAlias';

interface SearchAutocompleteProps {
  autoCompleteList: SearchCandidate[];
  onSelect: (value: string) => void;
  /** 키보드로 이동 중인 후보. 아무것도 고르지 않은 상태는 -1 */
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  /** 입력창의 aria-controls / aria-activedescendant 가 가리키는 id */
  listboxId: string;
  className?: string;
}

export default function SearchAutocomplete({
  autoCompleteList,
  onSelect,
  activeIndex,
  onActiveIndexChange,
  listboxId,
  className,
}: SearchAutocompleteProps) {
  if (autoCompleteList.length === 0) return null;

  return (
    <div
      className={cn(
        'bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-md border shadow-md',
        className,
      )}
    >
      {/* listbox 안의 항목은 option 이어야 한다. button 을 두면 포커스가 입력창을 떠나
          aria-activedescendant 방식(포커스는 입력창에 두고 활성 후보만 가리키는 것)이 깨진다. */}
      <ul id={listboxId} role="listbox" aria-label="아티스트 검색어 추천" className="py-1">
        {autoCompleteList.map((item, index) => (
          <li
            key={`${item.value}-${item.label}`}
            id={getAutocompleteOptionId(listboxId, index)}
            role="option"
            aria-selected={index === activeIndex}
            className={cn(
              'flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm select-none',
              index === activeIndex && 'bg-accent text-accent-foreground',
            )}
            // 클릭으로 입력창의 포커스가 빠지면 드롭다운이 먼저 닫혀 선택이 취소된다.
            onMouseDown={e => e.preventDefault()}
            onMouseEnter={() => onActiveIndexChange(index)}
            onClick={() => onSelect(item.value)}
          >
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
