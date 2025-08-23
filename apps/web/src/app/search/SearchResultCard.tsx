import { Heart, ListPlus, ListRestart, MinusCircle, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SearchSong } from '@/types/song';

interface IProps {
  song: SearchSong;
  onToggleToSing: () => void;
  onToggleLike: () => void;
  onClickSave: () => void;
}

export default function SearchResultCard({
  song,
  onToggleToSing,
  onToggleLike,
  onClickSave,
}: IProps) {
  const { title, artist, num_tj, num_ky, isToSing, isLike, isSave } = song;

  return (
    <Card className="relative overflow-hidden">
      {/* 메인 콘텐츠 영역 */}
      <div className="h-[150px] w-full gap-4 p-3">
        {/* 노래 정보 */}
        <div className="mb-8 flex flex-col">
          {/* 제목 및 가수 */}
          <div className="mb-1">
            <h3 className="truncate text-base font-medium">{title}</h3>
            <p className="text-muted-foreground truncate text-sm">{artist}</p>
          </div>

          {/* 노래방 번호 */}

          <div className="mt-1 flex space-x-4">
            <div className="flex w-[70px] items-center">
              <span className="text-brand-tj mr-1 text-xs">TJ</span>
              <span className="text-sm font-medium">{num_tj}</span>
            </div>
            <div className="flex w-[70px] items-center">
              <span className="text-brand-ky mr-1 text-xs">금영</span>
              <span className="text-sm font-medium">{num_ky}</span>
            </div>
          </div>
        </div>

        {/* 버튼 영역 - 우측 하단에 고정 */}
        <div className="absolute bottom-3 flex w-full space-x-2 pr-6">
          <Button
            variant="ghost"
            size="icon"
            className={`h-13 flex-1 flex-col items-center justify-center ${isToSing ? 'text-primary bg-primary/10' : ''}`}
            aria-label={isToSing ? '내 노래 목록에서 제거' : '내 노래 목록에 추가'}
            onClick={onToggleToSing}
          >
            {isToSing ? <MinusCircle /> : <PlusCircle />}
            <span className="text-xs">{isToSing ? '부를곡 취소' : '부를곡 추가'}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`h-13 flex-1 flex-col items-center justify-center`}
            aria-label={isLike ? '좋아요 취소' : '좋아요'}
            onClick={onToggleLike}
          >
            <Heart className={`${isLike ? 'fill-current text-red-500' : ''}`} />
            <span className="text-xs">{isLike ? '좋아요 취소' : '좋아요'}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`h-13 flex-1 flex-col items-center justify-center ${isSave ? 'text-primary bg-primary/10' : ''}`}
            aria-label={isSave ? '재생목록 수정' : '재생목록에 추가'}
            onClick={onClickSave}
          >
            {isSave ? <ListRestart className="h-5 w-5" /> : <ListPlus className="h-5 w-5" />}
            <span className="text-xs">{isSave ? '재생목록 수정' : '재생목록 추가'}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
