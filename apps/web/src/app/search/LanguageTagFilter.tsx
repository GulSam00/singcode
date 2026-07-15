import { JP, KR, US } from 'country-flag-icons/react/3x2';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LANGUAGE_TAGS } from '@/constants/languageTags';
import { cn } from '@/utils/cn';

const ALL_VALUE = 'all';

// Tailwind는 클래스명을 정적으로 스캔하므로, 색상 클래스는 태그마다 완전한 문자열로 나열해야 한다.
// 태그별로 chart-1/2/4/5 네온 컬러를 고정 배정해 "노래방 네온 칩" 느낌을 낸다.
// 선택 시에는 해당 색으로 배경을 가득 채우고 글자색을 흰색으로 바꿔 명확히 구분한다.
// TabsTrigger 기본 스타일에 dark:data-[state=active]:bg-input/30, dark:data-[state=active]:text-foreground가
// 이미 있어서, dark: 접두사가 없는 클래스는 variant 체인이 달라 tailwind-merge가 덮어쓰지 못한다.
// 다크모드용도 명시적으로 함께 지정해야 실제로 배경/글자색이 바뀐다.
const TAG_ACCENT_CLASSES: Record<number, string> = {
  100: 'border-chart-1/40 text-chart-1/80 data-[state=active]:border-chart-1 data-[state=active]:bg-chart-1 data-[state=active]:text-white dark:data-[state=active]:border-chart-1 dark:data-[state=active]:bg-chart-1 dark:data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_var(--chart-1)]',
  101: 'border-chart-2/40 text-chart-2/80 data-[state=active]:border-chart-2 data-[state=active]:bg-chart-2 data-[state=active]:text-white dark:data-[state=active]:border-chart-2 dark:data-[state=active]:bg-chart-2 dark:data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_var(--chart-2)]',
  102: 'border-chart-4/40 text-chart-4/80 data-[state=active]:border-chart-4 data-[state=active]:bg-chart-4 data-[state=active]:text-white dark:data-[state=active]:border-chart-4 dark:data-[state=active]:bg-chart-4 dark:data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_var(--chart-4)]',
  103: 'border-chart-5/40 text-chart-5/80 data-[state=active]:border-chart-5 data-[state=active]:bg-chart-5 data-[state=active]:text-white dark:data-[state=active]:border-chart-5 dark:data-[state=active]:bg-chart-5 dark:data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_var(--chart-5)]',
};

// "전체"는 특정 언어를 대표하지 않으므로 네온 글로우 없이 중립 톤(전경색 가득 채움)만 유지한다.
const ALL_ACCENT_CLASSES =
  'border-border text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background dark:data-[state=active]:border-foreground dark:data-[state=active]:bg-foreground dark:data-[state=active]:text-background data-[state=active]:shadow-none';

const CHIP_BASE_CLASSES =
  'flex-none rounded-full border bg-transparent px-2.5 py-1.5  font-medium shadow-none transition-all';

const ALL_EMOJI = '🎵';

const FLAG_CLASSES = 'h-3 w-auto rounded-[2px]';

const TAG_ICONS: Record<number, React.ReactNode> = {
  100: <KR title="한국어" className={FLAG_CLASSES} />,
  101: <JP title="일본어" className={FLAG_CLASSES} />,
  102: <US title="영어" className={FLAG_CLASSES} />,
  103: '🌐',
};

interface LanguageTagFilterProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export default function LanguageTagFilter({ value, onChange }: LanguageTagFilterProps) {
  const handleValueChange = (next: string) => {
    onChange(next === ALL_VALUE ? undefined : Number(next));
  };

  return (
    <Tabs
      value={value ? String(value) : ALL_VALUE}
      onValueChange={handleValueChange}
      className="w-full"
    >
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
        <TabsTrigger value={ALL_VALUE} className={cn(CHIP_BASE_CLASSES, ALL_ACCENT_CLASSES)}>
          {ALL_EMOJI} 전체
        </TabsTrigger>
        {LANGUAGE_TAGS.map(tag => (
          <TabsTrigger
            key={tag.id}
            value={String(tag.id)}
            className={cn(CHIP_BASE_CLASSES, TAG_ACCENT_CLASSES[tag.id])}
          >
            {TAG_ICONS[tag.id]} {tag.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
