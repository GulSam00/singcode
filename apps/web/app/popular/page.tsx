import RankingList from './RankingList';

// 샘플 데이터
const WEEKLY_HOT_SONGS = [
  { rank: 1, title: 'Love Lee', artist: 'AKMU', num_tj: '97531', num_ky: '84612' },
  { rank: 2, title: 'Perfect Night', artist: '르세라핌', num_tj: '97485', num_ky: '84599' },
  { rank: 3, title: 'Drama', artist: 'aespa', num_tj: '97462', num_ky: '84587' },
  { rank: 4, title: 'Smoke', artist: '다이나믹 듀오', num_tj: '97421', num_ky: '84563' },
  { rank: 5, title: 'Seven (feat. Latto)', artist: '정국', num_tj: '97380', num_ky: '84542' },
  { rank: 6, title: 'Super Shy', artist: 'NewJeans', num_tj: '97325', num_ky: '84521' },
  { rank: 7, title: '헤어지자 말해요', artist: '박재정', num_tj: '97289', num_ky: '84503' },
  { rank: 8, title: 'ETA', artist: 'NewJeans', num_tj: '97245', num_ky: '84487' },
  { rank: 9, title: 'Hype Boy', artist: 'NewJeans', num_tj: '97201', num_ky: '84462' },
  { rank: 10, title: '사랑은 늘 도망가', artist: '임영웅', num_tj: '97156', num_ky: '84441' },
];

const MONTHLY_HOT_SONGS = [
  { rank: 1, title: '사랑은 늘 도망가', artist: '임영웅', num_tj: '97156', num_ky: '84441' },
  { rank: 2, title: '모든 날, 모든 순간', artist: '폴킴', num_tj: '96842', num_ky: '84321' },
  { rank: 3, title: '다시 만날 수 있을까', artist: '임영웅', num_tj: '96789', num_ky: '84298' },
  { rank: 4, title: "That's Hilarious", artist: 'Charlie Puth', num_tj: '96745', num_ky: '84276' },
  { rank: 5, title: 'LOVE DIVE', artist: 'IVE', num_tj: '96701', num_ky: '84254' },
  { rank: 6, title: '취중고백', artist: '김민석', num_tj: '96654', num_ky: '84231' },
  {
    rank: 7,
    title: 'That That',
    artist: '싸이 (Prod. & Feat. SUGA of BTS)',
    num_tj: '96612',
    num_ky: '84209',
  },
  { rank: 8, title: 'TOMBOY', artist: '(여자)아이들', num_tj: '96578', num_ky: '84187' },
  { rank: 9, title: '사랑인가 봐', artist: '멜로망스', num_tj: '96534', num_ky: '84165' },
  {
    rank: 10,
    title: 'GANADARA',
    artist: '박재범 (Feat. 아이유)',
    num_tj: '96498',
    num_ky: '84143',
  },
];

const TROT_HOT_SONGS = [
  { rank: 1, title: '이제 나만 믿어요', artist: '임영웅', num_tj: '96321', num_ky: '84098' },
  { rank: 2, title: '별빛 같은 나의 사랑아', artist: '임영웅', num_tj: '96287', num_ky: '84076' },
  { rank: 3, title: '보금자리', artist: '임영웅', num_tj: '96254', num_ky: '84054' },
  { rank: 4, title: '사랑은 늘 도망가', artist: '임영웅', num_tj: '97156', num_ky: '84441' },
  { rank: 5, title: '찐이야', artist: '영탁', num_tj: '96187', num_ky: '84032' },
  { rank: 6, title: '다시 만날 수 있을까', artist: '임영웅', num_tj: '96789', num_ky: '84298' },
  { rank: 7, title: '막걸리 한잔', artist: '임영웅', num_tj: '96121', num_ky: '84010' },
  { rank: 8, title: '당신이 좋은 이유', artist: '설운도', num_tj: '96087', num_ky: '83988' },
  { rank: 9, title: '진또배기', artist: '홍진영', num_tj: '96054', num_ky: '83966' },
  { rank: 10, title: '찐이야', artist: '홍진영', num_tj: '96021', num_ky: '83944' },
];

export default function PopularPage() {
  return (
    <div className="bg-background h-full px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">인기 노래</h1>

      <div className="space-y-8">
        <RankingList title="주간 인기곡" items={WEEKLY_HOT_SONGS} />
        <RankingList title="월간 인기곡" items={MONTHLY_HOT_SONGS} />
        <RankingList title="트로트 인기곡" items={TROT_HOT_SONGS} />
      </div>
    </div>
  );
}
