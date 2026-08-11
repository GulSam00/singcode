import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { getSongsAllWithTjDB } from '@/supabase/getDB';
import { postSongsBatchDB, postTjChartRankingsDB } from '@/supabase/postDB';
import { STR_TYPE_LABEL, StrType, TjChartItem, TjChartRankingInsert } from '@/types';
import {
  buildSongIdByNumTjMap,
  fetchMissingChartSongs,
  fetchTjChart,
  logChartTable,
  matchChartRows,
} from '@/utils/tjChart';

dotenv.config();

const UNMATCHED_LOG_FILE = path.join('src', 'assets', 'tjChartUnmatched.txt');

const targetMonth = subMonths(new Date(), 1);
const searchStartDate = format(startOfMonth(targetMonth), 'yyyy-MM-dd');
const searchEndDate = format(endOfMonth(targetMonth), 'yyyy-MM-dd');
const chartMonth = format(startOfMonth(targetMonth), 'yyyy-MM-dd');

console.log(`📅 대상 월: ${chartMonth} (${searchStartDate} ~ ${searchEndDate})`);

// 1. num_tj 매칭을 위해 전체 곡을 Map으로 로드
const allSongs = await getSongsAllWithTjDB();
const songIdByNumTj = buildSongIdByNumTjMap(allSongs);
console.log(`📦 DB 곡 ${allSongs.length}개 로드 (num_tj 보유: ${songIdByNumTj.size}개)`);

const rows: TjChartRankingInsert[] = [];
// 매칭 실패분은 곡을 보충한 뒤 다시 매칭해야 하므로 장르별 원본을 들고 있는다.
const pending: { strType: StrType; items: TjChartItem[] }[] = [];

for (const strType of Object.values(StrType)) {
  console.log(`📊 [${STR_TYPE_LABEL[strType]}] 차트 조회 중...`);
  const items = await fetchTjChart(strType, searchStartDate, searchEndDate);

  logChartTable(chartMonth, strType, items, songIdByNumTj, 100);

  const { rows: matchedRows, missingItems } = matchChartRows(
    items,
    chartMonth,
    strType,
    songIdByNumTj,
  );
  rows.push(...matchedRows);
  if (missingItems.length > 0) pending.push({ strType, items: missingItems });
}

// 2. songs에 없는 곡을 TJ에서 받아 추가하고 다시 매칭한다.
//    이 단계가 없으면 MR·라이브처럼 DB에 없는 버전이 매달 미매칭으로 쌓인다.
const unmatched: string[] = [];

if (pending.length > 0) {
  const missingItems = pending.flatMap(entry => entry.items);
  console.log(`🔎 songs에 없는 곡 ${missingItems.length}건 → TJ에서 곡 정보 조회`);

  const { songs: newSongs, warnings } = await fetchMissingChartSongs(missingItems);

  if (newSongs.length > 0) {
    const { success, failed } = await postSongsBatchDB(newSongs);
    for (const song of success) {
      if (song.id && song.num_tj) songIdByNumTj.set(song.num_tj, song.id);
    }
    console.log(
      `➕ 곡 ${success.length}건 추가${failed.length ? `, 실패 ${failed.length}건` : ''}`,
    );
  }

  for (const { strType, items } of pending) {
    const retry = matchChartRows(items, chartMonth, strType, songIdByNumTj);
    rows.push(...retry.rows);
    unmatched.push(...retry.unmatched);
  }

  for (const warning of warnings) {
    unmatched.push(`${chartMonth}\tWARN\t${warning}`);
  }
}

console.log(`✅ 매칭 완료: ${rows.length}건, ⚠️ 미매칭: ${unmatched.length}건`);

if (rows.length > 0) {
  const success = await postTjChartRankingsDB(rows);
  console.log(success ? '💾 Supabase 저장 완료' : '❌ Supabase 저장 실패');
}

if (unmatched.length > 0) {
  fs.appendFileSync(UNMATCHED_LOG_FILE, unmatched.join('\n') + '\n', 'utf-8');
  console.log(`📝 미매칭 목록 기록: ${UNMATCHED_LOG_FILE}`);
}
