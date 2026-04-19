import { artistAlias } from '@repo/constants';

import { getArtistKoMapDB, getJpopSongsForTranslationDB } from '@/supabase/getDB';
import { updateSongKoTranslationDB } from '@/supabase/updateDB';
import { translateJpnToKo } from '@/utils/translateJpnToKo';

const resultsLog = {
  success: 0,
  failed: 0,
  skipped: 0,
  usedAlias: 0,
  usedDbArtist: 0,
};

// 히라가나, 카타카나, CJK 한자 범위로 일본어 포함 여부 판단
const JAPANESE_REGEX = /[\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/;

function containsJapanese(text: string): boolean {
  return JAPANESE_REGEX.test(text);
}

// artistAlias 로부터 artist 원어 → 한국어 대표 표기(별명 배열의 0번째) 맵 생성
const artistAliasMap = new Map<string, string>(
  Object.entries(artistAlias).map(([artist, aliases]) => [artist, aliases[0]]),
);

const songs = await getJpopSongsForTranslationDB();

console.log('J-POP 곡 수:', songs.length);

// DB 에 이미 번역된 artist → artist_ko 맵 (동일 아티스트 번역 일관성 유지 목적)
// DB 는 아티스트당 단일 artist_ko 로 정규화되어 있으며, 번역 성공 시 런타임에도 동기화한다
const dbArtistKoMap = await getArtistKoMapDB();

let processedCount = 0;
for (const song of songs) {
  if (processedCount >= 10000) break;

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

    // artist_ko 우선순위:
    //   1) artistAlias (수동 큐레이션된 고정 값)
    //   2) DB 에 이미 번역된 동일 아티스트의 artist_ko (번역 일관성 유지)
    //   3) AI 번역 결과
    // title_ko 는 AI 번역 결과를 그대로 사용
    const aliasArtistKo = artistAliasMap.get(song.artist);
    const dbArtistKo = dbArtistKoMap.get(song.artist);
    const finalArtistKo = aliasArtistKo ?? dbArtistKo ?? result.artist_ko;

    const success = await updateSongKoTranslationDB(song.id, result.title_ko, finalArtistKo);
    if (!success) {
      resultsLog.failed++;
      continue;
    }

    let logPrefix: string;
    if (aliasArtistKo) {
      resultsLog.usedAlias++;
      logPrefix = '[ALIAS]';
    } else if (dbArtistKo) {
      resultsLog.usedDbArtist++;
      logPrefix = '[DB]';
    } else {
      resultsLog.success++;
      logPrefix = '[OK]';
    }

    // DB 업데이트 성공 시 런타임 맵도 동기화 (first-seen 원칙 — 기존 값 덮어쓰지 않음)
    if (!dbArtistKoMap.has(song.artist)) {
      dbArtistKoMap.set(song.artist, finalArtistKo);
    }

    console.log(
      `${logPrefix} ${song.title} → ${result.title_ko} / ${song.artist} → ${finalArtistKo}`,
    );
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
  - 성공 (AI 번역): ${resultsLog.success}곡
  - 성공 (artist_ko alias 적용): ${resultsLog.usedAlias}곡
  - 성공 (artist_ko DB 재사용): ${resultsLog.usedDbArtist}곡
  - 실패: ${resultsLog.failed}곡
`);
