import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

import { isNumber } from './utils.js';
dotenv.config();

// ✅ 나무위키에서 데이터 크롤링
export async function scrapeSongs(dst) {
  const url = process.env.NAMU_KARAOKE_URL;
  const endURL = process.env.NAMU_KARAOKE_END_URL;
  const fullURL = url + dst + endURL;
  try {
    const { data } = await axios.get(fullURL);
    // const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);

    let songs = [];

    $('table tbody tr').each((index, element) => {
      const cols = $(element).find('td');
      if (cols.length == 3) {
        const title = $(cols[0]).text().trim();
        const num_tj = $(cols[1]).text().trim().slice(0, 5);
        const num_ky = $(cols[2]).text().trim().slice(0, 5);
        if (isNumber(num_tj) || isNumber(num_ky)) {
          songs.push({ title, artist: '아이묭 (あいみょん)', num_tj, num_ky });
        }
      }
    });

    console.log(songs); // 크롤링한 데이터 확인
    console.log(songs.length); // 크롤링한 데이터 확인

    return songs;
  } catch (error) {
    console.error('크롤링 실패:', error);
    return [];
  }
}
