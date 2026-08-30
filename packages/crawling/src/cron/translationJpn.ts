import { artistAlias } from '@repo/constants';

import { getArtistKoMapDB, getJpopCandidateSongsDB } from '@/supabase/getDB';
import { updateSongKoTranslationDB } from '@/supabase/updateDB';
import { translateJpnToKo } from '@/utils/translateJpnToKo';

/**
 * 일본곡의 title_ko / artist_ko 를 채운다. 검색이 두 컬럼을 함께 훑기 때문에
 * ("요네즈 켄시"로 米津玄師가 잡히는 이유) 신규 유입곡에도 계속 돌아야 한다.
 *
 * 대상 선정이 예전과 다르다. 원래는 song_tags.tag_id=101(일본어 태그)로 골랐는데
 * 태그 기능을 걷어내면서 그 조인이 사라졌다. 지금은 DB에서 가나·한자가 섞인
 * 미번역 곡을 후보로 받아 온 뒤, 아래 세 단계로 일본곡만 남긴다.
 *
 *   1) 한글이 있으면 한국곡 — 태그 배치(autoTagSong)가 쓰던 첫 규칙 그대로다.
 *   2) 가나가 있으면 일본곡 — 확정 신호.
 *   3) 가나가 없으면 이미 번역된 아티스트인지 본다. 米津玄師처럼 한자뿐인 이름이
 *      여기서 걸린다. 모르는 아티스트면 건드리지 않는다.
 *
 * 3단계를 넘기지 않는 게 핵심이다. 한자 범위에는 중국어가 함께 들어와서
 * (刘德华·费玉清 같은 이름이 후보의 대부분이다) 일본어 번역 프롬프트에 그대로 넣으면
 * 엉뚱한 한국어 표기가 DB에 박힌다.
 */

const resultsLog = {
  success: 0,
  failed: 0,
  skippedKorean: 0,
  skippedUnknownLang: 0,
  usedAlias: 0,
  usedDbArtist: 0,
};

// 가나만 본다. 중점(・)과 장음(ー)은 한국곡 제목에도 쓰여 범위에서 뺀다.
const KANA_REGEX = /[ぁ-んァ-ヶ]/;
const HANGUL_REGEX = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;

// 한 번 실행에서 처리할 곡 수. OpenAI 호출이 곡당 1회라 상한을 둔다.
// 스케줄 실행에서는 워크플로 입력이 빈 문자열로 들어와 Number('')=0 이 되므로 ??가 아니라 ||를 쓴다.
const LIMIT = Number(process.env.TRANS_JPN_LIMIT) || 10000;

// '1'이면 DB에 쓰지 않고 무엇이 번역될지만 찍는다. 판별 규칙을 손볼 때 쓴다.
const DRY_RUN = process.env.TRANS_JPN_DRY_RUN === '1';

// artistAlias 로부터 artist 원어 → 한국어 대표 표기(별명 배열의 0번째) 맵 생성
const artistAliasMap = new Map<string, string>(
  Object.entries(artistAlias).map(([artist, aliases]) => [artist, aliases[0]]),
);

const songs = await getJpopCandidateSongsDB();

console.log('번역 후보(미번역 + 가나/한자 포함) 곡 수:', songs.length);

// DB 에 이미 번역된 artist → artist_ko 맵.
// 번역 일관성 유지 + 한자뿐인 아티스트의 일본곡 판별 근거로 함께 쓴다.
const dbArtistKoMap = await getArtistKoMapDB();

console.log('이미 번역된 아티스트 수:', dbArtistKoMap.size);

let processedCount = 0;
for (const song of songs) {
  if (processedCount >= LIMIT) break;

  const titleAndArtist = `${song.title} ${song.artist}`;

  // 한글이 섞여 있으면 한국곡으로 본다 (예: 박효신 '戀人(연인)', 그리즐리 '있잖아(あのね.)')
  if (HANGUL_REGEX.test(titleAndArtist)) {
    resultsLog.skippedKorean++;
    continue;
  }

  // 가나도 없고 번역 이력도 없는 아티스트면 일본곡이라는 근거가 없다 — 중국곡일 가능성이 높다
  const knownArtistKo = dbArtistKoMap.get(song.artist);
  if (!KANA_REGEX.test(titleAndArtist) && !knownArtistKo) {
    resultsLog.skippedUnknownLang++;
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
    const finalArtistKo = aliasArtistKo ?? knownArtistKo ?? result.artist_ko;

    const success = DRY_RUN
      ? true
      : await updateSongKoTranslationDB(song.id, result.title_ko, finalArtistKo);
    if (!success) {
      resultsLog.failed++;
      continue;
    }

    let logPrefix: string;
    if (aliasArtistKo) {
      resultsLog.usedAlias++;
      logPrefix = '[ALIAS]';
    } else if (knownArtistKo) {
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
      `${DRY_RUN ? '[DRY]' : ''}${logPrefix} ${song.title} → ${result.title_ko} / ${song.artist} → ${finalArtistKo}`,
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
  후보 ${songs.length}곡 중:
  - 스킵 (한글 포함 — 한국곡): ${resultsLog.skippedKorean}곡
  - 스킵 (가나 없음 + 번역 이력 없는 아티스트): ${resultsLog.skippedUnknownLang}곡
  - 성공 (AI 번역): ${resultsLog.success}곡
  - 성공 (artist_ko alias 적용): ${resultsLog.usedAlias}곡
  - 성공 (artist_ko DB 재사용): ${resultsLog.usedDbArtist}곡
  - 실패: ${resultsLog.failed}곡
`);
