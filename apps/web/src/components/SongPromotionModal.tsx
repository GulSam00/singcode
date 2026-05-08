'use client';

import { differenceInCalendarDays, format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

import { usePostSongPromotionMutation } from '@/queries/songPromotionQuery';
import { useUserQuery } from '@/queries/userQuery';
import { getTomorrowKSTDate } from '@/utils/kst';

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
  const [isConfirming, setIsConfirming] = useState(false);

  const { data: user } = useUserQuery();
  const { mutate: postPromotion, isPending } = usePostSongPromotionMutation();

  const point = user?.point ?? 0;
  const tomorrowKST = getTomorrowKSTDate();

  const days = range?.from
    ? differenceInCalendarDays(range.to ?? range.from, range.from) + 1
    : 0;

  const cost = days * 50;
  const canAfford = point >= cost;
  const canSubmit = days > 0 && content.trim().length > 0 && canAfford;

  const displayTitle = title_ko && title_ko !== title ? title_ko : title;
  const displayArtist = artist_ko && artist_ko !== artist ? artist_ko : artist;

  const handleProceed = () => {
    if (!canSubmit || !range?.from) return;
    setIsConfirming(true);
  };

  const handleConfirm = () => {
    if (!canSubmit || !range?.from) return;
    const start_date = format(range.from, 'yyyy-MM-dd');
    const end_date = format(range.to ?? range.from, 'yyyy-MM-dd');
    postPromotion(
      {
        song_id: songId,
        content: content.trim(),
        start_date,
        end_date,
      },
      { onSuccess: handleClose },
    );
  };

  if (isConfirming && range?.from) {
    const startStr = format(range.from, 'yyyy-MM-dd');
    const endStr = format(range.to ?? range.from, 'yyyy-MM-dd');

    return (
      <div className="flex flex-col gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>홍보 신청 확인</DialogTitle>
          <DialogDescription>아래 내용으로 홍보를 신청합니다. 신청 후에는 변경할 수 없습니다.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-md border p-3 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-xs">곡</span>
            <span className="font-semibold">{displayTitle}</span>
            <span className="text-muted-foreground">{displayArtist}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-xs">홍보 내용</span>
            <span>{content.trim()}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-xs">홍보 기간</span>
            <span>
              {startStr} ~ {endStr} ({days}일)
            </span>
          </div>
        </div>

        <div className="bg-muted/40 flex flex-col gap-1 rounded-md p-3 text-sm">
          <div className="flex items-center justify-between">
            <span>차감 포인트</span>
            <span className="text-destructive font-bold">-{cost}P</span>
          </div>
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>차감 후 잔여</span>
            <span>{point - cost}P</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            size="lg"
            variant="outline"
            onClick={() => setIsConfirming(false)}
            disabled={isPending}
          >
            돌아가기
          </Button>
          <Button
            className="flex-1 font-bold"
            size="lg"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `확정 (${cost}P)`}
          </Button>
        </div>
      </div>
    );
  }

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
        <label className="text-sm font-medium">홍보 기간 선택</label>
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
            {format(range.from, 'yyyy-MM-dd')} ~ {format(range.to ?? range.from, 'yyyy-MM-dd')} (
            {days}일)
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
        onClick={handleProceed}
        disabled={!canSubmit || isPending}
      >
        {days > 0 ? `홍보 신청 (${cost}P)` : '기간을 선택하세요'}
      </Button>
    </div>
  );
}
