import * as cheerio from 'cheerio';
import { format } from 'date-fns';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

import { parseNumber } from '@/utils/parseNumber';
import { parseText } from '@/utils/parseString';

import { updateDataLog } from './logData';
import { postSongsDB } from './supabase/postDB';
import { LogData, Song } from './types';

dotenv.config();

// const browser = await puppeteer.launch();

// action 우분투 환경에서의 호환을 위해 추가
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();

const url = 'https://www.tjmedia.com/song/recent_song';

await page.goto(url, {
  waitUntil: 'networkidle2',
  timeout: 0,
});

const songs: Song[] = [];

const html = await page.content();

const $ = cheerio.load(html);

const today = new Date();
const releaseDate = format(today, 'yyyy-MM-dd');

const area = $('.chart-list-area');
area.find('li.search-data-list').each((index, element) => {
  const num = parseNumber($(element).find('.list-num').text().trim());
  // title element의 두번째 p 찾기
  const title = parseText($(element).find('.title3').find('p').eq(1).text().trim());
  const artist = parseText($(element).find('.title4').text().trim());

  songs.push({
    title,
    artist,
    num_tj: num,
    num_ky: null,
    release: releaseDate,
  });
});

const result: LogData<Song> = await postSongsDB(songs);

console.log('성공 개수 : ', result.success.length);
console.log('실패 개수 : ', result.failed.length);

console.log('성공 데이터 : ', result.success);
console.log('실패 데이터 : ', result.failed);

updateDataLog(result.success, 'postByRecentTJSuccess.txt');
updateDataLog(result.failed, 'postByRecentTJFailed.txt');

await browser.close();
