import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { getSongsAllWithTjDB } from '@/supabase/getDB';
import { postTjChartRankingsDB } from '@/supabase/postDB';
import { STR_TYPE_LABEL, StrType, TjChartRankingInsert } from '@/types';
import {
  buildSongIdByNumTjMap,
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
const unmatched: string[] = [];

for (const strType of Object.values(StrType)) {
  console.log(`📊 [${STR_TYPE_LABEL[strType]}] 차트 조회 중...`);
  const items = await fetchTjChart(strType, searchStartDate, searchEndDate);

  logChartTable(chartMonth, strType, items, songIdByNumTj, 100);

  const { rows: matchedRows, unmatched: unmatchedLines } = matchChartRows(
    items,
    chartMonth,
    strType,
    songIdByNumTj,
  );
  rows.push(...matchedRows);
  unmatched.push(...unmatchedLines);
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
