'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import ReportFieldCard from '@/components/ReportFieldCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useReportSongMutation } from '@/queries/reportSongQuery';
import {
  REPORT_CATEGORIES,
  REPORT_CATEGORY_LABEL,
  REPORT_CATEGORY_TO_FIELD,
  REPORT_NO_DATA_LABEL,
  ReportCategory,
} from '@/types/report';
import { cn } from '@/utils/cn';

interface ReportSongModalProps {
  songId: string;
  title: string;
  artist: string;
  title_ko?: string;
  artist_ko?: string;
  num_tj?: string;
  num_ky?: string;
  handleClose: () => void;
}

const SUGGESTED_VALUE_TEXT_MAX_LENGTH = 100;
const SUGGESTED_VALUE_NUMBER_MAX_LENGTH = 5;

const isNumberCategory = (value: ReportCategory | null) => value === 'num_tj' || value === 'num_ky';

function getDisplay(translated: string | undefined, original: string): string {
  if (translated && translated !== original) {
    return `${translated} (${original})`;
  }
  return original;
}

export default function ReportSongModal({
  songId,
  title,
  artist,
  title_ko,
  artist_ko,
  num_tj,
  num_ky,
  handleClose,
}: ReportSongModalProps) {
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [suggestedValue, setSuggestedValue] = useState('');
  const [isNoData, setIsNoData] = useState(false);

  const { mutate: reportSong, isPending } = useReportSongMutation();

  const isNumberMode = isNumberCategory(category);
  const inputMaxLength = isNumberMode
    ? SUGGESTED_VALUE_NUMBER_MAX_LENGTH
    : SUGGESTED_VALUE_TEXT_MAX_LENGTH;

  const handleCategoryChange = (value: ReportCategory) => {
    setCategory(value);
    setSuggestedValue('');
    setIsNoData(false);
  };

  const handleSuggestedValueChange = (value: string) => {
    if (isNumberMode) {
      const digitsOnly = value.replace(/\D/g, '').slice(0, SUGGESTED_VALUE_NUMBER_MAX_LENGTH);
      setSuggestedValue(digitsOnly);
    } else {
      setSuggestedValue(value);
    }
  };

  const handleNoDataChange = (checked: boolean) => {
    setIsNoData(checked);
    setSuggestedValue('');
  };

  const handleSubmit = () => {
    if (!category) {
      toast.error('신고 항목을 선택해주세요.');
      return;
    }
    const trimmedSuggestedValue = suggestedValue.trim();
    if (!isNoData && !trimmedSuggestedValue) {
      toast.error('올바른 정보를 입력해주세요.');
      return;
    }
    reportSong(
      {
        songId,
        category,
        suggested_value: isNoData ? null : trimmedSuggestedValue,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  const activeField = category ? REPORT_CATEGORY_TO_FIELD[category] : null;
  const newValue = isNoData ? REPORT_NO_DATA_LABEL : suggestedValue.trim() || null;

  return (
    <div className="flex flex-col gap-4 sm:max-w-md">
      <DialogHeader>
        <DialogTitle>오류 신고</DialogTitle>
        <DialogDescription className="sr-only">
          {getDisplay(title_ko, title)} - {getDisplay(artist_ko, artist)} 곡에 대한 오류 신고
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <RadioGroup
          value={category ?? undefined}
          onValueChange={value => handleCategoryChange(value as ReportCategory)}
          className="grid grid-cols-2 gap-2"
          aria-label="신고 항목"
        >
          {REPORT_CATEGORIES.map(value => (
            <Label
              key={value}
              htmlFor={`report-${value}`}
              className="hover:bg-muted/40 has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors"
            >
              <RadioGroupItem value={value} id={`report-${value}`} />
              <span className="text-sm">{REPORT_CATEGORY_LABEL[value]}</span>
            </Label>
          ))}
        </RadioGroup>

        <ReportFieldCard
          title={title}
          artist={artist}
          title_ko={title_ko}
          artist_ko={artist_ko}
          num_tj={num_tj}
          num_ky={num_ky}
          activeField={activeField}
          newValue={newValue}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="report-suggested-value">올바른 정보</Label>
          <Input
            id="report-suggested-value"
            placeholder={
              isNumberMode
                ? '5자리 숫자로 입력해주세요.'
                : '어떤 내용으로 바뀌어야 하는지 적어주세요.'
            }
            value={isNoData ? REPORT_NO_DATA_LABEL : suggestedValue}
            onChange={e => handleSuggestedValueChange(e.target.value)}
            maxLength={inputMaxLength}
            inputMode={isNumberMode ? 'numeric' : undefined}
            pattern={isNumberMode ? '[0-9]*' : undefined}
            disabled={isNoData}
            required
          />
          <Label
            htmlFor="report-no-data"
            className={cn(
              'text-muted-foreground flex items-center gap-2 text-sm',
              isNumberMode ? 'cursor-pointer' : 'invisible',
            )}
            aria-hidden={!isNumberMode}
          >
            <Checkbox
              id="report-no-data"
              checked={isNoData}
              onCheckedChange={checked => handleNoDataChange(checked === true)}
              disabled={!isNumberMode}
              tabIndex={isNumberMode ? 0 : -1}
            />
            데이터 없음 (해당 노래방에 등록되지 않은 곡)
          </Label>
          <div className={cn('text-muted-foreground self-end text-xs', isNoData && 'invisible')}>
            {suggestedValue.length} / {inputMaxLength}
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-2">
        <Button variant="outline" onClick={handleClose} disabled={isPending}>
          취소
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? '제출 중...' : '제출'}
        </Button>
      </DialogFooter>
    </div>
  );
}
