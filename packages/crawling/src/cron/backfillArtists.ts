import { subDays } from 'date-fns';
import fs from 'fs';
import path from 'path';

import { artistAlias } from '@repo/constants';

import { getSongsForArtistBackfillDB } from '@/supabase/getDB';
import { upsertArtistsDB } from '@/supabase/postDB';
import { ArtistUpsert } from '@/types';
import { extractPrimaryArtist, isInvalidArtist } from '@/utils/extractPrimaryArtist';

const LOG_FILE = path.join('src', 'assets', 'artistBackfillLog.txt');

function log(message: string) {
  console.log(message);
  fs.appendFileSync(LOG_FILE, message + '\n', 'utf-8');
}

// artistAlias: { [원어 공식 표기]: [한국어 표기 별칭들] }.
// 공식 표기는 songs.artist 원문과 그대로 일치하고, 별칭은 한국어 검색용 힌트라
// songs.artist 값으로 등장하는 일은 거의 없다 — 그래도 등장하면 공식 표기로 접어준다(방어적 정규화).
// "공식 표기 → 한국어 대표 표기(별칭 0번째)"는 translationJpn.ts와 동일하게 name_ko 1순위로 쓴다.
const aliasToOfficial = new Map<string, string>();
const officialToKo = new Map<string, string>();

for (const [officialName, aliases] of Object.entries(artistAlias)) {
  officialToKo.set(officialName, aliases[0]);
  aliasToOfficial.set(officialName, officialName);
  aliases.forEach(alias => aliasToOfficial.set(alias, officialName));
}

function resolveCanonicalName(rawArtist: string): string {
  // 1) isInvalidArtist를 통과한(쉼표/&/feat/with/x-콜라보 없는) 원문에서 괄호만 제거
  // 2) 그 결과가 artistAlias에 등록된 원어 표기와 일치하면 공식 표기로 접어준다(방어적 정규화)
  const primary = extractPrimaryArtist(rawArtist);
  return aliasToOfficial.get(primary) ?? primary;
}

interface ArtistGroup {
  artistKoCounts: Map<string, number>;
}

// 미설정(최초 백필)이면 전체 곡, 설정하면 그 일수 이내 등록된 곡만(월간 증분 갱신) 대상으로 한다.
const sinceDaysEnv = process.env.ARTIST_BACKFILL_SINCE_DAYS;
const sinceIso = sinceDaysEnv ? subDays(new Date(), Number(sinceDaysEnv)).toISOString() : undefined;

log(`\n===== 아티스트 백필 실행: ${new Date().toISOString()} =====`);
log(
  sinceIso
    ? `최근 ${sinceDaysEnv}일 이내 등록/수정된 곡만 대상으로 백필합니다.`
    : '전체 곡을 대상으로 백필합니다.',
);

const rows = await getSongsForArtistBackfillDB(sinceIso);
log(`대상 곡 수: ${rows.length}`);

const groups = new Map<string, ArtistGroup>();
let invalidCount = 0;

for (const row of rows) {
  if (!row.artist) continue;

  // 쉼표/&·＆/×·・/feat/with, 또는 " X " 콜라보 구분자가 있으면 다른 조건과 무관하게 백필 대상에서 제외한다.
  if (isInvalidArtist(row.artist)) {
    invalidCount++;
    continue;
  }

  const canonicalName = resolveCanonicalName(row.artist);
  const group = groups.get(canonicalName) ?? { artistKoCounts: new Map() };

  if (row.artist_ko) {
    group.artistKoCounts.set(row.artist_ko, (group.artistKoCounts.get(row.artist_ko) ?? 0) + 1);
  }

  groups.set(canonicalName, group);
}

log(`무효 처리(쉼표/&·＆/×·・/feat/with/x-콜라보 포함)로 제외한 곡 수: ${invalidCount}`);
log(`고유 아티스트 수: ${groups.size}`);

const upsertRows: ArtistUpsert[] = [...groups.entries()].map(([name, group]) => {
  // name_ko 우선순위: 1) artistAlias 큐레이션 값  2) DB artist_ko 중 가장 흔한 값
  const aliasKo = officialToKo.get(name);
  const mostCommonArtistKo = [...group.artistKoCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];

  return {
    name,
    name_ko: aliasKo ?? mostCommonArtistKo ?? null,
  };
});

const { upserted, failed } = await upsertArtistsDB(upsertRows);

log(`아티스트 upsert 결과 — 성공: ${upserted}건, 실패: ${failed}건`);
