import TjChartRankingList from './TjChartRankingList';

export default function PopularPage() {
  return (
    <div className="flex h-full flex-col gap-4">
      <h1 className="shrink-0 text-2xl font-bold">인기 노래</h1>

      {/* TJ 공식 차트 기반 인기 순위 */}

      <TjChartRankingList />
    </div>
  );
}
