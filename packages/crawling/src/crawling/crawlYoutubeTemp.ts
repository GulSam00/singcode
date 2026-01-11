import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

import { getInvalidKYSongsDB, getSongsKyNullDB } from '@/supabase/getDB';
import { postInvalidKYSongsDB } from '@/supabase/postDB';
import { updateSongsKyDB } from '@/supabase/updateDB';
import { Song } from '@/types';
import { saveCrawlYoutubeFailedKYSongs, updateDataLog } from '@/utils/logData';

import { isValidKYExistNumber } from './isValidKYExistNumber';

// youtube에서 KY 노래방 번호 크롤링
// crawlYoutubeValid에서 진행하는 실제 사이트 검증도 포함

// action 우분투 환경에서의 호환을 위해 추가
const browser = await puppeteer.launch({
  headless: true,
});

const page = await browser.newPage();

const baseUrl = 'https://www.youtube.com/@KARAOKEKY/search';

const scrapeSongNumber = async (query: string) => {
  const searchUrl = `${baseUrl}?query=${encodeURIComponent(query)}`;

  // page.goto의 waitUntil 문제였음!
  await page.goto(searchUrl, {
    waitUntil: 'networkidle2',
    // timeout: 0,
  });

  const html = await page.content();
  const $ = cheerio.load(html);

  // id contents 의 첫번째  ytd-item-section-renderer 찾기
  // const firstItem = $("#contents ytd-item-section-renderer").first();

  const firstItem = $('ytd-video-renderer').first();

  // yt-formatted-string 찾기
  const title = firstItem.find('yt-formatted-string').first().text().trim();

  const karaokeNumber = extractKaraokeNumber(title);

  return karaokeNumber;
};

const extractKaraokeNumber = (title: string) => {
  // KY. 찾고 ) 가 올때까지 찾기
  const matchResult = title.match(/KY\.\s*(\d{2,5})\)/);
  const karaokeNumber = matchResult ? matchResult[1] : null;
  return karaokeNumber;
};

const updateData = async (data: Song) => {
  const result = await updateSongsKyDB(data);
  console.log(result);
  updateDataLog(result.success, 'crawlYoutubeSuccess.txt');
  updateDataLog(result.failed, 'crawlYoutubeFailed.txt');
};

// failedSongs을 가져와서 실패한 노래를 건너뛰는 게 아니라 실패 시 update_date를 수정해 작업 순위를 뒤로 미룬다면?
const data = await getSongsKyNullDB();
const failedSongs = await getInvalidKYSongsDB();

console.log('getSongsKyNullDB : ', data.length);
console.log('failedSongs : ', failedSongs.length);
let index = 0;
let successCount = 0;

for (const song of data) {
  if (failedSongs.find(failedSong => failedSong.id === song.id)) {
    continue;
  }
  const query = song.title + '-' + song.artist;

  let resultKyNum = null;
  try {
    resultKyNum = await scrapeSongNumber(query);
  } catch (error) {
    continue;
  }

  if (resultKyNum) {
    let isValid = true;
    try {
      isValid = await isValidKYExistNumber(page, resultKyNum, song.title, song.artist);
    } catch (error) {
      continue;
    }

    if (!isValid) {
      await postInvalidKYSongsDB(song);
      continue;
    } else {
      await updateData({ ...song, num_ky: resultKyNum });
      console.log('update song : ', resultKyNum);
      successCount++;
    }
  } else await postInvalidKYSongsDB(song);

  index++;
  console.log(query);
  console.log('scrapeSongNumber : ', index);
  console.log('successCount : ', successCount);
}

browser.close();
