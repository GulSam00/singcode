import PopularTabs from './PopularTabs';

// 차트 기본 조회 월을 "현재 기준 전월"로 계산하므로 빌드 시점에 프리렌더되면 값이 낡는다.
// 요청 시점에 렌더해 서버/클라이언트가 같은 월을 계산하도록 한다.
export const dynamic = 'force-dynamic';

export default function PopularPage() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* TJ 공식 차트 기반 인기 순위 / 포인트 투표로 뽑는 이달의 아티스트 */}
      <h1 className="shrink-0 text-2xl font-bold">인기 차트</h1>

      <PopularTabs />
    </div>
  );
}
