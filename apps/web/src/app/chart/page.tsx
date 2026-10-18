import { ScrollArea } from '@/components/ui/scroll-area';

import PopularPreview from './PopularPreview';
import PreviewSection from './PreviewSection';
import RecentPreview from './RecentPreview';

// 인기곡 미리보기가 "현재 기준 전월" 차트를 쓰므로 빌드 시점에 프리렌더되면 월이 낡는다.
export const dynamic = 'force-dynamic';

export default function ChartPage() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* TJ 공식 최신곡 / 인기곡 미리보기. 전체 보기에서 월·장르 필터를 쓴다. */}
      <h1 className="shrink-0 text-2xl font-bold">노래방 차트</h1>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-6">
          <PreviewSection title="최신곡" href="/chart/recent">
            <RecentPreview />
          </PreviewSection>
          <PreviewSection title="인기곡" href="/chart/popular">
            <PopularPreview />
          </PreviewSection>
        </div>
      </ScrollArea>
    </div>
  );
}
