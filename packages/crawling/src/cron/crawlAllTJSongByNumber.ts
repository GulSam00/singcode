import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { getSongsAllWithTjDB } from '@/supabase/getDB';
import { postSongsBatchDB } from '@/supabase/postDB';
import { updateSongBadgesDB, updateSongTitleArtistDB } from '@/supabase/updateDB';
import { Song } from '@/types';
import { buildBadgeSearchUrl, parseBadgeRow } from '@/utils/tjBadge';

dotenv.config();

const PROGRESS_FILE = path.join('src', 'assets', 'tjAllNumberProgress.json');
const LOG_FILE = path.join('src', 'assets', 'tjAllNumberLog.txt');

// 순회 범위 (env로 주입, 미설정 시 전체 범위)
const parseRange = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const START_NUMBER = parseRange(process.env.START_NUMBER, 1);
const END_NUMBER = parseRange(process.env.END_NUMBER, 99999);
const CONCURRENCY = Number(process.env.TJ_CONCURRENCY ?? 5);
const DRY_RUN = process.env.TJ_DRY_RUN === 'true';
const RESET_PROGRESS = process.env.TJ_RESET_PROGRESS === 'true';

// 이 단위로 처리하고 진행 상황을 저장한다.
// 블록 안은 동시 실행이라 완료 순서가 뒤섞이므로, 블록 경계에서만 기록해야 재개 지점이 정확하다.
const BLOCK_SIZE = 500;
const REQUEST_TIMEOUT = 10000;
const MAX_RETRY = 3;

if (START_NUMBER > END_NUMBER) {
  throw new Error(`잘못된 범위: START_NUMBER(${START_NUMBER}) > END_NUMBER(${END_NUMBER})`);
}

type LogType = 'ADDED' | 'BADGE_UPDATED' | 'TITLE_UPDATED' | 'UNKNOWN_BADGE' | 'FETCH_FAILED';

const logLines: string[] = [];
const counts: Record<LogType | 'NOT_FOUND' | 'UNCHANGED', number> = {
  ADDED: 0,
  BADGE_UPDATED: 0,
  TITLE_UPDATED: 0,
  UNKNOWN_BADGE: 0,
  FETCH_FAILED: 0,
  NOT_FOUND: 0,
  UNCHANGED: 0,
};

let loggedTotal = 0;

function log(type: LogType, numTj: string, detail: string) {
  counts[type]++;
  logLines.push(`${new Date().toISOString()}\t${type}\tnum_tj=${numTj}\t${detail}`);
}

// 40분짜리 실행이 중간에 죽어도 그때까지의 변경 이력이 남도록 블록마다 비워낸다.
// 진행 파일보다 먼저 써야, 둘 사이에서 중단되더라도 기록이 유실되지 않는다.
// (그 블록을 재실행해 로그가 겹칠 수는 있으나, append 전용 감사 기록이라 문제되지 않는다)
function flushLog() {
  if (logLines.length === 0) return;

  fs.appendFileSync(LOG_FILE, logLines.join('\n') + '\n', 'utf-8');
  loggedTotal += logLines.length;
  logLines.length = 0;
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
      await sleep(500 * 2 ** (attempt - 1));
    }
  }
  throw new Error('unreachable');
}

// ── 진행 상황 ───────────────────────────────────────────
interface Progress {
  start: number;
  end: number;
  lastDone: number;
}

function loadProgress(): number {
  if (RESET_PROGRESS || !fs.existsSync(PROGRESS_FILE)) return START_NUMBER;

  try {
    const saved = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8')) as Progress;
    // 다른 범위로 돌렸던 기록이면 이어받지 않는다 (Actions matrix로 구간을 쪼개 돌리는 경우)
    if (saved.start !== START_NUMBER || saved.end !== END_NUMBER) return START_NUMBER;
    if (saved.lastDone >= END_NUMBER) return END_NUMBER + 1;

    console.log(`⏩ 이어서 진행: ${saved.lastDone + 1}번부터`);
    return saved.lastDone + 1;
  } catch {
    return START_NUMBER;
  }
}

function saveProgress(lastDone: number) {
  const progress: Progress = { start: START_NUMBER, end: END_NUMBER, lastDone };
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress), 'utf-8');
}

// ── 번호 하나 조회 ──────────────────────────────────────
interface Fetched {
  numTj: string;
  title: string;
  artist: string;
  badges: string[];
}

async function fetchNumber(numTj: string): Promise<Fetched | null> {
  let html: string;
  try {
    html = await fetchWithRetry(buildBadgeSearchUrl(numTj));
  } catch (error) {
    log('FETCH_FAILED', numTj, `error=${(error as Error).message}`);
    return null;
  }

  const result = parseBadgeRow(html, numTj);

  // not_found와 num_mismatch는 모두 "그 번호에 곡이 없음"으로 취급한다.
  if (result.status !== 'ok') {
    counts.NOT_FOUND++;
    return null;
  }

  for (const unknown of result.unknownBadges) {
    log('UNKNOWN_BADGE', numTj, `class="${unknown}"`);
  }

  // parseBadgeRow가 검증한 numTj를 그대로 쓴다 (요청 번호와 동일함이 보장됨)
  return result.row;
}

