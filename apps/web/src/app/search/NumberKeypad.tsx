'use client';

import { Delete, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface NumberKeypadProps {
  onDigitClick: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSearch: () => void;
  isPending?: boolean;
}

const DIGIT_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

export default function NumberKeypad({
  onDigitClick,
  onBackspace,
  onClear,
  onSearch,
  isPending,
}: NumberKeypadProps) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid flex-1 grid-cols-3 grid-rows-4 gap-2">
        {DIGIT_ROWS.flat().map(digit => (
          <Button
            key={digit}
            type="button"
            variant="outline"
            className="h-full text-xl"
            onClick={() => onDigitClick(digit)}
          >
            {digit}
          </Button>
        ))}

        <Button type="button" variant="outline" className="h-full text-base" onClick={onClear}>
          초기화
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-full text-xl"
          onClick={() => onDigitClick('0')}
        >
          0
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-full"
          onClick={onBackspace}
          aria-label="한 글자 지우기"
        >
          <Delete className="h-5 w-5" />
        </Button>
      </div>

      <Button className="h-12 shrink-0 text-base" onClick={onSearch} disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : '검색'}
      </Button>
    </div>
  );
}
