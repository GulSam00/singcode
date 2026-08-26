'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArtistWin } from '@/types/artistVote';

/** 'YYYY-MM-DD' → 사람이 읽는 표기 */
export const toFullLabel = (month: string) =>
  `${month.slice(0, 4)}년 ${Number(month.slice(5, 7))}월`;

interface WinDetailDialogProps {
  artist: string;
  /** 아티스트의 전체 우승 이력(오래된 순). 몇 회차 우승인지 세는 데 쓴다. */
  wins: ArtistWin[];
  /** 열려 있는 우승 기록. null이면 닫힌 상태다. */
  selected: ArtistWin | null;
  onClose: () => void;
}

/**
 * 우승 한 번의 상세. 카드 위 별(WinStars)을 누르면 열린다.
 *
 * 우승 표식과 분리해 둔 이유는, 표식의 생김새(별·트로피·뱃지 무엇이든)와 "우승 하나를
 * 눌렀을 때 보여줄 내용"이 서로 다른 관심사이기 때문이다. 표식을 바꿔도 이 파일은 그대로다.
 */
export default function WinDetailDialog({ artist, wins, selected, onClose }: WinDetailDialogProps) {
  return (
    <Dialog open={!!selected} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-xs">
        {selected && (
          <>
            <DialogHeader>
              <DialogTitle>{toFullLabel(selected.month)} 이달의 아티스트</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">아티스트</span>
                <span className="font-bold">{artist}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">그달 득표</span>
                <span className="font-bold tabular-nums">{selected.totalVotes}P</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">통산</span>
                <span className="font-bold tabular-nums">
                  {wins.findIndex(win => win.month === selected.month) + 1}회차 우승
                </span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
