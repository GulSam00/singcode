import { Heart, MinusCircle, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Method } from '@/types/common';
import { SearchSong } from '@/types/song';

interface IProps {
  song: SearchSong;
  onToggleToSing: (songId: string, method: Method) => void;
  onToggleLike: (songId: string, method: Method) => void;
}

// 검색 결과 카드 컴포넌트
export default function SearchResultCard({ song, onToggleToSing, onToggleLike }: IProps) {
  const { id, title, artist, num_tj, num_ky, isToSing, isLiked } = song;

  return (
    <Card className="relative overflow-hidden">
      {/* 메인 콘텐츠 영역 */}
      <div className="p-3">
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
        <div className="absolute right-3 bottom-3 flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isToSing ? 'text-primary bg-primary/10' : ''}`}
            aria-label={isToSing ? '내 노래 목록에서 제거' : '내 노래 목록에 추가'}
            onClick={() => onToggleToSing(id, isToSing ? 'DELETE' : 'POST')}
          >
            {isToSing ? (
              <div className="relative">
                <MinusCircle className="h-4 w-4" />
              </div>
            ) : (
              <div className="relative">
                <PlusCircle className="h-4 w-4" />
              </div>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isLiked ? 'text-red-500' : ''}`}
            aria-label={isLiked ? '좋아요 취소' : '좋아요'}
            onClick={() => onToggleLike(id, isLiked ? 'DELETE' : 'POST')}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
