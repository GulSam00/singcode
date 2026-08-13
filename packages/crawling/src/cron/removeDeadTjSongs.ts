import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import {
  deleteKyLogsBySongIdsDB,
  deleteSongTagsBySongIdsDB,
  deleteSongsByIdsDB,
} from '@/supabase/deleteDB';
import { getClient } from '@/supabase/getClient';
import { updateSongBadgesDB } from '@/supabase/updateDB';
import { fetchBadgeRow } from '@/utils/tjBadge';

dotenv.config();

/**
 * TJ에서 사라진 번호를 가진 곡을 정리한다.
 *
 * 후보는 `badges is null`로 추리되, **그것만으로 지우지 않는다.**
 * crawlRecentTJ가 넣는 신곡도 badges가 null이라 멀쩡한 곡이 후보에 섞이기 때문에,
 * 삭제 직전에 TJ로 다시 조회해서 정말 없는 번호만 지운다.
 * 살아 있는 곡은 오히려 뱃지를 채워주고, 조회에 실패한 곡은 건드리지 않는다.
 *
 * 아래는 재확인 전에 아예 제외한다.
 *  - chart_rankings에 걸린 곡: 번호 검색에는 없어도 차트에는 오른다. 지우면 차트에 구멍이 생긴다.
 *  - num_ky를 가진 곡: TJ에서는 못 불러도 금영에서는 부를 수 있다.
 *
 * 기본은 미리보기다. 실제 삭제하려면 DEAD_SONGS_APPLY=true 로 실행한다.
 */
const APPLY = process.env.DEAD_SONGS_APPLY === 'true';
// 실행마다 다른 파일에 쓴다. 삭제 도중 실패해 재실행할 때 앞선 백업을 덮어쓰면
// 이미 지워진 참조 테이블(song_tags 등)의 기록이 사라진다.
const BACKUP_FILE = path.join(
  'src',
  'assets',
  `deadSongsRemoved-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '')}.json`,
);
const VERIFY_CONCURRENCY = 5;

const supabase = getClient();

const { data: candidates, error } = await supabase
  .from('songs')
  .select('id, title, artist, num_tj, num_ky, title_ko, artist_ko, release, created_at')
  .is('badges', null)
  .limit(100000);

if (error) throw error;
console.log(`🔍 badges is null: ${candidates.length}곡`);

// 제외 ①: 차트에 오른 곡
const { data: rankings, error: rankingError } = await supabase
  .from('chart_rankings')
  .select('song_id')
  .limit(200000);

if (rankingError) throw rankingError;
const chartedIds = new Set(rankings.map(row => row.song_id as string));

const keptCharted = candidates.filter(song => chartedIds.has(song.id));
const keptKy = candidates.filter(song => !chartedIds.has(song.id) && song.num_ky);
const toVerify = candidates.filter(song => !chartedIds.has(song.id) && !song.num_ky);

console.log(`  제외 - 차트 등재: ${keptCharted.length}곡`);
keptCharted.forEach(s => console.log(`      ${s.num_tj} ${s.title} / ${s.artist}`));
console.log(`  제외 - 금영 번호 보유: ${keptKy.length}곡`);

// badges가 null이라는 사실만으로 지우면 안 된다.
// crawlRecentTJ가 넣은 신곡도 badges가 null이라 멀쩡한 곡이 삭제 대상이 된다.
// 삭제 직전에 TJ로 다시 조회해서, 정말 없는 번호만 지우고 살아 있는 곡은 뱃지를 채워준다.
console.log(`\n🔎 ${toVerify.length}곡을 TJ에서 재확인합니다...`);

const targets: typeof toVerify = [];
const revived: { id: string; badges: string[] }[] = [];
const skipped: string[] = [];
let verifyCursor = 0;

const verifyWorker = async () => {
  while (verifyCursor < toVerify.length) {
    const song = toVerify[verifyCursor++];
    const result = await fetchBadgeRow(song.num_tj as string);

    if (result.status === 'ok') {
      // TJ에 살아 있다 → 삭제 대상이 아니라 뱃지 누락이었던 것
      revived.push({ id: song.id as string, badges: result.row.badges });
    } else if (result.status === 'fetch_failed') {
      // 일시적 실패를 "사라진 곡"으로 오인하지 않는다
      skipped.push(`${song.num_tj} ${song.title} / ${song.artist} (${result.message})`);
    } else {
      targets.push(song);
    }
  }
};

await Promise.all(Array.from({ length: VERIFY_CONCURRENCY }, verifyWorker));

console.log(`  살아있음 → 뱃지 채움: ${revived.length}곡`);
console.log(`  조회 실패 → 이번엔 건너뜀: ${skipped.length}곡`);
skipped.slice(0, 5).forEach(s => console.log(`      ${s}`));
console.log(`\n🗑️  삭제 대상: ${targets.length}곡`);
targets.slice(0, 5).forEach(s => console.log(`      ${s.num_tj} ${s.title} / ${s.artist}`));

if (!APPLY) {
  console.log('\n🧪 미리보기 모드입니다. 실제로 지우려면 DEAD_SONGS_APPLY=true 로 실행하세요.');
  process.exit(0);
}

// 살아 있던 곡은 뱃지만 채워주고 삭제 대상에서 빠진다.
if (revived.length > 0) {
  const { updated } = await updateSongBadgesDB(revived);
  console.log(`🏷️  살아있는 곡 ${updated}건 뱃지 채움`);
}

if (targets.length === 0) {
  console.log('\n✅ 삭제할 곡이 없습니다.');
  process.exit(0);
}

const ids = targets.map(song => song.id as string);

// 삭제 전 백업. 되돌릴 일이 생기면 이 파일로 복구한다.
// in() 필터는 쿼리스트링에 실리므로 id를 100개씩 나눠 모은다.
const tagRows: { song_id: string; tag_id: number }[] = [];
for (let i = 0; i < ids.length; i += 100) {
  const { data } = await supabase
    .from('song_tags')
    .select('song_id, tag_id')
    .in('song_id', ids.slice(i, i + 100));
  if (data) tagRows.push(...(data as { song_id: string; tag_id: number }[]));
}

fs.writeFileSync(BACKUP_FILE, JSON.stringify({ songs: targets, songTags: tagRows }, null, 1));
console.log(`💾 백업 저장: ${BACKUP_FILE} (곡 ${targets.length} / 태그 ${tagRows.length})`);

// songs를 참조하는 테이블을 먼저 비운다.
const tagResult = await deleteSongTagsBySongIdsDB(ids);
console.log(
  `🏷️  song_tags 삭제: ${tagResult.deleted}건${tagResult.failed ? `, 실패 ${tagResult.failed}` : ''}`,
);

const kyResult = await deleteKyLogsBySongIdsDB(ids);
console.log(
  `🧾 invalid_ky_songs ${kyResult.invalid.deleted}건 / verify_ky_songs ${kyResult.verified.deleted}건 삭제`,
);

const songResult = await deleteSongsByIdsDB(ids);
console.log(
  `🎵 songs 삭제: ${songResult.deleted}건${songResult.failed ? `, 실패 ${songResult.failed}` : ''}`,
);

const { count } = await supabase.from('songs').select('*', { count: 'exact', head: true });
console.log(`\n✅ 완료. songs 총 ${count}건`);
