import { getJpopSongsForTranslationDB } from '@/supabase/getDB';
import { updateSongKoTranslationDB } from '@/supabase/updateDB';
import { translateJpnToKo } from '@/utils/translateJpnToKo';

const resultsLog = {
  success: 0,
  failed: 0,
  skipped: 0,
};

// 히라가나, 카타카나, CJK 한자 범위로 일본어 포함 여부 판단
const JAPANESE_REGEX = /[\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/;

function containsJapanese(text: string): boolean {
  return JAPANESE_REGEX.test(text);
}

// 1. J-POP 곡 조회
const songs = await getJpopSongsForTranslationDB();

console.log('J-POP 곡 수:', songs.length);

let processedCount = 0;
for (const song of songs) {
  if (processedCount >= 5000) break;

  console.log('song : ', song);
  // 이미 번역된 곡 스킵
  if (song.title_ko && song.artist_ko) {
    resultsLog.skipped++;
    continue;
  }

  // 일본어가 포함되지 않은 곡 스킵
  // 영어로만 이루어진 경우 번역하지 않음
  if (!containsJapanese(song.title) && !containsJapanese(song.artist)) {
    resultsLog.skipped++;
    continue;
  }

  try {
    const result = await translateJpnToKo(song.title, song.artist);

    if (!result) {
      resultsLog.failed++;
      console.log(`[FAIL] ${song.title} - ${song.artist}: 번역 실패`);
      continue;
    }

    console.log('result : ', result);
    // const success = await updateSongKoTranslationDB(song.id, result.title_ko, result.artist_ko);
    // if (success) {
    //   resultsLog.success++;
    //   console.log(`[OK] ${song.title} → ${result.title_ko} / ${song.artist} → ${result.artist_ko}`);
    // } else {
    //   resultsLog.failed++;
    // }
  } catch (error) {
    resultsLog.failed++;
    console.error(`[ERROR] ${song.title} - ${song.artist}:`, error);
  }

  processedCount++;

  // OpenAI rate limit 대비 딜레이
  await new Promise(resolve => setTimeout(resolve, 200));
}

// 결과 출력
console.log(`
  총 ${songs.length}곡 중:
  - 스킵 (이미 번역됨): ${resultsLog.skipped}곡
  - 성공: ${resultsLog.success}곡
  - 실패: ${resultsLog.failed}곡
`);
