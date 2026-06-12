import * as cheerio from 'cheerio';
import { Page } from 'puppeteer';

interface TJSongResult {
  title: string;
  artist: string;
}

export const crawlTJSongByNumber = async (
  page: Page,
  number: string,
): Promise<TJSongResult | null> => {
  const tjUrl = `https://www.tjmedia.com/song/accompaniment_search?pageNo=1&pageRowCnt=15&strSotrGubun=ASC&strSortType=&nationType=&strType=16&searchTxt=${number}&strWord=Y`;

  await page.goto(tjUrl, {
    waitUntil: 'networkidle2',
    timeout: 0,
  });

  const html = await page.content();
  const $ = cheerio.load(html);

  const gridContainer = $('.grid-container.list.ico').first();

  const title = gridContainer.find('.grid-item.title3 p').text().trim();
  const artist = gridContainer.find('.grid-item.title4 p').text().trim();

  if (!title || !artist) {
    console.log('❌ TJ 검색 결과 없음');
    return null;
  }

  return { title, artist };
};
