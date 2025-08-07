import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

import { getSongsKyNullDB } from '@/supabase/getDB';
import { updateSongsKyDB } from '@/supabase/updateDB';
import { Song } from '@/types';
import { loadFailedSongs, saveFailedSongs, updateDataLog } from '@/utils/logData';

const stackData: Song[] = [];
const totalData: Song[] = [];

const browser = await puppeteer.launch();
const page = await browser.newPage();

const baseUrl = 'https://www.youtube.com/@KARAOKEKY/search';

const parseText = (text: string) => {
  return text.toLowerCase().replace(/\s/g, '').replace(/\(/g, '').replace(/\)/g, '');
};

const isValidKYExistNumber = async (number: string, title: string, artist: string) => {
  const kyUrl = 'https://kysing.kr/search/?category=1&keyword=';
  const searchUrl = kyUrl + number;

  await page.goto(searchUrl, {
    waitUntil: 'networkidle2',
    timeout: 0,
  });

  const html = await page.content();
  const $ = cheerio.load(html);

  const parsedTitle = parseText(title);
  const parsedArtist = parseText(artist);

  const titleResult = parseText($('.search_chart_tit').find('.tit').eq(0).text().trim());
  const artistResult = parseText($('.search_chart_tit').find('.tit').eq(1).text().trim());

  // artistResult가 parsedArtist를 포함하는지 검증
  // 표기의 오류가 있을 수 있기에 parsedTitle, parsedArtist를 (0, 2) / (-2)로 slice하여 비교

  if (
    (titleResult.includes(parsedTitle.slice(0, 2)) ||
      titleResult.includes(parsedTitle.slice(-2))) &&
    (artistResult.includes(parsedArtist.slice(0, 2)) ||
      artistResult.includes(parsedArtist.slice(-2)))
  ) {
    return true;
  }

  console.log(number, ' - invalid!!!');
  console.log('title : ');
  console.log('검색 쿼리 : ', parsedTitle, ' | ', '번호 결과 : ', titleResult);
  console.log('artist : ');
  console.log('검색 쿼리 : ', parsedArtist, ' | ', '번호 결과 : ', artistResult);

  return false;
};

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

// const refreshData = async () => {
//   console.log('refreshData');
//   const result = await updateSongsKyDB(stackData);

//   for (const failedItem of result.failed) {
//     const { title, artist } = failedItem.song;
//     saveFailedSongs(title, artist);
//   }

//   updateDataLog(result.success, 'crawlYoutubeSuccess.txt');
//   updateDataLog(result.failed, 'crawlYoutubeFailed.txt');

//   stackData.length = 0; // stackData 초기화
// };

const updateData = async (data: Song) => {
  const result = await updateSongsKyDB(data);
  updateDataLog(result.success, 'crawlYoutubeSuccess.txt');
  updateDataLog(result.failed, 'crawlYoutubeFailed.txt');
};

const data = await getSongsKyNullDB();
const failedSongs = loadFailedSongs();

console.log('getSongsKyNullDB : ', data.length);
let index = 0;

for (const song of data) {
  // if (stackData.length >= 10) {
  //   refreshData();
  // }
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
      isValid = await isValidKYExistNumber(resultKyNum, song.title, song.artist);
    } catch (error) {
      continue;
    }

    if (!isValid) {
      saveFailedSongs(song.title, song.artist);
      continue;
    } else {
      // stackData.push({ ...song, num_ky: resultKyNum });
      // totalData.push({ ...song, num_ky: resultKyNum });
      await updateData({ ...song, num_ky: resultKyNum });
    }
  } else saveFailedSongs(song.title, song.artist);

  index++;
  console.log('scrapeSongNumber : ', index);
}

// console.log('totalData : ', totalData.length);

// 5.13 1차 시도
// 5000개 중 3507개 성공, 총 18906개 등록

// 5.13 2차 시도
