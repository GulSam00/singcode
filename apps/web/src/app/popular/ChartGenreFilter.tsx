'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STR_TYPE_LABEL, StrType } from '@/types/tjChart';

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
  return (
    <Tabs value={value} onValueChange={next => onChange(next as StrType)} className="w-full">
      <TabsList className={LIST_CLASSES}>
        {Object.values(StrType).map(type => (
          <TabsTrigger key={type} value={type} className={CHIP_CLASSES}>
            {STR_TYPE_LABEL[type]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