async function fetchBlock(numbers: string[]) {
  const fetched: Fetched[] = [];
  let cursor = 0;

  const worker = async () => {
    while (cursor < numbers.length) {
      const result = await fetchNumber(numbers[cursor++]);
      if (result) fetched.push(result);
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return fetched;
}

// ── 실행 ────────────────────────────────────────────────
console.log(
  `🔢 순회 범위: ${START_NUMBER} ~ ${END_NUMBER} ` +
    `(동시 ${CONCURRENCY}, 블록 ${BLOCK_SIZE}${DRY_RUN ? ', DRY RUN' : ''})`,
);

const allSongs = await getSongsAllWithTjDB();
const songByNumTj = new Map<string, Song>();
for (const song of allSongs) {
  if (song.num_tj) songByNumTj.set(song.num_tj, song as Song);
}
console.log(`📦 DB 곡 ${allSongs.length}개 로드 (num_tj 보유: ${songByNumTj.size}개)`);

const startedAt = Date.now();
const resumeFrom = loadProgress();

for (let blockStart = resumeFrom; blockStart <= END_NUMBER; blockStart += BLOCK_SIZE) {
  const blockEnd = Math.min(blockStart + BLOCK_SIZE - 1, END_NUMBER);

  const numbers = Array.from({ length: blockEnd - blockStart + 1 }, (_, i) =>
    String(blockStart + i),
  );
  const fetched = await fetchBlock(numbers);

  const newSongs: Song[] = [];
  const badgeUpdates: { id: string; badges: string[] }[] = [];
  const titleUpdates: { id: string; title: string; artist: string; before: string }[] = [];

  for (const item of fetched) {
    const existing = songByNumTj.get(item.numTj);

    if (!existing) {
      newSongs.push({
        title: item.title,
        artist: item.artist,
        num_tj: item.numTj,
        num_ky: null,
        badges: item.badges,
      });
      continue;
    }

    // 뱃지가 이미 같으면 굳이 쓰지 않는다 (재실행 시 불필요한 갱신 방지)
    if (JSON.stringify(existing.badges ?? null) !== JSON.stringify(item.badges)) {
      if (existing.id) badgeUpdates.push({ id: existing.id, badges: item.badges });
    }

    // TJ가 원본이므로 제목/아티스트가 다르면 TJ 값으로 맞춘다.
    if (existing.title !== item.title || existing.artist !== item.artist) {
      if (existing.id) {
        titleUpdates.push({
          id: existing.id,
          title: item.title,
          artist: item.artist,
          before: `${existing.title} - ${existing.artist}`,
        });
      }
    }
  }

  if (DRY_RUN) {
    console.log(
      `🧪 [DRY RUN] ${blockStart}~${blockEnd}: 조회 ${fetched.length}건 → ` +
        `신규 ${newSongs.length} / 뱃지 ${badgeUpdates.length} / 제목 ${titleUpdates.length}`,
    );
    console.table(
      newSongs.slice(0, 8).map(s => ({
        num_tj: s.num_tj,
        badges: JSON.stringify(s.badges),
        곡: `${s.title} - ${s.artist}`,
      })),
    );
    break;
  }

  if (newSongs.length > 0) {
    const { success, failed } = await postSongsBatchDB(newSongs);
    for (const song of success) {
      log('ADDED', song.num_tj!, `${song.title} - ${song.artist} ${JSON.stringify(song.badges)}`);
      songByNumTj.set(song.num_tj!, song);
    }
    if (failed.length > 0) console.error(`❌ 신규 곡 insert 실패 ${failed.length}건`);
  }

  if (badgeUpdates.length > 0) {
    const { updated, failed } = await updateSongBadgesDB(badgeUpdates);
    counts.BADGE_UPDATED += updated;
    if (failed > 0) console.error(`❌ 뱃지 갱신 실패 ${failed}건`);
  }

  for (const item of titleUpdates) {
    const ok = await updateSongTitleArtistDB(item.id, item.title, item.artist);
    if (ok) log('TITLE_UPDATED', '', `${item.before} → ${item.title} - ${item.artist}`);
  }

  flushLog();
  saveProgress(blockEnd);

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(0);
  const done = blockEnd - resumeFrom + 1;
  const total = END_NUMBER - resumeFrom + 1;
  console.log(
    `📦 ${blockEnd}/${END_NUMBER} (${((done / total) * 100).toFixed(1)}%) ` +
      `신규 ${counts.ADDED} / 뱃지 ${counts.BADGE_UPDATED} / 제목 ${counts.TITLE_UPDATED} ` +
      `/ 빈번호 ${counts.NOT_FOUND} (${elapsed}s)`,
  );
}

flushLog();
if (loggedTotal > 0) {
  console.log(`📝 변경 내역 ${loggedTotal}건 기록: ${LOG_FILE}`);
}

console.log(`\n✅ 완료 (${((Date.now() - startedAt) / 1000 / 60).toFixed(1)}분)`);
console.table(counts);
