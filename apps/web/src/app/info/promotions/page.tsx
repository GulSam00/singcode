'use client';

import { ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import StaticLoading from '@/components/StaticLoading';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDeleteUserPromotionMutation, useUserPromotionsQuery } from '@/queries/userQuery';
import useAuthStore from '@/stores/useAuthStore';
import { SongPromotion } from '@/types/promotion';
import { getTodayKST } from '@/utils/kst';

function PromotionItem({
  promotion,
  onDelete,
  isDeleting,
}: {
  promotion: SongPromotion;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const todayKST = getTodayKST();
  const canCancel = promotion.start_date > todayKST;
  const displayTitle = promotion.title_ko ?? promotion.title;
  const displayArtist = promotion.artist_ko ?? promotion.artist;

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
      <div className="mb-1 flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusLabel.className}`}>
          {statusLabel.text}
        </span>
        <span className="text-muted-foreground ml-auto text-xs">
          {promotion.start_date} ~ {promotion.end_date}
        </span>
        {canCancel && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onDelete(promotion.id)}
            disabled={isDeleting}
            aria-label="홍보 취소"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <p className="text-sm font-medium">
        {displayTitle}
        <span className="text-muted-foreground font-normal"> · {displayArtist}</span>
      </p>
      <p className="text-muted-foreground mt-0.5 text-sm">{promotion.content}</p>
    </div>
  );
}

export default function MyPromotionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading } = useUserPromotionsQuery(isAuthenticated);
  const { mutate: deletePromotion, isPending } = useDeleteUserPromotionMutation();

  const promotions = data ?? [];

  return (
    <div className="bg-background h-full">
      {isLoading && <StaticLoading />}

      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">내 홍보 이력</h1>
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
              onDelete={deletePromotion}
              isDeleting={isPending}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
