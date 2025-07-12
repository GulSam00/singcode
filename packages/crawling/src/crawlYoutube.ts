import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

import { getSongsKyNullDB } from '@/supabase/getDB';
import { updateSongsKyDB } from '@/supabase/updateDB';
import { Song } from '@/types';
import { loadFailedSongs, saveFailedSongs, updateDataLog } from '@/utils/logData';

const stackData: Song[] = [];
const totalData: Song[] = [];

// process.on("SIGINT", async () => {
//   console.log("프로세스가 종료됩니다. 지금까지의 데이터를 업데이트 중...");
//   console.log("stackData : ", stackData.length);
//   const result = await updateSongsKyDB(stackData);

//   console.log(result);
//   console.log("프로세스가 종료됩니다. 로그를 기록 중...");

//   await Promise.all([
//     updateDataLog(totalData, "crawlYodutubeSuccess.txt"),
//     updateDataLog(failedCase, "crawlYoutubeFailed.txt"),
//   ]);

//   console.log("로그 기록 완료.");
// });

const browser = await puppeteer.launch();
const page = await browser.newPage();

const baseUrl = 'https://www.youtube.com/@KARAOKEKY/search';

const scrapeSongNumber = async (query: string) => {
  const searchUrl = `${baseUrl}?query=${encodeURIComponent(query)}`;

  // page.goto의 waitUntil 문제였음!
  await page.goto(searchUrl, {
    waitUntil: 'networkidle2',
    timeout: 0,
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

const refreshData = async () => {
  console.log('refreshData');
  const result = await updateSongsKyDB(stackData);

  for (const failedItem of result.failed) {
    const { title, artist } = failedItem.song;
    saveFailedSongs(title, artist);
  }

  updateDataLog(result.success, 'crawlYoutubeSuccess.txt');
  updateDataLog(result.failed, 'crawlYoutubeFailed.txt');

  stackData.length = 0; // stackData 초기화
};
// 사용

const data = await getSongsKyNullDB();
const failedSongs = loadFailedSongs();

console.log('getSongsKyNullDB : ', data.length);
let index = 0;

for (const song of data) {
  if (stackData.length >= 10) {
    refreshData();
  }
  const query = song.title + '-' + song.artist;

  if (failedSongs.has(query)) {
    // console.log("already failed : ", song.title, " - ", song.artist);
    // index++;
    continue;
  }

  console.log(song.title, ' - ', song.artist);

  const result = await scrapeSongNumber(query);
  // ky 홈페이지 검증 프로세스 필요

  if (result) {
    console.log('success : ', result);
    stackData.push({ ...song, num_ky: result });
    totalData.push({ ...song, num_ky: result });
  } else saveFailedSongs(song.title, song.artist);

  index++;
  console.log('scrapeSongNumber : ', index);
  console.log('stackData : ', stackData.length);
}

console.log('totalData : ', totalData.length);
// const result = await updateSongsKyDB(totalData);
const result = await updateSongsKyDB(stackData);

updateDataLog(result.success, 'crawlYoutubeSuccess.txt');
updateDataLog(result.failed, 'crawlYoutubeFailed.txt');

// 5.13 1차 시도
// 5000개 중 3507개 성공, 총 18906개 등록

// 5.13 2차 시도
