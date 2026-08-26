'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 년/월을 그냥 텍스트처럼 보이게 두고, 눌러야 드롭다운이 열린다는 건 셀렉트 기본 화살표로 알린다.
const SELECT_TRIGGER_CLASSES =
  'h-auto w-auto gap-1 border-none p-0 text-xl font-bold shadow-none focus-visible:ring-0';

// 조회 월은 항상 'yyyy-MM-dd' 문자열이라 파싱 없이 잘라 쓴다.
const getYear = (month: string) => month.slice(0, 4);
const getMonthNumber = (month: string) => month.slice(5, 7);

interface MonthSelectorProps {
  month: string;
  /** 이미 정렬/보정까지 끝낸 선택 가능 월 목록 (최신순). 화면마다 보정 규칙이 달라 호출부에서 계산해 넘긴다. */
  selectableMonths: string[];
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onChange: (month: string) => void;
}

export default function MonthSelector({
  month,
  selectableMonths,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onChange,
}: MonthSelectorProps) {
  const years = [...new Set(selectableMonths.map(getYear))];
  // 연도 안에서는 1월 → 12월 순으로 훑는 게 자연스러워 오름차순으로 둔다.
  const monthsInYear = selectableMonths.filter(item => getYear(item) === getYear(month)).sort();

  // 연도를 바꿀 때 같은 달이 있으면 유지하고, 없으면 그 해에서 가장 최근 달로 이동한다.
  const handleYearChange = (nextYear: string) => {
    const candidates = selectableMonths.filter(item => getYear(item) === nextYear);
    if (candidates.length === 0) return;

    const sameMonth = candidates.find(item => getMonthNumber(item) === getMonthNumber(month));
    onChange(sameMonth ?? candidates[0]);
  };

  return (
    <div className="flex w-full shrink-0 items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        className="size-10"
        aria-label="이전 달"
        disabled={!canGoPrev}
        onClick={onPrev}
      >
        <ChevronLeft className="size-6" />
      </Button>

      <div className="flex items-center gap-1 whitespace-nowrap">
        <Select value={getYear(month)} onValueChange={handleYearChange}>
          <SelectTrigger className={SELECT_TRIGGER_CLASSES} aria-label="연도 선택">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={year}>
                {year}년
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={month} onValueChange={onChange}>
          <SelectTrigger className={SELECT_TRIGGER_CLASSES} aria-label="월 선택">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthsInYear.map(item => (
              <SelectItem key={item} value={item}>
                {Number(getMonthNumber(item))}월
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-10"
        aria-label="다음 달"
        disabled={!canGoNext}
        onClick={onNext}
      >
        <ChevronRight className="size-6" />
      </Button>
    </div>
  );
}
