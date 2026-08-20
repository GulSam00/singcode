'use client';

import { useState } from 'react';

import SearchAutocomplete from '@/app/search/SearchAutocomplete';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMyArtistVotesQuery, usePutArtistVoteMutation } from '@/queries/artistVoteQuery';
import { useArtistSearchQuery } from '@/queries/artistsQuery';
import { useUserQuery } from '@/queries/userQuery';

import ArtistVoteRow from './ArtistVoteRow';

const STEP = 10;

interface ArtistVoteModalProps {
  handleClose: () => void;
}

export default function ArtistVoteModal({ handleClose }: ArtistVoteModalProps) {
  const [query, setQuery] = useState('');
  const [isFocusAuto, setIsFocusAuto] = useState(false);

  const { data: user } = useUserQuery();
  const point = user?.point ?? 0;
  const isAuthenticated = !!user;

  const { data: myVotes = [] } = useMyArtistVotesQuery(isAuthenticated);
  const { mutate: putVote, isPending } = usePutArtistVoteMutation();

  const { data: searchResults = [] } = useArtistSearchQuery(query);
  const autoCompleteList = searchResults.map(artist => ({
    label: artist.name_ko ? `${artist.name} (${artist.name_ko})` : artist.name,
    value: artist.name,
  }));

  const handleSelectArtist = (artist: string) => {
    setQuery('');
    setIsFocusAuto(false);

    // 검색은 새 아티스트를 추가할 때만 쓴다. 이미 투표한 아티스트는 아래 목록에서 조정한다.
    if (myVotes.some(vote => vote.artist === artist)) return;
    if (point < STEP) return;

    putVote({ artist, amount: STEP });
  };

  const handleAdjust = (artist: string, currentAmount: number, delta: number) => {
    if (delta > 0 && point < delta) return;
    putVote({ artist, amount: Math.max(0, currentAmount + delta) });
  };

  return (
    <div className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>아티스트 투표</DialogTitle>
        <DialogDescription>
          보유 포인트로 이달의 아티스트에게 투표하세요. 월말까지 자유롭게 조정할 수 있어요.
        </DialogDescription>
      </DialogHeader>

      <div className="text-muted-foreground text-sm">
        보유 포인트 <span className="text-foreground font-bold">{point}P</span>
      </div>

      <div className="relative">
        <Input
          placeholder="아티스트 검색"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsFocusAuto(true)}
          onBlur={() => setIsFocusAuto(false)}
        />
        {isFocusAuto && (
          <SearchAutocomplete autoCompleteList={autoCompleteList} onSelect={handleSelectArtist} />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">이번 달 내 투표</span>

        {myVotes.length === 0 ? (
          <p className="text-muted-foreground text-sm">아직 투표한 아티스트가 없어요.</p>
        ) : (
          myVotes.map(vote => (
            <ArtistVoteRow
              key={vote.artist}
              artist={vote.artist}
              amount={vote.amount}
              step={STEP}
              canIncrease={point >= STEP}
              disabled={isPending}
              onAdjust={delta => handleAdjust(vote.artist, vote.amount, delta)}
              onDelete={() => putVote({ artist: vote.artist, amount: 0 })}
            />
          ))
        )}
      </div>

      <Button className="w-full" onClick={handleClose}>
        닫기
      </Button>
    </div>
  );
}
