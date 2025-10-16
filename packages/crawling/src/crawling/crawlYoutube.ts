import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

import { getSongsKyNullDB } from '@/supabase/getDB';
import { updateSongsKyDB } from '@/supabase/updateDB';
import { Song } from '@/types';
import {
  loadCrawlYoutubeFailedKYSongs,
  saveCrawlYoutubeFailedKYSongs,
  updateDataLog,
} from '@/utils/logData';

import { isValidKYExistNumber } from './isValidKYExistNumber';

// youtube에서 KY 노래방 번호 크롤링
// crawlYoutubeValid에서 진행하는 실제 사이트 검증도 포함

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

const updateData = async (data: Song) => {
  const result = await updateSongsKyDB(data);
  updateDataLog(result.success, 'crawlYoutubeSuccess.txt');
  updateDataLog(result.failed, 'crawlYoutubeFailed.txt');
};

const data = await getSongsKyNullDB();
const failedSongs = loadCrawlYoutubeFailedKYSongs();

console.log('getSongsKyNullDB : ', data.length);
let index = 0;

for (const song of data) {
  const query = song.title + '-' + song.artist;

  if (failedSongs.has(query)) {
    continue;
  }

  console.log(song.title, ' - ', song.artist);

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
      saveCrawlYoutubeFailedKYSongs(song.title, song.artist);
      continue;
    } else {
      await updateData({ ...song, num_ky: resultKyNum });
    }
  } else saveCrawlYoutubeFailedKYSongs(song.title, song.artist);

  index++;
  console.log('scrapeSongNumber : ', index);
}

browser.close();
