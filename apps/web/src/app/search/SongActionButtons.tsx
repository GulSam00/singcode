import {
  Flag,
  ListPlus,
  ListRestart,
  Megaphone,
  MinusCircle,
  PlusCircle,
  Star,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface SongActionButtonsProps {
  isToSing: boolean;
  isLike: boolean;
  isSave: boolean;

  onToggleToSing: () => void;
  onToggleLike: () => void;
  onClickSave: () => void;
  onClickPromotion: () => void;
  onClickReport: () => void;
}

export default function SongActionButtons({
  isToSing,
  isLike,
  isSave,

  onToggleToSing,
  onToggleLike,
  onClickSave,
  onClickPromotion,
  onClickReport,
}: SongActionButtonsProps) {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <div className="flex w-full space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className={`h-13 flex-1 flex-col items-center justify-center ${isToSing ? 'text-primary bg-primary/10' : ''}`}
          aria-label={isToSing ? '내 노래 목록에서 제거' : '내 노래 목록에 추가'}
          onClick={onToggleToSing}
          data-tour="card-tosing-button"
        >
          {isToSing ? <MinusCircle /> : <PlusCircle />}
          <span className="text-xs">{isToSing ? '부를곡 취소' : '부를곡 추가'}</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`h-13 flex-1 flex-col items-center justify-center ${isLike ? 'text-yellow-500' : ''}`}
          aria-label={isLike ? '즐겨찾기 취소' : '즐겨찾기'}
          onClick={onToggleLike}
          data-tour="card-like-button"
        >
          <Star className={isLike ? 'fill-current' : ''} />
          <span className="text-xs">{isLike ? '즐겨찾기 취소' : '즐겨찾기'}</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`h-13 flex-1 flex-col items-center justify-center ${isSave ? 'text-primary bg-primary/10' : ''}`}
          aria-label={isSave ? '재생목록 수정' : '재생목록에 추가'}
          onClick={onClickSave}
          data-tour="card-save-button"
        >
          {isSave ? <ListRestart className="h-5 w-5" /> : <ListPlus className="h-5 w-5" />}
          <span className="text-xs">{isSave ? '재생목록 수정' : '재생목록 추가'}</span>
        </Button>
      </div>

      <div className="flex w-full space-x-2">
        <Button
          variant="ghost"
          className="h-10 flex-1 justify-start gap-2"
          aria-label="홍보하기"
          onClick={onClickPromotion}
          data-tour="card-promotion-button"
        >
          <Megaphone className="h-4 w-4" />
          <span className="text-xs">홍보하기</span>
        </Button>
        <Button
          variant="ghost"
          className="h-10 flex-1 justify-start gap-2"
          aria-label="수정 요청"
          onClick={onClickReport}
          data-tour="card-report-button"
        >
          <Flag className="h-4 w-4" />
          <span className="text-xs">수정 요청</span>
        </Button>
      </div>
    </div>
  );
}
