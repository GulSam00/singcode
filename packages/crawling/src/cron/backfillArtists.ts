import { subDays } from 'date-fns';

import { artistAlias } from '@repo/constants';

import { getSongsForArtistBackfillDB } from '@/supabase/getDB';
import { upsertArtistsDB } from '@/supabase/postDB';
import { ArtistCountryCode, ArtistUpsert, LanguageTagId } from '@/types';

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
  return aliasToOfficial.get(rawArtist) ?? rawArtist;
}

// song_tags 언어 태그 중 가장 많이 등장한 태그로 국가를 추정한다.
// 102(팝송/서구권)는 US로, 103(글로벌)이거나 태그가 전혀 없으면 null로 둔다.
function pickCountryCode(tagCounts: Map<number, number>): ArtistCountryCode | null {
  let bestTag: number | null = null;
  let bestCount = 0;

  for (const [tagId, count] of tagCounts) {
    if (count > bestCount) {
      bestTag = tagId;
      bestCount = count;
    }
  }

  switch (bestTag) {
    case LanguageTagId.Korean:
      return 'KR';
    case LanguageTagId.Japanese:
      return 'JP';
    case LanguageTagId.Pop:
      return 'US';
    default:
      return null;
  }
}

interface ArtistGroup {
  tagCounts: Map<number, number>;
  artistKoCounts: Map<string, number>;
}

// 미설정(최초 백필)이면 전체 곡, 설정하면 그 일수 이내 등록된 곡만(월간 증분 갱신) 대상으로 한다.
const sinceDaysEnv = process.env.ARTIST_BACKFILL_SINCE_DAYS;
const sinceIso = sinceDaysEnv ? subDays(new Date(), Number(sinceDaysEnv)).toISOString() : undefined;

console.log(
  sinceIso
    ? `최근 ${sinceDaysEnv}일 이내 등록된 곡만 대상으로 백필합니다.`
    : '전체 곡을 대상으로 백필합니다.',
);

const rows = await getSongsForArtistBackfillDB(sinceIso);
console.log('대상 곡 수:', rows.length);

const groups = new Map<string, ArtistGroup>();

for (const row of rows) {
  if (!row.artist) continue;

  const canonicalName = resolveCanonicalName(row.artist);
  const group = groups.get(canonicalName) ?? { tagCounts: new Map(), artistKoCounts: new Map() };

  for (const { tag_id } of row.song_tags ?? []) {
    group.tagCounts.set(tag_id, (group.tagCounts.get(tag_id) ?? 0) + 1);
  }

  if (row.artist_ko) {
    group.artistKoCounts.set(row.artist_ko, (group.artistKoCounts.get(row.artist_ko) ?? 0) + 1);
  }

  groups.set(canonicalName, group);
}

console.log('고유 아티스트 수:', groups.size);

const upsertRows: ArtistUpsert[] = [...groups.entries()].map(([name, group]) => {
  // name_ko 우선순위: 1) artistAlias 큐레이션 값  2) DB artist_ko 중 가장 흔한 값
  const aliasKo = officialToKo.get(name);
  const mostCommonArtistKo = [...group.artistKoCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];

  return {
    name,
    name_ko: aliasKo ?? mostCommonArtistKo ?? null,
    country_code: pickCountryCode(group.tagCounts),
  };
});

const { upserted, failed } = await upsertArtistsDB(upsertRows);

console.log(`
  아티스트 upsert 결과:
  - 성공: ${upserted}건
  - 실패: ${failed}건
`);
