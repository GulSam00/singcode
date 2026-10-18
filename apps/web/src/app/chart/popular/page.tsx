import ChartPageHeader from '../ChartPageHeader';

import ChartRankingList from './ChartRankingList';

// 차트 기본 조회 월을 "현재 기준 전월"로 계산하므로 빌드 시점에 프리렌더되면 값이 낡는다.
// 요청 시점에 렌더해 서버/클라이언트가 같은 월을 계산하도록 한다.
export const dynamic = 'force-dynamic';

export default function ChartPopularPage() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <ChartPageHeader title="인기곡" />
      <ChartRankingList />
    </div>
  );
}
