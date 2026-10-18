'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

import ArtistName from './ArtistName';

interface ArtistVoteRowProps {
  artist: string;
  artistKo: string | null;
  /** 화면에 보이는(=편집 중인) 투표 포인트 */
  amount: number;
  /** 서버에 저장돼 있는 투표 포인트. 다르면 변경 표시를 띄운다. */
  savedAmount: number;
  step: number;
  disabled: boolean;
  onChange: (amount: number) => void;
  /** 입력창에서 엔터를 눌렀을 때 (저장 확인) */
  onSubmit: () => void;
  onDelete: () => void;
}

export default function ArtistVoteRow({
  artist,
  artistKo,
  amount,
  savedAmount,
  step,
  disabled,
  onChange,
  onSubmit,
  onDelete,
}: ArtistVoteRowProps) {
  const isChanged = amount !== savedAmount;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 rounded-md border px-3 py-2',
        isChanged && 'border-accent bg-accent/5',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <ArtistName name={artist} artistKo={artistKo} className="font-medium" />
        {isChanged && (
          <span className="text-muted-foreground text-xs">
            {savedAmount}P → {amount}P (저장 전)
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={disabled || amount === 0}
          aria-label="투표 감소"
          onClick={() => onChange(Math.max(0, amount - step))}
        >
          <Minus className="size-4" />
        </Button>

        {/* 숫자를 직접 고칠 수 있어야 해서 입력창으로 둔다. 엔터가 곧 저장 확인이다. */}
        <Input
          className="h-8 w-16 text-center text-sm font-bold tabular-nums"
          inputMode="numeric"
          aria-label={`${artist} 투표 포인트`}
          value={amount}
          disabled={disabled}
          onChange={event => onChange(Number(event.target.value.replace(/\D/g, '') || 0))}
          onKeyDown={event => {
            if (event.key === 'Enter') onSubmit();
          }}
        />

        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={disabled}
          aria-label="투표 증가"
          onClick={() => onChange(amount + step)}
        >
          <Plus className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={disabled}
          aria-label="투표 삭제"
          onClick={onDelete}
        >
          <Trash2 className="text-destructive size-4" />
        </Button>
      </div>
    </div>
  );
}
