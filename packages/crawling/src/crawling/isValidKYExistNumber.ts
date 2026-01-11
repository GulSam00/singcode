import * as cheerio from 'cheerio';
import { Page } from 'puppeteer';

const parseText = (text: string) => {
  // 모두 소문자로
  // 공백은 제거
  // 괄호 제거

  return text.toLowerCase().replace(/\s/g, '').replace(/\(/g, '').replace(/\)/g, '');
};

export const isValidKYExistNumber = async (
  page: Page,
  number: string,
  title: string,
  artist: string,
) => {
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

  console.log('검색 쿼리 : ', parsedTitle, ' - ', parsedArtist);
  console.log('KY 노래방 검색 결과 : ', titleResult, ' - ', artistResult);
  return false;
};
