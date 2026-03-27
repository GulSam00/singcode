import * as cheerio from 'cheerio';
import puppeteer, { Browser, Page } from 'puppeteer';

import { getInvalidKYSongsDB, getSongsKyNullDB } from '@/supabase/getDB';
import { postInvalidKYSongsDB } from '@/supabase/postDB';
import { updateSongsKyDB } from '@/supabase/updateDB';
import { Song } from '@/types';

import { isValidKYExistNumber } from '../crawling/isValidKYExistNumber';

// --- Constants ---
const BASE_YOUTUBE_SEARCH_URL = 'https://www.youtube.com/@KARAOKEKY/search';
// --- Helper Functions ---

/**
 * 텍스트에서 KY 노래방 번호를 추출합니다.
 */
const extractKaraokeNumber = (title: string): string | null => {
  const matchResult = title.match(/KY\.\s*(\d{2,5})\)/);
  return matchResult ? matchResult[1] : null;
};

/**
 * 유튜브 검색 결과 페이지에서 노래 번호를 스크래핑합니다.
 */
const scrapeSongNumber = async (page: Page, query: string): Promise<string | null> => {
  const searchUrl = `${BASE_YOUTUBE_SEARCH_URL}?query=${encodeURIComponent(query)}`;

  try {
    // waitUntil을 통해 네트워크가 안정될 때까지 대기
    // 30초 타임아웃 설정 (무한 대기 방지)
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      // timeout: 0,
    });

    const html = await page.content();
    const $ = cheerio.load(html);

    const firstItem = $('ytd-video-renderer').first();

    // 검색 결과가 없는 경우 처리
    if (firstItem.length === 0) {
      return null;
    }

    const title = firstItem.find('yt-formatted-string').first().text().trim();
    return extractKaraokeNumber(title);
  } catch (error) {
    console.warn(`[Scraping Failed] Query: ${query}`, error);
    return null;
  }
};

/**
 * 성공한 데이터를 DB에 업데이트하고 로그를 남깁니다.
 */
const handleSuccess = async (song: Song, kyNum: string) => {
  const result = await updateSongsKyDB({ ...song, num_ky: kyNum });
  // console.log(`[Update Success] ${song.title}: ${kyNum}`, result); // 로그 너무 많으면 주석 처리
  // updateDataLog(result.success, 'crawlYoutubeSuccess.txt');
};

/**
 * 실패한 데이터를 Invalid DB에 저장하고 로그를 남깁니다.
 */
const handleFailure = async (song: Song) => {
  await postInvalidKYSongsDB(song);
  // updateDataLog(false, 'crawlYoutubeFailed.txt'); // false 로그 처리 방식에 따라 수정 필요
};

// --- Main Logic ---

const main = async () => {
  console.log('🚀 크롤링 작업을 시작합니다...');

  // 1. 브라우저 초기화
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // 리눅스 환경 호환성
  });

  try {
    const page = await browser.newPage();

    // 2. 데이터 가져오기
    // Promise.all로 병렬 요청하여 대기 시간 단축
    const [targetSongs, failedSongs] = await Promise.all([
      getSongsKyNullDB(),
      getInvalidKYSongsDB(),
    ]);

    console.log(`📊 ky가 null인 대상 곡: ${targetSongs.length}개`);
    console.log(`🚫 이미 실패한 곡(유효하지 않은 KY 노래방 번호): ${failedSongs.length}개`);
    console.log(`🎯 추가 가능한 최대 곡 개수: ${targetSongs.length - failedSongs.length}개`);

    // 3. 최적화: 실패한 곡 ID를 Set으로 변환 (검색 속도 O(1)로 향상)
    const failedSongIds = new Set(failedSongs.map(s => s.id));

    let processedCount = 0;
    let successCount = 0;

    // 4. 순차 처리 루프
    for (const song of targetSongs) {
      processedCount++;
      const query = `${song.title}-${song.artist}`;

      // 4-1. 이미 실패했던 곡은 스킵
      if (failedSongIds.has(song.id)) {
        continue;
      }

      console.log(`[${processedCount}/${targetSongs.length}] 검색 중: ${query}`);

      // 4-2. 스크래핑 시도
      const resultKyNum = await scrapeSongNumber(page, query);

      if (!resultKyNum) {
        // 검색 결과 없음 -> 실패 처리
        console.log(`❌ 검색 결과 없음: ${query}`);
        await handleFailure(song);
        continue;
      }

      // 4-3. 번호 유효성 검증 (실제 존재하는 번호인지 2차 확인)
      let isValid = false;
      try {
        isValid = await isValidKYExistNumber(page, resultKyNum, song.title, song.artist);
      } catch (error) {
        console.error(`❌ 검증 중 에러 발생: ${query}`, error);
        // 검증 에러 시 일단 실패 처리하거나 continue
        continue;
      }

      if (isValid) {
        // 성공 처리
        await handleSuccess(song, resultKyNum);
        successCount++;
        console.log(`✅ 업데이트 완료: ${resultKyNum}`);
      } else {
        // 유효하지 않은 번호 -> 실패 처리
        await handleFailure(song);
        console.log(`⚠️ 유효하지 않은 번호: ${resultKyNum}`);
      }
    }

    console.log('------------------------------------------------');
    console.log(`🎉 모든 작업 완료! 총 성공: ${successCount}건`);
  } catch (error) {
    console.error('🔥 치명적인 에러 발생:', error);
  } finally {
    // 5. 종료 처리: 에러가 나든 안 나든 브라우저는 반드시 닫음
    await browser.close();
    console.log('🔒 브라우저 종료됨');
  }
};

// 스크립트 실행
main();
