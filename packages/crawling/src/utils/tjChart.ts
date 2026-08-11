import axios from 'axios';

import {
  STR_TYPE_API_PARAM,
  STR_TYPE_LABEL,
  Song,
  StrType,
  TjChartApiResponse,
  TjChartItem,
  TjChartRankingInsert,
} from '@/types';
import { badgesFromChartItem, buildBadgeSearchUrl, parseBadgeRow } from '@/utils/tjBadge';

// 차트 API는 응답이 느리고 편차가 크다 (실측 2.7~11.4초). 10초로는 정상 응답도 잘려나간다.
const CHART_REQUEST_TIMEOUT = 30000;

// 곡 검색 페이지는 100ms 내외라 짧게 잡아도 된다.
const SEARCH_REQUEST_TIMEOUT = 10000;

// 미매칭 곡은 많아야 수십 건이라 낮게 잡아도 충분하다.
const MISSING_FETCH_CONCURRENCY = 5;

// 차트 API는 간헐적으로 타임아웃난다. 재시도가 없으면 19개월 백필이 한 번의 실패로 통째로 죽는다.
const MAX_RETRY = 3;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchTjChart(
  strType: StrType,
  searchStartDate: string,
  searchEndDate: string,
) {
  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      const { data } = await axios.get<TjChartApiResponse>(
        'https://www.tjmedia.com/legacy/api/topAndHot100',
        {
          params: {
            chartType: 'TOP',
            searchStartDate,
            searchEndDate,
            strType: STR_TYPE_API_PARAM[strType],
          },
          timeout: CHART_REQUEST_TIMEOUT,
        },
      );

      if (data.resultCode !== '99') {
        throw new Error(`TJ 차트 API 실패 (strType=${strType}): ${data.resultMsg}`);
      }

      return data.resultData.items;
    } catch (error) {
      if (attempt === MAX_RETRY) throw error;

      console.warn(
        `⚠️ [${searchStartDate} / ${STR_TYPE_LABEL[strType]}] 조회 실패 ` +
          `(${attempt}/${MAX_RETRY}): ${(error as Error).message}`,
      );
      await sleep(1000 * 2 ** (attempt - 1)); // 1s → 2s → 4s
    }
  }

  throw new Error('unreachable');
}

export function buildSongIdByNumTjMap(songs: Song[]) {
  const songIdByNumTj = new Map<string, string>();
  for (const song of songs) {
    if (song.num_tj && song.id) {
      songIdByNumTj.set(song.num_tj, song.id);
    }
  }
  return songIdByNumTj;
}

export function logChartTable(
  chartMonth: string,
  strType: StrType,
  items: TjChartItem[],
  songIdByNumTj: Map<string, string>,
  limit: number,
) {
  const target = [...items]
    .sort((a, b) => Number(a.rank) - Number(b.rank))
    .filter(item => Number(item.rank) <= limit);

  console.log(`🏆 [${chartMonth} / ${STR_TYPE_LABEL[strType]}] TOP ${limit}`);
  console.table(
    target.map(item => ({
      순위: item.rank,
      곡명: item.indexSong,
      아티스트: item.indexTitle,
      num_tj: item.pro,
      매칭: songIdByNumTj.has(String(item.pro)) ? 'O' : 'X',
    })),
  );
}

export function matchChartRows(
  items: TjChartItem[],
  chartMonth: string,
  strType: StrType,
  songIdByNumTj: Map<string, string>,
) {
  const rows: TjChartRankingInsert[] = [];
  const unmatched: string[] = [];
  // songs에 없는 항목. 호출부가 TJ에서 곡 정보를 받아 채운 뒤 다시 매칭할 수 있게 원본을 넘긴다.
  const missingItems: TjChartItem[] = [];

  for (const item of items) {
    const numTj = String(item.pro);
    const songId = songIdByNumTj.get(numTj);

    if (!songId) {
      unmatched.push(
        `${chartMonth}\t${STR_TYPE_LABEL[strType]}(${strType})\trank=${item.rank}\tnum_tj=${numTj}\t${item.indexTitle} - ${item.indexSong}`,
      );
      missingItems.push(item);
      continue;
    }

    rows.push({
      chart_month: chartMonth,
      type: strType,
      rank: Number(item.rank),
      song_id: songId,
    });
  }

  return { rows, unmatched, missingItems };
}

/**
 * 차트에 올랐지만 songs에 없는 번호를 TJ 곡 검색 페이지에서 받아온다.
 *
 * 차트 API도 제목·아티스트를 주지만 표기가 검색 페이지와 다를 때가 있다.
 * 전수 순회(crawlAllTJSongByNumber)가 검색 페이지 표기로 맞춰뒀으므로 여기서도 같은 출처를 쓴다.
 * 뱃지는 차트 API로도 만들 수 있어(badgesFromChartItem) 두 값을 대조하고 불일치만 기록한다.
 */
export async function fetchMissingChartSongs(items: TjChartItem[]) {
  // 같은 번호가 여러 월·장르에 중복 등장하므로 번호 기준으로 한 번만 조회한다.
  const itemByNumTj = new Map<string, TjChartItem>();
  for (const item of items) itemByNumTj.set(String(item.pro), item);

  const targets = [...itemByNumTj.entries()];
  const songs: Song[] = [];
  const warnings: string[] = [];
  let cursor = 0;

  const worker = async () => {
    while (cursor < targets.length) {
      const [numTj, item] = targets[cursor++];
      const label = `${item.indexTitle} - ${item.indexSong}`;

      try {
        const response = await fetch(buildBadgeSearchUrl(numTj), {
          signal: AbortSignal.timeout(SEARCH_REQUEST_TIMEOUT),
        });
        const result = parseBadgeRow(await response.text(), numTj);

        if (result.status !== 'ok') {
          warnings.push(`${numTj}\tTJ 조회 실패(${result.status})\t${label}`);
          continue;
        }

        const fromChart = badgesFromChartItem(item);
        if (JSON.stringify(fromChart) !== JSON.stringify(result.row.badges)) {
          warnings.push(
            `${numTj}\t뱃지 불일치 chart=${JSON.stringify(fromChart)} page=${JSON.stringify(result.row.badges)}\t${label}`,
          );
        }

        songs.push({
          title: result.row.title,
          artist: result.row.artist,
          num_tj: numTj,
          num_ky: null,
          badges: result.row.badges,
        });
      } catch (error) {
        warnings.push(`${numTj}\t조회 오류 ${(error as Error).message}\t${label}`);
      }
    }
  };

  await Promise.all(Array.from({ length: MISSING_FETCH_CONCURRENCY }, worker));

  return { songs, warnings };
}
