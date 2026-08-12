import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { memo, useState } from 'react';
import { toast } from 'sonner';

import MarqueeText from '@/components/MarqueeText';
import ReportSongModal from '@/components/ReportSongModal';
import SongBadges from '@/components/SongBadges';
import SongCommentSection from '@/components/SongCommentSection';
import SongPromotionModal from '@/components/SongPromotionModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import useAuthStore from '@/stores/useAuthStore';
import { SearchSong } from '@/types/song';

import SongActionButtons from './SongActionButtons';

interface SearchResultCardProps {
  song: SearchSong;
  isToSing: boolean;
  isLike: boolean;
  isSave: boolean;
  /** 가이드 투어용 가상 카드. 실제 곡이 아니므로 서버를 호출하는 영역을 끈다. */
  isDemo?: boolean;

  onToggleToSing: (song: SearchSong) => void;
  onToggleLike: (song: SearchSong) => void;
  onClickSave: (song: SearchSong) => void;
}

function SearchResultCard({
  song,
  isToSing,
  isLike,
  isSave,
  isDemo = false,

  onToggleToSing,
  onToggleLike,
  onClickSave,
}: SearchResultCardProps) {
  const { id, title, artist, title_ko, artist_ko, num_tj, num_ky, badges } = song;
  const hasKoTitle = !!title_ko && title_ko !== title;
  const hasKoArtist = !!artist_ko && artist_ko !== artist;
  const displayTitle = hasKoTitle ? title_ko : title;
  const displayArtist = hasKoArtist ? artist_ko : artist;

  const { isAuthenticated } = useAuthStore();

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isPromotionOpen, setIsPromotionOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const withAuth = (message: string, action: () => void) => () => {
    if (!isAuthenticated) {
      toast.error(message);
      return;
    }
    action();
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`클립보드 복사`);
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  const handleClickReport = withAuth('로그인하고 수정 요청에 참여해주세요!', () =>
    setIsReportOpen(true),
  );
  const handleClickPromotion = withAuth('로그인하고 곡 홍보 기능을 사용해보세요!', () =>
    setIsPromotionOpen(true),
  );

  return (
    <Card className="w-full overflow-hidden p-4">
      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-col gap-4">
        {/* 노래 정보 */}
        <div className="flex flex-col gap-3">
          {/* 제목 및 가수 */}
          <div className="flex justify-between">
            <div className="flex w-full flex-col gap-0.5 truncate">
              {/* 같은 곡이 일반/MR/라이브로 나란히 나오므로 무엇이 다른지 알려준다 */}
              <SongBadges badges={badges} className="mb-0.5" />
              <MarqueeText
                className="hover:text-accent cursor-pointer text-base font-medium hover:underline hover:underline-offset-4"
                onClick={() => handleCopy(displayTitle)}
              >
                {displayTitle}
              </MarqueeText>
              {hasKoTitle && (
                <MarqueeText
                  className="text-muted-foreground hover:text-accent cursor-pointer text-xs hover:underline hover:underline-offset-4"
                  onClick={() => handleCopy(title)}
                >
                  {title}
                </MarqueeText>
              )}
              <MarqueeText
                className="text-muted-foreground hover:text-accent mt-0.5 cursor-pointer text-sm hover:underline hover:underline-offset-4"
                onClick={() => handleCopy(displayArtist)}
              >
                {displayArtist}
              </MarqueeText>
              {hasKoArtist && (
                <MarqueeText
                  className="text-muted-foreground/70 hover:text-accent cursor-pointer text-xs hover:underline hover:underline-offset-4"
                  onClick={() => handleCopy(artist)}
                >
                  {artist}
                </MarqueeText>
              )}
            </div>
          </div>

          {/* 노래방 번호 */}
          <div
            className="hover:bg-muted/40 active:bg-muted/60 flex cursor-pointer items-center justify-between rounded-md border-b p-1 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
            data-tour="card-expand-toggle"
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
              <SongActionButtons
                isToSing={isToSing}
                isLike={isLike}
                isSave={isSave}
                onToggleToSing={() => onToggleToSing(song)}
                onToggleLike={() => onToggleLike(song)}
                onClickSave={() => onClickSave(song)}
                onClickPromotion={handleClickPromotion}
                onClickReport={handleClickReport}
              />

              {/* 가상 곡은 실제 id가 없어 댓글을 조회하면 안 된다 */}
              {!isDemo && <SongCommentSection songId={id} isExpanded={isExpanded} />}
            </motion.div>
          )}
        </AnimatePresence>

        <Dialog open={isPromotionOpen} onOpenChange={setIsPromotionOpen}>
          <DialogContent className="h-[600px] max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <SongPromotionModal
              songId={id}
              title={title}
              artist={artist}
              title_ko={title_ko ?? null}
              artist_ko={artist_ko ?? null}
              handleClose={() => setIsPromotionOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogContent>
            <ReportSongModal
              songId={id}
              title={title}
              artist={artist}
              title_ko={title_ko}
              artist_ko={artist_ko}
              num_tj={num_tj}
              num_ky={num_ky}
              handleClose={() => setIsReportOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}

export default memo(SearchResultCard);
