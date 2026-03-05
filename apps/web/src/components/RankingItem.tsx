import { ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import MarqueeText from '@/components/MarqueeText';
import ThumbUpModal from '@/components/ThumbUpModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import useAuthStore from '@/stores/useAuthStore';
import { cn } from '@/utils/cn';

interface RankingItemProps {
  id: string;
  rank: number;
  title: string;
  artist: string;
  num_tj: string;
  num_ky: string;
  value: number;
  className?: string;
}

export default function RankingItem({
  id,
  rank,
  title,
  artist,
  num_tj,
  num_ky,
  value,
  className,
}: RankingItemProps) {
  const { isAuthenticated } = useAuthStore();

  const [open, setOpen] = useState(false);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-500 text-white font-bold'; // 금메달 색상
      case 2:
        return 'bg-gray-300 text-white font-bold'; // 은메달 색상
      case 3:
        return 'bg-amber-700 text-white font-bold'; // 동메달 색상
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleClickThumbsUp = () => {
    if (!isAuthenticated) {
      toast.error('로그인하고 곡 추천 기능을 사용해보세요!');
      return;
    }
    setOpen(true);
  };

  return (
    <div className={cn('flex gap-4 border-b py-3 last:border-0', className)}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          getRankStyle(rank),
        )}
      >
        {rank}
      </div>
      <div className="flex w-full justify-between gap-2">
        <div className="w-[100px] shrink-0">
          <MarqueeText className="text-sm font-medium">{title}</MarqueeText>
          <MarqueeText className="text-muted-foreground text-xs">{artist}</MarqueeText>
        </div>

        <div>
          <div className="flex items-center">
            <span className="text-brand-tj mr-1 w-8 text-xs">TJ</span>
            <span className="text-sm font-medium">{num_tj}</span>
          </div>
          <div className="flex items-center">
            <span className="text-brand-ky mr-1 w-8 text-xs">금영</span>
            <span className="text-sm font-medium">{num_ky}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
                <span>{value}</span>
              </div>
            </Button>

            <DialogContent>
              <ThumbUpModal
                songId={id}
                title={title}
                artist={artist}
                thumb={value}
                handleClose={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
