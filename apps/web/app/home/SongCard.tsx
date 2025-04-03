'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronsDown, ChevronsUp, GripVertical, Mic, Trash } from 'lucide-react';

import { Card } from '@/components/ui/card';

interface Song {
  id: string;
  title: string;
  artist: string;
  kumyoungNumber: string;
  tjNumber: string;
}

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
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className={'relative'}>
      {/* 메인 콘텐츠 영역 */}
      <div className="flex h-[120px] w-full gap-4">
        {/* 노래 정보 */}
        <div className="flex flex-1 items-center justify-between p-8 pl-4">
          {/* 제목 및 가수 */}
          <div className="mb-1">
            <h3 className={'truncate text-base font-medium'}>{song.title}</h3>
            <p className="text-muted-foreground truncate text-sm">{song.artist}</p>
          </div>

          {/* 노래방 번호 */}
          <div className="mt-1 flex gap-4 space-x-4">
            <div className="flex flex-col items-center">
              <span className="text-brand-tj mr-1 text-xs">TJ</span>
              <span className="text-sm font-medium">{song.tjNumber}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-brand-ky mr-1 text-xs">금영</span>
              <span className="text-sm font-medium">{song.kumyoungNumber}</span>
            </div>
          </div>
        </div>
        {/* 버튼 영역 - 우측 하단에 고정 */}
        <div className="absolute right-10 bottom-3 flex space-x-1">
          <button
            type="button"
            onClick={onSung}
            className={'hover:bg-accent rounded-full p-1.5'}
            aria-label="노래 불렀음 표시"
          >
            <Mic className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="hover:bg-accent text-destructive hover:text-destructive rounded-full p-1.5"
            aria-label="삭제"
          >
            <Trash className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onMoveToTop}
            className="hover:bg-accent rounded-full p-1.5"
            aria-label="맨 위로 이동"
          >
            <ChevronsUp className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onMoveToBottom}
            className="hover:bg-accent rounded-full p-1.5"
            aria-label="맨 아래로 이동"
          >
            <ChevronsDown className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* 드래그 핸들 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-y-0 right-0 flex w-8 cursor-grab items-center justify-center active:cursor-grabbing"
        aria-label="드래그하여 순서 변경"
      >
        <GripVertical className="text-muted-foreground h-5 w-5" />
      </div>
    </Card>
  );
}
