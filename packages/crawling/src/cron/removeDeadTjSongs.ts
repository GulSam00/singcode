import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import {
  deleteKyLogsBySongIdsDB,
  deleteSongTagsBySongIdsDB,
  deleteSongsByIdsDB,
} from '@/supabase/deleteDB';
import { getClient } from '@/supabase/getClient';

dotenv.config();

/**
 * TJ에서 사라진 번호를 가진 곡을 정리한다.
 *
 * 판별 기준은 `badges is null` — 전수 순회(pnpm tj-all-number)와 증분 수집(pnpm tj-badges)이
 * 번호로 조회했을 때 TJ가 결과를 주지 않은 곡이다. 검색 결과에 나와도 반주기에서 재생되지 않는다.
 *
 * 다만 아래는 지우지 않는다.
 *  - chart_rankings에 걸린 곡: 번호 검색에는 없어도 차트에는 오른다. 지우면 차트에 구멍이 생긴다.
 *  - num_ky를 가진 곡: TJ에서는 못 불러도 금영에서는 부를 수 있다.
 *
 * 기본은 미리보기다. 실제 삭제하려면 DEAD_SONGS_APPLY=true 로 실행한다.
 */
const APPLY = process.env.DEAD_SONGS_APPLY === 'true';
const BACKUP_FILE = path.join('src', 'assets', 'deadSongsRemoved.json');

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
const targets = candidates.filter(song => !chartedIds.has(song.id) && !song.num_ky);

console.log(`  제외 - 차트 등재: ${keptCharted.length}곡`);
keptCharted.forEach(s => console.log(`      ${s.num_tj} ${s.title} / ${s.artist}`));
console.log(`  제외 - 금영 번호 보유: ${keptKy.length}곡`);
console.log(`\n🗑️  삭제 대상: ${targets.length}곡`);
targets.slice(0, 5).forEach(s => console.log(`      ${s.num_tj} ${s.title} / ${s.artist}`));

if (!APPLY) {
  console.log('\n🧪 미리보기 모드입니다. 실제로 지우려면 DEAD_SONGS_APPLY=true 로 실행하세요.');
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
