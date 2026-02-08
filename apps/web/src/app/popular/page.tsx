import { ScrollArea } from '@/components/ui/scroll-area';

import PopularRankingList from './PopularRankingList';

export default function PopularPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">인기 노래</h1>

      {/* 추천 곡 순위 */}
      <ScrollArea className="h-[calc(100vh-20rem)]">
        <PopularRankingList />
      </ScrollArea>
    </div>
  );
}
