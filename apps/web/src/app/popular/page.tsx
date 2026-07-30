import PopularRankingList from './PopularRankingList';

export default function PopularPage() {
  return (
    <div className="flex h-full flex-col gap-4">
      <h1 className="shrink-0 text-2xl font-bold">인기 노래</h1>

      {/* 추천 곡 순위 */}

      <PopularRankingList />
    </div>
  );
}
