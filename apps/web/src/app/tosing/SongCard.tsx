'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronsDown, ChevronsUp, GripVertical, Trash } from 'lucide-react';

import SongSummary from '@/components/SongSummary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Song } from '@/types/song';

interface SongCardProps {
  song: Song;
  onDelete: () => void;
  onMoveToTop: () => void;
  onMoveToBottom: () => void;
}

export default function SongCard({ song, onDelete, onMoveToTop, onMoveToBottom }: SongCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: song.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className={'relative'}>
      {/* 드래그 핸들(우측 48px)과 겹치지 않도록 본문 폭을 줄인다 */}
      <div className="w-[calc(100%-48px)] p-3 pb-16">
        <SongSummary song={song} />

        {/* 버튼 영역 - 우측 하단에 고정 */}
        <div className="absolute right-10 bottom-3 flex w-[calc(100%-48px)] space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-13 flex-1 flex-col items-center justify-center`}
            aria-label="삭제"
            onClick={onMoveToTop}
          >
            <ChevronsUp className="h-5 w-5" />
            <span className="text-xs">최상위 순서</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`h-13 flex-1 flex-col items-center justify-center`}
            aria-label="삭제"
            onClick={onDelete}
          >
            <Trash className="text-destructive h-5 w-5" />
            <span className="text-xs">삭제</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`h-13 flex-1 flex-col items-center justify-center`}
            aria-label="삭제"
            onClick={onMoveToBottom}
          >
            <ChevronsDown className="h-5 w-5" />
            <span className="text-xs">최하위 순서</span>
          </Button>
        </div>
      </div>
      {/* 드래그 핸들 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-y-0 right-0 flex w-12 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
        aria-label="드래그하여 순서 변경"
      >
        <GripVertical className="text-muted-foreground h-5 w-5" />
      </div>
    </Card>
  );
}
