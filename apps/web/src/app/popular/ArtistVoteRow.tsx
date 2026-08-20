'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ArtistVoteRowProps {
  artist: string;
  amount: number;
  step: number;
  canIncrease: boolean;
  disabled: boolean;
  onAdjust: (delta: number) => void;
  onDelete: () => void;
}

export default function ArtistVoteRow({
  artist,
  amount,
  step,
  canIncrease,
  disabled,
  onAdjust,
  onDelete,
}: ArtistVoteRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
      <span className="min-w-0 flex-1 truncate font-medium">{artist}</span>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={disabled}
          aria-label="투표 감소"
          onClick={() => onAdjust(-step)}
        >
          <Minus className="size-4" />
        </Button>
        <span className="w-12 text-center text-sm font-bold tabular-nums">{amount}P</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={disabled || !canIncrease}
          aria-label="투표 증가"
          onClick={() => onAdjust(step)}
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
