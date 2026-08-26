import axios from 'axios';
import fs from 'fs';
import path from 'path';

import { artistAlias } from '@repo/constants';

import {
  getArtistsByNamesDB,
  getArtistsWithoutImageDB,
  getLatestPodiumArtistNamesDB,
} from '@/supabase/getDB';
import { updateArtistImageDB } from '@/supabase/postDB';
import { ArtistImageTarget } from '@/types';
import { MUSICBRAINZ_INTERVAL_MS, getArtistNameSet } from '@/utils/musicbrainz';
import { normalizeArtistName as normalize } from '@/utils/normalizeArtistName';

/**
 * artists.image_url을 Deezer 공개 API로 채운다.
 *
 * Deezer를 쓰는 이유는 키 발급이 없어서다. 저장하는 건 파일이 아니라 URL이라,
 * 나중에 출처를 바꿔도 이 컬럼만 갈아끼우면 된다.
 *
 * 이름은 MusicBrainz로 한 번 번역해서 넘긴다. 우리 DB는 TJ 표기(한글·원어)를 쓰는데
 * Deezer의 정품 등록은 로마자라("방탄소년단" ↔ "BTS"), 표기 그대로 찾으면 사진이 있는데도
 * 못 찾는다. 실제로 이 단계가 없을 때 방탄소년단·임영웅·볼빨간사춘기·싸이가 전부 빈손이었다.
 *
 * 환경변수
 * - ARTIST_IMAGE_PODIUM: N을 주면 가장 최근 확정 월의 상위 N명만 처리한다(월간 확정 워크플로용)
 * - ARTIST_IMAGE_NAMES: 쉼표로 구분한 이름 목록. 지정하면 그 아티스트만 처리한다
 * - ARTIST_IMAGE_LIMIT: 이번 실행에서 처리할 아티스트 수 (기본 10, NAMES 지정 시 무시)
 * - ARTIST_IMAGE_DRY_RUN: '1'이면 DB에 쓰지 않고 무엇이 잡혔는지만 찍는다
 */

const LOG_FILE = path.join('src', 'assets', 'artistImageBackfillLog.txt');

function log(message: string) {
  console.log(message);
  fs.appendFileSync(LOG_FILE, message + '\n', 'utf-8');
}

const LIMIT = Number(process.env.ARTIST_IMAGE_LIMIT ?? 10);
const PODIUM_TOP = Number(process.env.ARTIST_IMAGE_PODIUM ?? 0);
const NAMES = (process.env.ARTIST_IMAGE_NAMES ?? '')
  .split(',')
  .map(name => name.trim())
  .filter(Boolean);
const DRY_RUN = process.env.ARTIST_IMAGE_DRY_RUN === '1';

// Deezer는 IP당 5초에 50회까지 받는다. 초당 3~4회면 그 절반도 안 쓰니 재시도 로직이 필요 없다.
const REQUEST_INTERVAL_MS = 300;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface DeezerArtist {
  id: number;
  name: string;
  /** 1000x1000. 사진이 없으면 실루엣 기본 이미지 URL이 온다. */
  picture_xl: string;
  picture_big: string;
  nb_fan: number;
}

/**
 * 사진이 없는 아티스트에게 Deezer가 돌려주는 실루엣 URL 판별.
 * 이 경우 이미지 md5 자리가 비어 경로에 슬래시가 두 번 겹친다(.../images/artist//1000x1000-...).
 * 실루엣을 저장하면 액자에 회색 사람 모양이 걸리는데, 그건 이니셜 폴백보다 나쁘다.
 */
const isPlaceholderPicture = (url: string) => !url || url.includes('/images/artist//');

// artistAlias는 키가 고정된 객체 리터럴이라 임의의 이름으로 색인할 수 없다. Map으로 한 번 편다.
const aliasesByOfficialName = new Map<string, string[]>(Object.entries(artistAlias));

/**
 * 이 아티스트로 인정할 이름들. 공식 표기에 artistAlias의 한국어 별칭을 더한다.
 * Deezer가 "아이유" 대신 "IU"를 돌려주는 식의 표기 차이를 여기서 흡수한다.
 */
function buildAcceptedNames(target: ArtistImageTarget): Set<string> {
  const accepted = new Set<string>([normalize(target.name)]);

  if (target.name_ko) accepted.add(normalize(target.name_ko));
  for (const alias of aliasesByOfficialName.get(target.name) ?? []) accepted.add(normalize(alias));

  return accepted;
}

/**
 * MusicBrainz에서 이 아티스트의 다른 표기를 받아 인정 이름 집합에 더하고, 대표 표기를 돌려준다.
 *
 * 실패해도(못 찾음·서버 오류) 원래 표기로는 계속 찾아보므로 여기서 멈추지 않는다 —
 * 이름 사전은 검색 결과를 넓혀 주는 보조 수단이지 없으면 안 되는 재료가 아니다.
 */
async function expandWithMusicbrainz(name: string, accepted: Set<string>) {
  let canonicalName: string | undefined;

  try {
    const nameSet = await getArtistNameSet(name);
    if (nameSet) {
      canonicalName = nameSet.canonicalName;
      nameSet.names.forEach(alias => accepted.add(normalize(alias)));
    }
  } catch (error) {
    log(
      `[MB실패] ${name} — ${error instanceof Error ? error.message : String(error)} (표기 그대로 계속)`,
    );
  }

  await sleep(MUSICBRAINZ_INTERVAL_MS);

  return canonicalName;
}

