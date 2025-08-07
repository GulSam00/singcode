import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

import { getSongsKyNotNullDB } from '@/supabase/getDB';
import { updateSongsKyDB } from '@/supabase/updateDB';
import { Song } from '@/types';
import { loadValidSongs, saveValidSongs, updateDataLog } from '@/utils/logData';

const stackData: Song[] = [];
const totalData: Song[] = [];

const browser = await puppeteer.launch();
const page = await browser.newPage();

const baseUrl = 'https://kysing.kr/search/?category=1&keyword=';
// KY에서는 가사도 크롤링 가능??? 가사 넣을 수 있나???
// TJ에서는 지원 안함, KY에서만 가능한 것 같음

const parseText = (text: string) => {
  // 모두 소문자로
  // 공백은 제거
  // 괄호도 제거할까...?

  return text.toLowerCase().replace(/\s/g, '').replace(/\(/g, '').replace(/\)/g, '');
};

const isValidKYExistNumber = async (number: string, title: string, artist: string) => {
  const searchUrl = baseUrl + number;

  // page.goto의 waitUntil 문제였음!
  await page.goto(searchUrl, {
    waitUntil: 'networkidle2',
    timeout: 0,
  });

  const html = await page.content();
  const $ = cheerio.load(html);

  const parsedTitle = parseText(title);
  const parsedArtist = parseText(artist);

  console.log('parsedTitle : ', parsedTitle);
  console.log('parsedArtist : ', parsedArtist);

  // const chartList = $("search_chart_list")[1];
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

  console.log('invalid!!!!!!!!!!');
  console.log('title : ', parsedTitle, ' - ', titleResult);
  console.log('artist : ', parsedArtist, ' - ', artistResult);

  return false;
};

// const refreshData = async () => {
//   console.log('refreshData');
//   const result = await updateSongsKyDB(stackData);

//   for (const failedItem of result.failed) {
//     const { title, artist } = failedItem.song;
//     saveValidSongs(title, artist);
//   }

//   updateDataLog(result.success, 'updateNullInvaildSongSuccess.txt');
//   updateDataLog(result.failed, 'updateNullInvaildSongFailed.txt');

//   stackData.length = 0; // stackData 초기화
// };

const updateData = async (data: Song) => {
  const result = await updateSongsKyDB(data);
  updateDataLog(result.success, 'crawlYoutubeSuccess.txt');
  updateDataLog(result.failed, 'crawlYoutubeFailed.txt');
};

const data = await getSongsKyNotNullDB();
const vaildSongs = loadValidSongs();

console.log('getSongsKyNotNullDB : ', data.length);
let index = 0;

for (const song of data) {
  // if (stackData.length >= 10) {
  //   refreshData();
  // }

  const query = song.title + '-' + song.artist;

  if (vaildSongs.has(query)) {
    continue;
  }

  console.log(song.title, ' - ', song.artist + ' : ', song.num_ky);
  let isValid = true;
  try {
    isValid = await isValidKYExistNumber(song.num_ky, song.title, song.artist);
  } catch (error) {
    index++;
    continue;
  }

  if (!isValid) {
    // stackData.push({ ...song, num_ky: null });
    // totalData.push({ ...song, num_ky: null });
    await updateData({ ...song, num_ky: null });
  } else saveValidSongs(song.title, song.artist);

  index++;
  console.log('crawlYoutubeValid : ', index);
}
