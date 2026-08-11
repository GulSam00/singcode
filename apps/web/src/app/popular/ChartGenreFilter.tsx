'use client';

import { useEffect, useRef } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STR_TYPE_EMOJI, STR_TYPE_LABEL, StrType } from '@/types/tjChart';

// 장르가 12종이라 줄바꿈 없이 한 줄로 두고 가로 스크롤로 훑게 한다.
// TabsTrigger 기본 스타일의 flex-1(균등 분할)은 flex-none으로 해제해야 칩 너비가 라벨에 맞는다.
const CHIP_CLASSES =
  'flex-none rounded-full border border-border bg-transparent px-3 py-1 text-xs font-medium text-muted-foreground shadow-none transition-all data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background dark:data-[state=active]:border-foreground dark:data-[state=active]:bg-foreground dark:data-[state=active]:text-background';

// 모바일에서 가로 스크롤바가 칩 높이를 흔들지 않도록 숨긴다.
const LIST_CLASSES =
  'h-auto w-full flex-nowrap justify-start gap-1 overflow-x-auto bg-transparent p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

interface ChartGenreFilterProps {
  value: StrType;
  onChange: (value: StrType) => void;
}

export default function ChartGenreFilter({ value, onChange }: ChartGenreFilterProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // 데스크톱 마우스 휠은 세로 델타만 발생시켜 가로 목록을 훑을 수 없다. 세로 델타를 가로 스크롤로 넘긴다.
  // React의 onWheel은 passive 리스너로 붙어 preventDefault가 막히므로 네이티브로 직접 등록한다.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const handleWheel = (event: WheelEvent) => {
      // 트랙패드의 가로 제스처는 브라우저 기본 동작에 맡긴다.
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (list.scrollWidth <= list.clientWidth) return;

      // 양 끝에 닿았으면 페이지 세로 스크롤을 가로채지 않는다.
      const atStart = list.scrollLeft <= 0;
      const atEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 1;
      if ((event.deltaY < 0 && atStart) || (event.deltaY > 0 && atEnd)) return;

      event.preventDefault();
      list.scrollLeft += event.deltaY;
    };

    list.addEventListener('wheel', handleWheel, { passive: false });
    return () => list.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <Tabs value={value} onValueChange={next => onChange(next as StrType)} className="w-full">
      <TabsList ref={listRef} className={LIST_CLASSES}>
        {Object.values(StrType).map(type => (
          <TabsTrigger key={type} value={type} className={CHIP_CLASSES}>
            <span aria-hidden="true">{STR_TYPE_EMOJI[type]}</span>
            {STR_TYPE_LABEL[type]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
