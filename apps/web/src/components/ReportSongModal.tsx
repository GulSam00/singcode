'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useReportSongMutation } from '@/queries/reportSongQuery';
import { REPORT_CATEGORIES, REPORT_CATEGORY_LABEL, ReportCategory } from '@/types/report';
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
const NO_DATA_LABEL = '데이터 없음';

type CardField = 'artist' | 'title' | 'num_tj' | 'num_ky';

const CATEGORY_TO_FIELD: Record<ReportCategory, CardField> = {
  artist_translation: 'artist',
  title_translation: 'title',
  num_tj: 'num_tj',
  num_ky: 'num_ky',
};

const isNumberCategory = (value: ReportCategory | null) => value === 'num_tj' || value === 'num_ky';

function splitDisplay(
  translated: string | undefined,
  original: string,
): { primary: string; secondary: string | null; display: string } {
  if (translated && translated !== original) {
    return {
      primary: translated,
      secondary: original,
      display: `${translated} (${original})`,
    };
  }
  return { primary: original, secondary: null, display: original };
}

function NewValueIndicator({
  isVisible,
  value,
  textSize,
}: {
  isVisible: boolean;
  value: string | null;
  textSize: 'text-base' | 'text-sm';
}) {
  return (
    <>
      <span className={cn('text-muted-foreground shrink-0', !isVisible && 'invisible')}>→</span>
      <span
        className={cn(
          'text-primary min-w-0 truncate font-medium',
          textSize,
          !isVisible && 'invisible',
        )}
      >
        {value ?? ' '}
      </span>
    </>
  );
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
  const titleParts = splitDisplay(title_ko, title);
  const artistParts = splitDisplay(artist_ko, artist);

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

  const activeField = category ? CATEGORY_TO_FIELD[category] : null;
  const newValue = isNoData ? NO_DATA_LABEL : suggestedValue.trim() || null;

  const isFieldActive = (field: CardField) => activeField === field && newValue !== null;

  return (
    <div className="flex flex-col gap-4 sm:max-w-md">
      <DialogHeader>
        <DialogTitle>오류 신고</DialogTitle>
        <DialogDescription className="sr-only">
          {titleParts.display} - {artistParts.display} 곡에 대한 오류 신고
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

        <div className="flex flex-col gap-3 rounded-md border p-4">
          <div className="flex flex-col gap-1">
            <div
              className={cn(
                'rounded-sm px-2 py-1 transition-colors',
                activeField === 'title' && 'bg-primary/10',
              )}
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="min-w-0 truncate text-base font-medium">
                    {titleParts.primary}
                  </span>
                  <NewValueIndicator
                    isVisible={isFieldActive('title')}
                    value={newValue}
                    textSize="text-base"
                  />
                </div>
                {titleParts.secondary && (
                  <span className="text-muted-foreground truncate text-xs">
                    {titleParts.secondary}
                  </span>
                )}
              </div>
            </div>

            <div
              className={cn(
                'rounded-sm px-2 py-1 transition-colors',
                activeField === 'artist' && 'bg-primary/10',
              )}
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-muted-foreground min-w-0 truncate text-sm">
                    {artistParts.primary}
                  </span>
                  <NewValueIndicator
                    isVisible={isFieldActive('artist')}
                    value={newValue}
                    textSize="text-sm"
                  />
                </div>
                {artistParts.secondary && (
                  <span className="text-muted-foreground/70 truncate text-xs">
                    {artistParts.secondary}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-t pt-2">
            <div
              className={cn(
                'flex min-w-0 flex-1 items-center gap-2 rounded-sm px-2 py-1 transition-colors',
                activeField === 'num_tj' && 'bg-primary/10',
              )}
            >
              <span className="text-brand-tj shrink-0 text-xs font-bold">TJ</span>
              <span className="min-w-0 truncate text-sm font-medium">{num_tj || '-'}</span>
              <NewValueIndicator
                isVisible={isFieldActive('num_tj')}
                value={newValue}
                textSize="text-sm"
              />
            </div>
            <div
              className={cn(
                'flex min-w-0 flex-1 items-center gap-2 rounded-sm px-2 py-1 transition-colors',
                activeField === 'num_ky' && 'bg-primary/10',
              )}
            >
              <span className="text-brand-ky shrink-0 text-xs font-bold">금영</span>
              <span className="min-w-0 truncate text-sm font-medium">{num_ky || '-'}</span>
              <NewValueIndicator
                isVisible={isFieldActive('num_ky')}
                value={newValue}
                textSize="text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="report-suggested-value">올바른 정보</Label>
          <Input
            id="report-suggested-value"
            placeholder={
              isNumberMode
                ? '5자리 숫자로 입력해주세요.'
                : '어떤 내용으로 바뀌어야 하는지 적어주세요.'
            }
            value={isNoData ? NO_DATA_LABEL : suggestedValue}
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
