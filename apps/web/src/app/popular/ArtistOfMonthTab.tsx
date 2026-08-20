'use client';

import { addMonths, format, parseISO, startOfMonth } from 'date-fns';
import { Construction } from 'lucide-react';
import { useState } from 'react';

import StaticLoading from '@/components/StaticLoading';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useArtistRankingsQuery } from '@/queries/artistVoteQuery';
import { cn } from '@/utils/cn';

import ArtistRankingBoard from './ArtistRankingBoard';
import ArtistVoteModal from './ArtistVoteModal';
import ArtistVotersDialog from './ArtistVotersDialog';
import MonthSelector from './MonthSelector';

const MONTH_FORMAT = 'yyyy-MM-dd';
const shiftMonth = (month: string, delta: number) =>
  format(startOfMonth(addMonths(parseISO(month), delta)), MONTH_FORMAT);

export default function ArtistOfMonthTab() {
  const [monthOverride, setMonthOverride] = useState<string | undefined>(undefined);
  const [isVoteOpen, setIsVoteOpen] = useState(false);
  const [votersArtist, setVotersArtist] = useState<string | null>(null);

  const { data, isPending, isPlaceholderData } = useArtistRankingsQuery(monthOverride);

  if (isPending) {
    return <StaticLoading />;
  }

  const availableMonths = data?.availableMonths ?? [];
  const month = data?.month ?? '';
  const items = data?.items ?? [];

  const voteButton = <Button onClick={() => setIsVoteOpen(true)}>투표하기</Button>;
  const voteModal = (
    <Dialog open={isVoteOpen} onOpenChange={setIsVoteOpen}>
      <DialogContent>
        <ArtistVoteModal handleClose={() => setIsVoteOpen(false)} />
      </DialogContent>
    </Dialog>
  );

  if (availableMonths.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex justify-end">{voteButton}</div>
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Construction className="text-muted-foreground h-16 w-16" />
          <p className="text-muted-foreground text-xl">아직 확정된 결과가 없어요</p>
        </div>
        {voteModal}
      </div>
    );
  }

  // availableMonths는 최신순이므로 마지막 원소가 가장 오래된 월이다.
  const oldestMonth = availableMonths.at(-1);
  const canGoPrev = !!oldestMonth && month > oldestMonth;
  const canGoNext = month < availableMonths[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <MonthSelector
        month={month}
        selectableMonths={availableMonths}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={() => setMonthOverride(shiftMonth(month, -1))}
        onNext={() => setMonthOverride(shiftMonth(month, 1))}
        onChange={setMonthOverride}
      />

      <div className="flex justify-end">{voteButton}</div>

      <ScrollArea className="min-h-0 flex-1">
        <div className={cn('transition-opacity', isPlaceholderData && 'opacity-50')}>
          <ArtistRankingBoard items={items} onSelectArtist={setVotersArtist} />
        </div>
      </ScrollArea>

      {voteModal}

      {votersArtist && (
        <ArtistVotersDialog
          month={month}
          artist={votersArtist}
          onClose={() => setVotersArtist(null)}
        />
      )}
    </div>
  );
}
