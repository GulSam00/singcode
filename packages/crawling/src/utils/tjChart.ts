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

export async function fetchTjChart(
  strType: StrType,
  searchStartDate: string,
  searchEndDate: string,
) {
  const { data } = await axios.get<TjChartApiResponse>(
    'https://www.tjmedia.com/legacy/api/topAndHot100',
    {
      params: {
        chartType: 'TOP',
        searchStartDate,
        searchEndDate,
        strType: STR_TYPE_API_PARAM[strType],
      },
    },
  );

  if (data.resultCode !== '99') {
    throw new Error(`TJ 차트 API 실패 (strType=${strType}): ${data.resultMsg}`);
  }

  return data.resultData.items;
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

  for (const item of items) {
    const numTj = String(item.pro);
    const songId = songIdByNumTj.get(numTj);

    if (!songId) {
      unmatched.push(
        `${chartMonth}\t${STR_TYPE_LABEL[strType]}(${strType})\trank=${item.rank}\tnum_tj=${numTj}\t${item.indexTitle} - ${item.indexSong}`,
      );
      continue;
    }

    rows.push({
      chart_month: chartMonth,
      type: strType,
      rank: Number(item.rank),
      song_id: songId,
    });
  }

  return { rows, unmatched };
}
