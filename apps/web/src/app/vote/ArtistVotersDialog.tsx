'use client';

import StaticLoading from '@/components/StaticLoading';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useArtistVotersQuery } from '@/queries/artistVoteQuery';

interface ArtistVotersDialogProps {
  month: string;
  artist: string;
  artistKo: string | null;
  onClose: () => void;
}

export default function ArtistVotersDialog({
  month,
  artist,
  artistKo,
  onClose,
}: ArtistVotersDialogProps) {
  const { data: voters, isPending } = useArtistVotersQuery(month, artist, true);

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex flex-col items-start">
            <span>{artist} 투표자</span>
            {!!artistKo && artistKo !== artist && (
              <span className="text-muted-foreground/70 text-xs font-normal">{artistKo}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isPending ? (
          <StaticLoading />
        ) : (
          <ScrollArea className="max-h-[50vh]">
            <div className="flex flex-col">
              {(voters ?? []).map((voter, index) => (
                <div
                  key={`${voter.nickname}-${index}`}
                  className="flex items-center justify-between border-b px-2 py-2 last:border-0"
                >
                  <span>{voter.nickname}</span>
                  <span className="text-muted-foreground text-sm font-medium">{voter.amount}P</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
