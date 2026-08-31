'use client';

import { useState } from 'react';

import SearchAutocomplete from '@/app/search/SearchAutocomplete';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMyArtistVotesQuery, useSaveArtistVotesMutation } from '@/queries/artistVoteQuery';
import { useArtistSearchQuery } from '@/queries/artistsQuery';
import { useUserQuery } from '@/queries/userQuery';
import useModalStore from '@/stores/useModalStore';
import { ArtistSearchResult } from '@/types/artist';

import ArtistName from './ArtistName';
import ArtistVoteRow from './ArtistVoteRow';

const STEP = 10;

/**
 * 이번 달(아직 확정되지 않은 달) 화면. 랭킹 대신 내가 이번 달에 투표한 아티스트를 편집한다.
 * 검색으로 고른 아티스트는 0P로 목록에 담기기만 하고, 값을 고친 뒤 엔터(또는 저장 버튼)로
 * 확인 창을 거쳐야 실제 요청이 나간다.
 */
export default function ArtistVotePanel() {
  const [query, setQuery] = useState('');
  const [isFocusAuto, setIsFocusAuto] = useState(false);
  // 저장 전 편집값. 키는 아티스트명, 값은 화면에 보이는 투표 포인트.
  const [draft, setDraft] = useState<Record<string, number>>({});
  // 검색으로 담았지만 아직 저장하지 않아 서버 목록에는 없는 아티스트.
  // 저장 전에도 한국어 표기를 보여줘야 해서 이름만이 아니라 검색 결과를 통째로 들고 있는다.
  const [addedArtists, setAddedArtists] = useState<ArtistSearchResult[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const openMessage = useModalStore(state => state.openMessage);

  const { data: user } = useUserQuery();
  const point = user?.point ?? 0;
  const isAuthenticated = !!user;

  const { data: myVotes = [] } = useMyArtistVotesQuery(isAuthenticated);
  const { mutate: saveVotes, isPending } = useSaveArtistVotesMutation();
  const { data: searchResults = [], isFetching: isSearching } = useArtistSearchQuery(query);

  const autoCompleteList = searchResults.map(artist => ({
    // 한국어 표기가 원어 표기와 같으면(예: 'IVE') 같은 글자를 두 번 보여줄 뿐이라 생략한다.
    label:
      artist.name_ko && artist.name_ko !== artist.name
        ? `${artist.name} (${artist.name_ko})`
        : artist.name,
    value: artist.name,
  }));
  // 자동완성은 결과가 없으면 아무것도 그리지 않아 검색이 동작하는지조차 알기 어렵다.
  // 검색어를 넣었는데 후보가 없으면 그 사실을 그대로 알려준다.
  const isSearchEmpty = query.trim().length > 0 && !isSearching && autoCompleteList.length === 0;

  const savedAmounts = new Map(myVotes.map(vote => [vote.artist, vote.amount]));
  const rows = [
    ...myVotes.map(vote => ({
      artist: vote.artist,
      artistKo: vote.artistKo,
      savedAmount: vote.amount,
    })),
    ...addedArtists
      .filter(artist => !savedAmounts.has(artist.name))
      .map(artist => ({ artist: artist.name, artistKo: artist.name_ko, savedAmount: 0 })),
  ].map(row => ({ ...row, amount: draft[row.artist] ?? row.savedAmount }));

  const changedRows = rows.filter(row => row.amount !== row.savedAmount);
  // 늘린 만큼 차감되고 줄인 만큼 환불되므로, 차액 합계가 이번 저장에서 실제로 쓰는 포인트다.
  const spending = changedRows.reduce((sum, row) => sum + (row.amount - row.savedAmount), 0);
  const remainingPoint = point - spending;
  const isOverPoint = remainingPoint < 0;
  const canSave = !isPending && changedRows.length > 0 && !isOverPoint;

  // 자동완성 항목은 onMouseDown을 막아 입력창 포커스를 유지시킨다. 그래서 아티스트를 담은 뒤
  // 다시 타이핑해도 onFocus가 재발생하지 않아, 여기서 직접 열어주지 않으면 목록이 닫힌 채로 남는다.
  const handleChangeQuery = (value: string) => {
    setQuery(value);
    setIsFocusAuto(true);
  };

  const handleSelectArtist = (name: string) => {
    setQuery('');
    setIsFocusAuto(false);

    if (savedAmounts.has(name) || addedArtists.some(artist => artist.name === name)) return;

    const selected = searchResults.find(artist => artist.name === name);
    setAddedArtists(prev => [...prev, selected ?? { name, name_ko: null }]);
  };

  const handleChange = (artist: string, amount: number) => {
    setDraft(prev => ({ ...prev, [artist]: Math.max(0, amount) }));
  };

  const handleDelete = (artist: string) => {
    // 이미 저장된 투표는 0P로 두고 저장할 때 환불받는다. 담기만 한 아티스트는 목록에서 뺀다.
    if (savedAmounts.has(artist)) {
      handleChange(artist, 0);
      return;
    }
    setAddedArtists(prev => prev.filter(item => item.name !== artist));
    setDraft(prev => {
      const next = { ...prev };
      delete next[artist];
      return next;
    });
  };

  const handleSubmit = () => {
    if (!canSave) return;
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    saveVotes(
      changedRows.map(({ artist, amount }) => ({ artist, amount })),
      {
        onSuccess: () => {
          setDraft({});
          setAddedArtists([]);
        },
        onError: error => {
          openMessage({ title: '투표 실패', message: error.message, variant: 'error' });
        },
      },
    );
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* 비로그인이어도 투표 화면이 어떤 모습인지는 그대로 보여주고 안내 문구만 위에 덮는다.
          inert는 아래 UI의 클릭·포커스·접근성 트리 노출을 한 번에 막아, 로그인 없이 조작되는 일이 없다. */}
      <div className="flex min-h-0 flex-1 flex-col gap-3" inert={!isAuthenticated}>
        <div className="text-muted-foreground shrink-0 text-sm">
          보유 포인트 <span className="text-foreground font-bold">{point}P</span>
          {changedRows.length > 0 && (
            <span className={isOverPoint ? 'text-destructive' : ''}>
              {' '}
              → 저장 후 {remainingPoint}P
            </span>
          )}
        </div>

        <div className="relative shrink-0">
          <Input
            placeholder="아티스트 검색"
            value={query}
            onChange={event => handleChangeQuery(event.target.value)}
            onFocus={() => setIsFocusAuto(true)}
            onBlur={() => setIsFocusAuto(false)}
          />
          {isFocusAuto && (
            <SearchAutocomplete autoCompleteList={autoCompleteList} onSelect={handleSelectArtist} />
          )}
        </div>

        {isSearchEmpty && (
          <p className="text-muted-foreground shrink-0 text-sm">
            &lsquo;{query.trim()}&rsquo; 검색 결과가 없어요.
          </p>
        )}

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-2 pr-2">
            {rows.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                검색해서 투표할 아티스트를 담아보세요.
              </p>
            ) : (
              rows.map(row => (
                <ArtistVoteRow
                  key={row.artist}
                  artist={row.artist}
                  artistKo={row.artistKo}
                  amount={row.amount}
                  savedAmount={row.savedAmount}
                  step={STEP}
                  disabled={isPending}
                  onChange={amount => handleChange(row.artist, amount)}
                  onSubmit={handleSubmit}
                  onDelete={() => handleDelete(row.artist)}
                />
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex shrink-0 flex-col gap-2">
          {isOverPoint && (
            <p className="text-destructive text-sm">
              포인트가 {-remainingPoint}P 부족해요. 투표값을 줄여주세요.
            </p>
          )}
          <Button className="w-full" disabled={!canSave} onClick={handleSubmit}>
            {changedRows.length > 0 ? `변경사항 ${changedRows.length}건 저장` : '변경사항 없음'}
          </Button>
        </div>

        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>투표를 반영할까요?</DialogTitle>
              <DialogDescription>
                저장하면 차액만큼 포인트가 차감되거나 환불돼요. 이번 달에는 언제든 다시 조정할 수
                있어요.
              </DialogDescription>
            </DialogHeader>

            <div className="flex max-h-[40vh] flex-col gap-1 overflow-y-auto">
              {changedRows.map(row => (
                <div key={row.artist} className="flex items-center justify-between gap-2 text-sm">
                  <ArtistName name={row.artist} artistKo={row.artistKo} className="flex-1" />
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {row.savedAmount}P → {row.amount}P
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t pt-3 text-sm font-medium">
              <span>{spending >= 0 ? '차감 포인트' : '환불 포인트'}</span>
              <span className="tabular-nums">{Math.abs(spending)}P</span>
            </div>

            <DialogFooter className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                취소
              </Button>
              <Button onClick={handleConfirm}>확인</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!isAuthenticated && (
        <div className="bg-background/70 absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg backdrop-blur-[2px]">
          <p className="text-foreground text-xl font-medium">로그인하면 참여할 수 있어요</p>
          <p className="text-muted-foreground text-sm">이 달의 아티스트를 직접 뽑아주세요.</p>
        </div>
      )}
    </div>
  );
}
