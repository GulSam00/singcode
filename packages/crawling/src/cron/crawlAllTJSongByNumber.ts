import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

import { crawlTJSongByNumber } from '@/crawling/crawlTJSongByNumber';
import { getSongsAllWithTjDB } from '@/supabase/getDB';
import { postSongsDB } from '@/supabase/postDB';
import { updateSongTitleArtistDB } from '@/supabase/updateDB';
import { Song } from '@/types';

dotenv.config();

// 순회 범위 (env로 주입, 미설정 시 전체 범위)
const parseRange = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const START_NUMBER = parseRange(process.env.START_NUMBER, 1);
const END_NUMBER = parseRange(process.env.END_NUMBER, 99999);

if (START_NUMBER > END_NUMBER) {
  throw new Error(`잘못된 범위: START_NUMBER(${START_NUMBER}) > END_NUMBER(${END_NUMBER})`);
}

console.log(`🔢 순회 범위: ${START_NUMBER} ~ ${END_NUMBER}`);

// 1. 최초로 DB의 모든 곡 데이터를 받아서 num_tj 기준 Map으로 보관
const allSongs = await getSongsAllWithTjDB();
const songMapByTj = new Map<string, Song>();
for (const song of allSongs) {
  if (song.num_tj) {
    songMapByTj.set(song.num_tj, song);
  }
}

console.log(`📦 DB 곡 ${allSongs.length}개 로드 (num_tj 보유: ${songMapByTj.size}개)`);

// action 우분투 환경에서의 호환을 위해 추가
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();

for (let i = START_NUMBER; i <= END_NUMBER; i++) {
  const number = String(i);

  try {
    const result = await crawlTJSongByNumber(page, number);

    if (!result) {
      // 검색 결과 없음 → 스킵
      continue;
    }

    const { title, artist } = result;
    const existing = songMapByTj.get(number);

    if (!existing) {
      // 2. num_tj가 DB에 없으면 곡 추가
      const newSong: Song = { title, artist, num_tj: number, num_ky: null };
      await postSongsDB(newSong);
      songMapByTj.set(number, newSong);
      console.log(`➕ [${number}] 추가: ${title} - ${artist}`);
    } else if (existing.title !== title || existing.artist !== artist) {
      // 3. 존재하지만 제목/가수가 다르면 대체
      if (existing.id) {
        await updateSongTitleArtistDB(existing.id, title, artist);
      }
      console.log(
        `✏️ [${number}] 갱신: ${existing.title} - ${existing.artist} → ${title} - ${artist}`,
      );
      existing.title = title;
      existing.artist = artist;
    }
  } catch (error) {
    console.error(`[${number}] 처리 중 에러:`, error);
  }
}

await browser.close();
