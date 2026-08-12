import { eachMonthOfInterval, endOfMonth, format, parse, startOfMonth } from 'date-fns';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { getSongsAllWithTjDB } from '@/supabase/getDB';
import { postSongsBatchDB, postTjChartRankingsDB } from '@/supabase/postDB';
import { STR_TYPE_LABEL, StrType, TjChartRankingInsert } from '@/types';
import {
  buildSongIdByNumTjMap,
  fetchMissingChartSongs,
  fetchTjChart,
  logChartTable,
  matchChartRows,
} from '@/utils/tjChart';

dotenv.config();

const UNMATCHED_LOG_FILE = path.join('src', 'assets', 'tjChartBackfillUnmatched.txt');

// 백필 대상 기간 (직접 지정: YYYY-MM 형식, 양 끝 월 포함)
const BACKFILL_START_MONTH = '2025-01';
const BACKFILL_END_MONTH = '2026-07';

const targetMonths = eachMonthOfInterval({
  start: parse(BACKFILL_START_MONTH, 'yyyy-MM', new Date()),
  end: parse(BACKFILL_END_MONTH, 'yyyy-MM', new Date()),
});

console.log(
  `📅 백필 대상: ${targetMonths.length}개월 (${BACKFILL_START_MONTH} ~ ${BACKFILL_END_MONTH})`,
);

// 1. num_tj 매칭을 위해 전체 곡을 Map으로 로드
const allSongs = await getSongsAllWithTjDB();
const songIdByNumTj = buildSongIdByNumTjMap(allSongs);
console.log(`📦 DB 곡 ${allSongs.length}개 로드 (num_tj 보유: ${songIdByNumTj.size}개)`);

const rows: TjChartRankingInsert[] = [];
const unmatched: string[] = [];

for (const targetMonth of targetMonths) {
  const searchStartDate = format(startOfMonth(targetMonth), 'yyyy-MM-dd');
  const searchEndDate = format(endOfMonth(targetMonth), 'yyyy-MM-dd');
  const chartMonth = format(startOfMonth(targetMonth), 'yyyy-MM-dd');

  for (const strType of Object.values(StrType)) {
    console.log(`📊 [${chartMonth} / ${STR_TYPE_LABEL[strType]}] 차트 조회 중...`);
    const items = await fetchTjChart(strType, searchStartDate, searchEndDate);

    logChartTable(chartMonth, strType, items, songIdByNumTj, 10);

    const matched = matchChartRows(items, chartMonth, strType, songIdByNumTj);
    const monthRows = matched.rows;

    // songs에 없는 곡은 TJ에서 받아 추가한 뒤 다시 매칭한다.
    if (matched.missingItems.length > 0) {
      const { songs: newSongs, warnings } = await fetchMissingChartSongs(matched.missingItems);

      if (newSongs.length > 0) {
        const { success, failed } = await postSongsBatchDB(newSongs);
        for (const song of success) {
          if (song.id && song.num_tj) songIdByNumTj.set(song.num_tj, song.id);
        }
        console.log(
          `➕ [${chartMonth} / ${STR_TYPE_LABEL[strType]}] 곡 ${success.length}건 추가` +
            `${failed.length ? `, 실패 ${failed.length}건` : ''}`,
        );
      }

      const retry = matchChartRows(matched.missingItems, chartMonth, strType, songIdByNumTj);
      monthRows.push(...retry.rows);
      unmatched.push(...retry.unmatched);
      for (const warning of warnings) unmatched.push(`${chartMonth}\tWARN\t${warning}`);
    }

    rows.push(...monthRows);

    if (monthRows.length > 0) {
      const success = await postTjChartRankingsDB(monthRows);
      console.log(
        success
          ? `💾 [${chartMonth} / ${STR_TYPE_LABEL[strType]}] Supabase 저장 완료 (${monthRows.length}건)`
          : `❌ [${chartMonth} / ${STR_TYPE_LABEL[strType]}] Supabase 저장 실패`,
      );
    }
  }
}

console.log(`✅ 매칭 완료: ${rows.length}건, ⚠️ 미매칭: ${unmatched.length}건`);

if (unmatched.length > 0) {
  fs.appendFileSync(UNMATCHED_LOG_FILE, unmatched.join('\n') + '\n', 'utf-8');
  console.log(`📝 미매칭 목록 기록: ${UNMATCHED_LOG_FILE}`);
}
