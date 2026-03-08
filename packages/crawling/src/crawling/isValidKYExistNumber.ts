import * as cheerio from 'cheerio';
import { Page } from 'puppeteer';

import { validateSongMatch } from '../utils/validateSongMatch';

export const isValidKYExistNumber = async (
  page: Page,
  number: string,
  title: string,
  artist: string,
): Promise<boolean> => {
  const kyUrl = 'https://kysing.kr/search/?category=1&keyword=';
  const searchUrl = kyUrl + number;

  await page.goto(searchUrl, {
    waitUntil: 'networkidle2',
    timeout: 0,
  });

  const html = await page.content();
  const $ = cheerio.load(html);

  const titleResult = $('.search_chart_tit').find('.tit').eq(0).text().trim();
  const artistResult = $('.search_chart_tit').find('.tit').eq(1).text().trim();

  if (!titleResult || !artistResult) {
    console.log('❌ KY 검색 결과 없음');
    return false;
  }

  console.log(`(TJ 기준) 검색 쿼리 : ${title} - ${artist}`);
  console.log(`(KY 노래방) 검색 결과 : ${titleResult} - ${artistResult}`);

  const isValid = await validateSongMatch(title, artist, titleResult, artistResult);

  console.log(`AI 검증 결과 : ${isValid ? '✅ 일치' : '❌ 불일치'}`);

  return isValid;
};
