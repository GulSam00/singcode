import { getSongTagSongIdsDB, getSongsAllDB } from '@/supabase/getDB';
import { postSongTagsDB } from '@/supabase/postDB';
import { autoTagSong } from '@/utils/getSongTag';

const resultsLog = {
  success: 0,
  failed: 0,
  skipped: 0,
};

// 1. 전체 곡 조회 + 이미 태그된 곡 ID 로드
const [allSongs, taggedSongIds] = await Promise.all([getSongsAllDB(), getSongTagSongIdsDB()]);

console.log('전체 곡 수:', allSongs.length);
console.log('이미 태그된 곡 수:', taggedSongIds.size);

// 2. 순차 순회 (테스트: 5회만 실행)
let processedCount = 0;
for (const song of allSongs) {
  if (processedCount >= 5000) break;
  if (taggedSongIds.has(song.id)) {
    resultsLog.skipped++;
    continue;
  }

  try {
    const tagIds = await autoTagSong(song.title, song.artist);

    if (tagIds.length === 0) {
      resultsLog.failed++;
      console.log(`[FAIL] ${song.title} - ${song.artist}: 태그 없음`);
      continue;
    }

    const success = await postSongTagsDB(song.id, tagIds);
    if (success) {
      resultsLog.success++;
      console.log(`[OK] ${song.title} - ${song.artist}: [${tagIds.join(', ')}]`);
    } else {
      resultsLog.failed++;
    }
  } catch (error) {
    resultsLog.failed++;
    console.error(`[ERROR] ${song.title} - ${song.artist}:`, error);
  }

  processedCount++;

  // OpenAI rate limit 대비 딜레이
  await new Promise(resolve => setTimeout(resolve, 200));
}

// 3. 결과 출력
console.log(`
  총 ${allSongs.length}곡 중:
  - 스킵 (이미 태그됨): ${resultsLog.skipped}곡
  - 성공: ${resultsLog.success}곡
  - 실패: ${resultsLog.failed}곡
`);
