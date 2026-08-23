import fs from 'fs';
import path from 'path';

import { getPrevMonthFirstDayKST, rankTopArtists } from '@repo/constants';

import { getArtistVotesByMonthDB } from '@/supabase/getDB';
import { MonthlyRankingInsert, replaceMonthlyRankingsDB } from '@/supabase/postDB';

/**
 * 이달의 아티스트 월간 확정.
 *
 * 원래는 웹앱의 API 라우트(`/api/artist-vote/finalize`)였다. 그 구조에서는 확정 트리거가
 * 인증 없는 공개 URL이라 공유 시크릿으로 잠가야 했고, 순위를 지우고 다시 쓰는 작업이
 * 외부에서 언제든 호출될 수 있었다. 여기로 옮기면서 그 문(門) 자체가 없어졌다 —
 * 이제 확정은 이 워크플로 안에서만 일어나고, 시크릿도 필요 없다.
 *
 * "지금이 이번 달"이라는 전제로 지난달을 계산해 매번 같은 달을 덮어쓰므로,
 * 하루에 여러 번 돌아도 결과가 같다(idempotent). 그래서 워크플로를 매일 돌려
 * cron 지연으로 1일 실행을 놓치는 상황에 대비할 수 있다.
 */

const LOG_FILE = path.join('src', 'assets', 'artistFinalizeLog.txt');

function log(message: string) {
  console.log(message);
  fs.appendFileSync(LOG_FILE, message + '\n', 'utf-8');
}

const targetMonth = getPrevMonthFirstDayKST();

log(`\n===== 이달의 아티스트 확정 실행: ${new Date().toISOString()} =====`);
log(`대상 월: ${targetMonth}`);

const votes = await getArtistVotesByMonthDB(targetMonth);
log(`투표 수: ${votes.length}건`);

if (votes.length === 0) {
  // 투표가 없으면 아무것도 하지 않는다. 여기서 기존 순위를 지우면, 투표 조회가 일시적으로
  // 비어 돌아온 날 이미 확정된 결과까지 날아간다.
  log('투표가 없어 종료합니다 (기존 순위는 그대로 둔다).');
} else {
  const ranked = rankTopArtists(votes);

  const rows: MonthlyRankingInsert[] = ranked.map((entry, index) => ({
    vote_month: targetMonth,
    rank: index + 1,
    artist: entry.artist,
    total_votes: entry.total,
    top_voter_user_id: entry.topVoterUserId,
    top_voter_amount: entry.topVoterAmount,
  }));

  const saved = await replaceMonthlyRankingsDB(targetMonth, rows);

  log(`확정 완료 — ${saved}명 저장`);
  log(
    `시상대: ${rows
      .slice(0, 3)
      .map(row => `${row.rank}위 ${row.artist}(${row.total_votes}P)`)
      .join(' · ')}`,
  );
}