async function searchDeezer(query: string): Promise<DeezerArtist[]> {
  const { data } = await axios.get<{ data?: DeezerArtist[] }>(
    'https://api.deezer.com/search/artist',
    // 같은 아티스트가 중복 등록돼 있는 경우가 많아 넉넉히 받는다(아래 pickBestMatch 주석 참고).
    { params: { q: query, limit: 10 }, timeout: 10000 },
  );
  return data.data ?? [];
}

/**
 * 이름이 정확히 일치하는 후보들 중 팬 수가 가장 많고 사진이 있는 하나를 고른다.
 *
 * "가장 비슷한 것"을 고르지 않는 게 첫 번째 원칙이다 — 검색 API는 무엇을 넣든 뭔가를
 * 돌려주므로, 느슨하게 받으면 1위 액자에 다른 사람 얼굴이 걸린다. 틀린 사진은 빈 액자보다 나쁘다.
 *
 * 팬 수로 다시 거르는 건 Deezer에 같은 아티스트가 여러 번 등록돼 있기 때문이다.
 * 정품 등록(팬 수십만)과 누군가 업로드하며 생긴 중복 항목(팬 수십)이 같은 이름으로 공존하고,
 * 중복 쪽은 사진이 비어 있는 일이 잦다. 이름만 보고 첫 번째를 집으면 실루엣을 집게 된다.
 */
function pickBestMatch(candidates: DeezerArtist[], accepted: Set<string>) {
  const matched = candidates
    .filter(candidate => accepted.has(normalize(candidate.name)))
    .sort((a, b) => b.nb_fan - a.nb_fan);

  return matched.find(
    candidate => !isPlaceholderPicture(candidate.picture_xl || candidate.picture_big),
  );
}

log(`\n===== 아티스트 이미지 백필(Deezer) 실행: ${new Date().toISOString()} =====`);
/**
 * 처리 대상 결정.
 * - PODIUM: 월간 확정 직후 시상대만. 이미 사진이 있는 아티스트는 걸러지므로, 같은 달에
 *   여러 번 돌아도(이 워크플로는 매일 돈다) 두 번째부터는 대상이 0명이라 외부 요청이 없다.
 * - NAMES: 이름을 콕 집어 시험할 때.
 * - 기본: 사진이 빈 아티스트를 이름순으로 LIMIT명.
 */
async function resolveTargets() {
  if (PODIUM_TOP > 0) {
    const names = await getLatestPodiumArtistNamesDB(PODIUM_TOP);
    log(`최근 확정 월 상위 ${PODIUM_TOP}명: ${names.join(', ') || '없음'}`);
    return names.length > 0 ? getArtistsByNamesDB(names) : [];
  }

  if (NAMES.length > 0) return getArtistsByNamesDB(NAMES);

  return getArtistsWithoutImageDB(LIMIT);
}

log(
  `대상 ${PODIUM_TOP > 0 ? `시상대 ${PODIUM_TOP}명` : NAMES.length > 0 ? `지정 ${NAMES.length}명` : `${LIMIT}명`}${DRY_RUN ? ' (DRY RUN — DB에 쓰지 않음)' : ''}`,
);

const targets = await resolveTargets();
log(`사진이 비어 있는 아티스트: ${targets.length}명`);

let filled = 0;
let noMatch = 0;
let failed = 0;

for (const target of targets) {
  await sleep(REQUEST_INTERVAL_MS);

  try {
    const accepted = buildAcceptedNames(target);

    // 1) 이 아티스트의 다른 표기를 모아 인정 이름과 검색어를 넓힌다.
    const canonicalName = await expandWithMusicbrainz(target.name, accepted);

    // 2) 대표 표기(보통 로마자) → 원어 표기 → 한국어 표기 순으로 찾는다.
    //    대표 표기를 먼저 두는 건 그쪽에 정품 등록이 몰려 있어서다. 중복 등록에서 건지는
    //    사진보다 정품 쪽 사진이 낫다.
    const queries = [
      ...(canonicalName && normalize(canonicalName) !== normalize(target.name)
        ? [canonicalName]
        : []),
      target.name,
      ...(target.name_ko && target.name_ko !== target.name ? [target.name_ko] : []),
    ];

    // 후보를 다 모아 두고 마지막에 한 번에 고른다. 검색어마다 끊어 고르면 먼저 돈 검색어의
    // 중복 등록이 뒤에 나올 정품 등록을 이겨버린다.
    const seenCandidates: DeezerArtist[] = [];

    for (const query of queries) {
      seenCandidates.push(...(await searchDeezer(query)));
      await sleep(REQUEST_INTERVAL_MS);
    }

    const matched = pickBestMatch(seenCandidates, accepted);

    if (!matched) {
      // 놓친 후보 이름을 함께 남긴다. 로마자 표기(예: 米津玄師 → Kenshi Yonezu)로만 사진이
      // 있는 경우가 있어, 이 로그가 곧 artistAlias에 별칭을 더할지 판단하는 근거가 된다.
      const missed =
        [...new Set(seenCandidates.map(candidate => candidate.name))].join(' | ') || '결과 없음';
      noMatch++;
      log(`[없음] ${target.name} — 사진 있는 동일 이름 없음 · 후보: ${missed}`);
      continue;
    }

    const picture = matched.picture_xl || matched.picture_big;

    log(`[찾음] ${target.name} → ${matched.name} (팬 ${matched.nb_fan}) ${picture}`);

    if (DRY_RUN) continue;

    if (await updateArtistImageDB(target.name, picture)) {
      filled++;
    } else {
      failed++;
    }
  } catch (error) {
    failed++;
    log(`[실패] ${target.name} — ${error instanceof Error ? error.message : String(error)}`);
  }
}

log(`결과 — 채움: ${filled}명, 사진 못 찾음: ${noMatch}명, 실패: ${failed}명`);
