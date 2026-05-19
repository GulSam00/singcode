'use client';

import { differenceInCalendarDays } from 'date-fns';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import StaticLoading from '@/components/StaticLoading';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDeleteUserPromotionMutation, useUserPromotionsQuery } from '@/queries/userQuery';
import useAuthStore from '@/stores/useAuthStore';
import { SongPromotion } from '@/types/promotion';
import { getTodayKST } from '@/utils/kst';

function PromotionItem({
  promotion,
  onRequestDelete,
  isDeleting,
}: {
  promotion: SongPromotion;
  onRequestDelete: (promotion: SongPromotion) => void;
  isDeleting: boolean;
}) {
  const todayKST = getTodayKST();
  const canCancel = promotion.start_date > todayKST;
  const { title, artist, title_ko, artist_ko } = promotion;
  const hasKoTitle = title_ko && title_ko !== title;
  const hasKoArtist = artist_ko && artist_ko !== artist;

  const statusLabel = (() => {
    if (promotion.end_date < todayKST)
      return {
        text: '종료',
        className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
      };
    if (promotion.start_date <= todayKST)
      return {
        text: '진행중',
        className:
          'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
      };
    return {
      text: '예정',
      className:
        'bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    };
  })();

  return (
    <div className="border-border border-b py-3 last:border-0">
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusLabel.className}`}>
          {statusLabel.text}
        </span>
        <span className="text-muted-foreground ml-auto text-xs">
          {promotion.start_date} ~ {promotion.end_date}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-0.5">
            <p className="truncate text-base font-medium">{title}</p>
            {hasKoTitle && <p className="text-muted-foreground truncate text-xs">{title_ko}</p>}
            <p className="text-muted-foreground truncate text-sm">{artist}</p>
            {hasKoArtist && (
              <p className="text-muted-foreground/70 truncate text-xs">{artist_ko}</p>
            )}
          </div>
          <p className="bg-muted/50 text-foreground mt-2 rounded-md px-3 py-2 text-sm leading-relaxed whitespace-pre-line">
            {promotion.content}
          </p>
        </div>
        {canCancel ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={() => onRequestDelete(promotion)}
            disabled={isDeleting}
            aria-label="홍보 취소"
          >
            <Trash2 className="h-6 w-6" />
          </Button>
        ) : (
          <div className="h-11 w-11 shrink-0" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

export default function MyPromotionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading } = useUserPromotionsQuery(isAuthenticated);
  const { mutate: deletePromotion, isPending } = useDeleteUserPromotionMutation();
  const [confirmTarget, setConfirmTarget] = useState<SongPromotion | null>(null);

  const promotions = data ?? [];

  const refundPoint = confirmTarget
    ? (differenceInCalendarDays(
        new Date(confirmTarget.end_date),
        new Date(confirmTarget.start_date),
      ) +
        1) *
      50
    : 0;

  const handleConfirmDelete = () => {
    if (!confirmTarget) return;
    deletePromotion(confirmTarget.id, {
      onSuccess: () => setConfirmTarget(null),
    });
  };

  return (
    <div className="bg-background h-full">
      {isLoading && <StaticLoading />}

      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">홍보 신청 관리</h1>
      </div>

      <div className="flex h-[48px] items-center p-2">
        <p className="text-muted-foreground text-sm">총 {promotions.length}건</p>
      </div>

      <Separator className="mb-4" />

      <ScrollArea className="h-[calc(100vh-20rem)]">
        {promotions.length === 0 && !isLoading ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            <p className="mb-2">신청한 홍보 내역이 없습니다.</p>
            <p>곡 검색 결과에서 홍보를 신청할 수 있어요.</p>
          </div>
        ) : (
          promotions.map(promotion => (
            <PromotionItem
              key={promotion.id}
              promotion={promotion}
              onRequestDelete={setConfirmTarget}
              isDeleting={isPending}
            />
          ))
        )}
      </ScrollArea>

      <Dialog
        open={confirmTarget !== null}
        onOpenChange={open => {
          if (!open && !isPending) setConfirmTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>예정된 홍보를 취소할까요?</DialogTitle>
            <DialogDescription>취소 후에는 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>

          {confirmTarget && (
            <div className="space-y-2 py-2 text-sm">
              <p className="font-medium">
                {confirmTarget.title_ko ?? confirmTarget.title}
                <span className="text-muted-foreground font-normal">
                  {' · '}
                  {confirmTarget.artist_ko ?? confirmTarget.artist}
                </span>
              </p>
              <p className="text-muted-foreground">
                {confirmTarget.start_date} ~ {confirmTarget.end_date}
              </p>
              <p>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {refundPoint.toLocaleString()}P
                </span>
                <span className="text-muted-foreground">가 환불됩니다.</span>
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTarget(null)} disabled={isPending}>
              닫기
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isPending}>
              홍보 취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
