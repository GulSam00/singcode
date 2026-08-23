import axios from 'axios';

import { normalizeArtistName } from './normalizeArtistName';

/**
 * MusicBrainz를 "이름 사전"으로만 쓴다. 사진은 여기서 가져오지 않는다.
 *
 * 우리 DB의 아티스트 이름은 TJ 표기(한글·원어)인데, 음원 서비스들은 같은 아티스트를
 * 로마자로 등록해 둔다("방탄소년단" ↔ "BTS", "米津玄師" ↔ "Kenshi Yonezu").
 * 이 표기 차이 때문에 이름이 정확히 일치하는 항목을 못 찾아 사진 백필이 통째로 비었다.
 * MusicBrainz는 그 대응표(별칭)를 공개해 두고 있어, 여기서 이름만 받아 오면
 * 사진은 원래 쓰던 곳에서 정확한 이름으로 찾을 수 있다.
 */

const ENDPOINT = 'https://musicbrainz.org/ws/2';
// MusicBrainz는 앱을 식별할 수 있는 User-Agent를 요구한다. 없으면 차단당한다.
const USER_AGENT = 'singcode-crawler/1.0 (https://singcode.kr)';
// 익명 사용자에게 허용되는 건 초당 1회다. 여유를 조금 둔다.
const REQUEST_INTERVAL_MS = 1100;
const MAX_RETRY = 4;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface MbSearchArtist {
  id: string;
  name: string;
  score: number;
  aliases?: { name: string }[];
}

interface MbArtistDetail {
  name: string;
  aliases?: { name: string }[];
}

/**
 * 서버가 붐빌 때 503을 자주 돌려준다. 재시도 간격을 늘려가며 몇 번 더 두드린다.
 * 503이 아닌 에러(잘못된 질의 등)는 재시도해도 결과가 같으니 그대로 던진다.
 */
async function request<T>(path: string, params: Record<string, string | number>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      const { data } = await axios.get<T>(`${ENDPOINT}${path}`, {
        params,
        headers: { 'User-Agent': USER_AGENT },
        timeout: 15000,
      });
      return data;
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status !== 503 || attempt >= MAX_RETRY) throw error;
      await sleep(2000 * attempt);
    }
  }
}

export interface ArtistNameSet {
  /** MusicBrainz가 쓰는 대표 표기. 보통 로마자다. */
  canonicalName: string;
  /** 대표 표기 + 모든 별칭 */
  names: string[];
}

/**
 * 이름으로 MusicBrainz 아티스트를 찾아 그 아티스트의 모든 표기를 돌려준다.
 *
 * 질의에 alias 필드를 함께 넣는 게 핵심이다. artist 필드만 보면 대표 표기가 로마자인
 * 아티스트("방탄소년단" → 대표 표기 BTS)는 아예 검색되지 않는다.
 *
 * 받아들이는 조건은 하나다 — 그 아티스트가 **우리가 넘긴 이름을 표기 중 하나로 그대로 갖고
 * 있을 것**. 점수가 높다는 이유로 받으면 동명이인·유사명이 섞여 들어오고, 그 뒤 단계는
 * 잘못된 이름으로 정확히 일치하는 사진을 찾아 오므로 아무도 오류를 눈치채지 못한다.
 */
export async function getArtistNameSet(name: string): Promise<ArtistNameSet | null> {
  const target = normalizeArtistName(name);

  const search = await request<{ artists?: MbSearchArtist[] }>('/artist', {
    query: `artist:"${name}" OR alias:"${name}"`,
    fmt: 'json',
    limit: 5,
  });

  const hit = (search.artists ?? []).find(
    artist =>
      normalizeArtistName(artist.name) === target ||
      (artist.aliases ?? []).some(alias => normalizeArtistName(alias.name) === target),
  );

  if (!hit) return null;

  await sleep(REQUEST_INTERVAL_MS);

  // 검색 응답의 aliases는 질의에 걸린 것만 담겨 오는 일이 있어, 상세로 한 번 더 받는다.
  const detail = await request<MbArtistDetail>(`/artist/${hit.id}`, {
    inc: 'aliases',
    fmt: 'json',
  });

  const names = [detail.name, ...(detail.aliases ?? []).map(alias => alias.name)];

  return { canonicalName: detail.name, names: [...new Set(names)] };
}

export const MUSICBRAINZ_INTERVAL_MS = REQUEST_INTERVAL_MS;
