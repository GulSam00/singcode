import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { getSongsBadgeNullDB } from '@/supabase/getDB';
import { updateSongBadgesDB } from '@/supabase/updateDB';
import { buildBadgeSearchUrl, parseBadgeRow } from '@/utils/tjBadge';

dotenv.config();

// 이상 상황은 전부 이 파일 한 곳에 유형별로 append 한다.
const ERROR_LOG_FILE = path.join('src', 'assets', 'tjBadgeErrors.txt');

// 0이면 제한 없음. 소규모 검증 시 BADGE_MAX_SONGS=200 처럼 지정해 쓴다.
const MAX_SONGS = Number(process.env.BADGE_MAX_SONGS ?? 0);
const CONCURRENCY = Number(process.env.BADGE_CONCURRENCY ?? 5);
const DRY_RUN = process.env.BADGE_DRY_RUN === 'true';

// 한 번에 조회/갱신할 곡 수
const CHUNK_SIZE = 500;
const REQUEST_TIMEOUT = 10000;
const MAX_RETRY = 3;

type ErrorType = 'UNKNOWN_BADGE' | 'NOT_FOUND' | 'NUM_MISMATCH' | 'FETCH_FAILED' | 'TITLE_MISMATCH';

const errorLines: string[] = [];
const errorCounts: Record<ErrorType, number> = {
  UNKNOWN_BADGE: 0,
  NOT_FOUND: 0,
  NUM_MISMATCH: 0,
  FETCH_FAILED: 0,
  TITLE_MISMATCH: 0,
};

function logError(type: ErrorType, numTj: string, detail: string, label: string) {
  errorCounts[type]++;
  errorLines.push(`${new Date().toISOString()}\t${type}\tnum_tj=${numTj}\t${detail}\t${label}`);
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string) {
  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      if (attempt === MAX_RETRY) throw error;
      // 일시적 실패를 지수 백오프로 흡수한다 (0.5s → 1s → 2s)
      await sleep(500 * 2 ** (attempt - 1));
    }
  }
  throw new Error('unreachable');
}

interface TargetSong {
  id: string;
  title: string;
  artist: string;
  num_tj: string | null;
}

/** 곡 하나의 뱃지를 조회한다. 실패·이상은 로그에 남기고 null을 반환한다. */
async function collectBadges(song: TargetSong) {
  const numTj = song.num_tj!;
  const label = `${song.title} - ${song.artist}`;

  let html: string;
  try {
    html = await fetchWithRetry(buildBadgeSearchUrl(numTj));
  } catch (error) {
    logError('FETCH_FAILED', numTj, `error=${(error as Error).message}`, label);
    return null;
  }

  const result = parseBadgeRow(html, numTj);

  if (result.status === 'not_found') {
    logError('NOT_FOUND', numTj, '', label);
    return null;
  }

  if (result.status === 'num_mismatch') {
    logError('NUM_MISMATCH', numTj, `found=${result.foundNumTj}`, label);
    return null;
  }

  for (const unknown of result.unknownBadges) {
    logError('UNKNOWN_BADGE', numTj, `class="${unknown}"`, label);
  }

  // 번호는 맞는데 곡 정보가 다르면 DB 쪽 제목/아티스트가 낡았다는 신호다.
  if (result.row.title !== song.title || result.row.artist !== song.artist) {
    logError('TITLE_MISMATCH', numTj, `tj="${result.row.title} - ${result.row.artist}"`, label);
  }

  return { id: song.id, badges: result.row.badges };
}

// 조회에 실패한 곡 수. 커서로 이미 건너뛰므로 재시도되지는 않고 집계용으로만 쓴다.
let failedCount = 0;

/** 워커 풀로 동시 실행한다. */
async function collectAll(songs: TargetSong[]) {
  const results: { id: string; badges: string[] }[] = [];
  let cursor = 0;

  const worker = async () => {
    while (cursor < songs.length) {
      const song = songs[cursor++];
      const collected = await collectBadges(song);

      if (collected) results.push(collected);
      else failedCount++;
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return results;
}

// ── 실행 ────────────────────────────────────────────────
console.log(
  `🎬 TJ 뱃지 수집 시작 (동시 ${CONCURRENCY}, 청크 ${CHUNK_SIZE}` +
    `${MAX_SONGS ? `, 최대 ${MAX_SONGS}곡` : ''}${DRY_RUN ? ', DRY RUN' : ''})`,
);

const startedAt = Date.now();
let processed = 0;
let updated = 0;
// 이미 시도한 num_tj 구간을 건너뛰기 위한 커서 (undefined면 처음부터)
let numTjCursor: string | undefined;

while (true) {
  const remaining = MAX_SONGS ? MAX_SONGS - processed : CHUNK_SIZE;
  if (remaining <= 0) break;

  const requested = Math.min(CHUNK_SIZE, remaining);
  const songs = (await getSongsBadgeNullDB(requested, numTjCursor)) as TargetSong[];
  if (songs.length === 0) break;

  // 커서를 이번 청크 끝으로 옮긴다. 실패해 badges가 null로 남은 곡도 다시 잡히지 않는다.
  numTjCursor = songs[songs.length - 1].num_tj ?? numTjCursor;

  const results = await collectAll(songs);
  processed += songs.length;

  if (DRY_RUN) {
    console.log(`🧪 [DRY RUN] ${songs.length}곡 조회, 저장 대상 ${results.length}건`);
    console.table(
      results.slice(0, 10).map(r => ({
        id: r.id.slice(0, 8),
        badges: JSON.stringify(r.badges),
      })),
    );
    break;
  }

  if (results.length > 0) {
    const { updated: count, failed } = await updateSongBadgesDB(results);
    updated += count;
    if (failed > 0) console.error(`❌ 저장 실패 ${failed}건`);
  }

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(0);
  console.log(`📦 진행 ${processed}곡 / 저장 ${updated}건 / 실패 ${failedCount}건 (${elapsed}s)`);

  // 저장된 곡은 badges가 채워져 다음 조회에서 자연히 빠진다.
  // 조회 결과가 요청량보다 적으면 남은 곡이 없다는 뜻이다.
  if (songs.length < requested) break;
}

if (errorLines.length > 0) {
  fs.appendFileSync(ERROR_LOG_FILE, errorLines.join('\n') + '\n', 'utf-8');
  console.log(`📝 이상 항목 ${errorLines.length}건 기록: ${ERROR_LOG_FILE}`);
}

console.log(`\n✅ 완료: ${processed}곡 처리, ${updated}건 저장`);
console.table(errorCounts);
