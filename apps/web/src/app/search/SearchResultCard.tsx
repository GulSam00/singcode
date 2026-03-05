import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Heart,
  ListPlus,
  ListRestart,
  MinusCircle,
  PlusCircle,
  ThumbsUp,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import MarqueeText from '@/components/MarqueeText';
import ThumbUpModal from '@/components/ThumbUpModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import useAuthStore from '@/stores/useAuthStore';
import { SearchSong } from '@/types/song';

interface IProps {
  song: SearchSong;
  isToSing: boolean;
  isLike: boolean;
  isSave: boolean;

  onToggleToSing: () => void;
  onToggleLike: () => void;
  onClickSave: () => void;
  onClickArtist: () => void;
}

export default function SearchResultCard({
  song,
  isToSing,
  isLike,
  isSave,

  onToggleToSing,
  onToggleLike,
  onClickSave,
  onClickArtist,
}: IProps) {
  const { id, title, artist, num_tj, num_ky, thumb } = song;

  const { isAuthenticated } = useAuthStore();

  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClickThumbsUp = () => {
    if (!isAuthenticated) {
      toast.error('로그인하고 곡 추천 기능을 사용해보세요!');
      return;
    }
    setOpen(true);
  };

  return (
    <Card className="w-full overflow-hidden p-4">
      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-col gap-4">
        {/* 노래 정보 */}
        <div className="flex flex-col gap-2">
          {/* 제목 및 가수 */}
          <div className="flex justify-between">
            <div className="flex w-[calc(100%-40px)] flex-col truncate">
              <MarqueeText className="text-base font-medium">{title}</MarqueeText>
              <MarqueeText
                className="text-muted-foreground hover:text-accent cursor-pointer text-sm hover:underline hover:underline-offset-4"
                onClick={onClickArtist}
              >
                {artist}
              </MarqueeText>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                aria-label={'추천하기'}
                onClick={handleClickThumbsUp}
              >
                <div className="flex flex-col items-center">
                  <ThumbsUp />
                  <span>{thumb}</span>
                </div>
              </Button>

              <DialogContent>
                <ThumbUpModal
                  songId={id}
                  title={title}
                  artist={artist}
                  thumb={thumb || 0}
                  handleClose={() => setOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* 노래방 번호 */}
          <div
            className="hover:bg-muted/40 active:bg-muted/60 flex cursor-pointer items-center justify-between rounded-md border-b p-1 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex space-x-4">
              <div className="flex w-[70px] items-center">
                <span className="text-brand-tj mr-1 text-xs font-bold">TJ</span>
                <span className="text-sm font-medium">{num_tj}</span>
              </div>
              <div className="flex w-[70px] items-center">
                <span className="text-brand-ky mr-1 text-xs font-bold">금영</span>
                <span className="text-sm font-medium">{num_ky}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              className="h-10 w-10"
              onClick={e => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>
        </div>

        {/* 버튼 영역 - 애니메이션 적용 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="flex w-full space-x-2 pt-2">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
