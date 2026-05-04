'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

import { usePostSongPromotionMutation } from '@/queries/songPromotionQuery';
import { useUserQuery } from '@/queries/userQuery';

import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';

interface SongPromotionModalProps {
  songId: string;
  title: string;
  artist: string;
  title_ko: string | null;
  artist_ko: string | null;
  handleClose: () => void;
}

/** KST 기준 내일 Date 객체 반환 */
function getTomorrowKST(): Date {
  const tomorrow = new Date(Date.now() + 9 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000);
  const [y, m, d] = tomorrow.toISOString().split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Date → YYYY-MM-DD 문자열 (로컬 기준) */
function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function SongPromotionModal({
  songId,
  title,
  artist,
  title_ko,
  artist_ko,
  handleClose,
}: SongPromotionModalProps) {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [content, setContent] = useState('');

  const { data: user } = useUserQuery();
  const { mutate: postPromotion, isPending } = usePostSongPromotionMutation();

  const point = user?.point ?? 0;
  const tomorrowKST = getTomorrowKST();

  const days =
    range?.from && range?.to
      ? Math.round((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : range?.from
        ? 1
        : 0;

  const cost = days * 50;
  const canAfford = point >= cost;
  const canSubmit = days > 0 && content.trim().length > 0 && canAfford;

  const displayTitle = title_ko && title_ko !== title ? title_ko : title;
  const displayArtist = artist_ko && artist_ko !== artist ? artist_ko : artist;

  const handleSubmit = () => {
    if (!canSubmit || !range?.from) return;
    const start_date = toDateString(range.from);
    const end_date = toDateString(range.to ?? range.from);
    postPromotion(
      {
        song_id: songId,
        title,
        artist,
        title_ko,
        artist_ko,
        content: content.trim(),
        start_date,
        end_date,
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <div className="flex flex-col gap-4 sm:max-w-md">
      <DialogHeader>
        <DialogTitle>곡 홍보하기</DialogTitle>
        <DialogDescription>
          하루 50P를 소모해 검색 페이지 전광판에 곡을 홍보하세요.
        </DialogDescription>
      </DialogHeader>

      <div className="text-muted-foreground flex flex-col gap-0.5 rounded-md border p-3 text-sm">
        <span className="text-foreground font-semibold">{displayTitle}</span>
        <span>{displayArtist}</span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">홍보 내용 (최대 50자)</label>
        <Textarea
          placeholder="홍보 내용을 입력하세요"
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={50}
          rows={2}
          className="resize-none text-sm"
        />
        <span className="text-muted-foreground text-right text-xs">{content.length}/50</span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">홍보 기간 선택 (내일부터)</label>
        <div className="flex justify-center">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            disabled={{ before: tomorrowKST }}
            numberOfMonths={1}
          />
        </div>
        {range?.from && (
          <p className="text-muted-foreground text-center text-xs">
            {toDateString(range.from)} ~ {toDateString(range.to ?? range.from)} ({days}일)
          </p>
        )}
      </div>

      <div className="bg-muted/40 flex items-center justify-between rounded-md p-3 text-sm">
        <span>필요 포인트</span>
        <span className={`font-bold ${days > 0 && !canAfford ? 'text-destructive' : ''}`}>
          {days > 0 ? `${cost}P` : '-'} / 보유 {point}P
        </span>
      </div>

      {days > 0 && !canAfford && (
        <p className="text-destructive text-center text-xs">포인트가 부족합니다.</p>
      )}

      <Button
        className="w-full font-bold"
        size="lg"
        onClick={handleSubmit}
        disabled={!canSubmit || isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : days > 0 ? (
          `홍보 신청 (${cost}P)`
        ) : (
          '기간을 선택하세요'
        )}
      </Button>
    </div>
  );
}
