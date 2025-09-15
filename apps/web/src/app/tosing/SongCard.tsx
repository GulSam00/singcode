'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, ChevronsDown, ChevronsUp, GripVertical, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Song } from '@/types/song';

interface SongCardProps {
  song: Song;
  onSung: () => void;
  onDelete: () => void;
  onMoveToTop: () => void;
  onMoveToBottom: () => void;
}

export default function SongCard({
  song,
  onSung,
  onDelete,
  onMoveToTop,
  onMoveToBottom,
}: SongCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: song.id,
  });

  const { title, artist, num_tj, num_ky } = song;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className={'relative'}>
      {/* 메인 콘텐츠 영역 */}
      <div className="flex h-[150px] w-full gap-4 p-3">
        {/* 노래 정보 */}
        <div className="mb-8 flex cursor-grab flex-col active:cursor-grabbing">
          {/* 제목 및 가수 */}
          <div className="mb-1 w-[290px]">
            <h3 className="truncate text-base font-medium">{title}</h3>
            <p className="text-muted-foreground truncate text-sm">{artist}</p>
          </div>

          {/* 노래방 번호 */}
          <div className="mt-1 flex cursor-grab active:cursor-grabbing">
            <div className="flex w-[70px] items-center">
              <span className="text-brand-tj mr-1 text-xs">TJ</span>
              <span className="text-sm font-medium">{num_tj}</span>
            </div>
            <div className="flex w-[70px] items-center">
              <span className="text-brand-ky mr-1 text-xs">금영</span>
              <span className="text-sm font-medium">{num_ky}</span>
            </div>
          </div>
        </div>

        {/* 버튼 영역 - 우측 하단에 고정 */}
        <div className="absolute right-10 bottom-3 flex w-[calc(100%-48px)] space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-13 flex-1 flex-col items-center justify-center`}
            aria-label="노래 부르기"
            onClick={onSung}
          >
            <Check className="text-check h-5 w-5" />
            <span className="text-xs">노래 부르기</span>
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
