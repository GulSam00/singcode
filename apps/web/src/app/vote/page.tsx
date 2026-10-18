import ArtistOfMonthTab from './ArtistOfMonthTab';

// 아티스트 투표 월을 "현재 기준"으로 계산하므로 빌드 시점에 프리렌더되면 값이 낡는다.
export const dynamic = 'force-dynamic';

export default function VotePage() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* 포인트 투표로 뽑는 이달의 아티스트 (노래방 인기곡은 /chart/popular로 이동, 옛 /popular는 /vote로 리다이렉트) */}
      <h1 className="shrink-0 text-2xl font-bold">이달의 아티스트</h1>

      <ArtistOfMonthTab />
    </div>
  );
}
